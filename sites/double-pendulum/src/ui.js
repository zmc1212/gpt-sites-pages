/* UI:预设按钮 / 参数滑条 / 显示开关 / 键盘 */
(function (DP) {
  function $(id) { return document.getElementById(id); }
  function bindUI(app) {
    document.querySelectorAll("#side button[data-p]").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll("#side button[data-p]").forEach(function (o) { o.classList.remove("on"); });
        this.classList.add("on");
        app.sim.reset(this.dataset.p);
        $("st-mode").textContent = this.dataset.p.toUpperCase();
      });
    });
    [["s-L1", "L1"], ["s-L2", "L2"], ["s-m1", "m1"], ["s-m2", "m2"], ["s-g", "g"]].forEach(function (pr) {
      $(pr[0]).addEventListener("input", function () {
        this.parentElement.querySelector("b").textContent = (+this.value).toFixed(2);
        var patch = {}; patch[pr[1]] = +this.value;
        app.sim.setParams(patch);
      });
    });
    $("v-ghost").addEventListener("click", function () {
      app.showGhost = !app.showGhost;
      this.classList.toggle("on", app.showGhost);
    });
    $("v-trail").addEventListener("click", function () {
      app.showTrail = !app.showTrail;
      this.classList.toggle("on", app.showTrail);
    });
    $("v-speed").addEventListener("click", function () {
      app.speed = app.speed === 1 ? 2 : app.speed === 2 ? 4 : app.speed === 4 ? 0.25 : 1;
      this.textContent = "速度 " + app.speed + "×";
    });
    window.addEventListener("keydown", function (e) {
      if (e.code === "Space") { e.preventDefault(); app.paused = !app.paused; }
      else if (e.code === "KeyR") { app.sim.reset(app.sim.preset); }
      else if (e.code === "KeyG") { $("v-ghost").click(); }
      else if (e.code === "ArrowUp") { $("v-speed").click(); }
      else if (e.code === "ArrowDown") { $("v-speed").click(); }
      else if (/^Digit[1-4]$/.test(e.code)) {
        var keys = ["quasiperiod", "nearEdge", "chaos", "invert"];
        var b = document.querySelector('button[data-p="' + keys[+e.code.slice(5) - 1] + '"]');
        if (b) b.click();
      }
    });
  }
  DP.bindUI = bindUI;
})(window.DP = window.DP || {});
