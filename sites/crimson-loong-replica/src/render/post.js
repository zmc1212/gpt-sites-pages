// Minimal HDR post chain: scene -> bright pass -> 5 mip blurs -> composite
// (ACES + grade + vignette + fade) -> FXAA + grain + letterbox to screen.
import * as THREE from 'three';
import { ACES } from '../lib/glsl.js';

const FS_VERT = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

function fsMat(frag, uniforms) {
  return new THREE.ShaderMaterial({
    vertexShader: FS_VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false,
  });
}

function makeRT(w, h, type = THREE.HalfFloatType) {
  return new THREE.WebGLRenderTarget(w, h, {
    type, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    depthBuffer: type === THREE.HalfFloatType,
  });
}

export const Post = {
  scale: 1, flash: 0, fade: 1, underwater: 0, stormRef: { value: 0 }, ready: false,
};

export function initPost(renderer) {
  const r = { renderer };
  const size = new THREE.Vector2();
  renderer.getSize(size);

  r.sceneRT = makeRT(size.x, size.y);
  r.compRT = new THREE.WebGLRenderTarget(size.x, size.y, {
    minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
  });
  r.mips = [];
  r.mipsTmp = [];
  let w = size.x >> 1, h = size.y >> 1;
  for (let i = 0; i < 5; i++) {
    w = Math.max(w >> 1, 2); h = Math.max(h >> 1, 2);
    r.mips.push(makeRT(w, h));
    r.mipsTmp.push(makeRT(w, h));
  }

  // fullscreen triangle
  const tri = new THREE.BufferGeometry();
  tri.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  tri.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
  r.tri = new THREE.Mesh(tri, null);
  r.tri.frustumCulled = false;
  r.scene = new THREE.Scene();
  r.scene.add(r.tri);
  r.cam = new THREE.Camera();

  // ---- passes ----
  r.brightMat = fsMat(/* glsl */`
    varying vec2 vUv; uniform sampler2D tex; uniform float thresh;
    vec3 sane(vec3 c){
      if (isnan(c.r) || isnan(c.g) || isnan(c.b) || isinf(c.r) || isinf(c.g) || isinf(c.b)) return vec3(0.0);
      return max(c, vec3(0.0));
    }
    void main(){
      vec3 c = sane(texture2D(tex, vUv).rgb);
      float l = max(max(c.r, c.g), c.b);
      float k = max(l - thresh, 0.0) / max(l, 1e-4);
      gl_FragColor = vec4(c * k * k, 1.0);
    }`, { tex: { value: null }, thresh: { value: 1.0 } });

  r.blurMat = fsMat(/* glsl */`
    varying vec2 vUv; uniform sampler2D tex; uniform vec2 dir; uniform vec2 texel;
    void main(){
      vec3 a = vec3(0.0);
      float w[5]; w[0]=0.227; w[1]=0.194; w[2]=0.121; w[3]=0.054; w[4]=0.016;
      a += texture2D(tex, vUv).rgb * w[0];
      for (int i = 1; i < 5; i++){
        vec2 o = dir * texel * float(i) * 1.333;
        a += texture2D(tex, vUv + o).rgb * w[i];
        a += texture2D(tex, vUv - o).rgb * w[i];
      }
      gl_FragColor = vec4(a, 1.0);
    }`, { tex: { value: null }, dir: { value: new THREE.Vector2(1, 0) }, texel: { value: new THREE.Vector2() } });

  r.copyMat = fsMat(/* glsl */`
    varying vec2 vUv; uniform sampler2D tex;
    void main(){ gl_FragColor = texture2D(tex, vUv); }`, { tex: { value: null } });

  r.compMat = fsMat(/* glsl */`
    varying vec2 vUv;
    uniform sampler2D scene; uniform sampler2D b1; uniform sampler2D b2; uniform sampler2D b3;
    uniform float bloom; uniform float uStorm; uniform float uFlash; uniform float uFade;
    uniform float uUnder;
    ${ACES}
    void main(){
      vec3 c = texture2D(scene, vUv).rgb;
      vec3 bl = texture2D(b1, vUv).rgb * 0.5 + texture2D(b2, vUv).rgb * 0.32 + texture2D(b3, vUv).rgb * 0.24;
      if (isnan(c.r) || isnan(c.g) || isnan(c.b)) c = vec3(0.0);
      if (isnan(bl.r) || isnan(bl.g) || isnan(bl.b)) bl = vec3(0.0);
      c += bl * bloom;
      // grade: teal shadows, gold-red highlights, slight saturation lift
      float lum = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(lum), c, 1.09);
      c += vec3(0.012, 0.020, 0.036) * (1.0 - smoothstep(0.0, 0.5, lum));
      c *= mix(vec3(1.0), vec3(1.06, 0.98, 0.90), smoothstep(0.35, 1.2, lum));
      c *= 1.0 - uStorm * 0.18;
      c *= 1.0 + uFlash * 1.2;
      c = aces(c);
      // vignette
      vec2 q = vUv - 0.5;
      c *= 1.0 - dot(q, q) * 0.55;
      // underwater tint
      c = mix(c, c * vec3(0.45, 0.72, 0.78) + vec3(0.0, 0.02, 0.045), uUnder * 0.85);
      c *= mix(1.0, 0.35, uUnder * 0.5);
      c *= uFade;
      gl_FragColor = vec4(pow(max(c, 0.0), vec3(1.0 / 2.2)), 1.0);
    }`, {
    scene: { value: null }, b1: { value: null }, b2: { value: null }, b3: { value: null },
    bloom: { value: 0.55 }, uStorm: SH_REFS.storm, uFlash: SH_REFS.flash,
    uFade: { value: 1 }, uUnder: { value: 0 },
  });

  r.fxaaMat = fsMat(/* glsl */`
    varying vec2 vUv; uniform sampler2D tex; uniform vec2 texel;
    uniform float uTime; uniform float uGrain; uniform float uLetterbox;
    float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
    void main(){
      vec3 rgbNW = texture2D(tex, vUv + vec2(-1.0, -1.0) * texel).rgb;
      vec3 rgbNE = texture2D(tex, vUv + vec2( 1.0, -1.0) * texel).rgb;
      vec3 rgbSW = texture2D(tex, vUv + vec2(-1.0,  1.0) * texel).rgb;
      vec3 rgbSE = texture2D(tex, vUv + vec2( 1.0,  1.0) * texel).rgb;
      vec3 rgbM  = texture2D(tex, vUv).rgb;
      float lNW = lum(rgbNW), lNE = lum(rgbNE), lSW = lum(rgbSW), lSE = lum(rgbSE), lM = lum(rgbM);
      float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE)));
      float lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));
      vec2 dir = vec2(-((lNW + lNE) - (lSW + lSE)), ((lNW + lSW) - (lNE + lSE)));
      float dirReduce = max((lNW + lNE + lSW + lSE) * 0.25 * 0.2, 1.0 / 128.0);
      float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
      dir = clamp(dir * rcpDirMin, vec2(-8.0), vec2(8.0)) * texel;
      vec3 a = 0.5 * (texture2D(tex, vUv + dir * (1.0 / 3.0 - 0.5)).rgb + texture2D(tex, vUv + dir * (2.0 / 3.0 - 0.5)).rgb);
      vec3 b = a * 0.5 + 0.25 * (texture2D(tex, vUv + dir * -0.5).rgb + texture2D(tex, vUv + dir * 0.5).rgb);
      float lB = lum(b);
      vec3 c = (lB < lMin || lB > lMax) ? a : b;
      // grain + letterbox on the final pass so they stay crisp
      float g = fract(sin(dot(vUv * vec2(517.3, 769.7), vec2(12.9898, 78.233)) + uTime * 61.7) * 43758.5453);
      c += (g - 0.5) * uGrain;
      float lb = uLetterbox;    // fraction of height per bar
      float inBar = step(vUv.y, lb) + step(1.0 - lb, vUv.y);
      c = mix(c, vec3(0.02, 0.01, 0.015), clamp(inBar, 0.0, 1.0));
      gl_FragColor = vec4(c, 1.0);
    }`, {
    tex: { value: null }, texel: { value: new THREE.Vector2() },
    uTime: { value: 0 }, uGrain: { value: 0.035 }, uLetterbox: { value: 0.105 },
  });

  r.tri.material = r.brightMat;
  Post.ready = true;
  Object.assign(Post, r);
  Post._refs = SH_REFS;
  resizePost();
}

