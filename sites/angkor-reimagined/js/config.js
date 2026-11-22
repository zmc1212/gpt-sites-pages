// 全局配置与场景布局(单位:米;+X 东,+Z 北,+Y 上)
// 吴哥窟:护城河 → 西长堤 → 三层台基回廊 → 花萼式中心塔群(五塔)
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
  { name: '中央塔', x: 0, z: 0, h: 65 },
  { name: '角塔', x: -40, z: -40, h: 49 },
  { name: '外回廊', x: 0, z: 0 },
  { name: '西长堤', x: 0, z: 300 },
  { name: '护城河', x: 0, z: 310 },
  { name: '西塔门', x: 0, z: 395 },
  { name: '藏书楼', x: 45, z: 90 },
];

// 地面:丛林平地 y 0;护城河水面 −0.6(四大条带);台基区压平
export function plainHeight(x, z) {
  // 护城河条带下沉
  if (Math.abs(x) <= 400 && Math.abs(z) <= 380) {
    const inner = 250;
    if (Math.abs(z) >= 240 && Math.abs(z) <= 380) return -1.2;
    if (Math.abs(x) >= 250 && Math.abs(x) <= 400 && Math.abs(z) <= 240) return -1.2;
  }
  return 0;
}

export function groundHeight(x, z, plainFn) {
  // 台基(三叠):外 200×180(y8)/中 150×135(y14)/内 110×100(y20)
  const ax = Math.abs(x), az = Math.abs(z);
  if (ax <= 55 && az <= 50) return 20;
  if (ax <= 75 && az <= 67.5) return 14;
  if (ax <= 100 && az <= 90) return 8;
  // 西长堤(x ±5, z −240..380)
  if (Math.abs(x) <= 5 && z >= -240 && z <= 380) return 1.6;
  // 西塔门基台
  if (Math.abs(x) <= 14 && z >= 382 && z <= 408) return 1.6;
  return 0;
}

export const DAY_STATES = {
  night: {
    az: 210, el: 45, sunColor: 0x8fa7d8, sunIntensity: 0.22,
    hemiSky: 0x2a3555, hemiGround: 0x1a1e14, hemiIntensity: 0.5, amb: 0.12,
    fogColor: 0x0d1220, fogDensity: 0.0030,
    top: 0x060a18, horizon: 0x1b2436, sunGlow: 0.12, stars: 1.0, exposure: 1.0,
  },
  dawn: {
    az: 115, el: 9, sunColor: 0xffd8b0, sunIntensity: 1.7,
    hemiSky: 0xb4b8c4, hemiGround: 0x5e6242, hemiIntensity: 0.7, amb: 0.26,
    fogColor: 0xe4d8c4, fogDensity: 0.0024,
    top: 0x92a0bc, horizon: 0xf6d8b4, sunGlow: 0.7, stars: 0.05, exposure: 1.04,
  },
  morning: {
    az: 140, el: 32, sunColor: 0xfff0d0, sunIntensity: 2.7,
    hemiSky: 0xc2d4e0, hemiGround: 0x6e7448, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xeee4d0, fogDensity: 0.0016,
    top: 0x8ca6d0, horizon: 0xf4e2c4, sunGlow: 0.45, stars: 0.0, exposure: 1.05,
  },
  noon: {
    az: 175, el: 68, sunColor: 0xffffff, sunIntensity: 3.1,
    hemiSky: 0xcfe0ea, hemiGround: 0x787e4c, hemiIntensity: 0.9, amb: 0.34,
    fogColor: 0xf0ecd8, fogDensity: 0.0011,
    top: 0x82a8d8, horizon: 0xf2e6cc, sunGlow: 0.3, stars: 0.0, exposure: 1.02,
  },
  golden: {
    az: 252, el: 16, sunColor: 0xffd090, sunIntensity: 2.8,
    hemiSky: 0xc4c8cc, hemiGround: 0x6e6e42, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xf2ddb4, fogDensity: 0.0018,
    top: 0x94a0c4, horizon: 0xfcdca4, sunGlow: 0.65, stars: 0.0, exposure: 1.08,
  },
  dusk: {
    az: 278, el: 14, sunColor: 0xffb87a, sunIntensity: 2.9,
    hemiSky: 0xc8b0a8, hemiGround: 0x6e6e44, hemiIntensity: 0.8, amb: 0.3,
    fogColor: 0xf0c8a0, fogDensity: 0.001,
    top: 0x8a7aa4, horizon: 0xff9e5c, sunGlow: 0.85, stars: 0.15, exposure: 1.2,
  },
};
