/* 时间线(60s 循环):黄铜匣 → 读数鼓轮 → 输入轮+进位杆 → 置 1234 →
   加 5678(逐位输入,sautoir 进位)→ 读数验证 6912 → 999+1 连环进位 → 1000 */
(function (MECH) {
  var D = MECH.DIM, KS = MECH.KS;

  MECH.PHASES = [
    { id: "frame", name: "CASE · 黄铜匣与支架", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.20, phi: 1.18, r: 14.5, target: [0, 6.4, 0] }, drift: 0.02 },
    { id: "drums", name: "DRUMS · 结果鼓轮 ×6", dur: 6, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.15, phi: 1.00, r: 11.0, target: [0, 7.8, -1.0] }, drift: 0.012 },
    { id: "inputs", name: "INPUTS · 输入轮与 sautoir", dur: 7, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: 0.22, phi: 1.22, r: 12.0, target: [0, 6.4, 1.2] }, drift: 0.012 },
    { id: "setA", name: "SET · 置 1234", dur: 9, dot: "blue", mode: "SETTING",
      cam: { theta: 0.18, phi: 1.16, r: 13.5, target: [0, 6.6, 0.4] }, drift: 0.008 },
    { id: "addB", name: "ADD · 输入 5678(sautoir 进位)", dur: 12, dot: "green", mode: "ADDING",
      cam: { theta: 0.18, phi: 1.16, r: 13.0, target: [0, 6.6, 0.4] }, drift: 0.006 },
    { id: "verify", name: "VERIFY · 读数 6912", dur: 6, dot: "yellow", mode: "VERIFYING",
      cam: { theta: 0.12, phi: 0.78, r: 13.0, target: [0, 7.4, -1.2] }, drift: 0.01 },
    { id: "carry", name: "CARRY · 999+1 连环进位", dur: 12, dot: "pink", mode: "CARRYING",
      cam: { theta: 0.20, phi: 1.16, r: 13.2, target: [0, 6.6, 0.4] }, drift: 0.006 },
    { id: "finale", name: "RESULT · 读数 1000", dur: 6, dot: "red", mode: "RESULT",
      cam: { theta: 0.12, phi: 0.78, r: 13.5, target: [0, 7.4, -1.2] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["frame", "drums", "inputs", "setA", "addB", "verify", "carry", "finale"];

  MECH.newState = KS.newState;

  var RATES = {
    setA: { from: 0, to: 4.3 },
    addB: { from: 4.3, to: 10.2 },
    verify: { from: 8.9, to: 8.9 },               // ADD 8 步完(7.8)后、CARRY_START(9.5)前
    carry: { from: D.CARRY_START, to: D.CARRY_START + KS.CARRY.moves.length + 0.6 },
    finale: { from: D.CARRY_START + KS.CARRY.moves.length + 0.6, to: D.CARRY_START + KS.CARRY.moves.length + 0.6 }
  };

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) { st.lastPhase = ph.id; st.t0 = st.days; }
    var r = RATES[ph.id];
    if (r) st.days = r.from + (r.to - r.from) * Math.min(1, pt / ph.dur);
    KS.step(st, 0);
    /* 进位累计(状态卡) */
    var sch = KS.scheduleAt(st.days);
    st.carries = sch.seg === "ADD"
      ? sch.carries
      : KS.CARRY.moves.reduce(function (a, m) { return a + m.carries; }, 0) * 0 + sch.carries;
  };

  MECH.status = function (st, ph, pt) {
    var sch = KS.scheduleAt(st.days);
    var v = KS.value(sch.dg.map(function (d) { return Math.round(d) % 10; }));
    var move = sch.active ? sch.active.move.text : "—";
    return {
      mode: ph.mode,
      hot: ph.id === "carry",
      pill: ph.name,
      a: move,
      b: "读数 " + v,
      c: "进位 ×" + Math.round(sch.carries || 0)
    };
  };

  MECH.pinnedFor = function (ph, st) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? e.group : null; }
    if (ph.id === "drums") {
      return [
        { id: "p-drums", obj: E("drums"), text: "结果鼓轮 ×6 · 读数窗" },
        { id: "p-case", obj: E("case"), text: "黄铜匣 · 巴黎工艺博物馆藏制式", tone: "white" }
      ];
    }
    if (ph.id === "inputs") {
      return [
        { id: "p-inputs", obj: E("inputs"), text: "输入辐条轮 36°/位" },
        { id: "p-saut", obj: E("inputs"), text: "sautoir 进位杆 ×5 · 9→0 落下传 +1", tone: "white" }
      ];
    }
    if (ph.id === "setA" || ph.id === "addB" || ph.id === "carry") {
      var sch = KS.scheduleAt(st ? st.days : 0);
      var list = [];
      if (sch.active) {
        list.push({ id: "p-move", obj: E("inputs"), text: "输入 " + sch.active.move.text });
      }
      list.push({ id: "p-drums", obj: E("drums"), text: "鼓轮读数窗", tone: "white" });
      return list;
    }
    if (ph.id === "verify" || ph.id === "finale") {
      return [
        { id: "p-drums", obj: E("drums"), text: ph.id === "verify" ? "读数 6912" : "读数 1000" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
