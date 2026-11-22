/* 零件建模 + 飞行装配控制 + 机芯机械角度驱动
   核心：gearGeometry(teeth, module, thickness) 生成真齿轮（Extrude 轮廓+齿形），
   相邻齿轮按传动比（角速度反比齿数）啮合转动。 */
(function (MOVT) {
  var list = [];
  var refs = {};            // 需要单独驱动的子对象 {springDisc, hairspring}
  var mech = {};            // id -> 附加 rotation.y（时间线每帧刷新）
  var seatedCount = 0;
  var flying = false;
  var t0 = 0;

  /* ============ 齿轮几何（共用函数） ============
     teeth 齿数, module 模数（pitch 半径 = m·teeth/2）, thickness 厚度
     opts: bore 中心孔 / windows+hubR+rimR 轮辐镂空 / tipHalf,rootHalf 齿形比例 / bevel
     齿形：每齿 5 个顶点（梯形齿+齿槽），齿中心在角 k·p 上（啮合相位计算依赖此约定） */
  function gearGeometry(teeth, module, thickness, opts) {
    opts = opts || {};
    var p = (Math.PI * 2) / teeth;
    var rPitch = module * teeth / 2;
    var rTip = rPitch + module * 0.85;
    var rRoot = rPitch - module * 1.1;
    var tipHalf = opts.tipHalf !== undefined ? opts.tipHalf : 0.13;
    var rootHalf = opts.rootHalf !== undefined ? opts.rootHalf : 0.26;
    var shape = new THREE.Shape();
    for (var k = 0; k < teeth; k++) {
      var c = k * p;
      var pts = [
        [rRoot, c - rootHalf * p],
        [rTip, c - tipHalf * p],
        [rTip, c + tipHalf * p],
        [rRoot, c + rootHalf * p],
        [rRoot, c + 0.5 * p]
      ];
      for (var i = 0; i < pts.length; i++) {
        var x = Math.cos(pts[i][1]) * pts[i][0];
        var y = Math.sin(pts[i][1]) * pts[i][0];
        if (k === 0 && i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
    }
    shape.closePath();
    if (opts.bore) {
      var hole = new THREE.Path();
      hole.absarc(0, 0, opts.bore, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
    if (opts.windows) {
      for (var w = 0; w < opts.windows; w++) {
        var a1 = w * (Math.PI * 2 / opts.windows) + 0.14;
        var a2 = (w + 1) * (Math.PI * 2 / opts.windows) - 0.14;
        var sec = new THREE.Path();
        sec.absarc(0, 0, opts.rimR, a1, a2, false);
        sec.lineTo(Math.cos(a2) * opts.hubR, Math.sin(a2) * opts.hubR);
        sec.absarc(0, 0, opts.hubR, a2, a1, true);
        sec.closePath();
        shape.holes.push(sec);
      }
    }
    var geo = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: !!opts.bevel,
      bevelThickness: 0.006, bevelSize: 0.004, bevelSegments: 1,
      curveSegments: 24
    });
    geo.rotateX(-Math.PI / 2);   // 轮齿平躺，厚度沿 +Y
    return geo;
  }

  /* 啮合初始相位：轮 A 齿心指向 φ（对准 B），轮 B 齿槽指向 φ+π */
  function meshPhase(teethA, teethB, phi) {
    var pB = (Math.PI * 2) / teethB;
    return [-phi, -0.5 * pB - phi - Math.PI];
  }

  var mesh = function (geo, mat, x, y, z) { return MOVT.Scene3D.mesh(geo, mat, x, y, z); };

  /* 轮 + 同轴小齿轴（pinion）组件 */
  function makeWheel(o) {
    var g = new THREE.Group();
    var wheel = mesh(gearGeometry(o.teeth, o.module, o.thickness, {
      bore: o.bore, windows: o.windows, hubR: o.hubR, rimR: o.rimR, bevel: true
    }), o.mat, 0, o.y - o.thickness / 2, 0);
    g.add(wheel);
    g.userData.wheelMesh = wheel;
    if (o.pinion) {
      var pin = mesh(gearGeometry(o.pinion.teeth, o.pinion.module, o.pinion.thickness, {
        bore: 0.03, bevel: true
      }), o.pinion.mat, 0, o.pinion.y - o.pinion.thickness / 2, 0);
      g.add(pin);
    }
    if (o.staff) {
      g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, o.staff.h, 10), MOVT.Scene3D.M.steel, 0, o.staff.y, 0));
    }
    if (o.ext) {   // 中轮上的中心秒齿轴（ cannon pinion 延长管）
      g.add(mesh(new THREE.CylinderGeometry(0.045, 0.045, o.ext.h, 12), MOVT.Scene3D.M.rhodium, 0, o.ext.y, 0));
    }
    return g;
  }

  /* ============ 布局常量（按 25.6mm 机芯等比，1 单位 ≈ 5mm） ============ */
  var Mm = 0.024;   // 轮系模数
  var POS = {
    plate: [0, 0],
    barrel: [-1.176, 0],
    wheelC: [0, 0],
    wheel3: [0.826, -0.578],
    wheel4: [1.043, -1.389],
    wheelE: [1.756, -0.676],
    pallet: [0.836, -1.011],
    balance: [0.328, -1.196],
    cock: [0.676, -2.354]
  };
  var TRAIN = {   // 传动链：齿数与倍率（84/14=6 · 70/14=5 · 56/14=4 · 96/6=16 → ×1920，第四轮 1 rev/min）
    barrelTeeth: 84, cPinion: 14, cWheel: 70,
    t3Pinion: 14, t3Wheel: 56, t4Pinion: 14, t4Wheel: 96, ePinion: 6, eWheel: 15
  };
  var M4 = 1.008 * 2 / (TRAIN.t4Wheel + TRAIN.ePinion);   // 末对啮合模数（保持中心距不变）

  /* ============ 零件建模 ============ */
  function build() {
    var M = MOVT.Scene3D.M;
    var defs = [];
    var idx = 0;

    function def(id, name, sub, pos, anchorY, buildFn, duration) {
      var g = buildFn();
      g.position.set(pos[0], 0, pos[1]);
      g.userData.tagAnchor = new THREE.Vector3(0, anchorY, 0);
      root.add(g);
      defs.push({
        id: id, name: name, sub: sub, group: g,
        pos: new THREE.Vector3(pos[0], 0, pos[1]),
        yaw: g.userData.yaw || 0, anchorY: anchorY, index: idx++,
        duration: duration || 1.35
      });
      g.rotation.y = g.userData.yaw || 0;
      return g;
    }

    /* 1 · 主夹板：黄铜圆盘 + 缺口（Extrude 带咬口轮廓）+ 车削裙边（Lathe） */
    def("plate", "MAIN PLATE", "brass · Ø 25.6 mm", POS.plate, 0.4, function () {
      var g = new THREE.Group();
      var s = new THREE.Shape();
      s.absarc(0, 0, 2.56, 1.05, 0.35, false);          // 外圆长弧
      s.lineTo(Math.cos(0.35) * 2.20, Math.sin(0.35) * 2.20);
      s.absarc(0, 0, 2.20, 0.35, 1.05, false);          // 缺口内凹弧
      s.closePath();
      var geo = new THREE.ExtrudeGeometry(s, {
        depth: 0.12, bevelEnabled: true,
        bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2,
        curveSegments: 64
      });
      geo.rotateX(-Math.PI / 2);
      geo.translate(0, -0.14, 0);
      g.add(mesh(geo, M.brassPlate, 0, 0, 0));
      var prof = [
        new THREE.Vector2(2.42, -0.30), new THREE.Vector2(2.60, -0.27),
        new THREE.Vector2(2.60, -0.16), new THREE.Vector2(2.50, -0.13),
        new THREE.Vector2(2.42, -0.145)
      ];
      var skirt = new THREE.Mesh(new THREE.LatheGeometry(prof, 72), M.brassDark);
      skirt.castShadow = true; skirt.receiveShadow = true;
      g.add(skirt);
      return g;
    }, 1.5);

    /* 2 · 机芯座圈（ rhodium 装配环） */
    def("ring", "MOVEMENT RING", "holder · rhodium", POS.plate, 0.22, function () {
      var g = new THREE.Group();
      var prof = [
        new THREE.Vector2(2.58, -0.30), new THREE.Vector2(2.88, -0.26),
        new THREE.Vector2(2.88, 0.04), new THREE.Vector2(2.62, 0.10),
        new THREE.Vector2(2.58, 0.02), new THREE.Vector2(2.58, -0.30)
      ];
      var ring = new THREE.Mesh(new THREE.LatheGeometry(prof, 80), M.rhodium);
      ring.castShadow = true; ring.receiveShadow = true;
      g.add(ring);
      return g;
    }, 1.3);

    /* 3-7 · 红宝石轴承 ×5（嵌在夹板孔位） */
    var jewelPos = { jC: POS.wheelC, j3: POS.wheel3, j4: POS.wheel4, jE: POS.wheelE, jB: POS.balance };
    Object.keys(jewelPos).forEach(function (id) {
      def(id, "JEWEL BEARING", "synthetic ruby · oil pocket", jewelPos[id], 0.1, function () {
        var g = new THREE.Group();
        var chaton = mesh(new THREE.TorusGeometry(0.075, 0.018, 8, 24), M.brassDark, 0, 0.028, 0);
        chaton.rotation.x = Math.PI / 2;
        g.add(chaton);
        g.add(mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.045, 14), M.ruby, 0, 0.025, 0));
        return g;
      }, 1.0);
    });

    /* 8 · 发条盒：条盒轮 84T + 开口鼓 + 发条螺旋盘（Canvas 贴图旋转表现盘紧） */
    def("barrel", "MAINSPRING BARREL", "84 T · 42 h reserve", POS.barrel, 0.52, function () {
      var g = new THREE.Group();
      g.add(mesh(gearGeometry(TRAIN.barrelTeeth, Mm, 0.10, { bore: 0.63, bevel: true }), M.brass, 0, 0.19, 0));
      var wallMat = M.brassDark.clone();
      wallMat.side = THREE.DoubleSide;
      var wall = mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.30, 48, 1, true), wallMat, 0, 0.26, 0);
      g.add(wall);
      g.add(mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.02, 48), M.brassDark, 0, 0.115, 0));
      var lip = mesh(new THREE.TorusGeometry(0.635, 0.02, 8, 48), M.brassLine, 0, 0.41, 0);
      lip.rotation.x = Math.PI / 2;
      g.add(lip);
      var springDisc = new THREE.Mesh(
        new THREE.CircleGeometry(0.55, 48),
        new THREE.MeshStandardMaterial({ map: MOVT.Textures.mainspring(), roughness: 0.55, metalness: 0.4 })
      );
      springDisc.rotation.x = -Math.PI / 2;
      springDisc.position.set(0, 0.375, 0);
      springDisc.castShadow = false; springDisc.receiveShadow = true;
      g.add(springDisc);
      refs.springDisc = springDisc;
      g.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.36, 16), M.steel, 0, 0.26, 0));
      return g;
    }, 1.4);

    /* 9 · 中心轮 70T（+14T 小齿轴，×6） */
    def("wheelC", "CENTER WHEEL", "70 T · 1 rev / hour", POS.wheelC, 0.5, function () {
      return makeWheel({
        teeth: TRAIN.cWheel, module: Mm, thickness: 0.045, y: 0.24, mat: M.brass,
        bore: 0.20, windows: 5, hubR: 0.30, rimR: 0.72,
        pinion: { teeth: TRAIN.cPinion, module: Mm, thickness: 0.10, y: 0.24, mat: M.steel },
        ext: { h: 0.57, y: 0.575 }
      });
    }, 1.4);

    /* 10 · 三轮 56T（+14T，×5） */
    def("wheel3", "THIRD WHEEL", "56 T · ×5 of center", POS.wheel3, 0.45, function () {
      return makeWheel({
        teeth: TRAIN.t3Wheel, module: Mm, thickness: 0.04, y: 0.24, mat: M.brass,
        bore: 0.20, windows: 4, hubR: 0.26, rimR: 0.60,
        pinion: { teeth: TRAIN.t3Pinion, module: Mm, thickness: 0.10, y: 0.24, mat: M.steel },
        staff: { h: 0.24, y: 0.30 }
      });
    }, 1.4);

    /* 11 · 四轮 96T（+6T 小齿轴，×16 驱动擒纵轮；模数 M4 保持中心距） */
    def("wheel4", "FOURTH WHEEL", "96 T · drives escape ×16", POS.wheel4, 0.45, function () {
      return makeWheel({
        teeth: TRAIN.t4Wheel, module: M4, thickness: 0.04, y: 0.24, mat: M.brass,
        bore: 0.20, windows: 4, hubR: 0.26, rimR: 0.66,
        pinion: { teeth: TRAIN.t4Pinion, module: Mm, thickness: 0.10, y: 0.24, mat: M.steel },
        staff: { h: 0.30, y: 0.33 }
      });
    }, 1.4);

    /* 12 · 擒纵轮 15 齿（钢， club 齿形，+6T 小齿轴，×16） */
    def("wheelE", "ESCAPE WHEEL", "15 teeth · steel", POS.wheelE, 0.5, function () {
      return makeWheel({
        teeth: TRAIN.eWheel, module: 0.052, thickness: 0.04, y: 0.40, mat: M.rhodium,
        bore: 0.05, windows: 4, hubR: 0.10, rimR: 0.30, tipHalf: 0.07, rootHalf: 0.30,
        pinion: { teeth: TRAIN.ePinion, module: M4, thickness: 0.10, y: 0.24, mat: M.steel },
        staff: { h: 0.26, y: 0.35 }
      });
    }, 1.4);

    /* 13 · 擒纵叉：锚形银色杠杆 + 进瓦/出瓦两颗红宝石（局部 +X 指向摆轮，−X 指向擒纵轮） */
    def("pallet", "PALLET FORK", "lever · 2 ruby pallets · ±10°", POS.pallet, 0.55, function () {
      var g = new THREE.Group();
      var W = Math.atan2(POS.balance[1] - POS.pallet[1], POS.balance[0] - POS.pallet[0]);
      g.rotation.y = -W;
      g.userData.yaw = -W;
      g.add(mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.12, 12), M.steel, 0, 0.44, 0));
      g.add(mesh(new THREE.BoxGeometry(0.30, 0.028, 0.10), M.rhodium, 0.10, 0.44, 0));
      g.add(mesh(new THREE.BoxGeometry(0.34, 0.026, 0.055), M.rhodium, 0.33, 0.44, 0));
      var hornL = mesh(new THREE.BoxGeometry(0.10, 0.024, 0.03), M.rhodium, 0.55, 0.44, 0.048);
      hornL.rotation.y = 0.35;
      var hornR = mesh(new THREE.BoxGeometry(0.10, 0.024, 0.03), M.rhodium, 0.55, 0.44, -0.048);
      hornR.rotation.y = -0.35;
      g.add(hornL); g.add(hornR);
      g.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 8), M.steel, 0.60, 0.42, 0));
      // 两条锚臂 + 瓦石（红宝石，臂长 0.545 使瓦石落在擒纵轮齿圆上）
      for (var i = 0; i < 2; i++) {
        var arm = new THREE.Group();
        arm.rotation.y = Math.PI + (i === 0 ? 0.40 : -0.40);
        arm.position.set(0, 0, 0);
        arm.add(mesh(new THREE.BoxGeometry(0.55, 0.024, 0.05), M.rhodium, 0.275, 0.44, 0));
        var stone = mesh(new THREE.BoxGeometry(0.055, 0.075, 0.10), M.ruby, 0.545, 0.40, 0);
        stone.rotation.z = 0.6;
        arm.add(stone);
        g.add(arm);
      }
      return g;
    }, 1.35);

    /* 14 · 摆轮 + 游丝：轮圈 + 双辐条 + 补重螺丝 + 呼吸游丝 */
    def("balance", "BALANCE WHEEL", "±270° · 4 Hz · 28,800 vph", POS.balance, 0.8, function () {
      var g = new THREE.Group();
      var rim = mesh(new THREE.TorusGeometry(0.62, 0.052, 14, 60), M.rhodium, 0, 0.62, 0);
      rim.rotation.x = Math.PI / 2;
      g.add(rim);
      g.add(mesh(new THREE.BoxGeometry(1.21, 0.035, 0.055), M.rhodium, 0, 0.62, 0));
      var sp2 = mesh(new THREE.BoxGeometry(1.21, 0.035, 0.055), M.rhodium, 0, 0.62, 0);
      sp2.rotation.y = Math.PI / 2;
      g.add(sp2);
      for (var i = 0; i < 4; i++) {
        var a = Math.PI / 4 + i * Math.PI / 2;
        g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.035, 8), M.brassDark, Math.cos(a) * 0.60, 0.665, Math.sin(a) * 0.60));
      }
      g.add(mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 14), M.steel, 0, 0.62, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.34, 10), M.steel, 0, 0.56, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.022, 20), M.steelDark, 0, 0.46, 0));
      g.add(mesh(new THREE.BoxGeometry(0.032, 0.03, 0.05), M.ruby, 0.12, 0.445, 0));
      return g;
    }, 1.4);

    /* 15 · 摆轮桥（cock）：立柱 + 悬臂 + 端石红宝石 */
    def("cock", "BALANCE COCK", "bridge · endstone", POS.cock, 0.9, function () {
      var g = new THREE.Group();
      var W = Math.atan2(POS.balance[1] - POS.cock[1], POS.balance[0] - POS.cock[0]);
      g.rotation.y = -W;
      g.userData.yaw = -W;
      g.add(mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.04, 20), M.brassDark, 0, 0.02, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.085, 0.10, 0.74, 14), M.brass, 0, 0.37, 0));
      g.add(mesh(new THREE.BoxGeometry(1.10, 0.045, 0.20), M.brass, 0.55, 0.74, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.022, 12), M.steel, 0.12, 0.775, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 18), M.brass, 1.10, 0.755, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.02, 10), M.ruby, 1.10, 0.715, 0));
      // 游丝（挂在桥上不随摆轮旋转；外桩固定，仅内圈呼吸）
      var pts = [];
      for (var k = 0; k <= 220; k++) {
        var t = k / 220;
        var aa = t * 6.5 * Math.PI * 2;
        var rr = 0.08 + t * 0.36;
        pts.push(new THREE.Vector3(Math.cos(aa) * rr, 0, Math.sin(aa) * rr));
      }
      var spring = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 240, 0.0075, 6, false), M.spring
      );
      var hs = new THREE.Group();
      hs.position.set(1.209, 0.545, 0);   // 摆轮中心在 cock 局部坐标的位置
      hs.add(spring);
      hs.add(mesh(new THREE.BoxGeometry(0.05, 0.04, 0.05), M.steel, 0.44, 0.01, 0));
      g.add(hs);
      refs.hairspring = hs;
      return g;
    }, 1.3);

    /* 16 · 自动锤：半圆偏心重锤（黄铜外缘 + 铑臂 + 钢毂） */
    def("rotor", "AUTO ROTOR", "off-center weight · brass edge", POS.plate, 0.95, function () {
      var g = new THREE.Group();
      var s = new THREE.Shape();
      s.absarc(0, 0, 1.55, -Math.PI / 2, Math.PI / 2, false);
      s.lineTo(Math.cos(Math.PI / 2) * 1.10, Math.sin(Math.PI / 2) * 1.10);
      s.absarc(0, 0, 1.10, Math.PI / 2, -Math.PI / 2, true);
      s.closePath();
      var geo = new THREE.ExtrudeGeometry(s, {
        depth: 0.055, bevelEnabled: true,
        bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1,
        curveSegments: 48
      });
      geo.rotateX(-Math.PI / 2);
      var rim = new THREE.Mesh(geo, M.brass);
      rim.position.set(0, 0.772, 0);
      rim.castShadow = true; rim.receiveShadow = true;
      g.add(rim);
      g.add(mesh(new THREE.BoxGeometry(1.10, 0.05, 0.16), M.rhodium, 0.60, 0.80, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.07, 24), M.steel, 0, 0.80, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.03, 16), M.brassLine, 0, 0.845, 0));
      return g;
    }, 1.4);

    /* 17 · 表盘：镂空章圈（Canvas：分钟刻度 + 条钉 + ATELIER 2892）
       RingGeometry 真实开孔 —— 中心镂空处射线可穿透，点击机芯零件不受遮挡 */
    def("dial", "DIAL", "skeleton · minute track", POS.plate, 1.05, function () {
      var g = new THREE.Group();
      var mat = new THREE.MeshStandardMaterial({
        map: MOVT.Textures.dial(), transparent: true, depthWrite: false,
        roughness: 0.9, metalness: 0.05, side: THREE.DoubleSide
      });
      var disc = new THREE.Mesh(new THREE.RingGeometry(1.9, 2.5, 96, 1), mat);
      disc.rotation.x = -Math.PI / 2;
      disc.position.set(0, 0.88, 0);
      disc.receiveShadow = false; disc.castShadow = false;
      disc.renderOrder = 2;
      g.add(disc);
      return g;
    }, 1.3);

    /* 18-20 · 指针 ×3（细长锥形，秒针酒红；飞行落位即对准 10:09:30） */
    function handShape(len, hw, tail) {
      var s = new THREE.Shape();
      s.moveTo(len, 0);
      s.lineTo(0, hw);
      s.lineTo(tail, hw * 0.8);
      s.lineTo(tail, -hw * 0.8);
      s.lineTo(0, -hw);
      s.closePath();
      return s;
    }
    function makeHand(len, hw, tail, mat, y, capR, capMat, capY) {
      var g = new THREE.Group();
      var geo = new THREE.ExtrudeGeometry(handShape(len, hw, tail), {
        depth: 0.02, bevelEnabled: false
      });
      geo.rotateX(-Math.PI / 2);
      g.add(mesh(geo, mat, 0, y - 0.01, 0));
      g.add(mesh(new THREE.CylinderGeometry(capR, capR, 0.03, 14), capMat, 0, capY, 0));
      return g;
    }
    var T12 = Math.PI * 2;
    var clock0 = {
      h: (10 + 9.5 / 60) / 12 * T12,
      m: (9.5 / 60) * T12,
      s: (30 / 60) * T12
    };
    def("handH", "HOUR HAND", "dappler · to 10:09", POS.plate, 1.05, function () {
      var g = makeHand(1.55, 0.058, -0.34, M.handSteel, 0.92, 0.10, M.brass, 0.925);
      g.rotation.y = Math.PI / 2 - clock0.h;
      g.userData.yaw = g.rotation.y;
      return g;
    }, 1.3);
    def("handM", "MINUTE HAND", "to 09 min", POS.plate, 1.05, function () {
      var g = makeHand(2.30, 0.045, -0.42, M.handSteel, 0.96, 0.075, M.brass, 0.965);
      g.rotation.y = Math.PI / 2 - clock0.m;
      g.userData.yaw = g.rotation.y;
      return g;
    }, 1.3);
    def("handS", "SECOND HAND", "wine red · 8 steps / s", POS.plate, 1.1, function () {
      var g = makeHand(2.40, 0.022, -0.55, M.wine, 1.00, 0.055, M.wine, 1.01);
      g.rotation.y = Math.PI / 2 - clock0.s;
      g.userData.yaw = g.rotation.y;
      return g;
    }, 1.3);

    /* 21 · 表镜：最后盖上（透明玻璃圆顶，射线穿透 —— 点击落到下方机芯零件） */
    def("glass", "CRYSTAL", "domed · anti-glare", POS.plate, 1.35, function () {
      var g = new THREE.Group();
      var geo = new THREE.SphereGeometry(3.2, 48, 14, 0, Math.PI * 2, 0, 0.885);
      geo.scale(1, 0.163, 1);
      var dome = new THREE.Mesh(geo, M.glass);
      dome.position.set(0, 0.669, 0);
      dome.castShadow = false; dome.receiveShadow = false;
      dome.renderOrder = 10;
      dome.raycast = function () {};   // 不参与拾取
      g.add(dome);
      return g;
    }, 1.3);

    /* 啮合初始相位（共 4 对）：逐面校准 —— 每片轮片在轴上补转 δ，
       使 4 个啮合面的齿全部对齐（消除奇数比半齿距穿插） */
    var arbor = { barrel: 0 };
    var wheelDelta = {};
    function face(tA, tB, from, to) {
      var phi = Math.atan2(POS[to][1] - POS[from][1], POS[to][0] - POS[from][0]);
      var pA = (Math.PI * 2) / tA, pB = (Math.PI * 2) / tB;
      var effA = (arbor[from] || 0) + (wheelDelta[from] || 0);
      var dA = ((-phi - effA) % pA + pA) % pA;
      wheelDelta[from] = (wheelDelta[from] || 0) + dA;
      effA += dA;
      arbor[to] = effA - 0.5 * pB - Math.PI;
    }
    face(TRAIN.barrelTeeth, TRAIN.cPinion, "barrel", "wheelC");
    face(TRAIN.cWheel, TRAIN.t3Pinion, "wheelC", "wheel3");
    face(TRAIN.t3Wheel, TRAIN.t4Pinion, "wheel3", "wheel4");
    face(TRAIN.t4Wheel, TRAIN.ePinion, "wheel4", "wheelE");
    defs.forEach(function (p) {
      if (arbor[p.id] !== undefined) {
        p.yaw = arbor[p.id];
        p.group.rotation.y = p.yaw;
        p.group.userData.yaw = p.yaw;
        if (p.group.userData.wheelMesh) {
          p.group.userData.wheelMesh.rotation.y = wheelDelta[p.id] || 0;
        }
      }
    });

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
    MOVT.Scene3D.scene.add(root);
    list = build();
    list.forEach(function (p) {
      var i = p.index;
      p.start = new THREE.Vector3(-6.2 - (i % 3) * 0.8, 3.6 + (i % 4) * 0.55, -2.8 + ((i * 53) % 13) / 4);
      p.mid = new THREE.Vector3(
        p.start.x + (p.pos.x - p.start.x) * 0.45,
        2.6 + (i % 3) * 0.3,
        p.start.z + (p.pos.z - p.start.z) * 0.5 - 0.5
      );
      p.group.visible = false;
    });
  }

  /* 飞入一批零件：entries = [[id, delaySec], ...] */
  function flyPhase(entries) {
    if (!flying) { flying = true; t0 = performance.now() / 1000; }
    entries.forEach(function (e) {
      var p = byId(e[0]);
      if (!p || p.sealed) return;
      p.delay = e[1];
      p.landed = false; p.tagShown = false;
      p.group.visible = false;
    });
  }

  function byId(id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function update(now) {
    if (!flying) return;
    var tNow = now / 1000;
    list.forEach(function (p) {
      if (p.sealed) {
        if (mech[p.id] !== undefined) p.group.rotation.y = p.yaw + mech[p.id];
        return;
      }
      if (p.delay === undefined) return;
      var t = (tNow - t0 - p.delay) / p.duration;
      if (t <= 0) return;
      if (!p.tagShown) {
        p.tagShown = true;
        p.group.visible = true;
        MOVT.Labels.announce(p.id, p.group, p.name, p.sub, performance.now(), 2400);
      }
      var tt = easeInOut(Math.min(t, 1));
      p.group.position.copy(bez(p.start, p.mid, p.pos, tt));
      var spin = mech[p.id] !== undefined ? mech[p.id] * tt : 0;
      p.group.rotation.y = p.yaw + spin + (1 - tt) * 1.1;
      if (t >= 1 && !p.landed) {
        p.landed = true;
        p.sealed = true;
        seatedCount++;
        p.group.position.copy(p.pos);
        p.group.rotation.y = p.yaw + (mech[p.id] || 0);
      }
    });
  }

  function reset() {
    flying = false;
    seatedCount = 0;
    mech = {};
    list.forEach(function (p) {
      p.sealed = false; p.landed = false; p.tagShown = false; p.delay = undefined;
      p.group.visible = false;
      p.group.position.copy(p.pos);
      p.group.rotation.y = p.yaw;
    });
    if (refs.springDisc) refs.springDisc.rotation.y = 0;
    if (refs.hairspring) refs.hairspring.scale.set(1, 1, 1);
  }

  /* 调试/跳转用：一批零件直接落位 */
  function sealList(ids) {
    if (!flying) { flying = true; t0 = performance.now() / 1000 - 10; }
    ids.forEach(function (id) {
      var p = byId(id);
      if (!p || p.sealed) return;
      p.sealed = true; p.landed = true; p.tagShown = true;
      p.group.visible = true;
      p.group.position.copy(p.pos);
      p.group.rotation.y = p.yaw + (mech[p.id] || 0);
      seatedCount++;
    });
  }

  function sealAll() {
    sealList(list.map(function (p) { return p.id; }));
  }

  MOVT.Parts = {
    init: init,
    flyPhase: flyPhase,
    update: update,
    reset: reset,
    sealList: sealList,
    sealAll: sealAll,
    group: function (id) { var p = byId(id); return p ? p.group : null; },
    list: function () { return list; },
    setMech: function (m) { mech = m; },
    setSpringSpin: function (a) { if (refs.springDisc) refs.springDisc.rotation.y = -a; },
    setBreath: function (s) { if (refs.hairspring) refs.hairspring.scale.set(s, 1, s); },
    get seatedCount() { return seatedCount; }
  };
})(window.MOVT = window.MOVT || {});
