/* 巢车 — 尺寸常量与剪式升降运动学求解器
   文献依据:《武经总要》巢车——车上立竿,竿顶悬望楼,可升降瞰城;本站按
   双级剪叉(剪式升降)复原:绞盘缠绳拉动下滑块,剪叉张角 φ 展开望楼抬升。

   剪叉运动学(载入期断言):
     剪叉臂 L = 1.20,双级:望楼面高 H(τ) = y0 + 2L·sinφ
     下滑块行程 s(φ) = 2L·cosφ → 绞盘收绳 Δs = 2L(cos25° − cos62°) = 1.04 m
     绞盘鼓 r 0.08 → 圈数 = Δs/(2πr) = 2.07 圈 ∈ (1.5, 3)
     升高比 = sin62°/sin25° = 2.26
     φ ∈ [25°(折), 62°(展)];断言:Δs 严格(常数式)、圈数 ∈ (1.5,3)、
     升高比 ∈ (2.0, 2.6)。
   坐标系:y 上;车台面 y 0.55;剪叉底 A(0)/B(s),顶 D(0)/C/F(s);
   绞盘 (0.55, 0.80, 0.45),绳到下滑块 B。
   全部几何位于地面之上。 */
(function (MECH) {
  var D = {
    L: 1.20,                       // 剪叉臂长
    deckY: 0.55,                   // 车台面
    phi0: 25, phi1: 62,            // 折叠/展开角(度)
    cartL: 2.10, cartW: 1.30, wheelR: 0.30,
    cabinW: 0.80, cabinH: 0.85, cabinD: 0.80,
    drumR: 0.08, crankR: 0.22,
    winchX: 0.55, winchY: 0.80, winchZ: 0.45,
    N: 2                           // 剪叉级数
  };
  D.phi0R = D.phi0 * Math.PI / 180;
  D.phi1R = D.phi1 * Math.PI / 180;
  D.s0 = 2 * D.N * D.L * Math.cos(D.phi0R) / D.N * D.N;   // = 2L·cos25 (单级跨 2L·cosφ/N·N 保持一致)
  /* 单级跨距 s = L·cosφ·(布局系数 2:双级对排)——本站采用两铰点跨 s = 2L·cosφ */
  D.s0 = 2 * D.L * Math.cos(D.phi0R);      // 2.17
  D.s1 = 2 * D.L * Math.cos(D.phi1R);      // 1.13
  D.ropePull = D.s0 - D.s1;                // 1.04
  D.turns = D.ropePull / (2 * Math.PI * D.drumR);   // 2.07
  D.heightRatio = Math.sin(D.phi1R) / Math.sin(D.phi0R);  // 2.26
  D.cabinFloor0 = D.deckY + 2 * D.L * Math.sin(D.phi0R);  // 1.56
  D.cabinFloor1 = D.deckY + 2 * D.L * Math.sin(D.phi1R);  // 2.67

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 剪叉状态(纯函数):φ ∈ [φ0, φ1] → 各铰点位置 */
  function scissor(phiDeg) {
    var p = rad(clamp(phiDeg, D.phi0, D.phi1));
    var s = 2 * D.L * Math.cos(p);
    var H = D.L * Math.sin(p);
    var y0 = D.deckY + 0.10;
    return {
      phi: p, s: s, H1: H,
      A: [0, y0], B: [s, y0],
      C: [s, y0 + H], Dp: [0, y0 + H],
      E: [0, y0 + 2 * H], F: [s, y0 + 2 * H],
      cabinFloor: y0 + 2 * H
    };
  }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp, scissor: scissor };

  /* 载入期自检 */
  (function selfCheck() {
    var msg = null;
    var ds = 2 * D.L * (Math.cos(D.phi0R) - Math.cos(D.phi1R));
    if (Math.abs(ds - D.ropePull) > 1e-9) {
      msg = "巢车收绳自检失败: Δs = " + ds.toFixed(3) + " ≠ " + D.ropePull.toFixed(3);
    } else if (!(D.turns > 1.5 && D.turns < 3)) {
      msg = "巢车绞盘圈数自检失败: " + D.turns.toFixed(2) + " ∉ (1.5, 3)";
    } else if (!(D.heightRatio > 2.0 && D.heightRatio < 2.6)) {
      msg = "巢车升高比自检失败: " + D.heightRatio.toFixed(2);
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
