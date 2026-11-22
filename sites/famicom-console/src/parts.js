/* Famicom 零件 + 飞行装配控制器（含红白壳垂直扣合） */
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
      ctx.font = "bold 15px monospace";
      ctx.textAlign = "center";
      ctx.fillText(text, w / 2, 26);
      if (sub) { ctx.font = "11px monospace"; ctx.fillText(sub, w / 2, 46); }
    });
  }

  function setAnchor(g, y) { g.userData.tagAnchor = new THREE.Vector3(0, y, 0); }

  function build() {
    var M = LS8.Scene3D.M, mesh = LS8.Scene3D.mesh;
    var defs = [];

    function def(id, name, sub, pos, yaw, anchorY, buildFn, delay, mid) {
      var g = buildFn();
      g.position.set(pos[0], pos[1], pos[2]);
      g.rotation.y = yaw || 0;
      setAnchor(g, anchorY);
      root.add(g);
      defs.push({ id: id, name: name, sub: sub, group: g, target: g.position.clone(),
        yaw: yaw || 0, anchorY: anchorY, delay: delay || 0, mid: mid || null });
    }

    function dip(len, label, sub, pins) {
      var g = new THREE.Group();
      var body = new THREE.Mesh(new THREE.BoxGeometry(len, 0.045, 0.12),
        new THREE.MeshStandardMaterial({ map: chipTop(label, sub), roughness: 0.5 }));
      body.castShadow = true;
      g.add(body);
      for (var i = 0; i < (pins || 8); i++) {
        var dx = -len / 2 + 0.02 + i * (len - 0.04) / (pins - 1);
        g.add(mesh(new THREE.BoxGeometry(0.012, 0.012, 0.028), M.gold, dx, -0.01, 0.065));
        g.add(mesh(new THREE.BoxGeometry(0.012, 0.012, 0.028), M.gold, dx, -0.01, -0.065));
      }
      return g;
    }

    /* 1 · Ricoh 2A03（CPU + APU，DIP-40） */
    def("cpu", "理光 2A03", "6502 内核 + 音源 APU", [-0.5, 0.115, 0.12], 0.06, 0.12,
      function () { return dip(0.38, "2A03", "RP2A03-H", 20); }, 0);
    /* 2 · Ricoh 2C02 PPU（DIP-40） */
    def("ppu", "理光 2C02", "PPU 画面处理器", [-0.12, 0.115, 0.12], -0.05, 0.12,
      function () { return dip(0.38, "2C02", "RP2C02-H", 20); }, 1);
    /* 3-4 · 2K SRAM ×2（DIP-24；日版 HVC-001 无 CIC 锁定芯片） */
    def("wramp", "内存 6116", "2K CPU RAM", [0.6, 0.115, 0.22], 0.05, 0.1,
      function () { return dip(0.24, "6116", "SRAM 2K", 12); }, 2);
    def("vram", "显存 6116", "2K PPU RAM", [0.88, 0.115, 0.22], -0.08, 0.1,
      function () { return dip(0.24, "6116", "VRAM 2K", 12); }, 3);
    /* 6 · 晶振 21.477 */
    def("xtal", "晶振 21.477", "21.477 MHZ ÷ 12", [0.3, 0.115, -0.2], 0.3, 0.1,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 10), M.silver, 0, 0, 0).rotateX(Math.PI / 2));
        return g;
      }, 5);
    /* 7 · RF 调制器屏蔽罩 */
    def("rf", "射频屏蔽罩", "RF SHIELD · CH 1/2 · NTSC", [0.72, 0.15, -0.42], -0.05, 0.18,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(0.5, 0.16, 0.3), M.alu, 0, 0, 0));
        g.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 8), M.silver, 0.2, 0, 0.16).rotateX(Math.PI / 2));
        return g;
      }, 6);
    /* 8 · 双手柄（Famicom 内置手柄：I 号带 START/SELECT，II 号带内置麦克风） */
    def("pad1", "手柄 I", "CONTROLLER I · START/SELECT", [-2.55, 0.1, 0.9], 0.35, 0.1,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(0.3, 0.05, 0.18), M.red, 0, 0.02, 0));
        g.add(mesh(new THREE.BoxGeometry(0.05, 0.03, 0.05), M.dark, -0.09, 0.06, 0));
        g.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 8), M.dark, 0.09, 0.05, 0).rotateX(Math.PI / 2));
        g.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 8), M.gold, 0.02, 0.05, 0.03).rotateX(Math.PI / 2));
        return g;
      }, 7);
    def("pad2", "手柄 II", "CONTROLLER II · 内置麦克风", [-2.55, 0.1, 1.25], -0.3, 0.1,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(0.3, 0.05, 0.18), M.red, 0, 0.02, 0));
        g.add(mesh(new THREE.BoxGeometry(0.05, 0.03, 0.05), M.dark, -0.09, 0.06, 0));
        g.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 8), M.dark, 0.09, 0.05, 0).rotateX(Math.PI / 2));
        g.add(mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.015, 10), M.dark, 0.02, 0.052, 0.03));
        return g;
      }, 8);
    /* 9 · 底壳（白） */
    def("shellbottom", "底壳 · 米白", "BOTTOM SHELL · IVORY", [0.05, 0.1, 0.05], 0.03, 0.2,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(2.3, 0.07, 1.5), M.white, 0, 0.02, 0));
        for (var i = 0; i < 4; i++) {
          g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), M.dark,
            -1.0 + (i % 2) * 2.0, 0.06, -0.55 + Math.floor(i / 2) * 1.1));
        }
        return g;
      }, 9);
    /* 10 · 顶壳（红，垂直扣合） */
    def("shelltop", "顶壳 · 酒红", "TOP SHELL · BURGUNDY", [0.05, 0.42, 0.05], 0.03, 0.12,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(2.3, 0.14, 1.5), M.red, 0, 0, 0));
        // 金色卡带口面板
        g.add(mesh(new THREE.BoxGeometry(1.42, 0.05, 0.16), M.gold, -0.1, -0.075, -0.5));
        g.add(mesh(new THREE.BoxGeometry(0.5, 0.04, 0.12), M.dark, -0.1, -0.06, -0.48));
        // 白色前铭牌
        g.add(mesh(new THREE.BoxGeometry(0.62, 0.04, 0.02),
          new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.4 }), 0.55, -0.075, 0.62));
        return g;
      }, 10, { mid: [0.05, 1.7, 0.05] });
    /* 11 · 游戏卡带（NROM 灰卡） */
    def("cart", "游戏卡带", "GAME PAK · NROM-256", [0.05, 0.5, -0.5], 0.02, 0.06,
      function () {
        var g = new THREE.Group();
        var tex = chipTop("GAME PAK", "PRG 32K CHR 8K");
        g.add(mesh(new THREE.BoxGeometry(0.9, 0.06, 0.52), M.plastic, 0, 0, 0));
        var label = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.065, 0.3),
          new THREE.MeshStandardMaterial({ color: 0xd8b13c, roughness: 0.55 }));
        label.position.set(0, 0.004, 0.02);
        g.add(label);
        return g;
      }, 11, { mid: [0.05, 1.9, -0.5] });
    /* 12 · 电源适配器 */
    def("ac", "电源适配器", "AC ADAPTER · DC 10V 850mA", [-2.5, 0.093, 0.35], -0.2, 0.14,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(0.26, 0.12, 0.18), M.plastic, 0, 0.06, 0));
        g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8), M.dark, 0.1, 0.13, 0).rotateZ(Math.PI / 2));
        return g;
      }, 12);
    /* 13 · RF 开关盒 */
    def("rfsw", "射频切换盒", "RF SWITCH · CH 1/2", [-2.5, 0.093, -0.5], 0.2, 0.1,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(0.16, 0.06, 0.1), M.plastic, 0, 0.03, 0));
        g.add(mesh(new THREE.BoxGeometry(0.03, 0.03, 0.02), M.silver, 0, 0.06, 0));
        return g;
      }, 13);
    /* 13b · 电源开关 + 红色电源指示灯（顶壳前缘左侧） */
    def("pwsw", "电源开关", "POWER SWITCH · SLIDE", [-0.92, 0.5, 0.58], 0, 0.1,
      function () {
        var g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(0.16, 0.03, 0.06), M.plastic, 0, 0.015, 0));
        g.add(mesh(new THREE.BoxGeometry(0.05, 0.025, 0.045), M.dark, -0.03, 0.04, 0));
        return g;
      }, 10.5);
    def("pwled", "电源指示灯", "POWER LED · RED", [-0.68, 0.5, 0.6], 0, 0.08,
      function () {
        var g = new THREE.Group();
        var mat = new THREE.MeshStandardMaterial({ color: 0x8a1d16, roughness: 0.3 });
        mat.emissive = new THREE.Color(0xff2b1e);
        mat.emissiveIntensity = 0.55;
        g.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 10), mat, 0, 0.01, 0));
        g.userData.ledMat = mat;
        return g;
      }, 11);
    /* 14 · 螺丝盒 */
    def("tray", "螺丝组", "SCREWS · PH0 · 8 MM", [-2.5, 0.093, -1.15], -0.25, 0.16,
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
      }, 14);

    return defs;
  }

  /* ============ 飞行控制（通用骨架，sealed 安全） ============ */
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
      p.group.visible = false;
      p.begun = false;
      p.sealed = false;
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
      if (!p.begun) return;
      if (!phaseOut) {
        if (p.sealed) return;
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

  /* seek 用：密封「不在本阶段 ids 里」的零件，本阶段零件照常飞入（避免重复计数） */
  function sealOthers(ids) {
    flying = true; phaseOut = false;
    var idSet = {};
    (ids || []).forEach(function (id) { idSet[id] = true; });
    list.forEach(function (p) {
      if (idSet[p.id]) return;
      if (p.sealed) return;
      p.sealed = true;
      p.begun = true; p.landed = true; p.tagShown = true;
      p.group.visible = true;
      p.group.position.copy(p.target);
      p.group.rotation.y = p.yaw;
      if (p.line) { LS8.Scene3D.scene.remove(p.line); p.line = null; }
      seatedCount++;
    });
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
    group: groupById, sealAll: sealAll, sealOthers: sealOthers,
    get seatedCount() { return seatedCount; },
    get flying() { return flying && !phaseOut; },
    list: function () { return list; }
  };
})(window.LS8 = window.LS8 || {});
