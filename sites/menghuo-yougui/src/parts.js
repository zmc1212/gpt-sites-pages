/* 猛火油柜部件建模与注册(7 件)。
   坐标系:y 上,x 射向(+x);油柜 (−0.45, 0.42),双筒沿 x(y 0.86),
   火楼 (0.55, 0.98)。KINE:双杆 ±(stroke/2)sinψ 反相;喷焰随排油相
   显隐伸缩;errPos = 杆把手世界 x vs 解析(应≈0)。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  var _bronze = null;
  function bronzeMat() {
    if (!_bronze) {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var x = c.getContext("2d");
      x.fillStyle = "#8A6E3F";
      x.fillRect(0, 0, 128, 128);
      for (var i = 0; i < 300; i++) {
        var g = 110 + Math.random() * 50;
        x.fillStyle = "rgba(" + (g | 0) + "," + ((g * 0.8) | 0) + "," + ((g * 0.45) | 0) + ",0.4)";
        x.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
      }
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      t.encoding = THREE.sRGBEncoding;
      _bronze = new THREE.MeshStandardMaterial({ map: t, metalness: 0.5, roughness: 0.5 });
    }
    return _bronze;
  }

  /* —— 部件构建器 —— */

  function buildStand() {   // 底座:木架 + 双支柱
    var g = group();
    g.add(P.box(1.60, 0.10, 0.56, plankLocal(), 0, 0.05, 0));
    [[-0.55], [-0.10], [0.35]].forEach(function (p) {
      g.add(P.box(0.10, 0.36, 0.10, M3.woodD, p[0], 0.18, 0.20));
      g.add(P.box(0.10, 0.36, 0.10, M3.woodD, p[0], 0.18, -0.20));
    });
    return { group: g, anchor: mkAnchor(-0.2, 0.2, 0.3) };
  }

  function buildTank() {    // 油柜:铜柜 + 柜油(液面随喷降)
    var g = group();
    var tank = P.cyl(D.tankR, D.tankR * 0.9, 0.44, bronzeMat(), D.tankX, D.tankY, 0, 22);
    g.add(tank);
    var neck = P.cyl(0.10, 0.10, 0.10, bronzeMat(), D.tankX, D.tankY + 0.27, 0, 14);
    g.add(neck);
    var oil = P.mesh(new THREE.CircleGeometry(D.tankR - 0.03, 20), M3.water, D.tankX, D.tankOil0, 0);
    oil.rotation.x = -Math.PI / 2;
    oil.castShadow = false;
    g.add(oil);
    g.userData.oil = oil;
    /* 剖视口(柜身半透明示意,看得见油) */
    g.add(P.torus(D.tankR + 0.01, 0.014, M3.gold, D.tankX, D.tankY + 0.10, 0, 26).rotation ? (function () {
      var t = P.torus(D.tankR + 0.01, 0.014, M3.gold, D.tankX, D.tankY + 0.10, 0, 26);
      t.rotation.x = P.ROTX;
      return t;
    })() : null);
    return { group: g, anchor: mkAnchor(D.tankX + 0.25, D.tankY + 0.15, 0.1) };
  }

  function buildCylinders() { // 双活塞筒:双横铜筒 + 喷管 + 进油管
    var g = group();
    var cyl1 = P.cyl(D.rPiston + 0.015, D.rPiston + 0.015, 0.30, bronzeMat(), -0.02, D.cylY, -0.10, 14);
    cyl1.rotation.z = P.ROTZ;
    g.add(cyl1);
    var cyl2 = P.cyl(D.rPiston + 0.015, D.rPiston + 0.015, 0.30, bronzeMat(), -0.02, D.cylY, 0.10, 14);
    cyl2.rotation.z = P.ROTZ;
    g.add(cyl2);
    /* 喷管(双筒汇 → 火楼) */
    g.add(P.cyl(0.024, 0.024, 0.40, bronzeMat(), 0.28, D.cylY, 0, 12));
    var up = P.cyl(0.024, 0.024, 0.26, bronzeMat(), 0.46, D.cylY + 0.09, 0, 12);
    up.rotation.z = -0.5;
    g.add(up);
    /* 进油管(柜 → 双筒) */
    g.add(P.cyl(0.022, 0.022, 0.34, bronzeMat(), D.tankX + 0.26, D.cylY - 0.02, 0, 12));
    return { group: g, anchor: mkAnchor(0.15, D.cylY + 0.1, 0.12) };
  }

  function buildRods() {    // 唧杆:双杆 + 把手(kine 反相推拉)
    var g = group();
    var rods = [];
    [1, -1].forEach(function (s) {
      var rod = P.cyl(0.022, 0.022, 0.34, M3.woodD, 0, 0, s * 0.10, 8);
      rod.rotation.z = P.ROTZ;
      g.add(rod);
      var handle = P.box(0.05, 0.10, 0.14, plankLocal(), 0.20, 0, s * 0.10);
      g.add(handle);
      rods.push({ rod: rod, handle: handle, s: s });
    });
    g.userData.rods = rods;
    return { group: g, anchor: mkAnchor(0.24, D.cylY + 0.12, 0.14) };
  }

  function buildTower() {   // 火楼:喷口楼架 + 引火焰(kine 常燃)
    var g = group();
    g.add(P.box(0.10, 0.22, 0.10, bronzeMat(), D.towerX, D.towerY - 0.14, 0));
    g.add(P.box(0.16, 0.05, 0.16, M3.woodD, D.towerX, D.towerY - 0.28, 0));
    /* 喷口 */
    g.add(P.cyl(D.rNozzle + 0.012, D.rNozzle + 0.02, 0.10, M3.iron, D.towerX + 0.06, D.towerY + 0.02, 0, 10));
    var nz = P.cyl(D.rNozzle + 0.012, D.rNozzle + 0.02, 0.10, M3.iron, D.towerX + 0.06, D.towerY + 0.02, 0, 10);
    nz.rotation.z = P.ROTZ;
    g.add(nz);
    /* 引火小火焰(常燃) */
    var pilot = P.mesh(new THREE.ConeGeometry(0.035, 0.10, 8),
      new THREE.MeshStandardMaterial({ color: 0xE98C2C, emissive: 0xE98C2C, emissiveIntensity: 1.5 }),
      D.towerX + 0.12, D.towerY + 0.05, 0);
    g.add(pilot);
    g.userData.pilot = pilot;
    return { group: g, anchor: mkAnchor(D.towerX + 0.15, D.towerY + 0.1, 0.1) };
  }

  function buildJet() {     // 火流:喷焰锥(kine 随排油伸缩闪烁)
    var g = group();
    var jet = P.mesh(new THREE.ConeGeometry(0.06, 0.75, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xE9A23C, transparent: true, opacity: 0.0, depthWrite: false, side: THREE.DoubleSide }),
      0.375, 0, 0);
    jet.rotation.z = Math.PI / 2;
    g.add(jet);
    var inner = P.mesh(new THREE.ConeGeometry(0.03, 0.50, 10, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xE9C93C, transparent: true, opacity: 0.0, depthWrite: false, side: THREE.DoubleSide }),
      0.25, 0, 0);
    inner.rotation.z = Math.PI / 2;
    g.add(inner);
    g.userData.jet = jet;
    g.userData.inner = inner;
    return { group: g, anchor: mkAnchor(D.towerX + 0.5, D.towerY + 0.02, 0.1) };
  }

  var _plank = null;
  function plankLocal() {
    if (!_plank) {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var x = c.getContext("2d");
      x.fillStyle = "#9A6B33";
      x.fillRect(0, 0, 128, 128);
      for (var i = 0; i < 8; i++) {
        var px = i * 16 + 1;
        x.fillStyle = (i % 2) ? "#8A5E2B" : "#A97844";
        x.fillRect(px, 0, 14, 128);
        x.strokeStyle = "rgba(58,36,12,0.6)";
        x.lineWidth = 1.6;
        x.strokeRect(px, 0, 14, 128);
      }
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 1);
      t.encoding = THREE.sRGBEncoding;
      _plank = new THREE.MeshStandardMaterial({ map: t, roughness: 0.84, metalness: 0.04 });
    }
    return _plank;
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "stand", name: "STAND · 底座", sub: "木架双支柱", phase: 0, at: 0.2, dur: 1.4,
      build: buildStand, target: [0, 0, 0], start: [0, 3.6, 0], mid: [0, 1.8, 0] });
    def({ id: "tank", name: "TANK · 油柜", sub: "铜柜 · 油面 0.72", phase: 0, at: 1.5, dur: 1.4,
      build: buildTank, target: [0, 0, 0], start: [-0.5, 3.4, 0.3], mid: [-0.5, 1.7, 0.15] });

    def({ id: "cylinders", name: "CYLINDERS · 双活塞筒", sub: "筒 r 0.06 · 喷管汇", phase: 1, at: 7.4, dur: 1.5,
      build: buildCylinders, target: [0, 0, 0], start: [0.2, 3.6, 0.4], mid: [0.2, 1.8, 0.2] });
    def({ id: "rods", name: "RODS · 唧杆把手", sub: "双杆反相 · 行程 0.22", phase: 1, at: 8.6, dur: 1.4, kind: "kine",
      build: buildRods, target: [0, D.cylY, 0], off: [0.4, 1.4, 0.7] });

    def({ id: "tower", name: "FIRE TOWER · 火楼", sub: "喷口 + 引火苗", phase: 2, at: 12.8, dur: 1.5,
      build: buildTower, target: [0, 0, 0], start: [0.5, 3.4, 0.3], mid: [0.5, 1.7, 0.15] });
    def({ id: "jet", name: "JET · 火流", sub: "v_jet 3.1 m/s · 随排油", phase: 3, at: 17.6, dur: 1.3, kind: "kine",
      build: buildJet, target: [D.towerX + 0.3, D.towerY + 0.02, 0], off: [0.5, 1.2, 0.7] });
  };

  /* —— 运动学分发 ——
     ψ 杆相位:双杆 ±(stroke/2)·sinψ 反相;喷焰 opacity/长度随 |sinψ|
     (排油半周);油面缓降;errPos = 杆把手世界 x vs 解析(应≈0)。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var psi = st.psi || 0;
    var pump = st.pumping || false;
    var rodOff = (D.stroke / 2) * Math.sin(psi);

    var rd = MECH.Parts.entry("rods");
    if (rd && rd.shown && rd.group.userData.rods) {
      rd.group.userData.rods.forEach(function (r) {
        var dir = r.s;                    // 双杆反相
        r.rod.position.x = 0.16 + dir * rodOff;
        r.handle.position.x = 0.36 + dir * rodOff;
      });
    }

    st.errPos = 0;
    if (rd && rd.sealed) {
      rd.group.updateWorldMatrix(true, false);
      _wp.set(0.36 + rodOff, 0, 0.10).applyMatrix4(rd.group.matrixWorld);
      var ax = 0.36 + rodOff, ay = D.cylY, az = 0.10;
      st.errPos = Math.sqrt((_wp.x - ax) * (_wp.x - ax) + (_wp.y - ay) * (_wp.y - ay) + (_wp.z - az) * (_wp.z - az));
    }

    /* 喷焰:排油半周(|cosψ| 大时喷油) */
    var jt = MECH.Parts.entry("jet");
    if (jt && jt.sealed && jt.group.userData.jet) {
      var pumpAmt = pump ? Math.abs(Math.sin(psi)) : 0;
      var I = D.brightness ? 1 : 1;
      jt.group.userData.jet.material.opacity = 0.55 * pumpAmt;
      jt.group.userData.inner.material.opacity = 0.75 * pumpAmt;
      var len = 0.75 * (0.55 + 0.45 * pumpAmt);
      jt.group.userData.jet.scale.set(1, len / 0.75, 1);
      jt.group.userData.inner.scale.set(1, len / 0.75, 1);
      jt.group.position.x = D.towerX + 0.30 - 0 + (0.30 - len / 2) - 0.375 + 0.375;
      jt.group.position.x = D.towerX + 0.055 + len / 2 - 0.02;
    }

    /* 油面缓降(喷油时) */
    var tk = MECH.Parts.entry("tank");
    if (tk && tk.sealed && tk.group.userData.oil) {
      var drop = st.oilUsed || 0;
      tk.group.userData.oil.position.y = D.tankOil0 - 0.10 * KS.clamp(drop, 0, 1);
    }

    /* 引火苗闪烁 */
    var tw = MECH.Parts.entry("tower");
    if (tw && tw.shown && tw.group.userData.pilot) {
      tw.group.userData.pilot.scale.set(1, 0.8 + 0.3 * Math.abs(Math.sin(st.time * 9)), 1);
      tw.group.userData.pilot.visible = st.ignited || false;
    }
  };
})(window.MECH = window.MECH || {});
