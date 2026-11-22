/* 时间线(52s 循环):底盘 → 传动系 → 车厢独辕 → 木仙人 →
   直行试验(往返) → 蛇行试验(左90/右180/左90) → 环转一周 → 手动转向(←/→) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;
  var STR = { len: 3.6 };
  var CIR = { R: 3.0 };

  MECH.PHASES = [
    { id: "frame", name: "CHASSIS · 底盘与双足轮", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.55, phi: 1.18, r: 8.8, target: [0, 0.9, 0] }, drift: 0.03 },
    { id: "gears", name: "GEAR TRAIN · 立轮·冠轮·差动", dur: 6, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.30, phi: 1.22, r: 5.6, target: [0.7, 1.7, 0] }, drift: 0.012 },
    { id: "box", name: "CABIN · 车厢独辕", dur: 5, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.50, phi: 1.14, r: 7.6, target: [0, 1.7, 0.4] }, drift: 0.02 },
    { id: "woodman", name: "WOODEN SAGE · 木仙人指南", dur: 5, dot: "pink", mode: "ASSEMBLING",
      cam: { theta: 0.15, phi: 1.10, r: 5.2, target: [0, 2.9, 0] }, drift: 0.015 },
    { id: "straight", name: "STRAIGHT · 直行(双轮等速)", dur: 7, dot: "blue", mode: "STRAIGHT",
      cam: { theta: 0.85, phi: 1.24, r: 9.6, target: [0, 1.0, 0] }, drift: 0.01 },
    { id: "scurve", name: "S-CURVE · 蛇行(左90·右180·左90)", dur: 8, dot: "green", mode: "S-CURVE",
      cam: { theta: 1.35, phi: 1.26, r: 11.0, target: [0, 1.0, 0] }, drift: 0.008 },
    { id: "circle", name: "FULL CIRCLE · 环转一周 360°", dur: 8, dot: "yellow", mode: "CIRCLING",
      cam: { theta: 0.0, phi: 1.08, r: 12.0, target: [0, 1.0, 0] }, drift: 0.02 },
    { id: "manual", name: "MANUAL · 手动转向(← / →)", dur: 8, dot: "red", mode: "MANUAL",
      cam: { theta: -0.70, phi: 1.20, r: 9.0, target: [0, 1.0, 0] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["frame", "gears", "box", "woodman", "straight", "scurve", "circle", "manual"];

  MECH.newState = KS.newState;

  var P = MECH.P;
  function ease(t) { return P.easeInOut(t); }

  MECH.tick = function (st, ph, pt, dt) {
    /* 阶段切换时记录起始位姿(直行/环转从当前位姿出发) */
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      st.seg = { x: st.x, z: st.z, psi: st.psi, s: 0 };
      st.manual = ph.id === "manual";
    }

    if (ph.id === "straight") {
      var half = ph.dur / 2;
      var s = pt < half ? STR.len * ease(pt / half) : STR.len * (1 - ease((pt - half) / half));
      st.v = st.seg._s === undefined ? 0 : (s - st.seg._s) / dt;
      st.seg._s = s;
      st.delta = 0;
    } else if (ph.id === "scurve") {
      var v = KS.SC.L / ph.dur;
      var s2 = pt * v;
      var R = KS.SC.R;
      st.v = v;
      /* 偏航角速度 = v·κ(κ=±1/R);三段 ±π/2、∓π、±π/2,航向净变化为零 */
      st.delta = s2 <= KS.SC.L1 ? v / R : (s2 <= KS.SC.L1 + KS.SC.L2 ? -v / R : v / R);
    } else if (ph.id === "circle") {
      st.delta = 2 * Math.PI / ph.dur;               // 左转一周
      st.v = st.delta * CIR.R;
    } else if (ph.id === "manual") {
      st.v = 0.5;
      var target = (MECH.keys && MECH.keys.left ? 1.15 : 0) + (MECH.keys && MECH.keys.right ? -1.15 : 0);
      st.delta += (target - st.delta) * Math.min(1, dt * 4);
    } else {
      st.v = 0;
      st.delta = 0;
    }
    KS.step(st, dt);
  };

  /* 镜头跟随车辆(高度取阶段配置) */
  MECH.camAdj = function (st, ph) {
    return { target: [st.x, ph.cam.target[1], st.z] };
  };

  MECH.status = function (st, ph, pt) {
    var pill = ph.name;
    if (ph.id === "straight" || ph.id === "scurve" || ph.id === "circle" || ph.id === "manual") {
      pill = ph.name + " · ψ " + st.headingDeg.toFixed(1) + "°";
    }
    return {
      mode: ph.mode,
      hot: ph.id === "manual",
      pill: pill,
      a: st.headingDeg.toFixed(1) + "°",
      b: st.ptrErrDeg.toFixed(3) + "°",
      c: (st.dist / D.CHI).toFixed(1) + " 尺"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "gears") {
      return [
        { id: "p-li", obj: E("liL"), text: "立轮 16T · 与足轮同轴" },
        { id: "p-guan", obj: E("guanL"), text: "冠轮 40T · i=0.4 · 左齿面朝上", tone: "white" },
        { id: "p-diff", obj: E("diff"), text: "差动器 · 壳输出 = 木人轴" }
      ];
    }
    if (ph.id === "woodman") {
      return [
        { id: "p-man", obj: E("woodman"), text: "木仙人 · 执杖指南" },
        { id: "p-cps", obj: E("compass"), text: "地盘罗盘 · 南 = +Z", tone: "white" }
      ];
    }
    if (ph.id === "straight" || ph.id === "scurve" || ph.id === "circle" || ph.id === "manual") {
      return [
        { id: "p-man", obj: E("woodman"), text: "木仙人 · 指向恒南" },
        { id: "p-cps", obj: E("compass"), text: "地盘罗盘 · 世界基准", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
