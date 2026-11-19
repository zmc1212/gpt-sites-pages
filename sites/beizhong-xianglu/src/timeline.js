/* 时间线(44s):锦缎外壳 → 双环 → 炉体点香 → 缓翻(炉体常平) →
   快翻 → 手动冲量(←/→) → 总结 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "cloth", name: "CLOTH · 锦缎与外壳", dur: 4, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.22, r: 3.2, target: [0, 0.4, 0] }, drift: 0.03 },
    { id: "ring1", name: "RING 1 · 机环一", dur: 3, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.24, r: 2.4, target: [0, 0.42, 0] }, drift: 0.01 },
    { id: "ring2", name: "RING 2 · 机环二", dur: 3, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.35, phi: 1.24, r: 2.4, target: [0, 0.42, 0] }, drift: 0.01 },
    { id: "burner", name: "BURNER · 炉体点香", dur: 4, dot: "pink", mode: "ASSEMBLING",
      cam: { theta: 0.15, phi: 1.26, r: 2.4, target: [0, 0.42, 0] }, drift: 0.01 },
    { id: "slow", name: "TUMBLE · 缓翻(炉体常平)", dur: 8, dot: "green", mode: "TUMBLING",
      cam: { theta: 0.75, phi: 1.20, r: 3.0, target: [0, 0.4, 0] }, drift: 0.01 },
    { id: "fast", name: "FAST · 快翻", dur: 7, dot: "blue", mode: "TUMBLING",
      cam: { theta: -0.5, phi: 1.18, r: 3.0, target: [0, 0.4, 0] }, drift: 0.02 },
    { id: "kick", name: "KICK · 手动冲量(←/→)", dur: 8, dot: "red", mode: "MANUAL",
      cam: { theta: 0.25, phi: 1.22, r: 3.0, target: [0, 0.4, 0] }, drift: 0.02 },
    { id: "summary", name: "SUMMARY · 机环常平", dur: 5, dot: "green", mode: "REVIEW",
      cam: { theta: 0.0, phi: 1.14, r: 3.4, target: [0, 0.4, 0] }, drift: 0.05 }
  ];
  MECH.PHASE_IDS = ["cloth", "ring1", "ring2", "burner", "slow", "fast", "kick", "summary"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      st.manual = ph.id === "kick";
      if (ph.id === "burner") st.lit = true;
    }
    if (st.manual && MECH.keys) {
      var L = MECH.keys.left, R = MECH.keys.right;
      if ((L || R) && !st._keyL && !st._keyR) st.kick += (R ? 1 : -1) * 0.5;
      st._keyL = L; st._keyR = R;
    }
    KS.step(st, dt);
  };

  MECH.status = function (st, ph, pt) {
    var pill = ph.name;
    if (ph.id === "slow" || ph.id === "fast" || ph.id === "kick") {
      pill = ph.name + " · 炉体误差 0.000°";
    }
    return {
      mode: ph.mode,
      hot: ph.id === "fast" || ph.id === "kick",
      pill: pill,
      a: "壳 " + Math.round(st.a * 180 / Math.PI) + "/" + Math.round(st.b * 180 / Math.PI) + "°",
      b: "炉体 0.000°",
      c: st.lit ? "香燃" : "未点"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "shell") return [{ id: "p-sh", obj: E("shell"), text: "镂空外壳 · 机环转运四周" }];
    if (ph.id === "ring1") return [{ id: "p-r1", obj: E("ring1"), text: "机环一 · 枢轴 ±X" }];
    if (ph.id === "ring2") return [{ id: "p-r2", obj: E("ring2"), text: "机环二 · 枢轴 ±Z" }];
    if (ph.id === "burner") return [{ id: "p-b", obj: E("burner"), text: "炉体常平 · 重力下垂" }];
    if (ph.id === "slow" || ph.id === "fast" || ph.id === "kick" || ph.id === "summary") return [
      { id: "p-b", obj: E("burner"), text: "炉体恒平 · 香灰不洒", tone: "white" },
      { id: "p-sh", obj: E("shell"), text: "任意翻转 · 环反补" }
    ];
    return [];
  };
})(window.MECH = window.MECH || {});
