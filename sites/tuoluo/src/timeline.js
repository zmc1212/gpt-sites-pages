/* 时间线(42s 循环):硬地鞭绳 → 陀螺鞭就位 → 抛掷急掣(起转) → 睡陀螺
   (稳·慢进动) → 缓而鞭之(补能) → 衰减速降(进动加快) → 倾倒 → 手动鞭击(空格) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 硬地鞭绳", dur: 4, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 2.4, target: [0, 0.2, 0] }, drift: 0.03 },
    { id: "top", name: "TOP · 陀螺鞭就位", dur: 4, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.20, phi: 1.16, r: 1.2, target: [0, 0.15, 0] }, drift: 0.012 },
    { id: "spinup", name: "SPINUP · 抛掷急掣(起转)", dur: 6, dot: "orange", mode: "SPINNING",
      cam: { theta: -0.40, phi: 1.10, r: 1.0, target: [0, 0.12, 0] }, drift: 0.010 },
    { id: "sleep", name: "SLEEP · 睡陀螺(稳·慢进动)", dur: 6, dot: "teal", mode: "SLEEPING",
      cam: { theta: 0.90, phi: 1.08, r: 0.85, target: [0, 0.12, 0] }, drift: 0.008 },
    { id: "whipmore", name: "WHIP · 缓而鞭之(补能)", dur: 5, dot: "pink", mode: "REWHIP",
      cam: { theta: 0.35, phi: 1.10, r: 1.0, target: [0.1, 0.12, 0.1] }, drift: 0.010 },
    { id: "decay", name: "DECAY · 衰减速降(进动加快)", dur: 8, dot: "blue", mode: "DECAYING",
      cam: { theta: -0.35, phi: 1.12, r: 1.1, target: [0, 0.12, 0] }, drift: 0.012 },
    { id: "fall", name: "FALL · 倾倒(「转缓则倾」)", dur: 4, dot: "red", mode: "FALLING",
      cam: { theta: 0.60, phi: 1.14, r: 1.3, target: [0, 0.10, 0] }, drift: 0.012 },
    { id: "manual", name: "MANUAL · 手动鞭击(空格抽鞭)", dur: 4, dot: "red", mode: "MANUAL",
      cam: { theta: -0.45, phi: 1.14, r: 1.3, target: [0, 0.12, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "top", "spinup", "sleep", "whipmore", "decay", "fall", "manual"];

  MECH.newState = KS.newState;

  var _whipT = 0;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "spinup") { st.omega = 300; st.fallen = false; st.tilt = D.tiltSteady; st.tiltV = 0; }
      if (ph.id === "whipmore") { st.omega = Math.max(st.omega, 330); st.whips++; }
      if (ph.id === "fall") { st.omega = Math.min(st.omega, 40); }
      if (ph.id === "manual") { st.fallen = false; st.tilt = D.tiltSteady; st.tiltV = 0; st.omega = Math.max(st.omega, 120); }
    }
    /* 手动鞭击:空格 */
    if (ph.id === "manual" && st._space && !st._spaceHeld) {
      st.omega = Math.min(340, st.omega + D.whipKick);
      st.whips++;
      st._spaceHeld = true;
      _whipT = 0.22;
    }
    if (!st._space) st._spaceHeld = false;
    KS.step(st, dt);
    /* 鞭扫动画粒子 */
    if (_whipT > 0) {
      _whipT -= dt;
      MECH.Scene3D.spawnPuff(0.10, 0.22, 0.06, { max: 0.3, base: 0.10, vy: 0.3, opacity: 0.5, tint: 0xD8CBA8 });
    }
  };

  window.addEventListener("keydown", function (e) {
    if (e.code === "Space") { var T = window.MECH && MECH.Timeline; if (T && T.state) T.state._space = true; }
  });
  window.addEventListener("keyup", function (e) {
    if (e.code === "Space") { var T = window.MECH && MECH.Timeline; if (T && T.state) T.state._space = false; }
  });

  MECH.onSeek = function (i, st) {
    if (i >= 2) { st.omega = 300; st.fallen = false; st.tilt = D.tiltSteady; st.tiltV = 0; }
    if (i >= 3) st.omega = Math.max(st.omega, 260);
    if (i >= 5) st.omega = Math.min(st.omega, 70);
    if (i >= 6) { st.omega = Math.min(st.omega, 30); st.tilt = D.fallTilt; st.fallen = true; }
    if (i === 7) { st.omega = 120; st.fallen = false; st.tilt = D.tiltSteady; st.tiltV = 0; }
    st._int = st.preT;
  };

  MECH.status = function (st, ph, pt) {
    var rpm = st.omega * 60 / (2 * Math.PI);
    var Om = D.OmegaOf(st.omega);
    var pill = ph.name;
    if (st.omega > 60) pill = ph.name + " · 「卓立地上」";
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: "自转 " + rpm.toFixed(0) + " rpm(阈值 598rpm)",
      b: "进动 Ω " + Om.toFixed(2) + " rad/s(" + (Om / 6.283).toFixed(2) + " 转/s)",
      c: st.fallen ? "已倾倒" : (st.omega > D.omegaCrit ? "睡陀螺 ✓" : "缓·将倾")
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "top") {
      return [
        { id: "p-top", obj: E("top"), text: "陀螺体 m40g · I=½mr²=8.0e-6" }
      ];
    }
    if (ph.id === "spinup" || ph.id === "sleep") {
      return [
        { id: "p-top", obj: E("top"), text: "进动 Ω = mgr/(Iω) · 「顶光旋旋,影不动」" },
        { id: "p-sh", obj: E("shadow"), text: "睡陀螺阈值 ω²>4mgr/I → 598rpm", tone: "white" }
      ];
    }
    if (ph.id === "whipmore" || ph.id === "decay" || ph.id === "fall" || ph.id === "manual") {
      return [
        { id: "p-top", obj: E("top"), text: "Ω ∝ 1/ω(衰减则进动加快)" },
        { id: "p-whip", obj: E("whip"), text: "「视其缓而鞭之」每鞭 Δω 42", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
