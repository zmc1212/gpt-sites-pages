/* 时间线(46s 自动循环):前 5 段装配、后 3 段织造。
   passes(完成梭数)/ passP(梭内相位 0..1)为 (阶段 id, 阶段内时间 pt)
   的确定函数 —— seek 无需补偿:
     阶段 1-5:静止;阶段 6(双蹑):演示开口交替(不开梭);
     阶段 7(织造):4 梭完整织造(开口→投梭→打纬→纬线成行);
     阶段 8(循环):续织 4 梭,纬线行循环显现。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;
  var WEAVE_T = D.passPeriod;      // 3.0s/梭

  MECH.PHASES = [
    { id: "frame", name: "FRAME · 机架", dur: 5.0, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.14, r: 6.2, target: [0.05, 0.7, 0] }, drift: 0.03 },
    { id: "warp", name: "WARP · 经轴经线", dur: 5.0, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.50, phi: 1.10, r: 5.2, target: [0.1, 0.75, 0] }, drift: 0.02 },
    { id: "heddles", name: "HEDDLES · 双综框", dur: 5.0, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: 0.85, phi: 1.08, r: 4.6, target: [0.25, 0.8, 0.1] }, drift: 0.015 },
    { id: "shaft", name: "SHAFT · 吊综轴布轴", dur: 4.5, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: -0.40, phi: 1.08, r: 5.0, target: [0.0, 0.9, 0] }, drift: 0.015 },
    { id: "shuttle", name: "SHUTTLE · 梭筘双蹑", dur: 5.0, dot: "green", mode: "ASSEMBLY",
      cam: { theta: 0.40, phi: 1.08, r: 5.4, target: [0.1, 0.7, 0.3] }, drift: 0.015 },
    { id: "pedals", name: "PEDALS · 开口演示", dur: 5.0, dot: "blue", mode: "SHED DEMO",
      cam: { theta: -0.30, phi: 1.06, r: 4.8, target: [0.2, 0.75, 0.1] }, drift: 0.015 },
    { id: "weave", name: "WEAVE · 织造四梭", dur: 12.0, dot: "yellow", mode: "WEAVING",
      cam: { theta: 0.60, phi: 1.04, r: 5.8, target: [0.05, 0.75, 0.1] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 逐梭成布", dur: 13.0, dot: "red", mode: "WEAVING",
      cam: { theta: 0.75, phi: 1.06, r: 6.6, target: [0.05, 0.75, 0] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["frame", "warp", "heddles", "shaft", "shuttle", "pedals", "weave", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, passes: 0, passP: 0, omega: 0, errPos: 0,
      seated: 0, phaseId: "", _beatAcc: 0, _prevP: 0
    };
  };

  /* passes / passP 脚本(纯函数) */
  function scriptPhase(ph, pt) {
    var passes = 0, p = 0, demo = false;
    if (ph.id === "pedals") {
      demo = true;
      p = (pt * 0.4) % 1;    // 慢速开口演示(不开梭)
    } else if (ph.id === "weave") {
      passes = Math.floor(pt / WEAVE_T);
      p = (pt % WEAVE_T) / WEAVE_T;
    } else if (ph.id === "cycle") {
      passes = 4 + Math.floor(pt / WEAVE_T);
      p = (pt % WEAVE_T) / WEAVE_T;
    }
    return { passes: passes, p: p, demo: demo };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.passes = s.passes; st.passP = s.p; st.demo = s.demo;
    st.phaseId = ph.id;

    /* 打纬到位时纬线"啪"一声示意(尘花) */
    var ph2 = KS.passPhase(s.p);
    if ((ph.id === "weave" || ph.id === "cycle") && ph2.reed >= 0.98 && st._prevP < 0.75) {
      MECH.Scene3D.spawnPuff(D.reedX - 0.06, D.warpY + 0.06, (Math.random() - 0.5) * 0.3,
        { max: 0.4, base: 0.18, vy: 0.8, tint: 0xD8C9A8, opacity: 0.5 });
    }
    st._prevP = s.p;
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "weave") {
      var c = pt % WEAVE_T;
      if (c > 0.75 && c < 2.25) return { phi: 0.72, r: 3.8, target: [0.2, 0.75, 0] };  // 近观梭口
      return null;
    }
    if (ph.id === "cycle") {
      var c2 = pt % WEAVE_T;
      if (c2 > 0.75 && c2 < 2.25) return { phi: 0.72, r: 3.8, target: [0.2, 0.75, 0] };
      return null;
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var ph2 = KS.passPhase(st.passP);
    var hot = ph.id === "weave" || ph.id === "cycle";
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · 第 " + (st.passes + 1) + " 梭",
      a: (D.shed * (st.demo || hot ? 1 : 0)).toFixed(2) + " m",
      b: (D.shuttleX0 - D.shuttleTravel * ph2.shuttle).toFixed(2) + " m",
      c: st.passes + " 梭"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "warp") {
      return [{ id: "p-wb", obj: E("warpBeam"), text: "经轴 + 经线 16 根", tone: "white" }];
    }
    if (ph.id === "heddles") {
      return [
        { id: "p-h1", obj: E("heddle1"), text: "综框 奇 · 吊奇数经" },
        { id: "p-h2", obj: E("heddle2"), text: "综框 偶 · 交替升降", tone: "white" }
      ];
    }
    if (ph.id === "shaft") {
      return [
        { id: "p-ax", obj: E("shaft"), text: "吊综轴 · 双绳反向 1:1" },
        { id: "p-cb", obj: E("clothBeam"), text: "布轴 + 布面", tone: "white" }
      ];
    }
    if (ph.id === "shuttle") {
      return [
        { id: "p-sh", obj: E("shuttle"), text: "梭 · 穿行 0.75m" },
        { id: "p-rd", obj: E("reed"), text: "筘 · 打纬 0.12m", tone: "white" }
      ];
    }
    if (ph.id === "pedals") {
      return [{ id: "p-pd", obj: E("pedals"), text: "双蹑 · 交替开口 0.09m", tone: "white" }];
    }
    if (ph.id === "weave" || ph.id === "cycle") {
      return [
        { id: "p-sh2", obj: E("shuttle"), text: "开口 → 投梭 → 打纬" },
        { id: "p-cb2", obj: E("clothBeam"), text: "纬线逐梭成布", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
