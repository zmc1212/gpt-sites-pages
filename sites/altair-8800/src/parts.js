/* 零件建模 + 飞行/垂直插卡装配控制器（支持分阶段子集装配） */
(function (LS8) {
  var list = [];
  var root = null;
  var seatedCount = 0;
  var flying = false, phaseOut = false;
  var t0 = 0;

  function chipTop(text, sub) {
    return LS8.Textures.makeTex(128, 64, function (ctx, w, h) {
      ctx.fillStyle = "#14151a";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "center";
      ctx.fillText(text, w / 2, 26);
      if (sub) { ctx.font = "11px monospace"; ctx.fillText(sub, w / 2, 46); }
    });
  }

  function setAnchor(g, y) { g.userData.tagAnchor = new THREE.Vector3(0, y, 0); }

  function build() {
    var M = LS8.Scene3D.M, mesh = LS8.Scene3D.mesh;
    var defs = [];

    function def(id, name, sub, pos, yaw, anchorY, buildFn, mid) {
      var g = buildFn();
      g.position.set(pos[0], pos[1], pos[2]);
      g.rotation.y = yaw || 0;
      setAnchor(g, anchorY);
      root.add(g);
      defs.push({ id: id, name: name, sub: sub, group: g, target: g.position.clone(),
        yaw: yaw || 0, anchorY: anchorY, mid: mid || null });
    }

    function dip(len, label, sub, pins) {
      var g = new THREE.Group();
      var tex = chipTop(label, sub);
      var body = new THREE.Mesh(new THREE.BoxGeometry(len, 0.045, 0.12),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }));
      body.castShadow = true;
      g.add(body);
      for (var i = 0; i < (pins || 8); i++) {
        var dx = -len / 2 + 0.025 + i * (len - 0.05) / (pins - 1);
        g.add(mesh(new THREE.BoxGeometry(0.014, 0.012, 0.03), M.gold, dx, -0.01, 0.07));
        g.add(mesh(new THREE.BoxGeometry(0.014, 0.012, 0.03), M.gold, dx, -0.01, -0.07));
      }
      return g;
    }

    function card(col, label, chips) {
      var g = new THREE.Group();
      var tex = LS8.Textures.pcb(col, "rgba(110,190,150,0.45)", "", "");
      g.add(mesh(new THREE.BoxGeometry(0.02, 0.3, 0.28), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), 0, 0, 0));
      // S-100 = 100 针卡缘：每侧 50 根金手指（示意画 25 根粗指）
      for (var f = 0; f < 25; f++) {
        g.add(mesh(new THREE.BoxGeometry(0.022, 0.06, 0.007), M.gold, 0, -0.16, -0.14 + f * 0.0116));
      }
      // 卡上芯片阵容（带印字，垂直卡面安装）
      (chips || []).forEach(function (c) {
        var d = dip(c[2], c[3], c[4], c[5]);
        d.rotation.y = Math.PI / 2;
        d.position.set(0.045, c[0], c[1]);
        g.add(d);
      });
      g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), M.silver, 0, 0.12, 0.09));
      return g;
    }

    /* 1 · Intel 8080 CPU */
    def("cpu", "8080 处理器", "INTEL 8080 · 2 MHZ", [0.35, 0.2, -0.02], 0.08, 0.12,
      function () { return dip(0.36, "P8080A", "INTEL © 1974", 12); }, 0);

    /* 2 · 8224 时钟发生器 */
    def("clkgen", "8224 时钟发生器", "8224 CLOCK GENERATOR", [0.62, 0.2, -0.12], -0.12, 0.1,
      function () { return dip(0.22, "8224", "CLK GEN", 5); }, 1);

    /* 3 · 8228 系统控制器 */
    def("syscon", "8228 系统控制器", "8228 SYSTEM CONTROLLER", [0.88, 0.2, -0.02], 0.1, 0.1,
      function () { return dip(0.24, "8228", "SYS CTRL", 6); }, 2);

    /* 4 · 晶振 */
    def("xtal", "晶振 · 18.432 MHZ", "CRYSTAL OSCILLATOR", [1.12, 0.2, -0.12], 0.4, 0.1,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.1, 10), M.silver, 0, 0, 0).rotateX(Math.PI / 2));
        g.add(mesh(new THREE.BoxGeometry(0.05, 0.012, 0.14), M.plastic, 0, -0.03, 0));
        return g;
      }, 3);

    /* 5 · 2102 SRAM（Intel 1K×1，1K RAM 板主力芯片） */
    def("ram", "2102 静态内存", "2102 SRAM · 1024 x 1 BIT", [0.12, 0.2, -0.12], -0.3, 0.1,
      function () { return dip(0.2, "2102", "INTEL 1K", 5); }, 4);

    /* 6-9 · 四块 S-100 扩展卡（垂直插入插槽 7-10，卡上带真实芯片阵容） */
    var cardDefs = [
      ["card1", "1K RAM 内存板", "1K RAM BOARD · S-100 SLOT 7", "#3f7f52", -0.306, 0,
        [[0.12, -0.08, 0.1, "2102", "1Kx1", 8], [0.07, -0.08, 0.1, "2102", "1Kx1", 8], [0.02, -0.08, 0.1, "2102", "1Kx1", 8], [-0.03, -0.08, 0.1, "2102", "1Kx1", 8], [-0.08, -0.08, 0.1, "2102", "1Kx1", 8], [-0.13, -0.08, 0.1, "8212", "LATCH", 6]]],
      ["card2", "2SIO 串口板", "2SIO SERIAL · S-100 SLOT 8", "#8f3f45", -0.182, 1,
        [[0.08, -0.08, 0.16, "6850", "ACIA", 12], [-0.04, -0.08, 0.16, "6850", "ACIA", 12]]],
      ["card3", "PROM 监控板", "PROM MONITOR · S-100 SLOT 9", "#6b4f9c", -0.058, 2,
        [[0.05, -0.08, 0.16, "1702A", "EPROM 256B", 12]]],
      ["card4", "视频输出板", "VIDEO OUT · S-100 SLOT 10", "#2f6f7f", 0.066, 3,
        [[0.08, -0.08, 0.14, "VIDEO", "CRT CTRL", 10], [-0.05, -0.08, 0.14, "BUFFER", "SHIFT", 8]]]
    ];
    cardDefs.forEach(function (cd, i) {
      def(cd[0], cd[1], cd[2], [cd[4], 0.45, -0.07], 0, 0.35,
        function () { return card(cd[3], cd[1], cd[6]); },
        { mid: [cd[4], 1.5, -0.07], delay: i });
    });

    /* 10 · 前面板组件（真实面板：25 个球头拨动开关） */
    def("panel", "前面板组件", "FRONT PANEL · 25 TOGGLE SWITCHES", [0.62, 0.38, 0.53], 0, 0.3,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(1.24, 0.46, 0.045), M.caseBlue, 0, 0, 0));
        var face = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.4, 0.02), M.panelFace);
        face.position.z = 0.026;
        g.add(face);
        for (var i = 0; i < 10; i++) {
          var x = -0.45 + i * 0.1;
          var lever = mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.055, 6), M.silver, x, -0.165, 0.032);
          lever.rotation.x = i % 2 ? 0.5 : -0.5;
          g.add(lever);
          var ball = mesh(new THREE.SphereGeometry(0.014, 8, 6), M.white, x, -0.165 + (i % 2 ? 0.024 : -0.024), 0.052);
          g.add(ball);
        }
        return g;
      }, 0);

    /* 11 · 电源变压器（+8V 未稳压 · ±16V 总线，板上 8224 分出 8080 三轨） */
    def("xformer", "电源变压器", "PSU · +8V UNREG · ±16V BUS", [-0.3, 0.2, -0.42], 0.2, 0.16,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(0.24, 0.18, 0.2), M.navy, 0, 0, 0));
        var coil = mesh(new THREE.TorusGeometry(0.075, 0.028, 8, 20), M.copper, 0, 0.02, 0);
        coil.rotation.x = Math.PI / 2;
        g.add(coil);
        return g;
      }, 0);

    /* 12 · 滤波电容组 */
    def("caps", "滤波电容组", "FILTER CAPS · 8000 uF", [0.02, 0.2, -0.42], -0.15, 0.16,
      function () {
        var g = new THREE.Group();
        for (var i = 0; i < 2; i++) {
          g.add(mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.14, 12),
            new THREE.MeshStandardMaterial({ color: 0x3d6fa8, roughness: 0.4 }),
            i * 0.11 - 0.05, 0.0, 0));
        }
        return g;
      }, 1);

    /* 13 · 整流散热器 */
    def("rect", "整流散热器", "RECTIFIER HEATSINK · BRIDGE", [1.5, 0.2, -0.42], -0.2, 0.14,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(0.16, 0.1, 0.12), M.alu, 0, 0, 0));
        for (var i = 0; i < 3; i++) g.add(mesh(new THREE.BoxGeometry(0.018, 0.12, 0.12), M.alu, -0.05 + i * 0.05, 0.01, 0));
        return g;
      }, 2);

    /* 14 · 散热风扇 */
    def("fan", "散热风扇", "FAN 115V · BACK WALL", [1.62, 0.32, -0.5], 0, 0.18,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 20), M.plastic, 0, 0, 0).rotateX(Math.PI / 2));
        for (var b = 0; b < 5; b++) {
          var blade = mesh(new THREE.BoxGeometry(0.08, 0.012, 0.02), M.dark, 0, 0, 0);
          blade.rotation.z = (b / 5) * Math.PI * 2;
          blade.position.set(Math.cos(blade.rotation.z) * 0.05, Math.sin(blade.rotation.z) * 0.05, 0.01);
          g.add(blade);
        }
        g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 10), M.pink, 0, 0, 0.008).rotateX(Math.PI / 2));
        return g;
      }, 3);

    /* 15 · 螺丝盒 */
    def("tray", "螺丝盒", "SCREWS · 6-32 · M3", [-2.3, 0.093, 1.75], -0.2, 0.16,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.1, 20), M.plastic, 0, 0.05, 0));
        g.add(mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 20), M.dark, 0, 0.1, 0));
        for (var i = 0; i < 7; i++) {
          var s = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 6), M.silver,
            (Math.random() - 0.5) * 0.22, 0.12, (Math.random() - 0.5) * 0.22);
          s.rotation.z = Math.PI / 2 + (Math.random() - 0.5);
          g.add(s);
        }
        return g;
      }, 0);

    return defs;
  }

  /* ============ 飞行控制 ============ */
  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function init() {
    root = new THREE.Group();
    LS8.Scene3D.scene.add(root);
    list = build();
    list.forEach(function (p) {
      p.duration = 1.15;
      p.start = new THREE.Vector3(-7.8 - Math.random() * 2, 0.6 + Math.random() * 1.6, -1.6 + Math.random() * 2.2);
      p.midPoint = p.mid && p.mid.mid
        ? new THREE.Vector3(p.mid.mid[0], p.mid.mid[1], p.mid.mid[2])
        : new THREE.Vector3(
            p.start.x + (p.target.x - p.start.x) * 0.42,
            1.9 + Math.random() * 0.7,
            p.start.z + (p.target.z - p.start.z) * 0.55 - 0.3
          );
      p.delay = (p.mid && typeof p.mid === "number") ? p.mid
        : (p.mid && p.mid.delay !== undefined) ? p.mid.delay : 0;
      p.group.visible = false;
      p.begun = false;
    });
  }

  function bez(p0, p1, p2, t) {
    var a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
    return new THREE.Vector3(
      a * p0.x + b * p1.x + c * p2.x,
      a * p0.y + b * p1.y + c * p2.y,
      a * p0.z + b * p1.z + c * p2.z
    );
  }

  /* 开始一批零件（可指定子集 ids，默认全部）；span 为阶段内错峰跨度 */
  function begin(now, ids, span) {
    flying = true; phaseOut = false;
    t0 = now;
    /* 阶段内归一化错峰：按 ids 顺序均分 span，保证全部零件在本阶段内落座 */
    var seq = [];
    if (ids) {
      ids.forEach(function (id) {
        for (var k = 0; k < list.length; k++) if (list[k].id === id) { seq.push(list[k]); break; }
      });
    } else {
      seq = list.slice();
    }
    var step = seq.length > 1 ? Math.max(0.18, (span || 2.2) / (seq.length - 1)) : 0;
    seq.forEach(function (p, i) {
      p.flyDelay = i * step;
      p.begun = true;
      p.sealed = false;
      p.landed = false; p.tagShown = false;
      p.group.visible = false;
      if (p.line) { LS8.Scene3D.scene.remove(p.line); p.line = null; }
      var pts = [];
      for (var k = 0; k <= 30; k++) pts.push(bez(p.start, p.midPoint, p.target, k / 30));
      var geo = new THREE.BufferGeometry().setFromPoints(pts);
      var line = new THREE.Line(geo, new THREE.LineDashedMaterial({
        color: 0xff7ab8, dashSize: 0.11, gapSize: 0.075, transparent: true, opacity: 0.8
      }));
      line.computeLineDistances();
      LS8.Scene3D.scene.add(line);
      p.line = line;
      p.lineUntil = Infinity;
    });
  }

  function flyOut(now) {
    if (!flying) return;
    phaseOut = true;
    t0 = now;
    list.forEach(function (p, i) {
      if (!p.begun || !p.group.visible) return;
      p.outDelay = i * 0.12;
      p.outDone = false;
      p.outStart = p.group.position.clone();
      p.outMid = new THREE.Vector3(p.outStart.x - 2.2, 2.4, p.outStart.z - 0.6);
      var pts = [];
      for (var k = 0; k <= 30; k++) pts.push(bez(p.outStart, p.outMid, p.start, k / 30));
      var geo = new THREE.BufferGeometry().setFromPoints(pts);
      var line = new THREE.Line(geo, new THREE.LineDashedMaterial({
        color: 0xff7ab8, dashSize: 0.11, gapSize: 0.075, transparent: true, opacity: 0.6
      }));
      line.computeLineDistances();
      LS8.Scene3D.scene.add(line);
      p.outLine = line;
    });
  }

  function update(now) {
    if (!flying) return;
    list.forEach(function (p) {
      if (!p.begun || p.sealed) return;
      if (!phaseOut) {
        if (p.landed) {
          /* 已落座：钉在目标位，阶段切换 t0 清零也不重飞 */
          p.group.position.copy(p.target);
          p.group.rotation.y = p.yaw;
        } else {
          var t = (now - t0 - p.flyDelay) / p.duration;
          if (t <= 0) return;
          if (!p.tagShown) {
            p.tagShown = true;
            p.group.visible = true;
            LS8.Labels.announce(p.id, p.group, p.name, p.sub, performance.now(), 2600);
          }
          var tt = easeInOut(Math.min(t, 1));
          p.group.position.copy(bez(p.start, p.midPoint, p.target, tt));
          p.group.rotation.y = p.yaw + (1 - tt) * (p.mid && p.mid.mid ? 0.3 : 1.2);
          if (t >= 1 && !p.landed) {
            p.landed = true;
            seatedCount++;
            if (LS8.Audio) LS8.Audio.play("land");
            p.lineUntil = now + 0.55;
          }
        }
        if (p.line) {
          if (now > p.lineUntil) {
            LS8.Scene3D.scene.remove(p.line);
            p.line.geometry.dispose(); p.line.material.dispose();
            p.line = null;
          } else if (p.landed) {
            p.line.material.opacity = Math.max(0, (p.lineUntil - now) / 0.55) * 0.8;
          }
        }
      } else {
        if (!p.begun || p.outDone || !p.group.visible) return;
        var ot = (now - t0 - p.outDelay) / 0.85;
        if (ot <= 0) return;
        var ott = easeInOut(Math.min(ot, 1));
        p.group.position.copy(bez(p.outStart, p.outMid, p.start, ott));
        p.group.rotation.y = p.yaw + ott * 1.6;
        if (p.outLine) p.outLine.material.opacity = Math.max(0.1, 0.6 - ott * 0.5);
        if (ot >= 1) {
          p.outDone = true;
          seatedCount = Math.max(0, seatedCount - 1);
          p.group.visible = false;
          if (p.outLine) {
            LS8.Scene3D.scene.remove(p.outLine);
            p.outLine.geometry.dispose(); p.outLine.material.dispose();
            p.outLine = null;
          }
        }
      }
    });
  }

  function sealAll() {
    flying = true; phaseOut = false;
    list.forEach(function (p) {
      p.sealed = true;
      p.begun = true; p.landed = true; p.tagShown = true;
      p.group.visible = true;
      p.group.position.copy(p.target);
      p.group.rotation.y = p.yaw;
      if (p.line) { LS8.Scene3D.scene.remove(p.line); p.line = null; }
    });
    seatedCount = list.length;
  }

  function reset() {
    flying = false; phaseOut = false; seatedCount = 0;
    list.forEach(function (p) {
      p.begun = false; p.landed = false; p.sealed = false;
      p.group.visible = false;
      if (p.line) { LS8.Scene3D.scene.remove(p.line); p.line = null; }
      if (p.outLine) { LS8.Scene3D.scene.remove(p.outLine); p.outLine = null; }
    });
  }

  function groupById(id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].group;
    return null;
  }

  LS8.Parts = {
    init: init, begin: begin, flyOut: flyOut, update: update, reset: reset,
    group: groupById, sealAll: sealAll,
    get seatedCount() { return seatedCount; },
    get flying() { return flying && !phaseOut; },
    list: function () { return list; }
  };
})(window.LS8 = window.LS8 || {});
