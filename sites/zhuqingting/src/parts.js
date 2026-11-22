/* 竹蜻蜓部件建模与注册(6 件)。
   布局:案几掌位(双掌示意垫),竹蜻蜓(双翼+轴,kine:spinner rotation.y = φ,
   翼安装角 18°);飞行时整体 position.y = alt;高度标杆;抱朴子书卷;
   硬地。翼叶:两端对置斜面翼(扭角反向)。
   kine:spinner rotation.y = φ轴;整体高度 tick 驱动(holder.position.y)。
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

  /* 案几 + 掌垫 */
  function buildTable() {
    var g = group();
    g.add(P.box(0.5, 0.05, 0.36, M3.woodD, 0, 0.5, 0));
    [[-0.19, -0.13], [0.19, -0.13], [-0.19, 0.13], [0.19, 0.13]].forEach(function (p) {
      g.add(P.box(0.05, 0.48, 0.05, M3.wood, p[0], 0.24, p[1]));
    });
    g.add(P.cyl(0.05, 0.06, 0.012, M3.paper, 0, 0.535, 0, 16));   // 掌垫
    return { group: g, anchor: mkAnchor(0, 0.65, -0.15) };
  }

  /* 竹蜻蜓(kine:spinner rotation.y;holder.position.y = alt + 掌高) */
  function buildToy() {
    var g = group();
    var holder = group();
    holder.position.set(0, 0.56, 0);
    var spinner = group();
    var wingMat = new THREE.MeshStandardMaterial({ color: 0xC9A86B, roughness: 0.6, side: THREE.DoubleSide });
    [-1, 1].forEach(function (s) {
      var wing = P.box(D.R, 0.0022, D.chord, wingMat, s * D.R / 2, 0, 0);
      wing.rotation.y = s * D.pitch;            // 双翼反向扭角
      wing.castShadow = false;
      spinner.add(wing);
      spinner.add(P.box(D.R, 0.004, 0.008, M3.woodD, s * D.R / 2, 0, 0));
    });
    var axle = P.cyl(0.007, 0.008, 0.20, M3.woodD, 0, -0.06, 0, 10);
    spinner.add(axle);
    /* 旋翼模糊盘(高速时视觉残影) */
    var blur = P.mesh(new THREE.CircleGeometry(D.R, 26),
      new THREE.MeshBasicMaterial({ color: 0xD8C8A0, transparent: true, opacity: 0.0, side: THREE.DoubleSide }),
      0, 0, 0);
    blur.rotation.x = -Math.PI / 2;
    blur.castShadow = false;
    spinner.add(blur);
    holder.add(spinner);
    g.add(holder);
    g.userData.anim = { holder: holder, spinner: spinner, blur: blur };
    return { group: g, anchor: mkAnchor(0.10, 0.85, 0) };
  }

  /* 高度标杆 */
  function buildPole() {
    var g = group();
    g.add(P.cyl(0.018, 0.018, 1.7, M3.woodD, -0.55, 0.85, -0.30, 10));
    for (var i = 0; i <= 4; i++) {
      g.add(P.box(0.08, 0.012, 0.012, M3.gold, -0.55, 0.15 + i * 0.4, -0.30));
    }
    return { group: g, anchor: mkAnchor(-0.55, 1.75, -0.30) };
  }

  /* 抱朴子书卷 */
  function buildScroll() {
    var g = group();
    g.add(P.cyl(0.045, 0.045, 0.24, M3.paper, 0.42, 0.535, -0.10, 14));
    var sc = g.children[g.children.length - 1];
    sc.rotation.z = P.ROTZ;
    g.add(P.cyl(0.018, 0.018, 0.26, M3.woodD, 0.42, 0.535, -0.10, 8));
    var roll = g.children[g.children.length - 1];
    roll.rotation.z = P.ROTZ;
    return { group: g, anchor: mkAnchor(0.42, 0.66, -0.10) };
  }

  /* 硬地 */
  function buildGround() {
    var g = group();
    g.add(P.box(1.4, 0.06, 1.0, new THREE.MeshStandardMaterial({ color: 0x5A4A38, roughness: 0.95 }), 0, 0.03, 0));
    return { group: g, anchor: mkAnchor(0.5, 0.1, 0.3) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "ground", name: "GROUND · 硬地", sub: "掌上玩具场地", phase: 0, at: 0.2, dur: 1.0,
      build: buildGround, target: [0, 0, 0], start: [0, 1.2, -0.5], mid: [0, 0.7, -0.25], anchor: [0.5, 0.1, 0.3] });
    def({ id: "table", name: "TABLE · 案几掌垫", sub: "搓转发射位", phase: 0, at: 0.9, dur: 1.1,
      build: buildTable, target: [0, 0, 0], start: [0, 1.8, 0.4], mid: [0, 1.0, 0.2], anchor: [0, 0.68, -0.15] });
    def({ id: "pole", name: "POLE · 高度标杆", sub: "0-1.6m 刻度", phase: 0, at: 1.7, dur: 1.0,
      build: buildPole, target: [0, 0, 0], start: [-0.8, 1.6, -0.5], mid: [-0.6, 0.9, -0.25], anchor: [-0.55, 1.55, -0.30] });

    def({ id: "toy", name: "TOY · 竹蜻蜓", sub: "双翼 18° 扭角 · 搓转起旋", phase: 1, at: 5.3, dur: 1.3, kind: "kine",
      build: buildToy, target: [0, 0, 0], off: [0.3, 0.9, 0.4] });
    def({ id: "scroll", name: "SCROLL · 抱朴子", sub: "「飞车…上升四十里」", phase: 2, at: 10.3, dur: 1.2,
      build: buildScroll, target: [0, 0, 0], start: [0.8, 1.5, -0.4], mid: [0.6, 0.9, -0.2], anchor: [0, 0.7, -0.10] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("toy");
    if (e && e.shown && e.group.userData.anim) {
      var a = e.group.userData.anim;
      a.holder.position.y = 0.56 + st.alt;
      a.spinner.rotation.y = st.theta;
      a.blur.material.opacity = Math.min(0.22, st.omega / 55 * 0.22);   // 高速残影
      /* 翼叶桨距视觉:高速时略上扬(示意) */
      a.holder.rotation.z = st.inHand ? 0 : Math.min(0.08, st.vel * 0.1);
    }
  };
})(window.MECH = window.MECH || {});
