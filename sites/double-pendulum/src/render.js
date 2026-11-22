/* 渲染:主视图(双摆+轨迹+幽灵)与三块小图(相位图/发散曲线/能量) */
(function (DP) {
  function Renderer(main, phase, diverge) {
    this.main = main; this.phase = phase; this.diverge = diverge;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    var self = this;
    function fit() {
      var wrap = document.getElementById("stage-wrap");
      /* canvas 为替换元素,inset:0 不拉伸 —— 显式设定 CSS 尺寸 */
      main.style.width = wrap.clientWidth + "px";
      main.style.height = wrap.clientHeight + "px";
      [[main, "mh"], [phase, "ph"], [diverge, "dh"]].forEach(function (it) {
        var c = it[0];
        c.width = c.clientWidth * self.dpr;
        c.height = c.clientHeight * self.dpr;
        var x = c.getContext("2d");
        x.setTransform(self.dpr, 0, 0, self.dpr, 0, 0);
      });
      self.mw = main.clientWidth; self.mh = main.clientHeight;
      self.pw = phase.clientWidth; self.ph = phase.clientHeight;
      self.dw = diverge.clientWidth; self.dh = diverge.clientHeight;
    }
    fit();
    window.addEventListener("resize", fit);
    this.grid();
  }
  Renderer.prototype.grid = function () {
    var x = this.main.getContext("2d");
    x.clearRect(0, 0, this.mw, this.mh);
    x.strokeStyle = "rgba(233,238,242,0.06)";
    x.lineWidth = 1;
    for (var i = 1; i < 12; i++) {
      x.beginPath(); x.moveTo(i * this.mw / 12, 0); x.lineTo(i * this.mw / 12, this.mh); x.stroke();
      x.beginPath(); x.moveTo(0, i * this.mh / 12); x.lineTo(this.mw, i * this.mh / 12); x.stroke();
    }
    /* 悬点 */
    x.strokeStyle = "rgba(176,141,87,0.9)";
    x.lineWidth = 2;
    x.beginPath(); x.moveTo(this.mw / 2 - 9, this.mh * 0.34); x.lineTo(this.mw / 2 + 9, this.mh * 0.34); x.stroke();
    x.beginPath(); x.moveTo(this.mw / 2, this.mh * 0.34 - 5); x.lineTo(this.mw / 2, this.mh * 0.34 + 5); x.stroke();
  };
  Renderer.prototype.worldScale = function () {
    var L = this.sim.params.L1 + this.sim.params.L2;
    return Math.min(this.mw, this.mh) * 0.36 / L;
  };
  Renderer.prototype.pivot = function () {
    return [this.mw / 2, this.mh * 0.34];
  };
  /* 摆系(s,颜色)+ 轨迹 */
  Renderer.prototype.drawArm = function (s, trail, color, ghost) {
    var x = this.main.getContext("2d");
    var p = this.pivot(), k = this.worldScale();
    var P = this.sim.params;
    var x1 = p[0] + P.L1 * Math.sin(s[0]) * k, y1 = p[1] + P.L1 * Math.cos(s[0]) * k;
    var x2 = x1 + P.L2 * Math.sin(s[1]) * k, y2 = y1 + P.L2 * Math.cos(s[1]) * k;
    if (trail.length > 1) {
      x.strokeStyle = color;
      x.globalAlpha = ghost ? 0.4 : 0.55;
      x.lineWidth = 1.4;
      x.beginPath();
      for (var i = 0; i < trail.length; i++) {
        var t = trail[i];
        var tx = p[0] + t[2] * k, ty = p[1] + t[3] * k;
        if (i === 0) x.moveTo(tx, ty); else x.lineTo(tx, ty);
      }
      x.stroke();
      x.globalAlpha = ghost ? 0.25 : 0.38;
      x.beginPath();
      for (var j = 0; j < trail.length; j++) {
        var t2 = trail[j];
        var t2x = p[0] + t2[0] * k, t2y = p[1] + t2[1] * k;
        if (j === 0) x.moveTo(t2x, t2y); else x.lineTo(t2x, t2y);
      }
      x.stroke();
      x.globalAlpha = 1;
    }
    x.strokeStyle = ghost ? "rgba(233,238,242,0.55)" : "rgba(233,238,242,0.95)";
    x.lineWidth = ghost ? 1.6 : 2.4;
    x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(x1, y1); x.lineTo(x2, y2); x.stroke();
    x.fillStyle = ghost ? "rgba(233,238,242,0.5)" : "#B08D57";
    x.beginPath(); x.arc(x1, y1, ghost ? 5 : 7, 0, Math.PI * 2); x.fill();
    x.fillStyle = ghost ? "rgba(233,238,242,0.65)" : (color || "#E9C93C");
    x.beginPath(); x.arc(x2, y2, ghost ? 6 : 9, 0, Math.PI * 2); x.fill();
  };
  /* 相位图 θ1-θ2 */
  Renderer.prototype.drawPhase = function (trace) {
    var x = this.phase.getContext("2d");
    x.clearRect(0, 0, this.pw, this.ph);
    x.strokeStyle = "rgba(233,238,242,0.35)";
    x.strokeRect(1, 1, this.pw - 2, this.ph - 2);
    if (trace.length < 2) return;
    x.strokeStyle = "#7FD8D8";
    x.lineWidth = 1;
    x.beginPath();
    for (var i = 0; i < trace.length; i++) {
      var px = (trace[i][0] / (2 * Math.PI) + 0.5) * this.pw;
      var py = (trace[i][1] / (2 * Math.PI) + 0.5) * this.ph;
      if (i === 0) x.moveTo(px, py); else x.lineTo(px, py);
    }
    x.stroke();
    x.fillStyle = "rgba(233,238,242,0.45)";
    x.font = "600 8px Menlo, monospace";
    x.fillText("θ₂", this.pw / 2 + 3, 11);
    x.fillText("θ₁", this.pw - 14, this.ph / 2 - 3);
  };
  /* 发散曲线 log10|Δθ|(混沌指数增长可视化) */
  Renderer.prototype.drawDiverge = function (divs) {
    var x = this.diverge.getContext("2d");
    x.clearRect(0, 0, this.dw, this.dh);
    x.strokeStyle = "rgba(233,238,242,0.35)";
    x.strokeRect(1, 1, this.dw - 2, this.dh - 2);
    if (divs.length < 2) return;
    /* 抽样绘图 */
    x.strokeStyle = "#D6543A";
    x.lineWidth = 1.2;
    x.beginPath();
    var n = divs.length, maxLog = 1, minLog = -6;
    for (var i = 0; i < n; i++) {
      var v = Math.log10(Math.max(1e-7, divs[i]));
      var px = i / (n - 1) * (this.dw - 6) + 3;
      var py = this.dh - 4 - (v - minLog) / (maxLog - minLog) * (this.dh - 10);
      if (i === 0) x.moveTo(px, py); else x.lineTo(px, py);
    }
    x.stroke();
    x.fillStyle = "rgba(233,238,242,0.45)";
    x.font = "600 8px Menlo, monospace";
    x.fillText("log₁₀|Δθ|  1e-6 → 饱和", 6, 12);
  };
  DP.Renderer = Renderer;
})(window.DP = window.DP || {});
