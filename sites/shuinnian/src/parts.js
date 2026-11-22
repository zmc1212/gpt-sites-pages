/* 水碾部件建模与注册(13 件)——卧轮直驱式(王祯《农书》「轮轴上端穿其碢干」)。
   布局:圆形石井筒(石囷)立于场地,内水面 +0.30,卧式水轮盘面 +0.50 在筒内;
   碾盘架于筒壁顶(+0.95..1.19),同一立轴自轮毂穿盘心直上,顶端接碢干(碾臂);
   双石辊轴沿半径,吊柱悬于碢干,沿碾槽公转并滚动无滑移自转;
   引水木枧自西侧跨越筒壁,闸门调节跌水。
   kine 部件几何以组原点=各自轴心建模(target 摆位),KINE 只写 rotation;
   闸门/水流/谷粒压碎等位移量经 userData.anim 由 tick 驱动。
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

  var _granite = null;
  function graniteMat() {
    if (!_granite) _granite = new THREE.MeshStandardMaterial({ color: 0x33363B, roughness: 0.94, metalness: 0.03 });
    return _granite;
  }

  /* —— 部件构建器 —— */

  /* 井筒:C 形石壁(西侧开 120° 缺口露出轮坑)+ 底 + 筒内水面 + 缺口双墩 */
  function buildCistern() {
    var g = group();
    var gap = 2.1;                               // 西侧开口角宽(弧度)
    var t0 = -Math.PI / 2 + gap / 2;             // 缺口朝西(-x):圆心角 -π/2
    var arcLen = Math.PI * 2 - gap;
    var outerMat = graniteMat();
    var outer = P.mesh(new THREE.CylinderGeometry(D.cisROut, D.cisROut, D.cisH, 44, 1, true, t0, arcLen),
      outerMat, D.ax, D.cisH / 2, D.az);
    var inner = P.mesh(new THREE.CylinderGeometry(D.cisRIn, D.cisRIn, D.cisH, 44, 1, true, t0, arcLen),
      new THREE.MeshStandardMaterial({ color: 0x2C2F34, roughness: 0.96, side: THREE.DoubleSide }),
      D.ax, D.cisH / 2, D.az);
    outer.castShadow = true;
    g.add(outer); g.add(inner);
    var ring = P.mesh(new THREE.RingGeometry(D.cisRIn, D.cisROut, 44, 1, t0, arcLen), graniteMat(),
      D.ax, D.cisH, D.az);
    ring.rotation.x = -Math.PI / 2;
    g.add(ring);
    /* 缺口两端扶壁墩(承托碾盘西缘) */
    [-1, 1].forEach(function (sg) {
      var th = -Math.PI / 2 + sg * (gap / 2 + 0.12);
      var px = D.ax + 1.62 * Math.sin(th), pz = D.az + 1.62 * Math.cos(th);
      g.add(P.box(0.5, D.cisH, 0.5, graniteMat(), px, D.cisH / 2, pz));
    });
    g.add(P.cyl(D.cisRIn, D.cisRIn, 0.08, graniteMat(), D.ax, D.cisFloor - 0.04, D.az, 40));
    var water = P.cyl(D.cisRIn - 0.03, D.cisRIn - 0.03, 0.10, M3.water, D.ax, D.cisWater - 0.05, D.az, 40);
    water.castShadow = false;
    g.add(water);
    /* 泄水涵洞(南侧小拱 + 出水) */
    g.add(P.box(0.5, 0.26, 0.55, graniteMat(), D.ax, 0.24, D.az - D.cisROut - 0.2));
    var outWater = P.box(0.36, 0.07, 0.6, M3.water, D.ax, 0.18, D.az - D.cisROut - 0.2);
    outWater.castShadow = false;
    g.add(outWater);
    g.userData.anim = { tail: [water, outWater] };
    return { group: g, anchor: mkAnchor(D.ax + D.cisROut, D.cisH + 0.2, D.az) };
  }

  /* 引水木枧:斜槽 + 西侧高架 + 筒壁斜撑 + 槽内水条 + 跌水柱(tick 控制可见性) */
  function buildFlume() {
    var g = group();
    var len = Math.hypot(D.flumeX1 - D.flumeX0, D.flumeY1 - D.flumeY0);
    var cx = (D.flumeX0 + D.flumeX1) / 2, cy = (D.flumeY0 + D.flumeY1) / 2;
    var slope = Math.atan2(D.flumeY1 - D.flumeY0, -(D.flumeX1 - D.flumeX0));
    var holder = group();
    holder.position.set(cx, cy, D.az);
    holder.rotation.z = slope;
    holder.add(P.box(len, 0.05, 0.5, M3.woodD, 0, 0, 0));
    holder.add(P.box(len, 0.16, 0.04, M3.woodD, 0, 0.10, -0.23));
    holder.add(P.box(len, 0.16, 0.04, M3.woodD, 0, 0.10, 0.23));
    g.add(holder);
    /* 西侧高架(A 形架)+ 筒壁斜撑 */
    [[-5.35, -0.20], [-5.35, 0.20]].forEach(function (p) {
      var leg = P.box(0.09, D.flumeY0, 0.09, M3.wood, p[0], D.flumeY0 / 2, D.az + p[1]);
      leg.rotation.x = -p[1] * 0.25;
      g.add(leg);
    });
    g.add(P.box(0.09, 0.09, 0.42, M3.wood, -5.35, D.flumeY0 - 0.08, D.az));
    /* 第二排支架(立于井筒西侧缺口内,轮缘之外) */
    [[-4.72, -0.18], [-4.72, 0.18]].forEach(function (p) {
      var yTop = D.flumeY0 + (p[0] - D.flumeX0) / (D.flumeX1 - D.flumeX0) * (D.flumeY1 - D.flumeY0);
      g.add(P.box(0.08, yTop, 0.08, M3.wood, p[0], yTop / 2, D.az + p[1]));
    });
    /* 槽内水条 + 跌水柱(tick 控制可见) */
    var water = P.box(len - 0.45, 0.032, 0.40, M3.water, cx + 0.10, cy + 0.04, D.az);
    water.rotation.z = slope;
    water.castShadow = false;
    var fall = P.box(0.13, 0.30, 0.40, M3.water, D.flumeX1 + 0.07, D.flumeY1 - 0.16, D.az);
    fall.castShadow = false;
    g.add(water); g.add(fall);
    g.userData.anim = { water: [water, fall] };
    return { group: g, anchor: mkAnchor(D.flumeX0 + 0.5, D.flumeY0 + 0.2, D.az) };
  }

  /* 闸门:枧内滑板(开度由 tick 写 userData.anim.gate.position.y) */
  function buildGate() {
    var g = group();
    var gate = P.box(0.03, 0.30, 0.44, M3.lacquer, D.gateX, D.flumeY0 - 0.10, D.az);
    g.add(gate);
    g.add(P.box(0.05, 0.05, 0.52, M3.iron, D.gateX, D.flumeY0 + 0.06, D.az));
    g.add(P.cyl(0.022, 0.022, 0.30, M3.brass, D.gateX, D.flumeY0 + 0.20, D.az, 10));
    g.userData.anim = { gate: gate, gateY0: D.flumeY0 - 0.10 };
    return { group: g, anchor: mkAnchor(D.gateX, D.flumeY0 + 0.36, D.az) };
  }

  /* 碾盘:石盘(架于筒壁顶)+ 碾槽环 + 铁缘 */
  function buildPan() {
    var g = group();
    g.add(P.cyl(D.panR, D.panR, D.panH, graniteMat(), D.ax, D.panY0 + D.panH / 2, D.az, 52));
    var groove = P.mesh(new THREE.RingGeometry(D.grooveR - D.grooveW / 2, D.grooveR + D.grooveW / 2, 64),
      new THREE.MeshStandardMaterial({ color: 0x1E2023, roughness: 0.95 }),
      D.ax, D.panY0 + D.panH + 0.004, D.az);
    groove.rotation.x = -Math.PI / 2;
    groove.castShadow = false; groove.receiveShadow = true;
    g.add(groove);
    var rim = P.torus(D.panR + 0.015, 0.035, M3.ironD, D.ax, D.panY0 + D.panH, D.az, 56);
    rim.rotation.x = P.ROTX;
    g.add(rim);
    return { group: g, anchor: mkAnchor(D.ax + 1.2, D.panY0 + D.panH + 0.25, D.az) };
  }

  /* 立轴:自轮毂穿盘心直上碢干(王祯:「轮轴上端穿其碢干」)+ 盘顶铜箍 */
  function buildShaft() {
    var g = group();
    g.add(P.cyl(0.09, 0.09, D.shaftTop - (D.wheelY - 0.18), M3.woodD, 0, (D.shaftTop + D.wheelY - 0.18) / 2, 0, 14));
    g.add(P.cyl(0.145, 0.145, 0.13, M3.bronze, 0, D.panTop + 0.06, 0, 16));
    g.add(P.cyl(0.13, 0.13, 0.10, M3.iron, 0, D.shaftTop - 0.03, 0, 14));
    return { group: g, anchor: mkAnchor(0.20, D.panTop + 0.35, 0) };
  }

  /* 卧式水轮:轮毂 + 轮辋 + 16 斜叶(原点=轮心,target 摆位) */
  function buildWheel() {
    var g = group();
    g.add(P.cyl(0.17, 0.17, 0.36, M3.woodD, 0, 0, 0, 18));
    var rim = P.torus(D.rWheel - 0.03, 0.035, M3.woodD, 0, 0, 0, 48);
    rim.rotation.x = P.ROTX;
    g.add(rim);
    for (var i = 0; i < D.nBlade; i++) {
      var a = i / D.nBlade * Math.PI * 2;
      var holder = group();
      holder.rotation.y = a;
      var blade = P.box(D.rWheel - 0.22, 0.30, 0.04, M3.wood, (D.rWheel - 0.22) / 2 + 0.10, 0, 0);
      blade.rotation.x = 0.96;
      holder.add(blade);
      g.add(holder);
    }
    return { group: g, anchor: mkAnchor(-D.rWheel + 0.35, 0.26, 0) };
  }

  /* 碢干(碾臂):主臂 + 对侧短臂 + 中轴套(原点=盘心) */
  function buildArm() {
    var g = group();
    g.add(P.box(1.62, 0.12, 0.14, M3.woodD, 0.81, D.armY, 0));
    g.add(P.box(0.30, 0.12, 0.14, M3.woodD, -0.15, D.armY, 0));
    g.add(P.cyl(0.125, 0.125, 0.16, M3.woodD, 0, D.armY, 0, 14));
    g.add(P.box(0.10, 0.10, 0.30, M3.iron, 1.52, D.armY, 0));
    return { group: g, anchor: mkAnchor(1.35, D.armY + 0.14, 0) };
  }

  /* 吊柱:碢干 → 辊轴承(原点=盘心) */
  function buildHanger(rx) {
    var g = group();
    g.add(P.box(0.09, 0.24, 0.09, M3.wood, rx, (D.armY + 0.365) / 2, 0));
    g.add(P.box(0.15, 0.11, 0.15, M3.woodD, rx, 0.365, 0));
    return { group: g, anchor: mkAnchor(rx, D.armY - 0.12, 0) };
  }

  /* 石辊:轴沿半径方向的石辊 + 端挡 + 轴销(原点=盘心;自转经 spinner) */
  function buildRoller() {
    var g = group();
    var holder = group();
    holder.position.set(D.grooveR, D.rollerY, 0);
    var spinner = group();
    var body = P.cyl(D.rollerR, D.rollerR, D.rollerL, graniteMat(), 0, 0, 0, 22);
    body.rotation.z = P.ROTZ;
    spinner.add(body);
    [-1, 1].forEach(function (s) {
      var collar = P.cyl(0.165, 0.165, 0.035, graniteMat(), s * (D.rollerL / 2 + 0.018), 0, 0, 18);
      collar.rotation.z = P.ROTZ;
      spinner.add(collar);
    });
    var pin = P.cyl(0.026, 0.026, D.rollerL + 0.10, M3.iron, 0, 0, 0, 10);
    pin.rotation.z = P.ROTZ;
    spinner.add(pin);
    holder.add(spinner);
    g.add(holder);
    g.userData.anim = { spinner: spinner };
    return { group: g, anchor: mkAnchor(D.grooveR, D.rollerY + 0.22, 0) };
  }

  /* 料斗:高腿方斗 + 出料溜槽(指向碾槽外缘;卸料方向角 α=+1.0) */
  function buildHopper() {
    var g = group();
    var hx = D.hopperX, hz = D.hopperZ;
    [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]].forEach(function (o) {
      g.add(P.box(0.05, 1.45, 0.05, M3.woodD, hx + o[0], 0.725, hz + o[1]));
    });
    var hopper = P.mesh(new THREE.CylinderGeometry(0.17, 0.32, 0.36, 4), M3.wood, hx, 1.60, hz);
    hopper.rotation.y = Math.PI / 4;
    g.add(hopper);
    var dir = { x: (hx - D.ax), z: (hz - D.az) };
    var dl = Math.hypot(dir.x, dir.z); dir.x /= dl; dir.z /= dl;
    var holder = group();
    holder.position.set(hx, 1.36, hz);
    holder.rotation.y = Math.atan2(-(D.az + dir.z * 1.55 - hz), (D.ax + dir.x * 1.55) - hx);
    var ch = P.box(0.72, 0.05, 0.15, M3.wood, 0.36, 0, 0);
    ch.rotation.z = -0.30;
    holder.add(ch);
    holder.add(P.box(0.05, 0.10, 0.17, M3.woodD, 0.09, 0.06, 0));
    g.add(holder);
    return { group: g, anchor: mkAnchor(hx, 1.85, hz) };
  }

  /* 谷粒层:30 粒散布碾槽内(压碎态由 tick 经 userData.anim.grains 切换) */
  function buildGrain() {
    var g = group();
    var grains = [];
    var aC = 1.0;
    for (var i = 0; i < 30; i++) {
      var a = aC + (((i * 37 + 11) % 21) - 10) / 10 * 0.42;
      var r = D.grooveR + (((i * 53 + 7) % 17) - 8) / 8 * 0.14;
      var m = P.box(0.05, 0.045, 0.038, grainMat(),
        D.ax + Math.cos(a) * r, D.grooveFloor + 0.026, D.az - Math.sin(a) * r);
      m.castShadow = false;
      m.userData.alpha = a;
      m.userData.crushed = false;
      g.add(m);
      grains.push(m);
    }
    g.userData.anim = { grains: grains, aC: aC };
    return { group: g, anchor: mkAnchor(D.ax + Math.cos(aC) * D.grooveR, D.grooveFloor + 0.25, D.az - Math.sin(aC) * D.grooveR) };
  }

  var _grainMat = null, _flourMat = null;
  function grainMat() {
    if (!_grainMat) _grainMat = new THREE.MeshStandardMaterial({ color: 0xC9A86B, roughness: 0.85 });
    return _grainMat;
  }
  function flourMat() {
    if (!_flourMat) _flourMat = new THREE.MeshStandardMaterial({ color: 0xE7DFC8, roughness: 0.95 });
    return _flourMat;
  }
  MECH._shuinnian = { flourMat: flourMat, grainMat: grainMat };

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    /* 阶段 1:井筒与引枧 */
    def({ id: "cistern", name: "CISTERN · 井筒(石囷)", sub: "内径 3.1m · 碾盘架于筒壁顶", phase: 0, at: 0.2, dur: 1.2,
      build: buildCistern, target: [0, 0, 0], start: [0, 3.6, -3.2], mid: [0, 1.7, -1.5], anchor: [0, 1.2, -1.3] });
    def({ id: "flume", name: "FLUME · 引水木枧", sub: "跨越筒壁 · 跌水注叶", phase: 0, at: 1.0, dur: 1.2,
      build: buildFlume, target: [0, 0, 0], start: [-2.6, 4.6, 0.6], mid: [-1.6, 2.6, 0.6], anchor: [0, 1.4, 0.6] });
    def({ id: "gate", name: "SLUICE GATE · 闸门", sub: "第 8 段 ←/→ 调开度", phase: 0, kind: "none",
      build: buildGate, target: [0, 0, 0] });

    /* 阶段 2:碾盘 */
    def({ id: "pan", name: "MILL PAN · 碾盘", sub: "径 3.5m · 碾槽环宽 0.42", phase: 1, at: 5.3, dur: 1.3,
      build: buildPan, target: [0, 0, 0], start: [0, 5.4, 0.6], mid: [0, 3.0, 0.6], anchor: [0, 1.45, 0.6] });

    /* 阶段 3:水轮与立轴(直驱) */
    def({ id: "wheel", name: "WATER WHEEL · 卧式水轮", sub: "16 斜叶 · 径 2.6m · 立于筒内", phase: 2, at: 10.4, dur: 1.2, kind: "kine",
      build: buildWheel, target: [D.ax, D.wheelY, D.az], off: [0.9, 3.0, 1.4] });
    def({ id: "shaft", name: "VERTICAL SHAFT · 轮轴", sub: "上端穿碢干 · 直驱 1:1", phase: 2, at: 11.5, dur: 1.1, kind: "kine",
      build: buildShaft, target: [D.ax, 0, D.az], off: [-0.8, 2.8, 1.2] });

    /* 阶段 4:碢干与吊柱 */
    def({ id: "arm", name: "YOKE ARM · 碢干(碾臂)", sub: "拖辊公转 · 对侧短臂配平", phase: 3, at: 16.4, dur: 1.2, kind: "kine",
      build: buildArm, target: [D.ax, 0, D.az], off: [1.6, 2.6, -1.2] });
    def({ id: "hangL", name: "ROLLER HANGER · 吊柱 L", sub: "碢干 → 辊轴承", phase: 3, at: 17.5, dur: 1.0, kind: "kine",
      build: function () { return buildHanger(D.grooveR); }, target: [D.ax, 0, D.az], off: [0.7, 2.4, 0.9] });
    def({ id: "hangR", name: "ROLLER HANGER · 吊柱 R", sub: "对辊 180° 对称", phase: 3, at: 18.4, dur: 1.0, kind: "kine",
      build: function () { return buildHanger(-D.grooveR); }, target: [D.ax, 0, D.az], off: [-0.7, 2.4, -0.9] });

    /* 阶段 5:石辊 */
    def({ id: "rollerL", name: "STONE ROLLER · 石辊 L", sub: "径 0.30 长 0.34 · 滚动无滑移", phase: 4, at: 21.5, dur: 1.2, kind: "kine",
      build: buildRoller, target: [D.ax, 0, D.az], off: [1.9, 2.2, 0.6] });
    def({ id: "rollerR", name: "STONE ROLLER · 石辊 R", sub: "ω自=|ω公|·R/r=8.67ω公", phase: 4, at: 22.6, dur: 1.2, kind: "kine",
      build: buildRoller, target: [D.ax, 0, D.az], off: [-1.9, 2.2, -0.6] });

    /* 阶段 7:加料 */
    def({ id: "hopper", name: "GRAIN HOPPER · 料斗", sub: "出料溜槽指向碾槽", phase: 6, at: 33.4, dur: 1.2,
      build: buildHopper, target: [0, 0, 0], start: [1.8, 4.4, 2.4], mid: [0.6, 2.6, 1.2], anchor: [0, 1.9, -1.38] });
    def({ id: "grain", name: "GRAIN · 谷粒 30 粒", sub: "辊过即碾:整粒→碾白", phase: 6, at: 34.8, dur: 1.0,
      build: buildGrain, target: [0, 0, 0], start: [0, 3.6, 0.6], mid: [0, 2.2, 0.6], anchor: [0, 1.6, 0.6] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    function rotY(id, ang) {
      var e = MECH.Parts.entry(id);
      if (!e || !e.shown) return;
      e.group.rotation.y = ang;
    }
    rotY("wheel", st.thetaWheel);
    rotY("shaft", st.thetaWheel);
    rotY("arm", st.thetaYoke);
    rotY("hangL", st.thetaYoke);
    rotY("hangR", st.thetaYoke);
    rotY("rollerL", st.thetaYoke);
    rotY("rollerR", st.thetaYoke);
    ["rollerL", "rollerR"].forEach(function (id) {
      var e = MECH.Parts.entry(id);
      if (e && e.shown && e.group.userData.anim) {
        e.group.userData.anim.spinner.rotation.x = st.phiRoller;
      }
    });
  };
})(window.MECH = window.MECH || {});
