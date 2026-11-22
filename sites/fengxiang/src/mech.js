/* 活塞风箱 — 尺寸常量与双动活塞运动学
   文献依据:《天工开物》(宋应星) 所绘活塞风箱;双动原理:活塞往复两行程
   均出风——左腔压缩时右腔进气,右腔压缩时左腔进气;四枚薄板活门随压差启闭,
   出气道恒向鼓风管供风。
   活塞位移 x = A·sin(ωt);活门状态由活塞速度方向唯一决定(载入期断言)。 */
(function (MECH) {
  var CHI = 0.3;
  var D = {
    CHI: CHI,
    boxL: 1.24, boxH: 0.36, boxW: 0.36,   // 箱体
    stroke: 0.46,                          // 活塞半行程(A)
    pistonT: 0.05,
    rodL: 0.95,
    k: { slow: 1.5, fast: 2.6 }            // ω rad/s
  };
  D.x0 = 0;                                  // 活塞中位(箱心)
  D.xMin = -D.stroke * 0.88, D.xMax = D.stroke * 0.88;

  function newState() {
    return {
      time: 0, phi: 0, omega: 0, omegaTarget: 0,
      x: 0, vx: 0,
      valves: { inL: 0, inR: 0, outL: 0, outR: 0 },   // 0 闭 1 开(0..1 过渡)
      airflow: 0,                                      // 出风相对量 0..1
      puffs: 0,
      cycleT: 0,
      lastPhase: "", manual: false
    };
  }

  /* 一步:活塞运动 + 活门状态 + 风量(双动:恒有出风) */
  function step(st, dt) {
    st.omega += (st.omegaTarget - st.omega) * Math.min(1, dt * 2.0);
    st.phi += st.omega * dt;
    st.time += dt;
    var prevX = st.x;
    st.x = D.stroke * Math.sin(st.phi);
    st.x = Math.max(D.xMin, Math.min(D.xMax, st.x));
    st.vx = (st.x - prevX) / dt;                       // +x = 活塞向右(压缩右腔)
    var dir = st.vx >= 0 ? 1 : -1;
    var sp = Math.min(1, Math.abs(st.vx) / (D.stroke * D.k.fast));
    /* 活塞向右:右腔压缩 → 右出气开、右进气闭;左腔扩 → 左进气开、左出气闭 */
    st.valves.outR += ((dir > 0 ? 1 : 0) - st.valves.outR) * Math.min(1, dt * 14);
    st.valves.outL += ((dir < 0 ? 1 : 0) - st.valves.outL) * Math.min(1, dt * 14);
    st.valves.inR += ((dir > 0 ? 0 : 1) - st.valves.inR) * Math.min(1, dt * 14);
    st.valves.inL += ((dir < 0 ? 0 : 1) - st.valves.inL) * Math.min(1, dt * 14);
    st.airflow = sp;                                    // 恒向出风(双动)
    st.cycleT += dt;
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入期自检:一个完整周期出风连续(双动) + 活门与方向一致 */
  (function selfCheck() {
    var errs = [];
    var st = newState();
    st.omegaTarget = D.k.slow;
    st.omega = D.k.slow;
    var outSamples = 0, openSamples = 0;
    for (var i = 0; i < 400; i++) {
      step(st, 1 / 30);
      outSamples++;
      if (st.valves.outL > 0.5 || st.valves.outR > 0.5) openSamples++;
      /* 活门一致性 */
      var dir = st.vx >= 0;
      if (st.vx > 0.05 && st.valves.inR > 0.5) errs.push("右进气未闭");
      if (st.vx < -0.05 && st.valves.inL > 0.5) errs.push("左进气未闭");
    }
    if (openSamples !== outSamples) errs.push("双动出风不连续: " + openSamples + "/" + outSamples);
    if (errs.length) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR("风箱自检失败: " + errs.join(";"));
      throw new Error(errs.join(";"));
    }
  })();
})(window.MECH = window.MECH || {});