// shared-uniform refs (kept separate to avoid a util import cycle)
import { SH } from '../lib/util.js';
const SH_REFS = { storm: SH.uStorm, flash: SH.uFlash, time: SH.uTime };

export function resizePost() {
  if (!Post.ready) return;
  const size = new THREE.Vector2();
  Post.renderer.getSize(size);
  const w = Math.max(2, Math.floor(size.x * Post.scale));
  const h = Math.max(2, Math.floor(size.y * Post.scale));
  Post.sceneRT.setSize(w, h);
  Post.compRT.setSize(w, h);
  let mw = w, mh = h;
  for (let i = 0; i < 5; i++) {
    mw = Math.max(mw >> 1, 2); mh = Math.max(mh >> 1, 2);
    Post.mips[i].setSize(mw, mh);
    Post.mipsTmp[i].setSize(mw, mh);
  }
}

export function renderPost(renderer, scene, camera, dt) {
  const size = new THREE.Vector2();
  renderer.getSize(size);
  const w = Math.max(2, Math.floor(size.x * Post.scale));
  const h = Math.max(2, Math.floor(size.y * Post.scale));
  const tw = (x, y) => new THREE.Vector2(1 / x, 1 / y);

  const probe = (rt, log) => {
    if (!Post._probe) return;
    const b = new Uint8Array(4);
    renderer.readRenderTargetPixels(rt, (rt.width / 2) | 0, (rt.height / 2) | 0, 1, 1, b);
    Post._probe[log] = Array.from(b.slice(0, 3));
  };

  // 1) scene pass (renderer viewport/camera untouched)
  const prevRT = renderer.getRenderTarget();
  renderer.setRenderTarget(Post.sceneRT);
  renderer.setClearColor(0x0b0a10, 1);
  renderer.clear();
  renderer.render(scene, camera);
  probe(Post.sceneRT, 'scene');

  const S = Post.scene;
  const pass = (mat, target) => {
    Post.tri.material = mat;
    renderer.setRenderTarget(target);
    renderer.render(S, Post.cam);
  };

  // 2) bright pass -> mip0
  Post.brightMat.uniforms.tex.value = Post.sceneRT.texture;
  pass(Post.brightMat, Post.mips[0]);
  probe(Post.mips[0], 'bright');

  // 3) blur chain
  for (let i = 0; i < Post.mips.length; i++) {
    if (i > 0) {
      Post.copyMat.uniforms.tex.value = Post.mips[i - 1].texture;
      pass(Post.copyMat, Post.mips[i]);
    }
    Post.blurMat.uniforms.tex.value = Post.mips[i].texture;
    Post.blurMat.uniforms.texel.value = tw(Post.mips[i].width, Post.mips[i].height);
    Post.blurMat.uniforms.dir.value.set(1, 0);
    pass(Post.blurMat, Post.mipsTmp[i]);
    Post.blurMat.uniforms.tex.value = Post.mipsTmp[i].texture;
    Post.blurMat.uniforms.dir.value.set(0, 1);
    pass(Post.blurMat, Post.mips[i]);
  }

  // 4) composite
  const cu = Post.compMat.uniforms;
  cu.scene.value = Post.sceneRT.texture;
  cu.b1.value = Post.mips[1].texture;
  cu.b2.value = Post.mips[2].texture;
  cu.b3.value = Post.mips[4].texture;
  cu.uFade.value = Post.fade;
  cu.uUnder.value = Post.underwater;
  cu.bloom.value = 0.62 - SH.uStorm.value * 0.18;
  pass(Post.compMat, Post.compRT);
  probe(Post.compRT, 'comp');

  // 5) fxaa + grain + letterbox -> screen
  Post.fxaaMat.uniforms.tex.value = Post.compRT.texture;
  Post.fxaaMat.uniforms.texel.value = tw(Post.compRT.width, Post.compRT.height);
  Post.fxaaMat.uniforms.uTime.value = SH.uTime.value;
  pass(Post.fxaaMat, null);

  renderer.setRenderTarget(prevRT);
  // decay the flash envelope (set by FX events)
  SH.uFlash.value = Math.max(0, SH.uFlash.value - dt * 2.6);
}
