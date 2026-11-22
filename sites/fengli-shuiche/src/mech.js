/* 风力水车 — 尺寸常量与运动学求解器
   文献依据:《天工开物·乃粒》:"扬郡以风帆数扇,俟风转车,风息则止,此车为救潦,
   欲去泽水,以便栽种。"方以智《物理小识》:"用风帆六幅,车水灌田者,淮扬海堧皆为之。"
   制式:扬郡八帆立轴风车(帆数从八面,复原推算;帆偏置 ~45° 为复原值,古文无定量)。
   传动链:八帆立轴(ω轮) → 轴底卧轮 Z24(水平盘齿,齿面朝上)外啮合翻车上轴
   立轮 Z16(竖直盘) → 翻车链轮(ω泵 = 1.5ω轮,外啮合) → 龙骨链刮板提水。
   闭合链:上行直段 + 上轮半弧 + 下行直段 + 下轮半弧,总长 = 2·Lc + 2πR;
   节距取整闭合:p = 链总长/N(载入断言)。
   能量核算(载入断言):P风 = ½ρ·A·v³·Cp ≥ ρgQH/η(额定 v=6 m/s 裕度 ≥1.3);
   线性转速模型 ω轮 = λ/R轮·v(λ=0.5 明示为演示简化)。
   尺寸(复原推算):帆轮 R1.30、帆高 2.2、八桅半径 1.30;卧轮 Z24 r0.60、
   立轮 Z16 r0.40(模数 0.05,啮合距 1.00);链轮 R0.13、26 节;扬程 H=0.95。 */
