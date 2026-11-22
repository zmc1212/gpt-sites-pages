/* 时间线(44s):基座 → 极轴环圈 → 四游环 → 演示星 → 瞄准织女 → 瞄准角宿 →
   巡天扫描 → 手动(←/→ 转四游环) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "base", name: "BASE · 基座云柱", dur: 4, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.22, r: 4.6, target: [0, 0.8, 0] }, drift: 0.03 },
    { id: "polar", name: "POLAR · 极轴与环圈", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.24, r: 3.4, target: [0, 1.1, 0] }, drift: 0.01 },
    { id: "you", name: "YOU · 四游环窥衡", dur: 5, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: 0.15, phi: 1.26, r: 3.0, target: [0, 1.15, 0] }, drift: 0.008 },
    { id: "stars", name: "STARS · 演示星表", dur: 3, dot: "blue", mode: "READY",
      cam: { theta: -0.35, phi: 1.20, r: 5.0, target: [0, 1.3, 0] }, drift: 0.02 },
    { id: "aim1", name: "AIM · 瞄准织女一(去极 51.2°)", dur: 6, dot: "green", mode: "AIMING",
      cam: { theta: 0.75, phi: 1.22, r: 3.8, target: [0, 1.15, 0] }, drift: 0.01 },
    { id: "aim2", name: "AIM · 瞄准角宿一(去极 101.2°)", dur: 6, dot: "pink", mode: "AIMING",
      cam: { theta: -0.45, phi: 1.20, r: 3.8, target: [0, 1.15, 0] }, drift: 0.02 },
    { id: "sweep", name: "SWEEP · 巡天扫描", dur: 8, dot: "yellow", mode: "SWEEPING",
      cam: { theta: 0.20, phi: 1.24, r: 4.2, target: [0, 1.15, 0] }, drift: 0.008 },
    { id: "manual", name: "MANUAL · ←/→ 转四游环", dur: 8, dot: "red", mode: "MANUAL",
      cam: { theta: -0.3, phi: 1.22, r: 4.0, target: [0, 1.15, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["base", "polar", "you", "stars", "aim1", "aim2", "sweep", "manual"];

  var aims = { aim1: 0, aim2: 1 };

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      st.manual = ph.id === "manual";
      if (aims[ph.id] !== undefined) {
        st.starIdx = aims[ph.id];
        st.psiTarget = D.stars[st.starIdx].psi;
        st.sweep = false;
      }
      st.sweep = ph.id === "sweep";
    }
    if (st.manual && MECH.keys) {
      var L = MECH.keys.left, R = MECH.keys.right;
      if (L && !st._keyL) { st.sweep = false; st.psiTarget = Math.min(Math.PI, st.psiTarget + 0.12); }
      if (R && !st._keyR) { st.sweep = false; st.psiTarget = Math.max(0.15, st.psiTarget - 0.12); }
      st._keyL = L; st._keyR = R;
    }
    KS.step(st, dt);
  };

  MECH.status = function (st, ph, pt) {
    var pill = ph.name;
    if (ph.id === "aim1" || ph.id === "aim2") pill = ph.name + " · 读数 " + st.quJiDu.toFixed(1) + "°";
    if (ph.id === "sweep") pill = "SWEEP · 去极 " + st.quJiDu.toFixed(1) + "°";
    if (ph.id === "manual") pill = "MANUAL · 去极 " + st.quJiDu.toFixed(1) + "°";
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: st.quJiDu.toFixed(1) + "°",
      b: D.stars[st.starIdx].name,
      c: "赤纬 " + (90 - st.quJiDu).toFixed(1) + "°"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "polar") return [
      { id: "p-po", obj: E("polar"), text: "极轴 50° · 百刻环 + 赤道环 24 节气" }
    ];
    if (ph.id === "you") return [{ id: "p-y", obj: E("you"), text: "四游环 · 双窥衡 · 绕极轴" }];
    if (ph.id === "aim1" || ph.id === "aim2" || ph.id === "sweep" || ph.id === "manual") return [
      { id: "p-y", obj: E("you"), text: "去极度 = 四游环转角", tone: "white" },
      { id: "p-st", obj: E("star"), text: "演示星 · 黄点亮 = 瞄准" }
    ];
    return [];
  };
})(window.MECH = window.MECH || {});
