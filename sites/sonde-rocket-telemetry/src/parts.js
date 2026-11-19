/* 零件建模 + 阶段化飞入装配（发射架/三段箭体/发动机/尾翼/点火器）+ 塔架灯 */
(function (SRTL) {
  var list = [];          // 内部零件 {id,name,sub,phase,delay,dur,anim,group,start,target,...}
  var external = [];      // Flight 注册的可点击件（脐带/降落伞）
  var root = null;        // rocketRoot（箭体公共父级）
  var lampBulbs = [], lampGlows = [], beaconGlow = null;
  var launcherG = null;

  function mesh(geo, mat, x, y, z, cast, receive) {
    var m = new THREE.Mesh(geo, mat);
    if (x !== undefined) m.position.set(x, y, z);
    m.castShadow = cast !== false;
    m.receiveShadow = receive !== false;
    return m;
  }

  function setAnchor(g, y) { g.userData.tagAnchor = new THREE.Vector3(0, y, 0); }

  /* ============ 建模 ============ */
  function build() {
    var M = SRTL.Scene3D.M;

    /* 1 · 发射架：钢架导轨(84°) + 塔架灯×3 + 底座配重 */
    var launcher = new THREE.Group();
    launcher.add(mesh(new THREE.BoxGeometry(1.8, 0.2, 1.55), M.concrete, 0, 0.1, 0));
    var hz = mesh(new THREE.PlaneGeometry(1.8, 1.55), M.hazard, 0, 0.205, 0, false);
    hz.rotation.x = -Math.PI / 2;
    launcher.add(hz);
    launcher.add(mesh(new THREE.BoxGeometry(0.55, 0.36, 0.5), M.dark, -0.5, 0.38, 0.32));
    launcher.add(mesh(new THREE.BoxGeometry(0.5, 0.3, 0.45), M.dark, 0.45, 0.35, -0.35));
    launcher.add(mesh(new THREE.BoxGeometry(0.42, 0.26, 0.42), M.dark, 0.5, 0.33, 0.38));
    /* 斜置钢轨（本组内绕 Z 转 -6°，导轨沿局部 +Y） */
    var rail = new THREE.Group();
    rail.position.set(-0.02, 0.32, 0);
    rail.rotation.z = -0.1047;
    var channel = mesh(new THREE.BoxGeometry(0.1, 5.3, 0.16), M.steel, 0, 2.65, 0);
    rail.add(channel);
    rail.add(mesh(new THREE.BoxGeometry(0.05, 5.3, 0.05), M.steel, 0.055, 2.65, 0.1));
    rail.add(mesh(new THREE.BoxGeometry(0.05, 5.3, 0.05), M.steel, 0.055, 2.65, -0.1));
    for (var ti = 0; ti < 9; ti++) {
      rail.add(mesh(new THREE.BoxGeometry(0.16, 0.05, 0.3), M.dark, 0, 0.5 + ti * 0.58, 0));
    }
    /* 托架与夹臂（托住箭体底部） */
    rail.add(mesh(new THREE.BoxGeometry(0.34, 0.16, 0.4), M.dark, 0.02, 0.95, 0));
    rail.add(mesh(new THREE.BoxGeometry(0.05, 0.2, 0.05), M.steel, 0.02, 1.1, 0.2));
    rail.add(mesh(new THREE.BoxGeometry(0.05, 0.2, 0.05), M.steel, 0.02, 1.1, -0.2));
    launcher.add(rail);
    /* 塔架（桁架桅杆）+ 顶部平台 + 3 灯 */
    var mast = new THREE.Group();
    mast.position.set(-0.94, 0, 0.55);
    mast.add(mesh(new THREE.BoxGeometry(0.13, 5.0, 0.13), M.steel, 0, 2.5, 0));
    for (var br = 0; br < 6; br++) {
      var brace = mesh(new THREE.BoxGeometry(0.05, 0.95, 0.05), M.steel, 0, 0.45 + br * 0.82, 0.09);
      brace.rotation.x = 0.62 * (br % 2 === 0 ? 1 : -1);
      mast.add(brace);
      var brace2 = mesh(new THREE.BoxGeometry(0.05, 0.95, 0.05), M.steel, 0.09, 0.45 + br * 0.82, 0);
      brace2.rotation.z = 0.62 * (br % 2 === 0 ? -1 : 1);
      mast.add(brace2);
    }
    mast.add(mesh(new THREE.BoxGeometry(0.62, 0.07, 0.5), M.dark, 0, 5.03, 0));
    mast.add(mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), M.dark, 0, 5.3, 0));
    launcher.add(mast);
    var lampPos = [[-0.72, 5.14, 0.44], [-0.94, 5.14, 0.66], [-1.16, 5.14, 0.44]];
    lampPos.forEach(function (lp) {
      launcher.add(mesh(new THREE.BoxGeometry(0.11, 0.09, 0.11), M.dark, lp[0], lp[1] + 0.05, lp[2]));
      var bulbMat = new THREE.MeshStandardMaterial({ color: 0x551512, emissive: 0x000000, roughness: 0.3 });
      var bulb = mesh(new THREE.SphereGeometry(0.042, 12, 10), bulbMat, lp[0], lp[1], lp[2], false);
      launcher.add(bulb);
      lampBulbs.push(bulbMat);
      var glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: SRTL.Textures.glowDot(), color: 0x000000, transparent: true,
        opacity: 0, depthWrite: false, fog: false
      }));
      glow.scale.set(0.75, 0.75, 1);
      glow.position.set(lp[0], lp[1], lp[2]);
      launcher.add(glow);
      lampGlows.push(glow.material);
    });
    /* 桅顶信标 */
    var beaconMat = new THREE.SpriteMaterial({
      map: SRTL.Textures.glowDot(), color: 0xe84f4f, transparent: true, opacity: 0, depthWrite: false, fog: false
    });
    beaconGlow = beaconMat;
    var beacon = new THREE.Sprite(beaconMat);
    beacon.scale.set(1.1, 1.1, 1);
    beacon.position.set(-0.94, 5.62, 0.55);
    launcher.add(beacon);
    launcher.add(mesh(new THREE.SphereGeometry(0.032, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x882020, emissive: 0xcc2020, emissiveIntensity: 0.8 }), -0.94, 5.56, 0.55, false));
    launcherG = launcher;
    var launcherDef = {
      id: "launcher", name: "LAUNCH RAIL · 84°", sub: "steel rail · mast · ballast",
      phase: 0, delay: 0.15, dur: 1.7, anim: "arc", world: true,
      group: launcher, target: new THREE.Vector3(0, 0, 0),
      start: new THREE.Vector3(-17, 1.4, -10), mid: new THREE.Vector3(-6.5, 3.4, -3.5),
      yaw: 0, anchorY: 2.7, tone: "white"
    };

    /* 2 · 尾段（白） */
    var segBot = new THREE.Group();
    segBot.add(buildCyl(mesh, M.whiteBody2, M.dark, 0.17, 1.3, 0.65));
    segBot.add(mesh(new THREE.TorusGeometry(0.172, 0.014, 10, 30), M.dark, 0, 0.02, 0).rotateX(Math.PI / 2));
    segBot.add(mesh(new THREE.TorusGeometry(0.172, 0.012, 10, 30), M.dark, 0, 1.28, 0).rotateX(Math.PI / 2));
    /* 尾翼根座 ×4 */
    for (var fb = 0; fb < 4; fb++) {
      var az = Math.PI / 4 + fb * Math.PI / 2;
      var bracket = mesh(new THREE.BoxGeometry(0.05, 0.34, 0.09), M.dark,
        0.165 * Math.sin(az), 0.3, 0.165 * Math.cos(az));
      bracket.rotation.y = az - Math.PI / 2;
      segBot.add(bracket);
    }
    var segBotDef = {
      id: "segBot", name: "TAIL SECTION", sub: "white · fin roots",
      phase: 1, delay: 0.2, dur: 1.25, anim: "drop",
      group: segBot, target: new THREE.Vector3(0, 0, 0),
      startY: 8.5, yaw: 0, anchorY: 0.62, tone: "white"
    };

    /* 3/5 · 对接环 ×2 */
    function buildRing() {
      var g = new THREE.Group();
      g.add(mesh(new THREE.TorusGeometry(0.176, 0.022, 12, 34), M.silver, 0, 0, 0).rotateX(Math.PI / 2));
      g.add(mesh(new THREE.CylinderGeometry(0.172, 0.172, 0.055, 28), M.dark, 0, 0, 0));
      return g;
    }
    var ringA = buildRing();
    var ringADef = {
      id: "ringA", name: "INTERSTAGE RING", sub: "boat-tail joint",
      phase: 1, delay: 1.55, dur: 0.8, anim: "drop",
      group: ringA, target: new THREE.Vector3(0, 1.33, 0),
      startY: 7.5, yaw: 0, anchorY: 0, tone: "white"
    };
    var ringB = buildRing();
    var ringBDef = {
      id: "ringB", name: "INTERSTAGE RING", sub: "boat-tail joint",
      phase: 1, delay: 3.15, dur: 0.8, anim: "drop",
      group: ringB, target: new THREE.Vector3(0, 2.43, 0),
      startY: 7.5, yaw: 0, anchorY: 0, tone: "white"
    };

    /* 4 · 仪器舱（银 + 舷窗） */
    var segMid = new THREE.Group();
    segMid.add(buildCyl(mesh, M.silverBody, M.dark, 0.17, 1.05, 0.525));
    segMid.add(mesh(new THREE.TorusGeometry(0.172, 0.012, 10, 30), M.dark, 0, 1.02, 0).rotateX(Math.PI / 2));
    for (var ph = 0; ph < 3; ph++) {
      var paz = 0.5, py = 0.28 + ph * 0.26;
      var pg = new THREE.Group();
      pg.position.set(0.168 * Math.sin(paz), py, 0.168 * Math.cos(paz));
      pg.rotation.y = paz - Math.PI / 2;
      var rim = mesh(new THREE.TorusGeometry(0.052, 0.014, 10, 22), M.silver, 0, 0, 0);
      rim.rotation.y = Math.PI / 2;
      pg.add(rim);
      var glass = mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.018, 18), SRTL.Scene3D.M.glass, 0, 0, 0, false);
      glass.rotation.z = Math.PI / 2;
      pg.add(glass);
      segMid.add(pg);
    }
    /* 脐带接口（-X 侧） */
    var port = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 10), M.dark, -0.18, 0.55, 0.04);
    port.rotation.z = Math.PI / 2;
    segMid.add(port);
    var segMidDef = {
      id: "segMid", name: "INSTRUMENT BAY", sub: "silver · 3 portholes · TM port",
      phase: 1, delay: 1.95, dur: 1.15, anim: "drop",
      group: segMid, target: new THREE.Vector3(0, 1.36, 0),
      startY: 8.5, yaw: 0, anchorY: 0.52, tone: "white"
    };

    /* 6 · 有效载荷舱 + 头锥（白） */
    var segTop = new THREE.Group();
    segTop.add(buildCyl(mesh, M.whiteBody, M.dark, 0.17, 0.85, 0.425));
    segTop.add(mesh(new THREE.TorusGeometry(0.171, 0.012, 10, 30), M.orange, 0, 0.9, 0).rotateX(Math.PI / 2));
    var conePts = [
      new THREE.Vector2(0.17, 0.85), new THREE.Vector2(0.165, 1.0),
      new THREE.Vector2(0.142, 1.16), new THREE.Vector2(0.108, 1.31),
      new THREE.Vector2(0.068, 1.46), new THREE.Vector2(0.032, 1.59),
      new THREE.Vector2(0.01, 1.68), new THREE.Vector2(0.001, 1.72)
    ];
    segTop.add(mesh(new THREE.LatheGeometry(conePts, 26), M.whiteBody, 0, 0, 0));
    segTop.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.14, 6), M.dark, 0, 1.78, 0));
    segTop.add(mesh(new THREE.SphereGeometry(0.012, 8, 8), M.orange, 0, 1.86, 0, false));
    var segTopDef = {
      id: "segTop", name: "PAYLOAD · NOSE CONE", sub: "white · chute bay inside",
      phase: 1, delay: 3.55, dur: 1.3, anim: "drop",
      group: segTop, target: new THREE.Vector3(0, 2.46, 0),
      startY: 9.0, yaw: 0, anchorY: 0.85, tone: "white"
    };

    /* 7 · 固体发动机 + 钟形喷管（陶色内壁） */
    var motor = new THREE.Group();
    motor.add(mesh(new THREE.CylinderGeometry(0.145, 0.145, 1.05, 24), M.dark, 0, 1.02, 0));
    motor.add(mesh(new THREE.TorusGeometry(0.147, 0.012, 8, 24), M.silver, 0, 0.75, 0).rotateX(Math.PI / 2));
    motor.add(mesh(new THREE.TorusGeometry(0.147, 0.012, 8, 24), M.silver, 0, 1.3, 0).rotateX(Math.PI / 2));
    motor.add(mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.14, 24), M.steel, 0, 0.42, 0));
    var nozPts = [
      new THREE.Vector2(0.132, -0.35), new THREE.Vector2(0.12, -0.22),
      new THREE.Vector2(0.095, -0.08), new THREE.Vector2(0.062, 0.08),
      new THREE.Vector2(0.055, 0.22), new THREE.Vector2(0.09, 0.34),
      new THREE.Vector2(0.128, 0.4)
    ];
    motor.add(mesh(new THREE.LatheGeometry(nozPts, 26), M.terra, 0, 0, 0));
    motor.add(mesh(new THREE.TorusGeometry(0.134, 0.014, 8, 26), M.dark, 0, -0.35, 0).rotateX(Math.PI / 2));
    var motorDef = {
      id: "motor", name: "SOLID MOTOR", sub: "SR-290 · terracotta bell nozzle",
      phase: 2, delay: 0.3, dur: 1.6, anim: "slide",
      group: motor, target: new THREE.Vector3(0, -0.35, 0),
      startY: -2.0, yaw: 0, anchorY: 0.7, tone: "white"
    };

    /* 8 · 尾翼 ×4（切角三角 + 橙尖，铰链展开） */
    var finDefs = [];
    function buildFin() {
      var g = new THREE.Group();
      var shape = new THREE.Shape();
      shape.moveTo(0, 0.26);
      shape.lineTo(0.27, 0.10);
      shape.lineTo(0.27, -0.10);
      shape.lineTo(0, -0.26);
      var finGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.024, bevelEnabled: false });
      finGeo.translate(0, 0, -0.012);
      g.add(mesh(finGeo, M.whitePlain, 0, 0, 0));
      var tipShape = new THREE.Shape();
      tipShape.moveTo(0.19, 0.118);
      tipShape.lineTo(0.27, 0.10);
      tipShape.lineTo(0.27, -0.10);
      tipShape.lineTo(0.19, -0.118);
      var tipGeo = new THREE.ExtrudeGeometry(tipShape, { depth: 0.028, bevelEnabled: false });
      tipGeo.translate(0, 0, -0.014);
      g.add(mesh(tipGeo, M.orange, 0, 0, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.36, 10), M.silver, 0.004, 0, 0));
      return g;
    }
    for (var fi = 0; fi < 4; fi++) {
      var faz = Math.PI / 4 + fi * Math.PI / 2;
      var pivot = new THREE.Group();
      pivot.position.set(0.162 * Math.sin(faz), 0.3, 0.162 * Math.cos(faz));
      pivot.rotation.y = faz - Math.PI / 2;
      pivot.add(buildFin());
      root.add(pivot);
      finDefs.push({
        id: "fin" + (fi + 1), name: "FIN " + (fi + 1) + " / 4", sub: "clipped tri · orange tip",
        phase: 3, delay: 0.3 + fi * 1.0, dur: 0.85, anim: "fin",
        group: pivot, target: null, baseRy: faz - Math.PI / 2, anchorY: 0.05, tone: "white"
      });
    }

    /* 9 · 点火器（尾端小红盒） */
    var igniter = new THREE.Group();
    igniter.add(mesh(new THREE.BoxGeometry(0.15, 0.09, 0.08), M.redBox, 0, 0, 0));
    igniter.add(mesh(new THREE.BoxGeometry(0.04, 0.02, 0.02), M.dark, 0.05, 0.055, 0));
    var ignLed = mesh(new THREE.SphereGeometry(0.012, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x143018, emissive: 0x3E8E5A, emissiveIntensity: 0.9 }), -0.055, 0.02, 0.042, false);
    igniter.add(ignLed);
    var ignWire = new THREE.Mesh(new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.06, -0.02, 0), new THREE.Vector3(0.12, -0.1, -0.05),
        new THREE.Vector3(0.16, -0.22, 0)
      ]), 20, 0.007, 6, false), M.rubber);
    igniter.add(ignWire);
    var igniterDef = {
      id: "igniter", name: "IGNITER", sub: "red box · 24 V bus",
      phase: 4, delay: 0.4, dur: 1.0, anim: "arc",
      group: igniter, target: new THREE.Vector3(0.24, 0.06, 0.14),
      start: new THREE.Vector3(-6.5, 0.5, 4.5), mid: new THREE.Vector3(-2.2, 1.6, 1.6),
      yaw: 0.7, anchorY: 0.06, tone: "white"
    };

    return [launcherDef, segBotDef, ringADef, segMidDef, ringBDef, segTopDef, motorDef]
      .concat(finDefs).concat([igniterDef]);
  }

  /* 带贴图侧面 + 深色端盖的圆柱（端盖为薄圆片，避免侧面 z-fighting） */
  function buildCyl(meshFn, sideMat, capMat, r, h, y) {
    var g = new THREE.Group();
    g.add(meshFn(new THREE.CylinderGeometry(r, r, h, 28, 1, true), sideMat, 0, y, 0));
    var capTop = meshFn(new THREE.CircleGeometry(r, 28), capMat, 0, y + h / 2 - 0.002, 0, false, false);
    capTop.rotation.x = -Math.PI / 2;
    g.add(capTop);
    var capBot = meshFn(new THREE.CircleGeometry(r, 28), capMat, 0, y - h / 2 + 0.002, 0, false, false);
    capBot.rotation.x = Math.PI / 2;
    g.add(capBot);
    return g;
  }

  /* ============ 装配控制 ============ */
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOutBack(k) {
    var c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
  }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  function init() {
    root = SRTL.Flight.root();
    list = build();
    list.forEach(function (p) {
      if (!p.group.parent) {
        if (p.world) SRTL.Scene3D.scene.add(p.group);   // 发射架固定在世界坐标
        else root.add(p.group);
      }
      if (p.target) { p.group.position.copy(p.target); }
      setAnchor(p.group, p.anchorY);
      if (p.anim === "fin") p.group.rotation.y = p.baseRy - 1.35;
      p.group.visible = false;
      p.sealed = false; p.shown = false;
      if (p.id === "segTop") SRTL.Flight.setSegTop(p.group);
    });
  }

  /* 每帧：仅当处于零件所属阶段时推进动画 */
  function update(pt, phaseIdx) {
    var now = performance.now();
    /* 桅顶信标闪烁 */
    if (beaconGlow && launcherG && launcherG.visible) {
      beaconGlow.opacity = ((now / 1000) % 1.4) < 0.6 ? 0.85 : 0.12;
    }
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (p.sealed || p.phase !== phaseIdx) continue;
      var t = (pt - p.delay) / p.dur;
      if (t <= 0) continue;
      if (!p.shown) {
        p.shown = true;
        p.group.visible = true;
        SRTL.Labels.announce(p.id, p.group, p.name, p.sub, performance.now(), 2600, p.tone);
      }
      var tt = clamp01(t);
      if (p.anim === "arc") {
        var a = (1 - tt) * (1 - tt), b = 2 * tt * (1 - tt), c = tt * tt;
        p.group.position.set(
          a * p.start.x + b * p.mid.x + c * p.target.x,
          a * p.start.y + b * p.mid.y + c * p.target.y,
          a * p.start.z + b * p.mid.z + c * p.target.z
        );
        p.group.rotation.y = (p.yaw || 0) * (1 - tt);
      } else if (p.anim === "drop") {
        p.group.position.set(p.target.x, p.target.y + p.startY * (1 - ease(tt)), p.target.z);
        p.group.rotation.y = (p.yaw || 0) * (1 - tt) + (1 - tt) * 0.18;
      } else if (p.anim === "slide") {
        p.group.position.set(p.target.x, p.target.y + p.startY * (1 - ease(tt)), p.target.z);
      } else if (p.anim === "fin") {
        p.group.rotation.y = p.baseRy - 1.35 * (1 - easeOutBack(tt));
      }
      if (t >= 1) {
        p.sealed = true;
        if (p.target) p.group.position.copy(p.target);
        if (p.anim === "fin") p.group.rotation.y = p.baseRy;
        else p.group.rotation.y = p.yaw || 0;
      }
    }
  }

  function reset() {
    list.forEach(function (p) {
      p.sealed = false; p.shown = false;
      p.group.visible = false;
      if (p.target) p.group.position.copy(p.target);
      if (p.anim === "fin") p.group.rotation.y = p.baseRy - 1.35;
      else p.group.rotation.y = p.yaw || 0;
    });
    setLampStates([{ hex: 0x551512, glow: 0 }, { hex: 0x551512, glow: 0 }, { hex: 0x551512, glow: 0 }]);
    if (launcherG) launcherG.visible = false;
  }

  /* 跳转用：把 phase <= idx 的零件直接落位 */
  function sealUpTo(idx) {
    list.forEach(function (p) {
      p.sealed = true; p.shown = true;
      p.group.visible = true;
      if (p.target) p.group.position.copy(p.target);
      if (p.anim === "fin") p.group.rotation.y = p.baseRy;
      else p.group.rotation.y = p.yaw || 0;
      if (p.phase > idx) {
        p.sealed = false; p.shown = false;
        p.group.visible = false;
        if (p.anim === "fin") p.group.rotation.y = p.baseRy - 1.35;
      }
    });
  }

  /* 塔架灯状态：[{hex, glow 0..1}] */
  function setLampStates(states) {
    for (var i = 0; i < 3; i++) {
      var st = states[i] || { hex: 0x551512, glow: 0 };
      lampBulbs[i].color.setHex(st.hex);
      lampBulbs[i].emissive.setHex(st.hex);
      lampBulbs[i].emissiveIntensity = st.glow > 0 ? 1.2 : 0;
      lampGlows[i].color.setHex(st.hex);
      lampGlows[i].opacity = st.glow;
    }
  }

  function setPower(on) {
    SRTL.Scene3D.M.glass.emissiveIntensity = on ? 0.85 : 0;
  }

  SRTL.Parts = {
    init: init,
    update: update,
    reset: reset,
    sealUpTo: sealUpTo,
    setLampStates: setLampStates,
    setPower: setPower,
    registerExternal: function (arr) { external = arr || []; },
    list: function () { return list.concat(external); },
    group: function (id) {
      var all = list.concat(external);
      for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i].group;
      return null;
    }
  };
})(window.SRTL = window.SRTL || {});
