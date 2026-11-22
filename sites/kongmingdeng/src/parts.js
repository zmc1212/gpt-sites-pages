/* 孔明灯部件建模与注册(7 件)。
   布局:庭院台地,灯(竹圈架+纸罩)初始系留于桩;燃料块燃于口内(火焰粒子);
   内热气粒子上升充腔;绳系灯底(离地后绳脱);高度标杆;蛋壳对照(万毕术)。
   kine:灯组 position.y = alt(tick 驱动);火焰/热气粒子 spawn。
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

  /* 庭院台地 */
  function buildYard() {
    var g = group();
    g.add(P.box(2.4, 0.10, 2.4, new THREE.MeshStandardMaterial({ color: 0x4A4438, roughness: 0.95 }), 0, 0.05, 0));
    g.add(P.box(2.2, 0.04, 2.2, new THREE.MeshStandardMaterial({ color: 0x5A5148, roughness: 0.95 }), 0, 0.105, 0));
    return { group: g, anchor: mkAnchor(1.0, 0.2, 0.8) };
  }

  /* 灯(竹圈架+纸罩,原点=口部中心,kine position.y = 口部高) */
  function buildLantern() {
    var g = group();
    var holder = group();
    var paper = new THREE.MeshStandardMaterial({ color: 0xE7D0A8, roughness: 0.9, side: THREE.DoubleSide });
    /* 球壳(开口朝下:半球缺) */
    var shell = P.mesh(new THREE.SphereGeometry(0.31, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), paper, 0, 0.30, 0);
    shell.castShadow = false;
    holder.add(shell);
    /* 竹圈口 + 中圈 */
    holder.add(P.torus(0.235, 0.010, M3.woodL, 0, 0.02, 0, 26));
    holder.add(P.torus(0.26, 0.008, M3.woodL, 0, 0.28, 0, 26));
    /* 竖篾 6 */
    for (var i = 0; i < 6; i++) {
      var a = i / 6 * Math.PI * 2;
      var rib = P.box(0.008, 0.26, 0.008, M3.woodL, Math.sin(a) * 0.25, 0.26, Math.cos(a) * 0.25);
      rib.rotation.y = -a;
      rib.rotation.x = 0.18;
      holder.add(rib);
    }
    /* 燃料架(口内) */
    holder.add(P.cyl(0.06, 0.06, 0.02, M3.woodD, 0, 0.015, 0, 12));
    /* 系绳点 */
    holder.add(mkAnchor(0.22, 0.02, 0));
    g.add(holder);
    g.userData.anim = { holder: holder };
    return { group: g, anchor: mkAnchor(0.24, 0.35, 0) };
  }

  /* 燃料块(口内燃块)——tick 火焰粒子在灯组局部,由灯组 KINE 带动 */
  function buildFuel() {
    var g = group();
    var block = P.cyl(0.05, 0.06, 0.045, new THREE.MeshStandardMaterial({ color: 0x2E2620, roughness: 0.9, emissive: 0x552200 }),
      0, 0.05, 0, 12);
    g.add(block);
    g.userData.anim = { block: block };
    return { group: g, anchor: mkAnchor(0, 0.10, 0) };
  }

  /* 系留桩+绳 */
  function buildTether() {
    var g = group();
    g.add(P.cyl(0.03, 0.035, 0.22, M3.woodD, 0.55, 0.22, 0.30, 10));
    var rope = P.cyl(0.008, 0.008, 0.62, M3.rope, 0.28, 0.30, 0.16, 6);
    rope.rotation.z = 0.85;
    rope.castShadow = false;
    g.add(rope);
    g.userData.anim = { rope: rope };
    return { group: g, anchor: mkAnchor(0.55, 0.40, 0.30) };
  }

  /* 高度标杆(0-3m) */
  function buildPole() {
    var g = group();
    g.add(P.cyl(0.02, 0.02, 3.2, M3.woodD, -0.95, 1.6, -0.6, 10));
    for (var i = 0; i <= 6; i++) {
      g.add(P.box(0.10, 0.014, 0.014, M3.gold, -0.95, 0.15 + i * 0.5, -0.6));
    }
    return { group: g, anchor: mkAnchor(-0.95, 3.3, -0.6) };
  }

  /* 蛋壳对照(万毕术,案上) */
  function buildEgg() {
    var g = group();
    g.add(P.sph(0.035, new THREE.MeshStandardMaterial({ color: 0xD8CBA8, roughness: 0.9 }), 0.62, 0.20, -0.35));
    g.add(P.cyl(0.02, 0.03, 0.05, M3.paper, 0.62, 0.13, -0.35, 10));
    g.add(P.box(0.14, 0.02, 0.10, M3.woodD, 0.62, 0.105, -0.35));
    return { group: g, anchor: mkAnchor(0.62, 0.30, -0.35) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "yard", name: "YARD · 庭院台地", sub: "系留起飞场", phase: 0, at: 0.2, dur: 1.0,
      build: buildYard, target: [0, 0, 0], start: [0, 1.6, -0.8], mid: [0, 0.9, -0.4], anchor: [1.0, 0.25, 0.8] });
    def({ id: "pole", name: "POLE · 高度标杆", sub: "0-3m 刻度", phase: 0, at: 0.9, dur: 1.0,
      build: buildPole, target: [0, 0, 0], start: [-1.2, 2.4, -0.8], mid: [-1.0, 1.4, -0.4], anchor: [-0.95, 3.0, -0.6] });
    def({ id: "tether", name: "TETHER · 系留桩绳", sub: "起飞判据未满时系留", phase: 0, at: 1.7, dur: 1.0,
      build: buildTether, target: [0, 0, 0], start: [0.9, 1.4, 0.8], mid: [0.7, 0.8, 0.5], anchor: [0.55, 0.4, 0.3] });

    def({ id: "lantern", name: "LANTERN · 灯体", sub: "竹圈纸罩 V0.30m³ · 壳55g", phase: 1, at: 5.3, dur: 1.4, kind: "kine",
      build: buildLantern, target: [0, 0, 0], off: [0.3, 1.2, 0.5] });
    def({ id: "fuel", name: "FUEL · 燃料块", sub: "松脂/浸油布 燃 90s", phase: 1, at: 6.6, dur: 1.1, kind: "kine",
      build: buildFuel, target: [0, 0, 0], off: [0.1, 0.9, 0.3] });
    def({ id: "egg", name: "EGG · 万毕术蛋壳", sub: "「艾火令鸡子飞」", phase: 2, at: 10.3, dur: 1.2,
      build: buildEgg, target: [0, 0, 0], start: [1.0, 1.6, -0.6], mid: [0.8, 0.9, -0.3], anchor: [0, 0.35, -0.35] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("lantern");
    if (e && e.shown && e.group.userData.anim) {
      e.group.userData.anim.holder.position.y = 0.12 + st.alt;
    }
    e = MECH.Parts.entry("fuel");
    if (e && e.shown && e.group.userData.anim) {
      e.group.userData.anim.block.position.y = 0.05 + st.alt + 0.02;
    }
    /* 系留绳:未离地连接桩-灯;离地垂落 */
    e = MECH.Parts.entry("tether");
    if (e && e.shown && e.group.userData.anim) {
      var r = e.group.userData.anim.rope;
      if (!st.released) {
        r.visible = true;
        r.position.set(0.28, 0.30, 0.16);
        r.rotation.z = 0.85;
        r.scale.y = 1;
      } else {
        r.visible = true;
        r.position.set(0.55, 0.16, 0.30);
        r.rotation.z = 0;
        r.scale.y = 0.5;
      }
    }
  };
})(window.MECH = window.MECH || {});
