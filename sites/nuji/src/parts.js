/* 弩机部件建模与注册(9 件)——原大机构(郭 14.2cm),机位贴近。
   布局:木臂沿 x(西弦东箭,弦西),郭居 x-0.10(半剖可视内部);
   牙/悬刀绕键轴(z 向)转动:牙上端钩弦、悬刀下垂;牛(联动件)斜连两者;
   望山立郭后(x+0.02)带 6 刻度;弓(竖立弧)在 x-0.42,弦挂两弰至牙;
   箭置郭顶箭槽(击发沿 -x 飞出);落点标记在 -x 远端(压缩 20:1)。
   kine:牙/悬刀/牛写 rotation.z(联动比 k=1.5);弦/箭/落点由 tick 驱动。
   标签锚点:build 返回 anchor。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;
  var Y = 0.42;                                   // 机面高(木臂面)

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  /* 木臂(含箭槽与手位) */
  function buildTiller() {
    var g = group();
    g.add(P.box(D.armL, 0.05, 0.055, M3.woodD, -0.12, Y - 0.05, 0));
    g.add(P.box(0.16, 0.012, 0.028, M3.iron, 0.0, Y + 0.005, 0));    // 箭槽铜片
    g.add(P.box(0.10, 0.05, 0.05, M3.wood, 0.28, Y - 0.085, 0));     // 后手位
    return { group: g, anchor: mkAnchor(-0.12, Y + 0.1, 0) };
  }

  /* 青铜郭:半剖机匣(纵向剖去前半),内腔可视 */
  function buildGuo() {
    var g = group();
    var mat = new THREE.MeshStandardMaterial({ color: 0x9A7B44, metalness: 0.72, roughness: 0.42 });
    var back = P.box(0.012, D.guoH, D.guoT, mat, 0.071, Y + 0.02, 0);       // 后壁
    g.add(back);
    g.add(P.box(D.guoL, 0.012, D.guoT, mat, 0, Y - 0.015, 0));              // 底
    [-1, 1].forEach(function (s) {                                          // 两侧壁(半剖留东)
      g.add(P.box(D.guoL, D.guoH, 0.012, mat, 0, Y + 0.02, s * (D.guoT / 2 - 0.006)));
    });
    g.add(P.box(0.012, D.guoH * 0.55, D.guoT, mat, -0.071, Y + 0.0, 0));    // 前壁半高
    g.add(P.box(D.guoL + 0.02, 0.014, D.guoT + 0.02, mat, 0, Y - 0.030, 0));// 底缘
    /* 3 键(销轴,贯穿 z) */
    [[0.028, 0.030], [0.0, -0.006], [-0.032, -0.026]].forEach(function (p) {
      var pin = P.cyl(0.006, 0.006, D.guoT + 0.02, M3.bronze, p[0], Y + p[1], 0, 8);
      pin.rotation.x = P.ROTX;
      g.add(pin);
    });
    return { group: g, anchor: mkAnchor(0, Y + 0.10, 0) };
  }

  /* 牙(钩弦件,绕上键):局部原点=键位,上端前钩 */
  function buildYa() {
    var g = group();
    var mat = new THREE.MeshStandardMaterial({ color: 0xA8854A, metalness: 0.75, roughness: 0.4 });
    g.add(P.box(0.020, 0.052, 0.020, mat, 0.004, 0.020, 0));
    g.add(P.box(0.026, 0.012, 0.020, mat, 0.010, 0.046, 0));     // 前钩头
    g.add(P.box(0.018, 0.026, 0.016, mat, -0.008, -0.010, 0));   // 下尾(连牛)
    return { group: g, anchor: mkAnchor(0.028, Y + 0.05, 0) };
  }

  /* 悬刀(绕下键,下垂长板) */
  function buildSd() {
    var g = group();
    var mat = new THREE.MeshStandardMaterial({ color: 0xA8854A, metalness: 0.75, roughness: 0.4 });
    g.add(P.box(0.014, 0.070, 0.016, mat, 0, -0.036, 0));
    g.add(P.box(0.020, 0.016, 0.016, mat, 0.004, -0.004, 0));    // 上连鼻
    return { group: g, anchor: mkAnchor(0.0, Y - 0.02, 0) };
  }

  /* 牛(联动件,斜杆连接牙尾与悬刀上鼻) */
  function buildNiu() {
    var g = group();
    var mat = new THREE.MeshStandardMaterial({ color: 0x9A7B44, metalness: 0.72, roughness: 0.42 });
    g.add(P.box(0.010, 0.042, 0.012, mat, 0, 0, 0));
    g.rotation.z = 0.65;
    return { group: g, anchor: mkAnchor(-0.010, Y + 0.01, 0) };
  }

  /* 望山(6 刻度,立郭后) */
  function buildWang() {
    var g = group();
    var mat = new THREE.MeshStandardMaterial({ color: 0xA8854A, metalness: 0.75, roughness: 0.4 });
    g.add(P.box(0.012, D.Lwang, 0.018, mat, 0.0, D.Lwang / 2 + 0.005, 0));
    for (var i = 1; i <= D.gradN; i++) {
      g.add(P.box(0.014, 0.004, 0.020, M3.gold, 0.001, i * D.gradH + 0.006, 0));
    }
    return { group: g, anchor: mkAnchor(0, Y + 0.075, 0) };
  }

  /* 弓(竖立弧,双弰)+ 弦(两段,至牙;击发后弦前甩——tick 控制) */
  function buildBow() {
    var g = group();
    var bowMat = new THREE.MeshStandardMaterial({ color: 0x6B4A26, roughness: 0.8 });
    /* 弓臂:两段弧(用弯管近似:TorusGeometry 半段) */
    [-1, 1].forEach(function (s) {
      var limb = P.mesh(new THREE.TorusGeometry(D.bowR, 0.014, 8, 24, 1.15),
        bowMat, 0, Y + 0.02, 0);
      limb.rotation.y = Math.PI / 2;
      limb.rotation.z = s > 0 ? -0.35 : Math.PI + 0.35;
      g.add(limb);
    });
    /* 弦两段(牙→上弰/下弰) */
    var strMat = new THREE.MeshStandardMaterial({ color: 0xD8CBA8, roughness: 0.9 });
    var s1 = P.cyl(0.006, 0.006, 0.42, strMat, 0, 0, 0, 6);
    var s2 = P.cyl(0.006, 0.006, 0.42, strMat, 0, 0, 0, 6);
    g.add(s1); g.add(s2);
    g.userData.anim = { s1: s1, s2: s2 };
    return { group: g, anchor: mkAnchor(-D.bowR + 0.1, Y + 0.15, 0) };
  }

  /* 箭(置于郭顶箭槽;击发沿 -x 飞)——tick 驱动 */
  function buildBolt() {
    var g = group();
    var shaft = P.cyl(0.007, 0.007, 0.30, M3.woodL, 0, Y + 0.035, 0, 8);
    shaft.rotation.z = P.ROTZ;
    g.add(shaft);
    g.add(P.mesh(new THREE.ConeGeometry(0.016, 0.045, 8), M3.steel, -0.16, Y + 0.035, 0));
    var cone = g.children[g.children.length - 1];
    cone.rotation.z = -Math.PI / 2;
    [-1, 1].forEach(function (s) {
      g.add(P.box(0.05, 0.002, 0.02, M3.paper, 0.12, Y + 0.035, s * 0.014));
    });
    g.userData.anim = { shaft: shaft };
    return { group: g, anchor: mkAnchor(0, Y + 0.1, 0.04) };
  }

  /* 落点标记(远端,压缩 20:1)+ 距离牌 */
  function buildTarget() {
    var g = group();
    g.add(P.cyl(0.05, 0.05, 0.10, M3.woodD, -3.05, 0.05, 0, 12));
    g.add(P.cyl(0.07, 0.02, 0.02, M3.gold, -3.05, 0.12, 0, 12));
    g.add(P.box(0.02, 0.16, 0.10, M3.paper, -3.05, 0.22, 0));
    return { group: g, anchor: mkAnchor(-3.05, 0.30, 0) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "tiller", name: "TILLER · 木臂", sub: "「其柄曰臂,似人臂也」", phase: 0, at: 0.2, dur: 1.2,
      build: buildTiller, target: [0, 0, 0], start: [0, 1.4, 0.9], mid: [0, 0.9, 0.45], anchor: [0, 0.55, 0] });
    def({ id: "guo", name: "GUO · 青铜郭(半剖)", sub: "郭长 14.2cm(镇原东汉)", phase: 0, at: 1.0, dur: 1.2,
      build: buildGuo, target: [0, 0, 0], start: [-0.4, 1.6, -0.5], mid: [-0.2, 0.9, -0.25], anchor: [0, 0.60, 0] });

    def({ id: "ya", name: "YA · 牙(钩弦)", sub: "「钩弦者曰牙」· L牙 3cm", phase: 1, at: 5.3, dur: 1.2, kind: "kine",
      build: buildYa, target: [0.028, Y + 0.03, 0], off: [0.15, 0.9, 0.5] });
    def({ id: "sd", name: "SEAR · 悬刀", sub: "「下曰悬刀」· L悬 4.5cm", phase: 1, at: 6.4, dur: 1.2, kind: "kine",
      build: buildSd, target: [0.0, Y - 0.01, 0], off: [0.1, -0.7, 0.5] });
    def({ id: "niu", name: "NIU · 牛(联动)", sub: "牙-悬刀传动 · k=1.5", phase: 1, at: 7.4, dur: 1.1, kind: "kine",
      build: buildNiu, target: [0.010, Y + 0.012, 0], off: [-0.15, 1.0, 0.5] });
    def({ id: "wang", name: "SIGHT · 望山", sub: "6 刻度 · 每格 Δθ≈8.8°", phase: 1, at: 8.3, dur: 1.1,
      build: buildWang, target: [0, 0, 0], start: [0.2, 1.5, -0.3], mid: [0.1, 0.9, -0.15], anchor: [0, 0.62, 0] });

    def({ id: "bow", name: "BOW · 弓·弦", sub: "六石 弦力 1774N · 行程 0.16", phase: 2, at: 10.3, dur: 1.4, kind: "kine",
      build: buildBow, target: [-0.42, 0, 0], off: [-0.9, 1.4, 0.7] });
    def({ id: "bolt", name: "BOLT · 箭", sub: "m 50g · v 75m/s", phase: 2, at: 11.6, dur: 1.1,
      build: buildBolt, target: [0, 0, 0], start: [0.3, 1.3, 0.4], mid: [0.15, 0.8, 0.2], anchor: [0, 0.55, 0] });
    def({ id: "target", name: "TARGET · 落点标记", sub: "理想射程 580m · 压缩 20:1", phase: 2, at: 12.5, dur: 1.1,
      build: buildTarget, target: [0, 0, 0], start: [-3.4, 1.5, 0], mid: [-3.2, 0.8, 0], anchor: [0, 0.4, 0] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("ya");
    if (e && e.shown) e.group.rotation.z = st.yaT;
    e = MECH.Parts.entry("sd");
    if (e && e.shown) e.group.rotation.z = st.sdT * 0.85;
    e = MECH.Parts.entry("niu");
    if (e && e.shown) e.group.rotation.z = 0.65 + st.yaT * 1.1;
    /* 弦:挂弦时两段斜挂至牙;击发后前甩(松弦) */
    e = MECH.Parts.entry("bow");
    if (e && e.shown && e.group.userData.anim) {
      var a = e.group.userData.anim;
      var strY = Y + 0.02;
      var backX = st.cocked || st.firing ? 0.16 : -0.05;    // 弦后拉量
      var upY = Y + 0.02 + D.bowR * 0.92, dnY = Y + 0.02 - D.bowR * 0.92;
      a.s1.position.set((-0.42 + backX) / 2 + 0.21, (upY + strY) / 2, 0);
      a.s1.rotation.z = Math.atan2(backX + 0.21 - 0.42, upY - strY) * -1;
      a.s2.position.set((-0.42 + backX) / 2 + 0.21, (dnY + strY) / 2, 0);
      a.s2.rotation.z = Math.atan2(backX + 0.21 - 0.42, dnY - strY);
    }
  };
})(window.MECH = window.MECH || {});
