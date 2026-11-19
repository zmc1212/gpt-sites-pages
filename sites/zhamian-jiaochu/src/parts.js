/* 轧棉搅车部件建模与注册(11 件)。
   坐标系:y 上;双辊轴沿 z(辊面 x-y),辊心 x=0;下辊脚踏同轴,
   齿轮对等齿外啮合反传上辊;棉团在辊隙前(+z)受牵,皮棉出 −z。
   KINE:下辊 rotation.z = ψ,上辊 = −ψ,踏板 = ψ;
   棉团压缩牵出、棉籽回落、皮棉条牵长——内部节点每帧更新。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  var _plank = null;
  function plankMat() {
    if (!_plank) {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var x = c.getContext("2d");
      x.fillStyle = "#9A6B33";
      x.fillRect(0, 0, 128, 128);
      for (var i = 0; i < 8; i++) {
        var px = i * 16 + 1;
        x.fillStyle = (i % 2) ? "#8A5E2B" : "#A97844";
        x.fillRect(px, 0, 14, 128);
        x.strokeStyle = "rgba(58,36,12,0.6)";
        x.lineWidth = 1.6;
        x.strokeRect(px, 0, 14, 128);
      }
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 1);
      t.encoding = THREE.sRGBEncoding;
      _plank = new THREE.MeshStandardMaterial({ map: t, roughness: 0.84, metalness: 0.04 });
    }
    return _plank;
  }

  function diskGear(Z, r, thick, mat, hubMat) {  // 盘齿(平面 x-y,轴 z)
    var g = group();
    var disc = P.cyl(r * 0.88, r * 0.88, thick, mat, 0, 0, 0, 30);
    disc.rotation.x = P.ROTX;
    g.add(disc);
    for (var i = 0; i < Z; i++) {
      var a = i / Z * Math.PI * 2;
      var t = P.box(0.03, r * 0.24, thick * 0.94, mat, Math.cos(a) * (r - 0.008), Math.sin(a) * (r - 0.008), 0);
      t.rotation.z = a;
      g.add(t);
    }
    var hub = P.cyl(0.045, 0.045, thick + 0.08, hubMat || M3.bronze, 0, 0, 0, 12);
    hub.rotation.x = P.ROTX;
    g.add(hub);
    return g;
  }

  /* —— 部件构建器 —— */

  function buildBase() {     // 机架:重木框 + 双辊轴承墙 + 石础
    var g = group();
    g.add(P.box(1.30, 0.10, 0.94, plankMat(), 0, 0.05, 0));
    [[-0.55, 0.34], [0.55, 0.34], [-0.55, -0.34], [0.55, -0.34]].forEach(function (p) {
      g.add(P.box(0.14, D.baseH, 0.14, M3.woodD, p[0], D.baseH / 2 + 0.10, p[1]));
      g.add(P.box(0.28, 0.08, 0.28, M3.stone, p[0], 0.04, p[1]));
    });
    g.add(P.box(1.14, 0.09, 0.12, M3.wood, 0, D.yLow + 0.16, 0.34));   // 轴承墙(下)
    g.add(P.box(1.14, 0.09, 0.12, M3.wood, 0, D.yUp + 0.16, -0.30));   // 轴承墙(上)
    g.add(P.box(1.20, 0.07, 0.66, M3.wood, 0, D.baseH + 0.14, 0));     // 顶板
    g.add(P.box(0.09, D.baseH, 0.09, M3.woodD, -0.42, D.baseH / 2 + 0.10, 0.40));
    g.add(P.box(0.09, D.baseH, 0.09, M3.woodD, 0.42, D.baseH / 2 + 0.10, 0.40));
    return { group: g, anchor: mkAnchor(0.4, D.baseH * 0.5, 0.42) };
  }

  function buildRollerLow() {  // 下辊:木辊 + 端头 + 齿轮 A(z−0.34)
    var g = group();
    var len = D.rollerZ1 - D.rollerZ0;
    var roll = P.cyl(D.rLow, D.rLow, len, plankMat(), 0, 0, 0, 18);
    roll.rotation.x = P.ROTX;
    g.add(roll);
    [1, -1].forEach(function (s) {
      var cap = P.cyl(D.rLow + 0.012, D.rLow + 0.012, 0.035, M3.woodD, 0, 0, s * (len / 2 + 0.02), 18);
      cap.rotation.x = P.ROTX;
      g.add(cap);
    });
    var gearA = diskGear(D.gearZT, D.gearR, 0.075, M3.woodD);
    gearA.position.z = D.gearZ - 0;
    g.add(gearA);
    return { group: g, anchor: mkAnchor(D.rLow, 0.08, 0.15) };
  }

  function buildRollerUp() {   // 上辊:木辊 + 齿轮 B(外啮合,反向)
    var g = group();
    var len = D.rollerZ1 - D.rollerZ0;
    var roll = P.cyl(D.rUp, D.rUp, len, plankMat(), 0, 0, 0, 18);
    roll.rotation.x = P.ROTX;
    g.add(roll);
    [1, -1].forEach(function (s) {
      var cap = P.cyl(D.rUp + 0.010, D.rUp + 0.010, 0.032, M3.woodD, 0, 0, s * (len / 2 + 0.02), 18);
      cap.rotation.x = P.ROTX;
      g.add(cap);
    });
    var gearB = diskGear(D.gearZT, D.gearR, 0.075, M3.wood);
    gearB.position.z = D.gearZ;
    g.add(gearB);
    return { group: g, anchor: mkAnchor(-D.rUp, 0.08, 0.15) };
  }

  function buildTreadle() {    // 踏板:曲柄臂 + 踏板(绕下辊轴)
    var g = group();
    var arm = P.box(0.05, D.rTread * 2, 0.042, M3.woodD, 0, -D.rTread, 0);
    g.add(arm);
    g.add(P.box(0.18, 0.032, 0.12, plankMat(), 0.015, -D.rTread - 0.03, 0));
    return { group: g, anchor: mkAnchor(0.05, -D.rTread - 0.05, 0.08) };
  }

  function buildFeedBoard() {  // 给棉板:斜托板 + 挡板(喂棉导槽)
    var g = group();
    var ramp = P.box(0.16, 0.04, 0.60, plankMat(), 0.13, 0.46, 0.30);
    ramp.rotation.x = 0.28;
    g.add(ramp);
    g.add(P.box(0.04, 0.22, 0.60, M3.woodD, 0.22, 0.56, 0.28));
    return { group: g, anchor: mkAnchor(0.22, 0.66, 0.3) };
  }

  function buildCotton(idx) {  // 棉团:白棉球簇(受牵压缩)
    var g = group();
    var white = new THREE.MeshStandardMaterial({ color: 0xEDEAE0, roughness: 0.95, metalness: 0.0 });
    [[0, 0, 0, 1], [0.04, 0.03, 0.02, 0.7], [-0.04, 0.02, -0.03, 0.75], [0.02, -0.03, 0.04, 0.65]].forEach(function (o) {
      var s = P.sph(0.055 * o[3], white, o[0], o[1] + 0.03, o[2]);
      g.add(s);
    });
    g.userData.idx = idx;
    return { group: g, anchor: g };
  }

  function buildLint() {       // 皮棉:出棉侧棉条(随牵引伸长)
    var g = group();
    var lint = P.box(0.10, 0.03, 0.01, new THREE.MeshStandardMaterial({ color: 0xF2EFE6, roughness: 0.97 }), 0, D.nipY + 0.01, D.lintZ);
    lint.scale.z = 0.01;
    g.add(lint);
    g.userData.lint = lint;
    return { group: g, anchor: mkAnchor(0, D.nipY + 0.05, D.lintZ - 0.1) };
  }

  function buildSeeds() {      // 棉籽:6 颗(回落动画,内部节点)
    var g = group();
    var dark = new THREE.MeshStandardMaterial({ color: 0x4A3A26, roughness: 0.9 });
    var seeds = [];
    for (var i = 0; i < D.seedN; i++) {
      var s = P.sph(0.016, dark, 0.10 + (i % 3) * 0.05, 0.06, D.feedZ - 0.06 - (i % 2) * 0.06);
      s.visible = false;
      g.add(s);
      seeds.push(s);
    }
    g.userData.seeds = seeds;
    return { group: g, anchor: mkAnchor(0.12, 0.12, D.feedZ) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "base", name: "BASE · 机架", sub: "重木框 · 双辊轴承墙", phase: 0, at: 0.2, dur: 1.4,
      build: buildBase, target: [0, 0, 0], start: [0, 4.4, 0], mid: [0, 2.2, 0] });
    def({ id: "rollerLow", name: "ROLLER · 下辊", sub: "r 0.075 · 脚踏同轴 + 齿轮A", phase: 1, at: 5.6, dur: 1.3, kind: "kine",
      build: buildRollerLow, target: [0, D.yLow, 0], off: [0.8, 2.0, 0.9] });
    def({ id: "rollerUp", name: "ROLLER · 上辊", sub: "r 0.065 · 齿轮B 外啮合反向", phase: 2, at: 11.0, dur: 1.3, kind: "kine",
      build: buildRollerUp, target: [0, D.yUp, 0], off: [-0.8, 2.2, 0.9] });
    def({ id: "treadle", name: "TREADLE · 踏板曲柄", sub: "r 0.10 · 行程 0.20m", phase: 3, at: 16.4, dur: 1.2, kind: "screw",
      build: buildTreadle, target: [0, D.yLow, D.treadZ], start: [0.5, 2.6, 1.0], mid: [0.25, 1.4, 0.7] });
    def({ id: "feed", name: "FEED BOARD · 给棉板", sub: "斜托导槽 · 棉团入隙", phase: 3, at: 17.3, dur: 1.2,
      build: buildFeedBoard, target: [0, 0, 0], start: [0.6, 3.4, 0.8], mid: [0.3, 1.8, 0.4] });

    def({ id: "cotton1", name: "COTTON · 棉团 1", sub: "籽棉 · 入隙受牵", phase: 4, at: 22.4, dur: 1.1, kind: "kine",
      build: function () { return buildCotton(1); }, target: [0, D.cottonY, D.feedZ], off: [0.5, 1.6, 0.8] });
    def({ id: "cotton2", name: "COTTON · 棉团 2", sub: "候轧 · 排队", phase: 4, at: 23.2, dur: 1.1, kind: "kine",
      build: function () { return buildCotton(2); }, target: [0, D.cottonY, D.feedZ + 0.26], off: [0.7, 1.8, 0.9] });
    def({ id: "lint", name: "LINT · 皮棉", sub: "过隙棉条 · 牵出", phase: 5, at: 27.6, dur: 1.1,
      build: buildLint, target: [0, 0, 0], start: [-0.4, 3.0, -0.6], mid: [-0.2, 1.5, -0.3] });
    def({ id: "seeds", name: "SEEDS · 棉籽", sub: "轧落籽 ×6", phase: 5, at: 28.4, dur: 1.0,
      build: buildSeeds, target: [0, 0, 0], start: [0.3, 2.8, 0.6], mid: [0.15, 1.4, 0.3] });
  };

  /* —— 运动学分发 ——
     下辊 ψ,上辊 −ψ(外啮合反向);踏板 ψ;棉团受牵压缩;棉籽回落;皮棉伸长。
     errPos = 上辊齿轮缘点 vs 解析(−ψ 相位),验证外啮合反向(应≈0)。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var psi = st.psi || 0;
    var run = st.omega > 0.05;

    var rl = MECH.Parts.entry("rollerLow");
    if (rl && rl.shown) rl.group.rotation.z = psi;
    var ru = MECH.Parts.entry("rollerUp");
    if (ru && ru.shown) ru.group.rotation.z = -psi;
    var td = MECH.Parts.entry("treadle");
    if (td && td.shown) td.group.rotation.z = psi;

    /* 外啮合端到端:上辊齿轮缘点(半径 gearR−0.02,随 −ψ 转)vs 解析 */
    st.errPos = 0;
    if (ru && ru.sealed) {
      ru.group.updateWorldMatrix(true, false);
      _wp.set(D.gearR - 0.02, 0, D.gearZ).applyMatrix4(ru.group.matrixWorld);
      var ax = Math.cos(-psi) * (D.gearR - 0.02);
      var ay = D.yUp + Math.sin(-psi) * (D.gearR - 0.02);
      st.errPos = Math.sqrt((_wp.x - ax) * (_wp.x - ax) + (_wp.y - ay) * (_wp.y - ay));
    }

    /* 棉团受牵:轧棉时向辊隙压缩 */
    var c1 = MECH.Parts.entry("cotton1");
    if (c1 && c1.sealed) {
      var prog = st.drawProg != null ? st.drawProg : 0;
      c1.group.position.set(0, D.cottonY, D.feedZ - 0.10 * prog);
      c1.group.scale.setScalar(1 - 0.45 * prog);
    }

    /* 棉籽回落(轧棉段依次现身下落) */
    var sd = MECH.Parts.entry("seeds");
    if (sd && sd.sealed && sd.group.userData.seeds) {
      sd.group.userData.seeds.forEach(function (s, i) {
        var t = (st.drawProg != null ? st.drawProg : 0) * D.seedN - i;
        if (t > 0 && run) {
          s.visible = true;
          s.position.y = Math.max(0.055, 0.50 - t * 0.42);
        }
      });
    }

    /* 皮棉条伸长 */
    var li = MECH.Parts.entry("lint");
    if (li && li.sealed && li.group.userData.lint) {
      li.group.userData.lint.scale.z = Math.max(0.01, (st.drawProg || 0) * 3.4);
    }
  };
})(window.MECH = window.MECH || {});
