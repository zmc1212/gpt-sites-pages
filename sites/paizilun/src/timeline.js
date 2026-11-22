/* 时间线(44s 循环):横架座凳 → 双轮盘 → 取字台印版 → 推转取字(格步进·印版
   填充) → 满版(48 字) → 手动推转(← 推右轮 / → 推左轮) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 横架与座凳", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 5.5, target: [0, 1.0, 0.3] }, drift: 0.03 },
    { id: "wheels", name: "WHEELS · 监韵轮·杂字轮", dur: 6, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.16, r: 4.6, target: [0, 1.1, 0] }, drift: 0.02 },
    { id: "plate", name: "PLATE · 取字台印版", dur: 5, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: 0.95, phi: 1.14, r: 3.4, target: [0.3, 0.7, 0.5] }, drift: 0.012 },
    { id: "power", name: "POWER · 推转取字(以字就人)", dur: 9, dot: "teal", mode: "RUNNING",
      cam: { theta: -0.25, phi: 1.16, r: 4.2, target: [0, 1.1, 0.2] }, drift: 0.02 },
    { id: "typeset", name: "TYPESET · 印版渐满", dur: 6, dot: "green", mode: "TYPESETTING",
      cam: { theta: 0.85, phi: 1.12, r: 2.8, target: [0.4, 0.7, 0.6] }, drift: 0.010 },
    { id: "full", name: "FULL · 满版(48 字)", dur: 4, dot: "blue", mode: "SHOWCASE",
      cam: { theta: 0.60, phi: 1.10, r: 2.4, target: [0.45, 0.65, 0.7] }, drift: 0.008 },
    { id: "return", name: "RETURN · 补字回韵", dur: 4, dot: "pink", mode: "RETURNING",
      cam: { theta: -0.55, phi: 1.16, r: 4.0, target: [-1.0, 1.1, 0] }, drift: 0.015 },
    { id: "manual", name: "MANUAL · 手动推转(← 推右轮 / → 推左轮)", dur: 5, dot: "red", mode: "MANUAL",
      cam: { theta: -0.30, phi: 1.18, r: 4.6, target: [0, 1.1, 0.2] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "wheels", "plate", "power", "typeset", "full", "return", "manual"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "power") st._auto = true;
      if (ph.id === "manual") st._auto = false;
    }
    /* 手动推转:← 推右轮 / → 推左轮(镜像同速模型,推哪边同速) */
    if (ph.id === "manual") {
      var push = (MECH.keys && (MECH.keys.left || MECH.keys.right)) && st.pushT > 0.5;
      if (push) st.pushT = 0;
    }
    KS.step(st, dt);

    /* 印版格随 plateCount 填充 */
    var pl = MECH.Parts.entry("plate");
    if (pl && pl.shown && pl.group.userData.anim) {
      var cells = pl.group.userData.anim.cells;
      var n = Math.min(cells.length, st.plateCount);
      for (var i = 0; i < cells.length; i++) {
        cells[i].material.color.setHex(i < n ? 0xE7DCC2 : 0x6B5A3E);
      }
    }
  };

  /* seek 补偿:运转段按推转节奏预置轮相位/印版 */
  var RUN_T = 16;
  function phaseStart(i) { var a = 0; for (var k = 0; k < i; k++) a += MECH.PHASES[k].dur; return a; }
  MECH.onSeek = function (i, st) {
    var start = phaseStart(i);
    if (start < RUN_T) return;
    var tRun = start - RUN_T;
    st.omegaL = D.omegaPush * 0.5 * Math.exp(-(tRun % D.pushPeriod) / D.tau);
    st.thetaL = st.thetaR = D.omegaPush * 0.5 * D.tau * (1 - Math.exp(-tRun / D.tau)) + Math.floor(tRun / D.pushPeriod) * D.omegaPush * 0.5 * D.tau * 0.8;
    st.plateCount = Math.min(D.plateCols * D.plateRows, Math.floor(st.thetaL / D.dTheta));
    st._plate = st.plateCount;
  };

  MECH.status = function (st, ph, pt) {
    var pill = ph.name;
    if (st.running) pill = ph.name + " · 轮 " + st.thetaL.toFixed(2) + " rad";
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: "ω " + st.omegaL.toFixed(2) + " rad/s · τ " + D.tau.toFixed(1) + "s",
      b: (st.thetaL / D.dTheta).toFixed(1) + " 格位步进(45°/格)",
      c: "印版 " + st.plateCount + " / " + (D.plateCols * D.plateRows) + " 字"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "wheels") {
      return [
        { id: "p-wl", obj: E("wheelL"), text: "监韵轮 · 径七尺 · 8扇280格" },
        { id: "p-wr", obj: E("wheelR"), text: "杂字轮 · 双面字贴", tone: "white" }
      ];
    }
    if (ph.id === "plate") {
      return [
        { id: "p-plate", obj: E("plate"), text: "取字台印版 · 排字 6×8" }
      ];
    }
    if (ph.id === "power" || ph.id === "typeset" || ph.id === "full" || ph.id === "return" || ph.id === "manual") {
      return [
        { id: "p-wl", obj: E("wheelL"), text: "推转 J=½MR²=24.8 · τ≈10s" },
        { id: "p-plate", obj: E("plate"), text: "「以字就人则易」", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
