/* 程序化 Canvas 贴图:洁净间地面 / 转台 / 蜂窝板 / 太阳翼电池片 / 扎带 / 金箔 / 星点 */
(function (ORBW) {
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

  /* 洁净间地面:浅灰蓝环氧地坪 + 细网格 + 转台作业圈 + 字样 */
  function floor() {
    return makeTex(2048, 2048, function (ctx, w, h) {
      ctx.fillStyle = "#d5dde3";
      ctx.fillRect(0, 0, w, h);
      var g = ctx.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, w * 0.62);
      g.addColorStop(0, "rgba(255,255,255,0.5)");
      g.addColorStop(1, "rgba(150,165,178,0.35)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // 细网格(0.5m 格)
      ctx.strokeStyle = "rgba(110,128,142,0.20)";
      ctx.lineWidth = 2;
      var step = w / 26;
      for (var x = 0; x <= w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (var y = 0; y <= h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      // 转台作业圈(金箔虚线 + 双环)
      var cx = w / 2, cy = h / 2, r1 = w * 0.042;
      ctx.strokeStyle = "rgba(201,162,39,0.75)";
      ctx.lineWidth = 7;
      ctx.setLineDash([44, 26]);
      ctx.beginPath(); ctx.arc(cx, cy, r1, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, r1 + 26, 0, Math.PI * 2); ctx.stroke();
      // 圈上刻度
      ctx.strokeStyle = "rgba(120,136,150,0.6)";
      ctx.lineWidth = 4;
      for (var a = 0; a < 24; a++) {
        var ang = a / 24 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * (r1 + 40), cy + Math.sin(ang) * (r1 + 40));
        ctx.lineTo(cx + Math.cos(ang) * (r1 + 64), cy + Math.sin(ang) * (r1 + 64));
        ctx.stroke();
      }
      // 地面字样
      ctx.fillStyle = "rgba(80,96,110,0.5)";
      ctx.font = "bold 44px monospace";
      ctx.fillText("AIT BAY 3 · CLEANROOM ISO 7", cx - r1 - 60, cy + r1 + 150);
      ctx.font = "30px monospace";
      ctx.fillText("AURORA-SW INTEGRATION FLOOR · 28 V GND PWR", cx - r1 - 60, cy + r1 + 200);
      // 角落警示斜纹带
      ctx.save();
      ctx.translate(w * 0.13, h * 0.2);
      ctx.rotate(-0.5);
      for (var i = 0; i < 10; i++) {
        ctx.fillStyle = i % 2 ? "rgba(201,162,39,0.4)" : "rgba(40,48,56,0.35)";
        ctx.fillRect(i * 40, 0, 40, 26);
      }
      ctx.restore();
    });
  }

  /* 转台顶面:深灰盘面 + 径向刻度 + 中心定位 */
  function turntable() {
    return makeTex(1024, 1024, function (ctx, w, h) {
      ctx.fillStyle = "#4a5158";
      ctx.fillRect(0, 0, w, h);
      var g = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w / 2);
      g.addColorStop(0, "rgba(255,255,255,0.16)");
      g.addColorStop(1, "rgba(0,0,0,0.22)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2;
      ctx.strokeStyle = "rgba(220,228,235,0.35)";
      ctx.lineWidth = 3;
      for (var a = 0; a < 36; a++) {
        var ang = a / 36 * Math.PI * 2, r0 = w * 0.40, r1 = w * 0.455;
        if (a % 3 === 0) r0 = w * 0.36;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
        ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(cx, cy, w * 0.30, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(201,162,39,0.5)"; ctx.lineWidth = 4; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, w * 0.062, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(220,228,235,0.5)"; ctx.lineWidth = 5; ctx.stroke();
      ctx.font = "bold 34px monospace";
      ctx.fillStyle = "rgba(220,228,235,0.4)";
      ctx.fillText("TT-04 · 2000 KG", cx + w * 0.10, cy - w * 0.30);
    });
  }

  /* 转台侧边警示斜纹 */
  function hazard() {
    return makeTex(512, 128, function (ctx, w, h) {
      ctx.fillStyle = "#3a4046";
      ctx.fillRect(0, 0, w, h);
      for (var x = -h; x < w + h; x += 44) {
        ctx.fillStyle = (Math.floor(x / 44) % 2) ? "#c9a227" : "#22272d";
        ctx.beginPath();
        ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.lineTo(x + h + 22, 0); ctx.lineTo(x + 22, h);
        ctx.closePath(); ctx.fill();
      }
    }, { repeat: [6, 1] });
  }

  /* 铝蜂窝板面 */
  function honeycomb() {
    return makeTex(512, 384, function (ctx, w, h) {
      ctx.fillStyle = "#33383e";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(158,170,182,0.28)";
      ctx.lineWidth = 1.4;
      var r = 15, dx = r * 1.732, dy = r * 1.5;
      for (var row = -1; row * dy < h + dy; row++) {
        for (var col = -1; col * dx < w + dx; col++) {
          var ox = col * dx + (row % 2 ? dx / 2 : 0), oy = row * dy;
          ctx.beginPath();
          for (var k = 0; k < 6; k++) {
            var a = Math.PI / 6 + k * Math.PI / 3;
            var px = ox + Math.cos(a) * r, py = oy + Math.sin(a) * r;
            if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.stroke();
        }
      }
      // 面板上的装配标记
      ctx.strokeStyle = "rgba(201,162,39,0.6)";
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, w - 60, h - 60);
      ctx.fillStyle = "rgba(210,220,230,0.45)";
      ctx.font = "bold 26px monospace";
      ctx.fillText("PRIMARY STRUCTURE · AL HC-CORE", 44, h / 2 - 8);
      ctx.font = "18px monospace";
      ctx.fillText("SN ASW-0031 · TORQUE 6.2 N·m", 44, h / 2 + 26);
    });
  }

  /* 太阳翼电池片:深蓝基底 + 浅蓝电池格网格 + 银母线 */
  function cells() {
    return makeTex(512, 512, function (ctx, w, h) {
      ctx.fillStyle = "#16234f";
      ctx.fillRect(0, 0, w, h);
      var g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "rgba(46,72,150,0.5)");
      g.addColorStop(1, "rgba(10,16,40,0.55)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      var pad = 26, cw = (w - pad * 2) / 8, ch = (h - pad * 2) / 8;
      for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
          var x = pad + i * cw, y = pad + j * ch;
          ctx.fillStyle = "#2a4387";
          ctx.fillRect(x + 2, y + 2, cw - 4, ch - 4);
          var gg = ctx.createLinearGradient(x, y, x + cw, y + ch);
          gg.addColorStop(0, "rgba(140,180,235,0.34)");
          gg.addColorStop(0.5, "rgba(90,130,205,0.10)");
          gg.addColorStop(1, "rgba(40,70,150,0.30)");
          ctx.fillStyle = gg;
          ctx.fillRect(x + 2, y + 2, cw - 4, ch - 4);
          // 栅线
          ctx.strokeStyle = "rgba(190,214,240,0.30)";
          ctx.lineWidth = 1;
          for (var s = 1; s < 4; s++) {
            ctx.beginPath(); ctx.moveTo(x + 2 + s * (cw - 4) / 4, y + 3); ctx.lineTo(x + 2 + s * (cw - 4) / 4, y + ch - 3); ctx.stroke();
          }
        }
      }
      // 主母线(银)
      ctx.fillStyle = "rgba(205,214,224,0.85)";
      ctx.fillRect(pad - 8, pad - 8, w - (pad - 8) * 2, 5);
      ctx.fillRect(pad - 8, h - pad - 3, w - (pad - 8) * 2, 5);
      // 边框铆点
      ctx.fillStyle = "rgba(205,214,224,0.5)";
      for (var r2 = 0; r2 < 8; r2++) {
        ctx.beginPath(); ctx.arc(12, pad + r2 * ch + ch / 2, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w - 12, pad + r2 * ch + ch / 2, 3.2, 0, Math.PI * 2); ctx.fill();
      }
    });
  }

  /* 锂电池组箱面:黑盒 + 橙色扎带纹 */
  function straps() {
    return makeTex(256, 256, function (ctx, w, h) {
      ctx.fillStyle = "#17191d";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      for (var y = 0; y < h; y += 5) ctx.fillRect(0, y, w, 2);
      // 两条橙色扎带
      [58, 178].forEach(function (x) {
        ctx.fillStyle = "#e08a3a";
        ctx.fillRect(x, 0, 22, h);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        for (var yy = 6; yy < h; yy += 14) ctx.fillRect(x + 2, yy, 18, 3);
      });
      ctx.fillStyle = "rgba(230,236,242,0.7)";
      ctx.font = "bold 22px monospace";
      ctx.fillText("LI-ION 28V", 96, 118);
      ctx.font = "16px monospace";
      ctx.fillText("8S4P · 30 Ah", 96, 146);
    });
  }

  /* 金箔 MLI 皱褶 */
  function foil() {
    return makeTex(256, 256, function (ctx, w, h) {
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(0, 0, w, h);
      var seed = 11;
      function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      for (var i = 0; i < 70; i++) {
        var x = rnd() * w, y = rnd() * h, r = 8 + rnd() * 30;
        ctx.fillStyle = rnd() > 0.5 ? "rgba(255,236,170,0.5)" : "rgba(120,88,20,0.45)";
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (var k = 0; k < 5; k++) ctx.lineTo(x + (rnd() - 0.5) * r * 2, y + (rnd() - 0.5) * r * 2);
        ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = "rgba(90,64,12,0.5)";
      ctx.lineWidth = 1.5;
      for (var c = 0; c < 16; c++) {
        ctx.beginPath();
        var cx = rnd() * w, cy = rnd() * h;
        ctx.moveTo(cx, cy);
        for (var s2 = 0; s2 < 4; s2++) { cx += (rnd() - 0.5) * 60; cy += (rnd() - 0.5) * 60; ctx.lineTo(cx, cy); }
        ctx.stroke();
      }
    });
  }

  /* 星点 sprite(柔边圆点) */
  function starSprite() {
    return makeTex(32, 32, function (ctx, w, h) {
      var g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(235,240,255,0.8)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
  }

  ORBW.Textures = {
    floor: floor,
    turntable: turntable,
    hazard: hazard,
    honeycomb: honeycomb,
    cells: cells,
    straps: straps,
    foil: foil,
    starSprite: starSprite,
    makeTex: makeTex
  };
})(window.ORBW = window.ORBW || {});
