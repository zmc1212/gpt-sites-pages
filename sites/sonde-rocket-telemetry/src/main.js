/* 入口：初始化各模块、主循环、交互（拖拽/点击零件/空格暂停/R 重播/数字键跳阶段） */
(function (SRTL) {
  var lastT = performance.now();
  var raycaster = null, mouse = new THREE.Vector2();
  var downX = 0, downY = 0;

  function boot() {
    SRTL.SceneInit();
    var S3 = SRTL.Scene3D;

    SRTL.orbitCtl = new SRTL.Orbit(S3.camera, S3.renderer.domElement);
    SRTL.Labels.init();
    SRTL.FX.init();
    SRTL.Flight.init();
    SRTL.Parts.init();
    SRTL.FX.attachFlame(SRTL.Flight.root());
    SRTL.Parts.registerExternal(SRTL.Flight.externals());
    SRTL.Dashboard.build();
    SRTL.Timeline.init();
    SRTL.Timeline.start();

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
        var p = SRTL.Timeline.togglePause();
        document.getElementById("phase-text").style.opacity = p ? "0.5" : "1";
      } else if (e.code === "KeyR") {
        if (SRTL.Timeline.paused) SRTL.Timeline.togglePause();   // 重播时解除暂停
        SRTL.Timeline.restart();
        document.getElementById("phase-text").style.opacity = "1";
      } else if (/^Digit[1-8]$/.test(e.code)) {
        var ids = ["pad", "airframe", "motor", "fins", "igniter", "countdown", "flight", "recover"];
        SRTL.Timeline.seek(ids[Number(e.code.slice(5)) - 1]);
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
      SRTL.Parts.list().forEach(function (p) {
        if (p.group && p.group.visible) groups.push(p.group);
      });
      var hits = raycaster.intersectObjects(groups, true);
      if (hits.length) {
        var g = hits[0].object;
        while (g && !g.userData.tagAnchor) g = g.parent;
        if (g) {
          var meta = null;
          SRTL.Parts.list().forEach(function (p) { if (p.group === g) meta = p; });
          if (meta) SRTL.Labels.announce(meta.id, g, meta.name, meta.sub, performance.now(), 2200, meta.tone);
        }
      }
    });
    dom.addEventListener("pointermove", function (e) {
      var rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, S3.camera);
      var groups = [];
      SRTL.Parts.list().forEach(function (p) {
        if (p.group && p.group.visible) groups.push(p.group);
      });
      dom.style.cursor = raycaster.intersectObjects(groups, true).length ? "pointer" : "";
    });
  }

  function loop() {
    requestAnimationFrame(loop);
    var now = performance.now();
    var dt = Math.min((now - lastT) / 1000, 0.12);
    lastT = now;

    SRTL.Timeline.update(dt);          // 内部判断暂停（含零件/飞行/特效/相机）
    SRTL.orbitCtl.update(dt);
    SRTL.SceneUpdate(dt);
    SRTL.Labels.update();
    SRTL.Scene3D.renderer.render(SRTL.Scene3D.scene, SRTL.Scene3D.camera);
    if (!window.SRTL_BOOTED) window.SRTL_BOOTED = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.SRTL = window.SRTL || {});
