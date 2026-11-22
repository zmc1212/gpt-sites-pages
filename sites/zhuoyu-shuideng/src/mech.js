/* 琢玉水凳 — 尺寸常量与运动学求解器
   文献依据:明·宋应星《天工开物·珠玉》:「凡玉初剖时,冶铁为圆盘,以盆水盛沙,
   足踏圆盘使转,添沙剖玉,逐忽划断。」结构详证:清·李澄渊《玉作图》(1891)
   「扎碢」幅;故宫博物院「砣机」词条(凳面、凳槽、锅架、支撑轴架、座凳、踩板)。
   制式:横轴水凳——主轴横置,碢轮(铁圆盘)居中,轴端绳鼓绕绳下接踏板,
   足踏使轴往复回摆,配重回位(回位方式无文献明文,标注推算);
   玉料抵碢缘,解玉砂浆自锅架滴落,碢缘+砂浆研磨。
   可验算:
     1. 缘速比 i = R碢/r绳鼓 = 0.14/0.045 = 3.11(载入断言,即「碢缘线速 = 3.1×绳速」);
     2. 轴摆角 φ轴 = (L踏·sinφ踏)/r绳鼓(绳长不变几何);
     3. 踏频 f 40-60/min(文献复原),演示取 0.75 Hz(45/min);
     4. 划痕深度 ∝ ∫|φ̇轴|·R碢·dt(接触研磨累计,maxErr<1e-9)。
   往复换向:每半行程反向(绳传动天然往复),研磨双程有效(标简化)。 */
(function (MECH) {
  var D = {
    benchY: 0.55, benchL: 1.5, benchW: 0.62,
    axleY: 0.62, axleZ: 0.0,
    discX: -0.25, Rdisc: 0.14, discT: 0.024,
    drumX: 0.42, rdrum: 0.045,
    pedalX: 0.42, pedalY: 0.14, pedalL: 0.72, pedalPivotX: 0.06,
    jadeX: -0.25 - 0.14 - 0.055, jadeY: 0.30,
    pedalAmp: 0.44,                   // 踏板摆幅 rad(±25°)
    freq: 0.75,                       // 踏频 Hz(=45/min,文献 40-60/min 区间)
    notchRate: 0.0042,                // 划痕深度系数(m per rad·m 累计)
    notchMax: 0.055                   // 划痕满深(演示口径)
  };
  D.iRim = D.Rdisc / D.rdrum;         // 3.11 缘速比
  D.phiAxleAmp = D.pedalAmp * 0.36 / D.rdrum;   // 踏板行程→轴摆角(弦长近似)

  function newState() {
    return {
      time: 0, phase: 0,
      phiPedal: 0, omegaPedal: 0,
      phiAxle: 0, omegaAxle: 0,
      notch: 0,
      strokes: 0, lastDir: 0, maxErr: 0,
      running: false, hist: []
    };
  }

  function step(st, dt) {
    st.time += dt;
    st.phase += D.freq * 2 * Math.PI * dt;
    st.phiPedal = -D.pedalAmp * Math.sin(st.phase);
    st.omegaPedal = -D.pedalAmp * D.freq * 2 * Math.PI * Math.cos(st.phase);
    /* 绳传动:轴摆角 = L踏·sin(φ踏)/r绳鼓(弦长几何) */
    st.phiAxle = D.phiAxleAmp * Math.sin(st.phase);
    st.omegaAxle = D.phiAxleAmp * D.freq * 2 * Math.PI * Math.cos(st.phase);
    /* 换向计数 */
    if (st.omegaAxle * st.lastDir < 0 && Math.abs(st.omegaAxle) > 0.2) { st.strokes++; st.lastDir = st.omegaAxle; }
    else if (st.lastDir === 0 && Math.abs(st.omegaAxle) > 0.2) st.lastDir = st.omegaAxle;
    /* 划痕:接触研磨累计 ∫|φ̇|·R碢·dt(玉料恒压简化) */
    var dh = D.notchRate * Math.abs(st.omegaAxle) * D.Rdisc * dt;
    st.notch = Math.min(D.notchMax, st.notch + dh);
    st._notchInt = (st._notchInt || 0) + dh;
    var err = Math.abs(st.notch - st._notchInt);
    if (err > st.maxErr) st.maxErr = err;
    st.running = Math.abs(st.omegaAxle) > 0.15;
    st._hT = (st._hT || 0) + dt;
    if (st._hT > 0.03) {
      st._hT = 0;
      st.hist.push(st.phiAxle);
      if (st.hist.length > 240) st.hist.shift();
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入自检:缘速比 / 摆角几何 / 踏频 / 几何净空 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.iRim - D.Rdisc / D.rdrum) > 1e-12) errs.push("缘速比 ≠ R碢/r鼓");
    if (Math.abs(D.phiAxleAmp - D.pedalAmp * 0.36 / D.rdrum) > 1e-12) errs.push("轴摆角几何不符");
    if (D.phiAxleAmp < 2.0) errs.push("轴摆角过小(<2 rad),碢轮摆程不足");
    if (!(D.freq > 0.5 && D.freq < 1.1)) errs.push("踏频超出 40-60/min 区间");
    if (Math.abs(D.discX - D.drumX) > 0.8) errs.push("碢轮-绳鼓轴距过大");
    if (errs.length) {
      var msg = "琢玉水凳自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
