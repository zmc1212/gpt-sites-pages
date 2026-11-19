/* 零件建模 + 分阶段飞入装配
   坐标约定:曲轴中心 (0, 1.55, 0),曲轴沿 X 轴;左右缸列容器旋转 ±45°,
   缸列内坐标 localY = 沿缸轴方向(上止点活塞销 1.89,缸体顶面 2.22) */
(function (V8SB) {
  var S3 = null, M = null, mesh = null, Em = null;
  var list = [];            // 可点击/可动画零件元数据
  var banks = {};           // 左右缸列静态容器
  var current = "";         // 当前阶段 id
  var fitted = 0;
  var PHASES = ["block", "crank", "pistons", "heads", "valvetrain", "intake", "ignition", "idle"];
  var SIDE = { L: 1, R: -1 };        // 缸列内侧符号(localZ + = 左列为谷侧)
  var WORLD_Z = { L: -1, R: 1 };     // 缸列在世界坐标的朝向

  function setAnchor(g, x, y, z) {
    g.userData.tagAnchor = new THREE.Vector3(x || 0, y || 0, z || 0);
  }

  function reg(id, name, sub, group, phase, anim, opts) {
    opts = opts || {};
    var p = {
      id: id, name: name, sub: sub, group: group, phase: phase,
      anim: anim || null, fitted: false, shown: false,
      silent: !!opts.silent, kind: opts.kind || null, idx: opts.idx || 0
    };
    list.push(p);
    return p;
  }

  /* ============ 建模工具 ============ */
  function cylG(rt, rb, h, seg, open) { return new THREE.CylinderGeometry(rt, rb, h, seg || 20, 1, !!open); }
  function boxG(x, y, z) { return new THREE.BoxGeometry(x, y, z); }
  function torG(r, t) { return new THREE.TorusGeometry(r, t, 10, 28); }

  /* ============ 缸体 ============ */
  function buildBlock() {
    var g = new THREE.Group();
    g.add(mesh(boxG(4.7, 0.65, 1.9), M.block, 0, 1.425, 0));           // 曲轴箱
    [-0.81, 0.81].forEach(function (z) {                                // 侧裙
      g.add(mesh(boxG(4.7, 0.5, 0.28), M.block, 0, 1.03, z));
    });
    g.add(mesh(boxG(4.55, 0.5, 1.0), M.block, 0, 1.95, 0));            // V 谷底
    [-1.9, 1.9].forEach(function (x) {                                  // 机脚
      [-0.6, 0.6].forEach(function (z) {
        g.add(mesh(boxG(0.5, 0.16, 0.3), M.block, x, 0.86, z));
      });
    });
    [-1.2, 0, 1.2].forEach(function (x) {                               // 水堵
      [-0.956, 0.956].forEach(function (z) {
        var p = mesh(cylG(0.11, 0.11, 0.04, 14), M.crank, x, 1.45, z);
        p.rotation.x = Math.PI / 2;
        g.add(p);
      });
    });
    var st = mesh(new THREE.PlaneGeometry(2.3, 0.58), M.stamp, 0, 1.42, 0.957, false, false);
    g.add(st);
    var st2 = st.clone(); st2.rotation.y = Math.PI; st2.position.z = -0.957;
    g.add(st2);
    // 两列缸体 + 缸孔
    ["L", "R"].forEach(function (b) {
      var sub = new THREE.Group();
      sub.position.set(0, Em.math.CRANK_Y, 0);
      sub.rotation.x = Em.math.PSI_BANK_RAD[b];
      sub.add(mesh(boxG(4.55, 1.86, 1.15), M.block, 0, 1.30, 0));
      for (var i = 1; i <= 8; i++) {
        if (Em.math.BANK_OF[i] !== b) continue;
        var x = Em.math.X_OF[i];
        var liner = mesh(cylG(0.505, 0.505, 1.46, 24, true), M.liner, x, 1.5, 0, false, false);
        sub.add(liner);
        var disc = mesh(new THREE.CircleGeometry(0.5, 24), M.bore, x, 2.225, 0, false, false);
        disc.rotation.x = -Math.PI / 2;
        sub.add(disc);
        var ring = mesh(torG(0.53, 0.018), M.alu, x, 2.235, 0, false, false);
        ring.rotation.x = Math.PI / 2;
        sub.add(ring);
      }
      g.add(sub);
    });
    setAnchor(g, 0, 2.5, 0);
    return g;
  }

  /* ============ 曲轴 ============ */
  function buildCrank() {
    var g = new THREE.Group();
    var snout = mesh(cylG(0.11, 0.11, 0.62, 16), M.crank, -2.6, 0, 0);
    snout.rotation.z = Math.PI / 2;
    g.add(snout);
    var flange = mesh(cylG(0.2, 0.2, 0.12, 20), M.crank, 2.36, 0, 0);
    flange.rotation.z = Math.PI / 2;
    g.add(flange);
    var mains = [-2.2, -1.135, 0, 1.135, 2.2];
    mains.forEach(function (x) {
      var j = mesh(cylG(0.21, 0.21, 0.3, 18), M.crank, x, 0, 0);
      j.rotation.z = Math.PI / 2;
      g.add(j);
    });
    // 四拐:1&2 / 3&4 / 5&6 / 7&8 共拐,十字排布
    var throws = [
      { x: -1.7, phi: -45 }, { x: -0.565, phi: 225 },
      { x: 0.565, phi: 45 }, { x: 1.7, phi: 135 }
    ];
    throws.forEach(function (t) {
      var tg = new THREE.Group();
      tg.position.x = t.x;
      tg.rotation.x = t.phi * Em.math.D2R;
      [0.14, -0.14].forEach(function (wx) {
        tg.add(mesh(boxG(0.1, 0.62, 0.34), M.crank, wx, 0.2, 0));
      });
      var pin = mesh(cylG(0.155, 0.155, 0.36, 16), M.crank, 0, 0.44, 0);
      pin.rotation.z = Math.PI / 2;
      tg.add(pin);
      // 平衡重(扇形挤出体,指向曲拐反方向)
      var shp = new THREE.Shape();
      shp.moveTo(0, 0);
      shp.absarc(0, 0, 0.52, Math.PI * 1.14, Math.PI * 1.86, false);
      shp.closePath();
      var cwGeo = new THREE.ExtrudeGeometry(shp, { depth: 0.1, bevelEnabled: false });
      var cw = new THREE.Mesh(cwGeo, M.crank);
      cw.rotation.y = Math.PI / 2;
      cw.position.set(-0.19, 0, -0.05);
      cw.castShadow = true;
      tg.add(cw);
      g.add(tg);
    });
    setAnchor(g, 0, 0.75, 0);
    return g;
  }

  /* ============ 主轴承盖 ×5 ============ */
  function buildCap(mx, k) {
    var g = new THREE.Group();
    g.position.set(mx, 0, 0);
    g.add(mesh(boxG(0.36, 0.26, 0.46), M.iron, 0, 1.21, 0));
    [-0.11, 0.11].forEach(function (bx) {
      g.add(mesh(cylG(0.028, 0.028, 0.16, 8), M.crank, bx, 0.98, 0));
    });
    setAnchor(g, 0, 1.35, 0);
    return g;
  }

  /* ============ 油底壳 ============ */
  function buildPan() {
    var g = new THREE.Group();
    g.add(mesh(boxG(4.5, 0.32, 1.5), M.iron, 0, 0.86, 0));
    g.add(mesh(boxG(2.3, 0.4, 1.34), M.iron, 0.3, 0.5, 0));
    var drain = mesh(cylG(0.05, 0.05, 0.06, 10), M.hex, 0.3, 0.28, 0.25);
    g.add(drain);
    setAnchor(g, 0, 0.9, 0);
    return g;
  }

  /* ============ 曲轴皮带轮(V 带槽)+ 风扇 ============ */
  function buildPulley() {
    var g = new THREE.Group();
    var pts = [
      new THREE.Vector2(0.13, 0), new THREE.Vector2(0.44, 0),
      new THREE.Vector2(0.44, 0.045), new THREE.Vector2(0.29, 0.09),
      new THREE.Vector2(0.44, 0.135), new THREE.Vector2(0.44, 0.18),
      new THREE.Vector2(0.29, 0.225), new THREE.Vector2(0.44, 0.27),
      new THREE.Vector2(0.44, 0.315), new THREE.Vector2(0.13, 0.315)
    ];
    var lat = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), M.iron);
    lat.rotation.z = -Math.PI / 2;
    lat.position.x = -0.157;
    lat.castShadow = true;
    g.add(lat);
    var hub = mesh(cylG(0.13, 0.13, 0.34, 16), M.crank, 0, 0, 0);
    hub.rotation.z = Math.PI / 2;
    g.add(hub);
    setAnchor(g, -0.1, 0.4, 0);
    return g;
  }

  function buildFan() {
    var g = new THREE.Group();
    var hub = mesh(cylG(0.12, 0.12, 0.14, 16), M.iron, 0, 0, 0);
    hub.rotation.z = Math.PI / 2;
    g.add(hub);
    for (var i = 0; i < 6; i++) {
      var arm = new THREE.Group();
      arm.rotation.x = i / 6 * Math.PI * 2;
      var blade = mesh(boxG(0.035, 0.46, 0.17), M.iron, 0, 0.28, 0);
      blade.rotation.y = 0.55;
      arm.add(blade);
      g.add(arm);
    }
    setAnchor(g, 0, 0.52, 0);
    return g;
  }

  /* ============ 活塞(银 + 环槽纹)与连杆(工字截面) ============ */
  function buildPiston(ci) {
    var g = new THREE.Group();
    var body = new THREE.Mesh(cylG(0.5, 0.5, 0.66, 28, true), M.piston);
    body.castShadow = true;
    g.add(body);
    g.add(mesh(cylG(0.495, 0.495, 0.024, 28), M.pistonTop, 0, 0.325, 0));
    [0.24, 0.17].forEach(function (y) {
      var ring = mesh(torG(0.5, 0.013), M.ring, 0, y, 0, false);
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
    });
    var pin = mesh(cylG(0.09, 0.09, 0.6, 12), M.crank, 0, 0, 0);
    pin.rotation.z = Math.PI / 2;
    g.add(pin);
    setAnchor(g, 0, 0.42, 0);
    return g;
  }

  function buildRod(ci) {
    var g = new THREE.Group();
    g.add(mesh(boxG(0.05, 1.15, 0.09), M.crank, 0, -0.725, 0));
    [-0.052, 0.052].forEach(function (z) {
      g.add(mesh(boxG(0.09, 1.15, 0.024), M.crank, 0, -0.725, z));
    });
    var big = mesh(torG(0.185, 0.075), M.crank, 0, -1.45, 0);
    big.rotation.y = Math.PI / 2;
    g.add(big);
    var small = mesh(torG(0.095, 0.05), M.crank, 0, 0, 0);
    small.rotation.y = Math.PI / 2;
    g.add(small);
    [-0.17, 0.17].forEach(function (z) {
      g.add(mesh(cylG(0.026, 0.026, 0.12, 8), M.dark, 0, -1.45, z));
    });
    setAnchor(g, 0, -0.7, 0);
    return g;
  }

  /* ============ 缸盖 + 凸轮轴(每列) ============ */
  function buildHead(bank) {
    var side = SIDE[bank];
    var g = new THREE.Group();
    g.add(mesh(boxG(4.5, 0.34, 1.15), M.head, 0, 2.40, 0));
    for (var i = 1; i <= 8; i++) {
      if (Em.math.BANK_OF[i] !== bank) continue;
      var x = Em.math.X_OF[i];
      g.add(mesh(boxG(0.34, 0.18, 0.18), M.head, x, 2.42, -0.60 * side));   // 排气口座
      g.add(mesh(boxG(0.34, 0.16, 0.26), M.head, x, 2.52, 0.40 * side));    // 进气口座
    }
    [-2.1, -1.135, 0, 1.135, 2.1].forEach(function (xm) {
      g.add(mesh(boxG(0.22, 0.44, 0.52), M.head, xm, 2.79, 0));             // 凸轮塔
    });
    setAnchor(g, 0, 2.85, 0);
    return g;
  }

  /* 圆柱连杆助手:两端点 + 半径 */
  function linkRod(parent, a, b, r, mat) {
    var dir = new THREE.Vector3().subVectors(b, a);
    var len = Math.max(0.01, dir.length());
    var c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 8), mat || M.dark);
    c.position.copy(a).add(b).multiplyScalar(0.5);
    c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    c.castShadow = true;
    parent.add(c);
    return c;
  }

  /* ============ 谷内单凸轮轴(OHV:凸轮在缸体谷底,16 桃尖,半曲轴速) ============ */
  function buildCamValley(lobes, lifterBy) {
    var g = new THREE.Group();
    var shaft = mesh(cylG(0.065, 0.065, 4.4, 14), M.cam, 0, 1.85, 0);
    shaft.rotation.z = Math.PI / 2;
    g.add(shaft);
    var gear = mesh(cylG(0.30, 0.30, 0.06, 24), M.cam, -2.15, 1.85, 0);
    gear.rotation.z = Math.PI / 2;
    g.add(gear);
    var cs = mesh(cylG(0.15, 0.15, 0.06, 18), M.cam, -2.2, 1.55, 0);   // 曲轴链轮
    cs.rotation.z = Math.PI / 2;
    g.add(cs);
    linkRod(g, v3(-2.2, 1.70, 0), v3(-2.15, 2.15, 0), 0.022);           // 正时链上段
    linkRod(g, v3(-2.2, 1.40, 0), v3(-2.15, 1.55, 0), 0.022);           // 正时链下段
    for (var i = 1; i <= 8; i++) {
      var x = Em.math.X_OF[i];
      [["in", -0.11], ["ex", 0.11]].forEach(function (t) {
        var lobe = new THREE.Group();       // 桃尖子组:rotation.x = Θ/2 + λ
        lobe.position.set(x, 1.85, t[1]);
        lobe.add(mesh(cylG(0.105, 0.105, 0.09, 14), M.cam, 0, 0, 0));
        lobe.add(mesh(boxG(0.085, 0.11, 0.085), M.cam, 0, 0.125, 0));
        var peak = Em.math.FIRE_AT[i] + (t[0] === "in" ? 466.5 : 249.5);
        lobe.rotation.x = Math.PI - peak * Em.math.D2R / 2;
        g.add(lobe);
        lobes.push({ sub: lobe, lambda: Math.PI - peak * Em.math.D2R / 2, cyl: i, type: t[0] });
        var lifter = mesh(cylG(0.075, 0.075, 0.14, 12), M.hex, x, 1.92, t[1]);   // 挺柱
        g.add(lifter);
        lifterBy[i + ":" + t[0]] = lifter;
      });
    }
    setAnchor(g, 0, 1.85, 0);
    return g;
  }

  /* ============ 气门 + 弹簧 + 摇臂(16 组) ============ */
  function buildValveUnit(bank, ci, type) {
    var side = SIDE[bank];
    var zv = (type === "in" ? 0.22 : -0.22) * side;
    var g = new THREE.Group();
    g.position.set(Em.math.X_OF[ci], 2.30, zv);
    var dv = type === "in" ? 0.21 : 0.165;                    // 进 1.94 IN / 排 1.50 IN
    g.add(mesh(cylG(dv, dv * 0.79, 0.05, 18), M.valve, 0, 0.02, 0));
    g.add(mesh(cylG(0.028, 0.028, 0.52, 10), M.valve, 0, 0.28, 0));
    // 螺旋弹簧(TubeGeometry,坐在缸盖上缘)
    var hp = [];
    for (var s = 0; s <= 26; s++) {
      var t = s / 26;
      hp.push(new THREE.Vector3(Math.cos(t * Math.PI * 12) * 0.085, t * 0.30, Math.sin(t * Math.PI * 12) * 0.085));
    }
    var spring = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hp), 48, 0.017, 5, false), M.spring);
    spring.position.set(0, 0.275, 0);
    spring.castShadow = false;
    g.add(spring);
    var retainer = mesh(cylG(0.07, 0.05, 0.035, 12), M.valve, 0, 0.575, 0);
    g.add(retainer);
    // 摇臂:支点偏置于缸盖立柱上,梁跨向气门杆(真实 OHV 杠杆)
    var rocker = new THREE.Group();
    rocker.position.set(0, 0.62, -0.13 * side);
    rocker.add(mesh(boxG(0.1, 0.035, 0.30), M.hex, 0, 0, 0.13 * side));
    var pv = mesh(cylG(0.03, 0.03, 0.1, 8), M.dark, 0, 0.02, 0);
    pv.rotation.z = Math.PI / 2;
    rocker.add(pv);
    g.add(rocker);
    g.add(mesh(cylG(0.03, 0.045, 0.06, 8), M.dark, 0, 0.585, -0.13 * side));   // 支点立柱
    setAnchor(g, 0, 0.8, 0);
    return { group: g, spring: spring, retainer: retainer, rocker: rocker, rockerSign: type === "in" ? 1 : -1, cyl: ci, type: type };
  }

  /* ============ 火花塞(瓷白 + 六角钢) ============ */
  function buildPlug(bank, ci) {
    var side = SIDE[bank];
    var tilt = new THREE.Group();
    tilt.position.set(Em.math.X_OF[ci], 2.48, -0.52 * side);
    tilt.rotation.x = -side * 0.9;
    var spin = new THREE.Group();
    tilt.add(spin);
    spin.add(mesh(cylG(0.028, 0.028, 0.09, 8), M.hex, 0, 0.06, 0));
    spin.add(mesh(cylG(0.055, 0.062, 0.2, 14), M.porcelain, 0, -0.09, 0));
    spin.add(mesh(cylG(0.075, 0.075, 0.1, 6), M.hex, 0, -0.235, 0));
    spin.add(mesh(cylG(0.048, 0.048, 0.14, 12), M.crank, 0, -0.36, 0));
    spin.add(mesh(cylG(0.012, 0.012, 0.07, 6), M.crank, 0, -0.44, 0));
    spin.add(mesh(boxG(0.02, 0.02, 0.08), M.crank, 0, -0.455, 0.045));
    var sparkMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xff7a30, emissiveIntensity: 0, roughness: 0.4 });
    var spark = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), sparkMat);
    spark.position.set(0, -0.5, 0);
    spark.scale.setScalar(0.001);
    spin.add(spark);
    setAnchor(tilt, 0, 0.15, 0);
    return { tilt: tilt, spin: spin, spark: spark };
  }

  /* ============ 进气歧管(中央双平面)+ 化油器(四腔双圆喉) ============ */
  function buildIntake() {
    var g = new THREE.Group();
    g.add(mesh(boxG(3.5, 0.14, 2.7), M.alu, 0, 3.60, 0));
    [-0.52, 0.52].forEach(function (z) {
      g.add(mesh(boxG(3.3, 0.5, 0.68), M.alu, 0, 3.94, z));
    });
    for (var i = 1; i <= 8; i++) {
      var wz = WORLD_Z[Em.math.BANK_OF[i]];
      var x = Em.math.X_OF[i];
      var c = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, 3.78, 0.82 * wz),
        new THREE.Vector3(x, 3.74, 1.1 * wz),
        new THREE.Vector3(x, 3.86, 1.35 * wz)
      ]);
      g.add(mesh(new THREE.TubeGeometry(c, 8, 0.075, 8, false), M.alu, 0, 0, 0));
    }
    g.add(mesh(boxG(1.05, 0.1, 0.75), M.alu, 0, 4.24, 0));
    g.add(mesh(boxG(0.6, 0.12, 1.0), M.alu, 1.95, 3.68, 0));
    setAnchor(g, 0, 4.4, 0);
    return g;
  }

  function buildCarb() {
    var g = new THREE.Group();
    g.add(mesh(boxG(0.92, 0.08, 0.7), M.alu, 0, 0.04, 0));
    g.add(mesh(boxG(0.74, 0.3, 0.62), M.alu, 0, 0.23, 0.02));
    g.add(mesh(boxG(0.82, 0.14, 0.68), M.alu, 0, 0.45, 0));
    [-0.17, 0.17].forEach(function (x) {
      [-0.15, 0.15].forEach(function (z) {
        g.add(mesh(cylG(0.075, 0.075, 0.1, 14), M.crank, x, 0.56, z));
        var vr = mesh(torG(0.085, 0.015), M.crank, x, 0.61, z, false);
        vr.rotation.x = Math.PI / 2;
        g.add(vr);
      });
      var horn = mesh(cylG(0.16, 0.125, 0.18, 18), M.alu, x, 0.62, 0);
      g.add(horn);
      var lip = mesh(torG(0.16, 0.02), M.alu, x, 0.71, 0, false);
      lip.rotation.x = Math.PI / 2;
      g.add(lip);
    });
    var inlet = mesh(cylG(0.04, 0.04, 0.14, 10), M.hex, 0.45, 0.26, 0);
    inlet.rotation.z = Math.PI / 2;
    g.add(inlet);
    var link = mesh(cylG(0.015, 0.015, 0.6, 8), M.hex, 0, 0.38, 0.42);
    link.rotation.z = Math.PI / 2;
    g.add(link);
    setAnchor(g, 0, 0.85, 0);
    return g;
  }

  /* ============ 排气歧管(铸铁 4-1 弯管,每列) ============ */
  function buildExhaust(bank) {
    var o = -SIDE[bank];   // 外侧符号(localZ)
    var g = new THREE.Group();
    for (var i = 1; i <= 8; i++) {
      if (Em.math.BANK_OF[i] !== bank) continue;
      var x = Em.math.X_OF[i];
      var c = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x - 0.05, 2.5, 0.52 * o),
        new THREE.Vector3(x, 2.25, 0.82 * o),
        new THREE.Vector3(x, 1.85, 0.88 * o),
        new THREE.Vector3(x, 1.52, 0.85 * o)
      ]);
      g.add(mesh(new THREE.TubeGeometry(c, 20, 0.105, 10, false), M.iron, 0, 0, 0));
    }
    var col = mesh(cylG(0.13, 0.13, 4.45, 14), M.iron, 0.225, 1.5, 0.85 * o);
    col.rotation.z = Math.PI / 2;
    g.add(col);
    var oc = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.45, 1.5, 0.85 * o),
      new THREE.Vector3(2.72, 1.4, 0.9 * o),
      new THREE.Vector3(2.88, 1.12, 0.92 * o)
    ]);
    g.add(mesh(new THREE.TubeGeometry(oc, 12, 0.13, 10, false), M.iron, 0, 0, 0));
    var fl = mesh(cylG(0.16, 0.16, 0.05, 14), M.iron, 2.88, 1.09, 0.92 * o);
    fl.rotation.x = 0.9;
    g.add(fl);
    setAnchor(g, 0, 1.7, 0.85 * o);
    return g;
  }

  /* ============ 分电器 + 高压线 ============ */
  function buildDistributor() {
    var g = new THREE.Group();
    g.position.set(2.05, 3.72, 0);
    g.add(mesh(cylG(0.15, 0.17, 0.32, 16), M.cam, 0, 0.16, 0));
    g.add(mesh(cylG(0.13, 0.13, 0.16, 14), M.cam, 0, 0.36, 0));
    g.add(mesh(cylG(0.185, 0.155, 0.22, 18), M.cam, 0, 0.55, 0));
    g.add(mesh(new THREE.SphereGeometry(0.15, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.cam, 0, 0.66, 0));
    for (var k = 0; k < 8; k++) {
      var a = -Math.PI / 2 + k * Math.PI / 4;
      var tx = Math.cos(a) * 0.15, tz = Math.sin(a) * 0.15;
      g.add(mesh(cylG(0.036, 0.036, 0.1, 8), M.cam, tx, 0.62, tz));
      g.add(mesh(cylG(0.018, 0.018, 0.06, 8), M.hex, tx, 0.68, tz));
    }
    setAnchor(g, 0, 0.9, 0);
    return g;
  }

  /* ============ 注册:建模 + 飞入动画 ============ */
  var animMeta = { pistons: {}, rods: {}, valves: [], lobes: [], sparks: {} };

  function registerAll() {
    var block = buildBlock();
    S3.scene.add(block);
    reg("block", "ENGINE BLOCK", "IRON 151 · 90° V · BORE 4.00 IN", block, "block",
      { type: "arc", from: v3(-5.5, 3.4, -5.5), mid: v3(-1.6, 4.9, -2.4), to: v3(0, 0, 0), delay: 0.3, dur: 2.2 });

    var crank = buildCrank();
    S3.scene.add(crank);
    reg("crank", "FORGED CRANKSHAFT", "CROSS-PLANE · STROKE 3.48 IN", crank, "crank",
      { type: "move", from: v3(-7.5, Em.math.CRANK_Y, 0.5), to: v3(0, Em.math.CRANK_Y, 0), delay: 0.25, dur: 2.4 });

    var mains = [-2.2, -1.135, 0, 1.135, 2.2];
    mains.forEach(function (mx, k) {
      var cap = buildCap(mx, k);
      S3.scene.add(cap);
      reg("cap" + k, "MAIN BEARING CAP #" + (k + 1), "5-MAIN · TWO-BOLT", cap, "crank",
        { type: "arc", from: v3(mx, 0.12, -3.4), mid: v3(mx, 0.75, -1.7), to: v3(mx, 0, 0), delay: 2.8 + k * 0.25, dur: 0.9 },
        { silent: true });
    });

    var pulley = buildPulley();
    S3.scene.add(pulley);
    reg("pulley", "CRANK PULLEY", "V-BELT GROOVE · DOUBLE SHEAVE", pulley, "crank",
      { type: "arc", from: v3(-6.8, 0.7, 1.0), mid: v3(-4.6, 1.3, 0.5), to: v3(-2.72, Em.math.CRANK_Y, 0), delay: 4.35, dur: 0.9 });

    var fan = buildFan();
    S3.scene.add(fan);
    reg("fan", "COOLING FAN", "6-BLADE · CRANK DRIVE", fan, "crank",
      { type: "arc", from: v3(-7.2, 1.2, -0.9), mid: v3(-5.0, 1.7, -0.4), to: v3(-3.0, Em.math.CRANK_Y, 0), delay: 4.55, dur: 0.9 });

    var pan = buildPan();
    S3.scene.add(pan);
    reg("pan", "OIL PAN", "STAMPED STEEL · 5 QT SUMP", pan, "crank",
      { type: "arc", from: v3(0, 0.06, -3.8), mid: v3(0, 0.4, -1.8), to: v3(0, 0, 0), delay: 4.9, dur: 1.0 });

    // 8 组活塞连杆:按点火顺序依次落入
    Em.math.FIRE_ORDER.forEach(function (ci, k) {
      var bank = Em.math.BANK_OF[ci];
      var alpha0 = Em.math.cylAlpha(ci, 0);
      var s0 = Em.math.pistonS(alpha0);
      var x = Em.math.X_OF[ci];
      var pst = buildPiston(ci);
      banks[bank].add(pst);
      var delay = 0.5 + k * 0.7;
      reg("piston" + ci, "PISTON + ROD · CYL " + ci, "FIRES AT " + Em.math.FIRE_AT[ci] + "° / 720°", pst, "pistons",
        { type: "move", from: v3(x, s0 + 2.6, 0), to: v3(x, s0, 0), delay: delay, dur: 1.15 });
      animMeta.pistons[ci] = pst;
      var rod = buildRod(ci);
      rod.rotation.x = Em.math.rodTilt(alpha0);
      banks[bank].add(rod);
      var rx = x + (bank === "L" ? -0.08 : 0.08);   // 同轴颈连杆并置(bank stagger)
      reg("rod" + ci, "CONNECTING ROD · CYL " + ci, "FORGED I-BEAM · 5.7 IN", rod, "pistons",
        { type: "move", from: v3(rx, s0 + 2.6, 0), to: v3(rx, s0, 0), delay: delay, dur: 1.15 },
        { silent: true, kind: "rod" });
      animMeta.rods[ci] = rod;
    });

    // 缸盖 ×2
    ["L", "R"].forEach(function (bank, bi) {
      var head = buildHead(bank);
      banks[bank].add(head);
      reg("head" + bank, "CYLINDER HEAD · " + bank + " BANK", "WEDGE CHAMBER · 64 CC", head, "heads",
        { type: "move", from: v3(0, 2.1, 0), to: v3(0, 0, 0), delay: 0.3 + bi * 0.45, dur: 1.6 });
    });

    // 谷内单凸轮轴(OHV)+ 正时链 + 挺柱 + 推杆
    var lobes = [];
    var lifterBy = {};
    var cam = buildCamValley(lobes, lifterBy);
    S3.scene.add(cam);
    reg("cam", "CAMSHAFT · IN-BLOCK VALLEY", "HALF CRANK SPEED · LOBES 16 · TIMING CHAIN", cam, "heads",
      { type: "move", from: v3(-6.8, 0, 0), to: v3(0, 0, 0), delay: 2.3, dur: 1.5 });
    animMeta.lobes = animMeta.lobes.concat(lobes);
    ["L", "R"].forEach(function (bank) {
      var rad = Em.math.PSI_BANK_RAD[bank], side = SIDE[bank];
      for (var i = 1; i <= 8; i++) {
        if (Em.math.BANK_OF[i] !== bank) continue;
        [["in", -0.11], ["ex", 0.11]].forEach(function (t) {
          var zv = (t[0] === "in" ? 0.22 : -0.22) * side;
          var lf = lifterBy[i + ":" + t[0]];
          if (!lf) return;
          // 推杆:挺柱顶 → 摇臂支点(跨谷,沿缸列 45°)
          var lx = Em.math.X_OF[i], ly = 2.92, lz = zv - 0.13 * side;
          var fy = Em.math.CRANK_Y + ly * Math.cos(rad) - lz * Math.sin(rad);
          var fz = ly * Math.sin(rad) + lz * Math.cos(rad);
          linkRod(cam, v3(lx, 2.0, t[1]), v3(lx, fy, fz), 0.02, M.crank);
        });
      }
    });

    // 16 组气门 + 弹簧 + 摇臂
    Em.math.FIRE_ORDER.forEach(function (ci, k) {
      var bank = Em.math.BANK_OF[ci];
      ["in", "ex"].forEach(function (type) {
        var unit = buildValveUnit(bank, ci, type);
        unit.lifter = lifterBy[ci + ":" + type];            // 挺柱(谷内单凸轮上,随升程滑动)
        banks[bank].add(unit.group);
        var side = SIDE[bank];
        var zv = (type === "in" ? 0.22 : -0.22) * side;
        var idx = animMeta.valves.length;
        animMeta.valves.push(unit);
        var vmeta = reg("valve" + ci + type, "VALVE & SPRING · CYL " + ci + (type === "in" ? " IN" : " EX"),
          type === "in" ? "INTAKE · 1.94 IN HEAD" : "EXHAUST · 1.50 IN HEAD",
          unit.group, "valvetrain",
          { type: "arc", from: v3(Em.math.X_OF[ci] + 0.4, 4.7, zv + 0.9 * side), mid: v3(Em.math.X_OF[ci], 3.9, zv), to: v3(Em.math.X_OF[ci], 2.30, zv), delay: 0.3 + k * 0.16 + (type === "ex" ? 0.07 : 0), dur: 0.85 },
          { silent: true, kind: "valve", idx: idx });
        vmeta.valveIdx = idx;
      });
    });

    // 进气歧管 + 化油器 + 排气歧管 ×2
    var intake = buildIntake();
    S3.scene.add(intake);
    reg("intake", "INTAKE MANIFOLD", "DUAL PLANE · ALUMINUM", intake, "intake",
      { type: "move", from: v3(0, 2.5, 0), to: v3(0, 0, 0), delay: 0.3, dur: 1.6 });
    var carb = buildCarb();
    S3.scene.add(carb);
    carb.position.set(0, 4.29, 0);
    reg("carb", "CARBURETOR", "4-BBL · DUAL THROAT", carb, "intake",
      { type: "move", from: v3(0, 6.6, 0), to: v3(0, 4.29, 0), delay: 1.8, dur: 1.1 });
    ["L", "R"].forEach(function (bank, bi) {
      var ex = buildExhaust(bank);
      banks[bank].add(ex);
      var o = -SIDE[bank];
      reg("ex" + bank, "EXHAUST MANIFOLD · " + bank + " BANK", "CAST IRON · 4-1 COLLECTOR", ex, "intake",
        { type: "move", from: v3(0, -0.35, 3.2 * o), to: v3(0, 0, 0), delay: 2.9 + bi * 0.4, dur: 1.2 });
    });

    // 分电器 + 8 火花塞(拧入)+ 8 高压线(生长)
    var dist = buildDistributor();
    S3.scene.add(dist);
    reg("dist", "DISTRIBUTOR", "CAP ORDER 1-8-4-3-6-5-7-2", dist, "ignition",
      { type: "arc", from: v3(2.05, 6.1, 0), mid: v3(2.3, 5.2, 0.4), to: v3(2.05, 3.72, 0), delay: 0.25, dur: 1.05 });

    var sparkLight = new THREE.PointLight(0xff8a4a, 0, 3.4);
    S3.scene.add(sparkLight);

    Em.math.FIRE_ORDER.forEach(function (ci, k) {
      var bank = Em.math.BANK_OF[ci];
      var plug = buildPlug(bank, ci);
      banks[bank].add(plug.tilt);
      var side = SIDE[bank];
      var to = v3(Em.math.X_OF[ci], 2.48, -0.52 * side);
      var axis = v3(0, 0.62 * 0.45, -side * 0.783 * 0.45);   // 沿塞轴向外退 0.45(端子侧)
      reg("plug" + ci, "SPARK PLUG · CYL " + ci, "RESISTOR · 0.035 IN GAP", plug.tilt, "ignition",
        { type: "screw", from: to.clone().add(axis), to: to, delay: 1.2 + k * 0.3, dur: 0.8, spin: Math.PI * 4, spinGroup: plug.spin });
      animMeta.sparks[ci] = { mesh: plug.spark, spin: plug.spin, tilt: plug.tilt };
    });

    S3.scene.updateMatrixWorld(true);

    // 火花塞尖端世界坐标 + 热浪出口
    var tips = {}, heatOutlets = [];
    ["L", "R"].forEach(function (bank) {
      var side = SIDE[bank];
      for (var ci = 1; ci <= 8; ci++) {
        if (Em.math.BANK_OF[ci] !== bank) continue;
        var sp = animMeta.sparks[ci];
        var tip = sp.tilt.localToWorld(v3(0, -0.5, 0)).clone();
        tips[ci] = { mesh: sp.mesh, tip: tip };
      }
      var o = -side;
      var outPos = banks[bank].localToWorld(v3(2.88, 1.12, 0.92 * o)).clone();
      var outDir = v3(0.12, 0.9, 0.3 * o).transformDirection(banks[bank].matrixWorld).normalize();
      heatOutlets.push({ pos: outPos, dir: outDir });
    });

    // 高压线:分电器塔 → 火花塞端子,生长式出现
    Em.math.FIRE_ORDER.forEach(function (ci, k) {
      var bank = Em.math.BANK_OF[ci];
      var side = SIDE[bank];
      var a = -Math.PI / 2 + k * Math.PI / 4;
      var towerTop = v3(2.05 + Math.cos(a) * 0.15, 3.72 + 0.71, Math.sin(a) * 0.15);
      var plugEnd = banks[bank].localToWorld(v3(Em.math.X_OF[ci], 2.55, -0.60 * side)).clone();
      var mid = towerTop.clone().add(plugEnd).multiplyScalar(0.5);
      mid.y += 0.6;
      mid.z += (plugEnd.z > 0 ? 1 : -1) * 0.3;
      var curve = new THREE.CatmullRomCurve3([towerTop, mid, plugEnd]);
      var geo = new THREE.TubeGeometry(curve, 40, 0.024, 5, false);
      geo.setDrawRange(0, 0);
      var wg = new THREE.Group();
      var tube = new THREE.Mesh(geo, M.wire);
      wg.add(tube);
      var boot = new THREE.Mesh(cylG(0.045, 0.05, 0.14, 10), M.boot);
      boot.position.copy(plugEnd);
      boot.scale.setScalar(0.001);
      wg.add(boot);
      S3.scene.add(wg);
      var wmeta = reg("wire" + ci, "PLUG WIRE · CYL " + ci, "TOWER " + (k + 1) + " → CYL " + ci + " · 8 MM", wg, "ignition",
        { type: "wire", from: null, to: null, delay: 1.5 + k * 0.3, dur: 0.75, geo: geo, boot: boot },
        { kind: "wire" });
      wmeta.wireMeta = { geo: geo, boot: boot };
    });

    // 注册给机构驱动
    var sparkRefs = {};
    for (var ci2 = 1; ci2 <= 8; ci2++) {
      if (tips[ci2]) sparkRefs[ci2] = { mesh: tips[ci2].mesh, tip: tips[ci2].tip };
    }
    V8SB.Engine.register({
      crank: crank, pulley: pulley, fan: fan,
      pistons: animMeta.pistons, rods: animMeta.rods,
      valves: animMeta.valves, lobes: animMeta.lobes,
      sparks: sparkRefs, sparkLight: sparkLight,
      scene: S3.scene, heatOutlets: heatOutlets
    });
  }

  function v3(x, y, z) { return new THREE.Vector3(x, y, z); }

  /* ============ 飞行控制 ============ */
  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function bez(p0, p1, p2, t) {
    var a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
    return v3(
      a * p0.x + b * p1.x + c * p2.x,
      a * p0.y + b * p1.y + c * p2.y,
      a * p0.z + b * p1.z + c * p2.z);
  }

  function seal(p) {
    p.fitted = true;
    if (p.anim) {
      if (p.anim.type === "wire") {
        p.wireMeta.geo.setDrawRange(0, Infinity);
        p.wireMeta.boot.scale.setScalar(1);
      } else {
        p.group.position.copy(p.anim.to);
        if (p.anim.type === "screw") p.anim.spinGroup.rotation.y = 0;
      }
    }
    if (p.kind === "valve") V8SB.Engine.markValve(p.valveIdx, true);
    if (p.id.indexOf("piston") === 0) V8SB.Engine.markPiston(Number(p.id.slice(6)), true);
    fitted++;
  }

  function sealInstant(p) {
    if (p.fitted) return;
    p.shown = true;
    p.group.visible = true;
    seal(p);
  }

  function update(pt) {
    if (!current) return;
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (p.fitted || p.phase !== current || !p.anim) continue;
      var a = p.anim;
      var t = (pt - a.delay) / a.dur;
      if (t <= 0) { p.group.visible = false; continue; }
      if (!p.shown) {
        p.shown = true;
        p.group.visible = true;
        if (!p.silent) {
          V8SB.Labels.announce(p.id, p.group, p.name, p.sub, performance.now(), 2400);
        }
      }
      var e = easeInOut(Math.min(t, 1));
      if (a.type === "wire") {
        var segs = Math.floor(e * 40);
        a.geo.setDrawRange(0, segs * 30);
        var bs = Math.max(0.001, (e - 0.82) / 0.18);
        a.boot.scale.setScalar(bs);
      } else {
        var pos = a.mid ? bez(a.from, a.mid, a.to, e) : v3(
          a.from.x + (a.to.x - a.from.x) * e,
          a.from.y + (a.to.y - a.from.y) * e,
          a.from.z + (a.to.z - a.from.z) * e);
        p.group.position.copy(pos);
        if (a.type === "screw") a.spinGroup.rotation.y = a.spin * e;
      }
      if (t >= 1) seal(p);
    }
  }

  /* ============ 对外 API ============ */
  V8SB.Parts = {
    init: function () {
      S3 = V8SB.Scene3D; M = S3.M; mesh = S3.mesh; Em = V8SB.Engine;
      banks.L = new THREE.Group();
      banks.L.position.set(0, Em.math.CRANK_Y, 0);
      banks.L.rotation.x = Em.math.PSI_BANK_RAD.L;
      banks.R = new THREE.Group();
      banks.R.position.set(0, Em.math.CRANK_Y, 0);
      banks.R.rotation.x = Em.math.PSI_BANK_RAD.R;
      S3.scene.add(banks.L);
      S3.scene.add(banks.R);
      registerAll();
      this.reset();   // 初始隐藏全部零件,等待各自阶段飞入
    },
    showPhase: function (id) { current = id; },
    update: update,
    reset: function () {
      current = "";
      fitted = 0;
      list.forEach(function (p) {
        p.fitted = false;
        p.shown = false;
        p.group.visible = false;
        if (p.anim && p.anim.type === "wire") {
          p.wireMeta.geo.setDrawRange(0, 0);
          p.wireMeta.boot.scale.setScalar(0.001);
        }
      });
    },
    /* 跳转阶段时:之前阶段的零件直接落位 */
    sealThrough: function (phaseIdx) {
      list.forEach(function (p) {
        var pi = PHASES.indexOf(p.phase);
        if (pi >= 0 && pi < phaseIdx) sealInstant(p);
      });
    },
    get fittedCount() { return fitted; },
    get total() { return list.length; },
    group: function (id) {
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].group;
      return null;
    },
    list: function () { return list; },
    phaseIds: PHASES
  };
})(window.V8SB = window.V8SB || {});
