/* 墨经小孔成像 — 部件建模与注册(约 16 件)。
   坐标系:隔墙/孔中心 = 原点(mm × K),+x 朝暗室内部(屏侧),−x 为外景物侧。
   场景 y = (mm_y + 60)·K。屏像为**实算纹理**:对屏面逐像素沿光线逆向采样
   外景画(过孔径盘 5 点模糊),与 mech.js 求解器同源(断言与可视化一致)。
   注:KINE 对部件 group 只写 rotation;屏滑动/行人行走/孔径缩放走子节点。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;
  var K = D.K;

  function wx(x) { return x * K; }
  function wy(y) { return (y + 60) * K; }
  function wz(z) { return (z || 0) * K; }
  function anchored(g, ax, ay, az) {
    g.userData.tagAnchor = new THREE.Vector3(ax || 0, ay || 0, az || 0);
    return { group: g };
  }

  var MAT = {};
  function makeMats() {
    MAT.darkIn = new THREE.MeshStandardMaterial({ color: 0x14161A, roughness: 0.92, metalness: 0.05 });
    MAT.brick = new THREE.MeshStandardMaterial({ color: 0x5A4636, roughness: 0.9, metalness: 0.04 });
    MAT.earth = new THREE.MeshStandardMaterial({ color: 0x6B5842, roughness: 0.95, metalness: 0.02 });
    MAT.ray = new THREE.MeshBasicMaterial({ color: 0xFFDF9E, transparent: true, opacity: 0.85 });
    MAT.raySoft = new THREE.MeshBasicMaterial({ color: 0xFFE9B8, transparent: true, opacity: 0.45 });
    MAT.sun = new THREE.MeshBasicMaterial({ color: 0xFFD34E });
    MAT.hole = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
  }

  /* —— 外景画(物平面 x=−a 的投影源,世界窗 y/z ∈ [−60,60])—— */
  var PAINT = { W: 480, H: 480, WIN: 120, data: null, key: "" };
  function paintWorld(figDX) {
    var c = document.createElement("canvas");
    c.width = PAINT.W; c.height = PAINT.H;
    var x = c.getContext("2d");
    var W = PAINT.W, H = PAINT.H;
    function px(zw) { return (zw + 60) / 120 * W; }      // z −60..60 → 0..W
    function py(yw) { return (60 - yw) / 120 * H; }      // y +60..−60 → 0..H
    /* 亮天空 */
    var g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#7FB2DF"); g.addColorStop(0.62, "#C8DFEA"); g.addColorStop(1, "#E8DFC8");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    /* 日轮(视张角示意) */
    x.fillStyle = "#FFDF6A";
    x.beginPath(); x.arc(px(20), py(42), 11, 0, Math.PI * 2); x.fill();
    /* 远山 */
    x.fillStyle = "#8FA88B";
    x.beginPath(); x.moveTo(0, py(-28));
    x.lineTo(px(-52), py(-6)); x.lineTo(px(-16), py(-24));
    x.lineTo(px(30), py(-2)); x.lineTo(px(60), py(-22));
    x.lineTo(W, py(-10)); x.lineTo(W, H); x.lineTo(0, H);
    x.closePath(); x.fill();
    /* 地面 */
    x.fillStyle = "#7C6B4E";
    x.fillRect(0, py(-38), W, H - py(-38));
    /* 塔(z=−34,足 −45 顶 52;物距 165 → 画按同窗近似) */
    var tx = px(-34), tw = 13;
    x.fillStyle = "#5E5347";
    x.fillRect(tx - tw / 2, py(52), tw, py(-45) - py(52));
    for (var fl = 0; fl < 5; fl++) {
      var fy = 52 - fl * 19;
      x.fillRect(tx - tw / 2 - 2.5, py(fy), tw + 5, 3.5);
    }
    x.beginPath(); x.moveTo(tx - tw * 0.9, py(52)); x.lineTo(tx, py(66)); x.lineTo(tx + tw * 0.9, py(52)); x.closePath(); x.fill();
    /* 人(z=0,足 −30 头 +30,可行走偏移 figDX·z 向映射为 z 平移) */
    var fx = px(0 + (figDX || 0));
    x.fillStyle = "#2E2A26";
    x.fillRect(fx - 4.5, py(18), 9, py(-30) - py(18));        // 身
    x.beginPath(); x.arc(fx, py(27), 5.5, 0, Math.PI * 2); x.fill();   // 头
    x.fillRect(fx - 6.5, py(16), 13, 3.2);                    // 臂/袖
    return x.getImageData(0, 0, W, H);
  }
  /* 屏像重算:屏 80(z)×90(y) 像素,每像素 5 孔内采样 */
  function renderScreenImage(st) {
    var a = st.a, b = st.b, d = st.d;
    var key = [a, b, d, st.figDX].join("|");
    if (key === PAINT.key && PAINT.data) return;
    PAINT.key = key;
    if (!PAINT.data || Math.abs((PAINT.figDX || 0) - (st.figDX || 0)) > 0.5) {
      PAINT.data = paintWorld(st.figDX);
      PAINT.figDX = st.figDX || 0;
    }
    var SW = 80, SH = 90;
    var img = st._screenCtx.createImageData(SW, SH);
    var dat = img.data, src = PAINT.data.data, PW = PAINT.W, PH = PAINT.H;
    var offs = [[0, 0]];
    for (var q = 0; q < 4; q++) {
      offs.push([Math.cos(q * Math.PI / 2) * d / 2, Math.sin(q * Math.PI / 2) * d / 2]);
    }
    var lum = Math.min(1.7, Math.max(0.05, (d / 10) * (d / 10)));   // 照度 ∝ d²(基准 d=10)
    var rH = d / 2;
    for (var iy = 0; iy < SH; iy++) {
      var ys = 45 - (iy + 0.5);
      for (var ix = 0; ix < SW; ix++) {
        var zs = -40 + (ix + 0.5);
        var r = 0, g = 0, bl = 0;
        for (var s = 0; s < offs.length; s++) {
          var dy = offs[s][0], dz = offs[s][1];
          var yw = KS.objHit(ys, dy, a, b);
          var zw = KS.objHit(zs, dz, a, b);
          var u = Math.round((zw + 60) / 120 * (PW - 1));
          var v = Math.round((60 - yw) / 120 * (PH - 1));
          u = Math.min(PW - 1, Math.max(0, u));
          v = Math.min(PH - 1, Math.max(0, v));
          var i4 = (v * PW + u) * 4;
          r += src[i4]; g += src[i4 + 1]; bl += src[i4 + 2];
        }
        var o4 = (iy * SW + ix) * 4;
        dat[o4] = Math.min(255, r / 5 * lum);
        dat[o4 + 1] = Math.min(255, g / 5 * lum);
        dat[o4 + 2] = Math.min(255, bl / 5 * lum);
        dat[o4 + 3] = 255;
      }
    }
    st._screenCtx.putImageData(img, 0, 0);
    st._screenTex.needsUpdate = true;
  }

  /* —— 几何助手 —— */
  function tubeUnit(r, mat) {
    var m = P.mesh(new THREE.CylinderGeometry(r, r, 1, 8), mat, 0, 0, 0, false, false);
    return m;
  }
  var UP = new THREE.Vector3(0, 1, 0);

  /* —— 部件构建 —— */
  function buildPlinth() {
    var g = new THREE.Group();
    g.add(P.box(30, 0.8, 12, M3.stone, wx(-40), 0.4, 0));
    g.add(P.box(26, 0.9, 10, M3.dark, wx(-40), 1.25, 0));
    g.userData.tagAnchor = new THREE.Vector3(wx(-40), 1.0, 0);
    return { group: g };
  }

  /* 暗室内部(围板:x −8…175,y −52…58, z ±45;开口朝 +x 屏侧与 ±z 剖视) */
  function buildChamberInt() {
    var g = new THREE.Group();
    var x0 = wx(-8), x1 = wx(D.INT_BACK), yB = wy(-52), yT = wy(58);
    g.add(P.box(1.4, yT - yB, 9.9, MAT.darkIn, x1, (yB + yT) / 2, 0));          // 内后壁
    g.add(P.box(x1 - x0, 1.4, 9.9, MAT.darkIn, (x0 + x1) / 2, yB + 0.7, 0));    // 内地面
    g.add(P.box(x1 - x0, 1.2, 9.9, MAT.darkIn, (x0 + x1) / 2, yT - 0.6, 0));    // 顶
    /* ±z 剖视:侧墙仅留上下沿,内堂敞开可见倒像屏 */
    [-1, 1].forEach(function (sy) {
      g.add(P.box(x1 - x0, 1.0, 0.9, MAT.darkIn, (x0 + x1) / 2, yB + 1.2, sy * 4.95));
      g.add(P.box(x1 - x0, 1.0, 0.9, MAT.darkIn, (x0 + x1) / 2, yT - 1.2, sy * 4.95));
    });
    g.userData.tagAnchor = new THREE.Vector3(wx(150), wy(40), 0);
    return { group: g };
  }

  /* 外侧亮景地台与天幕 */
  function buildChamberExt() {
    var g = new THREE.Group();
    var x0 = wx(-230), x1 = wx(-6);
    g.add(P.box(x1 - x0, 1.4, 9.9, MAT.earth, (x0 + x1) / 2, wy(-52) + 0.7, 0));
    g.add(P.mesh(new THREE.PlaneGeometry(x1 - x0, 11),
      new THREE.MeshBasicMaterial({ color: 0x27435E, side: THREE.DoubleSide }),
      (x0 + x1) / 2, wy(30), -4.9, false, false));
    g.children[1].rotation.x = Math.PI / 16;
    g.userData.tagAnchor = new THREE.Vector3(wx(-180), wy(-48), 0);
    return { group: g };
  }

  /* 隔墙:中央 22mm 圆孔(Shape 挖孔挤出),孔内衬黑管 */
  function buildWallMid() {
    var g = new THREE.Group();
    var shp = new THREE.Shape();
    var w = 90, h = 110;                        // 墙半宽/半高 mm
    shp.moveTo(-w, -h); shp.lineTo(w, -h); shp.lineTo(w, h); shp.lineTo(-w, h); shp.closePath();
    var hole = new THREE.Path();
    hole.absarc(0, 0, 11, 0, Math.PI * 2, true);
    shp.holes.push(hole);
    var geo = new THREE.ExtrudeGeometry(shp, { depth: 6, bevelEnabled: false });
    geo.translate(0, 0, -3);
    geo.scale(K, K, K);
    var wall = P.mesh(geo, MAT.brick, wx(0), wy(0), 0);
    g.add(wall);
    /* 墙面木框饰边 */
    g.add(P.box(2.4, (h + 8) * K, 1.2, M3.woodD, wx(-w - 3), wy(0), 0));
    g.add(P.box(2.4, (h + 8) * K, 1.2, M3.woodD, wx(w + 3), wy(0), 0));
    g.userData.tagAnchor = new THREE.Vector3(wx(0), wy(50), 0);
    return { group: g };
  }

  /* 孔径管:半径 d/2(KINE 走子节点 scale),附孔环标尺 */
  function buildAperture() {
    var g = new THREE.Group();
    var tube = P.mesh(new THREE.CylinderGeometry(0.55, 0.55, 6.5 * K, 20, 1, true),
      MAT.hole, wx(0), wy(0), 0, false, false);
    tube.rotation.z = Math.PI / 2;
    g.add(tube);
    g.userData.tube = tube;
    var ring = P.torus(0.75, 0.1, M3.brass, wx(3.3), wy(0), 0);
    ring.rotation.y = Math.PI / 2;
    g.add(ring);
    g.userData.tagAnchor = new THREE.Vector3(wx(3.3), wy(6), 0);
    return { group: g };
  }

  /* 屏:画布实算纹理,kine;carriage 子节点沿 x 滑动(像距 b) */
  function buildScreen() {
    var g = new THREE.Group();
    var carriage = new THREE.Group(); carriage.name = "carriage";
    var cv = document.createElement("canvas");
    cv.width = 80; cv.height = 90;
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    var pl = P.mesh(new THREE.PlaneGeometry(80 * K, 90 * K),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }),
      0, 0, 0, false, false);
    pl.rotation.y = -Math.PI / 2;               // 面 −x(朝隔墙)
    carriage.add(pl);
    carriage.add(P.box(1.2, 90 * K + 1.2, 1.0, M3.woodD, -0.55, 0, 0));  // 屏框(背)
    [-1, 1].forEach(function (s) {
      carriage.add(P.box(1.2, 90 * K + 1.2, 0.8, M3.woodD, 0, 0, s * 40 * K));
    });
    carriage.add(P.box(1.2, 1.0, 80 * K + 1.0, M3.woodD, 0, 45 * K + 0.4, 0));
    carriage.add(P.box(1.2, 1.0, 80 * K + 1.0, M3.woodD, 0, -45 * K - 0.4, 0));
    g.add(carriage);
    g.userData.carriage = carriage;
    g.userData.canvas = cv;
    g.userData.tex = tex;
    g.userData.tagAnchor = new THREE.Vector3(-0.9, 45 * K + 0.8, 0);
    return { group: g };
  }

  function buildRail() {
    var g = new THREE.Group();
    [-1, 1].forEach(function (s) {
      g.add(P.box(100 * K, 0.8, 1.2, M3.woodD, wx(105), wy(-50), s * 40 * K));
    });
    g.add(P.box(100 * K, 0.5, 0.8, M3.steelD, wx(105), wy(-49), 0));
    g.userData.tagAnchor = new THREE.Vector3(wx(150), wy(-48.6), 0);
    return { group: g };
  }

  /* 外景物:人(kine:行走子节点)/ 塔 / 日 */
  function buildFigure() {
    var g = new THREE.Group();
    var body = new THREE.Group(); body.name = "body";
    body.add(P.cyl(0.5, 0.5, 0.7, M3.woodD, 0, wy(-52) + 0.35, 0, 10));
    var stand = P.cyl(0.16, 0.16, 30 * K, M3.woodD, 0, wy(-37), 0, 8);
    body.add(stand);
    body.add(P.box(8 * K, 26 * K, 3 * K, M3.lacquer, 0, wy(-16), 0));   // 身
    var head = P.sph(4 * K, M3.lacquer, 0, wy(24), 0);
    body.add(head);
    body.add(P.box(12 * K, 2.6 * K, 2.2 * K, M3.lacquer, 0, wy(8), 0)); // 臂
    body.position.x = wx(-D.A_FIG);
    g.add(body);
    g.userData.body = body;
    g.userData.tagAnchor = new THREE.Vector3(wx(-D.A_FIG), wy(34), 0);
    return { group: g };
  }

  function buildPagoda() {
    var g = new THREE.Group();
    var z = wz(-34), bx = wx(-D.A_TOWER);
    g.add(P.box(13 * K, 97 * K, 8 * K, M3.woodD, bx, wy(3.5), z));
    for (var fl = 0; fl < 5; fl++) {
      g.add(P.box(17 * K, 3 * K, 11 * K, M3.bronze, bx, wy(52 - fl * 19), z));
    }
    g.add(P.mesh(new THREE.ConeGeometry(7 * K, 12 * K, 4), M3.bronze, bx, wy(58), z, false, false));
    g.userData.tagAnchor = new THREE.Vector3(bx, wy(58), z);
    return { group: g };
  }

  function buildSun() {
    var g = new THREE.Group();
    var disc = P.cyl(7 * K, 7 * K, 0.5, MAT.sun, wx(-D.A_SUN), wy(42), wz(20), 24);
    disc.rotation.z = Math.PI / 2;
    g.add(disc);
    g.userData.tagAnchor = new THREE.Vector3(wx(-D.A_SUN), wy(50), wz(20));
    return { group: g };
  }

  /* 光线管组:足/首/塔尖/日 × 孔缘(±d/2),KINE 每帧按 a/b/d 重摆 */
  function buildRays() {
    var g = new THREE.Group();
    var tubes = [];
    var defs = [["foot", -1], ["foot", 1], ["head", -1], ["head", 1],
                ["tower", -1], ["tower", 1], ["sun", -1], ["sun", 1]];
    defs.forEach(function (df, i) {
      var mat = i < 4 ? MAT.ray : MAT.raySoft;
      tubes.push({ obj: df[0], rim: df[1], t1: tubeUnit(0.075, mat), t2: tubeUnit(0.075, mat) });
      g.add(tubes[tubes.length - 1].t1);
      g.add(tubes[tubes.length - 1].t2);
    });
    g.userData.tubes = tubes;
    g.visible = false;
    g.userData.tagAnchor = new THREE.Vector3(wx(-55), wy(0), 0);
    return { group: g };
  }

  /* 墨经条文卷轴(Canvas 文字) */
  function buildScroll() {
    var g = new THREE.Group();
    var c = document.createElement("canvas");
    c.width = 512; c.height = 256;
    var x = c.getContext("2d");
    x.fillStyle = "#E7DCC2"; x.fillRect(0, 0, 512, 256);
    x.strokeStyle = "#8A6E3F"; x.lineWidth = 6; x.strokeRect(8, 8, 496, 240);
    x.fillStyle = "#2A2620";
    x.font = "700 30px serif";
    x.fillText("《墨经·经下》", 30, 56);
    x.font = "600 26px serif";
    x.fillText("景到,在午有端,与景长,说在端。", 30, 110);
    x.font = "600 21px serif";
    x.fillText("《经说下》光之人,煦若射,下者之人也高;", 30, 158);
    x.fillText("高者之人也下。足蔽下光,故成景于上;", 30, 194);
    x.fillText("首蔽上光,故成景于下。", 30, 228);
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    var pl = P.mesh(new THREE.PlaneGeometry(11, 5.5),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, side: THREE.DoubleSide }),
      wx(58), wy(48), 0, false, false);
    pl.rotation.y = -Math.PI / 2.6;
    g.add(pl);
    g.add(P.cyl(0.14, 0.14, 6, M3.woodD, wx(63), wy(48), 0, 8));
    g.children[1].rotation.x = Math.PI / 2;
    g.userData.tagAnchor = new THREE.Vector3(wx(58), wy(56), 0);
    return { group: g };
  }

  /* 地面标尺:物距 a / 像距 b 刻度 */
  function buildScaleMarks() {
    var g = new THREE.Group();
    for (var d = -220; d <= 170; d += 55) {
      g.add(P.box(1.6, 0.3, 7, M3.brass, wx(d), wy(-51.4), 0));
    }
    g.userData.tagAnchor = new THREE.Vector3(wx(-110), wy(-50), 0);
    return { group: g };
  }

  /* —— 注册(at 为绝对周期秒)—— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    makeMats();
    function def(o) { return MECH._def(o); }
    function fly(dx, dy, dz) { return [dx * K, dy * K, dz * K]; }

    def({ id: "plinth", name: "PLINTH · 展示台座", sub: "暗室剖视台", phase: 0, at: 0.2, dur: 1.1,
      build: buildPlinth, target: [0, 0, 0], start: [0, 7.5, -3.5], mid: [0, 4.5, -1.8], world: true });
    def({ id: "chamberInt", name: "DARK ROOM · 暗室内堂", sub: "内壁消光 · ±z 剖视", phase: 0, at: 0.9, dur: 1.3,
      build: buildChamberInt, target: [0, 0, 0], start: [0, 10, 2.5], mid: [0, 5.5, 1.2] });
    def({ id: "chamberExt", name: "YARD · 外景地台天幕", sub: "亮侧:日·塔·人所立", phase: 0, at: 2.0, dur: 1.2,
      build: buildChamberExt, target: [0, 0, 0], start: [0, 9, -2.5], mid: [0, 5, -1.2] });
    def({ id: "wallMid", name: "WALL · 隔墙", sub: "《经下》「在午有端」——墙即午,孔即端", phase: 0, at: 3.1, dur: 1.3,
      build: buildWallMid, target: [0, 0, 0], start: [0, 10, 2.0], mid: [0, 6, 1.0] });

    def({ id: "aperture", name: "APERTURE · 针孔(端)", sub: "d = 2…20mm 可调 · 「端」者孔也", phase: 1, at: 6.0, dur: 1.2, kind: "kine",
      build: buildAperture, target: [wx(0), wy(0), 0], off: fly(2.0, 2.6, 0.8) });
    def({ id: "scaleMarks", name: "SCALE · 距离标尺", sub: "物距 a · 像距 b", phase: 1, at: 7.0, dur: 1.0,
      build: buildScaleMarks, target: [0, 0, 0], start: [0, 8, -2.0], mid: [0, 5, -1.0] });

    def({ id: "figure", name: "FIGURE · 行人(足/首)", sub: "足蔽下光成景于上 · 首蔽上光成景于下", phase: 2, at: 11.8, dur: 1.2, kind: "kine",
      build: buildFigure, target: [0, 0, 0], off: fly(-2.0, 2.6, 0.8) });
    def({ id: "pagoda", name: "PAGODA · 塔", sub: "远景物 · 物距 165mm", phase: 2, at: 12.7, dur: 1.1, kind: "kine",
      build: buildPagoda, target: [0, 0, 0], off: fly(-1.6, 2.8, -0.8) });
    def({ id: "sun", name: "SUN · 日", sub: "张角 0.53° · 日像 ≈ b·tanθ + d", phase: 2, at: 13.6, dur: 1.1, kind: "kine",
      build: buildSun, target: [0, 0, 0], off: fly(-2.4, 3.0, 0.8) });

    def({ id: "rays", name: "RAYS · 光线直进", sub: "煦若射:足上首下,过端而倒", phase: 3, at: 17.8, dur: 1.4, kind: "kine",
      build: buildRays, target: [0, 0, 0], off: fly(0, 2.4, 0) });

    def({ id: "screenRail", name: "RAIL · 屏轨", sub: "像距 b = 60…150mm", phase: 4, at: 24.8, dur: 1.1,
      build: buildRail, target: [0, 0, 0], start: [0, 8.5, 2.0], mid: [0, 5, 1.0] });
    def({ id: "screen", name: "SCREEN · 倒像屏", sub: "景到:倒立实像(实算纹理)", phase: 4, at: 25.8, dur: 1.3, kind: "kine",
      build: buildScreen, target: [wx(0), wy(0), 0], off: fly(1.6, 2.8, 0.8) });

    def({ id: "scroll", name: "SCROLL · 墨经条文", sub: "经下 / 经说下 原文", phase: 6, at: 37.9, dur: 1.3,
      build: buildScroll, target: [0, 0, 0], start: [0, 10.5, 1.5], mid: [0, 6.5, 0.8] });
  };

  /* —— 运动学分发 —— */
  MECH.KINE = function (st) {
    var ph = st.phaseId || "";
    /* 屏滑动(像距 b)与屏像重算 */
    var sc = MECH.Parts.entry("screen");
    if (sc && sc.shown) {
      var carriage = sc.group.userData.carriage;
      carriage.position.x = st.b * K;
      if (!st._screenCtx) {
        st._screenCtx = sc.group.userData.canvas.getContext("2d");
        st._screenTex = sc.group.userData.tex;
      }
      renderScreenImage(st);
    }
    /* 行人行走(figDX:向墙 +x 位移 mm) */
    var fig = MECH.Parts.entry("figure");
    if (fig && fig.shown) fig.group.userData.body.position.x = wx(-st.a + (st.figDX || 0));
    /* 孔径管缩放(d mm → 半径 d/2;建模基准半径 0.55u = 5mm) */
    var ap = MECH.Parts.entry("aperture");
    if (ap && ap.shown) {
      var s = (st.d / 2) / 5;
      ap.group.userData.tube.scale.set(s, 1, s);
    }
    /* 光线管:足/首/塔尖/日 → 孔缘(±d/2)→ 屏;每帧按 a/b/d 重摆 */
    var rays = MECH.Parts.entry("rays");
    if (rays && rays.shown) {
      var visible = (ph === "rays" || ph === "screen" || ph === "apsize" || ph === "mozi" || ph === "walk");
      rays.group.visible = visible;
      if (visible) {
        var mats = { foot: [-30, D.A_FIG, 0], head: [30, D.A_FIG, 0],
                     tower: [52 + st.figDX * 0, D.A_TOWER, -34], sun: [42, D.A_SUN, 20] };
        rays.group.userData.tubes.forEach(function (td) {
          var m = mats[td.obj];
          var oy = m[0] - (td.obj === "foot" || td.obj === "head" ? 0 : 0);
          var aR = m[1], zo = m[2];
          var dyH = td.rim * st.d / 2;
          var r = KS.rayTo(oy, dyH, aR, st.b);
          /* 孔点:物 z 经直线到孔平面 z=0;屏点 z = −z_o·b/a(倒) */
          var zo2 = (td.obj === "foot" || td.obj === "head") ? (st.figDX || 0) * 0 + zo : zo;
          var A = new THREE.Vector3(wx(-aR), wy(oy), wz(zo2));
          var Bp = new THREE.Vector3(wx(0), wy(dyH), 0);
          var Cs = new THREE.Vector3(wx(st.b), wy(r.ys), wz(-zo2 * st.b / aR));
          function seg(t, P1, P2) {
            var dir = P2.clone().sub(P1);
            var len = Math.max(0.02, dir.length());
            t.position.copy(P1.clone().add(P2).multiplyScalar(0.5));
            t.quaternion.setFromUnitVectors(UP, dir.normalize());
            t.scale.set(1, len, 1);
            t.material.opacity = td.obj === "sun" ? 0.38 : 0.8;
          }
          seg(td.t1, A, Bp);
          seg(td.t2, Bp, Cs);
        });
      }
    }
  };
})(window.MECH = window.MECH || {});
