/* 时间线(60s 循环):框梁 → 左六档 → 右七档 → 置 1234 → 加 5678 →
   读数验证 6912 → 999+1 连环进位 → 1000 收版 */
(function (MECH) {
  var D = MECH.DIM, KS = MECH.KS;

  MECH.PHASES = [
    { id: "frame", name: "FRAME · 框梁座", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.10, phi: 1.42, r: 14.0, target: [0, 7.0, 0] }, drift: 0.02 },
    { id: "rods1", name: "RODS I · 左六档装配", dur: 6, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: -0.42, phi: 1.44, r: 10.5, target: [-3.4, 6.9, 0.7] }, drift: 0.012 },
    { id: "rods2", name: "RODS II · 右七档装配", dur: 7, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: 0.42, phi: 1.44, r: 10.5, target: [3.4, 6.9, 0.7] }, drift: 0.012 },
    { id: "setA", name: "SET · 置被加数 1234", dur: 9, dot: "blue", mode: "SETTING",
      cam: { theta: 0.18, phi: 1.47, r: 12.0, target: [1.8, 7.2, 0.8] }, drift: 0.008 },
    { id: "addB", name: "ADD · 加 5678(逐位口诀)", dur: 12, dot: "green", mode: "ADDING",
      cam: { theta: 0.18, phi: 1.47, r: 11.5, target: [1.8, 7.0, 0.9] }, drift: 0.006 },
    { id: "verify", name: "VERIFY · 读数 6912", dur: 6, dot: "yellow", mode: "VERIFYING",
      cam: { theta: 0.10, phi: 1.44, r: 13.5, target: [0, 7.3, 0.8] }, drift: 0.01 },
    { id: "carry", name: "CARRY · 999+1 连环进位", dur: 13, dot: "pink", mode: "CARRYING",
      cam: { theta: 0.20, phi: 1.47, r: 11.8, target: [1.8, 7.0, 0.9] }, drift: 0.006 },
    { id: "finale", name: "RESULT · 读数 1000", dur: 6, dot: "red", mode: "RESULT",
      cam: { theta: 0.10, phi: 1.44, r: 14.0, target: [0, 7.3, 0.8] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["frame", "rods1", "rods2", "setA", "addB", "verify", "carry", "finale"];

  MECH.newState = KS.newState;

  /* 各相位的节拍(days=schedule beat)推进区间 */
  var RATES = {
    setA: { from: 0, to: 4.3 },
    addB: { from: 4.3, to: 10.2 },
    verify: { from: 10.2, to: 10.2 },               // 冻结显示 6912
    carry: { from: D.CARRY_START, to: D.CARRY_START + KS.CARRY.moves.length + 0.6 },
    finale: { from: D.CARRY_START + KS.CARRY.moves.length + 0.6, to: D.CARRY_START + KS.CARRY.moves.length + 0.6 }
  };

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      st.t0 = st.days;
    }
    var r = RATES[ph.id];
    if (r) {
      st.days = r.from + (r.to - r.from) * Math.min(1, pt / ph.dur);
    }
    KS.step(st, 0);
  };

  MECH.status = function (st, ph, pt) {
    var sch = KS.scheduleAt(st.days);
    var v = KS.value(sch.up, sch.down);
    var fmt = (function (n) {
      var s = String(Math.round(n));
      return s;
    })(v);
    var move = sch.active ? sch.active.move.text : "—";
    return {
      mode: ph.mode,
      hot: ph.id === "carry",
      pill: ph.name,
      a: move,
      b: "读数 " + fmt,
      c: sch.seg === "ADD" ? "1234 + 5678" : "999 + 1"
    };
  };

  MECH.anomalyPct = function () { return 0; };       // 接口占位(无行差概念)

  MECH.pinnedFor = function (ph, st) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? e.group : null; }
    if (ph.id === "rods1" || ph.id === "rods2") {
      return [
        { id: "p-rod12", obj: E("rod12"), text: "个位档 · 位值 1" },
        { id: "p-rod9", obj: E("rod9"), text: "千位档 · 位值 1000", tone: "white" }
      ];
    }
    if (ph.id === "setA" || ph.id === "addB" || ph.id === "carry") {
      var sch = KS.scheduleAt(st ? st.days : 0);
      var list = [];
      if (sch.active) {
        var PLACE = { 9: "千位", 10: "百位", 11: "十位", 12: "个位" };
        list.push({ id: "p-move", obj: E("rod" + sch.active.move.rod),
          text: "口诀 " + sch.active.move.text + " · " + (PLACE[sch.active.move.rod] || "第" + (sch.active.move.rod + 1) + "档") });
      }
      list.push({ id: "p-rod12", obj: E("rod12"), text: "个位档", tone: "white" });
      return list;
    }
    if (ph.id === "verify" || ph.id === "finale") {
      return [
        { id: "p-rod9", obj: E("rod9"), text: ph.id === "verify" ? "千位 6" : "千位 1" },
        { id: "p-rod12", obj: E("rod12"), text: ph.id === "verify" ? "个位 2" : "个位 0", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
