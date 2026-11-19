/* 时间线(46s 自动循环):前 6 段装配、后 2 段运转。
   ψ(框角)为 (阶段 id, 阶段内时间 pt) 的确定函数 —— seek 无需补偿:
     阶段 1-6:ψ = 0;阶段 7:ω 坡起至 2.4 rad/s;阶段 8:恒速续转。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;
  var S7END = 0.75 + 2.4 * 5.0;   // 阶段 7 结束框角(坡起积分 + 恒速)

  MECH.PHASES = [
    { id: "stove", name: "STOVE · 灶锅浮茧", dur: 4.5, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: -0.60, phi: 1.14, r: 6.4, target: [-0.9, 0.7, 0] }, drift: 0.03 },
    { id: "stand", name: "STAND · 机架框轴", dur: 4.5, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: 0.40, phi: 1.12, r: 5.8, target: [1.1, 0.8, 0] }, drift: 0.02 },
    { id: "frame", name: "FRAME · 丝框上轴", dur: 5.0, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: 0.85, phi: 1.08, r: 4.8, target: [1.1, 0.9, 0.2] }, drift: 0.015 },
    { id: "guide", name: "GUIDE · 送丝竿移丝钩", dur: 4.5, dot: "green", mode: "ASSEMBLY",
      cam: { theta: -0.35, phi: 1.10, r: 5.0, target: [0.2, 1.0, 0.2] }, drift: 0.015 },
    { id: "treadle", name: "TREADLE · 踏板曲柄", dur: 4.5, dot: "blue", mode: "ASSEMBLY",
      cam: { theta: 0.70, phi: 1.14, r: 4.6, target: [1.1, 0.5, 0.5] }, drift: 0.015 },
    { id: "threads", name: "THREADS · 引丝上框", dur: 5.0, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: -0.15, phi: 1.08, r: 5.6, target: [0.2, 0.9, 0.2] }, drift: 0.015 },
    { id: "start", name: "START · 脚踏试缫", dur: 8.0, dot: "yellow", mode: "REELING",
      cam: { theta: 0.60, phi: 1.06, r: 7.0, target: [0.2, 0.8, 0] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 绕框成丝", dur: 10.0, dot: "red", mode: "REELING",
      cam: { theta: 0.75, phi: 1.06, r: 8.0, target: [0.3, 0.8, 0] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["stove", "stand", "frame", "guide", "treadle", "threads", "start", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, psi: 0, omega: 0, errPos: 0,
      seated: 0, phaseId: "", _steamAcc: 0
    };
  };

  /* ψ 脚本(纯函数):τ² 坡起积分 → 恒速 */
  function scriptPhase(ph, pt) {
    var psi = 0, om = 0;
    if (ph.id === "start") {
      var tau = KS.clamp(pt / 2.5, 0, 1);
      if (tau < 1) { psi = 2.4 * 2.5 * tau * tau * tau / 3; om = 2.4 * tau * tau; }
      else { psi = 0.75 + 2.4 * (pt - 2.5); om = 2.4; }
    } else if (ph.id === "cycle") {
      psi = S7END + 2.4 * pt;
      om = 2.4;
    }
    return { psi: psi, om: om };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.psi = s.psi; st.omega = s.om;
    st.phaseId = ph.id;

    /* 锅汽 */
    st._steamAcc += dt;
    while (st._steamAcc > 0.28) {
      st._steamAcc -= 0.28;
      MECH.Scene3D.spawnPuff(D.stoveX + (Math.random() - 0.5) * 0.3, D.basinWater + 0.08, (Math.random() - 0.5) * 0.3,
        { max: 1.0, base: 0.32, vy: 0.75 + Math.random() * 0.35, grow: 2.4, tint: 0xE8E4DA, opacity: 0.5 });
    }
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "cycle") {
      var c = pt % 5.0;
      if (c < 2.2) return { phi: 0.85, r: 4.4, target: [0.8, 0.95, 0.2] };  // 近观框绕丝
      return null;
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = ph.id === "start" || ph.id === "cycle";
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · ψ " + st.psi.toFixed(1) + " rad",
      a: st.psi.toFixed(1) + " rad",
      b: KS.hookZ(st.psi).toFixed(2) + " m",
      c: (2 * D.rTread).toFixed(2) + " m"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "stove") {
      return [
        { id: "p-st", obj: E("stove"), text: "灶锅 · 缫汤沸腾" },
        { id: "p-co", obj: E("cocoons"), text: "浮茧 ×6 · 抽丝", tone: "white" }
      ];
    }
    if (ph.id === "frame") {
      return [{ id: "p-rf", obj: E("reelFrame"), text: "丝框 · 径 0.70m · 双十字轮" }];
    }
    if (ph.id === "guide") {
      return [
        { id: "p-ga", obj: E("guideArm"), text: "送丝竿 · 滑槽过丝眼" },
        { id: "p-hk", obj: E("hook"), text: "移丝钩 · 往复 0.28m · 1:1", tone: "white" }
      ];
    }
    if (ph.id === "treadle") {
      return [{ id: "p-td", obj: E("treadle"), text: "踏板曲柄 · r 0.11 · 行程 0.22m", tone: "white" }];
    }
    if (ph.id === "threads") {
      return [{ id: "p-th", obj: E("threads"), text: "丝线 · 茧→钩→框", tone: "white" }];
    }
    if (ph.id === "start" || ph.id === "cycle") {
      return [
        { id: "p-rf2", obj: E("reelFrame"), text: "框转 2.4 rad/s · 钩往复同频" },
        { id: "p-td2", obj: E("treadle"), text: "脚踏直驱 · 同轴 1:1", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
