/* 时间线(41s 循环):案几标杆 → 竹蜻蜓书卷 → 搓转起旋(掌上) → 离手升空
   → 悬停衰减 → 落掌再搓 → 高抛 → 手动搓速(←/→) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 案几标杆", dur: 4, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 2.6, target: [0, 0.6, 0] }, drift: 0.03 },
    { id: "toy", name: "TOY · 竹蜻蜓书卷", dur: 4, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.20, phi: 1.14, r: 1.1, target: [0.1, 0.6, 0] }, drift: 0.012 },
    { id: "spinup", name: "SPINUP · 搓转起旋(掌上)", dur: 7, dot: "orange", mode: "SPINNING",
      cam: { theta: -0.30, phi: 1.10, r: 0.9, target: [0, 0.62, 0] }, drift: 0.010 },
    { id: "rise", name: "RISE · 离手升空(T>mg)", dur: 6, dot: "teal", mode: "RISING",
      cam: { theta: -0.60, phi: 1.08, r: 1.9, target: [0, 1.0, 0] }, drift: 0.015 },
    { id: "hover", name: "HOVER · 悬停衰减", dur: 6, dot: "green", mode: "HOVERING",
      cam: { theta: 0.90, phi: 1.06, r: 1.9, target: [0, 1.85, 0] }, drift: 0.012 },
    { id: "land", name: "LAND · 落掌再搓", dur: 4, dot: "pink", mode: "RELAUNCH",
      cam: { theta: 0.30, phi: 1.12, r: 1.0, target: [0, 0.6, 0] }, drift: 0.010 },
    { id: "throw", name: "THROW · 高抛", dur: 5, dot: "blue", mode: "THROWING",
      cam: { theta: 1.00, phi: 1.10, r: 1.9, target: [0, 0.9, 0] }, drift: 0.012 },
    { id: "manual", name: "MANUAL · 手动搓速(←/→)", dur: 5, dot: "red", mode: "MANUAL",
      cam: { theta: -0.40, phi: 1.12, r: 1.5, target: [0, 0.7, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "toy", "spinup", "rise", "hover", "land", "throw", "manual"];

  MECH.newState = KS.newState;
  var palmRate = 1.0;
  var _puffT = 0;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "spinup") { st.inHand = true; palmRate = 1.0; }
      if (ph.id === "rise") { st.inHand = false; st.alt = 0.005; st.vel = 0.15; st._int = st.alt; }
      if (ph.id === "hover") { st.omega = D.omegaHover + 10; st.inHand = false; st._int = st.alt; }
      if (ph.id === "land") { st.inHand = true; st.alt = 0; st.vel = 0; st._int = 0; }
      if (ph.id === "throw") { st.inHand = false; st.omega = 118; st.vel = 0.85; st.alt = 0.005; st._int = st.alt; }
      if (ph.id === "manual") { st.inHand = false; st.alt = Math.max(st.alt, 0.4); st.vel = 0; st._int = st.alt; }
    }
    if (ph.id === "manual") {
      var d = 0;
      if (MECH.keys && MECH.keys.left) d -= 0.35;
      if (MECH.keys && MECH.keys.right) d += 0.35;
      palmRate = Math.min(1.7, Math.max(0.35, palmRate + d * dt));
      /* 手动搓:掌速率决定 ω 稳态 */
      var target = 14 + 26 * palmRate;
      st.omega += (target - st.omega) * Math.min(1, dt * 2.2);
    }
    KS.step(st, dt * (st.inHand ? palmRate : 1.0));
    /* 高速气流粒子 */
    if (!st.inHand && st.omega > 20) {
      _puffT += dt;
      if (_puffT > 0.16) {
        _puffT = 0;
        MECH.Scene3D.spawnPuff((Math.random() - 0.5) * 0.16, 0.56 + st.alt - 0.06, (Math.random() - 0.5) * 0.16,
          { max: 0.5, base: 0.16, vy: -0.7, opacity: 0.4, tint: 0xD8D8C8 });
      }
    }
  };

  MECH.onSeek = function (i, st) {
    if (i >= 2) { st.inHand = false; st.omega = 118; st.alt = 0.005; st.vel = 0.3; }
    if (i === 3) { st.omega = D.omegaHover + 8; st.alt = 0.5; }
    if (i === 4) { st.omega = D.omegaHover; st.alt = 1.0; st.vel = 0; }
    if (i === 5) { st.inHand = true; st.alt = 0; st.vel = 0; }
    if (i === 6) { st.inHand = false; st.omega = 118; st.alt = 0.005; st.vel = 0.85; }
    if (i === 7) { st.inHand = false; st.alt = 1.1; st.omega = 80; }
    st._int = st.alt;
  };

  MECH.status = function (st, ph, pt) {
    var T = st._F || D.Tof(st.omega);
    var pill = ph.name;
    if (!st.inHand) pill = ph.name + " · " + st.alt.toFixed(2) + "m";
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: "ω " + st.omega.toFixed(0) + " rad/s(" + (st.omega * 60 / 6.283).toFixed(0) + "rpm)",
      b: "拉力 " + (T * 1000).toFixed(0) + " mN vs 重 " + (D.W * 1000).toFixed(0) + " mN",
      c: st.inHand ? "掌上搓转" : (st.alt > 0.02 ? "空中 " + st.alt.toFixed(2) + "m" : "落定")
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "toy") {
      return [
        { id: "p-toy", obj: E("toy"), text: "双翼 18° 扭角 · 轴 20cm" },
        { id: "p-scroll", obj: E("scroll"), text: "「飞车…上升四十里」(传说)", tone: "white" }
      ];
    }
    if (ph.id === "spinup" || ph.id === "rise" || ph.id === "hover" || ph.id === "manual") {
      return [
        { id: "p-toy", obj: E("toy"), text: "T = C_T·ρ·A·(ωR)² · 悬停 ω 112.7" },
        { id: "p-pole", obj: E("pole"), text: "mg 196mN · 搓转扭矩 0.028N·m", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
