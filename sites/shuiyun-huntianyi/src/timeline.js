/* 时间线(49.5s 自动循环):前 5 段装配、后 3 段运转。
   psiW(水轮角)为 (阶段 id, 阶段内时间 pt) 的确定函数 —— seek 无需补偿:
     阶段 1-4:ψW = 0;阶段 5(引水):ψW 坡起至恒速 2.443 rad/s;
     阶段 6/7:恒速续转,蓂荚按 4.8s 升叶,星象随浑象缓转。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;
  var S5END = 0.4 + 2.443 * 6.0;   // 阶段 5 结束水轮角

  MECH.PHASES = [
    { id: "pot", name: "POT · 漏壶水槽", dur: 4.5, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: -0.60, phi: 1.14, r: 6.2, target: [-1.5, 0.7, 0] }, drift: 0.03 },
    { id: "wheel", name: "WHEEL · 水轮落轴", dur: 4.5, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.35, phi: 1.12, r: 5.0, target: [-1.35, 0.6, 0] }, drift: 0.02 },
    { id: "gears", name: "GEARS · 三级齿轮", dur: 5.0, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: 0.40, phi: 1.10, r: 5.2, target: [-0.6, 0.8, 0.2] }, drift: 0.015 },
    { id: "globe", name: "GLOBE · 浑象球", dur: 5.5, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: 0.85, phi: 1.06, r: 5.4, target: [1.3, 1.4, 0] }, drift: 0.015 },
    { id: "leaf", name: "LEAF · 瑞轮蓂荚", dur: 4.5, dot: "green", mode: "ASSEMBLY",
      cam: { theta: -0.35, phi: 1.08, r: 4.8, target: [2.2, 0.95, 0] }, drift: 0.015 },
    { id: "flow", name: "FLOW · 引水转动", dur: 9.0, dot: "blue", mode: "RUNNING",
      cam: { theta: 0.60, phi: 1.04, r: 7.0, target: [0.2, 0.9, 0] }, drift: 0.012 },
    { id: "turn", name: "TURN · 浑象周天", dur: 9.0, dot: "yellow", mode: "RUNNING",
      cam: { theta: 0.55, phi: 1.02, r: 5.6, target: [1.3, 1.42, 0] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 一转一日", dur: 12.5, dot: "red", mode: "RUNNING",
      cam: { theta: 0.75, phi: 1.04, r: 7.6, target: [0.5, 1.0, 0] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["pot", "wheel", "gears", "globe", "leaf", "flow", "turn", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, psiW: 0, omegaW: 0, errPos: 0,
      seated: 0, phaseId: "", _splashAcc: 0, _flowAcc: 0
    };
  };

  /* ψW 脚本(纯函数):坡起 τ² 积分 → 恒速 */
  function scriptPhase(ph, pt) {
    var psi = 0, om = 0;
    if (ph.id === "flow") {
      var tau = KS.clamp(pt / 2.2, 0, 1);
      if (tau < 1) {
        psi = 2.443 * 2.2 * tau * tau * tau / 3;
        om = 2.443 * tau * tau;
      } else { psi = 0.4 + 2.443 * (pt - 2.2); om = 2.443; }
    } else if (ph.id === "turn") {
      psi = S5END + 2.443 * pt;
      om = 2.443;
    } else if (ph.id === "cycle") {
      psi = S5END + 2.443 * 9.0 + 2.443 * pt;
      om = 2.443;
    }
    return { psi: psi, om: om };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.psiW = s.psi; st.omegaW = s.om;
    st.phaseId = ph.id;

    /* 漏壶注水 + 桨叶击水 */
    if (st.omegaW > 0.05) {
      st._splashAcc += dt;
      while (st._splashAcc > 0.10) {
        st._splashAcc -= 0.10;
        MECH.Scene3D.spawnPuff(D.wheelX + (Math.random() - 0.5) * 0.6, D.wheelY - D.RWheel + 0.10, (Math.random() - 0.5) * 0.4,
          { max: 0.5, base: 0.26, vy: 0.85 + Math.random() * 0.4, tint: 0x8FCBE8, opacity: 0.5 });
      }
    }
    /* 漏壶水柱(恒流,小水花) */
    st._flowAcc += dt;
    while (st._flowAcc > 0.3) {
      st._flowAcc -= 0.3;
      MECH.Scene3D.spawnPuff(D.potX + 0.24, D.potH - 0.12, 0,
        { max: 0.4, base: 0.14, vy: -0.9, vx: 0.15, tint: 0x8FCBE8, opacity: 0.5 });
    }

    /* 水面微动 */
    var ch = MECH.Parts.entry("channel");
    if (ch && ch.shown && ch.group.userData.water) {
      ch.group.userData.water.position.y = 0.15 + 0.005 * Math.sin(st.time * 2.4);
    }
    var po = MECH.Parts.entry("pot");
    if (po && po.shown && po.group.userData.water) {
      po.group.userData.water.position.y = D.potH - 0.05 + 0.004 * Math.sin(st.time * 1.8);
    }
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "turn") {
      return { phi: 0.82, r: 4.6, target: [1.3, 1.42, 0.1] };
    }
    if (ph.id === "cycle") {
      var c = pt % 6.25;
      if (c < 3.0) return { phi: 0.82, r: 4.6, target: [1.3, 1.42, 0.1] };
      if (c >= 3.0 && c < 4.8) return { phi: 0.85, r: 3.8, target: [2.2, 0.95, 0.1] };
      return null;
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = st.omegaW > 0.05;
    var dayFrac = (st.psiW / D.iTotal / (2 * Math.PI)) % 1;
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · 浑象一日 " + (dayFrac * 100).toFixed(0) + "%",
      a: st.omegaW.toFixed(2) + " rad/s",
      b: (st.omegaW / D.iTotal).toFixed(3) + " rad/s",
      c: Math.round(dayFrac * D.leafN) + " / 15 叶"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "pot") {
      return [
        { id: "p-po", obj: E("pot"), text: "漏壶 · 恒流注水" },
        { id: "p-ch", obj: E("channel"), text: "水槽 · 轮下水道", tone: "white" }
      ];
    }
    if (ph.id === "wheel") {
      return [{ id: "p-ww", obj: E("wheel"), text: "水轮 r 0.38 · 齿轮1 28T" }];
    }
    if (ph.id === "gears") {
      return [{ id: "p-gt", obj: E("gears"), text: "三级减速 3.5×4×2 = 28", tone: "white" }];
    }
    if (ph.id === "globe") {
      return [{ id: "p-gb", obj: E("globe"), text: "浑象球 · 一转 = 一日(×1200)", tone: "white" }];
    }
    if (ph.id === "leaf") {
      return [{ id: "p-lw", obj: E("leafWheel"), text: "瑞轮蓂荚 · 15 叶按日升落" }];
    }
    if (ph.id === "flow" || ph.id === "turn" || ph.id === "cycle") {
      return [
        { id: "p-gt2", obj: E("gears"), text: "ω浑 = ω轮 / 28" },
        { id: "p-lw2", obj: E("leafWheel"), text: "蓂荚每 4.8s 升一叶", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
