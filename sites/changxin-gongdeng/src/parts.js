/* 长信宫灯部件建模与注册(10 件)。
   坐标系:y 上;灯盘心 (0.28, 1.28, 0.30);宫女跪坐面向 +x(灯在前)。
   KINE:双屏板 rotation.y = ±α;光锥 opacity/张角随 α;焰苗闪烁;
   剖视体腔 opacity 随阶段;errPos = 屏板外缘点 vs 解析(立轴 + 旋转)。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  var _bronze = null;
  function bronzeMat() {
    if (!_bronze) {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var x = c.getContext("2d");
      x.fillStyle = "#8A6E3F";
      x.fillRect(0, 0, 128, 128);
      for (var i = 0; i < 300; i++) {
        var g = 110 + Math.random() * 50;
        x.fillStyle = "rgba(" + (g | 0) + "," + ((g * 0.8) | 0) + "," + ((g * 0.45) | 0) + ",0.4)";
        x.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
      }
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      t.encoding = THREE.sRGBEncoding;
      _bronze = new THREE.MeshStandardMaterial({ map: t, metalness: 0.5, roughness: 0.5 });
    }
    return _bronze;
  }

  /* —— 部件构建器 —— */

  function buildBase() {    // 台座 + 跪裙(宫女下身)
    var g = group();
    var skirt = P.mesh(new THREE.CylinderGeometry(0.24, 0.40, 0.62, 18), bronzeMat(), 0, 0.31, 0);
    g.add(skirt);
    var hem = P.torus(0.36, 0.03, bronzeMat(), 0, 0.04, 0, 26);
    hem.rotation.x = P.ROTX;
    g.add(hem);
    /* 跪姿双腿隆起 */
    g.add(P.cyl(0.13, 0.17, 0.20, bronzeMat(), 0.10, 0.55, 0.05, 14));
    return { group: g, anchor: mkAnchor(0.2, 0.35, 0.2) };
  }

  function buildFigure() {  // 上身 + 头 + 发髻 + 左臂托灯
    var g = group();
    var torso = P.cyl(0.14, 0.19, 0.36, bronzeMat(), 0.02, 0.80, 0, 16);
    g.add(torso);
    g.add(P.sph(0.105, bronzeMat(), 0.05, 1.08, 0));
    g.add(P.mesh(new THREE.SphereGeometry(0.062, 14, 10), bronzeMat(), 0.03, 1.16, -0.03));  // 发髻
    /* 左臂(前伸托灯座) */
    var armL = P.cyl(0.045, 0.055, 0.26, bronzeMat(), 0.14, 0.94, 0.16, 10);
    armL.rotation.z = -1.05;
    armL.rotation.y = 0.35;
    g.add(armL);
    /* 衣袖纹 */
    g.add(P.torus(0.10, 0.012, bronzeMat(), 0.02, 0.70, 0, 18).rotation ? (function () {
      var t = P.torus(0.10, 0.012, bronzeMat(), 0.02, 0.70, 0, 18);
      t.rotation.x = P.ROTX;
      return t;
    })() : null);
    return { group: g, anchor: mkAnchor(0.1, 1.1, 0.15) };
  }

  function buildLampBase() { // 灯座(左手托举)+ 灯盘支架
    var g = group();
    g.add(P.cyl(0.10, 0.13, 0.10, bronzeMat(), D.panX - 0.02, D.panY - 0.14, D.panZ, 16));
    g.add(P.cyl(0.045, 0.045, 0.12, bronzeMat(), D.panX - 0.02, D.panY - 0.06, D.panZ, 10));
    return { group: g, anchor: mkAnchor(D.panX - 0.1, D.panY - 0.1, D.panZ + 0.1) };
  }

  function buildPan() {     // 灯盘:浅盘 + 火釜 + 双立轴(屏板铰点)
    var g = group();
    var pan = P.cyl(D.panR, D.panR * 0.85, 0.055, bronzeMat(), D.panX, D.panY, D.panZ, 24);
    g.add(pan);
    g.add(P.cyl(0.055, 0.05, 0.035, M3.iron, D.panX, D.panY + 0.035, D.panZ, 12));  // 火釜
    /* 双立轴(盘沿铰点,z 向两侧) */
    [1, -1].forEach(function (s) {
      g.add(P.cyl(0.016, 0.016, 0.14, M3.iron, D.panX, D.panY + 0.05, D.panZ + s * (D.panR - 0.02), 8));
    });
    return { group: g, anchor: mkAnchor(D.panX, D.panY + 0.06, D.panZ + 0.14) };
  }

  function buildFlame() {   // 火焰 + 光晕(kine 闪烁)
    var g = group();
    var flame = P.mesh(new THREE.ConeGeometry(0.032, D.flameH, 10),
      new THREE.MeshStandardMaterial({ color: 0xE9A23C, emissive: 0xE98C2C, emissiveIntensity: 1.6, roughness: 0.4 }),
      0, 0, 0);
    g.add(flame);
    var glow = P.mesh(new THREE.PlaneGeometry(0.30, 0.30),
      new THREE.MeshBasicMaterial({ color: 0xE9C93C, transparent: true, opacity: 0.45, depthWrite: false }),
      0, 0.02, 0);
    g.add(glow);
    g.userData.flame = flame;
    g.userData.glow = glow;
    return { group: g, anchor: g };
  }

  function buildPanel(side) { // 弧形屏板(绕立轴 ±α)
    var g = group();
    /* 弧形板:部分圆柱面(竖板,弧向 ±z) */
    var shell = P.mesh(new THREE.CylinderGeometry(D.panR + 0.015, D.panR + 0.015, 0.17, 14, 1, true, side > 0 ? -0.85 : 0.85, 0.85),
      new THREE.MeshStandardMaterial({ color: 0x9C8B5F, metalness: 0.45, roughness: 0.45, side: THREE.DoubleSide }),
      0, 0.09, 0);
    g.add(shell);
    /* 握钮 */
    g.add(P.sph(0.02, M3.gold, 0, 0.09, side * (D.panR - 0.05)));
    return { group: g, anchor: mkAnchor(0, 0.12, side * (D.panR - 0.03)) };
  }

  function buildDuct() {    // 右袖烟道:上举右袖(弯管)+ 体腔剖视 + 水盘
    var g = group();
    /* 右袖上举(两段弯管) */
    var upper = P.cyl(0.075, 0.09, 0.34, bronzeMat(), 0.24, 1.50, -0.06, 12);
    upper.rotation.z = -0.35;
    g.add(upper);
    var bend = P.cyl(0.075, 0.085, 0.30, bronzeMat(), 0.10, 1.68, -0.10, 12);
    bend.rotation.z = 0.9;
    g.add(bend);
    /* 体腔(剖视,半透明) */
    var bodyGhost = P.mesh(new THREE.CylinderGeometry(0.21, 0.24, 0.44, 16, 1, false),
      new THREE.MeshStandardMaterial({ color: 0x8A6E3F, metalness: 0.4, roughness: 0.5, transparent: true, opacity: 0.30 }),
      0.02, 0.68, 0);
    g.add(bodyGhost);
    /* 体腔水盘 */
    var water = P.mesh(new THREE.CircleGeometry(0.17, 18), M3.water, 0.02, 0.95, 0);
    water.rotation.x = -Math.PI / 2;
    water.castShadow = false;
    g.add(water);
    g.userData.bodyGhost = bodyGhost;
    return { group: g, anchor: mkAnchor(0.25, 1.65, -0.05) };
  }

  function buildCone() {    // 光锥(半透明锥,随 α 张角与亮度,kine)
    var g = group();
    var cone = P.mesh(new THREE.ConeGeometry(0.30, 0.85, 20, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xE9C93C, transparent: true, opacity: 0.0, depthWrite: false, side: THREE.DoubleSide }),
      0, 0, 0);
    cone.rotation.x = Math.PI;   // 尖朝下对火焰
    g.add(cone);
    g.userData.cone = cone;
    return { group: g, anchor: mkAnchor(D.panX + 0.1, D.panY + 0.55, D.panZ + 0.3) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "base", name: "BASE · 台座跪裙", sub: "跪坐下身 · 圆座", phase: 0, at: 0.2, dur: 1.5,
      build: buildBase, target: [0, 0, 0], start: [0, 4.2, 0], mid: [0, 2.1, 0] });
    def({ id: "figure", name: "FIGURE · 宫女上身", sub: "头髻 · 左臂托灯", phase: 0, at: 1.7, dur: 1.5,
      build: buildFigure, target: [0, 0, 0], start: [0, 4.6, 0.3], mid: [0, 2.3, 0.15] });

    def({ id: "lampBase", name: "LAMP BASE · 灯座", sub: "左手托举", phase: 1, at: 7.6, dur: 1.3,
      build: buildLampBase, target: [0, 0, 0], start: [0.4, 3.4, 0.6], mid: [0.3, 1.7, 0.3] });
    def({ id: "pan", name: "PAN · 灯盘火釜", sub: "盘 R 0.20 · 双立轴", phase: 1, at: 8.8, dur: 1.4,
      build: buildPan, target: [0, 0, 0], start: [0.4, 3.8, 0.5], mid: [0.3, 1.9, 0.25] });

    def({ id: "panelL", name: "PANEL · 屏板 L", sub: "弧板 · 绕立轴 −α", phase: 2, at: 13.6, dur: 1.3, kind: "kine",
      build: function () { return buildPanel(-1); }, target: [D.panX, D.panY, D.panZ], off: [-0.5, 1.6, 0.7] });
    def({ id: "panelR", name: "PANEL · 屏板 R", sub: "弧板 · 绕立轴 +α", phase: 2, at: 14.4, dur: 1.3, kind: "kine",
      build: function () { return buildPanel(1); }, target: [D.panX, D.panY, D.panZ], off: [0.5, 1.6, 0.7] });

    def({ id: "flame", name: "FLAME · 火焰光晕", sub: "闪烁 · 烟源", phase: 3, at: 18.4, dur: 1.2, kind: "kine",
      build: buildFlame, target: [D.panX, D.panY + 0.06, D.panZ], off: [0.3, 1.2, 0.6] });
    def({ id: "duct", name: "DUCT · 右袖烟道体腔", sub: "剖视 · 水盘溶烟", phase: 3, at: 19.3, dur: 1.4,
      build: buildDuct, target: [0, 0, 0], start: [0.2, 3.8, -0.5], mid: [0.1, 1.9, -0.25] });

    def({ id: "cone", name: "LIGHT CONE · 光锥", sub: "β = 0.8α · 随开度", phase: 4, at: 24.2, dur: 1.2, kind: "kine",
      build: buildCone, target: [D.panX, D.panY + 0.55, D.panZ + 0.3], off: [0.4, 1.4, 0.7] });
  };

  /* —— 运动学分发 ——
     双屏板 rotation.y = ±α;光锥 opacity = I·0.5,张角 = β;
     焰苗闪烁;烟粒子沿样条(火→袖→腔水);errPos = 屏板外缘 vs 解析。 */
  var _wp = new THREE.Vector3();
  MECH.KINE = function (st) {
    var alpha = st.alpha != null ? st.alpha : 0;      // 度
    var alphaRad = KS.rad(alpha);
    var lit = st.lit || false;

    var pl = MECH.Parts.entry("panelL");
    if (pl && pl.shown) pl.group.rotation.y = -alphaRad;
    var pr = MECH.Parts.entry("panelR");
    if (pr && pr.shown) pr.group.rotation.y = alphaRad;

    st.errPos = 0;
    if (pr && pr.sealed) {
      pr.group.updateWorldMatrix(true, false);
      /* 屏板外缘点:局部 (0, 0.09, (panR−0.03)·? ) 随 +α 转 */
      _wp.set(0, 0.09, D.panR - 0.03).applyMatrix4(pr.group.matrixWorld);
      var ex = D.panX + Math.sin(alphaRad) * (D.panR - 0.03);
      var ez = D.panZ + Math.cos(alphaRad) * (D.panR - 0.03);
      var ey = D.panY + 0.09;
      st.errPos = Math.sqrt((_wp.x - ex) * (_wp.x - ex) + (_wp.y - ey) * (_wp.y - ey) + (_wp.z - ez) * (_wp.z - ez));
    }

    /* 光锥 */
    var cn = MECH.Parts.entry("cone");
    if (cn && cn.sealed && cn.group.userData.cone) {
      var cone = cn.group.userData.cone;
      var I = D.brightness(alpha);
      cone.material.opacity = lit ? 0.30 * I : 0;
      var beta = KS.rad(D.coneAngle(alpha));
      var spread = 0.30 + 0.55 * Math.sin(beta / 2);
      cone.scale.set(spread / 0.30, 1, spread / 0.30);
    }

    /* 焰苗闪烁 */
    var fm = MECH.Parts.entry("flame");
    if (fm && fm.shown && fm.group.userData.flame) {
      var fl = 0.8 + 0.25 * Math.sin(st.time * 11) + 0.10 * Math.sin(st.time * 23);
      fm.group.userData.flame.scale.set(1, fl, 1);
      fm.group.userData.flame.visible = lit;
      if (fm.group.userData.glow) {
        fm.group.userData.glow.visible = lit;
        fm.group.userData.glow.material.opacity = 0.45 * D.brightness(alpha) * (0.8 + 0.2 * Math.sin(st.time * 9));
      }
    }

    /* 剖视体腔(阶段 5+ 半透明常开) */
    var du = MECH.Parts.entry("duct");
    if (du && du.shown && du.group.userData.bodyGhost) {
      du.group.userData.bodyGhost.material.opacity = st.cutaway ? 0.30 : 0.16;
    }
  };
})(window.MECH = window.MECH || {});
