/* 织布机 — 尺寸常量与开口-投梭运动学求解器
   文献依据:汉画像石斜织机(双蹑双综)·《天工开物·乃服》机节——
   双蹑踏板交替,吊综轴使双综一升一降形成梭口,梭子穿行引纬,筘打纬成布。

   运动学(载入期断言):
     综片升降 h = 0.045(半程)→ 梭口高 2h = 0.09 ∈ (0.06, 0.12)
     梭子行程 0.75(x 0.45 → −0.30,布幅);筘打纬行程 0.12
     双蹑 1:1 交替(吊综轴 r 0.04 双绳反向缠绕)
     断言:梭口 0.09 严格(2×0.045)、梭行 0.75、筘程 0.12、梭高 0.05 < 梭口。
   坐标系:y 上;经线沿 x(后经轴 x 0.60 → 前布轴 x −0.55),z 向排开 16 根;
   综框在 x 0.25,筘在 x 0.02,梭沿 x 穿行 z≈0;双蹑在机前下侧。
   全部几何位于全球地面之上(机面 0.72、吊综轴 1.28)。 */
(function (MECH) {
  var D = {
    /* 机与经纬 */
    warpX: 0.60, clothX: -0.55, warpY: 0.72, NW: 16,
    warpZ0: -0.32, warpZ1: 0.32,
    heddleX: 0.25, heddleH: 0.50,
    lift: 0.045,                       // 综半程(梭口 = 2×lift = 0.09)
    reedX: 0.02, reedStroke: 0.12,
    shuttleX0: 0.45, shuttleX1: -0.30, shuttleH: 0.05,
    /* 吊综 */
    shaftX: 0.25, shaftY: 1.28, shaftR: 0.04,
    /* 蹑 */
    pedalZ: 0.50, pedalY: 0.14, pedalSwing: 0.20,
    /* 织造 */
    passPeriod: 3.0,                   // 每梭周期 s
    weftMax: 12
  };
  D.shed = 2 * D.lift;                 // 0.09
  D.shuttleTravel = D.shuttleX0 - D.shuttleX1;   // 0.75
  D.warpDX = (D.warpZ1 - D.warpZ0) / (D.NW - 1);

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 织造一梭的相位(纯函数):p ∈ [0,1)
     0..0.25 踏板换位/开口  0.25..0.55 梭飞  0.55..0.75 筘打纬  0.75..1 停顿 */
  function passPhase(p) {
    var lift1, shuttle, reed;
    if (p < 0.25) {
      var u = ease(p / 0.25);
      lift1 = u;                 // 综1 升
      shuttle = 0; reed = 0;
    } else if (p < 0.55) {
      lift1 = 1;
      shuttle = ease((p - 0.25) / 0.30);
      reed = 0;
    } else if (p < 0.75) {
      lift1 = 1;
      shuttle = 1;
      reed = ease((p - 0.55) / 0.20);
    } else {
      lift1 = 1;
      shuttle = 1; reed = 1;
    }
    return { lift1: lift1, shuttle: shuttle, reed: reed };
  }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp, passPhase: passPhase };

  /* 载入期自检 */
  (function selfCheck() {
    var msg = null;
    if (Math.abs(D.shed - 0.09) > 1e-9) {
      msg = "织布机梭口自检失败: 2×lift = " + D.shed + " ≠ 0.09";
    } else if (Math.abs(D.shuttleTravel - 0.75) > 1e-9) {
      msg = "织布机梭行自检失败: " + D.shuttleTravel + " ≠ 0.75";
    } else if (Math.abs(D.reedStroke - 0.12) > 1e-9) {
      msg = "织布机筘程自检失败: " + D.reedStroke + " ≠ 0.12";
    } else if (D.shuttleH >= D.shed) {
      msg = "织布机开口自检失败: 梭高 ≥ 梭口(梭无法通过)";
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
