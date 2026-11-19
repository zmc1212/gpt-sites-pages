/* 水排部件建模与注册(16 件)。
   布局:立轮在 x-y 平面(z=+1.1)绕 Z 轴 CW 转;轴端曲柄销绕轴心回转;
   连杆接滑块(沿 X 往复),滑块经双短连杆驱动左右扇门开合鼓风。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;

  function group() { return new THREE.Group(); }

  function buildPond() {
    var g = group();
    var water = P.mesh(new THREE.PlaneGeometry(3.4, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x2E6E8E, transparent: true, opacity: 0.6, roughness: 0.24 }), -1.6, D.waterY, 1.1, false, true);
    water.rotation.x = -Math.PI / 2;
    g.add(water);
    g.add(P.box(0.26, 0.5, 2.9, M3.stone, -3.2, 0.25, 1.1));
    return g;
  }

  function buildFrame() {   // 轴承支架
    var g = group();
    [-0.6, 1.5].forEach(function (z) {
      g.add(P.box(0.20, D.yC + 0.18, 0.20, M3.woodD, 0, (D.yC + 0.18) / 2, z));
      g.add(P.cyl(0.09, 0.09, 0.14, M3.iron, 0, D.yC, z, 12));
      g.add(P.box(0.34, 0.10, 0.46, M3.stone, 0, 0.05, z));
    });
    return g;
  }

  function buildWheel() {
    var g = group();
    g.add(P.torus(D.R, 0.06, M3.woodD, 0, 0, 0, 44));
    g.add(P.torus(D.R - 0.17, 0.045, M3.wood, 0, 0, 0, 40));
    for (var i = 0; i < 10; i++) {
      var a = i / 10 * Math.PI * 2;
      var s = P.box(0.06, D.R - 0.15, 0.05, M3.wood, 0, 0, 0);
      s.position.set(Math.cos(a) * (0.13 + (D.R - 0.15) / 2), Math.sin(a) * (0.13 + (D.R - 0.15) / 2), 0);
      s.rotation.z = a - Math.PI / 2;
      g.add(s);
    }
    for (var j = 0; j < 8; j++) {
      var a2 = j / 8 * Math.PI * 2 + Math.PI / 12;
      var b = P.box(0.42, 0.15, 0.02, M3.woodL, 0, 0, 0);
      b.position.set(Math.cos(a2) * (D.R - 0.30), Math.sin(a2) * (D.R - 0.30), 0.09);
      b.rotation.z = a2 + Math.PI / 2;
      g.add(b);
    }
    var hub = P.cyl(0.12, 0.12, 0.24, M3.woodD, 0, 0, 0, 14);
    hub.rotation.x = P.ROTX;
    g.add(hub);
    return { group: g };
  }

  function buildCrank() {   // 轴端曲柄盘 + 销
    var g = group();
    var disk = P.cyl(D.r + 0.06, D.r + 0.06, 0.05, M3.woodD, 0, 0, 0, 20);
    disk.rotation.x = P.ROTX;
    g.add(disk);
    var arm = P.box(D.r + 0.06, 0.06, 0.05, M3.woodD, (D.r + 0.06) / 2 - 0.02, 0, 0);
    g.add(arm);
    var pin = P.cyl(0.035, 0.035, 0.12, M3.iron, D.r, 0, 0.05, 10);
    pin.rotation.x = P.ROTX;
    g.add(pin);
    return { group: g };
  }

  function buildRod() {   // 连杆(销→滑块)
    var g = group();
    var rod = P.cyl(0.032, 0.032, 1, M3.woodL, 0, 0, 0, 10);
    rod.rotation.y = Math.PI / 2;
    g.add(rod);
    g.userData.rod = rod;
    return { group: g };
  }

  function buildSlide() {   // 滑块 + 导轨
    var g = group();
    g.add(P.box(0.16, 0.10, 0.12, M3.iron, 0, 0, 0));
    var railL = P.box(1.4, 0.05, 0.05, M3.woodD, -0.4, -0.08, 0.09);
    g.add(railL);
    var railR = P.box(1.4, 0.05, 0.05, M3.woodD, -0.4, -0.08, -0.09);
    g.add(railR);
    [[-0.75, 0.16], [-0.75, -0.16], [0.30, 0.16], [0.30, -0.16]].forEach(function (c) {
      g.add(P.box(0.07, 0.36, 0.07, M3.woodD, c[0], 0.10, c[1]));
    });
    return { group: g };
  }

  function buildBellows() {   // 门式风箱:箱体 + 左右扇门 + 风口
    var g = group();
    g.add(P.box(D.boxW + 0.10, D.boxH, 0.05, M3.woodD, 0, 0, -D.boxD / 2));   // 背板
    g.add(P.box(D.boxW + 0.10, 0.05, D.boxD + 0.06, M3.woodD, 0, -D.boxH / 2, 0));
    g.add(P.box(D.boxW + 0.10, 0.05, D.boxD + 0.06, M3.woodD, 0, D.boxH / 2, 0));
    g.add(P.box(0.05, D.boxH, D.boxD, M3.woodD, -(D.boxW / 2 + 0.02), 0, 0));
    var doors = [];
    for (var s = -1; s <= 1; s += 2) {
      var pivot = group();
      var door = P.box(D.boxW * 0.46, D.boxH - 0.06, 0.04, M3.woodL, D.boxW * 0.23, 0, 0);
      pivot.add(door);
      pivot.position.set(s * D.boxW / 2, 0, D.boxD / 2);
      pivot.rotation.y = s * 0.5;                       // 初始半开
      g.add(pivot);
      doors.push({ pivot: pivot, sign: s });
    }
    /* 风口(右侧接风道) */
    var pipe = P.cyl(0.07, 0.085, 0.5, M3.woodD, D.boxW / 2 + 0.30, -0.06, 0, 12);
    pipe.rotation.z = P.ROTZ;
    g.add(pipe);
    g.userData.doors = doors;
    return { group: g };
  }

  function buildForge() {
    var g = group();
    g.add(P.cyl(0.28, 0.34, 0.5, M3.stone, 1.75, 0.25, 0, 20));
    var flame = group();
    for (var i = 0; i < 3; i++) {
      var f = P.mesh(new THREE.ConeGeometry(0.09 - i * 0.02, 0.30 - i * 0.06, 8),
        new THREE.MeshStandardMaterial({ color: 0xE8611C, emissive: 0xE8611C, emissiveIntensity: 1.15, transparent: true, opacity: 0.85 }),
        (i - 1) * 0.06, 0.15, 0);
      flame.add(f);
    }
    flame.position.set(1.75, 0.56, 0);
    g.add(flame);
    g.userData.flame = flame;
    return { group: g };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "pond", name: "POND · 水池", sub: "冲立轮下缘", phase: 0, kind: "none", world: true,
      build: buildPond, target: [0, 0, 0] });
    def({ id: "frame", name: "FRAME · 轴承支架", sub: "双柱石础", phase: 0, at: 0.15, dur: 1.1,
      build: buildFrame, target: [0, 0, 0], start: [0, 4.6, 2.8], mid: [0, 2.6, 1.2], anchor: [0, 1.4, 0.5] });
    def({ id: "wheel", name: "WHEEL · 立轮", sub: "R 1.4 · 水驱动", phase: 0, at: 1.4, dur: 1.3, kind: "kine",
      build: buildWheel, target: [0, D.yC, 1.1], off: [0, 1.0, 7.0] });
    def({ id: "crank", name: "CRANK · 曲柄盘+销", sub: "r 0.24 · 轴端", phase: 1, at: 3.6, dur: 1.0, kind: "kine",
      build: buildCrank, target: [0, D.yC, 1.42], off: [0, 1.6, 1.6] });
    def({ id: "rod", name: "ROD · 连杆", sub: "l 0.92 · λ=0.26", phase: 1, at: 4.4, dur: 1.0, kind: "kine",
      build: buildRod, target: [0, 0, 0], off: [0, 1.4, 2.2] });
    def({ id: "slide", name: "SLIDER · 滑块导轨", sub: "行程 2r = 0.48", phase: 1, at: 5.2, dur: 1.1, kind: "kine",
      build: buildSlide, target: [0, D.yC - 0.34, 0.42], off: [0, 1.6, 2.4] });
    def({ id: "bellows", name: "BELLOW · 门式风箱", sub: "双扇门开合鼓风", phase: 2, at: 7.4, dur: 1.4, kind: "kine",
      build: buildBellows, target: [0.55, D.yC - 0.34, 0.42], off: [0, 1.6, 2.2] });
    def({ id: "forge", name: "FORGE · 冶炉", sub: "水力鼓风", phase: 3, at: 10.4, dur: 1.1,
      build: buildForge, target: [0, 0, 0], start: [3.0, 2.6, -1.4], mid: [2.0, 1.5, -0.7], anchor: [0, 0.5, 0.4] });
  };

  /* —— 运动学分发 —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("wheel");
    if (e && e.shown) e.group.rotation.z = -st.phi;
    /* 曲柄销位置(轴端 z=1.42,绕 Z 回转) */
    var pinX = D.r * Math.cos(st.phi), pinY = D.r * Math.sin(st.phi);
    e = MECH.Parts.entry("crank");
    if (e && e.shown) e.group.rotation.z = -st.phi;
    /* 滑块位置:曲柄中心 (0, yC−0.34? ) 滑块沿 X:slideBase − x(φ)? 标准:滑块 x = r cosφ + √(l²−r²sin²φ),相对曲柄中心 */
    var slideX = -st.slide;   // 滑块在曲柄中心左侧(连杆向左伸)
    var crankC = { x: 0, y: D.yC };
    e = MECH.Parts.entry("slide");
    if (e && e.shown) e.group.position.set(crankC.x + slideX + D.l * 0, D.yC - 0.34, 0.42);
    /* 连杆:销(x0,y0)→滑块铰(sx,sy) */
    var rodE = MECH.Parts.entry("rod");
    if (rodE && rodE.shown) {
      var sy = D.yC - 0.34 + 0.10;
      var sx = crankC.x + slideX;
      var px2 = crankC.x + pinX, py2 = crankC.y + pinY;
      var mx = (px2 + sx) / 2, my = (py2 + sy) / 2;
      var len = Math.hypot(sx - px2, sy - py2);
      var rod = rodE.group.userData.rod;
      rod.scale.y = len;
      rod.position.set(mx, my, (1.42 + 0.42) / 2);
      rod.rotation.z = Math.atan2(sy - py2, sx - px2) - Math.PI / 2;
      rod.rotation.x = 0;
    }
    /* 扇门:滑块内移 → 门闭 */
    e = MECH.Parts.entry("bellows");
    if (e && e.shown) {
      e.group.userData.doors.forEach(function (d) {
        d.pivot.rotation.y = d.sign * (0.5 - st.doorL * D.doorAngle);
      });
      var s2 = 0.7 + st.airflow * 0.45;
      var fg = MECH.Parts.entry("forge");
      if (fg && fg.shown) fg.group.userData.flame.scale.set(s2, s2, s2);
    }
  };
})(window.MECH = window.MECH || {});
