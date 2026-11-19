/* 桔槔 — 尺寸常量与杠杆运动学求解器
   文献依据:《庄子·天地》子贡语「有械于此……凿木为机,后重前轻,挈水若抽,
   数如泆汤,其名为槔」—— 立柱枢轴挑横木,短端坠石、长端吊罐的配重杠杆。

   力矩模型(mech.js 常量,载入期断言):
     杠杆比 k = L长/L短 = 4.125/1.875 = 2.2(全长严格 6.0 m,支点偏置)
     T石  = m石  · L短 = 40 × 1.875 = 75.00 kg·m
     T空  = m罐空 · L长 =  2 × 4.125 =  8.25 kg·m
     T满  = m罐满 · L长 = 12 × 4.125 = 49.50 kg·m
     断言 T空 < T满 < T石:
       空罐:坠石远胜 → 罐自动上提(高位态 θ=−24°);
       满罐:坠石仍胜(T石 75.0 > T满 49.5)→ 坠石把满罐拉出井口(阶段 7);
       下压汲水须人力加压长端,净需下压力 = (T石 − T罐)/L长
       (空罐 16.2 kg·f,满罐 6.2 kg·f —— 空罐下行才是做功段)。
     注:规格书文字「T空<T石<T满」与其自身结论(坠石提满罐、满罐需下压)
     及《庄子》"后重前轻、挈水若抽" 相悖,按物理与结论取 T空 < T满 < T石,
     详见 README 验算一节。

   运动学:θ 为杠杆角(0=水平,θ>0 长端下沉,θ<0 抬头):
     长端端点  P_L(θ) = ( +L长·cosθ, pivotY − L长·sinθ )
     短端端点  P_S(θ) = ( −L短·cosθ, pivotY + L短·sinθ )
     罐自由竖直悬挂于长端端点下绳长处(摆出倾倒时绕端点摆 φ、收绳倾斜):
       P罐 = P_L + (绳+罐半高)·(sin φ, −cos φ)
     坠石对称反向摆,绳竖直悬挂于短端端点下。
   井体全部位于全球地面(y=0)之上:高井栏 0.18..1.30,水面 +0.45,
   池底 0.13(不透明,遮住地面)——下压态罐底 0.22,没入水面 0.23 m,
   距池底 0.09 m;横杆全程不低于 2.19 m,不剐蹭井栏(载入期断言)。 */
