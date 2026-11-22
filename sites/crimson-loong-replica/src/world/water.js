// The lake: planar mirror reflection (oblique-clipped mirror pass) + wave-shaded
// surface with sun glint, splash ring waves, waterfall mist.
import * as THREE from 'three';
import { SH, R } from '../lib/util.js';
import { NOISE, ATM } from '../lib/glsl.js';

export const Water = {
  mesh: null, reflectorCam: new THREE.Camera(),
  rt: null, enabled: true, vpMat: new THREE.Matrix4(),
  rings: null, ringT: -100,
};

const waterFrag = /* glsl */`
precision highp float;
varying vec3 vW; varying vec3 vC;
uniform float uTime;
uniform vec3 uSunDir; uniform vec3 uSunColor;
uniform sampler2D uReflect;
uniform mat4 uRefVP;
${NOISE}${ATM}
vec3 waveNormal(vec2 p, float t){
  float w0 = sin(p.x * 0.28 + t * 0.9) + sin(p.y * 0.31 - t * 1.1);
  float w1 = sin((p.x + p.y) * 0.53 - t * 1.7) * 0.6;
  float w2 = sin(p.x * 1.4 - t * 2.3) * 0.3 + sin(p.y * 1.7 + t * 2.0) * 0.3;
  float n1 = vnoise(p * 0.5 + vec2(t * 0.22, -t * 0.19)) - 0.5;
  float n2 = vnoise(p * 1.7 - vec2(t * 0.31, t * 0.27)) - 0.5;
  float a = (w0 * 0.45 + w1) * (0.6 + 0.8 * uStorm) + w2 * 0.4;
  float b = (w1 * 0.8 + n1 * 2.2) * (0.6 + 0.8 * uStorm) + w2 * 0.5 + n2 * 1.4;
  return normalize(vec3(a * 0.16, 1.0, b * 0.16));
}
void main(){
  vec3 V = normalize(vC - vW);
  vec3 N = waveNormal(vW.xz, uTime);

  // projective mirror reflection with wave distortion
  vec4 rp = uRefVP * vec4(vW, 1.0);
  vec2 ruv = rp.xy / max(rp.w, 0.001) * 0.5 + 0.5;
  float dist = distance(vW, vC);
  vec2 distort = N.xz * (10.0 + 90.0 * uStorm) / max(dist, 8.0);
  vec3 refl = texture2D(uReflect, ruv + distort * 0.06).rgb;

  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  fres = mix(0.22, 1.0, fres);
  vec3 deep = mix(vec3(0.02, 0.07, 0.075), vec3(0.02, 0.045, 0.06), uStorm);
  vec3 col = mix(deep, refl, clamp(fres * 1.2, 0.0, 0.96));

  // sun glint
  vec3 R = reflect(-V, N);
  float spec = pow(max(dot(R, normalize(uSunDir)), 0.0), 160.0);
  float glow = pow(max(dot(R, normalize(uSunDir)), 0.0), 9.0);
  col += uSunColor * (spec * 2.6 + glow * 0.16);

  col = atmFog(col, vW, vC, 1.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

const waterVert = /* glsl */`
varying vec3 vW; varying vec3 vC;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz; vC = cameraPosition;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

