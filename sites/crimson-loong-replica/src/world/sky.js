// Sky dome (gradient, dusk sun, drifting cloud layers, storm mass, rift) +
// impostor puff clouds. Storm amount and flashes come from the shared uniforms.
import * as THREE from 'three';
import { SH } from '../lib/util.js';
import { NOISE } from '../lib/glsl.js';
import { Tex } from '../lib/tex.js';

export const Sky = { group: null, clouds: [] };

const domeFrag = /* glsl */`
precision highp float;
varying vec3 vDir;
uniform float uTime; uniform float uStorm; uniform float uFlash; uniform float uRift;
uniform vec3 uSunDir; uniform vec3 uStormCenter; uniform vec3 uFogColor;
${NOISE}
float churn(vec2 uv, float t){ return vnoise(uv * 3.0 + t * 0.02); }
void main() {
  vec3 dir = normalize(vDir);
  float h = clamp(dir.y, -0.08, 1.0);
  vec3 zen = mix(vec3(0.115, 0.15, 0.26), vec3(0.028, 0.042, 0.085), uStorm);
  vec3 hor = mix(vec3(1.05, 0.60, 0.36), vec3(0.30, 0.275, 0.375), uStorm);
  vec3 col = mix(hor, zen, pow(clamp(h, 0.0, 1.0), 0.52));
  col = mix(col, vec3(0.98, 0.42, 0.26), (1.0 - uStorm) * 0.25 * smoothstep(0.35, 0.0, h));

  float s = max(dot(dir, uSunDir), 0.0);
  col += vec3(1.0, 0.52, 0.24) * pow(s, 5.0) * 0.32;
  col += vec3(1.2, 0.62, 0.28) * pow(s, 90.0) * 1.4;

  // three drifting cumulus layers, coverage follows the storm
  vec2 w = vec2(uTime * 0.006, uTime * 0.0023);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float H = 140.0 + fi * 190.0;
    vec2 uv = dir.xz / max(dir.y, 0.055) * (H * 0.0016) + w * (1.0 + fi * 0.6);
    float n = fbm(uv * 1.35 + fi * 13.7);
    float cov = mix(0.34, 0.72, uStorm);
    float cl = smoothstep(1.0 - cov - 0.16, 1.0 - cov + 0.20, n) * smoothstep(0.03, 0.14, dir.y);
    vec3 cc = mix(vec3(0.92, 0.72, 0.62), vec3(0.30, 0.29, 0.37), uStorm);
    cc = mix(cc, vec3(1.05, 0.55, 0.30), pow(s, 3.0) * 0.55 * (1.0 - uStorm * 0.6));
    cc -= churn(uv, uTime) * 0.08 * uStorm;
    col = mix(col, cc, cl * (0.85 - fi * 0.22));
  }

  // storm mass stacked toward its center direction
  vec3 sc = normalize(uStormCenter);
  float sm = smoothstep(0.12, 0.85, dot(dir, sc));
  float churnN = fbm(dir.xz * 6.0 / max(0.2, dir.y + 0.35) + vec2(uTime * 0.05, uTime * 0.08));
  float mass = sm * uStorm * smoothstep(0.02, 0.35, dir.y);
  col = mix(col, mix(vec3(0.30, 0.22, 0.28), vec3(0.10, 0.095, 0.14), churnN * 1.3), mass * 0.92);
  col += vec3(0.85, 0.30, 0.18) * mass * pow(s, 2.5) * 0.45;  // storm belly lit by the low sun

  // rift of light opening as the pearl act resolves
  vec3 rd = normalize(vec3(-0.25, 0.62, 0.35));
  float ang = distance(dir, rd);
  float rift = exp(-pow(ang / 0.20, 2.0)) * uRift * smoothstep(0.03, 0.28, dir.y);
  col += vec3(1.25, 1.02, 0.72) * rift * 1.8;

  col += vec3(0.72, 0.78, 1.0) * uFlash * 0.55;
  // below the horizon the dome only peeks between hills: blend into ground haze
  vec3 low = uFogColor * 0.85 + vec3(0.03, 0.02, 0.03);
  col = mix(col, low, smoothstep(0.04, -0.04, dir.y));
  gl_FragColor = vec4(col, 1.0);
}
`;

export function initSky(scene) {
  Sky.group = new THREE.Group();

  const geo = new THREE.SphereGeometry(1800, 48, 24);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTime: SH.uTime, uStorm: SH.uStorm, uFlash: SH.uFlash, uRift: SH.uRift,
      uSunDir: SH.uSunDir, uStormCenter: SH.uStormCenter, uFogColor: SH.uFogColor,
    },
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main(){
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: domeFrag,
  });
  const dome = new THREE.Mesh(geo, mat);
  dome.frustumCulled = false;
  dome.renderOrder = -100;
  Sky.group.add(dome);

  // impostor puffs: a bank around the storm center + stray fair-weather clouds
  const rnd = (a, b) => a + Math.random() * (b - a);
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(rnd(160, 300), rnd(90, 170)),
      new THREE.MeshBasicMaterial({
        map: Tex.puff, transparent: true, depthWrite: false, opacity: 0,
        color: 0x9d93a8, fog: false,
      })
    );
    const near = i < 9;
    m.position.set(
      near ? rnd(120, 340) : rnd(-500, 500),
      rnd(190, 330),
      near ? rnd(-320, -60) : rnd(-500, 500)
    );
    m.lookAt(0, m.position.y * 0.4, 0);
    m.userData = { baseOp: near ? rnd(0.5, 0.85) : rnd(0.2, 0.4), drift: rnd(0.4, 1.2), near };
    Sky.clouds.push(m);
    Sky.group.add(m);
  }
  scene.add(Sky.group);
}

export function updateSky(t) {
  const storm = SH.uStorm.value;
  for (const c of Sky.clouds) {
    const target = c.userData.baseOp * (c.userData.near ? (0.25 + 0.75 * storm) : (1 - storm * 0.8));
    c.material.opacity += (target - c.material.opacity) * 0.05;
    c.position.x += c.userData.drift * (0.4 + storm * 2.2) * 0.02;
    if (c.position.x > 520) c.position.x = -520;
  }
}
