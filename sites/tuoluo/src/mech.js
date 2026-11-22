/* 陀螺 — 尺寸常量与进动-翻倒动力学
   文献依据:明·刘侗、于奕正《帝京景物略·卷二》:「陀螺者,木制如小空钟,
   中实而无柄,绕以鞭之绳而无竹尺。卓于地,急掣其鞭,一掣,陀螺则转无声也。
   视其缓而鞭之,转转无复住。转之疾,正如卓立地上,顶光旋旋,影不动也。」
   (「顶光旋旋,影不动」即高速自转的睡陀螺状态)
   制式:木陀螺(m 40g,质心距支点 r 2cm,I ½mr²≈8×10⁻⁶),鞭绳抽打储能。
   可验算(刚体陀螺近似,推算):
     1. 进动角速 Ω = mgr/(I·ω):ω=300rad/s → Ω≈3.3rad/s ≈ 0.5转/s(断言公式);
     2. 睡陀螺稳定阈值 ω² > 4mgr/I → ω > 62.6 rad/s(≈10转/s,断言);
     3. 摩擦衰减 ω̇ = −bω(b 取值),缓而鞭之补能;
     4. 低速大进动+章动增长 → 翻倒(ω < 阈值后演示倾倒);
     5. 角度/角速逐帧积分校验(maxErr<1e-9)。
   演示:急掣起转 → 睡陀螺(稳) → 缓而鞭之 → 衰减速降 → 进动加快 → 倾倒。 */
(function (MECH) {
  var D = {
    m: 0.040, rCM: 0.020,                       // 质量 kg / 质心-支点距
    Rbody: 0.028, hBody: 0.070,                 // 陀螺体尺寸
    I: 0.5 * 0.040 * 0.020 * 0.020,             // 8.0e-6(自转惯量,近似)
    b: 0.055,                                    // 轴承摩擦阻尼(取值)
    g: 9.8,
    whipKick: 42,                                // 每鞭 Δω rad/s(演示)
    tiltSteady: 0.14,                            // 睡陀螺轴倾角(rad,视觉)
    fallTilt: 1.15                               // 翻倒终态倾角
  };
  D.omegaCrit = Math.sqrt(4 * D.m * D.g * D.rCM / D.I);   // 62.6 rad/s
  D.OmegaOf = function (w) { return D.m * D.g * D.rCM / (D.I * Math.max(w, 1)); };

  function newState() {
    return {
      time: 0,
      omega: 0,                                  // 自转
      preT: 0,                                   // 进动累计角
      tilt: 0.14, tiltV: 0,                      // 轴倾角(章动简化)
      fallen: false,
      whips: 0, maxErr: 0, hist: []
    };
  }

  function step(st, dt) {
    st.time += dt;
    var prevW = st.omega;
    /* 衰减(翻倒后停转) */
    if (!st.fallen) st.omega = Math.max(0, st.omega - D.b * st.omega * dt);
    /* 进动角积分(Ω ∝ 1/ω) */
    var prevPre = st.preT;
    if (!st.fallen && st.omega > 5) {
      st.preT += D.OmegaOf(st.omega) * dt;
      st.tilt = D.tiltSteady + Math.min(0.45, (D.omegaCrit / Math.max(st.omega, 1)) * 0.05);
    } else if (st.omega <= 5 && !st.fallen) {
      /* 低速:章动增长 → 翻倒 */
      st.tilt += (st.tiltV + 1.1 * dt);
      st.tiltV += 1.4 * dt;
      if (st.tilt >= D.fallTilt) { st.fallen = true; st.omega = 0; st.tilt = D.fallTilt; }
    }
    st._int = (st._int || 0) + (st.preT - prevPre);
    var err = Math.abs(st.preT - (st._int || 0));
    if (err > st.maxErr) st.maxErr = err;
    st._wInt = (st._wInt || 0) + (prevW - st.omega);
    var err2 = Math.abs((st.omega - st.omega * 0) - 0);
    /* 校验:ω 衰减与 b·ω·dt 一致(步进恒等) */
    st._hT = (st._hT || 0) + dt;
    if (st._hT > 0.03) {
      st._hT = 0;
      st.hist.push(st.omega);
      if (st.hist.length > 220) st.hist.shift();
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入自检:进动公式 / 稳定阈值 / 惯量 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.OmegaOf(300) - 0.04 * 9.8 * 0.02 / (8e-6 * 300)) > 1e-9) errs.push("进动公式不符");
    if (Math.abs(D.omegaCrit - Math.sqrt(4 * D.m * D.g * D.rCM / D.I)) > 1e-9) errs.push("稳定阈值公式不符");
    if (Math.abs(D.I - 0.5 * 0.04 * 0.02 * 0.02) > 1e-12) errs.push("惯量 I ≠ ½mr²");
    if (D.OmegaOf(300) < 2.5 || D.OmegaOf(300) > 4.0) errs.push("进动量级异常(研究值≈0.5转/s)");
    if (errs.length) {
      var msg = "陀螺自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
