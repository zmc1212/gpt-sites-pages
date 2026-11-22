/* 时间线：核心 → RAM → 视频 → 电源 → 接线 → 上电 → Woz 监控 → BASIC → 归位 */
(function (LS8) {
  var phases = [
    { id: "core", name: "核心芯片 · 6502", dur: 5.2, dot: "pink",
      cam: { theta: -0.62, phi: 0.96, r: 6.0, target: [0.05, 0.2, 0.1] }, drift: 0.04 },
    { id: "ram", name: "内存阵列 · 8 x 4KBIT", dur: 4.4, dot: "blue",
      cam: { theta: -1.4, phi: 0.95, r: 3.6, target: [0.05, 0.15, 0.42] }, drift: 0.015 },
    { id: "video", name: "视频输出 · RF BOX", dur: 3.4, dot: "teal",
      cam: { theta: -2.3, phi: 0.95, r: 3.6, target: [1.0, 0.15, -0.25] }, drift: 0.012 },
    { id: "pwr", name: "电源稳压 · 7805", dur: 3.4, dot: "green",
      cam: { theta: -2.9, phi: 0.98, r: 3.4, target: [-0.95, 0.18, -0.2] }, drift: 0.012 },
    { id: "io", name: "外设接入 · 键盘 + 磁带", dur: 3.2, dot: "teal",
      cam: { theta: -0.5, phi: 0.9, r: 4.2, target: [-0.7, 0.15, 0.2] }, drift: 0.015 },
    { id: "power", name: "通电 · 5V", dur: 2.6, dot: "green",
      cam: { theta: -1.1, phi: 0.88, r: 3.4, target: [0.05, 0.15, 0.1] }, drift: 0.012 },
    { id: "woz", name: "Woz 监控 · WOZMON", dur: 4.2, dot: "yellow",
      cam: { theta: -1.6, phi: 1.02, r: 4.0, target: [0.05, 0.15, 0.1] }, drift: 0.01 },
    { id: "basic", name: "BASIC 语言 · CRUN", dur: 5.0, dot: "pink",
      cam: { theta: -0.7, phi: 0.94, r: 5.2, target: [0.05, 0.15, 0.1] }, drift: 0.02 }
  ];

  var PINNED = {
    ram: function () {
      return [
        { id: "p-r1", obj: LS8.Parts.group("ram1"), text: "内存芯片 4096", sub: "MK4096 · 4KBIT" },
        { id: "p-r8", obj: LS8.Parts.group("ram8"), text: "8 颗 · 共 4 KB", sub: "8 × 4KBIT = 4KB", tone: "white" }
      ];
    },
    video: function () {
      return [{ id: "p-rf", obj: LS8.Parts.group("rfmod"), text: "RF 调制盒", sub: "RF MOD · CH 3" }];
    },
    pwr: function () {
      return [
        { id: "p-rg", obj: LS8.Parts.group("reg"), text: "稳压 7805", sub: "7805 · 5V" },
        { id: "p-t3", obj: LS8.Parts.group("to3"), text: "调整管 2N3055", sub: "2N3055 · PASS", tone: "white" }
      ];
    },
    woz: function () {
      return [{ id: "p-cpu", obj: LS8.Parts.group("cpu"), text: "Woz 监控运行", sub: "WOZ MONITOR · E000" }];
    }
  };

  var POWER_AT = 5;

  var state = {};
  var idx = -1, pt = 0, paused = false;
  var typed = 0;
  var dom = {};

  function resetState() {
    state = {
      time: 0, power: false, crtOn: false, basicOn: false, runChip: false,
      tapePlaying: false, tapeProgress: 0,
      ramSeated: 0,
      regs: { pc: 0xE000, a: 0x00, x: 0x00, y: 0x00 }
    };
    typed = 0;
    LS8.Dashboard.crtClear();
  }

  function $(id) { return document.getElementById(id); }

  function cacheDom() {
    dom = {
      mode: $("st-mode"), clk: $("st-clk"), bus: $("st-bus"), parts: $("st-parts"),
      pill: $("phase-text"), dot: $("phase-dot")
    };
  }

  function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  var PHASE_SFX = { io: "insert", power: "power", woz: "beep", basic: "chirp" };

  function enterPhase(i) {
    idx = i; pt = 0;
    var ph = phases[i];
    if (ph.id === "core") {
      LS8.Parts.begin(0, ["cpu", "chargen", "prom", "tray"]);
      LS8.Labels.clearAnnounce();
    } else if (ph.id === "ram") {
      LS8.Parts.begin(0, ["ram1", "ram2", "ram3", "ram4", "ram5", "ram6", "ram7", "ram8", "xtal1"]);
    } else if (ph.id === "video") {
      LS8.Parts.begin(0, ["rfmod"]);
    } else if (ph.id === "pwr") {
      LS8.Parts.begin(0, ["reg", "to3", "caps", "res"]);
    } else if (ph.id === "io") {
      LS8.Parts.begin(0, ["jacks", "kbd", "pia"]);
      LS8.Cables.begin(0);
    } else if (ph.id === "power") {
      state.power = true;
    } else if (ph.id === "woz") {
      state.crtOn = true;
      LS8.Dashboard.crtType("E000R", "\\");
    } else if (ph.id === "basic") {
      state.basicOn = true;
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

  /* CRT 脚本（打字节奏） */
  var CRT_SCRIPT = [
    [0.8, "E000R"],
    [2.2, "APPLE 1 BASIC V1.1"],
    [2.9, ">"],
    [3.6, "10 PRINT \"HELLO, WORLD!\""],
    [5.0, "20 GOTO 10"],
    [6.2, "RUN"],
    [7.2, "HELLO, WORLD!"],
    [8.0, "HELLO, WORLD!"],
    [8.8, "HELLO, WORLD!"]
  ];

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
    state.ramSeated = Math.min(8, LS8.Parts.seatedCount - 4 < 0 ? 0 : LS8.Parts.seatedCount - 4);

    /* CRT 打字脚本（woz 阶段及之后持续推进） */
    if (state.crtOn) {
      var t = state.crtScriptT = (state.crtScriptT || 0) + dt;
      while (typed < CRT_SCRIPT.length && t > CRT_SCRIPT[typed][0]) {
        LS8.Dashboard.crtType(CRT_SCRIPT[typed][1], typed >= 2 ? ">" : "\\");
        typed++;
      }
      if (typed >= 5) state.basicOn = true;
      if (typed >= 6) state.runChip = true;
    }

    /* 磁带在 basic 阶段前加载 */
    if (ph.id === "woz") {
      state.tapePlaying = pt > 0.2 && pt < 3.6;
      state.tapeProgress = Math.min(1, pt / 3.6);
    }

    /* 寄存器随机跳动 */
    if (state.runChip) {
      state.regs.pc = 0xE00A + (Math.floor(state.time * 30) % 0x20);
      state.regs.a = (state.time * 40) & 0xff;
    } else if (state.crtOn) {
      state.regs.pc = 0xE000;
    }

    /* DOM */
    dom.mode.textContent = state.runChip ? "运行 RUN" : (state.basicOn ? "载入 BASIC" : (state.crtOn ? "监控 WOZMON" : (state.power ? "就绪 READY" : "关机 OFF")));
    dom.mode.className = "mode" + (state.runChip ? " lock" : "");
    dom.clk.textContent = state.power ? "1.023 MHZ" : "—";
    dom.bus.textContent = state.crtOn ? ("$" + state.regs.pc.toString(16).toUpperCase().padStart(4, "0")) : "----";
    var partsN = LS8.Parts.seatedCount;
    dom.parts.textContent = partsN + " / 22";
    var label = ph.name;
    if (ph.id === "core" || ph.id === "ram") label = ph.name + " · " + partsN + " / 22";
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
      }
      enterPhase(i);
      if (i >= 6) {  // woz 及以后：直接补打字进度
        state.crtOn = true;
        state.tapeProgress = 1;
        var t = i >= 7 ? 9.5 : 2.0;
        while (typed < CRT_SCRIPT.length && t > CRT_SCRIPT[typed][0]) {
          LS8.Dashboard.crtType(CRT_SCRIPT[typed][1], typed >= 2 ? ">" : "\\");
          typed++;
        }
        if (typed >= 5) state.basicOn = true;
        if (typed >= 6) state.runChip = true;
        state.crtScriptT = t;
      }
    },
    update: update,
    togglePause: function () { paused = !paused; return paused; },
    get paused() { return paused; },
    get phaseId() { return phases[idx] ? phases[idx].id : ""; },
    get phaseIds() { return phases.map(function (p) { return p.id; }); }
  };
})(window.LS8 = window.LS8 || {});
