/* 时间线(40s 循环):砖台 → 铜釜辰标 → 璇玑板 → 日像现 → 节气扫描(冬→夏)
   → 时辰扫描(巳→未) → 满程回扫 → 手动(←/→ 节气,↑↓ 略) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 砖台", dur: 4, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.20, r: 6.5, target: [0, 0.8, 0] }, drift: 0.03 },
    { id: "bowl", name: "BOWL · 铜釜·十二辰", dur: 6, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.10, r: 4.6, target: [0, 1.0, 0] }, drift: 0.02 },
    { id: "xuanji", name: "XUANJI · 璇玑板针孔", dur: 4, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.50, phi: 1.12, r: 2.8, target: [0, 0.8, 0] }, drift: 0.012 },
    { id: "image", name: "IMAGE · 日像透光", dur: 5, dot: "pink", mode: "PROJECTION",
      cam: { theta: 0.30, phi: 1.05, r: 2.4, target: [0, 0.6, 0.3] }, drift: 0.010 },
    { id: "season", name: "SEASON · 节气扫描(冬→夏)", dur: 8, dot: "teal", mode: "SCANNING",
      cam: { theta: -0.30, phi: 1.08, r: 3.4, target: [0, 0.5, 0] }, drift: 0.02 },
    { id: "hour", name: "HOUR · 时辰扫描(巳→未)", dur: 6, dot: "green", mode: "SCANNING",
      cam: { theta: 0.70, phi: 1.06, r: 2.6, target: [0, 0.4, 0.4] }, drift: 0.010 },
    { id: "back", name: "BACK · 满程回扫", dur: 4, dot: "blue", mode: "SCANNING",
      cam: { theta: 1.00, phi: 1.10, r: 3.4, target: [0, 0.6, 0] }, drift: 0.015 },
    { id: "manual", name: "MANUAL · 手动(←/→ 节气 · ↑/↓ 略)", dur: 3, dot: "red", mode: "MANUAL",
      cam: { theta: -0.40, phi: 1.12, r: 3.6, target: [0, 0.8, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "bowl", "xuanji", "image", "season", "hour", "back", "manual"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "season") { st.fracDir = 1; st.hourDir = 0; }
      if (ph.id === "hour") { st.fracDir = 0; st.hourDir = 1; }
      if (ph.id === "back") { st.fracDir = -1; st.hourDir = -1; }
      if (ph.id === "manual") { st.fracDir = 0; st.hourDir = 0; }
      if (ph.id === "ground" || ph.id === "bowl" || ph.id === "xuanji" || ph.id === "image") {
        st.fracDir = 0; st.hourDir = 0;                    // 装配段不扫
      }
    }
    if (ph.id === "manual") {
      if (MECH.keys && MECH.keys.left) st.frac = Math.max(0, st.frac - 0.08 * dt);
      if (MECH.keys && MECH.keys.right) st.frac = Math.min(1, st.frac + 0.08 * dt);
      if (MECH.keys && MECH.keys.up) st.hourF = Math.min(1, st.hourF + 0.10 * dt);
      if (MECH.keys && MECH.keys.down) st.hourF = Math.max(0, st.hourF - 0.10 * dt);
    }
    st.frac = Math.min(1, Math.max(0, st.frac + st.fracDir * dt / (D.seasons * D.seasonDur)));
    st.hourF = Math.min(1, Math.max(0, st.hourF + st.hourDir * dt / (D.hours * D.hourDur)));
    KS.step(st, dt);
    /* 午后太阳变向示意:hourF>0.5 时方位偏正 */
  };

  MECH.onSeek = function (i, st) {
    if (i >= 4) { st.frac = 1; st.fracDir = -1; }
    if (i === 5) { st.hourF = 1; st.hourDir = -1; }
    if (i >= 6) { st.frac = 0; st.hourF = 0.5; }
  };

  MECH.status = function (st, ph, pt) {
    var qi = Math.round(st.frac * 24) % 24;
    var qiName = ["冬至","小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种",
                  "夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪"][qi];
    var hr = 12 + (st.hourF - 0.5) * 3;              // 巳(9-11)→午→未(13-15) 示意
    var pill = ph.name + " · " + qiName;
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: "像距天顶 " + (st.zenDist * 57.3).toFixed(1) + "°",
      b: "太阳高 " + ((Math.PI / 2 - st.zenDist) * 57.3).toFixed(1) + "° · 方位偏 " + (st.azi * 57.3).toFixed(0) + "°",
      c: "像径 " + (D.imgDia * 1000).toFixed(0) + "mm · 时 " + hr.toFixed(1) + " 时"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "bowl") {
      return [
        { id: "p-bowl", obj: E("bowl"), text: "铜釜半球 · 内画周天度" },
        { id: "p-chen", obj: E("chen"), text: "唇列十二辰位", tone: "white" }
      ];
    }
    if (ph.id === "xuanji") {
      return [
        { id: "p-xj", obj: E("xuanji"), text: "璇玑板 · 针孔容芥(球心)" }
      ];
    }
    if (ph.id === "image" || ph.id === "season" || ph.id === "hour" || ph.id === "back" || ph.id === "manual") {
      return [
        { id: "p-img", obj: E("image"), text: "像距天顶 = 90°−h(夏至10.5° 冬至58.5°)" },
        { id: "p-xj", obj: E("xuanji"), text: "针孔投影 · 像径 R×0.53°=14mm", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
