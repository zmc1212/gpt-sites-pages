/* 时间线(42s 循环):立架衡杆 → 提纽盘权 → 等臂验证 → 杆秤模式 →
   称物一(250g 平衡) → 称物二(125g) → 称物三(62.5g) → 手动调权(←/→) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 立架衡杆", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.18, r: 3.0, target: [0.1, 0.8, 0] }, drift: 0.03 },
    { id: "pin", name: "PIN · 提纽·物盘·权", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.20, phi: 1.14, r: 1.8, target: [0.1, 0.8, 0] }, drift: 0.02 },
    { id: "equal", name: "EQUAL · 等臂验证(纽居中)", dur: 6, dot: "orange", mode: "VERIFYING",
      cam: { theta: -0.45, phi: 1.12, r: 1.6, target: [0, 0.85, 0] }, drift: 0.015 },
    { id: "arm", name: "ARM · 杆秤模式(本短标长)", dur: 5, dot: "blue", mode: "SWITCHING",
      cam: { theta: 0.35, phi: 1.14, r: 1.8, target: [0.1, 0.85, 0] }, drift: 0.015 },
    { id: "w250", name: "W250 · 称半斤(权滑至平衡)", dur: 7, dot: "teal", mode: "WEIGHING",
      cam: { theta: -0.30, phi: 1.10, r: 1.5, target: [0.2, 0.85, 0] }, drift: 0.010 },
    { id: "w125", name: "W125 · 称四两重物", dur: 5, dot: "green", mode: "WEIGHING",
      cam: { theta: 0.30, phi: 1.10, r: 1.5, target: [0.2, 0.85, 0] }, drift: 0.010 },
    { id: "w62", name: "W62 · 称二两", dur: 4, dot: "pink", mode: "WEIGHING",
      cam: { theta: 0.50, phi: 1.08, r: 1.4, target: [0.25, 0.85, 0] }, drift: 0.008 },
    { id: "manual", name: "MANUAL · 手动调权(← 西 / → 东)", dur: 5, dot: "red", mode: "MANUAL",
      cam: { theta: -0.35, phi: 1.14, r: 1.7, target: [0.1, 0.85, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "pin", "equal", "arm", "w250", "w125", "w62", "manual"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "equal") { st.pinMode = "center"; st.objW = 0; st.qx = D.pinC; }   // 权置支点:等臂空载水平
      if (ph.id === "arm") { st.pinMode = "arm"; st.objW = 0; st.qx = 0.40; }
      if (ph.id === "w250") { st.objW = 250; st.qx = KS.balanceX(250, "arm"); }
      if (ph.id === "w125") { st.objW = 125; st.qx = KS.balanceX(125, "arm"); }
      if (ph.id === "w62") { st.objW = 62.5; st.qx = KS.balanceX(62.5, "arm"); }
      if (ph.id === "manual") { st.pinMode = "arm"; st.objW = 125; }
    }
    if (ph.id === "manual") {
      var d = 0;
      if (MECH.keys && MECH.keys.left) d -= 0.006;
      if (MECH.keys && MECH.keys.right) d += 0.006;
      st.qx = Math.min(0.58, Math.max(0.30, st.qx + d * dt));
    }
    KS.step(st, dt);

    /* 盘内物块显隐 */
    var pn = MECH.Parts.entry("pan");
    if (pn && pn.shown && pn.group.userData.anim) {
      pn.group.userData.anim.obj.visible = st.objW > 0;
      pn.group.userData.anim.obj.scale.y = st.objW > 0 ? 0.7 + st.objW / 500 : 1;
    }
  };

  MECH.onSeek = function (i, st) {
    if (i === 2) { st.pinMode = "center"; st.objW = 0; st.qx = 0.46; }
    if (i >= 3) st.pinMode = "arm";
    if (i === 4) { st.objW = 250; st.qx = KS.balanceX(250, "arm"); }
    if (i === 5) { st.objW = 125; st.qx = KS.balanceX(125, "arm"); }
    if (i >= 6) { st.objW = 62.5; st.qx = KS.balanceX(62.5, "arm"); }
    st._int = st.theta;
  };

  MECH.status = function (st, ph, pt) {
    var pin = st.pinMode === "arm" ? D.pinU : D.pinC;
    var tObj = ((st.objW + D.Wpan) * pin / 1000).toFixed(3);
    var tW = (D.Wq * (st.qx - pin) / 1000).toFixed(3);
    var pill = ph.name;
    if (st.balanced) pill = ph.name + " · 平衡 ✓";
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: "物矩 " + tObj + " · 权矩 " + tW + " kg·m",
      b: "权位 " + ((st.qx - D.pinU) * 100).toFixed(1) + "cm → 读 " + (D.Wq * (st.qx - D.pinU) / D.pinU).toFixed(0) + "g",
      c: "倾角 " + (st.theta * 57.3).toFixed(2) + "°" + (st.balanced ? " 平" : "")
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "pin") {
      return [
        { id: "p-pin", obj: E("pin"), text: "提纽两档(居中/偏左)" },
        { id: "p-beam", obj: E("beam"), text: "「本短标长」· 26 刻度", tone: "white" }
      ];
    }
    if (ph.id === "equal") {
      return [
        { id: "p-beam", obj: E("beam"), text: "等臂:W物 = W权(「权重相若」)" }
      ];
    }
    if (ph.id === "arm" || ph.id === "w250" || ph.id === "w125" || ph.id === "w62" || ph.id === "manual") {
      return [
        { id: "p-beam", obj: E("beam"), text: "平衡:x* = (W物+W盘)·L本 / W权" },
        { id: "p-pan", obj: E("pan"), text: "物 " + (MECH.Timeline.state.objW || 0) + "g", tone: "white" },
        { id: "p-w", obj: E("weight"), text: "权 62.5g(四两)滑动" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
