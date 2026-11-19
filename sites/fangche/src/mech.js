/* 三锭脚踏纺车 — 尺寸常量与绳传动运动学
   文献依据:王祯《农书》卷二十三「木棉纺车」图、《天工开物·乃服》:
   大绳轮(脚踏曲柄驱动)经三条绳圈分传三锭,锭速 = 轮速 × R轮/r锭。
   演示值:R轮 0.35、r锭 0.021 ⇒ 传动比 16.7(载入期断言),三锭同速。 */
(function (MECH) {
  var CHI = 0.3;
  var D = {
    CHI: CHI,
    R: 0.35,               // 大绳轮半径(径二尺三寸)
    rSp: 0.021,            // 锭轮半径
    nSp: 3,
    spokeN: 12,
    zSpindles: [-0.26, 0, 0.26],
    crankR: 0.09,          // 踏板曲柄
    pedalL: 0.30,
    k: { slow: 1.6, fast: 2.9 }
  };
  D.ratio = D.R / D.rSp;               // 16.7
  D.spOmegaOf = function (w) { return w * D.ratio; };

  function newState() {
    return {
      time: 0, phi: 0, omega: 0, omegaTarget: 0,
      pedal: [0, 0],                   // 左右踏板角
      spYarn: [0.05, 0.05, 0.05],      // 锭上纱团半径(生长)
      lastPhase: ""
    };
  }

  function step(st, dt) {
    st.omega += (st.omegaTarget - st.omega) * Math.min(1, dt * 2.0);
    st.phi += st.omega * dt;
    st.time += dt;
    /* 双踏板相位差 90°(曲柄摇杆) */
    st.pedal[0] = st.phi;
    st.pedal[1] = st.phi + Math.PI / 2;
    /* 纱团缓慢生长(视觉) */
    for (var k = 0; k < D.nSp; k++) {
      st.spYarn[k] = Math.min(0.05, 0.02 + (st.time % 60) * 0.0005);
    }
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.ratio - 16.7) > 0.05) errs.push("传动比异常: " + D.ratio);
    if (errs.length) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR("纺车自检失败: " + errs.join(";"));
      throw new Error(errs.join(";"));
    }
  })();
})(window.MECH = window.MECH || {});
