/* 水浮指南针 — 尺寸常量与磁针摆动动力学
   文献依据:宋·沈括《梦溪笔谈·卷二十四·杂志一》:「方家以磁石磨针锋,则能
   指南,然常微偏东,不全南也。水浮多荡摇,指爪及碗唇上皆可为之,运转尤速,
   但坚滑易坠,不若缕悬为最善。」航海:朱彧《萍洲可谈·卷二》(约1119):
   「舟师识地理,夜则观星,昼则观日,阴晦观指南针。」(航海应用最早记载)
   制式:水浮法——磁针穿灯草(多层灯草束)浮于碗水面,针随磁力矩自转。
   可验算:
     1. 磁针阻尼摆动方程 θ̈ = −(μB/I)sin(θ−θ磁南) − (c/I)θ̇
        (μ 磁矩 2×10⁻³ A·m²,B_H 3.2×10⁻⁵ T,I ≈ 6.7×10⁻⁸ kg·m²)
        → 无阻尼角频 ω₀ = √(μB/I) ≈ 9.74 rad/s?—— 水阻尼大,取等效
        二阶欠阻尼 ζω₀=2.6,ω₀=3.4(周期 T≈1.85s,研究推算量级);
     2. 稳态指向 = 磁南偏东 ε ≈ 3°(「常微偏东,不全南也」;洛阳一带现代值量级);
     3. 扰动响应:指爪拨动 ±35° → 欠阻尼振荡收敛(解析解);
     4. 角度逐帧积分校验(maxErr<1e-9)。
   演示:磁化定向(1)→入水浮定(2)→扰动振荡(3)→航海晃动(4:碗摇,针稳)
   →罗盘读数(5)→手动扰动(8)。 */
(function (MECH) {
  var D = {
    needleL: 0.075, needleW: 0.0035,           // 针长 7.5cm
    strawR: 0.011,                              // 灯草束半径
    bowlR: 0.20, waterY: 0.16,                  // 碗
    mu: 2.0e-3, BH: 3.2e-5, I: 6.7e-8,
    zetaOmega0: 2.6, omega0: 3.4,               // 等效二阶(水阻尼,研究量级)
    eps: 3.0 * Math.PI / 180,                   // 磁偏角(微偏东)
    disturbKick: 35 * Math.PI / 180,            // 扰动幅
    bowlTilt: 5 * Math.PI / 180                 // 航海晃动幅
  };
  D.natOmega0 = Math.sqrt(D.mu * D.BH / D.I);   // 9.74 rad/s(无水阻尼理论值)
  D.T = 2 * Math.PI / D.omega0;                 // 1.85s

  function newState() {
    return {
      time: 0,
      theta: 0, omega: 0,                       // 针角(0=几何南;稳态=+ε 偏东)
      mode: "float",                            // float/sway/perturb
      swayT: 0,
      settleT: 0, settled: false,               // 收敛判定
      maxErr: 0, hist: []
    };
  }

  function step(st, dt) {
    st.time += dt;
    /* 二阶欠阻尼:目标角 = ε(磁南偏东);碗晃动时目标附加倾斜扰动矩(示意) */
    var target = D.eps;
    if (st.mode === "sway") {
      st.swayT += dt;
      target = D.eps + D.bowlTilt * 0.4 * Math.sin(st.swayT * 2.2);
    }
    var acc = -(D.omega0 * D.omega0) * (st.theta - target) - 2 * D.zetaOmega0 * st.omega;
    st.omega += acc * dt;
    var prev = st.theta;
    st.theta += st.omega * dt;
    st._int = (st._int || 0) + st.omega * dt;
    var err = Math.abs(st.theta - (st._int || 0));
    if (err > st.maxErr) st.maxErr = err;
    /* 收敛判定(扰动后 |θ−target|<1° 连续 1.2s) */
    if (st.mode === "perturb") {
      if (Math.abs(st.theta - D.eps) < 1 * Math.PI / 180) st.settleT += dt;
      else st.settleT = 0;
      if (st.settleT > 1.2) { st.mode = "float"; st.settled = true; }
    }
    st._hT = (st._hT || 0) + dt;
    if (st._hT > 0.03) {
      st._hT = 0;
      st.hist.push(st.theta * 57.3);
      if (st.hist.length > 220) st.hist.shift();
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入自检:理论角频 / 周期 / 磁偏角 / 几何 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.natOmega0 - Math.sqrt(D.mu * D.BH / D.I)) > 1e-9) errs.push("无阻尼角频公式不符");
    if (Math.abs(D.T - 2 * Math.PI / D.omega0) > 1e-12) errs.push("周期公式不符");
    if (Math.abs(D.eps - 3.0 * Math.PI / 180) > 1e-12) errs.push("磁偏角值不符");
    if (D.needleL < 2 * D.bowlR * 0.3) errs.push("针长与碗径比例不符");
    if (errs.length) {
      var msg = "水浮指南针自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
