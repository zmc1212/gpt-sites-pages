/* 浑仪部件建模与注册(9 件)。
   坐标系:y 上,+z 北;球心 C = (0, 1.45, 0)。各环以"法向四元数"驱动:
   环几何为局部 x-y 面圆环(法向 +z),KINE 用 setFromUnitVectors(ẑ, n)
   设定 world 法向——六合固定 / 三辰绕极轴 / 四游携窥管指向。
   全部几何位于地面之上。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;
  var ZAX = new THREE.Vector3(0, 0, 1);
  var _tmpV = new THREE.Vector3(), _tmpQ = new THREE.Quaternion();

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  function setNormal(entry, nx, ny, nz) {
    _tmpV.set(nx, ny, nz).normalize();
    _tmpQ.setFromUnitVectors(ZAX, _tmpV);
    entry.group.quaternion.copy(_tmpQ);
    entry.group.position.set(0, D.hubY, 0);
  }

  function ringMesh(R, tube, mat) {
    return P.torus(R, tube, mat, 0, 0, 0, 64);
  }

  /* —— 部件构建器 —— */

  function buildBase() {     // 基座:十字水槽座 + 水面(调平示意)
    var g = group();
    var slab = new THREE.MeshStandardMaterial({ color: 0x6E7076, roughness: 0.92, metalness: 0.04 });
    g.add(P.box(2.10, 0.14, 2.10, slab, 0, 0.07, 0));
    g.add(P.box(0.55, D.baseH - 0.14, 0.55, slab, 0, (D.baseH - 0.14) / 2 + 0.14, 0));
    /* 十字水槽 */
    var groove = new THREE.MeshStandardMaterial({ color: 0x35383E, roughness: 0.95 });
    g.add(P.box(1.90, 0.05, 0.10, groove, 0, 0.15, 0.62));
    g.add(P.box(1.90, 0.05, 0.10, groove, 0, 0.15, -0.62));
    g.add(P.box(0.10, 0.05, 1.14, groove, 0.62, 0.15, 0.05));
    g.add(P.box(0.10, 0.05, 1.14, groove, -0.62, 0.15, 0.05));
    var water = P.mesh(new THREE.PlaneGeometry(1.78, 0.075), M3.water, 0, 0.16, 0.62);
    water.rotation.x = -Math.PI / 2;
    water.castShadow = false;
    g.add(water);
    var water2 = water.clone();
    water2.position.z = -0.62;
    g.add(water2);
    return { group: g, anchor: mkAnchor(0.7, 0.25, 0.65) };
  }

  function buildColumns() {  // 龙柱 ×4:斜柱承子午环 bearings
    var g = group();
    [[-0.72, -0.72], [0.72, -0.72], [-0.72, 0.72], [0.72, 0.72]].forEach(function (p) {
      var col = P.cyl(0.055, 0.075, 1.55, plankLocal(), p[0], (D.hubY - 0.1) / 2 + 0.10, p[1], 10);
      col.rotation.z = p[0] > 0 ? -0.20 : 0.20;
      col.rotation.x = p[1] > 0 ? 0.16 : -0.16;
      g.add(col);
      g.add(P.box(0.26, 0.08, 0.26, M3.stone, p[0], 0.04, p[1]));
    });
    /* 顶横枋环托 */
    g.add(P.box(1.60, 0.08, 0.10, M3.woodD, 0, D.hubY - D.RMeridian + 0.02, -0.72));
    g.add(P.box(1.60, 0.08, 0.10, M3.woodD, 0, D.hubY - D.RMeridian + 0.02, 0.72));
    return { group: g, anchor: mkAnchor(0.78, 0.8, 0.75) };
  }

  function buildMeridian() { // 子午双环(固定,法向 x̂ 东):双环错位 ±0.06
    var g = group();
    var r1 = ringMesh(D.RMeridian, 0.032, M3.bronze);
    g.add(r1);
    var r2 = P.torus(D.RMeridian, 0.032, M3.bronze, 0, 0, 0.12, 64);
    g.add(r2);
    return { group: g, anchor: mkAnchor(D.RMeridian - 0.05, 0.18, 0) };
  }

  function buildHorizon() {  // 地平环(固定,法向 ŷ 上)+ 24 刻度
    var g = group();
    g.add(ringMesh(D.RHorizon, 0.036, M3.bronze));
    for (var i = 0; i < 24; i++) {
      var a = i / 24 * Math.PI * 2;
      g.add(P.box(0.03, 0.022, 0.016, M3.gold, Math.cos(a) * D.RHorizon, 0.012, Math.sin(a) * D.RHorizon));
    }
    return { group: g, anchor: mkAnchor(D.RHorizon - 0.04, 0.16, 0.1) };
  }

  function buildEquator() {  // 三辰仪·赤道环+黄道环(法向 极轴/黄极)
    var g = group();
    g.add(ringMesh(D.REquator, 0.034, M3.bronze));
    for (var i = 0; i < 28; i++) {
      var a = i / 28 * Math.PI * 2;
      g.add(P.box(0.028, 0.02, 0.014, M3.gold, Math.cos(a) * D.REquator, 0.011, Math.sin(a) * D.REquator));
    }
    var ecl = P.torus(D.REcliptic, 0.028, M3.gold, 0, 0, 0, 56);
    g.add(ecl);
    return { group: g, anchor: mkAnchor(D.REquator - 0.05, 0.16, 0.05) };
  }

  function buildSolstice() { // 二至圈(法向 m(α) 随三辰转):单环 + 极轴杆
    var g = group();
    g.add(ringMesh(D.RSolstice, 0.03, M3.steel));
    var axle = P.cyl(0.028, 0.028, 1.90, M3.steelD, 0, 0, 0, 10);
    axle.rotation.x = P.ROTX;   // 轴沿局部 z(=法向)
    g.add(axle);
    return { group: g, anchor: mkAnchor(D.RSolstice - 0.05, 0.18, 0.05) };
  }

  function buildFour() {     // 四游仪:双环 + 窥管(法向 a(α),管指 d(α,δ))
    var g = group();
    g.add(ringMesh(D.RFour, 0.028, M3.steel));
    var r2 = P.torus(D.RFour, 0.028, M3.steel, 0, 0, 0.10, 56);
    g.add(r2);
    var tube = P.cyl(D.tubeR, D.tubeR, D.tubeL, M3.bronze, 0, 0, 0, 14);
    tube.rotation.x = P.ROTX;   // 管沿局部 +z(=指向 d)
    g.add(tube);
    var collar = P.torus(D.tubeR + 0.012, 0.014, M3.gold, 0, 0, D.tubeL / 2 - 0.02, 14);
    g.add(collar);
    return { group: g, anchor: mkAnchor(D.RFour - 0.05, 0.18, 0.06) };
  }

  var _plank = null;
  function plankLocal() {
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

  function buildStar() {     // 星标:织女星(小球 + 光晕,指向时出现)
    var g = group();
    var star = P.sph(0.05, M3.gold, 0, 0, 0);
    g.add(star);
    var glow = P.mesh(new THREE.PlaneGeometry(0.42, 0.42),
      new THREE.MeshBasicMaterial({ color: 0xE9C93C, transparent: true, opacity: 0.5, depthWrite: false }),
      0, 0, 0);
    g.add(glow);
    g.userData.glow = glow;
    return { group: g, anchor: g };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "base", name: "BASE · 十字水槽座", sub: "调平水槽 · 基高 0.22", phase: 0, at: 0.2, dur: 1.5,
      build: buildBase, target: [0, 0, 0], start: [0, 4.2, 0], mid: [0, 2.1, 0] });
    def({ id: "columns", name: "DRAGON COLUMNS · 龙柱", sub: "四斜柱 · 承子午环", phase: 0, at: 1.6, dur: 1.5,
      build: buildColumns, target: [0, 0, 0], start: [0, 4.6, 0.4], mid: [0, 2.3, 0.2] });

    def({ id: "meridian", name: "MERIDIAN · 子午双环", sub: "六合仪 · 固定 · 法向东", phase: 1, at: 7.4, dur: 1.6, kind: "kine",
      build: buildMeridian, target: [0, D.hubY, 0], off: [0.9, 2.2, 0.8] });
    def({ id: "horizon", name: "HORIZON · 地平环", sub: "六合仪 · 24 刻度", phase: 1, at: 8.6, dur: 1.5, kind: "kine",
      build: buildHorizon, target: [0, D.hubY, 0], off: [0.9, 2.0, -0.8] });

    def({ id: "equator", name: "EQUATOR · 赤道黄道环", sub: "三辰仪 · 法向极轴/黄极", phase: 2, at: 13.4, dur: 1.6, kind: "kine",
      build: buildEquator, target: [0, D.hubY, 0], off: [0.8, 2.0, 0.8] });
    def({ id: "solstice", name: "SOLSTICE · 二至圈", sub: "绕极轴周天 · 随 α", phase: 2, at: 14.7, dur: 1.5, kind: "kine",
      build: buildSolstice, target: [0, D.hubY, 0], off: [-0.8, 2.0, 0.8] });

    def({ id: "four", name: "FOUR RINGS · 四游仪窥管", sub: "指任意赤经赤纬", phase: 3, at: 19.4, dur: 1.6, kind: "kine",
      build: buildFour, target: [0, D.hubY, 0], off: [0.8, 2.2, -0.7] });
    def({ id: "star", name: "STAR · 织女星标", sub: "α 280° · δ +38.8°", phase: 4, at: 24.6, dur: 1.2, kind: "kine",
      build: buildStar, target: [0, D.hubY + 2.0, 0.9], off: [0.4, 1.2, 0.6] });
  };

  /* —— 运动学分发 ——
     各环法向四元数:子午 x̂ / 地平 ŷ / 赤道 n / 黄道 nEcl / 二至 m(α) /
     四游 a(α) / 窥管沿 d(α,δ);星标 = C + d·starDist;
     errPos = 窥管口世界位置 vs C + d·tubeL/2(应≈0)。 */
  var _wp = new THREE.Vector3(), _v = new THREE.Vector3(), _q = new THREE.Quaternion();
  function quatFromNormal(entry, nx, ny, nz) {
    _v.set(nx, ny, nz).normalize();
    _q.setFromUnitVectors(ZAX, _v);
    entry.group.quaternion.copy(_q);
    entry.group.position.set(0, D.hubY, 0);
  }
  MECH.KINE = function (st) {
    var alpha = st.alpha != null ? st.alpha : 0;
    var delta = st.delta != null ? st.delta : 0;
    var aiming = st.aiming || false;
    var n = KS.polarAxis(), nE = KS.eclipticNormal(), m = KS.solsticeNormal(alpha), d = KS.aimDir(alpha, delta);

    var md = MECH.Parts.entry("meridian");
    if (md && md.sealed) quatFromNormal(md, 1, 0, 0);
    var hz = MECH.Parts.entry("horizon");
    if (hz && hz.sealed) quatFromNormal(hz, 0, 1, 0);
    var eq = MECH.Parts.entry("equator");
    if (eq && eq.sealed) quatFromNormal(eq, n[0], n[1], n[2]);
    var so = MECH.Parts.entry("solstice");
    if (so && so.sealed) quatFromNormal(so, m[0], m[1], m[2]);
    var fr = MECH.Parts.entry("four");
    if (fr && fr.sealed) quatFromNormal(fr, d[0], d[1], d[2]);

    st.errPos = 0;
    if (fr && fr.sealed) {
      /* 窥管口:局部 (0,0,tubeL/2) 世界位置 vs 解析 C + d·L/2 */
      fr.group.updateWorldMatrix(true, false);
      _wp.set(0, 0, D.tubeL / 2).applyMatrix4(fr.group.matrixWorld);
      var tx = d[0] * D.tubeL / 2, ty = D.hubY + d[1] * D.tubeL / 2, tz = d[2] * D.tubeL / 2;
      var dx = _wp.x - tx, dy = _wp.y - ty, dz = _wp.z - tz;
      st.errPos = Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /* 星标 */
    var sr = MECH.Parts.entry("star");
    if (sr && sr.sealed) {
      sr.group.visible = aiming;
      var sy2 = Math.max(0.12, D.hubY + d[1] * D.starDist);
      sr.group.position.set(d[0] * D.starDist, sy2, d[2] * D.starDist);
      var glow = sr.group.userData.glow;
      if (glow) glow.lookAt(0, D.hubY, 0);
    }
  };
})(window.MECH = window.MECH || {});
