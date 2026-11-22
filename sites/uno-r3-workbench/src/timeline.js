/* 时间线：bare → smt → tht → dip → conn → power → blink → serial（44s 自动循环） */
(function (UNO3) {
  var phases = [
    { id: "bare", name: "裸板 · UNO R3", dur: 4, dot: "teal",
      cam: { theta: -2.3, phi: 0.8, r: 12.5, target: [0, 0.25, 0] }, drift: 0.3 },
    { id: "smt", name: "贴片回流 · SMT", dur: 7, dot: "green",
      cam: { theta: -0.55, phi: 0.62, r: 8.8, target: [-0.4, 0.1, -0.3] }, drift: 0.05 },
    { id: "tht", name: "直插装贴 · THT", dur: 6, dot: "yellow",
      cam: { theta: -1.05, phi: 0.74, r: 7.6, target: [-0.6, 0.1, 0.35] }, drift: 0.04 },
    { id: "dip", name: "主控压装 · DIP-28", dur: 5, dot: "orange",
      cam: { theta: -0.3, phi: 0.58, r: 6.2, target: [0.15, 0.12, 0] }, drift: 0.015 },
    { id: "conn", name: "连接器 · USB / DC", dur: 6, dot: "blue",
      cam: { theta: -1.35, phi: 0.82, r: 8.4, target: [0.3, 0.1, 0.1] }, drift: 0.035 },
    { id: "power", name: "上电 · 9V", dur: 5, dot: "green",
      cam: { theta: -2.05, phi: 0.8, r: 7.4, target: [-1.7, 0.3, 1.1] }, drift: 0.02 },
    { id: "blink", name: "闪烁 · D13", dur: 6, dot: "orange",
      cam: null, camFn: blinkCam, drift: 0.012 },
    { id: "serial", name: "串口 · 9600", dur: 5, dot: "pink",
      cam: { theta: -0.85, phi: 0.86, r: 9.6, target: [0, 0.2, 0.15] }, drift: 0.03 }
  ];

  /* blink 阶段运镜：先推近 L 灯，再拉远 */
  function blinkCam(pt) {
    if (pt < 2.8) return { theta: -0.5, phi: 0.72, r: 3.0, target: [2.3, 0.32, -2.1] };
    return { theta: -0.9, phi: 0.8, r: 8.4, target: [1.0, 0.2, -0.8] };
  }

  var PINNED = {
    bare: function () {
      return [{ id: "p-pcb", obj: UNO3.Scene3D.board, text: "UNO R3 裸板", sub: "68.6 × 53.4 MM · FR4", tone: "teal" }];
    },
    smt: function () {
      return [
        { id: "p-ic2", obj: UNO3.Parts.group("ic2"), text: "USB 桥接芯片", sub: "IC2 · ATmega16U2" },
        { id: "p-ncp", obj: UNO3.Parts.group("ncp"), text: "5V 稳压器", sub: "NCP1117 · 9V → 5V", tone: "white" }
      ];
    },
    tht: function () {
      return [{ id: "p-q1", obj: UNO3.Parts.group("q1"), text: "石英晶振", sub: "Q1 · 16.000 MHZ" }];
    },
    dip: function () {
      return [{ id: "p-ic1", obj: UNO3.Parts.group("ic1"), text: "主控芯片", sub: "IC1 · ATmega328P-PU" }];
    },
    conn: function () {
      return [
        { id: "p-usb", obj: UNO3.Parts.group("usb"), text: "USB-B 接口", sub: "5V · USB 2.0" },
        { id: "p-dc", obj: UNO3.Parts.group("dc"), text: "DC 电源座", sub: "DC IN · 7-12V", tone: "white" }
      ];
    },
    power: function () {
      return [{ id: "p-on", obj: UNO3.Parts.group("led_on"), text: "上电指示灯", sub: "POWER GOOD · 5.0 V" }];
    },
    blink: function () {
      return [{ id: "p-l", obj: UNO3.Parts.group("led_l"), text: "板载 L 灯", sub: "D13 · BLINK 1 HZ" }];
    },
    serial: function () {
      return [{ id: "p-tx", obj: UNO3.Parts.group("led_tx"), text: "TX 指示灯", sub: "UART · 9600 8N1" }];
    }
  };

  var st = {};
  var idx = -1, pt = 0, cycleT = 0, paused = false;
  var dom = {};

  function resetState() {
    st = {
      time: 0, up: 0, seated: 0, mode: "BOARD",
      power: false, powerT: 0, vVin: 0, v5: 0, v33: 0, clkOn: false,
      d13: 0, blinkT: 0, tx: 0, rx: 0,
      serialOn: false, serialBytes: 0, lines: [], lineT: 0.2, lineCount: 0,
      flashB: 0, flashTarget: 0
    };
  }

  function $(id) { return document.getElementById(id); }

  function cacheDom() {
    dom = {
      mode: $("st-mode"), vcc: $("st-vcc"), clk: $("st-clk"), parts: $("st-parts"),
      pill: $("phase-text"), dot: $("phase-dot")
    };
  }

  /* 状态卡模式词：主位中文 + 英文副位（st.mode 保留英文代号供样式判断） */
  var MODE_ZH = {
    BOARD: "裸板 BOARD", REFLOW: "回流 REFLOW", THT: "直插 THT", PLACE: "压装 PLACE",
    CONN: "连接 CONN", POWER: "上电 POWER", BLINK: "闪烁 BLINK", SERIAL: "串口 SERIAL"
  };

  function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  function enterPhase(i) {
    idx = i;
    pt = 0;
    var ph = phases[i];
    if (ph.id === "bare") {
      UNO3.Parts.begin("board");
      UNO3.Labels.clearAnnounce();
      st.mode = "BOARD";
    } else if (ph.id === "smt") {
      UNO3.Parts.begin(1);
      st.mode = "REFLOW";
    } else if (ph.id === "tht") {
      UNO3.Parts.begin(2);
      st.mode = "THT";
    } else if (ph.id === "dip") {
      UNO3.Parts.begin(3);
      st.mode = "PLACE";
    } else if (ph.id === "conn") {
      UNO3.Parts.begin(4);
      st.mode = "CONN";
    } else if (ph.id === "power") {
      UNO3.Parts.begin("plug");
      st.mode = "POWER";
    } else if (ph.id === "blink") {
      st.mode = "BLINK";
      st.flashTarget = 924;
    } else if (ph.id === "serial") {
      st.mode = "SERIAL";
      st.serialOn = true;
    }
    var pins = PINNED[ph.id];
    UNO3.Labels.setPinned(pins ? pins() : []);
  }

  function powerOn() {
    st.power = true;
    UNO3.Parts.setLed("led_on", 1);
    UNO3.Labels.announce("pwr", UNO3.Parts.group("led_on"), "上电", "9V → 5V → 3.3V",
      performance.now(), 2400);
  }

  function restartCycle() {
    UNO3.Parts.reset();
    UNO3.Labels.clearAnnounce();
    resetState();
    cycleT = 0;
    enterPhase(0);
  }

  function update(dt) {
    if (paused) return;
    dt = Math.min(dt, 0.05);
    st.time += dt;
    cycleT += dt;
    pt += dt;

    var ph = phases[idx];
    if (pt >= ph.dur) {
      if (idx >= phases.length - 1) restartCycle();
      else enterPhase(idx + 1);
      ph = phases[idx];
    }

    /* ---- 相机 ---- */
    UNO3.orbitCtl.autoDrift = ph.drift;
    var cam = ph.camFn ? ph.camFn(pt) : ph.cam;
    UNO3.orbitCtl.flyTo(cam);

    /* ---- 零件装配 ---- */
    UNO3.Parts.update(pt);
    st.seated = UNO3.Parts.seatedCount;

    /* ---- 上电（power 阶段 pt>2.2 插头到位后） ---- */
    if (ph.id === "power" && !st.power && pt > 2.2) powerOn();
    if (st.power) {
      st.powerT = Math.min(1, st.powerT + dt / 1.6);
      st.up += dt;
    }
    var e = smooth(st.powerT);
    st.vVin = 9.0 * e;
    st.v5 = 5.0 * smooth(st.powerT * 1.4 - 0.1);
    st.v33 = 3.3 * smooth(st.powerT * 1.7 - 0.2);
    if (!st.clkOn && st.v5 > 4.7) st.clkOn = true;

    /* ---- Blink：1Hz 精确方波（blink/serial 阶段持续运行） ---- */
    if (st.power && st.clkOn && (ph.id === "blink" || ph.id === "serial")) {
      st.blinkT += dt;
      st.d13 = (st.blinkT % 1) < 0.5 ? 1 : 0;
    }
    UNO3.Parts.setLed("led_l", st.d13);

    /* ---- Serial：TX/RX 交替 + 字符流 ---- */
    if (st.serialOn) {
      var half = Math.floor(st.time * 4.5) % 2;
      st.tx = half;
      st.rx = 1 - half;
      st.lineT -= dt;
      if (st.lineT <= 0) {
        st.lineT = 0.5;
        st.lineCount++;
        st.lines.push("Hello from UNO R3!  #" + String(st.lineCount).padStart(3, "0"));
        if (st.lines.length > 40) st.lines.shift();
        st.serialBytes = st.lineCount * 26;
      }
    } else {
      st.tx = 0;
      st.rx = 0;
    }
    UNO3.Parts.setLed("led_tx", st.tx);
    UNO3.Parts.setLed("led_rx", st.rx);

    /* ---- Flash 上传进度 ---- */
    if (st.flashTarget > 0 && st.flashB < st.flashTarget) {
      st.flashB += (st.flashTarget - st.flashB) * Math.min(1, dt * 2.2);
      if (st.flashTarget - st.flashB < 4) st.flashB = st.flashTarget;
    }

    /* ---- 状态卡 ---- */
    dom.mode.textContent = MODE_ZH[st.mode] || st.mode;
    dom.mode.className = "mode" + (st.mode === "BLINK" || st.mode === "SERIAL" ? " hot" :
      (st.mode === "POWER" ? " live" : ""));
    dom.vcc.textContent = st.v5 > 0.05 ? st.v5.toFixed(2) + " V" : "—";
    dom.clk.textContent = st.clkOn ? "16.000 MHz" : "—";
    dom.parts.textContent = st.seated + " / 43";

    var label = ph.name;
    if (idx <= 4) label = ph.name + " · " + st.seated + " / 43";
    dom.pill.textContent = label;
    dom.dot.className = ph.dot;

    /* ---- 仪表盘 ---- */
    UNO3.Dashboard.update(st, dt);
  }

  UNO3.Timeline = {
    init: function () {
      resetState();
      cacheDom();
    },
    start: function () {
      enterPhase(0);
    },
    restart: restartCycle,
    /* 跳转到指定阶段（键盘 1-8 / 后台验收） */
    seek: function (id) {
      var i = -1;
      for (var k = 0; k < phases.length; k++) if (phases[k].id === id) i = k;
      if (i < 0) return;
      UNO3.Parts.reset();
      UNO3.Labels.clearAnnounce();
      resetState();
      UNO3.Parts.sealUpTo(Math.max(0, i - 1));
      if (i >= 6) {
        powerOn();
        st.powerT = 1;
        st.vVin = 9;
        st.v5 = 5;
        st.v33 = 3.3;
        st.clkOn = true;
        st.flashTarget = 924;
        st.flashB = 924;
        st.blinkT = 0;
      }
      if (i >= 7) {
        st.serialOn = true;
        for (var n = 1; n <= 3; n++) st.lines.push("Hello from UNO R3!  #" + String(n).padStart(3, "0"));
        st.lineCount = 3;
        st.serialBytes = 78;
        st.lineT = 0.5;
      }
      enterPhase(i);
    },
    update: update,
    togglePause: function () { paused = !paused; return paused; },
    get paused() { return paused; },
    get phaseId() { return phases[idx] ? phases[idx].id : ""; }
  };
})(window.UNO3 = window.UNO3 || {});
