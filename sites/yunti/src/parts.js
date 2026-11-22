/* 云梯部件建模与注册(8 件)。
   布局:床(六轮车架)居原点,牛皮屏四面;主梯(kine)绕车顶转轴(pivot 0.35,1.10,0)
   竖直面内立起(rotation.z:折叠 15°→55°,梯沿局部 -X 指向西/城墙);
   飞梯为 mainLadder 子组(沿梯轴滑轨上展,tick 驱动);绞车在车尾(kine rotation.x),
   绳经主梯顶滑轮系梯中段;城墙在西 x-7.0(高 7.2m)。
   kine:mainLadder 只写 rotation.z;绞车写 rotation.x;飞梯子组位移经 userData.anim。
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

  /* 床(车架 + 六轮) */
  function buildCart() {
    var g = group();
    g.add(P.box(2.6, 0.14, 1.3, M3.woodD, 0, 0.62, 0));
    g.add(P.box(2.7, 0.10, 1.1, M3.wood, 0, 0.50, 0));
    [[-1.05, -0.48], [0, -0.48], [1.05, -0.48], [-1.05, 0.48], [0, 0.48], [1.05, 0.48]].forEach(function (p) {
      var w = P.cyl(D.wheelR, D.wheelR, 0.10, M3.woodD, p[0], D.wheelR, p[1], 18);
      w.rotation.x = P.ROTX;
      g.add(w);
      g.add(P.cyl(0.08, 0.08, 0.11, M3.iron, p[0], D.wheelR, p[1], 10));
    });
    g.add(P.box(0.5, 0.30, 0.9, M3.woodD, 1.15, 0.85, 0));   // 推手尾架
    return { group: g, anchor: mkAnchor(1.15, 1.05, 0) };
  }

  /* 牛皮屏(四面,褐色盾板) */
  function buildScreen() {
    var g = group();
    var mat = new THREE.MeshStandardMaterial({ color: 0x8A5A3A, roughness: 0.9 });
    [-0.62, 0.62].forEach(function (z) {
      g.add(P.box(2.5, 0.85, 0.05, mat, 0, 1.10, z));
    });
    g.add(P.box(0.05, 0.85, 1.2, mat, -1.25, 1.10, 0));
    g.add(P.box(0.05, 0.85, 1.2, mat, 1.25, 1.10, 0));
    /* 铆钉 */
    for (var i = 0; i < 6; i++) {
      g.add(P.cyl(0.02, 0.02, 0.02, M3.iron, -1.0 + i * 0.4, 1.35, -0.65, 6));
    }
    return { group: g, anchor: mkAnchor(0, 1.62, -0.62) };
  }

  /* 主梯(kine:rotation.z = −θ,梯沿局部 −X 伸向西)+ 内嵌飞梯子组 */
  function buildMainLadder() {
    var g = group();
    var holder = group();
    holder.position.set(D.pivot.x, D.pivot.y, D.pivot.z);
    /* 梯体:沿局部 -X(西向),双梁 + 横档 */
    for (var i = 0; i <= 14; i++) {
      var u = -i / 14 * D.Lmain;
      [-0.10, 0.10].forEach(function (z) {
        g.add(P.box(D.Lmain / 14 + 0.02, 0.075, 0.06, M3.wood, u, 0, z));
      });
      g.add(P.box(0.05, 0.04, 0.22, M3.wood, u + 0.06, 0.01, 0));
    }
    /* 顶滑轮 */
    var pulley = P.torus(0.07, 0.02, M3.iron, -D.Lmain, 0.10, 0, 14);
    g.add(pulley);
    /* 内嵌飞梯子组(沿梯轴滑轨,local -X 向,上展 = +X 位移) */
    var fly = group();
    for (var j = 0; j <= 5; j++) {
      var u2 = -j / 5 * D.Lfly;
      [-0.08, 0.08].forEach(function (z2) {
        fly.add(P.box(D.Lfly / 5 + 0.02, 0.05, 0.04, M3.wood, u2, 0.06, z2));
      });
      fly.add(P.box(0.04, 0.03, 0.18, M3.wood, u2 + 0.05, 0.05, 0));
    }
    fly.add(P.box(0.10, 0.05, 0.30, M3.iron, -D.Lfly, 0.06, 0));   // 梯首抓钩(推算)
    fly.position.x = -D.Lmain + 0.1;
    holder.add(fly);
    g.add(holder);
    g.userData.anim = { holder: holder, fly: fly };
    return { group: g, anchor: mkAnchor(-0.5, 1.6, 0) };
  }

  /* 绞车(kine:rotation.x = 绳累计/r)+ 绳(可视,至主梯顶) */
  function buildWinch() {
    var g = group();
    g.add(P.box(0.44, 0.10, 0.44, M3.woodD, 1.30, 0.85, 0));
    var drum = P.cyl(D.winchR, D.winchR, 0.30, M3.woodD, 1.30, 1.00, 0, 14);
    g.add(drum);
    g.add(P.cyl(0.03, 0.03, 0.42, M3.iron, 1.30, 1.00, 0, 8));
    [-1, 1].forEach(function (s) {
      g.add(P.box(0.08, 0.24, 0.08, M3.wood, 1.30, 0.88, s * 0.18));
    });
    var rope = P.cyl(0.014, 0.014, 2.6, M3.rope, 0.9, 1.9, 0, 6);
    rope.rotation.z = 0.45;
    rope.castShadow = false;
    g.add(rope);
    g.userData.anim = { drum: drum, rope: rope };
    return { group: g, anchor: mkAnchor(1.30, 1.20, 0.2) };
  }

  /* 城墙(西,含堞口) */
  function buildWall() {
    var g = group();
    var brick = new THREE.MeshStandardMaterial({ color: 0x54575C, roughness: 0.95 });
    g.add(P.box(D.wallT, D.wallH, 3.0, brick, D.wallX, D.wallH / 2, 0));
    for (var i = 0; i < 7; i++) {
      g.add(P.box(0.35, 0.55, 0.5, brick, D.wallX + D.wallT / 2 - 0.1, D.wallH + 0.28, -1.2 + i * 0.42));
    }
    g.add(P.box(D.wallT + 0.3, 0.16, 3.0, M3.stone, D.wallX, D.wallH + 0.06, 0));
    return { group: g, anchor: mkAnchor(D.wallX + 1.0, D.wallH, 0) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "cart", name: "CART · 床(六轮车架)", sub: "「以大木为床,下施六轮」", phase: 0, at: 0.2, dur: 1.2,
      build: buildCart, target: [0, 0, 0], start: [0, 2.4, 1.4], mid: [0, 1.4, 0.7], anchor: [0, 1.0, 0.5] });
    def({ id: "screen", name: "SCREEN · 牛皮屏", sub: "「四面以生牛皮为屏蔽」", phase: 0, at: 1.0, dur: 1.2,
      build: buildScreen, target: [0, 0, 0], start: [0, 3.2, -1.2], mid: [0, 1.9, -0.6], anchor: [0, 1.7, -0.62] });
    def({ id: "wall", name: "WALL · 城墙", sub: "抵城堞 · 宋城高压缩 7.2m", phase: 0, at: 1.8, dur: 1.2,
      build: buildWall, target: [0, 0, 0], start: [-7.5, 3.4, 0], mid: [-7.2, 1.8, 0], anchor: [-6.0, 3.5, 0] });

    def({ id: "mainLadder", name: "MAIN LADDER · 主梯(转轴)", sub: "6.2m · 中施转轴 15°→55°", phase: 1, at: 5.3, dur: 1.4, kind: "kine",
      build: buildMainLadder, target: [0, 0, 0], off: [0.8, 1.6, 1.0] });
    def({ id: "winch", name: "WINCH · 绞车(双辘轳借鉴)", sub: "r0.12 · 立梯 1.86 圈+飞梯 2.92 圈", phase: 1, at: 6.6, dur: 1.2, kind: "kine",
      build: buildWinch, target: [0, 0, 0], off: [-0.7, 1.4, 0.9] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("mainLadder");
    if (e && e.shown && e.group.userData.anim) {
      var a = e.group.userData.anim;
      a.holder.rotation.z = -st.theta;              // 局部 -X 抬起 = −θ 绕 z(梯上举)
      a.fly.position.x = -D.Lmain + 0.1 + st.fly;   // 飞梯沿梯轴上展
    }
    e = MECH.Parts.entry("winch");
    if (e && e.shown && e.group.userData.anim) {
      e.group.userData.anim.drum.rotation.x = -(st.rope1 + st.rope2) / D.winchR;
    }
  };
})(window.MECH = window.MECH || {});
