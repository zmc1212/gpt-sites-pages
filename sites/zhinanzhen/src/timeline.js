/* 时间线(42s 循环):案几碗盘 → 磁针入水 → 磁石书卷 → 磁化定向 →
   扰动振荡(拨针 ±35°) → 航海晃动(碗摇针稳) → 罗盘读数 → 手动扰动(空格) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 案几碗盘", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 2.6, target: [0, 0.5, 0] }, drift: 0.03 },
    { id: "needle", name: "NEEDLE · 磁针入水", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.20, phi: 1.12, r: 1.2, target: [0, 0.62, 0] }, drift: 0.012 },
    { id: "magnet", name: "MAGNET · 磁石·书卷·缕悬架", dur: 5, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.50, phi: 1.14, r: 1.8, target: [0.1, 0.7, 0] }, drift: 0.015 },
    { id: "align", name: "ALIGN · 磁化定向(阻尼摆收敛)", dur: 8, dot: "teal", mode: "ALIGNING",
      cam: { theta: -0.30, phi: 1.10, r: 1.0, target: [0, 0.65, 0] }, drift: 0.010 },
    { id: "perturb", name: "PERTURB · 扰动振荡(拨针 ±35°)", dur: 7, dot: "pink", mode: "PERTURBED",
      cam: { theta: 0.30, phi: 1.08, r: 0.85, target: [0, 0.64, 0] }, drift: 0.008 },
    { id: "sway", name: "SWAY · 航海晃动(碗摇针稳)", dur: 6, dot: "green", mode: "SWAYING",
      cam: { theta: 0.90, phi: 1.10, r: 1.3, target: [0, 0.60, 0] }, drift: 0.012 },
    { id: "read", name: "READ · 罗盘读数(微偏东 3°)", dur: 4, dot: "blue", mode: "READING",
      cam: { theta: 0.15, phi: 1.04, r: 0.62, target: [0, 0.64, 0] }, drift: 0.006 },
    { id: "manual", name: "MANUAL · 手动扰动(空格拨针)", dur: 6, dot: "red", mode: "MANUAL",
      cam: { theta: -0.35, phi: 1.12, r: 1.4, target: [0, 0.62, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "needle", "magnet", "align", "perturb", "sway", "read", "manual"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "align") { st.mode = "float"; st.settled = false; }
      if (ph.id === "perturb") { st.mode = "perturb"; st.theta -= D.disturbKick; st.omega = 0.4; st._int = st.theta; }
      if (ph.id === "sway") st.mode = "sway";
      if (ph.id === "read") { st.mode = "float"; st.settled = false; }
      if (ph.id === "manual") { st.mode = "perturb"; st.settled = false; }
    }
    /* 手动扰动:空格拨针 */
    if (ph.id === "manual" && st._space && !st._spaceHeld) {
      st.theta -= D.disturbKick * (0.7 + Math.random() * 0.5);
      st.omega = 0.3;
      st._int = st.theta;
      st._spaceHeld = true;
    }
    if (!st._space) st._spaceHeld = false;
    KS.step(st, dt);
  };

  /* 手动键捕获在 main 空格?——空格为暂停键,改由 P 键?主循环用空格暂停;
     此处用 window 事件监听(见 timeline 下方) */
  window.addEventListener("keydown", function (e) {
    if (e.code === "Space") { var T = window.MECH && MECH.Timeline; if (T && T.state) T.state._space = true; }
  });
  window.addEventListener("keyup", function (e) {
    if (e.code === "Space") { var T = window.MECH && MECH.Timeline; if (T && T.state) T.state._space = false; }
  });

  /* seek 补偿 */
  MECH.onSeek = function (i, st) {
    if (i >= 3) { st.mode = "float"; st.theta = D.eps; st.omega = 0; st._int = st.theta; }
    if (i === 4) { st.mode = "perturb"; st.theta = D.eps - D.disturbKick; st._int = st.theta; st.settled = false; }
    if (i === 5) st.mode = "sway";
    if (i >= 6) { st.mode = "float"; st.theta = D.eps; st._int = st.theta; }
  };

  MECH.status = function (st, ph, pt) {
    var deg = st.theta * 57.3;
    var pill = ph.name;
    if (st.mode !== "perturb") pill = ph.name + " · 偏东 " + (deg - 0).toFixed(1) + "°";
    return {
      mode: ph.mode.toUpperCase(),
      hot: ph.id === "manual",
      pill: pill,
      a: "针角 " + deg.toFixed(1) + "°(磁南偏东 3°)",
      b: "T≈" + D.T.toFixed(2) + "s · ζω₀ 2.6",
      c: st.mode === "perturb" ? "振荡中 " + st.hist.length : (st.settled ? "收敛 ✓" : "稳定")
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "needle") {
      return [
        { id: "p-needle", obj: E("needle"), text: "针穿灯草 · 浮水面" }
      ];
    }
    if (ph.id === "magnet") {
      return [
        { id: "p-magnet", obj: E("magnet"), text: "「以磁石磨针锋」" },
        { id: "p-hang", obj: E("hang"), text: "四法对比:缕悬为最善", tone: "white" }
      ];
    }
    if (ph.id === "align" || ph.id === "perturb" || ph.id === "sway" || ph.id === "read" || ph.id === "manual") {
      return [
        { id: "p-needle", obj: E("needle"), text: "θ̈=−ω₀²sin(θ−ε)−2ζω₀θ̇" },
        { id: "p-bowl", obj: E("bowl"), text: "稳态偏东 3°(「微偏东」)", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
