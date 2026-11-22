/* 桔槔部件建模与注册(12 件)。
   坐标系:y 向上,枢轴在世界原点上方 (0, 3.24, 0),长臂指向 +x(井/水槽侧)。
   运动学部件(横杆/坠石绳/坠石/吊绳/水罐)几何以"组原点=枢轴"建模:
     root.rotation.z = −θ(跟随横杆);inner 子组位于臂端 (±L, 0, 0),
     inner.rotation.z = +θ(或 +θ+φ)把吊挂系反旋回世界竖直 —— 罐/坠石
     恒竖直悬挂于臂端正下方;倾倒时罐再经 tilt 子组前倾。
   标签锚点:各部件 build 返回 anchor(Object3D + userData.tagAnchor)。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;

  function group() { return new THREE.Group(); }

  /* 不可见标签锚点子对象 */
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  /* —— 程序化贴图(站点本地) —— */
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

  var _wicker = null;
  function wickerTex() {
    if (_wicker) return _wicker;
    var c = document.createElement("canvas");
    c.width = c.height = 128;
    var x = c.getContext("2d");
    x.fillStyle = "#A97844";
    x.fillRect(0, 0, 128, 128);
    for (var r = 0; r < 8; r++) {
      var y = r * 16 + 3;
      x.fillStyle = (r % 2) ? "#94682F" : "#BC8D52";
      x.fillRect(0, y, 128, 10);
      x.strokeStyle = "rgba(64,40,15,0.55)";
      x.lineWidth = 1.4;
      x.strokeRect(-1, y, 130, 10);
      x.strokeStyle = "rgba(64,40,15,0.35)";
      for (var i = 0; i < 8; i++) {
        var px = i * 16 + (r % 2) * 8;
        x.beginPath(); x.moveTo(px, y); x.lineTo(px + 9, y + 10); x.stroke();
      }
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 1);
    t.encoding = THREE.sRGBEncoding;
    _wicker = t;
    return t;
  }

  /* —— 部件构建器 —— */

  function buildShaft() {   // 井身:浅池内衬 + 不透明池底 + 水面(全部在地面之上)
    var g = group();
    var dark = new THREE.MeshStandardMaterial({ color: 0x35383E, roughness: 0.95, metalness: 0.04 });
    /* 不透明池底(0.07..0.13):盖住全球地面,水面 0.45 之下只见深色池底 */
    g.add(P.box(2.16, 0.06, 2.16, dark, 0, 0.10, 0));
    /* 浅池内衬(0.08..0.22):透过半透明水可见的"深度" */
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
    /* 井口内沿 x:wellCx±wellA(2.22..4.38),z:±wellA;台面 x:1.70..5.10,z:±1.75 */
    var x0 = D.platX0 - 3.40, x1 = D.platX1 - 3.40;
    var wx0 = D.wellCx - D.wellA - 3.40, wx1 = D.wellCx + D.wellA - 3.40;
    g.add(P.box(wx0 - x0, 0.18, 3.50, pave, (x0 + wx0) / 2, 0, 0));            // 西条
    g.add(P.box(x1 - wx1, 0.18, 3.50, pave, (wx1 + x1) / 2, 0, 0));            // 东条
    g.add(P.box(wx1 - wx0, 0.18, 1.75 - D.wellA, pave, (wx0 + wx1) / 2, 0, (D.wellA + 1.75) / 2));  // 北条
    g.add(P.box(wx1 - wx0, 0.18, 1.75 - D.wellA, pave, (wx0 + wx1) / 2, 0, -(D.wellA + 1.75) / 2)); // 南条
    g.add(P.box(3.40, 0.19, 0.16, edge, 0, 0.005, 1.67));
    g.add(P.box(3.40, 0.19, 0.16, edge, 0, 0.005, -1.67));
    g.add(P.box(0.16, 0.19, 3.18, edge, 1.62, 0.005, 0));
    g.add(P.box(0.16, 0.19, 3.18, edge, -1.62, 0.005, 0));
    return { group: g, anchor: mkAnchor(0, 0.12, 1.55) };
  }

  function buildKerb() {   // 井栏:汉代陶井式高井栏,方形四壁,口内 2.16m(0.18..1.30)
    var g = group();
    var slab = new THREE.MeshStandardMaterial({ color: 0x82868C, roughness: 0.88, metalness: 0.04 });
    g.add(P.box(0.16, 1.12, 2.48, slab, 1.16, 0.74, 0));
    g.add(P.box(0.16, 1.12, 2.48, slab, -1.16, 0.74, 0));
    g.add(P.box(2.16, 1.12, 0.16, slab, 0, 0.74, 1.16));
    g.add(P.box(2.16, 1.12, 0.16, slab, 0, 0.74, -1.16));
    /* 顶部收口沿 */
    g.add(P.box(0.20, 0.06, 2.56, slab, 1.18, 1.33, 0));
    g.add(P.box(0.20, 0.06, 2.56, slab, -1.18, 1.33, 0));
    g.add(P.box(2.24, 0.06, 0.20, slab, 0, 1.33, 1.18));
    g.add(P.box(2.24, 0.06, 0.20, slab, 0, 1.33, -1.18));
    return { group: g, anchor: mkAnchor(0, 0.6, 1.2) };
  }

  function buildTrough() {  // 水槽:石槽 + 槽内水
    var g = group();
    var slab = new THREE.MeshStandardMaterial({ color: 0x8B8E93, roughness: 0.85, metalness: 0.04 });
    g.add(P.box(0.95, 0.75, 0.08, slab, 0, 0, 0.27));
    g.add(P.box(0.95, 0.75, 0.08, slab, 0, 0, -0.27));
    g.add(P.box(0.08, 0.75, 0.62, slab, 0.435, 0, 0));
    g.add(P.box(0.08, 0.75, 0.62, slab, -0.435, 0, 0));
    g.add(P.box(0.79, 0.09, 0.46, slab, 0, -0.33, 0));
    var water = P.mesh(new THREE.PlaneGeometry(0.78, 0.45), M3.water, 0, 0.245, 0);
    water.rotation.x = -Math.PI / 2;
    water.castShadow = false;
    g.add(water);
    g.userData.water = water;
    return { group: g, anchor: mkAnchor(-0.3, 0.35, 0.35) };
  }

  function buildPost() {   // 立柱:石础 + 柱身 + 柱顶帽
    var g = group();
    var base = new THREE.MeshStandardMaterial({ color: 0x5B5E63, roughness: 0.92 });
    g.add(P.box(0.46, 0.25, 0.46, base, 0, -1.65, 0));
    g.add(P.box(0.18, D.postH, 0.18, M3.woodD, 0, 0, 0));
    g.add(P.box(0.26, 0.10, 0.26, M3.woodD, 0, 1.575, 0));
    g.add(P.box(0.20, 0.07, 0.20, M3.iron, 0, 1.50, 0));   // 轴孔铁箍
    return { group: g, anchor: mkAnchor(0.05, 0.8, 0.14) };
  }

  function buildBraces() {  // 斜撑:四向斜柱 + 铁鞋
    var g = group();
    var ang = Math.atan2(0.95, 2.45), len = Math.sqrt(0.95 * 0.95 + 2.45 * 2.45);
    [1, -1].forEach(function (sx) {
      [1, -1].forEach(function (sz) {
        var b = P.cyl(0.045, 0.058, len, M3.woodD, sx * 0.575, 1.248, sz * 0.30, 10);
        b.rotation.z = sx * ang;
        g.add(b);
        g.add(P.box(0.18, 0.06, 0.18, M3.iron, sx * 1.05, 0.03, sz * 0.30));
      });
    });
    return { group: g, anchor: mkAnchor(0.6, 1.25, 0.32) };
  }

  function buildPivot() {   // 枢轴:横轴 + 铜套 + 挡环
    var g = group();
    var axle = P.cyl(0.045, 0.045, 0.60, M3.iron, 0, 0, 0, 14);
    axle.rotation.x = P.ROTX;
    g.add(axle);
    var sleeve = P.cyl(0.066, 0.066, 0.14, M3.bronze, 0, 0, 0, 14);
    sleeve.rotation.x = P.ROTX;
    g.add(sleeve);
    g.add(P.torus(0.075, 0.018, M3.bronze, 0, 0, 0.26, 20));
    g.add(P.torus(0.075, 0.018, M3.bronze, 0, 0, -0.26, 20));
    return { group: g, anchor: mkAnchor(0, 0.05, 0.34) };
  }

  function buildLever() {   // 横杆:6m 杠杆横木,支点偏置(原点=枢轴)
    var g = group();
    g.add(P.box(6.0, 0.14, 0.09, M3.wood, 1.125, 0, 0));
    var sleeve = P.cyl(0.080, 0.080, 0.18, M3.bronze, 0, 0, 0, 16);
    sleeve.rotation.x = P.ROTX;
    g.add(sleeve);
    g.add(P.box(0.12, 0.16, 0.10, M3.iron, 4.05, 0, 0));
    g.add(P.box(0.12, 0.16, 0.10, M3.iron, -1.80, 0, 0));
    var eyeL = P.torus(0.04, 0.014, M3.iron, 4.125, -0.085, 0, 14);
    eyeL.rotation.x = P.ROTX;
    g.add(eyeL);
    var eyeS = P.torus(0.04, 0.014, M3.iron, -1.875, -0.085, 0, 14);
    eyeS.rotation.x = P.ROTX;
    g.add(eyeS);
    return { group: g, anchor: mkAnchor(1.125, 0.16, 0) };
  }

  function buildRopeStone() {  // 坠石绳:短端吊绳(竖直悬挂)
    var outer = group();
    var inner = group();
    inner.position.set(-D.Ls, 0, 0);
    outer.add(inner);
    inner.add(P.cyl(0.02, 0.02, D.ropeStone, M3.rope, 0, -D.ropeStone / 2, 0, 8));
    var eye = P.torus(0.032, 0.012, M3.iron, 0, -0.01, 0, 12);
    eye.rotation.x = P.ROTX;
    inner.add(eye);
    outer.userData.inner = inner;
    return { group: outer, anchor: inner };
  }

  function buildStone() {   // 坠石:大石块(约 40kg)
    var outer = group();
    var inner = group();
    inner.position.set(-D.Ls, 0, 0);
    outer.add(inner);
    inner.add(P.torus(0.09, 0.02, M3.rope, 0, -D.ropeStone - 0.01, 0, 14));
    inner.add(P.sph(0.035, M3.rope, 0, -D.ropeStone, 0));
    var rock = P.mesh(new THREE.DodecahedronGeometry(0.30),
      new THREE.MeshStandardMaterial({ color: 0x7B7E84, roughness: 0.9, metalness: 0.03, flatShading: true }),
      0, -D.ropeStone - 0.26, 0);
    rock.scale.set(1, 0.87, 0.72);
    inner.add(rock);
    outer.userData.inner = inner;
    return { group: outer, anchor: inner };
  }

  function buildRopeJug() {  // 吊绳:长端 2.2m 自由竖悬
    var outer = group();
    var inner = group();
    inner.position.set(D.Ll, 0, 0);
    outer.add(inner);
    inner.add(P.cyl(0.022, 0.022, D.ropeJug, M3.rope, 0, -D.ropeJug / 2, 0, 8));
    var eye = P.torus(0.034, 0.012, M3.iron, 0, -0.01, 0, 12);
    eye.rotation.x = P.ROTX;
    inner.add(eye);
    outer.userData.inner = inner;
    return { group: outer, anchor: inner };
  }

  function buildJug() {     // 水罐:柳条罐 + 罐内水(倾倒子组,悬于绳端)
    var outer = group();
    var inner = group();
    inner.position.set(D.Ll, 0, 0);
    outer.add(inner);
    var tiltG = group();
    tiltG.position.set(0, -D.ropeJug, 0);   // 倾倒支点 = 绳端(吊点)
    inner.add(tiltG);
    var wicker = new THREE.MeshStandardMaterial({ map: wickerTex(), roughness: 0.86, metalness: 0.03 });
    tiltG.add(P.cyl(D.jugRTop, D.jugRBot, D.jugH, wicker, 0, -D.jugH / 2, 0, 18));
    var rim = P.torus(0.165, 0.016, M3.rope, 0, -0.005, 0, 18);
    rim.rotation.x = P.ROTX;
    tiltG.add(rim);
    [[0.155, -0.14], [0.146, -0.23], [0.136, -0.32]].forEach(function (rb) {
      var rib = P.torus(rb[0], 0.012, M3.rope, 0, rb[1], 0, 18);
      rib.rotation.x = P.ROTX;
      tiltG.add(rib);
    });
    tiltG.add(P.torus(0.045, 0.014, M3.rope, 0.19, -0.06, 0, 12));
    tiltG.add(P.torus(0.045, 0.014, M3.rope, -0.19, -0.06, 0, 12));
    var water = P.mesh(new THREE.CylinderGeometry(0.14, 0.10, 0.42, 16), M3.water, 0, -0.25, 0);
    water.castShadow = false;
    water.visible = false;
    tiltG.add(water);
    inner.userData.tiltG = tiltG;
    outer.userData.inner = inner;
    outer.userData.water = water;
    return { group: outer, anchor: inner };
  }

  /* 人力下压指示箭头(装饰,不注册为部件) */
  function buildPressArrow() {
    var g = group();
    var mat = new THREE.MeshBasicMaterial({ color: 0xD6543A, transparent: true, opacity: 0.85, depthWrite: false });
    var shaft = P.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.60, 10), mat, 0, -0.32, 0);
    shaft.castShadow = false;
    g.add(shaft);
    var head = P.mesh(new THREE.ConeGeometry(0.095, 0.24, 12), mat, 0, -0.74, 0);
    head.rotation.z = Math.PI;
    head.castShadow = false;
    g.add(head);
    g.visible = false;
    return g;
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    /* 阶段 1:井台井身(at 为全局循环时间) */
    def({ id: "shaft", name: "WELL POOL · 井池", sub: "浅池池底 · 水面 +0.45m", phase: 0, at: 0.2, dur: 1.4,
      build: buildShaft, target: [D.wellCx, 0, 0], start: [D.wellCx, 5.0, 0], mid: [D.wellCx, 2.6, 0] });
    def({ id: "platform", name: "PLATFORM · 井台", sub: "石砌井台 · 中开井口", phase: 0, at: 0.9, dur: 1.3,
      build: buildPlatform, target: [3.40, 0.09, 0], start: [3.40, 7.0, 0], mid: [3.40, 4.0, 0] });
    def({ id: "kerb", name: "WELL KERB · 井栏", sub: "汉代陶井式高井栏 · 口内 2.16m", phase: 0, at: 1.9, dur: 1.1,
      build: buildKerb, target: [D.wellCx, 0, 0], start: [D.wellCx, 6.4, 0], mid: [D.wellCx, 3.6, 0] });
    def({ id: "trough", name: "TROUGH · 水槽", sub: "石槽 · 槽口 +0.75m", phase: 0, at: 2.8, dur: 1.1,
      build: buildTrough, target: [D.trCx, 0.375, 0], start: [D.trCx, 5.6, 1.4], mid: [D.trCx, 3.2, 0.8] });

    /* 阶段 2:立柱枢轴(阶段起点 3.8) */
    def({ id: "post", name: "POST · 立柱", sub: "高 3.3m · 石础铁箍", phase: 1, at: 4.1, dur: 1.2,
      build: buildPost, target: [0, 1.775, 0], start: [0, 7.0, 0], mid: [0, 4.2, 0] });
    def({ id: "braces", name: "BRACES · 斜撑", sub: "四向斜柱 · 抵长端拉力", phase: 1, at: 4.9, dur: 1.2,
      build: buildBraces, target: [0, 0, 0], start: [0, 6.0, 0], mid: [0, 3.2, 0] });
    def({ id: "pivot", name: "PIVOT · 枢轴", sub: "横轴于柱顶 · 全机构支点", phase: 1, at: 5.8, dur: 1.1, kind: "screw",
      build: buildPivot, target: [0, D.pivotY, 0], start: [0, 6.2, 0.9], mid: [0, 4.5, 0.4] });

    /* 阶段 3:横杆(阶段起点 7.3) */
    def({ id: "lever", name: "LEVER BEAM · 横杆", sub: "全长 6m · 支点偏置 1.875/4.125", phase: 2, at: 7.7, dur: 1.2, kind: "kine",
      build: buildLever, target: [0, D.pivotY, 0], off: [0, 2.6, 1.8] });

    /* 阶段 4:坠石(阶段起点 10.8) */
    def({ id: "ropeStone", name: "STONE ROPE · 坠石绳", sub: "短端垂 0.85m · 竖直悬挂", phase: 3, at: 11.1, dur: 1.1, kind: "kine",
      build: buildRopeStone, target: [0, D.pivotY, 0], off: [-0.4, 2.0, 0.9] });
    def({ id: "stone", name: "COUNTERWEIGHT · 坠石", sub: "约 40kg · T石 75.0 kg·m", phase: 3, at: 11.7, dur: 1.1, kind: "kine",
      build: buildStone, target: [0, D.pivotY, 0], off: [-0.7, 2.2, 0.7] });

    /* 阶段 5:水罐吊绳(阶段起点 14.3) */
    def({ id: "ropeJug", name: "JUG ROPE · 吊绳", sub: "长 1.6m · 自由竖悬", phase: 4, at: 14.6, dur: 1.1, kind: "kine",
      build: buildRopeJug, target: [0, D.pivotY, 0], off: [0.5, 2.0, 0.9] });
    def({ id: "jug", name: "WICKER JUG · 水罐", sub: "柳条罐 · 空2kg/满12kg", phase: 4, at: 15.2, dur: 1.1, kind: "kine",
      build: buildJug, target: [0, D.pivotY, 0], off: [0.8, 2.4, 0.8] });

    /* 人力下压指示箭头 */
    var arrow = buildPressArrow();
    MECH.Scene3D.scene.add(arrow);
    MECH.Parts.ref("pressArrow", arrow);
  };

  /* —— 运动学分发(每帧,含装配飞行期) ——
     root 全部 rotation 写入;罐内水位为内部网格缩放(站点自管)。
     st.errPos:罐吊点世界坐标与解析值 jugTop(θ,φ) 的距离(端到端误差,应≈0)。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var th = st.thetaRad || 0, phi = st.phiRad || 0, tilt = st.tiltRad || 0;
    st.errPos = 0;
    var e = MECH.Parts.entry("lever");
    if (e && e.shown) {
      st.errDeg = KS.deg(Math.abs(e.group.rotation.z - (-th)));
      e.group.rotation.z = -th;
    } else {
      st.errDeg = 0;
    }
    function hang(id, extra) {
      var p = MECH.Parts.entry(id);
      if (!p || !p.shown || !p.group.userData.inner) return;
      p.group.rotation.z = -th;
      p.group.userData.inner.rotation.z = th + (extra || 0);
    }
    hang("ropeStone", 0);
    hang("stone", 0);
    hang("ropeJug", phi);
    hang("jug", phi);
    var j = MECH.Parts.entry("jug");
    if (j && j.shown && j.sealed && j.group.userData.inner) {
      var tg = j.group.userData.inner.userData.tiltG;
      if (tg) {
        tg.rotation.z = -tilt;
        tg.updateWorldMatrix(true, false);
        _wp.setFromMatrixPosition(tg.matrixWorld);
        var an = KS.jugTop(st.thetaDeg || 0, st.phiDeg || 0);
        var dx = _wp.x - an.x, dy = _wp.y - an.y;
        st.errPos = Math.sqrt(dx * dx + dy * dy);
      }
      var w = j.group.userData.water;
      if (w) {
        var f = st.fill || 0;
        w.visible = f > 0.02;
        w.scale.y = Math.max(f, 0.001);
        w.position.y = -0.46 + 0.21 * f;
      }
    }
  };
})(window.MECH = window.MECH || {});
