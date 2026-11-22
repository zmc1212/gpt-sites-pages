/* 时间线:缸体 → 曲轴 → 活塞 → 缸盖 → 气门 → 进气 → 点火 → 怠速(自动循环) */
(function (V8SB) {
  var phases = [
    { id: "block", name: "01 · BLOCK — CASTING ON STAND", mode: "BLOCK", dur: 5, dot: "gold", drift: 0.03,
      cam: { from: { t: -0.55, p: 0.95, r: 11.5, tg: [0, 2.2, 0] }, to: { t: -0.35, p: 0.5, r: 6.4, tg: [0, 3.05, -1.1] } } },
    { id: "crank", name: "02 · CRANK — MAINS · CAPS · PAN", mode: "CRANK", dur: 6, dot: "orange", drift: 0.025,
      cam: { from: { t: -1.35, p: 1.38, r: 8.8, tg: [0, 1.35, 0] }, to: { t: -2.0, p: 1.34, r: 7.2, tg: [-0.3, 1.3, 0] } } },
    { id: "pistons", name: "03 · PISTONS — FIRING 1-8-4-3-6-5-7-2", mode: "PISTONS", dur: 8, dot: "orange", drift: 0.02,
      cam: { from: { t: -0.95, p: 0.6, r: 9.0, tg: [0, 2.6, 0] }, to: { t: -1.5, p: 0.72, r: 7.6, tg: [0.3, 2.7, 0.3] } } },
    { id: "heads", name: "04 · HEADS — BANKS & CAMS", mode: "HEADS", dur: 6, dot: "silver", drift: 0.02,
      cam: { from: { t: -2.35, p: 0.8, r: 9.2, tg: [0, 2.9, 0] }, to: { t: -2.8, p: 0.72, r: 7.4, tg: [0, 3.0, 0.4] } } },
    { id: "valvetrain", name: "05 · VALVES — 16V & HAND CRANK", mode: "VALVES", dur: 6, dot: "teal", drift: 0.015,
      cam: { from: { t: -1.7, p: 0.68, r: 6.2, tg: [0.3, 3.5, -1.0] }, to: { t: -2.15, p: 0.62, r: 5.0, tg: [-0.5, 3.5, -1.0] } } },
    { id: "intake", name: "06 · INTAKE — MANIFOLD · CARB · HEADERS", mode: "INTAKE", dur: 6, dot: "silver", drift: 0.02,
      cam: { from: { t: -0.4, p: 0.82, r: 9.4, tg: [0, 3.3, 0] }, to: { t: -0.9, p: 0.98, r: 10.2, tg: [0, 3.0, 0] } } },
    { id: "ignition", name: "07 · IGNITION — DISTRIBUTOR & PLUGS", mode: "IGNITION", dur: 5, dot: "red", drift: 0.015,
      cam: { from: { t: -2.5, p: 0.75, r: 6.4, tg: [1.3, 3.7, 0] }, to: { t: -2.9, p: 0.82, r: 5.6, tg: [1.7, 3.8, 0] } } },
    { id: "idle", name: "08 · IDLE — 800 RPM · WARM ENGINE", mode: "IDLE", dur: 6, dot: "green", drift: 0.03,
      cam: { from: { t: -0.7, p: 0.98, r: 10.5, tg: [0, 2.3, 0] }, to: { t: -0.95, p: 0.92, r: 8.8, tg: [0, 2.2, 0] } } }
  ];
  var TOTAL = 48;   // 各阶段时长之和(秒)

  /* 每阶段固定标签 */
  var PINNED = {
    block: function () {
      return [{ id: "tag-block", obj: V8SB.Parts.group("block"), text: "ENGINE BLOCK · IRONLINE 350", sub: "90° V · 8 BORES OPEN" }];
    },
    crank: function () {
      return [{ id: "tag-crank", obj: V8SB.Parts.group("crank"), text: "FORGED CRANK · CROSS-PLANE", sub: "THROWS AT 0/90/180/270" }];
    },
    heads: function () {
      return [
        { id: "tag-headL", obj: V8SB.Parts.group("headL"), text: "CYLINDER HEAD · L BANK" },
        { id: "tag-camR", obj: V8SB.Parts.group("camR"), text: "CAMSHAFT · HALF SPEED", tone: "white" }
      ];
    },
    valvetrain: function () {
      return [{ id: "tag-headR", obj: V8SB.Parts.group("headR"), text: "VALVE TRAIN · 16V OHV", sub: "HAND CRANK 180°" }];
    },
    intake: function () {
      return [
        { id: "tag-intake", obj: V8SB.Parts.group("intake"), text: "INTAKE · DUAL PLANE" },
        { id: "tag-carb", obj: V8SB.Parts.group("carb"), text: "CARB · 4-BBL", tone: "white" }
      ];
    },
    ignition: function () {
      return [{ id: "tag-dist", obj: V8SB.Parts.group("dist"), text: "DISTRIBUTOR · 8 TOWERS", sub: "WIRES IN FIRING ORDER" }];
    },
    idle: function () {
      return [{ id: "tag-run", obj: V8SB.Parts.group("block"), text: "IRONLINE SB-350 · RUNNING", sub: "800 RPM · OIL 28 PSI", tone: "white" }];
    }
  };

  var idx = -1, pt = 0, cycleT = 0, paused = false;
  var state = {};
  var dom = {};

  function resetState() {
    state = { time: 0, runTime: 0, rpm: 0, oil: 0, temp: 22, blip: false, mode: "BLOCK" };
  }

  function $(id) { return document.getElementById(id); }

  function cacheDom() {
    dom = {
      mode: $("st-mode"), rpm: $("st-rpm"), oil: $("st-oil"), temp: $("st-temp"),
      pill: $("phase-text"), dot: $("phase-dot")
    };
  }

  function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function easeIO(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function lerpCam(a, b, k) {
    return {
      theta: a.t + (b.t - a.t) * k,
      phi: a.p + (b.p - a.p) * k,
      r: a.r + (b.r - a.r) * k,
      target: [
        a.tg[0] + (b.tg[0] - a.tg[0]) * k,
        a.tg[1] + (b.tg[1] - a.tg[1]) * k,
        a.tg[2] + (b.tg[2] - a.tg[2]) * k
      ]
    };
  }

  function enterPhase(i) {
    idx = i; pt = 0;
    var ph = phases[i];
    V8SB.Parts.showPhase(ph.id);
    state.mode = ph.mode;
    V8SB.Scene3D.setXray(ph.id === "idle");   // 怠速透视外壳
    if (ph.id !== "idle") {
      V8SB.Engine.setTarget(0);
      V8SB.Engine.setIgnition(false);
    }
    var pins = PINNED[ph.id];
    V8SB.Labels.setPinned(pins ? pins() : []);
  }

  function hardReset() {
    V8SB.Parts.reset();
    V8SB.Engine.reset();
    V8SB.Labels.clearAnnounce();
    resetState();
    cycleT = 0;
  }

  function restartCycle() {
    hardReset();
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

    /* ---- 相机:阶段内双关键帧插值 ---- */
    var k = smooth(pt / ph.dur);
    V8SB.orbitCtl.autoDrift = ph.drift;
    V8SB.orbitCtl.flyTo(lerpCam(ph.cam.from, ph.cam.to, k));

    /* ---- 零件飞入 ---- */
    V8SB.Parts.update(pt);

    /* ---- 发动机机构 ---- */
    if (ph.id === "valvetrain") {
      // 手转曲轴半圈,演示气门开合
      if (pt < 3.6) V8SB.Engine.setTheta(0);
      else if (pt < 5.9) V8SB.Engine.setTheta(180 * easeIO((pt - 3.6) / 2.3));
      else V8SB.Engine.setTheta(180);
      V8SB.Engine.step(dt);
    } else {
      if (ph.id === "idle") {
        var target = pt < 0.55 ? 210 : (pt < 2.6 ? 800 : (pt < 3.6 ? 4500 : (pt < 5.15 ? 800 : 0)));
        V8SB.Engine.setTarget(target);
        V8SB.Engine.setIgnition(pt >= 0.55);
        state.blip = pt >= 2.6 && pt < 3.6;
        if (pt >= 0.55) state.runTime += dt;
      } else {
        V8SB.Engine.setTarget(0);
        V8SB.Engine.setIgnition(false);
        state.blip = false;
      }
      V8SB.Engine.step(dt);
    }
    state.rpm = V8SB.Engine.rpm;

    /* ---- 油压 / 水温 ---- */
    if (ph.id === "idle") {
      var blipK = state.blip ? smooth((state.rpm - 800) / 3700) : 0;
      state.oil = 28 * Math.min(1, state.rpm / 800) + blipK * 16;
      state.temp = 30 + 58 * smooth(pt / 5.4);
    } else {
      state.oil = 0;
      state.temp = 22 + idx * 1.6;
    }

    /* ---- 状态卡 / 阶段胶囊 ---- */
    dom.mode.textContent = state.mode;
    dom.mode.className = "mode" + (ph.id === "idle" ? " idle" : "");
    dom.rpm.textContent = Math.round(state.rpm) + " rpm";
    dom.oil.textContent = state.oil.toFixed(1) + " psi";
    dom.temp.textContent = state.temp.toFixed(0) + " °C";
    dom.pill.textContent = ph.name + " · " + V8SB.Parts.fittedCount + "/" + V8SB.Parts.total;
    dom.dot.className = ph.dot;

    /* ---- 仪表盘 ---- */
    V8SB.Dashboard.update({
      rpm: state.rpm, theta: V8SB.Engine.theta,
      oil: state.oil, temp: state.temp,
      mode: state.mode, blip: state.blip, runTime: state.runTime
    }, dt);
  }

  V8SB.Timeline = {
    init: function () {
      resetState();
      cacheDom();
      V8SB.Engine.onFire(function (cyl) {
        V8SB.Dashboard.pulse(cyl);
      });
    },
    start: function () {
      hardReset();
      enterPhase(0);
    },
    restart: restartCycle,
    /* 跳转到指定阶段(键盘 1-8 / 后台标签页验收) */
    seek: function (id) {
      var i = -1;
      for (var k = 0; k < phases.length; k++) if (phases[k].id === id) i = k;
      if (i < 0) return;
      hardReset();
      if (i >= 1) V8SB.Parts.sealThrough(i);
      enterPhase(i);
      document.getElementById("phase-text").style.opacity = "1";
    },
    seekIndex: function (i) {
      if (i < 0 || i >= phases.length) return;
      this.seek(phases[i].id);
    },
    update: update,
    togglePause: function () { paused = !paused; return paused; },
    get paused() { return paused; },
    get phaseId() { return phases[idx] ? phases[idx].id : ""; },
    get totalLength() { return TOTAL; },
    phaseIds: function () {
      return phases.map(function (p) { return p.id; });
    }
  };
})(window.V8SB = window.V8SB || {});
