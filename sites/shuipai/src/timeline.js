/* 时间线(44s):轮轴 → 曲柄连杆滑块 → 风箱 → 冶炉 → 慢速 → 快速 → 连杆特写 → 总结 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "wheel", name: "WHEEL · 立轮与轴承", dur: 4, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.18, r: 6.6, target: [0, 1.6, 0.6] }, drift: 0.03 },
    { id: "crank", name: "CRANK · 曲柄连杆滑块", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.24, r: 3.6, target: [-0.1, 1.5, 0.6] }, drift: 0.008 },
    { id: "bellows", name: "BELLOW · 门式风箱", dur: 4, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.35, phi: 1.20, r: 4.2, target: [0.5, 1.4, 0.4] }, drift: 0.015 },
    { id: "forge", name: "FORGE · 冶炉", dur: 3, dot: "blue", mode: "ASSEMBLING",
      cam: { theta: 0.75, phi: 1.18, r: 5.4, target: [0.8, 1.2, 0] }, drift: 0.02 },
    { id: "slow", name: "RUN · 慢速鼓风 0.9 rad/s", dur: 7, dot: "green", mode: "RUNNING",
      cam: { theta: 0.80, phi: 1.20, r: 6.4, target: [0.5, 1.4, 0.3] }, drift: 0.01 },
    { id: "fast", name: "FAST · 快速 1.7 rad/s", dur: 7, dot: "pink", mode: "FAST",
      cam: { theta: -0.5, phi: 1.18, r: 6.0, target: [0.5, 1.5, 0.3] }, drift: 0.02 },
    { id: "closeup", name: "LINKAGE · 连杆特写(λ=0.26)", dur: 6, dot: "yellow", mode: "CLOSE-UP",
      cam: { theta: 0.15, phi: 1.26, r: 2.8, target: [-0.1, 1.5, 0.7] }, drift: 0.006 },
    { id: "summary", name: "SUMMARY · 曲柄滑块原理", dur: 5, dot: "green", mode: "REVIEW",
      cam: { theta: 0.0, phi: 1.12, r: 7.0, target: [0.4, 1.4, 0.2] }, drift: 0.05 }
  ];
  MECH.PHASE_IDS = ["wheel", "crank", "bellows", "forge", "slow", "fast", "closeup", "summary"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) { st.lastPhase = ph.id; }
    if (ph.id === "slow") st.omegaTarget = D.k.slow;
    else if (ph.id === "fast" || ph.id === "closeup") st.omegaTarget = D.k.fast;
    else st.omegaTarget = 0;
    var cyc0 = st.strokes;
    KS.step(st, dt);
    /* 出风粒子(门闭合时) */
    var rate = st.airflow * 10;
    if (st._puffAcc === undefined) st._puffAcc = 0;
    st._puffAcc += rate * dt;
    if (st._puffAcc >= 1) {
      st._puffAcc -= 1;
      MECH.Scene3D.spawnPuff(1.35, D.yC - 0.34 - 0.06, 0.42, {
        max: 0.7, base: 0.16, vx: 1.5 + Math.random() * 0.4, vy: 0.02, vz: (Math.random() - 0.5) * 0.06,
        opacity: 0.5, tint: 0xBFD8E8, grow: 1.2
      });
    }
    /* 水流冲轮缘 */
    if (st.omega > 0.3 && Math.random() < dt * 6) {
      MECH.Scene3D.spawnPuff(-2.4 + Math.random() * 1.2, D.waterY + 0.1, 1.1, {
        max: 1.0, base: 0.3, vx: 1.2, vy: 0.08, vz: 0, opacity: 0.4, tint: 0x9FD4E8, grow: 1.3
      });
    }
  };

  MECH.status = function (st, ph, pt) {
    var pill = ph.name;
    if (ph.id === "slow" || ph.id === "fast" || ph.id === "closeup") {
      pill = ph.name + " · " + (st.omega / (2 * Math.PI) * 60).toFixed(1) + " RPM";
    }
    return {
      mode: ph.mode,
      hot: ph.id === "fast",
      pill: pill,
      a: "滑块 " + (st.slide / (D.l + D.r) * 100).toFixed(0) + "%",
      b: "风量 " + Math.round(st.airflow * 100) + "%",
      c: st.strokes + " 行程"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "wheel") return [{ id: "p-w", obj: E("wheel"), text: "立轮 R 1.4 · 水驱动" }];
    if (ph.id === "crank") return [
      { id: "p-cr", obj: E("crank"), text: "曲柄 r 0.24 · λ=0.26" },
      { id: "p-sl", obj: E("slide"), text: "滑块行程 2r = 0.48", tone: "white" }
    ];
    if (ph.id === "bellows") return [{ id: "p-bl", obj: E("bellows"), text: "门式风箱 · 双扇开合" }];
    if (ph.id === "slow" || ph.id === "fast" || ph.id === "closeup" || ph.id === "summary") return [
      { id: "p-cr", obj: E("crank"), text: "曲柄滑块 · 连杆往复", tone: "white" },
      { id: "p-fg", obj: E("forge"), text: "水力鼓风助冶" }
    ];
    return [];
  };
})(window.MECH = window.MECH || {});
