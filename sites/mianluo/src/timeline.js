/* 时间线(46s 循环):水渠木架 → 立轮卧轴 → 罗框面柜 → 料斗麦层 →
   水击筛面(攀耳击撞杆·罗框摆荡·面粉筛落) → 满柜 → 手动水量(←/→) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 水渠与木架", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 8.5, target: [-1.5, 1.0, 0] }, drift: 0.03 },
    { id: "wheel", name: "WHEEL · 立轮·卧轴·攀耳", dur: 6, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.16, r: 6.5, target: [-1.8, 1.3, 0] }, drift: 0.02 },
    { id: "sieve", name: "SIEVE · 罗框·面柜", dur: 6, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.45, phi: 1.14, r: 5.5, target: [0, 1.5, 0] }, drift: 0.015 },
    { id: "feed", name: "FEED · 料斗·麦层入罗", dur: 5, dot: "pink", mode: "ASSEMBLING",
      cam: { theta: 0.90, phi: 1.12, r: 4.8, target: [0.4, 1.2, 0] }, drift: 0.012 },
    { id: "power", name: "POWER · 水击筛面(攀耳互击桩柱)", dur: 8, dot: "teal", mode: "RUNNING",
      cam: { theta: -0.70, phi: 1.18, r: 7.5, target: [-1.0, 1.3, 0] }, drift: 0.02 },
    { id: "flour", name: "FLOUR · 面粉筛落", dur: 6, dot: "green", mode: "SIFTING",
      cam: { theta: 1.05, phi: 1.14, r: 5.2, target: [0.2, 1.0, 0] }, drift: 0.015 },
    { id: "full", name: "OVERFLOW · 满柜", dur: 5, dot: "yellow", mode: "OVERFLOW",
      cam: { theta: 0.50, phi: 1.12, r: 4.6, target: [0, 0.8, 0] }, drift: 0.012 },
    { id: "manual", name: "MANUAL · 手动水量(← 开大 / → 关小)", dur: 5, dot: "red", mode: "MANUAL",
      cam: { theta: -0.60, phi: 1.20, r: 7.8, target: [-1.2, 1.2, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "wheel", "sieve", "feed", "power", "flour", "full", "manual"];

  MECH.newState = KS.newState;

  var _puffT = 0;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "power") st.gateTarget = 0.75;
      if (ph.id === "flour" || ph.id === "full") st.gateTarget = 0.85;
      if (ph.id === "manual") st.gateTarget = st.gate;
    }
    if (ph.id === "manual") {
      var d = 0;
      if (MECH.keys && MECH.keys.left) d += 0.5;
      if (MECH.keys && MECH.keys.right) d -= 0.5;
      st.gateTarget = Math.min(1.0, Math.max(0.3, st.gateTarget + d * dt));
    }
    st.gate += (st.gateTarget - st.gate) * Math.min(1, dt * 2.0);
    KS.step(st, dt);

    /* 面粉堆长高 + 筛上麦层减薄 */
    var ch = MECH.Parts.entry("chest");
    if (ch && ch.shown && ch.group.userData.anim) {
      var f = ch.group.userData.anim.flour;
      var fl = Math.min(1, st.flour / 0.30);
      f.scale.y = Math.max(0.01, fl * 14);
      f.position.y = 0.37 + st.flour / 2;
    }
    var sv = MECH.Parts.entry("sieve");
    if (sv && sv.shown && sv.group.userData.anim) {
      sv.group.userData.anim.grainLayer.scale.y = Math.max(0.25, 1 - st.flour / 0.30);
    }
    /* 击发水花(渠面) */
    if (st.running) {
      _puffT += dt;
      if (_puffT > 0.30) {
        _puffT = 0;
        MECH.Scene3D.spawnPuff(D.wx + (Math.random() - 0.5) * 0.5, D.chWater + 0.15, D.wz + (Math.random() - 0.5) * 1.2,
          { max: 0.7, base: 0.30, vy: 0.9, opacity: 0.45, tint: 0xBFD9E8 });
      }
    }
  };

  /* seek 补偿:运转段预置轴相位/摆角/粉量 */
  var RUN_T = 22;
  function phaseStart(i) { var a = 0; for (var k = 0; k < i; k++) a += MECH.PHASES[k].dur; return a; }
  MECH.onSeek = function (i, st) {
    var start = phaseStart(i);
    if (start < RUN_T) return;
    var tRun = start - RUN_T;
    st.gate = 0.75; st.gateTarget = 0.75;
    st.omegaShaft = D.omegaK * 0.75;
    st.thetaShaft = 0.675 * Math.max(0, tRun - 0.8) + 0.44 * Math.min(tRun, 0.8);
    st.thetaWheel = st.thetaShaft;
    st.flour = Math.min(0.30, D.flourRate * 2.0 * tRun);
    st.swingV = 0.5; st.swingT = 0.15;
    st.strikes = Math.floor(st.thetaShaft * D.camN / (2 * Math.PI));
  };

  MECH.status = function (st, ph, pt) {
    var f = st.omegaShaft * D.camN / (2 * Math.PI);
    var pill = ph.name;
    if (st.running) pill = ph.name + " · 击频 " + f.toFixed(2) + " Hz · 击 " + st.strikes;
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: (st.omegaShaft * 60 / (2 * Math.PI)).toFixed(1) + " rpm · 轴=轮 1:1",
      b: f.toFixed(2) + " Hz · T摆 " + D.T0.toFixed(2) + " s",
      c: "面粉 " + (st.flour * 640).toFixed(1) + " L"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "wheel") {
      return [
        { id: "p-wheel", obj: E("wheel"), text: "立轮 12 斗叶 · 半浸渠水" },
        { id: "p-cam", obj: E("shaftCam"), text: "卧轴·攀耳 3×120° · 直驱 1:1", tone: "white" }
      ];
    }
    if (ph.id === "sieve") {
      return [
        { id: "p-sieve", obj: E("sieve"), text: "罗框四索悬吊 · 摆长 0.95m" },
        { id: "p-chest", obj: E("chest"), text: "面柜 · 粉随筛落", tone: "white" }
      ];
    }
    if (ph.id === "power" || ph.id === "flour" || ph.id === "full" || ph.id === "manual") {
      return [
        { id: "p-sieve", obj: E("sieve"), text: "攀耳互击桩柱 · 阻尼摆 θ̈=−ω₀²sinθ" },
        { id: "p-cam", obj: E("shaftCam"), text: "击频 3ω/2π · 「筛面甚速,倍于人力」", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
