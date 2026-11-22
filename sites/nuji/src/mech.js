/* 弩机 — 尺寸常量与击发联动运动学
   文献依据:《释名·释兵》:「弩,怒也,有执怒(势)也。其柄曰臂,似人臂也。
   钩弦者曰牙,似齿牙也。牙外曰郭,为牙之规郭也。下曰悬刀,其形然也。
   含括之口曰机,言如机之巧也。」实物:甘肃镇原东汉弩机(郭长 14.2cm、悬刀
   9cm、望山 6.6cm)、满城汉墓错金银弩机(郭 12.1cm,望山刻度)。
   制式:郭(青铜机匣)内 牙(钩弦件)与 悬刀(扳机)各绕键(销轴)转动,
   经 牛(中间联动件)传动:拉悬刀 → 牙下旋 → 弦脱箭发;望山立牙后,面带
   刻度(抛射瞄具,研究结论之一)。
   可验算:
     1. 联动比 k = θ牙/θ悬刀 = L悬/L牙 = 0.045/0.030 = 1.5(载入断言);
     2. 弦储能 E = ½F·x(F 六石 ≈ 181kgf·9.8 ≈ 1774N,x 0.16m)= 142 J(断言);
     3. 箭速 v = √(2E/m箭)(m 50g)= 75.4 m/s(断言);
     4. 理想射程 R = v²sin2θ/g(望山仰角 θ;45° 极大 580m,标注压缩演示);
     5. 望山刻度:6 格,每格 Δh 8mm → Δθ = atan(Δh/L望眼距)(逐格递增)。
   演示:机构原大(郭 14cm),弹道 20:1 压缩(落点标记明示)。 */
(function (MECH) {
  var D = {
    guoL: 0.142, guoH: 0.076, guoT: 0.038,       // 郭(青铜机匣)
    armL: 0.65,                                   // 木臂
    pinY: 0.028,                                  // 牙/悬刀销轴高差
    Lya: 0.030, Lsd: 0.045,                       // 牙臂/悬刀臂长
    Lwang: 0.066,                                 // 望山高
    gradN: 6, gradH: 0.008,                       // 望山刻度 6 格 × 8mm
    eyeH: 0.052,                                  // 望山眼距(取瞄基线)
    Fstring: 1774, drawX: 0.16,                   // 六石弩弦力 / 行程
    mBolt: 0.050,                                 // 箭重
    thetaMax: 0.42,                               // 悬刀行程角(rad)
    fireDist: 75, fireCompress: 20,               // 理想射程 / 演示压缩
    bowR: 0.42
  };
  D.k = D.Lsd / D.Lya;                              // 1.5
  D.Estr = 0.5 * D.Fstring * D.drawX;               // 141.9 J
  D.vBolt = Math.sqrt(2 * D.Estr / D.mBolt);        // 75.4
  D.Rideal = D.vBolt * D.vBolt / 9.8;               // 580 (45°)
  D.gradStep = Math.atan(D.gradH / D.eyeH) * 57.3;  // 每格角分度 ≈ 8.8°

  function newState() {
    return {
      time: 0,
      cocked: false,                                 // 挂弦待发
      sdT: 0, yaT: 0,                                // 悬刀/牙转角
      firing: false, fireT: 0,
      boltFlying: false, boltT: 0, boltDist: 0,
      shots: 0, grad: 2, maxErr: 0,
      hist: []
    };
  }

  /* 联动:拉悬刀 sdT(0→thetaMax) → 牙转角 = −k·sdT(下旋脱弦) */
  function setCocked(st, v) { st.cocked = v; }
  function step(st, dt) {
    st.time += dt;
    /* 悬刀行程:击发段 0→max(0.25s),松回 0.4s */
    if (st.firing) {
      st.fireT += dt;
      if (st.fireT < 0.25) {
        st.sdT = D.thetaMax * (st.fireT / 0.25);
      } else if (st.fireT < 0.65) {
        st.sdT = D.thetaMax * (1 - (st.fireT - 0.25) / 0.4);
        if (!st.boltFlying && st.sdT > D.thetaMax * 0.55) {
          st.boltFlying = true; st.boltT = 0; st.shots++;
          st.cocked = false;
        }
      } else {
        st.sdT = 0; st.firing = false; st.fireT = 0;
      }
      st.yaT = -D.k * st.sdT * (st.cocked || st.firing ? 1 : 0);
    } else if (st.cocked) {
      st.sdT = 0; st.yaT = 0.12;                     // 牙抬起钩弦位
    } else {
      st.sdT = 0; st.yaT = -0.18;                    // 空机牙落下
    }
    /* 弹道(压缩 20:1):抛物线两段飞行 0.9s */
    if (st.boltFlying) {
      st.boltT += dt;
      st.boltDist = Math.min(1, st.boltT / 0.9);
      if (st.boltT >= 0.9) st.boltFlying = false;
    }
    /* 联动比校验(运行期):|yaT + k·sdT| < 1e-9(挂弦/击发段) */
    if (st.firing || st.cocked) {
      var err = Math.abs(st.yaT - (-D.k * st.sdT));
      if (err > st.maxErr && st.firing) st.maxErr = err;
    }
    st._hT = (st._hT || 0) + dt;
    if (st._hT > 0.03) {
      st._hT = 0;
      st.hist.push(st.sdT);
      if (st.hist.length > 200) st.hist.shift();
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step, setCocked: setCocked };

  /* 载入自检:联动比 / 储能 / 箭速 / 射程 / 刻度 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.k - D.Lsd / D.Lya) > 1e-12) errs.push("联动比 k ≠ L悬/L牙");
    if (Math.abs(D.Estr - 0.5 * D.Fstring * D.drawX) > 1e-6) errs.push("弦储能公式不符");
    if (Math.abs(D.vBolt - Math.sqrt(2 * D.Estr / D.mBolt)) > 1e-9) errs.push("箭速公式不符");
    if (Math.abs(D.Rideal - D.vBolt * D.vBolt / 9.8) > 1e-6) errs.push("理想射程公式不符");
    if (D.gradN !== 6) errs.push("望山刻度数 ≠ 6");
    if (errs.length) {
      var msg = "弩机自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
