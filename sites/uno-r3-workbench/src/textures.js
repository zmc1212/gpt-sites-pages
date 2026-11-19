/* 程序化 Canvas 贴图：图纸台面 / PCB 丝印 / 芯片顶印字 / 背景纸色 */
(function (UNO3) {
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

  /* 米白图纸台面：细网格 + 图框 + 标题栏 + 角部对位十字 */
  function paper() {
    return makeTex(2048, 1536, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, w * 0.3, h);
      g.addColorStop(0, "#ece6d8");
      g.addColorStop(0.55, "#e6dfcf");
      g.addColorStop(1, "#ddd5c2");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      /* 细网格（约 1 cm 一格，与真实比例呼应） */
      ctx.strokeStyle = "rgba(0, 119, 139, 0.10)";
      ctx.lineWidth = 1;
      for (var x = 64; x < w; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (var y = 64; y < h; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = "rgba(0, 119, 139, 0.20)";
      ctx.lineWidth = 1.6;
      for (var x2 = 320; x2 < w; x2 += 320) { ctx.beginPath(); ctx.moveTo(x2, 0); ctx.lineTo(x2, h); ctx.stroke(); }
      for (var y2 = 320; y2 < h; y2 += 320) { ctx.beginPath(); ctx.moveTo(0, y2); ctx.lineTo(w, y2); ctx.stroke(); }
      /* 图纸边框（橙虚线） */
      ctx.strokeStyle = "rgba(214, 127, 51, 0.55)";
      ctx.lineWidth = 3;
      ctx.setLineDash([26, 18]);
      ctx.strokeRect(70, 70, w - 140, h - 140);
      ctx.setLineDash([]);
      /* 角部对位十字 */
      ctx.strokeStyle = "rgba(34, 36, 42, 0.35)";
      ctx.lineWidth = 2;
      [[110, 110], [w - 110, 110], [110, h - 110], [w - 110, h - 110]].forEach(function (p) {
        ctx.beginPath();
        ctx.moveTo(p[0] - 16, p[1]); ctx.lineTo(p[0] + 16, p[1]);
        ctx.moveTo(p[0], p[1] - 16); ctx.lineTo(p[0], p[1] + 16);
        ctx.stroke();
      });
      /* 右下标题栏 */
      ctx.fillStyle = "rgba(34, 36, 42, 0.08)";
      ctx.fillRect(w - 560, h - 128, 480, 84);
      ctx.strokeStyle = "rgba(34, 36, 42, 0.3)";
      ctx.lineWidth = 2;
      ctx.strokeRect(w - 560, h - 128, 480, 84);
      ctx.beginPath(); ctx.moveTo(w - 560, h - 88); ctx.lineTo(w - 80, h - 88); ctx.stroke();
      ctx.fillStyle = "rgba(34, 36, 42, 0.62)";
      ctx.font = "bold 26px monospace";
      ctx.fillText("UNO R3 · ASSEMBLY STATION", w - 540, h - 100);
      ctx.font = "20px monospace";
      ctx.fillText("SHEET 1/1 · SCALE 1:1 · MM", w - 540, h - 62);
      ctx.fillStyle = "rgba(214, 127, 51, 0.8)";
      ctx.fillText("OPENHARD", w - 200, h - 62);
      /* 左下小注 */
      ctx.fillStyle = "rgba(34, 36, 42, 0.4)";
      ctx.font = "20px monospace";
      ctx.fillText("68.6 x 53.4 · FR4 · TEAL SOLDER MASK", 100, h - 88);
    });
  }

  /* PCB：teal 阻焊层 + 暗色走线 + 焊盘 + 白色丝印（布局来自 Parts.PCB_LAYOUT，单位 mm） */
  function pcb(L) {
    var S = 20;                                  // 20 px / mm
    var w = Math.round(L.w * S), h = Math.round(L.h * S);
    return makeTex(w, h, function (ctx) {
      function px(mmX) { return (mmX + L.w / 2) * S; }
      function py(mmZ) { return (mmZ + L.h / 2) * S; }
      /* 阻焊底色 */
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#0b8ba0");
      g.addColorStop(0.5, "#00778b");
      g.addColorStop(1, "#016a7d");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      /* 内层铜箔：从真实焊盘锚点出发的曼哈顿走线 + 过孔 */
      var seed = 11;
      function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      var anchors = [];
      L.strips.forEach(function (st) {
        for (var i = 0; i < st.n; i++) anchors.push([px(st.x0 + i * 2.54), py(st.z)]);
      });
      for (var r2 = 0; r2 < 2; r2++) {
        for (var p2 = 0; p2 < 14; p2++) {
          anchors.push([px(L.dip.x - 16.51 + p2 * 2.54), py(L.dip.z + (r2 ? 3.81 : -3.81))]);
        }
      }
      L.pads.forEach(function (p) { anchors.push([px(p[0]), py(p[1])]); });
      [[-13.3, -9.2], [-20.4, -11.8], [-18.0, 17.0], [-13.5, 17.0], [-5.9, -8.0],
       [-31.0, -10.7], [-20.6, 21.6], [23.5, -21.6], [-15.6, -3.0], [-13.0, -3.0],
       [-16.5, -6.5], [-11.0, 4.5], [-23.0, 16.0], [-6.0, 6.5], [-6.0, -18.4],
       [-24.3, -20.5], [-28.0, 21.15], [-9.0, -25.6], [10.7, 11.5],
       [-24.6, -9.2], [-20.6, -6.4]].forEach(function (mm) {
        anchors.push([px(mm[0]), py(mm[1])]);
      });
      ctx.lineCap = "round";
      function via(x, y) {
        ctx.fillStyle = "rgba(214, 178, 96, 0.9)";
        ctx.beginPath(); ctx.arc(x, y, 4.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(0, 62, 76, 0.9)";
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
      }
      var net = [anchors.shift()];
      while (anchors.length) {
        var bi = 0, bj = 0, bd = Infinity;
        for (var a = 0; a < net.length; a++) {
          for (var b = 0; b < anchors.length; b++) {
            var ddx = net[a][0] - anchors[b][0], ddy = net[a][1] - anchors[b][1];
            var dd = ddx * ddx + ddy * ddy;
            if (dd < bd) { bd = dd; bi = a; bj = b; }
          }
        }
        var A = net[bi], B = anchors.splice(bj, 1)[0];
        ctx.strokeStyle = "rgba(126, 216, 228, 0.34)";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(A[0], A[1]);
        if (rnd() > 0.5) { ctx.lineTo(B[0], A[1]); ctx.lineTo(B[0], B[1]); }
        else { ctx.lineTo(A[0], B[1]); ctx.lineTo(B[0], B[1]); }
        ctx.stroke();
        via(B[0], B[1]);
        net.push(B);
      }
      /* 排母焊盘（金色圆点阵） */
      L.strips.forEach(function (st) {
        for (var i = 0; i < st.n; i++) {
          ctx.fillStyle = "rgba(214, 178, 96, 0.9)";
          ctx.beginPath(); ctx.arc(px(st.x0 + i * 2.54), py(st.z), 6, 0, Math.PI * 2); ctx.fill();
        }
      });
      /* DIP-28 座焊盘（两排 28 孔） */
      var dc = L.dip;
      for (var r2 = 0; r2 < 2; r2++) {
        for (var p2 = 0; p2 < 14; p2++) {
          var hx = dc.x - 16.51 + p2 * 2.54, hz = dc.z + (r2 ? 3.81 : -3.81);
          ctx.fillStyle = "rgba(20, 40, 46, 0.85)";
          ctx.beginPath(); ctx.arc(px(hx), py(hz), 4.4, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "rgba(230, 224, 208, 0.85)";
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.arc(px(hx), py(hz), 5.8, 0, Math.PI * 2); ctx.stroke();
        }
      }
      /* SMT 焊盘（白色小框） */
      L.pads.forEach(function (p) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = 1.6;
        ctx.strokeRect(px(p[0]) - 5, py(p[1]) - 4, 10, 8);
      });
      /* 安装孔 */
      L.holes.forEach(function (hp) {
        ctx.fillStyle = "#e8e2d4";
        ctx.beginPath(); ctx.arc(px(hp[0]), py(hp[1]), 22, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(px(hp[0]), py(hp[1]), 26, 0, Math.PI * 2); ctx.stroke();
      });
      /* 丝印文字 */
      ctx.textBaseline = "middle";
      L.texts.forEach(function (t) {
        ctx.fillStyle = t.c || "rgba(244, 240, 228, 0.92)";
        ctx.font = (t.b ? "bold " : "") + t.s + "px monospace";
        ctx.textAlign = t.a || "left";
        ctx.fillText(t.t, px(t.x), py(t.y));
      });
      ctx.textAlign = "left";
    });
  }

  /* DIP 芯片顶印字 */
  function chipTop() {
    return makeTex(512, 128, function (ctx, w, h) {
      ctx.fillStyle = "#191b20";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(240, 236, 224, 0.92)";
      ctx.font = "bold 44px monospace";
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("ATMEL  ATMEGA328P", 36, 44);
      ctx.font = "30px monospace";
      ctx.fillText("PU   2421", 36, 92);
      ctx.fillStyle = "rgba(240, 236, 224, 0.5)";
      ctx.beginPath(); ctx.arc(26, 24, 8, 0, Math.PI * 2); ctx.fill();
    });
  }

  /* 16U2 顶印字（TQFP） */
  function tqfpTop() {
    return makeTex(256, 256, function (ctx, w, h) {
      ctx.fillStyle = "#17191e";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(240, 236, 224, 0.9)";
      ctx.font = "bold 40px monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("ATMEL", w / 2, 96);
      ctx.font = "26px monospace";
      ctx.fillText("ATMEGA16U2", w / 2, 148);
      ctx.fillText("AU 2416", w / 2, 186);
      ctx.fillStyle = "rgba(240, 236, 224, 0.55)";
      ctx.beginPath(); ctx.arc(42, 42, 11, 0, Math.PI * 2); ctx.fill();
    });
  }

  /* 纸色渐变背景 */
  function sky() {
    return makeTex(1024, 512, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, w * 0.4, h);
      g.addColorStop(0, "#f2ecdd");
      g.addColorStop(0.45, "#e9e2d1");
      g.addColorStop(1, "#dcd3bf");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      function blob(x, y, r, c) {
        var rg = ctx.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, c);
        rg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      blob(w * 0.18, h * 0.22, 260, "rgba(0, 119, 139, 0.10)");
      blob(w * 0.82, h * 0.3, 280, "rgba(214, 127, 51, 0.10)");
      blob(w * 0.5, h * 0.8, 240, "rgba(255, 250, 238, 0.5)");
    });
  }

  UNO3.Textures = { paper: paper, pcb: pcb, chipTop: chipTop, tqfpTop: tqfpTop, sky: sky, makeTex: makeTex };
})(window.UNO3 = window.UNO3 || {});
