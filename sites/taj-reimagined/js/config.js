// 全局配置与场景布局(单位:米;+X 东,+Z 北,+Y 上)
// 泰姬陵:南门 → 300m 长池轴线 → 陵体(95m 台基) → 王陵与四塔
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
  { name: '泰姬陵', x: 0, z: -320, plinth: 95, body: 57, domeH: 73, minaret: 41 },
  { name: '长池水镜', x: 0, z: -30 },
  { name: '南门楼', x: 0, z: 165 },
  { name: '莫卧儿花园', x: 0, z: 30 },
];


// 漫游地面:平地 0 / 大理石台基 7 / 长池沿 1
export function groundHeight(x, z, plainFn) {
  // 陵体台基
  if (Math.abs(x) <= 47.5 && Math.abs(z + 320) <= 47.5) return 7;
  // 宣礼塔角(台基角外沿)
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    if (Math.abs(x - dx * 47.5) <= 4.5 && Math.abs(z + 320 - dz * 47.5) <= 4.5) return 7;
  }
  return 0;
}

export const DAY_STATES = {
  night: {
    az: 210, el: 45, sunColor: 0x8fa7d8, sunIntensity: 0.22,
    hemiSky: 0x2a3555, hemiGround: 0x1c1a16, hemiIntensity: 0.5, amb: 0.12,
    fogColor: 0x0d1220, fogDensity: 0.0028,
    top: 0x060a18, horizon: 0x1b2436, sunGlow: 0.12, stars: 1.0, exposure: 1.0,
  },
  dawn: {
    az: 115, el: 10, sunColor: 0xffd9c0, sunIntensity: 1.7,
    hemiSky: 0xc0b8cc, hemiGround: 0x8a7c5a, hemiIntensity: 0.72, amb: 0.26,
    fogColor: 0xf0dcd8, fogDensity: 0.0015,
    top: 0x9aa2c4, horizon: 0xf8d8c4, sunGlow: 0.45, stars: 0.05, exposure: 0.98,
  },
  morning: {
    az: 140, el: 32, sunColor: 0xfff2e0, sunIntensity: 2.7,
    hemiSky: 0xccd8ea, hemiGround: 0x9c8c66, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xf4ece4, fogDensity: 0.0012,
    top: 0x8ea8d4, horizon: 0xf6e4cc, sunGlow: 0.45, stars: 0.0, exposure: 1.05,
  },
  noon: {
    az: 175, el: 68, sunColor: 0xffffff, sunIntensity: 3.1,
    hemiSky: 0xd4e0f2, hemiGround: 0xa89870, hemiIntensity: 0.9, amb: 0.34,
    fogColor: 0xf4f0e8, fogDensity: 0.0009,
    top: 0x82a8dc, horizon: 0xf2ecd8, sunGlow: 0.3, stars: 0.0, exposure: 1.02,
  },
  golden: {
    az: 252, el: 16, sunColor: 0xffd8a0, sunIntensity: 2.8,
    hemiSky: 0xcccad8, hemiGround: 0xa8865c, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xf6e0c0, fogDensity: 0.0015,
    top: 0x96a2cc, horizon: 0xfcdca8, sunGlow: 0.65, stars: 0.0, exposure: 1.08,
  },
  dusk: {
    az: 278, el: 6, sunColor: 0xffb070, sunIntensity: 2.1,
    hemiSky: 0xc8a0a0, hemiGround: 0x8a6444, hemiIntensity: 0.65, amb: 0.24,
    fogColor: 0xf2c49c, fogDensity: 0.0012,
    top: 0x8a7aa8, horizon: 0xffa868, sunGlow: 0.95, stars: 0.1, exposure: 1.16,
  },
};
