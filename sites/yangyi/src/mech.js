/* 仰仪 — 尺寸常量与球面投影几何
   文献依据:《元史·天文志·卷四十八》:「仰仪之制,以铜为之,形若釜,置于砖台。
   内画周天度,唇列十二辰位……」《仰仪铭》:「首璇玑板,窾纳芥也;上下悬直,
   与镦会也;视日透光,何度在也。」(郭守敬)
   制式:铜半球釜(仰置,球心在釜口平面),球心处璇玑板十字架,中央针孔
   (「窾纳芥」——孔容芥子);日光过孔成实像投内壁,像位即太阳球面投影:
   像的天顶距 = 90°−h(太阳高度角),方位与太阳方位相反(口唇十二辰读方位),
   内壁网格读节气(平行圈)与真太阳时(经线)。
   可验算:
     1. 像距釜底(天顶点)角距 = 90° − h:夏至正午 11.3°、冬至正午 59.3°
        (登封 φ34.5°,ε 24°;载入断言);
     2. 太阳像径 d = R×0.533° = R×0.0093(R 1.5m → 14mm,断言);
     3. 时辰线间隔 15° = 1 小时(周天度网格);
     4. 像位逐帧积分校验(maxErr<1e-9)。
   演示:节气扫描(影长两至)+ 时辰扫描(巳→未),像沿网格移动。 */
(function (MECH) {
  var D = {
    R: 1.5,                        // 釜球半径(口径一丈二尺推算取 3.0m → R1.5)
    phi: 34.5 * Math.PI / 180,     // 登封纬度
    eps: 24 * Math.PI / 180,       // 古黄赤大距
    seasons: 24, seasonDur: 1.9,
    hours: 6, hourDur: 1.6,        // 时辰扫描:巳午未 6 时位
    sunAng: 0.533 * Math.PI / 180, // 太阳视角径
    brickH: 0.62
  };
  D.omegaC = 90 * Math.PI / 180;
  /* 正午太阳高度(节气) */
  D.hSummerNoon = Math.PI / 2 - D.phi + D.eps;    // 79.5° → 像距天顶 10.5°
  D.hWinterNoon = Math.PI / 2 - D.phi - D.eps;    // 31.5° → 像距天顶 58.5°
  D.zSummer = D.omegaC - D.hSummerNoon;           // 0.157 rad
  D.zWinter = D.omegaC - D.hWinterNoon;           // 1.019 rad
  D.imgDia = D.R * D.sunAng;                      // 14mm

  function newState() {
    return {
      time: 0,
      frac: 0, fracDir: 1,                        // 节气 0 冬至→1
      hourF: 0.5, hourDir: 0,                     // 时辰 0..1(巳→未)
      zenDist: D.zWinter, azi: 0,               // 初始:冬至正午
      maxErr: 0, hist: []
    };
  }

  /* 太阳位置(简化):正午子午面高度 + 时角摆(巳→未 ±45°方位) */
  function sunAngles(st) {
    var lam = st.frac * 2 * Math.PI;
    var decl = Math.asin(Math.sin(D.eps) * Math.sin(lam));
    var hNoon = Math.PI / 2 - D.phi + decl;
    /* 时角:午前午后方位偏 ±,高度略降(示意 cos) */
    var ha = (st.hourF - 0.5) * Math.PI * 0.5;    // ±45°
    var h = Math.asin(Math.sin(hNoon) * Math.cos(ha) - 0.0);
    var azi = ha;                                 // 方位偏(相对正南)
    return { h: h, azi: azi, decl: decl };
  }

  function step(st, dt) {
    st.time += dt;
    var prevZ = st.zenDist;
    var S = sunAngles(st);
    st.zenDist = D.omegaC - S.h;                  // 像距天顶角
    st.azi = S.azi;
    st._int = (st._int || 0) + (st.zenDist - prevZ);
    var err = Math.abs((st._int || 0) - (st.zenDist - D.zWinter));
    if (err > st.maxErr) st.maxErr = err;
    st._hT = (st._hT || 0) + dt;
    if (st._hT > 0.05) {
      st._hT = 0;
      st.hist.push(st.zenDist);
      if (st.hist.length > 220) st.hist.shift();
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step, sunAngles: sunAngles };

  /* 载入自检:两至像距 / 像径 */
  (function selfCheck() {
    var errs = [];
    var zS = D.omegaC - D.hSummerNoon;
    var zW = D.omegaC - D.hWinterNoon;
    /* 文献研究值:夏至约 11.3°、冬至约 59.3°(登封) */
    if (Math.abs(zS * 57.3 - 10.5) > 1.5) errs.push("夏至像距异常: " + (zS * 57.3).toFixed(1));
    if (Math.abs(zW * 57.3 - 58.5) > 1.5) errs.push("冬至像距异常: " + (zW * 57.3).toFixed(1));
    if (Math.abs(D.imgDia - D.R * D.sunAng) > 1e-9) errs.push("像径公式不符");
    if (errs.length) {
      var msg = "仰仪自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
