/* 时间线：主夹板 → 发条盒 → 轮系 → 擒纵 → 摆轮 → 自动锤 → 表盘 → 走时（44s 循环）
   机械同步：全轮系角度由擒转角 Φ 线性导出（×6/×5/×4/×3），摆轮/擒纵叉共用同一节拍时钟 */
(function (MOVT) {
  var PITCH_E = (Math.PI * 2) / 15;      // 擒纵轮齿距 24°
  var STEP = 0.25;                       // 每全振荡走一齿（4 Hz → 4 齿/秒）
  var OMEGA_E = PITCH_E / STEP;          // 平滑阶段等效角速度
  var TWO_PI = Math.PI * 2;
  var CLOCK0 = {
    h: (10 + 9.5 / 60) / 12 * TWO_PI,    // 10:09:30 经典广告位
    m: (9.5 / 60) * TWO_PI,
    s: (30 / 60) * TWO_PI
  };

  var PHASE_PARTS = {
    mainplate: [["plate", 0], ["ring", 0.55], ["jC", 1.30], ["j3", 1.55], ["j4", 1.80], ["jE", 2.05], ["jB", 2.30]],
    barrel: [["barrel", 0.3]],
    train: [["wheelC", 0], ["wheel3", 0.9], ["wheel4", 1.8], ["wheelE", 2.7]],
    escapement: [["pallet", 0.3]],
    balance: [["balance", 0.2], ["cock", 1.6]],
    rotor: [["rotor", 0.3]],
    dial: [["dial", 0], ["handH", 0.8], ["handM", 1.5], ["handS", 2.2], ["glass", 3.6]],
    run: []
  };

  var phases = [
    { id: "mainplate", name: "MAINPLATE · JEWELS", dur: 4.0, dot: "brass",
      cam: { theta: -0.55, phi: 1.02, r: 7.0, target: [0, 0.1, 0] }, drift: 0.05 },
    { id: "barrel", name: "BARREL · MAINSPRING", dur: 5.0, dot: "brass",
      cam: { theta: -1.15, phi: 0.86, r: 3.6, target: [-1.05, 0.3, 0.1] }, drift: 0.02 },
    { id: "train", name: "GOING TRAIN · ×1920", dur: 7.0, dot: "silver",
      cam: { theta: -0.30, phi: 0.95, r: 4.4, target: [0.6, 0.25, -0.4] }, drift: 0.025 },
    { id: "escapement", name: "LEVER ESCAPEMENT", dur: 6.0, dot: "wine",
      cam: { theta: -1.0, phi: 0.72, r: 2.8, target: [1.3, 0.45, -0.85] }, drift: 0.012 },
    { id: "balance", name: "BALANCE · 4 HZ", dur: 6.0, dot: "wine",
      cam: { theta: -0.45, phi: 0.62, r: 2.7, target: [0.45, 0.6, -1.25] }, drift: 0.012 },
    { id: "rotor", name: "ROTOR · WINDING", dur: 5.0, dot: "brass",
      cam: { theta: -1.8, phi: 0.50, r: 4.6, target: [0, 0.55, -0.2] }, drift: 0.02 },
    { id: "dial", name: "DIAL · HANDS · CRYSTAL", dur: 6.0, dot: "silver",
      cam: { theta: -0.65, phi: 0.70, r: 5.4, target: [0, 0.85, -0.1] }, drift: 0.015 },
    { id: "run", name: "RUNNING · 28,800 VPH", dur: 5.0, dot: "wine",
      cam: { theta: -0.9, phi: 0.88, r: 6.6, target: [0, 0.45, 0] }, drift: 0.42 }
  ];

  var PINNED = {
    mainplate: function () {
      return [
        { id: "p-plate", obj: MOVT.Parts.group("plate"), text: "CAL. 2892-A · Ø 25.6 MM" },
        { id: "p-ring", obj: MOVT.Parts.group("ring"), text: "HOLDER RING", tone: "white" }
      ];
    },
    barrel: function () {
      return [{ id: "p-barrel", obj: MOVT.Parts.group("barrel"), text: "MAINSPRING · 41 H" }];
    },
    train: function () {
      return [
        { id: "p-wc", obj: MOVT.Parts.group("wheelC"), text: "CENTER · 70 T" },
        { id: "p-w3", obj: MOVT.Parts.group("wheel3"), text: "THIRD · 56 T", tone: "white" },
        { id: "p-w4", obj: MOVT.Parts.group("wheel4"), text: "FOURTH · 96 T" },
        { id: "p-we", obj: MOVT.Parts.group("wheelE"), text: "ESCAPE · 15 T", tone: "white" }
      ];
    },
    escapement: function () {
      return [
        { id: "p-pal", obj: MOVT.Parts.group("pallet"), text: "PALLET FORK · ±10°" },
        { id: "p-lock", obj: MOVT.Parts.group("wheelE"), text: "LOCK ▸ IMPULSE ▸ DROP", tone: "white" }
      ];
    },
    balance: function () {
      return [
        { id: "p-bal", obj: MOVT.Parts.group("balance"), text: "BALANCE · ±270° · 4 HZ" },
        { id: "p-cock", obj: MOVT.Parts.group("cock"), text: "HAIRSPRING · BREATHING", tone: "white" }
      ];
    },
    rotor: function () {
      return [{ id: "p-rot", obj: MOVT.Parts.group("rotor"), text: "ROTOR · WINDS MAINSPRING" }];
    },
    dial: function () {
      return [
        { id: "p-dial", obj: MOVT.Parts.group("dial"), text: "DIAL · SKELETON" },
        { id: "p-glass", obj: MOVT.Parts.group("glass"), text: "CRYSTAL · DOMED", tone: "white" }
      ];
    },
    run: function () {
      return [
        { id: "p-4hz", obj: MOVT.Parts.group("balance"), text: "4 HZ · 28,800 VPH" },
        { id: "p-steps", obj: MOVT.Parts.group("wheelE"), text: "8 STEPS / S", tone: "white" }
      ];
    }
  };

  var state = {};
  var idx = -1, pt = 0, cycleT = 0, paused = false;
  var dom = {};

  function resetState() {
    state = {
      time: 0, beatT: 0, phi: 0, A: 0, stepping: false,
      ampDeg: 0, psi: 0, forkRel: 0, escapeAngle: 0,
      rotorT: 0, rotorAngle: 0, reserveH: 0, windA: 0, winding: false,
      runT: 0, mode: "ASSEMBLING", rateLive: null, temp: 23, active: false
    };
  }

  function $(id) { return document.getElementById(id); }

  function cacheDom() {
    dom = {
      mode: $("st-mode"), amp: $("st-amp"), res: $("st-res"), rate: $("st-rate"),
      pill: $("phase-text"), dot: $("phase-dot")
    };
  }

  function smooth(x) {
    x = Math.max(0, Math.min(1, x));
    return x * x * (3 - 2 * x);
  }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function enterPhase(i) {
    idx = i; pt = 0;
    var ph = phases[i];
    MOVT.Parts.flyPhase(PHASE_PARTS[ph.id] || []);
    if (ph.id === "escapement") { state.beatT = 0; }
    if (ph.id === "rotor") { state.rotorT = 0; }
    if (ph.id === "run") { state.runT = 0; state.mode = "RUNNING"; }
    var pins = PINNED[ph.id];
    MOVT.Labels.setPinned(pins ? pins() : []);
  }

  function restartCycle() {
    MOVT.Parts.reset();
    MOVT.Labels.clearAnnounce();
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
    var pid = ph.id;

    /* ---- 相机 ---- */
    MOVT.orbitCtl.autoDrift = ph.drift;
    MOVT.orbitCtl.flyTo(ph.cam);

    /* ---- 节拍时钟与擒转角 ---- */
    if (pid === "train") state.phi += dt * OMEGA_E;        // 轮系空转（擒纵未接管）
    if (idx >= 3) {
      state.beatT += dt;
      if (!state.stepping) { state.A = state.phi; state.stepping = true; }
    }
    if (state.stepping) {
      var b = state.beatT;
      state.phi = state.A +
        (Math.floor(b / STEP) + easeOutCubic(Math.min(1, (b % STEP) / 0.09))) * PITCH_E / 2;   // 每拍进半齿距(一齿两冲程)
    }
    state.escapeAngle = state.phi;

    /* ---- 摆轮振幅与 ψ、擒纵叉 ---- */
    if (pid === "balance") {
      state.ampDeg = 270 * smooth((pt - 1.7) / 2.6);
    } else if (idx > 4) {
      state.ampDeg = 270 + (pid === "run" ? Math.sin(state.time * 0.5) * 2.5 : 0);
    }
    var ampRad = state.ampDeg * Math.PI / 180;
    state.psi = ampRad * Math.sin(TWO_PI * 4 * state.beatT);
    state.forkRel = (10 * Math.PI / 180) * Math.tanh(3.5 * Math.sin(TWO_PI * 4 * state.beatT));
    state.active = state.ampDeg > 5;

    /* ---- 自动锤与动力储备 ---- */
    if (idx >= 5) state.rotorT += dt;
    var decay = state.rotorT < 4 ? 1 : Math.max(0.28, Math.exp(-(state.rotorT - 4) / 3));
    state.rotorAngle = 1.30 * Math.sin(state.rotorT * 2.1) * decay + 0.15 * Math.sin(state.rotorT * 5.3);

    state.winding = pid === "rotor";
    if (pid === "barrel" && pt > 2.0 && state.reserveH === 0) state.reserveH = 0.8;
    if (pid === "rotor") {
      state.reserveH = 0.8 + (41 - 0.8) * smooth((pt - 1.6) / 3.0) + Math.sin(state.time * 3.1) * 0.25;
    } else if (pid === "run") {
      state.reserveH = Math.max(0, 41 - state.runT * 0.004);
    }

    /* ---- 发条盘紧旋转 ---- */
    var spinRate = 0.08;
    if (pid === "barrel" && pt > 1.8) spinRate = 1.5;
    else if (state.winding) spinRate = 0.9;
    state.windA += dt * spinRate;

    /* ---- 走时：秒针每秒 8 小跳，分/时针极慢 ---- */
    if (pid === "run") state.runT += dt;
    var clockS = CLOCK0.s + Math.floor(state.runT * 8) / 8 * (TWO_PI / 60);
    var clockM = CLOCK0.m + state.runT * (TWO_PI / 3600);
    var clockH = CLOCK0.h + state.runT * (TWO_PI / 43200);

    /* ---- 读数 ---- */
    state.rateLive = pid === "run"
      ? 0.6 + Math.sin(state.time * 0.7) * 1.6 + Math.sin(state.time * 2.3) * 0.3
      : null;
    var tempTarget = pid === "run" ? 25 + Math.sin(state.time * 0.4) * 0.8 : 23;
    state.temp += (tempTarget - state.temp) * Math.min(1, dt * 0.6);

    /* ---- 机械角度下发 ---- */
    var mech = {
      wheelE: state.phi,
      wheel4: -state.phi / 16,
      wheel3: state.phi / 64,
      wheelC: -state.phi / 320,
      barrel: state.phi / 1920,
      pallet: state.forkRel,
      balance: state.psi,
      rotor: state.rotorAngle
    };
    if (state.runT > 0) {
      mech.handS = -(clockS - CLOCK0.s);
      mech.handM = -(clockM - CLOCK0.m);
      mech.handH = -(clockH - CLOCK0.h);
    }
    MOVT.Parts.setMech(mech);
    MOVT.Parts.setSpringSpin(state.windA);
    MOVT.Parts.setBreath(1 + 0.055 * Math.sin(state.psi + 0.6));

    /* ---- 零件飞行 ---- */
    MOVT.Parts.update(performance.now());
    state.seated = MOVT.Parts.seatedCount;

    /* ---- DOM 状态卡 / 阶段胶囊 ---- */
    dom.mode.textContent = state.mode;
    dom.mode.className = "mode" + (state.mode === "RUNNING" ? " running" : "");
    dom.amp.textContent = "±" + Math.round(state.ampDeg) + "° · 4 HZ";
    dom.res.textContent = state.reserveH.toFixed(1) + " H";
    dom.rate.textContent = state.rateLive === null
      ? "−2 / +4"
      : (state.rateLive >= 0 ? "+" : "") + state.rateLive.toFixed(1) + " S/D";
    var label = ph.name;
    if (pid !== "run" && state.seated > 0) label += " · " + state.seated + "/21";
    dom.pill.textContent = label;
    dom.dot.className = ph.dot;

    /* ---- 仪表盘 ---- */
    MOVT.Dashboard.update(state);
  }

  MOVT.Timeline = {
    init: function () {
      resetState();
      cacheDom();
    },
    start: function () {
      enterPhase(0);
    },
    restart: restartCycle,
    /* 跳转到指定阶段（调试 / 键盘 1-8） */
    seek: function (id) {
      var i = -1;
      for (var k = 0; k < phases.length; k++) if (phases[k].id === id) i = k;
      if (i < 0) return;
      MOVT.Parts.reset();
      MOVT.Labels.clearAnnounce();
      resetState();
      for (var s = 0; s < i; s++) {
        var ids = PHASE_PARTS[phases[s].id].map(function (e) { return e[0]; });
        MOVT.Parts.sealList(ids);
      }
      if (i >= 1) state.reserveH = 0.8;
      if (i >= 2) state.phi = 2;
      if (i >= 4) state.ampDeg = 270;
      if (i >= 5) { state.reserveH = 41; state.rotorT = 4.5; }
      if (i >= 6) state.windA = 2.2;
      if (i >= 7) { state.mode = "RUNNING"; state.runT = 0; }
      enterPhase(i);
    },
    update: update,
    togglePause: function () { paused = !paused; return paused; },
    get paused() { return paused; },
    get phaseId() { return phases[idx] ? phases[idx].id : ""; }
  };
})(window.MOVT = window.MOVT || {});
