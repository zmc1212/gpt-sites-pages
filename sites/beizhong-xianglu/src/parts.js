/* 被中香炉部件建模与注册(10 件)。
   层级:壳(qz·qx)→ 环1(qx⁻¹)→ 环2(qz⁻¹)→ 炉体(恒平)。
   壳上开镂空孔,炉内香料火点 + 烟粒子;锦缎垫(world 装饰)。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;

  function group() { return new THREE.Group(); }

  function buildCloth() {   // 锦缎垫(world)
    var g = group();
    g.add(P.cyl(1.1, 1.1, 0.03, new THREE.MeshStandardMaterial({ color: 0x7A3B4A, roughness: 0.95 }), 0, 0.015, 0, 40));
    g.add(P.torus(0.7, 0.015, M3.gold, 0, 0.035, 0, 40));
    g.children[1].rotation.x = P.ROTX;
    return g;
  }

  function buildShell() {   // 外壳:镂空球壳(上/下半壳 + 赤道环 + 铰耳×4)
    var g = group();
    var mat = new THREE.MeshStandardMaterial({ color: 0x8A6E3F, metalness: 0.62, roughness: 0.42, side: THREE.DoubleSide });
    var top = new THREE.Mesh(new THREE.SphereGeometry(D.shellR, 28, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), mat);
    g.add(top);
    var bot = new THREE.Mesh(new THREE.SphereGeometry(D.shellR, 28, 10, 0, Math.PI * 2, Math.PI * 0.58, Math.PI * 0.42), mat);
    g.add(bot);
    var ring = P.torus(D.shellR * Math.sin(Math.PI * 0.5), 0.012, M3.gold, 0, 0, 0, 40);
    ring.rotation.x = P.ROTX;
    g.add(ring);
    /* 铰耳 ×4(±X,±Z) */
    for (var k = 0; k < 4; k++) {
      var a = k * Math.PI / 2;
      var lug = P.box(0.05, 0.03, 0.05, M3.bronze, Math.cos(a) * D.shellR, 0, Math.sin(a) * D.shellR);
      g.add(lug);
    }
    /* 镂空纹(示意小环 ×3) */
    [0.45, 0.0, -0.45].forEach(function (y) {
      var r = Math.sqrt(Math.max(0, D.shellR * D.shellR - (D.shellR * y) * (D.shellR * y)));
      var deco = P.torus(Math.min(r, D.shellR * 0.9), 0.006, M3.bronze, 0, D.shellR * y * 0.9, 0, 30);
      deco.rotation.x = P.ROTX;
      g.add(deco);
    });
    return { group: g };
  }

  function buildRing1() {   // 环1:枢轴耳(±X)
    var g = group();
    var ring = P.torus(D.ring1R, 0.014, M3.gold, 0, 0, 0, 36);
    g.add(ring);
    [-1, 1].forEach(function (s) {
      g.add(P.box(0.04, 0.04, 0.03, M3.bronze, s * D.ring1R, 0, 0));
    });
    return { group: g };
  }

  function buildRing2() {   // 环2:枢轴耳(±Z)
    var g = group();
    var ring = P.torus(D.ring2R, 0.014, M3.gold, 0, 0, 0, 36);
    ring.rotation.y = Math.PI / 2;
    g.add(ring);
    [-1, 1].forEach(function (s) {
      g.add(P.box(0.03, 0.04, 0.04, M3.bronze, 0, 0, s * D.ring2R));
    });
    return { group: g };
  }

  function buildBurner() {   // 炉体:碗 + 盖 + 火点
    var g = group();
    var bowl = P.cyl(D.burnerR, D.burnerR * 0.72, D.burnerH, M3.bronze, 0, 0, 0, 24);
    g.add(bowl);
    g.add(P.torus(D.burnerR, 0.012, M3.gold, 0, D.burnerH / 2, 0, 26));
    g.children[1].rotation.x = P.ROTX;
    var ash = P.cyl(D.burnerR * 0.78, D.burnerR * 0.7, 0.02, new THREE.MeshStandardMaterial({ color: 0x9C927E, roughness: 1 }), 0, D.burnerH / 2 - 0.02, 0, 18);
    g.add(ash);
    var ember = P.sph(0.02, new THREE.MeshStandardMaterial({ color: 0xE8611C, emissive: 0xE8611C, emissiveIntensity: 1.6 }), 0.03, D.burnerH / 2 - 0.01, 0.01);
    g.add(ember);
    g.userData.ember = ember;
    return { group: g };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "cloth", name: "CLOTH · 锦缎垫", sub: "被褥场景 · world", phase: 0, kind: "none", world: true,
      build: buildCloth, target: [0, 0, 0] });
    def({ id: "shell", name: "SHELL · 镂空外壳", sub: "机环转运四周", phase: 0, at: 0.15, dur: 1.2, kind: "kine",
      build: buildShell, target: [0, D.shellR + 0.08, 0], off: [0, 1.6, 2.2] });
    def({ id: "ring1", name: "RING · 机环 1", sub: "枢轴 ±X · qx(−a)", phase: 1, at: 2.5, dur: 1.1, kind: "kine",
      build: buildRing1, target: [0, D.shellR + 0.08, 0], off: [0.6, 1.5, 1.8] });
    def({ id: "ring2", name: "RING · 机环 2", sub: "枢轴 ±Z · qz(−b)", phase: 1, at: 3.4, dur: 1.1, kind: "kine",
      build: buildRing2, target: [0, D.shellR + 0.08, 0], off: [-0.6, 1.5, 1.8] });
    def({ id: "burner", name: "BURNER · 炉体", sub: "炉体常平(世界恒水平)", phase: 2, at: 4.6, dur: 1.2, kind: "kine",
      build: buildBurner, target: [0, D.shellR + 0.08, 0], off: [0, 1.5, 1.4] });
  };

  /* —— 运动学分发:cardan 补偿链 —— */
  MECH.KINE = function (st) {
    var qShell = new THREE.Quaternion(), qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
    var AX = new THREE.Vector3(1, 0, 0), AZ = new THREE.Vector3(0, 0, 1);
    qa.setFromAxisAngle(AX, st.a);
    qb.setFromAxisAngle(AZ, st.b);
    qShell.setFromAxisAngle(AZ, st.b);
    var qt = new THREE.Quaternion().setFromAxisAngle(AX, st.a);
    qShell.multiply(qt);                     // 壳 = qz(b)·qx(a)
    var e = MECH.Parts.entry("shell");
    if (e && e.shown) e.group.quaternion.copy(qShell);
    e = MECH.Parts.entry("ring1");
    if (e && e.shown) e.group.quaternion.copy(qa.invert());
    e = MECH.Parts.entry("ring2");
    if (e && e.shown) e.group.quaternion.copy(qb.invert());
    /* 炉体:恒平(不补偿,层级已抵消) */
    e = MECH.Parts.entry("burner");
    if (e && e.shown) {
      e.group.rotation.set(0, 0, 0);
      var em = e.group.userData.ember;
      em.material.emissiveIntensity = st.lit ? 1.4 + Math.sin(st.time * 7) * 0.3 : 0;
    }
    /* 烟:点燃后缕缕上升(world 系) */
    if (st.lit && Math.random() < 0.02) {
      MECH.Scene3D.spawnPuff(0, D.shellR + 0.42, 0, {
        max: 1.6, base: 0.10, vx: 0.05, vy: 0.22, vz: 0.02,
        opacity: 0.35, tint: 0xC8C2B4, grow: 2.2
      });
    }
  };
})(window.MECH = window.MECH || {});
