/* 圭表部件建模与注册(6 件)。
   布局:圭(石尺)沿 x 南向(x− 为南),北端 x0=0.35 处立八尺表;
   影影(暗影盒,长度=shadow,由 tick 经 userData.anim 驱动 scale.x);
   日(太阳示位球,沿东-天顶-西弧随节气移动);廿四气刻度贴圭面;
   水槽(圭面校平槽,文献记载的圭面水平槽)。
   kine:无转动件(几何+标量);日位/影长为位移驱动。
   标签锚点:build 返回 anchor。 */
(function (MECH) {
  var P = MECH.P, M3 = null, D = MECH.DIM, KS = MECH.KS;

  function group() { return new THREE.Group(); }
  function mkAnchor(x, y, z) {
    var o = new THREE.Object3D();
    o.position.set(x, y, z);
    o.userData.tagAnchor = new THREE.Vector3(0, 0, 0);
    return o;
  }

  /* 圭:石尺(南向)+ 刻度纹理 + 侧标尺 */
  function buildGui() {
    var g = group();
    g.add(P.box(D.guL + 0.4, 0.22, 0.62, new THREE.MeshStandardMaterial({ color: 0x54575C, roughness: 0.94 }),
      -D.guL / 2 + 0.35, 0.11, 0));
    var c = document.createElement("canvas");
    c.width = 1024; c.height = 64;
    var x = c.getContext("2d");
    x.fillStyle = "#C9BFA8"; x.fillRect(0, 0, 1024, 64);
    x.strokeStyle = "#3A3E45"; x.lineWidth = 2;
    for (var i = 0; i <= 35; i++) {
      var px = i / 35 * 1000 + 12;
      x.beginPath(); x.moveTo(px, 8); x.lineTo(px, i % 5 === 0 ? 52 : 32); x.stroke();
      if (i % 5 === 0) {
        x.fillStyle = "#3A3E45";
        x.font = "700 14px serif"; x.textAlign = "center";
        x.fillText((i / 5 | 0) + "尺", px, 16);
      }
    }
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    var top = P.mesh(new THREE.PlaneGeometry(D.guL, 0.5),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), -D.guL / 2 + 0.35, 0.223, 0);
    top.rotation.x = -Math.PI / 2;
    top.castShadow = false;
    g.add(top);
    /* 水槽(校平槽,两侧) */
    [-1, 1].forEach(function (s) {
      g.add(P.box(D.guL + 0.3, 0.05, 0.06, M3.woodD, -D.guL / 2 + 0.35, 0.20, s * 0.27));
    });
    return { group: g, anchor: mkAnchor(-D.guL * 0.55, 0.4, 0) };
  }

  /* 八尺表:石座 + 铜柱(北端) */
  function buildBiao() {
    var g = group();
    g.add(P.box(0.5, 0.30, 0.5, new THREE.MeshStandardMaterial({ color: 0x54575C, roughness: 0.94 }), 0.30, 0.15, 0));
    g.add(P.cyl(0.055, 0.065, D.H - 0.28, new THREE.MeshStandardMaterial({ color: 0x9A7B44, metalness: 0.7, roughness: 0.4 }),
      0.30, 0.30 + (D.H - 0.28) / 2, 0, 14));
    g.add(P.sph(0.045, M3.bronze, 0.30, D.H + 0.04, 0));
    return { group: g, anchor: mkAnchor(0.30, D.H + 0.15, 0) };
  }

  /* 晷影:表根南伸暗影盒(tick scale.x/position.x) */
  function buildShadow() {
    var g = group();
    var mat = new THREE.MeshStandardMaterial({ color: 0x181B20, roughness: 0.95, transparent: true, opacity: 0.72 });
    var sh = P.box(1.0, 0.012, 0.30, mat, 0, 0.231, 0);
    sh.castShadow = false;
    g.add(sh);
    var cursor = P.box(0.05, 0.03, 0.34, M3.gold, 0, 0.24, 0);   // 影端游标
    g.add(cursor);
    g.userData.anim = { sh: sh, cursor: cursor };
    return { group: g, anchor: mkAnchor(0.0, 0.35, 0) };
  }

  /* 日(示位球,东-顶-西弧)+ 光线(tick 摆放) */
  function buildSun() {
    var g = group();
    var sun = P.sph(0.14, new THREE.MeshBasicMaterial({ color: 0xF2C14E }), 0, 3.4, 0);
    g.add(sun);
    var ray = P.cyl(0.012, 0.012, 4.2, new THREE.MeshBasicMaterial({ color: 0xF2C14E, transparent: true, opacity: 0.4 }),
      0, 1.9, 0, 6);
    ray.castShadow = false;
    g.add(ray);
    g.userData.anim = { sun: sun, ray: ray };
    return { group: g, anchor: mkAnchor(0, 3.6, 0) };
  }

  /* 廿四气标(圭侧小牌,冬至/夏至大标) */
  function buildMarks() {
    var g = group();
    var names = ["冬至", "小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种",
                 "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪"];
    for (var i = 0; i < 24; i++) {
      var f = i / 24;                                   // 冬至起
      var L = KS.shadowLen(f);
      var px = 0.30 - L;
      if (px < -D.guL + 0.1) continue;
      var major = (i === 0 || i === 12);
      g.add(P.box(major ? 0.03 : 0.015, major ? 0.16 : 0.08, 0.02, M3.gold,
        px, 0.30, 0.36 + (major ? 0 : 0.05)));
    }
    return { group: g, anchor: mkAnchor(-2.9, 0.45, 0.36) };
  }

  /* —— 注册 —— */
  MECH.PART_DEFS = function () {
    M3 = MECH.Scene3D.M;
    function def(o) { return MECH._def(o); }

    def({ id: "gui", name: "GUI · 圭(量天尺)", sub: "南向石尺 3.5m · 刻度+水槽", phase: 0, at: 0.2, dur: 1.2,
      build: buildGui, target: [0, 0, 0], start: [0, 2.8, 1.2], mid: [0, 1.5, 0.6], anchor: [0, 0.5, 0] });
    def({ id: "biao", name: "BIAO · 八尺表", sub: "「周髀长八尺」1.848m", phase: 0, at: 1.0, dur: 1.2,
      build: buildBiao, target: [0, 0, 0], start: [0.5, 3.2, -0.8], mid: [0.4, 1.8, -0.4], anchor: [0.3, 2.0, 0] });
    def({ id: "marks", name: "MARKS · 廿四气标", sub: "冬至起 每气一位", phase: 1, at: 5.3, dur: 1.2,
      build: buildMarks, target: [0, 0, 0], start: [0, 2.4, 1.0], mid: [0, 1.2, 0.5], anchor: [-2.9, 0.5, 0.36] });

    def({ id: "shadow", name: "SHADOW · 晷影", sub: "L = H/tan(h) · 游标", phase: 2, at: 10.3, dur: 1.2,
      build: buildShadow, target: [0, 0, 0], start: [0, 1.8, 0.6], mid: [0, 0.9, 0.3], anchor: [0, 0.4, 0] });
    def({ id: "sun", name: "SUN · 示日", sub: "正午太阳弧 · 随节气", phase: 2, at: 11.4, dur: 1.2,
      build: buildSun, target: [0, 0, 0], start: [-2.6, 2.6, 1.2], mid: [-1.4, 2.6, 0.6], anchor: [0, 3.7, 0] });
  };

  /* —— 运动学分发(每帧) —— */
  MECH.KINE = function (st) {
    /* 影长与游标 */
    var e = MECH.Parts.entry("shadow");
    if (e && e.shown && e.group.userData.anim) {
      var a = e.group.userData.anim;
      var L = Math.min(st.shadow, D.guL);
      a.sh.scale.x = L;
      a.sh.position.x = 0.30 - L / 2;
      a.cursor.position.x = 0.30 - L;
    }
    /* 示日与光线:正午太阳在子午面(z=0 竖面)内,方位固定正南 */
    e = MECH.Parts.entry("sun");
    if (e && e.shown && e.group.userData.anim) {
      var b = e.group.userData.anim;
      var h = st.alt;
      var R = 3.3;
      /* 太阳位:从表顶起,沿高度角方向(南面) */
      var sx = 0.30 - Math.cos(h) * R;
      var sy = D.H + Math.sin(h) * R;
      b.sun.position.set(sx, sy, 0);
      /* 光线:从日到表顶 */
      var rayLen = R;
      b.ray.position.set((sx + 0.30) / 2, (sy + D.H) / 2, 0);
      b.ray.scale.y = rayLen / 4.2;
      b.ray.rotation.z = Math.atan2(sy - D.H, sx - 0.30) - Math.PI / 2;
    }
  };
})(window.MECH = window.MECH || {});
