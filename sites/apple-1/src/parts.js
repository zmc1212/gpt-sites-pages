/* Apple I 零件 + 飞行装配控制器 */
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

    function def(id, name, sub, pos, yaw, anchorY, buildFn, delay) {
      var g = buildFn();
      g.position.set(pos[0], pos[1], pos[2]);
      g.rotation.y = yaw || 0;
      setAnchor(g, anchorY);
      root.add(g);
      defs.push({ id: id, name: name, sub: sub, group: g, target: g.position.clone(),
        yaw: yaw || 0, anchorY: anchorY, delay: delay || 0 });
    }

    function dip(len, label, sub, pins) {
      var g = new THREE.Group();
      var tex = chipTop(label, sub);
      var body = new THREE.Mesh(new THREE.BoxGeometry(len, 0.045, 0.12),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }));
      body.castShadow = true;
      g.add(body);
      for (var i = 0; i < (pins || 8); i++) {
        var dx = -len / 2 + 0.02 + i * (len - 0.04) / (pins - 1);
        g.add(mesh(new THREE.BoxGeometry(0.012, 0.012, 0.028), M.gold, dx, -0.01, 0.065));
        g.add(mesh(new THREE.BoxGeometry(0.012, 0.012, 0.028), M.gold, dx, -0.01, -0.065));
      }
      return g;
    }

    /* 1 · MOS 6502 CPU（DIP-40） */
    def("cpu", "6502 处理器", "MOS 6502 · 1.023 MHZ", [-0.35, 0.115, 0.1], 0.05, 0.12,
      function () { return dip(0.38, "MOS 6502", "MOS TECH © 1975", 20); }, 0);

    /* 2 · Signetics 2513 字符发生器（DIP-24） */
    def("chargen", "字符发生器 2513", "S2513 · 5 x 7 UPPER", [-0.75, 0.115, 0.0], -0.1, 0.1,
      function () { return dip(0.3, "S2513", "SIGNETICS", 12); }, 1);

    /* 2b · Woz Monitor PROM（256B） */
    def("prom", "监控 PROM", "WOZ MONITOR · 256B", [-0.45, 0.115, -0.2], -0.04, 0.1,
      function () { return dip(0.24, "PROM 256B", "WOZ MONITOR", 8); }, 1.5);

    /* 2c · MC6820 PIA（键盘 + 磁带 I/O，DIP-40） */
    def("pia", "外设接口 PIA", "MC6820 · KEYBOARD + CASSETTE I/O", [-1.35, 0.115, -0.05], 0.03, 0.12,
      function () { return dip(0.38, "MC6820", "PIA · I/O", 20); }, 1.3);

    /* 3-10 · 4K RAM ×8（MK4096 · 4KB，2×8 插座排的第 1 排） */
    var ramPos = [];
    for (var ri = 0; ri < 8; ri++) ramPos.push([-0.85 + ri * 0.225, 0.3]);
    ramPos.forEach(function (p, i) {
      def("ram" + (i + 1), "内存 4096", "MK 4096 · 4KBIT", [p[0], 0.115, p[1]], 0.02, 0.1,
        function () { return dip(0.2, "4096", "MK 4096", 8); }, i * 0.5);
    });

    /* 11 · 主晶振（14.31818 MHz，÷14 → 1.023 MHz CPU 时钟） */
    def("xtal1", "主晶振 14.31818", "14.31818 MHZ · ÷14 → 1.023", [-0.1, 0.115, -0.35], 0.3, 0.1,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.09, 10), M.silver, 0, 0, 0).rotateX(Math.PI / 2));
        return g;
      }, 3.0);

    /* 9 · 7805 + 散热片 */
    def("reg", "稳压 7805", "5V REGULATOR + HEAT SINK", [-1.0, 0.135, -0.35], 0, 0.24,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(0.1, 0.1, 0.06), M.dark, 0, 0.05, 0));
        for (var i = 0; i < 5; i++) {
          g.add(mesh(new THREE.BoxGeometry(0.016, 0.09, 0.08), M.alu, -0.04 + i * 0.02, 0.12, 0));
        }
        return g;
      }, 0.3);

    /* 10 · 2N3055 TO-3 通过晶体管 */
    def("to3", "调整管 2N3055", "2N3055 · TO-3 CAN", [-1.05, 0.115, -0.08], 0.15, 0.12,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 8), M.silver, 0, 0.02, 0));
        g.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 8), M.dark, 0, -0.015, 0));
        return g;
      }, 0.8);

    /* 11 · RF 调制器盒 */
    def("rfmod", "RF 调制盒", "RF MODULATOR · CH 3 · NTSC", [1.05, 0.135, -0.3], -0.08, 0.16,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(0.5, 0.17, 0.34), M.alu, 0, 0, 0));
        g.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 8), M.silver, 0.2, 0.02, 0.18).rotateX(Math.PI / 2));
        return g;
      }, 0.5);

    /* 12 · 磁带机插孔对 */
    def("jacks", "磁带插孔", "CASSETTE · IN / OUT", [-1.05, 0.115, 0.38], 0.1, 0.1,
      function () {
        var g = new THREE.Group();
        for (var i = 0; i < 2; i++) {
          g.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 12), M.plastic, i * 0.09, 0, 0).rotateX(Math.PI / 2));
          g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 10), M.gold, i * 0.09, 0, 0.03).rotateX(Math.PI / 2));
        }
        return g;
      }, 0.3);

    /* 13 · 键盘连接器 */
    def("kbd", "键盘连接器", "KEYBOARD HDR · 22 PIN", [-0.5, 0.115, -0.55], -0.05, 0.1,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(0.5, 0.04, 0.1), M.plastic, 0, 0, 0));
        for (var i = 0; i < 10; i++) {
          g.add(mesh(new THREE.BoxGeometry(0.015, 0.02, 0.02), M.gold, -0.22 + i * 0.05, 0.03, 0));
        }
        return g;
      }, 0.8);

    /* 14 · 电解电容组 */
    def("caps", "电解电容组", "ELECTROLYTIC · 6.3V · 1000uF", [1.6, 0.115, 0.5], 0.2, 0.12,
      function () {
        var g = new THREE.Group();
        for (var i = 0; i < 3; i++) {
          g.add(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.075, 10),
            new THREE.MeshStandardMaterial({ color: i === 1 ? 0x3d6fa8 : 0x44484f, roughness: 0.4 }),
            i * 0.075 - 0.07, 0.01, 0));
        }
        return g;
      }, 1.3);

    /* 15 · 电阻排 */
    def("res", "电阻排", "RESISTOR · 1/4W · 5%", [1.3, 0.112, 0.75], -0.3, 0.08,
      function () {
        var g = new THREE.Group();
        for (var i = 0; i < 4; i++) {
          var r = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6),
            new THREE.MeshStandardMaterial({ color: 0xb87a5a, roughness: 0.7 }),
            i * 0.075 - 0.1, 0.008, 0);
          r.rotateZ(Math.PI / 2 - 0.1);
          g.add(r);
        }
        return g;
      }, 1.8);

    /* 16 · 螺丝盒 */
    def("tray", "螺丝组", "SCREWS · 4-40 · M2.5", [-2.35, 0.093, 1.9], -0.25, 0.16,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.1, 20), M.plastic, 0, 0.05, 0));
        g.add(mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 20), M.dark, 0, 0.1, 0));
        for (var i = 0; i < 6; i++) {
          var s = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.055, 6), M.silver,
            (Math.random() - 0.5) * 0.22, 0.12, (Math.random() - 0.5) * 0.22);
          s.rotation.z = Math.PI / 2 + (Math.random() - 0.5);
          g.add(s);
        }
        return g;
      }, 0);

    return defs;
  }

  /* ============ 飞行控制（与 Altair 相同骨架） ============ */
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
      p.midPoint = new THREE.Vector3(
        p.start.x + (p.target.x - p.start.x) * 0.42,
        1.9 + Math.random() * 0.7,
        p.start.z + (p.target.z - p.start.z) * 0.55 - 0.3
      );
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

  function begin(now, ids) {
    flying = true; phaseOut = false;
    t0 = now;
    list.forEach(function (p) {
      if (ids && ids.indexOf(p.id) < 0) return;
      p.begun = true;
      p.landed = false; p.tagShown = false;
      p.group.visible = false;
      if (p.line) { LS8.Scene3D.scene.remove(p.line); p.line = null; }
      var pts = [];
      for (var i = 0; i <= 30; i++) pts.push(bez(p.start, p.midPoint, p.target, i / 30));
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
        var t = (now - t0 - p.delay * 0.62) / p.duration;
        if (t <= 0) return;
        if (!p.tagShown) {
          p.tagShown = true;
          p.group.visible = true;
          LS8.Labels.announce(p.id, p.group, p.name, p.sub, performance.now(), 2600);
        }
        var tt = easeInOut(Math.min(t, 1));
        p.group.position.copy(bez(p.start, p.midPoint, p.target, tt));
        p.group.rotation.y = p.yaw + (1 - tt) * 1.2;
        if (t >= 1 && !p.landed) {
          p.landed = true;
          seatedCount++;
          if (LS8.Audio) LS8.Audio.play("land");
          p.lineUntil = now + 0.55;
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
