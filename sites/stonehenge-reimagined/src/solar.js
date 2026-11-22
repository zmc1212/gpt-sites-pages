/* 太阳天文模型 —— 简化但物理严谨的太阳位置计算
 *
 * 采用 Spencer(1975) 太阳赤纬傅里叶级数(误差 < 0.5°)+ 标准大气折射修正
 * (日出/日落定义为太阳几何中心高度角 = -0.833°,即上缘触地 + 34' 折射 + 16' 视半径)。
 * 时间轴一律使用「当地太阳时」(solar time):正午 12:00 太阳恰在正南,
 * 避免时区/均时差的叙事干扰,信息卡中另行说明。
 *
 * 巨石阵纬度 51.179°N,经度 1.826°W;中轴线方位角 ≈ 49.3°(NE)/ 229.3°(SW)。
 */
(function (global) {
  'use strict';

  var LAT = 51.179;                 // 巨石阵纬度(度)
  var AXIS_AZ = 49.3;               // 中轴线方位角(夏至日出方向,自正北顺时针)
  var REFRACT_ALT = -0.833;         // 日出/日落:几何中心高度角(含折射与视半径)

  // 太阳赤纬(弧度),Spencer 1975
  function declination(doy) {
    var g = 2 * Math.PI * (doy - 1) / 365;
    return 0.006918
      - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g)
      - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g)
      - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  }

  // 均时差(分钟),Spencer 1975 —— 仅用于展示性文字,时间轴仍是太阳时
  function eqOfTime(doy) {
    var g = 2 * Math.PI * (doy - 1) / 365;
    return 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
      - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  }

  /* 太阳位置。doy 1..365,solarHours 当地太阳时 0..24(可为小数)
   * 返回 { alt, az }:高度角/方位角(度),方位角自正北起顺时针(0=北 90=东 180=南 270=西) */
  function sunPos(doy, solarHours, latDeg) {
    var lat = (latDeg === undefined ? LAT : latDeg) * Math.PI / 180;
    var d = declination(doy);
    var H = (solarHours - 12) * 15 * Math.PI / 180;
    var sinAlt = Math.sin(lat) * Math.sin(d) + Math.cos(lat) * Math.cos(d) * Math.cos(H);
    sinAlt = Math.max(-1, Math.min(1, sinAlt));
    var alt = Math.asin(sinAlt);
    var cosAz = (Math.sin(d) - sinAlt * Math.sin(lat)) / (Math.cos(alt) * Math.cos(lat));
    cosAz = Math.max(-1, Math.min(1, cosAz));
    var az = Math.acos(cosAz) * 180 / Math.PI;   // 0..180,午前在东侧
    if (H > 0) az = 360 - az;                    // 午后转到西侧
    return { alt: alt * 180 / Math.PI, az: az };
  }

  /* 在某日内求解高度角首次跨越 targetAlt 的太阳时(升,fromAlt<targetAlt)。
   * 二分:太阳时 0..24 内高度角是单峰(正午最大),先粗扫找跨越区间再二分。 */
  function timeOfAlt(doy, targetAlt, rising, latDeg) {
    var n = 24 * 12, i, a, b, prev, cur;
    prev = sunPos(doy, 0, latDeg).alt;
    for (i = 1; i <= n; i++) {
      cur = sunPos(doy, i / 12, latDeg).alt;
      if (rising && prev < targetAlt && cur >= targetAlt) { a = (i - 1) / 12; b = i / 12; return bisect(doy, a, b, targetAlt, latDeg); }
      if (!rising && prev > targetAlt && cur <= targetAlt) { a = (i - 1) / 12; b = i / 12; return bisect(doy, a, b, targetAlt, latDeg); }
      prev = cur;
    }
    return null; // 极昼/极夜(本纬度不会发生)
  }
  function bisect(doy, a, b, targetAlt, latDeg) {
    var m, k;
    for (k = 0; k < 30; k++) {
      m = (a + b) / 2;
      if ((sunPos(doy, m, latDeg).alt - targetAlt) * (sunPos(doy, a, latDeg).alt - targetAlt) > 0) a = m; else b = m;
    }
    return (a + b) / 2;
  }

  function sunrise(doy, latDeg) { return timeOfAlt(doy, REFRACT_ALT, true, latDeg); }
  function sunset(doy, latDeg) { return timeOfAlt(doy, REFRACT_ALT, false, latDeg); }
  function noon(doy) { return 12; } // 太阳时下恒为 12:00

  /* 求某日太阳达到指定高度角的时刻;rising=true 取早晨升段,false 取傍晚降段 */
  function timeAtAlt(doy, altDeg, rising, latDeg) {
    var t = timeOfAlt(doy, altDeg, rising !== false, latDeg);
    if (t !== null) return t;
    return timeOfAlt(doy, altDeg, rising === undefined ? true : !rising, latDeg);
  }

  /* 节气近似:doy → 最近的主要节气/分点名称(只标注八方位)。 */
  var TERMS = [
    { doy: 80, name: '春分' }, { doy: 173, name: '夏至' }, { doy: 266, name: '秋分' }, { doy: 355, name: '冬至' }
  ];
  function nearestTerm(doy) {
    var best = null, bd = 1e9, i, d;
    for (i = 0; i < TERMS.length; i++) {
      d = Math.abs(doy - TERMS[i].doy);
      if (d > 182) d = 365 - d;
      if (d < bd) { bd = d; best = TERMS[i]; }
    }
    return { name: best.name, dist: bd };
  }

  var MONS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  var MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function fmtDate(doy) {
    var rest = Math.min(365, Math.max(1, Math.round(doy))), m = 0;
    while (m < 11 && rest > MDAYS[m]) { rest -= MDAYS[m]; m++; }
    return MONS[m] + rest + '日';
  }
  function fmtHours(h) {
    if (h === null || h === undefined) return '--:--';
    var hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    if (mm === 60) { hh++; mm = 0; }
    return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
  }

  /* 太阳方向向量(世界坐标)。约定:+X=东,+Z=南,-Z=北,-Y=下。
   * 由方位角 az(自北顺时针)与高度角 alt 得出指向太阳的单位向量。 */
  function dirFromAltAz(altDeg, azDeg) {
    var alt = altDeg * Math.PI / 180, az = azDeg * Math.PI / 180;
    var x = Math.cos(alt) * Math.sin(az);        // 东分量
    var y = Math.sin(alt);                        // 上
    var z = -Math.cos(alt) * Math.cos(az);        // 北为 -Z
    return new THREE.Vector3(x, y, z);
  }

  global.STSolar = {
    LAT: LAT, AXIS_AZ: AXIS_AZ, REFRACT_ALT: REFRACT_ALT,
    declination: declination, eqOfTime: eqOfTime, sunPos: sunPos,
    sunrise: sunrise, sunset: sunset, noon: noon, timeAtAlt: timeAtAlt,
    nearestTerm: nearestTerm, fmtDate: fmtDate, fmtHours: fmtHours,
    dirFromAltAz: dirFromAltAz
  };
})(window);
