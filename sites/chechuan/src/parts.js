/* 车船部件建模与注册(9 件)。
   坐标系:y 上,x 船首;船体件挂 root(root.x = 航行平移),水面为世界件。
   双明轮 z ±0.72(轴沿 z,轮面 x-y),踏板轴沿 z(双曲柄反相),
   链轮同径 i=1 链线直联。KINE:轮/踏轴/旗旋转;errPos = 桨尖 vs 解析。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  var _plank = null;
  function plankMat() {
    if (!_plank) {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var x = c.getContext("2d");
      x.fillStyle = "#8A5A2B";
      x.fillRect(0, 0, 128, 128);
      for (var i = 0; i < 10; i++) {
        var y = i * 13 + 4;
        x.fillStyle = (i % 2) ? "#7A4E24" : "#9A6B33";
        x.fillRect(0, y, 128, 11);
        x.strokeStyle = "rgba(50,30,10,0.6)";
        x.lineWidth = 1.4;
        x.strokeRect(0, y, 128, 11);
      }
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 1);
      t.encoding = THREE.sRGBEncoding;
      _plank = new THREE.MeshStandardMaterial({ map: t, roughness: 0.84, metalness: 0.04 });
    }
    return _plank;
  }

  /* —— 部件构建器 —— */

  function buildWater() {   // 河面(世界件):水面 + 微波纹
    var g = group();
    var water = P.mesh(new THREE.PlaneGeometry(16, 7), M3.water, 0, D.waterY, 0);
    water.rotation.x = -Math.PI / 2;
    water.castShadow = false;
    g.add(water);
    g.userData.water = water;
    return { group: g, anchor: mkAnchor(3, 0.2, 1.5) };
  }

  function buildHull() {    // 船体:底板 + 舷板 + 船首尾起翘
    var g = group();
    var L = D.hullL;
    g.add(P.box(L, 0.10, 1.06, plankMat(), 0, D.hullY0 + 0.12, 0));
    [1, -1].forEach(function (s) {
      g.add(P.box(L, 0.30, 0.06, plankMat(), 0, D.hullY0 + 0.30, s * 0.52));
    });
    /* 船首尾封板 */
    g.add(P.box(0.06, 0.30, 1.06, plankMat(), L / 2, D.hullY0 + 0.30, 0));
    g.add(P.box(0.06, 0.26, 1.06, plankMat(), -L / 2, D.hullY0 + 0.28, 0));
    /* 甲板条 */
    g.add(P.box(L - 0.2, 0.05, 0.94, plankMat(), 0, D.hullY0 + 0.47, 0));
    return { group: g, anchor: mkAnchor(L / 2 - 0.1, 0.5, 0.55) };
  }

  function buildMastCabin() { // 桅杆 + 舱棚
    var g = group();
    g.add(P.box(0.80, 0.42, 0.72, plankMat(), -0.60, D.hullY0 + 0.70, 0));
    g.add(P.cyl(0.05, 0.06, 1.30, M3.woodD, 0.55, D.hullY0 + 1.00, 0, 10));
    g.add(P.cyl(0.02, 0.02, 0.44, M3.woodD, 0.55, D.hullY0 + 1.62, 0, 8).rotation ? (function () {
      var t = P.cyl(0.02, 0.02, 0.44, M3.woodD, 0.55, D.hullY0 + 1.62, 0, 8);
      t.rotation.x = P.ROTX;
      return t;
    })() : null);
    return { group: g, anchor: mkAnchor(-0.5, 1.2, 0.3) };
  }

  function buildWheel(side) { // 明轮:轮毂 + 8 桨板 + 轴(轮面 x-y)
    var g = group();
    var R = D.rWheel;
    var hub = P.cyl(0.09, 0.09, 0.16, M3.woodD, 0, 0, 0, 12);
    hub.rotation.x = P.ROTX;
    g.add(hub);
    var rim = P.torus(R - 0.04, 0.035, M3.woodD, 0, 0, 0, 32);
    g.add(rim);
    for (var i = 0; i < D.NP; i++) {
      var a = i / D.NP * Math.PI * 2;
      var paddle = P.box(0.30, 0.12, 0.10, plankMat(), 0, 0, 0);
      paddle.position.set(Math.cos(a) * (R - 0.06), Math.sin(a) * (R - 0.06), side * 0.14);
      paddle.rotation.z = a + Math.PI / 2;
      g.add(paddle);
    }
    for (var j = 0; j < 4; j++) {
      var a2 = j / 4 * Math.PI * 2;
      var s = P.box(0.05, R - 0.10, 0.05, M3.wood, 0, 0, 0);
      s.position.set(Math.cos(a2) * (0.08 + (R - 0.10) / 2), Math.sin(a2) * (0.08 + (R - 0.10) / 2), 0);
      s.rotation.z = a2 - Math.PI / 2;
      g.add(s);
    }
    /* 轮轴伸向船内(链轮端) */
    var axle = P.cyl(0.035, 0.035, 0.58, M3.steelD, 0, 0, -side * 0.30, 10);
    axle.rotation.x = P.ROTX;
    g.add(axle);
    /* 链轮(轮轴上,链直联踏轴) */
    var spr = P.cyl(D.sprocketR, D.sprocketR, 0.05, plankMat(), 0, 0, -side * 0.55, 16);
    spr.rotation.x = P.ROTX;
    g.add(spr);
    g.userData.spr = spr;
    return { group: g, anchor: mkAnchor(R - 0.06, 0.14, side * 0.16) };
  }

  function buildTreadle() { // 踏板轴:双曲柄 180° 反相 + 踏板 + 链轮
    var g = group();
    var axle = P.cyl(0.04, 0.04, 1.20, M3.steelD, 0, 0, 0, 12);
    axle.rotation.x = P.ROTX;
    g.add(axle);
    [1, -1].forEach(function (s) {
      var crank = P.box(0.05, D.rTread * 2, 0.04, M3.woodD, 0, -D.rTread, s * 0.16);
      g.add(crank);
      var pedal = P.box(0.24, 0.03, 0.14, plankMat(), 0.02, -D.rTread - 0.02, s * 0.16);
      g.add(pedal);
      var spr = P.cyl(D.sprocketR, D.sprocketR, 0.05, plankMat(), 0, 0, -s * 0.42, 16);
      spr.rotation.x = P.ROTX;
      g.add(spr);
    });
    return { group: g, anchor: mkAnchor(0.06, -D.rTread - 0.05, 0.18) };
  }

  function buildDrive() {   // 链传动:双侧链线(踏轴链轮 → 明轮链轮)
    var g = group();
    [1, -1].forEach(function (s) {
      var pts = [
        new THREE.Vector3(D.treadX, D.treadY + D.sprocketR, s * 0.30),
        new THREE.Vector3(0, D.wheelY + D.sprocketR, s * 0.17)
      ];
      var geo = new THREE.BufferGeometry().setFromPoints(pts);
      g.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x8A7A5A })));
      var pts2 = [
        new THREE.Vector3(D.treadX, D.treadY - D.sprocketR, s * 0.30),
        new THREE.Vector3(0, D.wheelY - D.sprocketR, s * 0.17)
      ];
      var geo2 = new THREE.BufferGeometry().setFromPoints(pts2);
      g.add(new THREE.Line(geo2, new THREE.LineBasicMaterial({ color: 0x8A7A5A })));
    });
    return { group: g, anchor: mkAnchor(0.2, D.wheelY + 0.1, 0.6) };
  }

  function buildFlag() {    // 帅旗:桅顶旗(kine 扑动)
    var g = group();
    var flag = P.mesh(new THREE.PlaneGeometry(0.55, 0.30),
      new THREE.MeshStandardMaterial({ color: 0xB05A3A, side: THREE.DoubleSide, roughness: 0.8 }),
      0.30, 0, 0);
    g.add(flag);
    g.userData.flag = flag;
    return { group: g, anchor: g };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "water", name: "RIVER · 河面", sub: "水面 0.12 · 明轮浸深 0.05", phase: 0, at: 0.15, dur: 1.4, world: true,
      build: buildWater, target: [0, 0, 0], start: [0, 3.0, 0], mid: [0, 1.4, 0] });

    def({ id: "hull", name: "HULL · 船体", sub: "长 2.6m · 舷板甲板", phase: 0, at: 1.6, dur: 1.5,
      build: buildHull, target: [0, 0, 0], start: [0, 3.6, 0], mid: [0, 1.8, 0] });
    def({ id: "mastCabin", name: "CABIN · 桅杆舱棚", sub: "帅旗桅 + 舱棚", phase: 1, at: 7.2, dur: 1.4,
      build: buildMastCabin, target: [0, 0, 0], start: [-0.5, 3.6, 0.3], mid: [-0.5, 1.8, 0.15] });

    def({ id: "wheelL", name: "PADDLE WHEEL · 明轮 L", sub: "r 0.55 · 8 桨 · 浸深 0.05", phase: 2, at: 12.6, dur: 1.5, kind: "kine",
      build: function () { return buildWheel(-1); }, target: [0, D.wheelY, -D.wheelZ], off: [-0.7, 1.8, -0.7] });
    def({ id: "wheelR", name: "PADDLE WHEEL · 明轮 R", sub: "r 0.55 · 8 桨 · 浸深 0.05", phase: 2, at: 13.8, dur: 1.5, kind: "kine",
      build: function () { return buildWheel(1); }, target: [0, D.wheelY, D.wheelZ], off: [-0.7, 2.0, 0.7] });

    def({ id: "treadle", name: "TREADLE · 踏板轴", sub: "双曲柄反相 · 行程 0.24", phase: 3, at: 18.6, dur: 1.4, kind: "kine",
      build: buildTreadle, target: [D.treadX, D.treadY, 0], off: [0.4, 1.5, 0.7] });
    def({ id: "drive", name: "CHAIN · 链传动", sub: "同径链轮 i=1 直联", phase: 3, at: 19.5, dur: 1.2,
      build: buildDrive, target: [0, 0, 0], start: [0.2, 3.2, 0.5], mid: [0.2, 1.6, 0.25] });

    def({ id: "flag", name: "FLAG · 帅旗", sub: "桅顶扑动", phase: 4, at: 24.2, dur: 1.2, kind: "kine",
      build: buildFlag, target: [0.55, D.hullY0 + 1.72, 0], off: [0.3, 1.3, 0.6] });
  };

  /* —— 运动学分发 ——
     root.x = 航行平移(∫v dt);明轮 rotation.z = ψ(ψ = ∫ω dt,不滑移);
     踏轴 rotation.z = ψ(同链 i=1);帅旗扑动;
     errPos = 明轮 R 桨尖世界位置 vs 解析(root.x + R·cos/sin ψ),应≈0。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var psi = st.psi || 0;
    var px = st.px || 0;

    MECH.Scene3D.root.position.x = px;

    var wl = MECH.Parts.entry("wheelL");
    if (wl && wl.shown) wl.group.rotation.z = psi;
    var wr = MECH.Parts.entry("wheelR");
    if (wr && wr.shown) wr.group.rotation.z = psi;
    var td = MECH.Parts.entry("treadle");
    if (td && td.shown) td.group.rotation.z = psi;

    st.errPos = 0;
    if (wr && wr.sealed) {
      wr.group.updateWorldMatrix(true, false);
      _wp.set(D.rWheel - 0.06, 0, D.wheelZ + 0.14).applyMatrix4(wr.group.matrixWorld);
      var ax = px + Math.cos(psi) * (D.rWheel - 0.06);
      var ay = D.wheelY + Math.sin(psi) * (D.rWheel - 0.06);
      st.errPos = Math.sqrt((_wp.x - ax) * (_wp.x - ax) + (_wp.y - ay) * (_wp.y - ay));
    }

    /* 帅旗扑动 */
    var fg = MECH.Parts.entry("flag");
    if (fg && fg.shown && fg.group.userData.flag) {
      var flying = (st.v || 0) > 0.05;
      fg.group.userData.flag.rotation.y = (flying ? -0.15 : 0.15) + Math.sin(st.time * 6.5) * 0.14;
      fg.group.userData.flag.scale.x = flying ? 1 : 0.55;
    }
  };
})(window.MECH = window.MECH || {});
