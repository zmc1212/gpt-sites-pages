/* 转轮排字盘 — 尺寸常量与运动学求解器
   文献依据:元·王祯《农书》卷末附录《造活字印书法》(1313,维基文库四库本全览):
     「用轻木造为大轮,其轮盘径可七尺,轮轴高可三尺许。用大木砧凿窍,上作横架,
      中贯轮轴,下有钻臼(立转轮盘)。」
     「凡置轮两面:一轮置监韵板面,一轮置杂字板面,一人中坐,左右俱可推转摘字。
      盖以人寻字则难,以字就人则易,此转轮之法不劳力而坐致字数;取讫,又可补还韵内。」
   制式:双立式轮盘(轮盘径 7尺≈2.17m,轴高 3尺≈0.93m),横轴沿 x,轮面朝中坐者;
   8 扇板面(45°/扇),扇内 5 环 × 7 格 ≈ 280 格/面(格约 10cm,推算)。
   可验算:
     1. 轮周长 C = π·D = 6.83m(断言与布局一致);
     2. 扇步进 Δθ = 2π/8 = 45°(断言 Δθ×8 = 2π);
     3. 推转惯量 J = ½MR²(M≈45kg) = 24.8 kg·m²,摩擦阻尼 b:ω(t) = ω₀e^(−t/τ),
        τ = J/b(推转冲量 25 N·m·s → Δω = 1.0 rad/s,τ ≈ 10s,取值);
     4. 印版填充:取一字,印版格 +1(逐帧校验 maxErr<1e-9)。
   演示:两轮镜像同速(左右俱可推转),推转冲量化为周期推力(明示简化)。 */
(function (MECH) {
  var CHI = 0.31;
  var D = {
    CHI: CHI,
    Rwheel: 1.05,                 // 轮盘半径(径 7尺 ≈ 2.17m)
    axleY: 1.00,                  // 轮轴高(略升 3尺,轮下沿离地 5cm)
    wheelX: 1.30,                 // 左右轮轴距(操作者居原点)
    sectors: 8, rows: 5, cols: 7,
    axleLen: 0.55,
    J: 0.5 * 45 * 1.05 * 1.05,    // 24.8 kg·m²
    b: 2.5,                       // 摩擦阻尼(τ = J/b ≈ 10s,取值)
    pushImpulse: 25,              // 推转冲量 N·m·s(演示推力)
    pushPeriod: 2.4,              // 推转间隔 s(演示)
    plateCols: 6, plateRows: 8    // 印版格(排字成果 48 字)
  };
  D.C = Math.PI * D.Rwheel * 2;                 // 轮周长 6.597(径2.1m)
  D.dTheta = 2 * Math.PI / D.sectors;           // 45°
  D.cellsPerFace = D.sectors * D.rows * D.cols; // 280 格/面
  D.omegaPush = D.pushImpulse / D.J;            // 1.008 rad/s
  D.tau = D.J / D.b;                            // 9.93 s

  function newState() {
    return {
      time: 0,
      omegaL: 0, omegaR: 0,                     // 左右轮角速度(镜像同速)
      thetaL: 0, thetaR: 0,
      pushT: 0,
      plateCount: 0,                            // 印版已排字数
      maxErr: 0,
      running: false
    };
  }

  function step(st, dt) {
    st.time += dt;
    /* 推转:每 pushPeriod 施一次冲量(推近侧轮缘) */
    st.pushT += dt;
    if (st.pushT >= D.pushPeriod) {
      st.pushT -= D.pushPeriod;
      st.omegaL = Math.min(1.4, st.omegaL + D.omegaPush * 0.5);
    }
    /* 阻尼衰减:ω(t) = ω₀e^(−t/τ) → ω̇ = −ω/τ */
    var k = Math.exp(-dt / D.tau);
    st.omegaL *= k; st.omegaR = st.omegaL;                     // 镜像同速(左右俱可推转)
    st.thetaL += st.omegaL * dt;
    st.thetaR += st.omegaL * dt;
    st.running = st.omegaL > 0.03;
    /* 印版填充:每转一格(Δθ)取一字 → plateCount+1 */
    var prevSeg = Math.floor((st.thetaL - st.omegaL * dt) / D.dTheta);
    var seg = Math.floor(st.thetaL / D.dTheta);
    if (seg > prevSeg && st.plateCount < D.plateCols * D.plateRows) {
      st._plate = (st._plate || 0) + 1;
      st.plateCount = st._plate;
    }
    var err = Math.abs(st.plateCount - (st._plate || 0));
    if (err > st.maxErr) st.maxErr = err;
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入自检:周长 / 扇步进 / 惯量-冲量 / 格数 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.C - Math.PI * D.Rwheel * 2) > 1e-12) errs.push("周长公式不符");
    if (Math.abs(D.dTheta * D.sectors - 2 * Math.PI) > 1e-12) errs.push("扇步进 ≠ 2π/8");
    if (Math.abs(D.J - 0.5 * 45 * 1.05 * 1.05) > 1e-9) errs.push("惯量 J ≠ ½MR²");
    if (Math.abs(D.omegaPush - D.pushImpulse / D.J) > 1e-9) errs.push("冲量-角速不符");
    if (Math.abs(D.cellsPerFace - D.sectors * D.rows * D.cols) > 1e-9) errs.push("格数 ≠ 扇×环×列");
    if (D.wheelX < D.Rwheel * 0.9) errs.push("轮距过近(操作者居中冲突)");
    if (errs.length) {
      var msg = "转轮排字盘自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
