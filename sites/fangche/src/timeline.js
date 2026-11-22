/* 时间线(44s):机架 → 大轮 → 踏板 → 三锭 → 绳圈 → 轻踏 → 快踏 → 总结 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "frame", name: "FRAME · 机架", dur: 4, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 4.4, target: [0, 0.5, 0] }, drift: 0.03 },
    { id: "wheel", name: "WHEEL · 大绳轮", dur: 4, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.24, r: 2.8, target: [0.5, 0.65, 0] }, drift: 0.01 },
    { id: "pedals", name: "PEDALS · 双踏板曲柄", dur: 4, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.35, phi: 1.22, r: 2.8, target: [0.5, 0.5, 0] }, drift: 0.012 },
    { id: "spindles", name: "SPINDLES · 三锭并列", dur: 5, dot: "pink", mode: "ASSEMBLING",
      cam: { theta: 0.15, phi: 1.24, r: 3.0, target: [-0.4, 0.45, 0] }, drift: 0.01 },
    { id: "slow", name: "TREADLE · 轻踏 1.6 rad/s", dur: 7, dot: "green", mode: "SPINNING",
      cam: { theta: 0.75, phi: 1.20, r: 3.8, target: [0, 0.5, 0] }, drift: 0.01 },
    { id: "fast", name: "FAST · 快踏 2.9 rad/s", dur: 7, dot: "blue", mode: "FAST",
      cam: { theta: -0.5, phi: 1.18, r: 3.6, target: [0, 0.55, 0] }, drift: 0.02 },
    { id: "closeup", name: "CLOSE · 锭速特写(×16.7)", dur: 6, dot: "yellow", mode: "CLOSE-UP",
      cam: { theta: 0.20, phi: 1.28, r: 1.9, target: [-0.5, 0.45, 0] }, drift: 0.006 },
    { id: "summary", name: "SUMMARY · 绳传动比", dur: 5, dot: "green", mode: "REVIEW",
      cam: { theta: 0.0, phi: 1.12, r: 4.4, target: [0, 0.5, 0] }, drift: 0.05 }
  ];
  MECH.PHASE_IDS = ["frame", "wheel", "pedals", "spindles", "slow", "fast", "closeup", "summary"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) { st.lastPhase = ph.id; }
    if (ph.id === "slow") st.omegaTarget = D.k.slow;
    else if (ph.id === "fast" || ph.id === "closeup") st.omegaTarget = D.k.fast;
    else st.omegaTarget = 0;
    KS.step(st, dt);
    /* 纺线飞絮粒子(锭尖) */
    if (st.omega > 0.8 && Math.random() < dt * 5) {
      MECH.Scene3D.spawnPuff(-0.62, 0.44, D.zSpindles[Math.floor(Math.random() * 3)], {
        max: 0.8, base: 0.10, vx: -0.15, vy: 0.25 + Math.random() * 0.15, vz: (Math.random() - 0.5) * 0.2,
        opacity: 0.45, tint: 0xE0D2B0, grow: 1.6
      });
    }
  };

  MECH.status = function (st, ph, pt) {
    var pill = ph.name;
    if (ph.id === "slow" || ph.id === "fast" || ph.id === "closeup") {
      pill = ph.name + " · 锭 " + Math.round(D.spOmegaOf(st.omega) / (2 * Math.PI) * 60) + " RPM";
    }
    return {
      mode: ph.mode,
      hot: ph.id === "fast",
      pill: pill,
      a: "轮 " + (st.omega / (2 * Math.PI) * 60).toFixed(0) + " RPM",
      b: "锭 " + Math.round(D.spOmegaOf(st.omega) / (2 * Math.PI) * 60) + " RPM",
      c: "比 ×" + D.ratio.toFixed(1)
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "wheel") return [{ id: "p-w", obj: E("wheel"), text: "大绳轮 · 径二尺三寸" }];
    if (ph.id === "pedals") return [{ id: "p-pd", obj: E("pedalL"), text: "双踏板 · 相位差 90°" }];
    if (ph.id === "spindles") return [
      { id: "p-s1", obj: E("sp0"), text: "锭子 ×3 · 绳圈传动 ×16.7" }
    ];
    if (ph.id === "slow" || ph.id === "fast" || ph.id === "closeup" || ph.id === "summary") return [
      { id: "p-s2", obj: E("sp1"), text: "锭速 = 轮速×R/r", tone: "white" },
      { id: "p-w", obj: E("wheel"), text: "脚踏曲柄驱动" }
    ];
    return [];
  };
})(window.MECH = window.MECH || {});
