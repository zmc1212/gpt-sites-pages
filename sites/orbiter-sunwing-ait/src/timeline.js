/* 时间线:8 阶段 48s(结构→推进→电源→姿控→通信→挂翼→展开测试→在轨对日) */
(function (ORBW) {
  var REST_YAW = 0.85;      // 转台停转方位(脐带缆按此角建模)

  var phases = [
    { id: "bus", name: "STRUCTURE · BUS INTO JIG", dur: 5, dot: "yellow",
      cam: { theta: -0.6, phi: 1.05, r: 6.4, target: [0, 0.5, 0] }, drift: 0.05 },
    { id: "propulsion", name: "PROPULSION · TANKS ×4 · ENGINE", dur: 6, dot: "orange",
      cam: { theta: -2.3, phi: 1.18, r: 4.4, target: [-0.2, 0.4, -0.1] }, drift: 0.022 },
    { id: "power", name: "POWER · BUS SELF-CHECK 28 V", dur: 5, dot: "green",
      cam: { theta: 0.5, phi: 1.02, r: 3.4, target: [0.35, 0.5, 0.25] }, drift: 0.015 },
    { id: "adcs", name: "ADCS · STARS · WHEELS · TORQUERS", dur: 6, dot: "blue",
      cam: { theta: 1.3, phi: 0.92, r: 3.3, target: [-0.15, 0.65, 0.1] }, drift: 0.016 },
    { id: "comm", name: "COMM · HGA LOCK · UHF WHIP", dur: 5, dot: "teal",
      cam: { theta: 2.5, phi: 0.85, r: 3.7, target: [-0.35, 0.75, 0.15] }, drift: 0.014 },
    { id: "wings", name: "WINGS · STOWED · HOLD-DOWN", dur: 6, dot: "pink",
      cam: { theta: -0.9, phi: 1.05, r: 5.8, target: [0.5, 0.6, 0] }, drift: 0.02 },
    { id: "deploy", name: "DEPLOY TEST · HINGE UNFOLD ×90° ×8", dur: 8, dot: "pink",
      cam: { theta: -0.4, phi: 0.98, r: 8.8, target: [0, 0.55, 0] }, drift: 0.028 },
    { id: "orbit", name: "LEO · SUN-POINTING · 760 W", dur: 7, dot: "gold",
      cam: { theta: 0.9, phi: 1.0, r: 9.8, target: [0, 0.5, 0] }, drift: 0.02 }
  ];

  var MODES = ["AIT-01 STRUCT", "AIT-02 PROP", "AIT-03 POWER", "AIT-04 ADCS",
               "AIT-05 COMM", "AIT-06 WINGS", "DEPLOY TEST", "SUN-POINTING"];

  var PINNED = {
    bus: function () {
      return [
        { id: "pin-panel", obj: ORBW.Parts.group("panel"), text: "AL HC PANEL · SN 0031", tone: "white" },
        { id: "pin-truss", obj: ORBW.Parts.group("truss"), text: "TRUSS RIBS · TORQUE OK" }
      ];
    },
    propulsion: function () {
      return [
        { id: "pin-tank", obj: ORBW.Parts.group("tank2"), text: "TI TANK ×4 · STRAPPED" },
        { id: "pin-eng", obj: ORBW.Parts.group("engine"), text: "MAIN ENGINE · 120 N", tone: "white" }
      ];
    },
    power: function () {
      return [
        { id: "pin-batt", obj: ORBW.Parts.group("batt"), text: "LI-ION · 28 V BUS" },
        { id: "pin-pcdu", obj: ORBW.Parts.group("pcdu"), text: "PCDU · RAILS UP", tone: "white" }
      ];
    },
    adcs: function () {
      return [
        { id: "pin-rw", obj: ORBW.Parts.group("rw"), text: "RW ×4 · PYRAMID" },
        { id: "pin-st1", obj: ORBW.Parts.group("st1"), text: "STAR TRACKER A", tone: "white" }
      ];
    },
    comm: function () {
      return [
        { id: "pin-dish", obj: ORBW.Parts.group("dish"), text: "HGA · S-BAND LOCK" },
        { id: "pin-umb", obj: ORBW.Parts.group("umb"), text: "UMBILICAL · TM/TC", tone: "white" }
      ];
    },
    wings: function () {
      return [
        { id: "pin-wing", obj: ORBW.Parts.group("wingR"), text: "WING STOWED · 4 PANELS", tone: "navy" },
        { id: "pin-rods", obj: ORBW.Parts.group("rods"), text: "HOLD-DOWN · PRELOAD" }
      ];
    },
    deploy: function () {
      return [
        { id: "pin-rods", obj: ORBW.Parts.group("rods"), text: "PYRO RELEASE", tone: "white" },
        { id: "pin-wing", obj: ORBW.Parts.group("wingR"), text: "UNFOLD · HINGE ×90°", tone: "navy" }
      ];
    },
    orbit: function () {
      return [
        { id: "pin-wing", obj: ORBW.Parts.group("wingR"), text: "ARRAY NORMAL · SUN", tone: "navy" }
      ];
    }
  };

  var st = {}, idx = -1, pt = 0, paused = false;
  var yawStart = 0, yawTarget = 0;
  var histAcc = 0;
  var tmpQ = null;
  var dom = {};

  function resetState() {
    st = {
      time: 0, phaseIdx: 0, phaseId: "", now: 0, dt: 0,
      power: false, powerT: 0, busV: 0, busA: 0, selfTest: false,
      arrW: 0, arrHist: [],
      quat: [1, 0, 0, 0], omega: 0, rpm: [0, 0, 0, 0],
      temps: [21.0, 17.5, 14.5],
      wingAng: [0, 0], hingeDone: 0, pyroState: "SAFE",
      wheelsOn: 0, umb: "STANDBY", mode: "—", units: 0
    };
    histAcc = 0;
  }

  function $(id) { return document.getElementById(id); }
  function cacheDom() {
    dom = {
      mode: $("st-mode"), bus: $("st-bus"), arr: $("st-arr"), umb: $("st-umb"),
      pill: $("phase-text"), dot: $("phase-dot")
    };
  }
  function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  function setPedestalYaw(y) { ORBW.Scene3D.pedestal.rotation.y = y; }

  function enterPhase(i) {
    idx = i; pt = 0;
    var now = performance.now();
    var ph = phases[i];
    st.phaseIdx = i; st.phaseId = ph.id; st.mode = MODES[i];
    yawStart = ORBW.Scene3D.pedestal.rotation.y;
    if (i >= 2) { setPedestalYaw(REST_YAW); yawStart = REST_YAW; }
    if (i <= 1) {
      yawTarget = REST_YAW;
      while (yawTarget < yawStart + 0.5) yawTarget += Math.PI * 2;
      Parts_begin(i, now);
    } else if (i === 2) {
      st.power = true; st.powerT = 0;
      Parts_begin(i, now);
      ORBW.Parts.ensureUmbilical();
      ORBW.Parts.setPcduLed(true);
    } else {
      Parts_begin(i, now);
    }
    var pins = PINNED[ph.id];
    ORBW.Labels.setPinned(pins ? pins() : []);
  }

  function Parts_begin(i, now) { ORBW.Parts.begin(i, now); }

  function restartCycle() {
    ORBW.Parts.reset();
    ORBW.Parts.sat().rotation.set(0, 0, 0);
    ORBW.Labels.clearAnnounce();
    ORBW.Parts.setPcduLed(false);
    resetState();
    setPedestalYaw(0);
    ORBW.spaceMix = 0;
    enterPhase(0);
  }

  function update(dt) {
    if (paused) return;
    dt = Math.min(dt, 0.05);
    st.time += dt; st.dt = dt;
    pt += dt;

    var ph = phases[idx];
    if (pt >= ph.dur) {
      if (idx >= phases.length - 1) restartCycle();
      else enterPhase(idx + 1);
      ph = phases[idx];
    }
    st.phaseT = pt;
    st.now = performance.now();

    /* ---- 相机 ---- */
    ORBW.orbitCtl.autoDrift = ph.drift;
    ORBW.orbitCtl.flyTo(ph.cam);

    /* ---- 转台:阶段 0-1 慢转,阶段 2 前停到 REST_YAW ---- */
    if (idx === 0) {
      setPedestalYaw(ORBW.Scene3D.pedestal.rotation.y + 0.06 * dt);
    } else if (idx === 1) {
      setPedestalYaw(yawStart + (yawTarget - yawStart) * smooth(pt / 5.2));
    } else {
      setPedestalYaw(REST_YAW);
    }

    /* ---- 零件 / 展开机构 ---- */
    st.wheelsOn = idx > 3 ? 1 : (idx === 3 ? smooth(pt / 1.5) : 0);
    ORBW.Parts.update(st);

    /* ---- 母线电气 ---- */
    if (st.power) st.powerT = Math.min(1, st.powerT + dt / 1.6);
    st.busV = st.power ? 28.0 * smooth(st.powerT) : 0;
    st.selfTest = idx === 2 && pt > 1.2 && pt < 3.8;
    var load = st.power ? 0.8 : 0;
    load += 0.9 * st.wheelsOn;
    load += idx >= 4 ? 0.5 : 0;
    var act = 0;
    if (idx === 6) {
      for (var k = 0; k < 8; k++) {
        var pp = pt - (1.0 + k * 0.8);
        if (pp > 0 && pp < 0.8) act++;
      }
    }
    load += 1.8 * act;
    if (idx === 7) load += 0.6;
    st.busA = st.power ? load + Math.sin(st.time * 2.1) * 0.05 : 0;
    st.busV -= 0.18 * act;   // 展开作动瞬时压降

    /* ---- 太阳翼功率 ---- */
    st.wingAng = ORBW.Parts.wingAngles();
    var avg = (st.wingAng[0] + st.wingAng[1]) / 2;
    if (idx === 6) {
      st.arrW = 760 * Math.pow(avg / 90, 1.15) * 0.30;   // 洁净间灯照下随铰链展开增长
    } else if (idx === 7) {
      var lamp = 230 * (1 - smooth(pt / 1.5));
      var slew = smooth((pt - 1.0) / 2.5);               // 对日定向:法向逐步对准太阳
      var sunW = 760 * slew * (0.96 + 0.04 * Math.cos(st.time * 0.7));
      st.arrW = Math.max(lamp, sunW);
    } else {
      st.arrW = 0;
    }
    histAcc += dt;
    if (histAcc > 0.1) {
      histAcc = 0;
      st.arrHist.push(st.arrW);
      if (st.arrHist.length > 160) st.arrHist.shift();
    }

    /* ---- 姿态四元数 / 角速度 ---- */
    if (!tmpQ) tmpQ = new THREE.Quaternion();
    var satG = ORBW.Parts.sat();
    satG.getWorldQuaternion(tmpQ);
    var wob = (idx >= 2 && idx <= 6) ? 0.0016 : 0;
    var qw = tmpQ.w + Math.sin(st.time * 1.7) * wob,
        qx = tmpQ.x + Math.sin(st.time * 1.3) * wob,
        qy = tmpQ.y + Math.cos(st.time * 1.9) * wob,
        qz = tmpQ.z + Math.sin(st.time * 2.3) * wob;
    var qn = Math.sqrt(qw * qw + qx * qx + qy * qy + qz * qz);   // 姿态四元数归一化
    st.quat = [qw / qn, qx / qn, qy / qn, qz / qn];
    st.omega = idx <= 1 ? 3.44 : (idx === 7 ? 8.0 + 1.1 * Math.sin(st.time * 0.5) : 0.03);
    st.rpm = ORBW.Parts.wheelRpm();

    /* ---- 热控 ---- */
    var tg = [21 + 4.5 * smooth(st.powerT), 17.5 + 6 * smooth(st.powerT), 14.5];
    if (idx >= 2) tg[2] += 8 * smooth((st.time - 12) / 20);   // 推进模块逐渐回温
    if (idx === 7) {
      tg[2] = -1.5; tg[0] = 19; tg[1] = 25.5;
    }
    for (var t = 0; t < 3; t++) st.temps[t] += (tg[t] - st.temps[t]) * Math.min(1, dt * 0.35);

    /* ---- 展开计 / 火工 / 脐带缆 ---- */
    st.hingeDone = Math.max(0, Math.min(8, Math.round((st.wingAng[0] + st.wingAng[1]) / 180 * 4)));
    st.pyroState = idx < 6 ? "SAFE" : (idx === 6 && pt < 0.25 ? "ARMED" : "FIRED");
    st.umb = idx < 2 ? "STANDBY" : (idx === 7 && pt > 0.8 ? "RELEASED" : "CONNECTED");

    /* ---- 深空渐变(阶段 8 记忆点) ---- */
    ORBW.spaceMix = idx === 7 ? smooth(pt / 3.2) : 0;

    /* ---- 在轨对日定向:整星慢旋 + 自旋轴缓摆 ---- */
    if (idx === 7 && pt > 1.2) {
      var spin = 0.14 * smooth((pt - 1.2) / 1.6);
      satG.rotation.y += spin * dt;
      var tiltZ = 0.85 + 0.06 * Math.sin(st.time * 0.4);
      var tiltX = 0.16 + 0.03 * Math.sin(st.time * 0.3);
      satG.rotation.z += (tiltZ - satG.rotation.z) * Math.min(1, dt * 0.5);
      satG.rotation.x += (tiltX - satG.rotation.x) * Math.min(1, dt * 0.5);
    }

    /* ---- DOM:状态卡 / 阶段胶囊 ---- */
    dom.mode.textContent = st.mode;
    dom.mode.className = "mode" + (st.mode === "SUN-POINTING" ? " gold" : "");
    dom.bus.textContent = st.busV > 0 ? st.busV.toFixed(1) + " V" : "— V";
    dom.arr.textContent = Math.round(st.arrW) + " W";
    dom.umb.textContent = st.umb;
    var label = ph.name;
    if (idx <= 5) label = ph.name + " · " + ORBW.Parts.seated + "/" + ORBW.Parts.unitTotal + " UNITS";
    dom.pill.textContent = label;
    dom.dot.className = ph.dot;

    /* ---- 仪表盘 ---- */
    ORBW.Dashboard.update(st, dt);
  }

  ORBW.Timeline = {
    init: function () {
      resetState();
      cacheDom();
      ORBW.spaceMix = 0;
    },
    start: function () { enterPhase(0); },
    restart: restartCycle,
    /* 跳转到指定阶段(调试 / 键盘 1-8) */
    seek: function (id) {
      var i = -1;
      for (var k = 0; k < phases.length; k++) if (phases[k].id === id) i = k;
      if (i < 0) return;
      setPedestalYaw(i >= 2 ? REST_YAW : (i >= 1 ? 0.5 : 0));
      ORBW.Parts.seatUpTo(i);
      ORBW.Labels.clearAnnounce();
      ORBW.Parts.setPcduLed(i >= 2);
      resetState();
      ORBW.spaceMix = 0;
      ORBW.Parts.sat().rotation.set(0, 0, 0);
      if (i >= 2) { st.power = true; st.powerT = 1; }
      enterPhase(i);
    },
    update: update,
    togglePause: function () { paused = !paused; return paused; },
    get paused() { return paused; },
    get phaseId() { return phases[idx] ? phases[idx].id : ""; }
  };
})(window.ORBW = window.ORBW || {});
