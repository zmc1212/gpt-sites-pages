/* 程序化 Canvas 贴图:蓝图地贴 / 枕木 / 天空 / 压力表盘 / 煤堆 / 车号文字 / 汽团 */
(function (ST28) {
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

  /* 深蓝图纸地贴:白细网格 + 主网格十字 + 图注 */
  function ground() {
    return makeTex(1024, 1024, function (ctx, w, h) {
      ctx.fillStyle = "#16324A";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(233,238,242,0.075)";
      ctx.lineWidth = 1;
      for (var x = 0; x <= w; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (var y = 0; y <= h; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = "rgba(233,238,242,0.16)";
      ctx.lineWidth = 1.4;
      for (var x2 = 0; x2 <= w; x2 += 256) { ctx.beginPath(); ctx.moveTo(x2, 0); ctx.lineTo(x2, h); ctx.stroke(); }
      for (var y2 = 0; y2 <= h; y2 += 256) { ctx.beginPath(); ctx.moveTo(0, y2); ctx.lineTo(w, y2); ctx.stroke(); }
      // 主网格交点小十字
      ctx.strokeStyle = "rgba(233,238,242,0.30)";
      ctx.lineWidth = 1.2;
      for (var cx = 0; cx <= w; cx += 256) {
        for (var cy = 0; cy <= h; cy += 256) {
          ctx.beginPath();
          ctx.moveTo(cx - 7, cy); ctx.lineTo(cx + 7, cy);
          ctx.moveTo(cx, cy - 7); ctx.lineTo(cx, cy + 7);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(233,238,242,0.28)";
      ctx.font = "15px monospace";
      ctx.fillText("GREAT VALLEY DIVISION · GRID 0.5 M · BLUEPRINT", 26, h - 26);
    }, { repeat: [30, 30] });
  }

  /* 枕木条(只铺在轨道下面,提供运行时的滚动参照) */
  function ties() {
    return makeTex(256, 64, function (ctx, w, h) {
      ctx.fillStyle = "#132C42";
      ctx.fillRect(0, 0, w, h);
      for (var x = 8; x < w; x += 64) {
        ctx.fillStyle = "#1C3A55";
        ctx.fillRect(x, 4, 15, h - 8);
        ctx.strokeStyle = "rgba(233,238,242,0.14)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, 4.5, 14, h - 9);
        ctx.fillStyle = "rgba(233,238,242,0.20)";
        ctx.fillRect(x + 5, h / 2 - 3, 4, 3);
        ctx.fillRect(x + 5, h / 2, 4, 3);
      }
    }, { repeat: [75, 1] });
  }

  /* 深蓝天空:上深下浅 + 轻微晕影 */
  function sky() {
    return makeTex(1024, 512, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#122A3F");
      g.addColorStop(0.45, "#1D415C");
      g.addColorStop(1, "#16324A");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(233,238,242,0.05)";
      ctx.lineWidth = 1.5;
      for (var i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(w * (0.16 + i * 0.18), h * 0.24, 60 + i * 26, 0.6, 2.6);
        ctx.stroke();
      }
      var v = ctx.createRadialGradient(w / 2, h * 0.42, h * 0.2, w / 2, h * 0.42, w * 0.72);
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(6,16,28,0.5)");
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);
    });
  }

  /* 锅炉压力表盘(0-18 bar,红区 14+):可复用绘制函数,面板与 3D 表盘共用 */
  function gaugeFaceDraw(ctx, s) {
    var cx = s / 2, cy = s / 2, R = s * 0.46;
    ctx.clearRect(0, 0, s, s);
    ctx.fillStyle = "#E8E4D4";
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#3A3E44"; ctx.lineWidth = s * 0.028;
    ctx.beginPath(); ctx.arc(cx, cy, R - s * 0.014, 0, Math.PI * 2); ctx.stroke();
    // 红区弧 14-18 bar:135° 起顺时针 270°
    var a0 = (135 + 14 / 18 * 270) * Math.PI / 180;
    var a1 = (135 + 18 / 18 * 270) * Math.PI / 180;
    ctx.strokeStyle = "#C0392B"; ctx.lineWidth = s * 0.06;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.80, a0, a1); ctx.stroke();
    // 刻度
    for (var v = 0; v <= 18; v++) {
      var a = (135 + v / 18 * 270) * Math.PI / 180;
      var major = v % 2 === 0;
      var r1 = R * (major ? 0.62 : 0.68), r2 = R * 0.74;
      ctx.strokeStyle = major ? "#23252A" : "rgba(35,37,42,0.55)";
      ctx.lineWidth = major ? s * 0.018 : s * 0.009;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      ctx.stroke();
      if (major) {
        ctx.fillStyle = "#23252A";
        ctx.font = "bold " + Math.round(s * 0.10) + "px monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(v), cx + Math.cos(a) * R * 0.5, cy + Math.sin(a) * R * 0.5);
      }
    }
    ctx.fillStyle = "#23252A";
    ctx.font = "bold " + Math.round(s * 0.062) + "px monospace";
    ctx.textAlign = "center";
    ctx.fillText("BOILER", cx, cy + R * 0.26);
    ctx.fillText("BAR", cx, cy + R * 0.36);
    ctx.fillStyle = "#8C2F39";
    ctx.font = "bold " + Math.round(s * 0.055) + "px monospace";
    ctx.fillText("GREAT VALLEY 4750", cx, cy + R * 0.60);
  }
  function gaugeFace() {
    return makeTex(256, 256, function (ctx, w, h) { gaugeFaceDraw(ctx, w); });
  }

  /* 煤堆顶面 */
  function coal() {
    return makeTex(256, 160, function (ctx, w, h) {
      ctx.fillStyle = "#14161A";
      ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < 130; i++) {
        var r = 4 + Math.random() * 13;
        ctx.fillStyle = Math.random() > 0.5 ? "#1E2126" : "#0C0E11";
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (var k = 0; k < 26; k++) {
        ctx.fillStyle = "rgba(180,190,205,0.14)";
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 1.6);
      }
    });
  }

  /* 煤水车侧壁铭牌 */
  function tenderSide() {
    return makeTex(512, 128, function (ctx, w, h) {
      ctx.fillStyle = "#23252A";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(176,141,87,0.85)";
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, w - 20, h - 20);
      ctx.fillStyle = "#B08D57";
      ctx.font = "bold 34px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GREAT VALLEY R.R.", w / 2, 54);
      ctx.font = "bold 20px monospace";
      ctx.fillStyle = "rgba(176,141,87,0.8)";
      ctx.fillText("No. 4750 · COAL & WATER", w / 2, 88);
      ctx.fillStyle = "rgba(233,238,242,0.16)";
      for (var x = 22; x < w - 22; x += 26) {
        ctx.beginPath(); ctx.arc(x, 16, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x, h - 16, 2, 0, Math.PI * 2); ctx.fill();
      }
    });
  }

  /* 驾驶室侧号码牌 */
  function numPlate() {
    return makeTex(256, 160, function (ctx, w, h) {
      ctx.fillStyle = "#8C2F39";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(176,141,87,0.9)";
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.fillStyle = "#B08D57";
      ctx.font = "bold 84px monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("4750", w / 2, h / 2 + 4);
    });
  }

  /* 汽团粒子(径向白) */
  function puff() {
    return makeTex(128, 128, function (ctx, w, h) {
      var g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
      g.addColorStop(0, "rgba(245,248,252,0.95)");
      g.addColorStop(0.4, "rgba(238,242,248,0.55)");
      g.addColorStop(1, "rgba(233,238,242,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
  }

  ST28.Textures = {
    makeTex: makeTex,
    ground: ground,
    ties: ties,
    sky: sky,
    gaugeFace: gaugeFace,
    gaugeFaceDraw: gaugeFaceDraw,
    coal: coal,
    tenderSide: tenderSide,
    numPlate: numPlate,
    puff: puff
  };
})(window.ST28 = window.ST28 || {});
