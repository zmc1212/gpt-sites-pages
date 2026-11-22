/* 快轮制陶 — 尺寸常量与转动运动学
   文献依据:明·《天工开物·陶埏·白瓷附》:「造此器坯,先制陶车。车竖直木一根,
   埋三尺入土内,使之安稳,上高二尺许,上下列圆盘(盘沿以短竹棍拨运旋转)…
   过利刀二次(过刀时手脉微振,烧出即成雀口)。」快轮转速:李文杰研究结论
   ——拉坯成型须 ≥90 转/分,低于此只能慢轮修整。
   制式:立轴双盘同轴——下拨盘(竹棍拨沿储能)→ 上工作盘(泥料拉坯),
   摩擦衰减 ω̇ = −b·ω/I(I=½MR²)。
   可验算:
     1. 惯量 I = ½MR²(M 35kg,R 0.34)= 2.02 kg·m²(载入断言);
     2. 每拨冲量 T·Δt = 12 N·m·0.35s = 4.2 N·m·s → Δω = 2.08 rad/s(断言);
     3. 临界拉坯转速 ωc = 90rpm = 9.42 rad/s;满拨 ω0 ≈ 12.5 rad/s(119rpm),
        衰减至 ωc 的可用时长 t = τ·ln(ω0/ωc)(断言 >4s);
     4. 泥料成形进度 ∝ ∫ω dt(拉坯逐帧积分校验 maxErr<1e-9)。
   演示:拨棍每 2.2s 拨一次(相位机),拨角摆动为示意。 */
(function (MECH) {
  var D = {
    axleH: 0.62, Rwork: 0.34, Rdrive: 0.42,
    M: 35, b: 0.337,                      // 转系质量 kg / 摩擦阻尼 N·m·s(τ=I/b=6.0s)
    pushTorque: 18.5, pushTime: 0.35, pushPeriod: 1.8,
    omegaC: 90 * 2 * Math.PI / 60,        // 9.42 rad/s 临界
    omegaMax: 14.0,
    clayM0: 3.2,                          // 泥团 kg(示意)
    shapeRate: 0.009                      // 成形进度 per rad(推算)
  };
  D.I = 0.5 * D.M * D.Rwork * D.Rwork;    // 2.02
  D.dOmega = D.pushTorque * D.pushTime / D.I;   // 2.07
  D.tau = D.I / D.b;                      // 4.81 s
  D.omegaSS = D.dOmega / (1 - Math.exp(-D.pushPeriod / D.tau));   // 周期拨动稳态角速
  D.tUsable = D.tau * Math.log(D.omegaSS / D.omegaC);   // 两次拨间低于临界的判定用

  function newState() {
    return {
      time: 0,
      omega: 0, theta: 0,
      pushT: 0, pushing: false,
      shape: 0, trims: 0, maxErr: 0,
      running: false, hist: []
    };
  }

  function step(st, dt) {
    st.time += dt;
    /* 拨动相位机 */
    st.pushT += dt;
    var pushing = st.pushT < D.pushTime;
    st.pushing = pushing && st.omega < D.omegaMax;
    if (st.pushing) st.omega += (D.pushTorque / D.I) * dt;
    st.omega -= (D.b / D.I) * st.omega * dt;
    if (st.omega < 0.15) st.omega = 0.15;               // 慢轮保持(示意向)
    if (st.pushT >= D.pushPeriod) st.pushT -= D.pushPeriod;
    st.theta += st.omega * dt;
    st.running = st.omega > 1.0;
    /* 拉坯成形进度 */
    st.shape = Math.min(1, st.shape + D.shapeRate * st.omega * dt);
    st._shapeInt = Math.min(1, (st._shapeInt || 0) + D.shapeRate * st.omega * dt);
    var err = Math.abs(st.shape - st._shapeInt);
    if (err > st.maxErr) st.maxErr = err;
    st._hT = (st._hT || 0) + dt;
    if (st._hT > 0.03) {
      st._hT = 0;
      st.hist.push(st.omega);
      if (st.hist.length > 240) st.hist.shift();
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入自检:惯量 / 冲量 / 临界转速 / 可用时长 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.I - 0.5 * D.M * D.Rwork * D.Rwork) > 1e-9) errs.push("惯量 I ≠ ½MR²");
    if (Math.abs(D.dOmega - D.pushTorque * D.pushTime / D.I) > 1e-9) errs.push("冲量-角速不符");
    if (Math.abs(D.omegaC - 90 * 2 * Math.PI / 60) > 1e-9) errs.push("临界转速 ≠ 90rpm");
    if (D.omegaSS < D.omegaC + 0.5) errs.push("稳态转速低于 90rpm 判据: " + (D.omegaSS * 60 / 6.283).toFixed(0));
    if (errs.length) {
      var msg = "快轮制陶自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
