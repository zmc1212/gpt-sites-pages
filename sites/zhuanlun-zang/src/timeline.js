/* 时间线(48.5s 自动循环):前 4 段装配、后 4 段运转。
   psi(藏角)为 (阶段 id, 阶段内时间 pt) 的确定函数 —— coastPsi 纯函数:
     阶段 1-4:ψ = 0;
     阶段 5(推藏):t=1.0 推,ψ = coastPsi(pt − 1.0);
     阶段 6(续转):ψ 延续衰减 + 二次推;
     阶段 7(巡转):缓慢巡转(显示八棱面切换);
     阶段 8(循环):再推一轮。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "base", name: "BASE · 殿基凹座", dur: 4.5, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.14, r: 7.2, target: [0, 0.5, 0] }, drift: 0.03 },
    { id: "bearing", name: "BEARING · 铁承座藏针", dur: 4.5, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.50, phi: 1.12, r: 4.2, target: [0, 0.7, 0] }, drift: 0.02 },
    { id: "case", name: "CASE · 八棱藏柜", dur: 6.0, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: 0.85, phi: 1.08, r: 6.4, target: [0, 1.6, 0] }, drift: 0.015 },
    { id: "shelves", name: "SHELVES · 经函架", dur: 5.5, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: -0.35, phi: 1.06, r: 5.6, target: [0.6, 1.5, 0.6] }, drift: 0.015 },
    { id: "canopy", name: "CANOPY · 檐顶上梁", dur: 5.0, dot: "green", mode: "ASSEMBLY",
      cam: { theta: 0.60, phi: 1.06, r: 7.0, target: [0, 1.9, 0] }, drift: 0.015 },
    { id: "push", name: "PUSH · 推藏试转", dur: 8.0, dot: "blue", mode: "PUSHED",
      cam: { theta: 0.60, phi: 1.04, r: 7.4, target: [0, 1.6, 0] }, drift: 0.012 },
    { id: "tour", name: "TOUR · 缓巡八棱", dur: 8.0, dot: "yellow", mode: "TOURING",
      cam: { theta: 0.55, phi: 1.04, r: 6.6, target: [0.3, 1.6, 0.3] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 久转不息", dur: 10.5, dot: "red", mode: "COASTING",
      cam: { theta: 0.75, phi: 1.04, r: 7.6, target: [0, 1.6, 0] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["base", "bearing", "case", "shelves", "canopy", "push", "tour", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, psi: 0, omega: 0, errPos: 0,
      seated: 0, phaseId: ""
    };
  };

  /* ψ 脚本(纯函数,coastPsi 累计) */
  function scriptPhase(ph, pt) {
    var psi = 0, om = 0;
    if (ph.id === "push") {
      psi = KS.coastPsi(Math.max(0, pt - 1.0));
      om = D.omega0 * Math.exp(-D.k * Math.max(0, pt - 1.0));
    } else if (ph.id === "tour") {
      /* 缓巡:8 棱匀速 45°/2s */
      psi = KS.coastPsi(7.0) + (D.sideAngle / 2.0) * pt;
      om = D.sideAngle / 2.0;
    } else if (ph.id === "cycle") {
      /* 再推:延续巡转 + 惯转 */
      var base = KS.coastPsi(7.0) + (D.sideAngle / 2.0) * 8.0;
      psi = base + KS.coastPsi(pt);
      om = D.omega0 * Math.exp(-D.k * pt);
    }
    return { psi: psi, om: om };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.psi = s.psi; st.omega = s.om;
    st.phaseId = ph.id;
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "push") {
      var c = pt % 8.0;
      if (c > 1.0 && c < 3.0) return { phi: 0.82, r: 6.0, target: [Math.sin(st.psi) * 1.2, 1.6, Math.cos(st.psi) * 1.2] };
      return null;
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = st.omega > 0.05;
    var side = Math.floor(((st.psi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / D.sideAngle) + 1;
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · 第 " + side + " 面",
      a: KS.deg(st.psi % (2 * Math.PI)).toFixed(0) + "°",
      b: st.omega.toFixed(2) + " rad/s",
      c: "惯转 " + D.coastAngle.toFixed(1) + " rad"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "bearing") {
      return [{ id: "p-br", obj: E("bearing"), text: "铁承座藏针 · r 0.02 下承" }];
    }
    if (ph.id === "case") {
      return [{ id: "p-cs", obj: E("case"), text: "八棱藏柜 · 对径 2.6 · 每棱 45°" }];
    }
    if (ph.id === "shelves") {
      return [{ id: "p-sh", obj: E("shelves"), text: "经函架 · 3 排 × 8 面 24 函", tone: "white" }];
    }
    if (ph.id === "canopy") {
      return [
        { id: "p-cp", obj: E("canopy"), text: "八角檐顶 + 宝顶" },
        { id: "p-tb", obj: E("topBeam"), text: "上梁悬桩 · 限位", tone: "white" }
      ];
    }
    if (ph.id === "push") {
      return [
        { id: "p-pb", obj: E("pushBar"), text: "一人推之 · ω0 1.2 rad/s" },
        { id: "p-cs2", obj: E("case"), text: "惯转 13.6 rad · 速若风驰", tone: "white" }
      ];
    }
    if (ph.id === "tour" || ph.id === "cycle") {
      return [
        { id: "p-cs3", obj: E("case"), text: "经函巡转 · 面次切换" },
        { id: "p-br2", obj: E("bearing"), text: "枢针低摩擦 · 久转不息", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
