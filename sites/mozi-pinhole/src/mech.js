/* 墨经小孔成像(暗室暗箱)— 光线直进 · 相似三角 · 半影 求解器
   文献依据:《墨经·经下》「景到,在午有端,与景长,说在端」/《经说下》
   「光之人,煦若射,下者之人也高;高者之人也下。足蔽下光,故成景于上;
   首蔽上光,故成景于下」;现代口径:谭戒甫《墨经分类译注》/ Needham
   《中国科学技术史》光学卷(小孔成像几何)。本站复原口径:
   - 物距 a(人立 a=110mm)、像距 b(屏在 b=60…150mm 滑动)、孔径 d(2…20mm);
   - 倒像:相似三角形 y′ = −y·b/a(足 y=−30 → 景于上),逐点光线追迹断言;
   - 半影:点物经孔径 d 在屏上的模糊圆直径 Δ = d·(a+b)/a(过孔缘双光线追迹断言);
   - 照度 ∝ d²(孔面积比);日像直径 ≈ b·tan0.53° + d(张角 0.53° 的日轮 + 孔径模糊);
   - 对照:西方 camera obscura(暗箱)同型几何,《墨经》早约两千年。 */
(function (MECH) {
  var K = 0.11;                        // 场景缩放:场景单位 = mm × K
  var A_FIG = 110;                     // 人到孔距离(物距)
  var A_TOWER = 165;                   // 塔物距
  var A_SUN = 240;                     // 日距离(示意,张角才是关键)
  var B_DEFAULT = 90;                  // 默认像距
  var B_RANGE = [60, 150];
  var D_DEFAULT = 5;                   // 默认孔径 mm
  var D_RANGE = [2, 20];
  var SUN_ANG = 0.53 * Math.PI / 180;  // 日轮视张角
  var FIG_H = 60, TOWER_H = 82;        // 物高 mm
  // 物点(足/首/塔尖/日)世界坐标(mm;x 负为孔外侧,z 横向)
  var PTS = {
    foot: [-A_FIG, -30, 0],
    head: [-A_FIG, 30, 0],
    tower: [-A_TOWER, 52, -34],
    sun: [-A_SUN, 42, 20]
  };

  /* —— 求解 —— */
  // 倒像位置:y′ = −y·b/a(过孔中心的几何像点)
  function imgY(y, a, b) { return -y * b / a; }
  // 点物经孔径 d 的屏上半影直径:Δ = d·(a+b)/a
  function penumbra(d, a, b) { return d * (a + b) / a; }
  // 过孔缘 (0,Δy) 的光线:自屏点 (b,y′) 逆向到物平面 x=−a 的落点
  function objHit(yScreen, dyHole, a, b) {
    var t = (a + b) / b;
    return yScreen * (1 - t) + dyHole * t;   // = −y′·a/b + Δy·(a+b)/b
  }
  // 照度比 ∝ 孔面积:(d1/d2)²
  function lumRatio(d1, d2) { return (d1 * d1) / (d2 * d2); }
  // 日像直径 = b·tan(张角) + d(孔径模糊直接叠加,物距无穷大时半影= d)
  function sunImage(d, b) { return b * Math.tan(SUN_ANG) + d; }
  // 像长(景长)= 物长·b/a
  function imgLen(objLen, a, b) { return objLen * b / a; }
  // 屏上采样:屏点 yScreen 经孔内偏移 dyHole 到物平面的世界 y
  // (objHit 的正向形式,供贴图采样)
  function sampleObjY(yScreen, dyHole, a, b) { return objHit(yScreen, dyHole, a, b); }

  /* 光线折点(足/首 → 孔缘 → 屏),供可视化;与断言同解 */
  function rayTo(oy, dyHole, a, b) {
    // 从物点 (−a, oy) 穿过孔 (0, dyHole) 直线延伸至屏平面 x=b:y′
    var t = (b + a) / a;
    var ys = oy + (dyHole - oy) * t;       // 屏上落点
    return { ys: ys, pts: [[-a, oy], [0, dyHole], [b, ys]] };
  }

  var newState = function () {
    return { run: 0, lastPhase: "", a: A_FIG, b: B_DEFAULT, d: D_DEFAULT,
             figDX: 0, screenA: 0, imgKey: "" };
  };
  var step = function (st, dt) { st.run += dt; };

  MECH.FOG = [34, 92];
  MECH.SHADOW_BOX = 22;
  MECH.FOV = 42;
  MECH.DIM = {
    K: K, A_FIG: A_FIG, A_TOWER: A_TOWER, A_SUN: A_SUN,
    B_DEFAULT: B_DEFAULT, B_RANGE: B_RANGE, D_DEFAULT: D_DEFAULT, D_RANGE: D_RANGE,
    SUN_ANG: SUN_ANG, FIG_H: FIG_H, TOWER_H: TOWER_H, PTS: PTS,
    WALL_X: 0, SCREEN_Z: 42, INT_BACK: 175
  };
  MECH.KS = {
    newState: newState, step: step,
    imgY: imgY, penumbra: penumbra, objHit: objHit, lumRatio: lumRatio,
    sunImage: sunImage, imgLen: imgLen, rayTo: rayTo
  };

  /* —— 载入期自检:相似三角/半影/照度/日像 逐条断言 —— */
  (function selfCheck() {
    function fail(msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
    function near(a, b, tol, msg) {
      if (!(Math.abs(a - b) <= tol)) fail(msg + ": got " + a + " expect " + b);
    }
    var a = A_FIG, b = B_DEFAULT;
    // 1) 相似三角倒像:足/首/塔尖 三点,追迹过孔中心与公式一致
    [["foot", -30], ["head", 30], ["tower", 52]].forEach(function (it) {
      var r = rayTo(it[1], 0, a, b);
      near(r.ys, imgY(it[1], a, b), 1e-9, "倒像位置 @" + it[0]);
    });
    // 2) 倒像符号:足(y=−30)之景于上(y′>0),首之景于下(经说下)
    if (!(imgY(-30, a, b) > 0 && imgY(30, a, b) < 0)) fail("倒像方向不符(足上首下)");
    near(imgY(-30, a, b), 30 * b / a, 1e-9, "足之景高");
    // 3) 半影 Δ = d(a+b)/a:双孔缘光线落点间距
    var d = D_DEFAULT;
    var r1 = rayTo(-30, d / 2, a, b), r2 = rayTo(-30, -d / 2, a, b);
    near(Math.abs(r1.ys - r2.ys), penumbra(d, a, b), 1e-9, "半影直径(追迹)");
    near(penumbra(d, a, b), d * (a + b) / a, 1e-9, "半影公式");
    // 4) 照度比 ∝ d²:两孔径面积比
    near(lumRatio(10, 20), 0.25, 1e-9, "照度比 (10/20)²");
    near(lumRatio(4, 10), 0.16, 1e-9, "照度比 (4/10)²");
    // 5) 日像直径 ≈ b·tan0.53° + d
    near(sunImage(5, 90), 90 * 0.00925 + 5, 0.05, "日像直径");
    near(sunImage(5, 90), 5.83, 0.05, "日像直径数值");
    // 6) 景长 = 物长·b/a(经下「与景长」)
    near(imgLen(FIG_H, a, b), FIG_H * b / a, 1e-9, "景长");
    near(imgLen(60, 110, 90), 49.09, 0.01, "景长数值");
    // 7) 行人位移映射:Δy′ = −Δy·b/a
    var dy = 12;
    near(imgY(20 + dy, a, b) - imgY(20, a, b), -dy * b / a, 1e-9, "行走反向映射");
    // 8) 像距滑动:像随 b 增大而变大(单调)
    if (!(imgLen(60, a, 150) > imgLen(60, a, 60))) fail("像距增大像应变大");
  })();
})(window.MECH = window.MECH || {});
