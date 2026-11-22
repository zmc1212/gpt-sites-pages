/* 候风地动仪部件建模与注册(约 27 件)。
   樽体半剖(开口朝 +z)露出内部都柱倒立摆与八道;8 龙首含丸环列樽肩,
   8 蟾蜍环列基座外;触发方位的铜丸沿抛物线落入对应蟾蜍口。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;

  function group() { return new THREE.Group(); }

  /* 方位 k 的世界方向(N=−z 顺时针 45°) */
  function dirVec(k) { return { x: D.dirs8[k].ax, z: D.dirs8[k].az }; }

  function buildBase() {   // 基座 + 山纹
    var g = group();
    g.add(P.cyl(D.baseR, D.baseR + 0.06, D.baseH, M3.bronze, 0, D.baseH / 2, 0, 40));
    var ring = P.torus(D.baseR - 0.04, 0.02, M3.gold, 0, D.baseH - 0.02, 0, 40);
    ring.rotation.x = P.ROTX;
    g.add(ring);
    return g;
  }

  /* 樽体半剖:内壳 + 外壳(thetaStart 控制开口朝 +z),肩环带 */
  function buildVat() {
    var g = group();
    var open = Math.PI * 0.72;                 // 剖开角(开口朝 +z)
    var shell = new THREE.Mesh(
      new THREE.CylinderGeometry(D.vatR, D.vatR * 0.92, D.vatH, 44, 1, true, Math.PI / 2 - open / 2 + Math.PI, open),
      new THREE.MeshStandardMaterial({ color: 0x8A6E3F, metalness: 0.62, roughness: 0.45, side: THREE.DoubleSide }));
    shell.position.y = D.baseH + D.vatH / 2;
    shell.castShadow = true;
    g.add(shell);
    var shellIn = new THREE.Mesh(
      new THREE.CylinderGeometry(D.vatR - 0.03, D.vatR * 0.92 - 0.03, D.vatH, 44, 1, true, Math.PI / 2 - open / 2 + Math.PI, open),
      new THREE.MeshStandardMaterial({ color: 0x6B5634, metalness: 0.5, roughness: 0.55, side: THREE.BackSide }));
    shellIn.position.y = shell.position.y;
    g.add(shellIn);
    /* 顶盖(隆起半圆)+ 底缘 */
    var lid = new THREE.Mesh(new THREE.SphereGeometry(D.vatR, 36, 14, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x8A6E3F, metalness: 0.62, roughness: 0.45 }));
    lid.position.y = D.baseH + D.vatH;
    lid.scale.y = 0.42;
    g.add(lid);
    var rim = P.torus(D.vatR, 0.028, M3.gold, 0, D.baseH + D.vatH - 0.05, 0, 44);
    rim.rotation.x = P.ROTX;
    g.add(rim);
    var rim2 = P.torus(D.vatR * 0.92, 0.028, M3.gold, 0, D.baseH + 0.04, 0, 44);
    rim2.rotation.x = P.ROTX;
    g.add(rim2);
    return g;
  }

  function buildPendulum() {   // 都柱倒立摆:枢轴座 + 摆柱 + 顶珠
    var g = group();
    g.add(P.cyl(0.16, 0.20, 0.12, M3.bronze, 0, D.pivotY - 0.06, 0, 22));   // 枢轴座
    var rod = P.cyl(0.055, 0.065, D.pendL, M3.steelD, 0, D.pendL / 2, 0, 14);
    g.add(rod);
    g.add(P.sph(0.095, M3.bronze, 0, D.pendL - 0.02, 0));
    g.add(P.cyl(0.10, 0.13, 0.05, M3.gold, 0, D.pivotY + 0.02, 0, 18));
    return { group: g };
  }

  function buildChannels() {   // 八道:8 根斜撑杆(自枢轴环向八方,示意八道机关)
    var g = group();
    for (var k = 0; k < 8; k++) {
      var v = dirVec(k);
      var arm = P.box(0.05, 0.035, D.vatR - 0.16, M3.bronze, v.x * (D.vatR - 0.16) / 2, D.pivotY + 0.10, v.z * (D.vatR - 0.16) / 2);
      arm.rotation.y = Math.atan2(v.x, v.z) + Math.PI / 2;
      g.add(arm);
    }
    g.add(P.torus(0.19, 0.02, M3.gold, 0, D.pivotY + 0.10, 0, 26));
    g.children[g.children.length - 1].rotation.x = P.ROTX;
    return g;
  }

  function buildDragon(k) {   // 龙首(含铜丸)+ 下颚
    var g = group();
    var v = dirVec(k), a = Math.atan2(v.x, v.z);
    var head = group();
    head.add(P.sph(0.11, M3.bronze, 0, 0, 0));
    var snout = P.box(0.10, 0.07, 0.16, M3.bronze, 0, -0.01, 0.11);
    head.add(snout);
    var jaw = P.box(0.09, 0.03, 0.14, M3.bronzeD || M3.stone, 0, -0.06, 0.11);
    head.add(jaw);
    var horn = P.mesh(new THREE.ConeGeometry(0.03, 0.14, 8), M3.gold, 0, 0.10, -0.02);
    horn.rotation.x = -0.5;
    head.add(horn);
    var eye = P.sph(0.02, M3.white, 0.05, 0.035, 0.06);
    head.add(eye);
    var eye2 = P.sph(0.02, M3.white, -0.05, 0.035, 0.06);
    head.add(eye2);
    var ball = P.sph(D.ballR, M3.brass, 0, -0.045, 0.13);
    head.add(ball);
    head.position.set(v.x * D.dragonR, D.dragonY, v.z * D.dragonR);
    head.rotation.y = a;
    head.userData.jaw = jaw;
    head.userData.ball = ball;
    g.add(head);
    g.userData.k = k;
    g.userData.head = head;
    return { group: g };
  }

  function buildToad(k) {   // 蟾蜍(仰首张口)
    var g = group();
    var v = dirVec(k), a = Math.atan2(v.x, v.z);
    var t = group();
    var body = P.sph(0.13, M3.bronze, 0, 0.10, 0);
    body.scale.set(1.25, 0.8, 1.35);
    t.add(body);
    var headS = P.sph(0.085, M3.bronze, 0, 0.20, 0.10);
    t.add(headS);
    var mouth = P.box(0.10, 0.035, 0.09, M3.dark, 0, 0.17, 0.17);
    t.add(mouth);
    [-0.09, 0.09].forEach(function (x) {
      t.add(P.sph(0.03, M3.gold, x, 0.26, 0.06));
    });
    t.add(P.box(0.16, 0.05, 0.10, M3.bronze, -0.12, 0.05, -0.08));
    t.add(P.box(0.16, 0.05, 0.10, M3.bronze, 0.12, 0.05, -0.08));
    t.position.set(v.x * D.toadR, D.toadY, v.z * D.toadR);
    t.rotation.y = a;
    g.add(t);
    g.userData.k = k;
    g.userData.toad = t;
    return { group: g };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "base", name: "BASE · 基座", sub: "山龟鸟兽纹基座", phase: 0, at: 0.15, dur: 1.1,
      build: buildBase, target: [0, 0, 0], start: [0, 4.4, 3.0], mid: [0, 2.4, 1.3], anchor: [0, 0.2, 0.7] });
    def({ id: "pendulum", name: "DU ZHU · 都柱(倒立摆)", sub: "摆长 1.05 · 触发角 6°", phase: 0, at: 1.3, dur: 1.2, kind: "kine",
      build: buildPendulum, target: [0, D.pivotY, 0], off: [0, 1.4, 5.5] });

    def({ id: "vat", name: "VAT · 铜樽(半剖)", sub: "剖视都柱与八道", phase: 1, at: 4.2, dur: 1.5,
      build: buildVat, target: [0, 0, 0], start: [0, 5.2, 0], mid: [0, 3.4, 0.5], anchor: [0, 2.2, 0.7] });

    def({ id: "channels", name: "CHANNELS · 八道", sub: "八向机关道", phase: 2, at: 9.2, dur: 1.2, kind: "kine",
      build: buildChannels, target: [0, D.pivotY, 0], off: [0, 1.2, 4.6] });
    for (var k = 0; k < 8; k++) {
      def({ id: "dragon" + k, name: "DRAGON · 龙首" + (k + 1) + "(" + D.dirs8[k].name + ")",
        sub: "口含铜丸 · 触发即落", phase: 3, at: 12.3 + k * 0.45, dur: 0.7, kind: "kine",
        build: (function (kk) { return function () { return buildDragon(kk); }; })(k),
        target: [0, 0, 0], off: [(k % 2 ? 1.4 : -1.4), 1.2, 3.4] });
      def({ id: "toad" + k, name: "TOAD · 蟾蜍" + (k + 1) + "(" + D.dirs8[k].name + ")",
        sub: "张口承丸", phase: 3, at: 12.55 + k * 0.45, dur: 0.7,
        build: (function (kk) { return function () { return buildToad(kk); }; })(k),
        target: [0, 0, 0], start: [(k % 2 ? 2.6 : -2.6), 1.8, 2.6], mid: [(k % 2 ? 1.4 : -1.4), 1.0, 1.4], anchor: [0, 0.25, 0.3] });
    }
  };

  /* —— 运动学分发 —— */
  MECH.KINE = function (st) {
    /* 都柱摆:绕垂直于倒向的水平轴转 θ */
    var e = MECH.Parts.entry("pendulum");
    if (e && e.shown) {
      var ax = new THREE.Vector3(st.tiltAZ, 0, -st.tiltAX).normalize();
      e.group.quaternion.setFromAxisAngle(ax, st.theta);
    }
    /* 龙首:触发方位下颚张开;铜丸沿局部抛物线飞向蟾蜍口 */
    for (var k = 0; k < 8; k++) {
      var dg = MECH.Parts.entry("dragon" + k);
      if (!dg || !dg.shown) continue;
      var head = dg.group.userData.head;
      var fl = null;
      for (var i = 0; i < st.flights.length; i++) if (st.flights[i].dir === k) fl = st.flights[i];
      var done = st.caught[k] > 0;
      head.userData.jaw.rotation.x = fl ? 0.55 : 0;
      var b = head.userData.ball;
      if (fl) {
        var t = Math.min(1, (st.time - fl.t0) / D.flightT);
        /* 龙首局部系:口(0,-0.045,0.13) → 蟾蜍口(0,-1.43,0.41),弧顶 0.25 */
        b.visible = true;
        b.position.set(0, -0.045 - 1.385 * t + 1.0 * t * (1 - t), 0.13 + 0.28 * t);
      } else if (done) {
        b.visible = false;
      } else {
        b.visible = true;
        b.position.set(0, -0.045, 0.13);
      }
      /* 蟾蜍接丸弹跳 */
      var td = MECH.Parts.entry("toad" + k);
      if (td && td.shown) {
        var tb = st.toadBounce[k];
        var s = 1;
        if (tb > 0) {
          var dtb = st.time - tb;
          if (dtb < 0.35) s = 1 + 0.28 * Math.sin(dtb / 0.35 * Math.PI);
        }
        td.group.userData.toad.scale.set(s, s, s);
      }
    }
  };
})(window.MECH = window.MECH || {});
