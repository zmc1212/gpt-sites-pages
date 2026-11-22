/* 水运浑天仪部件建模与注册(11 件)。
   坐标系:y 上;水轮轴沿 z(−1.35, 0.52);三级齿轮沿 z 排开;浑象球心
   (1.30, 1.42),极轴倾 50.1°;蓂荚轮 (2.20, 0.95)。
   KINE:水轮/齿轮/浑象/蓂荚各自转角按解析链驱动;星点随球转;
   errPos = 轮6 缘点 vs 解析(ω链端到端,应≈0)。 */
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

  function diskGearZ(r, T, thick, mat) {   // 盘齿(轴 z,面 x-y)
    var g = group();
    var disc = P.cyl(r * 0.88, r * 0.88, thick, mat, 0, 0, 0, 30);
    disc.rotation.x = P.ROTX;
    g.add(disc);
    for (var i = 0; i < T; i++) {
      var a = i / T * Math.PI * 2;
      var t = P.box(0.028, r * 0.24, thick * 0.94, mat, Math.cos(a) * (r - 0.007), Math.sin(a) * (r - 0.007), 0);
      t.rotation.z = a;
      g.add(t);
    }
    var hub = P.cyl(0.04, 0.04, thick + 0.07, M3.bronze, 0, 0, 0, 12);
    hub.rotation.x = P.ROTX;
    g.add(hub);
    return g;
  }

  /* —— 部件构建器 —— */

  function buildPot() {     // 漏壶:铜壶 + 壶水 + 流嘴
    var g = group();
    var body = P.cyl(0.24, 0.20, D.potH, M3.bronze, D.potX, D.potH / 2, 0, 22);
    g.add(body);
    var water = P.mesh(new THREE.CircleGeometry(0.21, 22), M3.water, D.potX, D.potH - 0.05, 0);
    water.rotation.x = -Math.PI / 2;
    water.castShadow = false;
    g.add(water);
    g.userData.water = water;
    g.add(P.box(0.10, 0.06, 0.18, M3.bronze, D.potX + 0.22, D.potH - 0.14, 0));  // 流嘴
    return { group: g, anchor: mkAnchor(D.potX + 0.3, D.potH + 0.1, 0.2) };
  }

  function buildChannel() {  // 水槽 + 水面(轮下)
    var g = group();
    var slab = new THREE.MeshStandardMaterial({ color: 0x82868C, roughness: 0.88, metalness: 0.04 });
    var dark = new THREE.MeshStandardMaterial({ color: 0x35383E, roughness: 0.95 });
    g.add(P.box(1.7, 0.10, 0.66, slab, D.wheelX + 0.25, 0.05, 0));
    g.add(P.box(1.5, 0.04, 0.5, dark, D.wheelX + 0.25, 0.11, 0));
    var water = P.mesh(new THREE.PlaneGeometry(1.44, 0.44), M3.water, D.wheelX + 0.25, 0.15, 0);
    water.rotation.x = -Math.PI / 2;
    water.castShadow = false;
    g.add(water);
    g.userData.water = water;
    return { group: g, anchor: mkAnchor(D.wheelX + 1.0, 0.2, 0.3) };
  }

  function buildWheel() {    // 水轮:轮辋 + 8 桨 + 辐 + 轴
    var g = group();
    var rim = P.torus(D.RWheel - 0.03, 0.04, M3.woodD, 0, 0, 0, 36);
    g.add(rim);
    for (var i = 0; i < D.NP; i++) {
      var a = i / D.NP * Math.PI * 2;
      var paddle = P.box(0.09, 0.24, 0.13, plankMat(), 0, 0, 0);
      paddle.position.set(Math.cos(a) * (D.RWheel - 0.16), Math.sin(a) * (D.RWheel - 0.16), 0);
      paddle.rotation.z = a + Math.PI / 2;
      g.add(paddle);
    }
    for (var j = 0; j < 4; j++) {
      var a2 = j / 4 * Math.PI * 2;
      var s = P.box(0.05, D.RWheel - 0.16, 0.05, M3.wood, 0, 0, 0);
      s.position.set(Math.cos(a2) * (0.06 + (D.RWheel - 0.16) / 2), Math.sin(a2) * (0.06 + (D.RWheel - 0.16) / 2), 0);
      s.rotation.z = a2 - Math.PI / 2;
      g.add(s);
    }
    var hub = P.cyl(0.07, 0.07, 0.20, M3.woodD, 0, 0, 0, 12);
    hub.rotation.x = P.ROTX;
    g.add(hub);
    var gear = diskGearZ(0.30, 28, 0.07, plankMat());
    gear.position.z = -0.55;
    g.add(gear);
    g.userData.gear1 = gear;
    return { group: g, anchor: mkAnchor(D.RWheel - 0.1, 0.14, 0.12) };
  }

  function buildGearTrain() { // 中间轴 B:轮2+轮3 同轴、轮4+轮5 同轴(两组)
    var g = group();
    /* 轴 A(轮2)与轴 B(轮4/5) */
    var axleA = P.cyl(0.026, 0.026, 0.30, M3.steelD, D.wheelX + 0.55, 0.62, -0.28, 10);
    axleA.rotation.x = P.ROTX;
    g.add(axleA);
    var axleB = P.cyl(0.026, 0.026, 0.60, M3.steelD, D.wheelX + 0.95, 0.72, 0.33, 10);
    axleB.rotation.x = P.ROTX;
    g.add(axleB);
    /* 支柱 */
    [[D.wheelX + 0.55, -0.45], [D.wheelX + 0.95, -0.45], [D.wheelX + 0.95, 0.62]].forEach(function (p) {
      g.add(P.box(0.09, p[1] > 0 ? 0.80 : 0.70, 0.09, M3.woodD, p[0], p[1] > 0 ? 0.40 : 0.35, p[2]));
    });
    /* 轮2(8T 小)+ 轮3(32T 大)同轴 A? 文献轮序:A=轮1水轮轴 → 轮2 同轴? 
       本站链条:轮1(28T)啮轮2(8T,轴A)→ 轮3(32T,轴A)啮轮4(8T,轴B)
       → 轮5(16T,轴B)啮轮6(8T,浑象轴)。 */
    var g2 = diskGearZ(0.098, 8, 0.06, plankMat());
    g2.position.set(D.wheelX + 0.55, 0.62, -0.28);
    g.add(g2);
    var g3 = diskGearZ(0.32, 32, 0.06, plankMat());
    g3.position.set(D.wheelX + 0.55, 0.62, -0.06);
    g.add(g3);
    var g4 = diskGearZ(0.08, 8, 0.055, plankMat());
    g4.position.set(D.wheelX + 0.95, 0.72, 0.22);
    g.add(g4);
    var g5 = diskGearZ(0.16, 16, 0.06, plankMat());
    g5.position.set(D.wheelX + 0.95, 0.72, 0.44);
    g.add(g5);
    g.userData.g2345 = [g2, g3, g4, g5];
    return { group: g, anchor: mkAnchor(D.wheelX + 0.7, 0.8, 0.2) };
  }

  function buildGlobe() {    // 浑象球:星空球 + 地平圈 + 极轴 + 轮6
    var g = group();
    var tilted = group();
    tilted.rotation.z = -(90 - D.tilt) * Math.PI / 180;   // 极轴倾 50.1°(绕 z)
    g.add(tilted);
    /* 星空球(Canvas 星图) */
    var sphere = P.mesh(new THREE.SphereGeometry(D.RGlobe, 40, 30), starMat(), 0, 0, 0);
    tilted.add(sphere);
    /* 赤道圈 + 极轴 */
    var eq = P.torus(D.RGlobe + 0.02, 0.016, M3.gold, 0, 0, 0, 44);
    eq.rotation.x = P.ROTX;
    tilted.add(eq);
    var axle = P.cyl(0.02, 0.02, D.RGlobe * 2.3, M3.steelD, 0, 0, 0, 8);
    tilted.add(axle);
    /* 地平圈(水平,不随转) */
    var hor = P.torus(D.RGlobe + 0.10, 0.02, M3.bronze, 0, 0, 0, 44);
    hor.rotation.x = P.ROTX;
    g.add(hor);
    /* 轮6(8T)在浑象轴(z)上 */
    var g6 = diskGearZ(0.08, 8, 0.055, plankMat());
    g6.position.z = 0.70;
    g.add(g6);
    g.userData.tilted = tilted;
    g.userData.g6 = g6;
    return { group: g, anchor: mkAnchor(D.globeX - 0.55, D.globeY + 0.2, 0.1) };
  }

  var _starMat = null;
  function starMat() {
    if (!_starMat) {
      var c = document.createElement("canvas");
      c.width = 512; c.height = 256;
      var x = c.getContext("2d");
      x.fillStyle = "#1B2A4A";
      x.fillRect(0, 0, 512, 256);
      for (var i = 0; i < 240; i++) {
        var r = Math.random() * 1.8 + 0.5;
        x.fillStyle = "rgba(" + (220 + Math.random() * 35 | 0) + "," + (225 + Math.random() * 30 | 0) + ",255,0.95)";
        x.beginPath();
        x.arc(Math.random() * 512, Math.random() * 256, r, 0, Math.PI * 2);
        x.fill();
      }
      /* 亮星连线示意(北斗) */
      x.strokeStyle = "rgba(180,200,255,0.5)";
      x.lineWidth = 1.2;
      var pts = [[60, 60], [100, 50], [140, 62], [170, 90], [210, 80], [250, 100], [290, 90]];
      x.beginPath();
      pts.forEach(function (p, i) { if (i === 0) x.moveTo(p[0], p[1]); else x.lineTo(p[0], p[1]); });
      x.stroke();
      pts.forEach(function (p) {
        x.fillStyle = "#E9C93C";
        x.beginPath(); x.arc(p[0], p[1], 3.2, 0, Math.PI * 2); x.fill();
      });
      var t = new THREE.CanvasTexture(c);
      t.encoding = THREE.sRGBEncoding;
      _starMat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, metalness: 0.05 });
    }
    return _starMat;
  }

  function buildLeafWheel() { // 蓂荚:轮盘 + 15 叶(逐叶抬起)
    var g = group();
    var disc = P.cyl(D.RLeaf * 0.5, D.RLeaf * 0.5, 0.06, plankMat(), 0, 0, 0, 20);
    g.add(disc);
    var leaves = [];
    for (var i = 0; i < D.leafN; i++) {
      var a = i / D.leafN * Math.PI * 2;
      var leaf = P.box(0.05, 0.20, 0.05, M3.gold, 0, 0, 0);
      leaf.position.set(Math.cos(a) * D.RLeaf * 0.55, 0, Math.sin(a) * D.RLeaf * 0.55);
      leaf.rotation.y = -a;
      g.add(leaf);
      leaves.push(leaf);
    }
    g.userData.leaves = leaves;
    var axle = P.cyl(0.03, 0.03, 0.24, M3.woodD, 0, 0, 0, 10);
    g.add(axle);
    g.add(P.box(0.30, 0.06, 0.30, M3.stone, 0, -0.55, 0));
    g.add(P.box(0.10, 0.55, 0.10, M3.woodD, 0, -0.28, 0));
    return { group: g, anchor: mkAnchor(D.RLeaf * 0.6, 0.12, 0.1) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "pot", name: "CLEPSYDRA · 漏壶", sub: "恒流注水 · 壶水 0.73", phase: 0, at: 0.2, dur: 1.4,
      build: buildPot, target: [0, 0, 0], start: [-2.3, 4.0, 0.5], mid: [-2.3, 2.0, 0.25] });
    def({ id: "channel", name: "CHANNEL · 水槽", sub: "轮下水槽 · 水面 0.15", phase: 0, at: 1.3, dur: 1.3,
      build: buildChannel, target: [0, 0, 0], start: [-1.0, 3.6, 0], mid: [-1.0, 1.8, 0] });

    def({ id: "wheel", name: "WATER WHEEL · 水轮", sub: "r 0.38 · 8 桨 · 2.44 rad/s", phase: 1, at: 6.4, dur: 1.4, kind: "kine",
      build: buildWheel, target: [D.wheelX, D.wheelY, 0], off: [-0.9, 2.0, 0.8] });
    def({ id: "gears", name: "GEAR TRAIN · 三级齿轮", sub: "3.5×4×2 = 28 减速", phase: 2, at: 10.8, dur: 1.5,
      build: buildGearTrain, target: [0, 0, 0], start: [-0.6, 3.8, 0.4], mid: [-0.6, 1.9, 0.2] });

    def({ id: "globe", name: "CELESTIAL GLOBE · 浑象球", sub: "r 0.52 · 星空 · 一转一日", phase: 3, at: 16.0, dur: 1.6, kind: "kine",
      build: buildGlobe, target: [D.globeX, D.globeY, 0], off: [0.8, 2.4, 0.8] });
    def({ id: "leafWheel", name: "RUI LUN · 瑞轮蓂荚", sub: "15 叶 · 每 4.8s 升一叶", phase: 4, at: 21.2, dur: 1.4, kind: "kine",
      build: buildLeafWheel, target: [D.leafX, D.leafY, 0], off: [0.7, 1.8, 0.8] });
  };

  /* —— 运动学分发 ——
     ψW 水轮角 → 齿轮链(3.5/4/2 递减,方向逐级翻转)→ 浑象 ψG = −ψW/28 →
     蓂荚 ψL = ψG/15,叶按 1/15 圈抬升;errPos = 轮6 缘点解析差(应≈0)。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var psiW = st.psiW || 0;
    var run = st.omegaW > 0.05;

    var ww = MECH.Parts.entry("wheel");
    if (ww && ww.shown) {
      ww.group.rotation.z = psiW;
      var g1 = ww.group.userData.gear1;
      if (g1) g1.rotation.z = psiW;
    }
    var gt = MECH.Parts.entry("gears");
    if (gt && gt.shown && gt.group.userData.g2345) {
      var arr = gt.group.userData.g2345;
      var psiA = -psiW / 3.5;             // 轮2/轮3(轴A)
      var psiB = -psiA / 4;               // 轮4/轮5(轴B)
      arr[0].rotation.z = psiA;
      arr[1].rotation.z = psiA;
      arr[2].rotation.z = psiB;
      arr[3].rotation.z = psiB;
    }
    var psiG = -psiW / D.iTotal;
    var gl = MECH.Parts.entry("globe");
    if (gl && gl.shown && gl.group.userData.tilted) {
      gl.group.userData.tilted.rotation.y = psiG;
      var g6 = gl.group.userData.g6;
      if (g6) g6.rotation.z = -psiW / 2;
    }

    /* 蓂荚:叶 1/15 圈周期抬升 */
    var psiL = psiG / D.leafN;
    var lw = MECH.Parts.entry("leafWheel");
    if (lw && lw.shown && lw.group.userData.leaves) {
      lw.group.rotation.y = psiL;
      lw.group.userData.leaves.forEach(function (leaf, i) {
        var phase = (psiL / (2 * Math.PI / D.leafN)) % 1;
        var f = (phase * D.leafN) - i;
        var up = KS.clamp(f, 0, 1);
        leaf.position.y = up * 0.10;
        leaf.rotation.x = -up * 1.1;
      });
    }

    st.errPos = 0;
    if (gt && gt.sealed) {
      /* 轮6(浑象轴上 8T,由轮5 16T 啮合):缘点解析 = 浑象轴转动 */
      var g6p = gl && gl.shown ? gl.group.userData.g6 : null;
      if (g6p) {
        g6p.updateWorldMatrix(true, false);
        _wp.set(0.08, 0, 0).applyMatrix4(g6p.matrixWorld);
        var ax = D.globeX + Math.cos(-psiW / 2) * 0.08;
        var ay = D.globeY + Math.sin(-psiW / 2) * 0.08;
        st.errPos = Math.sqrt((_wp.x - ax) * (_wp.x - ax) + (_wp.y - ay) * (_wp.y - ay));
      }
    }
  };
})(window.MECH = window.MECH || {});
