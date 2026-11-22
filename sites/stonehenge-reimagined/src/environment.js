/* 环境与昼夜系统 —— 地表 / 土方工程 / 天空穹顶 / 太阳星光 / 远景 / 昼夜过渡
 *
 * 世界坐标约定:+X=东,+Z=南,-Z=北,Y 向上;巨石阵圆心在原点。
 * 天空穹顶:三段渐变(地平/中层/天顶)+ 朝阳方向的暖色泛光,颜色随太阳高度角
 * 连续插值(白昼 → 金色时刻 → 暮色 → 夜);星空、雾色、光照同步跟随。
 */
(function (global) {
  'use strict';
  var U = global.STUtil;
  var S = global.STSolar;

  var azRad = function (d) { return d * Math.PI / 180; };

  /* 地面高度(与 buildGround 同一噪声函数,供树木等贴地使用) */
  function groundH(x, z) {
    var r = Math.sqrt(x * x + z * z);
    var amp = U.smoothstep(110, 320, r) * 2.6;
    return (U.fbm3(x * 0.012, z * 0.012, 4.2, 4) - 0.5) * 2 * amp
      + (U.noise2(x * 0.05, z * 0.05) - 0.5) * amp * 0.5;
  }

  /* ---------- 程序化贴图 ---------- */
  function grassTexture() {
    var cv = document.createElement('canvas');
    cv.width = cv.height = 1024;
    var ctx = cv.getContext('2d');
    ctx.fillStyle = '#77854f';
    ctx.fillRect(0, 0, 1024, 1024);
    var rand = U.rng(77);
    var i, x, y, r;
    for (i = 0; i < 9000; i++) {
      x = rand() * 1024; y = rand() * 1024; r = 1 + rand() * 3.2;
      var g = rand();
      ctx.fillStyle = g < 0.42 ? 'rgba(96,110,62,0.5)' : (g < 0.8 ? 'rgba(120,134,80,0.45)' : 'rgba(88,98,56,0.4)');
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
    for (i = 0; i < 40; i++) { // 大块明暗草斑
      x = rand() * 1024; y = rand() * 1024;
      var rad = 60 + rand() * 160;
      var grd = ctx.createRadialGradient(x, y, 0, x, y, rad);
      var tone = rand() < 0.5 ? 'rgba(104,116,66,0.24)' : 'rgba(132,142,92,0.20)';
      grd.addColorStop(0, tone); grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill();
    }
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(18, 18);
    tex.anisotropy = 4;
    return tex;
  }

  function radialGlowTexture(inner, outer) {
    var cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    var ctx = cv.getContext('2d');
    var g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  /* 日轮:有清晰边缘的圆盘(内圈实心平台 → 边缘羽化) */
  function sunDiscTexture() {
    var cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    var ctx = cv.getContext('2d');
    var g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,253,244,1)');
    g.addColorStop(0.42, 'rgba(255,251,236,1)');
    g.addColorStop(0.62, 'rgba(255,236,186,0.9)');
    g.addColorStop(1, 'rgba(255,222,150,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function blobTexture(seed, colTop, colBottom) {
    var cv = document.createElement('canvas');
    cv.width = 256; cv.height = 128;
    var ctx = cv.getContext('2d');
    var rand = U.rng(seed);
    var i;
    for (i = 0; i < 26; i++) {
      var x = 40 + rand() * 176, y = 44 + rand() * 44, r = 16 + rand() * 30;
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, colTop);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
    var g2 = ctx.createLinearGradient(0, 70, 0, 128);
    g2.addColorStop(0, 'rgba(255,255,255,0)');
    g2.addColorStop(1, 'rgba(255,255,255,0)');
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function treeTexture(seed) {
    var cv = document.createElement('canvas');
    cv.width = 128; cv.height = 160;
    var ctx = cv.getContext('2d');
    var rand = U.rng(seed);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, 128, 160);
    // 树干
    ctx.fillStyle = 'rgba(62,52,40,0.9)';
    ctx.fillRect(60, 108, 9, 52);
    // 冠
    var i;
    for (i = 0; i < 16; i++) {
      var x = 28 + rand() * 72, y = 30 + rand() * 66, r = 14 + rand() * 22;
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      var dark = rand() < 0.5;
      g.addColorStop(0, dark ? 'rgba(52,72,42,0.95)' : 'rgba(72,92,52,0.92)');
      g.addColorStop(1, 'rgba(52,72,42,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function textSprite(text, color, fontPx, sub) {
    var cv = document.createElement('canvas');
    cv.width = 512; cv.height = 128;
    var ctx = cv.getContext('2d');
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = color || '#ffffff';
    ctx.font = '600 ' + (fontPx || 54) + 'px "Songti SC","Noto Serif SC",serif';
    ctx.fillText(text, 256, sub ? 44 : 64);
    if (sub) {
      ctx.font = '400 30px "Songti SC","Noto Serif SC",serif';
      ctx.fillStyle = 'rgba(255,236,190,0.95)';
      ctx.fillText(sub, 256, 92);
    }
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    var sp = new THREE.Sprite(mat);
    sp.scale.set(16, 4, 1);
    return sp;
  }

  /* ---------- 地表(平面网格,远处缓丘,纪念周边保持平坦以保证对齐视线) ---------- */
  function buildGround(scene) {
    var geo = new THREE.PlaneGeometry(1400, 1400, 100, 100);
    geo.rotateX(-Math.PI / 2);
    var pos = geo.attributes.position, n = pos.count, i, v = new THREE.Vector3();
    for (i = 0; i < n; i++) {
      v.fromBufferAttribute(pos, i);
      var r = Math.sqrt(v.x * v.x + v.z * v.z);
      var amp = U.smoothstep(110, 320, r) * 2.6;
      var h = (U.fbm3(v.x * 0.012, v.z * 0.012, 4.2, 4) - 0.5) * 2 * amp
        + (U.noise2(v.x * 0.05, v.z * 0.05) - 0.5) * amp * 0.5;
      pos.setY(i, h);
    }
    geo.computeVertexNormals();
    var mat = new THREE.MeshStandardMaterial({ map: grassTexture(), color: 0xffffff, roughness: 1, metalness: 0 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  /* ---------- 环状土方(外坡内沟,可带方位豁口) ---------- */
  function ringEarthwork(scene, rIn, rOut, profile, gapAz, gapHalf) {
    var ANG = 240, RAD = 9;
    var positions = [], colors = [], idx = [], az, rr, a, j;
    var grass = new THREE.Color('#7d8b57').convertSRGBToLinear(),
      chalk = new THREE.Color('#b3ab97').convertSRGBToLinear(),
      soil = new THREE.Color('#7d6f56').convertSRGBToLinear();
    var i2;
    for (a = 0; a <= ANG; a++) {
      az = a / ANG * 360;
      for (j = 0; j <= RAD; j++) {
        rr = rIn + (rOut - rIn) * j / RAD;
        var hgt = profile(rr);
        // 方位豁口(如东北入口):靠近豁口方位角时削平
        if (gapAz !== undefined) {
          var dd = Math.abs(((az - gapAz) % 360 + 540) % 360 - 180);
          hgt *= U.smoothstep(gapHalf * 0.55, gapHalf * 1.25, dd);
        }
        var dir = azRad(az);
        positions.push(Math.sin(dir) * rr, hgt, -Math.cos(dir) * rr);
        // 配色:沟内白垩,沟底土壤,其余草地
        var c = grass.clone();
        if (hgt < -0.18) {
          var deep = U.smoothstep(-0.25, -0.85, hgt);
          c = U.mixColor(chalk, soil, deep);
        } else if (hgt < 0.12 && rr > rIn + 1) {
          c = U.mixColor(grass, chalk, 0.2);
        }
        colors.push(c.r, c.g, c.b);
      }
    }
    for (a = 0; a < ANG; a++) {
      for (j = 0; j < RAD; j++) {
        var p0 = a * (RAD + 1) + j, p1 = p0 + RAD + 1;
        idx.push(p0, p1, p0 + 1, p0 + 1, p1, p1 + 1);
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    var mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.02; // 抬离地面,避免共面 z-fighting
    mesh.receiveShadow = true; mesh.castShadow = false;
    scene.add(mesh);
    return mesh;
  }

  /* 大道双侧土埂 */
  function buildAvenue(scene) {
    var group = new THREE.Group();
    var axisAz = S.AXIS_AZ;
    var rotY = azRad(90 - axisAz); // 盒体 +X → 中轴方向
    [-1, 1].forEach(function (side) {
      var g = new THREE.BoxGeometry(58, 1.1, 3.6, 16, 1, 3);
      var pos = g.attributes.position, i, v = new THREE.Vector3();
      var rand = U.rng(300 + side * 7);
      for (i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        var taper = U.smoothstep(29, 6, Math.abs(v.x)); // 外端渐低
        v.y = v.y * taper + (U.noise2(v.x * 0.3 + rand() * 9, v.z * 0.5) - 0.5) * 0.24;
        pos.setXYZ(i, v.x, v.y * taper, v.z);
      }
      g.computeVertexNormals();
      var cGrass = new THREE.Color('#79884f').convertSRGBToLinear();
      var colors = new Float32Array(pos.count * 3);
      for (i = 0; i < pos.count; i++) {
        colors[i * 3] = cGrass.r; colors[i * 3 + 1] = cGrass.g; colors[i * 3 + 2] = cGrass.b;
      }
      g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      var mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
      // 中点位于沿轴 86m 处,横向偏移 ±7.6m
      var midR = 86;
      var ax = new THREE.Vector3(Math.sin(azRad(axisAz)), 0, -Math.cos(azRad(axisAz)));
      var tan = new THREE.Vector3(Math.cos(azRad(axisAz)), 0, Math.sin(azRad(axisAz)));
      mesh.position.copy(ax).multiplyScalar(midR).addScaledVector(tan, side * 7.6);
      mesh.position.y = 0.18;
      mesh.rotation.y = rotY;
      mesh.castShadow = true; mesh.receiveShadow = true;
      group.add(mesh);
    });
    scene.add(group);
    return group;
  }

  /* ---------- 天空 / 远景 ---------- */
  function buildSky(scene) {
    var uniforms = {
      topColor: { value: new THREE.Color('#5b87b8') },
      midColor: { value: new THREE.Color('#a8c4d8') },
      horizonColor: { value: new THREE.Color('#d5e0e4') },
      sunDir: { value: new THREE.Vector3(0, 1, 0) },
      sunGlowColor: { value: new THREE.Color('#ffb26b') },
      glowStrength: { value: 0.4 }
    };
    var mat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: [
        'varying vec3 vDir;',
        'void main(){',
        '  vDir = normalize(position);',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 topColor;',
        'uniform vec3 midColor;',
        'uniform vec3 horizonColor;',
        'uniform vec3 sunDir;',
        'uniform vec3 sunGlowColor;',
        'uniform float glowStrength;',
        'varying vec3 vDir;',
        'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
        'void main(){',
        '  float h = clamp(vDir.y, -0.2, 1.0);',
        '  vec3 col = mix(horizonColor, midColor, smoothstep(0.0, 0.28, h));',
        '  col = mix(col, topColor, smoothstep(0.22, 0.75, h));',
        '  float sd = max(dot(normalize(vDir), normalize(sunDir)), 0.0);',
        '  col += sunGlowColor * (pow(sd, 7.0) * 0.55 + pow(sd, 24.0) * 0.5) * glowStrength;',
        '  col += (hash(gl_FragCoord.xy) - 0.5) * 0.012;', // 去色带
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n')
    });
    var dome = new THREE.Mesh(new THREE.SphereGeometry(1000, 48, 24), mat);
    scene.add(dome);
    return uniforms;
  }

  function buildSun(scene) {
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: radialGlowTexture('rgba(255,214,150,0.85)', 'rgba(255,190,120,0)'),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false
    }));
    glow.scale.set(150, 150, 1);
    var disc = new THREE.Sprite(new THREE.SpriteMaterial({
      map: sunDiscTexture(),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false
    }));
    disc.scale.set(12, 12, 1);
    scene.add(glow); scene.add(disc);
    return { glow: glow, disc: disc };
  }

  function buildStars(scene) {
    var N = 1500, pos = new Float32Array(N * 3), sizes = new Float32Array(N), i;
    var rand = U.rng(9911);
    for (i = 0; i < N; i++) {
      var az = rand() * Math.PI * 2;
      var el = Math.asin(rand() * 0.98 + 0.01);
      var r = 950;
      pos[i * 3] = Math.cos(el) * Math.sin(az) * r;
      pos[i * 3 + 1] = Math.sin(el) * r + 5;
      pos[i * 3 + 2] = -Math.cos(el) * Math.cos(az) * r;
      sizes[i] = 1.2 + rand() * 2.4;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    var mat = new THREE.PointsMaterial({
      color: 0xdfe6ff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false,
      map: radialGlowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)'), blending: THREE.AdditiveBlending, depthWrite: false
    });
    var pts = new THREE.Points(geo, mat);
    scene.add(pts);
    return pts;
  }

  function buildRidges(scene) {
    var group = new THREE.Group();
    var mat = new THREE.MeshBasicMaterial({ color: 0x9aa690, fog: true });
    group.userData.mat = mat;
    var defs = [
      { az: 20, r: 480, w: 420, h: 30 },
      { az: 105, r: 430, w: 330, h: 22 },
      { az: 160, r: 500, w: 380, h: 26 },
      { az: 250, r: 460, w: 400, h: 24 },
      { az: 305, r: 470, w: 360, h: 34 },
      { az: 65, r: 520, w: 300, h: 18 }
    ];
    defs.forEach(function (d, di) {
      var m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10), mat);
      m.scale.set(d.w, d.h, d.w * 0.5);
      var p = global.STStones.azPos(d.r, d.az);
      m.position.set(p.x, -d.h * 0.62, p.z);
      group.add(m);
    });
    scene.add(group);
    return group;
  }

  function buildTrees(scene) {
    var group = new THREE.Group();
    var mats = [];
    group.userData.mats = mats;
    var rand = U.rng(555);
    var i;
    for (i = 0; i < 26; i++) {
      var az = rand() * 360;
      // 避开中轴对齐走廊(±8°),保证夏至日出视线干净
      var off = Math.abs(((az - S.AXIS_AZ) % 360 + 540) % 360 - 180);
      if (off < 8) continue;
      var r = 170 + rand() * 230;
      var tex = treeTexture((i * 37 + 5) | 0);
      var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, color: 0xcfd4c2 });
      mats.push(mat);
      var sp = new THREE.Sprite(mat);
      var h = 10 + rand() * 8;
      sp.scale.set(h * 0.8, h, 1);
      var p = global.STStones.azPos(r, az);
      sp.position.set(p.x, groundH(p.x, p.z) + h / 2 - 0.4, p.z);
      group.add(sp);
    }
    scene.add(group);
    return group;
  }

  function buildClouds(scene) {
    var group = new THREE.Group();
    var rand = U.rng(88);
    var i;
    for (i = 0; i < 9; i++) {
      var tex = blobTexture(200 + i * 13, 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0)');
      var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.62, depthWrite: false, fog: false });
      var sp = new THREE.Sprite(mat);
      var w = 120 + rand() * 160;
      sp.scale.set(w, w * 0.36, 1);
      var az = rand() * 360, r = 150 + rand() * 350;
      var p = global.STStones.azPos(r, az);
      sp.position.set(p.x, 95 + rand() * 70, p.z);
      sp.userData.speed = 0.6 + rand() * 0.9;
      group.add(sp);
    }
    scene.add(group);
    return group;
  }

  /* ---------- 飞鸟 ---------- */
  function buildBirds(scene) {
    var flocks = [], fl, b, i, f;
    var mat = new THREE.MeshBasicMaterial({ color: 0x2a2a28, side: THREE.DoubleSide, fog: false });
    for (f = 0; f < 2; f++) {
      fl = { birds: [], center: new THREE.Vector3(), radius: 55 + f * 30, speed: 0.12 - f * 0.03, phase: f * 2.4, alt: 26 + f * 9 };
      for (i = 0; i < 6; i++) {
        b = new THREE.Group();
        var wingG = new THREE.PlaneGeometry(1.5, 0.5);
        var w1 = new THREE.Mesh(wingG, mat), w2 = new THREE.Mesh(wingG, mat);
        w1.position.x = -0.7; w2.position.x = 0.7;
        b.add(w1); b.add(w2);
        b.userData = { w1: w1, w2: w2, off: i * 0.7 };
        fl.birds.push(b);
        scene.add(b);
      }
      flocks.push(fl);
    }
    return flocks;
  }

  /* ---------- 方位刻度盘(教学开关) ---------- */
  function buildCompassOverlay(scene, anchors) {
    var group = new THREE.Group();
    var matLine = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.32 });
    // 刻度环
    var pts = [], i;
    for (i = 0; i <= 128; i++) {
      var az = i / 128 * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.sin(az) * 30, 0.06, -Math.cos(az) * 30));
    }
    var ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), matLine);
    group.add(ring);
    // 方位刻度短线 + 主方位标签
    var tickMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    for (i = 0; i < 36; i++) {
      var azD = i * 10;
      var main = i % 9 === 0;
      var r0 = main ? 30 : 30, r1 = main ? 27.4 : 28.8;
      var a0 = azRad(azD);
      var seg = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(Math.sin(a0) * r0, 0.06, -Math.cos(a0) * r0),
        new THREE.Vector3(Math.sin(a0) * r1, 0.06, -Math.cos(a0) * r1)
      ]), main ? tickMat : matLine);
      group.add(seg);
    }
    var labels = [
      ['北', 0], ['东北', 45], ['东', 90], ['东南', 135],
      ['南', 180], ['西南', 225], ['西', 270], ['西北', 315]
    ];
    labels.forEach(function (L) {
      var sp = textSprite(L[0], 'rgba(255,255,255,0.92)', L[1] % 90 === 0 ? 52 : 34);
      var p = global.STStones.azPos(33, L[1]);
      sp.position.set(p.x, 1.4, p.z);
      sp.scale.set(L[1] % 90 === 0 ? 7 : 9, 2.2, 1);
      group.add(sp);
    });
    // 中轴线(金色虚线,中心 → 脚跟石)
    var axisMat = new THREE.LineDashedMaterial({ color: 0xffd77a, dashSize: 2.4, gapSize: 1.6, transparent: true, opacity: 0.85 });
    var apts = [new THREE.Vector3(0, 0.1, 0), anchors.heel.clone().setY(0.1)];
    var axisLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(apts), axisMat);
    axisLine.computeLineDistances();
    group.add(axisLine);
    var axisLabel = textSprite('夏至日出方向', '#ffe3a1', 44, '方位角 49.3°');
    var alp = global.STStones.azPos(43, S.AXIS_AZ);
    axisLabel.position.set(alp.x, 3.6, alp.z);
    axisLabel.scale.set(15, 3.8, 1);
    group.add(axisLabel);
    // 太阳方位射线(逐帧更新)
    var sunRayGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.12, 0), new THREE.Vector3(1, 0.12, 0)]);
    var sunRay = new THREE.Line(sunRayGeo, new THREE.LineBasicMaterial({ color: 0xffa14d, transparent: true, opacity: 0.9 }));
    group.add(sunRay);
    var sunAzLabel = textSprite('太阳', '#ffc98f', 40);
    sunAzLabel.scale.set(8, 2, 1);
    group.add(sunAzLabel);
    group.visible = false;
    scene.add(group);
    return { group: group, sunRay: sunRay, sunAzLabel: sunAzLabel };
  }

  /* ---------- 昼夜配色 ---------- */
  var C = function (hex) { return new THREE.Color(hex); };
  var SKY = {
    dayTop: C('#5489bf'), dayMid: C('#a3c2d8'), dayHor: C('#d9e1e2'),
    goldTop: C('#4a5f8a'), goldMid: C('#a8a0ad'), goldHor: C('#efb271'),
    duskTop: C('#1c2a4e'), duskMid: C('#4a4f74'), duskHor: C('#c07a58'),
    nightTop: C('#0a0f22'), nightMid: C('#121a33'), nightHor: C('#222d4a'),
    glowWarm: C('#ffb26b'),
    sunLow: C('#ff8d4d'), sunHigh: C('#fff1de'),
    ground: C('#6d7452'), groundWarm: C('#8a7a5e')
  };

  /* ---------- 总装 ---------- */
  function build(scene, anchors) {
    var ground = buildGround(scene);
    // 主土方:坡(44-49)+ 沟(49-56),东北入口豁口
    ringEarthwork(scene, 44, 56, function (r) {
      if (r < 49) return U.smoothstep(44, 45.8, r) * (1 - U.smoothstep(48.2, 49.4, r)) * 0.9;
      return -U.smoothstep(49.2, 51.6, r) * (1 - U.smoothstep(54.4, 56, r)) * 1.05;
    }, S.AXIS_AZ, 5.5);
    buildAvenue(scene);
    // 脚跟石小沟(环半径仅数米,以脚跟石为中心)
    var heelDitch = ringEarthwork(scene, 4.5, 9.5, function (r) {
      return -U.smoothstep(5.4, 6.4, r) * (1 - U.smoothstep(7.8, 8.6, r)) * 0.55;
    }, undefined, 0);
    heelDitch.position.set(anchors.heel.x, 0.02, anchors.heel.z);

    var sky = buildSky(scene);
    var sun = buildSun(scene);
    var stars = buildStars(scene);
    var ridges = buildRidges(scene);
    var trees = buildTrees(scene);
    var clouds = buildClouds(scene);
    var birds = buildBirds(scene);
    var compass = buildCompassOverlay(scene, anchors);

    /* 光照 */
    var sunLight = new THREE.DirectionalLight(0xfff1de, 1.6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.left = -95; sunLight.shadow.camera.right = 95;
    sunLight.shadow.camera.top = 95; sunLight.shadow.camera.bottom = -95;
    sunLight.shadow.camera.near = 20; sunLight.shadow.camera.far = 420;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.9;
    scene.add(sunLight);
    scene.add(sunLight.target);
    var hemi = new THREE.HemisphereLight(0xa3c2d8, 0x6d7452, 0.6);
    scene.add(hemi);
    var moonLight = new THREE.DirectionalLight(0x7688b8, 0);
    moonLight.position.set(60, 90, -40);
    scene.add(moonLight);
    scene.fog = new THREE.FogExp2(0xd9e1e2, 0.0021);

    var tmpTop = new THREE.Color(), tmpMid = new THREE.Color(), tmpHor = new THREE.Color();
    var tmpC = new THREE.Color();
    var ridgeNight = C('#161d2e'), ridgeDay = C('#9aa690'), ridgeWarm = C('#a98a72');
    var treeNight = C('#232c3e'), treeDay = C('#cfd4c2');

    /* 每帧状态:state = { sunDir, alt, az } */
    function update(state, dt) {
      var alt = state.alt;
      var day = U.smoothstep(-3, 9, alt);
      var gold = U.smoothstep(-8, 4, alt) * (1 - U.smoothstep(9, 24, alt)); // 金色时刻
      var dusk = (1 - U.smoothstep(-11, -2, alt)) * U.smoothstep(-16, -9, alt); // 暮色
      var night = 1 - U.smoothstep(-14, -6, alt);

      tmpTop.copy(SKY.nightTop).lerp(SKY.duskTop, 1 - night)
        .lerp(SKY.dayTop, day * 0.9)
        .lerp(SKY.goldTop, gold * 0.35);
      tmpMid.copy(SKY.nightMid).lerp(SKY.duskMid, 1 - night)
        .lerp(SKY.dayMid, day * 0.92)
        .lerp(SKY.goldMid, gold * 0.5);
      tmpHor.copy(SKY.nightHor).lerp(SKY.duskHor, (1 - night) * 0.85)
        .lerp(SKY.dayHor, day * 0.95)
        .lerp(SKY.goldHor, gold * 0.75);
      sky.topColor.value.copy(tmpTop);
      sky.midColor.value.copy(tmpMid);
      sky.horizonColor.value.copy(tmpHor);
      sky.sunDir.value.copy(state.sunDir);
      sky.glowStrength.value = 0.35 + gold * 1.1 + dusk * 0.4;

      // 太阳本体与光
      sun.disc.position.copy(state.sunDir).multiplyScalar(940);
      sun.glow.position.copy(state.sunDir).multiplyScalar(940);
      var nearHor = 1 - U.smoothstep(4, 16, alt);
      sun.disc.scale.set(12 + nearHor * 5, 12 + nearHor * 5, 1);
      var sunVis = U.smoothstep(-3.5, -0.5, alt);
      sun.disc.material.opacity = sunVis;
      sun.glow.material.opacity = sunVis * (0.55 + gold * 0.45);
      sunLight.intensity = 1.85 * U.smoothstep(-1.5, 8, alt);
      tmpC.copy(SKY.sunLow).lerp(SKY.sunHigh, U.smoothstep(2, 28, alt));
      sunLight.color.copy(tmpC);
      sunLight.position.copy(state.sunDir).multiplyScalar(210);
      sunLight.target.position.set(state.sunDir.x * 30, 0, state.sunDir.z * 30);

      hemi.intensity = 0.2 + day * 0.42;
      hemi.color.copy(tmpMid);
      hemi.groundColor.copy(SKY.ground).lerp(SKY.groundWarm, gold * 0.6);
      moonLight.intensity = night * 0.16;

      scene.fog.color.copy(tmpHor).lerp(tmpMid, 0.35);

      // 远景随昼夜着色(剪影材质不受光照,需手动跟随)
      var ridgeMat = ridges.userData.mat;
      ridgeMat.color.copy(ridgeNight).lerp(ridgeDay, day).lerp(ridgeWarm, gold * 0.45);
      trees.userData.mats.forEach(function (tm) {
        tm.color.copy(treeNight).lerp(treeDay, day).lerp(ridgeWarm, gold * 0.35);
      });

      stars.material.opacity = night * 0.9;
      clouds.children.forEach(function (sp, i2) {
        sp.material.color.copy(tmpC.copy(tmpHor).lerp(new THREE.Color(1, 1, 1), day * 0.5));
        sp.material.opacity = 0.18 + day * 0.5;
        sp.position.x += sp.userData.speed * dt * 2.2;
        if (sp.position.x > 620) sp.position.x = -620;
      });
      // 鸟群
      var t = performance.now() / 1000;
      birds.forEach(function (fl, fi) {
        fl.phase += fl.speed * dt;
        fl.birds.forEach(function (b, bi) {
          var a = fl.phase + b.userData.off * 0.9;
          var r = fl.radius + Math.sin(a * 0.7 + bi) * 6;
          b.position.set(
            Math.sin(a) * r + (fi ? 40 : -30),
            fl.alt + Math.sin(a * 1.3 + bi) * 2.5,
            -Math.cos(a) * r + (fi ? 55 : 20)
          );
          b.rotation.y = a + Math.PI / 2;
          var flap = Math.sin(t * 9 + bi * 1.7) * 0.55;
          b.userData.w1.rotation.z = flap;
          b.userData.w2.rotation.z = -flap;
          b.visible = alt > -4;
        });
      });
      // 方位盘太阳射线
      compass.sunRay.visible = compass.group.visible && alt > -6;
      if (compass.sunRay.visible) {
        var len = 46;
        var attr = compass.sunRay.geometry.attributes.position;
        attr.setXYZ(1, Math.sin(azRad(state.az)) * len, 0.12, -Math.cos(azRad(state.az)) * len);
        attr.needsUpdate = true;
        var lp = global.STStones.azPos(len + 4, state.az);
        compass.sunAzLabel.position.set(lp.x, 1.6, lp.z);
        compass.sunAzLabel.visible = true;
      }
    }

    return { update: update, compass: compass, sunLight: sunLight };
  }

  global.STEnv = { build: build, grassTexture: grassTexture, textSprite: textSprite };
})(window);
