// 全局配置与场景布局(单位:米;+X 东,+Z 北,+Y 上)
// 天坛中轴:圜丘(南)→ 皇穹宇/回音壁 → 丹陛桥 → 祈年门 → 祈年殿(北)

export const CFG = {
  skyRadius: 2600,
  fogPlain: 0.0014,
  camera: { near: 0.5, far: 7000, fov: 55 },
  quality: {
    high: { pixelRatioCap: 2, shadowMap: 2048, shadows: true, bloom: true },
    mid: { pixelRatioCap: 1.5, shadowMap: 1024, shadows: true, bloom: true },
    low: { pixelRatioCap: 1, shadowMap: 0, shadows: false, bloom: false },
  },
};

// ---- 布局 ----
export const LAYOUT = {
  qiuyuan: { name: '圜丘坛', en: 'Circular Mound Altar', center: [0, -440], tiers: [{ r: 27.5, h: 1.75 }, { r: 20.5, h: 3.5 }, { r: 14, h: 5.2 }] },
  huangqiongyu: { name: '皇穹宇', en: 'Imperial Vault of Heaven', center: [0, -230], wallR: 32.5, hallR: 9, hallH: 16.5 },
  danbi: { name: '丹陛桥', en: 'Vermilion Steps Bridge', x: 0, z0: -400, z1: -20, w: 14, h: 4.2 }, // 实宽 28m,取视觉版
  qinianmen: { name: '祈年门', en: 'Gate of Prayer', center: [0, -12], w: 34, d: 9 },
  qiniandian: { name: '祈年殿', en: 'Hall of Prayer for Good Harvests', center: [0, 95],
    // 三层汉白玉台基(祈谷坛)
    tiers: [{ r: 45.5, h: 1.85 }, { r: 40.5, h: 3.7 }, { r: 35.5, h: 5.55 }],
    hallR: 15.2, bodyH: 9.5, roofH: 22, roofR0: 20.5 },
};

// 圜丘石板块数(史实:三层各九环,块数皆九的倍数)
export const QIUYUAN_RINGS = {
  upper: { r0: 0.9, r1: 13.6, count: 9 },   // 天心石外 9 环:9…81 块
  middle: { r0: 14.1, r1: 20.0, count: 9 }, // 90…162 块
  lower: { r0: 20.6, r1: 27.0, count: 9 },  // 171…243 块
};

// 地图/漫游:圆台台基区域(径向分层取高)
const ROUND_TIERS = [
  { cx: LAYOUT.qiuyuan.center[0], cz: LAYOUT.qiuyuan.center[1], tiers: LAYOUT.qiuyuan.tiers },
  { cx: LAYOUT.qiniandian.center[0], cz: LAYOUT.qiniandian.center[1], tiers: LAYOUT.qiniandian.tiers },
];

// 丹陛桥坡道区域(南端/北端上桥)
const BRIDGE = LAYOUT.danbi;
const BRIDGE_RAMP = 26; // 桥两端引桥长度

export function inTerrace() { return false; }

export function stairRamps() {
  return [
    { x0: BRIDGE.x - BRIDGE.w / 2, x1: BRIDGE.x + BRIDGE.w / 2, z0: BRIDGE.z0 - BRIDGE_RAMP, z1: BRIDGE.z0, ramp: 'south' },
    { x0: BRIDGE.x - BRIDGE.w / 2, x1: BRIDGE.x + BRIDGE.w / 2, z0: BRIDGE.z1, z1: BRIDGE.z1 + BRIDGE_RAMP, ramp: 'north' },
  ];
}

// 平面高度(自由漫游):圆台径向分层 + 丹陛桥/引桥 + 平地
export function groundHeight(x, z, plainFn) {
  // 圆台(圜丘 / 祈年殿台基)
  for (const t of ROUND_TIERS) {
    const d = Math.hypot(x - t.cx, z - t.cz);
    for (const tier of t.tiers) {
      if (d <= tier.r) return tier.h;
    }
  }
  // 丹陛桥与引桥
  if (Math.abs(x - BRIDGE.x) <= BRIDGE.w / 2) {
    if (z >= BRIDGE.z0 && z <= BRIDGE.z1) return BRIDGE.h;
    const rs = stairRamps();
    for (const r of rs) {
      if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) {
        const k = r.ramp === 'south' ? (z - r.z0) / (r.z1 - r.z0) : (r.z1 - z) / (r.z1 - r.z0);
        return BRIDGE.h * k * k * (3 - 2 * k);
      }
    }
  }
  // 祈年门台基
  const m = LAYOUT.qinianmen;
  if (Math.abs(x - m.center[0]) <= m.w / 2 && Math.abs(z - m.center[1]) <= m.d / 2) return 1.9;
  return plainFn ? plainFn(x, z) : 0;
}

// 时间状态预设(北京园林天光)
export const DAY_STATES = {
  night: {
    az: 200, el: 40, sunColor: 0x8fa7d8, sunIntensity: 0.22,
    hemiSky: 0x2a3555, hemiGround: 0x1a1a22, hemiIntensity: 0.5, amb: 0.12,
    fogColor: 0x0d1220, fogDensity: 0.004,
    top: 0x060a18, horizon: 0x1b2436, sunGlow: 0.12, stars: 1.0, exposure: 1.0,
  },
  dawn: {
    az: 235, el: 13, sunColor: 0xffc89a, sunIntensity: 1.7,
    hemiSky: 0xa8b8d0, hemiGround: 0x6f6552, hemiIntensity: 0.7, amb: 0.26,
    fogColor: 0xe6d8c2, fogDensity: 0.0028,
    top: 0x8aa0c4, horizon: 0xf0dab6, sunGlow: 0.7, stars: 0.05, exposure: 1.04,
  },
  morning: {
    az: 200, el: 34, sunColor: 0xfff0d8, sunIntensity: 2.7,
    hemiSky: 0xbcd0e8, hemiGround: 0x8f8570, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xeee6d4, fogDensity: 0.0016,
    top: 0x88a4d0, horizon: 0xf2e4c8, sunGlow: 0.5, stars: 0.0, exposure: 1.05,
  },
  noon: {
    az: 170, el: 62, sunColor: 0xffffff, sunIntensity: 3.1,
    hemiSky: 0xcfe0f2, hemiGround: 0x9c927c, hemiIntensity: 0.9, amb: 0.34,
    fogColor: 0xeeeae0, fogDensity: 0.0011,
    top: 0x7ca4dc, horizon: 0xe8e2d0, sunGlow: 0.32, stars: 0.0, exposure: 1.02,
  },
  golden: {
    az: 258, el: 22, sunColor: 0xffd9a0, sunIntensity: 2.8,
    hemiSky: 0xc4d2e4, hemiGround: 0x968660, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xf2e2c4, fogDensity: 0.0018,
    top: 0x8fa4cc, horizon: 0xf6d9ac, sunGlow: 0.6, stars: 0.0, exposure: 1.06,
  },
  dusk: {
    az: 292, el: 10, sunColor: 0xffb87a, sunIntensity: 2.2,
    hemiSky: 0xd4a888, hemiGround: 0x7c6048, hemiIntensity: 0.7, amb: 0.26,
    fogColor: 0xeec39c, fogDensity: 0.00038,
    top: 0xa888a8, horizon: 0xffb478, sunGlow: 0.95, stars: 0.0, exposure: 1.14,
  },
};
