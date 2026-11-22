/* 油榨 — 尺寸常量与撞楔压榨运动学求解器
   文献依据:《天工开物·膏液》「凡榨……其下承盘……撞楔既进,则油自隙流出」
   ——重木榨框内置麹饼束,悬锤摆击撞楔,楔进则榨板前压,油自饼底渗出入盘。

   运动学(载入期断言):
     悬锤摆:枢 (1.35, 2.00),臂长 L = 1.45,摆幅 φ = 0.58 rad(33°)
     锤速(摆底) v = L·φ̇max = 1.45 × 0.58 × π = 2.64 m/s ∈ (2, 4)
     每击楔进 dHit = 0.03 m,三击共 0.09;
     榨板行程 = 楔进量;麹饼束压缩率 = 0.09/0.50 = 18% ∈ (0.1, 0.3)
     断言:v ∈ (2,4)、压缩率 ∈ (0.1,0.3)、锤面与楔尾最小间隙 > 0.02。
   坐标系:y 上;榨框沿 x(饼束 x −0.35..0.35),楔自 +x 打入(y 0.55);
   悬锤在 x-y 竖直面摆动,摆底横扫 −x 方向击楔尾。
   全部几何位于全球地面之上(框高 1.15,枢高 2.00,油盘在机前地面)。 */
(function (MECH) {
  var D = {
    /* 榨框 */
    frameX0: -0.62, frameX1: 0.62, frameH: 1.15,
    cakeX0: -0.35, cakeX1: 0.35, cakeY0: 0.30, cakeY1: 0.80, cakeN: 7,
    /* 楔与榨板 */
    plateX: 0.40, wedgeX0: 0.52, wedgeLen: 0.62, wedgeY: 0.55,
    dHit: 0.03, hitN: 3,
    /* 悬锤 */
    pivotX: 1.35, pivotY: 2.00, armL: 1.45, swingA: 0.58,
    period: 2.0, hammerR: 0.12,
    /* 油盘 */
    panX: -0.10, panZ: 0.78, panW: 0.90, panD: 0.42, panH: 0.16,
    cakeThick: 0.50
  };
  D.vHammer = D.armL * D.swingA * Math.PI;          // 2.64 m/s(摆底最大)
  D.wedgeMax = D.hitN * D.dHit;                     // 0.09
  D.compress = D.wedgeMax / D.cakeThick;            // 0.18
  D.gapMin = (D.pivotX - D.hammerR) - (D.wedgeX0 + D.wedgeLen + D.wedgeMax);

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 悬锤摆角(纯函数,周期运动):φ>0 朝 +x 抬起 */
  function swingPhi(t) { return D.swingA * Math.cos(2 * Math.PI * t / D.period); }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp, swingPhi: swingPhi };

  /* 载入期自检 */
  (function selfCheck() {
    var msg = null;
    if (!(D.vHammer > 2 && D.vHammer < 4)) {
      msg = "油榨锤速自检失败: v = " + D.vHammer.toFixed(2) + " ∉ (2,4)";
    } else if (!(D.compress > 0.1 && D.compress < 0.3)) {
      msg = "油榨压缩率自检失败: " + D.compress.toFixed(2) + " ∉ (0.1,0.3)";
    } else if (D.gapMin < 0.02) {
      msg = "油榨间隙自检失败: 锤面-楔尾最小间隙 " + D.gapMin.toFixed(3) + " < 0.02";
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
