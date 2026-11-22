/* 水运浑天仪 — 尺寸常量与三级齿轮减速运动学求解器
   文献依据:《晋书·天文志》载张衡漏水转浑天仪「以漏水转之于殿上室内,
   星中出没与天相应……又作瑞轮蓂荚……随月盈虚,依历开落」——
   漏壶恒流注水轮,齿轮系减速,浑象一转即一日,蓂荚十五叶按日升落。

   增速/减速运动学(载入期断言):
     三级齿轮:3.5(28T/8T)× 4(32T/8T)× 2(16T/8T)= i = 28(严格)
     浑象一转 = 一日 = 86400s;演示时间加速 ×1200 → 浑象周期 72.0s(严格)
     水轮 ω轮 = i × ω浑 = 28 × 2π/72 = 2.443 rad/s
     蓂荚 ω = ω浑 / 15(15 叶,每 4.8s 升一叶)
     断言:i = 28 严格、浑象周期×1200 = 86400(±1e-6)、蓂荚周期 4.8s。
   坐标系:y 上;水轮轴沿 z(轮面 x-y,轮心 (−1.35, 0.52, 0));齿轮系沿 z 排开;
   浑象球心 (1.30, 1.42, 0),极轴倾 50.1°(与浑仪站一致)。全部几何在地面之上。 */
(function (MECH) {
  var D = {
    /* 水轮 */
    RWheel: 0.38, wheelY: 0.52, wheelX: -1.35, NP: 8,
    /* 齿轮系(轴沿 z,z 排开) */
    gears: [
      { z: -0.55, r: 0.30, T: 28, shaft: "A" },   // 轮1:水轮轴
      { z: -0.28, r: 0.098, T: 8, shaft: "B" },   // 轮2:中间轴A(r比 3.5:1)
      { z: -0.06, r: 0.32, T: 32, shaft: "B" },   // 轮3:轴A(r 0.32 与轮2 同轴)
      { z: 0.22, r: 0.08, T: 8, shaft: "C" },     // 轮4:中间轴B(r比 4:1)
      { z: 0.44, r: 0.16, T: 16, shaft: "C" },    // 轮5:轴B(r 0.16 与轮4 同轴)
      { z: 0.70, r: 0.08, T: 8, shaft: "G" }      // 轮6:浑象轴(r比 2:1)
    ],
    stageRatios: [3.5, 4.0, 2.0],
    /* 浑象 */
    RGlobe: 0.52, globeX: 1.30, globeY: 1.42, tilt: 50.1,
    /* 蓂荚 */
    RLeaf: 0.30, leafN: 15, leafX: 2.20, leafY: 0.95,
    /* 漏壶 */
    potX: -2.30, potH: 0.78,
    /* 演示时间 */
    timeScale: 1200,
    daySeconds: 86400
  };
  D.iTotal = D.stageRatios[0] * D.stageRatios[1] * D.stageRatios[2];   // 28
  D.omegaGlobe = 2 * Math.PI / (D.daySeconds / D.timeScale);          // 2π/72
  D.omegaWheel = D.iTotal * D.omegaGlobe;                             // 2.443
  D.omegaLeaf = D.omegaGlobe / D.leafN;                               // 0.00582
  D.leafPeriod = 2 * Math.PI / D.leafN / D.omegaLeaf;                 // 4.8s
  D.globePeriod = D.daySeconds / D.timeScale;                         // 72.0

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp };

  /* 载入期自检 */
  (function selfCheck() {
    var msg = null;
    if (Math.abs(D.iTotal - 28) > 1e-9) {
      msg = "水运浑天仪减速比自检失败: i = " + D.iTotal + " ≠ 28";
    } else if (Math.abs(D.globePeriod * D.timeScale - D.daySeconds) > 1e-6) {
      msg = "水运浑天仪日转自检失败: 周期×加速 = " + (D.globePeriod * D.timeScale) + " ≠ 86400";
    } else if (Math.abs(D.leafPeriod - 4.8) > 0.01) {
      msg = "水运浑天仪蓂荚自检失败: 叶周期 " + D.leafPeriod.toFixed(2) + " ≠ 4.8";
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
