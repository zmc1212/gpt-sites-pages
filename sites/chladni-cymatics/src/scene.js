/* scene.js — 渲染器/相机/灯光/板与支架/轨道相机/振幅热图/板面振动
 *
 * 布景:暗色摄影棚,方形钢板架在扬声器箱 + 立柱上,中央螺栓驱动;
 *       板面顶点按当前板形函数做微小正弦位移(视觉 4.5 Hz,幅度随共振包络),
 *       振幅热图是叠加在板面上方的自发光平面(暗=节线,亮=波腹)。
 * 轨道相机:拖动旋转、滚轮/双指缩放,带阻尼;未交互前缓慢自转。 */
(function () {
  'use strict';
  const CH = window.CH;

  const VIB_AMP = 0.018;   // 板面视觉振动幅度
  const VIB_HZ = 4.5;      // 板面视觉振动频率(真实频率太高,无法直接呈现)
  const HEAT_RES = 256;    // 热图分辨率
  const HEAT_EVERY = 5;    // 热图重绘节流(帧)

  const TARGET = new THREE.Vector3(0, CH.CFG.PLATE_TOP - 0.02, 0);

  const scene3 = {
    renderer: null, scene: null, camera: null,
    plate: null, plateGeo: null, plateBase: null,
    heatPlane: null, heatTex: null, heatCtx: null, heatData: null,
    heatFrame: 99, lastM: -999, lastN: -999,
    led: null, ledOn: false,
    vibPhase: 0, vibActive: false,
    orbit: { theta: -0.62, phi: 1.06, radius: 2.75, tTheta: -0.62, tPhi: 1.06, tRadius: 2.75, auto: true },
    time: 0,
  };

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  /** 程序化摄影棚环境贴图:顶灯亮斑 + 冷辅光的垂直渐变,供金属反射(IBL)。 */
  function studioEnv(renderer) {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 32;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 32);
    grad.addColorStop(0, '#8a92a2');
    grad.addColorStop(0.55, '#2a2f3a');
    grad.addColorStop(1, '#0d0f14');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 32);
    g.fillStyle = 'rgba(255,240,218,1)';
    g.fillRect(8, 3, 12, 6);   // 暖顶灯
    g.fillStyle = 'rgba(150,180,220,.9)';
    g.fillRect(42, 4, 8, 5);   // 冷辅光
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.encoding = THREE.sRGBEncoding;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const rt = pmrem.fromEquirectangular(tex);
    pmrem.dispose();
    tex.dispose();
    return rt.texture;
  }

  // ---------- 轨道相机输入 ----------
  const pointers = new Map();
  let pinchDist = 0;

  function onPointerDown(e) {
    scene3.orbit.auto = false;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const p = [...pointers.values()];
      pinchDist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    const o = scene3.orbit;
    if (pointers.size === 2) {
      p.x = e.clientX; p.y = e.clientY;
      const q = [...pointers.values()];
      const d = Math.hypot(q[0].x - q[1].x, q[0].y - q[1].y);
      if (pinchDist > 0 && d > 0) o.tRadius = clamp(o.tRadius * pinchDist / d, 1.6, 5.5);
      pinchDist = d;
      return;
    }
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    o.tTheta -= dx * 0.0052;
    o.tPhi = clamp(o.tPhi - dy * 0.0042, 0.35, 1.46);
  }
  function onPointerUp(e) {
    pointers.delete(e.pointerId);
    pinchDist = 0;
  }
  function onWheel(e) {
    scene3.orbit.auto = false;
    const o = scene3.orbit;
    o.tRadius = clamp(o.tRadius * Math.exp(e.deltaY * 0.0011), 1.6, 5.5);
    e.preventDefault();
  }

  // ---------- 振幅热图 ----------
  function drawHeat(m, n) {
    const ctx = scene3.heatCtx, img = scene3.heatData, W = HEAT_RES;
    const d = img.data;
    let idx = 0;
    for (let py = 0; py < W; py++) {
      const v = (py + 0.5) / W, pv = Math.PI * v;
      for (let px = 0; px < W; px++) {
        const u = (px + 0.5) / W, pu = Math.PI * u;
        // f:4 cos;振幅归一化(f ∈ [-2,2])。canvas(x=u, y=v)与粒子坐标一致
        const a = Math.min(1, Math.abs(
          Math.cos(pu * m) * Math.cos(pv * n) - Math.cos(pu * n) * Math.cos(pv * m)
        ) / 2);
        const b = Math.pow(a, 1.5);
        // 节线(暗蓝黑)→ 波腹(亮琥珀)
        d[idx] = 14 + 241 * b;
        d[idx + 1] = 18 + 130 * b;
        d[idx + 2] = 28 + 46 * b;
        d[idx + 3] = 255;
        idx += 4;
      }
    }
    ctx.putImageData(img, 0, 0);
    scene3.heatTex.needsUpdate = true;
  }

  // ---------- 初始化 ----------
  scene3.init = function (container) {
    THREE.ColorManagement.legacyMode = false;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';
    scene3.renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1017);
    scene.fog = new THREE.FogExp2(0x0d1017, 0.1);
    scene.environment = studioEnv(renderer);
    scene3.scene = scene;

    const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.05, 60);
    scene3.camera = camera;

    // ---- 灯光 ----
    scene.add(new THREE.HemisphereLight(0x8890a0, 0x0b0d12, 0.5));
    const key = new THREE.DirectionalLight(0xffe9cf, 1.5);
    key.position.set(2.6, 4.6, 1.9);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = key.shadow.camera.bottom = -7;
    key.shadow.camera.right = key.shadow.camera.top = 7;
    key.shadow.camera.near = 1; key.shadow.camera.far = 12;
    key.shadow.radius = 4;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x5a7ea0, 0.55);
    rim.position.set(-3, 2.2, -2.6);
    scene.add(rim);

    // ---- 地面 ----
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(7, 64),
      new THREE.MeshStandardMaterial({ color: 0x161a22, roughness: 0.92, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // ---- 支架:扬声器箱 + 立柱 + 中央螺栓 ----
    const box = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.40, 0.34, 48),
      new THREE.MeshStandardMaterial({ color: 0x1c212a, roughness: 0.6, metalness: 0.35 })
    );
    box.position.y = 0.17;
    box.castShadow = box.receiveShadow = true;
    scene.add(box);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.30, 0.012, 12, 64),
      new THREE.MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.5, metalness: 0.6 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.345;
    scene.add(ring);
    const driver = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.21, 0.02, 48),
      new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: 0.85 })
    );
    driver.position.y = 0.35;
    scene.add(driver);
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.038, 0.42, 24),
      new THREE.MeshStandardMaterial({ color: 0x3d434c, roughness: 0.35, metalness: 0.8 })
    );
    shaft.position.y = 0.57;
    shaft.castShadow = true;
    scene.add(shaft);
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.10, 20),
      new THREE.MeshStandardMaterial({ color: 0x565f6b, roughness: 0.3, metalness: 0.9 })
    );
    bolt.position.y = 0.965; // 穿过板中心,顶端略高于板面
    bolt.castShadow = true;
    scene.add(bolt);
    const nut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6),
      new THREE.MeshStandardMaterial({ color: 0x636e7c, roughness: 0.28, metalness: 0.9 })
    );
    nut.position.y = CH.CFG.PLATE_TOP + 0.01;
    scene.add(nut);

    // ---- 振动板 ----
    const plateGeo = new THREE.BoxGeometry(CH.CFG.PLATE, 0.024, CH.CFG.PLATE, 44, 1, 44);
    scene3.plateGeo = plateGeo;
    scene3.plateBase = plateGeo.attributes.position.array.slice();
    const plate = new THREE.Mesh(plateGeo, new THREE.MeshStandardMaterial({
      color: 0x3d4450, metalness: 0.65, roughness: 0.4,
    }));
    plate.position.y = CH.CFG.PLATE_TOP - 0.012;
    plate.castShadow = true;
    plate.receiveShadow = true;
    scene3.plate = plate;
    scene.add(plate);

    // ---- 振幅热图平面(默认隐藏) ----
    const hc = document.createElement('canvas');
    hc.width = hc.height = HEAT_RES;
    scene3.heatCtx = hc.getContext('2d');
    scene3.heatData = scene3.heatCtx.createImageData(HEAT_RES, HEAT_RES);
    const heatTex = new THREE.CanvasTexture(hc);
    heatTex.encoding = THREE.sRGBEncoding;
    scene3.heatTex = heatTex;
    const heatPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(CH.CFG.PLATE - 0.01, CH.CFG.PLATE - 0.01),
      new THREE.MeshBasicMaterial({ map: heatTex, transparent: true, opacity: 0.9, depthWrite: false })
    );
    heatPlane.rotation.x = -Math.PI / 2;
    heatPlane.position.y = CH.CFG.PLATE_TOP + 0.002;
    heatPlane.renderOrder = 1;
    heatPlane.visible = false;
    scene3.heatPlane = heatPlane;
    scene.add(heatPlane);

    // ---- 指示灯(发声时亮) ----
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0x201408, emissive: 0xd9a863, emissiveIntensity: 0, roughness: 0.4,
      })
    );
    led.position.set(0.30, 0.36, 0.14);
    scene3.led = led;
    scene.add(led);

    // ---- 输入 ----
    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('pointercancel', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    window.addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });
  };

  scene3.setHeat = function (on) {
    scene3.heatPlane.visible = on;
    if (on) { scene3.lastM = -999; scene3.lastN = -999; } // 强制下帧重绘
  };

  scene3.setLed = function (on) { scene3.ledOn = on; };

  /** 每帧:轨道相机、板面振动、热图节流重绘、指示灯。 */
  scene3.update = function (dt, modes, heatImmediate) {
    scene3.time += dt;

    // 轨道相机(阻尼趋近目标)
    const o = scene3.orbit;
    if (o.auto) o.tTheta += dt * 0.10;
    const k = Math.min(1, dt * 7);
    o.theta += (o.tTheta - o.theta) * k;
    o.phi += (o.tPhi - o.phi) * k;
    o.radius += (o.tRadius - o.radius) * k;
    const sp = Math.sin(o.phi);
    scene3.camera.position.set(
      TARGET.x + o.radius * sp * Math.sin(o.theta),
      TARGET.y + o.radius * Math.cos(o.phi),
      TARGET.z + o.radius * sp * Math.cos(o.theta)
    );
    scene3.camera.lookAt(TARGET);

    // 板面振动:顶点位移 = 板形 × 包络 × 视觉正弦
    const m = modes.m, n = modes.n, env = modes.env;
    scene3.vibPhase += dt * VIB_HZ * 2 * Math.PI;
    if (env > 0.02 || scene3.vibActive) {
      const disp = VIB_AMP * env * Math.sin(scene3.vibPhase);
      const geo = scene3.plateGeo, base = scene3.plateBase, arr = geo.attributes.position.array;
      const S = CH.CFG.PLATE;
      for (let i = 0; i < arr.length; i += 3) {
        const u = base[i] / S + 0.5, v = base[i + 2] / S + 0.5;
        arr[i + 1] = base[i + 1] + disp * CH.shape(u, v, m, n);
      }
      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals();
      scene3.vibActive = env > 0.02;
    }

    // 热图:模式变了就按 HEAT_EVERY 节流重绘;直接拖旋钮时立即重绘
    if (scene3.heatPlane.visible) {
      const changed = Math.abs(m - scene3.lastM) + Math.abs(n - scene3.lastN) > 0.004;
      scene3.heatFrame++;
      if ((changed && scene3.heatFrame >= (heatImmediate ? 1 : HEAT_EVERY)) ||
          scene3.heatFrame >= HEAT_EVERY * 6) {
        drawHeat(m, n);
        scene3.lastM = m; scene3.lastN = n;
        scene3.heatFrame = 0;
      }
    }

    // 指示灯:发声时呼吸闪烁
    scene3.led.material.emissiveIntensity = scene3.ledOn
      ? 1.4 + 0.9 * Math.sin(scene3.time * 6) : 0;

    scene3.renderer.render(scene3.scene, scene3.camera);
  };

  CH.scene3 = scene3;
})();
