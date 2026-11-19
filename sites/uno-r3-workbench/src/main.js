/* 入口：初始化各模块、主循环、交互（拖拽/点击零件/空格暂停/R 重播/1-8 跳阶段） */
(function (UNO3) {
  var lastT = performance.now();
  var raycaster = null, mouse = new THREE.Vector2();
  var downX = 0, downY = 0;
  var PHASE_IDS = ["bare", "smt", "tht", "dip", "conn", "power", "blink", "serial"];

  function boot() {
    UNO3.SceneInit();
    var S3 = UNO3.Scene3D;

    UNO3.orbitCtl = new UNO3.Orbit(S3.camera, S3.renderer.domElement);
    UNO3.Labels.init();
    UNO3.Parts.init();
    UNO3.Dashboard.build();
    UNO3.Timeline.init();
    UNO3.Timeline.start();

    raycaster = new THREE.Raycaster();
    bindInteractions(S3);

    window.addEventListener("resize", function () {
      var stage = document.getElementById("stage");
      S3.camera.aspect = stage.clientWidth / stage.clientHeight;
      S3.camera.updateProjectionMatrix();
      S3.renderer.setSize(stage.clientWidth, stage.clientHeight);
    });

    window.addEventListener("keydown", function (e) {
      if (e.code === "Space") {
        e.preventDefault();
        var p = UNO3.Timeline.togglePause();
        document.getElementById("phase-text").style.opacity = p ? "0.5" : "1";
      } else if (e.code === "KeyR") {
        UNO3.Timeline.restart();
        document.getElementById("phase-text").style.opacity = "1";
      } else if (e.code === "KeyD") {
        document.body.classList.toggle("no-dash");
      } else if (/^Digit[1-8]$/.test(e.code)) {
        UNO3.Timeline.seek(PHASE_IDS[Number(e.code.slice(5)) - 1]);
        document.getElementById("phase-text").style.opacity = "1";
      }
    });

    loop();
  }

  function bindInteractions(S3) {
    var dom = S3.renderer.domElement;
    dom.style.touchAction = "none";
    dom.addEventListener("pointerdown", function (e) { downX = e.clientX; downY = e.clientY; });
    dom.addEventListener("pointerup", function (e) {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;  // 拖拽不算点击
      var rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, S3.camera);
      var groups = [];
      UNO3.Parts.list().forEach(function (p) { if (p.group.visible) groups.push(p.group); });
      var hits = raycaster.intersectObjects(groups, true);
      if (hits.length) {
        var g = hits[0].object;
        while (g && !g.userData.tagAnchor) g = g.parent;
        if (g) {
          var meta = null;
          UNO3.Parts.list().forEach(function (p) { if (p.group === g) meta = p; });
          if (meta) UNO3.Labels.announce(meta.id, g, meta.name, meta.sub, performance.now(), 2200);
        }
      }
    });
    dom.addEventListener("pointermove", function (e) {
      var rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, S3.camera);
      var groups = [];
      UNO3.Parts.list().forEach(function (p) { if (p.group.visible) groups.push(p.group); });
      dom.style.cursor = raycaster.intersectObjects(groups, true).length ? "pointer" : "";
    });
  }

  function loop() {
    requestAnimationFrame(loop);
    var now = performance.now();
    var dt = Math.min((now - lastT) / 1000, 0.12);
    lastT = now;

    UNO3.Timeline.update(dt);          // 内部判断暂停
    UNO3.orbitCtl.update(dt);
    UNO3.SceneUpdate(dt);
    UNO3.Labels.update();
    UNO3.Scene3D.renderer.render(UNO3.Scene3D.scene, UNO3.Scene3D.camera);
    if (!window.UNO3_BOOTED) window.UNO3_BOOTED = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.UNO3 = window.UNO3 || {});
