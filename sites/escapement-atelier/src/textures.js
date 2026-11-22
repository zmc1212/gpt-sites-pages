/* 程序化 Canvas 贴图：暖调摄影棚背景 / 纸面地台 / 机芯夹板日内瓦圆纹 / 发条螺旋 / 镂空表盘 */
(function (MOVT) {
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

  /* 暖调摄影棚背景（上亮下暗，产品视频打光感） */
  function backdrop() {
    return makeTex(1024, 512, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#f4efe3");
      g.addColorStop(0.55, "#e2d9c6");
      g.addColorStop(1, "#c9bda6");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      function glow(x, y, r, c) {
        var rg = ctx.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, c);
        rg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      glow(w * 0.5, h * 0.34, 340, "rgba(255,250,238,0.55)");
      glow(w * 0.14, h * 0.2, 220, "rgba(248,240,220,0.35)");
      glow(w * 0.86, h * 0.24, 240, "rgba(236,226,204,0.4)");
      /* 角落暗角 */
      var vg = ctx.createRadialGradient(w * 0.5, h * 0.45, h * 0.3, w * 0.5, h * 0.5, h * 1.05);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(58,48,34,0.22)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
    });
  }

  /* 纸面地台：浅奶油色 + 点阵网格 */
  function ground() {
    return makeTex(1024, 1024, function (ctx, w, h) {
      ctx.fillStyle = "#e7e0d1";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(42,39,35,0.10)";
      for (var x = 32; x < w; x += 64) {
        for (var y = 32; y < h; y += 64) {
          ctx.beginPath();
          ctx.arc(x, y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.strokeStyle = "rgba(42,39,35,0.05)";
      ctx.lineWidth = 1;
      for (var q = 0; q < w; q += 256) {
        ctx.beginPath(); ctx.moveTo(q, 0); ctx.lineTo(q, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, q); ctx.lineTo(w, q); ctx.stroke();
      }
    }, { repeat: [7, 7] });
  }

  /* 主夹板黄铜日内瓦圆纹（perlage） */
  function perlage() {
    return makeTex(512, 512, function (ctx, w, h) {
      ctx.fillStyle = "#a8874f";
      ctx.fillRect(0, 0, w, h);
      var step = 30;
      for (var row = 0; row * step < h + step; row++) {
        for (var col = 0; col * step < w + step; col++) {
          var cx = col * step + (row % 2 ? step / 2 : 0);
          var cy = row * step;
          var r = 18;
          var g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
          g.addColorStop(0, "rgba(226,196,142,0.28)");
          g.addColorStop(0.7, "rgba(160,124,68,0.10)");
          g.addColorStop(1, "rgba(120,90,46,0.18)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      /* 细划痕 */
      ctx.strokeStyle = "rgba(255,240,210,0.08)";
      for (var i = 0; i < 40; i++) {
        ctx.beginPath();
        var x = Math.random() * w, y = Math.random() * h;
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 14);
        ctx.stroke();
      }
    }, { repeat: [0.4, 0.4] });
  }

  /* 发条盘：深钢色阿基米德螺旋（贴在条盒内盘上，靠旋转表现“盘紧”） */
  function mainspring() {
    return makeTex(512, 512, function (ctx, w, h) {
      var cx = w / 2, cy = h / 2;
      ctx.fillStyle = "#26242a";
      ctx.beginPath(); ctx.arc(cx, cy, 250, 0, Math.PI * 2); ctx.fill();
      var g = ctx.createRadialGradient(cx, cy, 40, cx, cy, 250);
      g.addColorStop(0, "rgba(90,94,104,0.25)");
      g.addColorStop(1, "rgba(0,0,0,0.4)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, 250, 0, Math.PI * 2); ctx.fill();
      /* 螺旋圈：外圈粗、内圈密 */
      var turns = 6.5, segs = 300;
      ctx.lineCap = "round";
      for (var i = 0; i < segs; i++) {
        var t = i / segs;
        var a = t * turns * Math.PI * 2 + 0.6;
        var r = 42 + t * 196;
        var r2 = (i + 1) / segs;
        var a2 = r2 * turns * Math.PI * 2 + 0.6;
        var r22 = 42 + r2 * 196;
        ctx.strokeStyle = i % 2 ? "#8f939b" : "#777c86";
        ctx.lineWidth = 13 - t * 5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.lineTo(cx + Math.cos(a2) * r22, cy + Math.sin(a2) * r22);
        ctx.stroke();
      }
      /* 条轴 */
      ctx.fillStyle = "#b08d57";
      ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#6e5636";
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
    });
  }

  /* 镂空表盘：外圈乳白章圈（分钟刻度 + 条钉 + 品牌字），中心透明看机芯 */
  function dial() {
    return makeTex(1024, 1024, function (ctx, w, h) {
      var cx = w / 2, cy = h / 2;
      ctx.clearRect(0, 0, w, h);
      /* 乳白盘面 */
      var g = ctx.createRadialGradient(cx, cy - 80, 260, cx, cy, 512);
      g.addColorStop(0, "#f6f1e6");
      g.addColorStop(0.75, "#efeae0");
      g.addColorStop(1, "#ddd4c2");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, 512, 0, Math.PI * 2); ctx.fill();
      /* 中心挖空（镂空窗口 r=389px ≈ 1.9 世界单位） */
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath(); ctx.arc(cx, cy, 389, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      /* 内缘细环 */
      ctx.strokeStyle = "rgba(42,39,35,0.35)";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, 392, 0, Math.PI * 2); ctx.stroke();
      /* 分钟轨道（双线圈 + 刻度） */
      ctx.strokeStyle = "rgba(42,39,35,0.8)";
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(cx, cy, 466, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 506, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < 60; i++) {
        var a = i / 60 * Math.PI * 2;
        var major = i % 5 === 0;
        ctx.strokeStyle = major ? "rgba(42,39,35,0.9)" : "rgba(42,39,35,0.55)";
        ctx.lineWidth = major ? 4 : 1.8;
        var r1 = major ? 462 : 474, r2 = 502;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.stroke();
      }
      /* 条钉（黄铜时标，12 点位留给品牌字） */
      for (var hh = 0; hh < 12; hh++) {
        if (hh === 0 || hh === 6) continue;
        var ang = hh / 12 * Math.PI * 2 - Math.PI / 2;
        ctx.save();
        ctx.translate(cx + Math.cos(ang) * 428, cy + Math.sin(ang) * 428);
        ctx.rotate(ang + Math.PI / 2);
        ctx.fillStyle = "#b08d57";
        ctx.strokeStyle = "rgba(42,39,35,0.5)";
        ctx.lineWidth = 2;
        var bw = 30, bh = 64;
        if (hh % 3 === 0) bw = 38;
        ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
        ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
        ctx.restore();
      }
      /* 品牌字（12 点位） */
      ctx.fillStyle = "rgba(42,39,35,0.92)";
      ctx.font = "700 34px Georgia, 'Times New Roman', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ATELIER", cx, cy - 428);
      ctx.font = "600 22px Georgia, serif";
      ctx.fillStyle = "rgba(140,47,57,0.9)";
      ctx.fillText("2892", cx, cy - 392);
      /* 6 点位小字 */
      ctx.fillStyle = "rgba(42,39,35,0.65)";
      ctx.font = "600 20px monospace";
      ctx.fillText("AUTOMATIC", cx, cy + 430);
    });
  }

  MOVT.Textures = {
    makeTex: makeTex,
    backdrop: backdrop,
    ground: ground,
    perlage: perlage,
    mainspring: mainspring,
    dial: dial
  };
})(window.MOVT = window.MOVT || {});
