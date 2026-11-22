/* 43 个真实位号零件建模 + 分阶段飞入/压入装配控制器
   布局单位 mm（板中心为原点），渲染时 /10 → 1 场景单位 = 1 cm
   布局依据公开的 UNO R3 资料：USB-B 左上、电源座左下、328P 居中、
   DIGITAL 排母沿上缘、POWER/ANALOG 沿下缘 */
(function (UNO3) {
  /* ============ 布局表（PCB 丝印与零件共用同一坐标） ============ */
  var L = {
    w: 68.6, h: 53.4,
    dip: { x: 1.7, z: -0.7 },                       // DIP-28 座中心
    strips: [                                        // 排母：x0 = 最左侧插孔 mm
      { n: 8,  x0: -11.0, z: -23.2, title: "DIGITAL",        labels: ["0", "1", "2", "3", "4", "5", "6", "7"] },
      { n: 10, x0: 10.2,  z: -23.2, title: "DIGITAL (PWM~)", labels: ["8", "9", "10", "11", "12", "13", "GND", "AREF", "SDA", "SCL"] },
      { n: 8,  x0: -19.0, z: 23.2,  title: "POWER",          labels: ["NC", "IOREF", "RESET", "3V3", "5V", "GND", "GND", "VIN"] },
      { n: 6,  x0: 6.0,   z: 23.2,  title: "ANALOG IN",      labels: ["A0", "A1", "A2", "A3", "A4", "A5"] }
    ],
    holes: [[31.9, -24.1], [31.9, 24.1], [-32.5, -24.1], [-32.5, 24.1]],
    pads: [],   // SMT 焊盘白框（按零件生成）
    zones: [    // SMT 回流焊高亮区（虚线矩形，mm）
      { x: -12.0, z: -13.0, w: 20.0, h: 19.5 },
      { x: -24.0, z: 12.0,  w: 18.0, h: 16.0 },
      { x: 11.0,  z: -1.0,  w: 16.0, h: 24.0 }
    ],
    texts: [
      { t: "UNO R3", x: -6, y: -14, s: 170, b: 1 },
      { t: "MADE FOR MAKERS", x: 2, y: 14.8, s: 50, b: 1 },
      { t: "REV3", x: 32, y: 16.0, s: 28, a: "right" },
      { t: "OPENHARD © 2026", x: 32, y: 18.5, s: 28, a: "right" },
      { t: "RESET", x: -6.0, y: -15.0, s: 26, b: 1, a: "center" },
      { t: "ICSP1", x: -12.2, y: -25.6, s: 24, a: "right" },
      { t: "ICSP", x: 10.7, y: 13.6, s: 24, a: "center" },
      { t: "F1", x: -31.0, y: -13.4, s: 24, a: "center" },
      { t: "PC1", x: -24.6, y: -11.8, s: 24, a: "center" },
      { t: "PC2", x: -20.6, y: -9.0, s: 24, a: "center" },
      { t: "RN1", x: -16.5, y: -4.3, s: 22, a: "center" },
      { t: "RN2", x: -11.0, y: 6.7, s: 22, a: "center" },
      { t: "Q1 · 16.000", x: -20.4, y: -14.4, s: 20, a: "center" },
      { t: "Q2", x: -6.0, y: 8.6, s: 22, a: "center" },
      { t: "ATmega328P-PU", x: 1.7, y: -6.9, s: 26, a: "center" },
      { t: "ON", x: -19.2, y: 21.6, s: 30, b: 1 },
      { t: "L", x: 21.9, y: -21.6, s: 30, b: 1, a: "right" },
      { t: "TX", x: -15.6, y: -1.4, s: 28, b: 1, a: "center" },
      { t: "RX", x: -13.0, y: -1.4, s: 28, b: 1, a: "center" },
      { t: "LMV358", x: -5.9, y: -9.6, s: 22, a: "center" },
      { t: "NCP1117", x: -20.4, y: 17.0, s: 22, a: "right" },
      { t: "LP2985", x: -15.4, y: 17.0, s: 22, a: "right" }
    ]
  };
  /* 排母标题与位号小字（丝印） */
  L.strips.forEach(function (st) {
    var top = st.z < 0;
    L.texts.push({ t: st.title, x: st.x0 + (st.n - 1) * 2.54 / 2, y: top ? st.z + 6.4 : st.z - 6.2, s: 30, b: 1, a: "center" });
    for (var i = 0; i < st.n; i++) {
      L.texts.push({ t: st.labels[i], x: st.x0 + i * 2.54, y: top ? st.z + 2.4 : st.z - 2.4, s: 20, a: "center" });
    }
  });
  UNO3.PCB_LAYOUT = L;

  /* ============ 零件建模 ============ */
  var list = [];
  var root = null;
  var seatedCount = 0;
  var flying = false, t0 = 0, flyIds = [];
  var zones = null;

  function ledMat(base, glow) {
    return new THREE.MeshStandardMaterial({
      color: base, roughness: 0.4,
      emissive: new THREE.Color(glow), emissiveIntensity: 0
    });
  }

  /* 0603 贴片阻容 */
  function make0603(isCap) {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.22, 0.075, 0.13), isCap ? M.capBody : M.resBody, 0, 0.045, 0, false));
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.05, 0.08, 0.13), M.silver, -0.085, 0.045, 0, false));
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.05, 0.08, 0.13), M.silver, 0.085, 0.045, 0, false));
    return g;
  }

  /* SOIC-8 运放 */
  function makeSOIC8() {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.5, 0.12, 0.35), M.chip, 0, 0.08, 0, false));
    [-0.19, -0.064, 0.064, 0.19].forEach(function (x) {
      g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.035, 0.02, 0.09), M.silver, x, 0.05, 0.21, false));
      g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.035, 0.02, 0.09), M.silver, x, 0.05, -0.21, false));
    });
    return g;
  }

  /* TQFP-32（16U2，顶面印字贴图） */
  function makeTQFP32() {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    var side = new THREE.MeshStandardMaterial({ color: 0x17191e, roughness: 0.4 });
    var top = new THREE.MeshStandardMaterial({ map: UNO3.Textures.tqfpTop(), roughness: 0.4 });
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.7, 0.14, 0.7),
      [side, side, top, side, side, side], 0, 0.09, 0, false));
    for (var i = 0; i < 8; i++) {
      var o = -0.245 + i * 0.07;
      g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.09, 0.016, 0.02), M.silver, 0.395, 0.05, o, false));
      g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.09, 0.016, 0.02), M.silver, -0.395, 0.05, o, false));
      g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.02, 0.016, 0.09), M.silver, o, 0.05, 0.395, false));
      g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.02, 0.016, 0.09), M.silver, o, 0.05, -0.395, false));
    }
    return g;
  }

  /* SOT-223（NCP1117-5.0 稳压） */
  function makeSOT223() {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.45, 0.11, 0.3), M.chip, 0, 0.075, 0, false));
    [-0.13, 0, 0.13].forEach(function (x) {
      g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.045, 0.02, 0.13), M.silver, x, 0.03, 0.2, false));
    });
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.3, 0.02, 0.16), M.silver, 0, 0.03, -0.21, false));
    return g;
  }

  /* SOT-23-5（LP2985-3.3） */
  function makeSOT23_5() {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.29, 0.09, 0.16), M.chip, 0, 0.065, 0, false));
    [-0.095, 0, 0.095].forEach(function (x) {
      g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.032, 0.016, 0.08), M.silver, x, 0.028, 0.11, false));
    });
    [-0.048, 0.048].forEach(function (x) {
      g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.032, 0.016, 0.08), M.silver, x, 0.028, -0.11, false));
    });
    return g;
  }

  /* 陶瓷谐振器（328P 时钟，米色 3-pad SMD） */
  function makeResonator() {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.32, 0.09, 0.16), M.capBody, 0, 0.05, 0, false));
    [-0.09, 0, 0.09].forEach(function (x) {
      g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.07, 0.02, 0.09), M.silver, x, 0.02, 0.1, false));
    });
    return g;
  }

  /* CAY16 贴片排阻阵列（0603 宽 ×2 长，8 端） */
  function makeCAY16() {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.16, 0.075, 0.32), M.resBody, 0, 0.045, 0, false));
    [-0.12, -0.04, 0.04, 0.12].forEach(function (z) {
      g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.06, 0.08, 0.05), M.silver, -0.09, 0.045, z, false));
      g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.06, 0.08, 0.05), M.silver, 0.09, 0.045, z, false));
    });
    return g;
  }

  /* SMB 二极管 M7（黑色本体 + 银色阴极端） */
  function makeSMB() {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.45, 0.14, 0.3), M.chip, 0, 0.08, 0, false));
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.06, 0.145, 0.3), M.silver, -0.21, 0.08, 0, false));
    return g;
  }

  /* 芯片 LED（SMD 风格圆顶，材质带自发光可点亮） */
  function makeLED(mat) {
    var g = new THREE.Group();
    g.add(UNO3.Scene3D.mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.14, 14), mat, 0, 0.07, 0, false));
    g.add(UNO3.Scene3D.mesh(
      new THREE.SphereGeometry(0.14, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat, 0, 0.14, 0, false));
    g.userData.ledMat = mat;
    return g;
  }

  /* 自恢复保险丝（黄色圆盘） */
  function makePolyfuse() {
    var g = new THREE.Group();
    g.add(UNO3.Scene3D.mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 20), UNO3.Scene3D.M.fuse, 0, 0.15, 0));
    return g;
  }

  /* DIP-28 IC 座（黑条 + 凹口 + 28 孔） */
  function makeDIPSocket() {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(3.6, 0.16, 0.84), M.plastic, 0, 0.08, 0));
    var notch = UNO3.Scene3D.mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 12), M.dark, -1.78, 0.08, 0);
    notch.rotation.x = Math.PI / 2;
    g.add(notch);
    g.add(UNO3.Scene3D.mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 10),
      new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.6 }), -1.5, 0.17, -0.25, false));
    for (var r = 0; r < 2; r++) {
      for (var i = 0; i < 14; i++) {
        g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.07, 0.02, 0.07), M.dark,
          -1.651 + i * 0.254, 0.17, r ? 0.381 : -0.381, false));
      }
    }
    return g;
  }

  /* ATmega328P-PU DIP-28（顶面印字贴图） */
  function makeDIP28() {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    var side = new THREE.MeshStandardMaterial({ color: 0x191b20, roughness: 0.42 });
    var top = new THREE.MeshStandardMaterial({ map: UNO3.Textures.chipTop(), roughness: 0.42 });
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(3.5, 0.34, 0.72),
      [side, side, top, side, side, side], 0, 0.47, 0));
    var notch = UNO3.Scene3D.mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.72, 12), M.dark, -1.76, 0.47, 0);
    notch.rotation.x = Math.PI / 2;
    g.add(notch);
    g.add(UNO3.Scene3D.mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 10),
      new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.6 }), -1.5, 0.645, -0.24, false));
    for (var r = 0; r < 2; r++) {
      for (var i = 0; i < 14; i++) {
        g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.05, 0.15, 0.06), M.silver,
          -1.651 + i * 0.254, 0.235, r ? 0.381 : -0.381, false));
      }
    }
    return g;
  }

  /* HC-49S 金属晶振（328P 左侧） */
  function makeCrystal() {
    var g = new THREE.Group();
    var cap = UNO3.Scene3D.mesh(new THREE.CapsuleGeometry(0.17, 0.76, 4, 14), UNO3.Scene3D.M.steel, 0, 0.17, 0);
    cap.rotation.z = Math.PI / 2;
    g.add(cap);
    [-0.28, 0.28].forEach(function (x) {
      g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.06, 0.1, 0.09), UNO3.Scene3D.M.silver, x, 0.05, 0, false));
    });
    return g;
  }

  /* 电解电容 47µF */
  function makeElectrolytic() {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    g.add(UNO3.Scene3D.mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.62, 18), M.sleeve, 0, 0.31, 0));
    g.add(UNO3.Scene3D.mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.02, 18), M.silver, 0, 0.625, 0, false));
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.3, 0.008, 0.05), M.dark, 0, 0.64, 0, false));
    return g;
  }

  /* 复位按钮（方块底座 + 金属帽） */
  function makeButton() {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.62, 0.22, 0.62), M.dark, 0, 0.11, 0));
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.44, 0.14, 0.44), M.silver, 0, 0.29, 0));
    return g;
  }

  /* USB-B 方口（银色金属壳，开口朝左） */
  function makeUSB() {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(2.1, 1.15, 1.25), M.steel, 0, 0.735, 0));
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.08, 0.95, 1.05), M.dark, -1.09, 0.735, 0, false));
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.55, 0.14, 0.5), M.ceramic, -0.55, 0.735, 0, false));
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(2.1, 0.05, 1.45), M.steel, 0, 0.17, 0, false));
    return g;
  }

  /* 电源桶形座（黑色圆柱突台，开口朝左） */
  function makeBarrel() {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(1.3, 1.0, 1.0), M.plastic, 0, 0.66, 0));
    var collar = UNO3.Scene3D.mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.35, 16), M.plastic, -0.55, 0.6, 0);
    collar.rotation.z = Math.PI / 2;
    g.add(collar);
    var bore = UNO3.Scene3D.mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.6, 14), M.dark, -0.35, 0.6, 0);
    bore.rotation.z = Math.PI / 2;
    g.add(bore);
    return g;
  }

  /* DC 插头（道具：power 阶段飞入插入，不计数） */
  function makePlug() {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    var nose = UNO3.Scene3D.mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.95, 14), M.silver, -0.475, 0, 0);
    nose.rotation.z = Math.PI / 2;
    g.add(nose);
    var body = UNO3.Scene3D.mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.5, 16), M.plastic, -1.15, 0, 0);
    body.rotation.z = Math.PI / 2;
    g.add(body);
    var relief = UNO3.Scene3D.mesh(new THREE.CylinderGeometry(0.42, 0.27, 1.1, 16), M.plastic, -1.95, 0, 0);
    relief.rotation.z = Math.PI / 2;
    g.add(relief);
    var tail = UNO3.Scene3D.mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.8, 10), M.dark, -2.85, 0, 0);
    tail.rotation.z = Math.PI / 2;
    g.add(tail);
    return g;
  }

  /* 黑色排母（n 位，2.54mm 间距） */
  function makeHeader(n) {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    var len = n * 0.254 + 0.06;
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(len, 0.85, 0.25), M.plastic, 0, 0.585, 0));
    for (var i = 0; i < n; i++) {
      g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.13, 0.02, 0.13), M.dark,
        (n - 1) * 0.254 / -2 + i * 0.254, 1.015, 0, false));
    }
    return g;
  }

  /* ICSP 2×3 排针（针朝上） */
  function makeICSP() {
    var M = UNO3.Scene3D.M, g = new THREE.Group();
    g.add(UNO3.Scene3D.mesh(new THREE.BoxGeometry(0.78, 0.22, 0.52), M.plastic, 0, 0.27, 0));
    [-0.254, 0, 0.254].forEach(function (x) {
      [0.127, -0.127].forEach(function (z) {
        g.add(UNO3.Scene3D.mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.3, 8), M.gold, x, 0.53, z, false));
      });
    });
    return g;
  }

  /* ============ 零件定义（stage: 1 smt / 2 tht / 3 dip / 4 conn） ============ */
  function build() {
    var defs = [];
    var boardTop = 0.16;

    function def(id, name, sub, stage, delay, mm, anchorY, buildFn, opts) {
      opts = opts || {};
      var g = buildFn();
      var x = mm[0] / 10, z = mm[1] / 10;
      g.position.set(x, boardTop, z);
      g.rotation.y = opts.yaw || 0;
      g.visible = false;
      g.userData.tagAnchor = new THREE.Vector3(0, anchorY, 0);
      root.add(g);
      defs.push({
        id: id, name: name, sub: sub, stage: stage, delay: delay,
        target: new THREE.Vector3(x, opts.y0 !== undefined ? opts.y0 : boardTop, z),
        anchorY: anchorY, mode: opts.mode || "smt",
        dur: opts.dur || 0.95, pressAmp: opts.press || 0,
        yaw: opts.yaw || 0, noCount: !!opts.noCount, group: g
      });
    }

    /* —— 板（第 0 阶段飞入平放） —— */
    def("pcb", "UNO R3 裸板", "68.6 × 53.4 MM · FR4", "board", 0, [0, 0], 0.5, function () {
      return UNO3.Scene3D.board;
    }, { mode: "board", dur: 1.7, noCount: true, y0: 0 });

    /* —— SMT：接口与电源 IC —— */
    def("ic2", "USB 桥接芯片", "IC2 · ATmega16U2 · TQFP-32", 1, 0.25, [-13.3, -9.2], 0.45, makeTQFP32);
    def("q2", "陶瓷谐振器 16 MHz", "Q2 · CSTCE16M0V53 · 3-PAD SMD", 1, 0.85, [-6.0, 6.5], 0.28, makeResonator);
    def("ncp", "5V 稳压器", "NCP1117-5.0 · SOT-223 · 1A", 1, 1.4, [-18.0, 17.0], 0.35, makeSOT223);
    def("lp", "3.3V 稳压器", "LP2985-3.3 · SOT-23-5 · 150mA", 1, 1.85, [-13.5, 17.0], 0.3, makeSOT23_5);
    def("lm", "运算放大器", "LMV358 · SOIC-8", 1, 2.3, [-5.9, -8.0], 0.32, makeSOIC8);

    /* —— SMT：状态灯 —— */
    def("led_on", "电源指示灯 ON", "POWER · GREEN", 1, 2.75, [-20.6, 21.6], 0.3,
      function () { return makeLED(ledMat(0x1d5a30, 0x39e07a)); });
    def("led_l", "板载灯 L", "D13 · ORANGE", 1, 2.95, [23.5, -21.6], 0.3,
      function () { return makeLED(ledMat(0x6e3c12, 0xff8a2a)); });
    def("led_tx", "串口灯 TX", "UART · YELLOW", 1, 3.15, [-15.6, -3.0], 0.3,
      function () { return makeLED(ledMat(0x6e5c12, 0xffd23f)); });
    def("led_rx", "串口灯 RX", "UART · YELLOW", 1, 3.35, [-13.0, -3.0], 0.3,
      function () { return makeLED(ledMat(0x6e5c12, 0xffd23f)); });

    /* —— SMT：16 颗贴片阻容 —— */
    var rcPos = [
      ["R1", 0, -31.8, -16.0], ["C1", 1, -28.6, -16.0], ["R2", 0, -10.0, -2.6], ["C2", 1, -25.6, -15.8],
      ["R3", 0, -22.0, 13.0], ["C3", 1, -25.5, 11.0], ["C4", 1, -16.0, 13.5], ["R4", 0, -20.5, 8.5],
      ["R5", 0, -15.5, 9.0], ["R6", 0, 6.5, -10.5], ["C9", 1, 11.5, -11.5], ["C10", 1, 6.5, 9.5],
      ["R7", 0, 12.0, 10.0], ["C11", 1, 16.5, 9.0], ["C12", 1, -19.5, 4.6], ["C13", 1, -24.5, 3.0]
    ];
    rcPos.forEach(function (r, i) {
      L.pads.push([r[2], r[3]]);
      L.texts.push({ t: r[0], x: r[2], y: r[3] + 2.3, s: 17, a: "center" });
      def("rc" + i, r[0].charAt(0) === "R" ? "贴片电阻 10 KΩ" : "贴片电容 100nF",
        r[0] + " · 0603", 1, 3.7 + i * 0.115, [r[2], r[3]], 0.22,
        function () { return make0603(r[1] === 1); });
    });

    /* —— SMT：自恢复保险丝 —— */
    def("f1", "自恢复保险丝 500mA", "F1 · RESETTABLE", 1, 5.6, [-31.0, -10.7], 0.42, makePolyfuse);

    /* —— THT：直插件（自上而下压入） —— */
    def("socket", "DIP-28 芯片座", "0.3 INCH · 28 PIN", 2, 0.25, [1.7, -0.7], 0.5, makeDIPSocket,
      { mode: "drop", dur: 1.0, press: 0.045 });
    def("c5", "电解电容 47µF", "PC1 · ELECTROLYTIC", 2, 0.9, [-24.6, -9.2], 0.55, makeElectrolytic,
      { mode: "drop", dur: 1.0, press: 0.045 });
    def("c6", "电解电容 47µF", "PC2 · ELECTROLYTIC", 2, 1.45, [-20.6, -6.4], 0.55, makeElectrolytic,
      { mode: "drop", dur: 1.0, press: 0.045 });
    def("rn1", "贴片排阻 10KΩ", "RN1 · CAY16 · SMD", 1, 3.1, [-16.5, -6.5], 0.3, makeCAY16);
    def("rn2", "贴片排阻 1KΩ", "RN2 · CAY16 · SMD", 1, 3.3, [-11.0, 4.5], 0.3, makeCAY16);
    def("d1", "二极管 M7", "D1 · SMB · REVERSE POLARITY", 1, 3.5, [-23.0, 16.0], 0.32, makeSMB);
    def("q1", "石英晶振 16 MHz", "Q1 · HC-49S · FOR 16U2", 2, 4.2, [-20.4, -11.8], 0.4, makeCrystal,
      { mode: "drop", dur: 1.0, press: 0.045 });
    def("sw1", "复位轻触开关", "SW1 · RESET", 2, 4.75, [-6.0, -18.4], 0.4, makeButton,
      { mode: "drop", dur: 1.0, press: 0.045 });

    /* —— DIP：主控芯片压入（轻微按压回弹） —— */
    def("ic1", "主控芯片", "IC1 · ATmega328P-PU · DIP-28", 3, 0.5, [1.7, -0.7], 0.75, makeDIP28,
      { mode: "drop", dur: 1.6, press: 0.09 });

    /* —— 连接器 —— */
    def("usb", "USB-B 接口", "USB 2.0 · FULL-SPEED", 4, 0.25, [-24.3, -20.5], 1.25, makeUSB,
      { mode: "side", dur: 1.05, press: 0.05 });
    def("dc", "DC 电源座", "7-12V DC IN · CENTER +", 4, 0.9, [-28.0, 21.15], 1.05, makeBarrel,
      { mode: "side", dur: 1.05, press: 0.05 });
    def("h_pw", "电源排母 8P", "NC IOREF RESET 3V3 5V GND VIN", 4, 1.55, [-10.11, 23.2], 1.05,
      function () { return makeHeader(8); }, { mode: "drop", dur: 1.05, press: 0.05 });
    def("h_d8", "数字排母 8P", "D0-D7 · RX TX PWM", 4, 2.1, [-2.11, -23.2], 1.05,
      function () { return makeHeader(8); }, { mode: "drop", dur: 1.05, press: 0.05 });
    def("h_d10", "数字排母 10P", "D8-D13 · SDA SCL", 4, 2.65, [21.63, -23.2], 1.05,
      function () { return makeHeader(10); }, { mode: "drop", dur: 1.05, press: 0.05 });
    def("h_an", "模拟排母 6P", "A0-A5 · ADC 10-BIT", 4, 3.2, [12.35, 23.2], 1.05,
      function () { return makeHeader(6); }, { mode: "drop", dur: 1.05, press: 0.05 });
    def("icsp2", "ICSP 排针 2×3", "ICSP1 · ATmega16U2", 4, 3.8, [-9.0, -25.6], 0.6, makeICSP,
      { mode: "drop", dur: 1.05, press: 0.04 });
    def("icsp1", "ICSP 排针 2×3", "ICSP · ATmega328P · SPI", 4, 4.3, [10.7, 11.5], 0.6, makeICSP,
      { mode: "drop", dur: 1.05, press: 0.04 });

    /* —— 道具：DC 插头（不计数） —— */
    def("plug", "DC 插头 9V", "5.5 × 2.1 MM · CENTER +", "plug", 0.25, [-29.5, 21.15], 0.9, makePlug,
      { mode: "plug", dur: 1.35, noCount: true, y0: 0.76, press: 0.03 });

    return defs;
  }

  /* ============ 飞行控制 ============ */
  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function bez(p0, p1, p2, t) {
    var a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
    return new THREE.Vector3(
      a * p0.x + b * p1.x + c * p2.x,
      a * p0.y + b * p1.y + c * p2.y,
      a * p0.z + b * p1.z + c * p2.z
    );
  }

  function init() {
    root = new THREE.Group();
    UNO3.Scene3D.scene.add(root);
    list = build();

    /* 每个零件的飞行起点 / 控制点（按 mode 计算） */
    list.forEach(function (p, i) {
      var t = p.target;
      if (p.mode === "board") {
        p.start = new THREE.Vector3(-13.8, 1.9, -2.2);
        p.mid = new THREE.Vector3(-6.5, 2.4, -1.1);
      } else if (p.mode === "smt") {
        p.start = new THREE.Vector3(-9.8 - (i % 4) * 0.55, 1.0 + (i % 5) * 0.32, -2.2 + ((i * 37) % 17) / 6);
        p.mid = new THREE.Vector3(
          p.start.x * 0.35 + t.x * 0.65, 2.2 + (i % 3) * 0.28, p.start.z * 0.4 + t.z * 0.6);
      } else if (p.mode === "drop") {
        var jx = (((i * 29) % 9) - 4) / 10 * 1.5, jz = (((i * 17) % 9) - 4) / 10 * 1.5;
        p.start = new THREE.Vector3(t.x + jx, 5.4 + (i % 3) * 0.55, t.z + jz);
        p.mid = new THREE.Vector3(t.x + jx * 0.3, 2.6, t.z + jz * 0.3);
      } else if (p.mode === "side") {
        p.start = new THREE.Vector3(t.x - 8.5, 2.3 + (i % 3) * 0.4, t.z + ((i % 2) ? 1.6 : -1.6));
        p.mid = new THREE.Vector3(t.x - 3.0, 1.7, t.z);
      } else {  // plug
        p.start = new THREE.Vector3(-9.5, 3.0, 9.0);
        p.mid = new THREE.Vector3(-20.0, 2.0, 16.0);
      }
    });

    /* SMT 回流焊区虚线高亮框 */
    zones = new THREE.Group();
    L.zones.forEach(function (z) {
      var pts = [
        new THREE.Vector3((z.x - z.w / 2) / 10, 0.18, (z.z - z.h / 2) / 10),
        new THREE.Vector3((z.x + z.w / 2) / 10, 0.18, (z.z - z.h / 2) / 10),
        new THREE.Vector3((z.x + z.w / 2) / 10, 0.18, (z.z + z.h / 2) / 10),
        new THREE.Vector3((z.x - z.w / 2) / 10, 0.18, (z.z + z.h / 2) / 10),
        new THREE.Vector3((z.x - z.w / 2) / 10, 0.18, (z.z - z.h / 2) / 10)
      ];
      var geo = new THREE.BufferGeometry().setFromPoints(pts);
      var line = new THREE.Line(geo, new THREE.LineDashedMaterial({
        color: 0x3fae6a, dashSize: 0.14, gapSize: 0.09, transparent: true, opacity: 0
      }));
      line.computeLineDistances();
      line.visible = false;
      zones.add(line);
    });
    UNO3.Scene3D.scene.add(zones);
  }

  /* 某阶段开始：该阶段零件依次飞入 */
  function begin(stage) {
    flying = true;
    t0 = 0;
    flyIds = [];
    list.forEach(function (p) {
      if (p.stage !== stage) return;
      p.sealed = false;
      p.landed = false;
      p.tagShown = false;
      p.pressT = -1;
      p.group.visible = false;
      p.group.position.copy(p.target);
      p.group.rotation.y = p.yaw + 1.2;
      flyIds.push(p);
      /* 虚线轨迹 */
      var pts = [];
      for (var i = 0; i <= 30; i++) pts.push(bez(p.start, p.mid, p.target, i / 30));
      var geo = new THREE.BufferGeometry().setFromPoints(pts);
      var col = stage === 1 ? 0x2fa7bc : 0xd67f33;
      var line = new THREE.Line(geo, new THREE.LineDashedMaterial({
        color: col, dashSize: 0.12, gapSize: 0.08, transparent: true, opacity: 0.75
      }));
      line.computeLineDistances();
      UNO3.Scene3D.scene.add(line);
      p.line = line;
      p.lineUntil = Infinity;
    });
    if (stage === 1) {
      zones.children.forEach(function (zl) { zl.visible = true; zl.material.opacity = 0.85; });
    }
  }

  function update(now) {
    if (!flying) return;
    flyIds.forEach(function (p) {
      if (p.sealed) return;
      var t = (now - t0 - p.delay) / p.dur;
      if (t <= 0) return;
      if (!p.tagShown) {
        p.tagShown = true;
        p.group.visible = true;
        UNO3.Labels.announce(p.id, p.group, p.name, p.sub, performance.now(), 2400);
      }
      var tt = easeInOut(Math.min(t, 1));
      p.group.position.copy(bez(p.start, p.mid, p.target, tt));
      p.group.rotation.y = p.yaw + (1 - tt) * 1.2;
      if (t >= 1 && !p.landed) {
        p.landed = true;
        if (!p.noCount) seatedCount++;
        p.pressT = 0;
        p.lineUntil = now + 0.5;
      }
      /* 压入回弹 */
      if (p.landed && p.pressAmp > 0 && p.pressT >= 0 && p.pressT < 0.25) {
        p.pressT += 1 / 60;
        var prog = Math.min(1, p.pressT / 0.25);
        p.group.position.y = p.target.y - p.pressAmp * Math.sin(Math.PI * prog);
        if (prog >= 1) { p.group.position.y = p.target.y; p.pressT = -1; }
      }
      if (p.line) {
        if (now > p.lineUntil) {
          UNO3.Scene3D.scene.remove(p.line);
          p.line.geometry.dispose();
          p.line.material.dispose();
          p.line = null;
        } else if (p.landed) {
          p.line.material.opacity = Math.max(0, (p.lineUntil - now) / 0.5) * 0.75;
        }
      }
    });
    /* 回流焊区高亮：4.5s 后淡出消失 */
    if (now > 4.5) {
      zones.children.forEach(function (zl) {
        if (!zl.visible) return;
        zl.material.opacity = Math.max(0, zl.material.opacity - 0.02);
        if (zl.material.opacity <= 0) zl.visible = false;
      });
    }
  }

  function reset() {
    flying = false;
    seatedCount = 0;
    flyIds = [];
    list.forEach(function (p) {
      p.sealed = false;
      p.landed = false;
      p.pressT = -1;
      p.group.visible = false;
      p.group.position.copy(p.target);
      p.group.rotation.y = p.yaw;
      if (p.line) {
        UNO3.Scene3D.scene.remove(p.line);
        p.line.geometry.dispose();
        p.line.material.dispose();
        p.line = null;
      }
    });
    zones.children.forEach(function (zl) { zl.visible = false; zl.material.opacity = 0; });
  }

  /* 调试/跳转用：第 k 阶段及之前的零件全部落位（k: 0 board 1 smt 2 tht 3 dip 4 conn 5 plug） */
  function sealUpTo(k) {
    var order = ["board", 1, 2, 3, 4, "plug"];
    flying = true;
    list.forEach(function (p) {
      var si = order.indexOf(p.stage);
      if (si < 0 || si > k) return;
      p.sealed = true;
      p.landed = true;
      p.tagShown = true;
      p.pressT = -1;
      p.group.visible = true;
      p.group.position.copy(p.target);
      p.group.rotation.y = p.yaw;
      if (p.line) {
        UNO3.Scene3D.scene.remove(p.line);
        p.line.geometry.dispose();
        p.line.material.dispose();
        p.line = null;
      }
    });
    seatedCount = list.filter(function (p) { return !p.noCount && p.sealed; }).length;
    zones.children.forEach(function (zl) { zl.visible = false; zl.material.opacity = 0; });
  }

  function groupById(id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].group;
    return null;
  }

  /* 点亮 LED：v 0..1（0 为熄灭） */
  function setLed(id, v) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id && list[i].group.userData.ledMat) {
        list[i].group.userData.ledMat.emissiveIntensity = v > 0 ? 0.25 + v * 2.2 : 0;
      }
    }
  }

  UNO3.Parts = {
    init: init,
    begin: begin,
    update: update,
    reset: reset,
    sealUpTo: sealUpTo,
    setLed: setLed,
    group: groupById,
    list: function () { return list; },
    get seatedCount() { return seatedCount; },
    get flying() { return flying; }
  };
})(window.UNO3 = window.UNO3 || {});
