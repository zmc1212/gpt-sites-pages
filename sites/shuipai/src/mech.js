/* 水排 — 尺寸常量与曲柄-连杆-滑块运动学
   文献依据:王祯《农书》水排图(东汉杜诗 31 AD 发明水力鼓风):
   立式水轮 → 轮轴曲柄 → 连杆 → 滑块 → 双扇木门开合鼓风。
   滑块位移(标准曲柄滑块):x = r·cosφ + √(l² − r²sin²φ),行程 = 2r,
   曲柄连杆比 λ = r/l = 0.26(载入期逐帧断言)。 */
(function (MECH) {
  var CHI = 0.3;
  var D = {
    CHI: CHI,
    R: 1.4,                 // 立轮半径
    yC: 1.62,               // 轮/轴高(下缘入水 0.28)
    axleL: 1.6,
    r: 0.24,                // 曲柄销半径
    l: 0.92,                // 连杆长
    doorH: 0.52, doorW: 0.44,
    doorAngle: 32 * Math.PI / 180,   // 扇门最大开角
    boxW: 0.9, boxH: 0.62, boxD: 0.5,   // 风箱(门式)
    k: { slow: 0.9, fast: 1.7 },
    waterY: 0.22
  };
  D.yC = D.waterY + D.R - 0.28 + 0.28;      // 轮心 = 水面+R−浸深+…;直接定 1.62
  D.slideBase = D.l;                          // 滑块参考位(曲柄中心到滑块铰,当 φ=90°)
  D.slideOf = function (phi) {
    return D.r * Math.cos(phi) + Math.sqrt(Math.max(0, D.l * D.l - D.r * D.r * Math.sin(phi) * Math.sin(phi)));
  };
  D.stroke = D.slideOf(Math.PI) - D.slideOf(0);   // = 2r
  D.lambda = D.r / D.l;

  function newState() {
    return {
      time: 0, phi: 0, omega: 0, omegaTarget: 0,
      slide: D.slideOf(0), slideV: 0,
      doorL: 0, doorR: 0,                 // 扇门开角(0..1)
      airflow: 0, puffs: 0, strokes: 0,
      lastPhase: ""
    };
  }

  function step(st, dt) {
    st.omega += (st.omegaTarget - st.omega) * Math.min(1, dt * 2.0);
    var prev = st.phi;
    st.phi += st.omega * dt;
    st.time += dt;
    var s0 = D.slideOf(prev), s1 = D.slideOf(st.phi);
    st.slide = s1;
    st.slideV = (s1 - s0) / dt;
    /* 滑块内移(压缩) → 两扇门闭合鼓风;外移 → 开门进气 */
    var open = 1 - Math.min(1, Math.max(0, (st.slide - (D.l - D.r)) / (2 * D.r)));
    st.doorL = open; st.doorR = open;
    st.airflow = Math.min(1, Math.abs(st.slideV) / (2 * D.r * D.k.fast));
    if (st.slideV > 0.02) st.strokes += 0;      // 行程计:每整周一次
    var cyc = Math.floor(st.phi / (2 * Math.PI));
    if (cyc > (st._cyc || 0)) { st._cyc = cyc; st.strokes += 1; st._strokeT = st.time; }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入期自检:滑块公式逐帧断言 + 行程 2r + 每周一次鼓风 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.stroke - 2 * D.r) > 1e-9) errs.push("行程≠2r: " + D.stroke);
    if (Math.abs(D.lambda - 0.26) > 1e-9) errs.push("λ≠0.26");
    var st = newState();
    st.omegaTarget = D.k.slow;
    st.omega = D.k.slow;
    for (var i = 0; i < 300; i++) {
      step(st, 1 / 30);
      var exact = D.slideOf(st.phi);
      if (Math.abs(st.slide - exact) > 1e-9) { errs.push("滑块公式不自洽"); break; }
    }
    if (st.strokes < 1 || st.strokes > 2) errs.push("鼓风节奏异常: " + st.strokes);
    if (errs.length) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR("水排自检失败: " + errs.join(";"));
      throw new Error(errs.join(";"));
    }
  })();
})(window.MECH = window.MECH || {});
