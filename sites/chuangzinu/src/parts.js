/* 三弓床弩部件建模与注册(8 件)。
   坐标系:y 上,x 射向(+x);弩床沿 x,床面 0.52;前双弓 x −0.55(弓臂
   双向弯),反弓 x +0.45;弦钩随张弦 −draw;绞车在床尾。
   KINE:弓臂随张弦弯曲(rotation),弦 Line 每帧重建(弓梢→弦钩),
   箭击发弹道(匀速 + 微重力),绞车摇柄 rotation.x = 收绳/鼓半径。
   errPos = 弦钩世界 x vs 解析(应≈0)。 */
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
      x.fillStyle = "#8A5A2B";
      x.fillRect(0, 0, 128, 128);
      for (var i = 0; i < 10; i++) {
        var y = i * 13 + 4;
        x.fillStyle = (i % 2) ? "#7A4E24" : "#9A6B33";
        x.fillRect(0, y, 128, 11);
        x.strokeStyle = "rgba(50,30,10,0.6)";
        x.lineWidth = 1.4;
        x.strokeRect(0, y, 128, 11);
      }
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 1);
      t.encoding = THREE.sRGBEncoding;
      _plank = new THREE.MeshStandardMaterial({ map: t, roughness: 0.84, metalness: 0.04 });
    }
    return _plank;
  }

  function buildBed() {    // 弩床:重木床 + 轮 + 砧柱
    var g = group();
    g.add(P.box(2.30, 0.14, 0.70, plankMat(), 0.10, D.bedY - 0.07, 0));
    [[-0.9, 0.26], [0.9, 0.26], [-0.9, -0.26], [0.9, -0.26]].forEach(function (p) {
      g.add(P.box(0.12, 0.28, 0.12, M3.woodD, p[0], 0.14, p[1]));
      g.add(P.cyl(0.14, 0.14, 0.06, plankMat(), p[0], 0.07, p[1], 14).rotation ? (function () {
        var w = P.cyl(0.14, 0.14, 0.06, plankMat(), p[0], 0.14, p[1], 14);
        w.rotation.x = P.ROTX;
        return w;
      })() : null);
    });
    /* 砧柱(前弓抵座 + 反弓抵座) */
    g.add(P.box(0.14, 0.30, 0.44, M3.woodD, D.bowFrontX + 0.10, D.bedY + 0.15, 0));
    g.add(P.box(0.14, 0.30, 0.44, M3.woodD, D.bowBackX - 0.10, D.bedY + 0.15, 0));
    return { group: g, anchor: mkAnchor(0.6, D.bedY + 0.1, 0.4) };
  }

  function buildFrontBows() { // 前双弓:两张弓臂(x −0.55,上下叠)+ 弓梢
    var g = group();
    [1, -1].forEach(function (s) {
      var bow = P.box(0.10, 0.065, 0.70, plankMat(), D.bowFrontX, D.bedY + 0.30 + s * 0.12, 0);
      g.add(bow);
      var tipL = P.sph(0.028, M3.iron, D.bowFrontX - 0.03, D.bedY + 0.30 + s * 0.12 + s * 0.34, -0.33);
      g.add(tipL);
      var tipR = P.sph(0.028, M3.iron, D.bowFrontX - 0.03, D.bedY + 0.30 + s * 0.12 + s * 0.34, 0.33);
      g.add(tipR);
    });
    return { group: g, anchor: mkAnchor(D.bowFrontX, D.bedY + 0.4, 0.35) };
  }

  function buildBackBow() {  // 反弓(反向张,顶弦助力)
    var g = group();
    var bow = P.box(0.10, 0.075, 0.78, plankMat(), D.bowBackX, D.bedY + 0.42, 0);
    g.add(bow);
    g.add(P.sph(0.03, M3.iron, D.bowBackX + 0.03, D.bedY + 0.42 + 0.37, -0.36));
    g.add(P.sph(0.03, M3.iron, D.bowBackX + 0.03, D.bedY + 0.42 + 0.37, 0.36));
    return { group: g, anchor: mkAnchor(D.bowBackX, D.bedY + 0.5, 0.35) };
  }

  function buildString() {   // 弦 + 大牙:三弓梢 → 弦钩(Line 每帧重建)+ 牙块
    var g = group();
    var lines = [];
    /* 六条弦线:前双弓 4 梢 + 反弓 2 梢 → 弦钩 */
    var tips = [
      [D.bowFrontX - 0.03, D.bedY + 0.30 + 0.12 + 0.34, -0.33],
      [D.bowFrontX - 0.03, D.bedY + 0.30 + 0.12 + 0.34, 0.33],
      [D.bowFrontX - 0.03, D.bedY + 0.30 - 0.12 + 0.34, -0.33],
      [D.bowFrontX - 0.03, D.bedY + 0.30 - 0.12 + 0.34, 0.33],
      [D.bowBackX + 0.03, D.bedY + 0.42 + 0.37, -0.36],
      [D.bowBackX + 0.03, D.bedY + 0.42 + 0.37, 0.36]
    ];
    tips.forEach(function (t) {
      var geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(t[0], t[1], t[2]),
        new THREE.Vector3(0, D.bedY + 0.30, 0)
      ]);
      var line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xD8C9A8 }));
      g.add(line);
      lines.push(line);
    });
    /* 大牙(锁弦块) */
    var catchBlk = P.box(0.10, 0.12, 0.14, M3.iron, D.catchX0, D.bedY + 0.30, 0);
    g.add(catchBlk);
    g.userData.lines = lines;
    g.userData.tips = tips;
    g.userData.catchBlk = catchBlk;
    return { group: g, anchor: mkAnchor(-0.2, D.bedY + 0.38, 0.1) };
  }

  function buildBolt() {    // 一枪三剑箭:长杆 + 铁镞 + 三剑羽(kine 弹道)
    var g = group();
    var shaft = P.cyl(0.032, 0.032, D.boltL, M3.woodD, 0, 0, 0, 10);
    shaft.rotation.z = P.ROTZ;
    g.add(shaft);
    var head = P.mesh(new THREE.ConeGeometry(0.055, 0.18, 8), M3.iron, D.boltL / 2 + 0.09, 0, 0);
    head.rotation.z = -Math.PI / 2;
    g.add(head);
    [1, -1].forEach(function (s) {
      var fin = P.box(0.10, 0.008, 0.05, M3.iron, -D.boltL / 2 + 0.10, 0, s * 0.05);
      fin.rotation.y = s * 0.5;
      g.add(fin);
    });
    return { group: g, anchor: mkAnchor(D.boltL / 2, 0.12, 0.1) };
  }

  function buildWinch() {   // 绞车:鼓 + 双摇柄 + 绳(Line 到弦钩)
    var g = group();
    g.add(P.box(0.14, 0.12, 0.12, M3.woodD, 1.10, D.bedY + 0.10, 0));
    var drum = P.cyl(D.rDrum, D.rDrum, 0.22, plankMat(), 1.10, D.bedY + 0.34, 0, 12);
    drum.rotation.x = P.ROTX;
    g.add(drum);
    g.userData.drum = drum;
    [1, -1].forEach(function (s) {
      g.add(P.box(D.rCrank * 2, 0.05, 0.04, M3.woodD, 1.10 + D.rCrank, D.bedY + 0.34, s * 0.16));
      g.add(P.cyl(0.028, 0.028, 0.16, M3.woodD, 1.10 + D.rCrank * 2 - 0.02, D.bedY + 0.34, s * 0.16, 8));
    });
    var rope = P.mesh(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(1.10, D.bedY + 0.34, 0),
      new THREE.Vector3(D.catchX0, D.bedY + 0.30, 0)
    ]), new THREE.LineBasicMaterial({ color: 0xA98B5E }));
    g.add(rope);
    g.userData.rope = rope;
    return { group: g, anchor: mkAnchor(1.15, D.bedY + 0.45, 0.14) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "bed", name: "BED · 弩床", sub: "重木床 + 砧柱", phase: 0, at: 0.2, dur: 1.5,
      build: buildBed, target: [0, 0, 0], start: [0, 4.0, 0], mid: [0, 2.0, 0] });
    def({ id: "frontBows", name: "FRONT BOWS · 前双弓", sub: "正向叠张 ×2", phase: 0, at: 1.7, dur: 1.5,
      build: buildFrontBows, target: [0, 0, 0], start: [-0.5, 3.8, 0.4], mid: [-0.5, 1.9, 0.2] });
    def({ id: "backBow", name: "BACK BOW · 反弓", sub: "反向弓 · 顶弦助力", phase: 1, at: 7.4, dur: 1.4,
      build: buildBackBow, target: [0, 0, 0], start: [0.4, 3.6, 0.4], mid: [0.4, 1.8, 0.2] });
    def({ id: "string", name: "STRING · 弦与大牙", sub: "六梢聚钩 · 大牙锁弦", phase: 1, at: 8.5, dur: 1.4, kind: "kine",
      build: buildString, target: [0, 0, 0], off: [0.4, 1.5, 0.7] });

    def({ id: "bolt", name: "BOLT · 一枪三剑箭", sub: "m 1.5kg · v 59 m/s", phase: 2, at: 13.6, dur: 1.4, kind: "kine",
      build: buildBolt, target: [0.15, D.bedY + 0.30, 0], off: [0.4, 1.3, 0.8] });
    def({ id: "winch", name: "WINCH · 绞车", sub: "MA 3.33 · 摇柄双把", phase: 3, at: 18.4, dur: 1.4, kind: "kine",
      build: buildWinch, target: [0, 0, 0], off: [0.4, 1.3, 0.7] });
  };

  /* —— 运动学分发 ——
     draw ∈ [0,0.9]:弦钩 x = catchX0 − draw;弓臂随张弦微弯;
     击发:弦钩弹回(0.12s),箭弹道 v0·t + ½gt²(沿 +x);
     绞车摇柄 rotation.x = draw/r鼓;
     errPos = 弦钩世界 x vs 解析(应≈0)。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var draw = st.draw != null ? st.draw : 0;
    var fired = st.fired || false;
    var fireT = st.fireT || 0;
    var nockX = KS.nockX(draw);

    /* 弦钩/牙块 */
    var sg = MECH.Parts.entry("string");
    if (sg && sg.shown && sg.group.userData.lines) {
      var hooksX = nockX;
      sg.group.userData.lines.forEach(function (line, i) {
        var tip = sg.group.userData.tips[i];
        var pos = line.geometry.attributes.position;
        pos.setXYZ(1, hooksX, D.bedY + 0.30, 0);
        pos.needsUpdate = true;
      });
      var blk = sg.group.userData.catchBlk;
      if (blk) blk.position.x = hooksX;
    }

    /* 弓臂微弯(张弦时梢内收) */
    var fb = MECH.Parts.entry("frontBows");
    if (fb && fb.shown) fb.group.rotation.z = draw / D.drawMax * 0.02;
    var bb = MECH.Parts.entry("backBow");
    if (bb && bb.shown) bb.group.rotation.z = -draw / D.drawMax * 0.025;

    /* 箭:待发于弦钩;击发后弹道 */
    var bt = MECH.Parts.entry("bolt");
    if (bt && bt.sealed) {
      if (fired) {
        var t = fireT;
        bt.group.position.set(nockX + D.v0 * t, D.bedY + 0.30 - 0.5 * D.g * t * t * 0.12, 0);
        bt.group.rotation.z = -0.5 * D.g * t * 0.12 / D.v0;
      } else {
        bt.group.position.set(nockX + D.boltL / 2 - 0.05, D.bedY + 0.30, 0);
        bt.group.rotation.z = 0;
      }
    }

    st.errPos = 0;
    if (sg && sg.sealed) {
      sg.group.updateWorldMatrix(true, false);
      _wp.set(nockX, D.bedY + 0.30, 0).applyMatrix4(sg.group.matrixWorld);
      st.errPos = Math.abs(_wp.x - nockX);
    }

    /* 绞车摇柄 */
    var wn = MECH.Parts.entry("winch");
    if (wn && wn.shown && wn.group.userData.drum) {
      var turns = draw / (2 * Math.PI * D.rDrum);
      wn.group.userData.drum.rotation.y = -turns * 2 * Math.PI;
      wn.group.userData.rope && (function () {
        var pos = wn.group.userData.rope.geometry.attributes.position;
        pos.setXYZ(1, nockX, D.bedY + 0.30, 0);
        pos.needsUpdate = true;
      })();
    }
  };
})(window.MECH = window.MECH || {});
