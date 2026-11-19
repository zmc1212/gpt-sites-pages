/* 时间线(44s 自动循环):前 6 段装配、后 2 段运转。
   ψ(下辊角)/ drawProg(棉团牵引进度)为 (阶段 id, 阶段内时间 pt) 的确定
   函数 —— seek 无需补偿:
     阶段 1-5:ψ = 0;
     阶段 6(空转):ψ 坡起恒速 0.9 rad/s;
     阶段 7(轧棉):恒速 + drawProg 0→1(棉团牵出、棉籽落、皮棉伸长);
     阶段 8(循环):换第二团(drawProg 复位后再牵),持续运转。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;
  var S6END = 0.075 + 0.9 * 3.0;

  MECH.PHASES = [
    { id: "base", name: "BASE · 机架", dur: 4.5, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.14, r: 6.4, target: [0, 0.6, 0] }, drift: 0.03 },
    { id: "rollerLow", name: "ROLLER · 下辊齿轮A", dur: 4.5, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.50, phi: 1.12, r: 5.4, target: [0, 0.5, 0] }, drift: 0.02 },
    { id: "rollerUp", name: "ROLLER · 上辊齿轮B", dur: 5.0, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: 0.85, phi: 1.10, r: 4.8, target: [0, 0.62, -0.2] }, drift: 0.015 },
    { id: "treadle", name: "TREADLE · 踏板给棉板", dur: 4.5, dot: "green", mode: "ASSEMBLY",
      cam: { theta: 0.40, phi: 1.12, r: 5.2, target: [0.1, 0.6, 0.4] }, drift: 0.015 },
    { id: "cotton", name: "COTTON · 棉团候轧", dur: 5.0, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: -0.30, phi: 1.08, r: 5.0, target: [0.1, 0.7, 0.3] }, drift: 0.015 },
    { id: "idle", name: "IDLE · 空转试车", dur: 5.0, dot: "blue", mode: "IDLE",
      cam: { theta: 0.60, phi: 1.08, r: 6.0, target: [0, 0.65, 0] }, drift: 0.012 },
    { id: "gin", name: "GIN · 轧棉牵出", dur: 8.0, dot: "yellow", mode: "GINNING",
      cam: { theta: 0.55, phi: 1.06, r: 5.6, target: [0.1, 0.62, 0.15] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 连续轧棉", dur: 12.0, dot: "red", mode: "GINNING",
      cam: { theta: 0.75, phi: 1.06, r: 6.6, target: [0.1, 0.62, 0.1] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["base", "rollerLow", "rollerUp", "treadle", "cotton", "idle", "gin", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, psi: 0, omega: 0, drawProg: 0, errPos: 0,
      seated: 0, phaseId: "", _prevProg: 0
    };
  };

  /* ψ / drawProg 脚本(纯函数) */
  function scriptPhase(ph, pt) {
    var psi = 0, om = 0, prog = 0;
    if (ph.id === "idle") {
      var tau = KS.clamp(pt / 2.0, 0, 1);
      if (tau < 1) { psi = 0.9 * 2.0 * tau * tau * tau / 3; om = 0.9 * tau * tau; }
      else { psi = 0.075 + 0.9 * (pt - 2.0); om = 0.9; }
    } else if (ph.id === "gin") {
      psi = S6END + 0.9 * pt;
      om = 0.9;
      prog = KS.clamp((pt - 1.2) / 5.2, 0, 1);
    } else if (ph.id === "cycle") {
      var c = pt % 6.0;
      psi = S6END + 0.9 * pt;
      om = 0.9;
      prog = KS.clamp((c - 0.8) / 4.2, 0, 1);
    }
    return { psi: psi, om: om, prog: prog };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.psi = s.psi; st.omega = s.om; st.drawProg = s.prog;
    st.phaseId = ph.id;
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "gin") {
      var c = pt % 8.0;
      if (c > 1.2 && c < 6.6) return { phi: 0.8, r: 4.2, target: [0.02, 0.55, 0.15] };  // 近观辊隙
      return null;
    }
    if (ph.id === "cycle") {
      var cc = pt % 6.0;
      if (cc > 0.8 && cc < 5.0) return { phi: 0.8, r: 4.2, target: [0.02, 0.55, 0.15] };
      return null;
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = ph.id === "gin" || ph.id === "cycle";
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · ω上 " + (-st.omega).toFixed(1) + " / ω下 " + st.omega.toFixed(1),
      a: st.psi.toFixed(1) + " rad",
      b: "-" + st.omega.toFixed(1) + " / +" + st.omega.toFixed(1),
      c: Math.round((st.drawProg || 0) * 100) + " %"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "rollerLow") {
      return [{ id: "p-rl", obj: E("rollerLow"), text: "下辊 r 0.075 · 齿轮A 16T" }];
    }
    if (ph.id === "rollerUp") {
      return [{ id: "p-ru", obj: E("rollerUp"), text: "上辊 r 0.065 · 齿轮B 外啮合反向", tone: "white" }];
    }
    if (ph.id === "treadle") {
      return [
        { id: "p-td", obj: E("treadle"), text: "踏板曲柄 · 行程 0.20m" },
        { id: "p-fd", obj: E("feed"), text: "给棉板 · 斜托导槽", tone: "white" }
      ];
    }
    if (ph.id === "cotton") {
      return [{ id: "p-c1", obj: E("cotton1"), text: "籽棉团 · 入隙受牵", tone: "white" }];
    }
    if (ph.id === "gin" || ph.id === "cycle") {
      return [
        { id: "p-c2", obj: E("cotton1"), text: "皮棉过隙 · 棉籽回落" },
        { id: "p-li", obj: E("lint"), text: "皮棉条 · 牵出 −z", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
