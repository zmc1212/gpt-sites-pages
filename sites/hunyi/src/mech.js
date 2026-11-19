/* 浑仪 — 尺寸常量与指向运动学求解器
   文献依据:明正统浑仪(现存南京紫金山天文台)·《宋史·天文志》浑仪法要——
   六合仪(固定:子午双环+地平环)定仪,三辰仪绕极轴周天(赤道环+黄道环+
   二至圈),四游环携窥管指任意赤经赤纬。

   指向运动学(载入期断言):
     极轴倾角 T = 90° − 纬度(北京 39.9°)→ 50.1°(严格)
     极轴方向 n = (0, sinT, cosT)(北 = +z,上 = +y)
     赤道环法向 = n;黄道环法向 = (0, sin(T+23.5°), cos(T+23.5°))
     三辰转角 α:二至圈/四游环法向 m(α) = x̂·cosα + (n×x̂)·sinα
     窥管指向 d(α,δ) = m·cosδ + n·sinδ
     断言:T = 50.1° 严格、窥管长 0.90、球心高 1.45、d 为单位向量。
   坐标系:y 上,+z 北。全部几何位于地面之上(基座 0.22,球心 1.45)。 */
(function (MECH) {
  var D = {
    T: 50.1,                                   // 极轴倾角(度)
    hubY: 1.45,                                // 球心高
    RMeridian: 1.05, RHorizon: 1.05,           // 六合仪
    REquator: 0.88, REcliptic: 0.80, RSolstice: 0.86,
    RFour: 0.68, tubeL: 0.90, tubeR: 0.045,
    obliq: 23.5,                               // 黄赤交角
    omega: 0.59,                               // 三辰周天角速度(演示)
    alphaVega: 280 * Math.PI / 180,            // 织女星赤经
    deltaVega: 38.8 * Math.PI / 180,           // 织女星赤纬
    starDist: 2.3,
    baseH: 0.22
  };
  D.Trad = D.T * Math.PI / 180;

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 方向解算(纯函数,返回 [x,y,z]) */
  function polarAxis() { return [0, Math.sin(D.Trad), Math.cos(D.Trad)]; }
  function eclipticNormal() {
    var t2 = rad(D.T + D.obliq);
    return [0, Math.sin(t2), Math.cos(t2)];
  }
  /* 三辰转角 α → 二至圈/四游环法向 */
  function solsticeNormal(alpha) {
    var n = polarAxis();
    /* m(α) = x̂·cosα + (n×x̂)·sinα,n×x̂ = (0, nz, −ny) */
    return [Math.cos(alpha), n[2] * Math.sin(alpha), -n[1] * Math.sin(alpha)];
  }
  /* 窥管指向 d = m·cosδ + n·sinδ(单位向量) */
  function aimDir(alpha, delta) {
    var m = solsticeNormal(alpha), n = polarAxis();
    var cd = Math.cos(delta), sd = Math.sin(delta);
    return [m[0] * cd + n[0] * sd, m[1] * cd + n[1] * sd, m[2] * cd + n[2] * sd];
  }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp,
    polarAxis: polarAxis, eclipticNormal: eclipticNormal,
    solsticeNormal: solsticeNormal, aimDir: aimDir };

  /* 载入期自检 */
  (function selfCheck() {
    var msg = null;
    if (Math.abs(D.Trad - rad(50.1)) > 1e-12) {
      msg = "浑仪极轴倾角自检失败: T = " + D.T + " ≠ 50.1";
    } else if (Math.abs(D.tubeL - 0.90) > 1e-9) {
      msg = "浑仪窥管自检失败: 管长 ≠ 0.90";
    } else {
      var n = polarAxis();
      var len = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
      if (Math.abs(len - 1) > 1e-9) msg = "浑仪极轴向量自检失败: |n| ≠ 1";
      else {
        var m = solsticeNormal(Math.PI / 3);
        var lm = Math.sqrt(m[0] * m[0] + m[1] * m[1] + m[2] * m[2]);
        if (Math.abs(lm - 1) > 1e-9) msg = "浑仪三辰法向自检失败: |m| ≠ 1";
        else {
          var d = aimDir(Math.PI / 3, rad(38.8));
          var ld = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
          if (Math.abs(ld - 1) > 1e-9) msg = "浑仪窥管指向自检失败: |d| ≠ 1";
        }
      }
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
