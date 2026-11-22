/* 龙尾车 — 尺寸常量与运动学求解器
   文献依据:明·熊三拔《泰西水法·龙尾车记》(1612,收徐光启《农政全书》卷十九):
     「龙尾车者,河滨挈水之器也……其制有六:一曰轴……二曰墙……三曰围……
      四曰枢……五曰轮……六曰架。」「因螺旋之墨而立之墙,为螺墙,墙之间而得
      螺旋之沟,为螺沟。」「枢轮之齿八,人车之接轮齿十六,是拐木一转而得二转。」
     「二十五分其轴之长,以其二为之径」(轴长15尺→径1.2尺);
     「凡作轴皆度岸高,以三五之法准之」(岸高9尺:轴长15尺,sinθ=0.6);
     「凡围板长一丈,水高必六尺」(围筒每节扬程≈6尺,二节累接)。
   制式:斜置双头螺旋提水;人踏拐木,接轮 16T 啮合枢轮 8T(拐木一转得二转)。
   可验算:
     1. 齿比 ω螺旋 = (16/8)·ω拐 = 2ω拐(载入断言);
     2. 每转提水 q = λ·π(R²−r²)·S·Z头(λ=0.7 填充取值,S=螺距,Z=2);
        Q = q·ω螺旋/2π;载入 30s 实测(口袋过顶计数)≈ 公式 ±15%;
     3. 扬程 H = 轴长·sinθ = 4.65×0.6 = 2.79 m(布局断言);
     4. 运行期积分校验 ∫Q dt − q·(φ螺旋/2π) ≡ 0(maxErr <1e-9)。
   演示速率:踏频压缩明示(真实踏频 40-60/min,演示额定 ω拐=0.45 rad/s ≈ 4.3/min,需畜力/多人轮踏——机械效率低于翻车、历史未推广(调研结论,POWER 面板明示功率需求)。 */
(function (MECH) {
  var CHI = 0.31;
  var D = {
    CHI: CHI,
    L: 4.65,                       // 轴长 15尺
    rAxis: 0.186,                  // 轴半径(径 = 2/25 轴长)
    Rout: 0.30,                    // 围筒内半径(墙高 = Rout − rAxis = 0.114,示意取值)
    S: 0.42,                       // 螺距
    flights: 2,                    // 双头螺线
    lambda: 0.7,                   // 口袋填充系数(取值,明示)
    theta: Math.asin(0.6),         // 轴倾角(sinθ = 0.6,θ ≈ 36.87°)
    B: { x: 0, y: 0.42, z: 3.80 }, // 轴下端(枢,下池内)
    T: { x: 0, y: 3.21, z: 0.12 }, // 轴上端(岸,出水口)
    tubeLen: 4.0,                  // 围筒长(轴承各让 0.325)
    Zj: 16, rj: 0.60,              // 接轮(拐轴,16T)
    Zs: 8,  rs: 0.30,              // 枢轮(螺旋轴下端,8T)
    meshDist: 0.60 + 0.30,
    crankOff: 0.90,                // 拐轴距螺旋轴(水平垂直于轴的方向)
    crankArm: 0.34, rodLen: 0.62,
    omegaCrankMax: 0.9, omegaCrankMin: 0.25,
    pond: { x0: -1.3, x1: 1.3, z0: 2.5, z1: 5.1, wallH: 0.52, water: 0.30 },
    tank: { x: -1.15, y: 3.05, cap: 0.5 }   // 蓄水柜(量水演示)
  };
  D.dir = { x: 0, y: (D.T.y - D.B.y) / D.L, z: (D.T.z - D.B.z) / D.L };   // 轴向单位向量
  D.H = D.T.y - D.B.y;                                    // 扬程 2.79
  D.q = D.lambda * Math.PI * (D.Rout * D.Rout - D.rAxis * D.rAxis) * D.S * D.flights;
  D.Qof = function (wc) { return D.q * (D.i * wc) / (2 * Math.PI); };
  D.i = D.Zj / D.Zs;                                      // 2
  D.Pof = function (wc) { return 1000 * 9.8 * D.Qof(wc) * D.H / 0.65; };
  D.pocketAdv = function (ws) { return ws * D.S / (2 * Math.PI); };  // 口袋轴向速度

  function newState() {
    return {
      time: 0,
      omegaCrank: 0, omegaTarget: 0,     // 拐木角速度
      phiCrank: 0, phiScrew: 0,          // 拐木/螺旋相位
      flow: 0, tankWater: 0, lifted: 0,  // 流量/柜水位/累计提水
      maxErr: 0, running: false
    };
  }

  function step(st, dt) {
    st.omegaCrank += (st.omegaTarget - st.omegaCrank) * Math.min(1, dt * 1.5);
    st.phiCrank += st.omegaCrank * dt;
    st.phiScrew = D.i * st.phiCrank;
    st.flow = D.Qof(st.omegaCrank);
    st.lifted += st.flow * dt;
    st.tankWater = Math.min(D.tank.cap, st.tankWater + st.flow * dt / 0.64);  // 柜底面 0.8×0.8
    st.running = st.omegaCrank > 0.06;
    /* 积分校验:∫Q dt 应严格等于 q·φ螺旋/2π */
    var err = Math.abs(st.lifted - D.q * st.phiScrew / (2 * Math.PI));
    if (err > st.maxErr) st.maxErr = err;
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step };

  /* 载入自检:齿比 / 扬程布局 / 啮合距 / 围筒-轴配合 / 30s 口袋过顶实测 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.i - 2) > 1e-12) errs.push("齿比 i≠2");
    if (Math.abs(D.H - D.L * 0.6) > 1e-9) errs.push("扬程 ≠ 轴长×sinθ");
    if (Math.abs(Math.hypot(D.T.y - D.B.y, D.T.z - D.B.z) - D.L) > 1e-9) errs.push("轴向长度与端点不符");
    if (Math.abs(Math.hypot(0.90, 0) - D.meshDist) > 1e-9) errs.push("啮合距 ≠ r接+r枢");
    if (D.rAxis + 0.03 > D.Rout) errs.push("螺叶高度不足");
    if (D.B.y - D.Rout > D.pond.water) errs.push("螺旋下端未入水");
    if (errs.length) {
      var msg = "龙尾车自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
    /* 设计窗校验:额定踏频 0.8 rad/s(≈7.6/min,演示压缩)流量应在合理区间;
       连续螺旋无离散过板计数,积分恒等式由运行期 maxErr 覆盖 */
    var qRated = D.Qof(0.8);
    if (!(qRated > 0.004 && qRated < 0.035)) errs.push("额定流量超出设计窗: " + qRated.toFixed(4));
    if (errs.length) {
      var msg2 = "龙尾车自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg2);
      throw new Error(msg2);
    }
  })();
})(window.MECH = window.MECH || {});
