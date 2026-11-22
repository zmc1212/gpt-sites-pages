/* 渲染层:实例化珊瑚 + 出生序渐变着色 + 影棚三点光 + 软阴影 +
   自定义后处理(场景 RT → 亮度提取 → 高斯泛光 → ACES/曝光/对比合成)。
   原作为 WebGPU 渲染,此处为 three.js r149 WebGL 原创简化实现。 */
(function () {
  'use strict';

  const DC = (window.DC = window.DC || {});

  const FULL_VERT = `
    precision highp float;
    attribute vec3 position;
    varying vec2 vUv;
    void main() {
      vUv = position.xy * 0.5 + 0.5;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }`;

  const BRIGHT_FRAG = `
    precision mediump float;
    uniform sampler2D tex;
    uniform float threshold;
    uniform float knee;
    varying vec2 vUv;
    void main() {
      vec3 c = texture2D(tex, vUv).rgb;
      float l = max(max(c.r, c.g), c.b);
      float w = smoothstep(threshold, threshold + knee, l);
      gl_FragColor = vec4(c * w, 1.0);
    }`;

  const BLUR_VERT = `
    precision highp float;
    attribute vec3 position;
    varying vec2 vUv;
    uniform vec2 texel;
    uniform vec2 dir;
    varying vec2 vStep[5];
    void main() {
      vUv = position.xy * 0.5 + 0.5;
      vStep[0] = vUv;
      vStep[1] = vUv + dir * texel * 1.3846153846;
      vStep[2] = vUv - dir * texel * 1.3846153846;
      vStep[3] = vUv + dir * texel * 3.2307692308;
      vStep[4] = vUv - dir * texel * 3.2307692308;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }`;

  const BLUR_FRAG = `
    precision mediump float;
    uniform sampler2D tex;
    varying vec2 vUv;
    varying vec2 vStep[5];
    void main() {
      vec3 c = texture2D(tex, vStep[0]).rgb * 0.2270270270;
      c += texture2D(tex, vStep[1]).rgb * 0.3162162162;
      c += texture2D(tex, vStep[2]).rgb * 0.3162162162;
      c += texture2D(tex, vStep[3]).rgb * 0.0702702703;
      c += texture2D(tex, vStep[4]).rgb * 0.0702702703;
      gl_FragColor = vec4(c, 1.0);
    }`;

  const COMPOSITE_FRAG = `
    precision highp float;
    uniform sampler2D sceneTex;
    uniform sampler2D bloomTex;
    uniform float strength;
    uniform float exposure;
    uniform float contrast;
    uniform float brightness;
    uniform float vignette;
    varying vec2 vUv;
    vec3 aces(vec3 x) {
      return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
    }
    void main() {
      vec3 c = texture2D(sceneTex, vUv).rgb;
      vec3 b = texture2D(bloomTex, vUv).rgb;
      c += b * strength;
      c *= exposure;
      c = aces(c);
      c = (c - 0.5) * contrast + 0.5;
      c += (brightness - 1.0) * 0.5;
      vec2 q = vUv - 0.5;
      float v = 1.0 - vignette * dot(q, q) * 1.4;
      c *= clamp(v, 0.0, 1.0);
      c = pow(max(c, 0.0), vec3(1.0 / 2.2));
      gl_FragColor = vec4(c, 1.0);
    }`;

  const ZERO_M = new THREE.Matrix4().makeScale(0, 0, 0);

  function hexToLinear(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = ((n >> 16) & 255) / 255;
    const g = ((n >> 8) & 255) / 255;
    const b = (n & 255) / 255;
    return [Math.pow(r, 2.2), Math.pow(g, 2.2), Math.pow(b, 2.2)];
  }

  class Renderer {
    constructor(canvas) {
      this.canvas = canvas;
      const renderer = this.renderer = new THREE.WebGLRenderer({
        canvas, antialias: false, alpha: false, powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = THREE.LinearEncoding;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.scene = new THREE.Scene();
      this.bgColor = '#0e0f13';
      // 合成器末端做 gamma 编码,场景内一切颜色必须先转线性,否则会被提亮约 3 倍
      this.scene.background = new THREE.Color(this.bgColor).convertSRGBToLinear();
      this.scene.fog = new THREE.FogExp2(new THREE.Color(this.bgColor).convertSRGBToLinear(), 0.02);

      this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 4000);

      this._buildLights();
      this._buildGround();
      this._buildPost();
      this.coral = null;
      this.spacing = 1.0;
      this.radiusWorld = 6;
      this.dirtyMatrix = false;
      this.dirtyColor = false;
    }

    _buildLights() {
      const scene = this.scene;
      this.keyLight = new THREE.DirectionalLight(0xfff0dd, 3.1);
      this.keyLight.position.set(30, 44, 24);
      this.keyLight.castShadow = true;
      this.keyLight.shadow.mapSize.set(2048, 2048);
      this.keyLight.shadow.bias = -0.0006;
      this.keyLight.shadow.radius = 3;
      scene.add(this.keyLight, this.keyLight.target);

      this.rimLight = new THREE.DirectionalLight(0xbdd2ff, 1.05);
      this.rimLight.position.set(-34, 26, -38);
      scene.add(this.rimLight);

      this.bounceLight = new THREE.DirectionalLight(0xff9a70, 0.42);
      this.bounceLight.position.set(6, -20, 18);
      scene.add(this.bounceLight);

      this.hemi = new THREE.HemisphereLight(0x8fa2c9, 0x2a1e16, 0.55);
      scene.add(this.hemi);
    }

    _buildGround() {
      // 深色影棚地台 + 只接阴影的柔光层
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(600, 64),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x16181e).convertSRGBToLinear(),
          roughness: 0.9, metalness: 0
        })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.01;
      this.scene.add(ground);

      this.shadowPlane = new THREE.Mesh(
        new THREE.CircleGeometry(300, 48),
        new THREE.ShadowMaterial({ opacity: 0.5 })
      );
      this.shadowPlane.rotation.x = -Math.PI / 2;
      this.shadowPlane.receiveShadow = true;
      this.scene.add(this.shadowPlane);
    }

    _makePass(frag, uniforms, vertex) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
      const mat = new THREE.RawShaderMaterial({
        vertexShader: vertex || FULL_VERT, fragmentShader: frag, uniforms,
        depthTest: false, depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const cam = new THREE.Camera();
      const sc = new THREE.Scene();
      sc.add(mesh);
      return { scene: sc, camera: cam, mat };
    }

    _buildPost() {
      const opts = {
        minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat, depthBuffer: true, stencilBuffer: false,
      };
      const half = {
        minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false,
      };
      try {
        this.sceneRT = new THREE.WebGLRenderTarget(4, 4, Object.assign({ type: THREE.HalfFloatType }, opts));
        this.rtA = new THREE.WebGLRenderTarget(4, 4, Object.assign({ type: THREE.HalfFloatType }, half));
        this.rtB = new THREE.WebGLRenderTarget(4, 4, Object.assign({ type: THREE.HalfFloatType }, half));
        this.halfFloat = true;
      } catch (e) {
        this.sceneRT = new THREE.WebGLRenderTarget(4, 4, Object.assign({ type: THREE.UnsignedByteType }, opts));
        this.rtA = new THREE.WebGLRenderTarget(4, 4, Object.assign({ type: THREE.UnsignedByteType }, half));
        this.rtB = new THREE.WebGLRenderTarget(4, 4, Object.assign({ type: THREE.UnsignedByteType }, half));
        this.halfFloat = false;
      }

      this.brightPass = this._makePass(BRIGHT_FRAG, {
        tex: { value: this.sceneRT.texture }, threshold: { value: 0.55 }, knee: { value: 0.35 },
      });
      this.blurPass = this._makePass(BLUR_FRAG, {
        tex: { value: this.rtA.texture }, texel: { value: new THREE.Vector2() }, dir: { value: new THREE.Vector2(1, 0) },
      }, BLUR_VERT);
      this.composite = this._makePass(COMPOSITE_FRAG, {
        sceneTex: { value: this.sceneRT.texture },
        bloomTex: { value: this.rtB.texture },
        strength: { value: 0.32 }, exposure: { value: 1.05 },
        contrast: { value: 1.12 }, brightness: { value: 1.0 }, vignette: { value: 0.55 },
      });
    }

    resize() {
      const renderer = this.renderer;
      const dpr = renderer.getPixelRatio();
      const w = Math.max(2, Math.floor(window.innerWidth * dpr));
      const h = Math.max(2, Math.floor(window.innerHeight * dpr));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      const ssaa = dpr < 1.5 ? 1.4 : 1.05;
      const rw = Math.min(4096, Math.floor(w * ssaa));
      const rh = Math.min(4096, Math.floor(h * ssaa));
      this.sceneRT.setSize(rw, rh);
      this.rtA.setSize(Math.max(2, rw >> 1), Math.max(2, rh >> 1));
      this.rtB.setSize(Math.max(2, rw >> 1), Math.max(2, rh >> 1));
    }

    /* ---------- 珊瑚网格 ---------- */
    buildCoral(sim) {
      if (this.coral) {
        this.scene.remove(this.coral.mesh);
        this.coral.mesh.geometry.dispose();
        this.coral.mesh.dispose();
      }
      const cap = sim.cap;
      const detail = sim.s.target > 32000 ? 1 : 2;
      const geo = new THREE.IcosahedronGeometry(1, detail);
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.32, metalness: 0.04 });
      const mesh = new THREE.InstancedMesh(geo, mat, cap);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3);
      mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      mesh.count = 0;
      this.scene.add(mesh);
      this.coral = { mesh, sim };
      this.updateSpacing();
      this.refreshColors();
    }

    /* 间隙 → 世界尺度;并同步阴影相机范围 */
    updateSpacing() {
      if (!this.coral) return;
      const s = this.coral.sim.s;
      this.spacing = Math.max(0.15, s.size * (1 + s.gap));
      this.particleR = Math.max(0.12, 0.46 * s.size * (1 + Math.max(0, s.gap)));
      this.dirtyMatrix = true;
    }

    _worldPos(i, out) {
      const sim = this.coral.sim;
      out.set(sim.px[i] * this.spacing, sim.py[i] * this.spacing, sim.pz[i] * this.spacing);
      return out;
    }

    _writeMatrix(i) {
      const m = new THREE.Matrix4();
      const p = new THREE.Vector3();
      this._worldPos(i, p);
      m.makeScale(this.particleR, this.particleR, this.particleR);
      m.setPosition(p);
      this.coral.mesh.setMatrixAt(i, m);
    }

    onAdd(birth) {
      this._writeMatrix(birth);
      this._writeColor(birth);
      this.dirtyMatrix = this.dirtyColor = true;
      const r = Math.sqrt(this.coral.sim.maxR2) * this.spacing;
      if (r > this.radiusWorld) this.radiusWorld = r;
    }

    onEnclose(birth) {
      if (this.coral.sim.s.hideEnclosed) this.coral.mesh.setMatrixAt(birth, ZERO_M);
      this.dirtyMatrix = true;
    }

    refreshMatrices() {
      const sim = this.coral.sim;
      const hide = sim.s.hideEnclosed;
      const m = new THREE.Matrix4();
      const p = new THREE.Vector3();
      for (let i = 0; i < sim.count; i++) {
        if (hide && sim.enclosed[i]) {
          this.coral.mesh.setMatrixAt(i, ZERO_M);
        } else {
          this._worldPos(i, p);
          m.makeScale(this.particleR, this.particleR, this.particleR);
          m.setPosition(p);
          this.coral.mesh.setMatrixAt(i, m);
        }
      }
      this.dirtyMatrix = true;
    }

    /* ---------- 出生序渐变 ---------- */
    /* f(k) = (k+1)/target(固定分母 → 前缀和可增量维护)。
       窗口平均由前缀和差分给出,gradientBlur 控制窗口宽度。 */
    _ensurePrefix(birth) {
      const target = Math.max(1, this.coral.sim.s.target);
      if (!this._prefix || this._prefix.length < this.coral.sim.cap + 1) {
        this._prefix = new Float64Array(this.coral.sim.cap + 1);
        this._prefixCount = 0;
      }
      const P = this._prefix;
      if (this._prefixTarget !== target) { this._prefixCount = 0; this._prefixTarget = target; }
      for (let k = this._prefixCount; k <= birth; k++) {
        P[k + 1] = P[k] + (k + 1) / target;
      }
      this._prefixCount = Math.max(this._prefixCount, birth + 1);
    }

    _gradientT(birth) {
      this._ensurePrefix(birth);
      const sim = this.coral.sim;
      const count = Math.max(1, sim.count);
      const w = Math.max(1, Math.round(this.gradBlur * count * 0.05));
      const lo = Math.max(0, birth - w);
      const hi = Math.min(count - 1, birth + w);
      const P = this._prefix;
      const f = (P[hi + 1] - P[lo]) / Math.max(1, hi - lo + 1);
      let t = (f - 0.5) * this.gradContrast + 0.5 + this.gradBias;
      return Math.max(0, Math.min(1, t));
    }

    invalidatePrefix() {
      this._prefixCount = 0;
      this._prefixTarget = -1;
      if (this._prefix) this._prefix[0] = 0;
    }

    _writeColor(i) {
      const [ir, ig, ib] = this.innerLin;
      const [or_, og, ob] = this.outerLin;
      const t = this._gradientT(i);
      const c = this.coral.mesh.instanceColor;
      c.array[i * 3] = ir + (or_ - ir) * t;
      c.array[i * 3 + 1] = ig + (og - ig) * t;
      c.array[i * 3 + 2] = ib + (ob - ib) * t;
    }

    refreshColors() {
      if (!this.coral) return;
      const s = this.coral.sim.s;
      this.innerLin = hexToLinear(s.innerColor);
      this.outerLin = hexToLinear(s.outerColor);
      this.gradContrast = s.gradientContrast;
      this.gradBias = s.gradientBias;
      this.gradBlur = s.gradientBlur;
      this.invalidatePrefix();
      for (let i = 0; i < this.coral.sim.count; i++) this._writeColor(i);
      this.dirtyColor = true;
    }

    setShownCount(n) {
      if (this.coral) this.coral.mesh.count = Math.max(0, n | 0);
    }

    /* ---------- 影棚 ---------- */
    updateStudio(s) {
      this.keyLight.intensity = 3.1 * s.keyBrightness;
      this.hemi.intensity = 0.55 * s.ambientFill;
      this.rimLight.intensity = 1.05 * s.rimBrightness;
      this.bounceLight.intensity = 0.42 * s.bounceBrightness;
      const az = s.lightAzimuth, el = (s.lightElevation * Math.PI) / 180;
      const d = 60;
      this.keyLight.position.set(d * Math.cos(el) * Math.sin(az), d * Math.sin(el), d * Math.cos(el) * Math.cos(az));
      this.shadowPlane.material.opacity = Math.min(0.85, 0.42 * s.shadowStrength);
    }

    fitLights() {
      const r = Math.max(4, this.radiusWorld * 1.5);
      const cam = this.keyLight.shadow.camera;
      if (cam.left !== -r) {
        cam.left = -r; cam.right = r; cam.top = r; cam.bottom = -r;
        cam.near = 1; cam.far = 240;
        cam.updateProjectionMatrix();
      }
    }

    /* ---------- 后处理参数 ---------- */
    applyPost(s) {
      this.brightPass.mat.uniforms.threshold.value = s.bloomThreshold;
      this.composite.mat.uniforms.strength.value = s.bloomStrength * 2.2;
      this.composite.mat.uniforms.exposure.value = s.exposure * 1.6;
      this.composite.mat.uniforms.contrast.value = s.displayContrast;
      this.composite.mat.uniforms.brightness.value = s.brightness;
    }

    /* ---------- 帧渲染 ---------- */
    renderFrame() {
      const r = this.renderer;
      if (this.dirtyMatrix) { this.coral.mesh.instanceMatrix.needsUpdate = true; this.dirtyMatrix = false; }
      if (this.dirtyColor) { this.coral.mesh.instanceColor.needsUpdate = true; this.dirtyColor = false; }
      this.fitLights();

      r.setRenderTarget(this.sceneRT);
      r.clear();
      r.render(this.scene, this.camera);

      // 亮度提取 → 场景 1/2 RT
      this.brightPass.mat.uniforms.tex.value = this.sceneRT.texture;
      r.setRenderTarget(this.rtA);
      r.render(this.brightPass.scene, this.brightPass.camera);

      // 两次方向高斯 ping-pong
      const bw = this.rtA.width, bh = this.rtA.height;
      const spread = 1.6;
      for (let iter = 0; iter < 2; iter++) {
        this.blurPass.mat.uniforms.tex.value = this.rtA.texture;
        this.blurPass.mat.uniforms.texel.value.set(1 / bw, 1 / bh);
        this.blurPass.mat.uniforms.dir.value.set(spread * (iter + 1), 0);
        r.setRenderTarget(this.rtB);
        r.render(this.blurPass.scene, this.blurPass.camera);

        this.blurPass.mat.uniforms.tex.value = this.rtB.texture;
        this.blurPass.mat.uniforms.dir.value.set(0, spread * (iter + 1));
        r.setRenderTarget(this.rtA);
        r.render(this.blurPass.scene, this.blurPass.camera);
      }

      // 合成上屏
      this.composite.mat.uniforms.sceneTex.value = this.sceneRT.texture;
      this.composite.mat.uniforms.bloomTex.value = this.rtA.texture;
      r.setRenderTarget(null);
      r.render(this.composite.scene, this.composite.camera);
    }

    screenshot() {
      this.renderFrame();
      return this.canvas.toDataURL('image/png');
    }
  }

  DC.Renderer = Renderer;
})();
