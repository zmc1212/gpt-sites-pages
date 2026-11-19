/* 辘轳 — 尺寸常量与卷筒绞车运动学求解器
   文献依据:汉代画像石(四川成都、山东嘉祥武氏祠等)已有明确辘轳图像;
   《农政全书》《天工开物》载井绳卷筒制式:立架横轴,轴上卷筒,一端摇柄,
   绳绕筒而下吊桶——摇柄臂长于筒半径,构成省力绞车。

   省力比(载入期断言):
     i = 柄臂 / 筒半径 = rCrank / rDrum = 0.55 / 0.22 = 2.5(严格)
     满载柄力 F = (m桶+m水) / i = 14 / 2.5 = 5.6 kg·f ∈ (3, 10) —— 单手可摇。
     断言 3 < F < 10 且 i = 2.5。

   运动学:卷筒角 ψ(rad,绕 x 轴),绳长 L = L_high + rDrum·(−ψ)
     (ψ 负转放绳,正转收绳):
       桶悬挂点  H = (0, drumY − rDrum, wellZ)  筒底切点,固定
       桶顶(提梁顶) = H + L·(−cos φ, −sin φ)  φ 为摆出角(绕 x 轴,摆向 −z)
       桶心 = 桶顶 + (提梁半高+桶半高) 沿摆向;倾倒时桶再前倾 tilt。
     端到端自检 errPos:桶吊点网格世界坐标 vs 解析值(应 ≈0)。

   井体全部位于全球地面 y=0 之上(同桔槔站):高井栏 0.18..1.30,
   池底 0.13(不透明盖板遮住地面),水面 0.45。
   下放位桶底 0.28:没入水面 0.17 m,距池底 0.15 m;
   桶全程位于井口开口内(z 1.72..3.88),摆出位南缘距井栏内壁 ≥0.13 m。 */
