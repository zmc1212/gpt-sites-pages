/* 水转大纺车部件建模与注册(15 件)。
   坐标系:y 上;水轮与大绳轮同轴(轴沿 z),绳轮在 z=+0.4;
   8 锭沿 x 排开,锭轴沿 z(锭盘面 x-y),传动弦同面绕下缘,同向增速 ×14。
   渠底 0.06 不透明、水面 0.18,水轮缘浸深 0.08(不入全球地面)。 */
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
  function plankTex() {
    if (_plank) return _plank;
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
    _plank = t;
    return t;
  }

  /* —— 部件构建器 —— */

  function buildStream() {   // 溪渠:两岸 + 渠底 + 水面
    var g = group();
    var dark = new THREE.MeshStandardMaterial({ color: 0x35383E, roughness: 0.95, metalness: 0.04 });
    var bank = new THREE.MeshStandardMaterial({ color: 0x63666C, roughness: 0.9, metalness: 0.04 });
    g.add(P.box(0.35, D.bankTop, D.chZ * 2, bank, D.chX0 + 0.175, D.bankTop / 2, 0));
    g.add(P.box(0.35, D.bankTop, D.chZ * 2, bank, D.chX1 - 0.175, D.bankTop / 2, 0));
    g.add(P.box(1.5, 0.04, D.chZ * 2, dark, 0, 0.04, 0));
    var water = P.mesh(new THREE.PlaneGeometry(1.5, D.chZ * 2), M3.water, 0, D.waterY, 0);
    water.rotation.x = -Math.PI / 2;
    water.castShadow = false;
    g.add(water);
    g.userData.water = water;
    return { group: g, anchor: mkAnchor(D.chX0 + 0.2, 0.32, 0.9) };
  }

  function buildBents() {    // 排架:两跨石柱木帽轴承(承水轮轴 y=1.40)
    var g = group();
    [1, -1].forEach(function (s) {
      g.add(P.box(0.28, D.wheelY + 0.02, 0.28, M3.stone, 0, (D.wheelY + 0.02) / 2, s * 0.45));
      g.add(P.box(0.32, 0.10, 0.32, M3.woodD, 0, D.wheelY + 0.06, s * 0.45));
      /* 斜撑 */
      var brace = P.box(0.09, 1.30, 0.09, M3.woodD, 0.35, 0.75, s * 0.45);
      brace.rotation.z = -0.5;
      g.add(brace);
    });
    return { group: g, anchor: mkAnchor(0.2, 1.2, 0.5) };
  }

  function buildWaterWheel() { // 水轮:轮辋 + 12 桨 + 8 辐 + 毂
    var g = group();
    var R = D.RWheel;
    var rim = P.torus(R - 0.03, 0.06, M3.woodD, 0, 0, 0, 48);
    g.add(rim);
    var rim2 = P.torus(R - 0.12, 0.04, M3.wood, 0, 0, 0, 48);
    g.add(rim2);
    for (var i = 0; i < D.NP; i++) {
      var a = i / D.NP * Math.PI * 2;
      var paddle = P.box(0.10, 0.36, 0.16, plankMat(), 0, 0, 0);
      paddle.position.set(Math.cos(a) * (R - 0.24), Math.sin(a) * (R - 0.24), 0);
      paddle.rotation.z = a + Math.PI / 2;
      g.add(paddle);
    }
    for (var j = 0; j < 8; j++) {
      var a2 = j / 8 * Math.PI * 2;
      var len = R - 0.18;
      var s = P.box(0.07, len, 0.07, M3.wood, 0, 0, 0);
      s.position.set(Math.cos(a2) * (0.12 + len / 2), Math.sin(a2) * (0.12 + len / 2), 0);
      s.rotation.z = a2 - Math.PI / 2;
      g.add(s);
    }
    var hub = P.cyl(0.10, 0.10, 0.26, M3.woodD, 0, 0, 0, 14);
    hub.rotation.x = P.ROTX;
    g.add(hub);
    return { group: g, anchor: mkAnchor(R - 0.15, 0.12, 0.12) };
  }

  var _plankMat = null;
  function plankMat() {
    if (!_plankMat) _plankMat = new THREE.MeshStandardMaterial({ map: plankTex(), roughness: 0.84, metalness: 0.04 });
    return _plankMat;
  }

  function buildRopeWheel() { // 大绳轮:盘 + 绳槽沿 + 辐
    var g = group();
    var R = D.RBig;
    var disc = P.cyl(R, R, 0.07, plankMat(), 0, 0, 0, 30);
    disc.rotation.x = P.ROTX;
    g.add(disc);
    [1, -1].forEach(function (s) {
      var rim = P.cyl(R + 0.025, R + 0.025, 0.045, M3.woodD, 0, 0, s * 0.045, 30);
      rim.rotation.x = P.ROTX;
      g.add(rim);
    });
    for (var i = 0; i < 6; i++) {
      var a = i / 6 * Math.PI * 2;
      var s2 = P.box(0.05, R - 0.08, 0.05, M3.wood, 0, 0, 0);
      s2.position.set(Math.cos(a) * (0.06 + (R - 0.08) / 2), Math.sin(a) * (0.06 + (R - 0.08) / 2), 0);
      s2.rotation.z = a - Math.PI / 2;
      g.add(s2);
    }
    var hub = P.cyl(0.07, 0.07, 0.14, M3.woodD, 0, 0, 0, 12);
    hub.rotation.x = P.ROTX;
    g.add(hub);
    return { group: g, anchor: mkAnchor(R * 0.7, 0.12, 0.1) };
  }

  function buildSpindleFrame() { // 锭子车架:长凳双梁 + 8 轴承柱 + 端柱
    var g = group();
    var L = D.frameX1 - D.frameX0;
    var cx = (D.frameX0 + D.frameX1) / 2;
    [1, -1].forEach(function (s) {
      g.add(P.box(L, 0.07, 0.06, plankMat(), cx, 0.14, s * 0.13));
    });
    [[D.frameX0, 0], [D.frameX1, 0], [(D.frameX0 + D.frameX1) / 2, 0]].forEach(function (p) {
      g.add(P.box(0.09, 0.14, 0.26, M3.woodD, p[0], 0.07, 0));
      g.add(P.box(0.24, 0.05, 0.30, M3.stone, p[0], 0.025, 0));
    });
    D.spX.forEach(function (x) {
      g.add(P.box(0.06, 0.22, 0.06, M3.wood, x, 0.21, 0.13));
      g.add(P.box(0.06, 0.22, 0.06, M3.wood, x, 0.21, -0.13));
      g.add(P.box(0.075, 0.045, 0.34, M3.iron, x, 0.31, 0));
    });
    return { group: g, anchor: mkAnchor(D.frameX1 - 0.1, 0.4, 0.2) };
  }

  function buildSpindle(idx) { // 锭子:锭轴(z)+ 锭盘 + 麻缕锥(轴沿 z,盘面 x-y)
    var g = group();
    var axle = P.cyl(0.018, 0.022, D.shaftLen, M3.woodD, 0, 0, -0.18, 10);
    axle.rotation.x = P.ROTX;
    g.add(axle);
    var whorl = P.cyl(D.rSpindle + 0.004, D.rSpindle + 0.004, 0.032, M3.wood, 0, 0, 0, 16);
    whorl.rotation.x = P.ROTX;
    g.add(whorl);
    var whorlRim = P.torus(D.rSpindle + 0.004, 0.008, M3.iron, 0, 0, 0.016, 16);
    g.add(whorlRim);
    var tip = P.mesh(new THREE.ConeGeometry(0.03, 0.10, 8), M3.iron, 0, 0, -D.shaftLen / 2 - 0.18 + 0.02);
    tip.rotation.x = -Math.PI / 2;
    g.add(tip);
    return { group: g, anchor: mkAnchor(0.05, 0.06, 0.08) };
  }

  function buildCord() {     // 传动弦:同一 x-y 平面的开式弦(Line)
    var g = group();
    var pts = KS.cordPoints().map(function (p) {
      return new THREE.Vector3(p[0], p[1], D.axleZ);
    });
    var geo = new THREE.BufferGeometry().setFromPoints(pts);
    var line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xA98B5E }));
    g.add(line);
    return { group: g, anchor: mkAnchor((D.spX[0] + D.spX[D.NS - 1]) / 2, D.spY - 0.06, 0.1) };
  }

  function buildRail() {     // 纱架:立柱 + 横杆 + 麻缕(Line ×8)
    var g = group();
    var L = D.frameX1 - D.frameX0;
    var cx = (D.frameX0 + D.frameX1) / 2;
    [D.frameX0, D.frameX1].forEach(function (x) {
      g.add(P.box(0.09, D.railY, 0.09, M3.woodD, x, D.railY / 2, D.railZ));
      g.add(P.box(0.26, 0.05, 0.26, M3.stone, x, 0.025, D.railZ));
    });
    g.add(P.box(L, 0.06, 0.07, M3.wood, cx, D.railY, D.railZ));
    for (var i = 0; i < D.NS; i++) {
      var pts = [
        new THREE.Vector3(D.spX[i], D.spY, -D.shaftLen / 2 - 0.14),
        new THREE.Vector3(D.spX[i], D.railY - 0.02, D.railZ + 0.04)
      ];
      var geo = new THREE.BufferGeometry().setFromPoints(pts);
      g.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xD8C9A8, transparent: true, opacity: 0.75 })));
    }
    return { group: g, anchor: mkAnchor(cx, D.railY + 0.08, D.railZ) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "stream", name: "STREAM · 溪渠", sub: "水面 0.18 · 渠底 0.06", phase: 0, at: 0.2, dur: 1.3,
      build: buildStream, target: [0, 0, 0], start: [0, 4.6, 0], mid: [0, 2.3, 0] });
    def({ id: "bents", name: "BENTS · 排架", sub: "石柱木帽 · 承轮轴 1.40m", phase: 0, at: 1.3, dur: 1.3,
      build: buildBents, target: [0, 0, 0], start: [0, 5.0, 0.6], mid: [0, 2.6, 0.3] });
    def({ id: "rail", name: "YARN RAIL · 纱架", sub: "横杆 + 麻缕", phase: 0, at: 2.4, dur: 1.2,
      build: buildRail, target: [0, 0, 0], start: [2.6, 4.6, -0.8], mid: [2.6, 2.4, -0.4] });

    def({ id: "waterWheel", name: "WATER WHEEL · 水轮", sub: "径 2.6m · 12 桨 · 浸深 0.08m", phase: 1, at: 7.0, dur: 1.5, kind: "kine",
      build: buildWaterWheel, target: [0, D.wheelY, D.wheelZ], off: [-1.6, 2.4, 0.9] });

    def({ id: "ropeWheel", name: "BIG PULLEY · 大绳轮", sub: "径 0.896m · 同轴增速源", phase: 2, at: 12.2, dur: 1.3, kind: "kine",
      build: buildRopeWheel, target: [0, D.wheelY, D.axleZ], off: [1.0, 2.2, 1.0] });

    def({ id: "spindleFrame", name: "BENCH · 锭子车架", sub: "长凳双梁 · 8 轴承", phase: 3, at: 16.4, dur: 1.4,
      build: buildSpindleFrame, target: [0, 0, 0], start: [2.6, 3.6, 0], mid: [2.6, 1.8, 0] });

    /* 阶段 5-6:8 锭逐支飞入 */
    D.spX.forEach(function (x, i) {
      def({ id: "sp" + i, name: "SPINDLE · 锭子 " + (i + 1), sub: "锭盘 r 0.032 · ×14 增速", phase: i < 4 ? 4 : 5,
        at: 20.2 + i * 0.42, dur: 1.0, kind: "kine",
        build: function () { return buildSpindle(i); }, target: [x, D.spY, 0.4], off: [(i % 2 ? 0.5 : -0.5), 1.6, 0.8] });
    });

    def({ id: "cord", name: "CORD · 传动弦", sub: "绕大绳轮与诸锭盘下缘 · 同向", phase: 6, at: 26.6, dur: 1.4,
      build: buildCord, target: [0, 0, 0], start: [2.0, 3.6, 0.9], mid: [1.4, 1.8, 0.45] });
  };

  /* —— 运动学分发 ——
     ψW = 水轮角;锭 = ψW × 14(开式弦同向);st.errPos = 锭 0 盘缘点解析差(应≈0)。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var psiW = st.psiW || 0;
    var ww = MECH.Parts.entry("waterWheel");
    if (ww && ww.shown) ww.group.rotation.z = psiW;
    var rw = MECH.Parts.entry("ropeWheel");
    if (rw && rw.shown) rw.group.rotation.z = psiW;

    st.errPos = 0;
    for (var i = 0; i < D.NS; i++) {
      var e = MECH.Parts.entry("sp" + i);
      if (e && e.shown) e.group.rotation.z = psiW * D.i;
      if (i === 0 && e && e.sealed) {
        e.group.updateWorldMatrix(true, false);
        _wp.set(D.rSpindle + 0.004, 0, 0).applyMatrix4(e.group.matrixWorld);
        var dx = _wp.x - (D.spX[0] + (D.rSpindle + 0.004) * Math.cos(psiW * D.i));
        var dy = _wp.y - (D.spY + (D.rSpindle + 0.004) * Math.sin(psiW * D.i));
        st.errPos = Math.sqrt(dx * dx + dy * dy);
      }
    }
  };
})(window.MECH = window.MECH || {});
