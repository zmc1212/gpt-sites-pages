/* 入口:初始化各模块、主循环、键盘/点击交互 */
(function (V8SB) {
  var lastT = performance.now();
  var raycaster = null, mouse = new THREE.Vector2();
  var downX = 0, downY = 0;

  function boot() {
    V8SB.SceneInit();
    var S3 = V8SB.Scene3D;

    V8SB.orbitCtl = new V8SB.Orbit(S3.camera, S3.renderer.domElement);
    V8SB.Labels.init();
    V8SB.Parts.init();
    V8SB.Dashboard.build();
    V8SB.Timeline.init();
    V8SB.Timeline.start();

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
        var p = V8SB.Timeline.togglePause();
        document.getElementById("phase-text").style.opacity = p ? "0.5" : "1";
      } else if (e.code === "KeyR") {
        V8SB.Timeline.restart();
        document.getElementById("phase-text").style.opacity = "1";
      } else if (/^Digit[1-8]$/.test(e.code)) {
        V8SB.Timeline.seekIndex(Number(e.code.slice(5)) - 1);
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
      V8SB.Parts.list().forEach(function (p) { if (p.group.visible) groups.push(p.group); });
      var hits = raycaster.intersectObjects(groups, true);
      if (hits.length) {
        var g = hits[0].object;
        while (g && !g.userData.tagAnchor) g = g.parent;
        if (g) {
          var meta = null;
          V8SB.Parts.list().forEach(function (p) { if (p.group === g) meta = p; });
          if (meta) V8SB.Labels.announce(meta.id, g, meta.name, meta.sub, performance.now(), 2200);
        }
      }
    });
    dom.addEventListener("pointermove", function (e) {
      var rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, S3.camera);
      var groups = [];
      V8SB.Parts.list().forEach(function (p) { if (p.group.visible) groups.push(p.group); });
      dom.style.cursor = raycaster.intersectObjects(groups, true).length ? "pointer" : "";
    });
  }

  function loop() {
    requestAnimationFrame(loop);
    var now = performance.now();
    var dt = Math.min((now - lastT) / 1000, 0.12);
    lastT = now;

    V8SB.Timeline.update(dt);          // 内部判断暂停(暂停时机构定格)
    V8SB.orbitCtl.update(dt);
    V8SB.SceneUpdate(dt);
    V8SB.Labels.update();
    V8SB.Scene3D.renderer.render(V8SB.Scene3D.scene, V8SB.Scene3D.camera);
    if (!window.V8SB_BOOTED) window.V8SB_BOOTED = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.V8SB = window.V8SB || {});
