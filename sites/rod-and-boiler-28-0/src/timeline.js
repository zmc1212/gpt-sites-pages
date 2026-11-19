/* 时间线(48s 循环):
   frame 车架轮对 → cylinders 汽缸 → linkage 连杆+手摇一圈 → boiler 锅炉 →
   cab 驾驶室煤柜 → steam 升汽 0→14.2 bar 安全阀起跳 → start 开汽起动 → cruise 巡航 */
(function (ST28) {
  var TAU = Math.PI * 2;
  var R = 0.62, CRUISE_RATE = 4.2, MPH_K = 28 / 4.2;

  var phases = [
    { id: "frame", name: "FRAME · FIVE WHEELSETS ROLL IN", dur: 5, dot: "yellow", mode: "ERECTING",
      cam: { theta: 0.55, phi: 1.22, r: 11.5, target: [-1.0, 0.85, 0] }, drift: 0.03 },
    { id: "cylinders", name: "CYLINDERS · PISTON · BRASS COVERS", dur: 6, dot: "teal", mode: "ERECTING",
      cam: { theta: 0.18, phi: 1.30, r: 5.6, target: [-5.1, 0.9, 0] }, drift: 0.012 },
    { id: "linkage", name: "LINKAGE · WALSHAERTS 90°", dur: 8, dot: "blue", mode: "ERECTING",
      cam: { theta: 0.02, phi: 1.36, r: 4.6, target: [-4.35, 0.95, 0] }, drift: 0.008 },
    { id: "boiler", name: "BOILER · SMOKEBOX · STACK", dur: 6, dot: "orange", mode: "ERECTING",
      cam: { theta: -0.55, phi: 1.08, r: 9.2, target: [-2.5, 1.6, 0] }, drift: 0.02 },
    { id: "cab", name: "CAB · CONTROLS · TENDER", dur: 5, dot: "pink", mode: "ERECTING",
      cam: { theta: -0.85, phi: 1.16, r: 6.4, target: [1.0, 1.6, 0] }, drift: 0.015 },
    { id: "steam", name: "STEAM · 0 → 14 BAR", dur: 6, dot: "green", mode: "CHARGING",
      cam: { theta: -0.30, phi: 1.18, r: 7.2, target: [-2.2, 1.8, 0] }, drift: 0.012 },
    { id: "start", name: "REGULATOR · IN MOTION", dur: 7, dot: "yellow", mode: "IN MOTION", track: true,
      cam: { theta: 0.30, phi: 1.26, r: 9.0, target: [-3.2, 1.0, 0] }, drift: 0.01 },
    { id: "cruise", name: "CRUISE · 28 MPH", dur: 5, dot: "green", mode: "RUNNING", track: true,
      cam: { theta: 0.0, phi: 1.24, r: 8.6, target: [-3.4, 1.05, 0] }, drift: 0.16 }
  ];

  var state = {};
  var idx = -1, pt = 0, cycleT = 0, paused = false;
  var dom = {};
  var PHASE_START = [0, 5, 11, 19, 25, 30, 36, 43];   // 各阶段绝对起点(部件 at 时刻基准)

  function resetState() {
    state = {
      time: 0, thetaHand: 0, thetaTravel: 0, theta: 0,
      rollRate: 0, handRate: 0, rpm: 0, speed: 0,
      pressure: 0, pop: false,
      puffs: 0, puffIdx: 0, lastPuff: -10, puffRate: 0,
      jetT: 0, jetAlt: false,
      reg: 0, revAngle: -0.45, seated: 0, phaseId: ""
    };
  }

  function $(id) { return document.getElementById(id); }

  function cacheDom() {
    dom = {
      mode: $("st-mode"), pres: $("st-pres"), speed: $("st-speed"),
      parts: $("st-parts"), pill: $("phase-text"), dot: $("phase-dot")
    };
  }

  function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function easeInOut(t) { t = Math.max(0, Math.min(1, t)); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  function pinnedFor(ph) {
    if (ph.id === "linkage") {
      return [
        { id: "p-mrod", obj: ST28.Parts.entry("mrodA").anchor, text: "MAIN ROD · CRANK → CROSSHEAD" },
        { id: "p-crod", obj: ST28.Parts.entry("crodA").anchor, text: "COUPLING ROD · SAME-PHASE PINS", tone: "white" },
        { id: "p-gear", obj: ST28.Parts.entry("gearA").anchor, text: "ECCENTRIC · 90° LEAD" }
      ];
    }
    if (ph.id === "steam") {
      return [
        { id: "p-saf", obj: ST28.Parts.entry("safety").group, text: "SAFETY · LIFTS 14.2 BAR" },
        { id: "p-gag", obj: ST28.Parts.entry("gag3d").group, text: "CAB GAUGE · LIVE", tone: "white" }
      ];
    }
    if (ph.id === "start" || ph.id === "cruise") {
      return [
        { id: "p-drv", obj: ST28.Parts.entry("drv1").group, text: "EIGHT DRIVERS · ROLLING" },
        { id: "p-stk", obj: ST28.Parts.entry("stack").group, text: "4 PUFFS / REV", tone: "white" }
      ];
    }
    return [];
  }

  function enterPhase(i) {
    idx = i;
    pt = 0;
    var ph = phases[i];
    if (ph.id === "frame") ST28.Parts.begin();
    ST28.Labels.setPinned(pinnedFor(ph));
  }

  function restartCycle() {
    ST28.Parts.reset();
    ST28.Labels.clearAnnounce();
    resetState();
    cycleT = 0;
    enterPhase(0);
  }

  function update(dt) {
    if (paused) return;
    dt = Math.min(dt, 0.05);
    state.time += dt;
    cycleT += dt;
    pt += dt;

    var ph = phases[idx];
    if (pt >= ph.dur) {
      if (idx >= phases.length - 1) restartCycle();
      else enterPhase(idx + 1);
      ph = phases[idx];
    }

    /* ---- 相机 ---- */
    var tx = ph.track ? ST28.Scene3D.train.position.x : 0;
    var cam = { theta: ph.cam.theta, phi: ph.cam.phi, r: ph.cam.r, target: [0, 0, 0] };
    if (ph.id === "linkage") {
      /* 侧视平移跟随十字头 */
      var xc = ST28.GEAR.solve(state.theta).A.xc;
      cam.target = [-4.9 + (xc + 5.02) * 0.8, ph.cam.target[1], ph.cam.target[2]];
    } else {
      cam.target = [ph.cam.target[0] + tx, ph.cam.target[1], ph.cam.target[2]];
    }
    ST28.orbitCtl.autoDrift = ph.drift;
    ST28.orbitCtl.flyTo(cam);

    /* ---- 轮相位 θ:手摇(阶段3) + 行驶(阶段7/8) ---- */
    var prevHand = state.thetaHand;
    if (ph.id === "linkage") {
      state.thetaHand = TAU * easeInOut((pt - 5.4) / 2.6);
      state.rollRate = 0;
    } else if (ph.id === "start") {
      state.reg = clamp((pt - 0.4) / 0.9, 0, 1);
      state.revAngle = -0.45 + 0.85 * clamp((pt - 0.5) / 1.3, 0, 1);
      state.rollRate = CRUISE_RATE * smooth(clamp((pt - 0.8) / 3.4, 0, 1));
      state.thetaTravel += state.rollRate * dt;
    } else if (ph.id === "cruise") {
      state.rollRate = CRUISE_RATE + Math.sin(state.time * 1.7) * 0.06 + Math.sin(state.time * 3.1) * 0.03;
      state.thetaTravel += state.rollRate * dt;
    } else {
      state.rollRate = 0;
    }
    state.handRate = (state.thetaHand - prevHand) / dt;
    state.theta = state.thetaHand + state.thetaTravel;
    state.rpm = (state.rollRate + Math.abs(state.handRate)) * 9.549;
    state.speed = state.rollRate * MPH_K;
    ST28.Scene3D.train.position.x = -R * state.thetaTravel;   // 滚动无滑移:位移 = R·θ

    /* ---- 锅炉压力 ---- */
    if (ph.id === "steam") {
      var ramp = easeInOut(clamp(pt / 4.3, 0, 1));
      var settle = smooth(clamp((pt - 4.7) / 1.3, 0, 1));
      state.pressure = 14.2 * ramp - 0.2 * settle;
      state.pop = state.pressure > 14.05 && pt < 5.9;
    } else if (ph.id === "start") {
      state.pressure = 13.9 - 0.3 * smooth(clamp((pt - 0.6) / 3, 0, 1)) + Math.sin(state.time * 2.2) * 0.03;
      state.pop = false;
    } else if (ph.id === "cruise") {
      state.pressure = 13.7 + Math.sin(state.time * 1.9) * 0.05;
      state.pop = false;
    } else if (idx < 5) {
      state.pressure = 0;
      state.pop = false;
    }

    /* ---- 安全阀嘶鸣喷汽 ---- */
    if (state.pop) {
      state.jetT -= dt;
      if (state.jetT <= 0) {
        state.jetT = 0.05;
        state.jetAlt = !state.jetAlt;
        ST28.Scene3D.spawnJet(tx + (state.jetAlt ? -2.61 : -2.29), 2.72, 0);
      }
    }

    /* ---- 排汽 puff:每 1/4 圈一喷(2 缸 × 2 冲程 = 4 / 圈) ---- */
    var pq = Math.floor(state.thetaTravel / (Math.PI / 2));
    if (pq > state.puffIdx) {
      state.puffIdx = pq;
      if (state.rollRate > 0.4 && state.pressure > 8) {
        state.puffs++;
        state.lastPuff = state.time;
        ST28.Scene3D.spawnPuff(tx - 5.35, 3.04, 0, 0.5 + 0.5 * Math.min(1, state.rollRate / CRUISE_RATE));
      }
    }
    state.puffRate = state.rollRate > 0.3 ? state.rollRate * 38.2 : 0;

    /* ---- 部件 / 场景动件 ---- */
    ST28.Parts.update(cycleT, state);
    ST28.Parts.setPressure(state.pressure);
    ST28.Parts.setRegulator(state);
    state.seated = ST28.Parts.seatedCount;
    state.phaseId = ph.id;

    /* ---- DOM 状态卡 / 阶段胶囊 ---- */
    dom.mode.textContent = ph.mode;
    dom.mode.className = "mode" + (ph.mode === "IN MOTION" ? " hot" : "");
    dom.pres.textContent = state.pressure.toFixed(1) + " bar";
    dom.speed.textContent = state.speed.toFixed(1) + " mph";
    dom.parts.textContent = state.seated + " / 31";
    var label = ph.name;
    if (ph.id === "steam") label = "STEAM UP · " + state.pressure.toFixed(1) + " BAR";
    else if (ph.id === "linkage" && pt > 5.4) label = "HAND TURN · " + Math.round(state.thetaHand * 180 / Math.PI) + "°";
    else if (ph.id === "start") label = "IN MOTION · " + state.speed.toFixed(0) + " MPH";
    else if (ph.id === "cruise") label = "RUNNING · " + state.speed.toFixed(0) + " MPH";
    dom.pill.textContent = label;
    dom.dot.className = ph.dot;

    /* ---- 仪表盘 ---- */
    ST28.Dashboard.update(state);
  }

  ST28.Timeline = {
    init: function () {
      resetState();
      cacheDom();
    },
    start: function () {
      enterPhase(0);
    },
    restart: restartCycle,
    /* 跳转到指定阶段(键盘 1-8 / 后台验收) */
    seek: function (id) {
      var i = -1;
      for (var k = 0; k < phases.length; k++) if (phases[k].id === id) i = k;
      if (i < 0) return;
      ST28.Parts.reset();
      ST28.Labels.clearAnnounce();
      resetState();
      cycleT = PHASE_START[i];   // 与部件绝对 at 时刻对齐
      ST28.Parts.begin();
      ST28.Parts.sealUpTo(i);
      if (i >= 3) state.thetaHand = TAU;      // 手摇一圈已完成
      if (i >= 6) state.pressure = 13.9;      // 升汽已完成
      enterPhase(i);
    },
    update: update,
    togglePause: function () { paused = !paused; return paused; },
    get paused() { return paused; },
    get phaseId() { return phases[idx] ? phases[idx].id : ""; }
  };
})(window.ST28 = window.ST28 || {});
