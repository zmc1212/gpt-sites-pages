/* 相风铜乌部件建模与注册(8 件)。
   坐标系:y 上,θ 绕 y(0=北 +z);台基高 1.6,枢高 1.78,方位盘 r 0.55。
   KINE:乌身/尾板 rotation.y = θv(解析欠阻尼);旗面朝风+扑动;
   errPos = 乌首尖世界位置 vs 解析枢轴+首向(应≈0)。 */
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
      _bronze = new THREE.MeshStandardMaterial({ map: t, metalness: 0.55, roughness: 0.45 });
    }
    return _bronze;
  }

  /* —— 部件构建器 —— */

  function buildBase() {    // 灵台台基:两层石台 + 台阶
    var g = group();
    var slab = new THREE.MeshStandardMaterial({ color: 0x6E7076, roughness: 0.92 });
    g.add(P.box(2.2, 0.9, 2.2, slab, 0, 0.45, 0));
    g.add(P.box(1.7, 0.7, 1.7, slab, 0, 0.9 + 0.35, 0));
    g.add(P.box(0.9, 0.20, 0.5, slab, 0, 0.10, 1.3));
    g.add(P.box(0.9, 0.20, 0.5, slab, 0, 0.30 + 0.1, 1.05));
    return { group: g, anchor: mkAnchor(0.85, 1.0, 0.8) };
  }

  function buildDisc() {    // 二十四方位盘:盘面 + 24 刻度 + 八方字位
    var g = group();
    var disc = P.cyl(D.RDisc, D.RDisc, 0.045, bronzeMat(), 0, 0, 0, 40);
    g.add(disc);
    for (var i = 0; i < 24; i++) {
      var a = i / 24 * Math.PI * 2;
      var tick = P.box(0.02, 0.02, i % 3 === 0 ? 0.09 : 0.05, M3.gold, Math.sin(a) * (D.RDisc - 0.04), 0.03, Math.cos(a) * (D.RDisc - 0.04));
      tick.rotation.y = a;
      g.add(tick);
    }
    return { group: g, anchor: mkAnchor(D.RDisc - 0.05, 0.08, 0.1) };
  }

  function buildPivot() {   // 枢柱 + 栖座配重盘
    var g = group();
    g.add(P.cyl(0.07, 0.09, 0.24, bronzeMat(), 0, 0.12, 0, 14));
    g.add(P.cyl(D.RDisc * 0.42, D.RDisc * 0.42, 0.05, bronzeMat(), 0, -0.02, 0, 24));
    g.add(P.sph(0.05, M3.gold, 0, 0.26, 0));
    return { group: g, anchor: mkAnchor(0.08, 0.2, 0.08) };
  }

  function buildCrow() {    // 铜乌:首身 + 双足 + 尾根(kine 随 θv 转)
    var g = group();
    var bm = bronzeMat();
    /* 身(椭球) */
    var body = P.mesh(new THREE.SphereGeometry(0.14, 16, 12), bm, 0.02, 0.14, 0);
    body.scale.set(1, 0.85, 1.5);
    g.add(body);
    /* 头 + 喙 */
    g.add(P.sph(0.075, bm, 0.10, 0.28, 0));
    var beak = P.mesh(new THREE.ConeGeometry(0.03, 0.12, 8), bm, 0.10, 0.27, 0.13);
    beak.rotation.x = Math.PI / 2;
    g.add(beak);
    /* 双足 */
    [[-0.05], [0.05]].forEach(function (p) {
      g.add(P.cyl(0.014, 0.014, 0.10, M3.iron, p[0], 0.03, 0.02, 6));
    });
    /* 翅(贴身) */
    [1, -1].forEach(function (s) {
      var wing = P.box(0.02, 0.10, 0.26, bm, 0.02 + s * 0.13, 0.16, -0.02);
      wing.rotation.z = s * 0.25;
      g.add(wing);
    });
    return { group: g, anchor: mkAnchor(0.1, 0.3, 0.12) };
  }

  function buildTail() {    // 尾风板:长风板(受风面,随乌转)
    var g = group();
    var plate = P.box(0.03, 0.16, D.tailL, bronzeMat(), 0, 0.14, 0);
    g.add(plate);
    g.add(P.box(0.05, 0.05, 0.10, bronzeMat(), 0, 0.14, D.tailL / 2 - 0.05));
    return { group: g, anchor: mkAnchor(0.03, 0.18, -D.tailL / 2) };
  }

  function buildFlag() {    // 幡杆 + 风向旗(kine 朝风扑动)
    var g = group();
    var pole = P.cyl(0.035, 0.045, D.flagH, M3.woodD, 0, D.flagH / 2, 0, 10);
    g.add(pole);
    g.add(P.box(0.28, 0.06, 0.28, M3.stone, 0, 0.03, 0));
    var flag = P.mesh(new THREE.PlaneGeometry(0.44, 0.20),
      new THREE.MeshStandardMaterial({ color: 0xB05A3A, side: THREE.DoubleSide, roughness: 0.8 }),
      0.24, D.flagH - 0.16, 0);
    flag.castShadow = true;
    g.add(flag);
    g.userData.flag = flag;
    return { group: g, anchor: mkAnchor(0.1, D.flagH, 0) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "base", name: "PLATFORM · 灵台台基", sub: "两层石台 + 台阶", phase: 0, at: 0.2, dur: 1.5,
      build: buildBase, target: [0, 0, 0], start: [0, 4.4, 0], mid: [0, 2.2, 0] });
    def({ id: "disc", name: "DISC · 二十四方位盘", sub: "24 刻度 · 八方", phase: 1, at: 5.8, dur: 1.3,
      build: buildDisc, target: [0, D.baseH + 0.70 + 0.02, 0], start: [0, 5.0, 0.3], mid: [0, 3.0, 0.15] });
    def({ id: "pivot", name: "PIVOT · 枢柱栖座", sub: "配重盘 · 顶珠", phase: 2, at: 10.6, dur: 1.2, kind: "screw",
      build: buildPivot, target: [0, D.pivotY - 0.12, 0], start: [0, 5.0, 0.3], mid: [0, 3.0, 0.15] });
    def({ id: "crow", name: "BRONZE CROW · 铜乌", sub: "乌首指风来向", phase: 3, at: 15.4, dur: 1.4, kind: "kine",
      build: buildCrow, target: [0, D.pivotY, 0], off: [0.5, 1.8, 0.8] });
    def({ id: "tail", name: "TAIL VANE · 尾风板", sub: "受风面 0.55m", phase: 3, at: 16.3, dur: 1.3, kind: "kine",
      build: buildTail, target: [0, D.pivotY, 0], off: [-0.5, 1.8, 0.8] });
    def({ id: "flag", name: "FLAG · 幡杆风向旗", sub: "风向参照 · 扑动", phase: 4, at: 21.2, dur: 1.4, kind: "kine",
      build: buildFlag, target: [D.flagPoleX, 0, 0.55], off: [0.5, 1.6, 0.8] });
  };

  /* —— 运动学分发 ——
     θv = KS.vaneAngle(ph 内 pt);乌身/尾板 rotation.y = θv;
     旗 rotation.y = θw + 扑动;风花沿风向漂;
     errPos = 乌喙尖世界位置 vs 解析(枢 + 首向 0.20m),应≈0。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var thetaV = st.thetaV || 0;
    var thetaW = st.thetaW || 0;

    var cr = MECH.Parts.entry("crow");
    if (cr && cr.shown) cr.group.rotation.y = thetaV;
    var tl = MECH.Parts.entry("tail");
    if (tl && tl.shown) tl.group.rotation.y = thetaV;

    st.errPos = 0;
    if (cr && cr.sealed) {
      cr.group.updateWorldMatrix(true, false);
      _wp.set(0.10, 0.27, 0.19).applyMatrix4(cr.group.matrixWorld);
      /* 喙尖局部 (0.10, 0.27, 0.19) 随乌转:解析 = 枢 + Ry(θv)·局部水平分量 */
      var ax = 0.10 * Math.cos(thetaV) + 0.19 * Math.sin(thetaV);
      var az = -0.10 * Math.sin(thetaV) + 0.19 * Math.cos(thetaV);
      var dy = _wp.y - (D.pivotY + 0.27);
      st.errPos = Math.sqrt((_wp.x - ax) * (_wp.x - ax) + dy * dy + (_wp.z - az) * (_wp.z - az));
    }

    /* 旗朝风 + 扑动 */
    var fg = MECH.Parts.entry("flag");
    if (fg && fg.sealed && fg.group.userData.flag) {
      var flutter = Math.sin(st.time * 7.5) * 0.12;
      fg.group.userData.flag.rotation.y = thetaW + Math.PI - flutter;
      fg.group.userData.flag.scale.x = 1 - 0.15 * Math.abs(Math.sin(st.time * 5.5));
    }
  };
})(window.MECH = window.MECH || {});
