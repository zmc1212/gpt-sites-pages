/* 时间线：核心芯片 → 屏蔽罩/手柄 → 外设 → 壳体扣合 → 卡带 → 通电 → 游戏 → 归位 */
(function (LS8) {
  var phases = [
    { id: "chips", name: "核心芯片 · 2A03 + 2C02", dur: 4.6, dot: "blue",
      cam: { theta: -0.62, phi: 0.96, r: 5.4, target: [0.05, 0.2, 0.05] }, drift: 0.04 },
    { id: "rf", name: "屏蔽罩 · 晶振", dur: 3.2, dot: "teal",
      cam: { theta: -1.8, phi: 0.95, r: 3.8, target: [0.5, 0.2, -0.3] }, drift: 0.012 },
    { id: "pads", name: "外设接入 · 手柄 I/II", dur: 3.4, dot: "teal",
      cam: { theta: -2.6, phi: 1.0, r: 4.2, target: [-1.8, 0.15, 0.9] }, drift: 0.015 },
    { id: "shell", name: "壳体扣合 · 红顶白底", dur: 3.4, dot: "pink",
      cam: { theta: -1.0, phi: 1.02, r: 4.4, target: [0.05, 0.3, 0.05] }, drift: 0.01 },
    { id: "cart", name: "卡带插入 · NROM", dur: 3.0, dot: "yellow",
      cam: { theta: -1.25, phi: 1.05, r: 3.2, target: [0.05, 0.4, -0.4] }, drift: 0.01 },
    { id: "power", name: "通电 · 5V", dur: 2.2, dot: "green",
      cam: { theta: -0.75, phi: 0.92, r: 4.0, target: [0.05, 0.25, 0.05] }, drift: 0.012 },
    { id: "game", name: "游戏 · CHR 加载", dur: 3.4, dot: "pink",
      cam: { theta: -1.5, phi: 1.0, r: 4.6, target: [0.05, 0.3, 0.0] }, drift: 0.015 },
    { id: "home", name: "零件归位", dur: 5.0, dot: "yellow",
      cam: { theta: -0.62, phi: 1.0, r: 7.4, target: [-0.5, 0.3, 0.1] }, drift: 0.03 }
  ];

  var PINNED = {
    rf: function () {
      return [{ id: "p-rf", obj: LS8.Parts.group("rf"), text: "射频屏蔽罩", sub: "RF SHIELD · CH 1" }];
    },
    shell: function () {
      return [
        { id: "p-st", obj: LS8.Parts.group("shelltop"), text: "顶壳 · 酒红", sub: "TOP SHELL · BURGUNDY" },
        { id: "p-sb", obj: LS8.Parts.group("shellbottom"), text: "底壳 · 米白", sub: "BOTTOM · IVORY", tone: "white" }
      ];
    },
    cart: function () {
      return [{ id: "p-ca", obj: LS8.Parts.group("cart"), text: "卡带就位", sub: "GAME PAK · SEATED" }];
    },
    game: function () {
      return [
        { id: "p-ca", obj: LS8.Parts.group("cart"), text: "2A03 运行中", sub: "2A03 RUNNING" },
        { id: "p-st", obj: LS8.Parts.group("shelltop"), text: "HVC-001 · REV A", tone: "white" }
      ];
    }
  };

  var POWER_AT = 5;

  var state = {};
  var idx = -1, pt = 0, paused = false;
  var dom = {};

  function resetState() {
    state = {
      time: 0, power: false,
      chrProgress: 0, playing: false, seqs: 0, frames: 0,
      cartSeated: false
    };
  }

  function $(id) { return document.getElementById(id); }

  function cacheDom() {
    dom = {
      mode: $("st-mode"), clk: $("st-clk"), frame: $("st-frame"), parts: $("st-parts"),
      pill: $("phase-text"), dot: $("phase-dot")
    };
  }

  function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  var PHASE_SFX = { shell: "insert", cart: "insert", power: "power", game: "chirp" };

  /* 各阶段飞入的零件清单（enterPhase 与 seek 共用） */
  var PHASE_PARTS = {
    chips: ["cpu", "ppu", "wramp", "vram", "xtal", "tray"],
    rf: ["rf"],
    pads: ["pad1", "pad2", "ac", "rfsw"],
    shell: ["shellbottom", "shelltop", "pwsw", "pwled"],
    cart: ["cart"]
  };

  function enterPhase(i) {
    idx = i; pt = 0;
    var ph = phases[i];
    if (ph.id === "chips") {
      LS8.Parts.begin(0, PHASE_PARTS.chips, ph.dur - 1.4);
      LS8.Labels.clearAnnounce();
    } else if (ph.id === "rf") {
      LS8.Parts.begin(0, PHASE_PARTS.rf, ph.dur - 1.4);
    } else if (ph.id === "pads") {
      LS8.Parts.begin(0, PHASE_PARTS.pads, ph.dur - 1.4);
      LS8.Cables.begin(0);
    } else if (ph.id === "shell") {
      LS8.Parts.begin(0, PHASE_PARTS.shell, ph.dur - 1.4);
    } else if (ph.id === "cart") {
      LS8.Parts.begin(0, PHASE_PARTS.cart, ph.dur - 1.4);
    } else if (ph.id === "power") {
      state.power = true;
      state.cartSeated = true;
    } else if (ph.id === "game") {
      // CHR 加载在 update 中推进
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

    if (state.power) {
      state.frames += dt * 60.098;
      if (ph.id === "game") {
        state.chrProgress = Math.min(1, state.chrProgress + dt * 0.4);
        state.playing = false;
      }
      if (ph.id === "home" || idx >= 7) {
        state.playing = true;
        state.seqs += dt * 2.2;
        if (state.chrProgress < 1) state.chrProgress = Math.min(1, state.chrProgress + dt * 0.4);
      }
    }

    /* DOM */
    dom.mode.textContent = state.playing ? "运行 PLAY" : (state.chrProgress > 0 ? "加载 GAME" : (state.power ? "就绪 READY" : "关机 OFF"));
    dom.mode.className = "mode" + (state.playing ? " lock" : "");
    dom.clk.textContent = state.power ? "1.789 MHZ" : "—";
    dom.frame.textContent = String(Math.floor(state.frames)).padStart(3, "0");
    var partsN = LS8.Parts.seatedCount;
    dom.parts.textContent = partsN + " / 16";
    var label = ph.name;
    if (ph.id === "chips") label = ph.name + " · " + partsN + " / 16";
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
      if (i >= 1) LS8.Parts.sealOthers(PHASE_PARTS[phases[i].id] || []);
      if (i >= POWER_AT) {
        LS8.Cables.completeAll();
        state.power = true;
        state.cartSeated = true;
      }
      if (i >= 6) state.chrProgress = 1;
      if (i >= 7) state.playing = true;
      enterPhase(i);
    },
    update: update,
    togglePause: function () { paused = !paused; return paused; },
    get paused() { return paused; },
    get phaseId() { return phases[idx] ? phases[idx].id : ""; },
    get phaseIds() { return phases.map(function (p) { return p.id; }); }
  };
})(window.LS8 = window.LS8 || {});
