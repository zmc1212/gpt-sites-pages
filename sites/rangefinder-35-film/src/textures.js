/* 程序化 Canvas 贴图：纸面工作台 / 黑饰皮颗粒 / 拉丝铬 / 滚花 / 速度盘 / 帘布 / 胶片 */
(function (RF35) {
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
    if (opts.wrapT) {
      tex.wrapT = THREE.RepeatWrapping;
    }
    return tex;
  }

  /* 确定性伪随机（保证每次刷新贴图一致） */
  function rng(seed) {
    var s = seed || 7;
    return function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
  }

  /* 米色纸面工作台：淡网格 + 十字标记 + 图纸角标 */
  function paper() {
    return makeTex(1024, 1024, function (ctx, w, h) {
      ctx.fillStyle = "#E6DFD0";
      ctx.fillRect(0, 0, w, h);
      var r = rng(11);
      for (var i = 0; i < 900; i++) {
        ctx.fillStyle = "rgba(38,36,31," + (r() * 0.03).toFixed(3) + ")";
        ctx.fillRect(r() * w, r() * h, 1.5, 1.5);
      }
      ctx.strokeStyle = "rgba(38,36,31,0.07)";
      ctx.lineWidth = 1;
      for (var x = 64; x < w; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (var y = 64; y < h; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = "rgba(38,36,31,0.16)";
      for (var k = 0; k < 5; k++) {
        var cx = r() * w, cy = r() * h;
        ctx.beginPath(); ctx.moveTo(cx - 9, cy); ctx.lineTo(cx + 9, cy);
        ctx.moveTo(cx, cy - 9); ctx.lineTo(cx, cy + 9); ctx.stroke();
      }
      ctx.fillStyle = "rgba(38,36,31,0.22)";
      ctx.font = "bold 26px monospace";
      ctx.fillText("ERNSTMANN RF-35 · ASSEMBLY BENCH · SHEET 05", 40, 54);
      ctx.font = "16px monospace";
      ctx.fillStyle = "rgba(38,36,31,0.16)";
      ctx.fillText("CLOTH SHUTTER · COUPLED RANGEFINDER · 36 EXP", 40, 80);
    }, { repeat: [3, 3] });
  }

  /* 纸色背景天空：柔和米色渐变 */
  function sky() {
    return makeTex(1024, 512, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, w * 0.35, h);
      g.addColorStop(0, "#F0EADC");
      g.addColorStop(0.45, "#E6DFD0");
      g.addColorStop(1, "#D9D0BC");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      function blob(x, y, r, c) {
        var rg = ctx.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, c);
        rg.addColorStop(1, "rgba(230,223,208,0)");
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      blob(w * 0.2, h * 0.18, 300, "rgba(255,248,232,0.55)");
      blob(w * 0.82, h * 0.3, 280, "rgba(214,200,170,0.5)");
      blob(w * 0.5, h * 0.85, 320, "rgba(196,186,160,0.45)");
    });
  }

  /* 黑色硫化饰皮：深黑底 + 颗粒噪点 */
  function leather() {
    return makeTex(512, 512, function (ctx, w, h) {
      ctx.fillStyle = "#1A1A1C";
      ctx.fillRect(0, 0, w, h);
      var r = rng(23);
      for (var i = 0; i < 5200; i++) {
        var v = r();
        ctx.fillStyle = v > 0.5 ? "rgba(255,255,255," + ((v - 0.5) * 0.10).toFixed(3) + ")"
                                : "rgba(0,0,0," + ((0.5 - v) * 0.35).toFixed(3) + ")";
        ctx.fillRect(r() * w, r() * h, 1 + r() * 1.6, 1 + r() * 1.6);
      }
      // 细菱格压纹
      ctx.strokeStyle = "rgba(255,255,255,0.045)";
      ctx.lineWidth = 1;
      for (var d = -h; d < w; d += 14) {
        ctx.beginPath(); ctx.moveTo(d, 0); ctx.lineTo(d + h, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(d + h, 0); ctx.lineTo(d, h); ctx.stroke();
      }
    }, { repeat: [1, 1] });   // RepeatWrapping：Extrude 前脸 UV 超出 0-1 也能平铺
  }

  /* 拉丝铬面板：银灰底 + 纵向拉丝 */
  function brushed() {
    return makeTex(512, 512, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#CDD0D4");
      g.addColorStop(0.5, "#C4C7CC");
      g.addColorStop(1, "#CDCFD3");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      var r = rng(41);
      for (var i = 0; i < 380; i++) {
        var x = r() * w, a = 0.04 + r() * 0.08;
        ctx.strokeStyle = r() > 0.5 ? "rgba(255,255,255," + a + ")" : "rgba(70,74,80," + a + ")";
        ctx.lineWidth = 0.8 + r();
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (r() - 0.5) * 6, h); ctx.stroke();
      }
    });
  }

  /* 滚花环纹：竖向凹槽 */
  function knurl(base, groove) {
    return makeTex(512, 128, function (ctx, w, h) {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
      for (var x = 0; x < w; x += 10) {
        ctx.fillStyle = groove;
        ctx.fillRect(x + 4, 0, 3, h);
        ctx.fillStyle = "rgba(255,255,255,0.22)";
        ctx.fillRect(x + 7, 0, 1.5, h);
      }
    }, { repeat: [6, 1] });
  }

  /* 速度盘面：B → 1000 十二档刻度 */
  function dialFace() {
    var labels = ["B", "1", "2", "4", "8", "15", "30", "60", "125", "250", "500", "1000"];
    return makeTex(512, 512, function (ctx, w, h) {
      var cx = w / 2, cy = h / 2;
      ctx.fillStyle = "#17171A";
      ctx.beginPath(); ctx.arc(cx, cy, 250, 0, Math.PI * 2); ctx.fill();
      var r = rng(5);
      for (var i = 0; i < 2400; i++) {
        ctx.fillStyle = "rgba(255,255,255," + (r() * 0.03).toFixed(3) + ")";
        ctx.fillRect(r() * w, r() * h, 1, 1);
      }
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (var k = 0; k < 12; k++) {
        var a = -Math.PI / 2 + k * (Math.PI * 2 / 12) * 0.9;   // 12 档分布约 324°
        var ca = Math.cos(a), sa = Math.sin(a);
        ctx.strokeStyle = k === 0 ? "#C75B39" : "rgba(240,236,224,0.85)";
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx + ca * 218, cy + sa * 218);
        ctx.lineTo(cx + ca * 236, cy + sa * 236);
        ctx.stroke();
        ctx.font = (k === 0 ? "bold 30px" : "26px") + " monospace";
        ctx.fillText(labels[k], cx + ca * 186, cy + sa * 186);
        // 小刻度齿
        ctx.strokeStyle = "rgba(240,236,224,0.35)";
        ctx.lineWidth = 2;
        for (var m = 1; m < 4; m++) {
          var a2 = a + m * (Math.PI * 2 / 12) * 0.9 / 4;
          var c2 = Math.cos(a2), s2 = Math.sin(a2);
          ctx.beginPath();
          ctx.moveTo(cx + c2 * 226, cy + s2 * 226);
          ctx.lineTo(cx + c2 * 238, cy + s2 * 238);
          ctx.stroke();
        }
      }
      // 中心滚花
      ctx.fillStyle = "#222226";
      ctx.beginPath(); ctx.arc(cx, cy, 96, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 2;
      for (var s = 0; s < 36; s++) {
        var a3 = s / 36 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a3) * 60, cy + Math.sin(a3) * 60);
        ctx.lineTo(cx + Math.cos(a3) * 94, cy + Math.sin(a3) * 94);
        ctx.stroke();
      }
    });
  }

  /* 快门帘布：米黑双面细织纹 */
  function cloth() {
    return makeTex(256, 256, function (ctx, w, h) {
      ctx.fillStyle = "#191A1C";
      ctx.fillRect(0, 0, w, h);
      var r = rng(77);
      for (var y = 0; y < h; y += 2) {
        ctx.fillStyle = "rgba(255,255,255," + (0.02 + r() * 0.03).toFixed(3) + ")";
        ctx.fillRect(0, y, w, 1);
      }
      for (var x = 0; x < w; x += 2) {
        ctx.fillStyle = "rgba(0,0,0," + (0.06 + r() * 0.08).toFixed(3) + ")";
        ctx.fillRect(x, 0, 1, h);
      }
      ctx.fillStyle = "#C75B39";
      ctx.fillRect(6, h / 2 - 5, 26, 10);   // 帘上小橙标
    });
  }

  /* 胶片条：暗底 + 片框 + 齿孔（v 向重复） */
  function filmTex() {
    return makeTex(256, 256, function (ctx, w, h) {
      ctx.fillStyle = "#221F1C";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2E2A26";
      ctx.fillRect(0, h * 0.16, w, h * 0.68);
      ctx.strokeStyle = "rgba(255,244,220,0.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(10, h * 0.22, w - 20, h * 0.56);
      ctx.fillStyle = "rgba(255,244,220,0.5)";
      ctx.font = "bold 20px monospace";
      ctx.fillText("RF35", 16, h * 0.2);
      ctx.font = "13px monospace";
      ctx.fillText("ISO 400 · 36", 16, h * 0.82);
      // 齿孔
      ctx.fillStyle = "#C9CCD1";
      for (var x = 8; x < w - 10; x += 30) {
        ctx.fillRect(x, 8, 16, 14);
        ctx.fillRect(x, h - 22, 16, 14);
      }
    }, { repeat: [1, 1], wrapT: true });
  }

  /* 镜筒前环刻字 */
  function ringText() {
    return makeTex(1024, 96, function (ctx, w, h) {
      ctx.fillStyle = "#2A2B2E";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(240,236,224,0.9)";
      ctx.font = "bold 34px monospace";
      ctx.textBaseline = "middle";
      ctx.fillText("ERNSTMANN · RF-LENTAR 1:2 / 35 ·", 26, h / 2 + 2);
      ctx.fillStyle = "rgba(240,236,224,0.4)";
      ctx.font = "22px monospace";
      ctx.fillText("N° 011842", 700, h / 2 + 2);
    });
  }

  /* 机顶刻字（透明底） */
  function engraving() {
    return makeTex(512, 96, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(38,36,31,0.85)";
      ctx.font = "bold 44px monospace";
      ctx.textBaseline = "middle";
      ctx.fillText("ERNSTMANN", 10, 34);
      ctx.font = "26px monospace";
      ctx.fillStyle = "rgba(38,36,31,0.6)";
      ctx.fillText("RF-35 · TYPE III", 12, 74);
    });
  }

  RF35.Textures = {
    makeTex: makeTex,
    paper: paper,
    sky: sky,
    leather: leather,
    brushed: brushed,
    knurl: knurl,
    dialFace: dialFace,
    cloth: cloth,
    filmTex: filmTex,
    ringText: ringText,
    engraving: engraving
  };
})(window.RF35 = window.RF35 || {});
