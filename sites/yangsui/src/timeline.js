/* 时间线(41s 循环):案几镜架 → 阳燧就位 → 向日调角 → 光束聚焦 → 艾绒置焦
   → 聚热点火 → 取火传火 → 手动调角(← 仰角升 / → 降) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 案几镜架", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 2.2, target: [0, 0.7, 0] }, drift: 0.03 },
    { id: "mirror", name: "MIRROR · 阳燧就位", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.20, phi: 1.14, r: 1.1, target: [0, 0.75, 0] }, drift: 0.012 },
    { id: "aim", name: "AIM · 向日调角(晨→午)", dur: 6, dot: "orange", mode: "AIMING",
      cam: { theta: -0.45, phi: 1.12, r: 1.4, target: [0, 0.85, 0] }, drift: 0.015 },
    { id: "focus", name: "FOCUS · 光束聚焦(7 束)", dur: 6, dot: "teal", mode: "FOCUSING",
      cam: { theta: 0.85, phi: 1.10, r: 1.3, target: [-0.03, 0.75, 0] }, drift: 0.010 },
    { id: "tinder", name: "TINDER · 艾绒置焦", dur: 4, dot: "pink", mode: "PLACING",
      cam: { theta: -0.30, phi: 1.08, r: 0.9, target: [-0.04, 0.70, 0] }, drift: 0.008 },
    { id: "ignite", name: "IGNITE · 聚热点火", dur: 8, dot: "red", mode: "IGNITING",
      cam: { theta: 0.45, phi: 1.06, r: 0.8, target: [-0.04, 0.68, 0] }, drift: 0.006 },
    { id: "transfer", name: "TRANSFER · 取火传火", dur: 4, dot: "green", mode: "SHOWCASE",
      cam: { theta: 0.85, phi: 1.14, r: 1.6, target: [0.2, 0.62, 0.15] }, drift: 0.010 },
    { id: "manual", name: "MANUAL · 手动调角(← 升 / → 降,偏角失焦)", dur: 3, dot: "red", mode: "MANUAL",
      cam: { theta: -0.40, phi: 1.14, r: 1.5, target: [0, 0.75, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "mirror", "aim", "focus", "tinder", "ignite", "transfer", "manual"];

  MECH.newState = KS.newState;

  var _flameT = 0;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "aim") { st.tiltT = D.tilt1; st.fuel = 0; st.ignited = false; }
      if (ph.id === "tinder") { st.fuel = 0.001; }
      if (ph.id === "ignite") { st.tiltT = Math.PI / 4; }
      if (ph.id === "manual") { st.fuel = 0; st.ignited = false; }
    }
    if (ph.id === "manual") {
      var d = 0;
      if (MECH.keys && MECH.keys.left) d += 0.30;
      if (MECH.keys && MECH.keys.right) d -= 0.30;
      st.tiltT = Math.min(1.3, Math.max(0.2, st.tiltT + d * dt));
    }
    KS.step(st, dt);
    /* 火焰粒子(点燃后) */
    if (st.ignited) {
      _flameT += dt;
      if (_flameT > 0.18) {
        _flameT = 0;
        var fx = 0.02 - D.f * 0.72, fy = 0.72 - D.f * 0.70 + 0.05;
        MECH.Scene3D.spawnPuff(fx, fy, 0, { max: 0.5, base: 0.14, vy: 0.9, opacity: 0.7, tint: 0xFF9A3C });
      }
    }
  };

  MECH.onSeek = function (i, st) {
    if (i >= 2) st.tiltT = Math.PI / 4;
    if (i >= 4) st.fuel = 0.001;
    if (i >= 5) st.ignited = false;
    if (i >= 6) st.ignited = true;
  };

  MECH.status = function (st, ph, pt) {
    var pill = ph.name;
    if (st.ignited) pill = ph.name + " · 「火来至」";
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: "对日误差 " + (st.aimErr * 57.3).toFixed(1) + "°(聚焦效率 " + (100 * Math.cos(st.aimErr)).toFixed(0) + "%)",
      b: "f " + (D.f * 100).toFixed(1) + "cm · 焦斑 " + (D.spotD * 1000).toFixed(2) + "mm · 聚光比 " + D.concRatio.toFixed(0),
      c: st.ignited ? "已燃 " + st.flames + " 次" : "艾绒 " + (st.fuel * 100).toFixed(0) + "%"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "mirror" || ph.id === "aim") {
      return [
        { id: "p-mirror", obj: E("mirror"), text: "凹面镜 R19.8cm(黄堆西周)· f=R/2" }
      ];
    }
    if (ph.id === "focus") {
      return [
        { id: "p-rays", obj: E("rays"), text: "平行日光 → 汇聚焦点" },
        { id: "p-mirror", obj: E("mirror"), text: "焦斑 0.93mm · 聚光比 ~8950", tone: "white" }
      ];
    }
    if (ph.id === "tinder" || ph.id === "ignite" || ph.id === "transfer" || ph.id === "manual") {
      return [
        { id: "p-tinder", obj: E("tinder"), text: "艾绒置焦点 · 「著物则火发」" },
        { id: "p-bow", obj: E("brazier"), text: "「取明火于日」· P≈5W", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
