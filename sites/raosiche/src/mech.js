/* 缫丝车 — 尺寸常量与踏板-移丝运动学求解器
   文献依据:《天工开物·乃服》「凡缫丝……二人执爨……二人 Pitch 踏板……
   框自转,丝自浮转上」——脚踏曲柄同轴转丝框,偏摆机构使移丝钩往复,
   茧丝经送丝眼绕框成生丝。(引文按本站整理,详见 README。)

   运动学(载入期断言):
     丝框半径 r框 = 0.35(径 0.70);移丝行程 A×2 = 0.28(A = 0.14)
     踏板曲柄 r踏 = 0.11 → 踏板行程 2r = 0.22
     同轴直驱:框角 ψ = 曲柄角;移丝 z钩 = z0 + A·sin ψ(往复:框 = 1:1)
     断言:A×2 = 0.28、2r踏 = 0.22、框宽 ≥ 行程 + 余量。
   坐标系:y 上;框轴沿 z(框面 x-y),框心 (1.10, 0.85, 0.235);
   灶锅在西 (−1.15),丝线:茧 → 移丝钩 (0.35, 1.00, z钩) → 框缘动点。
   全部几何位于全球地面之上(灶高 0.42、锅水面 0.52、框轴 0.85)。 */
(function (MECH) {
  var D = {
    /* 丝框 */
    rFrame: 0.35, frameX: 1.10, frameY: 0.85, frameZ0: 0.05, frameZ1: 0.42,
    omega: 2.4,                                   // 框角速度 rad/s(脚踏)
    /* 移丝 */
    A: 0.14, hookZ0: 0.235, hookX: 0.35, hookY: 1.00,   // 行程半幅/钩位
    guideX: 0.35, guideY: 1.04, guideZ0: -0.10, guideZ1: 0.56,
    /* 踏板 */
    rTread: 0.11, treadZ: 0.52,
    /* 灶锅 */
    stoveX: -1.15, stoveTop: 0.42, basinWater: 0.52,
    cocoX: -1.15, cocoY: 0.50,
    /* 丝线 */
    threadN: 3
  };
  D.frameZc = (D.frameZ0 + D.frameZ1) / 2;      // 0.235
  D.strokeHook = 2 * D.A;                        // 0.28 移丝行程
  D.strokeTread = 2 * D.rTread;                  // 0.22 踏板行程
  D.frameW = D.frameZ1 - D.frameZ0;              // 0.37 框宽

  function deg(a) { return a * 180 / Math.PI; }
  function rad(a) { return a * Math.PI / 180; }
  function ease(t) { return MECH.P.easeInOut(t); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 移丝钩 z 与框缘绕丝点 */
  function hookZ(psi) { return D.hookZ0 + D.A * Math.sin(psi); }
  function windPoint(psi) {
    var a = -psi + 2.1;
    return { x: D.frameX + D.rFrame * Math.cos(a), y: D.frameY + D.rFrame * Math.sin(a), z: hookZ(psi) };
  }

  MECH.DIM = D;
  MECH.KS = { deg: deg, rad: rad, ease: ease, clamp: clamp, hookZ: hookZ, windPoint: windPoint };

  /* 载入期自检:行程、框宽容纳移丝、灶-框几何 */
  (function selfCheck() {
    var msg = null;
    if (Math.abs(D.strokeHook - 0.28) > 1e-9) {
      msg = "缫丝车移丝行程自检失败: 2A = " + D.strokeHook + " ≠ 0.28";
    } else if (Math.abs(D.strokeTread - 0.22) > 1e-9) {
      msg = "缫丝车踏板行程自检失败: 2r踏 = " + D.strokeTread + " ≠ 0.22";
    } else if (D.hookZ0 - D.A < D.frameZ0 || D.hookZ0 + D.A > D.frameZ1) {
      msg = "缫丝车移丝自检失败: 钩位越出框宽";
    }
    if (msg) {
      if (window.MECH_SHOW_BOOT_ERROR) window.MECH_SHOW_BOOT_ERROR(msg);
      throw new Error(msg);
    }
  })();
})(window.MECH = window.MECH || {});
