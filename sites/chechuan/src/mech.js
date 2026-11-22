/* 车船 — 尺寸常量与明轮不滑移运动学求解器
   文献依据:《旧唐书·李皋传》「常运心巧思为战舰,挟二轮蹈之,翔风鼓浪,
   疾若挂帆席」——船内踏板曲柄经链传动双明轮,桨轮击水行船。

   运动学(载入期断言):
     明轮 r = 0.55(8 桨 ×2,两侧 z ±0.72),轮轴高 0.62(浸水 0.05)
     踏板曲柄 r踏 = 0.12 → 行程 0.24(双曲柄 180° 反相)
     链传动同径链轮 i = 1:ω轮 = ω踏轴
     不滑移船速 v = ω轮·r = 0.9 × 0.55 = 0.495 m/s ∈ (0.4, 0.6)
     航程 = ∫v dt(船体平移,根节点 root.x)
     断言:v ∈ (0.4,0.6)、浸深 0.05 严格、踏板行程 0.24 严格。
   坐标系:y 上,x 船首(+x 前进),船体绕根节点(root.x 平移);
   水面 y 0.12(世界件),船底浮于水面。全部几何在地面之上。 */
(function (MECH) {
  var D = {
    rWheel: 0.55, wheelY: 0.62, wheelZ: 0.72, NP: 8,
    rTread: 0.12, treadY: 0.85, treadX: 0.30, treadZ: 0.72,
    sprocketR: 0.10, chainZ0: 0.72,
    hullL: 2.6, hullH: 0.34, hullY0: 0.12,
    waterY: 0.12,
    omega: 0.9,
    dip: 0.05,
    flagH: 2.05,
    vSail: 0.495
  };
  D.vSail = D.omega * D.rWheel;                    // 0.495
  D.strokeTread = 2 * D.rTread;                    // 0.24
  D.wheelBottom = D.wheelY - D.rWheel;             // 0.07
  D.dip = D.waterY - D.wheelBottom;                // 0.05

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 航行速度脚本(纯函数):坡起 → 恒速 → 减速 */
  function sailV(ph, pt) {
    if (ph.id === "sail") {
      var u = KS.clamp(pt / 1.5, 0, 1);
      if (u < 1) return D.omega * u * u;           // τ² 坡起
      return D.omega;
    }
    if (ph.id === "cruise") {
      return D.omega;
    }
    return 0;
  }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp, sailV: sailV };

  /* 载入期自检 */
  (function selfCheck() {
    var msg = null;
    if (!(D.vSail > 0.4 && D.vSail < 0.6)) {
      msg = "车船船速自检失败: v = " + D.vSail + " ∉ (0.4, 0.6)";
    } else if (Math.abs(D.dip - 0.05) > 1e-9) {
      msg = "车船浸深自检失败: " + D.dip + " ≠ 0.05";
    } else if (Math.abs(D.strokeTread - 0.24) > 1e-9) {
      msg = "车船踏板行程自检失败: 2r踏 = " + D.strokeTread + " ≠ 0.24";
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
