/* 模拟状态:主摆 + 幽灵摆(初值差 δ),定步长 RK4(1/600s),预设 */
(function (DP) {
  function Sim() {
    this.h = 1 / 600;
    this.params = { m1: 1, m2: 1, L1: 1, L2: 1, g: 9.81 };
    this.presets = {
      quasiperiod: { s: [0.4, 0.8, 0, 0], name: "准周期(低能)" },
      nearEdge:    { s: [1.6, 1.6, 0, 0], name: "近临界" },
      chaos:       { s: [2.6, 2.2, 0, 0], name: "深混沌" },
      invert:      { s: [3.10, 3.10, 0, 0], name: "倒立释放" }
    };
    this.reset("chaos");
  }
  Sim.prototype.reset = function (which, deltaTheta) {
    if (which && this.presets[which]) this.preset = which;
    var s0 = this.presets[this.preset].s.slice();
    var d = deltaTheta !== undefined ? deltaTheta : 1e-6;
    this.s = new Float64Array(s0);
    this.ghost = new Float64Array(s0.slice());
    this.ghost[0] += d;
    this.ghostInit = d;
    this.E0 = DP.MATH.energy(this.s, this.params);
    this.time = 0;
    this.trail = [];
    this.ghostTrail = [];
    this.divergence = [];
    this.phaseTrace = [];
  };
  Sim.prototype.setParams = function (patch) {
    var P = this.params;
    ["m1", "m2", "L1", "L2", "g"].forEach(function (k) {
      if (patch[k] !== undefined) P[k] = patch[k];
    });
    this.reset(this.preset);
  };
  /* 步进 n 个物理步(决定论:固定 h 序列) */
  Sim.prototype.step = function (steps) {
    var M = DP.MATH;
    for (var i = 0; i < steps; i++) {
      this.s = M.rk4(this.s, this.params, this.h);
      this.ghost = M.rk4(this.ghost, this.params, this.h);
      this.time += this.h;
      var div = Math.abs(this.ghost[0] - this.s[0]) + Math.abs(this.ghost[1] - this.s[1]);
      this.divergence.push(div);
      this.phaseTrace.push([this.s[0], this.s[1]]);
      if (this.divergence.length > 7200) this.divergence.shift();
      if (this.phaseTrace.length > 7200) this.phaseTrace.shift();
    }
    var tip = tipPos(this.s, this.params);
    this.trail.push(tip);
    var gtip = tipPos(this.ghost, this.params);
    this.ghostTrail.push(gtip);
    if (this.trail.length > 700) this.trail.shift();
    if (this.ghostTrail.length > 700) this.ghostTrail.shift();
    return tip;
  };
  function tipPos(s, p) {
    var x1 = p.L1 * Math.sin(s[0]), y1 = -p.L1 * Math.cos(s[0]);
    var x2 = x1 + p.L2 * Math.sin(s[1]), y2 = y1 - p.L2 * Math.cos(s[1]);
    return [x2, y2, x1, y1];
  }
  Sim.prototype.energyDrift = function () {
    return Math.abs(DP.MATH.energy(this.s, this.params) - this.E0) / Math.max(1e-9, Math.abs(this.E0));
  };
  DP.Sim = Sim;
})(window.DP = window.DP || {});
