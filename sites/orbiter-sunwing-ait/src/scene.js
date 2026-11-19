/* 场景:渲染器 / 洁净间灯光 / 地面 / 转台 / 星点 / 深空渐变(阶段 8 记忆点) */
(function (ORBW) {
  var M = {};                 // 共享材质(先于零件创建)
  var floorMesh = null, tableMesh = null, fixture = null, gndPlate = null;
  var lightbars = [];
  var stars = null, starMat = null;
  var pedestal = null, satRoot = null;
  var cleanCol = new THREE.Color(0xdce3e8), spaceCol = new THREE.Color(0x05070d);
  var whiteCol = new THREE.Color(0xffffff), darkCol = new THREE.Color(0x0a0f15);
  var sunClean = new THREE.Color(0xffffff), sunSpace = new THREE.Color(0xffe9c4);
  var sunPosClean = new THREE.Vector3(4.5, 7.5, 3), sunPosSpace = new THREE.Vector3(6.5, 2.8, 1.6);
  var hemi, sun, ambient, fill;
  var camClean = new THREE.Color(0xf2f6fa), camSpace = new THREE.Color(0x0c1220);
  var gndClean = new THREE.Color(0xaab4bd), gndSpace = new THREE.Color(0x080d18);

  function mesh(geo, mat, x, y, z, cast, receive) {
    var m = new THREE.Mesh(geo, mat);
    if (x !== undefined) m.position.set(x, y, z);
    m.castShadow = cast !== false;
    m.receiveShadow = receive !== false;
    return m;
  }

  /* 星点:500 颗,球壳分布,微色差 */
  function buildStars() {
    var n = 500, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var th = Math.random() * Math.PI * 2;
      var ph = Math.acos(2 * Math.random() - 1);
      var r = 26 + Math.random() * 9;
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.cos(ph);
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      var t = Math.random();
      var c = t < 0.72 ? [1, 1, 1] : (t < 0.88 ? [1, 0.92, 0.72] : [0.72, 0.84, 1]);
      var b = 0.55 + Math.random() * 0.45;
      col[i * 3] = c[0] * b; col[i * 3 + 1] = c[1] * b; col[i * 3 + 2] = c[2] * b;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    starMat = new THREE.PointsMaterial({
      size: 0.42, map: ORBW.Textures.starSprite(), transparent: true, opacity: 0,
      depthWrite: false, vertexColors: true, sizeAttenuation: true
    });
    stars = new THREE.Points(geo, starMat);
    stars.visible = false;
    return stars;
  }

  function init() {
    var stage = document.getElementById("stage");
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    // 软件渲染(SwiftShader 等)下降像素比 + 精简阴影,保证可交互帧率
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
    renderer.toneMappingExposure = 1.15;
    // 物理光照:去掉 legacy 模式的 π 增益,否则暗色材质会被抬成灰白
    renderer.physicallyCorrectLights = true;
    stage.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.background = cleanCol.clone();

    var camera = new THREE.PerspectiveCamera(38, stage.clientWidth / stage.clientHeight, 0.1, 90);
    camera.position.set(4.6, 4.4, 6.2);

    hemi = new THREE.HemisphereLight(camClean.getHex(), gndClean.getHex(), 1.0);
    scene.add(hemi);
    sun = new THREE.DirectionalLight(0xffffff, 1.35);
    sun.position.copy(sunPosClean);
    sun.castShadow = true;
    sun.shadow.mapSize.set(softGL ? 1024 : 2048, softGL ? 1024 : 2048);
    sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
    sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 30;
    sun.shadow.bias = -0.0004;
    scene.add(sun);
    ambient = new THREE.AmbientLight(0xffffff, 0.22);
    scene.add(ambient);
    fill = new THREE.DirectionalLight(0x9fb6e8, 0.14);
    fill.position.set(-5, 2.2, -4);
    scene.add(fill);

    /* ---- 共享材质(先建,零件都依赖) ---- */
    M.ink = new THREE.MeshStandardMaterial({ color: 0x22262c, roughness: 0.75 });
    M.dark = new THREE.MeshStandardMaterial({ color: 0x2c3138, roughness: 0.68 });
    M.black = new THREE.MeshStandardMaterial({ color: 0x14171c, roughness: 0.55 });
    M.alu = new THREE.MeshStandardMaterial({ color: 0xc9cdd4, metalness: 0.7, roughness: 0.34 });
    M.ti = new THREE.MeshStandardMaterial({ color: 0xd6dade, metalness: 0.85, roughness: 0.28 });
    M.gold = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.78, roughness: 0.36 });
    M.white = new THREE.MeshStandardMaterial({ color: 0xeceae2, roughness: 0.42 });
    M.navy = new THREE.MeshStandardMaterial({ color: 0x1b2c6b, roughness: 0.45 });
    M.honey = new THREE.MeshStandardMaterial({ map: ORBW.Textures.honeycomb(), roughness: 0.62, metalness: 0.25 });
    M.cell = new THREE.MeshStandardMaterial({ map: ORBW.Textures.cells(), metalness: 0.42, roughness: 0.22, side: THREE.DoubleSide });
    M.cellBack = new THREE.MeshStandardMaterial({ color: 0x2a3140, roughness: 0.7, side: THREE.DoubleSide });
    M.strap = new THREE.MeshStandardMaterial({ map: ORBW.Textures.straps(), roughness: 0.55 });
    M.foil = new THREE.MeshStandardMaterial({ map: ORBW.Textures.foil(), metalness: 0.65, roughness: 0.42 });
    M.bell = new THREE.MeshStandardMaterial({ color: 0x343a42, metalness: 0.6, roughness: 0.42 });
    M.lens = new THREE.MeshStandardMaterial({ color: 0x0d1626, metalness: 0.4, roughness: 0.15 });
    M.wingEdge = new THREE.MeshStandardMaterial({ color: 0xd6dbde, metalness: 0.6, roughness: 0.35 });

    /* ---- 洁净间地面 ---- */
    floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(42, 42),
      new THREE.MeshStandardMaterial({ map: ORBW.Textures.floor(), roughness: 0.9 })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    /* ---- 慢转转台 + 卫星根节点 ---- */
    pedestal = new THREE.Group();
    scene.add(pedestal);
    var topTex = ORBW.Textures.turntable();
    tableMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.42, 0.14, 64),
      [new THREE.MeshStandardMaterial({ map: ORBW.Textures.hazard(), roughness: 0.6 }),
       new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.55, metalness: 0.2 }),
       new THREE.MeshStandardMaterial({ color: 0x22262c, roughness: 0.8 })]
    );
    tableMesh.position.y = 0.07;
    tableMesh.receiveShadow = true;
    tableMesh.castShadow = true;
    pedestal.add(tableMesh);
    // 星下点安装架(转台设备,不属于飞行件)
    fixture = mesh(new THREE.BoxGeometry(1.34, 0.08, 0.82), M.dark, 0, 0.18, 0);
    fixture.material = new THREE.MeshStandardMaterial({ color: 0x3d444c, roughness: 0.6, metalness: 0.3 });
    pedestal.add(fixture);
    satRoot = new THREE.Group();
    pedestal.add(satRoot);

    /* ---- 地面测试接口台(脐带缆地面端) ---- */
    gndPlate = new THREE.Group();
    gndPlate.position.set(0.35, 0, -1.52);
    var gbox = mesh(new THREE.BoxGeometry(0.3, 0.2, 0.24), M.dark, 0, 0.1, 0);
    gndPlate.add(gbox);
    gndPlate.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 12), M.alu, 0, 0.225, 0));
    var gled = mesh(new THREE.BoxGeometry(0.05, 0.02, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x183418, emissive: 0x2fbf5f, emissiveIntensity: 0.7 }), 0.1, 0.205, 0.08, false);
    gndPlate.add(gled);
    scene.add(gndPlate);

    /* ---- 洁净间顶部灯带(入轨时熄灭) ---- */
    for (var i = 0; i < 2; i++) {
      var bar = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.05, 0.34),
        new THREE.MeshStandardMaterial({ color: 0xf4f7ff, emissive: 0xf4f7ff, emissiveIntensity: 0.85 })
      );
      bar.position.set(i ? 1.5 : -1.3, 3.3, i ? -0.7 : 0.8);
      bar.rotation.y = 0.35;
      scene.add(bar);
      lightbars.push(bar);
    }

    /* ---- 星点(深空段淡入) ---- */
    scene.add(buildStars());

    ORBW.Scene3D = {
      scene: scene, camera: camera, renderer: renderer,
      M: M, mesh: mesh,
      pedestal: pedestal, satRoot: satRoot,
      gndPlate: gndPlate
    };
  }

  var lastMix = -1;
  /* spaceMix 0..1:洁净间 → 深空(背景/灯光/地面同步渐变) */
  function applySpace(mix) {
    if (Math.abs(mix - lastMix) < 0.0005 && mix !== 0 && mix !== 1) return;
    lastMix = mix;
    var bg = ORBW.Scene3D.scene.background;
    bg.copy(cleanCol).lerp(spaceCol, mix);
    hemi.intensity = 1.0 - 0.93 * mix;
    hemi.color.copy(camClean).lerp(camSpace, mix);
    hemi.groundColor.copy(gndClean).lerp(gndSpace, mix);
    ambient.intensity = 0.22 - 0.17 * mix;
    sun.intensity = 1.35 + 1.35 * mix;
    sun.color.copy(sunClean).lerp(sunSpace, mix);
    sun.position.copy(sunPosClean).lerp(sunPosSpace, mix);
    fill.intensity = 0.14 + 0.24 * mix;
    var tint = whiteCol.clone().lerp(darkCol, mix);
    floorMesh.material.color.copy(tint);
    tableMesh.material[0].color.copy(tint);
    tableMesh.material[1].color.copy(tint);
    fixture.material.color.copy(tint);
    gndPlate.children.forEach(function (c) {
      if (c.material && c.material.color && !c.material.emissive) c.material.color.copy(tint);
    });
    for (var i = 0; i < lightbars.length; i++) {
      lightbars[i].material.emissiveIntensity = 0.85 * (1 - mix);
      lightbars[i].visible = mix < 0.92;
    }
    starMat.opacity = Math.max(0, (mix - 0.15) / 0.85) * 0.95;
    stars.visible = mix > 0.15;
  }

  function update(dt) {
    if (stars && stars.visible) stars.rotation.y += dt * 0.004;
    if (typeof ORBW.spaceMix === "number") applySpace(ORBW.spaceMix);
  }

  ORBW.SceneInit = init;
  ORBW.SceneUpdate = update;
})(window.ORBW = window.ORBW || {});
