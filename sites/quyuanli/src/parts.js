/* 曲辕犁部件建模与注册(11 件)。
   坐标系:机构根节点 root = 犁体原点(犁底后端着地点),头朝 +x;
   KINE 写 root.position/rotation(整体行走 + 绕后端翻转),犁体各部件局部坐标固定。
   犁评(kine 部件)沿犁辕滑移,KINE 在落座后接管其局部位置(gaozhuan 板位同法)。
   耕作在抬高土床上进行:床顶 0.22 不透明,铧入土为设计性没入。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  var _soil = null;
  function soilTex() {
    if (_soil) return _soil;
    var c = document.createElement("canvas");
    c.width = c.height = 256;
    var x = c.getContext("2d");
    x.fillStyle = "#5C4630";
    x.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 900; i++) {
      var g = 70 + Math.random() * 40;
      x.fillStyle = "rgba(" + (g | 0) + "," + ((g * 0.72) | 0) + "," + ((g * 0.45) | 0) + ",0.6)";
      x.beginPath();
      x.arc(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2.2, 0, Math.PI * 2);
      x.fill();
    }
    x.strokeStyle = "rgba(38,26,14,0.5)";
    x.lineWidth = 2;
    for (var j = 0; j < 5; j++) {
      x.beginPath();
      x.moveTo(0, 40 + j * 45);
      x.lineTo(256, 34 + j * 45 + Math.random() * 10);
      x.stroke();
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 2);
    t.encoding = THREE.sRGBEncoding;
    _soil = t;
    return t;
  }

  /* —— 部件构建器(局部坐标:原点=犁底后端着地) —— */

  function buildBed() {      // 土床:抬高耕地 + 沟迹(随行生长)
    var g = group();
    var soil = new THREE.MeshStandardMaterial({ map: soilTex(), roughness: 0.96, metalness: 0.02 });
    var W = D.bedX1 - D.bedX0;
    g.add(P.box(W, D.bedTop, D.bedZ * 2, soil, (D.bedX0 + D.bedX1) / 2, D.bedTop / 2, 0));
    g.add(P.box(W + 0.2, 0.06, D.bedZ * 2 + 0.2, M3.stone, (D.bedX0 + D.bedX1) / 2, 0.03, 0));
    var furrow = P.box(1, D.furrowD, D.furrowW,
      new THREE.MeshStandardMaterial({ color: 0x33261A, roughness: 0.98 }), 0, D.bedTop - D.furrowD / 2 - 0.004, 0);
    furrow.scale.x = 0.01;
    g.add(furrow);
    g.userData.furrow = furrow;
    return { group: g, anchor: mkAnchor(D.bedX0 + 0.5, D.bedTop + 0.05, 0.9) };
  }

  function buildSole() {     // 犁底:长木底座(0..1.1)
    var g = group();
    g.add(P.box(1.1, 0.09, 0.16, M3.woodD, 0.55, 0.045, 0));
    g.add(P.box(0.5, 0.05, 0.14, M3.wood, 0.35, 0.115, 0));   // 座面补木
    return { group: g, anchor: mkAnchor(0.55, 0.14, 0.1) };
  }

  function buildShare() {    // 犁铧:铁三角形(尖朝 +x 下前方)
    var g = group();
    var cone = P.mesh(new THREE.ConeGeometry(0.15, D.shareL, 4), M3.iron, 1.06, 0.075, 0);
    cone.rotation.z = -Math.PI / 2;
    cone.rotation.y = Math.PI / 4;
    cone.scale.set(1, 1, 0.42);
    g.add(cone);
    return { group: g, anchor: mkAnchor(1.16, 0.05, 0.12) };
  }

  function buildMold() {     // 犁壁:铁曲面板(半开筒)
    var g = group();
    var shell = P.mesh(new THREE.CylinderGeometry(0.24, 0.30, D.moldL, 14, 1, true, -0.9, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x5A5E66, metalness: 0.55, roughness: 0.4, side: THREE.DoubleSide }),
      0.72, 0.28, 0);
    shell.rotation.z = Math.PI / 2 + 0.18;
    shell.rotation.y = 0.12;
    g.add(shell);
    return { group: g, anchor: mkAnchor(0.72, 0.45, 0.16) };
  }

  function buildFront() {    // 压镵 + 策额:铧后连接架
    var g = group();
    g.add(P.box(0.24, 0.06, 0.13, M3.woodD, 0.36, 0.16, 0));
    g.add(P.box(0.05, 0.20, 0.12, M3.wood, 0.27, 0.26, 0));
    g.add(P.box(0.10, 0.07, 0.12, M3.iron, 0.22, 0.34, 0));
    return { group: g, anchor: mkAnchor(0.27, 0.36, 0.1) };
  }

  function buildShaft() {    // 犁辕:曲辕木杆(TubeGeometry S 曲线)+ 轭钩
    var g = group();
    var curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.62, 0.44, 0),
      new THREE.Vector3(1.02, 0.32, 0),
      new THREE.Vector3(1.45, 0.24, 0),
      new THREE.Vector3(1.90, 0.44, 0),
      new THREE.Vector3(2.35, 0.90, 0)
    ]);
    var tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.048, 8, false), M3.wood);
    tube.castShadow = true;
    g.add(tube);
    var hook = P.torus(0.07, 0.016, M3.iron, 2.35, 0.90, 0, 14);
    g.add(hook);
    return { group: g, anchor: mkAnchor(2.35, 0.98, 0.1) };
  }

  function buildHandle() {   // 犁梢:后端扶手(斜上)
    var g = group();
    var len = 1.06;
    var stick = P.cyl(0.038, 0.05, len, M3.woodD, -0.20, 0.47, 0, 10);
    stick.rotation.z = 0.79;
    g.add(stick);
    g.add(P.sph(0.05, M3.woodD, -0.58, 0.94, 0));
    return { group: g, anchor: mkAnchor(-0.55, 0.9, 0.1) };
  }

  function buildArrow() {    // 犁箭:犁底→犁辕立柱
    var g = group();
    g.add(P.cyl(0.034, 0.04, 0.40, M3.woodD, 0.62, 0.28, 0, 10));
    g.add(P.box(0.10, 0.05, 0.10, M3.iron, 0.62, 0.46, 0));
    return { group: g, anchor: mkAnchor(0.62, 0.5, 0.1) };
  }

  function buildEval() {     // 犁评 + 犁建:滑块与锁销(kine 接管滑移)
    var g = group();
    g.add(P.box(0.22, 0.075, 0.11, M3.wood, 0, 0, 0));
    g.add(P.box(0.05, 0.12, 0.12, M3.iron, -0.08, 0.06, 0));
    var pin = P.cyl(0.02, 0.02, 0.16, M3.iron, 0.06, 0.03, 0, 8);
    pin.rotation.x = P.ROTX;
    g.add(pin);
    return { group: g, anchor: g };
  }

  /* —— 注册(局部坐标;部件挂 root,root 位姿由 KINE 接管) —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "bed", name: "BED · 土床", sub: "抬高耕地 · 床顶 0.22m · 沟迹随行", phase: 0, at: 0.15, dur: 1.3, world: true,
      build: buildBed, target: [0, 0, 0], start: [0, 4.0, 0], mid: [0, 2.0, 0] });

    /* 阶段 1:犁底 + 犁铧 */
    def({ id: "sole", name: "SOLE · 犁底", sub: "长 1.10m · 后端着地", phase: 0, at: 1.5, dur: 1.2,
      build: buildSole, target: [0, 0, 0], start: [0, 3.6, 0.6], mid: [0, 1.8, 0.3] });
    def({ id: "share", name: "SHARE · 犁铧", sub: "铁铧 0.34m · 入土刃", phase: 0, at: 2.4, dur: 1.1,
      build: buildShare, target: [0, 0, 0], start: [1.0, 3.4, 0.8], mid: [0.5, 1.7, 0.4] });

    /* 阶段 2:犁壁 + 压镵策额 */
    def({ id: "mold", name: "MOLDBOARD · 犁壁", sub: "铁曲壁 · 翻土", phase: 1, at: 6.6, dur: 1.2,
      build: buildMold, target: [0, 0, 0], start: [0.4, 3.6, -0.8], mid: [0.2, 1.8, -0.4] });
    def({ id: "front", name: "BRACKET · 压镵策额", sub: "铧后连接架", phase: 1, at: 7.5, dur: 1.1,
      build: buildFront, target: [0, 0, 0], start: [0.2, 3.2, 0.9], mid: [0.1, 1.6, 0.4] });

    /* 阶段 3:犁辕 */
    def({ id: "shaft", name: "CURVED SHAFT · 犁辕", sub: "曲辕 S 曲线 · 轭钩在前", phase: 2, at: 11.6, dur: 1.4,
      build: buildShaft, target: [0, 0, 0], start: [1.4, 4.0, 0.5], mid: [0.8, 2.0, 0.25] });

    /* 阶段 4:犁梢 + 犁箭 */
    def({ id: "handle", name: "HANDLE · 犁梢", sub: "扶手 · 高 0.98m", phase: 3, at: 16.6, dur: 1.2,
      build: buildHandle, target: [0, 0, 0], start: [-0.6, 3.6, 0.6], mid: [-0.3, 1.8, 0.3] });
    def({ id: "arrow", name: "ARROW · 犁箭", sub: "犁底→犁辕 立柱", phase: 3, at: 17.4, dur: 1.1,
      build: buildArrow, target: [0, 0, 0], start: [0.6, 3.2, -0.7], mid: [0.3, 1.6, -0.35] });

    /* 阶段 5:犁评犁建(screw 上辕;滑移由 KINE 接管) */
    def({ id: "eval", name: "REGULATOR · 犁评犁建", sub: "行程 0.30m · 进深退浅", phase: 4, at: 21.8, dur: 1.2, kind: "screw",
      build: buildEval, target: [0.66, 0.50, 0], start: [0.9, 3.0, 0.7], mid: [0.75, 1.5, 0.35] });
  };

  /* —— 运动学分发(每帧) ——
     root:行走 x + 床面 bob + 绕后端翻转 −θ;
     评:局部位置沿辕滑移(落座后接管);沟迹:随行生长;
     st.errPos = 铧尖世界高度 vs 解析 bedTop − d(u)(应 ≈0)。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var px = st.px != null ? st.px : D.xStart;
    var u = st.u || 0;
    var th = KS.rad(KS.thetaOf(u));
    var bob = (st.walking ? Math.abs(Math.sin(st.time * D.bobF * Math.PI * 2)) : 0) * D.bobA;
    MECH.Scene3D.root.position.set(px, D.bedTop + bob, 0);
    MECH.Scene3D.root.rotation.z = -th;

    var ev = MECH.Parts.entry("eval");
    if (ev && ev.sealed) {
      var ex = 0.66 + u;
      var ey = 0.44 - 0.30 * (ex - 0.62) + 0.055;
      ev.group.position.set(ex, ey, 0);
    }

    st.errPos = 0;
    var sh = MECH.Parts.entry("share");
    if (sh && sh.sealed) {
      sh.group.updateWorldMatrix(true, false);
      _wp.set(1.16, 0.01, 0).applyMatrix4(sh.group.matrixWorld);
      var d = KS.depthOf(u);
      var dy = _wp.y - (D.bedTop - d);
      st.errPos = Math.abs(dy);
    }

    var bd = MECH.Parts.entry("bed");
    if (bd && bd.sealed && bd.group.userData.furrow) {
      var f = bd.group.userData.furrow;
      var len = Math.max(px - D.xStart, 0.01);
      f.scale.x = len;
      f.position.x = D.xStart + len / 2;
    }
  };
})(window.MECH = window.MECH || {});
