/* 零件建模 + 飞行装配控制器(32 件)+ CRT 动态屏幕(开机打字机 / SID 可视化) */
(function (C64B) {
  var list = [];
  var root = null;
  var seatedCount = 0;
  var flying = false, t0 = 0;
  var M = null, mesh = null;
  var MAT_TOP = 0.092, PCB_TOP = 0.16;
  var tagSeq = 0;
  var ledMat = null;

  /* ---------- CRT 动态屏(512×384 Canvas) ---------- */
  var crtCv = document.createElement("canvas");
  crtCv.width = 512; crtCv.height = 384;
  var crtCtx = crtCv.getContext("2d");
  var crtTex = new THREE.CanvasTexture(crtCv);
  crtTex.anisotropy = 8;
  crtTex.encoding = THREE.sRGBEncoding;
  var crtScreenMat = new THREE.MeshStandardMaterial({
    map: crtTex, emissiveMap: crtTex, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.32
  });

  var BOOT_LINES = [
    "    **** COMMODORE 64 BASIC V2 ****",
    " 64K RAM SYSTEM  38911 BASIC BYTES FREE",
    "READY.",
    ""
  ];
  var SID_COLS = ["#a8a8e8", "#c9a24b", "#7fc0ae"];
  var SID_WAVES = ["PULSE", "SAW", "TRI"];

  function crtGlass(ctx, W, H, lineCol) {
    ctx.fillStyle = lineCol;
    for (var y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
    var vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.78);
    vg.addColorStop(0, "rgba(0,0,30,0)");
    vg.addColorStop(1, "rgba(0,0,30,0.35)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  function drawCrt(st) {
    var ctx = crtCtx, W = 512, H = 384;
    if (st.crtMode === "off") {
      ctx.fillStyle = "#0c0f0d";
      ctx.fillRect(0, 0, W, H);
      var g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "rgba(210,215,205,0.07)");
      g.addColorStop(0.5, "rgba(210,215,205,0.01)");
      g.addColorStop(1, "rgba(210,215,205,0.05)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    } else if (st.crtMode === "boot") {
      ctx.fillStyle = "#4044c8";
      ctx.fillRect(0, 0, W, H);
      ctx.font = "bold 20px Menlo, Consolas, monospace";
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      ctx.shadowColor = "rgba(178,178,240,0.9)";
      ctx.shadowBlur = 7;
      ctx.fillStyle = "#a8a8e8";
      var remain = st.typed, curR = 3, curC = 0;
      for (var r = 0; r < 3; r++) {
        var s = BOOT_LINES[r];
        var take = Math.min(s.length, Math.max(0, remain));
        if (take > 0) ctx.fillText(s.substr(0, take), 10, 66 + r * 46);
        remain -= take;
        if (remain <= 0 && take < s.length) { curR = r; curC = take; break; }
        if (remain <= 0) { curR = Math.min(3, r + 1); curC = 0; break; }
      }
      if (st.cursor) ctx.fillRect(10 + curC * 12, 66 + curR * 46 - 17, 11, 19);
      ctx.shadowBlur = 0;
      crtGlass(ctx, W, H, "rgba(20,20,70,0.10)");
    } else {
      ctx.fillStyle = "#0e0e14";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(168,168,232,0.12)";
      ctx.lineWidth = 1;
      for (var gy = 78; gy < 344; gy += 58) {
        ctx.beginPath(); ctx.moveTo(30, gy); ctx.lineTo(W - 30, gy); ctx.stroke();
      }
      ctx.font = "bold 17px Menlo, Consolas, monospace";
      ctx.fillStyle = "#a8a8e8";
      ctx.textAlign = "left";
      ctx.fillText("SID 6581 · 3 VOICE JAM", 30, 36);
      ctx.textAlign = "center";
      for (var v = 0; v < 3; v++) {
        var cx = 106 + v * 150;
        var bh = 26 + st.voices[v].env * 240;
        ctx.shadowColor = SID_COLS[v];
        ctx.shadowBlur = 16;
        ctx.fillStyle = SID_COLS[v];
        ctx.fillRect(cx - 30, 340 - bh, 60, bh);
        ctx.shadowBlur = 0;
        ctx.font = "bold 13px Menlo, Consolas, monospace";
        ctx.fillStyle = "rgba(232,230,223,0.85)";
        ctx.fillText("V" + (v + 1) + " " + SID_WAVES[v], cx, 362);
        ctx.fillStyle = SID_COLS[v];
        ctx.fillText(st.voices[v].f > 0 ? Math.round(st.voices[v].f) + " HZ" : "—", cx, 378);
      }
      ctx.textAlign = "left";
      crtGlass(ctx, W, H, "rgba(0,0,20,0.12)");
    }
    crtTex.needsUpdate = true;
    crtScreenMat.emissiveIntensity = st.crtMode === "off" ? 0 : 0.8;
  }

  /* ---------- 通用建模 ---------- */
  var topMats = {};
  function topMat(tex, key) {
    if (!topMats[key]) topMats[key] = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
    return topMats[key];
  }

  /* 板上小件单独打标(随裸板一起飞入,但可单独点击) */
  function setTag(obj, name, sub) {
    obj.userData.tag = { name: name, sub: sub || null };
    obj.userData.tagAnchor = new THREE.Vector3(0, 0.06, 0);
    obj.userData.tagId = "t" + (tagSeq++);
  }

  /* DIP 芯片:黑体 + 缺口 + 两侧引脚 + 顶面丝印 */
  function dip(len, wide, h, nPins, tex, texKey) {
    var g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(wide, h, len), M.chip, 0, h / 2, 0));
    g.add(mesh(new THREE.BoxGeometry(wide * 0.42, 0.016, 0.045), M.dark, 0, h + 0.006, len / 2 - 0.03));
    var half = nPins / 2;
    for (var i = 0; i < half; i++) {
      var z = -len / 2 + (i + 0.5) * (len / half);
      g.add(mesh(new THREE.BoxGeometry(0.028, 0.016, 0.032), M.silver, wide / 2 + 0.016, 0.008, z));
      g.add(mesh(new THREE.BoxGeometry(0.028, 0.016, 0.032), M.silver, -(wide / 2 + 0.016), 0.008, z));
    }
    if (tex) {
      var p = mesh(new THREE.PlaneGeometry(wide * 0.82, len * 0.84), topMat(tex, texKey), 0, h + 0.004, 0, false, false);
      p.rotation.x = -Math.PI / 2;
      g.add(p);
    }
    return g;
  }

  function chipTex(title, sub) { return C64B.Textures.chipTop(72, 256, title, sub); }

  /* ---------- 零件建模 ---------- */
  function buildPcb() {
    var g = new THREE.Group();
    var top = new THREE.MeshStandardMaterial({ map: C64B.Textures.c64Pcb(), roughness: 0.62, metalness: 0.05 });
    var base = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.064, 2.9),
      [M.c64side, M.c64side, top, M.c64back, M.c64side, M.c64side]);
    base.position.y = 0.032;
    base.castShadow = true;
    base.receiveShadow = true;
    g.add(base);
    // 安装孔
    [[-2.05, -1.28], [2.05, -1.28], [-2.05, 1.28], [2.05, 1.28]].forEach(function (hp) {
      var hh = mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.07, 12), M.dark, hp[0], 0.036, hp[1]);
      setTag(hh, "安装孔", "MOUNTING HOLE · M3 · CHASSIS");
      g.add(hh);
    });
    // Y1 晶振 17.734476 MHz(PAL 主时钟,经 U31 8701 ÷18 → 0.985 MHz 给 CPU)
    var xt = mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.14, 12), M.silver, -0.5, 0.034, -0.45);
    xt.rotation.z = Math.PI / 2;
    setTag(xt, "晶振 · 17.734476 MHZ", "XTAL · Y1 · MASTER CLOCK · PAL");
    g.add(xt);
    // 7805 三端稳压
    var reg = new THREE.Group();
    reg.position.set(-1.55, 0, 1.12);
    reg.add(mesh(new THREE.BoxGeometry(0.09, 0.11, 0.05), M.chip, 0, 0.055, 0));
    reg.add(mesh(new THREE.BoxGeometry(0.11, 0.07, 0.02), M.alu, 0, 0.09, -0.035));
    setTag(reg, "稳压器 · 7805", "VR · 9V AC → 5V DC");
    g.add(reg);
    // 电解电容 ×4(470µF ×2 + 100µF ×2,板级取值)
    [[-2.0, 0.9], [-1.8, 0.66], [-1.6, 0.92], [-1.8, 1.16]].forEach(function (cp, i) {
      var c = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.095, 12), i % 2 ? M.capA : M.capB, cp[0], 0.048, cp[1]);
      setTag(c, "电解电容", (i < 2 ? "ELECTROLYTIC CAP · 470 µF · 9V AC RAIL" : "ELECTROLYTIC CAP · 100 µF · 5V RAIL"));
      g.add(c);
    });
    // 电阻排 ×3
    [0.72, 0.58, 0.44].forEach(function (z) {
      var rr = mesh(new THREE.BoxGeometry(0.026, 0.022, 0.1), M.cream, 1.12, 0.011, z);
      setTag(rr, "电阻排", "RESISTOR ARRAY · SIP · PULL-UPS");
      g.add(rr);
    });
    // 电源 LED(boot 点亮)
    ledMat = new THREE.MeshStandardMaterial({ color: 0xb03024, emissive: 0xff5533, emissiveIntensity: 0, roughness: 0.4 });
    var led = mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.038, 10), ledMat, -1.72, 0.019, 1.3);
    setTag(led, "电源指示灯", "PWR LED · LIGHTS AT POWER ON");
    g.add(led);
    // AV DIN(视频/音频输出座)
    var av = new THREE.Group();
    av.position.set(1.3, 0, -1.18);
    av.add(mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.055, 18), M.silver, 0, 0.028, 0));
    av.add(mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.06, 18), M.dark, 0, 0.03, 0));
    setTag(av, "AV 视频音频座", "VIDEO/AUDIO DIN · VIC-II LUMA/CHROMA OUT");
    g.add(av);
    return g;
  }

  function buildShield() {
    // VIC-II 屏蔽罩(兼 RF 屏蔽):两半银色薄壳,落位时合拢
    var g = new THREE.Group();
    var l = mesh(new THREE.BoxGeometry(0.205, 0.125, 0.56), M.alu, -0.105, 0.142, 0);
    var r = mesh(new THREE.BoxGeometry(0.205, 0.125, 0.56), M.alu, 0.105, 0.142, 0);
    g.add(l); g.add(r);
    g.userData.halves = [l, r];
    return g;
  }

  function buildDb9() {
    var g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(0.3, 0.045, 0.15), M.plastic, 0, 0.022, 0));
    g.add(mesh(new THREE.BoxGeometry(0.24, 0.065, 0.105), M.silver, 0, 0.075, 0));
    g.add(mesh(new THREE.BoxGeometry(0.17, 0.028, 0.06), M.dark, 0, 0.115, 0));
    for (var i = 0; i < 5; i++) {
      g.add(mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.026, 6), M.gold, -0.056 + i * 0.028, 0.132, -0.014));
      if (i < 4) g.add(mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.026, 6), M.gold, -0.042 + i * 0.028, 0.132, 0.014));
    }
    g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.022, 10), M.silver, -0.185, 0.1, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.022, 10), M.silver, 0.185, 0.1, 0));
    return g;
  }

  function buildDin(r) {
    var g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(r, r * 1.06, 0.055, 18), M.silver, 0, 0.028, 0));
    g.add(mesh(new THREE.CylinderGeometry(r * 0.6, r * 0.6, 0.06, 18), M.dark, 0, 0.03, 0));
    g.add(mesh(new THREE.BoxGeometry(r * 0.36, 0.05, r * 0.3), M.dark, r * 0.62, 0.03, 0));
    return g;
  }

  function buildEdge(w, d) {
    var g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(w, 0.05, d), M.gold, 0, 0.025, 0));
    g.add(mesh(new THREE.BoxGeometry(Math.min(w * 0.6, 0.08), 0.016, Math.min(d * 0.2, 0.14)), M.dark, 0, 0.058, 0));
    return g;
  }

  function buildRf() {
    var g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(0.36, 0.16, 0.3), M.silver, 0, 0.08, 0));
    g.add(mesh(new THREE.BoxGeometry(0.3, 0.02, 0.24), M.dark, 0, 0.168, 0));
    var a1 = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 8), M.gold, -0.08, 0.09, -0.16);
    a1.rotation.x = Math.PI / 2;
    var a2 = a1.clone();
    a2.position.set(0.08, 0.09, -0.16);
    g.add(a1); g.add(a2);
    return g;
  }

  function buildCrt() {
    // 深灰壳 CRT 小电视,屏幕贴图由 drawCrt 每帧更新
    var g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(1.04, 0.72, 0.62), M.crtShell, 0, 0.36, 0));
    g.add(mesh(new THREE.BoxGeometry(0.76, 0.52, 0.32), M.crtShell, 0, 0.36, -0.4));
    // 前面板四条边框围出屏幕开口
    g.add(mesh(new THREE.BoxGeometry(1.04, 0.12, 0.05), M.crtDark, 0, 0.66, 0.325));
    g.add(mesh(new THREE.BoxGeometry(1.04, 0.12, 0.05), M.crtDark, 0, 0.08, 0.325));
    g.add(mesh(new THREE.BoxGeometry(0.16, 0.5, 0.05), M.crtDark, -0.44, 0.37, 0.325));
    g.add(mesh(new THREE.BoxGeometry(0.16, 0.5, 0.05), M.crtDark, 0.44, 0.37, 0.325));
    var scr = mesh(new THREE.PlaneGeometry(0.7, 0.45), crtScreenMat, 0, 0.37, 0.315, false, false);
    g.add(scr);
    var k1 = mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.03, 14), M.dark, 0.44, 0.52, 0.36);
    k1.rotation.x = Math.PI / 2;
    var k2 = k1.clone();
    k2.position.set(0.44, 0.42, 0.36);
    g.add(k1); g.add(k2);
    g.add(mesh(new THREE.BoxGeometry(0.18, 0.04, 0.14), M.crtDark, -0.36, 0.02, 0.12));
    g.add(mesh(new THREE.BoxGeometry(0.18, 0.04, 0.14), M.crtDark, 0.36, 0.02, 0.12));
    return g;
  }

  function buildCord() {
    // 电源线:7-pin DIN 插头 + 黑色线缆拖尾
    var g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(0.1, 0.09, 0.16), M.plastic, 0, 0.045, 0));
    g.add(mesh(new THREE.BoxGeometry(0.07, 0.03, 0.05), M.dark, 0, 0.02, -0.09));
    var pts = [];
    [[0, 0.07, 0.1], [0.14, 0.17, 0.55], [-0.2, 0.15, 1.05], [0.18, 0.13, 1.55], [-0.14, 0.1, 2.05]].forEach(function (p) {
      pts.push(new THREE.Vector3(p[0], p[1], p[2]));
    });
    var tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.024, 8, false), M.cable);
    tube.castShadow = true;
    g.add(tube);
    return g;
  }

  /* ---------- 零件定义表(delay = 装配绝对秒) ---------- */
  function def(id, name, sub, pos, yaw, anchorY, buildFn, delay, opts) {
    opts = opts || {};
    var g = buildFn();
    g.position.set(pos[0], opts.y || PCB_TOP, pos[1]);
    g.rotation.y = yaw || 0;
    g.userData.tag = { name: name, sub: sub || null };
    g.userData.tagAnchor = new THREE.Vector3(0, anchorY, 0);
    g.userData.tagId = id;
    root.add(g);
    list.push({
      id: id, name: name, sub: sub, group: g, yaw: yaw || 0,
      delay: delay, dur: opts.dur || 1.1, hold: opts.hold || 2200
    });
  }

  function build() {
    var dramTex = C64B.Textures.chipTop(56, 128, "4164", "64K×1");
    function buildDram() { return dip(0.26, 0.12, 0.052, 16, dramTex, "dram"); }

    def("pcb", "C64 主板", "COMMODORE 64 MAINBOARD · ASSY 250425 · 9V AC + 5V DC", [0, 0], 0, 0.3, buildPcb, 0.15, { dur: 1.6, hold: 2600, y: MAT_TOP });

    // 8× 4164:两列各 4 颗,弹夹节奏落板(位号按 250425:U9-U12 / U21-U24)
    var dxs = [-1.95, -1.55], dzs = [-0.86, -0.44, -0.02, 0.4];
    for (var di = 0; di < 8; di++) {
      var col = di % 2, row = Math.floor(di / 2);
      def("dram" + di, "4164 内存芯片", "MOS 4164 DRAM · 64K×1 · U" + (di < 4 ? 9 + di : 17 + di), [dxs[col], dzs[row]], 0, 0.12, buildDram, 4.3 + di * 0.42, { dur: 0.95, hold: 1100 });
    }

    def("vic", "VIC-II 视频芯片", "MOS 6569 · VIDEO · 320×200 · U19", [0.72, -0.72], 0, 0.16, function () { return dip(0.52, 0.16, 0.075, 40, chipTex("MOS 6569", "VIC-II · PAL"), "vic"); }, 10.3, {});
    def("u6sram", "2114 色彩 RAM", "COLOR SRAM · 1K×4 · U6 · VIC PALETTE", [0.42, -0.52], 0, 0.12, function () { return dip(0.22, 0.11, 0.05, 18, chipTex("2114", "COLOR RAM"), "u6"); }, 11.9, { dur: 1.0 });
    def("sid", "SID 声音芯片", "MOS 6581 · THE SOUND CHIP · 3 VOICE · U18", [-1.15, 0.85], 0, 0.17, function () { return dip(0.38, 0.16, 0.07, 28, chipTex("MOS 6581", "SID"), "sid"); }, 11.6, {});
    def("shield", "VIC-II 屏蔽罩", "SHIELD · TWO HALVES · SNAP OVER VIC-II", [0.72, -0.72], 0, 0.28, buildShield, 13.0, { dur: 1.2 });
    def("pla", "PLA 逻辑阵列", "MOS 906114 · COMBINATORIAL LOGIC · U17", [0.72, 0.02], 0, 0.15, function () { return dip(0.38, 0.16, 0.07, 28, chipTex("MOS 906114", "PLA"), "pla"); }, 14.4, {});

    def("clock8701", "8701 时钟芯片", "MOS 8701 · CLOCK GEN · DIP-16 · ÷18", [-0.28, -0.32], 0, 0.12, function () { return dip(0.2, 0.1, 0.055, 16, chipTex("8701", "CLOCK GEN"), "clk"); }, 16.7, { dur: 1.0 });
    def("cpu", "6510 处理器", "MOS 6510 CPU · 0.985 MHZ · DIP-40 · U7", [0.05, 0.02], 0, 0.17, function () { return dip(0.52, 0.16, 0.075, 40, chipTex("MOS 6510", "0.985 MHZ"), "cpu"); }, 17.3, {});
    def("cia1", "CIA1 接口芯片", "MOS 6526 · JOY1 + JOY2 + KEYBOARD · U15", [-0.12, 0.92], 0, 0.16, function () { return dip(0.52, 0.16, 0.075, 40, chipTex("MOS 6526", "CIA1"), "cia"); }, 18.6, {});
    def("cia2", "CIA2 接口芯片", "MOS 6526 · IEC + USER PORT · U16", [0.72, 0.92], 0, 0.16, function () { return dip(0.52, 0.16, 0.075, 40, chipTex("MOS 6526", "CIA2"), "cia"); }, 19.7, {});

    def("romBasic", "BASIC 固件 ROM", "2364 · 8K · $A000 · U3", [1.52, -0.62], 0, 0.15, function () { return dip(0.38, 0.17, 0.07, 28, chipTex("BASIC 8K", "2364"), "romB"); }, 23.3, { dur: 1.0 });
    def("romKernal", "KERNAL 固件 ROM", "2364 · 8K · $E000 · U4", [1.52, -0.08], 0, 0.15, function () { return dip(0.38, 0.17, 0.07, 28, chipTex("KERNAL 8K", "2364"), "romK"); }, 24.2, { dur: 1.0 });
    def("romChar", "字符库 ROM", "2332 · CHAR 4K · $D000 · U5", [1.52, 0.42], 0, 0.15, function () { return dip(0.34, 0.17, 0.07, 24, chipTex("CHAR 4K", "2332"), "romC"); }, 25.1, { dur: 1.0 });

    def("joy1", "摇杆接口 1", "JOYSTICK PORT · DB9 · CIA1", [0.2, 1.35], 0, 0.15, buildDb9, 28.3, { dur: 1.0 });
    def("joy2", "摇杆接口 2", "JOYSTICK PORT · DB9 · CIA1", [0.85, 1.35], 0, 0.15, buildDb9, 28.8, { dur: 1.0 });
    def("iec", "IEC 串行总线", "SERIAL BUS · DIN · CIA2 · DISK & PRINTER", [1.45, 1.35], 0, 0.14, function () { return buildDin(0.06); }, 29.3, { dur: 1.0 });
    def("powerDin", "电源输入", "POWER IN · 7-PIN DIN · 9V AC + 5V DC", [-1.95, 1.12], 0, 0.13, function () { return buildDin(0.055); }, 29.8, { dur: 1.0 });
    def("cassette", "磁带接口", "CASSETTE PORT · EDGE · DATA TAPE", [-1.05, 1.46], 0, 0.1, function () { return buildEdge(0.44, 0.13); }, 30.3, { dur: 1.0 });
    def("kbd", "键盘接口", "KEYBOARD · 20-PIN EDGE · KEYMATRIX", [-1.7, 1.46], 0, 0.1, function () { return buildEdge(0.6, 0.13); }, 30.55, { dur: 1.0 });
    def("userPort", "用户扩展口", "USER PORT · EDGE · 8-BIT GPIO · CIA2", [-0.35, 1.46], 0, 0.1, function () { return buildEdge(0.5, 0.13); }, 30.8, { dur: 1.0 });
    def("expansion", "扩展卡口", "EXPANSION · 44-PIN EDGE · CARTRIDGES", [2.2, -0.1], 0, 0.13, function () { return buildEdge(0.14, 1.2); }, 31.3, { dur: 1.0 });
    def("rf", "RF 调制器", "MODULATOR · UHF 36 · METAL BOX", [1.85, -1.02], 0, 0.2, buildRf, 31.8, { dur: 1.0 });
    def("crt", "CRT 电视机", "TELEVISION · VIDEO IN · 1702 STYLE", [-0.5, -2.42], 0.12, 0.62, buildCrt, 32.3, { dur: 1.3, y: MAT_TOP });

    def("cord", "电源线", "POWER CORD · DIN PLUG → PSU", [-1.95, 1.12], -0.64, 0.14, buildCord, 34.4, { dur: 1.2 });

    return list;
  }

  /* ---------- 飞行控制 ---------- */
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function bez(p0, p1, p2, t) {
    var a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
    return new THREE.Vector3(
      a * p0.x + b * p1.x + c * p2.x,
      a * p0.y + b * p1.y + c * p2.y,
      a * p0.z + b * p1.z + c * p2.z
    );
  }

  function killLine(p) {
    if (p.line) {
      C64B.Scene3D.scene.remove(p.line);
      p.line.geometry.dispose();
      p.line.material.dispose();
      p.line = null;
    }
  }

  function closeHalves(p) {
    var halves = p.group.userData.halves;
    if (halves) {
      halves[0].position.x = -0.105;
      halves[1].position.x = 0.105;
    }
  }

  function begin(now) {
    flying = true;
    seatedCount = 0;
    t0 = now;
    list.forEach(function (p) {
      p.landed = false;
      p.tagShown = false;
      p.group.visible = false;
      killLine(p);
      var pts = [];
      for (var k = 0; k <= 30; k++) pts.push(bez(p.start, p.mid, p.target, k / 30));
      var geo = new THREE.BufferGeometry().setFromPoints(pts);
      var line = new THREE.Line(geo, new THREE.LineDashedMaterial({
        color: 0xc9a24b, dashSize: 0.12, gapSize: 0.08, transparent: true, opacity: 0.75
      }));
      line.computeLineDistances();
      C64B.Scene3D.scene.add(line);
      p.line = line;
      p.lineUntil = Infinity;
    });
  }

  /* 跳转用:装配钟拨到 tAbs,已过期零件直接落位,目标阶段零件照常飞入 */
  function seekAssembly(tAbs, now) {
    flying = true;
    t0 = now - tAbs;
    seatedCount = 0;
    list.forEach(function (p) {
      killLine(p);
      if (p.delay + p.dur <= tAbs + 0.02) {
        p.landed = true;
        p.tagShown = true;
        p.group.visible = true;
        p.group.position.copy(p.target);
        p.group.rotation.y = p.yaw;
        closeHalves(p);
        seatedCount++;
      } else {
        p.landed = false;
        p.tagShown = false;
        p.group.visible = false;
      }
    });
  }

  function sealAll() {
    flying = true;
    seatedCount = list.length;
    list.forEach(function (p) {
      killLine(p);
      p.landed = true;
      p.tagShown = true;
      p.group.visible = true;
      p.group.position.copy(p.target);
      p.group.rotation.y = p.yaw;
      closeHalves(p);
    });
  }

  function update(now, st) {
    drawCrt(st);
    if (!flying) return;
    list.forEach(function (p) {
      var t = (now - t0 - p.delay) / p.dur;
      if (t <= 0) return;
      if (!p.tagShown) {
        p.tagShown = true;
        p.group.visible = true;
        C64B.Labels.announce(p.id, p.group, p.name, p.sub, performance.now(), p.hold || 2200);
      }
      var tt = easeInOut(Math.min(t, 1));
      p.group.position.copy(bez(p.start, p.mid, p.target, tt));
      p.group.rotation.y = p.yaw + (1 - tt) * 1.3;
      var halves = p.group.userData.halves;
      if (halves) {
        var off = (1 - tt) * 0.15;
        halves[0].position.x = -0.105 - off;
        halves[1].position.x = 0.105 + off;
      }
      if (t >= 1 && !p.landed) {
        p.landed = true;
        seatedCount++;
        if (C64B.Audio) C64B.Audio.play("land");
        p.lineUntil = now + 0.5;
      }
      if (p.line) {
        if (now > p.lineUntil) killLine(p);
        else if (p.landed) p.line.material.opacity = Math.max(0, (p.lineUntil - now) / 0.5) * 0.75;
      }
    });
  }

  function reset() {
    flying = false;
    seatedCount = 0;
    list.forEach(function (p) {
      p.group.visible = false;
      killLine(p);
    });
    setPowerLed(false);
  }

  function init() {
    M = C64B.Scene3D.M;
    mesh = C64B.Scene3D.mesh;
    root = new THREE.Group();
    C64B.Scene3D.scene.add(root);
    build();
    list.forEach(function (p, i) {
      p.target = p.group.position.clone();
      p.start = new THREE.Vector3(-7.8 - (i % 4) * 0.55, 0.55 + (i % 5) * 0.4, -1.4 + ((i * 37) % 17) / 9);
      p.mid = new THREE.Vector3(
        p.start.x + (p.target.x - p.start.x) * 0.42,
        1.8 + (i % 3) * 0.3,
        p.start.z + (p.target.z - p.start.z) * 0.55 - 0.25
      );
    });
  }

  function setPowerLed(on) {
    if (ledMat) ledMat.emissiveIntensity = on ? 0.9 : 0;
  }

  C64B.Parts = {
    init: init,
    begin: begin,
    seekAssembly: seekAssembly,
    sealAll: sealAll,
    update: update,
    reset: reset,
    group: function (id) {
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].group;
      return null;
    },
    list: function () { return list; },
    setPowerLed: setPowerLed,
    get seatedCount() { return seatedCount; },
    get total() { return list.length; }
  };
})(window.C64B = window.C64B || {});
