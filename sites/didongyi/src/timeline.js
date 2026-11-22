/* 时间线(46s):基座都柱 → 铜樽半剖 → 八道 → 龙首蟾蜍含丸 →
   东西震 → 南北震 → 东北震 → 自由触发(←/→ 选方位即震) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "base", name: "BASE · 基座与都柱", dur: 4, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 5.6, target: [0, 1.4, 0] }, drift: 0.03 },
    { id: "vat", name: "VAT · 铜樽半剖", dur: 5, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.22, r: 4.6, target: [0, 1.6, 0] }, drift: 0.012 },
    { id: "channels", name: "CHANNELS · 八道机关", dur: 4, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.0, phi: 1.26, r: 3.6, target: [0, 1.3, 0.4] }, drift: 0.008 },
    { id: "dragons", name: "DRAGONS · 八龙含丸 · 八蟾承之", dur: 6, dot: "pink", mode: "ASSEMBLING",
      cam: { theta: -0.35, phi: 1.14, r: 5.4, target: [0, 1.6, 0] }, drift: 0.02 },
    { id: "quakeE", name: "QUAKE-E · 东震 · 龙吐丸", dur: 6, dot: "green", mode: "E-QUAKE",
      cam: { theta: 0.22, phi: 1.22, r: 4.6, target: [0, 1.5, 0] }, drift: 0.008 },
    { id: "quakeS", name: "QUAKE-S · 南震 · 蟾蜍承之", dur: 6, dot: "blue", mode: "S-QUAKE",
      cam: { theta: -0.12, phi: 1.22, r: 4.6, target: [0, 1.5, 0] }, drift: 0.008 },
    { id: "quakeNE", name: "QUAKE-NE · 东北震", dur: 6, dot: "yellow", mode: "NE-QUAKE",
      cam: { theta: 0.30, phi: 1.24, r: 4.4, target: [0, 1.5, 0] }, drift: 0.008 },
    { id: "manual", name: "MANUAL · 按 ←/→ 触发八方地震", dur: 10, dot: "red", mode: "MANUAL",
      cam: { theta: 0.35, phi: 1.20, r: 5.6, target: [0, 1.5, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["base", "vat", "channels", "dragons", "quakeE", "quakeS", "quakeNE", "manual"];

  var autoQuakes = { quakeE: 2, quakeS: 4, quakeNE: 1 };   // 阶段 → 方位

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      st.manual = ph.id === "manual";
      if (autoQuakes[ph.id] !== undefined && pt < dt * 1.5) KS.quake(st, autoQuakes[ph.id]);
    }
    /* 自由模式:←/→ 切换方位并立即触发该方位地震 */
    if (st.manual && MECH.keys) {
      var L = MECH.keys.left, R = MECH.keys.right;
      if (L && !st._keyL) { st.selDir = (st.selDir + 1) % 8; KS.quake(st, st.selDir); }
      if (R && !st._keyR) { st.selDir = (st.selDir + 7) % 8; KS.quake(st, st.selDir); }
      st._keyL = L; st._keyR = R;
    }
    KS.step(st, dt);
    /* 落丸水花/尘粒 */
    for (var i = 0; i < st.flights.length; i++) {
      var f = st.flights[i];
      var t = (st.time - f.t0) / D.flightT;
      if (t > 0.9 && Math.random() < dt * 8) {
        var v = D.dirs8[f.dir];
        MECH.Scene3D.spawnPuff(v.x * D.toadR, D.toadY + 0.25, v.z * D.toadR, {
          max: 0.5, base: 0.18, vx: 0.1, vy: 0.5, vz: 0.1, opacity: 0.6, tint: 0xC9B89A, grow: 1.4
        });
      }
    }
  };

  MECH.status = function (st, ph, pt) {
    var deg = (st.theta * 180 / Math.PI).toFixed(2);
    var pill = ph.name;
    if (st.quake) pill = ph.name + " · 摆 " + deg + "° → " + D.dirs8[st.quake.dir].name;
    else if (st.manual) pill = "MANUAL · 已选 " + D.dirs8[st.selDir].name + " · ←/→ 触发";
    var caught = 0;
    for (var k = 0; k < 8; k++) caught += st.caught[k];
    return {
      mode: ph.mode,
      hot: !!st.quake,
      pill: pill,
      a: deg + "°",
      b: st.quake ? D.dirs8[st.quake.dir].name : (st.manual ? D.dirs8[st.selDir].name : "—"),
      c: caught + " 丸"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "base") return [{ id: "p-pd", obj: E("pendulum"), text: "都柱 · 倒立摆 · 触发角 6°" }];
    if (ph.id === "vat") return [{ id: "p-vt", obj: E("vat"), text: "铜樽半剖 · 露都柱八道" }];
    if (ph.id === "channels") return [{ id: "p-ch", obj: E("channels"), text: "八道 · 傍行八向机关" }];
    if (ph.id === "dragons") return [
      { id: "p-dg", obj: E("dragon2"), text: "龙首(东) · 口含铜丸" },
      { id: "p-td", obj: E("toad2"), text: "蟾蜍 · 张口承丸", tone: "white" }
    ];
    if (ph.id === "quakeE" || ph.id === "quakeS" || ph.id === "quakeNE") {
      var dirK = autoQuakes[ph.id];
      return [
        { id: "p-dg", obj: E("dragon" + dirK), text: D.dirs8[dirK].name + "龙 · 触发吐丸" },
        { id: "p-td", obj: E("toad" + dirK), text: "蟾蜍承丸 · 振声报警", tone: "white" }
      ];
    }
    if (ph.id === "manual") return [
      { id: "p-pd", obj: E("pendulum"), text: "都柱 · ←/→ 选方位即震" }
    ];
    return [];
  };
})(window.MECH = window.MECH || {});
