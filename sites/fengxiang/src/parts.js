/* 活塞风箱部件建模与注册(14 件)。
   箱体沿 X 放置,活塞沿 X 往复;顶部两进风活门、右端风道两出气活门;
   鼓风管向右接小炉,风量驱动火焰。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;

  function group() { return new THREE.Group(); }

  function buildBox() {   // 箱体(半剖:上半壳透明)
    var g = group();
    g.add(P.box(D.boxL + 0.08, 0.05, D.boxW + 0.08, M3.woodD, 0, -D.boxH / 2, 0));   // 底
    for (var s = -1; s <= 1; s += 2) {
      g.add(P.box(D.boxL + 0.08, D.boxH, 0.04, M3.wood, 0, 0, s * (D.boxW / 2 + 0.02)));  // 前后壁
    }
    g.add(P.box(0.05, D.boxH, D.boxW, M3.woodD, -(D.boxL / 2 + 0.02), 0, 0));  // 左端(固定端)
    var top = P.mesh(new THREE.BoxGeometry(D.boxL + 0.08, 0.03, D.boxW + 0.08),
      new THREE.MeshStandardMaterial({ map: M3.woodD.map, transparent: true, opacity: 0.42, roughness: 0.8 }),
      0, D.boxH / 2 + 0.015, 0);
    g.add(top);   // 顶盖半透
    /* 中隔板(右腔风道壁,留中孔) */
    g.add(P.box(0.04, D.boxH, D.boxW * 0.34, M3.wood, D.boxL / 2 - 0.14, 0, -D.boxW / 2 + D.boxW * 0.17));
    g.add(P.box(0.04, D.boxH, D.boxW * 0.34, M3.wood, D.boxL / 2 - 0.14, 0, D.boxW / 2 - D.boxW * 0.17));
    return g;
  }

  function buildPiston() {   // 活塞板 + 拉杆 + 手柄
    var g = group();
    var plate = P.box(D.pistonT, D.boxH - 0.05, D.boxW - 0.05, M3.woodD, 0, 0, 0);
    g.add(plate);
    var feathers = P.box(D.pistonT * 0.7, D.boxH - 0.02, D.boxW - 0.02, M3.woodL, 0, 0, 0);
    g.add(feathers);
    var rod = P.cyl(0.028, 0.028, D.rodL, M3.woodL, D.rodL / 2 + D.pistonT / 2, 0, 0, 10);
    rod.rotation.z = P.ROTZ;
    g.add(rod);
    var handle = P.cyl(0.035, 0.035, 0.20, M3.woodD, D.rodL + 0.10, 0, 0, 10);
    handle.rotation.z = P.ROTZ;
    g.add(handle);
    g.userData.rod = rod;
    return { group: g };
  }

  function buildInValve(side) {   // 进风活门(顶部,方形盖板绕内缘翻)
    var g = group();
    var v = group();
    var lid = P.box(0.20, 0.02, 0.16, M3.paper, 0, 0, 0.08);
    v.add(lid);
    var frame = P.box(0.22, 0.025, 0.22, M3.iron, 0, 0.01, 0);
    g.add(frame);
    g.add(v);
    g.userData.lid = v;
    g.userData.side = side;
    return { group: g };
  }

  function buildOutValve(side) {   // 出气活门(右端风道内,竖薄板)
    var g = group();
    var lid = P.box(0.02, 0.22, 0.18, M3.paper, 0, 0, 0);
    lid.rotation.x = 0;
    g.add(lid);
    g.userData.lid = lid;
    g.userData.side = side;
    return { group: g };
  }

  function buildPipe() {   // 鼓风管(右端出风口 → 炉)
    var g = group();
    var pipe = P.cyl(0.075, 0.09, 0.55, M3.woodD, D.boxL / 2 + 0.55, D.boxH / 2 - 0.06, 0, 14);
    pipe.rotation.z = P.ROTZ;
    g.add(pipe);
    var nozzle = P.cyl(0.05, 0.075, 0.18, M3.iron, D.boxL / 2 + 0.9, D.boxH / 2 - 0.06, 0, 12);
    nozzle.rotation.z = P.ROTZ;
    g.add(nozzle);
    return g;
  }

  function buildForge() {   // 小炉 + 火焰 + 坩埚
    var g = group();
    g.add(P.cyl(0.30, 0.36, 0.5, M3.stone, D.boxL / 2 + 1.75, 0.25, 0, 22));
    g.add(P.cyl(0.22, 0.26, 0.10, M3.stone, D.boxL / 2 + 1.75, 0.54, 0, 18));
    var flame = group();
    for (var i = 0; i < 3; i++) {
      var f = P.mesh(new THREE.ConeGeometry(0.10 - i * 0.025, 0.34 - i * 0.07, 8),
        new THREE.MeshStandardMaterial({ color: i === 0 ? 0xE8611C : 0xF2A53A, emissive: i === 0 ? 0xE8611C : 0xF2A53A, emissiveIntensity: 1.2, transparent: true, opacity: 0.85 }),
        (i - 1) * 0.07, 0.17, 0);
      flame.add(f);
    }
    flame.position.set(D.boxL / 2 + 1.75, 0.58, 0);
    g.add(flame);
    g.userData.flame = flame;
    return { group: g };
  }

  function buildStand() {   // 箱体支架
    var g = group();
    [[-0.45, 0.25], [-0.45, -0.25], [0.35, 0.25], [0.35, -0.25]].forEach(function (c) {
      g.add(P.box(0.07, 0.42, 0.07, M3.woodD, c[0], -D.boxH / 2 - 0.21, c[1]));
    });
    return g;
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "stand", name: "STAND · 支架", sub: "箱体基座", phase: 0, kind: "none",
      build: buildStand, target: [0, 0, 0] });
    def({ id: "box", name: "BOX · 箱体(顶盖半透)", sub: "长三尺九寸(演示)", phase: 0, at: 0.15, dur: 1.2,
      build: buildBox, target: [0, D.boxH / 2 + 0.42, 0], start: [0, 4.2, 2.6], mid: [0, 2.6, 1.2], anchor: [0, 0.2, 0.4] });
    def({ id: "piston", name: "PISTON · 活塞+拉杆", sub: "双动 · 往复均出风", phase: 1, at: 3.4, dur: 1.2, kind: "kine",
      build: buildPiston, target: [0, D.boxH / 2 + 0.42, 0], off: [0, 1.8, 2.8] });
    def({ id: "inL", name: "IN-VALVE · 进风活门 L", sub: "左腔扩则开", phase: 2, at: 6.3, dur: 0.8, kind: "kine",
      build: function () { return buildInValve(-1); }, target: [-D.boxL / 2 + 0.28, D.boxH / 2 + 0.42 + 0.02, 0], off: [0, 1.5, 1.2] });
    def({ id: "inR", name: "IN-VALVE · 进风活门 R", sub: "右腔扩则开", phase: 2, at: 6.9, dur: 0.8, kind: "kine",
      build: function () { return buildInValve(1); }, target: [D.boxL / 2 - 0.28, D.boxH / 2 + 0.42 + 0.02, 0], off: [0, 1.5, 1.2] });
    def({ id: "outL", name: "OUT-VALVE · 出气活门 L", sub: "左腔压则开", phase: 2, at: 7.5, dur: 0.8, kind: "kine",
      build: function () { return buildOutValve(-1); }, target: [D.boxL / 2 - 0.14, D.boxH / 2 + 0.42 + 0.02, -D.boxW / 2 + D.boxW * 0.17], off: [0.5, 1.5, 1.0] });
    def({ id: "outR", name: "OUT-VALVE · 出气活门 R", sub: "右腔压则开", phase: 2, at: 8.1, dur: 0.8, kind: "kine",
      build: function () { return buildOutValve(1); }, target: [D.boxL / 2 - 0.14, D.boxH / 2 + 0.42 + 0.02, D.boxW / 2 - D.boxW * 0.17], off: [0.5, 1.5, -1.0] });
    def({ id: "pipe", name: "PIPE · 鼓风管", sub: "鸟喙出风口", phase: 3, at: 9.4, dur: 1.0,
      build: buildPipe, target: [0, 0, 0], start: [0, 3.4, 2.8], mid: [0, 2.2, 1.4], anchor: [0, 0.1, 0.3] });
    def({ id: "forge", name: "FORGE · 炉火", sub: "风助火势", phase: 3, at: 10.2, dur: 1.1,
      build: buildForge, target: [0, 0, 0], start: [2.4, 2.8, -1.6], mid: [1.4, 1.6, -0.8], anchor: [0, 0.5, 0.4] });
  };

  /* —— 运动学分发 —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("piston");
    if (e && e.shown) e.group.position.x = st.x;
    /* 进风活门:盖板绕后缘翻开(开 = 翻起 55°) */
    e = MECH.Parts.entry("inL");
    if (e && e.shown) e.group.userData.lid.rotation.x = -st.valves.inL * 0.95;
    e = MECH.Parts.entry("inR");
    if (e && e.shown) e.group.userData.lid.rotation.x = st.valves.inR * 0.95;
    /* 出气活门:薄板绕前缘翻 */
    e = MECH.Parts.entry("outL");
    if (e && e.shown) e.group.userData.lid.rotation.x = -st.valves.outL * 0.9;
    e = MECH.Parts.entry("outR");
    if (e && e.shown) e.group.userData.lid.rotation.x = -st.valves.outR * 0.9;
    /* 火焰随风量 */
    e = MECH.Parts.entry("forge");
    if (e && e.shown) {
      var s = 0.75 + st.airflow * 0.5 + Math.sin(st.time * 9) * 0.05;
      e.group.userData.flame.scale.set(s, s, s);
    }
  };
})(window.MECH = window.MECH || {});
