/* 仰仪部件建模与注册(5 件)。
   布局:砖台(带阶)上置铜半球釜(开口朝上,球心在釜口平面):
   内壁网格(Canvas 纹理:节气平行圈+时辰经线);球心璇玑板(十字+针孔);
   日像(亮斑贴内壁,tick 球面定位);光线束(孔→像)。
   kine:无转动件;日像/光线为位移驱动。
   标签锚点:build 返回 anchor。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM;

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  /* 砖台:方形台 + 四阶 */
  function buildPlatform() {
    var g = group();
    var brick = new THREE.MeshStandardMaterial({ color: 0x54575C, roughness: 0.95 });
    g.add(P.box(3.6, D.brickH, 3.6, brick, 0, D.brickH / 2, 0));
    [0.45, 0.30, 0.15].forEach(function (h, i) {
      g.add(P.box(2.9 - i * 0.5, h, 0.5, brick, 0, h / 2, 2.05 + i * 0.42));
    });
    g.add(P.box(3.0, 0.08, 3.0, M3.stone, 0, D.brickH + 0.04, 0));
    return { group: g, anchor: mkAnchor(1.9, 0.9, 0) };
  }

  /* 铜釜:半球(开口朝上,球心在釜口平面)+ 内壁网格纹理 */
  function buildBowl() {
    var g = group();
    var cy = D.brickH + 0.10;
    var c = document.createElement("canvas");
    c.width = 1024; c.height = 512;
    var x = c.getContext("2d");
    x.fillStyle = "#8A6E3F"; x.fillRect(0, 0, 1024, 512);
    for (var i = 0; i < 700; i++) {
      x.fillStyle = "rgba(60,44,20," + (0.05 + (i % 5) / 100).toFixed(3) + ")";
      x.fillRect((i * 97) % 1024, (i * 149) % 512, 2, 2);
    }
    x.strokeStyle = "rgba(233,238,242,0.5)"; x.lineWidth = 2;
    /* 节气平行圈(弧线,天顶=底) */
    for (var r = 1; r <= 8; r++) {
      x.beginPath(); x.arc(512, 256, r / 8 * 240, 0, Math.PI * 2); x.stroke();
    }
    /* 时辰经线(放射) */
    for (var k = 0; k < 12; k++) {
      var a = k / 12 * Math.PI * 2;
      x.beginPath(); x.moveTo(512, 256);
      x.lineTo(512 + Math.cos(a) * 244, 256 + Math.sin(a) * 244);
      x.stroke();
    }
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    /* 半球(内面可见):SphereGeometry 半球,开口朝上 */
    var bowl = new THREE.Mesh(
      new THREE.SphereGeometry(D.R, 48, 28, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.55, side: THREE.BackSide }));
    bowl.position.y = cy;
    g.add(bowl);
    /* 釜口缘(唇,十二辰位环) */
    g.add(P.torus(D.R, 0.035, M3.bronze, 0, cy, 0, 56));
    return { group: g, anchor: mkAnchor(0, cy + 0.2, 0) };
  }

  /* 璇玑板:球心十字架 + 针孔(「窾纳芥」) */
  function buildXuanji() {
    var g = group();
    var cy = D.brickH + 0.10;
    var mat = new THREE.MeshStandardMaterial({ color: 0x9A7B44, metalness: 0.7, roughness: 0.4 });
    g.add(P.box(0.46, 0.014, 0.02, mat, 0, cy, 0));
    g.add(P.box(0.02, 0.014, 0.46, mat, 0, cy, 0));
    g.add(P.box(0.02, 0.30, 0.02, mat, 0, cy - 0.15, 0));     // 下悬杆
    var hole = P.sph(0.012, M3.gold, 0, cy, 0);               // 针孔
    g.add(hole);
    return { group: g, anchor: mkAnchor(0.15, cy + 0.15, 0) };
  }

  /* 日像(亮斑贴内壁)+ 光线束(tick 球面定位) */
  function buildImage() {
    var g = group();
    var img = P.sph(D.imgDia, new THREE.MeshBasicMaterial({ color: 0xFFE9A8 }), 0, 0, 0);
    img.castShadow = false;
    g.add(img);
    var beam = P.cyl(0.008, 0.008, 1.0, new THREE.MeshBasicMaterial({ color: 0xF2C14E, transparent: true, opacity: 0.5 }),
      0, 0, 0, 6);
    beam.castShadow = false;
    g.add(beam);
    g.userData.anim = { img: img, beam: beam };
    return { group: g, anchor: mkAnchor(0, 0.9, 0) };
  }

  /* 十二辰唇标(北上下…) */
  function buildChen() {
    var g = group();
    var cy = D.brickH + 0.10;
    var names = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
    for (var i = 0; i < 12; i++) {
      var a = i / 12 * Math.PI * 2;
      g.add(P.box(0.10, 0.10, 0.02, M3.paper, Math.sin(a) * (D.R + 0.05), cy + 0.05, Math.cos(a) * (D.R + 0.05)));
      g.add(P.box(0.04, 0.04, 0.01, M3.iron, Math.sin(a) * (D.R - 0.06), cy + 0.02, Math.cos(a) * (D.R - 0.06)));
    }
    return { group: g, anchor: mkAnchor(0, cy + 0.2, D.R + 0.05) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "platform", name: "PLATFORM · 砖台", sub: "「置于砖台」· 四阶", phase: 0, at: 0.2, dur: 1.2,
      build: buildPlatform, target: [0, 0, 0], start: [0, 2.6, 1.4], mid: [0, 1.5, 0.7], anchor: [0, 0.9, 1.9] });
    def({ id: "bowl", name: "BOWL · 铜釜(内壁网格)", sub: "形若釜 · R1.5m · 周天度", phase: 1, at: 5.3, dur: 1.4, kind: "kine",
      build: buildBowl, target: [0, 0, 0], off: [0.8, 2.2, 1.2] });
    def({ id: "chen", name: "CHEN · 十二辰唇标", sub: "「唇列十二辰位」", phase: 1, at: 6.7, dur: 1.1,
      build: buildChen, target: [0, 0, 0], start: [0, 2.8, 1.0], mid: [0, 1.6, 0.5], anchor: [0, D.brickH + 0.3, D.R + 0.05] });

    def({ id: "xuanji", name: "XUANJI · 璇玑板针孔", sub: "「窾纳芥也」· 球心", phase: 2, at: 10.3, dur: 1.3,
      build: buildXuanji, target: [0, 0, 0], start: [0.3, 2.4, -0.5], mid: [0.15, 1.4, -0.25], anchor: [0, D.brickH + 0.25, 0] });
    def({ id: "image", name: "IMAGE · 日像·光线束", sub: "「视日透光,何度在也」", phase: 2, at: 11.5, dur: 1.2,
      build: buildImage, target: [0, 0, 0], start: [0, 2.2, 0.6], mid: [0, 1.2, 0.3], anchor: [0, 0.9, 0] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    var e = MECH.Parts.entry("image");
    if (e && e.shown && e.group.userData.anim) {
      var a = e.group.userData.anim;
      var cy = D.brickH + 0.10;
      /* 日像:自球心沿光线方向投内壁;
         光线方向 = (太阳方位反向的水平分量, −sin h);像点 = 球心 + R·d̂ */
      var h = Math.max(0.02, Math.PI / 2 - st.zenDist);
      var dAz = -st.azi;                            // 像方位与太阳相反
      var dx = Math.sin(dAz) * Math.cos(h);
      var dz = Math.cos(dAz) * Math.cos(h);
      var dy = -Math.sin(h);
      var px = dx * D.R, py = cy + dy * D.R, pz = dz * D.R;
      a.img.position.set(px, py, pz);
      /* 光束:球心(0,cy,0) → 像点 */
      var bl = D.R;
      a.beam.position.set(px / 2, cy + (py - cy) / 2, pz / 2);
      a.beam.scale.y = bl;
      a.beam.rotation.z = Math.atan2(px, -(py - cy));
      a.beam.rotation.x = Math.atan2(pz, Math.hypot(px, py - cy));
    }
  };
})(window.MECH = window.MECH || {});
