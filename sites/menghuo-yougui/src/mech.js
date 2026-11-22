/* 猛火油柜 — 尺寸常量与双活塞增压运动学求解器
   文献依据:《武经总要》猛火油柜——铜油柜 + 双筒唧杆(推拉交替吸排)+
   火楼(内置火药引燃),喷油成流焚烧。

   双活塞运动学(载入期断言):
     活塞 r活 = 0.045,行程 x = 0.22(双杆推拉反相)
     单程排量 V = π·r活²·x ≈ 1.40 L
     面积比增压 k = (r活/r喷)² = (0.045/0.012)² = 14.06(严格)
     活塞速 v活 = 0.22 m/s(摇杆周期 1.0s)→ 喷速 v_jet = k·v活 = 3.09 m/s
     断言:k 严格(14.06 ± 1e-9)、v_jet ∈ (2.5, 4)、杆程 0.22 严格。
   坐标系:y 上,x 射向(+x);柜在 (−0.45, 0.55),双筒沿 x,
   火楼在 (0.55, 0.98)。全部几何位于地面之上。 */
(function (MECH) {
  var D = {
    rPiston: 0.045, stroke: 0.22,
    rNozzle: 0.012,
    cycleT: 1.0,                    // 摇杆周期 s
    tankX: -0.45, tankY: 0.42, tankR: 0.24,
    cylY: 0.86, cylX0: -0.15, cylX1: 0.10,
    towerX: 0.55, towerY: 0.98,
    tankOil0: 0.72                  // 油柜满油面
  };
  D.kBoost = Math.pow(D.rPiston / D.rNozzle, 2);   // 14.06(严格)
  D.vPiston = D.stroke / D.cycleT;                 // 0.22 m/s
  D.vJet = D.kBoost * D.vPiston;                   // 3.09 m/s
  D.Vstroke = Math.PI * D.rPiston * D.rPiston * D.stroke;  // 1.40 L

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 活塞相位(纯函数):ψ ∈ [0, 2π),杆位 = ±(stroke/2)·sin ψ */
  function rodPhase(t) { return 2 * Math.PI * (t / D.cycleT); }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp, rodPhase: rodPhase };

  /* 载入期自检 */
  (function selfCheck() {
    var msg = null;
    if (Math.abs(D.kBoost - 14.0625) > 1e-9) {
      msg = "猛火油柜增压比自检失败: k = " + D.kBoost + " ≠ 14.0625";
    } else if (!(D.vJet > 2.5 && D.vJet < 4)) {
      msg = "猛火油柜喷速自检失败: v_jet = " + D.vJet.toFixed(2) + " ∉ (2.5, 4)";
    } else if (Math.abs(D.stroke - 0.22) > 1e-9) {
      msg = "猛火油柜杆程自检失败: 0.22 ≠ " + D.stroke;
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
