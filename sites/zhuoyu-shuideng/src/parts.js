/* 琢玉水凳部件建模与注册(7 件)。
   布局:水凳横置(凳面 y0.55),主轴沿 x(高 y0.62):碢轮(铁盘 r0.14)居中 x-0.25,
   轴鼓(r0.045)在 x0.42;绳下接踏板(支点 x0.06,板长 0.72),配重锤挂绳鼓另一侧;
   玉料抵碢缘(x-0.445),锅架水盆滴解玉砂浆;划痕经 userData.anim 由 tick 驱动加深。
   kine:axle(轴+碢轮+轴鼓) 只写 rotation.x;踏板 rocker 写 rotation.z;配重铅垂反旋。
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

  function buildBench() {
    var g = group();
    g.add(P.box(D.benchL, 0.07, D.benchW, M3.woodD, 0, D.benchY, 0));
    g.add(P.box(D.benchL - 0.1, 0.05, D.benchW - 0.16, M3.woodL, 0, D.benchY - 0.06, 0));   // 凳槽
    [[-0.62, -0.24], [0.62, -0.24], [-0.62, 0.24], [0.62, 0.24]].forEach(function (p) {
      g.add(P.box(0.10, D.benchY - 0.10, 0.10, M3.wood, p[0], (D.benchY - 0.10) / 2, p[1]));
    });
    g.add(P.box(0.09, 0.34, 0.09, M3.woodD, D.pedalPivotX, 0.17, -0.22));    // 踏板支点立柱
    return { group: g, anchor: mkAnchor(0, D.benchY + 0.15, 0) };
  }

  /* 主轴 + 碢轮 + 轴鼓(kine:rotation.x = φ轴;原点=轴心线,几何沿 x) */
  function buildAxle() {
    var g = group();
    var axle = P.cyl(0.035, 0.035, 1.15, M3.woodD, 0, 0, 0, 12);
    axle.rotation.z = P.ROTZ;
    g.add(axle);
    var disc = P.cyl(D.Rdisc, D.Rdisc, D.discT, M3.iron, D.discX, 0, 0, 30);
    disc.rotation.z = P.ROTZ;
    g.add(disc);
    var drum = P.cyl(D.rdrum + 0.01, D.rdrum + 0.01, 0.10, M3.woodD, D.drumX, 0, 0, 16);
    drum.rotation.z = P.ROTZ;
    g.add(drum);
    g.add(P.cyl(0.022, 0.022, 0.10, M3.iron, D.drumX, 0, 0, 8));
    return { group: g, anchor: mkAnchor(D.discX, D.Rdisc + 0.10, 0) };
  }

  /* 踏板 + 绳 + 配重(kine:rocker.rotation.z;绳端位置由 rocker 带动) */
  function buildPedalRope() {
    var g = group();
    var rocker = group();
    rocker.position.set(D.pedalPivotX, D.pedalY + 0.05, 0);
    var board = P.box(D.pedalL, 0.045, 0.16, M3.lacquer, D.pedalL / 2 - 0.10, 0, 0);
    rocker.add(board);
    g.add(rocker);
    /* 绳(上端挂轴鼓,下端挂踏板尾)——静态直绳(小摆角近似) */
    var rope = P.cyl(0.012, 0.012, D.ropeTopY - D.ropeBotY - 0.06, M3.rope,
      D.pedalX, (D.ropeTopY + D.ropeBotY) / 2 + 0.02, 0, 8);
    rope.castShadow = false;
    g.add(rope);
    /* 配重锤(挂绳鼓西侧,铅垂) */
    var cwRope = P.cyl(0.010, 0.010, 0.5, M3.rope, D.drumX - 0.08, D.axleY - 0.28, 0, 8);
    cwRope.castShadow = false;
    g.add(cwRope);
    g.add(P.cyl(0.055, 0.065, 0.14, M3.iron, D.drumX - 0.08, D.axleY - 0.60, 0, 12));
    g.userData.anim = { rocker: rocker };
    return { group: g, anchor: mkAnchor(D.pedalX, 0.35, 0.2) };
  }

  /* 玉料 + 托架 + 划痕槽(tick 经 userData.anim.notch 加深) */
  function buildJade() {
    var g = group();
    var jx = D.jadeX, jy = D.jadeY;
    g.add(P.box(0.20, 0.09, 0.24, M3.woodD, jx - 0.06, jy - 0.10, 0));
    var jade = P.box(0.075, 0.10, 0.16, new THREE.MeshStandardMaterial({ color: 0x7CA98B, roughness: 0.35, metalness: 0.08 }),
      jx, jy + 0.10, 0);
    g.add(jade);
    /* 划痕槽(深色,高度随 notch 缩) */
    var notch = P.box(0.016, 0.055, 0.075, new THREE.MeshStandardMaterial({ color: 0x2E3A32, roughness: 0.7 }),
      D.discX + D.Rdisc + 0.012, jy + 0.145, 0);
    g.add(notch);
    g.userData.anim = { notch: notch, jade: jade };
    return { group: g, anchor: mkAnchor(jx, jy + 0.30, 0) };
  }

  /* 锅架:小架 + 砂浆盆 + 滴管(tick 滴落粒子) */
  function buildPot() {
    var g = group();
    var px = D.discX + 0.12, py = 1.05;
    g.add(P.box(0.05, py - D.benchY - 0.05, 0.05, M3.wood, px - 0.16, (py + D.benchY) / 2, -0.14));
    g.add(P.box(0.05, py - D.benchY - 0.05, 0.05, M3.wood, px + 0.16, (py + D.benchY) / 2, -0.14));
    g.add(P.box(0.44, 0.05, 0.30, M3.woodD, px, py, -0.14));
    var pot = P.mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.12, 4), M3.paper, px, py + 0.11, -0.14);
    pot.rotation.y = Math.PI / 4;
    g.add(pot);
    var drip = P.cyl(0.012, 0.012, 0.24, M3.water, px - 0.02, py - 0.10, -0.02, 8);
    drip.castShadow = false;
    g.add(drip);
    g.userData.anim = { drip: drip };
    return { group: g, anchor: mkAnchor(px, py + 0.30, -0.14) };
  }

  /* 座凳(操作者座,东端装饰) */
  function buildStool() {
    var g = group();
    g.add(P.box(0.34, 0.06, 0.34, M3.woodD, 0.95, 0.40, 0));
    [[-0.13, -0.13], [0.13, -0.13], [-0.13, 0.13], [0.13, 0.13]].forEach(function (p) {
      g.add(P.box(0.06, 0.37, 0.06, M3.wood, 0.95 + p[0], 0.185, p[1]));
    });
    return { group: g, anchor: mkAnchor(0.95, 0.55, 0.25) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "bench", name: "BENCH · 水凳", sub: "凳面凳槽 · 玉作图扎碢制式", phase: 0, at: 0.2, dur: 1.2,
      build: buildBench, target: [0, 0, 0], start: [0, 3.4, -1.6], mid: [0, 1.9, -0.8], anchor: [0, 0.8, -0.3] });
    def({ id: "stool", name: "STOOL · 座凳", sub: "足踏操作位", phase: 0, at: 1.0, dur: 1.0,
      build: buildStool, target: [0, 0, 0], start: [1.6, 2.8, 0.6], mid: [1.2, 1.5, 0.3], anchor: [0, 0.6, 0.25] });

    def({ id: "axle", name: "AXLE & DISC · 主轴·碢轮", sub: "铁碢 r0.14 · 轴鼓 r0.045", phase: 1, at: 5.3, dur: 1.3, kind: "kine",
      build: buildAxle, target: [0, D.axleY, D.axleZ], off: [0.7, 2.2, 1.1] });
    def({ id: "pedal", name: "PEDAL & ROPE · 踏板·绳·配重", sub: "足踏往复 · 配重回位(推算)", phase: 1, at: 6.5, dur: 1.3, kind: "kine",
      build: buildPedalRope, target: [0, 0, 0], off: [-0.8, 2.0, 1.2] });

    def({ id: "jade", name: "JADE · 玉料·划痕", sub: "抵碢缘 · 砂浆研磨", phase: 2, at: 10.3, dur: 1.3,
      build: buildJade, target: [0, 0, 0], start: [-1.4, 2.8, 0.8], mid: [-0.9, 1.6, 0.4], anchor: [0, 0.75, 0] });
    def({ id: "pot", name: "ABRASIVE POT · 锅架砂浆", sub: "解玉砂+水 滴注碢缘", phase: 2, at: 11.5, dur: 1.2,
      build: buildPot, target: [0, 0, 0], start: [0.4, 3.2, -1.0], mid: [0.2, 1.9, -0.5], anchor: [0, 1.35, -0.14] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("axle");
    if (e && e.shown) e.group.rotation.x = st.phiAxle;
    e = MECH.Parts.entry("pedal");
    if (e && e.shown && e.group.userData.anim) {
      e.group.userData.anim.rocker.rotation.z = st.phiPedal;
    }
  };
})(window.MECH = window.MECH || {});
