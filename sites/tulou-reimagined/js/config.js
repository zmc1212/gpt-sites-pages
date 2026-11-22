// 全局配置与场景布局(单位:米;+X 东,+Z 北,+Y 上)
// 土楼巡礼:茶山 → 门楼 → 环廊 → 祖堂 → 炊烟 → 瓦顶 → 四菜一汤 → 灯火

export const CFG = {
  skyRadius: 2600,
  fogPlain: 0.0011,
  camera: { near: 0.5, far: 6500, fov: 55 },
  quality: {
    high: { pixelRatioCap: 2, shadowMap: 2048, shadows: true, bloom: true },
    mid: { pixelRatioCap: 1.5, shadowMap: 1024, shadows: true, bloom: true },
    low: { pixelRatioCap: 1, shadowMap: 0, shadows: false, bloom: false },
  },
};

// ---- 土楼群(主楼 + 西侧「四菜一汤」意象) ----
export const LAYOUT = {
  main: {
    name: '承启楼意象主楼', x: 0, z: 0,
    outerR: 38, outerH: 13.5, floors: 4,
    midR: 24, midH: 8.6,
    innerR: 11.5, innerH: 5.6,
    gate: { w: 5.2, h: 6.4, z: -38 }, // 南向石拱门
  },
  cluster: [
    { name: '步云楼', x: -150, z: 92, r: 21, h: 10.5, floors: 3 },
    { name: '振昌楼', x: -188, z: 22, r: 25, h: 12, floors: 4 },
    { name: '瑞云楼', x: -126, z: -58, r: 19, h: 9.5, floors: 3 },
    { name: '和昌楼(椭圆)', x: -160, z: 42, rx: 25, rz: 15, h: 8.5, floors: 3, oval: true },
  ],
  ancestral: { name: '祖堂', x: 0, z: 0, w: 15, d: 11, h: 6.2 },
  well: { x: 12, z: -13 },
};

// 茶山高度(梯田台地:噪声 + 台阶量化)
export function teaHeight(x, z) {
  let h = (Math.sin(x * 0.012 + 1.4) + Math.cos(z * 0.014 + 3.7)) * 2.6
        + Math.sin(x * 0.004 + z * 0.005 + 0.8) * 4.5;
  h = Math.max(0, h + 5);
  // 梯田量化(近景 0.8m 台阶)
  const step = 0.85;
  const q = Math.floor(h / step) * step;
  const k = (h - q) / step;
  // 主楼与土楼群周边压平
  const flats = [
    { x: 0, z: 0, r: 120 },
    { x: -150, z: 20, r: 110 },
  ];
  let fade = 1;
  for (const f of flats) {
    const d = Math.hypot(x - f.x, z - f.z);
    fade *= Math.min(1, Math.max(0, (d - f.r * 0.6) / (f.r * 0.6)));
  }
  return (q + step * Math.min(1, k * 2.2)) * fade;
}

// 漫游平面高度:主楼院内(环廊地面 + 门洞)+ 群楼周边
export function groundHeight(x, z, plainFn) {
  const M = LAYOUT.main;
  const d = Math.hypot(x - M.x, z - M.z);
  // 外环内院与环廊地面(0.9 抬高;门洞豁免)
  if (d < M.outerR - 0.4) {
    if (d > M.midR + 0.4) return 0.9;
    if (d > M.innerR + 0.2 && d < M.midR - 0.4) return 0.9;
    // 中环与内环之间的院子
    return 0.55;
  }
  // 群楼院内(简化:群楼圆内 0.8)
  for (const c of LAYOUT.cluster) {
    const r = c.oval ? Math.max(c.rx, c.rz) : c.r;
    if (Math.hypot(x - c.x, z - c.z) < r - 0.5) return 0.8;
  }
  return teaHeight(x, z);
}

// 时间状态预设(闽西南山间天光:湿润青绿,晨雾/暮金)
export const DAY_STATES = {
  night: {
    az: 200, el: 40, sunColor: 0x8fa7d8, sunIntensity: 0.22,
    hemiSky: 0x2a3855, hemiGround: 0x1c2418, hemiIntensity: 0.5, amb: 0.12,
    fogColor: 0x0e1620, fogDensity: 0.0026,
    top: 0x060c18, horizon: 0x182434, sunGlow: 0.12, stars: 1.0, exposure: 1.0,
  },
  dawn: {
    az: 235, el: 12, sunColor: 0xffc9a0, sunIntensity: 1.6,
    hemiSky: 0xa8b8c8, hemiGround: 0x5a6a4c, hemiIntensity: 0.75, amb: 0.27,
    fogColor: 0xe2dcc4, fogDensity: 0.0022,
    top: 0x84a0bc, horizon: 0xf2d8b0, sunGlow: 0.7, stars: 0.04, exposure: 1.05,
  },
  morning: {
    az: 200, el: 33, sunColor: 0xfff2dc, sunIntensity: 2.7,
    hemiSky: 0xbcd4e4, hemiGround: 0x6c7c58, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xeee6d0, fogDensity: 0.0013,
    top: 0x8aa8d0, horizon: 0xf2e4c4, sunGlow: 0.5, stars: 0.0, exposure: 1.05,
  },
  noon: {
    az: 170, el: 61, sunColor: 0xffffff, sunIntensity: 3.1,
    hemiSky: 0xd0e2ee, hemiGround: 0x788862, hemiIntensity: 0.9, amb: 0.34,
    fogColor: 0xf0ecdc, fogDensity: 0.0009,
    top: 0x7ea6da, horizon: 0xe8e2cc, sunGlow: 0.32, stars: 0.0, exposure: 1.02,
  },
  golden: {
    az: 258, el: 21, sunColor: 0xffd9a0, sunIntensity: 2.8,
    hemiSky: 0xc4d2e0, hemiGround: 0x82845c, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xf4e2c2, fogDensity: 0.0012,
    top: 0x90a4cc, horizon: 0xf8dcaa, sunGlow: 0.62, stars: 0.0, exposure: 1.06,
  },
  ember: {
    az: 292, el: 9, sunColor: 0xe89a70, sunIntensity: 1.9,
    hemiSky: 0x9c8a88, hemiGround: 0x54483c, hemiIntensity: 0.62, amb: 0.23,
    fogColor: 0xcc9c7c, fogDensity: 0.0013,
    top: 0x66668a, horizon: 0xf0a068, sunGlow: 0.85, stars: 0.1, exposure: 1.12,
  },
};
