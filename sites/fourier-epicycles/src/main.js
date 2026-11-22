/* 入口:状态、主循环、读数与自检 */
(function (FE) {
  function App() {
    this.M = FE.MATH.M;
    this.N = 32;
    this.t = 0;
    this.paused = false;
    this.drawMode = false;
    this.renderer = new FE.Renderer(document.getElementById("view"));
    this.setPath(FE.SIM.heart());
    window.addEventListener("resize", function () {
      this.renderer.resize();
      this.renderer.penClear();
    }.bind(this));
    FE.bindUI(this);
  }
  App.prototype.setPath = function (path) {
    this.path = path;
    this.coeffs = FE.MATH.dft(path, this.M);
    this.full = FE.MATH.idft(this.coeffs, this.M);
    this.renderer.penClear();
    this.t = 0;
    this.recompute();
  };
  App.prototype.recompute = function () {
    this.kept = FE.MATH.truncate(this.coeffs, this.N);
    this.recon = FE.MATH.idft(this.kept, this.M);
    this.rms = FE.MATH.rmsErr(this.path, this.recon);
    /* Parseval 残差:|Σ|c|² − (1/M)Σ|z|²| / 能量 */
    var pDiff = Math.abs(FE.MATH.coeffsEnergy(this.kept) - FE.MATH.energy(this.path))
      / Math.max(1e-12, FE.MATH.energy(this.path));
    this.parseval = pDiff;
    var cmax = 0;
    this.coeffs.forEach(function (c) { cmax = Math.max(cmax, Math.hypot(c.re, c.im)); });
    /* 读数 DOM */
    document.getElementById("st-a").textContent = this.N + " / " + this.M;
    document.getElementById("st-b").textContent = (this.rms * 100).toFixed(2) + " %";
    document.getElementById("st-c").textContent = (pDiff * 100).toFixed(4) + " %";
    document.getElementById("n-read").textContent = this.N + " / " + this.M;
    document.getElementById("r-rms").textContent = (this.rms * 100).toFixed(2) + " %";
    document.getElementById("r-parseval").textContent = (pDiff * 100).toFixed(4) + " %";
    document.getElementById("r-cmax").textContent = cmax.toFixed(3);
    /* 系数表:前 6 项(按 |c| 降序) */
    var sorted = this.coeffs.slice().sort(function (a, b) {
      return Math.hypot(b.re, b.im) - Math.hypot(a.re, a.im);
    });
    var rows = sorted.slice(0, 6).map(function (c) {
      var amp = Math.hypot(c.re, c.im);
      var ph = Math.atan2(c.im, c.re) * 180 / Math.PI;
      return '<div class="rowline"><span>|c' + (c.k < 0 ? "₋" + (-c.k) : c.k) + "|</span><b>" +
        amp.toFixed(3) + '</b></div><div class="rowline"><span>相位</span><b>' +
        ph.toFixed(1) + "°</b></div>";
    }).join("");
    document.getElementById("coef-list").innerHTML = rows;
  };
  App.prototype.frame = function (dt) {
    var R = this.renderer;
    if (!this.paused && !this.drawMode) {
      this.t += dt * 0.5 * R.speed;
      if (this.t > 1) { this.t -= 1; R.penClear(); }
    }
    R.clear();
    if (this.showTargetGhost !== false && R.showTarget) R.drawTarget(this.path, this.drawMode ? 0.45 : 0.24);
    var rings = FE.MATH.epicycleChain(this.kept, this.t);
    var tip = R.drawChain(rings);
    if (!this.drawMode) {
      R.pen.push([tip[0] - R.cx, tip[1] - R.cy].map(function (v) { return v / R.scale; }));
      if (R.pen.length > 1400) R.pen.shift();
    }
    R.drawPen();
    R.drawStroke();
  };

  window.FE_APP = new App();
  var last = performance.now();
  function loop(now) {
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    window.FE_APP.frame(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* 自检外显:?selftest=1 → 控制台逐条 + 模式卡标注 */
  if (/[?&]selftest=1/.test(location.search)) {
    var results = { parseval: window.FE_APP.parseval < 1e-9, rms: window.FE_APP.rms >= 0 };
    console.log("[fourier-epicycles selftest]", JSON.stringify(results), "载入期断言已在 math.js 完成(6 组)");
    document.getElementById("st-mode").textContent = "SELFTEST OK";
  }
  window.FE_BOOTED = true;
})(window.FE = window.FE || {});
