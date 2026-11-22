/* 时间线 8 阶段：pad → airframe → motor → fins → igniter → countdown → flight → recover
   全长 48s 自动循环；遥测数值（高度/速度/Mach/G/姿态/RSSI）为程序化模拟 */
(function (SRTL) {
  var TOTAL = 48;
  var LIFTOFF = 32.5, IGN = 32.35, BURNOUT = 35.4, APOGEE = 41.5, TOUCHDOWN = 47.2;

  var phases = [
    { id: "pad", name: "PAD · RAIL & MAST IN", dur: 4, dot: "orange",
      cam: { theta: -0.72, phi: 1.02, r: 14.5, target: [0, 1.8, 0] }, drift: 0.05 },
    { id: "airframe", name: "AIRFRAME · 3 SECTIONS DOCK", dur: 5, dot: "teal",
      cam: { theta: -0.85, phi: 1.12, r: 8.6, target: [0.1, 2.4, 0] }, drift: 0.02,
      cam2: { theta: -1.2, phi: 1.3, r: 4.4, target: [0, 1.85, 0] }, cam2At: 0.52 },
    { id: "motor", name: "MOTOR · SOLID STACK", dur: 5, dot: "teal",
      cam: { theta: -0.5, phi: 1.55, r: 4.6, target: [0.1, 0.7, 0] }, drift: 0.018 },
    { id: "fins", name: "FINS ×4 · DEPLOY & LOCK", dur: 5, dot: "blue",
      cam: { theta: 0.85, phi: 1.3, r: 4.9, target: [0.1, 1.2, 0] }, drift: 0.02 },
    { id: "igniter", name: "IGNITER · UMBILICAL · LAMP TEST", dur: 5, dot: "green",
      cam: { theta: -1.55, phi: 1.22, r: 7.4, target: [-0.45, 3.1, 0] }, drift: 0.018 },
    { id: "countdown", name: "COUNTDOWN · T-MINUS 10", dur: 8, dot: "orange",
      cam: { theta: -2.15, phi: 1.5, r: 13, target: [0.1, 2.6, 0] }, drift: 0.012 },
    { id: "flight", name: "FLIGHT · MACH ROLL", dur: 9, dot: "orange", dyn: flightCam, drift: 0.01 },
    { id: "recover", name: "RECOVERY · CHUTE DOWN", dur: 7, dot: "green", dyn: recoverCam, drift: 0.012 }
  ];

  function flightCam(st, pt) {
    if (pt < 3.4) {
      return { mode: "anchor", anchor: [6.2, 1.2, 9.8], theta: -0.35, phi: 1.34, r: 2.6, follow: true };
    }
    /* 侧后 3/4 追踪视角（略低于箭体，避免正对尾部的轴测死角度） */
    return { theta: -1.15, phi: 1.72, r: 11.5, follow: true };
  }

  function recoverCam(st, pt) {
    if (pt < 1.7) return { theta: -1.0, phi: 1.3, r: 7.5, follow: true };
    /* 从侧下方仰拍：伞衣在箭体上方、以深空为背景 */
    if (pt < 5.4) return { theta: -0.6, phi: 1.8, r: 10.5, follow: true };
    /* 切回地面仰视：最后一段下降 + 触地 */
    return { mode: "anchor", anchor: [13.5, 1.3, 16], theta: 0.5, phi: 1.5, r: 2.6, follow: true };
  }

  /* ---- 程序化遥测剖面（48s 全程） ---- */
  function smooth01(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  function altAt(t) {
    if (t < 32.5 || t > TOUCHDOWN) return 0;
    if (t < BURNOUT) return 3.0 * Math.pow(clamp01((t - 32.5) / 2.9), 1.5);
    if (t < APOGEE) return 3 + 25 * Math.pow(clamp01((t - BURNOUT) / 6.1), 1.18);
    return 28 * Math.pow(1 - clamp01((t - APOGEE) / (TOUCHDOWN - APOGEE)), 1.3);
  }
  function velAt(t) {
    if (t < IGN || t > TOUCHDOWN) return 0;
    if (t < BURNOUT) return 1270 * Math.pow(clamp01((t - IGN) / (BURNOUT - IGN)), 0.72);
    if (t < APOGEE) return 1270 * Math.pow(1 - clamp01((t - BURNOUT) / (APOGEE - BURNOUT)), 0.92);
    return -(5.5 + 4.5 * Math.sin(clamp01((t - APOGEE) / (TOUCHDOWN - APOGEE)) * Math.PI));
  }
  function gAt(t) {
    if (t < IGN) return 1;
    if (t < BURNOUT) return 1 + 5.8 * Math.sin(clamp01((t - IGN) / (BURNOUT - IGN)) * Math.PI * 0.62);
    if (t < APOGEE) return -6.4 * Math.pow(1 - clamp01((t - BURNOUT) / (APOGEE - BURNOUT)), 1.4);
    if (t < 42.4) return 1 + 4.2 * Math.exp(-Math.max(0, t - 41.6) * 3);   // 开伞冲击
    return 1;
  }

  var state = {};
  var idx = -1, pt = 0, tickLast = -1;
  var dom = {};

  function resetState() {
    state = {
      t: 0, pt: 0, met: -1, alt: 0, vel: 0, mach: 0, g: 1, gMax: 1,
      pitch: 6, rate: 0.15, rssi: 87, hz: 40, link: 1, pkt: 0,
      phaseId: "pad", mode: "INTEGRATION", powerOn: false, landed: false,
      burning: false, flightT: -1, descU: -1, sepU: -1, chuteU: -1, landU: -1,
      umb: "hidden", umbU: 0, umbGone: false, vent: 0,
      lamps: [], latestEvent: "",
      events: {
        liftoff: { lit: false, at: 0, stamp: "T+00.0" },
        burnout: { lit: false, at: 0, stamp: "T+02.9" },
        apogee: { lit: false, at: 0, stamp: "T+09.0" },
        drop: { lit: false, at: 0, stamp: "T+09.6" },
        landed: { lit: false, at: 0, stamp: "T+14.7" }
      }
    };
    tickLast = -1;
  }

  function $(id) { return document.getElementById(id); }

  function cacheDom() {
    dom = {
      mode: $("st-mode"), big: $("st-tminus"),
      met: $("st-met"), alt: $("st-alt"), vel: $("st-vel"),
      pill: $("phase-text"), dot: $("phase-dot")
    };
  }

  var PINS = {
    pad: function () {
      return [{ id: "pin-launcher", obj: SRTL.Parts.group("launcher"), text: "LAUNCHER · RAIL 84°", tone: "white" }];
    },
    airframe: function () {
      return [
        { id: "pin-ring", obj: SRTL.Parts.group("ringA"), text: "INTERSTAGE RING" },
        { id: "pin-mid", obj: SRTL.Parts.group("segMid"), text: "INSTRUMENT BAY", tone: "white" }
      ];
    },
    motor: function () {
      return [{ id: "pin-motor", obj: SRTL.Parts.group("motor"), text: "SOLID MOTOR · BELL NOZZLE" }];
    },
    fins: function () {
      return [{ id: "pin-fin", obj: SRTL.Parts.group("fin1"), text: "FIN SET ×4 · ORANGE TIP" }];
    },
    igniter: function () {
      return [
        { id: "pin-ign", obj: SRTL.Parts.group("igniter"), text: "IGNITER · 24 V" },
        { id: "pin-port", obj: SRTL.Parts.group("segMid"), text: "TM PORT · MAST LINK", tone: "white" }
      ];
    },
    countdown: function () {
      return [{ id: "pin-ign", obj: SRTL.Parts.group("igniter"), text: "ARMED · HOLD", tone: "white" }];
    }
  };

  function enterPhase(i) {
    idx = i; pt = 0;
    var ph = phases[i];
    state.phaseId = ph.id;
    if (ph.id === "pad") SRTL.Labels.clearAnnounce();
    var pins = PINS[ph.id];
    SRTL.Labels.setPinned(pins ? pins() : []);
    if (ph.id === "countdown") tickLast = -1;
    dom.big.className = "big" + (ph.id === "countdown" ? " on" : "");
  }

  function restartCycle() {
    SRTL.Parts.reset();
    SRTL.Flight.reset();
    SRTL.FX.reset();
    SRTL.Parts.setPower(false);
    SRTL.setSpaceFactor(0);
    SRTL.setTrackPoint(null);
    resetState();
    cycleEnter(0);
  }

  function cycleEnter(i) {
    enterPhase(i);
    applyEnv();
  }

  /* 阶段无关的环境量（探照灯/跟踪/深空） */
  function applyEnv() {
    SRTL.setSearchPower(idx === 0 ? smooth01(pt / 2.4) : 1);
  }

  /* ---- 灯组状态 ---- */
  function lamp(hex, glow) { return { hex: hex, glow: glow }; }
  var LAMP_OFF = [lamp(0x551512, 0), lamp(0x551512, 0), lamp(0x551512, 0)];
  var LAMP_RED = [lamp(0xd8452c, 0.75), lamp(0xd8452c, 0.75), lamp(0xd8452c, 0.75)];
  var LAMP_GREEN = [lamp(0x3E8E5A, 0.9), lamp(0x3E8E5A, 0.9), lamp(0x3E8E5A, 0.9)];
  var LAMP_AMBER = [lamp(0xF26A1B, 1), lamp(0xF26A1B, 1), lamp(0xF26A1B, 1)];

  function updateLamps() {
    var ph = phases[idx].id;
    if (ph === "pad") {
      state.lamps = pt < 3 ? LAMP_OFF : LAMP_RED;
    } else if (ph === "igniter") {
      var greens = pt > 3.0 ? 3 : (pt > 1.8 ? 2 : (pt > 0.6 ? 1 : 0));
      state.lamps = [];
      for (var i = 0; i < 3; i++) state.lamps.push(i < greens ? lamp(0x3E8E5A, 0.9) : lamp(0xd8452c, 0.75));
    } else if (ph === "countdown") {
      if (pt > 6) {
        state.lamps = (pt * 5) % 1 < 0.5 ? LAMP_AMBER : LAMP_GREEN;   // 最后 2s 橙闪
      } else {
        state.lamps = (pt - tickLast * 0.727) < 0.15 ? LAMP_AMBER : LAMP_GREEN;  // 每秒自检闪
      }
    } else {
      state.lamps = LAMP_GREEN;
    }
    SRTL.Parts.setLampStates(state.lamps);
  }

  function updateEvents() {
    var t = state.t;
    var marks = [["liftoff", LIFTOFF], ["burnout", BURNOUT], ["apogee", APOGEE], ["drop", 42.1], ["landed", TOUCHDOWN]];
    for (var i = 0; i < marks.length; i++) {
      var ev = state.events[marks[i][0]];
      if (!ev.lit && t >= marks[i][1]) {
        ev.lit = true;
        ev.at = t;
        state.latestEvent = marks[i][0];
      }
    }
  }

  function update(dt) {
    if (paused) return;
    dt = Math.min(dt, 0.05);
    state.t += dt;
    pt += dt;
    state.pt = pt;

    var ph = phases[idx];
    if (pt >= ph.dur) {
      if (idx >= phases.length - 1) restartCycle();
      else enterPhase(idx + 1);
      ph = phases[idx];
      applyEnv();
    }
    state.phaseId = ph.id;

    /* ---- 遥测剖面 ---- */
    var t = state.t;
    state.alt = altAt(t);
    state.vel = velAt(t);
    /* 声速按标准大气：11 km 以下 340−3.25×h(km)，之上取 295 m/s */
    state.mach = Math.abs(state.vel) / (340 - 3.25 * Math.min(state.alt / 1000, 11));
    state.g = gAt(t) * (1 + Math.sin(t * 9.3) * 0.02);
    if (state.g > state.gMax) state.gMax = state.g;
    state.burning = t >= IGN && t < BURNOUT;
    state.met = t >= 24 ? t - LIFTOFF : -1;
    state.pitch = pitchAt(t);
    state.rate = rateAt(t);
    state.rssi = 87 + 12 * smooth01(state.alt / 28) + Math.sin(t * 1.7) * 0.8 - (state.landed ? 3 : 0);
    state.hz = 40 - (state.burning ? 0.8 : 0) + Math.sin(t * 3.1) * 0.35;
    state.link = clamp01((101 - Math.abs(state.rssi)) / 15);
    if (state.link > 0.15) state.pkt += 40 * dt * 0.3;
    state.powerOn = t >= 21.5;
    state.landed = t >= TOUCHDOWN;
    SRTL.Parts.setPower(state.powerOn);

    /* ---- 阶段专用状态 ---- */
    var id = ph.id;
    state.flightT = (idx === 6 && t >= LIFTOFF) ? t - LIFTOFF : -1;
    if (id === "igniter") {
      state.umb = "grow";
      state.umbU = clamp01((pt - 1.4) / 1.5);
    } else if (id === "countdown") {
      state.umb = "on";
      state.vent = pt > 6 ? 9 : 0;
      var tick = Math.min(10, Math.floor(pt / 0.727));
      if (tick !== tickLast) tickLast = tick;
    } else if (id === "flight") {
      state.umb = "fall";
      state.vent = 0;
    } else if (id === "recover") {
      state.umb = state.umbGone ? "gone" : "fall";
      state.sepU = clamp01((pt - 0.6) / 0.9);
      state.chuteU = clamp01((pt - 1.1) / 1.1);
      state.descU = clamp01((pt - 1.6) / 4.6);
      state.landU = pt > 6.2 ? clamp01((pt - 6.2) / 0.7) : -1;
    } else if (idx < 4) {
      state.umb = "hidden";
    }

    updateEvents();
    updateLamps();

    /* ---- 3D 驱动 ---- */
    SRTL.Parts.update(pt, idx);
    SRTL.Flight.apply(state, dt);
    SRTL.FX.setFlame(state.burning);
    SRTL.FX.update(dt);
    SRTL.setSpaceFactor(smooth01((state.alt - 5) / 13));
    SRTL.setTrackPoint(idx >= 6 ? SRTL.Flight.root().position : null);
    SRTL.setSearchPower(idx === 0 ? smooth01(pt / 2.4) : 1);

    /* ---- 相机 ---- */
    SRTL.orbitCtl.autoDrift = ph.drift;
    var cam = ph.dyn ? ph.dyn(state, pt) : ph.cam;
    if (ph.cam2 && pt > ph.dur * ph.cam2At) cam = ph.cam2;
    SRTL.orbitCtl.flyTo(cam);

    /* ---- DOM ---- */
    dom.mode.textContent = state.mode = modeNow();
    dom.mode.className = "mode" + (state.mode === "FLIGHT" ? " flight" : (state.mode === "ARMED" ? " armed" : (state.mode === "RECOVERED" ? " ok" : "")));
    var tick = Math.min(10, Math.max(0, Math.floor((id === "countdown" ? pt : 0) / 0.727)));
    if (id === "countdown") {
      dom.big.textContent = "T-" + (10 - tick);
      dom.met.textContent = "T-" + Math.max(0, 32.5 - t).toFixed(1);
    } else if (state.met >= 0) {
      dom.big.className = "big";
      dom.met.textContent = "T+" + state.met.toFixed(1);
    } else {
      dom.big.className = "big";
      dom.met.textContent = "—";
    }
    dom.alt.textContent = state.alt.toFixed(1) + " km";
    dom.vel.textContent = Math.abs(state.vel).toFixed(0) + " m/s";
    var label = ph.name;
    dom.pill.textContent = label;
    dom.dot.className = ph.dot;

    SRTL.Dashboard.update(state);
  }

  function pitchAt(t) {
    if (t < 32.5) return 6;
    if (t < BURNOUT) return 6 - 4 * smooth01((t - 32.5) / 2.9);
    if (t < APOGEE) return 2 + 5 * smooth01((t - BURNOUT) / (APOGEE - BURNOUT));
    var u = clamp01((t - APOGEE) / (TOUCHDOWN - APOGEE));
    var pt2 = t - APOGEE;
    var sway = 9 * Math.sin(pt2 * 2.0) * (1 - u * 0.5);
    var lu = clamp01((pt2 - 6.2) / 0.7);
    return sway * (1 - lu) + 17.2 * lu;
  }
  function rateAt(t) {
    var base;
    if (t < 32.5) base = 0.15;
    else if (t < BURNOUT) base = 2.4;
    else if (t < APOGEE) base = 0.9;
    else {
      var pt2 = t - APOGEE;
      base = 2.6 * Math.cos(pt2 * 2.0) + 22 * Math.exp(-Math.max(0, pt2 - 0.1) * 4);  // 开伞角速度尖峰
    }
    return base + Math.sin(t * 7.1) * 0.3;
  }
  function modeNow() {
    if (idx <= 4) return "INTEGRATION";
    if (idx === 5) return "ARMED";
    if (idx === 6) return "FLIGHT";
    return state.landed ? "RECOVERED" : "RECOVERY";
  }

  var paused = false;

  /* ---- 跳转预设（键盘 1-8 / 后台标签验收） ----
     state.t 直接对齐到该阶段绝对时刻，保证遥测剖面连续 */
  var STARTS = [0, 4, 9, 14, 19, 24, 32, 41];

  function seek(idName) {
    var i = -1;
    for (var k = 0; k < phases.length; k++) if (phases[k].id === idName) i = k;
    if (i < 0) return;
    SRTL.Parts.reset();
    SRTL.Flight.reset();
    SRTL.FX.reset();
    SRTL.Parts.setPower(false);
    SRTL.setSpaceFactor(0);
    SRTL.setTrackPoint(null);
    resetState();
    SRTL.Labels.clearAnnounce();
    state.t = STARTS[i];
    if (i >= 1) SRTL.Parts.sealUpTo(i - 1);
    if (i >= 6) SRTL.Parts.setPower(true);
    if (i === 8) {
      state.umbGone = true;
      SRTL.Parts.sealUpTo(4);
      SRTL.Flight.snapApogee();
      SRTL.setSpaceFactor(1);
    }
    cycleEnter(i);
  }

  SRTL.Timeline = {
    init: function () {
      resetState();
      cacheDom();
    },
    start: function () {
      cycleEnter(0);
    },
    restart: restartCycle,
    seek: seek,
    update: update,
    altAt: altAt,
    togglePause: function () { paused = !paused; return paused; },
    get paused() { return paused; },
    get phaseId() { return phases[idx] ? phases[idx].id : ""; }
  };
})(window.SRTL = window.SRTL || {});
