/* 时间线：机箱芯片 → 扩展卡 → 前面板 → 电源 → 拨开关 → 写入 → 运行 → 归位 */
(function (LS8) {
  var phases = [
    { id: "chassis", name: "核心芯片 · 8080 + 8224", dur: 6.0, dot: "blue",
      cam: { theta: -0.7, phi: 0.92, r: 5.2, target: [0.62, 0.3, 0] }, drift: 0.03 },
    { id: "cards", name: "扩展卡插入 · S-100", dur: 4.6, dot: "teal",
      cam: { theta: -1.5, phi: 1.0, r: 4.0, target: [0.62, 0.32, -0.07] }, drift: 0.015 },
    { id: "panel", name: "前面板 · 25 SW", dur: 3.2, dot: "teal",
      cam: { theta: -0.85, phi: 1.05, r: 3.2, target: [0.62, 0.32, 0.5] }, drift: 0.012 },
    { id: "power", name: "通电 · 8V UNREG", dur: 3.4, dot: "green",
      cam: { theta: -2.1, phi: 0.95, r: 4.2, target: [0.4, 0.25, -0.3] }, drift: 0.015 },
    { id: "examine", name: "检视 · F000", dur: 3.0, dot: "yellow",
      cam: { theta: -0.9, phi: 0.98, r: 3.0, target: [0.62, 0.35, 0.45] }, drift: 0.01 },
    { id: "deposit", name: "写入 · MONITOR", dur: 3.2, dot: "yellow",
      cam: { theta: -1.35, phi: 1.0, r: 2.9, target: [0.62, 0.35, 0.45] }, drift: 0.01 },
    { id: "run", name: "运行 · 2 MHZ", dur: 3.6, dot: "pink",
      cam: { theta: -0.7, phi: 0.9, r: 4.6, target: [0.62, 0.3, 0.1] }, drift: 0.02 },
    { id: "home", name: "零件归位", dur: 5.0, dot: "yellow",
      cam: { theta: -0.62, phi: 1.0, r: 7.4, target: [0.3, 0.3, 0.2] }, drift: 0.03 }
  ];

  var PINNED = {
    cards: function () {
      return [
        { id: "p-c1", obj: LS8.Parts.group("card1"), text: "1K RAM 内存板", sub: "1K RAM BOARD · S-100 SLOT 7" },
        { id: "p-c3", obj: LS8.Parts.group("card3"), text: "PROM 监控板", sub: "PROM MONITOR · S-100 SLOT 9", tone: "white" }
      ];
    },
    power: function () {
      return [
        { id: "p-xf", obj: LS8.Parts.group("xformer"), text: "电源变压器", sub: "PSU · +8V UNREG · ±16V BUS" },
        { id: "p-cp", obj: LS8.Parts.group("caps"), text: "滤波电容组", sub: "FILTER CAPS · 8000 uF", tone: "white" }
      ];
    },
    run: function () {
      return [{ id: "p-pn", obj: LS8.Parts.group("panel"), text: "运行中 · 2 MHZ", sub: "RUN · 2 MHZ" }];
    }
  };

  var POWER_AT = 3;

  var state = {};
  var idx = -1, pt = 0, paused = false;
  var powerOnAt = -1;
  var dom = {};

  function resetState() {
    state = {
      time: 0, power: false, run: false, halt: false, status: 0,
      addr: 0, data: 0,
      tapeProgress: 0, tapeBits: 0xB7,
      slotFill: [false, false, false, false],
      busActivity: 0,
      regs: { pc: 0x0000, sp: 0xFF00, a: 0x00, fl: 0x00 }
    };
    powerOnAt = -1;
  }

  function $(id) { return document.getElementById(id); }

  function cacheDom() {
    dom = {
      mode: $("st-mode"), addr: $("st-addr"), data: $("st-data"), parts: $("st-parts"),
      pill: $("phase-text"), dot: $("phase-dot")
    };
  }

  function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  var PHASE_SFX = { cards: "insert", panel: "insert", power: "power", examine: "beep", deposit: "insert", run: "chime" };

  function enterPhase(i) {
    idx = i; pt = 0;
    var ph = phases[i];
    if (ph.id === "chassis") {
      LS8.Parts.begin(0, ["cpu", "clkgen", "syscon", "xtal", "ram", "tray"], ph.dur - 1.4);
      LS8.Labels.clearAnnounce();
    } else if (ph.id === "cards") {
      LS8.Parts.begin(0, ["card1", "card2", "card3", "card4"], ph.dur - 1.4);
    } else if (ph.id === "panel") {
      LS8.Parts.begin(0, ["panel"], ph.dur - 1.4);
      LS8.Cables.begin(0);
    } else if (ph.id === "power") {
      LS8.Parts.begin(0, ["xformer", "caps", "rect", "fan"], ph.dur - 1.4);
    } else if (ph.id === "examine") {
      state.mode = "EXAMINE";
    } else if (ph.id === "deposit") {
      state.mode = "DEPOSIT";
    } else if (ph.id === "run") {
      state.mode = "RUN";
    } else if (ph.id === "home") {
      LS8.Parts.flyOut(0);
    }
    if (LS8.Audio && PHASE_SFX[ph.id]) LS8.Audio.play(PHASE_SFX[ph.id]);
    var pins = PINNED[ph.id];
    LS8.Labels.setPinned(pins ? pins() : []);
  }

  function restartCycle() {
    LS8.Parts.reset();
    LS8.Cables.reset();
    LS8.Labels.clearAnnounce();
    resetState();
    enterPhase(0);
  }

  function hex(n, w) { return n.toString(16).toUpperCase().padStart(w, "0"); }

  function update(dt) {
    if (paused) return;
    dt = Math.min(dt, 0.12);
    state.time += dt;
    pt += dt;

    var ph = phases[idx];
    if (pt >= ph.dur) {
      if (idx >= phases.length - 1) restartCycle();
      else enterPhase(idx + 1);
      ph = phases[idx];
    }

    LS8.orbitCtl.autoDrift = ph.drift;
    LS8.orbitCtl.flyTo(ph.cam);

    LS8.Parts.update(pt);
    LS8.Cables.update(pt);
    state.slotFill = [
      pt > 0.9 || idx > 1, pt > 1.6 || idx > 1, pt > 2.3 || idx > 1, pt > 3.0 || idx > 1
    ];
    if (idx > 1) state.slotFill = [true, true, true, true];

    /* 上电 */
    if (ph.id === "power" && pt > 2.2 && !state.power) {
      state.power = true;
      powerOnAt = state.time;
    }

    /* 前面板 3D 贴图 */
    var blink = Math.sin(state.time * 9) > 0 ? 1 : 0;
    if (ph.id === "examine") {
      if (pt > 0.6) state.addr = 0xF000;
      if (pt > 1.6) state.data = 0xC3;
      state.status = 0x001;             // MEMR
    } else if (ph.id === "deposit") {
      state.addr = 0xF000 + Math.floor(pt * 4);
      state.data = [0xC3, 0x00, 0x50, 0x3E][Math.floor(pt * 4) % 4];
      state.regs.pc = state.addr;
      state.status = 0x040;             // WO（写周期）
    } else if (ph.id === "run") {
      state.run = true;
      state.addr = 0xF000 + Math.floor(pt * 180);
      state.data = (state.time * 120) & 0xff;
      state.regs.pc = state.addr;
      state.regs.a = (state.time * 60) & 0xff;
      state.regs.fl = (Math.floor(state.time * 2) & 1) ? 0x86 : 0x02;
      state.busActivity = 0.85 + Math.sin(state.time * 11) * 0.12;
      state.status = 0x001 | (blink ? 0x004 : 0) | 0x400;  // MEMR + M1 + WAIT
    } else {
      state.busActivity = Math.max(0, state.busActivity - dt);
    }

    /* 纸带：power 后开始加载 */
    if (state.power) {
      state.tapeProgress = Math.min(1, state.tapeProgress + dt * 0.22);
      state.tapeBits = (state.tapeBits * 13 + 7) & 0xff;
    }

    if (state.power) LS8.Scene3D.drawPanel(state.addr, state.data, true, state.run, state.status);
    else LS8.Scene3D.drawPanel(0, 0, false, false, 0);

    /* DOM 状态 */
    dom.mode.textContent = state.run ? "运行 RUN" : (state.power ? (ph.id === "deposit" ? "写入 DEPOSIT" : ph.id === "examine" ? "检视 EXAMINE" : "就绪 READY") : "关机 OFF");
    dom.mode.className = "mode" + (state.run ? " lock" : "");
    dom.addr.textContent = hex(state.addr, 4);
    dom.data.textContent = hex(state.data, 2);
    var partsN = LS8.Parts.seatedCount;
    dom.parts.textContent = partsN + " / 15";
    var label = ph.name;
    if (ph.id === "chassis" || ph.id === "cards") label = ph.name + " · " + partsN + " / 15";
    dom.pill.textContent = label;
    dom.dot.className = ph.dot;

    LS8.Dashboard.update(state, dt);
  }

  LS8.Timeline = {
    init: function () { resetState(); cacheDom(); },
    start: function () { enterPhase(0); },
    restart: restartCycle,
    seek: function (id) {
      var i = -1;
      for (var k = 0; k < phases.length; k++) if (phases[k].id === id) i = k;
      if (i < 0) return;
      LS8.Parts.reset();
      LS8.Cables.reset();
      LS8.Labels.clearAnnounce();
      resetState();
      if (i >= 1) { LS8.Parts.begin(0); LS8.Parts.sealAll(); }
      if (i >= POWER_AT) {
        LS8.Cables.completeAll();
        state.power = true;
        powerOnAt = 0;
        state.addr = 0xF000;
        state.data = 0xC3;
        state.regs.pc = 0xF000;
        state.slotFill = [true, true, true, true];
      }
      if (i >= 6) { state.run = true; state.tapeProgress = 1; }
      enterPhase(i);
    },
    update: update,
    togglePause: function () { paused = !paused; return paused; },
    get paused() { return paused; },
    get phaseId() { return phases[idx] ? phases[idx].id : ""; },
    get phaseIds() { return phases.map(function (p) { return p.id; }); }
  };
})(window.LS8 = window.LS8 || {});
