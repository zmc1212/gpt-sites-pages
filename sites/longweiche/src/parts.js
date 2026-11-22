/* 龙尾车部件建模与注册(8 件 + 18 水口袋)。
   布局:螺旋轴自下池枢点 B(0,0.42,3.80) 斜升 36.9°(sinθ=0.6)至岸顶 T(0,3.21,0.12),
   围筒半透明(可视螺沟);轴下端枢轮 8T(盘面⊥轴),拐轴距螺旋轴 0.90(平行,
   水平垂直向偏置),接轮 16T 与枢轮外啮合;双拐木 + 铅垂踏板(反旋回正);
   螺沟内 18 个水口袋随 φ螺旋轴向爬升(速度 = ω螺旋·S/2π),过顶即卸入笧槽。
   kine:screwCore 旋转写 spinner.rotation.y(holder 预倾斜,局部 Y=轴向);
   crankset 同构,踏板杆经二级反旋保持铅垂(jiegao 水罐先例)。
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

  /* 轴系局部帧:holder.rotation.x = atan2(dz,dy) 使局部 +Y → 轴向 d̂(0,0.6,0.8) */
  var AXIS_TILT = Math.atan2(D.dir.z, D.dir.y);            // ≈ 0.927 rad
  function axisHolder() {
    var h = group();
    h.rotation.x = AXIS_TILT;
    return h;
  }

  /* 水平盘齿齿轮(Z 齿,轴沿局部 +Y) */
  function diskGearY(Z, r, thick, mat, hubMat) {
    var g = group();
    g.add(P.cyl(r * 0.86, r * 0.86, thick, mat, 0, 0, 0, 36));
    for (var i = 0; i < Z; i++) {
      var a = i / Z * Math.PI * 2;
      var t = P.box(r * 0.16, thick * 0.9, 0.034, mat, Math.cos(a) * (r - 0.008), 0, Math.sin(a) * (r - 0.008));
      t.rotation.y = -a;
      g.add(t);
    }
    g.add(P.cyl(0.05, 0.05, thick + 0.10, hubMat || M3.bronze, 0, 0, 0, 12));
    return g;
  }

  /* —— 部件构建器 —— */

  /* 下池:石砌方池 + 水(螺旋下端入水) */
  function buildPool() {
    var g = group(), p = D.pond;
    var w = p.x1 - p.x0, d = p.z1 - p.z0, cx = (p.x0 + p.x1) / 2, cz = (p.z0 + p.z1) / 2;
    g.add(P.box(w + 0.24, p.wallH, 0.14, M3.stone, cx, p.wallH / 2, p.z0 - 0.05));
    g.add(P.box(w + 0.24, p.wallH, 0.14, M3.stone, cx, p.wallH / 2, p.z1 + 0.05));
    g.add(P.box(0.14, p.wallH, d, M3.stone, p.x0 - 0.05, p.wallH / 2, cz));
    g.add(P.box(0.14, p.wallH, d, M3.stone, p.x1 + 0.05, p.wallH / 2, cz));
    g.add(P.box(w, 0.06, d, M3.stone, cx, 0.08, cz));
    var water = P.box(w - 0.06, 0.10, d - 0.06, M3.water, cx, p.water - 0.05, cz);
    water.castShadow = false;
    g.add(water);
    return { group: g, anchor: mkAnchor(p.x1 + 0.4, p.wallH + 0.2, cz) };
  }

  /* 岸台:砖台 + 笧槽 + 蓄水柜 + 柜水位(tick 驱动) */
  function buildBank() {
    var g = group();
    /* 岸台(承上支座,砖石色) */
    var brick = new THREE.MeshStandardMaterial({ color: 0x54575C, roughness: 0.94 });
    g.add(P.box(1.6, 1.70, 0.9, brick, 1.55, 0.85, D.T.z));
    g.add(P.box(1.3, 1.68, 0.8, brick, 1.55, 2.54, D.T.z));
    g.add(P.box(1.6, 0.10, 0.9, M3.stone, 1.55, 1.72, D.T.z));
    g.add(P.box(1.3, 0.10, 0.8, M3.stone, 1.55, 3.40, D.T.z));
    /* 笧槽:承接围筒顶口,沿 -x 引入柜 */
    g.add(P.box(1.5, 0.05, 0.34, M3.woodD, D.tank.x + 0.75, D.tank.y + 0.12, D.T.z));
    g.add(P.box(1.5, 0.14, 0.03, M3.woodD, D.tank.x + 0.75, D.tank.y + 0.20, D.T.z - 0.16));
    g.add(P.box(1.5, 0.14, 0.03, M3.woodD, D.tank.x + 0.75, D.tank.y + 0.20, D.T.z + 0.16));
    /* 蓄水柜(量水演示) */
    g.add(P.box(0.9, 0.08, 0.9, M3.woodD, D.tank.x, D.tank.y, D.T.z));
    [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]].forEach(function (o) {
      g.add(P.box(0.07, 0.56, 0.07, M3.woodD, D.tank.x + o[0], D.tank.y + 0.30, D.T.z + o[1]));
    });
    [[-0.42, 0], [0.42, 0], [0, -0.42], [0, 0.42]].forEach(function (o) {
      g.add(P.box(o[0] ? 0.03 : 0.90, 0.52, o[0] ? 0.90 : 0.03, M3.wood, D.tank.x + o[0] * 0.98, D.tank.y + 0.32, D.T.z + o[1] * 0.98));
    });
    var tw = P.box(0.80, 0.02, 0.80, M3.water, D.tank.x, D.tank.y + 0.10, D.T.z);
    tw.castShadow = false; tw.scale.y = 0.01;
    g.add(tw);
    /* 柜出水小渠(西向,装饰) */
    g.add(P.box(0.5, 0.10, 0.24, M3.stone, D.tank.x - 0.75, D.tank.y + 0.06, D.T.z));
    g.userData.anim = { tankWater: tw };
    return { group: g, anchor: mkAnchor(D.tank.x, D.tank.y + 0.72, D.T.z) };
  }

  /* 围筒:半透明筒(可视螺沟)+ 三道箍 + 托架 + 上下支座 */
  function buildTube() {
    var g = group();
    var midY = (D.B.y + D.T.y) / 2, midZ = (D.B.z + D.T.z) / 2;
    var holder = axisHolder();
    holder.position.set(0, midY, midZ);
    var tube = P.mesh(new THREE.CylinderGeometry(D.Rout + 0.02, D.Rout + 0.02, D.tubeLen, 30, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x9FB6C4, transparent: true, opacity: 0.28, roughness: 0.3, side: THREE.DoubleSide }),
      0, 0, 0);
    tube.castShadow = false;
    holder.add(tube);
    [-0.33, 0, 0.33].forEach(function (u) {
      var hoop = P.torus(D.Rout + 0.045, 0.028, M3.iron, 0, u * D.tubeLen, 0, 26);
      hoop.rotation.x = P.ROTX;
      holder.add(hoop);
    });
    g.add(holder);
    /* 下支座(枢座)+ 上支座 + 两道托架 */
    g.add(P.box(0.55, 0.50, 0.55, M3.stone, D.B.x, D.B.y - 0.28, D.B.z));
    g.add(P.cyl(0.10, 0.12, 0.14, M3.bronze, D.B.x, D.B.y, D.B.z, 14));
    g.add(P.box(0.55, 0.40, 0.55, M3.stone, D.T.x, D.T.y - 0.24, D.T.z));
    [0.33, 0.62].forEach(function (f) {
      var yy = D.B.y + (D.T.y - D.B.y) * f, zz = D.B.z + (D.T.z - D.B.z) * f;
      g.add(P.box(0.10, yy - 0.1, 0.10, M3.woodD, -0.34, (yy - 0.1) / 2, zz));
      g.add(P.box(0.10, yy - 0.1, 0.10, M3.woodD, 0.34, (yy - 0.1) / 2, zz));
      g.add(P.box(0.78, 0.07, 0.10, M3.wood, 0, yy - 0.08, zz));
    });
    return { group: g, anchor: mkAnchor(0, (D.B.y + D.T.y) / 2 + 0.4, (D.B.z + D.T.z) / 2) };
  }

  /* 螺旋轴芯:轴 + 双头螺叶 + 枢轮 8T(kine:spinner.rotation.y = φ螺旋) */
  function buildScrewCore() {
    var g = group();
    var holder = axisHolder();
    holder.position.set(0, (D.B.y + D.T.y) / 2, (D.B.z + D.T.z) / 2);
    /* 轴:沿局部 Y,自 B 到 T 全长 */
    holder.add(P.cyl(D.rAxis, D.rAxis, D.L, M3.woodD, 0, 0, 0, 14));
    /* 双头螺叶:每头 tubeLen/S≈9.5 圈,以 28 段窄板近似螺旋面 */
    var segs = 28, turns = D.tubeLen / D.S;
    for (var f = 0; f < D.flights; f++) {
      for (var i = 0; i < segs; i++) {
        var u = (i + 0.5) / segs * D.tubeLen;               // 轴向位置
        var th = u / D.S * Math.PI * 2 + f * Math.PI;       // 螺旋角
        var blade = P.box(D.Rout - D.rAxis - 0.01, 0.10, 0.02, M3.wood, 0, 0, 0);
        blade.position.set(Math.cos(th) * (D.rAxis + D.Rout) / 2, 0, Math.sin(th) * (D.rAxis + D.Rout) / 2);
        blade.position.y = u - D.tubeLen / 2;
        blade.rotation.y = -th;
        blade.rotation.z = 0.42;                            // 叶面螺旋倾角(示意)
        holder.add(blade);
      }
    }
    var spinner = group();
    /* 枢轮(盘面⊥轴,位于下端 u=-tubeLen/2-0.12 处) */
    var pinion = diskGearY(D.Zs, D.rs, 0.05, M3.woodD);
    pinion.position.y = -D.tubeLen / 2 - 0.25;
    spinner.add(pinion);
    holder.add(spinner);
    /* 轴顶帽 */
    holder.add(P.cyl(0.10, 0.10, 0.12, M3.iron, 0, D.L / 2 + 0.05, 0, 12));
    g.add(holder);
    g.userData.anim = { spinner: spinner };
    return { group: g, anchor: mkAnchor(0, (D.B.y + D.T.y) / 2 + 0.45, (D.B.z + D.T.z) / 2) };
  }

  /* 拐木组:拐轴 + 接轮 16T + 双拐臂 + 铅垂踏板(kine:spinner.rotation.y=φ拐) */
  function buildCrankset() {
    var g = group();
    var holder = axisHolder();
    holder.position.set(-D.crankOff, (D.B.y + D.T.y) / 2, (D.B.z + D.T.z) / 2);
    var spinner = group();
    spinner.add(P.cyl(0.06, 0.06, 4.5, M3.woodD, 0, 0, 0, 12));
    var gear = diskGearY(D.Zj, D.rj, 0.055, M3.woodD);
    gear.position.y = -D.tubeLen / 2 - 0.25;            // 与枢轮同轴向站位
    spinner.add(gear);
    var rods = [];
    [0.55, 1.45].forEach(function (u) {
      var arm = group();
      arm.position.y = u;
      arm.add(P.box(D.crankArm, 0.09, 0.09, M3.woodD, D.crankArm / 2, 0, 0));
      var rodH = group();
      rodH.position.set(D.crankArm, 0, 0);              // 拐臂端
      var rod = P.cyl(0.030, 0.030, D.rodLen, M3.wood, 0, -D.rodLen / 2, 0, 10);
      rodH.add(rod);
      rodH.add(P.box(0.30, 0.05, 0.16, M3.lacquer, 0, -D.rodLen, 0));   // 踏板
      rodH.rotation.order = "YXZ";
      arm.add(rodH);
      rods.push(rodH);
      spinner.add(arm);
    });
    holder.add(spinner);
    g.add(holder);
    g.userData.anim = { spinner: spinner, rods: rods, tilt: AXIS_TILT };
    return { group: g, anchor: mkAnchor(-D.crankOff + 0.5, 1.0, 2.4) };
  }

  /* 螺沟水口袋:18 团(9/头),tick 沿螺旋爬升、过顶卸入笧槽 */
  function buildWaterPockets() {
    var g = group();
    var pockets = [];
    var per = 9;
    for (var f = 0; f < D.flights; f++) {
      for (var i = 0; i < per; i++) {
        var m = P.sph(0.10, M3.water, 0, 0, 0);
        m.castShadow = false;
        m.visible = false;
        m.userData.u = (i + 0.5) / per * D.tubeLen + (f * D.S / 2);
        m.userData.flight = f;
        g.add(m);
        pockets.push(m);
      }
    }
    g.userData.anim = { pockets: pockets };
    return { group: g, anchor: mkAnchor(0, 1.8, 2.0) };
  }

  /* 踏台:两座木台,承踏板(杆底按拐臂站位) */
  function buildStands() {
    var g = group();
    var midY = (D.B.y + D.T.y) / 2, midZ = (D.B.z + D.T.z) / 2;
    [0.55, 1.45].forEach(function (u) {
      var cy = midY + u * D.dir.y - D.rodLen - 0.10;
      var cz = midZ + u * D.dir.z;
      g.add(P.box(0.9, 0.10, 0.7, M3.woodD, -D.crankOff, cy, cz));
      [[-0.36, -0.26], [0.36, -0.26], [-0.36, 0.26], [0.36, 0.26]].forEach(function (o) {
        g.add(P.box(0.09, cy, 0.09, M3.wood, -D.crankOff + o[0], cy / 2, cz + o[1]));
      });
    });
    return { group: g, anchor: mkAnchor(-D.crankOff - 0.6, 1.2, 2.4) };
  }

  /* 水尺:蓄水柜刻度桩(标 0-0.5m) */
  function buildGauge() {
    var g = group();
    g.add(P.box(0.06, 0.60, 0.03, M3.woodL, D.tank.x + 0.47, D.tank.y + 0.36, D.T.z - 0.44));
    for (var i = 0; i <= 5; i++) {
      g.add(P.box(0.07, 0.012, 0.012, M3.iron, D.tank.x + 0.44, D.tank.y + 0.10 + i * 0.10, D.T.z - 0.44));
    }
    return { group: g, anchor: mkAnchor(D.tank.x + 0.5, D.tank.y + 0.6, D.T.z - 0.44) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "pool", name: "POOL · 下池", sub: "螺旋下端入水 0.18", phase: 0, at: 0.2, dur: 1.2,
      build: buildPool, target: [0, 0, 0], start: [0, 3.4, 2.4], mid: [0, 1.8, 1.4], anchor: [0, 0.7, 3.8] });
    def({ id: "bank", name: "BANK · 岸台·笧槽·水柜", sub: "柜水位 = 累计提水", phase: 0, at: 1.0, dur: 1.2,
      build: buildBank, target: [0, 0, 0], start: [1.2, 5.0, -1.0], mid: [1.0, 3.2, 0], anchor: [0, 3.8, 0] });

    def({ id: "tube", name: "TUBE · 围筒支架", sub: "半透明可视螺沟 · 上下支座", phase: 1, at: 5.3, dur: 1.4,
      build: buildTube, target: [0, 0, 0], start: [0, 5.4, 1.0], mid: [0, 3.0, 1.4], anchor: [0, 1.9, 2.0] });

    def({ id: "screw", name: "SCREW · 螺旋轴·枢轮 8T", sub: "双头螺叶 · 轴长 15尺 sinθ=0.6", phase: 2, at: 10.3, dur: 1.6, kind: "kine",
      build: buildScrewCore, target: [0, 0, 0], off: [0.9, 3.0, 1.4] });

    def({ id: "crankset", name: "CRANKSET · 拐木·接轮 16T", sub: "拐木一转得二转(i=2)", phase: 3, at: 16.3, dur: 1.5, kind: "kine",
      build: buildCrankset, target: [0, 0, 0], off: [-1.0, 2.2, 1.2] });
    def({ id: "stands", name: "TREAD STANDS · 踏台", sub: "双台承踏板 · 畜力/轮踏", phase: 3, at: 17.7, dur: 1.1,
      build: buildStands, target: [0, 0, 0], start: [-2.2, 4.2, 2.6], mid: [-1.6, 2.6, 2.4], anchor: [0, 1.5, 2.4] });

    def({ id: "waterPockets", name: "WATER · 螺沟水口袋", sub: "轴向爬升 v=ω螺旋·S/2π", phase: 4, at: 22.3, dur: 1.2,
      build: buildWaterPockets, target: [0, 0, 0], start: [0, 3.0, 2.0], mid: [0, 2.0, 2.0], anchor: [0, 2.0, 2.0] });
    def({ id: "gauge", name: "GAUGE · 水尺", sub: "柜刻度 0-0.5m", phase: 4, at: 23.3, dur: 0.9,
      build: buildGauge, target: [0, 0, 0], start: [-0.6, 4.2, -0.4], mid: [-0.6, 3.6, 0], anchor: [0, 3.9, 0] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("screw");
    if (e && e.shown && e.group.userData.anim) e.group.userData.anim.spinner.rotation.y = st.phiScrew;
    e = MECH.Parts.entry("crankset");
    if (e && e.shown && e.group.userData.anim) {
      var anim = e.group.userData.anim;
      anim.spinner.rotation.y = st.phiCrank;
      /* 踏板杆保持铅垂:rodH = Ry(−φ拐)·Rx(−tilt)(order YXZ) */
      anim.rods.forEach(function (rh) {
        rh.rotation.y = -st.phiCrank;
        rh.rotation.x = -anim.tilt;
      });
    }
  };
})(window.MECH = window.MECH || {});
