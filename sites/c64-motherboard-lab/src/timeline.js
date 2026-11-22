/* 时间线:裸板 → DRAM → 自定义芯片 → CPU → ROM → 连接器 → 上电开机 → SID JAM(46s 循环) */
(function (C64B) {
  var phases = [
    { id: "pcb", name: "主板裸板 · ASSY 250425", dur: 4, dot: "blue",
      cam: { theta: -0.55, phi: 0.92, r: 9.2, target: [0, 0.1, 0] }, drift: 0.05 },
    { id: "dram", name: "内存装填 · 8× 4164", dur: 6, dot: "blue",
      cam: { theta: -0.95, phi: 0.62, r: 4.6, target: [-1.75, 0.1, -0.2] }, drift: 0.028 },
    { id: "custom", name: "自研芯片 · VIC-II / SID / PLA", dur: 7, dot: "yellow",
      cam: { theta: -1.15, phi: 0.9, r: 4.4, target: [-0.25, 0.12, 0.1] }, drift: 0.02 },
    { id: "cpu", name: "核心芯片 · 6510 + 2× CIA", dur: 6, dot: "teal",
      cam: { theta: -0.65, phi: 0.88, r: 3.9, target: [0.35, 0.1, 0.3] }, drift: 0.016 },
    { id: "rom", name: "固件 ROM · BASIC / KERNAL / CHAR", dur: 5, dot: "orange",
      cam: { theta: -1.7, phi: 0.9, r: 3.8, target: [1.45, 0.1, -0.1] }, drift: 0.016 },
    { id: "conn", name: "外设接入 · 端口 + CRT", dur: 6, dot: "green",
      cam: { theta: -2.3, phi: 0.92, r: 5.6, target: [1.1, 0.1, 0.4] }, drift: 0.02 },
    { id: "boot", name: "开机 · BASIC V2 READY", dur: 6, dot: "green",
      cam: { theta: -0.72, phi: 0.98, r: 7.2, target: [-0.2, 0.4, -1.0] }, drift: 0.014 },
    { id: "sid", name: "SID 弹奏 · 3-VOICE JAM", dur: 6, dot: "pink",
      cam: { theta: -1.0, phi: 1.02, r: 5.8, target: [-0.35, 0.45, -1.9] }, drift: 0.012 }
  ];

  /* 各阶段在装配钟上的绝对起点 */
  var PHASE_T = (function () {
    var t = 0, out = [];
    phases.forEach(function (p) { out.push(t); t += p.dur; });
    return out;
  })();

  var MODES = { pcb: "裸板 PCB", dram: "装填 DRAM", custom: "自研芯片", cpu: "CPU 就位", rom: "ROM 就位", conn: "外设 I/O", boot: "开机 BOOT", sid: "SID 弹奏" };

  var PINNED = {
    pcb: function () {
      return [{ id: "pin-board", obj: C64B.Parts.group("pcb"), text: "C64 主板 · ASSY 250425", sub: "COMMODORE 64 · 9V AC + 5V DC IN" }];
    },
    dram: function () {
      return [{ id: "pin-dram", obj: C64B.Parts.group("dram0"), text: "内存排 · 4164 ×8", sub: "TWO RANKS · 64K×1 · U9-U12 + U21-U24", tone: "white" }];
    },
    custom: function () {
      return [{ id: "pin-sid", obj: C64B.Parts.group("sid"), text: "SID 声音芯片", sub: "MOS 6581 · THE SOUND CHIP" }];
    },
    cpu: function () {
      return [{ id: "pin-cpu", obj: C64B.Parts.group("cpu"), text: "6510 处理器", sub: "MOS 6510 · 0.985 MHZ · ÷18 VIA 8701", tone: "white" }];
    },
    rom: function () {
      return [{ id: "pin-rom", obj: C64B.Parts.group("romBasic"), text: "BASIC 固件 ROM · 8K", sub: "$A000 · KERNAL $E000 · CHAR $D000", tone: "white" }];
    },
    conn: function () {
      return [{ id: "pin-crt", obj: C64B.Parts.group("crt"), text: "CRT 电视机", sub: "VIC-II → VIDEO IN" }];
    },
    boot: function () {
      return [{ id: "pin-crt2", obj: C64B.Parts.group("crt"), text: "开机就绪 · 38911 BASIC BYTES FREE", sub: "BASIC V2 · READY." }];
    },
    sid: function () {
      return [{ id: "pin-crt3", obj: C64B.Parts.group("crt"), text: "SID 弹奏 · A S D F G H J K", sub: "KEYS PLAY THE NOTES" }];
    }
  };

  /* SID 自动琶音(每声道的音序) */
  var ARP = [
    [440, 523.25, 659.25, 880],
    [110, 130.81, 164.81, 98],
    [220, 329.63, 261.63, 246.94]
  ];
  var PC_SEQ = ["$FCE2", "$FD02", "$FD15", "$FD18", "$E39B", "$E3A4", "$A000", "$A81B"];
  var PC_SID = ["$A81B", "$A836", "$A89E", "$E0B0", "$B7F2"];
  var SIDPAL = ["#4048a8", "#a98a3d", "#3d7a6a", "#8a3d5a"];

  var state = {};
  var idx = -1, pt = 0, cycleT = 0, paused = false;
  var dom = {};

  function resetState() {
    state = {
      time: 0, power: false, powerT: 0, bootT: 0,
      typed: 0, cursor: false, crtMode: "off",
      pc: "$FCE2", pcNum: 0xfce2, irq: 0, ta: 1, tb: 1, bus: 0,
      vicBorder: "#3c414c", vicBg: "#23272e", vicSig: "无信号",
      freeB: 0, dramSeated: 0, parts: 0,
      voices: [
        { f: 0, env: 0, wave: "PULSE" },
        { f: 0, env: 0, wave: "SAW" },
        { f: 0, env: 0, wave: "TRI" }
      ],
      vClock: [0, 0.11, 0.22], vIdx: [0, 0, 0], sidJam: false, press: 0
    };
  }

  function $(id) { return document.getElementById(id); }

  function cacheDom() {
    dom = { mode: $("st-mode"), ram: $("st-ram"), parts: $("st-parts"), pill: $("phase-text"), dot: $("phase-dot") };
  }

  var PHASE_SFX = { dram: "insert", custom: "insert", cpu: "insert", rom: "insert", conn: "insert", boot: "power", sid: "chime" };

  function enterPhase(i) {
    idx = i;
    pt = 0;
    var ph = phases[i];
    if (ph.id === "pcb") {
      C64B.Parts.begin(state.time);
      C64B.Labels.clearAnnounce();
    } else if (ph.id === "boot") {
      state.power = true;
      state.bootT = 0;
      state.crtMode = "boot";
      C64B.Parts.setPowerLed(true);
    } else if (ph.id === "sid") {
      state.sidJam = true;
      state.crtMode = "sid";
    }
    var pins = PINNED[ph.id];
    if (C64B.Audio && PHASE_SFX[ph.id]) C64B.Audio.play(PHASE_SFX[ph.id]);
    C64B.Labels.setPinned(pins ? pins() : []);
  }

  function restartCycle() {
    C64B.Parts.reset();
    C64B.Labels.clearAnnounce();
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
    C64B.orbitCtl.autoDrift = ph.drift;
    C64B.orbitCtl.flyTo(ph.cam);

    /* ---- 零件飞行 / 落座 ---- */
    C64B.Parts.update(state.time, state);
    state.parts = C64B.Parts.seatedCount;
    var ds = 0;
    C64B.Parts.list().forEach(function (p) { if (p.id.substr(0, 4) === "dram" && p.landed) ds++; });
    state.dramSeated = ds;

    /* ---- 上电 / 开机打字 ---- */
    if (state.power) {
      state.powerT = Math.min(1, state.powerT + dt / 1.2);
      if (state.crtMode === "boot") {
        state.bootT += dt;
        state.typed = Math.max(0, Math.min(81, Math.floor((state.bootT - 0.5) * 26)));
        state.cursor = Math.sin(state.time * 7) > -0.25;
        state.freeB = state.typed >= 75 ? 38911 : 0;
      }
      state.irq += dt * 50;  /* PAL jiffy:50 /S(CIA1 TOD 同为 50 Hz) */
      state.ta = 1 - ((state.time * 2.2) % 1);
      state.tb = 1 - ((state.time * 0.7) % 1);
      state.bus = 0.28 + 0.62 * Math.abs(Math.sin(state.time * 11.3)) * (0.7 + 0.3 * Math.sin(state.time * 3.1));
    } else {
      state.ta = 1;
      state.tb = 1;
      state.bus = 0;
    }

    /* ---- SID JAM 琶音 ---- */
    if (state.sidJam) {
      for (var vi = 0; vi < 3; vi++) {
        var vo = state.voices[vi];
        state.vClock[vi] += dt;
        if (state.vClock[vi] >= 0.34) {
          state.vClock[vi] -= 0.34;
          state.vIdx[vi] = (state.vIdx[vi] + 1) % ARP[vi].length;
          vo.f = ARP[vi][state.vIdx[vi]];
          vo.env = 1;
        }
        vo.env = Math.max(0.05, vo.env - dt * 2.6);
      }
    } else {
      state.voices.forEach(function (v2) {
        v2.env = Math.max(0, v2.env - dt * 3);
        if (v2.env <= 0) v2.f = 0;
      });
    }

    /* ---- VIC 读数 ---- */
    if (!state.power) {
      state.vicBorder = "#3c414c"; state.vicBg = "#23272e"; state.vicSig = "无信号";
    } else if (ph.id === "boot") {
      state.vicBorder = "#3a3f9e"; state.vicBg = "#4044c8"; state.vicSig = "BASIC V2";
    } else {
      state.vicBorder = SIDPAL[Math.floor(state.time / 0.5) % 4];
      state.vicBg = "#0f0f14"; state.vicSig = "SID 弹奏";
    }

    /* ---- PC 寄存器 ---- */
    if (!state.power) state.pc = "$FCE2";
    else if (state.crtMode === "boot") state.pc = PC_SEQ[Math.min(PC_SEQ.length - 1, Math.floor(state.bootT / 0.8))];
    else if (state.sidJam) state.pc = PC_SID[Math.floor(state.time / 0.35) % PC_SID.length];
    state.pcNum = parseInt(state.pc.substr(1), 16);

    /* ---- DOM 状态卡 / 阶段胶囊 ---- */
    dom.mode.textContent = MODES[ph.id] || "—";
    dom.mode.className = "mode" + (ph.id === "sid" ? " hot" : "");
    var ramTxt = "—";
    if (state.freeB) ramTxt = "38911 B 空闲";
    else if (state.power) ramTxt = "64K RAM";
    else if (state.dramSeated > 0) ramTxt = "4164 ×" + state.dramSeated;
    dom.ram.textContent = ramTxt;
    dom.parts.textContent = state.parts + " / " + C64B.Parts.total;
    dom.pill.textContent = ph.name;
    dom.dot.className = ph.dot;

    /* ---- 仪表盘 ---- */
    C64B.Dashboard.update(state);
  }

  C64B.Timeline = {
    init: function () {
      resetState();
      cacheDom();
    },
    start: function () {
      enterPhase(0);
    },
    restart: restartCycle,
    /* 跳转到指定阶段(调试 / 键盘 1-8) */
    seek: function (id) {
      var i = -1;
      for (var k = 0; k < phases.length; k++) if (phases[k].id === id) i = k;
      if (i < 0) return;
      C64B.Parts.reset();
      C64B.Labels.clearAnnounce();
      resetState();
      cycleT = PHASE_T[i];
      if (i >= 1 && i <= 5) C64B.Parts.seekAssembly(PHASE_T[i], state.time);
      if (i >= 6) {
        C64B.Parts.sealAll();
        state.power = true;
        state.powerT = 1;
        C64B.Parts.setPowerLed(true);
        if (i === 6) {
          state.crtMode = "boot";
          state.bootT = 0;
        } else {
          state.crtMode = "sid";
          state.sidJam = true;
          state.bootT = 99;
          state.typed = 81;
          state.freeB = 38911;
        }
      }
      enterPhase(i);
    },
    /* sid 阶段字母键触发音符(轮流分配到三个声道) */
    keyNote: function (freq) {
      if (!(phases[idx] && phases[idx].id === "sid")) return;
      if (C64B.Audio) C64B.Audio.play("note", freq, 0.4, "square");
      var v = state.press % 3;
      state.press++;
      state.voices[v].f = freq;
      state.voices[v].env = 1;
      state.vClock[v] = -0.5;   /* 按下的音符持续更久再回到自动琶音 */
    },
    update: update,
    togglePause: function () { paused = !paused; return paused; },
    get paused() { return paused; },
    get phaseId() { return phases[idx] ? phases[idx].id : ""; }
  };
})(window.C64B = window.C64B || {});
