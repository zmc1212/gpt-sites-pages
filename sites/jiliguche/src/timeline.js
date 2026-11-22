/* 时间线(46s):底盘 → 齿轮系 → 车厢木人 → 独辕 → 慢行记里 → 快行 → 十里击镯 → 总结 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "base", name: "CHASSIS · 底盘双足轮", dur: 4, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 7.0, target: [0, 1.0, 0] }, drift: 0.03 },
    { id: "train", name: "GEAR TRAIN · 厢内齿轮系", dur: 6, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.24, r: 4.2, target: [-0.3, 1.8, -0.4] }, drift: 0.008 },
    { id: "cabin", name: "CABIN · 车厢与木人", dur: 6, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.35, phi: 1.18, r: 5.6, target: [0, 1.8, 0] }, drift: 0.015 },
    { id: "yuan", name: "SHAFT · 独辕辕轭", dur: 3, dot: "blue", mode: "ASSEMBLING",
      cam: { theta: 0.65, phi: 1.16, r: 6.2, target: [0, 1.3, 0.6] }, drift: 0.02 },
    { id: "slow", name: "RUN · 慢行记里(每 2 转一里)", dur: 8, dot: "green", mode: "RECORDING",
      cam: { theta: 0.85, phi: 1.22, r: 8.0, target: [0, 1.4, 0] }, drift: 0.01 },
    { id: "fast", name: "FAST · 快行(击鼓频密)", dur: 7, dot: "pink", mode: "RECORDING",
      cam: { theta: -0.55, phi: 1.20, r: 7.6, target: [0, 1.4, 0] }, drift: 0.02 },
    { id: "gong", name: "GONG · 十里击镯(上层)", dur: 7, dot: "yellow", mode: "GONG",
      cam: { theta: 0.30, phi: 1.14, r: 5.4, target: [0, 2.2, 0] }, drift: 0.008 },
    { id: "summary", name: "SUMMARY · 齿轮比 100:1", dur: 5, dot: "green", mode: "REVIEW",
      cam: { theta: 0.0, phi: 1.12, r: 8.8, target: [0, 1.5, 0] }, drift: 0.05 }
  ];
  MECH.PHASE_IDS = ["base", "train", "cabin", "yuan", "slow", "fast", "gong", "summary"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) { st.lastPhase = ph.id; st.events = []; }
    if (ph.id === "slow") st.vTarget = D.vK.slow;
    else if (ph.id === "fast" || ph.id === "gong") st.vTarget = D.vK.fast;
    else st.vTarget = 0;
    var ev0 = st.events.length;
    KS.step(st, dt);
    /* 击鼓 → 鼓面尘粒 + 粒子从木人臂端 */
    if (st.events.length > ev0 && ph.id !== "summary") {
      var ev = st.events[st.events.length - 1];
      var sx = ev.side === 0 ? 0.40 : -0.40;
      MECH.Scene3D.spawnPuff(sx, D.axleY + D.boxH1 + 0.42, 0.30, {
        max: 0.6, base: 0.22, vx: 0.15, vy: 0.6, vz: 0.15, opacity: 0.6, tint: 0xC9B89A, grow: 1.5
      });
    }
    if (st.gongArm > 0.5 && Math.random() < dt * 4) {
      MECH.Scene3D.spawnPuff(0, D.axleY + D.boxH1 + D.boxH2 + 0.35, -0.28, {
        max: 0.5, base: 0.2, vx: 0.1, vy: 0.5, vz: 0.1, opacity: 0.6, tint: 0xD4AF37, grow: 1.4
      });
    }
  };

  MECH.status = function (st, ph, pt) {
    var revs = st.psi / (2 * Math.PI);
    var pill = ph.name;
    if (ph.id === "slow" || ph.id === "fast" || ph.id === "gong") {
      pill = ph.name + " · " + revs.toFixed(1) + " 转";
    }
    return {
      mode: ph.mode,
      hot: ph.id === "fast",
      pill: pill,
      a: st.v.toFixed(2) + " m/s",
      b: "转 " + revs.toFixed(1) + " / 里 " + st.chiCount,
      c: "真实 " + (revs / 100 * 565).toFixed(0) + " m"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "base") return [{ id: "p-w", obj: E("wheelL"), text: "足轮 · 径六尺 · 周 18 尺" }];
    if (ph.id === "train") return [
      { id: "p-li", obj: E("train"), text: "立轮 100 齿 → 下平 10 → 旋风 10 → 中平 100" }
    ];
    if (ph.id === "cabin") return [
      { id: "p-sl", obj: E("statueL"), text: "击鼓木人 · 左右交替" },
      { id: "p-sg", obj: E("statueG"), text: "击镯木人 · 上层", tone: "white" }
    ];
    if (ph.id === "slow" || ph.id === "fast" || ph.id === "gong" || ph.id === "summary") return [
      { id: "p-sl", obj: E("statueL"), text: "过里击鼓 · 左右交替", tone: "white" },
      { id: "p-w", obj: E("wheelL"), text: "真实一里 = 100 转(演示 2 转)" }
    ];
    return [];
  };
})(window.MECH = window.MECH || {});
