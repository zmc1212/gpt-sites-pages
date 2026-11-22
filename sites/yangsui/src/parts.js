/* 阳燧部件建模与注册(7 件)。
   布局:案几 + 镜架(kine rotation.x 仰角向日);阳燧凹面镜(球面内凹,镜缘朝西南);
   7 条平行光线(入射束)→ 反射汇聚线(细柱,tick 重新摆位,汇聚于焦点);
   艾绒球置焦点(燃料 glow→ignite);火盆;示日(平行光方向指示)。
   kine:stand 写 rotation.x(tilt);rays/焦点元素为位移驱动(userData)。
   标签锚点:build 返回 anchor。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;
  var MY = 0.72;                                   // 镜心高

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  /* 案几 + 镜架(仰角调架) */
  function buildTable() {
    var g = group();
    g.add(P.box(0.5, 0.05, 0.4, M3.woodD, 0, 0.5, 0));
    [[-0.20, -0.15], [0.20, -0.15], [-0.20, 0.15], [0.20, 0.15]].forEach(function (p) {
      g.add(P.box(0.05, 0.48, 0.05, M3.wood, p[0], 0.24, p[1]));
    });
    /* 调角叉架 */
    g.add(P.box(0.06, 0.30, 0.06, M3.woodD, 0.12, 0.60, 0));
    g.add(P.box(0.04, 0.22, 0.04, M3.woodD, -0.10, 0.64, 0));
    return { group: g, anchor: mkAnchor(0, 0.72, -0.15) };
  }

  /* 阳燧凹面镜(kine 挂在 stand 的镜组:tilt 由 userData 驱动) */
  function buildMirror() {
    var g = group();
    var holder = group();
    holder.position.set(0.02, MY, 0);
    var mirror = P.mesh(new THREE.SphereGeometry(D.Rmirror, 30, 18, 0, Math.PI * 2, 0, 0.42),
      new THREE.MeshStandardMaterial({ color: 0xB08D57, metalness: 0.85, roughness: 0.28, side: THREE.DoubleSide }),
      0, 0, 0);
    mirror.rotation.x = Math.PI / 2;
    holder.add(mirror);
    holder.add(P.cyl(0.05, 0.05, 0.05, M3.bronze, 0, 0, 0, 14));   // 背钮
    g.add(holder);
    g.userData.anim = { holder: holder };
    return { group: g, anchor: mkAnchor(0.02, MY + 0.15, 0) };
  }

  /* 光线束:7 入射平行线 + 反射汇聚线(tick 摆位) */
  function buildRays() {
    var g = group();
    var inRays = [], outRays = [];
    var mat = new THREE.MeshBasicMaterial({ color: 0xF2C14E, transparent: true, opacity: 0.55 });
    var mat2 = new THREE.MeshBasicMaterial({ color: 0xFFE9A8, transparent: true, opacity: 0.75 });
    for (var i = 0; i < 7; i++) {
      var off = (i - 3) / 3 * D.discR * 0.9;
      var rIn = P.cyl(0.004, 0.004, 1.0, mat, 0, 0, 0, 5);
      rIn.castShadow = false;
      var rOut = P.cyl(0.004, 0.004, 1.0, mat2, 0, 0, 0, 5);
      rOut.castShadow = false;
      g.add(rIn); g.add(rOut);
      inRays.push({ m: rIn, off: off });
      outRays.push({ m: rOut, off: off });
    }
    g.userData.anim = { inRays: inRays, outRays: outRays };
    return { group: g, anchor: mkAnchor(0, 1.4, 0) };
  }

  /* 艾绒球(tick glow)+ 托板 */
  function buildTinder() {
    var g = group();
    var fx = 0.02 - D.f * 0.72, fy = MY - D.f * 0.70;
    var board = P.box(0.10, 0.02, 0.10, M3.woodD, fx, fy - 0.045, 0);
    g.add(board);
    var ball = P.sph(0.016, new THREE.MeshStandardMaterial({ color: 0xC9B48A, roughness: 0.95, emissive: 0x000000 }),
      fx, fy, 0);
    g.add(ball);
    g.userData.anim = { ball: ball, fx: fx, fy: fy };
    return { group: g, anchor: mkAnchor(fx, fy + 0.10, 0) };
  }

  /* 火盆 + 柴 */
  function buildBrazier() {
    var g = group();
    g.add(P.cyl(0.16, 0.12, 0.10, M3.bronze, 0.42, 0.50, 0.30, 18));
    [[0.30, 0.26], [0.54, 0.26], [0.30, 0.34], [0.54, 0.34]].forEach(function (p) {
      g.add(P.cyl(0.012, 0.012, 0.42, M3.iron, p[0], 0.21, p[1], 6));
    });
    g.add(P.cyl(0.05, 0.07, 0.06, M3.woodD, 0.42, 0.58, 0.30, 10));
    return { group: g, anchor: mkAnchor(0.42, 0.68, 0.30) };
  }

  /* 示日(方向球 + 平行光带) */
  function buildSun() {
    var g = group();
    var sun = P.sph(0.12, new THREE.MeshBasicMaterial({ color: 0xF2C14E }), 0, 1.9, 0);
    g.add(sun);
    g.userData.anim = { sun: sun };
    return { group: g, anchor: mkAnchor(0, 2.1, 0) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "table", name: "STAND · 案几·调角架", sub: "「仰以向日」", phase: 0, at: 0.2, dur: 1.2,
      build: buildTable, target: [0, 0, 0], start: [0, 2.0, 0.8], mid: [0, 1.2, 0.4], anchor: [0, 0.8, -0.15] });
    def({ id: "mirror", name: "MIRROR · 阳燧凹面镜", sub: "黄堆型 R19.8cm · f=R/2=9.9cm", phase: 0, at: 1.0, dur: 1.3, kind: "kine",
      build: buildMirror, target: [0, 0, 0], off: [0.5, 1.4, 0.6] });

    def({ id: "rays", name: "RAYS · 光束聚焦", sub: "平行入射 → 汇聚焦点", phase: 1, at: 5.3, dur: 1.3,
      build: buildRays, target: [0, 0, 0], start: [-0.8, 2.4, 0.4], mid: [-0.4, 1.6, 0.2], anchor: [0, 1.5, 0] });
    def({ id: "sun", name: "SUN · 示日", sub: "日照 1361W/m²", phase: 1, at: 6.4, dur: 1.1,
      build: buildSun, target: [0, 0, 0], start: [-0.8, 2.6, -0.5], mid: [-0.4, 2.1, -0.25], anchor: [0, 2.1, 0] });

    def({ id: "tinder", name: "TINDER · 艾绒", sub: "焦点引燃 · 「著物则火发」", phase: 2, at: 10.3, dur: 1.3,
      build: buildTinder, target: [0, 0, 0], start: [-0.4, 1.6, 0.4], mid: [-0.2, 1.0, 0.2], anchor: [0, 0.85, 0] });
    def({ id: "brazier", name: "BRAZIER · 火盆", sub: "取火传火", phase: 2, at: 11.4, dur: 1.1,
      build: buildBrazier, target: [0, 0, 0], start: [0.9, 1.8, 0.7], mid: [0.6, 1.0, 0.4], anchor: [0, 0.75, 0.30] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    /* 镜组仰角:tilt 指向太阳(演示仰角 45°),aimErr 显示差 */
    var e = MECH.Parts.entry("mirror");
    if (e && e.shown && e.group.userData.anim) {
      e.group.userData.anim.holder.rotation.x = -(Math.PI / 2 - st.tilt) * 0.9;
    }
    /* 光线:入射平行束(方向由 tilt 定)+ 反射汇聚于焦点 */
    e = MECH.Parts.entry("rays");
    if (e && e.shown && e.group.userData.anim) {
      var a = e.group.userData.anim;
      var mx = 0.02, myy = MY;
      var sunDir = new THREE.Vector3(1, Math.tan(Math.PI / 4), 0).normalize();   // 45° 示意
      var focusX = mx - D.f * 0.72, focusY = MY - D.f * 0.70;
      a.inRays.forEach(function (r) {
        var hx = mx + r.off * 0.72, hy = myy + r.off * 0.70;
        var len = 0.85;
        r.m.position.set(hx + sunDir.x * len / 2, hy + sunDir.y * len / 2, 0);
        r.m.scale.y = len;
        r.m.rotation.z = Math.atan2(sunDir.y, sunDir.x) - Math.PI / 2;
      });
      a.outRays.forEach(function (r) {
        var hx = mx + r.off * 0.72, hy = myy + r.off * 0.70;
        var dx = focusX - hx, dy = focusY - hy;
        var len = Math.hypot(dx, dy);
        r.m.position.set(hx + dx / 2, hy + dy / 2, 0);
        r.m.scale.y = len;
        r.m.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;
      });
    }
    /* 艾绒发光 */
    e = MECH.Parts.entry("tinder");
    if (e && e.shown && e.group.userData.anim) {
      var b = e.group.userData.anim;
      var glow = st.fuel;
      b.ball.material.emissive = new THREE.Color(glow > 0.25 ? Math.min(1, glow) * 0.8 : 0, glow > 0.5 ? glow * 0.3 : 0, 0);
      b.ball.material.color = new THREE.Color().setHSL(0.08, 0.6, 0.45 + 0.3 * Math.min(1, glow));
    }
  };
})(window.MECH = window.MECH || {});
