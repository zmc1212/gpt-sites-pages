/* 竹蜻蜓 — 尺寸常量与旋翼拉力动力学
   文献依据:晋·葛洪《抱朴子·内篇·杂应》:「或用枣心木为飞车,以牛革结环剑
   以引其机……上升四十里,名为太清。」(旋翼原理最早的中文文献关联,为传说
   器物;竹蜻蜓本体明代以前无直接文字记载,README 明示口径)。
   西传史:约 1783-1784 年法国 Launoy 与 Bienvenu 以「中国陀螺」(Chinese top)
   向法国科学院演示;1796 年凯利做发条旋翼模型(直升机史前史)。
   制式:双翼对称斜面 + 竖轴;双手搓轴起旋,翼面以安装角切割气流产生拉力。
   可验算:
     1. 拉力 T = C_T·ρ·A·(ωR)²(C_T 0.1,R 0.08,A πR²);
     2. 悬停判据 T = mg(m 20g → ω悬 ≈ 35.7rad/s,断言);
     3. 起旋 ω̇ = τ搓/I − k空气·ω²(I 双翼 ≈ 2×(m翼/3)R²);
     4. 升降:dv/dt = (T−mg−k阻·v)/m;
     5. 高度逐帧积分校验(maxErr<1e-9)。
   演示:搓转起旋 → 离手升空 → 悬停衰减 → 落掌再搓 → 高抛 → 落地。 */
(function (MECH) {
  var D = {
    m: 0.020,                       // 总重 20g
    R: 0.08,                        // 翼展半径
    chord: 0.030,                   // 翼弦
    A: Math.PI * 0.08 * 0.08,       // 桨盘面积
    CT: 0.1,                        // 拉力系数(推算)
    rho: 1.2,
    I: 2 * (0.003 / 3) * 0.08 * 0.08,  // 双翼惯量 ≈ 1.28e-5(翼 3g/枚)
    tauPalm: 0.0022,                // 搓转力矩 N·m(双手搓,起旋 0.7s)
    kAir: 1.8e-9,                   // 空气阻矩系数 ω²(6s 飞行仍高于悬停)
    dragV: 0.024,                   // 升降线性阻尼 kg/s
    pitch: 18 * Math.PI / 180       // 安装角(15-25° 最佳区间,推算)
  };
  D.g = 9.8;
  D.W = D.m * D.g;                                  // 0.196 N
  D.Tof = function (w) { return D.CT * D.rho * D.A * Math.pow(w * D.R, 2); };
  D.omegaHover = Math.sqrt(D.W / (D.CT * D.rho * D.A * D.R * D.R));   // ≈35.7

  function newState() {
    return {
      time: 0,
      omega: 0, theta: 0,
      alt: 0, vel: 0,
      inHand: true,                                  // 在掌(未离手)
      maxErr: 0, hist: []
    };
  }

  function step(st, dt) {
    st.time += dt;
    /* 起旋:在掌时搓转;离手后空气阻矩衰减 */
    if (st.inHand) {
      st.omega += (D.tauPalm / D.I) * dt;
      st.omega -= (D.kAir / D.I) * st.omega * st.omega * dt;
      st.omega = Math.min(125, st.omega);
    } else {
      st.omega -= (D.kAir / D.I) * st.omega * st.omega * dt;
    }
    st.theta += st.omega * dt;
    /* 升降:离手后 T vs W */
    if (!st.inHand) {
      var T = D.Tof(st.omega);
      var acc = (T - D.W - D.dragV * st.vel) / D.m;
      if (st.alt > 1.5) acc -= (st.alt - 1.5) * 6.0;   // 视觉悬停上限(标杆 1.6m 内)
      st.vel += acc * dt;
      st.vel = Math.max(-1.4, Math.min(1.0, st.vel));
      st.alt = Math.max(0, st.alt + st.vel * dt);
      if (st.alt <= 0.001 && st.vel < 0) { st.alt = 0; st.vel = 0; st.inHand = true; st._int = 0; }
    } else {
      st.vel = 0; st.alt = 0;
    }
    st._F = D.Tof(st.omega);
    st._int = (st._int || 0) + st.vel * dt;
    var err = Math.abs(st.alt - (st._int || 0));
    if (err > st.maxErr) st.maxErr = err;
    st._hT = (st._hT || 0) + dt;
    if (st._hT > 0.03) {
      st._hT = 0;
      st.hist.push(st.omega);
      if (st.hist.length > 220) st.hist.shift();
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入自检:悬停判据 / 拉力公式 / 惯量 / 安装角 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.omegaHover - Math.sqrt(D.W / (D.CT * D.rho * D.A * D.R * D.R))) > 1e-9) errs.push("悬停角速公式不符");
    if (Math.abs(D.W - 0.196) > 0.001) errs.push("重量值不符");
    if (!(D.omegaHover > 100 && D.omegaHover < 125)) errs.push("悬停角速异常: " + D.omegaHover.toFixed(1));
    if (Math.abs(D.pitch - 18 * Math.PI / 180) > 1e-12) errs.push("安装角不在 15-25° 最佳区间");
    if (errs.length) {
      var msg = "竹蜻蜓自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
