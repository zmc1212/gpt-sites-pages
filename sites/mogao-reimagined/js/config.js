// 全局配置与场景布局(单位:米;+X 东,+Z 北,+Y 上)
// 莫高窟巡礼:大漠(东)→ 崖面(西壁)→ 九层楼(北端)→ 大佛窟 → 壁画窟 → 藏经洞(南端)→ 鸣沙 → 心灯

export const CFG = {
  skyRadius: 3000,
  fogPlain: 0.0009,
  camera: { near: 0.5, far: 7000, fov: 55 },
  quality: {
    high: { pixelRatioCap: 2, shadowMap: 2048, shadows: true, bloom: true },
    mid: { pixelRatioCap: 1.5, shadowMap: 1024, shadows: true, bloom: true },
    low: { pixelRatioCap: 1, shadowMap: 0, shadows: false, bloom: false },
  },
};

// ---- 崖面与洞窟 ----
// 崖壁:西壁在 x=0,面向东(+X);崖体 x -64..0,z -420..320,高 84
export const LAYOUT = {
  cliff: { x0: -64, x1: 0, z0: -420, z1: 320, h: 84 },
  // 一层栈道(主要巡礼层,标高 8)
  walkway1: { x0: -2.6, x1: 3.4, z0: -400, z1: 300, y: 8 },
  stair: { x: 1.5, z0: -352, z1: -318, w: 7 }, // 登崖磴道(南段)
  // 二层栈道(仅视觉,标高 26)
  walkway2: { x0: -2.2, x1: 2.6, z0: -260, z1: 120, y: 26 },
  // 特色窟(真实房间,位于一层)
  caves: {
    buddha: { name: '九层楼大佛窟', x: -30, z: 150, w: 26, d: 34, h: 30 },   // 窟96 意象
    mural: { name: '壁画窟', x: -24, z: -60, w: 18, d: 22, h: 13 },          // 覆斗顶经变窟
    sutra: { name: '藏经洞', x: -14, z: -310, w: 8, d: 10, h: 7 },           // 窟17 意象
  },
  jiuceng: { name: '九层楼', x: -13, z: 150, tiers: 9, w0: 30, hEach: 6.2 },
  dunes: { seedLine: 80 },
};

// 沙丘高度(东/南大漠:垄脊噪声)
export function duneHeight(x, z) {
  const ridge = Math.sin(x * 0.008 + Math.sin(z * 0.0043 + 2.4) * 2.2 + 1.1);
  const ridge2 = Math.sin((x + z * 0.36) * 0.016 + 4.0);
  let h = 6 + ridge * 14 * Math.max(0, Math.min(1, (x - 40) / 220))
        + ridge2 * 5 * Math.max(0, Math.min(1, (x + z * 0.2 - 30) / 200))
        + Math.sin(x * 0.045 + z * 0.031) * 1.2;
  // 崖前压平(巡礼广场)
  const flat = Math.min(1, Math.max(0, (Math.abs(x) - 26) / 90));
  h *= flat;
  // 崖体内为崖面(独立几何),地形抬平
  if (x < 0) h = 0;
  return h;
}

// 漫游平面高度:沙丘 / 一层栈道 / 磴道
export function groundHeight(x, z, plainFn) {
  // 磴道(0 → 8)
  const S = LAYOUT.stair;
  if (x > S.x - S.w / 2 && x < S.x + S.w / 2 && z > S.z0 && z < S.z1) {
    const k = (z - S.z0) / (S.z1 - S.z0);
    return 0.4 + (LAYOUT.walkway1.y - 0.4) * k * k * (3 - 2 * k);
  }
  // 一层栈道带
  const W = LAYOUT.walkway1;
  if (x >= W.x0 && x <= W.x1 && z >= W.z0 && z <= W.z1) return W.y;
  // 大佛窟室内(窟底)
  const C = LAYOUT.caves.buddha;
  if (x > C.x - C.w / 2 && x < C.x + C.w / 2 && z > C.z - C.d / 2 && z < C.z + C.d / 2) return W.y;
  // 壁画窟 / 藏经洞室内
  const M = LAYOUT.caves.mural;
  if (x > M.x - M.w / 2 && x < M.x + M.w / 2 && z > M.z - M.d / 2 && z < M.z + M.d / 2) return W.y;
  const U = LAYOUT.caves.sutra;
  if (x > U.x - U.w / 2 && x < U.x + U.w / 2 && z > U.z - U.d / 2 && z < U.z + U.d / 2) return W.y;
  return duneHeight(x, z);
}

// 时间状态预设(大漠天光:晨昏浓烈;终章星河重返)
export const DAY_STATES = {
  night: {
    az: 200, el: 40, sunColor: 0x8fa7d8, sunIntensity: 0.2,
    hemiSky: 0x2a3455, hemiGround: 0x1c1a24, hemiIntensity: 0.5, amb: 0.12,
    fogColor: 0x0c1220, fogDensity: 0.0028,
    top: 0x050a16, horizon: 0x182236, sunGlow: 0.1, stars: 1.0, exposure: 1.02,
  },
  dawn: {
    az: 235, el: 10, sunColor: 0xffb88a, sunIntensity: 1.8,
    hemiSky: 0xb0a8bc, hemiGround: 0x8a6a4c, hemiIntensity: 0.75, amb: 0.28,
    fogColor: 0xecc8a8, fogDensity: 0.0014,
    top: 0x8a88b8, horizon: 0xffc890, sunGlow: 0.85, stars: 0.12, exposure: 1.08,
  },
  morning: {
    az: 200, el: 32, sunColor: 0xfff2dc, sunIntensity: 2.8,
    hemiSky: 0xc8d6e6, hemiGround: 0xb09068, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xf4e6d0, fogDensity: 0.0008,
    top: 0x88a4d4, horizon: 0xf6e4c4, sunGlow: 0.5, stars: 0.0, exposure: 1.05,
  },
  noon: {
    az: 170, el: 62, sunColor: 0xffffff, sunIntensity: 3.2,
    hemiSky: 0xd6e4f0, hemiGround: 0xc0a278, hemiIntensity: 0.9, amb: 0.34,
    fogColor: 0xf6eede, fogDensity: 0.0006,
    top: 0x7ca6dc, horizon: 0xefe2c6, sunGlow: 0.3, stars: 0.0, exposure: 1.02,
  },
  golden: {
    az: 258, el: 20, sunColor: 0xffd29a, sunIntensity: 2.9,
    hemiSky: 0xccd4e2, hemiGround: 0xa89068, hemiIntensity: 0.85, amb: 0.3,
    fogColor: 0xf6e0c0, fogDensity: 0.0009,
    top: 0x90a2cc, horizon: 0xfadca8, sunGlow: 0.6, stars: 0.0, exposure: 1.06,
  },
  ember: {
    az: 292, el: 9, sunColor: 0xe89868, sunIntensity: 2.1,
    hemiSky: 0xb09090, hemiGround: 0x7c5c48, hemiIntensity: 0.68, amb: 0.25,
    fogColor: 0xe4b088, fogDensity: 0.0013,
    top: 0x6a6490, horizon: 0xf8a868, sunGlow: 0.9, stars: 0.15, exposure: 1.12,
  },
};
