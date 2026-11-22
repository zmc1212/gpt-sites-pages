/* 转轮排字盘部件建模与注册(6 件)。
   布局:操作者位原点(座凳),左右两立式轮盘(x=±1.30,轮面 z-y 平面,
   横轴沿 x 高 y1.00,轮盘 R1.05),横架上端轴承 + 下钻臼;
   轮面 8 扇 × 5 环字格(Canvas 程序化字贴);取字台(小案+印版格)置东南。
   kine:双轮只写 rotation.x(镜像同速);印版格填充经 userData.anim 由 tick 驱动。
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

  /* 字面贴图:8 扇 × 5 环格子,内嵌汉字(程序化) */
  var _faceTex = null;
  var CHARS = "天地元黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏闰余成岁律吕调阳云腾致雨露结为霜金生丽水玉出昆冈剑号巨阙珠称夜光果珍李柰菜重芥姜海咸河淡鳞潜羽翔龙师火帝鸟官人皇始制文字乃服衣裳推位让国有虞陶唐吊民伐罪周发殷汤坐朝问道垂拱平章爱育黎首臣伏戎羌遐迩一体率宾归王";
  function faceTex() {
    if (_faceTex) return _faceTex;
    var c = document.createElement("canvas");
    c.width = 512; c.height = 512;
    var x = c.getContext("2d");
    x.fillStyle = "#E7DCC2";
    x.fillRect(0, 0, 512, 512);
    for (var i = 0; i < 400; i++) {
      x.fillStyle = "rgba(120,96,60," + (0.04 + (i % 5) / 100).toFixed(3) + ")";
      x.fillRect((i * 97 + 13) % 512, (i * 149 + 41) % 512, 2, 2);
    }
    /* 8 扇分区线 */
    x.strokeStyle = "rgba(90,58,26,0.55)";
    x.lineWidth = 3;
    x.translate(256, 256);
    for (var s = 0; s < 8; s++) {
      x.beginPath(); x.moveTo(0, 0);
      x.lineTo(Math.cos(s / 8 * Math.PI * 2) * 250, Math.sin(s / 8 * Math.PI * 2) * 250);
      x.stroke();
    }
    for (var r = 1; r <= 5; r++) {
      x.beginPath(); x.arc(0, 0, r / 5 * 244, 0, Math.PI * 2); x.stroke();
    }
    /* 字格与字(每扇 5 环 × 7 列 ≈ 35 字/扇,盘面共 ~280 格) */
    x.fillStyle = "#3A2E1C";
    x.textAlign = "center"; x.textBaseline = "middle";
    var idx = 0;
    for (var sec = 0; sec < 8; sec++) {
      for (var ring = 1; ring <= 5; ring++) {
        var rMid = (ring - 0.5) / 5 * 244;
        var arc = rMid * (Math.PI * 2 / 8);
        var n = Math.min(7, Math.max(3, Math.floor(arc / 26)));
        for (var cc = 0; cc < n; cc++) {
          var ang = sec / 8 * Math.PI * 2 + (cc + 0.5) / n * (Math.PI * 2 / 8);
          var px = Math.cos(ang) * rMid, py = Math.sin(ang) * rMid;
          x.font = "700 " + Math.min(24, 10 + rMid / 14) + "px serif";
          x.fillText(CHARS[idx % CHARS.length], px, py);
          idx++;
        }
      }
    }
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    _faceTex = t;
    return t;
  }

  /* 轮盘(立式,轮面朝 ±x):框轮辐 + 双面字贴;原点=轴心,旋转写 rotation.x */
  function buildWheel(side) {
    var g = group();
    /* 轮框:外环 + 8 辐 */
    var rim = P.torus(D.Rwheel, 0.045, M3.woodD, 0, 0, 0, 48);
    g.add(rim);
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * Math.PI * 2;
      var spoke = P.box(0.07, D.Rwheel * 2 - 0.1, 0.06, M3.woodD, 0, 0, 0);
      spoke.position.set(0, Math.sin(a) * (D.Rwheel - 0.05), Math.cos(a) * (D.Rwheel - 0.05));
      spoke.rotation.x = a;
      g.add(spoke);
    }
    /* 双面字贴(±x 面) */
    var tex = faceTex();
    [-1, 1].forEach(function (sg) {
      var face = P.mesh(new THREE.CircleGeometry(D.Rwheel - 0.03, 48),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide }),
        sg * 0.055, 0, 0);
      face.rotation.y = sg * Math.PI / 2;
      face.castShadow = false;
      g.add(face);
    });
    /* 轮毂 */
    g.add(P.cyl(0.10, 0.10, 0.16, M3.bronze, 0, 0, 0, 14));
    return { group: g, anchor: mkAnchor(side * 0.2, D.Rwheel * 0.7, 0) };
  }

  /* 横架 + 双轴承 + 钻臼 + 底座(两轮共用框架) */
  function buildFrame() {
    var g = group();
    [-1, 1].forEach(function (sg) {
      var xw = sg * D.wheelX;
      g.add(P.box(0.16, D.axleY + 0.18, 0.16, M3.woodD, xw, (D.axleY + 0.18) / 2, -0.32));
      g.add(P.box(0.16, D.axleY + 0.18, 0.16, M3.woodD, xw, (D.axleY + 0.18) / 2, 0.32));
      g.add(P.box(0.34, 0.10, 0.82, M3.stone, xw, 0.05, 0));
      g.add(P.cyl(0.055, 0.055, 0.14, M3.bronze, xw, D.axleY + 0.13, 0, 12));   // 上轴承
      g.add(P.cyl(0.09, 0.11, 0.10, M3.bronze, xw, 0.14, 0, 12));               // 钻臼
      g.add(P.box(0.10, 0.28, 0.10, M3.woodD, xw, 0.30, 0));                    // 臼柱
    });
    g.add(P.box(D.wheelX * 2 + 0.7, 0.12, 0.5, M3.woodD, 0, D.axleY + 0.30, -0.32));  // 上横架
    g.add(P.box(0.5, 0.34, 0.10, M3.woodD, 0, 0.17, 0.32));                            // 中架(取字位背板)
    return { group: g, anchor: mkAnchor(0, D.axleY + 0.45, -0.3) };
  }

  /* 座凳(操作者) */
  function buildStool() {
    var g = group();
    g.add(P.box(0.36, 0.06, 0.36, M3.woodD, 0, 0.42, 0.42));
    [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]].forEach(function (p) {
      g.add(P.box(0.06, 0.39, 0.06, M3.wood, p[0], 0.195, 0.42 + p[1]));
    });
    return { group: g, anchor: mkAnchor(0, 0.58, 0.42) };
  }

  /* 取字台 + 印版格(tick 经 userData.anim.cells 填充) */
  function buildPlate() {
    var g = group();
    var tx = 0.62, tz = 0.85;
    g.add(P.box(0.52, 0.06, 0.38, M3.woodD, tx, 0.52, tz));
    [[-0.22, -0.15], [0.22, -0.15], [-0.22, 0.15], [0.22, 0.15]].forEach(function (p) {
      g.add(P.box(0.06, 0.49, 0.06, M3.wood, tx + p[0], 0.245, tz + p[1]));
    });
    /* 印版:6×8 格,排一字亮一格 */
    var cells = [];
    var matEmpty = new THREE.MeshStandardMaterial({ color: 0x6B5A3E, roughness: 0.85 });
    var matFill = new THREE.MeshStandardMaterial({ color: 0xE7DCC2, roughness: 0.8 });
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 6; c++) {
        var m = P.box(0.045, 0.02, 0.045, matEmpty.clone(),
          tx - 0.20 + c * 0.080, 0.565, tz - 0.14 + r * 0.040);
        m.castShadow = false;
        g.add(m);
        cells.push(m);
      }
    }
    g.userData.anim = { cells: cells, matFill: matFill };
    return { group: g, anchor: mkAnchor(tx, 0.70, tz) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "frame", name: "FRAME · 横架·钻臼", sub: "上横架下钻臼 · 立转轮盘", phase: 0, at: 0.2, dur: 1.2,
      build: buildFrame, target: [0, 0, 0], start: [0, 3.6, -1.2], mid: [0, 2.0, -0.6], anchor: [0, 1.5, -0.3] });
    def({ id: "stool", name: "STOOL · 座凳", sub: "一人中坐 · 左右推转", phase: 0, at: 1.0, dur: 1.0,
      build: buildStool, target: [0, 0, 0], start: [0.5, 2.4, 1.8], mid: [0.2, 1.4, 1.0], anchor: [0, 0.6, 0.42] });

    def({ id: "wheelL", name: "WHEEL L · 监韵轮", sub: "径七尺 · 8扇280格(左)", phase: 1, at: 5.3, dur: 1.4, kind: "kine",
      build: function () { return buildWheel(-1); }, target: [-D.wheelX, D.axleY, 0], off: [-1.0, 2.4, 1.2] });
    def({ id: "wheelR", name: "WHEEL R · 杂字轮", sub: "径七尺 · 双面字贴(右)", phase: 1, at: 6.6, dur: 1.4, kind: "kine",
      build: function () { return buildWheel(1); }, target: [D.wheelX, D.axleY, 0], off: [1.0, 2.4, 1.2] });

    def({ id: "plate", name: "PLATE · 取字台·印版", sub: "排版 48 字 · 以字就人", phase: 2, at: 10.3, dur: 1.3,
      build: buildPlate, target: [0, 0, 0], start: [1.4, 2.8, 1.8], mid: [1.0, 1.6, 1.2], anchor: [0, 0.85, 0.85] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("wheelL");
    if (e && e.shown) e.group.rotation.x = st.thetaL;
    e = MECH.Parts.entry("wheelR");
    if (e && e.shown) e.group.rotation.x = st.thetaR;
  };
})(window.MECH = window.MECH || {});
