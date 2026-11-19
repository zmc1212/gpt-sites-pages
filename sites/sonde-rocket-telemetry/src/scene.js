/* 场景：渲染器 / 夜色灯光 / 靶线地面 / 双层天穹 / 远景剪影 / 四座探照灯 */
(function (SRTL) {
  var M = {};                    // 共享材质
  var searchLights = [];         // 4 座探照灯 {group, head, spot, cone, coneMat}
  var trackPoint = null;         // 探照灯跟踪目标（null 时对准发射坪）
  var searchPower = 0;
  var spaceDomeMat = null;
  var beacon = null;

  function mesh(geo, mat, x, y, z, cast, receive) {
    var m = new THREE.Mesh(geo, mat);
    if (x !== undefined) m.position.set(x, y, z);
    m.castShadow = cast !== false;
    m.receiveShadow = receive !== false;
    return m;
  }

  function init() {
    var stage = document.getElementById("stage");
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    var softGL = false;
    try {
      var gl = renderer.getContext();
      var ext = gl.getExtension("WEBGL_debug_renderer_info");
      var gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "";
      softGL = /swiftshader|software|basic render/i.test(String(gpu));
    } catch (e) { /* 保留默认 */ }
    renderer.setPixelRatio(softGL ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = softGL ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.physicallyCorrectLights = true;
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070c);
    scene.fog = new THREE.Fog(0x070b12, 110, 560);

    var camera = new THREE.PerspectiveCamera(42, stage.clientWidth / stage.clientHeight, 0.1, 1600);
    camera.position.set(-8.2, 7.6, 9.3);

    /* ---- 夜色灯光 ---- */
    scene.add(new THREE.HemisphereLight(0x2c3c55, 0x0a0e14, 0.5));
    scene.add(new THREE.AmbientLight(0x28334a, 0.42));
    var moon = new THREE.DirectionalLight(0x9db4d8, 0.85);
    moon.position.set(-38, 55, -26);
    moon.castShadow = true;
    moon.shadow.mapSize.set(softGL ? 1024 : 2048, softGL ? 1024 : 2048);
    moon.shadow.camera.left = -18; moon.shadow.camera.right = 18;
    moon.shadow.camera.top = 18; moon.shadow.camera.bottom = -18;
    moon.shadow.camera.near = 10; moon.shadow.camera.far = 130;
    moon.shadow.bias = -0.0004;
    scene.add(moon);

    /* ---- 靶线地面 ---- */
    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(320, 320),
      new THREE.MeshStandardMaterial({ map: SRTL.Textures.ground(), roughness: 0.94 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    var outer = new THREE.Mesh(
      new THREE.PlaneGeometry(1400, 1400),
      new THREE.MeshStandardMaterial({ color: 0x0c1218, roughness: 1 })
    );
    outer.rotation.x = -Math.PI / 2;
    outer.position.y = -0.04;
    scene.add(outer);

    /* ---- 双层天穹（夜色 / 深空，随高度交叉淡化） ---- */
    var domeNight = new THREE.Mesh(
      new THREE.SphereGeometry(760, 32, 18),
      new THREE.MeshBasicMaterial({ map: SRTL.Textures.skyNight(), side: THREE.BackSide, fog: false, depthWrite: false })
    );
    scene.add(domeNight);
    spaceDomeMat = new THREE.MeshBasicMaterial({
      map: SRTL.Textures.skySpace(), side: THREE.BackSide, fog: false,
      depthWrite: false, transparent: true, opacity: 0
    });
    var domeSpace = new THREE.Mesh(new THREE.SphereGeometry(740, 32, 18), spaceDomeMat);
    domeSpace.renderOrder = 1;
    scene.add(domeSpace);

    /* ---- 远景剪影：塔架 / 山丘 / 警示灯 ---- */
    buildHorizon(scene);

    /* ---- 共享材质（先建，零件都依赖） ---- */
    var skinA = SRTL.Textures.skinWhite("SR-290", "AZURE RANGE");
    var skinB = SRTL.Textures.skinWhite("SR-290", "SONDE 07");
    M.whiteBody = new THREE.MeshStandardMaterial({ map: skinA, roughness: 0.42, metalness: 0.08 });
    M.whiteBody2 = new THREE.MeshStandardMaterial({ map: skinB, roughness: 0.42, metalness: 0.08 });
    M.whitePlain = new THREE.MeshStandardMaterial({ color: 0xe8ebee, roughness: 0.45 });
    M.silverBody = new THREE.MeshStandardMaterial({ map: SRTL.Textures.skinSilver(), roughness: 0.34, metalness: 0.72 });
    M.silver = new THREE.MeshStandardMaterial({ color: 0xc4c9d1, metalness: 0.8, roughness: 0.3 });
    M.steel = new THREE.MeshStandardMaterial({ color: 0x6a717c, metalness: 0.7, roughness: 0.42 });
    M.dark = new THREE.MeshStandardMaterial({ color: 0x23272e, roughness: 0.7, metalness: 0.3 });
    M.rubber = new THREE.MeshStandardMaterial({ color: 0x171a1f, roughness: 0.85 });
    M.terra = new THREE.MeshStandardMaterial({ color: 0xa75f3f, roughness: 0.6, metalness: 0.15, side: THREE.DoubleSide });
    M.orange = new THREE.MeshStandardMaterial({ color: 0xF26A1B, roughness: 0.5 });
    M.green = new THREE.MeshStandardMaterial({ color: 0x3E8E5A, roughness: 0.5 });
    M.redBox = new THREE.MeshStandardMaterial({ color: 0xb03a24, roughness: 0.5 });
    M.glass = new THREE.MeshStandardMaterial({
      color: 0x0d1a20, roughness: 0.15, metalness: 0.4,
      emissive: 0x2ea8a8, emissiveIntensity: 0
    });
    M.concrete = new THREE.MeshStandardMaterial({ color: 0x3a3f45, roughness: 0.92 });
    M.hazard = new THREE.MeshStandardMaterial({ map: SRTL.Textures.hazard(), roughness: 0.8 });
    M.porthole = M.glass;

    /* ---- 四座探照灯 ---- */
    var spots = [[17, 12], [-17, 12], [17, -12], [-17, -12]];
    spots.forEach(function (p) { searchLights.push(buildSearchLight(scene, p[0], p[1])); });

    LS3D(scene, camera, renderer);
  }

  function LS3D(scene, camera, renderer) {
    SRTL.Scene3D = {
      scene: scene,
      camera: camera,
      renderer: renderer,
      M: M,
      mesh: mesh
    };
  }

  /* 远景：剪影塔架 + 山丘 + 闪烁警示灯 */
  function buildHorizon(scene) {
    var silMat = new THREE.MeshBasicMaterial({ color: 0x070b11, fog: true });
    var towerGeo = new THREE.BoxGeometry(1, 1, 1);
    var towers = [[-95, 12, -120, 3.2], [130, 16, -60, 4], [-150, 9, 90, 2.4], [70, 20, -150, 4.6], [160, 11, 110, 3]];
    towers.forEach(function (t) {
      var g = new THREE.Group();
      for (var i = 0; i < 5; i++) {
        var seg = new THREE.Mesh(towerGeo, silMat);
        var hh = t[1] * (1 - i * 0.16);
        seg.scale.set(0.9 - i * 0.12, hh / 5, 0.9 - i * 0.12);
        seg.position.y = t[1] - hh / 2 - i * (hh / 5);
        g.add(seg);
      }
      g.position.set(t[0], 0, t[2]);
      scene.add(g);
      var dot = new THREE.Sprite(new THREE.SpriteMaterial({
        map: SRTL.Textures.glowDot(), color: 0xe84f4f, transparent: true,
        opacity: 0.8, fog: false, depthWrite: false
      }));
      dot.scale.set(2.6, 2.6, 1);
      dot.position.set(t[0], t[1] + 1.4, t[2]);
      dot.userData.blinkPhase = Math.random() * 2;
      scene.add(dot);
      beacon = beacon || [];
      beacon.push(dot);
    });
    var hillMat = new THREE.MeshBasicMaterial({ color: 0x080c12, fog: true });
    [[-220, -260, 130, 26], [240, -220, 160, 34], [60, -330, 200, 40], [-320, 160, 150, 30]].forEach(function (hm) {
      var hill = new THREE.Mesh(new THREE.ConeGeometry(hm[2], hm[3], 7), hillMat);
      hill.position.set(hm[0], hm[3] / 2 - 2, hm[1]);
      hill.scale.z = 0.35;
      scene.add(hill);
    });
  }

  /* 探照灯：底座 + 云台 + 锥形体积光 + SpotLight */
  function buildSearchLight(scene, x, z) {
    var g = new THREE.Group();
    g.position.set(x, 0, z);
    g.add(mesh(new THREE.CylinderGeometry(0.42, 0.55, 0.3, 10), M.dark, 0, 0.15, 0));
    g.add(mesh(new THREE.BoxGeometry(0.16, 1.4, 0.16), M.steel, 0, 0.9, 0));
    var head = new THREE.Group();
    head.position.set(0, 1.9, 0);
    var barrel = mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.55, 14), M.dark);
    barrel.rotation.x = Math.PI / 2;
    head.add(barrel);
    var lens = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 14),
      new THREE.MeshStandardMaterial({ color: 0x3b3a30, emissive: 0xffd9a0, emissiveIntensity: 0 }), 0, 0, 0.3);
    lens.rotation.x = Math.PI / 2;
    head.add(lens);
    var coneGeo = new THREE.ConeGeometry(1.6, 9.5, 20, 1, true);
    coneGeo.translate(0, -4.75, 0);
    var coneMat = new THREE.MeshBasicMaterial({
      color: 0xcfe0f0, transparent: true, opacity: 0, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false
    });
    var cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = -Math.PI / 2;
    head.add(cone);
    g.add(head);
    var spot = new THREE.SpotLight(0xd8e4f2, 0, 90, 0.36, 0.6, 2);
    spot.position.set(0, 0, 0);
    head.add(spot);
    var spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 1.4, 0);
    scene.add(spotTarget);
    spot.target = spotTarget;
    scene.add(g);
    return { group: g, head: head, spot: spot, coneMat: coneMat, lensMat: lens.material, target: spotTarget, baseY: 1.9 };
  }

  /* 探照灯开关 0..1（pad 阶段渐亮） */
  function setSearchPower(p) {
    searchPower = p;
    for (var i = 0; i < searchLights.length; i++) {
      var s = searchLights[i];
      s.spot.intensity = 560 * p;
      s.coneMat.opacity = 0.06 * p;
      s.lensMat.emissiveIntensity = 1.4 * p;
    }
  }

  /* 高度 → 深空穹顶交叉淡化 */
  function setSpaceFactor(f) {
    spaceDomeMat.opacity = Math.max(0, Math.min(1, f));
  }

  /* 探照灯跟踪目标（飞行时指向火箭） */
  function setTrackPoint(v) {
    trackPoint = v;
  }

  function update(dt, time) {
    var aim;
    for (var i = 0; i < searchLights.length; i++) {
      var s = searchLights[i];
      aim = trackPoint || tmpAim.set(0, 1.6, 0);
      /* 云台缓慢摆扫 + 跟踪 */
      tmpV.copy(aim);
      if (!trackPoint) tmpV.x += Math.sin(time * 0.5 + i * 1.7) * 1.6;
      s.head.lookAt(tmpV);
      s.target.position.copy(tmpV);
    }
    if (beacon) {
      for (var b = 0; b < beacon.length; b++) {
        beacon[b].material.opacity = ((time * 0.7 + beacon[b].userData.blinkPhase) % 1.6) < 0.5 ? 0.85 : 0.1;
      }
    }
  }

  var tmpV = null, tmpAim = null;

  SRTL.SceneInit = init;
  SRTL.SceneUpdate = function (dt) {
    if (!tmpV) { tmpV = new THREE.Vector3(); tmpAim = new THREE.Vector3(); }
    update(dt, performance.now() / 1000);
  };
  SRTL.setSearchPower = setSearchPower;
  SRTL.setSpaceFactor = setSpaceFactor;
  SRTL.setTrackPoint = setTrackPoint;
})(window.SRTL = window.SRTL || {});
