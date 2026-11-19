/* 辘轳部件建模与注册(12 件)。
   坐标系:y 向上,井口中心 (0, 0, wellZ=2.8),卷筒横轴沿 x(高 2.55),
   桶悬挂点 H = 筒底切点 (0, axleY−rDrum, wellZ) 固定;
   绳/桶部件组原点 = H:outer.rotation.x = φ(摆向 −z),绳网格 scale.y = L,
   桶 bob 子组 position.y = −L(站点内部节点,引擎不接管),倾倒子组再前倾。
   井体全部位于全球地面之上(高井栏 0.18..1.30 / 池底 0.13 / 水面 0.45)。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;

  function group() { return new THREE.Group(); }

  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  /* —— 程序化贴图 —— */
  var _paving = null;
  function pavingTex() {
    if (_paving) return _paving;
    var c = document.createElement("canvas");
    c.width = c.height = 256;
    var x = c.getContext("2d");
    x.fillStyle = "#63666C";
    x.fillRect(0, 0, 256, 256);
    var row, col, w = 62, h = 30;
    for (row = 0; row < 9; row++) {
      var off = (row % 2) * 31;
      for (col = -1; col < 5; col++) {
        var px = col * w + off, py = row * h;
        var g = 100 + ((row * 7 + col * 13) % 22);
        x.fillStyle = "rgb(" + g + "," + (g + 3) + "," + (g + 8) + ")";
        x.fillRect(px + 2, py + 2, w - 4, h - 4);
        x.strokeStyle = "rgba(30,32,36,0.65)";
        x.lineWidth = 2;
        x.strokeRect(px + 2, py + 2, w - 4, h - 4);
      }
    }
    for (var i = 0; i < 420; i++) {
      x.fillStyle = "rgba(255,255,255," + (Math.random() * 0.05).toFixed(3) + ")";
      x.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    t.encoding = THREE.sRGBEncoding;
    _paving = t;
    return t;
  }

  var _plank = null;
  function plankTex() {   // 木桶板条(竖向板 + 两道铁箍由几何承担)
    if (_plank) return _plank;
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
    _plank = t;
    return t;
  }

  /* —— 部件构建器 —— */

  function buildPool() {    // 井池:池底 + 内衬 + 水面
    var g = group();
    var dark = new THREE.MeshStandardMaterial({ color: 0x35383E, roughness: 0.95, metalness: 0.04 });
    g.add(P.box(2.16, 0.06, 2.16, dark, 0, 0.10, 0));
    g.add(P.box(0.12, 0.14, 2.16, dark, 1.02, 0.15, 0));
    g.add(P.box(0.12, 0.14, 2.16, dark, -1.02, 0.15, 0));
    g.add(P.box(2.16, 0.14, 0.12, dark, 0, 0.15, 1.02));
    g.add(P.box(2.16, 0.14, 0.12, dark, 0, 0.15, -1.02));
    var water = P.mesh(new THREE.PlaneGeometry(2.16, 2.16), M3.water, 0, D.waterY, 0);
    water.rotation.x = -Math.PI / 2;
    water.castShadow = false;
    g.add(water);
    g.userData.water = water;
    return { group: g, anchor: mkAnchor(0, 0.6, 0.9) };
  }

  function buildPlatform() {  // 井台:石砌平台(中开井口方孔)+ 镶边
    var g = group();
    var pave = new THREE.MeshStandardMaterial({ map: pavingTex(), roughness: 0.9, metalness: 0.04 });
    var edge = new THREE.MeshStandardMaterial({ color: 0x53565C, roughness: 0.92 });
    var x0 = -D.platX, x1 = D.platX, z0 = D.platZ0, z1 = D.platZ1;
    var hz0 = D.wellZ - D.wellA, hz1 = D.wellZ + D.wellA;   // 井口 z 1.72..3.88
    g.add(P.box(x1 - x0, 0.18, hz0 - z0, pave, 0, 0, (z0 + hz0) / 2));            // 南条
    g.add(P.box(x1 - x0, 0.18, z1 - hz1, pave, 0, 0, (hz1 + z1) / 2));            // 北条
    g.add(P.box(D.platX - D.wellA, 0.18, hz1 - hz0, pave, (D.wellA + D.platX) / 2, 0, D.wellZ));  // 东条
    g.add(P.box(D.platX - D.wellA, 0.18, hz1 - hz0, pave, -(D.wellA + D.platX) / 2, 0, D.wellZ)); // 西条
    g.add(P.box(x1 - x0 + 0.16, 0.19, 0.16, edge, 0, 0.005, z0 - 0.06));
    g.add(P.box(x1 - x0 + 0.16, 0.19, 0.16, edge, 0, 0.005, z1 + 0.06));
    g.add(P.box(0.16, 0.19, z1 - z0 + 0.16, edge, x0 - 0.06, 0.005, D.wellZ));
    g.add(P.box(0.16, 0.19, z1 - z0 + 0.16, edge, x1 + 0.06, 0.005, D.wellZ));
    return { group: g, anchor: mkAnchor(1.0, 0.12, 1.6) };
  }

  function buildKerb() {    // 井栏:汉代陶井式高井栏(0.18..1.30)+ 收口沿
    var g = group();
    var slab = new THREE.MeshStandardMaterial({ color: 0x82868C, roughness: 0.88, metalness: 0.04 });
    g.add(P.box(2.48, 1.12, 0.16, slab, 0, 0.74, 1.16));
    g.add(P.box(2.48, 1.12, 0.16, slab, 0, 0.74, -1.16));
    g.add(P.box(0.16, 1.12, 2.16, slab, 1.16, 0.74, 0));
    g.add(P.box(0.16, 1.12, 2.16, slab, -1.16, 0.74, 0));
    g.add(P.box(2.56, 0.06, 0.20, slab, 0, 1.33, 1.18));
    g.add(P.box(2.56, 0.06, 0.20, slab, 0, 1.33, -1.18));
    g.add(P.box(0.20, 0.06, 2.24, slab, 1.18, 1.33, 0));
    g.add(P.box(0.20, 0.06, 2.24, slab, -1.18, 1.33, 0));
    return { group: g, anchor: mkAnchor(1.2, 0.6, 0) };
  }

  function buildBasin() {   // 瓦盆 + 木凳(摆出倾倒目标)
    var g = group();
    var woodL2 = new THREE.MeshStandardMaterial({ color: 0x7A5426, roughness: 0.85 });
    [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]].forEach(function (p2) {
      g.add(P.box(0.07, D.stoolH, 0.07, woodL2, p2[0], D.stoolH / 2, p2[1]));
    });
    g.add(P.cyl(0.30, 0.30, 0.05, woodL2, 0, D.stoolH + 0.025, 0, 20));
    var ceramic = new THREE.MeshStandardMaterial({ color: 0x8C4A38, roughness: 0.5, metalness: 0.05 });
    g.add(P.cyl(D.basinR, D.basinR - 0.10, D.basinRim - D.stoolH, ceramic, 0, (D.stoolH + D.basinRim) / 2, 0, 26));
    var rim = P.torus(D.basinR, 0.02, ceramic, 0, D.basinRim, 0, 26);
    rim.rotation.x = P.ROTX;
    g.add(rim);
    var water = P.mesh(new THREE.CircleGeometry(D.basinR - 0.05, 24), M3.water, 0, D.basinWater, 0);
    water.rotation.x = -Math.PI / 2;
    water.castShadow = false;
    g.add(water);
    g.userData.water = water;
    return { group: g, anchor: mkAnchor(0.38, D.basinRim + 0.05, 0) };
  }

  function buildFrame(side) {  // 立架:A 形双柱(柱脚 z ±0.42 收至轴心)+ 横撑 + 石础 + 轴承座
    var g = group();
    var legLen = Math.sqrt(0.42 * 0.42 + D.axleY * D.axleY);
    var tilt = Math.atan2(0.42, D.axleY);
    [1, -1].forEach(function (s) {
      var leg = P.cyl(0.055, 0.068, legLen, M3.woodD, 0, D.axleY / 2 + 0.012, s * 0.21, 10);
      leg.rotation.x = -s * tilt;
      g.add(leg);
      g.add(P.box(0.30, 0.10, 0.30, M3.stone, 0, 0.05, s * 0.44));
    });
    g.add(P.box(0.10, 0.09, 0.70, M3.wood, 0, 1.05, 0));       // 横撑
    g.add(P.box(0.16, 0.22, 0.24, M3.woodD, 0, D.axleY, 0));   // 轴承座
    g.add(P.box(0.18, 0.05, 0.26, M3.iron, 0, D.axleY + 0.13, 0));  // 铁箍
    return { group: g, anchor: mkAnchor(side * 0.1, 1.3, 0.44) };
  }

  function buildAxle() {    // 横轴:钢轴 + 铜套(轴沿 x)
    var g = group();
    var axle = P.cyl(0.035, 0.035, 3.52, M3.steelD, 0.05, 0, 0, 12);
    axle.rotation.z = P.ROTZ;
    g.add(axle);
    [-1.62, 1.62].forEach(function (x) {
      var sl = P.cyl(0.062, 0.062, 0.14, M3.bronze, x, 0, 0, 14);
      sl.rotation.z = P.ROTZ;
      g.add(sl);
    });
    return { group: g, anchor: mkAnchor(-1.0, 0.06, 0) };
  }

  function buildDrum() {    // 卷筒:木筒 + 绳槽沿 + 铁箍 + 缠绳带(缠绳带半径由 kine 缩放)
    var g = group();
    var body = P.cyl(D.rDrum, D.rDrum, D.drumW, M3.wood, 0, 0, 0, 24);
    body.rotation.z = P.ROTZ;
    g.add(body);
    [-0.19, 0.19].forEach(function (x) {
      var rim = P.cyl(D.rDrum + 0.045, D.rDrum + 0.045, 0.05, M3.woodD, x, 0, 0, 24);
      rim.rotation.z = P.ROTZ;
      g.add(rim);
    });
    var band = P.cyl(D.rDrum + 0.012, D.rDrum + 0.012, 0.06, M3.iron, 0, 0, 0, 20);
    band.rotation.z = P.ROTZ;
    g.add(band);
    /* 缠绳带:单位半径圆柱,x 向长 0.18,kine 按 (0.225+0.045·缠绳率) 缩放 x/z */
    var coil = P.cyl(1, 1, 0.18, M3.rope, 0, 0, 0, 20);
    coil.rotation.z = P.ROTZ;
    coil.scale.set(0.24, 1, 0.24);
    g.add(coil);
    g.userData.coil = coil;
    return { group: g, anchor: mkAnchor(0.14, 0.10, 0.14) };
  }

  function buildCrank() {   // 摇柄:曲柄臂 + 木柄(臂沿 +y,ψ=0 时竖直向上)
    var g = group();
    g.add(P.box(0.075, D.rCrank + 0.06, 0.05, M3.iron, 0, (D.rCrank + 0.06) / 2 - 0.03, 0));
    var handle = P.cyl(0.032, 0.036, D.handleW, M3.wood, D.handleW / 2 - 0.04, D.rCrank, 0, 12);
    handle.rotation.z = P.ROTZ;
    g.add(handle);
    g.add(P.sph(0.045, M3.iron, 0, D.rCrank, 0));
    return { group: g, anchor: mkAnchor(0, D.rCrank + 0.05, 0) };
  }

  function buildRope() {    // 吊绳:悬挂点 H,绳网格单位长(顶平移到 0),kine 缩放 y=L
    var g = group();
    var geo = new THREE.CylinderGeometry(D.ropeR, D.ropeR, 1, 8);
    geo.translate(0, -0.5, 0);
    var rope = new THREE.Mesh(geo, M3.rope);
    rope.castShadow = true;
    g.add(rope);
    var eye = P.torus(0.03, 0.011, M3.iron, 0, -0.005, 0, 12);
    eye.rotation.x = P.ROTX;
    g.add(eye);
    g.userData.rope = rope;
    return { group: g, anchor: mkAnchor(0, -0.3, 0) };
  }

  function buildBucket() {  // 水桶:bob(提梁顶) + 提梁 + 桶体 + 倾倒子组 + 桶内水
    var g = group();
    var bob = group();
    g.add(bob);
    var arc = P.mesh(new THREE.TorusGeometry(D.bailR, 0.017, 8, 18, Math.PI), M3.iron, 0, -D.bailR, 0);
    bob.add(arc);
    var tiltG = group();
    tiltG.position.set(0, -D.bailR, 0);
    bob.add(tiltG);
    var plank = new THREE.MeshStandardMaterial({ map: plankTex(), roughness: 0.84, metalness: 0.04 });
    tiltG.add(P.cyl(D.bucketRTop, D.bucketRBot, D.bucketH, plank, 0, -D.bucketH / 2, 0, 20));
    var rim = P.torus(D.bucketRTop, 0.014, M3.iron, 0, 0, 0, 20);
    rim.rotation.x = P.ROTX;
    tiltG.add(rim);
    [0.14, 0.30].forEach(function (dy) {
      var b = P.torus(D.bucketRTop - 0.02 - dy * 0.06, 0.011, M3.iron, 0, -dy, 0, 20);
      b.rotation.x = P.ROTX;
      tiltG.add(b);
    });
    var bottom = P.cyl(D.bucketRBot, D.bucketRBot, 0.03, M3.woodD, 0, -D.bucketH + 0.015, 0, 20);
    tiltG.add(bottom);
    /* 桶内水:单位高 0.42 柱,kine 缩放(顶齐桶沿向下) */
    var water = P.mesh(new THREE.CylinderGeometry(0.155, 0.115, 0.42, 16), M3.water, 0, 0, 0);
    water.castShadow = false;
    water.visible = false;
    tiltG.add(water);
    g.userData.bob = bob;
    g.userData.tiltG = tiltG;
    g.userData.water = water;
    return { group: g, anchor: bob };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    /* 阶段 1:井台井池 */
    def({ id: "pool", name: "WELL POOL · 井池", sub: "池底 +0.13 · 水面 +0.45", phase: 0, at: 0.2, dur: 1.3,
      build: buildPool, target: [0, 0, D.wellZ], start: [0, 5.0, D.wellZ], mid: [0, 2.6, D.wellZ] });
    def({ id: "platform", name: "PLATFORM · 井台", sub: "石砌井台 · 中开井口", phase: 0, at: 1.0, dur: 1.3,
      build: buildPlatform, target: [0, 0.09, D.wellZ], start: [0, 6.5, D.wellZ], mid: [0, 3.6, D.wellZ] });
    def({ id: "kerb", name: "WELL KERB · 井栏", sub: "汉代陶井式高井栏 · 口内 2.16m", phase: 0, at: 2.0, dur: 1.2,
      build: buildKerb, target: [0, 0, D.wellZ], start: [0, 6.6, D.wellZ], mid: [0, 3.8, D.wellZ] });
    def({ id: "basin", name: "BASIN · 瓦盆", sub: "木凳瓦盆 · 倾倒目标", phase: 0, at: 3.0, dur: 1.2,
      build: buildBasin, target: [0, 0, D.basinZ], start: [-1.8, 4.6, D.basinZ - 0.6], mid: [-0.8, 2.4, D.basinZ - 0.3] });

    /* 阶段 2:立架 */
    def({ id: "frameL", name: "FRAME · 立架 L", sub: "A 形双柱 · 轴承座", phase: 1, at: 4.7, dur: 1.2,
      build: function () { return buildFrame(-1); }, target: [-D.axleHalf, 0, D.wellZ],
      start: [-D.axleHalf - 0.6, 6.0, D.wellZ], mid: [-D.axleHalf - 0.3, 3.2, D.wellZ] });
    def({ id: "frameR", name: "FRAME · 立架 R", sub: "A 形双柱 · 轴承座", phase: 1, at: 5.4, dur: 1.2,
      build: function () { return buildFrame(1); }, target: [D.axleHalf, 0, D.wellZ],
      start: [D.axleHalf + 0.6, 6.0, D.wellZ], mid: [D.axleHalf + 0.3, 3.2, D.wellZ] });

    /* 阶段 3:横轴 */
    def({ id: "axle", name: "AXLE · 横轴", sub: "钢轴 + 铜套 · 高 2.55m", phase: 2, at: 8.6, dur: 1.2, kind: "screw",
      build: buildAxle, target: [0, D.axleY, D.wellZ], start: [0, 5.8, D.wellZ + 1.0], mid: [0, 3.8, D.wellZ + 0.5] });

    /* 阶段 4:卷筒 */
    def({ id: "drum", name: "DRUM · 卷筒", sub: "径 0.22m · 绳槽沿 + 缠绳", phase: 3, at: 12.3, dur: 1.2, kind: "kine",
      build: buildDrum, target: [0, D.axleY, D.wellZ], off: [0, 2.2, 1.4] });

    /* 阶段 5:摇柄 */
    def({ id: "crank", name: "CRANK · 摇柄", sub: "柄臂 0.55m · 省力比 2.5", phase: 4, at: 16.2, dur: 1.2, kind: "screw",
      build: buildCrank, target: [1.80, D.axleY, D.wellZ], start: [2.4, 5.0, D.wellZ + 0.6], mid: [2.1, 3.4, D.wellZ + 0.3] });

    /* 阶段 6:吊绳水桶 */
    def({ id: "rope", name: "ROPE · 井绳", sub: "悬挂于筒底切点 · 竖垂", phase: 5, at: 20.0, dur: 1.1, kind: "kine",
      build: buildRope, target: [0, D.drumY - D.rDrum, D.wellZ], off: [0.4, 1.8, 0.9] });
    def({ id: "bucket", name: "BUCKET · 水桶", sub: "木桶 + 提梁 · 空2kg/满14kg", phase: 5, at: 20.7, dur: 1.2, kind: "kine",
      build: buildBucket, target: [0, D.drumY - D.rDrum, D.wellZ], off: [0.8, 2.2, 1.0] });
  };

  /* —— 运动学分发(每帧,含装配飞行期) ——
     st.errPos:桶吊点(bob)世界坐标与解析 bailTop(L,φ) 的距离,应 ≈0。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var psi = st.psiRad || 0, L = st.ropeLen != null ? st.ropeLen : D.Lhigh,
        phi = st.phiRad || 0, tilt = st.tiltRad || 0;
    var wound = KS.clamp((D.Llow - L) / (D.Llow - D.Lhigh), 0, 1);

    var d = MECH.Parts.entry("drum");
    if (d && d.shown) {
      d.group.rotation.x = psi;
      var coil = d.group.userData.coil;
      if (coil) { var r = 0.225 + 0.05 * wound; coil.scale.x = r; coil.scale.z = r; }
    }
    var c = MECH.Parts.entry("crank");
    if (c && c.shown) c.group.rotation.x = psi;

    var r = MECH.Parts.entry("rope");
    if (r && r.shown && r.group.userData.rope) {
      r.group.rotation.x = phi;
      r.group.userData.rope.scale.y = Math.max(L, 0.05);
    }

    st.errPos = 0;
    var b = MECH.Parts.entry("bucket");
    if (b && b.shown && b.group.userData.bob) {
      b.group.rotation.x = phi;
      var bob = b.group.userData.bob;
      bob.position.y = -L;
      var tg = b.group.userData.tiltG;
      if (tg) tg.rotation.x = tilt;
      if (b.sealed) {
        bob.updateWorldMatrix(true, false);
        _wp.setFromMatrixPosition(bob.matrixWorld);
        var an = KS.bailTop(L, st.phiDeg || 0);
        var dx = _wp.x - an.x, dy = _wp.y - an.y, dz = _wp.z - an.z;
        st.errPos = Math.sqrt(dx * dx + dy * dy + dz * dz);
      }
      var w = b.group.userData.water;
      if (w) {
        var f = st.fill || 0;
        w.visible = f > 0.02;
        w.scale.y = Math.max(f, 0.001);
        w.position.y = -0.21 * f;
      }
    }
  };
})(window.MECH = window.MECH || {});
