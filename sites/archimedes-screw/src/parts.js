/* 阿基米德螺旋提水器 — 部件建模与注册(14 件)。
   螺旋轴沿 X(倾角 30°),低端在 +x 侧(水池),高端在 −x 侧(出水槽)。
   螺旋叶片 = TubeGeometry 沿自定义螺旋曲线;水团 = 蓝色扁球,KINE 依
   blobState(i, θ) 追踪(确定性)。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;

  function group() { return new THREE.Group(); }
  function anchored(g) { g.userData.tagAnchor = new THREE.Vector3(0, 0, 0); return { group: g }; }

  /* 世界坐标:轴心线从低端 (x1, y1) 到高端 (x0, y0),倾角 30°(左高右低) */
  var X1 = D.xSpan / 2, Y1 = -D.H / 2 + 1.55;      // 低端(右)
  var X0 = -D.xSpan / 2, Y0 = D.H / 2 + 1.55;      // 高端(左)
  function axisPos(s) {                             // 轴向 s → 世界 x,y
    var f = s / D.L;
    return [X1 + (X0 - X1) * f, Y1 + (Y0 - Y1) * f];
  }

  /* 螺旋曲线:采样点 → CatmullRomCurve3(r149 的 Curve 为 ES6 类,以点列构造) */
  function helixPoints() {
    var pts = [];
    for (var i = 0; i <= 180; i++) {
      var s = i / 180 * D.L;
      var a = D.helixPhi(s);
      var rad = D.R - D.blade * 0.5;
      pts.push(new THREE.Vector3(s, Math.cos(a) * rad, Math.sin(a) * rad));
    }
    return new THREE.CatmullRomCurve3(pts);
  }

  /* 螺旋筒:外层倾斜组(rotation.z = π−θ,局部 +x 指向高端)套内层自转组 */
  function buildScrew() {
    var g = group();
    g.rotation.z = Math.PI - D.tilt;
    g.position.set(X1, Y1, 0);
    var holder = group();
    /* 内芯管(局部 +x = 轴向) */
    var tube = P.cyl(D.r, D.r, D.L, M3.woodD, D.L / 2, 0, 0, 18);
    tube.rotation.z = Math.PI / 2;
    holder.add(tube);
    /* 外筒:木条拼装透空壳(staves,博物馆复原样式,内部可见) */
    for (var stv = 0; stv < 10; stv++) {
      var av = stv / 10 * Math.PI * 2;
      var stave = P.box(D.L, 0.30, 0.05, M3.woodL, D.L / 2,
        Math.cos(av) * (D.R + 0.03), Math.sin(av) * (D.R + 0.03));
      stave.rotation.x = av;
      holder.add(stave);
    }
    /* 螺旋叶片(单螺旋,加厚便于透笼观察) */
    var bladeGeo = new THREE.TubeGeometry(helixPoints(), 96, 0.09, 8, false);
    holder.add(P.mesh(bladeGeo, M3.woodL, 0, 0, 0));
    /* 端盖环 */
    [0, D.L].forEach(function (s2) {
      var ring = P.torus(D.R + 0.02, 0.045, M3.brass, s2, 0, 0, 26);
      ring.rotation.y = Math.PI / 2;
      holder.add(ring);
    });
    /* 摇柄(低端外侧) */
    var crank = group();
    crank.add(P.cyl(0.045, 0.045, 1.1, M3.steel, -0.55, 0, 0, 10));
    var grip = P.cyl(0.09, 0.09, 0.6, M3.woodD, -1.1, 0, 0, 10);
    grip.rotation.z = Math.PI / 2;
    crank.add(grip);
    crank.position.set(-0.3, 0, 0);
    holder.add(crank);
    g.add(holder);
    return { group: g, kine: function (st) { holder.rotation.x = st.theta; } };
  }

  /* 水团 ×nBlobs */
  function buildWater() {
    var g = group();
    var blobs = [];
    for (var i = 0; i < D.nBlobs; i++) {
      var b = P.sph(0.14, M3.water, 0, 0, 0);
      g.add(b);
      blobs.push(b);
    }
    g.userData.blobs = blobs;
    return { group: g };
  }

  /* 低端水池(世界固定)+ 高端出水槽 */
  function buildBasin() {
    var g = group();
    var wx = X1 + 0.55;
    g.add(P.box(1.7, 0.16, 1.7, M3.stone, wx, Y1 - D.R - 0.28, 0));
    var w = P.box(1.5, 0.34, 1.5, M3.water, wx, Y1 - D.R - 0.10, 0);
    g.add(w);
    return anchored(g);
  }
  function buildTrough() {
    var g = group();
    var wx = X0 - 0.5;
    g.add(P.box(1.0, 0.12, 0.9, M3.woodD, wx, Y0 + D.R + 0.16, 0));
    [-0.35, 0.35].forEach(function (dz) {
      g.add(P.box(0.85, 0.14, 0.08, M3.woodD, wx, Y0 + D.R + 0.02, dz));
    });
    /* 石墩基座(落地承托) */
    var pedH = Y0 + D.R - 0.02;
    g.add(P.box(1.0, pedH, 0.9, M3.stone, wx, pedH / 2, 0));
    return anchored(g);
  }

  /* 支架 ×2(world) */
  function buildSupport(seg) {
    var g = group();
    var s = seg === 0 ? D.L * 0.25 : D.L * 0.75;
    var pos = axisPos(s);
    g.add(P.box(0.16, Math.abs(pos[1] - 0.1) + 0.2, 0.7, M3.woodD, pos[0], (pos[1] - 0.1) / 2, 0.52));
    g.add(P.box(0.16, Math.abs(pos[1] - 0.1) + 0.2, 0.7, M3.woodD, pos[0], (pos[1] - 0.1) / 2, -0.52));
    g.add(P.box(0.3, 0.12, 1.5, M3.stone, pos[0], -0.02, 0));
    return anchored(g);
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }
    function fly(dx, dy, dz) { return [dx, dy, dz]; }

    def({ id: "basin", name: "BASIN · 低端水池", sub: "水源 · 水面浸及筒口", phase: 0, at: 0.2, dur: 1.2,
      build: buildBasin, target: [0, 0, 0], start: [3, 1.5, -2.5], mid: [1.5, 0.8, -1.0] });
    def({ id: "trough", name: "TROUGH · 高端出水槽", sub: "扬程 H = L·sinθ = 1.50 m", phase: 0, at: 0.8, dur: 1.2,
      build: buildTrough, target: [0, 0, 0], start: [-3, 4.5, -2.5], mid: [-1.5, 3.0, -1.0] });
    def({ id: "support1", name: "SUPPORT · 支架 I", sub: "四脚木架 + 石基", phase: 0, at: 1.4, dur: 1.0,
      build: function () { return buildSupport(0); }, target: [0, 0, 0], start: [2, 1.0, -2.0], mid: [1, 0.5, -0.8] });
    def({ id: "support2", name: "SUPPORT · 支架 II", sub: "高端侧支架", phase: 0, at: 1.9, dur: 1.0,
      build: function () { return buildSupport(1); }, target: [0, 0, 0], start: [-2, 3.0, -2.0], mid: [-1, 1.5, -0.8] });
    def({ id: "screw", name: "SCREW · 螺旋筒", sub: "R 0.62 · 内芯 r 0.26 · 螺距 P 0.55 · L 3.0 m", phase: 1, at: 5.8, dur: 1.6, kind: "kine",
      build: buildScrew, target: [0, 0, 0], off: fly(0, 2.5, 2.0) });
    def({ id: "water", name: "WATER · 水团 ×10", sub: "转一圈前进一个螺距 P", phase: 2, at: 11.6, dur: 1.4, kind: "kine",
      build: buildWater, target: [0, 0, 0], off: fly(0, 2.0, 1.6) });
  };

  /* —— 运动学分发(每帧)—— */
  MECH.KINE = function (st) {
    /* 螺旋转动:kine 部件自带 holder 旋转 ✓(buildScrew 返回的 kine) */
    /* 水团追踪 */
    var w = MECH.Parts.entry("water");
    if (w && w.shown && w.group.userData.blobs) {
      w.group.userData.blobs.forEach(function (b, i) {
        var bs = KS.blobState(i, st.theta);
        var pos = axisPos(bs.s);
        /* 水团贴在下侧叶片面:角相位 = 轴向螺旋角,径向 0.45R,朝下偏 */
        var a = D.helixPhi(bs.s);
        var rr = D.R * 0.52;
        b.position.set(pos[0], pos[1] + Math.cos(a) * rr * 0.35 - rr * 0.55, Math.sin(a) * rr * 0.35);
        b.visible = bs.s < D.L - 0.05;
      });
    }
  };
})(window.MECH = window.MECH || {});
