// 全局配置与场景布局(单位:米;+X 东,+Z 北,+Y 上)
// 吉萨高原:西高东低,金字塔在台地上,狮身人面像在东侧低地
export const CFG = {
  skyRadius: 2600,
  camera: { near: 0.5, far: 7000, fov: 55 },
  quality: {
    high: { pixelRatioCap: 2, shadowMap: 2048, shadows: true, bloom: true },
    mid: { pixelRatioCap: 1.5, shadowMap: 1024, shadows: true, bloom: true },
    low: { pixelRatioCap: 1, shadowMap: 0, shadows: false, bloom: false },
  },
};

export const LAYOUT = [
  { name: '胡夫大金字塔', x: 0, z: 200, base: 230.4, h: 138.5 },
  { name: '卡夫拉金字塔', x: -80, z: -80, base: 215.25, h: 143.5, cap: true },
  { name: '孟卡拉金字塔', x: -180, z: -280, base: 108.5, h: 65 },
  { name: '王后金字塔', x: 160, z: 60, base: 46, h: 30 },
  { name: '狮身人面像', x: 150, z: -180 },
  { name: '卫星金字塔', x: -260, z: -330, base: 30, h: 18 },
];

// 台地高度:x < 60 为 40m 高原,60..140 缓坡过渡,东侧低地 0
function smooth(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
export function plateauHeight(x, z) {
  return 40 * smooth(140, 60, x);
}

const FLAT = [
  { x: 0, z: 200, r: 190 },
  { x: -80, z: -80, r: 180 },
  { x: -180, z: -280, r: 130 },
  { x: 160, z: 60, r: 80 },
  { x: -260, z: -330, r: 60 },
];

export function groundHeight(x, z, plainFn) {
  let h = plainFn ? plainFn(x, z) : plateauHeight(x, z);
  for (const f of FLAT) {
    const d = Math.hypot(x - f.x, z - f.z);
    if (d < f.r) { h = Math.max(h, plateauHeight(x, z)); break; }
  }
  return h;
}

export const DAY_STATES = {
  night: {
    az: 210, el: 45, sunColor: 0x8fa7d8, sunIntensity: 0.22,
    hemiSky: 0x2a3555, hemiGround: 0x1c1a16, hemiIntensity: 0.5, amb: 0.12,
    fogColor: 0x0d1220, fogDensity: 0.0028,
    top: 0x060a18, horizon: 0x1b2436, sunGlow: 0.12, stars: 1.0, exposure: 1.0,
  },
  dawn: {
    az: 115, el: 10, sunColor: 0xffd9a8, sunIntensity: 1.8,
    hemiSky: 0xb0b8cc, hemiGround: 0x9a7a52, hemiIntensity: 0.72, amb: 0.26,
    fogColor: 0xe8d5b8, fogDensity: 0.0022,
    top: 0x96a4be, horizon: 0xf4d8ac, sunGlow: 0.7, stars: 0.05, exposure: 1.04,
  },
  morning: {
    az: 140, el: 32, sunColor: 0xfff0d0, sunIntensity: 2.8,
    hemiSky: 0xc4d2e4, hemiGround: 0xa8895e, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xf0e2c8, fogDensity: 0.0013,
    top: 0x8ca6d4, horizon: 0xf4e0bc, sunGlow: 0.45, stars: 0.0, exposure: 1.05,
  },
  noon: {
    az: 175, el: 68, sunColor: 0xffffff, sunIntensity: 3.2,
    hemiSky: 0xd0dcf0, hemiGround: 0xb09060, hemiIntensity: 0.9, amb: 0.34,
    fogColor: 0xf2ead6, fogDensity: 0.0009,
    top: 0x7ea8dc, horizon: 0xf0e4cc, sunGlow: 0.3, stars: 0.0, exposure: 1.02,
  },
  golden: {
    az: 252, el: 16, sunColor: 0xffcf8a, sunIntensity: 2.9,
    hemiSky: 0xc8c2d4, hemiGround: 0xa87848, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xf4dfb6, fogDensity: 0.0016,
    top: 0x94a0c8, horizon: 0xfcd9a0, sunGlow: 0.65, stars: 0.0, exposure: 1.08,
  },
  dusk: {
    az: 278, el: 6, sunColor: 0xffa860, sunIntensity: 2.2,
    hemiSky: 0xc89898, hemiGround: 0x8a5c38, hemiIntensity: 0.65, amb: 0.24,
    fogColor: 0xf0bc8a, fogDensity: 0.0013,
    top: 0x8a78a8, horizon: 0xff9e5c, sunGlow: 0.95, stars: 0.1, exposure: 1.16,
  },
};
