/* 时间线(47s 循环):井筒引枧 → 碾盘 → 水轮立轴(直驱) → 碢干吊柱 → 石辊 →
   注水运转(闸门开启·水轮起转) → 加料碾压(谷粒过辊碾白) → 手动闸门(←/→) */
(function (MECH) {
  var KS = MECH.KS, D = MECH.DIM;

  MECH.PHASES = [
    { id: "channel", name: "CISTERN · 井筒与引枧", dur: 5, dot: "teal", mode: "ASSEMBLING",
      cam: { theta: 0.60, phi: 1.18, r: 9.5, target: [-3.2, 0.7, 0.6] }, drift: 0.03 },
    { id: "pan", name: "MILL PAN · 碾盘落筒", dur: 5, dot: "yellow", mode: "ASSEMBLING",
      cam: { theta: 0.90, phi: 1.16, r: 7.5, target: [-3.0, 1.0, 0.6] }, drift: 0.02 },
    { id: "gears", name: "WHEEL & SHAFT · 水轮与立轴", dur: 6, dot: "blue", mode: "ASSEMBLING",
      cam: { theta: -1.20, phi: 1.30, r: 6.2, target: [-3.3, 0.6, 0.6] }, drift: 0.012 },
    { id: "yoke", name: "YOKE · 碢干与吊柱", dur: 5, dot: "orange", mode: "ASSEMBLING",
      cam: { theta: -0.40, phi: 1.16, r: 5.2, target: [-3.0, 1.4, 0.6] }, drift: 0.015 },
    { id: "rollers", name: "ROLLERS · 双石辊落槽", dur: 5, dot: "pink", mode: "ASSEMBLING",
      cam: { theta: 0.15, phi: 1.10, r: 4.8, target: [-3.0, 1.2, 0.6] }, drift: 0.012 },
    { id: "power", name: "POWER · 注水运转(闸门开启)", dur: 7, dot: "teal", mode: "RUNNING",
      cam: { theta: -1.30, phi: 1.30, r: 7.5, target: [-3.4, 0.4, 0.6] }, drift: 0.02 },
    { id: "grind", name: "GRIND · 加料碾压", dur: 6, dot: "green", mode: "GRINDING",
      cam: { theta: 1.10, phi: 1.12, r: 6.5, target: [-2.6, 1.0, 0.4] }, drift: 0.015 },
    { id: "gate", name: "MANUAL · 手动闸门(← 开大 / → 关小)", dur: 8, dot: "red", mode: "MANUAL",
      cam: { theta: -0.60, phi: 1.18, r: 7.8, target: [-3.2, 1.0, 0.6] }, drift: 0.02 }
  ];
  MECH.PHASE_IDS = ["channel", "pan", "gears", "yoke", "rollers", "power", "grind", "gate"];

  MECH.newState = KS.newState;

  /* 谷粒压碎:辊角扫过谷粒角 ±0.16rad 内 → 碾白(压扁+换色) */
  function crushGrains(st) {
    var g = MECH.Parts.entry("grain");
    if (!g || !g.shown || !g.group.userData.anim) return;
    var grains = g.group.userData.anim.grains;
    var mats = MECH._shuinnian;
    for (var i = 0; i < grains.length; i++) {
      var m = grains[i];
      if (m.userData.crushed) continue;
      if (Math.abs(KS.wrapPi(m.userData.alpha - st.thetaYoke)) < 0.16) {
        m.userData.crushed = true;
        m.scale.y = 0.32;
        m.position.y = D.grooveFloor + 0.010;
        m.material = mats.flourMat();
        st.crushed++;
      }
    }
  }

  /* 循环重启/跳段时恢复谷粒整粒态 */
  function resetGrains(st) {
    var g = MECH.Parts.entry("grain");
    if (!g || !g.group.userData.anim) return;
    var grains = g.group.userData.anim.grains;
    for (var i = 0; i < grains.length; i++) {
      var m = grains[i];
      m.userData.crushed = false;
      m.scale.y = 1;
      m.position.y = D.grooveFloor + 0.026;
      m.material = MECH._shuinnian.grainMat();
    }
    st.crushed = 0;
  }

  var _puffT = 0;

  MECH.tick = function (st, ph, pt, dt) {
    if (ph.id !== st.lastPhase) {
      st.lastPhase = ph.id;
      if (ph.id === "power") st.gateTarget = 0.75;
      if (ph.id === "grind") { st.gateTarget = 1.0; resetGrains(st); }
      if (ph.id === "gate") st.gateTarget = st.gate;
    }
    if (ph.id === "gate") {
      var d = 0;
      if (MECH.keys && MECH.keys.left) d += 0.5;
      if (MECH.keys && MECH.keys.right) d -= 0.5;
      st.gateTarget = Math.min(1.0, Math.max(0.3, st.gateTarget + d * dt));
    }
    st.gate += (st.gateTarget - st.gate) * Math.min(1, dt * 2.0);
    KS.step(st, dt);

    /* 闸门滑板与枧内水流可见性 */
    var gate = MECH.Parts.entry("gate");
    if (gate && gate.group.userData.anim) {
      gate.group.userData.anim.gate.position.y = gate.group.userData.anim.gateY0 + 0.30 * st.gate;
    }
    var flume = MECH.Parts.entry("flume");
    if (flume && flume.group.userData.anim) {
      var vis = st.gate > 0.04 && st.running;
      flume.group.userData.anim.water[0].visible = vis;
      flume.group.userData.anim.water[1].visible = vis;
    }
    /* 跌水水花 */
    if (st.gate > 0.1 && st.running) {
      _puffT += dt;
      if (_puffT > 0.13) {
        _puffT = 0;
        MECH.Scene3D.spawnPuff(D.flumeX1 + 0.10, D.flumeY1 - 0.34, D.az + (Math.random() - 0.5) * 0.3,
          { max: 0.8, base: 0.34, vy: -0.3, opacity: 0.5, tint: 0xBFD9E8 });
      }
    }
    crushGrains(st);
  };

  /* seek 补偿:跳到运转段时按闸门历程预旋水轮/碢干/石辊相位 */
  var RUN_T = 26;
  function phaseStart(i) { var a = 0; for (var k = 0; k < i; k++) a += MECH.PHASES[k].dur; return a; }
  MECH.onSeek = function (i, st) {
    var start = phaseStart(i);
    if (start < RUN_T) return;
    var tRun = start - RUN_T;
    st.gate = (i === 5) ? 0.75 : 1.0;
    st.gateTarget = st.gate;
    st.omegaWheel = D.omegaK * st.gate;
    st.thetaWheel = tRun <= 7 ? 0.53 * tRun : 3.7 + 0.73 * (tRun - 7);
    st.thetaYoke = st.thetaWheel;
    st.phiRoller = -st.thetaYoke * D.rollRatio;
    st.revs = st.thetaYoke / (2 * Math.PI);
  };

  MECH.status = function (st, ph, pt) {
    var rpm = Math.abs(st.omegaYoke) * 60 / (2 * Math.PI);
    var pill = ph.name;
    if (st.running) pill = ph.name + " · 公转 " + st.revs.toFixed(2) + " 圈";
    return {
      mode: ph.mode,
      hot: ph.id === "gate",
      pill: pill,
      a: rpm.toFixed(3) + " rpm",
      b: (Math.abs(st.omegaYoke) * D.grooveR).toFixed(3) + " m/s",
      c: (st.gate * 100).toFixed(0) + "% · " + (st.gate * D.QK * 1000).toFixed(1) + " L/s"
    };
  };

  MECH.pinnedFor = function (ph) {
    function E(id) { var e = MECH.Parts.entry(id); return e ? (e.anchor || e.group) : null; }
    if (ph.id === "gears") {
      return [
        { id: "p-wheel", obj: E("wheel"), text: "卧式水轮 · 16 斜叶受跌水" },
        { id: "p-shaft", obj: E("shaft"), text: "轮轴上端穿碢干 · 直驱 1:1", tone: "white" }
      ];
    }
    if (ph.id === "rollers") {
      return [
        { id: "p-rl", obj: E("rollerL"), text: "石辊 · 轴沿半径 滚动无滑移" },
        { id: "p-arm", obj: E("arm"), text: "碢干 · 拖辊公转", tone: "white" }
      ];
    }
    if (ph.id === "power" || ph.id === "grind" || ph.id === "gate") {
      return [
        { id: "p-arm", obj: E("arm"), text: "碢干公转 ω公=ω轮(直驱)" },
        { id: "p-rl", obj: E("rollerL"), text: "石辊自转 ω自=8.67ω公", tone: "white" },
        { id: "p-gate", obj: E("gate"), text: "闸门 " + (ph.id === "gate" ? "←/→ 可调" : "开度 75%") }
      ];
    }
    return [];
  };
})(window.MECH = window.MECH || {});
