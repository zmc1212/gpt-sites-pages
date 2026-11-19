/* 时间线(44s):支架 → 风道箱 → 扇叶轮 → 谷斗活门 → 手摇风选 → 快摇分级 →
   落点特写 → 手动(←/→ 调速) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "base", name: "BASE · 支架风道箱", dur: 4, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 4.0, target: [0, 0.75, 0] }, drift: 0.03 },
    { id: "fan", name: "FAN · 扇叶轮 6 叶", dur: 4, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.24, r: 2.6, target: [-0.25, 0.75, 0] }, drift: 0.01 },
    { id: "hopper", name: "HOPPER · 谷斗活门", dur: 4, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.30, phi: 1.22, r: 2.8, target: [-0.35, 1.0, 0] }, drift: 0.01 },
    { id: "outlets", name: "OUTLETS · 双出口(糠远谷近)", dur: 3, dot: "blue", mode: "READY",
      cam: { theta: 0.75, phi: 1.18, r: 4.2, target: [0.3, 0.7, 0] }, drift: 0.02 },
    { id: "slow", name: "WINNOW · 手摇风选 2.2 rad/s", dur: 8, dot: "green", mode: "WINNOWING",
      cam: { theta: 0.75, phi: 1.22, r: 4.4, target: [0, 0.8, 0] }, drift: 0.01 },
    { id: "fast", name: "FAST · 快摇分级 3.4 rad/s", dur: 7, dot: "pink", mode: "FAST",
      cam: { theta: -0.5, phi: 1.20, r: 4.2, target: [0, 0.85, 0] }, drift: 0.02 },
    { id: "closeup", name: "CLOSE · 落点分级特写", dur: 6, dot: "yellow", mode: "CLOSE-UP",
      cam: { theta: 0.20, phi: 1.30, r: 2.6, target: [0.3, 0.55, 0] }, drift: 0.006 },
    { id: "manual", name: "MANUAL · ←/→ 调速", dur: 8, dot: "red", mode: "MANUAL",
      cam: { theta: 0.50, phi: 1.20, r: 4.4, target: [0, 0.8, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["base", "fan", "hopper", "outlets", "slow", "fast", "closeup", "manual"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      st.manual = ph.id === "manual";
      if (ph.id === 'outlets' || ph.id === 'slow' || ph.id === 'manual') { st.landedFar = 0; st.landedNear = 0; }
    }
    if (ph.id === "slow") st.omegaTarget = D.k.slow;
    else if (ph.id === "fast" || ph.id === "closeup") st.omegaTarget = D.k.fast;
    else st.omegaTarget = 0;
    if (st.manual && MECH.keys) {
      var L = MECH.keys.left, R = MECH.keys.right;
      if (L && !st._keyL) st.omegaTarget = Math.min(D.k.fast + 0.6, st.omegaTarget + 0.4);
      if (R && !st._keyR) st.omegaTarget = Math.max(0.4, st.omegaTarget - 0.4);
      st._keyL = L; st._keyR = R;
    }
    var far0 = st.landedFar;
    KS.step(st, dt);
    st.airOut = st.omega > 0.8;
    /* 出糠口/落点粒子 */
    if (st.landedFar > far0 && st.airOut) {
      MECH.Scene3D.spawnPuff(D.outFar + 0.1, 0.60, (Math.random() - 0.5) * 0.2, {
        max: 0.7, base: 0.16, vx: 0.5, vy: 0.12, vz: (Math.random() - 0.5) * 0.15,
        opacity: 0.5, tint: 0xD8C8A8, grow: 1.6
      });
    }
    if (st.airOut && Math.random() < dt * 4) {
      MECH.Scene3D.spawnPuff(-(D.boxL / 2 - 0.21), D.boxH / 2 + 0.44, 0, {
        max: 0.6, base: 0.12, vx: 1.4, vy: 0.1, vz: (Math.random() - 0.5) * 0.1,
        opacity: 0.4, tint: 0xBFD8E8, grow: 1.3
      });
    }
  };

  MECH.status = function (st, ph, pt) {
    var pill = ph.name;
    if (ph.id === "slow" || ph.id === "fast" || ph.id === "manual") {
      pill = ph.name + " · " + (st.omega / (2 * Math.PI) * 60).toFixed(0) + " RPM";
    }
    return {
      mode: ph.mode,
      hot: ph.id === "fast",
      pill: pill,
      a: "轮 " + Math.round(st.omega / (2 * Math.PI) * 60) + " RPM",
      b: "糠 " + st.landedFar + " / 谷 " + st.landedNear,
      c: "活门 " + Math.round(st.gate * 100) + "%"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "fan") return [{ id: "p-f", obj: E("fan"), text: "扇叶轮 6 叶 · 手摇曲柄" }];
    if (ph.id === "hopper") return [{ id: "p-h", obj: E("hopper"), text: "谷斗 · 活门率 ∝ 开度" }];
    if (ph.id === "outlets") return [{ id: "p-b", obj: E("box"), text: "远口出糠 · 近口落谷" }];
    if (ph.id === "slow" || ph.id === "fast" || ph.id === "closeup" || ph.id === "manual") return [
      { id: "p-f", obj: E("fan"), text: "风选:偏移 ∝ 风速/粒重", tone: "white" },
      { id: "p-h", obj: E("hopper"), text: "落谷穿风道分级" }
    ];
    return [];
  };
})(window.MECH = window.MECH || {});