(function (MECH) {
  var D = {
    /* 杠杆(单位 m / kg) */
    Ls: 1.875,              // 短臂(坠石端)
    Ll: 4.125,              // 长臂(吊罐端)
    Ltot: 6.0,              // 全长(严格)
    k: 2.2,                 // 杠杆比 L长/L短(严格)
    mStone: 40,             // 坠石质量 kg
    mJugE: 2.0,             // 柳条罐空重 kg
    mJugF: 12.0,            // 柳条罐满重 kg
    /* 绳与罐 */
    ropeJug: 1.6,           // 吊绳长 m
    ropeStone: 0.85,        // 坠石绳长 m
    jugH: 0.46, jugRTop: 0.17, jugRBot: 0.125,
    /* 角度(度):θ=0 水平,>0 长端下沉,<0 抬头 */
    thetaHigh: -24,         // 高位态(坠石端着地前限位)
    thetaPress: 13.5,       // 下压取水态(罐底没入水面,距池底留 0.09 m)
    thetaLever0: 18,        // 仅横木自落的摩擦平衡角(装配段示意)
    thetaStone0: -12,       // 系坠石后的新平衡角(装配段示意)
    /* 立柱与枢轴 */
    postTop: 3.30, pivotY: 3.24, postHW: 0.09, baseH: 0.25, postH: 3.05,
    /* 井:汉代陶井式高井栏(形制见汉墓出土陶井模型)——全部井体位于 y=0
       全球地面之上,避免穿模:平台顶 platTop,井栏顶 kerbTop(0.18..1.30),
       池底 poolFloor(不透明盖板,遮住全球地面),水面 waterY(池深 0.32m) */
    wellCx: 3.30, wellA: 1.08, kerbT: 0.16, kerbTop: 1.30, platTop: 0.18,
    poolFloor: 0.13, waterY: 0.45,
    platX0: 1.70, platX1: 5.10, platHZ: 1.75,
    /* 水槽(井台旁地面) */
    trCx: 6.10, trRim: 0.75, trWater: 0.62, trHX: 0.475, trHZ: 0.31,
    /* 摆出倾倒(阶段 8):长端回落到 thetaPour,绳摆出 phiPour,罐倾 tiltPour */
    phiPour: 68, thetaPour: 15, tiltPour: 68
  };
  D.TStone = D.mStone * D.Ls;            // 75.00
  D.TEmpty = D.mJugE * D.Ll;             // 8.25
  D.TFull = D.mJugF * D.Ll;              // 49.50
  D.eqLift = D.TStone / D.Ll;            // 18.18 坠石折算到长端的等效配重 kg
  D.ratio = D.Ll / D.Ls;                 // 实算杠杆比(应=2.2)

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 端点求解器 */
  function tipLong(thDeg) {
    var t = rad(thDeg);
    return { x: D.Ll * Math.cos(t), y: D.pivotY - D.Ll * Math.sin(t) };
  }
  function tipShort(thDeg) {
    var t = rad(thDeg);
    return { x: -D.Ls * Math.cos(t), y: D.pivotY + D.Ls * Math.sin(t) };
  }
  /* 罐中心:长端端点下 (绳+罐半高) 处,φ 为绕端点的摆角(>0 摆向 +x 水槽侧) */
  function jugPos(thDeg, phiDeg) {
    var tip = tipLong(thDeg), a = rad(phiDeg), r = D.ropeJug + D.jugH / 2;
    return { x: tip.x + r * Math.sin(a), y: tip.y - r * Math.cos(a) };
  }
  /* 罐顶(吊点)与罐底 */
  function jugTop(thDeg, phiDeg) {
    var tip = tipLong(thDeg), a = rad(phiDeg);
    return { x: tip.x + D.ropeJug * Math.sin(a), y: tip.y - D.ropeJug * Math.cos(a) };
  }
  function jugBottom(thDeg, phiDeg) {
    var tip = tipLong(thDeg), a = rad(phiDeg), r = D.ropeJug + D.jugH;
    return { x: tip.x + r * Math.sin(a), y: tip.y - r * Math.cos(a) };
  }
  /* 坠石中心(短端端点下绳长+石半径系点) */
  function stonePos(thDeg) {
    var tip = tipShort(thDeg);
    return { x: tip.x, y: tip.y - D.ropeStone - 0.26 };
  }
  /* 下压所需人力(长端切向 kg·f);空罐/按当前罐重 */
  function pressForce(fill) {
    var mJug = D.mJugE + (D.mJugF - D.mJugE) * fill;
    return (D.TStone - mJug * D.Ll) / D.Ll;
  }

  MECH.DIM = D;
  MECH.KS = {
    deg: deg, rad: rad, ease: ease, clamp: clamp,
    tipLong: tipLong, tipShort: tipShort,
    jugPos: jugPos, jugTop: jugTop, jugBottom: jugBottom,
    stonePos: stonePos, pressForce: pressForce
  };

  /* 载入期自检:杠杆比、力矩不等式、汲水行程几何,任一不成立即 boot 横幅 + throw */
  (function selfCheck() {
    var msg = null;
    if (Math.abs(D.ratio - 2.2) > 1e-9 || Math.abs(D.k - 2.2) > 1e-9) {
      msg = "桔槔杠杆比自检失败: L长/L短 = " + D.ratio + " ≠ 2.2";
    } else if (Math.abs(D.Ll + D.Ls - D.Ltot) > 1e-9) {
      msg = "桔槔横木全长自检失败: " + (D.Ll + D.Ls) + " ≠ 6.0";
    } else if (!(D.TEmpty < D.TFull && D.TFull < D.TStone)) {
      msg = "桔槔力矩不等式自检失败: T空=" + D.TEmpty + " T满=" + D.TFull +
            " T石=" + D.TStone + "(应为 T空 < T满 < T石)";
    } else if (!(D.eqLift > D.mJugF)) {
      msg = "桔槔配重自检失败: 坠石长端等效 " + D.eqLift + "kg ≤ 满罐 " + D.mJugF + "kg,无法提满罐";
    }
    if (!msg) {
      /* 汲水行程:下压态罐必须没入水面,距池底留净空、不越出井口内壁 */
      var jb = jugBottom(D.thetaPress, 0);
      if (jb.y >= D.waterY) msg = "桔槔行程自检失败: 下压态罐底 " + jb.y.toFixed(2) + " 未没入水面 " + D.waterY;
      else if (jb.y <= D.poolFloor + 0.05) msg = "桔槔行程自检失败: 罐底距池底不足 " + jb.y.toFixed(2);
      else if (jb.x + D.jugRTop > D.wellCx + D.wellA || jb.x - D.jugRTop < D.wellCx - D.wellA) {
        msg = "桔槔行程自检失败: 下压态罐越出井口内壁";
      } else {
        /* 杆端/吊点穿越井栏顶平面时必须在开口内(不撞井栏) */
        var aK = Math.asin((D.pivotY - D.kerbTop) / D.Ll), xK = D.Ll * Math.cos(aK);
        var aB = Math.asin((D.pivotY - D.kerbTop - D.ropeJug) / D.Ll), xB = D.Ll * Math.cos(aB);
        if (xK + 0.05 > D.wellCx + D.wellA || xK - 0.05 < D.wellCx - D.wellA ||
            xB + D.jugRTop > D.wellCx + D.wellA || xB - D.jugRTop < D.wellCx - D.wellA) {
          msg = "桔槔行程自检失败: 杆端/罐入井口时撞井栏(x=" + xK.toFixed(2) + "/" + xB.toFixed(2) + ")";
        } else {
          /* 横杆下缘在近侧井栏墙带(wellCx−wellA)处必须高于井栏顶(不剐蹭顶角) */
          var beamY = D.pivotY - (D.wellCx - D.wellA) * Math.tan(rad(D.thetaPress)) - 0.07;
          if (beamY < D.kerbTop + 0.10) {
            msg = "桔槔行程自检失败: 横杆下缘剐蹭井栏顶角(" + beamY.toFixed(2) + " < " + D.kerbTop + ")";
          }
        }
      }
    }
    if (!msg) {
      /* 高位态坠石不得着地 */
      var sp = stonePos(D.thetaHigh);
      if (sp.y - 0.26 <= 0) msg = "桔槔限位自检失败: 高位态坠石着地";
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
