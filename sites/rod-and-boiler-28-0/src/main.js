/* 入口:初始化各模块、主循环、交互(拖拽/点击零件/空格暂停/R 重播/数字键 1-8) */
(function (ST28) {
  var lastT = performance.now();
  var raycaster = null, mouse = new THREE.Vector2();
  var downX = 0, downY = 0;

  function boot() {
    ST28.SceneInit();
    var S3 = ST28.Scene3D;

    ST28.orbitCtl = new ST28.Orbit(S3.camera, S3.renderer.domElement);
    ST28.Labels.init();
    ST28.Parts.init();
    ST28.Dashboard.build();
    ST28.Timeline.init();
    ST28.Timeline.start();

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
        var p = ST28.Timeline.togglePause();
        document.getElementById("phase-text").style.opacity = p ? "0.5" : "1";
      } else if (e.code === "KeyR") {
        ST28.Timeline.restart();
        document.getElementById("phase-text").style.opacity = "1";
      } else if (/^Digit[1-8]$/.test(e.code)) {
        var ids = ["frame", "cylinders", "linkage", "boiler", "cab", "steam", "start", "cruise"];
        ST28.Timeline.seek(ids[Number(e.code.slice(5)) - 1]);
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
      ST28.Parts.list().forEach(function (p) { if (p.group.visible) groups.push(p.group); });
      var hits = raycaster.intersectObjects(groups, true);
      if (hits.length) {
        var g = hits[0].object, pid = null;
        while (g && !pid) {
          if (g.userData && g.userData.partId) pid = g.userData.partId;
          g = g.parent;
        }
        if (pid) {
          var entry = ST28.Parts.entry(pid);
          if (entry) ST28.Labels.announce(pid, entry.anchor || entry.group, entry.name, entry.sub, performance.now(), 2200);
        }
      }
    });
    dom.addEventListener("pointermove", function (e) {
      var rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, S3.camera);
      var groups = [];
      ST28.Parts.list().forEach(function (p) { if (p.group.visible) groups.push(p.group); });
      dom.style.cursor = raycaster.intersectObjects(groups, true).length ? "pointer" : "";
    });
  }

  function loop() {
    requestAnimationFrame(loop);
    var now = performance.now();
    var dt = Math.min((now - lastT) / 1000, 0.12);
    lastT = now;

    ST28.Timeline.update(dt);          // 内部判断暂停
    ST28.orbitCtl.update(dt);
    ST28.SceneUpdate(dt);
    ST28.Labels.update();
    ST28.Scene3D.renderer.render(ST28.Scene3D.scene, ST28.Scene3D.camera);
    if (!window.ST28_BOOTED) window.ST28_BOOTED = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.ST28 = window.ST28 || {});
