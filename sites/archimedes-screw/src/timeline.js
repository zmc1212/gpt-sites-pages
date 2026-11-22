/* 时间线(56s 循环):池槽支架 → 螺旋筒 → 水团 → 慢转 → 快转 →
   圈数/扬程测读 → 倾角几何 → 流量收版(后段持续慢转) */
(function (MECH) {
  var D = MECH.DIM, KS = MECH.KS;

  MECH.PHASES = [
    { id: "frame", name: "FRAME · 池·槽·支架", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 1.30, phi: 1.10, r: 8.5, target: [0.3, 1.4, 0] }, drift: 0.02 },
    { id: "screw", name: "SCREW · 螺旋筒装配", dur: 6, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 1.35, phi: 1.08, r: 6.2, target: [0.5, 1.3, 0] }, drift: 0.012 },
    { id: "water", name: "WATER · 水团注入", dur: 5, dot: "blue", mode: "ASSEMBLING",
      cam: { theta: 1.40, phi: 1.10, r: 5.2, target: [0.7, 1.2, 0.2] }, drift: 0.012 },
    { id: "slow", name: "SLOW · 慢转 0.5 转/s", dur: 8, dot: "green", mode: "RUNNING",
      cam: { theta: 1.35, phi: 1.08, r: 6.2, target: [0.5, 1.3, 0] }, drift: 0.008 },
    { id: "fast", name: "FAST · 快转 2 转/s", dur: 8, dot: "orange", mode: "RUNNING",
      cam: { theta: 1.85, phi: 1.10, r: 6.2, target: [0.5, 1.3, 0] }, drift: 0.008 },
    { id: "measure", name: "MEASURE · N = L/P = 5.45 圈", dur: 6, dot: "yellow", mode: "MEASURING",
      cam: { theta: 1.30, phi: 1.12, r: 7.0, target: [0.3, 1.4, 0] }, drift: 0.008 },
    { id: "tilt", name: "GEOMETRY · 扬程 H = L·sinθ", dur: 6, dot: "pink", mode: "MEASURING",
      cam: { theta: 1.90, phi: 1.14, r: 7.5, target: [0.3, 1.4, 0] }, drift: 0.008 },
    { id: "flow", name: "FLOW · Q = V·n", dur: 8, dot: "red", mode: "FLOWING",
      cam: { theta: 1.35, phi: 1.10, r: 6.4, target: [0.5, 1.3, 0] }, drift: 0.008 }
  ];
  MECH.PHASE_IDS = ["frame", "screw", "water", "slow", "fast", "measure", "tilt", "flow"];

  MECH.newState = KS.newState;

  /* 各相位转速(rev/s);后段保持慢转 */
  var RATE = { frame: 0, screw: 0, water: 0, slow: 0.5, fast: 2.0, measure: 0.5, tilt: 0.5, flow: 1.0 };

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) { st.lastPhase = ph.id; st.phaseRate = RATE[ph.id] || 0; }
    KS.step(st, (st.phaseRate || 0) * dt);
    st.n = st.phaseRate || 0;
  };

  MECH.status = function (st, ph, pt) {
    var n = st.n || 0;
    var q = D.flow(n) * 1000;                     // L/s
    var revs = st.theta / (Math.PI * 2);
    return {
      mode: ph.mode,
      hot: ph.id === "fast",
      pill: ph.name,
      a: n.toFixed(2) + " 转/s",
      b: "Q " + (D.flow(n) * 1000).toFixed(1) + " L/s",
      c: "已转 " + revs.toFixed(1) + " 圈 · 溢出 " + Math.floor(revs / D.turns) + " 次"
    };
  };

  MECH.camAdj = function () { return null; };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? e.group : null; }
    if (ph.id === "screw") {
      return [
        { id: "p-screw", obj: E("screw"), text: "螺旋筒 · P 0.55 · L 3.0 m" },
        { id: "p-trough", obj: E("trough"), text: "高端出水槽 H 1.5 m", tone: "white" },
        { id: "p-basin", obj: E("basin"), text: "低端水池" }
      ];
    }
    if (ph.id === "water") {
      return [{ id: "p-water", obj: E("water"), text: "水团 ×10 · 转一圈前进一个螺距" }];
    }
    if (ph.id === "measure") {
      return [
        { id: "p-screw", obj: E("screw"), text: "N = L/P = 5.45 圈(水从低端到高端)" },
        { id: "p-trough", obj: E("trough"), text: "H = L·sin30° = 1.50 m", tone: "white" }
      ];
    }
    if (ph.id === "flow") {
      return [{ id: "p-water", obj: E("water"), text: "Q = V·n · V ≈ π(R²−r²)·P·f" }];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
