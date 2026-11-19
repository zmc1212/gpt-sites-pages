/* 入口:初始化各模块、主循环、交互(拖拽/点击零件/空格暂停/R 重播/1-8 跳阶段/SID 字母键音符) */
(function (C64B) {
  var lastT = performance.now();
  var raycaster = null, mouse = new THREE.Vector2();
  var downX = 0, downY = 0;
  var PHASE_IDS = ["pcb", "dram", "custom", "cpu", "rom", "conn", "boot", "sid"];
  /* A S D F G H J K → C4 D4 E4 F4 G4 A4 B4 C5 */
  var NOTE_KEYS = { KeyA: 261.63, KeyS: 293.66, KeyD: 329.63, KeyF: 349.23, KeyG: 392.0, KeyH: 440.0, KeyJ: 493.88, KeyK: 523.25 };

  function visibleGroups() {
    var groups = [];
    C64B.Parts.list().forEach(function (p) { if (p.group.visible) groups.push(p.group); });
    return groups;
  }

  /* 命中对象向上找最近的 tag(板上小件优先于主板整体) */
  function taggedHit(o) {
    while (o) {
      if (o.userData && o.userData.tag) return o;
      o = o.parent;
    }
    return null;
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
      var hits = raycaster.intersectObjects(visibleGroups(), true);
      if (hits.length) {
        var o = taggedHit(hits[0].object);
        if (o) {
          C64B.Labels.announce(o.userData.tagId, o, o.userData.tag.name, o.userData.tag.sub, performance.now(), 2200);
        }
      }
    });
    dom.addEventListener("pointermove", function (e) {
      var rect = dom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, S3.camera);
      dom.style.cursor = raycaster.intersectObjects(visibleGroups(), true).length ? "pointer" : "";
    });
  }

  function boot() {
    C64B.SceneInit();
    var S3 = C64B.Scene3D;

    C64B.orbitCtl = new C64B.Orbit(S3.camera, S3.renderer.domElement);
    C64B.Labels.init();
    C64B.Parts.init();
    C64B.Dashboard.build();
    C64B.Timeline.init();
    C64B.Timeline.start();

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
        if (e.repeat) return;
        var p = C64B.Timeline.togglePause();
        document.getElementById("phase-text").style.opacity = p ? "0.5" : "1";
      } else if (e.code === "KeyR") {
        if (e.repeat) return;
        C64B.Timeline.restart();
        document.getElementById("phase-text").style.opacity = "1";
      } else if (e.code === "KeyD") {
        document.body.classList.toggle("no-dash");
      } else if (/^Digit[1-8]$/.test(e.code)) {
        if (e.repeat) return;
        C64B.Timeline.seek(PHASE_IDS[Number(e.code.slice(5)) - 1]);
        document.getElementById("phase-text").style.opacity = "1";
      } else if (NOTE_KEYS[e.code]) {
        if (e.repeat) return;
        C64B.Timeline.keyNote(NOTE_KEYS[e.code]);
      }
    });

    loop();
  }

  function loop() {
    requestAnimationFrame(loop);
    var now = performance.now();
    var dt = Math.min((now - lastT) / 1000, 0.12);
    lastT = now;

    C64B.Timeline.update(dt);          // 内部判断暂停
    C64B.orbitCtl.update(dt);
    C64B.SceneUpdate(dt);
    C64B.Labels.update();
    C64B.Scene3D.renderer.render(C64B.Scene3D.scene, C64B.Scene3D.camera);
    if (!window.C64B_BOOTED) window.C64B_BOOTED = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.C64B = window.C64B || {});
