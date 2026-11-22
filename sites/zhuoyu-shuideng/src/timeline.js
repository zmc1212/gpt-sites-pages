/* 时间线(46s 循环):水凳座凳 → 主轴碢轮 → 踏板绳配重 → 玉料锅架 →
   踏动运转(往复回摆) → 剖玉划痕(渐深) → 深痕展示 → 手动踏频(←/→) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 水凳与座凳", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 4.6, target: [0.2, 0.6, 0] }, drift: 0.03 },
    { id: "axle", name: "AXLE · 主轴·碢轮·轴鼓", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.20, phi: 1.14, r: 3.0, target: [0, 0.65, 0] }, drift: 0.012 },
    { id: "rope", name: "PEDAL · 踏板·绳·配重", dur: 6, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.60, phi: 1.18, r: 3.4, target: [0.3, 0.5, 0] }, drift: 0.015 },
    { id: "jade", name: "JADE · 玉料·锅架砂浆", dur: 5, dot: "pink", mode: "ASSEMBLING",
      cam: { theta: 1.05, phi: 1.12, r: 3.0, target: [-0.2, 0.6, 0] }, drift: 0.012 },
    { id: "power", name: "POWER · 踏动运转(往复回摆)", dur: 8, dot: "teal", mode: "RUNNING",
      cam: { theta: -0.30, phi: 1.18, r: 3.6, target: [0, 0.55, 0] }, drift: 0.02 },
    { id: "cut", name: "CUT · 剖玉划痕(渐深)", dur: 6, dot: "green", mode: "CUTTING",
      cam: { theta: 0.85, phi: 1.10, r: 2.6, target: [-0.3, 0.45, 0] }, drift: 0.010 },
    { id: "deep", name: "DEEP · 深痕展示(逐忽划断)", dur: 4, dot: "blue", mode: "SHOWCASE",
      cam: { theta: 0.45, phi: 1.06, r: 2.0, target: [-0.36, 0.40, 0] }, drift: 0.008 },
    { id: "manual", name: "MANUAL · 手动踏频(← 加速 / → 减速)", dur: 7, dot: "red", mode: "MANUAL",
      cam: { theta: -0.50, phi: 1.16, r: 3.8, target: [0, 0.55, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "axle", "rope", "jade", "power", "cut", "deep", "manual"];

  MECH.newState = KS.newState;

  var _puffT = 0;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "power") { st._freq = 0.75; }
      if (ph.id === "cut") st._freq = 0.75;
      if (ph.id === "manual") st._freq = D.freq;
    }
    if (ph.id === "manual") {
      var d = 0;
      if (MECH.keys && MECH.keys.left) d += 0.06;
      if (MECH.keys && MECH.keys.right) d -= 0.06;
      D.freq = Math.min(1.05, Math.max(0.45, (D.freq || 0.75) + d * dt));
    } else if (ph.id === "power" || ph.id === "cut" || ph.id === "deep") {
      D.freq = st._freq || 0.75;
    }
    KS.step(st, dt);

    /* 划痕槽加深(随 notch 高度缩短下沉) */
    var jd = MECH.Parts.entry("jade");
    if (jd && jd.shown && jd.group.userData.anim) {
      var n = jd.group.userData.anim.notch;
      var fl = Math.min(1, st.notch / D.notchMax);
      n.scale.y = Math.max(0.12, 1 - fl);
      n.position.y = D.jadeY + 0.145 + 0.026 * fl;
    }
    /* 砂浆滴落粒子 */
    if (st.running) {
      _puffT += dt;
      if (_puffT > 0.30) {
        _puffT = 0;
        MECH.Scene3D.spawnPuff(D.discX + 0.12, D.jadeY + 0.24, 0,
          { max: 0.5, base: 0.14, vy: -0.8, opacity: 0.5, tint: 0xA8C8D8 });
      }
    }
  };

  /* seek 补偿:运转段按踏频历程预置相位/划痕 */
  var RUN_T = 21;
  function phaseStart(i) { var a = 0; for (var k = 0; k < i; k++) a += MECH.PHASES[k].dur; return a; }
  MECH.onSeek = function (i, st) {
    var start = phaseStart(i);
    if (start < RUN_T) return;
    var tRun = start - RUN_T;
    D.freq = 0.75;
    st.phase = 0.75 * 2 * Math.PI * tRun;
    st.phiAxle = D.phiAxleAmp * Math.sin(st.phase);
    st.notch = Math.min(D.notchMax, D.notchRate * 3.52 * 0.14 * 0.64 * tRun);
    st.strokes = Math.floor(st.phase / Math.PI);
  };

  MECH.status = function (st, ph, pt) {
    var pill = ph.name;
    if (st.running) pill = ph.name + " · 往复 " + st.strokes + " 次";
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: (D.freq * 60).toFixed(0) + " 踏/min · φ轴 ±" + D.phiAxleAmp.toFixed(1) + " rad",
      b: "缘速比 " + D.iRim.toFixed(2) + " (R碢/r鼓)",
      c: "划痕 " + (st.notch * 1000).toFixed(1) + " mm"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "axle") {
      return [
        { id: "p-axle", obj: E("axle"), text: "主轴·铁碢 r0.14 · 轴鼓 r0.045" }
      ];
    }
    if (ph.id === "rope") {
      return [
        { id: "p-pedal", obj: E("pedal"), text: "足踏往复 · 配重回位(推算)", tone: "white" }
      ];
    }
    if (ph.id === "jade" || ph.id === "cut" || ph.id === "deep") {
      return [
        { id: "p-jade", obj: E("jade"), text: "玉料抵碢缘 · 划痕渐深" },
        { id: "p-pot", obj: E("pot"), text: "解玉砂浆滴注", tone: "white" }
      ];
    }
    if (ph.id === "power" || ph.id === "manual") {
      return [
        { id: "p-axle", obj: E("axle"), text: "碢缘线速 = 3.11×绳速" },
        { id: "p-pedal", obj: E("pedal"), text: "踏频 45/min(文献 40-60)", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
