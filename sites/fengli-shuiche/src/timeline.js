/* 时间线(50s 循环):水池车座 → 帆架立轴 → 八帆 → 翻车(架/轴/笧槽) →
   26 链节挂装 → 起风运转(风爬至 6 m/s) → 西田灌溉(水面随灌量涨) →
   手动风速(←/→ 调 2-8 m/s,Q/裕度全链条随动) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 水池与风车座", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 9.0, target: [0.4, 0.5, 2.2] }, drift: 0.03 },
    { id: "mast", name: "MAST · 帆架与立轴·卧轮", dur: 6, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.16, r: 7.5, target: [0, 1.8, 0] }, drift: 0.02 },
    { id: "sails", name: "SAILS · 八帆偏装", dur: 6, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: 1.05, phi: 1.12, r: 6.8, target: [0, 2.6, 0] }, drift: 0.015 },
    { id: "pump", name: "PUMP · 翻车·立轮·笧槽", dur: 6, dot: "blue", mode: "ASSEMBLING",
      cam: { theta: -0.50, phi: 1.18, r: 7.0, target: [0, 1.1, 2.2] }, drift: 0.012 },
    { id: "chain", name: "CHAIN · 26 链节挂装", dur: 5, dot: "pink", mode: "ASSEMBLING",
      cam: { theta: 0.35, phi: 1.14, r: 6.0, target: [0, 0.9, 2.6] }, drift: 0.010 },
    { id: "power", name: "POWER · 起风运转(风爬至 6 m/s)", dur: 8, dot: "teal", mode: "RUNNING",
      cam: { theta: 0.90, phi: 1.16, r: 9.5, target: [0, 1.8, 1.4] }, drift: 0.02 },
    { id: "field", name: "FIELD · 西田灌溉", dur: 6, dot: "green", mode: "IRRIGATING",
      cam: { theta: 2.10, phi: 1.18, r: 8.0, target: [-2.0, 0.8, 1.0] }, drift: 0.02 },
    { id: "manual", name: "MANUAL · 手动风速(← 增 / → 减)", dur: 8, dot: "red", mode: "MANUAL",
      cam: { theta: -0.70, phi: 1.18, r: 9.0, target: [0, 1.8, 1.2] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "mast", "sails", "pump", "chain", "power", "field", "manual"];

  MECH.newState = KS.newState;

  var _puffT = 0;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "power") st.windTarget = 6.0;          // 起风至额定
      if (ph.id === "field") st.windTarget = 6.0;
      if (ph.id === "manual") st.windTarget = st.wind;     // 手动接管
    }
    if (ph.id === "manual") {
      var d = 0;
      if (MECH.keys && MECH.keys.left) d += 0.5;
      if (MECH.keys && MECH.keys.right) d -= 0.5;
      st.windTarget = Math.min(D.windMax, Math.max(D.windMin, st.windTarget + d * dt));
    }
    KS.step(st, dt);

    /* 笧槽水流可见性 + 落水水花 */
    var tr = MECH.Parts.entry("outTrough");
    if (tr && tr.group.userData.anim) {
      var vis = st.running;
      tr.group.userData.anim.water[0].visible = vis;
      tr.group.userData.anim.water[1].visible = vis;
    }
    if (st.running && st.flow > 0.002) {
      _puffT += dt;
      if (_puffT > 0.16) {
        _puffT = 0;
        MECH.Scene3D.spawnPuff(D.field.x1 - 0.1, 1.15, D.troughZ + (Math.random() - 0.5) * 0.15,
          { max: 0.7, base: 0.30, vy: -0.4, opacity: 0.5, tint: 0xBFD9E8 });
      }
    }
    /* 田水面随累计灌量长高 */
    var fd = MECH.Parts.entry("field");
    if (fd && fd.shown && fd.group.userData.anim) {
      var w = fd.group.userData.anim.water;
      w.scale.y = Math.max(0.01, st.fieldWater / 0.20);
      w.position.y = 0.10 + st.fieldWater / 2;
    }
    /* 风向旗摆动(演示风) */
    var vn = MECH.Parts.entry("vane");
    if (vn && vn.shown && vn.group.userData.anim) {
      vn.group.userData.anim.flag.rotation.y = Math.sin(st.time * 2.6) * 0.28 + 0.35;
    }
  };

  /* seek 补偿:跳到运转段按风速历程预置相位/灌量 */
  var RUN_T = 28;
  function phaseStart(i) { var a = 0; for (var k = 0; k < i; k++) a += MECH.PHASES[k].dur; return a; }
  MECH.onSeek = function (i, st) {
    var start = phaseStart(i);
    if (start < RUN_T) return;
    var tRun = start - RUN_T;
    st.wind = 6; st.windTarget = 6;
    st.omegaWheel = D.omegaOf(6);
    st.thetaWheel = 2.31 * Math.max(0, tRun - 0.8) + 1.1 * Math.min(tRun, 0.8);
    st.sOff = D.i * st.thetaWheel * D.Rsp;
    st.flow = D.Qof(6);
    st.fieldWater = Math.min(0.20, tRun > 8 ? (tRun - 8) * 0.008 : 0);
  };

  MECH.status = function (st, ph, pt) {
    var pill = ph.name;
    if (st.running) pill = ph.name + " · 帆轮 " + st.thetaWheel.toFixed(1) + " rad";
    var margin = D.marginOf(Math.max(st.wind, 0.01));
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: st.wind.toFixed(1) + " m/s · ω轮 " + st.omegaWheel.toFixed(2),
      b: (st.omegaPump * D.Rsp).toFixed(3) + " m/s · Q " + (st.flow * 1000).toFixed(1) + " L/s",
      c: "裕度 " + margin.toFixed(2) + (margin >= 1.0 ? " ✓" : " 赤字")
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "mast") {
      return [
        { id: "p-shaft", obj: E("shaftCrown"), text: "立轴·卧轮 24T · 齿面朝上" },
        { id: "p-base", obj: E("base"), text: "石座 · 下轴承", tone: "white" }
      ];
    }
    if (ph.id === "sails") {
      return [
        { id: "p-sails", obj: E("sails"), text: "八帆 · 偏装 45°(复原值)" },
        { id: "p-vane", obj: E("vane"), text: "风向标 · 八方可受风", tone: "white" }
      ];
    }
    if (ph.id === "pump") {
      return [
        { id: "p-up", obj: E("upshaft"), text: "立轮 16T · 啮合距 1.00 = 0.60+0.40" },
        { id: "p-low", obj: E("lowshaft"), text: "下链轮 R0.13 · 浸水池", tone: "white" }
      ];
    }
    if (ph.id === "power" || ph.id === "field" || ph.id === "manual") {
      return [
        { id: "p-sails", obj: E("sails"), text: "八帆 ω轮=0.385·v风" },
        { id: "p-up", obj: E("upshaft"), text: "ω泵=1.5ω轮(24T:16T)", tone: "white" },
        { id: "p-tr", obj: E("outTrough"), text: "Q = v链·A·φ · 灌入西田" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
