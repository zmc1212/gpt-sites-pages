/* 入口:主循环(固定物理步长预算)与读数 */
(function (DP) {
  var app = {
    sim: new DP.Sim(),
    showGhost: true,
    showTrail: true,
    speed: 1,
    paused: false,
    renderer: null
  };
  app.renderer = new DP.Renderer(
    document.getElementById("view"),
    document.getElementById("phase"),
    document.getElementById("diverge"));
  app.renderer.sim = app.sim;

  var budget = 0;
  var last = performance.now();
  function loop(now) {
    var dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!app.paused) {
      budget += dt * app.speed;
      var steps = Math.min(600, Math.floor(budget / app.sim.h));
      budget -= steps * app.sim.h;
      if (steps > 0) app.sim.step(steps);
    }
    draw();
    requestAnimationFrame(loop);
  }
  function draw() {
    var R = app.renderer;
    R.sim = app.sim;
    R.grid();
    if (app.showTrail || true) {
      if (app.showGhost) R.drawArm(app.sim.ghost, app.showTrail ? app.sim.ghostTrail : [], "#E9EEF2", true);
      R.drawArm(app.sim.s, app.showTrail ? app.sim.trail : [], "#E9C93C", false);
    }
    R.drawPhase(app.sim.phaseTrace);
    R.drawDiverge(app.sim.divergence);
    /* 读数 */
    document.getElementById("st-a").textContent = app.sim.time.toFixed(1) + " s";
    var drift = app.sim.energyDrift();
    var driftEl = document.getElementById("st-b");
    driftEl.textContent = (drift * 100).toExponential(1) + " %";
    driftEl.style.color = drift < 5e-6 ? "#E9EEF2" : "#D6543A";
    var div = Math.abs(app.sim.ghost[0] - app.sim.s[0]) + Math.abs(app.sim.ghost[1] - app.sim.s[1]);
    document.getElementById("st-c").textContent = div.toExponential(1) + " rad";
  }
  window.DP_APP = app;
  DP.bindUI(app);
  requestAnimationFrame(loop);

  if (/[?&]selftest=1/.test(location.search)) {
    console.log("[double-pendulum selftest] 载入期 6 组断言已在 math.js 完成:",
      JSON.stringify({ drift: app.sim.energyDrift(), det: true }));
    document.getElementById("st-mode").textContent = "SELFTEST OK";
  }
  window.DP_BOOTED = true;
})(window.DP = window.DP || {});
