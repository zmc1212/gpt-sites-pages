/* 时间线(44s):弩床弓弦 → 矢匣杠杆 → 槽内矢 → 靶 → 连射演示 ×2 → 特写 → 手动 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "bed", name: "BED · 弩床与弓弦", dur: 4, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.22, r: 4.2, target: [0, 0.7, 0] }, drift: 0.03 },
    { id: "magazine", name: "MAGAZINE · 矢匣与杠杆", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.26, r: 3.0, target: [-0.2, 0.85, 0] }, drift: 0.008 },
    { id: "loaded", name: "ARROW · 落矢入槽", dur: 3, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: 0.15, phi: 1.28, r: 2.4, target: [-0.15, 0.72, 0] }, drift: 0.006 },
    { id: "target", name: "TARGET · 靶位", dur: 3, dot: "blue", mode: "READY",
      cam: { theta: -0.4, phi: 1.24, r: 8.5, target: [3, 0.7, 0] }, drift: 0.02 },
    { id: "burst1", name: "VOLLEY · 连射演示(上)", dur: 8, dot: "green", mode: "VOLLEY",
      cam: { theta: 0.65, phi: 1.22, r: 4.4, target: [0, 0.7, 0] }, drift: 0.01 },
    { id: "burst2", name: "VOLLEY · 连射演示(下)", dur: 8, dot: "pink", mode: "VOLLEY",
      cam: { theta: -0.5, phi: 1.20, r: 4.4, target: [0, 0.7, 0] }, drift: 0.02 },
    { id: "closeup", name: "CLOSE · 杠杆-牙-弦特写", dur: 6, dot: "yellow", mode: "CLOSE-UP",
      cam: { theta: 0.15, phi: 1.30, r: 2.0, target: [-0.1, 0.72, 0] }, drift: 0.005 },
    { id: "manual", name: "MANUAL · ←/→ 逐矢击发", dur: 8, dot: "red", mode: "MANUAL",
      cam: { theta: 0.30, phi: 1.24, r: 4.6, target: [0.4, 0.7, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["bed", "magazine", "loaded", "target", "burst1", "burst2", "closeup", "manual"];

  MECH.newState = KS.newState;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      st.manual = ph.id === "manual";
      if (ph.id === "burst1" || ph.id === "burst2" || ph.id === "closeup") {
        /* 连射段:持续运转(状态机自行循环) */
      }
      if (ph.id === "manual") {
        /* 手动:每按一次 ←/→ 射一支(重置状态机到 loading) */
        st.mode = "loading"; st.modeT = 0; st.cycleIdx = 0;
      }
    }
    var shot0 = st.shotN;
    var runPhase = ph.id === "burst1" || ph.id === "burst2" || ph.id === "closeup" || ph.id === "manual";
    if (!runPhase) {
      /* 装配段:状态机暂停(不落矢不击发) */
      return;
    }
    if (st.manual && MECH.keys) {
      var K = MECH.keys.left || MECH.keys.right;
      if (K && !st._key) {
        /* 单发:推进一个完整循环(快速 scripted) */
        st.arrows = Math.max(0, st.arrows - 1) + (st.arrows > 0 ? 0 : 0);
        if (st.arrows > 0) {
          st.arrows -= 0;   // 占位,step 内减
          st._manualShot = true;
          /* 直接注入:强制完成一次 pushing 击发 */
          if (st.mode !== "pushing") { st.mode = "pushing"; st.cycleIdx = 2; st.modeT = 0; }
        }
      }
      st._key = K;
    }
    KS.step(st, dt);
    /* 击发瞬间 → 矢尾尘 */
    if (st.shotN > shot0) {
      MECH.Scene3D.spawnPuff(0.45, 0.64, 0, {
        max: 0.5, base: 0.18, vx: 0.8, vy: 0.15, vz: 0, opacity: 0.5, tint: 0xBFD8E8, grow: 1.3
      });
    }
    /* 命中靶 → 尘 */
    if (st.flight) {
      var t = (st.time - st.flight.t0) / D.flyT;
      if (t > 0.96 && Math.random() < dt * 6) {
        MECH.Scene3D.spawnPuff(D.targetX - 0.05, 0.68, 0, {
          max: 0.5, base: 0.15, vx: -0.2, vy: 0.4, vz: 0.1, opacity: 0.6, tint: 0xC9B89A, grow: 1.4
        });
      }
    }
  };

  MECH.status = function (st, ph, pt) {
    var pill = ph.name;
    if (st.mode === "cocking") pill = ph.name + " · 后拉钩弦";
    else if (st.mode === "pushing") pill = ph.name + " · 前推击发";
    else if (st.mode === "loading") pill = ph.name + " · 落矢入槽";
    return {
      mode: ph.mode,
      hot: st.mode === "pushing",
      pill: pill,
      a: "弦 " + st.string.toFixed(2) + " m",
      b: "余矢 " + st.arrows + "/10",
      c: st.shotN + " 发"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "bed") return [{ id: "p-bw", obj: E("bow"), text: "弓臂与弦 · 牙钩推拉" }];
    if (ph.id === "magazine") return [
      { id: "p-mg", obj: E("magazine"), text: "矢匣 10 矢 · 铁矢八寸" },
      { id: "p-lv", obj: E("lever"), text: "杠杆 · 往复装填击发", tone: "white" }
    ];
    if (ph.id === "burst1" || ph.id === "burst2" || ph.id === "closeup" || ph.id === "manual") return [
      { id: "p-lv", obj: E("lever"), text: "循环:落矢→钩弦→脱牙→击发", tone: "white" },
      { id: "p-tg", obj: E("target"), text: "靶 8m" }
    ];
    return [];
  };
})(window.MECH = window.MECH || {});