(function (MECH) {
  var D = {
    /* 卷筒绞车(m / kg) */
    rDrum: 0.22,            // 卷筒半径
    drumW: 0.44,            // 卷筒宽
    rCrank: 0.55,           // 摇柄臂长
    handleW: 0.30,          // 柄长(x 向)
    axleY: 2.55,            // 横轴高
    axleHalf: 1.62,         // 立架跨距(±x)
    mBucket: 2.0, mWater: 12.0,
    /* 绳与桶 */
    Lhigh: 0.51,            // 高位绳长(桶底 1.13,桶顶高出井栏 0.52)
    Llow: 1.36,             // 下放位绳长(桶底 0.28)
    ropeR: 0.020,
    bucketH: 0.45, bucketRTop: 0.20, bucketRBot: 0.16, bailR: 0.24,
    /* 井(同桔槔制式:全部在地面之上) */
    wellZ: 2.80, wellA: 1.08, kerbT: 0.16, kerbTop: 1.30, platTop: 0.18,
    poolFloor: 0.13, waterY: 0.45,
    platX: 1.62, platZ0: 1.18, platZ1: 4.42,
    /* 瓦盆(摆出倾倒目标) */
    basinZ: 1.30, basinR: 0.36, basinRim: 0.79, basinWater: 0.64,
    stoolH: 0.45,
    /* 摆出倾倒:绳摆 φ(绕 x,摆向 −z),桶前倾 tilt */
    phiPour: 46, tiltPour: 58,
    drumHalf: 0.22
  };
  D.iAdv = D.rCrank / D.rDrum;                 // 2.5 省力比(严格)
  D.Ffull = (D.mBucket + D.mWater) / D.iAdv;   // 5.6 满载柄力 kg·f
  D.drumY = D.axleY;                           // 卷筒与轴同高

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 桶顶(提梁顶)解析位置:H + L·(0, −cosφ, −sinφ) */
  function bailTop(L, phiDeg) {
    var f = rad(phiDeg);
    return { x: 0, y: D.drumY - D.rDrum - L * Math.cos(f), z: D.wellZ - L * Math.sin(f) };
  }
  /* 桶心 = 桶顶(提梁顶)下 (提梁半径+桶半高) 处,沿摆向 */
  function bucketPos(L, phiDeg) {
    var t = bailTop(L, phiDeg), f = rad(phiDeg), a = D.bailR + D.bucketH / 2;
    return { x: 0, y: t.y - a * Math.cos(f), z: t.z - a * Math.sin(f) };
  }
  function bucketBottom(L, phiDeg) {
    var p = bucketPos(L, phiDeg), f = rad(phiDeg);
    return { x: 0, y: p.y - (D.bucketH / 2) * Math.cos(f), z: p.z - (D.bucketH / 2) * Math.sin(f) };
  }
  /* 绳长 ↔ 卷筒角 */
  function ropeFromPsi(psi) { return D.Lhigh + D.rDrum * (0 - psi); }
  function psiFromRope(L) { return -(L - D.Lhigh) / D.rDrum; }

  MECH.DIM = D;
  MECH.KS = {
    deg: deg, rad: rad, ease: ease, clamp: clamp,
    bailTop: bailTop, bucketPos: bucketPos, bucketBottom: bucketBottom,
    ropeFromPsi: ropeFromPsi, psiFromRope: psiFromRope
  };

  /* 载入期自检:省力比、柄力、汲水行程几何、摆出间隙(穿模防护) */
  (function selfCheck() {
    var msg = null;
    if (Math.abs(D.iAdv - 2.5) > 1e-9) {
      msg = "辘轳省力比自检失败: rCrank/rDrum = " + D.iAdv + " ≠ 2.5";
    } else if (!(D.Ffull > 3 && D.Ffull < 10)) {
      msg = "辘轳柄力自检失败: F满载 = " + D.Ffull.toFixed(2) + " kg·f 超出单手可摇范围";
    }
    if (!msg) {
      var bb = bucketBottom(D.Llow, 0);
      if (bb.y >= D.waterY) msg = "辘轳行程自检失败: 下放位桶底 " + bb.y.toFixed(2) + " 未没入水面 " + D.waterY;
      else if (bb.y <= D.poolFloor + 0.05) msg = "辘轳行程自检失败: 桶底距池底不足 " + bb.y.toFixed(2);
      else if (bb.z - D.bucketRTop < D.wellZ - D.wellA || bb.z + D.bucketRTop > D.wellZ + D.wellA) {
        msg = "辘轳行程自检失败: 下放位桶越出井口内壁";
      }
    }
    if (!msg) {
      /* 高位桶顶应高出井栏(便于观察),且桶身不得碰井栏顶 */
      var bt = bailTop(D.Lhigh, 0);
      if (bt.y < D.kerbTop + 0.05) msg = "辘轳行程自检失败: 高位桶顶 " + bt.y.toFixed(2) + " 低于井栏顶 " + D.kerbTop;
    }
    if (!msg) {
      /* 摆出位:桶南缘不得碰南井栏内壁带(z 1.56..1.72),桶底高于盆沿,
         桶位距瓦盆北缘不超过水流可及 0.5m */
      var bp = bucketPos(D.Lhigh, D.phiPour), bb2 = bucketBottom(D.Lhigh, D.phiPour);
      var southEdge = bp.z - D.bucketRTop;
      if (southEdge < D.wellZ - D.wellA + 0.10) {
        msg = "辘轳摆出自检失败: 桶南缘 " + southEdge.toFixed(2) + " 距井栏内壁不足 0.10";
      } else if (bb2.y <= D.basinRim) {
        msg = "辘轳摆出自检失败: 桶底 " + bb2.y.toFixed(2) + " 低于盆沿 " + D.basinRim;
      } else if (bb2.z - (D.basinZ + D.basinR) > 0.5) {
        msg = "辘轳摆出自检失败: 桶位距瓦盆过远(" + bb2.z.toFixed(2) + ")";
      }
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
