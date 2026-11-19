/* 指南车部件建模与注册(14 件)。
   车体系:局部 +Z 为车首,轮平面 Y-Z(法线 X,轮心 x=±2.25),冠轮立轴 x=±2.06。
   左冠轮齿面朝上(冠L=+a·ψL),右冠轮齿面朝下(冠R=−a·ψR)——换向在齿面朝向完成。
   装配:kine 部件飞行落位由 parts-core 接管,落位后 kine 每帧写旋转。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;

  function group() { return new THREE.Group(); }

  /* 圆板直齿轮(Z 齿,半径 r):盘 + 齿 + 轮毂,建立在 XY 平面(法线 +Z) */
  function diskGear(Z, r, thick, mat, hubMat) {
    var g = group();
    var disk = P.mesh(new THREE.CylinderGeometry(r * 0.86, r * 0.86, thick, 36), mat, 0, 0, 0);
    disk.rotation.x = P.ROTX;
    g.add(disk);
    for (var i = 0; i < Z; i++) {
      var a = i / Z * Math.PI * 2;
      var t = P.box(0.034, r * 0.26, thick * 0.96, mat, Math.cos(a) * (r - 0.008), Math.sin(a) * (r - 0.008), 0);
      t.rotation.z = a;
      g.add(t);
    }
    var hub = P.cyl(0.055, 0.055, thick + 0.10, hubMat || M3.bronze, 0, 0, 0, 14);
    hub.rotation.x = P.ROTX;
    g.add(hub);
    return g;
  }

  /* 冠轮(水平面盘,Z 齿):盘 + 齿(teethUp 控制齿面朝上/下) */
  function crownGear(Z, r, thick, mat, teethUp) {
    var g = group();
    g.add(P.cyl(r * 0.84, r * 0.84, thick, mat, 0, 0, 0, 40));
    var ty = teethUp ? 0.016 : -0.016;
    for (var i = 0; i < Z; i++) {
      var a = i / Z * Math.PI * 2;
      var t = P.box(0.032, thick + 0.05, r * 0.16, mat, Math.cos(a) * (r - 0.010), ty, Math.sin(a) * (r - 0.010));
      t.rotation.y = -a;
      g.add(t);
    }
    return g;
  }

  /* 斜齿锥(示意太阳/行星轮):锥轴沿 X,tipDir = ±1 锥尖指向 */
  function bevelConeX(r, h, tipDir, mat) {
    var cone = P.mesh(new THREE.ConeGeometry(r, h, 16, 1, true), mat, 0, 0, 0);
    cone.rotation.z = tipDir > 0 ? -Math.PI / 2 : Math.PI / 2;   // +y 锥尖 → tipDir 方向
    return cone;
  }

  /* 足轮:木辐轮 + 铁箍(XY 平面建立) */
  function wheelWood() {
    var g = group(), R = D.rWheel;
    g.add(P.torus(R - 0.02, 0.036, M3.iron, 0, 0, 0, 44));
    g.add(P.torus(R - 0.10, 0.05, M3.woodD, 0, 0, 0, 44));
    for (var i = 0; i < 14; i++) {
      var a = i / 14 * Math.PI * 2;
      var len = R - 0.24;
      var s = P.box(0.05, len, 0.06, M3.wood, 0, 0, 0);
      s.position.set(Math.cos(a) * (0.10 + len / 2), Math.sin(a) * (0.10 + len / 2), 0);
      s.rotation.z = a - Math.PI / 2;
      g.add(s);
    }
    var hub = P.cyl(0.10, 0.10, 0.30, M3.woodD, 0, 0, 0, 16);
    hub.rotation.x = P.ROTX;
    g.add(hub);
    return g;
  }

  /* —— 部件构建器 —— */
  function buildAxle() {
    var g = group();
    var axle = P.cyl(0.07, 0.07, 2 * D.xC + 0.44, M3.steelD, 0, D.axleY, 0, 14);
    axle.rotation.z = P.ROTZ;
    g.add(axle);
    return g;
  }

  function buildFrame() {
    var g = group();
    for (var s = -1; s <= 1; s += 2) {
      g.add(P.box(0.14, 0.10, D.boxL + 0.7, M3.woodD, s * D.boxW / 2 * 0.62, D.axleY - 0.18, -0.15));
      /* 冠轮立轴轴承柱(车架伸出) */
      g.add(P.box(0.10, D.crownY - 0.62, 0.10, M3.woodD, s * D.xC, (D.crownY - 0.62) / 2 + 0.62, 0.30));
      g.add(P.box(0.10, D.crownY - 0.62, 0.10, M3.woodD, s * D.xC, (D.crownY - 0.62) / 2 + 0.62, -0.30));
    }
    [-1.15, -0.35, 0.45, 1.25].forEach(function (z) {
      g.add(P.box(D.boxW * 0.62, 0.075, 0.11, M3.wood, 0, D.axleY - 0.23, z));
    });
    g.add(P.box(D.boxW * 0.64, 0.06, D.boxL, M3.woodL, 0, D.floorY, -0.15));  // 车厢地板
    return g;
  }

  function buildWheel() {
    var g = group();
    var holder = group();
    holder.rotation.y = Math.PI / 2;
    holder.add(wheelWood());
    g.add(holder);
    return { group: g };
  }

  function buildLi() {
    var g = group();
    var holder = group();
    holder.rotation.y = Math.PI / 2;
    holder.add(diskGear(D.Z立, D.r立, 0.06, M3.woodD, M3.bronze));
    g.add(holder);
    return { group: g };
  }

  function buildGuan(side) {  // 冠轮(齿面 side>0 朝上) + 立轴 + 顶部太阳锥
    var g = group();
    g.add(crownGear(D.Z冠, D.r冠, 0.05, M3.woodD, side > 0));
    g.add(P.cyl(0.045, 0.045, D.sunY - D.crownY + 0.10, M3.steelD, 0, (D.sunY - D.crownY) / 2, 0, 12));
    var sun = bevelConeX(D.rSB, D.bh, side > 0 ? -1 : 1, M3.steel);
    sun.position.y = D.sunY - D.crownY;
    g.add(sun);
    return { group: g };
  }

  function buildDiff() {  // 差动器:输出轴 + 壳 + 行星销轴 + 双行星锥
    var g = group();
    g.add(P.cyl(0.05, 0.05, D.roofY - D.diffY + 0.5, M3.steel, 0, (D.roofY - D.diffY + 0.5) / 2, 0, 12));
    g.add(P.cyl(0.26, 0.26, 0.28, M3.bronze, 0, 0, 0, 22));
    var r1 = P.torus(0.26, 0.022, M3.brass, 0, 0.14, 0, 26);
    r1.rotation.x = P.ROTX;
    g.add(r1);
    var r2 = P.torus(0.26, 0.022, M3.brass, 0, -0.14, 0, 26);
    r2.rotation.x = P.ROTX;
    g.add(r2);
    var pin = P.cyl(0.045, 0.045, 2 * D.spiderX + 0.26, M3.steel, 0, 0, 0, 12);
    pin.rotation.z = P.ROTZ;
    g.add(pin);
    var spiders = [];
    [-1, 1].forEach(function (s) {
      var spin = group();
      spin.add(bevelConeX(D.rSB, D.bh, s, M3.steelD));   // 锥尖朝外,与太阳锥共享顶点
      spin.position.set(s * D.spiderX, 0, 0);
      g.add(spin);
      spiders.push(spin);
    });
    g.userData.anim = { spiders: spiders };
    return { group: g };
  }

  function buildBox() {  // 车厢:侧壁 + 前后壁 + 立柱 + 顶板 + 漆饰
    var g = group();
    var w = D.boxW, L = D.boxL, h = D.boxH, y0 = D.floorY;
    for (var s = -1; s <= 1; s += 2) {
      g.add(P.box(0.05, h, L, M3.wood, s * w / 2, y0 + h / 2, -0.15));
      g.add(P.box(0.02, h * 0.5, L * 0.82, M3.dark, s * (w / 2 - 0.006), y0 + h * 0.56, -0.15));  // 格窗暗面
    }
    [-L / 2 - 0.15, L / 2 - 0.15].forEach(function (z) {
      g.add(P.box(w, h, 0.05, M3.wood, 0, y0 + h / 2, z));
    });
    [[-w / 2, -L / 2 - 0.15], [w / 2, -L / 2 - 0.15], [-w / 2, L / 2 - 0.15], [w / 2, L / 2 - 0.15]].forEach(function (c) {
      g.add(P.box(0.09, h + 0.06, 0.09, M3.woodD, c[0], y0 + h / 2, c[1]));
    });
    g.add(P.box(w + 0.14, 0.06, L + 0.14, M3.woodD, 0, D.roofY, -0.15));
    g.add(P.box(w * 0.52, 0.03, L * 0.5, M3.lacquer, 0, D.roofY + 0.045, -0.15));
    return g;
  }

  function buildYuan() {  // 独辕 + 轭
    var g = group();
    var len = D.shaftZ;
    var pole = P.cyl(0.05, 0.072, len + 1.0, M3.woodD, 0, 0.80, D.boxL / 2 + (len + 1.0) / 2 - 0.75, 12);
    pole.rotation.x = Math.PI / 2 - 0.05;
    g.add(pole);
    var yoke = P.cyl(0.032, 0.032, 0.85, M3.wood, 0, 0.87, D.boxL / 2 + len - 0.1, 10);
    yoke.rotation.z = P.ROTZ;
    g.add(yoke);
    return g;
  }

  function buildWoodman() {  // 木仙人:底座 + 袍 + 首 + 冠 + 执杖指南(杖指车首 +Z)
    var g = group();
    g.add(P.cyl(0.19, 0.23, 0.09, M3.brass, 0, 0.045, 0, 20));
    g.add(P.cyl(0.125, 0.165, 0.40, M3.lacquer, 0, 0.29, 0, 16));
    g.add(P.sph(0.10, M3.white, 0, 0.56, 0));
    g.add(P.mesh(new THREE.ConeGeometry(0.11, 0.12, 14), M3.lacquerD, 0, 0.67, 0));
    var arm = P.box(0.042, 0.042, 0.30, M3.lacquer, 0.10, 0.46, 0.13);
    arm.rotation.x = -0.18;
    g.add(arm);
    var staff = P.cyl(0.018, 0.018, 0.92, M3.brass, 0.14, 0.50, 0.32, 10);
    staff.rotation.x = Math.PI / 2;            // 杖身沿 +Z(指南)
    g.add(staff);
    g.add(P.box(0.018, 0.15, 0.10, M3.gold, 0.14, 0.60, 0.74));   // 指向翼(前高后低)
    g.add(P.sph(0.034, M3.gold, 0.14, 0.66, 0.80));
    g.add(P.box(0.016, 0.10, 0.07, M3.gold, 0.14, 0.42, -0.10));  // 杖尾坠
    return { group: g };
  }

  function buildCompass() {  // 地面罗盘(world 固定,不随车转)
    var g = group();
    var rose = P.mesh(new THREE.CircleGeometry(1.7, 48),
      new THREE.MeshBasicMaterial({ map: compassTex(), transparent: true, opacity: 0.92 }), 0, 0.012, 0);
    rose.rotation.x = -Math.PI / 2;
    g.add(rose);
    return g;
  }

  var _roseTex = null;
  function compassTex() {
    if (_roseTex) return _roseTex;
    var c = document.createElement("canvas");
    c.width = c.height = 256;
    var x = c.getContext("2d");
    x.translate(128, 128);
    x.strokeStyle = "rgba(233,238,242,0.60)";
    x.lineWidth = 2;
    x.beginPath(); x.arc(0, 0, 118, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.arc(0, 0, 88, 0, Math.PI * 2); x.stroke();
    for (var i = 0; i < 24; i++) {
      var a = i / 24 * Math.PI * 2;
      x.beginPath();
      x.moveTo(Math.cos(a) * 88, Math.sin(a) * 88);
      x.lineTo(Math.cos(a) * 118, Math.sin(a) * 118);
      x.stroke();
    }
    x.fillStyle = "#E9C93C";
    x.beginPath(); x.moveTo(0, 112); x.lineTo(9, 84); x.lineTo(-9, 84); x.closePath(); x.fill();
    x.fillStyle = "rgba(233,238,242,0.85)";
    x.beginPath(); x.moveTo(0, -112); x.lineTo(9, -84); x.lineTo(-9, -84); x.closePath(); x.fill();
    x.fillStyle = "rgba(233,238,242,0.9)";
    x.font = "700 30px serif";
    x.textAlign = "center";
    x.fillText("南", 0, 68);
    x.fillText("北", 0, -54);
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    _roseTex = t;
    return t;
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    /* 阶段 1:底盘 */
    def({ id: "compass", name: "COMPASS ROSE · 地盘", sub: "南 = +Z · 固定基准", phase: 0, kind: "none", world: true,
      build: buildCompass, target: [0, 0, 3.6] });
    def({ id: "axle", name: "AXLE · 车轴", sub: "轨距 15 尺(复原推算)", phase: 0, at: 0.15, dur: 1.0,
      build: buildAxle, target: [0, 0, 0], start: [0, 4.6, 3.4], mid: [0, 2.6, 1.6], anchor: [0, 0.1, 0.4] });
    def({ id: "frame", name: "FRAME · 车架", sub: "双梁四横 · 轴承柱 · 地板", phase: 0, at: 0.6, dur: 1.2,
      build: buildFrame, target: [0, 0, 0], start: [0, 5.0, -3.2], mid: [0, 3.0, -1.4], anchor: [0, 0.72, 0.5] });
    def({ id: "wheelL", name: "ROAD WHEEL · 足轮 L", sub: "径六尺 · 14 辐 · 铁箍", phase: 0, at: 1.5, dur: 1.1, kind: "kine",
      build: buildWheel, target: [D.W / 2, D.axleY, 0], off: [0, 0, 7.5] });
    def({ id: "wheelR", name: "ROAD WHEEL · 足轮 R", sub: "与左轮同径同轴", phase: 0, at: 2.0, dur: 1.1, kind: "kine",
      build: buildWheel, target: [-D.W / 2, D.axleY, 0], off: [0, 0, 7.5] });

    /* 阶段 2:传动系 */
    def({ id: "liL", name: "VERTICAL GEAR · 立轮 16T", sub: "与足轮同轴 · Z16", phase: 1, at: 5.15, dur: 1.0, kind: "kine",
      build: buildLi, target: [D.xC, D.axleY, 0], off: [0.9, 2.4, 0.6] });
    def({ id: "liR", name: "VERTICAL GEAR · 立轮 16T", sub: "与足轮同轴 · Z16", phase: 1, at: 5.6, dur: 1.0, kind: "kine",
      build: buildLi, target: [-D.xC, D.axleY, 0], off: [-0.9, 2.4, 0.6] });
    def({ id: "guanL", name: "CROWN GEAR · 冠轮 40T", sub: "齿面朝上 · 冠L = +a·ψL", phase: 1, at: 6.3, dur: 1.1, kind: "kine",
      build: function () { return buildGuan(1); }, target: [D.xC, D.crownY, 0], off: [0.7, 2.8, 0.8] });
    def({ id: "guanR", name: "CROWN GEAR · 冠轮 40T", sub: "齿面朝下 · 冠R = −a·ψR", phase: 1, at: 6.8, dur: 1.1, kind: "kine",
      build: function () { return buildGuan(-1); }, target: [-D.xC, D.crownY, 0], off: [-0.7, 2.8, 0.8] });
    def({ id: "diff", name: "DIFFERENTIAL · 差动器", sub: "(sunL+sunR)/2 → 木人轴", phase: 1, at: 7.6, dur: 1.2, kind: "kine",
      build: buildDiff, target: [0, D.sunY, 0], off: [0, 3.0, 1.2] });

    /* 阶段 3:车厢与独辕 */
    def({ id: "box", name: "CABIN · 车厢", sub: "四壁格窗 · 漆顶", phase: 2, at: 11.2, dur: 1.4,
      build: buildBox, target: [0, 0, 0], start: [0, 6.4, 0], mid: [0, 4.4, 0.6], anchor: [0, 1.8, 0.78] });
    def({ id: "yuan", name: "SHAFT + YOKE · 独辕", sub: "独辕双轮(宋制)", phase: 2, at: 12.3, dur: 1.1,
      build: buildYuan, target: [0, 0, 0], start: [0, 3.4, 6.6], mid: [0, 2.2, 3.8], anchor: [0, 0.9, 2.6] });

    /* 阶段 4:木仙人 */
    def({ id: "woodman", name: "WOODEN SAGE · 木仙人", sub: "执杖指南 · 立于差动壳轴", phase: 3, at: 16.2, dur: 1.3,
      build: buildWoodman, target: [0, D.manY, -0.15], start: [0, 6.6, -0.15], mid: [0, 4.8, -0.15], anchor: [0, 0.7, 0] });
  };

  /* —— 运动学分发(每帧,含装配飞行期) —— */
  MECH.KINE = function (st) {
    var root = MECH.Scene3D.root;
    root.position.set(st.x, 0, st.z);
    root.rotation.y = st.psi;

    function spin(id, rx, ry) {
      var e = MECH.Parts.entry(id);
      if (!e || !e.shown) return;
      if (rx !== undefined) e.group.rotation.x = rx;
      if (ry !== undefined) e.group.rotation.y = ry;
    }
    spin("wheelL", st.psiL);
    spin("wheelR", st.psiR);
    spin("liL", st.psiL);
    spin("liR", st.psiR);
    spin("guanL", undefined, st.crownL);
    spin("guanR", undefined, st.crownR);
    var d = MECH.Parts.entry("diff");
    if (d && d.shown) {
      d.group.rotation.y = st.gearPtr;
      if (d.group.userData.anim) {
        d.group.userData.anim.spiders.forEach(function (s, i) {
          s.rotation.x = st.spiderSpin * (i === 0 ? 1 : -1);
        });
      }
    }
    spin("woodman", undefined, st.ptrRel);
  };
})(window.MECH = window.MECH || {});
