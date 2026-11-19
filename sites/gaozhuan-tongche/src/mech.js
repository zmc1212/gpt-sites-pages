/* 高转筒车 — 尺寸常量与链板运动学求解器
   文献依据:王祯《农书·灌溉图说》「高转筒车,其高以丈计……上轮下轮俱系轮辋,
   人力或水力转动下轮,则筒周而复始,递相倾侧,水自上槽注田」——双链轮等径、
   刮板小筒以等距挂链,下轮浸水、上轮倾注入渡槽。

   链运动学(载入期断言):
     链轮半径 R = 0.50(上/下同径,两竖直链段对齐)
     链行程 Ltot = 2·(yU − yL) + 2πR = 2·3.33 + 3.1416 = 9.80 m
     板距 pitch = Ltot / N(14 板)= 0.70 m(轮上弧距 1.40 rad = 80°)
     链速 v = ω·R(ω = 0.9 rad/s 下轮踏转)→ v = 0.45 m/s
     板位 s_i = (i·pitch + s) mod Ltot;s 为链行进距离 = ω·R·t
     断言 pitch·N ≈ Ltot(闭合),0.40 < v < 0.6。

   路径(s=0 于西竖段底,即下轮西切点,链上行方向为 s 增):
     seg0 西竖段上行:s ∈ [0, Lrun):      (xC − R, yL + s)
     seg1 上弧西→东(过顶):θ = π − u·π:  (xC + R·cosθ, yU + R·sinθ)
     seg2 东竖段下行:s ∈ [Lrun+Larc, 2Lrun+Larc)
     seg3 下弧东→西(浸水):θ = u·π:      (xC + R·cosθ, yL − R·sinθ)
     板恒竖直悬挂(重力对齐),弧段亦平移过——与"递相倾侧"示意一致。
   载水:板在下弧入水灌满,过顶倾入渡槽 —— 载水区 s ∈ [fillS, dumpS],
     dumpS = Lrun + 0.5·Larc(恰在上轮顶)。

   井渠几何全部位于全球地面 y=0 之上:渠底 0.06(不透明盖板)、水面 0.18、
   下轮浸深 0.06 m(轮缘底 0.12)、田面水 0.10。 */
(function (MECH) {
  var D = {
    /* 链轮与链(m) */
    R: 0.50,                 // 链轮半径(上/下同径)
    xC: -2.5,                // 轮心 x(两轮同轴面)
    yU: 3.95,                // 上轮轴高
    yL: 0.62,                // 下轮轴高
    NB: 14,                  // 刮板小筒数
    omega: 0.9,              // 下轮角速度 rad/s(踏转)
    wheelW: 0.14,            // 轮宽(z 向)
    /* 渠与田 */
    chX0: -3.6, chX1: -1.4,  // 渠宽 x
    chZ: 2.3,                // 渠半长 z
    waterY: 0.18, chFloor: 0.06, bankTop: 0.30,
    /* 渡槽与田 */
    trX0: -1.80, trY0: 4.23, trX1: 0.85, trY1: 4.08, trW: 0.30,
    paddyX: 1.95, paddyZ: 0.9, paddyW: 1.15, paddyD: 1.6, paddyWater: 0.10, paddyRim: 0.24,
    /* 摇柄 */
    crankArm: 0.38, crankX: -1.10
  };
  D.Lrun = D.yU - D.yL;                       // 3.33 竖段
  D.Larc = Math.PI * D.R;                     // 1.5708 弧段
  D.Ltot = 2 * D.Lrun + 2 * D.Larc;           // 9.802 链全长
  D.pitch = D.Ltot / D.NB;                    // 0.700 板距
  D.vChain = D.omega * D.R;                   // 0.45 链速
  D.liftH = D.Lrun;                           // 提水高 3.33
  D.dumpS = D.Lrun + 0.50 * D.Larc;           // 倾倒点(过顶即倾,水流入渡槽)
  D.fillS = 0.14 * D.Larc;                    // 灌满点(下弧入水后)

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 链路径:返回位置与段 id */
  function chainPos(s) {
    s = ((s % D.Ltot) + D.Ltot) % D.Ltot;
    if (s < D.Lrun) return { x: D.xC - D.R, y: D.yL + s, z: 0, seg: 0 };
    s -= D.Lrun;
    if (s < D.Larc) {
      var th = Math.PI - (s / D.Larc) * Math.PI;
      return { x: D.xC + D.R * Math.cos(th), y: D.yU + D.R * Math.sin(th), z: 0, seg: 1, th: th };
    }
    s -= D.Larc;
    if (s < D.Lrun) return { x: D.xC + D.R, y: D.yU - s, z: 0, seg: 2 };
    s -= D.Lrun;
    var th2 = (s / D.Larc) * Math.PI;
    return { x: D.xC + D.R * Math.cos(th2), y: D.yL - D.R * Math.sin(th2), z: 0, seg: 3, th: th2 };
  }
  /* 第 i 板位置与载水态 */
  function boardState(i, sAdv) {
    var s = (i * D.pitch + sAdv) % D.Ltot;
    var p = chainPos(s);
    var wet = s >= D.fillS && s <= D.dumpS;
    return { s: s, x: p.x, y: p.y, seg: p.seg, th: p.th, wet: wet };
  }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp, chainPos: chainPos, boardState: boardState };

  /* 载入期自检:链闭合、链速、浸水与越顶几何、板距弧角 */
  (function selfCheck() {
    var msg = null;
    if (Math.abs(D.pitch * D.NB - D.Ltot) > 1e-9) {
      msg = "高转筒车链闭合自检失败: 板距×N = " + (D.pitch * D.NB).toFixed(3) + " ≠ Ltot " + D.Ltot.toFixed(3);
    } else if (!(D.vChain > 0.40 && D.vChain < 0.6)) {
      msg = "高转筒车链速自检失败: v = " + D.vChain.toFixed(2) + " m/s";
    }
    if (!msg) {
      /* 下轮浸水:轮缘底须低于水面,且高于渠底(不触底) */
      var rimBottom = D.yL - D.R;
      if (rimBottom >= D.waterY) msg = "高转筒车浸水自检失败: 下轮缘底 " + rimBottom.toFixed(2) + " 未入水 " + D.waterY;
      else if (rimBottom <= D.chFloor + 0.03) msg = "高转筒车浸水自检失败: 下轮触渠底 " + rimBottom.toFixed(2);
    }
    if (!msg) {
      /* 渡槽入口低于上轮顶倾倒点,出口高于田埂;
         东竖段下行板缘不得撞入槽口(板半宽 0.15,留 0.03 净空) */
      if (D.trY0 > D.yU + D.R - 0.15) msg = "高转筒车渡槽自检失败: 槽入口高于倾倒位";
      else if (D.trY1 <= D.paddyRim) msg = "高转筒车渡槽自检失败: 槽出口不高于田埂";
      else if (D.xC + D.R + 0.15 > D.trX0 - 0.03) {
        msg = "高转筒车渡槽自检失败: 槽口距下行板缘不足 0.03";
      }
    }
    if (!msg) {
      /* 板距轮上弧角不得过密(相邻板弧距 > 1.0 rad) */
      var arcPitch = D.pitch / D.R;
      if (arcPitch < 1.0) msg = "高转筒车板距自检失败: 轮上弧距 " + arcPitch.toFixed(2) + " rad 过密";
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
