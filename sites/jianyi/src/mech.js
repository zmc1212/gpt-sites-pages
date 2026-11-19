/* 简仪 — 尺寸常量与赤道式瞄准运动学
   文献依据:郭守敬至元十三年(1276)创制简仪(赤道装置,早于第谷三百年);
   现存紫金山天文台明正统仿制原器。机构:极轴倾斜支架 + 百刻环 +
   赤道环圈(二十四节气) + 四游环(绕极轴旋转,双窥衡)。
   四游环转角 ψ 即去极度(自北极起量);星表断言:ψ星 = 90° − 赤纬。 */
(function (MECH) {
  var CHI = 0.3;
  var D = {
    CHI: CHI,
    baseR: 0.72, baseH: 0.30,
    polarTilt: 50 * Math.PI / 180,   // 极轴仰角(演示值)
    ringEqR: 0.58,                   // 赤道环圈
    ringYouR: 0.66,                  // 四游环
    ringBaiR: 0.44,                  // 百刻环
    stars: [
      { name: "织女一", dec: 38.8, note: "天琴 α" },
      { name: "角宿一", dec: -11.2, note: "室女 α" },
      { name: "参宿四", dec: 7.4, note: "猎户 α" },
      { name: "心宿二", dec: -26.4, note: "天蝎 α" }
    ],
    k: { sweep: 0.35 }
  };
  D.stars.forEach(function (s) { s.psi = (90 - s.dec) * Math.PI / 180; });   // 去极度(自北极量)

  function newState() {
    return {
      time: 0, psi: D.stars[0].psi, psiTarget: D.stars[0].psi,
      starIdx: 0, sweep: false, sweepDir: 1,
      quJiDu: 90 - D.stars[0].dec,
      lastPhase: "", manual: false, _keyL: false, _keyR: false
    };
  }

  function step(st, dt) {
    st.time += dt;
    if (st.sweep) {
      st.psiTarget += st.sweepDir * D.k.sweep * dt;
      if (st.psiTarget > Math.PI) { st.psiTarget = Math.PI; st.sweepDir = -1; }
      if (st.psiTarget < 0.15) { st.psiTarget = 0.15; st.sweepDir = 1; }
    }
    st.psi += (st.psiTarget - st.psi) * Math.min(1, dt * 2.6);
    st.quJiDu = st.psi * 180 / Math.PI;           // 去极度读数(deg)
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  (function selfCheck() {
    var errs = [];
    D.stars.forEach(function (s) {
      if (Math.abs(s.psi - (90 - s.dec) * Math.PI / 180) > 1e-9) errs.push("星表换算错: " + s.name);
    });
    /* 模拟:瞄准织女一 → 稳态读数 = 去极度 51.2° */
    var st = newState();
    st.psiTarget = D.stars[0].psi;
    for (var i = 0; i < 200; i++) step(st, 1 / 30);
    if (Math.abs(st.quJiDu - (90 - D.stars[0].dec)) > 0.5) {
      errs.push("织女一读数异常: " + st.quJiDu.toFixed(1));
    }
    if (errs.length) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR("简仪自检失败: " + errs.join(";"));
      throw new Error(errs.join(";"));
    }
  })();
})(window.MECH = window.MECH || {});
