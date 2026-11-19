/* 风扇车(扬扇) — 尺寸常量与风选分级运动学
   文献依据:《天工开物·乃粒》扇车图(「凡既扬之后? …飏车」):手摇曲柄
   驱动圆箱内扇叶轮,谷物自上漏斗经活门下落,穿风道被吹——糠秕轻被吹入
   远出口,谷粒重落近口,风选分级。
   颗粒偏移 = ½·(k风/粒重)·t²(载入断言:糠/谷落点分级)。 */
(function (MECH) {
  var CHI = 0.3;
  var D = {
    CHI: CHI,
    fanR: 0.30, blades: 6,
    boxW: 0.42, boxH: 0.60, boxL: 0.95,   // 圆箱风道
    hopperY: 1.30,
    fallH: 0.95,                           // 落谷下落高度
    aChaff: 3.6,                           // 糠秕水平加速度系数(满速)
    aGrain: 0.7,                           // 谷粒
    k: { slow: 2.2, fast: 3.4 },
    outFar: 0.24, outNear: 0.09,           // 远/近出口 x(分级阈值 mid=0.165)
    rate: 26                               // 谷物流量(粒/s,满开度)
  };
  D.tFall = Math.sqrt(2 * D.fallH / 9.8);   // 下落时间 ≈ 0.44s

  function newState() {
    return {
      time: 0, phi: 0, omega: 0, omegaTarget: 0,
      gate: 1.0,
      grains: [],                            // 飞行颗粒 {y0,x0,vy,type,t}
      landedFar: 0, landedNear: 0,
      puffs: 0,
      lastPhase: "", manual: false, _keyL: false, _keyR: false
    };
  }

  /* 颗粒下落+风偏(半解析):x = ½·a·(t/tFall)²·tFall² */
  function step(st, dt) {
    st.omega += (st.omegaTarget - st.omega) * Math.min(1, dt * 2.0);
    st.phi += st.omega * dt;
    st.time += dt;
    /* 落谷生成:率 ∝ gate */
    st._acc = (st._acc || 0) + D.rate * st.gate * dt;
    var wind = st.omega / D.k.fast;         // 0..1 相对风速
    while (st._acc >= 1) {
      st._acc -= 1;
      var type = Math.random() < 0.34 ? "chaff" : "grain";
      st.grains.push({ t: 0, type: type, wind: wind, x: 0, done: false });
      if (st.grains.length > 60) st.grains.shift();
    }
    /* 颗粒推进(半解析) */
    for (var i = st.grains.length - 1; i >= 0; i--) {
      var g = st.grains[i];
      if (g.done) continue;
      g.t += dt;
      var a = (g.type === "chaff" ? D.aChaff : D.aGrain) * wind;
      g.x = 0.5 * a * Math.min(g.t, D.tFall) * Math.min(g.t, D.tFall);
      if (g.t >= D.tFall) {
        g.done = true;
        if (g.x > (D.outFar + D.outNear) / 2) st.landedFar++;
        else st.landedNear++;
        st.puffs++;
      }
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  (function selfCheck() {
    var errs = [];
    /* 满速:糠(远)/谷(近)分级断言 */
    var st = newState();
    st.omegaTarget = D.k.fast;
    st.omega = D.k.fast;
    for (var i = 0; i < 900; i++) step(st, 1 / 30);
    if (st.landedFar === 0) errs.push("糠秕未吹出");
    if (st.landedNear === 0) errs.push("谷粒未落");
    if (st.landedFar > st.landedNear * 1.2) errs.push("分级异常: 糠多于谷");
    /* 半速:糠偏移减半(线性) */
    var st2 = newState();
    st2.omegaTarget = D.k.slow;
    st2.omega = D.k.slow;
    for (var j = 0; j < 600; j++) step(st2, 1 / 30);
    /* tFall 后糠偏移 0.5·a·t²;a ∝ wind → 慢速偏移 ≈ (2.2/3.4)×满速 */
    var farRatio = st2.landedFar / Math.max(1, st2.landedNear + st2.landedFar);
    var fullRatio = st.landedFar / Math.max(1, st.landedNear + st.landedFar);
    if (farRatio > fullRatio) errs.push("风速减半分级反而更强");
    if (errs.length) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR("风扇车自检失败: " + errs.join(";"));
      throw new Error(errs.join(";"));
    }
  })();
})(window.MECH = window.MECH || {});
