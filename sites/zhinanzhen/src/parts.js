/* 水浮指南针部件建模与注册(7 件)。
   布局:案几上置大碗(水),针穿三层灯草束浮于水面;针尖南端微偏东(稳态 ε);
   碗沿 24 向刻度盘(浮式罗盘);案几北面立「磁石磨针」示意牌;
   缕悬法对比小架(沈括四法:水浮/指甲/碗唇/缕悬——缕悬为最善,展示用)。
   kine:needle 组 rotation.y = θ针;碗(sway)写 rotation.z 晃动;缕悬对比针微摆。
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

  /* 案几 */
  function buildTable() {
    var g = group();
    g.add(P.box(0.72, 0.05, 0.52, M3.woodD, 0, 0.46, 0));
    [[-0.30, -0.20], [0.30, -0.20], [-0.30, 0.20], [0.30, 0.20]].forEach(function (p) {
      g.add(P.box(0.06, 0.44, 0.06, M3.wood, p[0], 0.22, p[1]));
    });
    return { group: g, anchor: mkAnchor(0, 0.62, -0.2) };
  }

  /* 碗(粗陶)+ 水 + 沿刻度盘 */
  function buildBowl() {
    var g = group();
    var holder = group();
    g.add(holder);
    var bowl = P.mesh(new THREE.SphereGeometry(D.bowlR, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x8C7E6A, roughness: 0.85, side: THREE.DoubleSide }),
      0, 0, 0);
    bowl.scale.y = 0.72;
    holder.add(bowl);
    var water = P.cyl(D.bowlR * 0.86, D.bowlR * 0.86, 0.02, M3.water, 0, D.waterY, 0, 26);
    water.castShadow = false;
    holder.add(water);
    /* 沿刻度盘(24 向) */
    for (var i = 0; i < 24; i++) {
      var a = i / 24 * Math.PI * 2;
      var major = i % 6 === 0;
      holder.add(P.box(major ? 0.030 : 0.016, 0.008, 0.004, M3.gold,
        Math.sin(a) * (D.bowlR - 0.02), D.waterY + 0.055, Math.cos(a) * (D.bowlR - 0.02)));
    }
    /* 北标(子) */
    holder.add(P.box(0.05, 0.02, 0.012, M3.paper, 0, D.waterY + 0.075, -(D.bowlR - 0.02)));
    g.userData.anim = { holder: holder };
    return { group: g, anchor: mkAnchor(0, 0.62, 0.22) };
  }

  /* 磁针 + 灯草束(kine:rotation.y = θ;原点=针中心) */
  function buildNeedle() {
    var g = group();
    var holder = group();
    holder.position.set(0, D.waterY + 0.012, 0);
    /* 灯草束(三层圆柱束) */
    for (var i = 0; i < 3; i++) {
      var a = i / 3 * Math.PI * 2;
      holder.add(P.cyl(D.strawR * 0.55, D.strawR * 0.55, 0.062, M3.paper,
        Math.sin(a) * D.strawR * 0.8, 0.008, Math.cos(a) * D.strawR * 0.8, 8));
    }
    /* 针(南北两段,南端红) */
    var matN = new THREE.MeshStandardMaterial({ color: 0x9AA0A6, metalness: 0.8, roughness: 0.3 });
    var south = P.cyl(0.0028, 0.0038, D.needleL / 2, matN, 0, 0.024, D.needleL / 4, 8);
    south.rotation.x = P.ROTX;
    holder.add(south);
    var north = P.cyl(0.0038, 0.0028, D.needleL / 2, matN, 0, 0.024, -D.needleL / 4, 8);
    north.rotation.x = P.ROTX;
    holder.add(north);
    holder.add(P.cone ? P.cone(0.006, 0.014, 8, matN, 0, 0.024, D.needleL / 2, 8) : null);
    var tip = holder.children[holder.children.length - 1];
    tip.rotation.x = P.ROTX;
    tip.rotation.x = Math.PI / 2;
    tip.position.set(0, 0.024, D.needleL / 2 + 0.007);
    g.add(holder);
    g.userData.anim = { holder: holder };
    return { group: g, anchor: mkAnchor(0, D.waterY + 0.12, D.needleL / 2) };
  }

  /* 磁石(磨针示意,案西北) */
  function buildMagnet() {
    var g = group();
    g.add(P.box(0.13, 0.09, 0.09, new THREE.MeshStandardMaterial({ color: 0x3E4045, roughness: 0.9 }),
      -0.22, 0.52, -0.14));
    g.add(P.box(0.006, 0.07, 0.004, M3.steel, -0.22, 0.585, -0.10));
    g.add(P.box(0.10, 0.02, 0.07, M3.woodL, -0.14, 0.50, -0.10));
    return { group: g, anchor: mkAnchor(-0.22, 0.68, -0.14) };
  }

  /* 缕悬法对比小架(沈括:缕悬为最善) */
  function buildHang() {
    var g = group();
    g.add(P.box(0.30, 0.03, 0.22, M3.woodD, 0.40, 0.98, 0));
    [[-0.12, -0.08], [0.12, -0.08], [-0.12, 0.08], [0.12, 0.08]].forEach(function (p) {
      g.add(P.box(0.04, 0.50, 0.04, M3.wood, 0.40 + p[0], 0.74, p[1]));
    });
    var line = P.cyl(0.003, 0.003, 0.34, M3.rope, 0.40, 0.81, 0, 6);
    line.castShadow = false;
    g.add(line);
    /* 悬针(水平小针,微摆 tick) */
    var hneedle = P.cyl(0.0022, 0.0028, 0.05, M3.steel, 0.40, 0.645, 0, 8);
    hneedle.rotation.z = P.ROTZ;
    g.add(hneedle);
    g.userData.anim = { needle: hneedle };
    return { group: g, anchor: mkAnchor(0.40, 1.05, 0) };
  }

  /* 沈括书卷(案角装饰) */
  function buildScroll() {
    var g = group();
    g.add(P.cyl(0.045, 0.045, 0.26, M3.paper, -0.26, 0.515, 0.16, 14));
    var sc = g.children[g.children.length - 1];
    sc.rotation.z = P.ROTZ;
    g.add(P.cyl(0.02, 0.02, 0.28, M3.woodD, -0.26, 0.515, 0.16, 8));
    var roll = g.children[g.children.length - 1];
    roll.rotation.z = P.ROTZ;
    return { group: g, anchor: mkAnchor(-0.26, 0.65, 0.16) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "table", name: "TABLE · 案几", sub: "水浮法演示台", phase: 0, at: 0.2, dur: 1.2,
      build: buildTable, target: [0, 0, 0], start: [0, 2.2, 0.8], mid: [0, 1.2, 0.4], anchor: [0, 0.62, -0.2] });
    def({ id: "bowl", name: "BOWL · 碗·水·刻度盘", sub: "24 向 · 「水浮多荡摇」", phase: 0, at: 1.0, dur: 1.2,
      build: buildBowl, target: [0, 0, 0], start: [0, 2.4, 0.9], mid: [0, 1.3, 0.45], anchor: [0, 0.65, 0.2] });

    def({ id: "needle", name: "NEEDLE · 磁针·灯草", sub: "针穿灯草浮水 · 微偏东", phase: 1, at: 5.3, dur: 1.3, kind: "kine",
      build: buildNeedle, target: [0, 0, 0], off: [0.5, 1.2, 0.7] });
    def({ id: "magnet", name: "MAGNET · 磁石", sub: "「以磁石磨针锋」", phase: 1, at: 6.5, dur: 1.1,
      build: buildMagnet, target: [0, 0, 0], start: [-1.0, 2.0, -0.6], mid: [-0.6, 1.2, -0.3], anchor: [0, 0.75, -0.14] });

    def({ id: "hang", name: "HANG · 缕悬对比架", sub: "「不若缕悬为最善」", phase: 2, at: 10.3, dur: 1.3,
      build: buildHang, target: [0, 0, 0], start: [0.9, 2.6, -0.6], mid: [0.6, 1.5, -0.3], anchor: [0, 1.12, 0] });
    def({ id: "scroll", name: "SCROLL · 梦溪笔谈", sub: "卷二十四·杂志一", phase: 2, at: 11.4, dur: 1.1,
      build: buildScroll, target: [0, 0, 0], start: [-0.9, 1.8, 0.8], mid: [-0.5, 1.0, 0.4], anchor: [0, 0.72, 0.16] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("needle");
    if (e && e.shown && e.group.userData.anim) {
      e.group.userData.anim.holder.rotation.y = st.theta;
    }
    e = MECH.Parts.entry("bowl");
    if (e && e.shown && e.group.userData.anim) {
      var tilt = st.mode === "sway" ? D.bowlTilt * Math.sin(st.swayT * 2.2) : 0;
      e.group.userData.anim.holder.rotation.z = tilt;
    }
    e = MECH.Parts.entry("hang");
    if (e && e.shown && e.group.userData.anim) {
      e.group.userData.anim.needle.rotation.x = Math.sin(st.time * 1.1) * 0.06;   // 微摆
    }
  };
})(window.MECH = window.MECH || {});
