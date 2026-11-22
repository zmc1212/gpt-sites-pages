/* 欹器 — 尺寸常量与重心-倾覆运动学求解器
   文献依据:《荀子·宥坐》孔子观于鲁桓公之庙,有欹器焉——
   「虚则欹,中则正,满则覆」,以为「恶有满而不覆者哉」。尖底深臂,一杯水即可正身。

   重心模型(数值积分,载入期计算):
     器内腔:尖底锥(y −0.30,r 0)→ 腰(y 0,r 0.22)→ 口(y +0.32,r 0.15),
       r(y) 分段线性;V_total、V(y) 数值积分(N=60 层)。
     器壁:质量 mW = 2.0 kg,重心 yW = +0.08(质偏口沿腹上段)。
     水:ρ = 1000 kg/m³,注入 f ∈ [0,1](体积比)。
     合重心 yCG(f) = (mW·yW + ρV(f)·yC(f)) / (mW + ρV(f))   —— 相对枢轴(y 0)
     yCG > 0 → 不稳(虚则欹 / 满则覆);yCG < 0 → 正(中则正)。
     交叉点由数值解:f欹(yCG 上→下过零)≈ 0.02,f覆(下→上过零)≈ 0.64。尖底深臂,一杯水即正。
     断言:0.05 < f欹 < 0.30;0.60 < f覆 < 0.95;f欹 < f覆;yCG(0) > 0。
   运动学(纯函数):θ(f):
     yCG(f) > 0 且 f < f覆 → 倚挡角 θrest = −58°(虚则欹);
     yCG(f) ≤ 0 → θ = 0(中则正);
     f > f覆 → 倾覆 θ = 142°(满则覆,口过水平,水全沥)。
   坐标系:y 上,枢在器腰(y 0),倾转绕水平销轴(z 向)。
   全部几何位于地面之上(几面 0.92,枢高 1.06)。 */
(function (MECH) {
  var D = {
    rWaist: 0.22, rMouth: 0.15, yTip: -0.30, yMouth: 0.32,
    mWall: 2.0, yWall: 0.08, rho: 1000,
    thetaRest: -58, thetaFlip: 142,
    pivotY: 1.32, tableH: 0.92,
    N: 60
  };

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 内腔半径(分段线性) */
  function innerR(y) {
    if (y <= 0) return D.rWaist * (y - D.yTip) / (0 - D.yTip);
    return D.rWaist + (D.rMouth - D.rWaist) * (y / D.yMouth);
  }

  /* 数值积分:V(h) 与水重心 yC(h)(h 为注水高度,y ∈ [yTip, h]) */
  var N = D.N, dy = (0 - D.yTip + D.yMouth) / N;
  var cumV = [0], cumM = [0], ys = [D.yTip];
  (function integrate() {
    var yPrev = D.yTip, vAcc = 0, mAcc = 0;
    for (var i = 1; i <= N; i++) {
      var y = D.yTip + i * dy;
      var r1 = innerR(yPrev), r2 = innerR(y);
      var dv = Math.PI * (r1 * r1 + r1 * r2 + r2 * r2) / 3 * dy;   // 圆台
      var ySlice = (yPrev + y) / 2;
      vAcc += dv;
      mAcc += ySlice * dv;
      ys.push(y);
      cumV.push(vAcc);
      cumM.push(mAcc);
      yPrev = y;
    }
  })();
  D.VTotal = cumV[N];
  D.yMouthTop = 0 + D.yMouth;

  /* 注水体积比 f → 注水高度 h、水重心 yC、合重心 yCG(线性插值积分表) */
  function fillState(f) {
    f = clamp(f, 0, 1);
    var target = f * D.VTotal;
    var i = 1;
    while (i < N && cumV[i] < target) i++;
    var v0 = cumV[i - 1], v1 = cumV[i];
    var h = ys[i - 1] + (v1 > v0 ? (target - v0) / (v1 - v0) : 0) * dy;
    var V = target;
    var yC = V > 1e-9 ? (cumM[i - 1] + (h + ys[i - 1]) / 2 * (V - cumV[i - 1])) / V : 0;
    var mWater = D.rho * V;
    var yCG = (D.mWall * D.yWall + mWater * yC) / (D.mWall + mWater);
    return { f: f, h: h, V: V, yC: yC, yCG: yCG };
  }

  /* 交叉点(数值扫描) */
  var fKai = null, fFu = null;
  (function crossings() {
    var prev = null;
    for (var i = 1; i <= 200; i++) {
      var f = i / 200;
      var s = fillState(f);
      if (prev !== null) {
        if (prev.yCG > 0 && s.yCG <= 0 && fKai === null) fKai = f;
        if (prev.yCG < 0 && s.yCG >= 0 && fKai !== null && fFu === null) fFu = f;
      }
      prev = s;
    }
  })();
  D.fKai = fKai; D.fFu = fFu;

  /* 倾角(纯函数):f 与翻转进度 flip(0..1)决定 */
  function vesselAngle(f, flip) {
    if (flip > 0) return D.thetaRest + (D.thetaFlip - D.thetaRest) * flip;
    var s = fillState(f);
    if (s.yCG > 0.002) return D.thetaRest;       // 虚则欹(倚挡)
    if (s.yCG < -0.002) return 0;                 // 中则正
    /* 过渡带:按 yCG 线性插值(rest↔0) */
    var u = clamp(1 - (s.yCG + 0.002) / 0.004, 0, 1);
    return D.thetaRest * (1 - u);
  }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp, innerR: innerR, fillState: fillState, vesselAngle: vesselAngle };

  /* 载入期自检 */
  (function selfCheck() {
    var msg = null;
    if (fKai === null || fFu === null) {
      msg = "欹器重心交叉点自检失败: f欹=" + fKai + " f覆=" + fFu;
    } else if (!(fKai > 0.005 && fKai < 0.10)) {
      msg = "欹器 f欹自检失败: " + fKai.toFixed(3) + " ∉ (0.005, 0.10)";
    } else if (!(fFu > 0.60 && fFu < 0.95)) {
      msg = "欹器 f覆自检失败: " + fFu.toFixed(2) + " ∉ (0.60, 0.95)";
    } else if (!(fKai < fFu)) {
      msg = "欹器顺序自检失败: f欹 ≥ f覆";
    } else if (fillState(0).yCG <= 0) {
      msg = "欹器空器自检失败: 空器合重心应在枢上方(虚则欹)";
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
