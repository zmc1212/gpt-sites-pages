/* 轧棉搅车 — 尺寸常量与双辊外啮合运动学求解器
   文献依据:《天工开物·乃服》「凡棉衣……轧车以二人脚踏,双辊相反回转,
   轧出棉籽」——下辊脚踏同轴驱动,齿轮对(等齿)外啮合反传上辊。

   运动学(载入期断言):
     下辊 r下 = 0.075(轴 y 0.45),上辊 r上 = 0.065(轴 y 0.585),辊隙 0.005
     齿轮对等齿 Z = 16,节圆 r = 0.14,外啮合 → ω上 = −ω下(i = 1,严格)
     踏板曲柄 r踏 = 0.10 → 行程 0.20
     牵引速度 v牵 = ω下·r下 = 0.9 × 0.075 = 0.0675 m/s
     断言:i = 1 严格、辊隙 = 上辊底 − 下辊顶 = 0.005、踏板行程 0.20。
   坐标系:y 上;双辊轴沿 z(辊面 x-y),辊心 x=0;给棉在 +z 侧,皮棉 −z 侧。
   全部几何位于全球地面之上(机架高 0.78)。 */
(function (MECH) {
  var D = {
    rLow: 0.075, yLow: 0.45,       // 下辊
    rUp: 0.065, yUp: 0.585,        // 上辊
    rollerZ0: -0.28, rollerZ1: 0.28,
    gearZ: -0.34, gearR: 0.14, gearZT: 16,   // 齿轮对(等齿)
    rTread: 0.10, treadZ: 0.40,    // 踏板曲柄
    omega: 0.9,                    // 下辊角速度
    baseH: 0.78,
    nipGap: 0.005,
    feedZ: 0.22, lintZ: -0.22,     // 给棉/皮棉侧
    cottonY: 0.52,                 // 棉团悬于辊隙前
    seedN: 6
  };
  D.i = 1;                          // 等齿外啮合,传动比 1(反向)
  D.nipY = D.yLow + D.rLow;         // 0.525 下辊顶
  D.strokeTread = 2 * D.rTread;     // 0.20
  D.vDraw = D.omega * D.rLow;       // 0.0675 牵引速度

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp };

  /* 载入期自检 */
  (function selfCheck() {
    var msg = null;
    if (Math.abs(D.i - 1) > 1e-12) {
      msg = "轧棉搅车传动比自检失败: i = " + D.i + " ≠ 1(等齿外啮合)";
    } else if (Math.abs((D.yUp - D.rUp) - (D.yLow + D.rLow) - D.nipGap) > 1e-9) {
      msg = "轧棉搅车辊隙自检失败: 辊隙 ≠ " + D.nipGap;
    } else if (Math.abs(D.strokeTread - 0.20) > 1e-9) {
      msg = "轧棉搅车踏板行程自检失败: 2r踏 = " + D.strokeTread + " ≠ 0.20";
    } else if (!(D.vDraw > 0.05 && D.vDraw < 0.10)) {
      msg = "轧棉搅车牵引速度自检失败: v = " + D.vDraw;
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
