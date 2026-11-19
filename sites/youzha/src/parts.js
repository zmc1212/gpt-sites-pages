/* 油榨部件建模与注册(9 件)。
   坐标系:y 上;榨框沿 x,楔自 +x 打入(y 0.55);悬锤枢 (1.35, 2.00)
   在 x-y 竖直面摆动;油盘在机前 (z +0.78)。KINE:锤摆 φ(t)、楔随击推进、
   饼束/榨板压缩、油面抬升。全部几何在地面之上。 */
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

  function buildFrame() {    // 榨框:双立柱 + 顶底横枋 + 承楔口
    var g = group();
    g.add(P.box(0.30, D.frameH, 0.56, plankMat(), D.frameX0, D.frameH / 2, 0));
    g.add(P.box(0.30, D.frameH, 0.56, plankMat(), D.frameX1, D.frameH / 2, 0));
    g.add(P.box(1.24, 0.16, 0.62, M3.woodD, 0, D.frameH + 0.08, 0));
    g.add(P.box(1.24, 0.16, 0.62, plankMat(), 0, 0.08, 0));
    /* 承楔口(右侧开口木档) */
    g.add(P.box(0.16, 0.24, 0.50, M3.woodD, D.frameX1 + 0.24, D.wedgeY, 0));
    return { group: g, anchor: mkAnchor(D.frameX1 - 0.1, D.frameH * 0.7, 0.3) };
  }

  function buildCakes() {    // 麹饼束:7 层草裹饼(可压缩)
    var g = group();
    var straw = new THREE.MeshStandardMaterial({ color: 0xB99B5E, roughness: 0.9, metalness: 0.02 });
    var n = D.cakeN;
    for (var i = 0; i < n; i++) {
      var y = D.cakeY0 + (i + 0.5) / n * (D.cakeY1 - D.cakeY0);
      var cake = P.cyl(0.20, 0.20, (D.cakeY1 - D.cakeY0) / n - 0.02, straw, 0, y, 0, 16);
      cake.rotation.z = P.ROTZ;
      g.add(cake);
      var band = P.torus(0.20, 0.012, straw, 0, y, 0, 18);
      band.rotation.z = P.ROTZ;
      g.add(band);
    }
    var core = P.box(0.44, (D.cakeY1 - D.cakeY0), 0.36, straw, 0, (D.cakeY0 + D.cakeY1) / 2, 0);
    core.visible = false;
    g.add(core);
    g.userData.core = core;
    return { group: g, anchor: mkAnchor(-0.2, (D.cakeY0 + D.cakeY1) / 2, 0.24) };
  }

  function buildPlate() {    // 榨板 + 垫木(随楔推进前压)
    var g = group();
    g.add(P.box(0.09, (D.cakeY1 - D.cakeY0) * 0.96, 0.42, plankMat(), D.plateX, (D.cakeY0 + D.cakeY1) / 2, 0));
    [[D.cakeY0 + 0.06], [D.cakeY1 - 0.06]].forEach(function (p) {
      g.add(P.box(0.30, 0.07, 0.36, M3.woodD, D.plateX + 0.18, p[0], 0));
    });
    return { group: g, anchor: mkAnchor(D.plateX + 0.1, (D.cakeY0 + D.cakeY1) / 2, 0.24) };
  }

  function buildWedge() {    // 撞楔:大木楔(kine 随击推进)
    var g = group();
    var w = P.box(D.wedgeLen, 0.16, 0.30, plankMat(), -D.wedgeLen / 2, 0, 0);
    g.add(w);
    var tip = P.mesh(new THREE.ConeGeometry(0.10, 0.14, 4), M3.woodD, -D.wedgeLen - 0.06, 0, 0);
    tip.rotation.z = Math.PI / 2;
    g.add(tip);
    return { group: g, anchor: mkAnchor(-0.2, 0.1, 0.16) };
  }

  function buildRamFrame() { // 撞杆架:顶横梁 + 悬杆(吊锤绳)
    var g = group();
    [[D.pivotX - 0.30], [D.pivotX + 0.30]].forEach(function (p) {
      g.add(P.box(0.16, D.pivotY + 0.10, 0.16, M3.woodD, p[0], (D.pivotY + 0.10) / 2, 0));
      g.add(P.box(0.30, 0.08, 0.30, M3.stone, p[0], 0.04, 0));
    });
    g.add(P.box(0.90, 0.13, 0.16, plankMat(), D.pivotX, D.pivotY + 0.06, 0));
    return { group: g, anchor: mkAnchor(D.pivotX + 0.3, D.pivotY * 0.6, 0.25) };
  }

  function buildRam() {      // 悬锤:吊臂 + 铁头锤(kine 摆动)
    var g = group();
    var arm = P.cyl(0.045, 0.05, D.armL, M3.wood, 0, -D.armL / 2, 0, 10);
    g.add(arm);
    g.add(P.cyl(0.05, 0.05, 0.10, M3.iron, 0, 0.03, 0, 12));
    var head = P.cyl(D.hammerR, D.hammerR * 1.15, 0.26, M3.iron, 0, -D.armL, 0, 14);
    g.add(head);
    return { group: g, anchor: mkAnchor(0, -D.armL + 0.2, 0.16) };
  }

  function buildPan() {      // 油盘:石盘 + 油(液面随榨抬升)
    var g = group();
    var slab = new THREE.MeshStandardMaterial({ color: 0x82868C, roughness: 0.88, metalness: 0.04 });
    g.add(P.box(D.panW, 0.05, D.panD, slab, D.panX, 0.025, D.panZ));
    g.add(P.box(D.panW, D.panH, 0.05, slab, D.panX, D.panH / 2 + 0.05, D.panZ - D.panD / 2));
    g.add(P.box(D.panW, D.panH, 0.05, slab, D.panX, D.panH / 2 + 0.05, D.panZ + D.panD / 2));
    g.add(P.box(0.05, D.panH, D.panD, slab, D.panX - D.panW / 2, D.panH / 2 + 0.05, D.panZ));
    g.add(P.box(0.05, D.panH, D.panD, slab, D.panX + D.panW / 2, D.panH / 2 + 0.05, D.panZ));
    var oil = P.mesh(new THREE.PlaneGeometry(D.panW - 0.10, D.panD - 0.10),
      new THREE.MeshStandardMaterial({ color: 0x8A6E2F, transparent: true, opacity: 0.72, roughness: 0.3 }),
      D.panX, 0.10, D.panZ);
    oil.rotation.x = -Math.PI / 2;
    oil.castShadow = false;
    g.add(oil);
    g.userData.oil = oil;
    return { group: g, anchor: mkAnchor(D.panX + D.panW / 2, D.panH + 0.06, D.panZ) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "frame", name: "PRESS FRAME · 榨框", sub: "重木框 · 承楔口", phase: 0, at: 0.2, dur: 1.5,
      build: buildFrame, target: [0, 0, 0], start: [0, 4.4, 0], mid: [0, 2.2, 0] });
    def({ id: "cakes", name: "CAKES · 麹饼束", sub: "草裹饼 ×7 · 可压缩 18%", phase: 1, at: 6.0, dur: 1.4,
      build: buildCakes, target: [0, 0, 0], start: [0, 4.0, 0.5], mid: [0, 2.0, 0.25] });
    def({ id: "plate", name: "PLATE · 榨板垫木", sub: "随楔前压", phase: 2, at: 10.6, dur: 1.2,
      build: buildPlate, target: [0, 0, 0], start: [0.4, 3.4, 0.5], mid: [0.2, 1.7, 0.25] });
    def({ id: "pan", name: "OIL PAN · 油盘", sub: "石盘 · 油面渐涨", phase: 2, at: 11.6, dur: 1.2,
      build: buildPan, target: [0, 0, 0], start: [-0.2, 3.2, 1.0], mid: [-0.1, 1.6, 0.5] });

    def({ id: "wedge", name: "WEDGE · 撞楔", sub: "每击进 0.03m ×3", phase: 3, at: 16.4, dur: 1.3, kind: "kine",
      build: buildWedge, target: [D.wedgeX0 + D.wedgeLen, D.wedgeY, 0], off: [0.8, 1.8, 0.8] });
    def({ id: "ramFrame", name: "RAM FRAME · 撞杆架", sub: "顶梁悬枢 2.00m", phase: 4, at: 21.4, dur: 1.3,
      build: buildRamFrame, target: [0, 0, 0], start: [1.4, 4.2, 0.5], mid: [1.3, 2.1, 0.25] });
    def({ id: "ram", name: "RAM · 悬锤", sub: "臂 1.45m · 摆幅 33° · 锤速 2.64", phase: 4, at: 22.4, dur: 1.3, kind: "kine",
      build: buildRam, target: [D.pivotX, D.pivotY, 0], off: [0.5, 1.6, 0.8] });
  };

  /* —— 运动学分发 ——
     φ(t):纯函数摆角;楔:第 n 击推进 dHit·n(击中瞬间快速滑入);
     饼束/榨板随楔进压缩;油面随总进量抬升;
     errPos = 锤头世界 x vs 解析 pivot + L·sin φ(应≈0)。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var t = st.swingT != null ? st.swingT : 0;
    var phi = KS.swingPhi(t);
    var adv = st.wedgeAdv != null ? st.wedgeAdv : 0;   // 楔累计进量
    var hitFlash = st.hitFlash || 0;

    var rm = MECH.Parts.entry("ram");
    if (rm && rm.shown) rm.group.rotation.z = phi;

    st.errPos = 0;
    if (rm && rm.sealed) {
      rm.group.updateWorldMatrix(true, false);
      _wp.set(0, -D.armL, 0).applyMatrix4(rm.group.matrixWorld);
      var ax = D.pivotX + Math.sin(phi) * D.armL;
      var ay = D.pivotY - Math.cos(phi) * D.armL;
      st.errPos = Math.sqrt((_wp.x - ax) * (_wp.x - ax) + (_wp.y - ay) * (_wp.y - ay));
    }

    /* 楔推进(击中后滑入) */
    var wg = MECH.Parts.entry("wedge");
    if (wg && wg.sealed) {
      wg.group.position.x = adv;
      wg.group.rotation.z = 0.10 * (1 - Math.min(adv / D.wedgeMax, 1));  // 楔渐入渐平
    }

    /* 饼束/榨板压缩 */
    var comp = adv / D.wedgeMax;
    var ck = MECH.Parts.entry("cakes");
    if (ck && ck.sealed) {
      ck.group.scale.x = 1 - 0.18 * comp;
      ck.group.position.x = -0.09 * comp;
      var core = ck.group.userData.core;
      if (core) core.visible = comp > 0.3;
    }
    var pl = MECH.Parts.entry("plate");
    if (pl && pl.sealed) pl.group.position.x = -adv;

    /* 油面抬升 */
    var pn = MECH.Parts.entry("pan");
    if (pn && pn.sealed && pn.group.userData.oil) {
      pn.group.userData.oil.position.y = 0.10 + 0.05 * comp;
    }
  };
})(window.MECH = window.MECH || {});
