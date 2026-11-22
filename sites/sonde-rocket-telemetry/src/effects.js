/* 特效：烟雾粒子池（自定义着色器 Points：逐粒子尺寸/透明度/色）+ 喷焰 + 排气 + 落地烟尘 */
(function (SRTL) {
  var N = 1400;
  var geo, pts, ppos, psize, palpha, pcol;
  var vx, vy, vz, age, life, s0, s1, a0, drag, buoy, grav, alive;
  var head = 0;
  var flame = null, flameOuter, flameCore, flameGlowMat, flameLight;
  var flameTarget = 0, flameI = 0;
  var ventAcc = 0, ventRate = 0;
  var ventPos = new THREE.Vector3();
  var tmpAxis = new THREE.Vector3();

  var VERT = [
    "attribute float aSize;",
    "attribute float aAlpha;",
    "attribute vec3 aCol;",
    "varying float vA;",
    "varying vec3 vC;",
    "void main(){",
    "  vA = aAlpha; vC = aCol;",
    "  vec4 mv = modelViewMatrix * vec4(position, 1.0);",
    "  gl_PointSize = aSize * (300.0 / max(1.0, -mv.z));",
    "  gl_Position = projectionMatrix * mv;",
    "}"
  ].join("\n");

  var FRAG = [
    "uniform sampler2D map;",
    "varying float vA;",
    "varying vec3 vC;",
    "void main(){",
    "  vec4 t = texture2D(map, gl_PointCoord);",
    "  float a = t.a * vA;",
    "  if (a < 0.012) discard;",
    "  gl_FragColor = vec4(t.rgb * vC, a);",
    "}"
  ].join("\n");

  function init() {
    ppos = new Float32Array(N * 3);
    psize = new Float32Array(N);
    palpha = new Float32Array(N);
    pcol = new Float32Array(N * 3);
    for (var c = 0; c < N * 3; c++) pcol[c] = 1;
    vx = new Float32Array(N); vy = new Float32Array(N); vz = new Float32Array(N);
    age = new Float32Array(N); life = new Float32Array(N);
    s0 = new Float32Array(N); s1 = new Float32Array(N);
    a0 = new Float32Array(N); drag = new Float32Array(N);
    buoy = new Float32Array(N); grav = new Float32Array(N);
    alive = new Uint8Array(N);

    geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(ppos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("aSize", new THREE.BufferAttribute(psize, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("aAlpha", new THREE.BufferAttribute(palpha, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("aCol", new THREE.BufferAttribute(pcol, 3).setUsage(THREE.DynamicDrawUsage));
    var mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: SRTL.Textures.softDisc() } },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false
    });
    pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    SRTL.Scene3D.scene.add(pts);

    buildFlame();
  }

  /* 喷焰：双层加色锥 + 辉光 sprite + 点光源（由 Flight 挂到 rocketRoot 局部喷管处） */
  function buildFlame() {
    flame = new THREE.Group();
    var outerGeo = new THREE.ConeGeometry(0.17, 1.7, 18, 1, true);
    outerGeo.translate(0, -0.85, 0);
    flameOuter = new THREE.Mesh(outerGeo, new THREE.MeshBasicMaterial({
      color: 0xff8a3c, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false
    }));
    flame.add(flameOuter);
    var coreGeo = new THREE.ConeGeometry(0.09, 1.0, 14, 1, true);
    coreGeo.translate(0, -0.5, 0);
    flameCore = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({
      color: 0xffd9a0, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false
    }));
    flame.add(flameCore);
    flameGlowMat = new THREE.SpriteMaterial({
      map: SRTL.Textures.glowDot(), color: 0xffa050, transparent: true,
      opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, fog: false
    });
    var glow = new THREE.Sprite(flameGlowMat);
    glow.scale.set(2.4, 2.4, 1);
    glow.position.y = -0.5;
    flame.add(glow);
    flameLight = new THREE.PointLight(0xff8a3c, 0, 16, 2);
    flameLight.position.y = -0.9;
    flame.add(flameLight);
    flame.position.set(0, -0.68, 0);
    flame.visible = false;
    SRTL.Scene3D.scene.add(flame);
  }

  /* 挂到火箭根部（喷焰随箭体位形） */
  function attachFlame(root) {
    SRTL.Scene3D.scene.remove(flame);
    root.add(flame);
  }

  function setFlame(on) { flameTarget = on ? 1 : 0; }

  function spawn(i, x, y, z, o) {
    ppos[i * 3] = x; ppos[i * 3 + 1] = y; ppos[i * 3 + 2] = z;
    vx[i] = o.vx; vy[i] = o.vy; vz[i] = o.vz;
    age[i] = 0; life[i] = o.life;
    s0[i] = o.s0; s1[i] = o.s1; a0[i] = o.a0;
    drag[i] = o.drag; buoy[i] = o.buoy; grav[i] = o.grav;
    pcol[i * 3] = o.r; pcol[i * 3 + 1] = o.g; pcol[i * 3 + 2] = o.b;
    alive[i] = 1;
  }

  function next() {
    var tries = 0;
    while (tries < N && alive[head]) { head = (head + 1) % N; tries++; }
    var i = head;
    head = (head + 1) % N;
    return i;
  }

  /* 点火地面烟暴：水平喷出 + 上浮扩散 */
  function burst(x, y, z, n) {
    for (var k = 0; k < n; k++) {
      var a = Math.random() * Math.PI * 2;
      var sp = 1.6 + Math.random() * 5.5;
      spawn(next(), x + Math.cos(a) * 0.25, y + Math.random() * 0.2, z + Math.sin(a) * 0.25, {
        vx: Math.cos(a) * sp, vy: 0.5 + Math.random() * 1.6, vz: Math.sin(a) * sp,
        life: 2.6 + Math.random() * 1.8,
        s0: 0.9, s1: 4.2 + Math.random() * 1.6, a0: 0.5,
        drag: 1.5, buoy: 1.05, grav: 0,
        r: 0.94, g: 0.95, b: 0.97
      });
    }
  }

  /* 落地烟尘 */
  function dust(x, y, z, n) {
    for (var k = 0; k < n; k++) {
      var a = Math.random() * Math.PI * 2;
      var sp = 0.8 + Math.random() * 2.6;
      spawn(next(), x + Math.cos(a) * 0.3, y + Math.random() * 0.25, z + Math.sin(a) * 0.3, {
        vx: Math.cos(a) * sp, vy: 0.6 + Math.random() * 1.2, vz: Math.sin(a) * sp,
        life: 2.2 + Math.random() * 1.6,
        s0: 0.7, s1: 3.4, a0: 0.44,
        drag: 1.8, buoy: 0.5, grav: -0.9,
        r: 0.72, g: 0.68, b: 0.6
      });
    }
  }

  /* 飞行尾迹（沿箭体轴向下喷出） */
  function emitTrail(pos, quat) {
    tmpAxis.set(0, 1, 0).applyQuaternion(quat);
    var n = 3 + (Math.random() < 0.5 ? 1 : 0);
    for (var k = 0; k < n; k++) {
      spawn(next(),
        pos.x + (Math.random() - 0.5) * 0.18,
        pos.y + (Math.random() - 0.5) * 0.18,
        pos.z + (Math.random() - 0.5) * 0.18, {
        vx: -tmpAxis.x * 2.2 + (Math.random() - 0.5) * 0.7,
        vy: -tmpAxis.y * 2.2 + (Math.random() - 0.5) * 0.7,
        vz: -tmpAxis.z * 2.2 + (Math.random() - 0.5) * 0.7,
        life: 2.0 + Math.random() * 1.2,
        s0: 0.55, s1: 2.9, a0: 0.4,
        drag: 1.4, buoy: 0.35, grav: -0.4,
        r: 0.92, g: 0.93, b: 0.96
      });
    }
  }

  /* 倒计时排气（速率 0 关闭） */
  function setVent(rate, pos) {
    ventRate = rate;
    if (rate > 0) ventPos.copy(pos);
  }

  function update(dt) {
    /* 喷焰渐亮/熄灭 + 抖动 */
    flameI += (flameTarget - flameI) * Math.min(1, dt * 7);
    if (flameI > 0.02) {
      flame.visible = true;
      var j = 0.82 + Math.random() * 0.4;
      flameOuter.scale.set(j, 0.9 + Math.random() * 0.3, j);
      flameCore.scale.set(j, 0.85 + Math.random() * 0.35, j);
      flameOuter.material.opacity = 0.5 * flameI;
      flameCore.material.opacity = 0.85 * flameI;
      flameGlowMat.opacity = 0.8 * flameI;
      flameLight.intensity = (3.2 + Math.random() * 2.2) * flameI;
    } else {
      flame.visible = false;
      flameLight.intensity = 0;
    }
    /* 排气 */
    if (ventRate > 0) {
      ventAcc += ventRate * dt;
      while (ventAcc > 1) {
        ventAcc -= 1;
        spawn(next(),
          ventPos.x + (Math.random() - 0.5) * 0.12,
          ventPos.y, ventPos.z + (Math.random() - 0.5) * 0.12, {
          vx: (Math.random() - 0.5) * 0.24, vy: 0.35 + Math.random() * 0.3, vz: (Math.random() - 0.5) * 0.24,
          life: 1.6 + Math.random() * 0.9,
          s0: 0.28, s1: 1.25, a0: 0.24,
          drag: 1.1, buoy: 0.4, grav: 0,
          r: 0.95, g: 0.96, b: 0.98
        });
      }
    }
    /* 粒子积分 */
    for (var i = 0; i < N; i++) {
      if (!alive[i]) continue;
      age[i] += dt;
      if (age[i] >= life[i]) {
        alive[i] = 0;
        palpha[i] = 0;
        continue;
      }
      var dmp = Math.max(0, 1 - drag[i] * dt);
      vx[i] *= dmp; vz[i] *= dmp;
      vy[i] = vy[i] * dmp + (buoy[i] + grav[i]) * dt;
      ppos[i * 3] += vx[i] * dt;
      ppos[i * 3 + 1] += vy[i] * dt;
      ppos[i * 3 + 2] += vz[i] * dt;
      var u = age[i] / life[i];
      psize[i] = s0[i] + (s1[i] - s0[i]) * u;
      palpha[i] = a0[i] * (1 - u) * (1 - u * 0.35);
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aSize.needsUpdate = true;
    geo.attributes.aAlpha.needsUpdate = true;
    geo.attributes.aCol.needsUpdate = true;
  }

  function reset() {
    for (var i = 0; i < N; i++) { alive[i] = 0; palpha[i] = 0; }
    ventRate = 0; ventAcc = 0;
    flameTarget = 0; flameI = 0;
    flame.visible = false;
    flameLight.intensity = 0;
  }

  SRTL.FX = {
    init: init,
    attachFlame: attachFlame,
    setFlame: setFlame,
    burst: burst,
    dust: dust,
    emitTrail: emitTrail,
    setVent: setVent,
    update: update,
    reset: reset
  };
})(window.SRTL = window.SRTL || {});
