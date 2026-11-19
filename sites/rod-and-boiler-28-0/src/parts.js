/* 31 个部件建模 + 装配飞行控制器:
   static 贝塞尔飞入 / screw 飞入+拧转 / roll 轮对滚入 / kine 连杆运动学部件
   (kine 构建器在 src/rods.js,返回 {group, anchor, kine} 由本文件 def() 注册)。
   所有部件挂在 train 根节点下,run 阶段随车整体前移。 */
(function (ST28) {
  var list = [];
  var byId = {};
  var kineList = [];
  var seatedCount = 0;
  var flying = false;
  var refs = {};           // 场景内动件:压力表指针 / 调节阀手轮 / 回动手柄

  var ROTX = Math.PI / 2, ROTZ = Math.PI / 2;

  function mesh(geo, mat, x, y, z, cast, receive) {
    var m = new THREE.Mesh(geo, mat);
    if (x !== undefined) m.position.set(x, y, z);
    m.castShadow = cast !== false;
    m.receiveShadow = receive !== false;
    return m;
  }
  function box(w, h, d, mat, x, y, z) { return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z); }
  function cyl(rt, rb, h, mat, x, y, z, seg) { return mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20), mat, x, y, z); }
  function torus(r, t, mat, x, y, z, seg) { return mesh(new THREE.TorusGeometry(r, t, 10, seg || 26), mat, x, y, z); }
  function sph(r, mat, x, y, z) { return mesh(new THREE.SphereGeometry(r, 16, 12), mat, x, y, z); }

  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function bez(p0, p1, p2, t) {
    var a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
    return new THREE.Vector3(
      a * p0[0] + b * p1[0] + c * p2[0],
      a * p0[1] + b * p1[1] + c * p2[1],
      a * p0[2] + b * p1[2] + c * p2[2]);
  }

  /* 辐式动轮:钢轮箍 + 酒红轮辋 + 12 辐条 + 轴心 */
  function spokedWheel(R, spokes) {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    g.add(torus(R - 0.035, 0.036, M.iron, 0, 0, 0, 36));
    g.add(torus(R - 0.115, 0.05, M.wine, 0, 0, 0, 36));
    var len = R - 0.20;
    for (var i = 0; i < spokes; i++) {
      var a = i / spokes * Math.PI * 2;
      var s = box(0.052, len, 0.05, M.wine, 0, 0, 0);
      s.position.set(Math.cos(a) * (0.10 + len / 2), Math.sin(a) * (0.10 + len / 2), 0);
      s.rotation.z = a - Math.PI / 2;
      g.add(s);
    }
    var hub = cyl(0.10, 0.10, 0.15, M.steelD, 0, 0, 0, 14);
    hub.rotation.x = ROTX;
    g.add(hub);
    return g;
  }

  /* 动轮对:双轮 + 轴 + 两侧曲拐臂/曲拐销(相位差在曲拐组上预置) */
  function buildDriverWS() {
    var M = ST28.Scene3D.M, D = ST28.GEAR.D;
    var g = new THREE.Group();
    var axle = cyl(0.05, 0.05, 1.34, M.steel, 0, D.yA, 0, 14);
    axle.rotation.x = ROTX;
    g.add(axle);
    var spins = [], cranks = [];
    [{ z: 0.66, phi: 0, cz: 0.72 }, { z: -0.66, phi: Math.PI / 2, cz: -0.72 }].forEach(function (s) {
      var w = spokedWheel(D.R, 12);
      w.position.set(0, D.yA, s.z);
      g.add(w); spins.push(w);
      var c = new THREE.Group();
      c.position.set(0, D.yA, s.cz);
      c.add(box(0.30, 0.095, 0.05, M.steelD, 0.12, 0, 0));
      var pin = cyl(0.034, 0.034, 0.17, M.steelD, D.r, 0, 0.06 * (s.cz > 0 ? 1 : -1), 12);
      pin.rotation.x = ROTX;
      c.add(pin);
      c.add(box(0.075, 0.075, 0.03, M.steelD, D.r, 0, 0.135 * (s.cz > 0 ? 1 : -1)));
      g.add(c); cranks.push({ g: c, phi: s.phi });
    });
    g.userData.anim = { spins: spins, cranks: cranks };
    return g;
  }

  /* 导轮对(小,无曲拐) */
  function buildPilotWS() {
    var M = ST28.Scene3D.M, D = ST28.GEAR.D;
    var g = new THREE.Group();
    var axle = cyl(0.04, 0.04, 1.30, M.steel, 0, 0.42, 0, 12);
    axle.rotation.x = ROTX;
    g.add(axle);
    var spins = [];
    [0.66, -0.66].forEach(function (z) {
      var w = spokedWheel(D.pilotR, 8);
      w.position.set(0, 0.42, z);
      g.add(w); spins.push(w);
    });
    g.userData.anim = { spins: spins, cranks: [] };
    return g;
  }

  function spinWS(entry, spin) {
    var a = entry.group.userData.anim;
    a.spins.forEach(function (w) { w.rotation.z = spin; });
    a.cranks.forEach(function (c) { c.g.rotation.z = spin + c.phi; });
  }

  /* ============ 各部件建模 ============ */

  function buildFrame() {
    var M = ST28.Scene3D.M, D = ST28.GEAR.D;
    var g = new THREE.Group();
    for (var s = -1; s <= 1; s += 2) {
      g.add(box(7.0, 0.16, 0.075, M.iron, -2.30, 0.90, s * 0.30));
      g.add(box(6.7, 0.05, 0.06, M.steelD, -2.30, 1.02, s * 0.30));
    }
    [-5.30, -3.40, -1.00, 1.10].forEach(function (x) {
      g.add(box(0.10, 0.14, 0.60, M.iron, x, 0.90, 0));
    });
    g.add(box(0.07, 0.42, 1.30, M.ironD, 1.18, 0.85, 0));
    return g;
  }

  function buildAxleBox() {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    [-4.90, -3.40, -2.10, -0.80, 0.50].forEach(function (x) {
      for (var s = -1; s <= 1; s += 2) {
        g.add(box(0.24, 0.30, 0.10, M.steelD, x, 0.78, s * 0.36));
        g.add(box(0.20, 0.08, 0.10, M.iron, x, 0.96, s * 0.36));
      }
    });
    return g;
  }

  function buildCyl() {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    var body = cyl(0.19, 0.19, 0.70, M.iron, 0, 0, 0, 26);
    body.rotation.z = ROTZ;
    g.add(body);
    g.add(box(0.60, 0.30, 0.24, M.iron, -0.03, 0.315, 0));   // 汽室
    g.add(box(0.60, 0.03, 0.26, M.brass, -0.03, 0.475, 0));
    for (var i = -1; i <= 1; i += 2) {
      var bar = cyl(0.024, 0.024, 0.86, M.steel, 0.54, i * 0.08, 0, 10);
      bar.rotation.z = ROTZ;
      g.add(bar);
      var ring = torus(0.205, 0.018, M.brass, i * 0.18, 0, 0);
      ring.rotation.y = ROTZ;
      g.add(ring);
    }
    g.add(box(0.06, 0.30, 0.06, M.iron, 0.90, 0.07, 0));     // 导杆支架
    return g;
  }

  function buildCaps() {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    var front = cyl(0.215, 0.215, 0.06, M.brass, -0.39, 0, 0, 24);
    front.rotation.z = ROTZ;
    g.add(front);
    var hub = cyl(0.06, 0.06, 0.06, M.brass, -0.43, 0, 0, 12);
    hub.rotation.z = ROTZ;
    g.add(hub);
    var rear = cyl(0.15, 0.15, 0.07, M.brass, 0.375, 0, 0, 20);
    rear.rotation.z = ROTZ;
    g.add(rear);
    var gland = torus(0.06, 0.02, M.steelD, 0.415, 0, 0);
    gland.rotation.y = ROTZ;
    g.add(gland);
    return g;
  }

  function buildBoiler() {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    var barrel = cyl(0.47, 0.47, 5.15, M.boiler, -3.125, 1.95, 0, 28);
    barrel.rotation.z = ROTZ;
    g.add(barrel);
    var smoke = cyl(0.485, 0.485, 1.85, M.iron, -4.775, 1.95, 0, 28);
    smoke.rotation.z = ROTZ;
    g.add(smoke);
    var door = cyl(0.40, 0.40, 0.06, M.ironD, -5.74, 1.95, 0, 24);
    door.rotation.z = ROTZ;
    g.add(door);
    var doorHub = cyl(0.10, 0.10, 0.07, M.steelD, -5.79, 1.95, 0, 14);
    doorHub.rotation.z = ROTZ;
    g.add(doorHub);
    var dring = torus(0.40, 0.03, M.iron, -5.715, 1.95, 0);
    dring.rotation.y = ROTZ;
    g.add(dring);
    [-3.60, -2.40, -1.20].forEach(function (x) {
      var band = torus(0.485, 0.02, M.brass, x, 1.95, 0);
      band.rotation.y = ROTZ;
      g.add(band);
    });
    var rail = cyl(0.018, 0.018, 4.4, M.brass, -3.10, 2.33, 0.50, 8);
    rail.rotation.z = ROTZ;
    g.add(rail);
    for (var s = -1; s <= 1; s += 2) {
      g.add(box(6.30, 0.035, 0.16, M.iron, -2.65, 1.12, s * 0.80));
      g.add(box(6.30, 0.12, 0.02, M.iron, -2.65, 1.04, s * 0.885));
    }
    g.userData.tagAnchor = new THREE.Vector3(-3.0, 2.55, 0.5);
    return g;
  }

  function buildFirebox() {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    g.add(box(1.15, 0.58, 0.92, M.ironD, -0.25, 1.76, 0));
    g.add(box(1.15, 0.08, 0.80, M.iron, -0.25, 1.45, 0));
    g.userData.tagAnchor = new THREE.Vector3(-0.25, 1.9, 0.5);
    return g;
  }

  function buildPilotBeam() {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    g.add(box(0.07, 0.62, 1.56, M.ironD, -5.885, 0.80, 0));
    g.add(box(0.16, 0.04, 1.56, M.iron, -5.85, 1.13, 0));
    var sh = new THREE.Shape();
    sh.moveTo(0, 0.98);
    sh.lineTo(-0.62, 0.16);
    sh.lineTo(0, 0.16);
    sh.lineTo(0, 0.98);
    var geo = new THREE.ExtrudeGeometry(sh, { depth: 1.30, bevelEnabled: false });
    geo.translate(0, 0, -0.65);
    g.add(mesh(geo, M.ironD, -5.90, 0, 0));
    [0.30, 0.45, 0.60, 0.75, 0.90].forEach(function (y) {
      g.add(box(0.06, 0.045, 1.32, M.iron, -5.90 - 0.62 * (0.98 - y) / 0.82, y, 0));
    });
    g.userData.tagAnchor = new THREE.Vector3(-5.9, 1.0, 0.8);
    return g;
  }

  function buildStack() {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    var base = torus(0.19, 0.03, M.ironD, 0, 0.03, 0);
    base.rotation.x = Math.PI / 2;
    g.add(base);
    g.add(cyl(0.13, 0.16, 0.52, M.ironD, 0, 0.30, 0, 20));
    var cap = torus(0.155, 0.025, M.iron, 0, 0.575, 0);
    cap.rotation.x = Math.PI / 2;
    g.add(cap);
    g.userData.tagAnchor = new THREE.Vector3(0, 0.65, 0);
    return g;
  }

  function buildDome() {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    g.add(cyl(0.30, 0.34, 0.10, M.brass, 0, 0.05, 0, 24));
    g.add(mesh(new THREE.SphereGeometry(0.28, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.brass, 0, 0.10, 0));
    g.add(cyl(0.05, 0.09, 0.09, M.brass, 0, 0.44, 0, 12));
    g.userData.tagAnchor = new THREE.Vector3(0, 0.5, 0);
    return g;
  }

  function buildSafety() {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    [-0.16, 0.16].forEach(function (x) {
      g.add(cyl(0.055, 0.065, 0.20, M.brass, x, 0.10, 0, 14));
      g.add(cyl(0.085, 0.085, 0.05, M.brass, x, 0.225, 0, 14));
      g.add(sph(0.045, M.brass, x, 0.275, 0));
    });
    g.userData.tagAnchor = new THREE.Vector3(0, 0.42, 0);
    return g;
  }

  function buildLampBell() {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    g.add(cyl(0.09, 0.11, 0.06, M.iron, -5.60, 2.46, 0, 14));
    g.add(box(0.20, 0.24, 0.20, M.ironD, -5.60, 2.61, 0));
    var lens = mesh(new THREE.CircleGeometry(0.075, 18), M.lamp, -5.705, 2.61, 0, false);
    lens.rotation.y = -Math.PI / 2;
    g.add(lens);
    var rim = torus(0.08, 0.015, M.brass, -5.70, 2.61, 0);
    rim.rotation.y = Math.PI / 2;
    g.add(rim);
    g.add(box(0.24, 0.03, 0.24, M.iron, -5.60, 2.745, 0));
    [-0.07, 0.07].forEach(function (dx) {
      g.add(box(0.03, 0.16, 0.03, M.brass, -3.10 + dx, 2.50, 0));
    });
    g.add(box(0.20, 0.03, 0.03, M.brass, -3.10, 2.585, 0));
    var bell = mesh(new THREE.SphereGeometry(0.11, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), M.brass, -3.10, 2.44, 0);
    bell.scale.y = 1.15;
    g.add(bell);
    g.userData.tagAnchor = new THREE.Vector3(-5.6, 2.75, 0);
    return g;
  }

  function cabSheetShape() {
    var s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(1.50, 0);
    s.lineTo(1.50, 1.30);
    s.lineTo(1.28, 1.35);
    s.lineTo(0.22, 1.35);
    s.lineTo(0, 1.26);
    s.lineTo(0, 0);
    var w1 = new THREE.Path();
    w1.moveTo(0.16, 0.55); w1.lineTo(0.52, 0.55); w1.lineTo(0.52, 1.02); w1.lineTo(0.16, 1.02); w1.lineTo(0.16, 0.55);
    s.holes.push(w1);
    var w2 = new THREE.Path();
    w2.moveTo(0.64, 0.55); w2.lineTo(1.00, 0.55); w2.lineTo(1.00, 1.02); w2.lineTo(0.64, 1.02); w2.lineTo(0.64, 0.55);
    s.holes.push(w2);
    return s;
  }

  function buildCabSides() {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    var geo = new THREE.ExtrudeGeometry(cabSheetShape(), { depth: 0.045, bevelEnabled: false });
    var a = mesh(geo, M.wine, 0.45, 1.12, 0.685);
    g.add(a);
    var b = mesh(geo, M.wine, 1.95, 1.12, -0.73);
    b.rotation.y = Math.PI;
    g.add(b);
    var plateTex = ST28.Textures.numPlate();
    var pm = new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.5 });
    var p1 = mesh(new THREE.PlaneGeometry(0.34, 0.22), pm, 0.95, 1.38, 0.736, false);
    g.add(p1);
    var p2 = mesh(new THREE.PlaneGeometry(0.34, 0.22), pm, 0.95, 1.38, -0.781, false);
    p2.rotation.y = Math.PI;
    g.add(p2);
    g.add(box(0.05, 1.35, 1.36, M.wine, 0.45, 1.795, 0));
    g.add(box(0.05, 1.35, 1.36, M.wine, 1.95, 1.795, 0));
    [-0.32, 0.32].forEach(function (z) {
      var w1 = cyl(0.13, 0.13, 0.06, M.cabWin, 0.45, 2.02, z, 20);
      w1.rotation.z = ROTZ;
      g.add(w1);
      var w2 = cyl(0.13, 0.13, 0.06, M.cabWin, 1.95, 2.02, z, 20);
      w2.rotation.z = ROTZ;
      g.add(w2);
    });
    g.add(box(1.50, 0.04, 1.32, M.ironD, 1.20, 1.10, 0));
    g.userData.tagAnchor = new THREE.Vector3(1.2, 2.3, 0.75);
    return g;
  }

  function buildCabRoof() {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    var sh = new THREE.Shape();
    sh.moveTo(-0.78, 0);
    sh.quadraticCurveTo(0, 0.40, 0.78, 0);
    sh.lineTo(0.78, -0.07);
    sh.quadraticCurveTo(0, 0.33, -0.78, -0.07);
    sh.lineTo(-0.78, 0);
    var geo = new THREE.ExtrudeGeometry(sh, { depth: 1.58, bevelEnabled: false });
    geo.translate(0, 0, -0.79);
    var roof = mesh(geo, M.ironD, 1.21, 2.47, 0);
    roof.rotation.y = Math.PI / 2;      // 拉伸方向转为机车纵向,拱形横跨驾驶室(x 0.42..2.00)
    g.add(roof);
    g.userData.tagAnchor = new THREE.Vector3(1.2, 2.75, 0);
    return g;
  }

  function buildContstand() {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    g.add(box(0.34, 0.55, 0.30, M.ironD, 0.95, 1.40, 0.18));
    g.add(box(0.38, 0.03, 0.34, M.brass, 0.95, 1.69, 0.18));
    g.add(cyl(0.035, 0.045, 0.34, M.brass, 0.80, 1.84, 0.18, 12));
    var hw = new THREE.Group();
    hw.position.set(0.80, 1.99, 0.18);
    var wheel = torus(0.11, 0.016, M.brass, 0, 0, 0);
    wheel.rotation.x = Math.PI / 2;
    hw.add(wheel);
    for (var i = 0; i < 4; i++) {
      var sp = box(0.02, 0.11, 0.02, M.brass, 0, 0, 0);
      sp.rotation.y = i * Math.PI / 2;
      sp.position.set(Math.sin(i * Math.PI / 2) * 0.05, 0, Math.cos(i * Math.PI / 2) * 0.05);
      hw.add(sp);
    }
    hw.add(sph(0.03, M.steelD, 0, 0.01, 0));
    g.add(hw);
    var quad = torus(0.13, 0.016, M.steelD, 1.10, 1.45, 0.18, 16);
    g.add(quad);
    var lever = new THREE.Group();
    lever.position.set(1.10, 1.45, 0.18);
    lever.add(box(0.03, 0.30, 0.03, M.steelD, 0, 0.13, 0));
    lever.add(sph(0.035, M.wine, 0, 0.29, 0));
    g.add(lever);
    var bh = cyl(0.40, 0.40, 0.08, M.boiler, 0.38, 1.85, 0, 20);
    bh.rotation.z = ROTZ;
    g.add(bh);
    [-0.12, 0.12].forEach(function (z) {
      var v = cyl(0.03, 0.03, 0.10, M.brass, 0.43, 1.95, z, 10);
      v.rotation.z = ROTZ;
      g.add(v);
    });
    g.add(box(0.03, 0.18, 0.03, M.cabWin, 0.43, 1.88, -0.22));
    g.userData.tagAnchor = new THREE.Vector3(0.8, 2.05, 0.2);
    refs.handwheel = hw;
    refs.lever = lever;
    return g;
  }

  /* 场景内实体压力表(指针与锅炉压力实时同步) */
  function buildGag3d() {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    g.add(box(0.05, 0.30, 0.05, M.ironD, 0.475, 2.02, 0.40));
    var unit = new THREE.Group();
    unit.position.set(0.52, 2.02, 0.40);
    unit.rotation.y = Math.PI / 2 - 0.55;
    unit.add(torus(0.145, 0.022, M.brass, 0, 0, 0, 28));
    var face = mesh(new THREE.CircleGeometry(0.135, 28),
      new THREE.MeshStandardMaterial({ map: ST28.Textures.gaugeFace(), roughness: 0.5 }), 0, 0, 0.004, false);
    unit.add(face);
    var needle = new THREE.Group();
    needle.position.set(0, 0, 0.02);
    needle.add(box(0.115, 0.016, 0.006, M.wine, 0.05, 0, 0));
    var hub = cyl(0.02, 0.02, 0.025, M.brass, 0, 0, 0.004, 10);
    hub.rotation.x = ROTX;
    needle.add(hub);
    unit.add(needle);
    g.add(unit);
    g.userData.tagAnchor = new THREE.Vector3(0.5, 2.05, 0.42);
    refs.needle = needle;
    return g;
  }

  function buildTender() {
    var M = ST28.Scene3D.M;
    var g = new THREE.Group();
    g.add(box(2.15, 0.10, 1.30, M.ironD, 3.275, 1.10, 0));
    g.add(box(2.15, 0.85, 1.32, M.ironD, 3.275, 1.58, 0));
    for (var s = -1; s <= 1; s += 2) {
      g.add(box(2.15, 0.62, 0.02, M.wine, 3.275, 1.58, s * 0.665));
      var letter = mesh(new THREE.PlaneGeometry(1.7, 0.42),
        new THREE.MeshStandardMaterial({ map: ST28.Textures.tenderSide(), roughness: 0.55 }), 3.275, 1.60, s * 0.678, false);
      if (s < 0) letter.rotation.y = Math.PI;
      g.add(letter);
    }
    var coalTop = mesh(new THREE.PlaneGeometry(1.95, 1.10), M.coal, 3.275, 2.015, 0, false);
    coalTop.rotation.x = -Math.PI / 2;
    g.add(coalTop);
    for (var i = 0; i < 8; i++) {
      g.add(sph(0.08 + (i % 3) * 0.025, M.dark, 2.55 + (i % 4) * 0.44, 2.03 + (i % 2) * 0.04, ((i % 3) - 1) * 0.3));
    }
    g.add(box(0.06, 0.40, 1.30, M.ironD, 4.38, 0.85, 0));
    g.add(box(0.30, 0.05, 0.05, M.ironD, 2.02, 0.88, 0));
    var spins = [];
    [2.75, 3.80].forEach(function (ax) {
      var w = new THREE.Group();
      w.position.set(ax, 0.46, 0);
      var axle = cyl(0.04, 0.04, 1.24, M.steel, 0, 0, 0, 12);
      axle.rotation.x = ROTX;
      w.add(axle);
      [-0.62, 0.62].forEach(function (z) {
        var tire = torus(0.27, 0.035, M.ironD, 0, 0, z, 22);
        w.add(tire);
        var disc = cyl(0.20, 0.20, 0.06, M.wine, 0, 0, z, 18);
        disc.rotation.x = ROTX;
        w.add(disc);
        var hub = cyl(0.06, 0.06, 0.09, M.steelD, 0, 0, z, 10);
        hub.rotation.x = ROTX;
        w.add(hub);
      });
      g.add(w);
      spins.push(w);
    });
    g.userData.anim = { spins: spins };
    g.userData.tagAnchor = new THREE.Vector3(3.3, 2.1, 0.7);
    kineList.push(function (S, state) {
      spins.forEach(function (w) { w.rotation.z = state.thetaTravel * ST28.GEAR.D.R / 0.30; });
    });
    return g;
  }

  /* ============ 部件注册 ============ */
  function def(o) {
    var built = o.build();
    var g = built.group || built;      // 兼容返回裸 Group 或 {group,anchor,kine}
    g.visible = false;
    g.userData.partId = o.id;
    if (!built.anchor && o.anchor) g.userData.tagAnchor = new THREE.Vector3(o.anchor[0], o.anchor[1], o.anchor[2]);
    ST28.Scene3D.train.add(g);
    var p = {
      id: o.id, name: o.name, sub: o.sub || null, phase: o.phase,
      at: o.at, dur: o.dur || 1.1, kind: o.kind || "static",
      group: g, anchor: built.anchor || null,
      target: o.target || [0, 0, 0],
      start: o.start || null, mid: o.mid || null,
      off: o.off || [0, 0, 0], offSign: o.offSign || 1,
      dist: o.dist || 0, wheelR: o.wheelR || 1,
      sealed: false, shown: false, line: null
    };
    if (built.kine) kineList.push(built.kine);
    list.push(p);
    byId[o.id] = p;
    return p;
  }

  function build() {
    var D = ST28.GEAR.D;
    var roll = { dist: D.R * Math.PI * 2 };

    /* —— 阶段 1:车架 + 五组轮对滚入 + 轴箱 —— */
    def({ id: "frame", name: "FRAME · PLATE SILL", sub: "MAIN FRAMES + BULKHEADS", phase: 0, at: 0.15, dur: 1.3,
      build: buildFrame, target: [0, 0, 0], start: [-6.5, 4.6, -2.5], mid: [-3.5, 3.4, 0.4], anchor: [-2.0, 1.0, 0.4] });
    def({ id: "pilotws", name: "PILOT WHEELSET", sub: "LEADING AXLE · 2 WHEELS", phase: 0, at: 1.50, dur: 0.75, kind: "roll",
      build: buildPilotWS, target: [D.pilotX, 0, 0], dist: D.pilotR * Math.PI * 2, wheelR: D.pilotR, anchor: [0, 0.55, 0.75] });
    def({ id: "drv1", name: "DRIVER WHEELSET · NO.1", sub: "R 0.62 · CRANK 0.24", phase: 0, at: 2.20, dur: 0.75, kind: "roll",
      build: buildDriverWS, target: [D.fdX, 0, 0], dist: roll.dist, wheelR: D.R, anchor: [0, 1.5, 0.75] });
    def({ id: "drv2", name: "DRIVER WHEELSET · NO.2", sub: "COUPLED · QUARTERED", phase: 0, at: 2.90, dur: 0.75, kind: "roll",
      build: buildDriverWS, target: [D.fdX + D.spacing, 0, 0], dist: roll.dist, wheelR: D.R, anchor: [0, 1.5, 0.75] });
    def({ id: "drv3", name: "DRIVER WHEELSET · NO.3", sub: "MAIN DRIVER · RODS LAND HERE", phase: 0, at: 3.60, dur: 0.75, kind: "roll",
      build: buildDriverWS, target: [D.fdX + D.spacing * 2, 0, 0], dist: roll.dist, wheelR: D.R, anchor: [0, 1.5, 0.75] });
    def({ id: "drv4", name: "DRIVER WHEELSET · NO.4", sub: "REAR DRIVER", phase: 0, at: 4.30, dur: 0.75, kind: "roll",
      build: buildDriverWS, target: [D.rdX, 0, 0], dist: roll.dist, wheelR: D.R, anchor: [0, 1.5, 0.75] });
    def({ id: "axlebox", name: "AXLE BOXES ×5", sub: "JOURNAL BRASSES", phase: 0, at: 4.45, dur: 0.9,
      build: buildAxleBox, target: [0, 0, 0], start: [-1.8, 3.6, 1.8], mid: [-1.8, 2.6, 0.6], anchor: [-3.4, 1.05, 0.4] });

    /* —— 阶段 2:汽缸 + 鞲鞴十字头 + 黄铜端盖 —— */
    def({ id: "cylA", name: "CYLINDER · LEFT", sub: "BORE + STEAM CHEST + GUIDES", phase: 1, at: 5.15, dur: 1.2,
      build: buildCyl, target: [D.cylX, D.yA, 0.76], start: [-9.5, 3.4, 2.8], mid: [-7.0, 2.6, 1.2], anchor: [0, 0.5, 0] });
    def({ id: "cylB", name: "CYLINDER · RIGHT", sub: "MIRRORED · Z −0.76", phase: 1, at: 5.85, dur: 1.2,
      build: buildCyl, target: [D.cylX, D.yA, -0.76], start: [-9.5, 3.4, -2.8], mid: [-7.0, 2.6, -1.2], anchor: [0, 0.5, 0] });
    def({ id: "xheadA", name: "PISTON + CROSSHEAD · L", sub: "STROKE 2 × 0.24", phase: 1, at: 7.00, dur: 1.1, kind: "kine",
      build: function () { return ST28.Rods.buildXhead(0.78); }, off: [1.4, 0, 0.3] });
    def({ id: "xheadB", name: "PISTON + CROSSHEAD · R", sub: "90° QUARTERED", phase: 1, at: 7.70, dur: 1.1, kind: "kine",
      build: function () { return ST28.Rods.buildXhead(-0.78); }, off: [1.4, 0, -0.3], offSign: -1 });
    def({ id: "capsA", name: "BRASS COVERS · L", sub: "FRONT + REAR GLAND", phase: 1, at: 8.80, dur: 1.1, kind: "screw",
      build: buildCaps, target: [D.cylX, D.yA, 0.76], start: [-8.8, 2.8, 1.6], mid: [-7.2, 2.2, 1.0], anchor: [0, 0.25, 0] });
    def({ id: "capsB", name: "BRASS COVERS · R", sub: "SCREWED ON", phase: 1, at: 9.50, dur: 1.1, kind: "screw",
      build: buildCaps, target: [D.cylX, D.yA, -0.76], start: [-8.8, 2.8, -1.6], mid: [-7.2, 2.2, -1.0], anchor: [0, 0.25, 0] });

    /* —— 阶段 3:连杆系(主连杆 / 结合杆 / Walschaerts)—— */
    def({ id: "mrodA", name: "MAIN ROD · LEFT", sub: "CRANK PIN → CROSSHEAD · L 1.62", phase: 2, at: 11.15, dur: 1.1, kind: "kine",
      build: function () { return ST28.Rods.buildMRod(0.78); }, off: [0, 1.8, 0.5] });
    def({ id: "mrodB", name: "MAIN ROD · RIGHT", sub: "CRANK PIN → CROSSHEAD", phase: 2, at: 11.65, dur: 1.1, kind: "kine",
      build: function () { return ST28.Rods.buildMRod(-0.78); }, off: [0, 1.8, -0.5], offSign: -1 });
    def({ id: "crodA", name: "COUPLING ROD · LEFT", sub: "4 PINS · QUARTERED 90°", phase: 2, at: 12.50, dur: 1.1, kind: "kine",
      build: function () { return ST28.Rods.buildCRod(0.82); }, off: [2.6, 0.55, 0.4] });
    def({ id: "crodB", name: "COUPLING ROD · RIGHT", sub: "4 PINS · LINKED", phase: 2, at: 13.00, dur: 1.1, kind: "kine",
      build: function () { return ST28.Rods.buildCRod(-0.82); }, off: [2.6, 0.55, -0.4], offSign: -1 });
    def({ id: "gearA", name: "WALSHAERTS GEAR · LEFT", sub: "ECC 90° LEAD · SIMPLIFIED", phase: 2, at: 13.70, dur: 1.2, kind: "kine",
      build: function () { return ST28.Rods.buildGear(0.72); }, off: [0, 1.7, 0.6] });
    def({ id: "gearB", name: "WALSHAERTS GEAR · RIGHT", sub: "RETURN CRANK + RADIUS ROD", phase: 2, at: 14.00, dur: 1.2, kind: "kine",
      build: function () { return ST28.Rods.buildGear(-0.72); }, off: [0, 1.7, -0.6], offSign: -1 });

    /* —— 阶段 4:锅炉 + 烟箱 + 烟囱/汽包/安全阀 + 排障器 —— */
    def({ id: "boiler", name: "BOILER + SMOKEBOX", sub: "14 BAR WORKING", phase: 3, at: 19.15, dur: 1.7,
      build: buildBoiler, target: [0, 0, 0], start: [-2.6, 5.6, 0], mid: [-2.6, 4.4, 0], anchor: [-3.0, 2.55, 0.5] });
    def({ id: "firebox", name: "FIREBOX", sub: "WIDE FEET INTO CAB", phase: 3, at: 20.40, dur: 1.1,
      build: buildFirebox, target: [0, 0, 0], start: [-0.25, 5.2, 0], mid: [-0.25, 4.2, 0], anchor: [-0.25, 1.9, 0.5] });
    def({ id: "pilotbeam", name: "BUFFER BEAM + PILOT", sub: "COWCATCHER WEDGE", phase: 3, at: 21.30, dur: 1.1,
      build: buildPilotBeam, target: [0, 0, 0], start: [-10.5, 1.4, 0], mid: [-8.4, 2.2, 0], anchor: [-5.9, 1.0, 0.8] });
    def({ id: "stack", name: "CHIMNEY", sub: "STRAIGHT FUNNEL", phase: 3, at: 22.40, dur: 0.8,
      build: buildStack, target: [-5.35, 2.42, 0], start: [-5.35, 5.4, 0], mid: [-5.35, 4.3, 0], anchor: [0, 0.65, 0] });
    def({ id: "dome", name: "STEAM DOME", sub: "REGULATOR DOME", phase: 3, at: 23.00, dur: 0.8,
      build: buildDome, target: [-3.70, 2.42, 0], start: [-3.70, 5.6, 0], mid: [-3.70, 4.4, 0], anchor: [0, 0.5, 0] });
    def({ id: "safety", name: "SAFETY VALVES ×2", sub: "POP AT 14.2 BAR", phase: 3, at: 23.60, dur: 0.8,
      build: buildSafety, target: [-2.45, 2.42, 0], start: [-2.45, 5.8, 0], mid: [-2.45, 4.5, 0], anchor: [0, 0.42, 0] });
    def({ id: "lampbell", name: "HEADLAMP + BELL", sub: "SMOKEBOX DRESSING", phase: 3, at: 24.20, dur: 1.0,
      build: buildLampBell, target: [0, 0, 0], start: [-4.2, 5.4, 1.5], mid: [-4.4, 4.2, 0.8], anchor: [-5.6, 2.75, 0] });

    /* —— 阶段 5:驾驶室 + 操纵台 + 实体压力表 + 煤柜 —— */
    def({ id: "cabsides", name: "CAB SHEETS", sub: "WINDOWS + SPECTACLE PLATE", phase: 4, at: 25.15, dur: 1.2,
      build: buildCabSides, target: [0, 0, 0], start: [1.2, 5.8, 2.6], mid: [1.2, 4.5, 1.2], anchor: [1.2, 2.3, 0.75] });
    def({ id: "cabroof", name: "CAB ROOF", sub: "CURVED SHEET", phase: 4, at: 26.20, dur: 1.0,
      build: buildCabRoof, target: [0, 0, 0], start: [1.2, 6.2, 0], mid: [1.2, 5.0, 0], anchor: [1.2, 2.75, 0] });
    def({ id: "contstand", name: "CONTROL STAND", sub: "REGULATOR + REVERSER", phase: 4, at: 27.00, dur: 1.0,
      build: buildContstand, target: [0, 0, 0], start: [0.8, 4.4, -2.2], mid: [0.9, 3.4, -0.6], anchor: [0.8, 2.05, 0.2] });
    def({ id: "gag3d", name: "PRESSURE GAUGE", sub: "CAB WALL · 0-18 BAR · LIVE", phase: 4, at: 27.80, dur: 0.8,
      build: buildGag3d, target: [0, 0, 0], start: [1.6, 4.6, 1.8], mid: [1.0, 3.4, 1.0], anchor: [0.5, 2.05, 0.42] });
    def({ id: "tender", name: "TENDER", sub: "COAL + WATER · COUPLED", phase: 4, at: 28.50, dur: 1.4,
      build: buildTender, target: [0, 0, 0], start: [9.0, 3.0, -1.5], mid: [6.0, 2.6, -0.6], anchor: [3.3, 2.1, 0.7] });
  }

  /* ============ 飞行 / 运动学控制 ============ */

  function announce(p) {
    ST28.Labels.announce(p.id, p.anchor || p.group, p.name, p.sub, performance.now(), 2400);
  }

  function makeLine(p) {
    if (p.kind !== "static" && p.kind !== "screw") return null;
    var pts = [];
    for (var i = 0; i <= 24; i++) pts.push(bez(p.start, p.mid, p.target, i / 24));
    var line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineDashedMaterial({ color: 0xB08D57, dashSize: 0.12, gapSize: 0.08, transparent: true, opacity: 0.45 }));
    line.computeLineDistances();
    ST28.Scene3D.scene.add(line);
    return line;
  }

  function removeLine(p) {
    if (!p.line) return;
    ST28.Scene3D.scene.remove(p.line);
    p.line.geometry.dispose();
    p.line.material.dispose();
    p.line = null;
  }

  function sealOne(p) {
    p.sealed = true;
    seatedCount++;
    p.group.visible = true;
    if (p.kind === "kine") {
      p.group.position.set(0, 0, 0);
      p.group.rotation.y = 0;
    } else if (p.kind === "roll") {
      p.group.position.set(p.target[0], 0, 0);   // 落到本轴槽位
    } else {
      p.group.position.set(p.target[0], p.target[1], p.target[2]);
      p.group.rotation.x = 0;
    }
    removeLine(p);
  }

  function rollUpdate(p, cycleT) {
    if (p.sealed) return;
    var t = (cycleT - p.at) / p.dur;
    if (t <= 0) { p.group.visible = false; return; }
    if (!p.shown) { p.shown = true; p.group.visible = true; announce(p); }
    var tt = Math.min(t, 1);
    var e = 1 - Math.pow(1 - tt, 3);
    p.group.position.set(p.target[0] - p.dist * (1 - e), 0, 0);
    spinWS(p, (p.dist / p.wheelR) * e);      // 滚动无滑移:转角 = 位移 / 轮半径
    if (t >= 1) { p.sealed = true; seatedCount++; }
  }

  function applyKine(state) {
    var S = ST28.GEAR.solve(state.theta);
    kineList.forEach(function (k) { k(S, state); });
    var D = ST28.GEAR.D;
    list.forEach(function (p) {
      if (p.kind !== "roll" || !p.sealed) return;
      if (p.wheelR === D.R) spinWS(p, 2 * Math.PI + state.theta);
      else spinWS(p, 2 * Math.PI + state.thetaTravel * D.R / p.wheelR);
    });
  }

  function update(cycleT, state) {
    applyKine(state);
    list.forEach(function (p) {
      if (p.kind === "roll") { rollUpdate(p, cycleT); return; }
      if (p.sealed) return;
      var t = (cycleT - p.at) / p.dur;
      if (t <= 0) { p.group.visible = false; return; }
      if (!p.shown) {
        p.shown = true;
        p.group.visible = true;
        if (!p.line) p.line = makeLine(p);
        announce(p);
      }
      var tt = Math.min(t, 1);
      var e = easeInOut(tt);
      if (p.kind === "kine") {
        p.group.position.set(p.off[0] * (1 - e), p.off[1] * (1 - e), p.off[2] * (1 - e));
        p.group.rotation.y = (1 - e) * 0.4 * p.offSign;
      } else {
        p.group.position.copy(bez(p.start, p.mid, p.target, e));
        if (p.kind === "screw") p.group.rotation.x = (1 - e) * 4.2;
      }
      if (t >= 1) sealOne(p);
    });
  }

  function resetAll() {
    flying = false;
    seatedCount = 0;
    list.forEach(function (p) {
      p.sealed = false;
      p.shown = false;
      p.group.visible = false;
      p.group.position.set(0, 0, 0);
      p.group.rotation.set(0, 0, 0);
      removeLine(p);
    });
  }

  function sealUpTo(phaseIdx) {
    flying = true;
    list.forEach(function (p) {
      if (p.phase < phaseIdx) {
        if (!p.sealed) sealOne(p);
        p.shown = true;
      }
    });
  }

  ST28.Parts = {
    init: function () {
      refs = {};
      kineList = [];
      build();
      resetAll();
    },
    begin: function () {
      resetAll();
      flying = true;
      list.forEach(function (p) {
        if (p.kind === "static" || p.kind === "screw") p.line = makeLine(p);
      });
    },
    update: update,
    reset: resetAll,
    sealUpTo: sealUpTo,
    group: function (id) { return byId[id] ? byId[id].group : null; },
    list: function () { return list; },
    setPressure: function (p) {
      if (refs.needle) refs.needle.rotation.z = -(135 + p / 18 * 270) * Math.PI / 180;
    },
    setRegulator: function (state) {
      if (refs.handwheel) refs.handwheel.rotation.y = (state.reg || 0) * 9;
      if (refs.lever) refs.lever.rotation.z = state.revAngle || 0;
    },
    get seatedCount() { return seatedCount; },
    entry: function (id) { return byId[id] || null; }
  };
})(window.ST28 = window.ST28 || {});
