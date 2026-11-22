/* 水转大纺车 — 尺寸常量与增速运动学求解器
   文献依据:王祯《农书》水转大纺车:「水轮……大绳轮……弦……诸锭自随」
   —— 水轮驱动大绳轮,传动弦绕过诸锭盘,一转十四,八锭同向高速纺纱。

   增速运动学(载入期断言):
     大绳轮半径 R大 = 0.448,锭盘半径 r锭 = 0.032 → i = 14.0(严格)
     水轮 ω = 0.5 rad/s → 锭速 ω锭 = i·ω = 7.0 rad/s = 1.11 转/s
     断言 |i − 14| < 1e-9;ω锭 = 7.0;下轮浸水 0.08m 不触渠底。
   坐标系:y 上;水轮与大绳轮同轴(z 轴,盘面 x-y),绳轮在 z=+0.4 侧;
   传动弦在同一 x-y 平面(z=0.4)内绕大绳轮与诸锭盘下缘,同向传动。
   渠:底 0.06(不透明)水面 0.18;水轮缘底 0.10,浸深 0.08。 */
(function (MECH) {
  var D = {
    /* 水轮与大绳轮 */
    RWheel: 1.30, wheelY: 1.40, NP: 12,        // 水轮半径/轴高/桨数
    RBig: 0.448, rSpindle: 0.032,              // 大绳轮/锭盘半径 → i = 14
    omega: 0.5,                                 // 水轮角速度 rad/s
    axleZ: 0.4, wheelZ: 0.0,                    // 绳轮/水轮 z 位
    /* 渠 */
    chX0: -1.05, chX1: 1.05, chZ: 2.3, waterY: 0.18, chFloor: 0.06, bankTop: 0.30,
    /* 锭排(沿 x) */
    NS: 8, spX0: 1.30, spDX: 0.32, spY: 0.28,  // 锭盘心
    frameX0: 1.05, frameX1: 4.10,
    /* 纱架 */
    railY: 1.18, railZ: -0.52,
    shaftLen: 0.62
  };
  D.i = D.RBig / D.rSpindle;                    // 14.0 严格
  D.omegaSp = D.i * D.omega;                    // 7.0 rad/s
  D.spX = [];
  for (var i = 0; i < D.NS; i++) D.spX.push(D.spX0 + i * D.spDX);
  D.wheelBottom = D.wheelY - D.RWheel;          // 0.10

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 传动弦路径(平面 z=axleZ,开式弦:大绳轮下缘切线 → 诸锭盘下缘直列 → 绕末锭 → 松弛回程过大绳轮上缘) */
  function cordPoints() {
    var pts = [];
    var yLo = D.spY - D.rSpindle, yHi = D.spY + D.rSpindle;
    var x1 = D.spX[0], xN = D.spX[D.NS - 1];
    /* 大绳轮下缘西切点起,沿下缘到东切点 */
    for (var a = -90; a <= 90; a += 15) {
      var t = a * Math.PI / 180;
      pts.push([D.RBig * Math.cos(t), D.wheelY + D.RBig * Math.sin(t)]);
    }
    /* 直列过诸锭盘下缘 */
    for (var s = 0; s <= 24; s++) {
      pts.push([x1 + (xN - x1) * s / 24, yLo]);
    }
    /* 绕末锭盘半圈 */
    for (var b = -90; b <= 90; b += 15) {
      var t2 = b * Math.PI / 180;
      pts.push([xN + D.rSpindle * Math.cos(t2), D.spY + D.rSpindle * Math.sin(t2)]);
    }
    /* 松弛回程:末锭上缘 → 大绳轮上缘(不触锭) */
    pts.push([xN, yHi + 0.05]);
    pts.push([(x1 + xN) / 2, D.wheelY + D.RBig + 0.10]);
    pts.push([0, D.wheelY + D.RBig]);
    return pts;
  }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp, cordPoints: cordPoints };

  /* 载入期自检:增速比、锭速、浸水几何 */
  (function selfCheck() {
    var msg = null;
    if (Math.abs(D.i - 14) > 1e-9) {
      msg = "水转大纺车增速比自检失败: R大/r锭 = " + D.i + " ≠ 14";
    } else if (Math.abs(D.omegaSp - 7.0) > 1e-9) {
      msg = "水转大纺车锭速自检失败: ω锭 = " + D.omegaSp + " ≠ 7.0";
    }
    if (!msg) {
      if (D.wheelBottom >= D.waterY) msg = "水转大纺车浸水自检失败: 轮缘底 " + D.wheelBottom + " 未入水 " + D.waterY;
      else if (D.wheelBottom <= D.chFloor + 0.02) msg = "水转大纺车浸水自检失败: 轮缘触渠底 " + D.wheelBottom;
    }
    if (!msg) {
      /* 弦回程上缘必须高于锭盘顶(不擦锭) */
      if (D.wheelY + D.RBig + 0.05 < D.spY + D.rSpindle) msg = "水转大纺车弦路自检失败: 回程擦锭";
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
