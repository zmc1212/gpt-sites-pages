/* 入口：初始化各模块、主循环、交互（拖拽/点击零件/空格暂停/R 重播/数字键跳阶段） */
(function (RF35) {
  var lastT = performance.now();
  var raycaster = null, mouse = new THREE.Vector2();
  var downX = 0, downY = 0;

  function boot() {
    RF35.SceneInit();
    var S3 = RF35.Scene3D;

    RF35.orbitCtl = new RF35.Orbit(S3.camera, S3.renderer.domElement);
    RF35.Labels.init();
    RF35.Parts.init();
    RF35.Dashboard.build();
    RF35.Timeline.init();
    RF35.Timeline.start();

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
        var p = RF35.Timeline.togglePause();
        document.getElementById("phase-text").style.opacity = p ? "0.5" : "1";
      } else if (e.code === "KeyR") {
        RF35.Timeline.restart();
        document.getElementById("phase-text").style.opacity = "1";
      } else if (/^Digit[1-8]$/.test(e.code)) {
        var ids = ["body", "shutter", "advance", "optics", "lens", "film", "wind", "shoot"];
        RF35.Timeline.seek(ids[Number(e.code.slice(5)) - 1]);
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
      RF35.Parts.list().forEach(function (p) { if (p.group.visible) groups.push(p.group); });
      var hits = raycaster.intersectObjects(groups, true);
      if (hits.length) {
        var g = hits[0].object;
        while (g && !g.userData.tagAnchor) g = g.parent;
        if (g) {
          var meta = null;
          RF35.Parts.list().forEach(function (p) { if (p.group === g) meta = p; });
          if (meta) RF35.Labels.announce(meta.id, g, meta.name, meta.sub, performance.now(), 2200);
        }
      }
    });
    dom.addEventListener("pointermove", function (e) {
      var rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, S3.camera);
      var groups = [];
      RF35.Parts.list().forEach(function (p) { if (p.group.visible) groups.push(p.group); });
      dom.style.cursor = raycaster.intersectObjects(groups, true).length ? "pointer" : "";
    });
  }

  function loop() {
    requestAnimationFrame(loop);
    var now = performance.now();
    var dt = Math.min((now - lastT) / 1000, 0.12);
    lastT = now;

    RF35.Timeline.update(dt);          // 内部判断暂停
    RF35.orbitCtl.update(dt);
    RF35.SceneUpdate(dt);
    RF35.Labels.update();
    RF35.Scene3D.renderer.render(RF35.Scene3D.scene, RF35.Scene3D.camera);
    if (!window.RF35_BOOTED) window.RF35_BOOTED = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.RF35 = window.RF35 || {});
