/* scene.js — three.js 场景:柔和工作室灯光 + 程序化环境反射 + 自制轨道相机。
 * 坐标系:水腔中心为原点,玩具立在 y=-3.0 的地面上。
 */
(function () {
  'use strict';
  const WT = (window.WT = window.WT || {});

  const scene3 = WT.scene3 = {
    camera: null, renderer: null, scene: null,
    surfBase: null,

    init(container) {
      // r149 默认 legacy 模式:hex 被当线性值,配 sRGB 输出会整体发白。
      // 关掉 legacy 让 hex 颜色按 sRGB 解码成线性,输出前再编码回 sRGB。
      if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.98;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
      this.renderer = renderer;

      const scene = new THREE.Scene();
      this.scene = scene;
      scene.background = this.makeBackdrop();

      // ---- 环境反射:程序化 equirect → PMREM ----
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromEquirectangular(this.makeEnvEquirect()).texture;
      scene.environment = envTex;
      pmrem.dispose();

      // ---- 灯光 ----
      scene.add(new THREE.HemisphereLight(0xbfd9e4, 0x3a2f26, 0.6));
      const key = new THREE.DirectionalLight(0xfff2df, 1.6);
      key.position.set(4.5, 7.5, 6);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 2; key.shadow.camera.far = 20;
      key.shadow.camera.left = -5; key.shadow.camera.right = 5;
      key.shadow.camera.top = 6; key.shadow.camera.bottom = -5;
      key.shadow.bias = -0.002;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x9fc4d8, 0.35);
      fill.position.set(-5, 3, -4);
      scene.add(fill);

      // ---- 地面(接影) ----
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.ShadowMaterial({ opacity: 0.28 }));
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -3.02;
      ground.receiveShadow = true;
      scene.add(ground);
      // 桌面暗色圆盘(接住阴影,不抢戏)
      const desk = new THREE.Mesh(
        new THREE.CircleGeometry(5.2, 48),
        new THREE.MeshStandardMaterial({ color: 0x0e151b, roughness: 0.95, metalness: 0, envMapIntensity: 0.25 }));
      desk.rotation.x = -Math.PI / 2;
      desk.position.y = -3.03;
      desk.receiveShadow = true;
      scene.add(desk);

      // ---- 玩具 ----
      WT.buildToy(scene);

      // ---- 粒子 ----
      WT.fx = new WT.WaterFX(scene);

      // ---- 相机与轨道控制(自制,阻尼) ----
      this.cam = {
        theta: 0, phi: Math.PI * 0.44, radius: 10.8,
        target: new THREE.Vector3(0, -0.15, 0),
        vTheta: 0, vPhi: 0,
        minPhi: Math.PI * 0.3, maxPhi: Math.PI * 0.62,
        minTheta: -1.15, maxTheta: 1.15,
        minR: 5.6, maxR: 12.5,
      };
      this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
      this.updateCamera(0);

      this.bindPointer(container);
      window.addEventListener('resize', () => this.onResize());
      this.surfBase = WT.surfMesh.geometry.attributes.position.array.slice();
      this.time = 0;
    },

    // 深蓝夜色渐变背景(带顶部柔光)
    makeBackdrop() {
      const cv = document.createElement('canvas');
      cv.width = 32; cv.height = 256;
      const g = cv.getContext('2d');
      const gr = g.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0, '#2a4150');
      gr.addColorStop(0.45, '#1c2b36');
      gr.addColorStop(1, '#121820');
      g.fillStyle = gr; g.fillRect(0, 0, 32, 256);
      const tex = new THREE.CanvasTexture(cv);
      tex.encoding = THREE.sRGBEncoding;
      return tex;
    },

    // 环境贴图:横向柔光带 + 上下渐变(给塑料高光)
    makeEnvEquirect() {
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 128;
      const g = cv.getContext('2d');
      const gr = g.createLinearGradient(0, 0, 0, 128);
      gr.addColorStop(0, '#3d5866'); gr.addColorStop(0.5, '#8fb2c2'); gr.addColorStop(1, '#2c2420');
      g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
      // 两块柔光箱
      g.fillStyle = 'rgba(255,250,235,.95)';
      g.fillRect(30, 30, 70, 26);
      g.fillRect(160, 44, 60, 18);
      const tex = new THREE.CanvasTexture(cv);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.encoding = THREE.sRGBEncoding;
      return tex;
    },

    bindPointer(container) {
      const el = renderer_dom(this);
      const ray = new THREE.Raycaster();
      const ptr = new THREE.Vector2();
      const cam = this.cam;
      let dragging = false, lastX = 0, lastY = 0;
      let downButton = null;   // 点在玩具按钮上:'L'/'R'
      const pointers = new Map();
      let pinchD0 = 0, pinchR0 = 0;

      const pick = (e) => {
        const r = el.getBoundingClientRect();
        ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        ray.setFromCamera(ptr, this.camera);
        const caps = Object.values(WT.buttons).map((b) => b.cap);
        const hit = ray.intersectObjects(caps, false)[0];
        return hit ? hit.object.name.split('-')[1] : null;
      };

      el.addEventListener('pointerdown', (e) => {
        el.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          pinchD0 = Math.hypot(a.x - b.x, a.y - b.y);
          pinchR0 = cam.radius;
          dragging = false;
          return;
        }
        const side = pick(e);
        if (side) {
          downButton = side;
          if (this.onButton) this.onButton(side, true);
          return;
        }
        dragging = true; lastX = e.clientX; lastY = e.clientY;
      });
      el.addEventListener('pointermove', (e) => {
        if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (pinchD0 > 0) {
            cam.radius = THREE.MathUtils.clamp(pinchR0 * pinchD0 / Math.max(d, 20), cam.minR, cam.maxR);
          }
          return;
        }
        if (downButton) return; // 按住按钮期间不转视角
        if (!dragging) return;
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        lastX = e.clientX; lastY = e.clientY;
        cam.vTheta -= dx * 0.0032;
        cam.vPhi -= dy * 0.0028;
      });
      const release = (e) => {
        pointers.delete(e.pointerId);
        if (downButton) {
          if (this.onButton) this.onButton(downButton, false);
          downButton = null;
        }
        if (pointers.size < 2) pinchD0 = 0;
        if (pointers.size === 0) dragging = false;
      };
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('wheel', (e) => {
        e.preventDefault();
        cam.radius = THREE.MathUtils.clamp(
          cam.radius * (1 + Math.sign(e.deltaY) * 0.08), cam.minR, cam.maxR);
      }, { passive: false });
    },

    pressAnim: { L: 0, R: 0 },   // 0..1 按压深度
    setPressed(side, on) {
      this.pressAnim[side] = on ? 1 : 0;
    },

    updateCamera(dt) {
      const cam = this.cam;
      // 阻尼
      cam.theta += cam.vTheta * (dt > 0 ? Math.min(1, dt * 9) : 1);
      cam.phi += cam.vPhi * (dt > 0 ? Math.min(1, dt * 9) : 1);
      cam.vTheta *= Math.pow(0.0001, dt || 1 / 60);
      cam.vPhi *= Math.pow(0.0001, dt || 1 / 60);
      cam.theta = THREE.MathUtils.clamp(cam.theta, cam.minTheta, cam.maxTheta);
      cam.phi = THREE.MathUtils.clamp(cam.phi, cam.minPhi, cam.maxPhi);
      const sp = Math.sin(cam.phi), cp = Math.cos(cam.phi);
      this.camera.position.set(
        cam.target.x + cam.radius * sp * Math.sin(cam.theta),
        cam.target.y + cam.radius * cp,
        cam.target.z + cam.radius * sp * Math.cos(cam.theta));
      this.camera.lookAt(cam.target);
    },

    onResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    update(dt) {
      this.time += dt;
      this.updateCamera(dt);

      // 水面微起伏
      const pos = WT.surfMesh.geometry.attributes.position;
      const base = this.surfBase;
      const t = this.time;
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3], y = base[i * 3 + 1];
        pos.array[i * 3 + 2] =
          Math.sin(x * 2.6 + t * 2.1) * 0.028 +
          Math.sin(y * 3.4 - t * 1.6) * 0.02;
      }
      pos.needsUpdate = true;

      // 按钮按压动画 + 喷口发光
      for (const side of ['L', 'R']) {
        const b = WT.buttons[side];
        const target = this.pressAnim[side];
        b.group.position.z += ((b.baseZ - target * 0.1) - b.group.position.z) * Math.min(1, dt * 18);
        const nz = WT.nozzleMeshes[side === 'L' ? 0 : 1];
        const s = target;
        nz.material.emissive = nz.material.emissive || new THREE.Color(0);
        nz.material.emissive.setRGB(0.2 * s, 0.55 * s, 0.75 * s);
      }
    },

    render() { this.renderer.render(this.scene, this.camera); },
  };

  function renderer_dom(self) { return self.renderer.domElement; }
})();