(function (MECH) {
  var D = {
    ax: 0, az: 0,                 // 风车立轴
    Rwheel: 1.30,                 // 帆轮半径
    sailLo: 1.75, sailHi: 3.95,   // 帆带上下沿
    mastR: 1.30, mastLo: 1.55, mastHi: 4.10,
    shaftLo: 0.35, shaftHi: 4.30,
    Z1: 24, r1: 0.60,             // 卧轮(水平盘,齿面朝上)
    Z2: 16, r2: 0.40,             // 立轮(竖直盘,上轴)
    crownY: 1.30,
    Rsp: 0.13, ZT: 8,             // 链轮
    N: 26,                        // 链节数(闭合)
    boardH: 0.10, boardW: 0.26, boardT: 0.03,
    waterH: 0.05,                 // 单板携水柱高
    phi: 0.75,                    // 撒漏系数
    Pa: { x: 0, y: 0.42, z: 4.20 },   // 下链轮心(水池内)
    Pb: { x: 0, y: 1.30, z: 1.00 },   // 上链轮心(=立轮轴,啮合卧轮)
    pond: { x0: -1.1, x1: 1.7, z0: 3.3, z1: 5.3, wallH: 0.5, water: 0.35 },
    field: { x0: -3.6, x1: -1.2, z0: 0.1, z1: 1.9 },
    troughZ: 0.90, troughY: 1.52,     // 出水槽(沿 -x)
    i: 24 / 16,                   // 1.5 步速(卧轮→立轮)
    lambda: 0.5,                  // 尖速比(线性模型,演示简化)
    A: 2 * 1.30 * 2.2 * 0.52,     // 帆扫掠有效面积(m²)
    Cp: 0.215,                    // 布帆功率系数(复原取值)
    eta: 0.70,                    // 链系总效率
    windMin: 2.0, windMax: 8.0    // 手动风速档范围
  };
  D.alpha = Math.atan2(D.Pb.y - D.Pa.y, D.Pb.z - D.Pa.z) * -1;   // 槽倾角(向上为正)
  D.Laxis = Math.hypot(D.Pb.z - D.Pa.z, D.Pb.y - D.Pa.y);       // 轮心斜距
  D.dz = (D.Pb.z - D.Pa.z) / D.Laxis;                            // 轴向单位向量(y,z)
  D.dy = (D.Pb.y - D.Pa.y) / D.Laxis;
  D.loopLen = 2 * D.Laxis + 2 * Math.PI * D.Rsp;
  D.p = D.loopLen / D.N;                                         // 节距(闭合)
  D.H = D.Pb.y - D.pond.water;                                   // 扬程 0.95
  D.Aflow = D.waterH * D.boardW;                                 // 过水断面
  D.qBoard = D.p * D.waterH * D.boardW * D.phi;                  // 单板携水体积(含板距)
  D.omegaOf = function (v) { return D.lambda / D.Rwheel * v; };  // ω轮 = 0.385v
  D.vChainOf = function (v) { return D.omegaOf(v) * D.i * D.Rsp; };
  D.Qof = function (v) { return D.vChainOf(v) * D.Aflow * D.phi; };
  D.PwindOf = function (v) { return 0.5 * 1.2 * D.A * v * v * v * D.Cp; };
  D.PliftOf = function (v) { return 1000 * 9.8 * D.Qof(v) * D.H / D.eta; };
  D.marginOf = function (v) { return D.PwindOf(v) / D.PliftOf(v); };

  /* 弧长 s → 链节位姿(x 恒 0±通道偏移;y,z 在 z-y 平面;t = 切向(y,z 分量))
     接触点精确解:法向 n = (−dz, dy)(朝上侧),直段自接触点起算:
       上行直段 Pa−n·R → Pb−n·R;上轮弧 θn+π → θn(过顶);
       下行直段 Pb+n·R → Pa+n·R;下轮弧 θn → θn−π(过底)。
     通道偏移:上行 +0.09 / 下行 −0.09 / 弧段线性渐变(避免上下行刮板穿插) */
  function loopPose(s) {
    s = ((s % D.loopLen) + D.loopLen) % D.loopLen;
    var R = D.Rsp, ny = -D.dz, nz = D.dy;          // 法向 n(朝上)
    var thn = Math.atan2(ny, nz);
    var s1 = D.Laxis, s2 = D.Laxis + Math.PI * R, s3 = 2 * D.Laxis + Math.PI * R;
    if (s < s1) {                                   // 上行直段(下池 → 上轮)
      return { x: 0.09, y: D.Pa.y - ny * R + D.dy * s, z: D.Pa.z - nz * R + D.dz * s,
               ty: D.dy, tz: D.dz };
    }
    if (s < s2) {                                   // 上轮弧(过顶,θ 递减)
      var f = (s - s1) / R, th = thn + Math.PI - f;
      return { x: 0.09 - 0.18 * f / Math.PI,
               y: D.Pb.y + Math.sin(th) * R, z: D.Pb.z + Math.cos(th) * R,
               ty: -Math.cos(th), tz: Math.sin(th) };
    }
    if (s < s3) {                                   // 下行直段(上轮 → 下池)
      var k = s - s2;
      return { x: -0.09, y: D.Pb.y + ny * R - D.dy * k, z: D.Pb.z + nz * R - D.dz * k,
               ty: -D.dy, tz: -D.dz };
    }
    var f2 = (s - s3) / R, th2 = thn - f2;          // 下轮弧(过底,θ 递减)
    return { x: -0.09 + 0.18 * f2 / Math.PI,
             y: D.Pa.y + Math.sin(th2) * R, z: D.Pa.z + Math.cos(th2) * R,
             ty: -Math.cos(th2), tz: Math.sin(th2) };
  }

  function newState() {
    return {
      time: 0,
      wind: 0, windTarget: 0,
      thetaWheel: 0, omegaWheel: 0,     // 立轴/帆
      omegaPump: 0, sOff: 0,            // 立轮/链轮相位与链前进量
      flow: 0, fieldWater: 0, maxErr: 0,
      running: false
    };
  }

  function step(st, dt) {
    st.wind += (st.windTarget - st.wind) * Math.min(1, dt * 1.6);
    st.omegaWheel += (D.omegaOf(st.wind) - st.omegaWheel) * Math.min(1, dt * 1.3);
    st.thetaWheel += st.omegaWheel * dt;
    st.omegaPump = D.i * st.omegaWheel;
    st.sOff += st.omegaPump * D.Rsp * dt;
    st.flow = D.Qof(st.wind);
    st.fieldWater = Math.min(0.20, st.fieldWater + st.flow * dt / ((D.field.x1 - D.field.x0) * (D.field.z1 - D.field.z0)));
    st.running = st.omegaWheel > 0.08;
    /* 运行期积分校验:链前进量应严格等于 i·θ轮·R链轮 */
    var err = Math.abs(st.sOff - D.i * st.thetaWheel * D.Rsp);
    if (err > st.maxErr) st.maxErr = err;
  }

  MECH.DIM = D;
  MECH.KS = { newState: newState, step: step, loopPose: loopPose };

  /* 载入期自检:齿比 / 链闭合 / 啮合距 / 能量裕度(额定 6 m/s) / 流量 30s 实测 */
  (function selfCheck() {
    var errs = [];
    if (Math.abs(D.i - D.Z1 / D.Z2) > 1e-12) errs.push("传动比 i≠Z1/Z2");
    if (Math.abs(Math.abs(D.Pb.z - 0) - (D.r1 + D.r2)) > 1e-9) errs.push("啮合距 ≠ r卧+r立");
    if (Math.abs(D.N * D.p - D.loopLen) > 1e-9) errs.push("链闭合失败");
    if (D.marginOf(6) < 1.3) errs.push("额定 6m/s 能量裕度不足: " + D.marginOf(6).toFixed(2));
    if (D.sailLo < D.troughY + 0.2) errs.push("帆带与出水槽净空不足");
    if (Math.hypot(D.Pb.z, 0) < D.Rwheel - 0.2 && D.Pb.y > D.sailLo - 0.05) errs.push("翻车上端与帆扫掠干涉");
    if (errs.length) {
      var msg = "风力水车自检失败: " + errs.join("; ");
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
    /* 30s 常速实测:过板计数×单板水柱 ≈ 公式流量(±15%) */
    var st = newState();
    st.wind = 6; st.windTarget = 6;
    st.omegaWheel = D.omegaOf(6);
    var prevN = 0, cnt = 0;
    for (var k = 0; k < 900; k++) {
      st.wind = 6;
      step(st, 1 / 30);
      var n = Math.floor(st.sOff / D.p);
      if (n > prevN) { prevN = n; cnt++; }
    }
    var qm = cnt * D.qBoard / 30, qf = D.Qof(6);
    if (Math.abs(qm - qf) / qf > 0.15) {
      var msg2 = "流量自检失败: 实测 " + qm.toFixed(4) + " vs 公式 " + qf.toFixed(4);
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg2);
      throw new Error(msg2);
    }
  })();
})(window.MECH = window.MECH || {});
