/* 时间线(44s 循环):陶车座 → 立轴双盘 → 泥料上盘 → 拨棍利刀水盆 →
   拨转拉坯(拨-衰减-再拨) → 过利刀二次 → 成形展示 → 手动推力(←/→) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 陶车座", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 4.2, target: [0, 0.5, 0] }, drift: 0.03 },
    { id: "wheel", name: "WHEEL · 立轴双盘", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.20, phi: 1.14, r: 3.0, target: [0, 0.7, 0] }, drift: 0.012 },
    { id: "clay", name: "CLAY · 泥料上盘", dur: 5, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: 0.90, phi: 1.12, r: 2.6, target: [0, 0.75, 0] }, drift: 0.012 },
    { id: "tools", name: "TOOLS · 拨棍·利刀·水盆", dur: 5, dot: "pink", mode: "ASSEMBLING",
      cam: { theta: -0.50, phi: 1.16, r: 3.4, target: [0.2, 0.6, 0] }, drift: 0.015 },
    { id: "power", name: "POWER · 拨转拉坯(≥90rpm)", dur: 9, dot: "teal", mode: "THROWING",
      cam: { theta: -0.30, phi: 1.16, r: 3.6, target: [0, 0.7, 0] }, drift: 0.02 },
    { id: "trim", name: "TRIM · 过利刀二次", dur: 5, dot: "green", mode: "TRIMMING",
      cam: { theta: 0.85, phi: 1.10, r: 2.5, target: [0.2, 0.7, 0] }, drift: 0.010 },
    { id: "full", name: "SHOW · 成形展示", dur: 4, dot: "blue", mode: "SHOWCASE",
      cam: { theta: 0.50, phi: 1.08, r: 2.2, target: [0, 0.75, 0] }, drift: 0.008 },
    { id: "manual", name: "MANUAL · 手动推力(← 加 / → 减)", dur: 5, dot: "red", mode: "MANUAL",
      cam: { theta: -0.45, phi: 1.18, r: 3.8, target: [0, 0.65, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "wheel", "clay", "tools", "power", "trim", "full", "manual"];

  MECH.newState = KS.newState;
  var pushBoost = 1.0;

  var _puffT = 0;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      pushBoost = 1.0;
    }
    if (ph.id === "manual") {
      var d = 0;
      if (MECH.keys && MECH.keys.left) d += 0.5;
      if (MECH.keys && MECH.keys.right) d -= 0.5;
      pushBoost = Math.min(1.6, Math.max(0.5, pushBoost + d * dt));
    }
    st._boost = pushBoost;
    KS.step(st, dt * pushBoost);

    /* 泥料 morph:三层圆柱随 shape 变化(筒→碗收口) */
    var cl = MECH.Parts.entry("clay");
    if (cl && cl.shown && cl.group.userData.anim) {
      var layers = cl.group.userData.anim.layers;
      var p = st.shape;
      for (var i = 0; i < layers.length; i++) {
        var m = layers[i];
        var t = i / 2;                                       // 0 底 → 1 顶
        var rBot = 0.15, rTop = 0.13 - 0.05 * p;             // 收口
        var rr = rBot + (rTop - rBot) * t - 0.02 * p * (1 - t);
        m.scale.x = m.scale.z = Math.max(0.4, rr / 0.14);
        m.scale.y = 1 + 0.5 * p * (i === 2 ? 1.6 : i === 1 ? 1.0 : 0.4);
        m.position.y = 0.045 + i * 0.048 + p * i * 0.02;
      }
    }
    /* 拨棍拨角摆动(推进相位) */
    var sk = MECH.Parts.entry("stick");
    if (sk && sk.shown && sk.group.userData.anim) {
      var a = sk.group.userData.anim;
      a.holder.rotation.x = a.baseRotX + (st.pushing ? -0.18 : 0);
    }
    /* 利刀切深(trim 相位) */
    var kn = MECH.Parts.entry("knife");
    if (kn && kn.shown && kn.group.userData.anim) {
      kn.group.userData.anim.blade.position.y = 0.545 + (ph.id === "trim" ? -0.03 : 0.0);
    }
    /* 拨转水汽粒子 */
    if (st.running) {
      _puffT += dt;
      if (_puffT > 0.4) {
        _puffT = 0;
        MECH.Scene3D.spawnPuff(0.05, 0.85, 0.05, { max: 0.6, base: 0.20, vy: 0.7, opacity: 0.4, tint: 0xC9D8D8 });
      }
    }
  };

  /* seek 补偿 */
  var RUN_T = 20;
  function phaseStart(i) { var a = 0; for (var k = 0; k < i; k++) a += MECH.PHASES[k].dur; return a; }
  MECH.onSeek = function (i, st) {
    var start = phaseStart(i);
    if (start < RUN_T) return;
    var tRun = start - RUN_T;
    st.omega = D.omegaC + 1.5;
    st.theta = st.omega * tRun;
    st.shape = Math.min(1, D.shapeRate * 10.5 * tRun);
    st.pushT = 0;
  };

  MECH.status = function (st, ph, pt) {
    var rpm = st.omega * 60 / (2 * Math.PI);
    var pill = ph.name;
    if (st.running) pill = ph.name + " · " + rpm.toFixed(0) + " rpm";
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: rpm.toFixed(0) + " rpm" + (rpm >= 90 ? " ✓拉坯" : " 慢轮"),
      b: "I " + D.I.toFixed(2) + " kg·m² · τ " + D.tau.toFixed(1) + "s",
      c: "成形 " + (st.shape * 100).toFixed(0) + "% · 过刀 " + st.trims
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "wheel") {
      return [
        { id: "p-wheel", obj: E("wheel"), text: "立轴双盘 · I=½MR²=2.02" }
      ];
    }
    if (ph.id === "clay") {
      return [
        { id: "p-clay", obj: E("clay"), text: "泥料拉坯 · 筒→碗收口" }
      ];
    }
    if (ph.id === "power" || ph.id === "trim" || ph.id === "manual") {
      return [
        { id: "p-clay", obj: E("clay"), text: "临界 90rpm(李文杰)· 可用 τ·ln(ω₀/ωc)" },
        { id: "p-stick", obj: E("stick"), text: "拨棍 12N·m×0.35s → Δω 2.08", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
