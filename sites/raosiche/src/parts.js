/* 缫丝车部件建模与注册(11 件)。
   坐标系:y 上;框轴沿 z,框心 (1.10, 0.85, 0.235);灶锅在西,移丝钩居中。
   KINE:框/踏板 rotation.z = ψ(同轴直驱);钩局部 z = z0 + A·sinψ;
   丝线 Line 几何每帧更新(茧→钩→框缘动点)。全部几何在地面之上。 */
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

  /* —— 部件构建器 —— */

  function buildStove() {    // 灶:砖灶身 + 锅 + 锅水 + 灶口
    var g = group();
    var brick = new THREE.MeshStandardMaterial({ color: 0x7A6A5A, roughness: 0.92, metalness: 0.03 });
    g.add(P.box(0.72, D.stoveTop, 0.66, brick, D.stoveX, D.stoveTop / 2, 0));
    g.add(P.box(0.50, 0.16, 0.10, brick, D.stoveX, D.stoveTop * 0.45, 0.36));   // 灶口沿
    g.add(P.box(0.34, 0.10, 0.06, new THREE.MeshStandardMaterial({ color: 0x1A1C20, roughness: 0.9 }), D.stoveX, 0.10, 0.34));
    var basin = P.cyl(0.30, 0.24, 0.16, M3.iron, D.stoveX, D.stoveTop + 0.08, 0, 24);
    g.add(basin);
    var water = P.mesh(new THREE.CircleGeometry(0.27, 24), M3.water, D.stoveX, D.basinWater, 0);
    water.rotation.x = -Math.PI / 2;
    water.castShadow = false;
    g.add(water);
    g.userData.water = water;
    return { group: g, anchor: mkAnchor(D.stoveX + 0.4, D.stoveTop + 0.1, 0.3) };
  }

  function buildCocoons() {  // 茧:6 颗浮丝茧(半浸)
    var g = group();
    var coco = new THREE.MeshStandardMaterial({ color: 0xE8DFC8, roughness: 0.6, metalness: 0.02 });
    var offs = [[-0.10, 0.10], [0.02, -0.12], [0.10, 0.08], [-0.06, -0.06], [0.16, -0.02], [-0.16, 0.02]];
    offs.forEach(function (o, i) {
      var s = P.sph(0.05, coco, D.cocoX + o[0], D.cocoY - 0.01 + (i % 2) * 0.008, o[1]);
      s.scale.set(1, 0.82, 1.25);
      g.add(s);
    });
    return { group: g, anchor: mkAnchor(D.cocoX + 0.2, D.cocoY + 0.1, 0) };
  }

  function buildStand() {    // 机架:双柱 + 底座 + 轴承座
    var g = group();
    [[D.frameX - 0.02, 0.44], [D.frameX - 0.02, -0.30]].forEach(function (p) {
      g.add(P.box(0.13, D.frameY + 0.10, 0.13, M3.woodD, p[0], (D.frameY + 0.10) / 2, p[1]));
      g.add(P.box(0.30, 0.06, 0.30, M3.stone, p[0], 0.03, p[1]));
    });
    [[D.frameX - 0.02, 0.44], [D.frameX - 0.02, -0.30]].forEach(function (p) {
      g.add(P.box(0.17, 0.10, 0.20, M3.woodD, p[0], D.frameY + 0.06, p[1]));
    });
    g.add(P.box(0.10, 0.08, 0.86, M3.wood, D.frameX - 0.02, 0.55, 0.07));
    return { group: g, anchor: mkAnchor(D.frameX - 0.05, 1.0, 0.4) };
  }

  function buildAxle() {     // 框轴(沿 z)
    var g = group();
    var axle = P.cyl(0.032, 0.032, 1.0, M3.steelD, 0, 0, 0.06, 12);
    axle.rotation.x = P.ROTX;
    g.add(axle);
    return { group: g, anchor: mkAnchor(0, 0.06, -0.4) };
  }

  function buildReelFrame() { // 丝框:双 X 十字轮 + 连杆(绕轴转)
    var g = group();
    [D.frameZ0 + 0.03, D.frameZ1 - 0.03].forEach(function (z) {
      for (var i = 0; i < 4; i++) {
        var a = i / 4 * Math.PI * 2;
        var arm = P.box(0.05, D.rFrame * 2, 0.045, plankMat(), 0, 0, z);
        arm.rotation.z = a;
        g.add(arm);
        g.add(P.sph(0.032, M3.woodD, Math.cos(a + Math.PI / 4) * D.rFrame, Math.sin(a + Math.PI / 4) * D.rFrame, z));
      }
      var ring = P.torus(D.rFrame - 0.02, 0.014, M3.woodD, 0, 0, z, 30);
      g.add(ring);
    });
    return { group: g, anchor: mkAnchor(0.2, 0.28, 0.12) };
  }

  function buildGuideArm() { // 送丝竿:横竿(带滑槽)+ 支柱
    var g = group();
    g.add(P.box(0.06, 0.85, 0.06, M3.woodD, D.guideX - 0.28, D.guideY / 2 + 0.18, -0.30));
    g.add(P.box(0.70, 0.05, 0.05, M3.wood, D.guideX + 0.05, D.guideY, 0.235));
    g.add(P.box(0.46, 0.02, 0.02, M3.iron, D.guideX + 0.05, D.guideY - 0.045, 0.235));  // 滑槽铁条
    return { group: g, anchor: mkAnchor(D.guideX + 0.35, D.guideY + 0.1, 0.25) };
  }

  function buildHook() {     // 移丝钩:小铜环(沿竿滑移)
    var g = group();
    g.add(P.torus(0.035, 0.011, M3.bronze, 0, 0, 0, 14));
    g.add(P.cyl(0.014, 0.014, 0.10, M3.bronze, 0, -0.08, 0, 8));
    return { group: g, anchor: g };
  }

  function buildTreadle() {  // 踏板:曲柄臂 + 踏板(绕框轴)
    var g = group();
    var arm = P.box(0.055, D.rTread * 2, 0.045, M3.woodD, 0, -D.rTread, 0);
    g.add(arm);
    g.add(P.box(0.20, 0.035, 0.13, plankMat(), 0.02, -D.rTread - 0.03, 0));
    return { group: g, anchor: mkAnchor(0.05, -D.rTread - 0.06, 0.08) };
  }

  function buildThreads() {  // 丝线:茧→钩→框缘(几何每帧更新)
    var g = group();
    var lines = [];
    for (var i = 0; i < D.threadN; i++) {
      var geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()
      ]);
      var line = new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: 0xEDE4CC, transparent: true, opacity: 0.85
      }));
      g.add(line);
      lines.push(line);
    }
    g.userData.lines = lines;
    return { group: g, anchor: mkAnchor((D.stoveX + D.hookX) / 2, D.guideY + 0.08, 0.1) };
  }

  /* —— 注册(全部 world 部件为固定物;丝框/踏板/钩/丝线为 kine) —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "stove", name: "STOVE · 灶锅", sub: "砖灶 · 锅水 0.52 · 缫汤", phase: 0, at: 0.2, dur: 1.3,
      build: buildStove, target: [0, 0, 0], start: [-1.4, 4.0, 0.5], mid: [-1.4, 2.0, 0.25] });
    def({ id: "cocoons", name: "COCOONS · 茧", sub: "浮汤茧 ×6 · 抽丝", phase: 0, at: 1.4, dur: 1.0,
      build: buildCocoons, target: [0, 0, 0], start: [-1.2, 3.0, 0.4], mid: [-1.2, 1.4, 0.2] });
    def({ id: "stand", name: "STAND · 机架", sub: "双柱轴承 · 承框轴 0.85m", phase: 1, at: 5.8, dur: 1.3,
      build: buildStand, target: [0, 0, 0], start: [1.1, 4.2, 0.4], mid: [1.1, 2.0, 0.2] });
    def({ id: "axle", name: "AXLE · 框轴", sub: "轴沿 z · 长 1.0m", phase: 1, at: 6.8, dur: 1.1, kind: "screw",
      build: buildAxle, target: [D.frameX, D.frameY, D.frameZc], start: [D.frameX, 3.4, 0.8], mid: [D.frameX, 2.0, 0.4] });

    def({ id: "reelFrame", name: "REEL FRAME · 丝框", sub: "径 0.70m · 双十字轮", phase: 2, at: 11.6, dur: 1.5, kind: "kine",
      build: buildReelFrame, target: [D.frameX, D.frameY, D.frameZc], off: [0.6, 2.4, 1.0] });

    def({ id: "guideArm", name: "GUIDE · 送丝竿", sub: "滑槽横竿 · 过丝眼", phase: 3, at: 16.6, dur: 1.3,
      build: buildGuideArm, target: [0, 0, 0], start: [0.2, 4.0, 0.6], mid: [0.1, 2.0, 0.3] });
    def({ id: "hook", name: "GUIDE HOOK · 移丝钩", sub: "行程 0.28m · 往复 1:1", phase: 3, at: 17.6, dur: 1.1, kind: "kine",
      build: buildHook, target: [D.hookX, D.hookY, D.hookZ0], off: [0.4, 1.6, 0.8] });

    def({ id: "treadle", name: "TREADLE · 踏板曲柄", sub: "曲柄 r 0.11 · 行程 0.22", phase: 4, at: 21.8, dur: 1.3, kind: "screw",
      build: buildTreadle, target: [D.frameX, D.frameY, D.treadZ], start: [D.frameX + 0.6, 3.0, 1.0], mid: [D.frameX + 0.3, 1.6, 0.7] });

    def({ id: "threads", name: "THREADS · 丝线", sub: "茧→钩→框 · 三缕", phase: 5, at: 26.8, dur: 1.4,
      build: buildThreads, target: [0, 0, 0], start: [0, 3.0, 0.3], mid: [0, 1.5, 0.15] });
  };

  /* —— 运动学分发 ——
     ψ:框角;钩 z = z0 + A·sinψ;踏板 rotation.z = ψ;
     丝线几何:茧→钩→框缘动点(每帧更新);errPos = 钩世界位置解析差(应≈0)。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var psi = st.psi || 0;
    var rf = MECH.Parts.entry("reelFrame");
    if (rf && rf.shown) rf.group.rotation.z = psi;
    var td = MECH.Parts.entry("treadle");
    if (td && td.shown) td.group.rotation.z = psi;

    var hz = KS.hookZ(psi);
    var hk = MECH.Parts.entry("hook");
    if (hk && hk.sealed) hk.group.position.set(D.hookX, D.hookY, hz);

    st.errPos = 0;
    if (hk && hk.sealed) {
      hk.group.updateWorldMatrix(true, false);
      _wp.setFromMatrixPosition(hk.group.matrixWorld);
      var dx = _wp.x - D.hookX, dy = _wp.y - D.hookY, dz = _wp.z - hz;
      st.errPos = Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /* 丝线更新 */
    var th = MECH.Parts.entry("threads");
    if (th && th.sealed && th.group.userData.lines) {
      var wp = KS.windPoint(psi);
      th.group.userData.lines.forEach(function (line, i) {
        var cx = D.cocoX + (i - 1) * 0.07, cy = D.cocoY + 0.02;
        var pos = line.geometry.attributes.position;
        pos.setXYZ(0, cx, cy, 0.1 + (i - 1) * 0.05);
        pos.setXYZ(1, D.hookX, D.hookY - 0.05, hz);
        pos.setXYZ(2, wp.x, wp.y, wp.z);
        pos.needsUpdate = true;
      });
    }

    /* 锅水微动 */
    var sw = MECH.Parts.entry("stove");
    if (sw && sw.shown && sw.group.userData.water) {
      sw.group.userData.water.position.y = D.basinWater + 0.004 * Math.sin(st.time * 3.2);
    }
  };
})(window.MECH = window.MECH || {});
