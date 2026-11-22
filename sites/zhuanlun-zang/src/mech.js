/* 转轮藏 — 尺寸常量与枢针-惯转运动学求解器
   文献依据:宋·正定隆兴寺转轮藏殿(现存中国最古转轮藏)——八棱书藏立于
   殿心,下承铁承座枢针(藏针),上梁悬桩限位;一人推之,速若风驰,久转不息。

   惯转运动学(载入期断言):
     摩擦衰减 k = 0.08 s⁻¹:ω(t) = ω0·e^{−k·t}(纯函数)
     推后惯转角 Δψ = (ω0/k)(1 − e^{−k·30}) = 15 × 0.909 ≈ 13.6 rad(> 2 圈)
     断言:k = 0.08 严格、惯转角 ∈ (10, 16)、八棱每棱 45° 严格。
   坐标系:y 上;藏柜八棱柱(对径 2.6,高 2.6)绕中心竖轴(轴 y)旋转;
   枢针在下 (0, 0.18),上梁悬桩 (0, 3.10)。全部几何在地面之上。 */
(function (MECH) {
  var D = {
    RCase: 1.30,              // 八棱对径 2.6(外接圆半径 1.30)
    caseY0: 0.42, caseY1: 2.70,
    needleY: 0.18, needleR: 0.02,
    beamY: 3.10,
    k: 0.08,                  // 摩擦衰减系数 s⁻¹
    omega0: 1.2,              // 推后初角速 rad/s
    coastT: 30,               // 惯转考察时长
    NS: 8,                    // 八棱
    shelfRows: 3, boxesPer: 4
  };
  D.coastAngle = (D.omega0 / D.k) * (1 - Math.exp(-D.k * D.coastT));   // ≈13.6
  D.sideAngle = 2 * Math.PI / D.NS;                                     // 45°

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 衰减转角(纯函数):自推后 τ 起,ψ(τ) = (ω0/k)(1 − e^{−k·τ}) */
  function coastPsi(tau) {
    return tau <= 0 ? 0 : (D.omega0 / D.k) * (1 - Math.exp(-D.k * tau));
  }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp, coastPsi: coastPsi };

  /* 载入期自检 */
  (function selfCheck() {
    var msg = null;
    if (Math.abs(D.k - 0.08) > 1e-12) {
      msg = "转轮藏衰减系数自检失败: k ≠ 0.08";
    } else if (!(D.coastAngle > 10 && D.coastAngle < 16)) {
      msg = "转轮藏惯转角自检失败: " + D.coastAngle.toFixed(2) + " ∉ (10, 16)";
    } else if (Math.abs(D.sideAngle - Math.PI / 4) > 1e-12) {
      msg = "转轮藏八棱自检失败: 每棱 ≠ 45°";
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
