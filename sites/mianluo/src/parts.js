/* 水击面罗部件建模与注册(12 件)。
   布局:水渠沿 z(x=-3.0),立轮(竖直,横轴沿 x)半浸渠水,卧轴同轴东伸入罗坊;
   木架四柱一梁,罗框四索悬吊(摆长 0.95),框西缘撞杆正对轴端 3 攀耳(120° 均布);
   面柜承框下筛落面粉(粉面随累计长高),料斗倒麦入框。
   kine:wheel/shaftCam 只写 rotation.x(轴沿 x);罗框摆动写 group.rotation.z(吊点)
   ——罗框部件 group 原点=吊点横梁下沿(target 摆位),框体几何 -y 方向悬挂。
   标签锚点:build 返回 anchor。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  function graniteMat() {
    return new THREE.MeshStandardMaterial({ color: 0x4E5258, roughness: 0.94 });
  }

  /* —— 部件构建器 —— */

  /* 水渠:两壁 + 底 + 水(立轮半浸) */
  function buildChannel() {
    var g = group();
    var wallH = D.chWater - D.chFloor + 0.50;
    g.add(P.box(0.12, wallH, D.chZ1 - D.chZ0, graniteMat(), D.chX - D.chW / 2 - 0.06, D.chFloor + wallH / 2, 0));
    g.add(P.box(0.12, wallH, D.chZ1 - D.chZ0, graniteMat(), D.chX + D.chW / 2 + 0.06, D.chFloor + wallH / 2, 0));
    g.add(P.box(D.chW, 0.06, D.chZ1 - D.chZ0, graniteMat(), D.chX, D.chFloor - 0.03, 0));
    var water = P.box(D.chW - 0.04, 0.14, D.chZ1 - D.chZ0, M3.water, D.chX, D.chWater - 0.07, 0);
    water.castShadow = false;
    g.add(water);
    g.add(P.box(0.6, 0.30, 1.0, graniteMat(), D.chX + 0.75, 0.15, 0));
    return { group: g, anchor: mkAnchor(D.chX - 0.8, 0.4, -2.0) };
  }

  /* 立轮:竖直轮盘(横轴沿 x)+ 12 辐叶 + 毂(原点=轮心;旋转写 rotation.x) */
  function buildWheel() {
    var g = group();
    var rim = P.torus(D.Rwheel - 0.03, 0.035, M3.woodD, 0, 0, 0, 44);
    g.add(rim);
    g.add(P.cyl(0.14, 0.14, 0.24, M3.woodD, 0, 0, 0, 14));
    for (var i = 0; i < D.nBlade; i++) {
      var a = i / D.nBlade * Math.PI * 2;
      var holder = group();
      holder.rotation.x = a;
      var blade = P.box(0.05, D.Rwheel - 0.16, 0.26, M3.wood, 0, (D.Rwheel - 0.16) / 2 + 0.08, 0);
      blade.rotation.y = 0.85;                    // 斗叶斜面受水
      holder.add(blade);
      g.add(holder);
    }
    return { group: g, anchor: mkAnchor(-D.Rwheel + 0.3, 0.30, 0) };
  }

  /* 卧轴 + 3 攀耳(kine:rotation.x = θ轴;原点=轴心) */
  function buildShaftCam() {
    var g = group();
    var axle = P.cyl(0.075, 0.075, 3.4, M3.woodD, -1.4, 0, 0, 12);
    axle.rotation.z = P.ROTZ;                       // 圆柱轴 Y → X(卧轴,西接立轮)
    g.add(axle);
    /* 攀耳:轴端凸耳盘 3 耳 120° 均布(打击半径 0.20) */
    var cam = group();
    cam.position.x = D.camX;
    for (var i = 0; i < D.camN; i++) {
      var a = i / D.camN * Math.PI * 2;
      var lug = P.box(0.05, 0.16, 0.10, M3.iron, 0, 0, 0);
      lug.position.set(0, Math.sin(a) * 0.20, Math.cos(a) * 0.20);
      lug.rotation.x = -a;
      cam.add(lug);
      var hub = P.box(0.05, 0.10, 0.06, M3.woodD, 0, Math.sin(a) * 0.08, Math.cos(a) * 0.08);
      hub.rotation.x = -a;
      cam.add(hub);
    }
    g.add(cam);
    return { group: g, anchor: mkAnchor(0, 0.30, 0.25) };
  }

  /* 木架:四柱 + 顶梁(吊索锚点)+ 斜撑 */
  function buildFrame() {
    var g = group();
    var hw = 0.85, hd = 0.62, top = D.ropeTop;
    [[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd]].forEach(function (p) {
      g.add(P.box(0.13, top, 0.13, M3.woodD, p[0], top / 2, p[1]));
    });
    g.add(P.box(hw * 2 + 0.2, 0.14, 0.14, M3.woodD, 0, top, -hd));
    g.add(P.box(hw * 2 + 0.2, 0.14, 0.14, M3.woodD, 0, top, hd));
    g.add(P.box(0.10, 0.9, 0.10, M3.wood, -hw, 0.45, -hd + 0.30));
    g.add(P.box(0.10, 0.9, 0.10, M3.wood, hw, 0.45, -hd + 0.30));
    return { group: g, anchor: mkAnchor(0, top + 0.2, 0) };
  }

  /* 罗框(摆体):原点=吊点(group.rotation.z = 摆角);
     框体悬挂 −y,四索 + 框沿 + 罗底筛网 + 西缘撞杆立柱 */
  function buildSieve() {
    var g = group();
    var hangY = -D.L;                               // 框顶距吊点
    /* 四吊索 */
    var hw = D.frameW / 2 - 0.06, hd = D.frameD / 2 - 0.05;
    [[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd]].forEach(function (p) {
      var rope = P.cyl(0.016, 0.016, D.L, M3.rope, p[0], hangY / 2, p[1]);
      rope.castShadow = false;
      g.add(rope);
    });
    /* 框沿(木框)+ 罗底(筛网,绢面) */
    var fy = hangY;
    g.add(P.box(D.frameW + 0.10, 0.09, 0.08, M3.woodD, 0, fy, -hd));
    g.add(P.box(D.frameW + 0.10, 0.09, 0.08, M3.woodD, 0, fy, hd));
    g.add(P.box(0.08, 0.09, D.frameD, M3.woodD, -D.frameW / 2 - 0.01, fy, 0));
    g.add(P.box(0.08, 0.09, D.frameD, M3.woodD, D.frameW / 2 + 0.01, fy, 0));
    var mesh = P.mesh(new THREE.PlaneGeometry(D.frameW, D.frameD),
      new THREE.MeshStandardMaterial({ color: 0xD8CBA8, roughness: 0.9, side: THREE.DoubleSide }),
      0, fy + 0.02, 0);
    mesh.rotation.x = -Math.PI / 2;
    mesh.castShadow = false;
    g.add(mesh);
    /* 麦粉层(筛上待筛物,薄褐层;tick 控制减少) */
    var grainLayer = P.box(D.frameW - 0.08, 0.035, D.frameD - 0.08,
      new THREE.MeshStandardMaterial({ color: 0xB98F56, roughness: 0.9 }), 0, fy + 0.05, 0);
    grainLayer.castShadow = false;
    g.add(grainLayer);
    /* 西缘撞杆立柱(顶端正对攀耳) */
    g.add(P.box(0.07, 0.30, 0.09, M3.woodD, D.postX - D.frameX, fy + 0.10, 0));
    g.add(P.box(0.10, 0.05, 0.12, M3.iron, D.postX - D.frameX, fy + 0.24, 0));
    g.userData.anim = { grainLayer: grainLayer };
    return { group: g, anchor: mkAnchor(0, hangY + 0.3, 0.3) };
  }

  /* 面柜:承筛落面粉(粉面随 flour 长高)+ 敖皮堆 */
  function buildChest() {
    var g = group();
    var cx = D.frameX, cz = 0.0, y0 = 0.30;
    g.add(P.box(1.5, 0.09, 1.0, M3.woodD, cx, y0, cz));
    [[-0.71, -0.46], [0.71, -0.46], [-0.71, 0.46], [0.71, 0.46]].forEach(function (p) {
      g.add(P.box(0.07, y0, 0.07, M3.woodD, cx + p[0], y0 / 2, cz + p[1]));
    });
    g.add(P.box(0.05, 0.30, 1.0, M3.wood, cx - 0.75, y0 + 0.15, cz));
    g.add(P.box(0.05, 0.30, 1.0, M3.wood, cx + 0.75, y0 + 0.15, cz));
    g.add(P.box(1.5, 0.30, 0.05, M3.wood, cx, y0 + 0.15, cz - 0.48));
    var flour = P.box(1.34, 0.02, 0.84, M3.paper, cx, y0 + 0.07, cz);
    flour.castShadow = false; flour.scale.y = 0.01;
    g.add(flour);
    g.userData.anim = { flour: flour };
    return { group: g, anchor: mkAnchor(cx + 0.85, y0 + 0.25, cz) };
  }

  /* 料斗:高腿方斗 + 溜槽(倒麦入罗框) */
  function buildHopper() {
    var g = group();
    var hx = D.hopperX, hz = D.hopperZ;
    [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]].forEach(function (o) {
      g.add(P.box(0.05, 1.55, 0.05, M3.woodD, hx + o[0], 0.775, hz + o[1]));
    });
    var hopper = P.mesh(new THREE.CylinderGeometry(0.16, 0.30, 0.34, 4), M3.wood, hx, 1.70, hz);
    hopper.rotation.y = Math.PI / 4;
    g.add(hopper);
    var holder = group();
    holder.position.set(hx, 1.47, hz);
    holder.rotation.y = Math.atan2(-(0 - hz), D.frameX + D.frameW / 2 - 0.2 - hx);
    var ch = P.box(0.62, 0.05, 0.14, M3.wood, 0.31, 0, 0);
    ch.rotation.z = -0.52;
    holder.add(ch);
    g.add(holder);
    return { group: g, anchor: mkAnchor(hx, 1.95, hz) };
  }

  /* 麦层倾入(罗框内麦堆一次倾入,静态块) */
  function buildGrainLoad() {
    var g = group();
    var heap = P.sph(0.16, new THREE.MeshStandardMaterial({ color: 0xB98F56, roughness: 0.92 }),
      D.frameX + 0.1, D.frameY + 0.03, 0);
    heap.scale.y = 0.55;
    g.add(heap);
    return { group: g, anchor: mkAnchor(D.frameX + 0.1, D.frameY + 0.25, 0) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "channel", name: "CHANNEL · 水渠", sub: "立轮半浸 · 深挖 0.70", phase: 0, at: 0.2, dur: 1.2,
      build: buildChannel, target: [0, 0, 0], start: [0, 3.4, -3.0], mid: [0, 1.7, -1.4], anchor: [0, 0.5, -2.0] });
    def({ id: "frame", name: "FRAME · 木架", sub: "四柱一梁 · 吊索锚点 y2.55", phase: 0, at: 1.0, dur: 1.2,
      build: buildFrame, target: [0, 0, 0], start: [0, 4.6, 1.6], mid: [0, 2.6, 0.8], anchor: [0, 2.75, 0] });

    def({ id: "wheel", name: "WATER WHEEL · 立轮", sub: "径 2.3m · 12 斗叶 · 同轴直驱", phase: 1, at: 5.3, dur: 1.3, kind: "kine",
      build: buildWheel, target: [D.wx, D.shaftHi, D.wz], off: [-0.9, 2.6, 1.3] });
    def({ id: "shaftCam", name: "SHAFT & CAMS · 卧轴·攀耳", sub: "3 攀耳 120° 均布 · 直驱 1:1", phase: 1, at: 6.5, dur: 1.2, kind: "kine",
      build: buildShaftCam, target: [0, D.shaftHi, 0], off: [0.9, 2.4, 1.3] });

    def({ id: "sieve", name: "SIEVE · 罗框·罗底·撞杆", sub: "四索悬吊 摆长 0.95m", phase: 2, at: 10.3, dur: 1.4, kind: "kine",
      build: buildSieve, target: [D.frameX, D.ropeTop, 0], off: [1.0, 2.0, 1.1] });
    def({ id: "chest", name: "FLOUR CHEST · 面柜", sub: "粉面随筛落长高", phase: 2, at: 11.6, dur: 1.2,
      build: buildChest, target: [0, 0, 0], start: [0, 3.0, 1.4], mid: [0, 1.6, 0.8], anchor: [0, 0.7, 0] });

    def({ id: "hopper", name: "GRAIN HOPPER · 料斗", sub: "倒麦入罗", phase: 3, at: 16.3, dur: 1.2,
      build: buildHopper, target: [0, 0, 0], start: [1.6, 4.2, 2.0], mid: [1.2, 2.6, 1.4], anchor: [0, 2.0, 0.9] });
    def({ id: "grainLoad", name: "GRAIN · 麦层入罗", sub: "待筛麦粉层", phase: 3, at: 17.4, dur: 1.0,
      build: buildGrainLoad, target: [0, 0, 0], start: [0.8, 3.6, 0.4], mid: [0.4, 2.2, 0.2], anchor: [0, 1.6, 0] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("wheel");
    if (e && e.shown) e.group.rotation.x = st.thetaWheel;
    e = MECH.Parts.entry("shaftCam");
    if (e && e.shown) e.group.rotation.x = st.thetaShaft;
    e = MECH.Parts.entry("sieve");
    if (e && e.shown) e.group.rotation.z = st.swingT * 0.9;   // 摆动(幅度系数防过摆)
  };
})(window.MECH = window.MECH || {});
