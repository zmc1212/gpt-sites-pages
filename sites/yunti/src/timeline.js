/* 时间线(42s 循环):床屏城墙 → 主梯绞车 → 绞升立梯(15°→55°) → 飞梯上展 →
   抵城钩堞 → 手动绞车(← 立梯 / → 收梯) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "ground", name: "GROUND · 床屏与城墙", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.18, r: 10.5, target: [-2.5, 2.5, 0] }, drift: 0.03 },
    { id: "ladder", name: "LADDER · 主梯(折叠态)·绞车", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.35, phi: 1.16, r: 6.5, target: [0, 1.6, 0] }, drift: 0.02 },
    { id: "raise", name: "RAISE · 绞升立梯(15°→55°)", dur: 8, dot: "teal", mode: "RAISING",
      cam: { theta: -0.30, phi: 1.16, r: 8.0, target: [-1.5, 3.2, 0] }, drift: 0.02 },
    { id: "fly", name: "FLY · 飞梯上展(+2.2m)", dur: 6, dot: "orange", mode: "EXTENDING",
      cam: { theta: 0.35, phi: 1.04, r: 13.0, target: [-3.0, 3.4, 0] }, drift: 0.015 },
    { id: "hook", name: "HOOK · 抵城钩堞", dur: 5, dot: "green", mode: "HOOKING",
      cam: { theta: 0.35, phi: 1.02, r: 11.5, target: [-3.2, 3.8, 0] }, drift: 0.015 },
    { id: "show", name: "SHOW · 窥城全景", dur: 5, dot: "blue", mode: "SHOWCASE",
      cam: { theta: 1.05, phi: 1.10, r: 12.0, target: [-2.8, 3.4, 0] }, drift: 0.015 },
    { id: "detail", name: "DETAIL · 转轴与抓钩", dur: 4, dot: "pink", mode: "DETAIL",
      cam: { theta: 0.75, phi: 1.10, r: 5.0, target: [-2.6, 5.0, 0] }, drift: 0.008 },
    { id: "manual", name: "MANUAL · 手动绞车(← 绞升 / → 收梯)", dur: 4, dot: "red", mode: "MANUAL",
      cam: { theta: -0.35, phi: 1.18, r: 8.5, target: [-1.5, 3.0, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["ground", "ladder", "raise", "fly", "hook", "show", "detail", "manual"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "raise") st.thetaT = D.th1;
      if (ph.id === "fly") st.flyT = D.flyLen;
      if (ph.id === "hook") { st.thetaT = D.th1; st.flyT = D.flyLen; }
      if (ph.id === "manual") { st.thetaT = st.theta; st.flyT = st.fly; }
    }
    if (ph.id === "manual") {
      var up = MECH.keys && MECH.keys.left, dn = MECH.keys && MECH.keys.right;
      if (up) { st.thetaT = Math.min(D.th1, st.thetaT + 0.12 * dt); st.flyT = Math.min(D.flyLen, st.flyT + 0.10 * dt); }
      if (dn) { st.flyT = Math.max(0, st.flyT - 0.10 * dt); st.thetaT = Math.max(D.th0, st.thetaT - 0.12 * dt); }
    }
    KS.step(st, dt);
  };

  /* seek 补偿:立起/飞梯段直接预置 */
  MECH.onSeek = function (i, st) {
    if (i >= 2) { st.theta = D.th1; st.thetaT = D.th1; st.rope1 = D.dRope1; }
    if (i >= 3) { st.fly = D.flyLen; st.flyT = D.flyLen; st.rope2 = D.dRope2; }
    if (i >= 5) st.hooked = true;
  };

  MECH.status = function (st, ph, pt) {
    var H = D.Ltotal * Math.sin(st.theta) + D.cartH + st.fly * Math.sin(st.theta);
    var pill = ph.name;
    if (st.thetaT > D.th0 + 0.05) pill = ph.name + " · " + (st.theta * 57.3).toFixed(0) + "°";
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: "梯角 " + (st.theta * 57.3).toFixed(1) + "° · H " + H.toFixed(2) + "m",
      b: "绞绳 " + (st.rope1 + st.rope2).toFixed(2) + "m · " + ((st.rope1 + st.rope2) / (2 * Math.PI * D.winchR)).toFixed(2) + " 圈",
      c: (st.hooked ? "钩堞 ✓" : "未抵城") + " · 钩-墙差 " + Math.abs(Math.abs(D.wallX + D.wallT / 2) - (D.Ltotal * Math.cos(st.theta) + 0.35)).toFixed(2) + "m"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "ladder") {
      return [
        { id: "p-ml", obj: E("mainLadder"), text: "主梯 6.2m · 中施转轴" },
        { id: "p-winch", obj: E("winch"), text: "绞车 r0.12 · 双辘轳(借鉴)", tone: "white" }
      ];
    }
    if (ph.id === "raise") {
      return [
        { id: "p-ml", obj: E("mainLadder"), text: "立梯绞绳 1.40m = 1.86 圈" },
        { id: "p-cart", obj: E("cart"), text: "H = L·sinθ + 车顶", tone: "white" }
      ];
    }
    if (ph.id === "fly" || ph.id === "hook" || ph.id === "show" || ph.id === "detail" || ph.id === "manual") {
      return [
        { id: "p-ml", obj: E("mainLadder"), text: "飞梯上展 +2.2m(2.92 圈)" },
        { id: "p-wall", obj: E("wall"), text: "可达 H = 8.4·sin55°+1.10 = 7.98m", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
