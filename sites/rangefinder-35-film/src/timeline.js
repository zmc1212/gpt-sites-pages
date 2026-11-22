/* 时间线：机身 → 帘幕 → 过片 → 测距 → 镜头 → 装卷 → 上弦 → 曝光（46s 循环） */
(function (RF35) {
  var phases = [
    { id: "body", name: "BODY · CHROME & VULCANITE", dur: 5, dot: "silver",
      cam: { theta: -1.9, phi: 0.78, r: 1.7, target: [-0.5, 0.5, 0.25] },
      cam2: { theta: -0.35, phi: 1.05, r: 3.6, target: [0, 0.52, 0] }, drift: 0.05 },
    { id: "shutter", name: "SHUTTER · CLOTH CURTAINS", dur: 6, dot: "orange",
      cam: { theta: -0.3, phi: 0.42, r: 1.9, target: [0, 0.55, 0.05] },
      cam2: { theta: -1.15, phi: 0.52, r: 1.45, target: [0.1, 0.5, 0.1] }, drift: 0.02 },
    { id: "advance", name: "ADVANCE · LEVER · COUNTER · REWIND", dur: 5, dot: "green",
      cam: { theta: -0.9, phi: 0.62, r: 1.9, target: [0.15, 0.82, 0.05] },
      cam2: { theta: -1.7, phi: 0.8, r: 1.35, target: [-0.4, 0.8, 0.1] }, drift: 0.015 },
    { id: "optics", name: "OPTICS · COUPLED RANGEFINDER", dur: 6, dot: "blue",
      cam: { theta: -0.4, phi: 0.95, r: 1.5, target: [-0.35, 0.55, 0.28] },
      cam2: { theta: -1.2, phi: 0.55, r: 1.3, target: [-0.25, 0.52, 0.1] }, drift: 0.015 },
    { id: "lens", name: "LENS · 6 ELEMENTS · f/2 – f/16", dur: 7, dot: "orange",
      cam: { theta: -0.12, phi: 1.1, r: 1.35, target: [0, 0.42, 0.5] },
      cam2: { theta: -1.35, phi: 0.82, r: 1.9, target: [0, 0.44, 0.3] }, drift: 0.02 },
    { id: "film", name: "FILM · CASSETTE TO SPOOL", dur: 7, dot: "green",
      cam: { theta: 0.55, phi: 0.75, r: 2.3, target: [0, 0.5, -0.1] },
      cam2: { theta: 1.3, phi: 0.5, r: 1.3, target: [-0.25, 0.45, 0] }, drift: 0.02 },
    { id: "wind", name: "WIND · CURTAINS COCKED", dur: 4, dot: "blue",
      cam: { theta: -0.7, phi: 0.5, r: 1.6, target: [0.3, 0.72, 0.05] }, drift: 0.015 },
    { id: "shoot", name: "SHOOT · 1/1000 SLIT SWEEP", dur: 6, dot: "orange",
      cam: { theta: -0.5, phi: 0.72, r: 1.9, target: [0.15, 0.6, 0.1] },
      cam2: { theta: -0.9, phi: 0.98, r: 2.5, target: [0, 0.5, 0.1] }, drift: 0.02 }
  ];

  var PINNED = {
    body: function () {
      return [
        { id: "p-shell", obj: RF35.Parts.group("shell"), text: "BODY CASTING · CHROME", sub: "vulcanite wrap" },
        { id: "p-top", obj: RF35.Parts.group("topplate"), text: "TOP PLATE · BRASS", tone: "white" }
      ];
    },
    shutter: function () {
      return [
        { id: "p-cloth", obj: RF35.Parts.group("cloth"), text: "CLOTH SHUTTER · 1/1000", sub: "twin curtains" },
        { id: "p-dial", obj: RF35.Parts.group("speeddial"), text: "SPEED DIAL · B–1000", tone: "white" }
      ];
    },
    advance: function () {
      return [
        { id: "p-adv", obj: RF35.Parts.group("advance"), text: "ADVANCE LEVER · 130°" },
        { id: "p-cnt", obj: RF35.Parts.group("counter"), text: "FRAME COUNTER · 0–36", tone: "white" }
      ];
    },
    optics: function () {
      return [
        { id: "p-rf", obj: RF35.Parts.group("rf"), text: "RANGEFINDER · COUPLED" },
        { id: "p-lnk", obj: RF35.Parts.group("linkage"), text: "LINKAGE · 3 LEVERS", tone: "white" }
      ];
    },
    lens: function () {
      return [
        { id: "p-bar", obj: RF35.Parts.group("barrel"), text: "RF-LENTAR 1:2 / 35" },
        { id: "p-iris", obj: RF35.Parts.group("iris"), text: "IRIS · 8 BLADES", tone: "white" }
      ];
    },
    film: function () {
      return [
        { id: "p-cas", obj: RF35.Parts.group("cassette"), text: "CASSETTE · 36 EXP" },
        { id: "p-door", obj: RF35.Parts.group("backdoor"), text: "BACK DOOR · FELT TRAP", tone: "white" }
      ];
    },
    wind: function () {
      return [{ id: "p-adv2", obj: RF35.Parts.group("advance"), text: "WIND · 130° TO STOP" }];
    },
    shoot: function () {
      return [
        { id: "p-btn", obj: RF35.Parts.group("shutterbtn"), text: "RELEASE · ORANGE" },
        { id: "p-cloth2", obj: RF35.Parts.group("cloth"), text: "SLIT 2.0 MM · 12 MS", tone: "white" }
      ];
    }
  };

  var state = {};
  var idx = -1, pt = 0, cycleT = 0, paused = false;
  var dom = {};

  function resetState() {
    state = {
      time: 0, mode: "BUILD",
      speed: "—", speedSec: null, speedSet: false,
      apT: 1, iso: 400, ambient: 11.6,
      counter: 0, seated: 0, partsTotal: RF35.Parts.list().length,
      curtain: { x1: -0.30, y2: -0.30, sweeping: false, sweepMs: 12 },
      focus: 8, rfDemo: false, filmAnnounced: false,
      counter1Done: false, counter2Done: false, dialA: 0
    };
  }

  function $(id) { return document.getElementById(id); }

  function cacheDom() {
    dom = {
      mode: $("st-mode"), speed: $("st-speed"), iris: $("st-iris"), frame: $("st-frame"),
      pill: $("phase-text"), dot: $("phase-dot")
    };
  }

  function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* 速度盘咔哒序列：steps 档，每档 0.35s（快转 + 停顿） */
  var DIAL_STOPS = [0, 0.55, 1.10, 1.65, 2.20];
  function dialClick(pt, start) {
    if (pt < start) return null;
    var k = (pt - start) / 0.35;
    if (k >= DIAL_STOPS.length - 1) return DIAL_STOPS[DIAL_STOPS.length - 1];
    var i = Math.floor(k);
    var frac = smooth((k - i) / 0.6);
    return lerp(DIAL_STOPS[i], DIAL_STOPS[i + 1], frac);
  }

  /* 剖视透明度包络 */
  function ghostFor(id, pt) {
    switch (id) {
      case "shutter": return lerp(1, 0.13, smooth(pt / 0.8));
      case "optics":
        if (pt < 2.0) return 1;
        if (pt < 3.0) return lerp(1, 0.13, smooth((pt - 2.0) / 1.0));
        if (pt < 5.2) return 0.13;
        return lerp(0.13, 1, smooth((pt - 5.2) / 0.8));
      case "film":
        if (pt < 0.8) return 1;
        if (pt < 1.6) return lerp(1, 0.15, smooth((pt - 0.8) / 0.8));
        if (pt < 5.6) return 0.15;
        return lerp(0.15, 1, smooth((pt - 5.6) / 0.8));
      case "wind":
        if (pt < 0.3) return 1;
        if (pt < 1.0) return lerp(1, 0.13, smooth((pt - 0.3) / 0.7));
        if (pt < 3.1) return 0.13;
        return lerp(0.13, 1, smooth((pt - 3.1) / 0.8));
      case "shoot":
        if (pt < 0.2) return 1;
        if (pt < 0.8) return lerp(1, 0.12, smooth((pt - 0.2) / 0.6));
        if (pt < 2.6) return 0.12;
        return lerp(0.12, 1, smooth((pt - 2.6) / 0.8));
      default: return 1;
    }
  }

  function enterPhase(i) {
    idx = i; pt = 0;
    var ph = phases[i];
    RF35.Parts.begin(i);
    RF35.Labels.clearAnnounce();
    state.rfDemo = ph.id === "optics";
    RF35.Dashboard.setRfDemo(state.rfDemo);   // 黄斑双影演示窗仅测距阶段显示
    switch (ph.id) {
      case "shutter":
        // 两帘先都收起，再展开一帘
        RF35.Parts.setCurtains(0.30, -0.30);
        state.curtain.x1 = 0.30; state.curtain.y2 = -0.30;
        break;
      case "film":
        RF35.Parts.setDoor(0);
        state.filmAnnounced = false;
        break;
      case "wind":
        // 从曝光后状态（二帘遮窗）开始上弦复位
        RF35.Parts.setCurtains(0.30, 0.30);
        state.curtain.x1 = 0.30; state.curtain.y2 = 0.30;
        state.counter = 0; RF35.Parts.setCounter(0);
        break;
      case "shoot":
        state.speed = "1/1000"; state.speedSec = 0.001;
        state.counter = 1; RF35.Parts.setCounter(1);
        state.mode = "COCKED";
        state.apT = 0.0156;
        RF35.Parts.setAperture(state.apT);
        break;
    }
    var pins = PINNED[ph.id];
    RF35.Labels.setPinned(pins ? pins() : []);
  }

  function restartCycle() {
    RF35.Parts.reset();
    RF35.Labels.clearAnnounce();
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

    /* ---- 相机运镜（阶段内起点 → 终点插值） ---- */
    var cam = ph.cam;
    if (ph.cam2) {
      var s = smooth(pt / ph.dur);
      cam = {
        theta: lerp(ph.cam.theta, ph.cam2.theta, s),
        phi: lerp(ph.cam.phi, ph.cam2.phi, s),
        r: lerp(ph.cam.r, ph.cam2.r, s),
        target: [
          lerp(ph.cam.target[0], ph.cam2.target[0], s),
          lerp(ph.cam.target[1], ph.cam2.target[1], s),
          lerp(ph.cam.target[2], ph.cam2.target[2], s)
        ]
      };
    }
    RF35.orbitCtl.autoDrift = ph.drift;
    RF35.orbitCtl.flyTo(cam);

    /* ---- 剖视 ---- */
    RF35.Parts.setGhost(ghostFor(ph.id, pt));

    /* ---- 零件飞行 ---- */
    RF35.Parts.update(pt);
    state.seated = RF35.Parts.seatedCount;

    /* ---- 环境光（测光表摆动源） ---- */
    state.ambient = 11.6 + Math.sin(state.time * 0.5) * 0.25 + Math.sin(state.time * 1.3) * 0.1;

    /* ---- 阶段机构编排 ---- */
    switch (ph.id) {
      case "shutter": {
        var deploy = smooth((pt - 1.3) / 1.3);
        var x1 = 0.30 - 0.60 * deploy;
        RF35.Parts.setCurtains(x1, -0.30);
        state.curtain.x1 = x1; state.curtain.y2 = -0.30;
        var a = dialClick(pt, 4.3);
        if (a !== null && pt < 4.3 + 0.35 * 4) { state.dialA = a; RF35.Parts.setDialAngle(a); }
        if (pt >= 5.7 && !state.speedSet) {
          state.speedSet = true;
          state.speed = "1/60"; state.speedSec = 1 / 60;
          RF35.Parts.setDialAngle(2.20); state.dialA = 2.20;
        }
        break;
      }
      case "advance": {
        var up = smooth((pt - 2.8) / 0.9), down = smooth((pt - 4.0) / 0.9);
        RF35.Parts.setLever(up * (1 - down));
        break;
      }
      case "optics": {
        var fs = pt < 2.4 ? 0 : smooth((pt - 2.4) / 3.0);
        state.focus = 8 * Math.pow(0.9 / 8, fs);
        RF35.Parts.setFocus(state.focus);
        break;
      }
      case "lens": {
        var ext = smooth((pt - 0.3) / 1.2);
        RF35.Parts.setExtend(ext);
        RF35.Parts.setFocus(8 - 5.5 * smooth((pt - 2.0) / 1.4));
        state.apT = 1 - 0.9844 * smooth((pt - 4.6) / 1.8);
        RF35.Parts.setAperture(state.apT);
        break;
      }
      case "film": {
        var doorT = smooth((pt - 0.2) / 1.1) * (1 - smooth((pt - 5.6) / 1.0));
        RF35.Parts.setDoor(doorT);
        RF35.Parts.setFeed(smooth((pt - 3.0) / 2.4));
        if (pt >= 3.0 && !state.filmAnnounced) {
          state.filmAnnounced = true;
          RF35.Labels.announce("film", RF35.Parts.group("film"), "FILM LEADER", "crosses the gate", performance.now(), 2600);
        }
        break;
      }
      case "wind": {
        var back = smooth((pt - 0.5) / 1.9);
        var wx1 = 0.30 - 0.60 * back;
        var wy2 = 0.30 - 0.60 * smooth((pt - 0.7) / 1.9);
        RF35.Parts.setCurtains(wx1, wy2);
        state.curtain.x1 = wx1; state.curtain.y2 = wy2;
        var wup = smooth((pt - 0.2) / 0.8), wdown = smooth((pt - 1.6) / 0.9);
        RF35.Parts.setLever(wup * (1 - wdown));
        if (pt >= 2.6 && !state.counter1Done) {
          state.counter1Done = true;
          state.counter = 1;
          RF35.Parts.setCounter(1);
          state.mode = "COCKED";
        }
        break;
      }
      case "shoot": {
        RF35.Parts.setPress(smooth((pt - 0.2) / 0.2) * (1 - smooth((pt - 0.55) / 0.3)));
        // 速度盘拨到 1/1000 + 咔哒摆动
        if (pt < 0.55) {
          state.dialA = 2.20 + 1.20 * smooth(pt / 0.5);
          RF35.Parts.setDialAngle(state.dialA);
        } else {
          var wob = Math.sin((pt - 0.55) * 42) * Math.exp(-(pt - 0.55) * 5) * 0.05;
          RF35.Parts.setDialAngle(3.40 + wob);
        }
        // 1/1000：一帘收起、二帘跟随，窄缝横扫
        var s1 = smooth((pt - 0.55) / 0.62);
        var sx1 = -0.30 + 0.60 * s1;
        var sy2 = -0.30 + 0.60 * Math.max(s1 - 0.0333, smooth((pt - 1.25) / 0.35));
        RF35.Parts.setCurtains(sx1, sy2);
        state.curtain.x1 = sx1; state.curtain.y2 = sy2;
        state.curtain.sweeping = pt >= 0.55 && pt <= 1.45;
        state.curtain.sweepMs = 12;
        // 光圈全开 → 曝光后收拢预览
        if (pt <= 2.4) {
          state.apT = 0.0156 + 0.9844 * smooth((pt - 0.5) / 0.4);
        } else {
          state.apT = 1 - 0.9844 * smooth((pt - 2.4) / 2.0);
        }
        RF35.Parts.setAperture(state.apT);
        if (pt >= 3.6 && !state.counter2Done) {
          state.counter2Done = true;
          state.counter = 2;
          RF35.Parts.setCounter(2);
        }
        if (pt >= 4.2) state.mode = "EXPOSED";
        break;
      }
    }

    /* ---- DOM 状态卡 / 阶段胶囊 ---- */
    dom.mode.textContent = state.mode;
    dom.mode.className = "mode" + (state.mode === "EXPOSED" ? " hot" : "");
    dom.speed.textContent = state.speed;
    var f = 2 / Math.sqrt(Math.max(0.0156, state.apT));
    dom.iris.textContent = f >= 9.7 ? "f/16" : "f/" + f.toFixed(1);
    dom.frame.textContent = state.counter + " / 36";
    var label = ph.name;
    if (ph.id === "body") label = "BODY · " + state.seated + " / " + state.partsTotal;
    dom.pill.textContent = label;
    dom.dot.className = ph.dot;

    /* ---- 仪表盘 ---- */
    RF35.Dashboard.update(state, dt);
  }

  function seek(id) {
    var i = -1;
    for (var k = 0; k < phases.length; k++) if (phases[k].id === id) i = k;
    if (i < 0) return;
    RF35.Parts.reset();
    RF35.Labels.clearAnnounce();
    RF35.Parts.setGhost(1);
    resetState();
    if (i >= 2) {
      // 过片机构已装：帘幕上弦态、速度 1/60
      RF35.Parts.setCurtains(-0.30, -0.30);
      state.curtain.x1 = -0.30; state.curtain.y2 = -0.30;
      state.speed = "1/60"; state.speedSec = 1 / 60; state.speedSet = true;
      RF35.Parts.setDialAngle(2.20); state.dialA = 2.20;
    }
    if (i >= 4) RF35.Parts.setExtend(1);
    if (i >= 5) {
      RF35.Parts.setFeed(1);
      state.apT = 0.0156;
    }
    if (i === 7) {
      state.speed = "1/1000"; state.speedSec = 0.001;
      state.counter = 1; RF35.Parts.setCounter(1);
      state.mode = "COCKED";
      RF35.Parts.setDialAngle(3.40); state.dialA = 3.40;
    }
    RF35.Parts.sealThrough(i);
    enterPhase(i);
  }

  RF35.Timeline = {
    init: function () {
      resetState();
      cacheDom();
    },
    start: function () {
      enterPhase(0);
    },
    restart: restartCycle,
    seek: seek,
    update: update,
    togglePause: function () { paused = !paused; return paused; },
    get paused() { return paused; },
    get phaseId() { return phases[idx] ? phases[idx].id : ""; }
  };
})(window.RF35 = window.RF35 || {});