// expanding splash rings drawn as one disc with analytic rings
const ringsFrag = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uT;      // seconds since splash (large = off)
uniform float uStorm;
${NOISE}
void main(){
  float r = distance(vUv, vec2(0.5)) * 2.0;      // 0..1 across disc
  vec3 col = vec3(0.0);
  float acc = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float delay = fi * 0.55;
    float life = uT - delay;
    if (life < 0.0 || life > 5.0) continue;
    float rr = 0.06 + life * (0.16 - fi * 0.03);
    float band = exp(-pow((r - rr) / (0.02 + life * 0.012), 2.0));
    acc += band * smoothstep(5.0, 1.2, life) * (1.0 - fi * 0.25);
  }
  float ripple = vnoise(vUv * 26.0) * 0.3;
  col = vec3(0.65, 0.78, 0.85) * (acc * (0.8 + ripple));
  gl_FragColor = vec4(col, acc);
}
`;

export function initWater(scene, renderer) {
  const size = renderer.getSize(new THREE.Vector2());
  Water.rt = new THREE.WebGLRenderTarget(1024, 1024, {
    type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
  });

  const geo = new THREE.PlaneGeometry(430, 360, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: SH.uTime, uStorm: SH.uStorm,
      uSunDir: SH.uSunDir, uSunColor: SH.uSunColor,
      uFogColor: SH.uFogColor, uFogSky: SH.uFogSky,
      uReflect: { value: Water.rt.texture },
      uRefVP: { value: Water.vpMat },
    },
    vertexShader: waterVert, fragmentShader: waterFrag,
  });
  Water.mesh = new THREE.Mesh(geo, mat);
  Water.mesh.position.y = 0.02;
  Water.mesh.receiveShadow = false;
  scene.add(Water.mesh);

  const rgeo = new THREE.CircleGeometry(90, 40);
  rgeo.rotateX(-Math.PI / 2);
  const rmat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uT: { value: 100 }, uStorm: SH.uStorm },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: ringsFrag,
  });
  Water.rings = new THREE.Mesh(rgeo, rmat);
  Water.rings.position.y = 0.09;
  Water.rings.visible = false;
  scene.add(Water.rings);
}

export function splashRings(t) {
  Water.ringT = t;
}

const reflPlaneNormal = new THREE.Vector3(0, 1, 0);
const _pos = new THREE.Vector3(), _tgt = new THREE.Vector3(), _up = new THREE.Vector3();
const _look = new THREE.Vector3();
const _plane = new THREE.Plane();
const _clip = new THREE.Vector4();
const _q = new THREE.Vector4();

// One mirror pass: render the scene from the mirrored camera into Water.rt.
export function reflectScene(renderer, scene, camera) {
  if (!Water.enabled) return;
  const cam = camera;
  if (cam.position.y < 0.5) return;    // underwater: skip the mirror pass

  const v = Water.reflectorCam;
  // reflect position and view target about y = 0
  _pos.copy(cam.position); _pos.y *= -1;
  _look.set(0, 0, -1).applyQuaternion(cam.quaternion).normalize().add(cam.position);
  _tgt.copy(_look); _tgt.y *= -1;
  _up.set(0, 1, 0).applyQuaternion(cam.quaternion); _up.y *= -1;
  // guard: a near-vertical view makes the reflected up degenerate -> NaN pose
  _up.normalize();
  const viewUp = Math.abs(_look.clone().sub(_pos).normalize().y);
  if (viewUp > 0.985) return;
  v.position.copy(_pos);
  v.up.copy(_up);
  v.lookAt(_tgt);
  v.near = cam.near; v.far = cam.far;
  v.updateMatrixWorld();
  v.projectionMatrix.copy(cam.projectionMatrix);
  v.projectionMatrixInverse.copy(cam.projectionMatrixInverse);

  // oblique near-plane clipping so geometry below the water plane is cut
  _plane.setFromNormalAndCoplanarPoint(reflPlaneNormal, new THREE.Vector3(0, 0, 0));
  _plane.applyMatrix4(v.matrixWorldInverse);
  _clip.set(_plane.normal.x, _plane.normal.y, _plane.normal.z, _plane.constant);
  const pm = v.projectionMatrix;
  _q.x = (Math.sign(_clip.x) + pm.elements[8]) / pm.elements[0];
  _q.y = (Math.sign(_clip.y) + pm.elements[9]) / pm.elements[5];
  _q.z = -1.0;
  _q.w = (1.0 + pm.elements[10]) / pm.elements[14];
  _clip.multiplyScalar(2.0 / _clip.dot(_q));
  pm.elements[2] = _clip.x;
  pm.elements[6] = _clip.y;
  pm.elements[10] = _clip.z + 1.0;
  pm.elements[14] = _clip.w;

  // VP matrix for projective sampling (use the un-clipped projection to keep UVs sane)
  const projPlain = cam.projectionMatrix.clone();
  const viewM = v.matrixWorldInverse;
  Water.vpMat.multiplyMatrices(projPlain, viewM);

  const prevRT = renderer.getRenderTarget();
  Water.mesh.visible = false;
  Water.rings.visible = false;
  renderer.setRenderTarget(Water.rt);
  renderer.clear();
  renderer.render(scene, v);
  renderer.setRenderTarget(prevRT);
  Water.mesh.visible = true;
  Water.rings.visible = Water.ringT > -100;
}

export function updateWater(t, dt, filmT, prevFilmT, splashBeat) {
  // trigger rings once per loop when crossing the splash beat
  if (prevFilmT < splashBeat && filmT >= splashBeat) {
    Water.ringT = 0;
    Water.rings.position.set(splashPoint.x, 0.09, splashPoint.z);
  }
  if (Water.ringT >= 0) {
    Water.ringT += dt;
    Water.rings.material.uniforms.uT.value = Water.ringT;
    Water.rings.visible = Water.ringT < 6.5;
  }
}

export const splashPoint = new THREE.Vector3(8, 0, 6);
