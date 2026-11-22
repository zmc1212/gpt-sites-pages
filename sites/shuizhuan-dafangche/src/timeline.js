/* 时间线(45.5s 自动循环):前 7 段装配、末段运转。
   ψW(水轮角)为 (阶段 id, 阶段内时间 pt) 的确定函数 —— seek 无需补偿:
     阶段 1-6:ψW = 0;
     阶段 7(弦上):弦飞入,ψW 二次坡起;
     阶段 8(cycle):恒速 ω 0.5 rad/s 续转,锭速 7.0 rad/s(×14)。 */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;
  var S7END = 0.075 + 0.5 * 3.2;   // 阶段 7 结束水轮角(坡起积分 + 恒速)

  MECH.PHASES = [
    { id: "stream", name: "STREAM · 溪渠纱架", dur: 4.5, dot: "yellow", mode: "ASSEMBLY",
      cam: { theta: 0.55, phi: 1.15, r: 9.6, target: [1.4, 1.0, 0] }, drift: 0.03 },
    { id: "wheel", name: "WHEEL · 水轮落轴", dur: 5.0, dot: "teal", mode: "ASSEMBLY",
      cam: { theta: -0.55, phi: 1.14, r: 7.0, target: [0, 1.5, 0] }, drift: 0.02 },
    { id: "pulley", name: "PULLEY · 大绳轮", dur: 4.0, dot: "orange", mode: "ASSEMBLY",
      cam: { theta: 0.85, phi: 1.10, r: 5.2, target: [0.2, 1.45, 0.4] }, drift: 0.015 },
    { id: "bench", name: "BENCH · 锭子车架", dur: 4.0, dot: "pink", mode: "ASSEMBLY",
      cam: { theta: -0.45, phi: 1.16, r: 6.6, target: [2.6, 0.5, 0] }, drift: 0.015 },
    { id: "spindles1", name: "SPINDLES · 锭子 1-4", dur: 4.0, dot: "green", mode: "ASSEMBLY",
      cam: { theta: 0.35, phi: 1.10, r: 5.4, target: [1.9, 0.4, 0.2] }, drift: 0.015 },
    { id: "spindles2", name: "SPINDLES · 锭子 5-8", dur: 4.0, dot: "blue", mode: "ASSEMBLY",
      cam: { theta: -0.35, phi: 1.10, r: 5.4, target: [3.1, 0.4, 0.2] }, drift: 0.015 },
    { id: "cord", name: "CORD · 传动弦上轮", dur: 5.0, dot: "yellow", mode: "STRINGING",
      cam: { theta: 0.60, phi: 1.08, r: 7.4, target: [1.4, 1.0, 0.3] }, drift: 0.012 },
    { id: "cycle", name: "CYCLE · 水转诸锭", dur: 15.0, dot: "red", mode: "RUNNING",
      cam: { theta: 0.75, phi: 1.08, r: 9.8, target: [1.5, 1.0, 0] }, drift: 0.01 }
  ];
  MECH.PHASE_IDS = ["stream", "wheel", "pulley", "bench", "spindles1", "spindles2", "cord", "cycle"];

  MECH.newState = function () {
    return {
      time: 0, psiW: 0, omegaW: 0, errPos: 0,
      seated: 0, phaseId: "", _splashAcc: 0
    };
  };

  /* ψW 脚本(纯函数):坡起 τ² 积分 → 恒速 */
  function scriptPhase(ph, pt) {
    var psi = 0, om = 0;
    if (ph.id === "cord") {
      var tau = KS.clamp(pt / 3.0, 0, 1);
      if (tau < 1) { psi = 0.5 * 3.0 * tau * tau * tau / 3; om = 0.5 * tau * tau; }
      else { psi = 0.075 + 0.5 * (pt - 3.0); om = 0.5; }
    } else if (ph.id === "cycle") {
      psi = S7END + 0.5 * pt;
      om = 0.5;
    }
    return { psi: psi, om: om };
  }

  MECH.tick = function (st, ph, pt, dt) {
    st.time += dt;
    var s = scriptPhase(ph, pt);
    st.psiW = s.psi; st.omegaW = s.om;
    st.phaseId = ph.id;

    /* 桨叶击水水花 */
    if (st.omegaW > 0.05) {
      st._splashAcc += dt;
      while (st._splashAcc > 0.14) {
        st._splashAcc -= 0.14;
        MECH.Scene3D.spawnPuff((Math.random() - 0.5) * 0.7, D.waterY + 0.10, (Math.random() - 0.5) * 0.7,
          { max: 0.6, base: 0.30, vy: 0.9 + Math.random() * 0.5, tint: 0x8FCBE8, opacity: 0.5 });
      }
    }

    /* 渠水微动 */
    var sw = MECH.Parts.entry("stream");
    if (sw && sw.shown && sw.group.userData.water) {
      sw.group.userData.water.position.y = D.waterY + 0.006 * Math.sin(st.time * 1.6);
    }
  };

  MECH.camAdj = function (st, ph, pt) {
    if (ph.id === "cycle") {
      var c = pt % 7.5;
      if (c < 3.0) return { phi: 0.9, r: 5.6, target: [2.2, 0.45, 0.2] };   // 近观锭排
      return null;
    }
    return null;
  };

  MECH.status = function (st, ph, pt) {
    var hot = ph.id === "cycle";
    return {
      mode: ph.mode,
      hot: hot,
      pill: ph.name + " · ω锭 " + (st.omegaW * D.i).toFixed(1) + " rad/s",
      a: st.omegaW.toFixed(2) + " rad/s",
      b: (st.omegaW * D.i).toFixed(1) + " rad/s",
      c: "× " + D.i.toFixed(0)
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "stream") {
      return [{ id: "p-rl", obj: E("rail"), text: "纱架横杆 · 麻缕引至锭端", tone: "white" }];
    }
    if (ph.id === "wheel") {
      return [{ id: "p-ww", obj: E("waterWheel"), text: "水轮 · 径 2.6m · 12 桨 · 浸深 0.08m" }];
    }
    if (ph.id === "pulley") {
      return [{ id: "p-rw", obj: E("ropeWheel"), text: "大绳轮 · 径 0.896m · 同轴增速源", tone: "white" }];
    }
    if (ph.id === "bench") {
      return [{ id: "p-bf", obj: E("spindleFrame"), text: "车架长凳 · 8 锭轴承" }];
    }
    if (ph.id === "spindles1" || ph.id === "spindles2") {
      return [
        { id: "p-sp", obj: E("sp0"), text: "锭子 · 盘 r 0.032m" },
        { id: "p-sp2", obj: E("sp7"), text: "×14 增速 · 同向纺纱", tone: "white" }
      ];
    }
    if (ph.id === "cord") {
      return [{ id: "p-cd", obj: E("cord"), text: "传动弦 · 绕诸锭盘下缘", tone: "white" }];
    }
    if (ph.id === "cycle") {
      return [
        { id: "p-cd2", obj: E("cord"), text: "ω锭 = 14 × ω轮 = 7.0 rad/s" },
        { id: "p-ww2", obj: E("waterWheel"), text: "水力驱动 · 周而复始", tone: "white" }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
