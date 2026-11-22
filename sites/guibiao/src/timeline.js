/* 时间线(41s 循环):圭表座 → 廿四气标 → 晷影示日 → 节气扫描(冬→夏→冬)
   → 两至对照 → 读数展示 → 影长曲线 → 手动节气(←/→) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 圭与八尺表", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 6.0, target: [-1.0, 1.0, 0] }, drift: 0.03 },
    { id: "marks", name: "MARKS · 廿四气标", dur: 4, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.16, r: 4.4, target: [-1.4, 0.4, 0] }, drift: 0.02 },
    { id: "shadow", name: "SHADOW · 晷影与示日", dur: 4, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.45, phi: 1.14, r: 4.6, target: [-1.0, 1.4, 0] }, drift: 0.015 },
    { id: "scan", name: "SCAN · 节气扫描(冬→夏)", dur: 8, dot: "teal", mode: "SCANNING",
      cam: { theta: -0.30, phi: 1.16, r: 5.5, target: [-1.2, 1.6, 0] }, drift: 0.02 },
    { id: "back", name: "BACK · 夏→冬回扫", dur: 6, dot: "blue", mode: "SCANNING",
      cam: { theta: 0.85, phi: 1.14, r: 5.0, target: [-1.2, 1.5, 0] }, drift: 0.015 },
    { id: "verify", name: "VERIFY · 两至对照", dur: 5, dot: "green", mode: "VERIFYING",
      cam: { theta: 0.20, phi: 1.12, r: 4.2, target: [-1.4, 0.6, 0] }, drift: 0.010 },
    { id: "curve", name: "CURVE · 影长曲线", dur: 4, dot: "pink", mode: "SHOWCASE",
      cam: { theta: 1.10, phi: 1.10, r: 4.6, target: [-1.3, 0.7, 0] }, drift: 0.008 },
    { id: "manual", name: "MANUAL · 手动节气(← 冬至向 / → 夏至向)", dur: 4, dot: "red", mode: "MANUAL",
      cam: { theta: -0.50, phi: 1.18, r: 5.2, target: [-1.2, 1.2, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "marks", "shadow", "scan", "back", "verify", "curve", "manual"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "scan") { st.fracDir = 1; }
      if (ph.id === "back") { st.fracDir = -1; }
      if (ph.id === "verify") st.fracDir = 0;   // 两至对照:夏至/冬至(分半驻留)
      if (ph.id === "manual") st.fracDir = 0;
    }
    if (ph.id === "manual") {
      var d = 0;
      if (MECH.keys && MECH.keys.left) d -= 0.06;
      if (MECH.keys && MECH.keys.right) d += 0.06;
      st.frac = Math.min(1, Math.max(0, st.frac + d * dt));
    }
    if (ph.id === "verify") {
      st.frac = (pt < ph.dur / 2) ? 0.5 : 0;    // 前半夏至驻留,后半冬至驻留
    }
    KS.step(st, dt);
  };

  /* seek 补偿:对照/曲线段预置节气位 */
  MECH.onSeek = function (i, st) {
    if (i === 5) st.frac = 0.5;
    if (i >= 6) { st.frac = 0.5; st.fracDir = -1; }
  };

  MECH.status = function (st, ph, pt) {
    var qi = Math.round(st.frac * 24) % 24;
    var qiName = ["冬至","小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种",
                  "夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪"][qi];
    var pill = ph.name + " · " + qiName;
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: "影长 " + (st.shadow / D.ZHOU).toFixed(2) + " 尺(" + st.shadow.toFixed(2) + "m)",
      b: "太阳高 " + (st.alt * 57.3).toFixed(1) + "° · δ " + (st.decl * 57.3).toFixed(1) + "°",
      c: "夏至 " + D.refSummer.toFixed(2) + "m · 冬至 " + D.refWinter.toFixed(2) + "m"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "ground") {
      return [
        { id: "p-biao", obj: E("biao"), text: "八尺表 1.848m(周尺 0.231)" },
        { id: "p-gui", obj: E("gui"), text: "圭 3.5m 南向 · 水槽校平", tone: "white" }
      ];
    }
    if (ph.id === "scan" || ph.id === "back") {
      return [
        { id: "p-sh", obj: E("shadow"), text: "L = H/tan(h) · h = 90°−φ+δ" },
        { id: "p-sun", obj: E("sun"), text: "δ = asin(sin24°·sinλ) · φ=35.3°反推", tone: "white" }
      ];
    }
    if (ph.id === "verify" || ph.id === "curve" || ph.id === "manual") {
      return [
        { id: "p-sh", obj: E("shadow"), text: "夏至 0.374m ≈ 一尺六寸 ✓" },
        { id: "p-marks", obj: E("marks"), text: "冬至 2.96m ≈ 一丈三尺五寸(差5%)", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
