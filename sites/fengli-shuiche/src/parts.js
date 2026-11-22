/* 风力水车部件建模与注册(13 件 + 26 链节)。
   布局:八帆立轴风车居原点(帆轮 R1.30,帆带 y1.75-3.95,偏装 45°);
   轴底卧轮 Z24(水平盘齿,y1.30)外啮合翻车上轴立轮 Z16(竖直盘,z1.00,
   啮合距 = 0.60+0.40 = 1.00);翻车沿 z-y 平面自下池(0,0.42,4.20)斜升
   15.4° 至上链轮(0,1.30,1.00),26 节刮板闭合链,出水笧槽沿 -x 引入西田。
   kine 部件:shaftCrown/sails 只写 rotation.y;上/下轴 spinner 写 rotation.y
   (holder 预倾斜使局部 Y=轴向);链节按 loopPose 写 position+quaternion
   (参照 longgu-shuiche 闭合链先例)。标签锚点:build 返回 anchor。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;
  var _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(0, 0, 1);
  var _m = new THREE.Matrix4(), _q = new THREE.Quaternion();

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  /* 链节位姿四元数:X=世界 x(板宽),Y=切向 T,Z=X×Y(面法向) */
  function basisQuat(ty, tz) {
    _x.set(1, 0, 0);
    _y.set(0, ty, tz);
    _z.crossVectors(_x, _y);
    _m.makeBasis(_x, _y, _z);
    return _q.setFromRotationMatrix(_m);
  }

  /* 水平盘齿齿轮(Z 齿,轴沿 +y):盘+齿+毂(参照 shuinnian diskGearH) */
  function diskGearH(Z, r, thick, mat, hubMat) {
    var g = group();
    g.add(P.cyl(r * 0.86, r * 0.86, thick, mat, 0, 0, 0, 40));
    for (var i = 0; i < Z; i++) {
      var a = i / Z * Math.PI * 2;
      var t = P.box(r * 0.16, thick * 0.9, 0.034, mat, Math.cos(a) * (r - 0.008), 0, Math.sin(a) * (r - 0.008));
      t.rotation.y = -a;
      g.add(t);
    }
    g.add(P.cyl(0.05, 0.05, thick + 0.10, hubMat || M3.bronze, 0, 0, 0, 14));
    return g;
  }

  /* —— 部件构建器 —— */

  function buildPond() {
    var g = group(), p = D.pond;
    var w = p.x1 - p.x0, d = p.z1 - p.z0, cx = (p.x0 + p.x1) / 2, cz = (p.z0 + p.z1) / 2;
    g.add(P.box(w + 0.24, p.wallH, 0.14, M3.stone, cx, p.wallH / 2, p.z0 - 0.05));
    g.add(P.box(w + 0.24, p.wallH, 0.14, M3.stone, cx, p.wallH / 2, p.z1 + 0.05));
    g.add(P.box(0.14, p.wallH, d, M3.stone, p.x0 - 0.05, p.wallH / 2, cz));
    g.add(P.box(0.14, p.wallH, d, M3.stone, p.x1 + 0.05, p.wallH / 2, cz));
    g.add(P.box(w, 0.06, d, M3.stone, cx, 0.10, cz));
    var water = P.box(w - 0.06, 0.10, d - 0.06, M3.water, cx, p.water - 0.05, cz);
    water.castShadow = false;
    g.add(water);
    return { group: g, anchor: mkAnchor(p.x1 + 0.4, p.wallH + 0.2, cz) };
  }

  function buildBase() {
    var g = group();
    g.add(P.cyl(0.85, 0.95, 0.30, M3.stone, 0, 0.15, 0, 36));
    g.add(P.cyl(0.24, 0.30, 0.22, M3.stone, 0, 0.36, 0, 20));
    g.add(P.cyl(0.14, 0.14, 0.10, M3.bronze, 0, 0.47, 0, 16));
    return { group: g, anchor: mkAnchor(0.9, 0.5, 0) };
  }

  /* 帆架:八桅 + 上下八角环 + 顶帽 */
  function buildMasts() {
    var g = group();
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * Math.PI * 2;
      g.add(P.box(0.11, D.mastHi - D.mastLo, 0.11, M3.woodD,
        Math.sin(a) * D.mastR, (D.mastLo + D.mastHi) / 2, Math.cos(a) * D.mastR));
    }
    var r1 = P.torus(D.mastR, 0.045, M3.woodD, 0, D.sailLo, 0, 8);
    r1.rotation.x = P.ROTX;
    g.add(r1);
    var r2 = P.torus(D.mastR, 0.045, M3.woodD, 0, D.sailHi, 0, 8);
    r2.rotation.x = P.ROTX;
    g.add(r2);
    g.add(P.cyl(0.16, 0.05, 0.34, M3.woodD, 0, D.shaftHi + 0.10, 0, 14));
    return { group: g, anchor: mkAnchor(D.mastR, D.sailHi + 0.15, 0) };
  }

  /* 主立轴 + 卧轮 Z24(kine:rotY θ轮;原点=轴) */
  function buildShaftCrown() {
    var g = group();
    g.add(P.cyl(0.09, 0.09, D.shaftHi - D.shaftLo, M3.woodD, 0, (D.shaftHi + D.shaftLo) / 2, 0, 14));
    var crown = diskGearH(D.Z1, D.r1, 0.06, M3.woodD);
    crown.position.y = D.crownY;
    g.add(crown);
    return { group: g, anchor: mkAnchor(-D.r1 - 0.05, D.crownY + 0.12, 0) };
  }

  /* 八帆(kine:rotY θ轮):竹架 + 布面,偏装 45°(复原取值) */
  function buildSails() {
    var g = group();
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * Math.PI * 2;
      var holder = group();
      holder.rotation.y = a;
      var sail = group();
      sail.position.set(D.mastR, (D.sailLo + D.sailHi) / 2, 0);
      sail.rotation.y = Math.PI / 4;                 // 偏装 45°
      var cloth = P.box(0.03, D.sailHi - D.sailLo - 0.16, 1.02, M3.paper, 0.10, 0, 0);
      cloth.castShadow = false;
      sail.add(cloth);
      sail.add(P.box(0.05, D.sailHi - D.sailLo, 0.05, M3.wood, 0.10, 0, -0.50));
      sail.add(P.box(0.05, D.sailHi - D.sailLo, 0.05, M3.wood, 0.10, 0, 0.50));
      sail.add(P.box(0.05, 0.05, 1.05, M3.wood, 0.10, (D.sailHi - D.sailLo) / 2 - 0.05, 0));
      sail.add(P.box(0.05, 0.05, 1.05, M3.wood, 0.10, -(D.sailHi - D.sailLo) / 2 + 0.05, 0));
      sail.add(P.box(0.04, 0.04, 1.02, M3.wood, 0.10, 0, 0));
      holder.add(sail);
      g.add(holder);
    }
    return { group: g, anchor: mkAnchor(D.Rwheel, (D.sailLo + D.sailHi) / 2, 0) };
  }

  /* 翻车架:双侧斜梁 + 横撑 + 四腿 + 下端浸水箱(静态) */
  function buildPumpframe() {
    var g = group();
    var len = D.Laxis + 0.5;
    var midY = (D.Pa.y + D.Pb.y) / 2, midZ = (D.Pa.z + D.Pb.z) / 2;
    var tiltX = Math.atan2(D.Pb.y - D.Pa.y, D.Pb.z - D.Pa.z);   // 绕 x 倾角
    [-0.22, 0.22].forEach(function (x) {
      var beam = P.box(0.09, len, 0.14, M3.woodD, x, midY + 0.05, midZ);
      beam.rotation.x = tiltX;
      g.add(beam);
    });
    for (var i = 0; i < 5; i++) {
      var f = (i + 0.5) / 5;
      var yy = D.Pa.y + (D.Pb.y - D.Pa.y) * f + 0.05;
      var zz = D.Pa.z + (D.Pb.z - D.Pa.z) * f;
      g.add(P.box(0.52, 0.07, 0.10, M3.wood, 0, yy, zz));
    }
    [[-0.22, 0.06], [0.22, 0.06], [-0.22, 0.94], [0.22, 0.94]].forEach(function (q) {
      var f = q[1];
      var yy = D.Pa.y + (D.Pb.y - D.Pa.y) * f;
      var zz = D.Pa.z + (D.Pb.z - D.Pa.z) * f;
      g.add(P.box(0.09, yy - 0.08, 0.09, M3.wood, q[0], (yy - 0.08) / 2, zz));
    });
    /* 下端浸水箱(链下行通道入水) */
    g.add(P.box(0.56, 0.34, 0.62, M3.woodD, 0, D.Pa.y - 0.10, D.Pa.z));
    return { group: g, anchor: mkAnchor(0.4, D.Pb.y + 0.15, D.Pb.z) };
  }

  /* 上轴组:立轮 Z16 + 上链轮(kine:spinner.rotation.y=φ泵;holder 预倾斜) */
  function buildUpshaft() {
    var g = group();
    var holder = group();
    holder.rotation.x = Math.atan2(D.Pb.z - D.Pa.z, -(D.Pb.y - D.Pa.y)) - Math.PI / 2;
    var spinner = group();
    spinner.add(P.cyl(0.05, 0.05, 1.5, M3.woodD, 0, 0, 0, 12));
    var gear = diskGearH(D.Z2, D.r2, 0.055, M3.woodD);
    gear.rotation.z = P.ROTZ;                       // 盘面法向转成局部轴
    spinner.add(gear);
    var spr = diskGearH(D.ZT, D.Rsp, 0.05, M3.woodD, M3.iron);
    spr.rotation.z = P.ROTZ;
    spinner.add(spr);
    holder.add(spinner);
    g.add(holder);
    g.userData.anim = { spinner: spinner };
    return { group: g, anchor: mkAnchor(0, D.r2 + 0.12, 0) };
  }

  /* 下轴组:下链轮(kine 同上) */
  function buildLowshaft() {
    var g = group();
    var holder = group();
    holder.rotation.x = Math.atan2(D.Pb.z - D.Pa.z, -(D.Pb.y - D.Pa.y)) - Math.PI / 2;
    var spinner = group();
    spinner.add(P.cyl(0.05, 0.05, 1.0, M3.woodD, 0, 0, 0, 12));
    var spr = diskGearH(D.ZT, D.Rsp, 0.05, M3.woodD, M3.iron);
    spr.rotation.z = P.ROTZ;
    spinner.add(spr);
    holder.add(spinner);
    g.add(holder);
    g.userData.anim = { spinner: spinner };
    return { group: g, anchor: mkAnchor(0, D.Rsp + 0.12, 0) };
  }

  /* 出水笧槽:沿 -x 木槽 + 三腿 + 槽内水条 + 西端落水(tick 控制) */
  function buildOutTrough() {
    var g = group();
    var x0 = -2.4, x1 = 0.3, len = x1 - x0, cx = (x0 + x1) / 2;
    g.add(P.box(len, 0.05, 0.30, M3.woodD, cx, D.troughY, D.troughZ));
    g.add(P.box(len, 0.14, 0.03, M3.woodD, cx, D.troughY + 0.09, D.troughZ - 0.14));
    g.add(P.box(len, 0.14, 0.03, M3.woodD, cx, D.troughY + 0.09, D.troughZ + 0.14));
    [[-2.2, 0], [-1.1, 0], [-0.1, 0]].forEach(function (p) {
      g.add(P.box(0.09, D.troughY - 0.10, 0.09, M3.wood, p[0], (D.troughY - 0.10) / 2, D.troughZ + p[1]));
    });
    var water = P.box(len - 0.5, 0.03, 0.22, M3.water, cx - 0.1, D.troughY + 0.03, D.troughZ);
    water.castShadow = false;
    var fall = P.box(0.10, D.troughY - 0.30, 0.22, M3.water, x0 - 0.06, (D.troughY - 0.30) / 2 + 0.30, D.troughZ);
    fall.castShadow = false;
    g.add(water); g.add(fall);
    g.userData.anim = { water: [water, fall] };
    return { group: g, anchor: mkAnchor(-2.2, D.troughY + 0.22, D.troughZ) };
  }

  /* 西田:田埂 + 秧苗 + 水面(tick 随 fieldWater 长高) */
  function buildField() {
    var g = group(), f = D.field;
    var w = f.x1 - f.x0, d = f.z1 - f.z0, cx = (f.x0 + f.x1) / 2, cz = (f.z0 + f.z1) / 2;
    g.add(P.box(w + 0.2, 0.30, 0.10, M3.stone, cx, 0.15, f.z0 - 0.05));
    g.add(P.box(w + 0.2, 0.30, 0.10, M3.stone, cx, 0.15, f.z1 + 0.05));
    g.add(P.box(0.10, 0.30, d, M3.stone, f.x0 - 0.05, 0.15, cz));
    g.add(P.box(0.10, 0.30, d, M3.stone, f.x1 + 0.05, 0.15, cz));
    g.add(P.box(w, 0.06, d, new THREE.MeshStandardMaterial({ color: 0x4A4438, roughness: 0.95 }), cx, 0.06, cz));
    for (var i = 0; i < 24; i++) {
      var px = f.x0 + 0.25 + (i % 6) * (w - 0.5) / 5;
      var pz = f.z0 + 0.25 + Math.floor(i / 6) * (d - 0.5) / 3;
      g.add(P.cone ? P.cone(0.045, 0.22, 6, M3.woodL, px, 0.20, pz) : P.cyl(0.012, 0.045, 0.22, M3.woodL, px, 0.20, pz, 6));
    }
    var water = P.box(w - 0.16, 0.02, d - 0.16, M3.water, cx, 0.10, cz);
    water.castShadow = false;
    water.scale.y = 0.01;
    g.add(water);
    g.userData.anim = { water: water };
    return { group: g, anchor: mkAnchor(f.x0 + 0.5, 0.45, cz) };
  }

  /* 风向标:顶杆 + 小旗(tick 摆动) */
  function buildVane() {
    var g = group();
    g.add(P.cyl(0.02, 0.02, 0.9, M3.steelD, 0, D.shaftHi + 0.55, 0, 8));
    var flag = P.box(0.02, 0.20, 0.44, M3.lacquer, 0, D.shaftHi + 0.90, 0.22);
    g.add(flag);
    g.userData.anim = { flag: flag };
    return { group: g, anchor: mkAnchor(0, D.shaftHi + 1.1, 0) };
  }

  /* 链节 i:刮板 + 两销(kine,target=初始位,随 sOff 沿 loopPose 移动) */
  function buildLink(i) {
    var s0 = i * D.p;
    var wp = KS.loopPose(s0);
    var g = group();
    g.add(P.box(D.boardW, D.boardH, D.boardT, M3.woodD, 0, 0, 0));
    var pin = P.cyl(0.018, 0.018, D.boardW + 0.06, M3.iron, 0, 0, 0, 8);
    pin.rotation.z = P.ROTZ;
    g.add(pin);
    return { group: g, anchor: mkAnchor(0, 0.12, 0) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    /* 阶段 1:水池与风车座 */
    def({ id: "pond", name: "POND · 水池", sub: "链下行通道入水 · 深 0.35", phase: 0, at: 0.2, dur: 1.2,
      build: buildPond, target: [0, 0, 0], start: [0, 3.4, 3.0], mid: [0, 1.8, 1.6], anchor: [0, 0.6, 4.3] });
    def({ id: "base", name: "BASE · 风车座", sub: "石座 + 下轴承", phase: 0, at: 1.0, dur: 1.2,
      build: buildBase, target: [0, 0, 0], start: [0, 3.6, -1.6], mid: [0, 2.0, -0.8], anchor: [0, 0.6, 0] });

    /* 阶段 2:帆架与立轴·卧轮 */
    def({ id: "masts", name: "MASTS · 八桅帆架", sub: "桅距半径 1.30 · 上下环", phase: 1, at: 5.3, dur: 1.4,
      build: buildMasts, target: [0, 0, 0], start: [0, 5.6, -1.4], mid: [0, 3.2, -0.7], anchor: [0, 4.2, 0] });
    def({ id: "shaftCrown", name: "VERTICAL SHAFT · 立轴·卧轮 24T", sub: "Z24 r0.60 · 齿面朝上", phase: 1, at: 6.6, dur: 1.2, kind: "kine",
      build: buildShaftCrown, target: [0, 0, 0], off: [-0.9, 2.8, 1.2] });
    def({ id: "vane", name: "VANE · 风向标", sub: "旗随演示风摆", phase: 1, at: 7.6, dur: 0.9,
      build: buildVane, target: [0, 0, 0], start: [0.8, 5.8, 0.6], mid: [0.4, 5.0, 0.3], anchor: [0, 5.4, 0] });

    /* 阶段 3:八帆 */
    def({ id: "sails", name: "SAILS · 八帆", sub: "偏装 45° · 布面 1.02×2.04", phase: 2, at: 11.3, dur: 1.6, kind: "kine",
      build: buildSails, target: [0, 0, 0], off: [1.4, 3.4, 1.8] });

    /* 阶段 4:翻车(架/轴组/笧槽) */
    def({ id: "pumpframe", name: "PUMP FRAME · 翻车架", sub: "斜升 15.4° · 双梁五撑", phase: 3, at: 17.3, dur: 1.4,
      build: buildPumpframe, target: [0, 0, 0], start: [1.8, 4.0, 3.4], mid: [0.9, 2.4, 2.4], anchor: [0, 0.9, 2.6] });
    def({ id: "upshaft", name: "GEAR SHAFT · 立轮 16T·上链轮", sub: "Z16 r0.40 · 啮合距 1.00", phase: 3, at: 18.6, dur: 1.2, kind: "kine",
      build: buildUpshaft, target: [D.Pb.x, D.Pb.y, D.Pb.z], off: [-0.9, 2.2, 1.2] });
    def({ id: "lowshaft", name: "LOWER SHAFT · 下链轮", sub: "R 0.13 · 浸水池中", phase: 3, at: 19.7, dur: 1.1, kind: "kine",
      build: buildLowshaft, target: [D.Pa.x, D.Pa.y, D.Pa.z], off: [-0.9, 1.8, 1.4] });
    def({ id: "outTrough", name: "OUT TROUGH · 笧槽", sub: "承上端出水 · 引入西田", phase: 3, at: 20.7, dur: 1.3,
      build: buildOutTrough, target: [0, 0, 0], start: [-2.6, 4.0, 2.0], mid: [-1.4, 2.6, 1.4], anchor: [0, 1.8, 0.9] });

    /* 阶段 5:26 链节逐节挂装 */
    for (var i = 0; i < D.N; i++) {
      var s0 = i * D.p;
      var wp = KS.loopPose(s0);
      def({ id: "link" + i, name: "CHAIN LINK · 刮板 " + (i + 1 < 10 ? "0" + (i + 1) : i + 1),
        sub: "板 0.26×0.10 · 销距 " + D.p.toFixed(3), phase: 4, at: 26.3 + i * 0.15, dur: 0.5, kind: "kine",
        build: (function (k) { return function () { return buildLink(k); }; })(i),
        target: [wp.x, wp.y, wp.z], off: [0.5, 1.3, 0.9] });
    }

    /* 阶段 7:西田 */
    def({ id: "field", name: "FIELD · 西田", sub: "秧苗 24 株 · 水随灌量涨", phase: 6, at: 35.3, dur: 1.4,
      build: buildField, target: [0, 0, 0], start: [-3.0, 3.8, 1.4], mid: [-2.2, 2.2, 1.2], anchor: [0, 0.5, 1.0] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    function rotY(id, ang) {
      var e = MECH.Parts.entry(id);
      if (!e || !e.shown) return;
      e.group.rotation.y = ang;
    }
    rotY("shaftCrown", st.thetaWheel);
    rotY("sails", st.thetaWheel);
    var spin = -st.sOff / D.Rsp;                    // 链前进 → 链轮转角
    ["upshaft", "lowshaft"].forEach(function (id) {
      var e = MECH.Parts.entry(id);
      if (e && e.shown && e.group.userData.anim) e.group.userData.anim.spinner.rotation.y = spin;
    });
    for (var i = 0; i < D.N; i++) {
      var li = MECH.Parts.entry("link" + i);
      if (!li || !li.shown) continue;
      var wp = KS.loopPose(i * D.p + st.sOff);
      li.group.position.set(wp.x, wp.y, wp.z);
      li.group.quaternion.copy(basisQuat(wp.ty, wp.tz));
    }
  };
})(window.MECH = window.MECH || {});
