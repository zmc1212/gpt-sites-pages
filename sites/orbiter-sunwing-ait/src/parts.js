/* 零件建模 + 飞入装配 + 太阳翼逐板展开 + 脐带缆(全部可点击标签) */
(function (ORBW) {
  var list = [];            // 全部条目(含脐带缆)
  var sat = null;           // 卫星总成(pedestal.satRoot 内)
  var flightParts = [];
  var flying = false, t0 = 0, seated = 0, unitTotal = 0;
  var clock = 0;

  /* 动态引用 */
  var tankParts = [];       // 带扎带动画的贮箱
  var wheelRotors = [];     // 飞轮转子
  var dishGrp = null, dishArm = null, dishHead = null;
  var whipPivot = null, magPivots = [];
  var wings = [];           // [右翼, 左翼] {group, pivots, stX, depX, done}
  var rodItems = [], rodsReleased = false, rodT0 = 0, pyro = [];
  var ledMats = [];         // 翼根确认灯带
  var umb = null, socketMesh = null;
  var WING_L = 0.55, WING_N = 4;

  function setAnchor(g, x, y, z) {
    g.userData.tagAnchor = new THREE.Vector3(x || 0, y || 0, z || 0);
  }

  /* ============ 零件建模 ============ */
  function buildAll() {
    var M = ORBW.Scene3D.M, mesh = ORBW.Scene3D.mesh;
    sat = new THREE.Group();
    ORBW.Scene3D.satRoot.add(sat);

    function def(id, name, sub, pos, phase, delay, anchor, buildFn, opts) {
      opts = opts || {};
      var g = buildFn();
      g.position.set(pos[0], pos[1], pos[2]);
      g.rotation.y = opts.yaw || 0;
      setAnchor(g, anchor[0], anchor[1], anchor[2]);
      sat.add(g);
      var p = {
        id: id, name: name, sub: sub, group: g, phase: phase, delay: delay,
        pos: new THREE.Vector3(pos[0], pos[1], pos[2]), yaw: opts.yaw || 0,
        dur: opts.dur || 1.25, from: opts.from || null, sealed: false
      };
      list.push(p);
      return p;
    }

    /* 1 · 中央结构板(铝蜂窝) */
    def("panel", "AL HONEYCOMB PANEL", "PRIMARY STRUCTURE", [0, 0.30, 0], 0, 0, [0, 0.14, 0], function () {
      var g = new THREE.Group();
      var slab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.9),
        [M.dark, M.dark, M.honey, M.dark, M.dark, M.dark]);
      slab.castShadow = slab.receiveShadow = true;
      g.add(slab);
      // 角部支撑柱
      [[-0.62, -0.30], [0.62, -0.30], [-0.62, 0.30], [0.62, 0.30]].forEach(function (c) {
        g.add(mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.05, 10), M.alu, c[0], -0.055, c[1]));
      });
      // -Z 边脐带缆插座
      socketMesh = mesh(new THREE.BoxGeometry(0.09, 0.07, 0.03), M.alu, 0, -0.015, -0.465);
      g.add(socketMesh);
      g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), M.black, 0, -0.015, -0.485).rotateX(Math.PI / 2));
      return g;
    }, { dur: 1.4 });

    /* 2 · 四周桁架肋 */
    def("truss", "TRUSS RIBS ×8", "RAILS · POSTS · BRACE", [0, 0.30, 0], 0, 1.1, [0, 0.16, 0], function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(1.5, 0.05, 0.05), M.dark, 0, 0.055, -0.425));
      g.add(mesh(new THREE.BoxGeometry(1.5, 0.05, 0.05), M.dark, 0, 0.055, 0.425));
      g.add(mesh(new THREE.BoxGeometry(0.05, 0.05, 0.8), M.dark, -0.725, 0.055, 0));
      g.add(mesh(new THREE.BoxGeometry(0.05, 0.05, 0.8), M.dark, 0.725, 0.055, 0));
      [[-0.70, -0.40], [0.70, -0.40], [-0.70, 0.40], [0.70, 0.40]].forEach(function (c) {
        g.add(mesh(new THREE.BoxGeometry(0.05, 0.12, 0.05), M.alu, c[0], 0.11, c[1]));
      });
      // 底面斜撑
      var b1 = mesh(new THREE.BoxGeometry(1.52, 0.018, 0.02), M.dark, 0, -0.042, 0);
      b1.rotation.y = Math.PI / 4;
      var b2 = b1.clone(); b2.rotation.y = -Math.PI / 4;
      g.add(b1); g.add(b2);
      return g;
    }, { dur: 1.3 });

    /* 3-6 · 4× 钛合金球贮箱(扎带落位) */
    var tankPos = [[-0.52, -0.30], [-0.20, -0.30], [-0.52, 0.02], [-0.20, 0.02]];
    tankPos.forEach(function (tp, i) {
      var p = def("tank" + (i + 1), "TI SPHERICAL TANK", "BIPROP · STRAP ×2",
        [tp[0], 0.52, tp[1]], 1, 0.15 + i * 0.85, [0, 0.18, 0], function () {
          var g = new THREE.Group();
          // 金箔支承盘(MLI)
          g.add(mesh(new THREE.BoxGeometry(0.34, 0.025, 0.34), M.foil, 0, -0.165, 0));
          g.add(mesh(new THREE.SphereGeometry(0.15, 24, 18), M.ti, 0, 0, 0));
          g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 10), M.alu, 0, 0.16, 0));
          // 两道金箔扎带(落位后收紧)
          var bands = new THREE.Group();
          var b1 = mesh(new THREE.TorusGeometry(0.153, 0.011, 8, 30), M.gold, 0, 0, 0);
          b1.rotation.x = Math.PI / 2;
          var b2 = mesh(new THREE.TorusGeometry(0.153, 0.011, 8, 30), M.gold, 0, 0, 0);
          b2.rotation.y = Math.PI / 2;
          bands.add(b1); bands.add(b2);
          g.add(bands);
          g.userData.bands = bands;
          return g;
        }, { dur: 1.15 });
      tankParts.push(p);
    });

    /* 7 · 双组元主发动机(从侧面推入底面) */
    def("engine", "MAIN ENGINE 120 N", "BIPROPELLANT · BELL NOZZLE", [0, 0.255, 0], 1, 3.6, [0, -0.1, 0], function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.035, 16), M.alu, 0, 0.03, 0));
      g.add(mesh(new THREE.SphereGeometry(0.055, 14, 10), M.ti, 0, 0.012, 0));
      var pts = [];
      [[0.05, 0], [0.055, -0.03], [0.075, -0.065], [0.098, -0.10]].forEach(function (pt) {
        pts.push(new THREE.Vector2(pt[0], pt[1]));
      });
      g.add(mesh(new THREE.LatheGeometry(pts, 30), M.bell, 0, 0, 0));
      return g;
    }, { dur: 1.1, from: [1.6, 0.22, 0.7] });

    /* 8 · 8× 小推力器 */
    def("rcs", "RCS THRUSTERS ×8", "COLD GAS · CORNER PODS", [0, 0.30, 0], 1, 4.6, [0, 0.1, 0], function () {
      var g = new THREE.Group();
      [[-0.70, -0.41], [0.70, -0.41], [-0.70, 0.41], [0.70, 0.41]].forEach(function (c) {
        var up = mesh(new THREE.ConeGeometry(0.02, 0.055, 10), M.dark, c[0], 0.055, c[1]);
        up.rotation.z = -Math.sign(c[0]) * 0.55;
        up.rotation.x = Math.sign(c[1]) * 0.55;
        g.add(up);
        var dn = mesh(new THREE.ConeGeometry(0.02, 0.055, 10), M.dark, c[0], -0.055, c[1]);
        dn.rotation.z = -Math.sign(c[0]) * 0.55;
        dn.rotation.x = Math.sign(c[1]) * 0.55 + Math.PI;
        g.add(dn);
      });
      return g;
    }, { dur: 1.15 });

    /* 9 · 锂电池组 */
    def("batt", "LI-ION BATTERY PACK", "28 V · 8S4P · 30 AH", [0.18, 0.40, 0.28], 2, 0.15, [0, 0.1, 0], function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(0.42, 0.14, 0.26), M.strap, 0, 0, 0));
      g.add(mesh(new THREE.BoxGeometry(0.44, 0.02, 0.28), M.alu, 0, 0.08, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.05, 8), M.gold, -0.18, 0.02, 0.10).rotateX(Math.PI / 2));
      return g;
    }, { dur: 1.2 });

    /* 10 · PCDU 配电盒 */
    def("pcdu", "PCDU", "POWER DISTRIBUTION · 28 V BUS", [0.56, 0.39, 0.26], 2, 1.15, [0, 0.1, 0], function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(0.30, 0.12, 0.20), M.alu, 0, 0, 0));
      for (var r = 0; r < 2; r++) for (var c = 0; c < 6; c++) {
        g.add(mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.032, 8), M.gold, -0.105 + c * 0.042, 0.075, -0.045 + r * 0.09));
      }
      for (var s = 0; s < 3; s++) {
        g.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 8), M.black, -0.155, -0.03 + s * 0.03, 0).rotateZ(Math.PI / 2));
      }
      var led = mesh(new THREE.BoxGeometry(0.03, 0.012, 0.012),
        new THREE.MeshStandardMaterial({ color: 0x143018, emissive: 0x35e07a, emissiveIntensity: 0 }), 0.11, 0.062, 0.09, false);
      g.add(led);
      g.userData.pled = led.material;
      return g;
    }, { dur: 1.2 });

    /* 11-12 · 星敏感器 ×2(镜头朝不同方向) */
    function buildST(tiltX, tiltY) {
      return function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(0.09, 0.04, 0.09), M.alu, 0, 0.02, 0));
        var head = new THREE.Group();
        head.position.y = 0.05;
        head.rotation.x = tiltX; head.rotation.y = tiltY;
        head.add(mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.20, 16), M.black, 0, 0.10, 0));
        head.add(mesh(new THREE.CylinderGeometry(0.063, 0.063, 0.06, 16), M.dark, 0, 0.22, 0));
        head.add(mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.008, 16), M.lens, 0, 0.252, 0, false));
        g.add(head);
        return g;
      };
    }
    def("st1", "STAR TRACKER A", "ST-300 · 0.001° ACC", [-0.38, 0.33, 0.18], 3, 0.15, [0, 0.26, 0], buildST(-0.55, 0.25), { dur: 1.15 });
    def("st2", "STAR TRACKER B", "ST-300 · 0.001° ACC", [-0.10, 0.33, 0.31], 3, 0.95, [0, 0.26, 0], buildST(-1.0, -0.45), { dur: 1.15 });

    /* 13 · 反作用飞轮 ×4(金字塔四斜置,转动画) */
    def("rw", "REACTION WHEELS ×4", "PYRAMID · 0.6 N·m", [0.38, 0.33, -0.24], 3, 1.9, [0, 0.16, 0], function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(0.36, 0.03, 0.36), M.dark, 0, 0.015, 0));
      [[-0.11, -0.11], [0.11, -0.11], [-0.11, 0.11], [0.11, 0.11]].forEach(function (c) {
        g.add(mesh(new THREE.BoxGeometry(0.09, 0.04, 0.09), M.alu, c[0], 0.05, c[1]));
        var w = new THREE.Group();
        w.position.set(c[0], 0.11, c[1]);
        w.rotation.z = c[0] > 0 ? -0.55 : 0.55;
        w.rotation.x = c[1] > 0 ? -0.55 : 0.55;
        w.add(mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.045, 20), M.black, 0, 0, 0));
        var rotor = new THREE.Group();
        rotor.add(mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.052, 20), M.dark, 0, 0, 0));
        rotor.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 10), M.alu, 0, 0, 0));
        for (var s = 0; s < 4; s++) {
          var sp = mesh(new THREE.BoxGeometry(0.1, 0.012, 0.02), M.alu, 0, 0, 0);
          sp.rotation.y = s * Math.PI / 2;
          sp.position.set(Math.cos(sp.rotation.y) * 0.03, 0, Math.sin(sp.rotation.y) * 0.03);
          rotor.add(sp);
        }
        w.add(rotor);
        wheelRotors.push(rotor);
        g.add(w);
      });
      return g;
    }, { dur: 1.25 });

    /* 14 · 磁力棒 ×2(展开竖起) */
    def("mag", "MAGNETORQUERS ×2", "ROD TYPE · 45 A·m²", [0, 0.33, 0.435], 3, 3.3, [0, 0.3, 0], function () {
      var g = new THREE.Group();
      [[-0.25], [0.25]].forEach(function (c) {
        var piv = new THREE.Group();
        piv.position.set(c[0], 0.01, 0);
        piv.rotation.x = -1.45;
        piv.add(mesh(new THREE.BoxGeometry(0.07, 0.02, 0.07), M.alu, 0, 0.01, 0));
        piv.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.46, 12), M.dark, 0, 0.25, 0));
        piv.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 8), M.gold, 0, 0.50, 0));
        magPivots.push(piv);
        g.add(piv);
      });
      return g;
    }, { dur: 1.2 });

    /* 15 · 高增益抛物面天线(撑杆展开 + 慢摆) */
    def("dish", "HGA · S-BAND DISH", "0.5 M · FOLD-OUT MAST", [-0.52, 0.33, 0.32], 4, 0.15, [0, 0.5, 0], function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(0.12, 0.04, 0.12), M.alu, 0, 0.02, 0));
      dishArm = new THREE.Group();
      dishArm.position.y = 0.04;
      dishArm.rotation.z = -1.4;
      dishArm.add(mesh(new THREE.BoxGeometry(0.045, 0.34, 0.045), M.alu, 0, 0.17, 0));
      dishHead = new THREE.Group();
      dishHead.position.y = 0.36;
      dishHead.rotation.x = -1.15;
      var pts = [];
      [[0.006, 0.0], [0.09, 0.012], [0.17, 0.048], [0.24, 0.105], [0.26, 0.125]].forEach(function (pt) {
        pts.push(new THREE.Vector2(pt[0], pt[1]));
      });
      dishHead.add(mesh(new THREE.LatheGeometry(pts, 34), M.white, 0, 0, 0));
      dishHead.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 8), M.alu, 0, 0.06, 0));
      // 馈源撑杆 ×3 + 副反射面
      for (var f = 0; f < 3; f++) {
        var a = f / 3 * Math.PI * 2;
        var strut = mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.16, 6), M.dark,
          Math.cos(a) * 0.21, 0.06, Math.sin(a) * 0.21);
        strut.lookAt(new THREE.Vector3(0, 0.17, 0));
        strut.rotateX(Math.PI / 2);
        dishHead.add(strut);
      }
      dishHead.add(mesh(new THREE.ConeGeometry(0.03, 0.05, 10), M.gold, 0, 0.17, 0));
      dishHead.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.008, 12), M.lens, 0, 0.195, 0, false).rotateX(Math.PI / 2));
      dishArm.add(dishHead);
      g.add(dishArm);
      dishGrp = g;
      return g;
    }, { dur: 1.25 });

    /* 16 · 低增益鞭天线 */
    def("whip", "UHF MONOPOLE", "TT&C · DEPLOYABLE", [-0.68, 0.33, -0.12], 4, 2.8, [0, 0.35, 0], function () {
      var g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(0.024, 0.03, 0.03, 12), M.alu, 0, 0.015, 0));
      whipPivot = new THREE.Group();
      whipPivot.position.y = 0.03;
      whipPivot.rotation.z = 1.5;
      whipPivot.add(mesh(new THREE.CylinderGeometry(0.007, 0.005, 0.46, 8), M.dark, 0, 0.23, 0));
      whipPivot.add(mesh(new THREE.SphereGeometry(0.014, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0xc23b30, roughness: 0.5 }), 0, 0.465, 0, false));
      g.add(whipPivot);
      return g;
    }, { dur: 1.1 });

    /* 太阳翼构建(右翼原型,左翼镜像) */
    var aluDS = M.alu.clone(); aluDS.side = THREE.DoubleSide;
    var edgeDS = M.wingEdge.clone(); edgeDS.side = THREE.DoubleSide;
    var ledMat = new THREE.MeshStandardMaterial({ color: 0x143018, emissive: 0x35e07a, emissiveIntensity: 0 });
    ledMats.push(ledMat);

    function buildWing() {
      var g = new THREE.Group();
      g.add(mesh(new THREE.BoxGeometry(0.1, 0.06, 0.4), aluDS, 0.78, 0.36, 0));
      var led = mesh(new THREE.BoxGeometry(0.018, 0.015, 0.34), ledMat, 0.822, 0.398, 0, false);
      g.add(led);
      var pivots = [], stX = [], depX = [];
      for (var i = 0; i < WING_N; i++) {
        var piv = new THREE.Group();
        var st = 0.845 + i * 0.058, dp = 0.835 + i * (WING_L + 0.002), py = 0.365;   // 展开共面,缝 2mm
        piv.position.set(st, py, 0);
        piv.rotation.z = Math.PI / 2;
        var slab = new THREE.Mesh(new THREE.BoxGeometry(WING_L, 0.022, 0.44),
          [edgeDS, edgeDS, M.cell, M.cellBack, edgeDS, edgeDS]);
        slab.position.set(WING_L / 2, 0, 0);
        slab.castShadow = true;
        piv.add(slab);
        var hinge = mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.42, 10), aluDS, 0, 0, 0);
        hinge.rotation.x = Math.PI / 2;   // 铰链筒与折叠轴(Z)共线
        piv.add(hinge);
        g.add(piv);
        pivots.push(piv); stX.push(st); depX.push(dp);
      }
      return { group: g, pivots: pivots, stX: stX, depX: depX, done: false };
    }

    var wr = buildWing();
    setAnchor(wr.group, 0.6, 0.35, 0);
    sat.add(wr.group);
    list.push({ id: "wingR", name: "SOLAR WING · +X", sub: "GA As · 380 W", group: wr.group, phase: 5, delay: 0.9, pos: new THREE.Vector3(0, 0, 0), yaw: 0, dur: 1.3, sealed: false });
    wings.push(wr);

    var wl = buildWing();
    wl.group.scale.x = -1;
    setAnchor(wl.group, 0.6, 0.35, 0);
    sat.add(wl.group);
    list.push({ id: "wingL", name: "SOLAR WING · -X", sub: "GA As · 380 W", group: wl.group, phase: 5, delay: 1.9, pos: new THREE.Vector3(0, 0, 0), yaw: 0, dur: 1.3, sealed: false });
    wings.push(wl);

    /* 17 · 压紧杆 ×2(火工解锁) */
    def("rods", "HOLD-DOWN ×2", "PYRO RELEASE · PRELOAD", [0, 0, 0], 5, 3.4, [0.9, 0.5, 0], function () {
      var g = new THREE.Group();
      [0.874, -0.874].forEach(function (rx) {   // 走板间空隙,不穿压紧板
        var rg = new THREE.Group();
        rg.position.set(rx, 0.78, 0);
        var mat = new THREE.MeshStandardMaterial({ color: 0xb9c0c8, metalness: 0.7, roughness: 0.35, transparent: true });
        var rod = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.62, 10), mat, 0, 0, 0);
        rod.rotation.x = Math.PI / 2;
        rg.add(rod);
        [-0.31, 0.31].forEach(function (zz) {
          rg.add(mesh(new THREE.SphereGeometry(0.02, 10, 8), mat, 0, 0, zz));
        });
        rg.add(mesh(new THREE.BoxGeometry(0.05, 0.032, 0.05), M.gold, 0, 0.01, 0));
        g.add(rg);
        rodItems.push({ g: rg, mat: mat, baseY: 0.78 });
      });
      [0.874, -0.874].forEach(function (rx) {
        var pl = new THREE.PointLight(0xff5038, 0, 2.6, 2);
        pl.position.set(rx, 0.82, 0);
        g.add(pl);
        pyro.push(pl);
      });
      return g;
    }, { dur: 1.2 });

    unitTotal = 19;
  }

  /* ============ 飞行控制 ============ */
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  function bez(p0, p1, p2, t) {
    var a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
    return new THREE.Vector3(
      a * p0.x + b * p1.x + c * p2.x,
      a * p0.y + b * p1.y + c * p2.y,
      a * p0.z + b * p1.z + c * p2.z
    );
  }

  function begin(phaseIdx, now) {
    flying = true; t0 = now;
    flightParts = [];
    list.forEach(function (p) {
      if (p.noFly || p.phase !== phaseIdx) return;
      p.sealed = false; p.landed = false; p.tagShown = false;
      p.group.visible = false;
      // 飞行起点:上方吊装(发动机等可用 from 指定侧向推入)
      var jit = (list.indexOf(p) % 5) * 0.22;
      p.start = p.from
        ? new THREE.Vector3(p.from[0], p.from[1], p.from[2])
        : new THREE.Vector3(p.pos.x + 0.5 - jit, p.pos.y + 4.4 + p.delay * 0.5, p.pos.z + 0.6 - jit * 0.7);
      p.mid = p.from
        ? new THREE.Vector3(p.pos.x * 0.5 + p.from[0] * 0.5, p.pos.y + 0.12, p.pos.z * 0.5 + p.from[2] * 0.5)
        : new THREE.Vector3(p.pos.x, p.pos.y + 2.0, p.pos.z);
      p.target = p.pos.clone();
      flightParts.push(p);
    });
  }

  /* ============ 脐带缆(地面接口 → 整星插座) ============ */
  function ensureUmbilical() {
    if (umb) return;
    var M = ORBW.Scene3D.M;
    var C = new THREE.Vector3();
    socketMesh.getWorldPosition(C);
    var A = new THREE.Vector3(0.35, 0.235, -1.52);
    var pts = [
      C, C.clone().add(new THREE.Vector3(-0.03, -0.20, -0.26)),
      new THREE.Vector3(C.x * 0.55, 0.17, C.z * 0.55 - 0.40),
      new THREE.Vector3(0.35, 0.16, -1.28), A
    ];
    var curve = new THREE.CatmullRomCurve3(pts);
    var mat = new THREE.MeshStandardMaterial({ color: 0x2e3238, roughness: 0.6, transparent: true });
    var grp = new THREE.Group();
    var tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.014, 8, false), mat);
    tube.castShadow = true;
    grp.add(tube);
    var plug = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.05), M.alu);
    plug.position.copy(C).add(new THREE.Vector3(0, 0, 0.03));
    grp.add(plug);
    setAnchor(grp, 0, 0.05, 0);
    ORBW.Scene3D.scene.add(grp);
    umb = { group: grp, mat: mat, state: "attached", t0: 0 };
    list.push({ id: "umb", name: "UMBILICAL · TM/TC", sub: "GROUND TEST LINK", group: grp, noFly: true, sealed: true });
  }

  function removeUmbilical() {
    if (!umb) return;
    ORBW.Scene3D.scene.remove(umb.group);
    umb.group.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
    for (var i = list.length - 1; i >= 0; i--) if (list[i].id === "umb") list.splice(i, 1);
    umb = null;
  }

  /* ============ 逐帧更新 ============ */
  function update(st) {
    clock += st.dt;

    /* 飞行中的零件 */
    if (flying) {
      flightParts.forEach(function (p) {
        if (p.sealed) return;
        var t = (st.now - t0 - p.delay * 1000) / (p.dur * 1000);
        if (t <= 0) return;
        if (!p.tagShown) {
          p.tagShown = true;
          p.group.visible = true;
          ORBW.Labels.announce(p.id, p.group, p.name, p.sub, st.now, 2400);
        }
        var q = ease(Math.min(t, 1));
        p.group.position.copy(bez(p.start, p.mid, p.target, q));
        p.group.rotation.y = p.yaw + (1 - q) * 1.1;
        if (t >= 1) {
          p.sealed = true; p.landed = true;
          p.landedAt = st.now;
          seated++;
          if (p.group.userData.bands) p.bandAt = st.now;
        }
      });
    }

    /* 贮箱扎带收紧 */
    tankParts.forEach(function (p) {
      if (!p.bandAt) return;
      var k = ease(Math.min((st.now - p.bandAt) / 550, 1));
      var s = 1 + 0.38 * (1 - k);
      p.group.userData.bands.scale.set(s, s, s);
    });

    /* 飞轮转速(相位 4 起旋) */
    var wf = st.wheelsOn || 0;
    wheelSpin = wf;
    if (wf > 0) {
      for (var w = 0; w < wheelRotors.length; w++) {
        wheelRotors[w].rotation.y += (6.5 + w * 1.3) * wf * st.dt;
      }
    }

    /* 磁力棒展开(相位 4 后段) */
    if (st.phaseIdx >= 3) {
      var mg = st.phaseIdx > 3 ? 1 : ease(Math.min(Math.max((st.phaseT - 3.6) / 1.4, 0), 1));
      magPivots.forEach(function (p) { p.rotation.x = -1.45 * (1 - mg); });
    }

    /* 高增益天线:撑杆展开 → 碟面仰起 → 慢摆 */
    if (st.phaseIdx >= 4) {
      var arm = st.phaseIdx > 4 ? 1 : ease(Math.min(Math.max((st.phaseT - 0.8) / 1.2, 0), 1));
      dishArm.rotation.z = -1.4 * (1 - arm);
      var til = st.phaseIdx > 4 ? 1 : ease(Math.min(Math.max((st.phaseT - 1.8) / 0.9, 0), 1));
      dishHead.rotation.x = -1.15 + 0.6 * til;
      var swayA = st.phaseIdx > 4 ? 1 : smooth((st.phaseT - 3.0) / 1.2);
      dishGrp.rotation.y = Math.sin(clock * 0.33) * 0.10 * swayA;
    }
    /* 鞭天线立起 */
    if (st.phaseIdx >= 4) {
      var wp = st.phaseIdx > 4 ? 1 : ease(Math.min(Math.max((st.phaseT - 2.8) / 1.0, 0), 1));
      whipPivot.rotation.z = 1.5 * (1 - wp);
    }

    /* 太阳翼逐板展开(相位 7):左右交替,每板 0.8s 转 90° */
    if (st.phaseIdx >= 6) {
      var order = [[0, 3], [1, 3], [0, 2], [1, 2], [0, 1], [1, 1], [0, 0], [1, 0]];   // 由外向内展开,避免扫过未展开板
      if (st.phaseIdx === 6) {
        order.forEach(function (o, k) {
          var p = (st.phaseT - (1.0 + k * 0.8)) / 0.8;
          applyPanel(wings[o[0]], o[1], ease(Math.min(Math.max(p, 0), 1)));
        });
      }
      wings.forEach(function (w, wi) {
        if (!w.done && panelSum(w) >= WING_N) w.done = true;
        if (w.done) {
          var sw = st.phaseIdx > 6 ? 0.02 : 0.016 * smooth((st.phaseT - 6.6) / 1.2);
          w.group.rotation.z = Math.sin(clock * 0.6 + wi) * sw;
        }
      });
      /* 确认灯带:展开完成段闪烁,入轨常亮 */
      var glow = 0.06;
      if (wings[0].done || wings[1].done) {
        glow = st.phaseIdx > 6 ? 1.1 : (Math.sin(clock * 9) > 0 ? 1.1 : 0.06);
      }
      ledMats.forEach(function (m) { m.emissiveIntensity = glow; });
    }

    /* 压紧杆火工解锁(相位 7 开头) */
    if (st.phaseIdx === 6 && !rodsReleased && st.phaseT > 0.25) {
      rodsReleased = true; rodT0 = clock;
    }
    if (rodsReleased) {
      var e = clock - rodT0;
      pyro.forEach(function (pl) { pl.intensity = Math.max(0, 3.4 * Math.exp(-e / 0.28)); });
      rodItems.forEach(function (r) {
        r.g.position.y = r.baseY + e * e * 0.9;
        r.g.rotation.z += st.dt * 2.2;
        r.mat.opacity = Math.max(0, 1 - e / 0.75);
        if (e > 0.8) r.g.visible = false;
      });
    }

    /* 脐带缆拔脱飘走(相位 8 前 2.5s) */
    if (umb && umb.state === "attached" && st.phaseIdx === 7 && st.phaseT > 0.6) {
      umb.state = "away"; umb.t0 = clock;
    }
    if (umb && umb.state === "away") {
      var u = clock - umb.t0;
      umb.group.position.y += st.dt * 0.30;
      umb.group.position.z -= st.dt * 0.12;
      umb.group.rotation.x += st.dt * 0.15;
      umb.mat.opacity = Math.max(0, 1 - u / 2.0);
      if (u > 2.1) { umb.group.visible = false; umb.state = "gone"; }
    }
  }

  function applyPanel(w, i, q) {
    var p = w.pivots[i];
    p.rotation.z = (1 - q) * Math.PI / 2;
    p.position.x = w.stX[i] + (w.depX[i] - w.stX[i]) * q;
  }
  function panelSum(w) {
    var s = 0;
    w.pivots.forEach(function (p) { s += 1 - p.rotation.z / (Math.PI / 2); });
    return s;
  }

  /* ============ 复位 / 跳转 ============ */
  function reset() {
    flying = false; seated = 0; flightParts = [];
    list.forEach(function (p) {
      p.sealed = false; p.landed = false; p.bandAt = 0;
      p.group.visible = false;
      p.group.position.copy(p.pos || p.group.position);
      p.group.rotation.set(0, p.yaw || 0, 0);
    });
    wings.forEach(function (w) {
      w.done = false;
      w.group.rotation.z = 0;
      for (var i = 0; i < WING_N; i++) applyPanel(w, i, 0);
    });
    rodItems.forEach(function (r) {
      r.g.position.y = r.baseY; r.g.rotation.z = 0; r.g.visible = false; r.mat.opacity = 1;
    });
    rodsReleased = false;
    pyro.forEach(function (pl) { pl.intensity = 0; });
    magPivots.forEach(function (p) { p.rotation.x = -1.45; });
    if (dishArm) dishArm.rotation.z = -1.4;
    if (dishHead) dishHead.rotation.x = -1.15;
    if (dishGrp) dishGrp.rotation.y = 0;
    if (whipPivot) whipPivot.rotation.z = 1.5;
    ledMats.forEach(function (m) { m.emissiveIntensity = 0; });
    removeUmbilical();
  }

  /* 跳转支持:相位 < idx 的零件直接落位(当前相位保持飞入演出) */
  function seatUpTo(idx, now) {
    reset();
    flying = false;
    list.forEach(function (p) {
      if (p.noFly) return;
      if (p.phase < idx) {
        p.sealed = true; p.landed = true;
        p.group.visible = true;
        p.group.position.copy(p.pos);
        p.group.rotation.set(0, p.yaw || 0, 0);
        seated++;
      }
    });
    if (idx >= 2) ensureUmbilical();
    if (idx >= 3) magPivots.forEach(function (p) { p.rotation.x = 0; });
    if (idx >= 4) {
      dishArm.rotation.z = 0;
      dishHead.rotation.x = -0.55;
      whipPivot.rotation.z = 0;
    }
    if (idx >= 5) {
      // 翼为挂装态(折叠);压紧杆显示
      rodItems.forEach(function (r) { r.g.visible = true; r.mat.opacity = 1; r.g.position.y = r.baseY; });
    }
    if (idx >= 7) deployInstant();
  }

  function deployInstant() {
    wings.forEach(function (w) {
      w.done = true;
      for (var i = 0; i < WING_N; i++) applyPanel(w, i, 1);
    });
    rodItems.forEach(function (r) { r.g.visible = false; });
    rodsReleased = true; rodT0 = clock - 2;
    pyro.forEach(function (pl) { pl.intensity = 0; });
    ledMats.forEach(function (m) { m.emissiveIntensity = 1.0; });
  }

  ORBW.Parts = {
    init: function () { buildAll(); reset(); },
    begin: begin,
    update: update,
    reset: reset,
    seatUpTo: seatUpTo,
    deployInstant: deployInstant,
    ensureUmbilical: ensureUmbilical,
    group: function (id) {
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].group;
      return null;
    },
    list: function () { return list; },
    sat: function () { return sat; },
    get seated() { return seated; },
    get unitTotal() { return unitTotal; },
    wingAngles: function () {
      return [Math.min(180, panelSum(wings[0]) / WING_N * 180), Math.min(180, panelSum(wings[1]) / WING_N * 180)];
    },
    wheelRpm: function () {
      var out = [];
      for (var i = 0; i < 4; i++) {
        out.push(Math.round((1350 + 850 * Math.sin(clock * 0.21 + i * 1.7) + i * 120) * Math.min(1, wheelSpin)));
      }
      return out;
    },
    setPcduLed: function (on) {
      var pcdu = null;
      list.forEach(function (p) { if (p.id === "pcdu") pcdu = p; });
      if (pcdu && pcdu.group.userData.pled) pcdu.group.userData.pled.emissiveIntensity = on ? 0.9 : 0;
    }
  };

  var wheelSpin = 0;
  Object.defineProperty(ORBW.Parts, "wheelSpin", {
    set: function (v) { wheelSpin = v; },
    get: function () { return wheelSpin; }
  });
})(window.ORBW = window.ORBW || {});
