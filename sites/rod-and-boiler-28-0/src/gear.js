/* 连杆机构运动学(数学核心):
   曲拐销 (r·cos(θ+φ), r·sin(θ+φ)),φ 左=0 右=90°;
   十字头位移 = r·cos(θ+φ) + √(L² − r²sin²(θ+φ)) − L(水平缸滑块-曲柄公式);
   偏心杆/半径杆/结合杠杆用两圆交点精确求解(简化 Walschaerts,偏心 90° 超前)。 */
(function (ST28) {
  var PI = Math.PI;

  var D = {
    R: 0.62,            // 动轮半径
    r: 0.24,            // 曲拐销回转半径
    L: 1.62,            // 主连杆长度(轴距心到十字头)
    fdX: -3.4,          // 前动轮轴心 X(机车前端朝 -X)
    rdX: 0.50,          // 末位动轮轴心 X
    yA: 0.78,           // 动轮轴心高度(轨顶 0.16 + R)
    spacing: 1.30,      // 动轮轴距
    re: 0.28,           // 偏心曲拐销半径(超前主销 90°)
    lead: PI / 2,
    Hx: -4.10, Hy: 1.00, // 膨胀链接点(回动悬挂轴)
    Rl: 0.34,            // 链接摆动半径
    Le: 0.75,            // 偏心杆长度
    LToff: 0.12,         // 链接上眼到铰点距离
    uDx: 0.10, Uy: 0.95, // 结合杠杆铰点(经结合杆随十字头移动)
    b: 0.28,             // 半径杆眼到铰点距离
    Lr: 0.83,            // 半径杆长度
    d2: 0.44,            // 阀杆眼到铰点距离
    valveCx: -5.24, valveCy: 1.18, // 汽室后盖进杆点
    phiA: 0, phiB: PI / 2,         // 左侧(A,镜头侧 +Z)=0,右侧(B)=90°
    zGear: 0.72, zRod: 0.78, zCoup: 0.82,
    cylX: -5.45, cylRear: -5.10,
    pilotX: -4.90, pilotR: 0.26
  };

  /* 滑块-曲柄:轴心到十字头距离 = r·cosψ + √(L² − r²sin²ψ) */
  function pistonD(psi) {
    var s = Math.sin(psi);
    return D.r * Math.cos(psi) + Math.sqrt(D.L * D.L - D.r * D.r * s * s);
  }

  /* 两圆交点(clamp 保底不 NaN);pickUp=true 取 y 较大的解 */
  function circle2(x1, y1, r1, x2, y2, r2, pickUp) {
    var dx = x2 - x1, dy = y2 - y1;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d < 1e-6) d = 1e-6;
    var dCl = Math.max(Math.abs(r1 - r2), Math.min(r1 + r2, d));
    var a = (r1 * r1 - r2 * r2 + dCl * dCl) / (2 * dCl);
    var h2 = r1 * r1 - a * a;
    var h = Math.sqrt(Math.max(0, h2));
    var mx = x1 + a * dx / d, my = y1 + a * dy / d;
    var p1x = mx + h * dy / d, p1y = my - h * dx / d;
    var p2x = mx - h * dy / d, p2y = my + h * dx / d;
    if (pickUp) {
      return p1y >= p2y ? { x: p1x, y: p1y } : { x: p2x, y: p2y };
    }
    return p1y <= p2y ? { x: p1x, y: p1y } : { x: p2x, y: p2y };
  }

  /* 单侧求解。angle = θ + φ 为曲拐销世界角(从 +X 逆时针,φ 左=0 右=90°):
     销位置 (fdX + r·cos, yA + r·sin);机车前端朝 -X,滑块精确闭合为
     xc = fdX + r·cos(angle) − √(L² − r²sin²(angle)),恒有 |pin→xc| = L。
     规范公式中的 ψ 从汽缸方向量起(ψ = π − angle),位移 = r·cosψ + √(L²−r²sin²ψ) − L。 */
  function solveSide(theta, phi) {
    var angle = theta + phi;
    var c = Math.cos(angle), s = Math.sin(angle);
    var q = Math.sqrt(D.L * D.L - D.r * D.r * s * s);
    var pinX = D.fdX + D.r * c;
    var pinY = D.yA + D.r * s;
    var xc = D.fdX + D.r * c - q;
    var ea = angle + D.lead;                              // 偏心销(世界角超前 90°)
    var rcX = D.fdX + D.re * Math.cos(ea);
    var rcY = D.yA + D.re * Math.sin(ea);
    var lb = circle2(rcX, rcY, D.Le, D.Hx, D.Hy, D.Rl, false); // 链接下眼(取低解)
    var nx = (lb.x - D.Hx) / D.Rl, ny = (lb.y - D.Hy) / D.Rl;
    var ltX = D.Hx - nx * D.LToff, ltY = D.Hy - ny * D.LToff;  // 链接上眼
    var ux = xc + D.uDx, uy = D.Uy;                       // 结合杠杆铰点
    var bp = circle2(ux, uy, D.b, ltX, ltY, D.Lr, true);  // 半径杆眼(取高解)
    var dx = bp.x - ux, dy = bp.y - uy;
    var m = Math.sqrt(dx * dx + dy * dy) || 1e-6;
    var vx = ux + dx / m * D.d2, vy = uy + dy / m * D.d2; // 阀杆眼(杠杆顶)
    return {
      psi: angle, xc: xc,
      pinX: pinX, pinY: pinY,
      rcX: rcX, rcY: rcY,
      lbX: lb.x, lbY: lb.y,
      ltX: ltX, ltY: ltY,
      ux: ux, uy: uy,
      bx: bp.x, by: bp.y,
      vx: vx, vy: vy
    };
  }

  function solve(theta) {
    return { A: solveSide(theta, D.phiA), B: solveSide(theta, D.phiB) };
  }

  ST28.GEAR = { D: D, pistonD: pistonD, solve: solve };
})(window.ST28 = window.ST28 || {});
