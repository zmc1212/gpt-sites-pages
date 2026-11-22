/* 记里鼓车部件建模与注册(20 件)。
   车体局部:车首 +z,轮平面 Y-Z(法线 X),轨距沿 X;根节点偏航 π/2 →
   世界系沿 +x 直行,地面与里程碑后移。齿轮系装在半剖车厢内:
   立轮 Z100(随足轮,法线 X)→ 下平轮 Z10(冠轮)→ 旋风轮 Z10(同竖轴)
   → 中平轮 Z100(法线 X,÷100)→ 凸轮轴。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;

  function group() { return new THREE.Group(); }

  function wheelWood() {
    var g = group(), R = D.rWheel;
    g.add(P.torus(R - 0.02, 0.04, M3.iron, 0, 0, 0, 40));
    g.add(P.torus(R - 0.10, 0.05, M3.woodD, 0, 0, 0, 40));
    for (var i = 0; i < 12; i++) {
      var a = i / 12 * Math.PI * 2;
      var s = P.box(0.05, R - 0.24, 0.06, M3.wood, 0, 0, 0);
      s.position.set(Math.cos(a) * (0.10 + (R - 0.24) / 2), Math.sin(a) * (0.10 + (R - 0.24) / 2), 0);
      s.rotation.z = a - Math.PI / 2;
      g.add(s);
    }
    var hub = P.cyl(0.09, 0.09, 0.26, M3.woodD, 0, 0, 0, 14);
    hub.rotation.x = P.ROTX;
    g.add(hub);
    return g;
  }

  function buildAxle() {
    var g = group();
    var axle = P.cyl(0.06, 0.06, D.W + 0.5, M3.steelD, 0, D.axleY, 0, 12);
    axle.rotation.z = P.ROTZ;
    g.add(axle);
    return g;
  }

  function buildFrame() {
    var g = group();
    for (var s = -1; s <= 1; s += 2) {
      g.add(P.box(0.12, 0.09, D.boxL + 0.4, M3.woodD, s * D.boxW / 2 * 0.7, D.axleY - 0.18, -0.2));
    }
    [-1.0, -0.3, 0.4, 1.1].forEach(function (z) {
      g.add(P.box(D.boxW * 0.7, 0.07, 0.1, M3.wood, 0, D.axleY - 0.24, z));
    });
    g.add(P.box(D.boxW * 0.72, 0.05, D.boxL, M3.woodL, 0, D.axleY + 0.10, -0.2));
    return g;
  }

  function buildWheel() {
    var g = group();
    var holder = group();
    holder.rotation.y = Math.PI / 2;       // 轮平面 Y-Z(法线 X)
    holder.add(wheelWood());
    g.add(holder);
    return { group: g };
  }

  /* 半剖双层车厢(开口朝 +z 前方) */
  function buildCabin() {
    var g = group();
    var y0 = D.axleY + 0.10;
    for (var s = -1; s <= 1; s += 2) {
      g.add(P.box(0.05, D.boxH1, D.boxL, M3.wood, s * D.boxW / 2, y0 + D.boxH1 / 2, -0.2));
    }
    [-D.boxL / 2 - 0.2, D.boxL / 2 - 0.2].forEach(function (z) {
      g.add(P.box(D.boxW, D.boxH1, 0.05, M3.wood, 0, y0 + D.boxH1 / 2, z));
    });
    g.add(P.box(0.05, D.boxH2, D.boxL * 0.6, M3.wood, -D.boxW / 2, y0 + D.boxH1 + D.boxH2 / 2, -0.5));
    g.add(P.box(D.boxW, D.boxH2, 0.05, M3.wood, 0, y0 + D.boxH1 + D.boxH2 / 2, -0.78));
    g.add(P.box(D.boxW + 0.12, 0.05, D.boxL + 0.12, M3.woodD, 0, y0 + D.boxH1 + D.boxH2, -0.45));
    [[-D.boxW / 2, -D.boxL / 2 - 0.2], [D.boxW / 2, -D.boxL / 2 - 0.2], [-D.boxW / 2, D.boxL / 2 - 0.2], [D.boxW / 2, D.boxL / 2 - 0.2]].forEach(function (c) {
      g.add(P.box(0.08, D.boxH1 + D.boxH2, 0.08, M3.woodD, c[0], y0 + (D.boxH1 + D.boxH2) / 2, c[1]));
    });
    return g;
  }

  function diskGear(Z, r, thick, mat, vertical) {
    var g = group();
    var disk = P.mesh(new THREE.CylinderGeometry(r, r, thick, Math.min(44, Z)), mat, 0, 0, 0);
    if (vertical) disk.rotation.x = P.ROTX;
    g.add(disk);
    var nT = Math.min(Z, 32);
    for (var i = 0; i < nT; i++) {
      var a = i / nT * Math.PI * 2;
      var t;
      if (vertical) {
        t = P.box(0.026, r * 0.2, thick * 0.96, mat, Math.cos(a) * (r - 0.006), Math.sin(a) * (r - 0.006), 0);
        t.rotation.z = a;
      } else {
        t = P.box(0.026, thick + 0.04, r * 0.18, mat, Math.cos(a) * (r - 0.006), -0.012, Math.sin(a) * (r - 0.006));
        t.rotation.y = -a;
      }
      g.add(t);
    }
    var hub = P.cyl(0.04, 0.04, thick + 0.08, M3.bronze, 0, 0, 0, 12);
    if (vertical) hub.rotation.x = P.ROTX;
    g.add(hub);
    return g;
  }

  function buildGearTrain() {
    var g = group();
    var liX = -D.W / 2 + 0.12;
    /* 立轮 Z100:竖盘,随左足轮 */
    var li = diskGear(D.Z立, D.r立, 0.05, M3.woodD, true);
    li.position.set(liX, D.axleY, -0.55);
    g.add(li);
    /* 竖轴 + 冠轮 Z10(下平轮)+ 旋风轮 Z10(同轴) */
    var vx = liX + D.r立 + D.r下;
    var shaft = P.cyl(0.032, 0.032, 1.05, M3.steelD, vx, D.axleY - 0.20, -0.55, 10);
    g.add(shaft);
    var xia = diskGear(D.Z下, D.r下, 0.05, M3.bronze, false);
    xia.position.set(vx, D.axleY - 0.52, -0.55);
    g.add(xia);
    var xuan = diskGear(D.Z旋, D.r旋, 0.05, M3.bronze, false);
    xuan.position.set(vx, D.axleY + 0.34, -0.55);
    g.add(xuan);
    /* 中平轮 Z100:竖盘,法线 X,装横轴(沿 X) */
    var mx = vx + D.r旋 + D.r中;
    var zhong = diskGear(D.Z中, D.r中, 0.05, M3.woodD, true);
    zhong.position.set(mx, D.axleY + 0.34, -0.55);
    g.add(zhong);
    var axle = P.cyl(0.028, 0.028, D.W * 0.62, M3.steelD, mx, D.axleY + 0.34, -0.55, 10);
    axle.rotation.z = P.ROTZ;
    g.add(axle);
    var cams = [];
    [0.30, -0.30].forEach(function (x) {
      var cam = group();
      cam.add(P.box(0.05, 0.11, 0.05, M3.iron, 0, 0.045, 0));
      cam.position.set(mx + x, D.axleY + 0.34, -0.55);
      g.add(cam);
      cams.push(cam);
    });
    g.userData = { li: li, xia: xia, xuan: xuan, zhong: zhong, cams: cams };
    return { group: g };
  }

  function buildDrumStatue(side) {  // 击鼓木人(下层,左右)
    var g = group();
    var body = P.cyl(0.08, 0.095, 0.30, M3.lacquer, 0, 0.15, 0, 12);
    g.add(body);
    g.add(P.sph(0.068, M3.white, 0, 0.35, 0));
    g.add(P.mesh(new THREE.ConeGeometry(0.072, 0.10, 10), M3.lacquerD, 0, 0.44, 0));
    var armPivot = group();
    armPivot.add(P.box(0.30, 0.045, 0.045, M3.lacquer, 0.15, 0, 0));
    armPivot.add(P.sph(0.034, M3.stone, 0.30, 0, 0));
    armPivot.position.set(0, 0.27, -0.10);
    g.add(armPivot);
    var drum = P.cyl(0.105, 0.105, 0.16, M3.lacquerD, 0, 0.12, -0.32, 16);
    drum.rotation.x = 0.2;
    g.add(drum);
    g.userData.arm = armPivot;
    return { group: g };
  }

  function buildGongStatue() {  // 击镯木人(上层)
    var g = group();
    g.add(P.cyl(0.07, 0.08, 0.24, M3.lacquer, 0, 0.12, 0, 12));
    g.add(P.sph(0.058, M3.white, 0, 0.28, 0));
    g.add(P.mesh(new THREE.ConeGeometry(0.062, 0.09, 10), M3.lacquerD, 0, 0.36, 0));
    var armPivot = group();
    armPivot.add(P.box(0.26, 0.04, 0.04, M3.lacquer, 0.13, 0, 0));
    armPivot.add(P.sph(0.03, M3.stone, 0.26, 0, 0));
    armPivot.position.set(0, 0.23, -0.09);
    g.add(armPivot);
    var gong = P.torus(0.085, 0.022, M3.gold, 0, 0.10, -0.28, 18);
    gong.rotation.x = 0.3;
    g.add(gong);
    g.userData.arm = armPivot;
    return { group: g };
  }

  function buildMilePosts() {  // 路边里程碑 ×4(world 固定,后移循环)
    var g = group();
    g.userData.posts = [];
    for (var i = 0; i < 4; i++) {
      var post = group();
      post.add(P.box(0.10, 0.85, 0.10, M3.stone, 0, 0.425, 0));
      post.add(P.box(0.28, 0.16, 0.05, M3.stone, 0, 0.80, 0.04));
      post.position.set(i * 11.3 - 17, 0, 1.75);
      g.add(post);
      g.userData.posts.push(post);
    }
    return g;
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "posts", name: "MILE POSTS · 里程碑", sub: "每演示里一块 · 后移循环", phase: 0, kind: "none", world: true,
      build: buildMilePosts, target: [0, 0, 0] });
    def({ id: "axle", name: "AXLE · 车轴", sub: "足轮轴(径六尺)", phase: 0, at: 0.15, dur: 1.0,
      build: buildAxle, target: [0, 0, 0], start: [0, 4.2, 3.0], mid: [0, 2.4, 1.4], anchor: [0, 0.1, 0.5] });
    def({ id: "frame", name: "FRAME · 车架", sub: "双梁四横", phase: 0, at: 0.6, dur: 1.1,
      build: buildFrame, target: [0, 0, 0], start: [0, 4.8, -3.0], mid: [0, 2.8, -1.4], anchor: [0, 0.72, 0.5] });
    def({ id: "wheelL", name: "ROAD WHEEL · 足轮 L", sub: "径六尺 · 真实一里 100 转", phase: 0, at: 1.5, dur: 1.1, kind: "kine",
      build: buildWheel, target: [D.W / 2, D.axleY, 0], off: [0, 0, 7.5] });
    def({ id: "wheelR", name: "ROAD WHEEL · 足轮 R", sub: "与左轮同径同转", phase: 0, at: 2.0, dur: 1.1, kind: "kine",
      build: buildWheel, target: [-D.W / 2, D.axleY, 0], off: [0, 0, 7.5] });

    def({ id: "train", name: "GEAR TRAIN · 齿轮系 100:1", sub: "立100→下10→旋10→中100", phase: 1, at: 4.3, dur: 1.6, kind: "kine",
      build: buildGearTrain, target: [0, 0, 0], off: [0, 1.6, 2.6] });

    def({ id: "cabin", name: "CABIN · 双层车厢(半剖)", sub: "下层击鼓 · 上层击镯", phase: 2, at: 10.2, dur: 1.5,
      build: buildCabin, target: [0, 0, 0], start: [0, 6.0, 0], mid: [0, 4.0, 0.6], anchor: [0, 1.9, 0.7] });
    def({ id: "statueL", name: "STATUE · 击鼓木人 L", sub: "左里击左鼓", phase: 2, at: 11.5, dur: 0.9, kind: "kine",
      build: buildDrumStatue, target: [0.40, D.axleY + D.boxH1 + 0.02, 0.42], off: [0.5, 1.6, 1.0] });
    def({ id: "statueR", name: "STATUE · 击鼓木人 R", sub: "右里击右鼓", phase: 2, at: 12.2, dur: 0.9, kind: "kine",
      build: buildDrumStatue, target: [-0.40, D.axleY + D.boxH1 + 0.02, 0.42], off: [-0.5, 1.6, 1.0] });
    def({ id: "statueG", name: "STATUE · 击镯木人", sub: "十里击镯(上层,演示每 4 里)", phase: 2, at: 12.9, dur: 0.9, kind: "kine",
      build: buildGongStatue, target: [0, D.axleY + D.boxH1 + D.boxH2 + 0.02, -0.42], off: [0, 1.8, 1.2] });

    def({ id: "yuan", name: "SHAFT · 独辕", sub: "独辕双轮(宋制)", phase: 3, at: 15.3, dur: 1.0,
      build: function () {
        var g = group();
        var pole = P.cyl(0.05, 0.07, 2.4, M3.woodD, 0, 0.72, D.boxL / 2 + 0.95, 10);
        pole.rotation.x = Math.PI / 2 - 0.05;
        g.add(pole);
        var yoke = P.cyl(0.03, 0.03, 0.8, M3.wood, 0, 0.78, D.boxL / 2 + 1.95, 8);
        yoke.rotation.z = P.ROTZ;
        g.add(yoke);
        return g;
      }, target: [0, 0, 0], start: [0, 3.0, 6.0], mid: [0, 2.0, 3.4], anchor: [0, 0.8, 2.4] });
  };

  /* —— 运动学分发 —— */
  MECH.KINE = function (st) {
    var root = MECH.Scene3D.root;
    root.position.set(0, 0, 0);
    root.rotation.y = Math.PI / 2;              // 局部 +z(车首) → 世界 +x
    /* 地面与里程碑后移 */
    MECH.Scene3D.scrollGround(st.dist, 0);
    var posts = MECH.Parts.entry("posts");
    if (posts && posts.shown) {
      var span = 11.3 * 4;
      posts.group.userData.posts.forEach(function (p, i) {
        p.position.x = (((i * 11.3 - st.dist) % span) + span) % span - 17;
      });
    }
    /* 车轮滚动(法线 X) */
    var e = MECH.Parts.entry("wheelL");
    if (e && e.shown) e.group.rotation.x = st.psi;
    e = MECH.Parts.entry("wheelR");
    if (e && e.shown) e.group.rotation.x = st.psi;
    /* 齿轮链:立轮随轮;下平/旋风 ×10;中平 ÷100;凸轮随中平轴 */
    e = MECH.Parts.entry("train");
    if (e && e.shown) {
      var ud = e.group.userData;
      ud.li.rotation.x = st.psi;
      ud.xia.rotation.y = -st.psi * (D.Z立 / D.Z下);
      ud.xuan.rotation.y = -st.psi * (D.Z立 / D.Z下);
      ud.zhong.rotation.x = st.psi / D.ratioReal;
      ud.cams[0].rotation.x = st.psi / D.ratioReal * Math.PI * 2;
      ud.cams[1].rotation.x = st.psi / D.ratioReal * Math.PI * 2 + Math.PI;
    }
    /* 击鼓木人臂(左右交替)/ 击镯 */
    var sl = MECH.Parts.entry("statueL");
    if (sl && sl.shown) sl.group.userData.arm.rotation.x = st.armSwing[0] * 0.85 - 0.12;
    var sr = MECH.Parts.entry("statueR");
    if (sr && sr.shown) sr.group.userData.arm.rotation.x = st.armSwing[1] * 0.85 - 0.12;
    var sg = MECH.Parts.entry("statueG");
    if (sg && sg.shown) sg.group.userData.arm.rotation.x = st.gongArm * 0.85 - 0.12;
  };
})(window.MECH = window.MECH || {});
