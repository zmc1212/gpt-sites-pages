/* 程序化 Canvas 贴图：靶线地贴 / 夜空与深空穹顶 / 箭体蒙皮 / 伞衣条纹 / 光斑 */
(function (SRTL) {

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

  /* ---- 发射场地面（1024px ≈ 320 m，中心为发射坪） ---- */
  function ground() {
    return makeTex(1024, 1024, function (ctx, w, h) {
      var cx = 512, cy = 512, i, x, y, a;
      ctx.fillStyle = "#141b22";
      ctx.fillRect(0, 0, w, h);
      for (i = 0; i < 2400; i++) {
        ctx.fillStyle = "rgba(205,220,235," + (Math.random() * 0.018).toFixed(3) + ")";
        ctx.fillRect(Math.random() * w, Math.random() * h, 1.6, 1.6);
      }
      for (i = 0; i < 1600; i++) {
        ctx.fillStyle = "rgba(0,0,0," + (Math.random() * 0.07).toFixed(3) + ")";
        ctx.fillRect(Math.random() * w, Math.random() * h, 2.6, 2.6);
      }
      /* 细网格（10 m 格）与主网格（40 m 格） */
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(150,178,205,0.11)";
      for (x = 0; x <= w; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (y = 0; y <= h; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = "rgba(150,178,205,0.24)";
      ctx.lineWidth = 1.8;
      for (x = 0; x <= w; x += 128) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (y = 0; y <= h; y += 128) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      /* 距离圈 50 / 80 / 120 m */
      var rings = [[160, "50 M"], [256, "80 M"], [384, "120 M"]];
      ctx.font = "17px monospace";
      for (i = 0; i < rings.length; i++) {
        ctx.strokeStyle = "rgba(232,236,240,0.2)";
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 8]);
        ctx.beginPath(); ctx.arc(cx, cy, rings[i][0], 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(232,236,240,0.4)";
        ctx.fillText(rings[i][1], cx + rings[i][0] * 0.707 + 6, cy - rings[i][0] * 0.707 - 6);
      }
      /* 中心发射坪：警示环 + 靶十字 + 坪方块 + 方向箭头 */
      ctx.strokeStyle = "rgba(242,106,27,0.55)";
      ctx.lineWidth = 5;
      ctx.setLineDash([26, 14]);
      ctx.beginPath(); ctx.arc(cx, cy, 50, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 42, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "rgba(232,236,240,0.4)";
      ctx.beginPath(); ctx.moveTo(cx - 66, cy); ctx.lineTo(cx + 66, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - 66); ctx.lineTo(cx, cy + 66); ctx.stroke();
      ctx.strokeStyle = "rgba(232,236,240,0.28)";
      ctx.strokeRect(cx - 20, cy - 20, 40, 40);
      ctx.fillStyle = "rgba(242,106,27,0.4)";
      ctx.beginPath();
      ctx.moveTo(cx + 58, cy); ctx.lineTo(cx + 44, cy - 7); ctx.lineTo(cx + 44, cy + 7);
      ctx.closePath(); ctx.fill();
      /* 焦痕 */
      for (i = 0; i < 26; i++) {
        a = Math.random() * Math.PI * 2;
        ctx.fillStyle = "rgba(8,10,12," + (0.10 + Math.random() * 0.14).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * (16 + Math.random() * 26), cy + Math.sin(a) * (16 + Math.random() * 26),
          12 + Math.random() * 30, 0, Math.PI * 2);
        ctx.fill();
      }
      /* 标注文字 */
      ctx.fillStyle = "rgba(232,236,240,0.34)";
      ctx.font = "bold 26px monospace";
      ctx.fillText("PAD A · AZURE RANGE", cx - 150, cy + 100);
      ctx.font = "15px monospace";
      ctx.fillStyle = "rgba(232,236,240,0.22)";
      ctx.fillText("SR-290 · RANGE GRID 10 M · TRUE NORTH UP", cx - 150, cy + 122);
      ctx.fillText("DANGER — OPEN RANGE", cx + 130, cy - 108);
    });
  }

  /* ---- 夜空穹顶（地面阶段：深蓝夜色 + 地平辉光 + 少量星） ---- */
  function skyNight() {
    return makeTex(1024, 512, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#03060d");
      g.addColorStop(0.42, "#0a1526");
      g.addColorStop(0.74, "#12253f");
      g.addColorStop(0.92, "#1a3352");
      g.addColorStop(1, "#1e3a5c");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < 110; i++) {
        var sy = Math.random() * h * 0.55;
        ctx.fillStyle = "rgba(220,230,245," + (0.12 + Math.random() * 0.3).toFixed(2) + ")";
        var s = Math.random() < 0.12 ? 1.8 : 1;
        ctx.fillRect(Math.random() * w, sy, s, s);
      }
      var rg = ctx.createRadialGradient(w * 0.5, h * 0.98, 0, w * 0.5, h * 0.98, w * 0.55);
      rg.addColorStop(0, "rgba(90,130,180,0.24)");
      rg.addColorStop(1, "rgba(90,130,180,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, h);
    });
  }

  /* ---- 深空穹顶（高空阶段：近黑 + 星野） ---- */
  function skySpace() {
    return makeTex(1024, 512, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#010207");
      g.addColorStop(0.7, "#030812");
      g.addColorStop(1, "#061020");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      var i;
      for (i = 0; i < 380; i++) {
        ctx.fillStyle = "rgba(226,235,248," + (0.2 + Math.random() * 0.7).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() < 0.85 ? 0.7 : 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
      for (i = 0; i < 30; i++) {
        var x = Math.random() * w, y = Math.random() * h, r = 3 + Math.random() * 6;
        var rg = ctx.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, "rgba(235,242,252,0.9)");
        rg.addColorStop(0.4, "rgba(200,215,240,0.35)");
        rg.addColorStop(1, "rgba(200,215,240,0)");
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      /* 银河淡带 */
      ctx.save();
      ctx.translate(w * 0.5, h * 0.42);
      ctx.rotate(-0.24);
      var band = ctx.createLinearGradient(0, -46, 0, 46);
      band.addColorStop(0, "rgba(160,180,220,0)");
      band.addColorStop(0.5, "rgba(160,180,220,0.09)");
      band.addColorStop(1, "rgba(160,180,220,0)");
      ctx.fillStyle = band;
      ctx.fillRect(-w, -46, w * 2, 92);
      ctx.restore();
    });
  }

  /* ---- 白色箭体蒙皮（蒙在圆柱侧面，v 向上=箭体向上） ---- */
  function skinWhite(main, sub) {
    return makeTex(512, 512, function (ctx, w, h) {
      ctx.fillStyle = "#e9ecef";
      ctx.fillRect(0, 0, w, h);
      var g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, "rgba(0,0,0,0.10)");
      g.addColorStop(0.3, "rgba(255,255,255,0.10)");
      g.addColorStop(0.7, "rgba(255,255,255,0.06)");
      g.addColorStop(1, "rgba(0,0,0,0.14)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      /* 环向缝与铆钉 */
      ctx.strokeStyle = "rgba(40,48,58,0.30)";
      ctx.lineWidth = 2;
      [86, 208, 330, 424].forEach(function (y) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      });
      ctx.fillStyle = "rgba(40,48,58,0.28)";
      for (var x = 16; x < w; x += 32) {
        [80, 202, 324, 418].forEach(function (y) { ctx.fillRect(x, y + 4, 3, 3); });
      }
      /* 主涂装 */
      ctx.fillStyle = "#222933";
      ctx.font = "bold 46px monospace";
      ctx.textAlign = "center";
      ctx.fillText(main || "SR-290", w / 2, 160);
      ctx.fillStyle = "#F26A1B";
      ctx.font = "bold 20px monospace";
      ctx.fillText(sub || "AZURE RANGE", w / 2, 190);
      ctx.beginPath();
      ctx.moveTo(w / 2 - 16, 214); ctx.lineTo(w / 2 + 16, 214); ctx.lineTo(w / 2, 244);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(34,41,51,0.55)";
      ctx.font = "13px monospace";
      ctx.fillText("S O N D E", w / 2, 268);
      /* 底部污染 */
      var gr = ctx.createLinearGradient(0, h - 90, 0, h);
      gr.addColorStop(0, "rgba(24,28,34,0)");
      gr.addColorStop(1, "rgba(24,28,34,0.4)");
      ctx.fillStyle = gr;
      ctx.fillRect(0, h - 90, w, 90);
    });
  }

  /* ---- 银色仪器舱蒙皮 ---- */
  function skinSilver() {
    return makeTex(512, 512, function (ctx, w, h) {
      ctx.fillStyle = "#b4bac2";
      ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < 240; i++) {
        var y = Math.random() * h;
        ctx.strokeStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.10)" : "rgba(30,36,44,0.10)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + (Math.random() - 0.5) * 3); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(40,48,58,0.32)";
      ctx.lineWidth = 2;
      [96, 250, 404].forEach(function (y) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      });
      ctx.fillStyle = "rgba(40,48,58,0.34)";
      for (var x = 14; x < w; x += 30) {
        [90, 244, 398].forEach(function (yy) { ctx.fillRect(x, yy + 5, 3, 3); });
      }
      ctx.fillStyle = "#2a3038";
      ctx.font = "bold 26px monospace";
      ctx.textAlign = "center";
      ctx.fillText("INSTRUMENT BAY", w / 2, 178);
      ctx.fillStyle = "#1d6e74";
      ctx.fillRect(w / 2 - 40, 196, 80, 14);
      ctx.fillStyle = "rgba(20,24,30,0.5)";
      ctx.font = "12px monospace";
      ctx.fillText("TM-40Hz · RSSI LINK · GPS", w / 2, 372);
      var gr = ctx.createLinearGradient(0, h - 70, 0, h);
      gr.addColorStop(0, "rgba(30,34,40,0)");
      gr.addColorStop(1, "rgba(30,34,40,0.3)");
      ctx.fillStyle = gr;
      ctx.fillRect(0, h - 70, w, 70);
    });
  }

  /* ---- 伞衣：橙白八幅 ---- */
  function chute() {
    return makeTex(512, 256, function (ctx, w, h) {
      var gore = w / 8;
      for (var i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#F26A1B" : "#e8ecf0";
        ctx.fillRect(i * gore, 0, gore + 1, h);
      }
      ctx.strokeStyle = "rgba(30,34,40,0.35)";
      ctx.lineWidth = 2;
      for (var s = 0; s <= 8; s++) {
        ctx.beginPath(); ctx.moveTo(s * gore, 0); ctx.lineTo(s * gore, h); ctx.stroke();
      }
      ctx.fillStyle = "rgba(20,24,30,0.5)";
      ctx.font = "bold 18px monospace";
      ctx.textAlign = "center";
      ctx.fillText("AZURE RANGE", w / 2, h - 18);
    });
  }

  /* ---- 警示斜纹（发射架底座） ---- */
  function hazard() {
    return makeTex(128, 128, function (ctx, w, h) {
      ctx.fillStyle = "#1a1f26";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#F26A1B";
      ctx.lineWidth = 14;
      for (var i = -h; i < w + h; i += 36) {
        ctx.beginPath(); ctx.moveTo(i, h + 8); ctx.lineTo(i + h + 8, -8); ctx.stroke();
      }
    }, { repeat: [3, 1] });
  }

  /* ---- 柔和圆斑（烟雾粒子） ---- */
  function softDisc() {
    return makeTex(128, 128, function (ctx, w, h) {
      var g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, "rgba(255,255,255,0.85)");
      g.addColorStop(0.35, "rgba(255,255,255,0.5)");
      g.addColorStop(0.75, "rgba(255,255,255,0.12)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
  }

  /* ---- 光斑（灯 / 信标 / 焰心辉光） ---- */
  function glowDot() {
    return makeTex(128, 128, function (ctx, w, h) {
      var g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.22, "rgba(255,255,255,0.55)");
      g.addColorStop(0.55, "rgba(255,255,255,0.14)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
  }

  SRTL.Textures = {
    ground: ground,
    skyNight: skyNight,
    skySpace: skySpace,
    skinWhite: skinWhite,
    skinSilver: skinSilver,
    chute: chute,
    hazard: hazard,
    softDisc: softDisc,
    glowDot: glowDot,
    makeTex: makeTex
  };
})(window.SRTL = window.SRTL || {});
