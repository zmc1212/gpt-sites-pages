/* 程序化 Canvas 贴图:图纸背景 / 钢板地面 / 活塞环槽 / 橙色铸面 / 铭牌 / 光斑 */
(function (V8SB) {
  function makeTex(w, h, draw, opts) {
    opts = opts || {};
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    var tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 8;
    tex.encoding = THREE.sRGBEncoding;
    if (opts.repeat) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(opts.repeat[0], opts.repeat[1]);
    }
    return tex;
  }

  /* 深灰图纸背景:淡网格 + 十字定位 + 橙色裁切角标 */
  function blueprint() {
    return makeTex(1024, 512, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, w * 0.35, h);
      g.addColorStop(0, "#303338");
      g.addColorStop(0.55, "#282A2E");
      g.addColorStop(1, "#24262A");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(230,230,228,0.05)";
      ctx.lineWidth = 1;
      for (var x = 0; x < w; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (var y = 0; y < h; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = "rgba(230,230,228,0.09)";
      for (var x2 = 0; x2 < w; x2 += 256) { ctx.beginPath(); ctx.moveTo(x2, 0); ctx.lineTo(x2, h); ctx.stroke(); }
      for (var y2 = 0; y2 < h; y2 += 256) { ctx.beginPath(); ctx.moveTo(0, y2); ctx.lineTo(w, y2); ctx.stroke(); }
      // 中心十字与圆规线
      ctx.strokeStyle = "rgba(230,230,228,0.1)";
      ctx.beginPath(); ctx.arc(w / 2, h / 2, 190, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w / 2 - 210, h / 2); ctx.lineTo(w / 2 + 210, h / 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w / 2, h / 2 - 130); ctx.lineTo(w / 2, h / 2 + 130); ctx.stroke();
      // 橙色角标
      ctx.strokeStyle = "rgba(232,97,28,0.5)";
      ctx.lineWidth = 2;
      var m = 26, l = 30;
      ctx.beginPath(); ctx.moveTo(m, m + l); ctx.lineTo(m, m); ctx.lineTo(m + l, m); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - m - l, h - m); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m, h - m - l); ctx.stroke();
    });
  }

  /* 车间钢板地面:细网格 + 划线 + 铭文 */
  function floor() {
    return makeTex(1024, 1024, function (ctx, w, h) {
      ctx.fillStyle = "#24262A";
      ctx.fillRect(0, 0, w, h);
      var n = 40, seed = 11;
      function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      for (var i = 0; i < 1400; i++) {
        ctx.fillStyle = "rgba(255,255,255," + (rnd() * 0.022) + ")";
        ctx.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2);
      }
      ctx.strokeStyle = "rgba(230,230,228,0.07)";
      ctx.lineWidth = 1;
      for (var x = 0; x <= w; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (var y = 0; y <= h; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = "rgba(230,230,228,0.13)";
      ctx.lineWidth = 1.6;
      for (var x2 = 0; x2 <= w; x2 += 256) { ctx.beginPath(); ctx.moveTo(x2, 0); ctx.lineTo(x2, h); ctx.stroke(); }
      for (var y2 = 0; y2 <= h; y2 += 256) { ctx.beginPath(); ctx.moveTo(0, y2); ctx.lineTo(w, y2); ctx.stroke(); }
      // 装配位划线(橙)
      ctx.strokeStyle = "rgba(232,97,28,0.4)";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([18, 12]);
      ctx.strokeRect(w / 2 - 220, h / 2 - 170, 440, 340);
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(w / 2, h / 2, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w / 2 - 26, h / 2); ctx.lineTo(w / 2 + 26, h / 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w / 2, h / 2 - 26); ctx.lineTo(w / 2, h / 2 + 26); ctx.stroke();
      ctx.fillStyle = "rgba(230,230,228,0.3)";
      ctx.font = "bold 26px monospace";
      ctx.fillText("IRONLINE · SB-350 · ASSEMBLY STAGE", w / 2 - 300, h / 2 + 220);
      ctx.font = "18px monospace";
      ctx.fillStyle = "rgba(232,97,28,0.55)";
      ctx.fillText("FIG. 06 — 90° V8 · FIRING 1-8-4-3-6-5-7-2", w / 2 - 300, h / 2 + 250);
      // 边缘刻度
      ctx.fillStyle = "rgba(230,230,228,0.22)";
      ctx.font = "14px monospace";
      for (var t = 0; t <= w; t += 128) {
        ctx.fillText(String(t / 128), t + 4, 18);
        ctx.fillText(String(t / 128), 6, t + 4);
      }
    });
  }

  /* 活塞侧面:银色 + 三道环槽 + 机加工细纹 */
  function pistonSide() {
    return makeTex(128, 128, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#C9CDD3");
      g.addColorStop(0.5, "#B8BCC2");
      g.addColorStop(1, "#A6AAB0");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      for (var x = 0; x < w; x += 5) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      // 环槽(顶部两道气环 + 一道油环)
      var grooves = [16, 30, 108];
      for (var i = 0; i < grooves.length; i++) {
        ctx.fillStyle = "rgba(20,22,26,0.85)";
        ctx.fillRect(0, grooves[i], w, 6);
        ctx.fillStyle = "rgba(60,63,68,0.9)";
        ctx.fillRect(0, grooves[i] + 4, w, 2);
      }
    }, { repeat: [3, 1] });
  }

  /* 橙色铸造表面:噪声 + 流痕 + 铸字感 */
  function castOrange() {
    return makeTex(512, 512, function (ctx, w, h) {
      ctx.fillStyle = "#E8611C";
      ctx.fillRect(0, 0, w, h);
      var n = 46, seed = 23;
      function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      for (var i = 0; i < 260; i++) {
        var dark = rnd() > 0.5;
        ctx.fillStyle = dark ? "rgba(120,45,10," + (0.05 + rnd() * 0.1) + ")" : "rgba(255,150,80," + (0.04 + rnd() * 0.08) + ")";
        ctx.beginPath();
        ctx.arc(rnd() * w, rnd() * h, 4 + rnd() * 30, 0, Math.PI * 2);
        ctx.fill();
      }
      for (var s = 0; s < 26; s++) {
        ctx.strokeStyle = "rgba(120,45,10," + (0.05 + rnd() * 0.06) + ")";
        ctx.lineWidth = 1 + rnd() * 2;
        var y = rnd() * h;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (var x = 0; x <= w; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.03 + s) * 4);
        ctx.stroke();
      }
      var vg = ctx.createLinearGradient(0, 0, 0, h);
      vg.addColorStop(0, "rgba(255,255,255,0.05)");
      vg.addColorStop(1, "rgba(60,20,4,0.14)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
    });
  }

  /* 机体侧面铭牌(透明底深色字) */
  function stamp() {
    return makeTex(512, 128, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(40,17,4,0.78)";
      ctx.font = "bold 44px monospace";
      ctx.fillText("IRONLINE · SB-350", 22, 52);
      ctx.font = "22px monospace";
      ctx.fillText("350 C.I.D. · 90° V8 · CAST IRON 151", 22, 92);
      ctx.strokeStyle = "rgba(40,17,4,0.6)";
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 12, w - 20, h - 24);
    });
  }

  /* 柔光斑(火花 / 热浪粒子) */
  function glow() {
    return makeTex(64, 64, function (ctx, w, h) {
      var g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
  }

  V8SB.Textures = {
    makeTex: makeTex,
    blueprint: blueprint,
    floor: floor,
    pistonSide: pistonSide,
    castOrange: castOrange,
    stamp: stamp,
    glow: glow
  };
})(window.V8SB = window.V8SB || {});
