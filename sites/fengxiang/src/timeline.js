/* 时间线(44s):箱体 → 活塞 → 四活门 → 鼓风管炉 → 慢推 → 快推 → 剖视气流 → 总结 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "box", name: "BOX · 箱体", dur: 4, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 4.2, target: [0, 0.7, 0] }, drift: 0.03 },
    { id: "piston", name: "PISTON · 活塞拉杆", dur: 4, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.24, r: 3.0, target: [0.3, 0.75, 0] }, drift: 0.01 },
    { id: "valves", name: "VALVES · 四枚活门", dur: 5, dot: "blue", mode: "ASSEMBLING",
      cam: { theta: 0.0, phi: 1.26, r: 2.8, target: [0.35, 0.85, 0] }, drift: 0.008 },
    { id: "forge", name: "FORGE · 鼓风管与炉火", dur: 4, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.45, phi: 1.18, r: 4.4, target: [0.8, 0.8, 0] }, drift: 0.02 },
    { id: "slow", name: "PUSH · 慢推 1.5 rad/s", dur: 7, dot: "green", mode: "PUSHING",
      cam: { theta: 0.75, phi: 1.22, r: 4.0, target: [0.5, 0.8, 0] }, drift: 0.01 },
    { id: "fast", name: "FAST · 快推 2.6 rad/s(火旺)", dur: 7, dot: "pink", mode: "FAST",
      cam: { theta: -0.5, phi: 1.20, r: 4.0, target: [0.5, 0.85, 0] }, drift: 0.02 },
    { id: "closeup", name: "VALVES CLOSE · 活门开合特写", dur: 6, dot: "yellow", mode: "CLOSE-UP",
      cam: { theta: 0.15, phi: 1.28, r: 2.3, target: [0.35, 0.9, 0] }, drift: 0.006 },
    { id: "summary", name: "SUMMARY · 双动原理", dur: 5, dot: "green", mode: "REVIEW",
      cam: { theta: 0.0, phi: 1.14, r: 4.6, target: [0.6, 0.8, 0] }, drift: 0.05 }
  ];
  MECH.PHASE_IDS = ["box", "piston", "valves", "forge", "slow", "fast", "closeup", "summary"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) { st.lastPhase = ph.id; }
    if (ph.id === "slow") st.omegaTarget = D.k.slow;
    else if (ph.id === "fast" || ph.id === "closeup") st.omegaTarget = D.k.fast;
    else st.omegaTarget = 0;
    var p0 = st.puffs;
    KS.step(st, dt);
    /* 出风粒子:频率与风速成正比,方向恒向炉 */
    var rate = st.airflow * 14;
    if (st._puffAcc === undefined) st._puffAcc = 0;
    st._puffAcc += rate * dt;
    if (st._puffAcc >= 1) {
      st._puffAcc -= 1;
      st.puffs++;
      MECH.Scene3D.spawnPuff(D.boxL / 2 + 1.02, D.boxH / 2 + 0.42 - 0.06, 0, {
        max: 0.7, base: 0.16, vx: 1.6 + Math.random() * 0.5, vy: 0.05 + Math.random() * 0.1,
        vz: (Math.random() - 0.5) * 0.08, opacity: 0.55, tint: 0xBFD8E8, grow: 1.2
      });
    }
    /* 火花随火势 */
    if (st.airflow > 0.5 && Math.random() < dt * 5) {
      MECH.Scene3D.spawnPuff(D.boxL / 2 + 1.75, 1.0, 0, {
        max: 0.8, base: 0.1, vx: (Math.random() - 0.5) * 0.3, vy: 1.1, vz: (Math.random() - 0.5) * 0.3,
        opacity: 0.8, tint: 0xF2A53A, grow: 1.0
      });
    }
  };

  MECH.status = function (st, ph, pt) {
    var dir = st.vx > 0.02 ? "右行" : st.vx < -0.02 ? "左行" : "换向";
    var pill = ph.name;
    if (ph.id === "slow" || ph.id === "fast" || ph.id === "closeup") {
      pill = ph.name + " · 活塞" + dir + " · 风量 " + Math.round(st.airflow * 100) + "%";
    }
    return {
      mode: ph.mode,
      hot: ph.id === "fast",
      pill: pill,
      a: "活塞 " + (st.x / D.stroke * 100).toFixed(0) + "%",
      b: "风量 " + Math.round(st.airflow * 100) + "%",
      c: st.puffs + " 喷"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "piston") return [{ id: "p-ps", obj: E("piston"), text: "活塞 · 双动:往复均出风" }];
    if (ph.id === "valves") return [
      { id: "p-il", obj: E("inL"), text: "进风活门 · 侧腔扩则开" },
      { id: "p-ol", obj: E("outL"), text: "出气活门 · 侧腔压则开", tone: "white" }
    ];
    if (ph.id === "forge") return [{ id: "p-fg", obj: E("forge"), text: "炉火 · 风助火势" }];
    if (ph.id === "slow" || ph.id === "fast" || ph.id === "closeup" || ph.id === "summary") return [
      { id: "p-ps", obj: E("piston"), text: "活塞 · 双动恒出风", tone: "white" },
      { id: "p-fg", obj: E("forge"), text: "恒向出风 → 炉火" }
    ];
    return [];
  };
})(window.MECH = window.MECH || {});
