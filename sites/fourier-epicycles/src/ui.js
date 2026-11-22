/* UI 绑定:滑条/按钮/键盘/手绘捕捉 */
(function (FE) {
  function $(id) { return document.getElementById(id); }
  function bindUI(app) {
    function setN(n) {
      app.N = Math.max(1, Math.min(FE.MATH.M, n));
      $("n-slider").value = app.N;
      app.recompute();
    }
    $("n-slider").addEventListener("input", function () { setN(+this.value); });
    function preset(which) {
      app.setPath(which === "heart" ? FE.SIM.heart()
        : which === "star" ? FE.SIM.star(5, 0.45)
        : FE.SIM.gear(12, 0.22));
      ["b-heart", "b-star", "b-gear", "b-draw"].forEach(function (id) { $(id).classList.remove("on"); });
      $("b-" + which).classList.add("on");
      app.drawMode = which === "draw";
      app.renderer.drawMode = app.drawMode;
      $("st-mode").textContent = app.drawMode ? "DRAW" : "REPLAY";
    }
    $("b-heart").addEventListener("click", function () { preset("heart"); });
    $("b-star").addEventListener("click", function () { preset("star"); });
    $("b-gear").addEventListener("click", function () { preset("gear"); });
    $("b-draw").addEventListener("click", function () { preset("draw"); });
    [["v-circles", "showCircles"], ["v-arms", "showArms"], ["v-target", "showTarget"]].forEach(function (pr) {
      $(pr[0]).addEventListener("click", function () {
        app.renderer[pr[1]] = !app.renderer[pr[1]];
        this.classList.toggle("on", app.renderer[pr[1]]);
      });
    });
    $("v-speed").addEventListener("click", function () {
      app.renderer.speed = app.renderer.speed === 1 ? 2 : app.renderer.speed === 2 ? 0.5 : 1;
      this.textContent = "速度 " + app.renderer.speed + "×";
    });

    /* 键盘 */
    window.addEventListener("keydown", function (e) {
      if (e.code === "Space") { e.preventDefault(); app.paused = !app.paused; }
      else if (e.code === "KeyR") { app.renderer.penClear(); app.t = 0; }
      else if (e.code === "KeyC") { preset("draw"); app.renderer.drawing = []; }
      else if (e.code === "ArrowUp") { setN(app.N * 2); }
      else if (e.code === "ArrowDown") { setN(Math.max(1, Math.floor(app.N / 2))); }
      else if (e.code === "Digit1") { preset("heart"); }
      else if (e.code === "Digit2") { preset("star"); }
      else if (e.code === "Digit3") { preset("gear"); }
    });

    /* 手绘捕捉(指针,归一到世界坐标) */
    var cv = $("view");
    function ptWorld(e) {
      var r = cv.getBoundingClientRect();
      var R = app.renderer;
      return [(e.clientX - r.left - R.cx) / R.scale, (e.clientY - r.top - R.cy) / R.scale];
    }
    cv.addEventListener("pointerdown", function (e) {
      if (!app.drawMode) return;
      app.renderer.drawing = [ptWorld(e)];
      app.renderer.penClear();
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener("pointermove", function (e) {
      if (!app.drawMode || !app.renderer.drawing.length) return;
      var p = ptWorld(e);
      var last = app.renderer.drawing[app.renderer.drawing.length - 1];
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 0.012) app.renderer.drawing.push(p);
    });
    cv.addEventListener("pointerup", function () {
      if (!app.drawMode) return;
      var d = app.renderer.drawing;
      if (d.length > 8) {
        app.setPath(FE.SIM.normalize(FE.SIM.resample(d)));
        $("st-mode").textContent = "REPLAY";
      }
      app.renderer.drawing = [];
    });
  }
  FE.bindUI = bindUI;
})(window.FE = window.FE || {});
