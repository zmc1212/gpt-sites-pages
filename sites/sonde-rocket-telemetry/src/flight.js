/* 飞行/回收动力学可视化：台位 → 导轨滑行 → 自由爬升 → 头锥分离 → 开伞缓降 → 落地
   同时管理遥测脐带线（生长/起飞断落下）与头锥降落伞（半球放大 + 伞绳） */
(function (SRTL) {
  var rocketRoot = null;
  var segTop = null;            // 头锥段（recover 时分离）
  var chuteGroup = null, canopyG = null, canopyMat = null, linesMesh = null;
  var umb = null;               // {pivot, mesh, geo, mode, total}
  var umbMode = "hidden";       // hidden | grow | on | fall
  var umbFallU = 0;
  var dustDone = false;
  var lastFlightT = -1;

  var PAD = new THREE.Vector3(0.07, 1.445, 0);
  var TILT = -0.1047;                                   // 84° 导轨（自竖直偏 6°，朝 +X）
  var RAIL_DIR = new THREE.Vector3(Math.sin(0.1047), Math.cos(0.1047), 0);
  var RAIL_LEN = 4.5;
  var FREE_END = new THREE.Vector3(10.34, 121.92, 2.6); // 飞行段末（apogee 前瞬间）

  var tmpV = new THREE.Vector3();
  var LINE_N = 8;

  function init() {
    rocketRoot = new THREE.Group();
    rocketRoot.position.copy(PAD);
    rocketRoot.rotation.z = TILT;
    SRTL.Scene3D.scene.add(rocketRoot);
    buildChute();
    buildUmb();
  }

  /* 头锥降落伞：伞包藏在头锥内，开伞时半球伞面放大 + 8 根伞绳 */
  function buildChute() {
    chuteGroup = new THREE.Group();
    chuteGroup.position.set(0, 2.62, 0);   // 仪器舱顶端（root 局部）
    chuteGroup.visible = false;
    canopyG = new THREE.Group();
    var geo = new THREE.SphereGeometry(1.05, 26, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    canopyMat = new THREE.MeshStandardMaterial({
      map: SRTL.Textures.chute(), side: THREE.DoubleSide,
      roughness: 0.7, transparent: true, opacity: 0.96, depthWrite: false,
      emissive: 0x6a3210, emissiveIntensity: 0.32
    });
    var dome = new THREE.Mesh(geo, canopyMat);
    dome.castShadow = true;
    canopyG.add(dome);
    var rim = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.028, 8, 40),
      new THREE.MeshStandardMaterial({ color: 0x8a4413, roughness: 0.6 }));
    rim.rotation.x = Math.PI / 2;
    canopyG.add(rim);
    chuteGroup.add(canopyG);
    /* 伞绳（端点每帧按伞面缩放更新） */
    var pos = new Float32Array(LINE_N * 2 * 3);
    var lgeo = new THREE.BufferGeometry();
    lgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    linesMesh = new THREE.LineSegments(lgeo,
      new THREE.LineBasicMaterial({ color: 0xdfe4ea, transparent: true, opacity: 0.8 }));
    chuteGroup.add(linesMesh);
    rocketRoot.add(chuteGroup);
  }

  function updateLines(s, deflated) {
    var pos = linesMesh.geometry.attributes.position.array;
    var rimR = 1.05 * s, rimY = deflated ? -0.1 : 0;
    for (var i = 0; i < LINE_N; i++) {
      var a = (i / LINE_N) * Math.PI * 2;
      var ca = Math.cos(a), sa = Math.sin(a);
      pos[i * 6] = ca * rimR;
      pos[i * 6 + 1] = rimY;
      pos[i * 6 + 2] = sa * rimR;
      pos[i * 6 + 3] = ca * 0.16;
      pos[i * 6 + 4] = -0.2;
      pos[i * 6 + 5] = sa * 0.16;
    }
    linesMesh.geometry.attributes.position.needsUpdate = true;
  }

  /* 遥测脐带线：塔架 → 箭体，TubeGeometry 生长；起飞时断开下摆 */
  function buildUmb() {
    var A = new THREE.Vector3(-0.88, 4.55, 0.55);   // 塔架锚点（世界）
    umb = { pivot: new THREE.Group(), mode: "hidden" };
    umb.pivot.position.copy(A);
    var pts = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.28, -0.35, -0.12),
      new THREE.Vector3(0.53, -0.85, -0.25),
      new THREE.Vector3(0.75, -1.05, -0.4),
      new THREE.Vector3(0.959, -1.196, -0.55)
    ];
    var curve = new THREE.CatmullRomCurve3(pts);
    var geo = new THREE.TubeGeometry(curve, 48, 0.016, 8, false);
    umb.geo = geo;
    umb.mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: 0x3c434d, roughness: 0.6, metalness: 0.3
    }));
    umb.mesh.castShadow = true;
    umb.mesh.geometry.setDrawRange(0, 0);
    umb.pivot.add(umb.mesh);
    SRTL.Scene3D.scene.add(umb.pivot);
    umb.total = geo.index.count;
  }

  function umbGrow(u) {
    umb.mesh.geometry.setDrawRange(0, Math.floor(umb.total * Math.min(1, u) / 6) * 6);
  }

  function umbDetach(now) {
    if (umbMode !== "on") return;
    umbMode = "fall";
    umbFallU = 0;
  }

  function umbUpdate(dt) {
    if (umbMode === "fall" && umbFallU < 1.4) {
      umbFallU += dt / 1.5;
      var u = Math.min(1, umbFallU);
      var drop = 1.15 * (1 - Math.pow(1 - u, 2)) + 0.1 * Math.sin(u * 12) * Math.exp(-2.5 * u);
      umb.pivot.rotation.z = drop;
      umb.pivot.rotation.x = drop * 0.22;
    }
  }

  /* ============ 位形 ============ */
  function padPose() {
    rocketRoot.position.copy(PAD);
    rocketRoot.rotation.set(0, 0, TILT);
    segTopReset();
    chuteGroup.visible = false;
  }

  function segTopReset() {
    if (segTop) { segTop.position.set(0, 2.46, 0); segTop.rotation.set(0, 0, 0); }
  }

  function easeOutQuad(k) { return 1 - (1 - k) * (1 - k); }
  function smooth01(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }
  function easeOutBack(k) {
    var c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
  }

  /* 爬升：导轨滑行 → 重力转竖直 + 射向漂移 */
  function ascentPose(ft) {
    var u1 = Math.max(0, Math.min(1, (ft - 0.5) / 1.05));
    if (u1 < 1) {
      var s = RAIL_LEN * Math.pow(u1, 2.1);
      rocketRoot.position.set(PAD.x + RAIL_DIR.x * s, PAD.y + RAIL_DIR.y * s, 0);
      rocketRoot.rotation.set(0, 0, TILT);
    } else {
      var ft2 = ft - 1.55;
      var T = 7.45;
      var un = Math.max(0, Math.min(1, ft2 / T));
      var h = 116 * Math.pow(un, 2.05);
      rocketRoot.position.set(
        PAD.x + 0.47 + 9.8 * Math.pow(un, 1.7),
        PAD.y + RAIL_DIR.y * RAIL_LEN + h,
        2.6 * Math.pow(un, 1.9)
      );
      rocketRoot.rotation.set(0, 0, TILT + (0.035 - TILT) * smooth01(ft2 / 1.5));
    }
    segTopReset();
    chuteGroup.visible = false;
  }

  /* 回收：头锥分离 → 开伞 → 单摆缓降 → 落地 */
  function descentPose(st) {
    var u = st.descU;
    /* 头锥分离：短促抛出 → 开伞后回落归位（伞由锥舱引出，锥体与载荷同降同摆） */
    if (segTop && st.sepU > 0) {
      var su = easeOutQuad(Math.min(1, st.sepU));
      var rejoin = Math.min(1, st.chuteU);
      var kick = 1 - rejoin;
      segTop.position.set(
        (1.6 * su + 1.1 * u) * kick,
        2.46 + 2.3 * su * kick - 1.6 * u * su * kick,
        0.5 * su * kick
      );
      segTop.rotation.z = (1.5 * su + 0.4 * u) * kick;
    }
    /* 缓降位形 */
    var y = 0.62 + (FREE_END.y - 0.62) * (1 - Math.pow(Math.max(0, Math.min(1, u)), 0.95));
    var sway = Math.sin(st.pt * 2.0) * 0.15 * (1 - u * 0.5);
    var swayX = Math.sin(st.pt * 2.0) * 1.25 * (1 - u * 0.5);
    rocketRoot.position.set(FREE_END.x + swayX, y, FREE_END.z + Math.cos(st.pt * 1.7) * 0.4);
    rocketRoot.rotation.set(sway * 0.4, 0, TILT * Math.max(0, 1 - u * 3) + sway * 0.8);
    /* 落地压紧与侧倒 */
    if (st.landU >= 0) {
      var lu = smooth01(st.landU);
      rocketRoot.rotation.z += (-0.3 - rocketRoot.rotation.z) * lu;
      rocketRoot.position.y = y - 0.05 * lu + Math.sin(Math.min(1, st.landU) * Math.PI) * 0.05;
      /* 伞衣泄气瘫软 */
      canopyG.scale.set(1.05 + 0.3 * lu, Math.max(0.16, 1 - lu * 0.9), 1.05 + 0.3 * lu);
      canopyG.position.x = 1.4 * lu;
      canopyG.position.y = -0.35 * lu;
      canopyMat.opacity = 0.96 - 0.35 * lu;
      updateLines(canopyG.scale.x, true);
    }
    /* 开伞：半球放大 + 伞绳随动 */
    if (st.chuteU > 0) {
      chuteGroup.visible = true;
      var cu = Math.min(1, st.chuteU);
      var cs = 0.12 + 0.93 * easeOutBack(cu);
      if (st.landU < 0) {
        canopyG.scale.set(cs, cs, cs);
        canopyG.position.set(0, 0, 0);
        canopyMat.opacity = Math.min(1, cu * 2.5) * 0.96;
        updateLines(cs, false);
      }
      canopyG.rotation.z = -sway * 0.7;
    } else {
      chuteGroup.visible = false;
    }
    /* 落地烟尘（一次性） */
    if (u >= 1 && !dustDone) {
      dustDone = true;
      SRTL.FX.dust(rocketRoot.position.x, 0.15, rocketRoot.position.z, 170);
    }
  }

  /* ============ 主入口 ============ */
  function apply(st, dt) {
    if (st.flightT >= 0) {
      ascentPose(st.flightT);
    } else if (st.descU >= 0) {
      descentPose(st);
    } else {
      padPose();
    }
    /* 脐带线 */
    if (st.umb === "grow") {
      if (umbMode !== "grow") { umbMode = "grow"; umb.pivot.rotation.set(0, 0, 0); }
      umbGrow(st.umbU);
    } else if (st.umb === "on") {
      if (umbMode !== "on") { umbMode = "on"; umb.pivot.rotation.set(0, 0, 0); umbGrow(1); }
    } else if (st.umb === "fall") {
      if (umbMode === "on") umbDetach();
      umbUpdate(dt);
    } else if (st.umb === "gone") {
      umbMode = "fall";
      umbFallU = 2;
      umb.pivot.rotation.z = 1.15;
      umb.pivot.rotation.x = 0.25;
      umbGrow(1);
    } else {
      umbMode = "hidden";
      umb.pivot.rotation.set(0, 0, 0);
      umb.mesh.geometry.setDrawRange(0, 0);
    }
    lastFlightT = st.flightT;
    /* 喷焰与尾迹 */
    if (st.burning) {
      rocketRoot.localToWorld(tmpV.set(0, -0.75, 0));
      SRTL.FX.emitTrail(tmpV, rocketRoot.quaternion);
    }
    /* 倒计时排气 */
    if (st.vent > 0) {
      rocketRoot.localToWorld(tmpV.set(0.2, 0.1, 0.2));
      SRTL.FX.setVent(st.vent, tmpV);
    } else {
      SRTL.FX.setVent(0, tmpV);
    }
    /* 点火地面烟暴（起飞瞬间一次性） */
    if (st.flightT >= 0.5 && lastFlightT < 0.5) {
      SRTL.FX.burst(rocketRoot.position.x, 0.3, rocketRoot.position.z, 240);
    }
  }

  /* 跳转预设：直接摆在 apogee（recover 阶段起点） */
  function snapApogee() {
    rocketRoot.position.copy(FREE_END);
    rocketRoot.rotation.set(0, 0, 0.035);
    segTopReset();
    chuteGroup.visible = false;
    dustDone = false;
  }

  function reset() {
    padPose();
    umbMode = "hidden";
    umb.pivot.rotation.set(0, 0, 0);
    umb.mesh.geometry.setDrawRange(0, 0);
    canopyG.scale.set(1, 1, 1);
    canopyG.position.set(0, 0, 0);
    canopyMat.opacity = 0.96;
    dustDone = false;
    lastFlightT = -1;
  }

  /* 供 Parts.init 使用（箭体各段都挂在 rocketRoot 下） */
  function setSegTop(g) { segTop = g; }

  SRTL.Flight = {
    init: init,
    apply: apply,
    reset: reset,
    snapApogee: snapApogee,
    setSegTop: setSegTop,
    root: function () { return rocketRoot; },
    externals: function () {
      return [
        { id: "umbilical", name: "TELEMETRY UMBILICAL", sub: "mast → rocket · drops at liftoff", group: umb.mesh },
        { id: "chute", name: "PARACHUTE", sub: "hemisphere canopy · 8 shroud lines", group: chuteGroup, anchorY: 1.0 }
      ];
    }
  };
})(window.SRTL = window.SRTL || {});
