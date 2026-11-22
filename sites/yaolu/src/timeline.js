/* 时间线(41s 循环):船体水面 → 橹绳就位 → 起摇加速 → 匀速巡航 → 加摇
   → 回摇减速 → 舟行轨迹 → 手动摇频(←/→) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 船体水面", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.85, phi: 1.18, r: 5.5, target: [0, 0.5, 0] }, drift: 0.03 },
    { id: "lu", name: "LU · 橹就位", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: -0.55, phi: 1.14, r: 3.4, target: [-0.8, 0.6, 0.3] }, drift: 0.015 },
    { id: "start", name: "START · 起摇加速", dur: 8, dot: "teal", mode: "STARTING",
      cam: { theta: -0.20, phi: 1.14, r: 4.0, target: [0, 0.5, 0] }, drift: 0.02 },
    { id: "cruise", name: "CRUISE · 匀速巡航(≈0.7m/s)", dur: 6, dot: "green", mode: "CRUISING",
      cam: { theta: 0.90, phi: 1.10, r: 3.8, target: [0, 0.45, 0] }, drift: 0.015 },
    { id: "faster", name: "FASTER · 加摇", dur: 5, dot: "blue", mode: "FASTER",
      cam: { theta: -0.50, phi: 1.12, r: 3.4, target: [0, 0.45, 0] }, drift: 0.012 },
    { id: "slow", name: "SLOW · 回摇减速", dur: 5, dot: "pink", mode: "SLOWING",
      cam: { theta: 1.00, phi: 1.12, r: 3.4, target: [0, 0.45, 0] }, drift: 0.012 },
    { id: "track", name: "TRACK · 舟行轨迹", dur: 4, dot: "blue", mode: "SHOWCASE",
      cam: { theta: 1.30, phi: 1.16, r: 5.0, target: [0, 0.4, 0] }, drift: 0.010 },
    { id: "manual", name: "MANUAL · 手动摇频(← 加 / → 减)", dur: 3, dot: "red", mode: "MANUAL",
      cam: { theta: -0.35, phi: 1.14, r: 3.8, target: [0, 0.5, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "lu", "start", "cruise", "faster", "slow", "track", "manual"];

  MECH.newState = KS.newState;
  var _wakeT = 0;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "start") st.freq = 0.85;
      if (ph.id === "cruise") st.freq = 0.85;
      if (ph.id === "faster") st.freq = 1.15;
      if (ph.id === "slow") st.freq = 0.55;
      if (ph.id === "track") st.freq = 0.7;
      if (ph.id === "manual") st.freq = D.freq;
    }
    if (ph.id === "manual") {
      var d = 0;
      if (MECH.keys && MECH.keys.left) d += 0.10;
      if (MECH.keys && MECH.keys.right) d -= 0.10;
      st.freq = Math.min(1.3, Math.max(0.3, st.freq + d * dt));
    }
    KS.step(st, dt);
    /* 水面后移(船行进)+ 舷波纹粒子 */
    var wt = MECH.Parts.entry("water");
    if (wt && wt.shown) {
      wt.group.position.x = -(st.boatX % 2.0);
    }
    if (st.vBoat > 0.2) {
      _wakeT += dt;
      if (_wakeT > 0.2) {
        _wakeT = 0;
        MECH.Scene3D.spawnPuff(1.7, 0.05, (Math.random() - 0.5) * 0.9,
          { max: 0.6, base: 0.20, vy: 0.2, opacity: 0.45, tint: 0xBFD9E8 });
        MECH.Scene3D.spawnPuff(-1.7, 0.05, (Math.random() - 0.5) * 0.6,
          { max: 0.5, base: 0.16, vy: 0.15, opacity: 0.4, tint: 0xBFD9E8 });
      }
    }
  };

  MECH.onSeek = function (i, st) {
    if (i >= 2) { st.freq = 0.85; st.vBoat = 0.68; }
    if (i >= 4) { st.freq = 1.15; st.vBoat = 0.86; }
    if (i >= 5) { st.freq = 0.55; st.vBoat = 0.45; }
    if (i >= 6) { st.freq = 0.7; st.vBoat = 0.6; }
    st._int = st.boatX;
  };

  MECH.status = function (st, ph, pt) {
    var vss = Math.sqrt(D.FavgOf(st.freq) / D.cDrag);
    var pill = ph.name;
    if (st.vBoat > 0.3) pill = ph.name + " · 航速 " + st.vBoat.toFixed(2) + " m/s";
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: "摇频 " + st.freq.toFixed(2) + " Hz · 板速 " + (D.vBlade * st.freq / D.freq).toFixed(1) + " m/s",
      b: "推力 " + st.Fnow.toFixed(0) + " N · 匀速 " + vss.toFixed(2) + " m/s",
      c: "功率 " + (st.Fnow * st.vBoat).toFixed(0) + " W(「一橹抵三桨」)"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "lu") {
      return [
        { id: "p-lu", obj: E("lu"), text: "橹钮球窝 · 橹板入水 2.9m" },
        { id: "p-rope", obj: E("rope"), text: "橹绳联动 · 攻角反转", tone: "white" }
      ];
    }
    if (ph.id === "start" || ph.id === "cruise" || ph.id === "faster" || ph.id === "slow" || ph.id === "manual") {
      return [
        { id: "p-lu", obj: E("lu"), text: "摆 β ±24° · 攻角 α 反转连续推进" },
        { id: "p-water", obj: E("water"), text: "F=½ρA(v板·sinα)² · R=c·v²", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
