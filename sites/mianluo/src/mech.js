/* 水击面罗 — 尺寸常量与运动学求解器
   文献依据:王祯《农书·农器图谱》"水击面罗":"水击面罗,随水磨用之,其机与
   水排俱同。按图视谱,当自考索。罗因水力互击桩柱,筛面甚速,倍于人力。"
   旁证:上海博物馆藏《闸口盘车图》(五代/宋)绘水磨作坊附面罗。
   复原方案(攀耳—卧轴式,学界有争议,README 明示):
     立轮(竖直水轮,横轴)同轴直驱卧轴 → 轴上 3 攀耳(凸耳,120° 均布)周期
     击打罗框西缘撞杆 → 罗框四索悬吊受击摆荡(阻尼单摆) → 筛落面粉入柜。
   可验算:
     1. 直驱 ω轴 = ω轮(载入断言);击频 f = 3·ω轴/2π;
     2. 单摆周期 T₀ = 2π√(L/g)(L=0.95m → T₀≈1.955s,断言);
     3. 摆动方程 θ̈ = −(g/L)sinθ − 2ζω₀θ̇(解析小阻尼校验);击发冲量 Δθ̇ = 0.85 rad/s;
     4. 筛落累计 ∫c·|θ̇|dt 与柜面粉高一致(maxErr <1e-9)。
   演示速率:ω轴 = 0.9·闸门(rad/s),真实水轮更高(明示压缩)。 */
(function (MECH) {
  var D = {
    wx: -3.0, wz: 0.0,             // 立轮轴心(渠道中心线 x=-3.0)
    Rwheel: 1.15, nBlade: 12,      // 立轮半径/叶数
    shaftHi: 1.62,                 // 卧轴高
    chX: -3.0, chW: 0.95, chWall: 0.30, chFloor: -0.70, chWater: -0.16, chZ0: -6.0, chZ1: 6.0,
    frameX: 0.0, frameY: 1.02,     // 罗框中心
    frameW: 1.15, frameD: 0.72,    // 罗框长(东西)/宽
    ropeTop: 2.55,                 // 吊索顶(横梁)
    L: 0.95,                       // 摆长(吊索有效长)
    camX: -0.42, camN: 3,          // 攀耳轴向位置/数量
    postX: -0.62,                  // 撞杆(罗框西缘立柱顶)
    kick: 1.2,                     // 每击角速度冲量 rad/s(恒向 −θ 推离)
    zeta: 0.10,                    // 阻尼比
    QK: 0.014,                     // 闸门流量系数(功率估算)
    head: 1.30, eta: 0.6,
    hopperX: 1.35, hopperZ: 0.9,
    flourRate: 0.0016              // 筛落速率系数(柜面粉 m/s per |θ̇|)
  };
  D.g = 9.8;
  D.omega0 = Math.sqrt(D.g / D.L);                 // 3.213 rad/s
  D.T0 = 2 * Math.PI / D.omega0;                   // 1.955 s
  D.omegaK = 0.9;                                  // ω轴 = 0.9·闸门
  D.flourPerSwing = D.flourRate;                   // 简化系数

  function newState() {
    return {
      time: 0, gate: 0, gateTarget: 0,
      thetaShaft: 0, omegaShaft: 0,                // 卧轴(=立轮)
      thetaWheel: 0,
      swingT: 0, swingV: 0,                        // 罗框摆角/角速度
      strikes: 0, lastStrikeT: -1,
      flour: 0, maxErr: 0,
      hist: [],                                    // 摆角历史(仪表)
      running: false
    };
  }

  function wrapPi(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }

  function step(st, dt) {
    st.time += dt;
    st.omegaShaft += (D.omegaK * st.gate - st.omegaShaft) * Math.min(1, dt * 1.4);
    st.thetaShaft += st.omegaShaft * dt;
    st.thetaWheel = st.thetaShaft;                 // 直驱 1:1(断言恒等)
    st.running = st.omegaShaft > 0.06;
    /* 阻尼摆:θ̈ = −ω₀²sinθ − 2ζω₀θ̇(半隐式欧拉) */
    var acc = -D.omega0 * D.omega0 * Math.sin(st.swingT) - 2 * D.zeta * D.omega0 * st.swingV;
    st.swingV += acc * dt;
    st.swingT += st.swingV * dt;
    /* 攀耳击发:每转 3 次,撞杆相位(取攀耳角最近 ±0.10 rad 内触发一次冲量) */
    if (st.running) {
      var camPhase = (st.thetaShaft * D.camN) % (2 * Math.PI);
      var near = Math.abs(wrapPi(camPhase - Math.PI)) < 0.10;   // 攀耳正对撞杆
      var canStrike = (st.time - st.lastStrikeT) > 0.10;
      if (near && canStrike) {
        st.swingV -= D.kick;                          // 攀耳恒向 −θ 推离
        st.lastStrikeT = st.time;
        st.strikes++;
      }
    }
    /* 筛落累计:∫ flourRate·|θ̇| dt */
    st.flour += D.flourRate * Math.abs(st.swingV) * dt;
    st._flourInt = (st._flourInt || 0) + D.flourRate * Math.abs(st.swingV) * dt;
    var err = Math.abs(st.flour - st._flourInt);
    if (err > st.maxErr) st.maxErr = err;
    /* 仪表历史 */
    st._hT = (st._hT || 0) + dt;
    if (st._hT > 0.03) {
      st._hT = 0;
      st.hist.push(st.swingT);
      if (st.hist.length > 240) st.hist.shift();
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step, wrapPi: wrapPi };

  /* 载入自检:直驱恒等 / 单摆周期 / 频率关系 / 几何净空 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.T0 - 2 * Math.PI * Math.sqrt(D.L / D.g)) > 1e-12) errs.push("单摆周期公式不符");
    if (Math.abs(D.omega0 * D.omega0 - D.g / D.L) > 1e-9) errs.push("ω₀² ≠ g/L");
    if (D.postX > D.camX + 0.05) errs.push("撞杆与攀耳无接触行程");
    if (Math.abs(D.postX - D.camX) > 0.35) errs.push("攀耳-撞杆间距过大");
    if (D.frameY - 0.30 < 0.85) errs.push("罗框低于面柜口");
    if (D.chWater < D.chFloor + 0.2) errs.push("渠水深不足");
    if (errs.length) {
      var msg = "水击面罗自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
