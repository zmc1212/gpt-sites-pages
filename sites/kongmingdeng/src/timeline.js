/* 时间线(41s 循环):庭院系留 → 灯体燃料 → 点火升温(判据未满系留)
   → 离地升空(F≥W 判据满) → 巡航 → 燃尽回落 → 蛋壳对照 → 手动风(←/→) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 庭院系留", dur: 4, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 4.0, target: [0, 0.8, 0] }, drift: 0.03 },
    { id: "lantern", name: "LANTERN · 灯体燃料", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.20, phi: 1.14, r: 1.8, target: [0, 0.5, 0] }, drift: 0.012 },
    { id: "heat", name: "HEAT · 点火升温(判据未满)", dur: 8, dot: "orange", mode: "HEATING",
      cam: { theta: -0.30, phi: 1.12, r: 2.0, target: [0, 0.5, 0] }, drift: 0.015 },
    { id: "rise", name: "RISE · 离地升空(F≥W)", dur: 6, dot: "teal", mode: "RISING",
      cam: { theta: -0.60, phi: 1.10, r: 3.4, target: [0, 1.2, 0] }, drift: 0.02 },
    { id: "cruise", name: "CRUISE · 巡航", dur: 5, dot: "green", mode: "CRUISING",
      cam: { theta: 0.90, phi: 1.06, r: 4.6, target: [0, 2.1, 0] }, drift: 0.015 },
    { id: "down", name: "DOWN · 燃尽回落", dur: 6, dot: "blue", mode: "DESCENDING",
      cam: { theta: 1.15, phi: 1.10, r: 4.8, target: [0, 1.9, 0] }, drift: 0.015 },
    { id: "egg", name: "EGG · 万毕术蛋壳", dur: 4, dot: "pink", mode: "SHOWCASE",
      cam: { theta: 0.30, phi: 1.10, r: 1.6, target: [0.5, 0.4, -0.3] }, drift: 0.008 },
    { id: "manual", name: "MANUAL · 手动(← 减火 / → 加火)", dur: 3, dot: "red", mode: "MANUAL",
      cam: { theta: -0.40, phi: 1.14, r: 2.6, target: [0, 0.9, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "lantern", "heat", "rise", "cruise", "down", "egg", "manual"];

  MECH.newState = KS.newState;
  var burnScale = 1.0;
  var _flameT = 0, _hotT = 0;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "heat") { burnScale = 1.0; }
      if (ph.id === "rise" || ph.id === "cruise") burnScale = 1.3;
      if (ph.id === "down") burnScale = 0;
      if (ph.id === "egg" || ph.id === "manual") burnScale = 0.8;
    }
    if (ph.id === "manual") {
      var d = 0;
      if (MECH.keys && MECH.keys.left) d -= 0.5;
      if (MECH.keys && MECH.keys.right) d += 0.5;
      burnScale = Math.min(1.6, Math.max(0, burnScale + d * dt));
    }
    KS.step(st, dt * Math.max(0.05, burnScale));

    /* 火焰粒子(口内) */
    if (burnScale > 0.3 && st.time < D.fuelBurn) {
      _flameT += dt;
      if (_flameT > 0.12) {
        _flameT = 0;
        MECH.Scene3D.spawnPuff(0.05 + (Math.random() - 0.5) * 0.06, 0.14 + st.alt, (Math.random() - 0.5) * 0.06,
          { max: 0.4, base: 0.16, vy: 0.9, opacity: 0.75, tint: 0xFF9A3C });
      }
    }
    /* 内热气粒子(充腔) */
    if (st.Tin > 45 && burnScale > 0.3) {
      _hotT += dt;
      if (_hotT > 0.2) {
        _hotT = 0;
        MECH.Scene3D.spawnPuff((Math.random() - 0.5) * 0.12, 0.30 + st.alt, (Math.random() - 0.5) * 0.12,
          { max: 0.7, base: 0.20, vy: 0.5, opacity: 0.30, tint: 0xE8D9B0 });
      }
    }
    /* 灯口可见光(emissive) */
    var lt = MECH.Parts.entry("lantern");
    if (lt && lt.shown) {
      var glow = burnScale > 0.3 && st.time < D.fuelBurn ? Math.min(0.35, st.Tin / 260) : 0.1;
      lt.group.traverse(function (o) {
        if (o.material && o.material.color) {
          if (o.geometry && o.geometry.type === "SphereGeometry") {
            o.material.color.setHex(0xE7D0A8);
            o.material.emissive = new THREE.Color(0.25 * glow * 2, 0.12 * glow * 2, 0);
          }
        }
      });
    }
  };

  MECH.onSeek = function (i, st) {
    if (i >= 3) { st.Tin = 78; st.released = false; }
    if (i >= 4) { st.Tin = 90; st.released = true; st.alt = 0.5; st.vel = 0.4; }
    if (i >= 5) { st.alt = 2.0; st.vel = 0.05; }
    if (i >= 6) { st.Tin = 60; st.alt = 0.4; st.vel = -0.3; }
    if (i === 7) { st.Tin = 70; st.alt = 0; st.released = false; }
    st._int = st.alt;
  };

  MECH.status = function (st, ph, pt) {
    var F = st._F || D.Fof(st.Tin);
    var net = F - D.W;
    var pill = ph.name;
    if (st.released) pill = ph.name + " · " + st.alt.toFixed(2) + "m";
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: "内温 " + st.Tin.toFixed(0) + "℃(起飞 " + D.Tfly.toFixed(0) + "℃)",
      b: "浮力 " + (F * 1000).toFixed(0) + " mN vs 重 " + (D.W * 1000).toFixed(0) + " mN",
      c: (st.released ? "已升空" : "系留") + " · 净升 " + (net * 1000).toFixed(0) + " mN"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "lantern") {
      return [
        { id: "p-lantern", obj: E("lantern"), text: "灯 V0.30m³ · 壳 55g" },
        { id: "p-tether", obj: E("tether"), text: "系留:F < W 判据未满", tone: "white" }
      ];
    }
    if (ph.id === "heat" || ph.id === "rise" || ph.id === "cruise" || ph.id === "down" || ph.id === "manual") {
      return [
        { id: "p-lantern", obj: E("lantern"), text: "F=(ρ外−ρ内)Vg · 起飞内温 73℃" },
        { id: "p-pole", obj: E("pole"), text: "ρ内=ρ外·T外/T内(等压)", tone: "white" }
      ];
    }
    if (ph.id === "egg") {
      return [
        { id: "p-egg", obj: E("egg"), text: "「艾火令鸡子飞」(淮南万毕术)" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
