/* 三弓床弩 — 尺寸常量与叠张-击发运动学求解器
   文献依据:《武经总要》三弓床弩(三弓八牛弩)——前二弓正向、后一弓反向,
   三弓张力叠加;绞车张弦,大牙锁弦,击发射「一枪三剑箭」。

   叠张与弹道(载入期断言):
     三弓叠张 F = 3·F0 = 3 × 200 = 600 kgf(串联弓力叠加)
     绞车省力 MA = r柄/r鼓 = 0.30/0.09 = 3.33(严格)
     张弦行程 x = 0.90 m;弦储能 E = ½·F·x(F 取 N:F_N = 600×9.8)
     弹速 v = √(2E/m箭) = √(2×2646/1.5) = 59.4 m/s ∈ (50, 70)
     断言:MA 严格、E 严格、v ∈ (50,70)、三弓 F = 3F0 严格。
   坐标系:y 上,x 射向(+x);弩床沿 x,前双弓 x −0.55,反弓 x +0.45,
   大牙初始 x +0.15(弦位随张弦 −0.90)。全部几何在地面之上(床面 0.52)。 */
(function (MECH) {
  var D = {
    F0: 200,                        // 单弓张力 kgf
    bowN: 3,
    rCrank: 0.30, rDrum: 0.09,
    drawMax: 0.90,
    mBolt: 1.5,                     // 一枪三剑箭 kg
    bedY: 0.52,
    bowFrontX: -0.55, bowBackX: 0.45,
    catchX0: 0.15,                  // 大牙初位(弦位 = catchX)
    boltL: 1.05,
    g: 9.8
  };
  D.F = D.bowN * D.F0;              // 600 kgf
  D.MA = D.rCrank / D.rDrum;        // 3.33(严格)
  D.FN = D.F * D.g;                 // 5880 N
  D.energy = 0.5 * D.FN * D.drawMax; // 2646 J
  D.v0 = Math.sqrt(2 * D.energy / D.mBolt);  // 59.4 m/s

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 弦位(纯函数):draw ∈ [0, 0.9] → 弦钩 x = catchX0 − draw */
  function nockX(draw) { return D.catchX0 - draw; }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp, nockX: nockX };

  /* 载入期自检 */
  (function selfCheck() {
    var msg = null;
    if (Math.abs(D.F - 600) > 1e-9) {
      msg = "三弓床弩叠张自检失败: F = " + D.F + " ≠ 600";
    } else if (Math.abs(D.MA - 10 / 3) > 1e-9) {
      msg = "三弓床弩省力比自检失败: MA = " + D.MA + " ≠ 3.33";
    } else if (!(D.v0 > 50 && D.v0 < 70)) {
      msg = "三弓床弩弹速自检失败: v = " + D.v0.toFixed(1) + " ∉ (50, 70)";
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
