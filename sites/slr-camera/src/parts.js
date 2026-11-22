/* 单反相机 — 部件建模与注册(约 25 件)。
   坐标系:胶片面中心 = 原点(mm × K),+x 朝镜头(被摄体在 +x 远处),+y 上,+z 机宽。
   场景 y = (mm_y + 24)·K,使机身落在地台上。光路折点全部取自 mech.js 求解器
   (viewPath/pentaTrace),断言与可视化同源。
   注:KINE 对部件 group 只写 rotation(铁律);幕帘开合/镜筒伸长等平移
   通过子节点(child)的 scale/position 实现,不触碰 group.position。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;
  var K = D.K;

  function wx(x) { return x * K; }
  function wy(y) { return (y + 24) * K; }          // 机身抬高:mm y=0 → 场景 3.6u
  function wz(z) { return (z || 0) * K; }
  function anchored(g, ax, ay, az) {
    g.userData.tagAnchor = new THREE.Vector3(ax || 0, ay || 0, az || 0);
    return { group: g };
  }

  /* —— 自定义材质(模板库之外的光学件)—— */
  var MAT = {};
  function makeMats() {
    MAT.glass = new THREE.MeshPhysicalMaterial({
      color: 0xBFD8E8, transparent: true, opacity: 0.30,
      roughness: 0.06, metalness: 0.05, side: THREE.DoubleSide
    });
    MAT.glassDeep = new THREE.MeshPhysicalMaterial({
      color: 0x9CC4DE, transparent: true, opacity: 0.42,
      roughness: 0.08, metalness: 0.05, side: THREE.DoubleSide
    });
    MAT.mirror = new THREE.MeshStandardMaterial({ color: 0xB9C7D6, metalness: 1.0, roughness: 0.10 });
    MAT.rubber = new THREE.MeshStandardMaterial({ color: 0x17191D, roughness: 0.94, metalness: 0.04 });
    MAT.leather = new THREE.MeshStandardMaterial({ color: 0x4A3A2C, roughness: 0.86, metalness: 0.06 });
    MAT.ray = new THREE.MeshBasicMaterial({ color: 0xFFDF9E, transparent: true, opacity: 0.9 });
    MAT.raySoft = new THREE.MeshBasicMaterial({ color: 0xFFE9B8, transparent: true, opacity: 0.5 });
  }

  /* —— Canvas 贴图 —— */
  function ctex(w, h, draw) {
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  }

  /* f 环刻度:1.4 2 2.8 4 5.6 8 11 16 环带 */
  function fRingTex() {
    return ctex(512, 96, function (x, w, h) {
      x.fillStyle = "#1B1D22"; x.fillRect(0, 0, w, h);
      x.fillStyle = "#E9EEF2";
      x.font = "700 30px Menlo, monospace";
      x.textAlign = "center"; x.textBaseline = "middle";
      var n = D.FSTOPS.length;
      for (var i = 0; i < n; i++) {
        x.fillText(String(D.FSTOPS[i]), (i + 0.5) / n * w, h * 0.4);
        x.fillRect(i / n * w, h * 0.72, 2, h * 0.2);
      }
      x.fillStyle = "#E9C93C";
      x.fillRect(w / 2 - 3, 0, 6, h);
    });
  }

  /* 快门速度盘:1000 … 1 */
  function speedDialTex() {
    return ctex(256, 256, function (x, S) {
      x.fillStyle = "#202228"; x.fillRect(0, 0, S, S);
      x.translate(S / 2, S / 2);
      x.fillStyle = "#E9EEF2";
      x.font = "700 24px Menlo, monospace";
      x.textAlign = "center"; x.textBaseline = "middle";
      var n = D.SPEEDS.length;
      for (var i = 0; i < n; i++) {
        var a = -Math.PI / 2 + i / n * Math.PI * 2;
        x.save();
        x.rotate(a);
        x.fillText(i < 5 ? "1/" + D.SPEEDS[i] : String(D.SPEEDS[i]), 0, -74);
        x.restore();
        x.fillRect(-2, -100, 4, 12);
      }
      x.fillStyle = "#E9C93C";
      x.beginPath(); x.moveTo(0, -58); x.lineTo(-9, -80); x.lineTo(9, -80); x.closePath(); x.fill();
    });
  }

  /* 场景画(被摄体:山 + 塔 + 人 + 日)——屏幕像/胶片像/目标卡共用 */
  function sceneDrawing(x, w, h, inverted) {
    if (inverted) { x.translate(w / 2, h / 2); x.rotate(Math.PI); x.translate(-w / 2, -h / 2); }
    x.fillStyle = "#2A3E55"; x.fillRect(0, 0, w, h);          // 天
    x.fillStyle = "#E9C93C";                                   // 日
    x.beginPath(); x.arc(w * 0.72, h * 0.24, h * 0.11, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#4E6B8A";                                   // 远山
    x.beginPath(); x.moveTo(0, h * 0.62);
    x.lineTo(w * 0.28, h * 0.36); x.lineTo(w * 0.5, h * 0.6);
    x.lineTo(w * 0.72, h * 0.42); x.lineTo(w, h * 0.64);
    x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill();
    x.fillStyle = "#B08D57";                                   // 塔
    var tx = w * 0.3, tw = w * 0.12;
    x.fillRect(tx, h * 0.3, tw, h * 0.7);
    x.fillRect(tx - tw * 0.35, h * 0.26, tw * 1.7, h * 0.06);
    x.fillRect(tx - tw * 0.2, h * 0.44, tw * 1.4, h * 0.04);
    x.fillRect(tx - tw * 0.2, h * 0.6, tw * 1.4, h * 0.04);
    x.fillStyle = "#E9EEF2";                                   // 人(近景)
    var px = w * 0.78;
    x.fillRect(px - w * 0.03, h * 0.52, w * 0.06, h * 0.34);   // 身
    x.beginPath(); x.arc(px, h * 0.46, h * 0.06, 0, Math.PI * 2); x.fill();  // 头
  }

  function screenImageTex() {
    return ctex(360, 240, function (x, w, h) {
      // 对焦屏上的像:经屋脊五棱镜转正 — 正立、无左右反演
      sceneDrawing(x, w, h, false);
      x.fillStyle = "rgba(233,238,242,0.10)";
      for (var i = 1; i < 8; i++) x.fillRect(0, i / 8 * h, w, 1);
      for (var j = 1; j < 12; j++) x.fillRect(j / 12 * w, 0, 1, h);
      x.strokeStyle = "#E9C93C"; x.lineWidth = 2;
      x.strokeRect(w * 0.44, h * 0.42, w * 0.12, h * 0.16);
    });
  }
  function filmImageTex() { return ctex(360, 240, function (x, w, h) { sceneDrawing(x, w, h, true); }); }
  function subjectTex() {
    return ctex(360, 480, function (x, w, h) { sceneDrawing(x, w, h, false); });
  }

  /* —— 几何助手 —— */
  /* 细光管:两端点(mm,[z 可选])→ 场景圆柱 */
  function tube(a, b, r, mat) {
    var A = new THREE.Vector3(wx(a[0]), wy(a[1]), wz(a[2]));
    var B = new THREE.Vector3(wx(b[0]), wy(b[1]), wz(b[2]));
    var dir = B.clone().sub(A);
    var len = Math.max(0.02, dir.length());
    var m = P.mesh(new THREE.CylinderGeometry(r, r, len, 8), mat, 0, 0, 0, false, false);
    m.position.copy(A.clone().add(B).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return m;
  }

  /* 镜筒圆柱:轴沿 +x */
  function tubeX(r, len, mat, xmm, ymm, zmm, seg) {
    var m = P.cyl(r, r, len, mat, xmm, ymm, zmm || 0, seg || 24);
    m.rotation.z = Math.PI / 2;
    return m;
  }

  /* 五棱镜玻璃:截面 PENTA.poly 拉伸 */
  function pentaGlass() {
    var shp = new THREE.Shape();
    var poly = D.PENTA.poly;
    shp.moveTo(poly[0][0], poly[0][1]);
    for (var i = 1; i < poly.length; i++) shp.lineTo(poly[i][0], poly[i][1]);
    shp.closePath();
    var geo = new THREE.ExtrudeGeometry(shp, { depth: D.PENTA.ZW * 2, bevelEnabled: false });
    geo.translate(0, 0, -D.PENTA.ZW);
    geo.scale(K, K, K);                    // 截面坐标为 mm,统一缩到场景
    return P.mesh(geo, MAT.glass, 0, 0, 0);
  }

  /* —— 部件构建 —— */
  function buildPlinth() {
    var g = new THREE.Group();
    g.add(P.box(17, 0.8, 5, M3.stone, wx(24), 0.4, 0));
    g.add(P.box(14.4, 0.9, 4.2, M3.dark, wx(24), 1.25, 0));
    g.userData.tagAnchor = new THREE.Vector3(wx(24), 1.0, 0);
    return { group: g };
  }

  /* 机身壳(剖视:背板/底板/胶片室侧半墙/顶盖),镜箱侧面敞开 */
  function buildBodyShell() {
    var g = new THREE.Group();
    var x0 = wx(-6), x1 = wx(42), yB = wy(-14), yF = wy(12), yT = wy(41);
    g.add(P.box(1.6, yT - yB, 7.2, M3.leather, x0, (yB + yT) / 2, 0));           // 背板
    g.add(P.box(x1 - x0, 1.6, 7.2, M3.leather, (x0 + x1) / 2, yB + 0.8, 0));     // 底板
    // 胶片室侧面剖开(剖视)——侧墙仅留上下沿
    [-1, 1].forEach(function (sy) {
      g.add(P.box(x1 - x0, 1.0, 0.9, M3.leather, (x0 + x1) / 2, yB + 1.4, sy * 3.6));
      g.add(P.box(x1 - x0, 1.0, 0.9, M3.leather, (x0 + x1) / 2, yF - 0.6, sy * 3.6));
    });
    g.add(P.box(1.4, 5.2, 7.2, M3.leather, x1 - 0.7, yB + 4.2, 0));              // 前下墙
    g.add(P.box(wx(26) - x0, 1.0, 7.2, M3.brass, (wx(26) + x0) / 2, yT - 0.5, 0)); // 顶盖(镜箱上方剖开)
    g.userData.tagAnchor = new THREE.Vector3(x0, wy(20), 0);
    return { group: g };
  }

  function buildFilmGate() {
    var g = new THREE.Group();
    var y0 = wy(-12), y1 = wy(12);
    g.add(P.box(1.0, 1.6, 7.4, M3.steelD, wx(-1.5), y0 - 0.8, 0));
    g.add(P.box(1.0, 1.6, 7.4, M3.steelD, wx(-1.5), y1 + 0.8, 0));
    [-1, 1].forEach(function (s) {
      g.add(P.box(1.0, y1 - y0, 0.9, M3.steelD, wx(-1.5), (y0 + y1) / 2, s * 1.85));
    });
    g.add(P.mesh(new THREE.PlaneGeometry(6.2, 3.6),
      new THREE.MeshBasicMaterial({ color: 0x0A0C10 }), wx(-2.2), (y0 + y1) / 2, 0, false, false));
    g.userData.tagAnchor = new THREE.Vector3(wx(-1.5), y1 + 1.2, 0);
    return { group: g };
  }

  function buildWindLever() {
    var g = new THREE.Group();
    g.add(P.cyl(0.55, 0.55, 0.5, M3.steel, wx(2), wy(43.6), -2.55, 18));
    var arm = P.box(2.6, 0.5, 0.9, M3.steel, wx(3.4), wy(44.4), -2.55);
    arm.rotation.z = 0.5;
    g.add(arm);
    g.add(P.cyl(0.4, 0.4, 0.35, M3.steelD, wx(7), wy(44.4), 2.55, 14));   // 快门钮
    g.userData.tagAnchor = new THREE.Vector3(wx(3.4), wy(45.6), -2.55);
    return { group: g };
  }

  function buildMountRing() {
    var g = new THREE.Group();
    g.add(tubeX(3.2, 0.9, M3.steel, wx(43.5), wy(0), 0));
    for (var i = 0; i < 4; i++) {
      var a = i * Math.PI / 2 + Math.PI / 4;
      g.add(P.box(0.7, 0.6, 0.6, M3.steelD, wx(44.2), wy(0) + Math.sin(a) * 2.5, Math.cos(a) * 2.5));
    }
    g.userData.tagAnchor = new THREE.Vector3(wx(43.5), wy(3), 0);
    return { group: g };
  }

  /* 镜筒(内含 cell 子组,对焦时整体 +x 平移) */
  function buildHelicoid() {
    var g = new THREE.Group();
    var cell = new THREE.Group(); cell.name = "cell";
    cell.add(tubeX(3.0, 2.8, M3.rubber, wx(53), wy(0), 0));
    cell.add(tubeX(3.2, 1.3, MAT.rubber, wx(50.5), wy(0), 0, 26));
    g.add(cell);
    g.userData.cell = cell;
    g.userData.tagAnchor = new THREE.Vector3(wx(53), wy(2.6), 0);
    return { group: g };
  }

  function buildLensRear() {
    var g = new THREE.Group();
    var cell = new THREE.Group(); cell.name = "cell";
    cell.add(tubeX(2.6, 2.4, M3.ironD, wx(45.6), wy(0), 0));
    var lens = P.sph(1.85, MAT.glassDeep, wx(46.6), wy(0), 0);
    lens.scale.set(0.55, 1, 1);
    cell.add(lens);
    g.add(cell);
    g.userData.cell = cell;
    g.userData.tagAnchor = new THREE.Vector3(wx(45.6), wy(2.4), 0);
    return { group: g };
  }

  function buildLensFront() {
    var g = new THREE.Group();
    var cell = new THREE.Group(); cell.name = "cell";
    cell.add(tubeX(3.05, 4.6, M3.ironD, wx(65.5), wy(0), 0, 26));
    cell.add(tubeX(3.25, 1.0, MAT.rubber, wx(62), wy(0), 0, 26));
    var lens = P.sph(2.15, MAT.glass, wx(67.8), wy(0), 0);
    lens.scale.set(0.5, 1, 1);
    cell.add(lens);
    g.add(cell);
    g.userData.cell = cell;
    g.userData.tagAnchor = new THREE.Vector3(wx(67.8), wy(2.9), 0);
    return { group: g };
  }

  function buildIrisBarrel() {
    var g = new THREE.Group();
    g.add(tubeX(3.3, 2.2, M3.ironD, wx(58.6), wy(0), 0, 26));
    g.userData.tagAnchor = new THREE.Vector3(wx(58.6), wy(2.7), 0);
    return { group: g };
  }

  /* 9 叶光圈:叶板销轴于 RING_R 环上;轴心距 a=Rp·cosγ=内切半径(见 mech.js) */
  function buildIrisBlades() {
    var g = new THREE.Group();
    var blades = [];
    for (var i = 0; i < D.N_BLADES; i++) {
      var phi = i / D.N_BLADES * Math.PI * 2;
      var bl = P.mesh(new THREE.BoxGeometry(30 * K, 6.5 * K, 0.5 * K), M3.steelD,
        Math.cos(phi) * D.RING_R * K, Math.sin(phi) * D.RING_R * K, 0);
      bl.userData.phi = phi;
      g.add(bl);
      blades.push(bl);
    }
    g.userData.blades = blades;
    g.userData.tagAnchor = new THREE.Vector3(wx(58.6), wy(0), 0);
    return { group: g };
  }

  function buildFRing() {
    var g = new THREE.Group();
    g.add(tubeX(3.4, 1.1, M3.ironD, wx(61.2), wy(0), 0, 26));
    var band = P.mesh(new THREE.CylinderGeometry(3.42, 3.42, 0.9, 26, 1, true),
      new THREE.MeshStandardMaterial({ map: fRingTex(), roughness: 0.6, side: THREE.DoubleSide }),
      wx(61.2), wy(0), 0, false, false);
    band.rotation.z = Math.PI / 2;
    g.add(band);
    g.userData.tagAnchor = new THREE.Vector3(wx(61.2), wy(2.9), 0);
    return { group: g };
  }

  function buildMirrorChamber() {
    var g = new THREE.Group();
    g.add(P.box(wx(30) - wx(6), 1.0, 7.0, M3.ironD, (wx(6) + wx(-6)) / 2, wy(-13.2), 0));
    [-1, 1].forEach(function (s) {
      g.add(P.box(wx(40) - wx(2), 1.2, 0.8, M3.ironD, (wx(40) + wx(2)) / 2, wy(20), s * 3.4));
    });
    g.userData.tagAnchor = new THREE.Vector3(wx(2), wy(-12.4), 0);
    return { group: g };
  }

  /* 反光镜:组原点=铰链 (24,14);板自铰链沿 (1,−1)/√2 伸向镜头侧;翻起 = 组转 +45° */
  function buildMirror() {
    var g = new THREE.Group();
    var L = 36.8 * K;
    var cx = L / 2 * Math.SQRT1_2, cy = -L / 2 * Math.SQRT1_2;
    var plate = P.mesh(new THREE.BoxGeometry(L, 0.28, 5.6), MAT.mirror, cx, cy, 0);
    plate.rotation.z = -Math.PI / 4;
    g.add(plate);
    var holder = P.mesh(new THREE.BoxGeometry(L * 0.9, 0.7, 5.8), M3.ironD, cx, cy - 0.16, 0);
    holder.rotation.z = -Math.PI / 4;
    g.add(holder);
    g.userData.tagAnchor = new THREE.Vector3(cx, cy + 0.5, 0);
    return { group: g };
  }

  function buildMirrorActuator() {
    var g = new THREE.Group();
    var lever = P.box(3.2, 0.5, 0.8, M3.steel, wx(20), wy(6), 2.6);
    lever.rotation.z = -0.5;
    g.add(lever);
    g.add(P.cyl(0.22, 0.22, 3.4, M3.steelD, wx(24), wy(4), 2.6, 10));
    g.userData.lever = lever;
    g.userData.tagAnchor = new THREE.Vector3(wx(20), wy(7.2), 2.6);
    return { group: g };
  }

  function buildFocusScreen() {
    var g = new THREE.Group();
    var scr = P.mesh(new THREE.PlaneGeometry(24 * K, 36 * K),
      new THREE.MeshBasicMaterial({ color: 0xC9D6DF, transparent: true, opacity: 0.32, side: THREE.DoubleSide }),
      wx(38), wy(38), 0, false, false);
    scr.rotation.x = -Math.PI / 2;
    g.add(scr);
    g.add(P.box(1.2, 0.8, 7.2, M3.ironD, wx(38), wy(39.2), 0));
    g.userData.tagAnchor = new THREE.Vector3(wx(30), wy(39.4), 0);
    return { group: g };
  }

  function buildPentaprism() {
    var g = new THREE.Group();
    g.add(pentaGlass());
    g.userData.tagAnchor = new THREE.Vector3(wx(40), wy(62), 0);
    return { group: g };
  }

  function buildPentaHousing() {
    var g = new THREE.Group();
    var top = D.PENTA.poly[3][1] + 1.5;
    g.add(P.box((24 + 3) * K, 1.6, 6.4, M3.steel, wx(38), wy(top), 0));          // 顶盖
    g.add(P.box(1.4, (56 - 36) * K, 6.4, M3.steel, wx(27.4), (wy(56) + wy(36)) / 2, 0)); // 背护板(留目镜窗)
    g.add(P.box(1.4, (top - 36) * K, 6.4, M3.steel, wx(50.6), (wy(top) + wy(36)) / 2, 0)); // 前护板
    g.userData.tagAnchor = new THREE.Vector3(wx(48), wy(top) + 1.2, 0);
    return { group: g };
  }

  function buildEyepiece() {
    var g = new THREE.Group();
    var ey = D.PENTA.out[1];
    var b = P.cyl(1.15, 1.15, 5.5, M3.ironD, wx(16), wy(ey), 0, 20);
    b.rotation.z = Math.PI / 2;
    g.add(b);
    var ring = P.cyl(1.35, 1.35, 1.2, MAT.rubber, wx(12.8), wy(ey), 0, 20);
    ring.rotation.z = Math.PI / 2;
    g.add(ring);
    var lens = P.sph(1.0, MAT.glass, wx(13.6), wy(ey), 0);
    lens.scale.set(0.4, 1, 1);
    g.add(lens);
    g.userData.tagAnchor = new THREE.Vector3(wx(12.2), wy(ey + 1.6), 0);
    return { group: g };
  }

  function buildRoller(z) {
    var g = new THREE.Group();
    g.add(P.cyl(1.1, 1.1, 6.8, M3.steelD, wx(-1.6), wy(0), z, 18));
    g.add(P.cyl(0.3, 0.3, 7.6, M3.steel, wx(-1.6), wy(0), z, 10));
    g.userData.tagAnchor = new THREE.Vector3(wx(-1.6), wy(2), z);
    return { group: g };
  }

  /* 幕帘:布幅=子网格(z 长 1 基准),KINE 写 scale.z/position.z;组只做落位 */
  function buildCurtain(fromPlus) {
    var g = new THREE.Group();
    var cloth = P.mesh(new THREE.BoxGeometry(0.22, 3.6, 1), M3.ironD, 0, 0, 0);
    g.add(cloth);
    g.userData.cloth = cloth;
    g.userData.fromPlus = fromPlus;
    g.userData.tagAnchor = new THREE.Vector3(wx(-1.2), wy(14), fromPlus ? 3.2 : -3.2);
    return { group: g };
  }

  function buildSpeedDial() {
    var g = new THREE.Group();
    g.add(P.cyl(1.5, 1.6, 0.7, M3.ironD, wx(12), wy(43.9), 2.55, 24));
    var face = P.mesh(new THREE.CylinderGeometry(1.52, 1.52, 0.72, 24, 1, true),
      new THREE.MeshStandardMaterial({ map: speedDialTex(), roughness: 0.55, side: THREE.DoubleSide }),
      wx(12), wy(43.9), 2.55, false, false);
    g.add(face);
    g.userData.tagAnchor = new THREE.Vector3(wx(12), wy(45.6), 2.55);
    return { group: g };
  }

  function buildCassette() {
    var g = new THREE.Group();
    g.add(P.cyl(1.05, 1.05, 4.4, M3.steelD, wx(-2.6), wy(0), -14.5, 18));
    var shell = P.cyl(1.5, 1.5, 4.5, MAT.rubber, wx(-2.6), wy(0), -14.5, 20);
    shell.scale.set(1, 0.55, 1);
    g.add(shell);
    g.userData.tagAnchor = new THREE.Vector3(wx(-2.6), wy(2.2), -14.5);
    return { group: g };
  }

  function buildFilmStrip() {
    var g = new THREE.Group();
    var strip = P.mesh(new THREE.PlaneGeometry(29 * K, 5.1),
      new THREE.MeshStandardMaterial({ color: 0x2A2118, roughness: 0.5, side: THREE.DoubleSide }),
      wx(-2.8), wy(0), 0, false, false);
    strip.rotation.y = Math.PI / 2;
    g.add(strip);
    g.userData.tagAnchor = new THREE.Vector3(wx(-2.8), wy(3.4), 0);
    return { group: g };
  }

  function buildTakeupSpool() {
    var g = new THREE.Group();
    g.add(P.cyl(1.0, 1.0, 4.2, M3.steel, wx(-2.6), wy(0), 14.5, 16));
    g.userData.tagAnchor = new THREE.Vector3(wx(-2.6), wy(2), 14.5);
    return { group: g };
  }

  function buildFrameCounter() {
    var g = new THREE.Group();
    var d = P.cyl(0.8, 0.8, 0.5, M3.steelD, wx(20), wy(43.7), -2.55, 16);
    g.add(d);
    g.userData.tagAnchor = new THREE.Vector3(wx(20), wy(44.6), -2.55);
    return { group: g };
  }

  function buildSubjectCard() {
    var g = new THREE.Group();
    var card = P.mesh(new THREE.PlaneGeometry(5.4, 7.2),
      new THREE.MeshBasicMaterial({ map: subjectTex(), side: THREE.DoubleSide }),
      0, 4.1, 0, false, false);
    card.rotation.y = -Math.PI / 2;
    g.add(card);
    g.add(P.box(0.5, 0.5, 3.4, M3.woodD, 0, 0.25, 0));
    g.add(P.box(3.0, 0.5, 3.6, M3.stone, 0, 0.25, 0));
    g.add(P.box(0.4, 7.2, 0.4, M3.woodD, 0, 4.1, -2.6));
    g.add(P.box(0.4, 7.2, 0.4, M3.woodD, 0, 4.1, 2.6));
    g.userData.tagAnchor = new THREE.Vector3(0, 7.6, 0);
    return { group: g };
  }

  /* 取景/曝光光路管组(可见性由 KINE 按阶段接管) */
  function buildRays() {
    var g = new THREE.Group();
    var vp = KS.viewPath();
    var view = new THREE.Group(); view.name = "view";
    for (var i = 0; i < vp.length - 1; i++) {
      view.add(tube(vp[i], vp[i + 1], 0.10, MAT.ray));
    }
    [10, -10].forEach(function (zz) {
      view.add(tube([D.SUBJECT_X, 0, zz], [80, 0, zz], 0.07, MAT.raySoft));
    });
    var exp = new THREE.Group(); exp.name = "exp";
    exp.add(tube([D.SUBJECT_X, 0], [D.NODE_X, 0], 0.10, MAT.ray));
    exp.add(tube([D.NODE_X, 12], [0, 12], 0.07, MAT.raySoft));
    exp.add(tube([D.NODE_X, -12], [0, -12], 0.07, MAT.raySoft));
    exp.add(tube([D.NODE_X, 0], [0, 0], 0.10, MAT.ray));
    g.add(view); g.add(exp);
    g.userData.view = view; g.userData.exp = exp;
    g.userData.tagAnchor = new THREE.Vector3(wx(96), wy(0), 0);
    return { group: g };
  }

  function buildScreenImage() {
    var g = new THREE.Group();
    var pl = P.mesh(new THREE.PlaneGeometry(24 * K, 36 * K),
      new THREE.MeshBasicMaterial({ map: screenImageTex(), transparent: true, opacity: 0 }),
      wx(38), wy(38) + 0.05, 0, false, false);
    pl.rotation.x = -Math.PI / 2;
    pl.rotation.z = Math.PI / 2;     // 画面上方(膜 +y)→ 屏 −x(与镜反射映射一致)
    g.add(pl);
    g.userData.pl = pl;
    g.userData.tagAnchor = new THREE.Vector3(wx(38), wy(39), 0);
    return { group: g };
  }

  function buildFilmImage() {
    var g = new THREE.Group();
    var pl = P.mesh(new THREE.PlaneGeometry(5.4, 3.6),
      new THREE.MeshBasicMaterial({ map: filmImageTex(), transparent: true, opacity: 0 }),
      wx(-3.0), wy(0), 0, false, false);
    pl.rotation.y = Math.PI / 2;
    g.add(pl);
    g.userData.pl = pl;
    g.userData.tagAnchor = new THREE.Vector3(wx(-3.0), wy(3.2), 0);
    return { group: g };
  }

  /* —— 注册(at 为绝对周期秒)—— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    makeMats();
    function def(o) { return MECH._def(o); }
    function fly(dx, dy, dz) { return [dx * K, dy * K, dz * K]; }

    /* 阶段 1 BODY */
    def({ id: "plinth", name: "PLINTH · 工作台座", sub: "剖视展示台", phase: 0, at: 0.2, dur: 1.1,
      build: buildPlinth, target: [0, 0, 0], start: [0, 7.5, -3.5], mid: [0, 4.5, -1.8], world: true });
    def({ id: "bodyShell", name: "BODY · 机身壳体", sub: "背板/底板/顶盖 · 镜箱侧面剖开", phase: 0, at: 0.9, dur: 1.3,
      build: buildBodyShell, target: [0, 0, 0], start: [0, 10, 2.5], mid: [0, 5.5, 1.2] });
    def({ id: "filmGate", name: "FILM GATE · 片门", sub: "36×24mm 片窗 + 压片板", phase: 0, at: 2.0, dur: 1.2,
      build: buildFilmGate, target: [0, 0, 0], start: [0, 9, -2.5], mid: [0, 5, -1.2] });
    def({ id: "windLever", name: "WIND LEVER · 卷片扳手", sub: "上弦卷片 · 快门钮", phase: 0, at: 3.0, dur: 1.1,
      build: buildWindLever, target: [0, 0, 0], start: [0, 9, 2.5], mid: [0, 6, 1.2] });

    /* 阶段 2 LENS */
    def({ id: "mountRing", name: "MOUNT · 卡口环", sub: "法兰距 42mm · 后主点在卡口前 13mm", phase: 1, at: 5.8, dur: 1.0, kind: "screw",
      build: buildMountRing, target: [0, 0, 0], start: [0, 8, 1.5], mid: [0, 5, 0.8] });
    def({ id: "lensRear", name: "REAR GROUP · 后组镜片", sub: "后主点 x=55mm(∞对焦)", phase: 1, at: 6.7, dur: 1.1, kind: "screw",
      build: buildLensRear, target: [0, 0, 0], start: [0, 8.5, 1.5], mid: [0, 5.2, 0.8] });
    def({ id: "helicoid", name: "HELICOID · 调焦螺旋筒", sub: "对焦行程 7.66mm@0.45m", phase: 1, at: 7.7, dur: 1.2, kind: "screw",
      build: buildHelicoid, target: [0, 0, 0], start: [0, 9, 1.5], mid: [0, 5.5, 0.8] });
    def({ id: "lensFront", name: "FRONT GROUP · 前组镜片", sub: "55mm f/1.4 · D=39.3mm 全开", phase: 1, at: 8.9, dur: 1.2, kind: "screw",
      build: buildLensFront, target: [0, 0, 0], start: [0, 9.5, 1.5], mid: [0, 5.8, 0.8] });

    /* 阶段 3 IRIS */
    def({ id: "irisBarrel", name: "IRIS BARREL · 光圈筒", sub: "9 叶叶片仓", phase: 2, at: 11.8, dur: 1.0,
      build: buildIrisBarrel, target: [0, 0, 0], start: [0, 8, 1.5], mid: [0, 5, 0.8] });
    def({ id: "irisBlades", name: "IRIS BLADES · 光圈叶片 ×9", sub: "内切半径 a=(F/2N)·cos(π/9)", phase: 2, at: 12.7, dur: 1.1, kind: "kine",
      build: buildIrisBlades, target: [wx(58.6), wy(0), 0], off: fly(1.5, 2.6, 0.8) });
    def({ id: "fRing", name: "F RING · 光圈调节环", sub: "f 序列 1.4→16 每档 ×√2", phase: 2, at: 13.9, dur: 1.1, kind: "screw",
      build: buildFRing, target: [0, 0, 0], start: [0, 8.5, 1.5], mid: [0, 5.3, 0.8] });

    /* 阶段 4 VIEWBOX */
    def({ id: "mirrorChamber", name: "MIRROR BOX · 镜箱光阱", sub: "消光内壁 + 侧挡", phase: 3, at: 17.8, dur: 1.1,
      build: buildMirrorChamber, target: [0, 0, 0], start: [0, 9, 1.5], mid: [0, 5, 0.8] });
    def({ id: "mirror", name: "REFLEX MIRROR · 反光镜", sub: "45° \\ 面 · 法线(1,1)/√2 · 翻起 30ms", phase: 3, at: 18.8, dur: 1.2, kind: "kine",
      build: buildMirror, target: [wx(D.HINGE[0]), wy(D.HINGE[1]), 0], off: fly(2.2, 2.8, 0.8) });
    def({ id: "mirrorActuator", name: "ACTUATOR · 翻镜拨杆", sub: "弹簧杆 · 即时回弹(Asahiflex 1952)", phase: 3, at: 19.8, dur: 1.0, kind: "kine",
      build: buildMirrorActuator, target: [0, 0, 0], off: fly(1.6, 2.4, 0.8) });
    def({ id: "focusScreen", name: "FOCUS SCREEN · 对焦屏", sub: "光路 17+38=55mm 严格(∞对焦)", phase: 3, at: 20.8, dur: 1.1,
      build: buildFocusScreen, target: [0, 0, 0], start: [0, 10.5, 1.5], mid: [0, 6.5, 0.8] });
    def({ id: "pentaprism", name: "PENTAPRISM · 五棱镜", sub: "两次反射恒偏 90°(追迹 ±3° 容差 0.2°)", phase: 3, at: 21.9, dur: 1.2,
      build: buildPentaprism, target: [0, 0, 0], start: [0, 11, 1.5], mid: [0, 7, 0.8] });
    def({ id: "pentaHousing", name: "PRISM HOUSING · 棱镜罩", sub: "顶盖 + 前/背护板(留目镜窗)", phase: 3, at: 23.0, dur: 1.1,
      build: buildPentaHousing, target: [0, 0, 0], start: [0, 10.5, 1.5], mid: [0, 6.8, 0.8] });
    def({ id: "eyepiece", name: "EYEPIECE · 目镜", sub: "出射恒 −x · 摄影师取景", phase: 3, at: 24.0, dur: 1.0,
      build: buildEyepiece, target: [0, 0, 0], start: [0, 9.5, 1.5], mid: [0, 6, 0.8] });

    /* 阶段 5 SHUTTER */
    def({ id: "rollerFront", name: "ROLLER F · 前帘卷轴", sub: "z=+21 · 收帘", phase: 4, at: 25.0, dur: 1.0,
      build: function () { return buildRoller(3.2); }, target: [0, 0, 0], start: [0, 9, 2.0], mid: [0, 5.5, 1.0] });
    def({ id: "rollerBack", name: "ROLLER B · 后帘卷轴", sub: "z=−21 · 放帘", phase: 4, at: 25.8, dur: 1.0,
      build: function () { return buildRoller(-3.2); }, target: [0, 0, 0], start: [0, 9, -2.0], mid: [0, 5.5, -1.0] });
    def({ id: "curtain1", name: "CURTAIN 1 · 前幕帘", sub: "释放开启 · 曝光 t=w/v", phase: 4, at: 26.7, dur: 1.0, kind: "kine",
      build: function () { return buildCurtain(true); }, target: [wx(-1.2), wy(0), 0], off: fly(1.5, 2.6, 0.8) });
    def({ id: "curtain2", name: "CURTAIN 2 · 后幕帘", sub: "随缝扫过 → 曝光终止", phase: 4, at: 27.5, dur: 1.0, kind: "kine",
      build: function () { return buildCurtain(false); }, target: [wx(-1.2), wy(0), 0], off: fly(-1.5, 2.6, 0.8) });
    def({ id: "speedDial", name: "SPEED DIAL · 速度盘", sub: "1000→1 · X-sync 1/60", phase: 4, at: 28.5, dur: 1.1, kind: "kine",
      build: buildSpeedDial, target: [0, 0, 0], off: fly(1.8, 2.6, 0.8) });

    /* 阶段 6 FILM */
    def({ id: "cassette", name: "CASSETTE · 35mm 暗盒", sub: "供片侧", phase: 5, at: 30.9, dur: 1.0,
      build: buildCassette, target: [0, 0, 0], start: [0, 8.5, -2.0], mid: [0, 5, -1.0] });
    def({ id: "filmStrip", name: "FILM · 胶片", sub: "35mm × 幅宽 36mm", phase: 5, at: 31.8, dur: 1.0,
      build: buildFilmStrip, target: [0, 0, 0], start: [0, 8, 2.0], mid: [0, 5, 1.0] });
    def({ id: "takeupSpool", name: "TAKE-UP · 收片轴", sub: "卷片扳手联动", phase: 5, at: 32.6, dur: 1.0,
      build: buildTakeupSpool, target: [0, 0, 0], start: [0, 8.5, 2.0], mid: [0, 5, 1.0] });
    def({ id: "frameCounter", name: "COUNTER · 计数窗", sub: "张数指示", phase: 5, at: 33.4, dur: 1.0,
      build: buildFrameCounter, target: [0, 0, 0], start: [0, 8.5, -2.0], mid: [0, 5.5, -1.0] });

    /* 阶段 7 VIEWING */
    def({ id: "subjectCard", name: "SUBJECT · 被摄目标", sub: "远景示意(压缩画幅)", phase: 6, at: 35.9, dur: 1.2,
      build: buildSubjectCard, target: [wx(D.SUBJECT_X), 0.4, 0], start: [wx(D.SUBJECT_X), 10, 0], mid: [wx(D.SUBJECT_X), 5.5, 0], world: true });
    def({ id: "viewRays", name: "LIGHT PATH · 取景光路", sub: "被摄体→镜头→镜→屏→五棱镜→目镜", phase: 6, at: 37.0, dur: 1.2, kind: "none",
      build: buildRays, target: [0, 0, 0] });
    def({ id: "screenImage", name: "SCREEN IMAGE · 屏上正立像", sub: "屋脊五棱镜转正 · 无左右反演", phase: 6, at: 38.2, dur: 1.2, kind: "none",
      build: buildScreenImage, target: [0, 0, 0] });

    /* 阶段 8 EXPOSURE */
    def({ id: "filmImage", name: "FILM IMAGE · 胶片倒立像", sub: "倒立实像 · 3:2 幅面", phase: 7, at: 42.3, dur: 1.0, kind: "none",
      build: buildFilmImage, target: [0, 0, 0] });
  };

  /* —— 运动学分发(每帧;group 只写 rotation,平移走子节点)—— */
  MECH.KINE = function (st) {
    var ph = st.phaseId || "";
    var mir = MECH.Parts.entry("mirror");
    if (mir && mir.shown) mir.group.rotation.z = Math.PI / 4 * (st.mirror || 0);

    var act = MECH.Parts.entry("mirrorActuator");
    if (act && act.shown && act.group.userData.lever) {
      act.group.userData.lever.rotation.z = -0.5 + 0.9 * (st.mirror || 0);
    }

    /* 光圈叶片:γ = acos(a/Rp) */
    var ib = MECH.Parts.entry("irisBlades");
    if (ib && ib.shown) {
      var gamma = KS.bladeGamma(KS.irisApo(st.irisN || 1.4));
      ib.group.userData.blades.forEach(function (bl) {
        bl.rotation.z = bl.userData.phi + Math.PI / 2 + gamma;
      });
    }
    var fr = MECH.Parts.entry("fRing");
    if (fr && fr.shown) {
      fr.group.rotation.x = -(st.fIdx || 0) * 0.18;
    }

    /* 镜筒对焦伸长(cell 子组平移 e·K) */
    var e = KS.extension(st.focusU === undefined ? Infinity : st.focusU) * K;
    ["lensRear", "helicoid", "lensFront"].forEach(function (id) {
      var p = MECH.Parts.entry(id);
      if (p && p.shown && p.group.userData.cell) p.group.userData.cell.position.x = e;
    });

    /* 幕帘开合(子网格 scale.z/position.z,组不动) */
    ["curtain1", "curtain2"].forEach(function (id, ci) {
      var p = MECH.Parts.entry(id);
      if (!p || !p.shown) return;
      var cloth = p.group.userData.cloth;
      var edge = ci === 0 ? (st.c1 === undefined ? -18 : st.c1)
                          : (st.c2 === undefined ? 18 : st.c2);
      if (ci === 0) {                       // 前帘覆盖 [edge, +18]
        cloth.scale.z = Math.max(0.02, 18 - edge) * K;
        cloth.position.z = (edge + 18) / 2 * K;
      } else {                              // 后帘覆盖 [−18, edge]
        cloth.scale.z = Math.max(0.02, edge + 18) * K;
        cloth.position.z = (edge - 18) / 2 * K;
      }
    });

    /* 速度盘 + 计数窗随档位 */
    var sd = MECH.Parts.entry("speedDial");
    if (sd && sd.shown) sd.group.rotation.y = -(st.speedIdx || 0) * (Math.PI * 2 / D.SPEEDS.length);

    /* 光路可见性:取景(阶段7 与 曝光首尾) / 曝光(翻镜期间) */
    var vr = MECH.Parts.entry("viewRays");
    if (vr && vr.shown) {
      var viewing = (ph === "viewing") || (ph === "exposure" && (st.exT < 40 || st.exT > 120));
      vr.group.userData.view.visible = viewing;
      vr.group.userData.exp.visible = (ph === "exposure") && st.exT >= 40 && st.exT <= 120;
    }

    /* 屏上像与胶片像透明度 */
    var si = MECH.Parts.entry("screenImage");
    if (si && si.shown) si.group.userData.pl.material.opacity = st.screenA || 0;
    var fi = MECH.Parts.entry("filmImage");
    if (fi && fi.shown) fi.group.userData.pl.material.opacity = st.filmExposed || 0;
  };
})(window.MECH = window.MECH || {});
