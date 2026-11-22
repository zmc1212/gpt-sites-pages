// 全局配置与场景布局(单位:米;+X 东,+Z 北,+Y 上)
// 悬空寺巡礼:金龙峡谷底 → 仰观 → 栈道 → 悬梁 → 三教殿 → 凭栏 → 恒山暮色 → 危楼

export const CFG = {
  skyRadius: 2800,
  fogPlain: 0.0012,
  camera: { near: 0.5, far: 6500, fov: 55 },
  quality: {
    high: { pixelRatioCap: 2, shadowMap: 2048, shadows: true, bloom: true },
    mid: { pixelRatioCap: 1.5, shadowMap: 1024, shadows: true, bloom: true },
    low: { pixelRatioCap: 1, shadowMap: 0, shadows: false, bloom: false },
  },
};

// ---- 布局 ----
// 崖壁:西壁在 x=0(面向东 +X),z -160..160,崖顶高 120
export const LAYOUT = {
  cliff: { x0: -90, x1: 0, z0: -160, z1: 160, h: 120 },
  // 一层栈道(标高 12)与二层(标高 26)
  walkway1: { x0: -2.4, x1: 2.6, z0: -48, z1: 46, y: 12 },
  walkway2: { x0: -2.2, x1: 2.4, z0: -22, z1: 44, y: 26 },
  stair: { x: 0, z0: -62, z1: -50, w: 5 }, // 峡底石阶(0 → 12)
  halls: {
    luohan: { name: '罗汉殿', x: -7, z: -14, w: 9, d: 7, h: 3.4, y: 12 },
    sanjiao: { name: '三教殿', x: -6, z: 38, w: 10, d: 8, h: 3.6, y: 26 },
    qiaolou: { name: '长线桥楼', x: -6, z: 14, w: 8, d: 6, h: 3.2, y: 26 },
  },
};

// 峡谷地形(V 形谷:西侧崖壁陡起,东侧缓坡,谷底溪流)
export function gorgeHeight(x, z) {
  const valley = Math.exp(-(((x - 30) / 42) ** 2));          // 谷底带(中心 x≈30)
  const west = Math.max(0, (-x - 4)) * 1.15;               // 崖壁(x<0 陡升)
  const east = Math.max(0, (x - 78)) * 0.5;                // 东坡缓升
  const n = (Math.sin(x * 0.02 + 1.7) + Math.cos(z * 0.023 + 4.1)) * 1.1
          + Math.sin(x * 0.05 + z * 0.04) * 0.6;
  let h = 3 + n * valley + west + east;
  // 谷底溪床微沉
  const stream = Math.exp(-(((x - 26) / 5.5) ** 2));
  h -= stream * 1.6;
  // 栈道带下不允许地形隆起(栈道悬挂在崖面)
  return h;
}

// 漫游平面高度:谷底 / 石阶 / 一二层栈道
export function groundHeight(x, z, plainFn) {
  const S = LAYOUT.stair;
  if (x > S.x - S.w / 2 && x < S.x + S.w / 2 && z > S.z0 && z < S.z1) {
    const k = (S.z1 - z) / (S.z1 - S.z0); // 南端入,向北升
    return gorgeHeight(x, z) + (LAYOUT.walkway1.y - gorgeHeight(x, z)) * k * k * (3 - 2 * k);
  }
  const W = LAYOUT.walkway1;
  if (x >= W.x0 && x <= W.x1 && z >= W.z0 && z <= W.z1) return W.y;
  const W2 = LAYOUT.walkway2;
  if (x >= W2.x0 && x <= W2.x1 && z >= W2.z0 && z <= W2.z1) return W2.y;
  return gorgeHeight(x, z);
}

// 时间状态预设(峡谷天光:崖壁阴影浓,晨昏金红)
export const DAY_STATES = {
  night: {
    az: 200, el: 40, sunColor: 0x8fa7d8, sunIntensity: 0.22,
    hemiSky: 0x2a3855, hemiGround: 0x1a2018, hemiIntensity: 0.5, amb: 0.12,
    fogColor: 0x0d1418, fogDensity: 0.0028,
    top: 0x050b16, horizon: 0x16222e, sunGlow: 0.12, stars: 1.0, exposure: 1.0,
  },
  dawn: {
    az: 100, el: 12, sunColor: 0xffc29a, sunIntensity: 1.7,
    hemiSky: 0xa4b0c0, hemiGround: 0x4c5244, hemiIntensity: 0.72, amb: 0.26,
    fogColor: 0xe4d4bc, fogDensity: 0.0019,
    top: 0x8698b8, horizon: 0xf4d6aa, sunGlow: 0.75, stars: 0.05, exposure: 1.06,
  },
  morning: {
    az: 112, el: 30, sunColor: 0xfff2dc, sunIntensity: 2.6,
    hemiSky: 0xb8cce0, hemiGround: 0x5e6852, hemiIntensity: 0.82, amb: 0.3,
    fogColor: 0xeee6d2, fogDensity: 0.0011,
    top: 0x88a4cc, horizon: 0xf2e4c4, sunGlow: 0.5, stars: 0.0, exposure: 1.05,
  },
  noon: {
    az: 96, el: 58, sunColor: 0xffffff, sunIntensity: 3.0,
    hemiSky: 0xcce0ec, hemiGround: 0x66704e, hemiIntensity: 0.88, amb: 0.34,
    fogColor: 0xf0ecdc, fogDensity: 0.0008,
    top: 0x7ca4d8, horizon: 0xe8e2cc, sunGlow: 0.3, stars: 0.0, exposure: 1.02,
  },
  golden: {
    az: 140, el: 18, sunColor: 0xffd49c, sunIntensity: 2.8,
    hemiSky: 0xc2d0de, hemiGround: 0x6e6c4e, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xf4e0be, fogDensity: 0.0011,
    top: 0x8ea2c8, horizon: 0xf8daa6, sunGlow: 0.65, stars: 0.0, exposure: 1.06,
  },
  ember: {
    az: 235, el: 10, sunColor: 0xe89866, sunIntensity: 2.4,
    hemiSky: 0x9c8484, hemiGround: 0x463c34, hemiIntensity: 0.6, amb: 0.23,
    fogColor: 0xc89468, fogDensity: 0.0013,
    top: 0x62608a, horizon: 0xf09c5e, sunGlow: 0.9, stars: 0.12, exposure: 1.12,
  },
};
