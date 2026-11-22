/* 程序化 Canvas 贴图:纸面背景 / 纸桌 / 图纸垫 / C64 蓝色 PCB(丝印+走线) / 芯片顶标 */
(function (C64B) {

  /* 主板元件布局表(板面坐标:米,x 右 / z 前),PCB 贴图与 3D 零件共用。
     位号按真实 ASSY 250425 丝印:U7 CPU / U19 VIC-II / U18 SID / U17 PLA /
     U3 BASIC / U4 KERNAL / U5 CHAR / U6 2114 色彩 SRAM / DRAM U9-U12 + U21-U24 */
  C64B.PCB_LAYOUT = {
    dram: [
      [-1.95, -0.86], [-1.55, -0.86], [-1.95, -0.44], [-1.55, -0.44],
      [-1.95, -0.02], [-1.55, -0.02], [-1.95, 0.4], [-1.55, 0.4]
    ],
    chips: [
      { x: 0.05, z: 0.02, w: 0.16, l: 0.52, ref: "U7", name: "6510" },
      { x: 0.72, z: -0.72, w: 0.16, l: 0.52, ref: "U19", name: "6569" },
      { x: -1.15, z: 0.85, w: 0.16, l: 0.38, ref: "U18", name: "6581" },
      { x: 0.72, z: 0.02, w: 0.16, l: 0.38, ref: "U17", name: "906114" },
      { x: -0.12, z: 0.92, w: 0.16, l: 0.52, ref: "U15", name: "6526" },
      { x: 0.72, z: 0.92, w: 0.16, l: 0.52, ref: "U16", name: "6526" },
      { x: 1.52, z: -0.62, w: 0.17, l: 0.38, ref: "U3", name: "BASIC" },
      { x: 1.52, z: -0.08, w: 0.17, l: 0.38, ref: "U4", name: "KERNAL" },
      { x: 1.52, z: 0.42, w: 0.17, l: 0.34, ref: "U5", name: "CHAR" },
      { x: 0.42, z: -0.52, w: 0.11, l: 0.22, ref: "U6", name: "2114" },
      { x: -0.5, z: -0.45, w: 0.14, l: 0.1, ref: "Y1", name: "17.734476" },
      { x: -0.28, z: -0.32, w: 0.1, l: 0.2, ref: "U31", name: "8701" }
    ],
    edges: [
      { x: 2.2, z: -0.1, w: 0.14, l: 1.2, label: "EXPANSION" },
      { x: -0.35, z: 1.46, w: 0.5, l: 0.13, label: "USER PORT" },
      { x: -1.05, z: 1.46, w: 0.44, l: 0.13, label: "CASSETTE" },
      { x: -1.7, z: 1.46, w: 0.6, l: 0.13, label: "KEYBOARD" }
    ],
    dins: [
      { x: -1.95, z: 1.12, r: 0.055 },
      { x: 1.45, z: 1.35, r: 0.065 },
      { x: 1.3, z: -1.18, r: 0.075 }
    ],
    db9s: [[0.2, 1.35], [0.85, 1.35]]
  };

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

  /* 米棕纸面背景 */
  function sky() {
    return makeTex(1024, 512, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, w * 0.3, h);
      g.addColorStop(0, "#e2d6bc");
      g.addColorStop(0.5, "#d8cbb2");
      g.addColorStop(1, "#cfc0a4");
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
      blob(w * 0.2, h * 0.22, 300, "rgba(169,138,61,0.16)");
      blob(w * 0.78, h * 0.3, 340, "rgba(64,72,168,0.12)");
      blob(w * 0.5, h * 0.78, 320, "rgba(216,203,178,0.5)");
      blob(w * 0.9, h * 0.75, 240, "rgba(169,138,61,0.10)");
    });
  }

  /* 纸桌(米棕,细纤维) */
  function desk() {
    return makeTex(512, 512, function (ctx, w, h) {
      ctx.fillStyle = "#c9bc9f";
      ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < 520; i++) {
        ctx.fillStyle = "rgba(90,80,60," + (0.02 + Math.random() * 0.05) + ")";
        ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 4, 1);
      }
      for (var s = 0; s < 14; s++) {
        ctx.fillStyle = "rgba(105,95,72," + (0.03 + Math.random() * 0.05) + ")";
        ctx.fillRect(0, Math.random() * h, w, 1 + Math.random() * 3);
      }
    }, { repeat: [7, 7] });
  }

  /* 图纸切割垫(米色纸 + 墨线网格 + 标题栏) */
  function mat() {
    return makeTex(1140, 840, function (ctx, w, h) {
      ctx.fillStyle = "#e6dcc3";
      ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < 700; i++) {
        ctx.fillStyle = "rgba(120,105,80," + (0.02 + Math.random() * 0.04) + ")";
        ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1);
      }
      ctx.strokeStyle = "rgba(42,38,32,0.1)";
      ctx.lineWidth = 1;
      for (var x = 37.5; x < w; x += 75) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (var y = 37.5; y < h; y += 75) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = "rgba(42,38,32,0.18)";
      ctx.lineWidth = 1.4;
      for (var x2 = 150; x2 < w; x2 += 300) { ctx.beginPath(); ctx.moveTo(x2, 0); ctx.lineTo(x2, h); ctx.stroke(); }
      for (var y2 = 150; y2 < h; y2 += 300) { ctx.beginPath(); ctx.moveTo(0, y2); ctx.lineTo(w, y2); ctx.stroke(); }
      // 双层边框
      ctx.strokeStyle = "rgba(42,38,32,0.55)";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(24, 24, w - 48, h - 48);
      ctx.lineWidth = 1;
      ctx.strokeRect(34, 34, w - 68, h - 68);
      // 四角套准十字(C64 蓝)
      ctx.strokeStyle = "rgba(64,72,168,0.6)";
      ctx.lineWidth = 1.6;
      [[52, 52], [w - 52, 52], [52, h - 52], [w - 52, h - 52]].forEach(function (p) {
        ctx.beginPath();
        ctx.moveTo(p[0] - 10, p[1]); ctx.lineTo(p[0] + 10, p[1]);
        ctx.moveTo(p[0], p[1] - 10); ctx.lineTo(p[0], p[1] + 10);
        ctx.stroke();
      });
      // 标题栏
      ctx.strokeStyle = "rgba(42,38,32,0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(w - 350, h - 122, 320, 94);
      ctx.fillStyle = "rgba(42,38,32,0.72)";
      ctx.font = "bold 22px monospace";
      ctx.fillText("C64 MOTHERBOARD LAB", w - 334, h - 90);
      ctx.font = "14px monospace";
      ctx.fillText("FIG. 03 · ASSY 250425", w - 334, h - 64);
      ctx.fillText("SCALE 1:1 · SHEET 1/1", w - 334, h - 42);
      ctx.font = "14px monospace";
      ctx.fillStyle = "rgba(42,38,32,0.5)";
      ctx.fillText("MOS 6510 · 6569 · 6581 · 6526 ×2 · 4164 ×8", 48, h - 46);
      // 蓝色角块
      ctx.fillStyle = "rgba(64,72,168,0.75)";
      ctx.fillRect(24, 24, 26, 8);
      ctx.fillRect(24, 24, 8, 26);
    });
  }

  /* DIP 丝印框:外框 + 引脚刻线 + pin1 圆点 + 位号 */
  function dipSilk(ctx, cx, cy, wpx, lpx, ref, name) {
    ctx.strokeStyle = "rgba(240,242,255,0.72)";
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - wpx / 2, cy - lpx / 2, wpx, lpx);
    ctx.fillStyle = "rgba(240,242,255,0.5)";
    var n = Math.floor(lpx / 9);
    for (var i = 0; i < n; i++) {
      var yy = cy - lpx / 2 + 4 + i * 9;
      ctx.fillRect(cx - wpx / 2 - 3, yy, 3, 4);
      ctx.fillRect(cx + wpx / 2, yy, 3, 4);
    }
    ctx.beginPath();
    ctx.arc(cx - wpx / 2 + 6, cy - lpx / 2 + 6, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(240,242,255,0.82)";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "left";
    ctx.fillText(ref + " " + name, cx + wpx / 2 + 6, cy - lpx / 2 + 12);
  }

  /* 弧形丝印文字 */
  function arcText(ctx, text, cx, cy, r, a0, a1, size) {
    ctx.save();
    ctx.fillStyle = "rgba(240,242,255,0.85)";
    ctx.font = "bold " + size + "px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (var i = 0; i < text.length; i++) {
      var a = a0 + (a1 - a0) * (i + 0.5) / text.length;
      ctx.save();
      ctx.translate(cx + r * Math.cos(a), cy + r * Math.sin(a));
      ctx.rotate(a + Math.PI / 2);
      ctx.fillText(text.charAt(i), 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  /* C64 蓝色 PCB:底色 + 斑驳 + 走线 + 过孔 + 金手指 + 丝印 */
  function c64Pcb() {
    return makeTex(1024, 676, function (ctx, w, h) {
      var L = C64B.PCB_LAYOUT;
      var sx = w / 4.4, sz = h / 2.9;
      function X(x) { return (x + 2.2) * sx; }
      function Z(z) { return (z + 1.45) * sz; }
      ctx.fillStyle = "#4048a8";
      ctx.fillRect(0, 0, w, h);
      // 斑驳底纹
      var seed = 11;
      function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      for (var i = 0; i < 34; i++) {
        var bx = rnd() * w, by = rnd() * h, br = 30 + rnd() * 90;
        var bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        bg.addColorStop(0, rnd() > 0.5 ? "rgba(24,28,92,0.10)" : "rgba(120,130,220,0.07)");
        bg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = bg;
        ctx.fillRect(bx - br, by - br, br * 2, br * 2);
      }
      /* ---- 铜箔走线:确定性布线生成器 ----
         mulberry32 种子随机 + 以真实封装(U7/U19/U18/U17/U3-U5/U6/U31、DRAM 两排、
         CIAs、接插件)为锚点的总线束:VIC↔DRAM 宽数据总线、CPU↔PLA↔ROM 地址总线、
         时钟链 Y1→8701→CPU、各 IO 口到 CIAs。45°+ 正交段,弯折处铜环过孔,
         端点金焊盘;铜色比蓝色阻焊层亮 */
      function mulberry32(a) {
        return function () {
          a |= 0; a = a + 0x6D2B79F5 | 0;
          var t2 = Math.imul(a ^ a >>> 15, 1 | a);
          t2 = t2 + Math.imul(t2 ^ t2 >>> 7, 61 | t2) ^ t2;
          return ((t2 ^ t2 >>> 14) >>> 0) / 4294967296;
        };
      }
      var crand = mulberry32(0x250425);
      function cr() { return crand(); }

      var COPPER = "rgba(150,160,236,0.5)";      /* 比蓝色阻焊亮的铜色 */
      var RING = "rgba(190,198,246,0.8)";        /* 过孔铜环 */
      var DRILL = "rgba(24,28,96,0.9)";          /* 过孔钻孔 */
      var PAD = "rgba(206,176,92,0.8)";          /* 金焊盘 */

      /* 45° 转正交的狗腿走线(板面米坐标),弯折画铜环过孔,端点画金焊盘 */
      function route(p0, p1, lw, alpha, noPad) {
        var dx = p1[0] - p0[0], dz = p1[1] - p0[1];
        var mid = Math.min(Math.abs(dx), Math.abs(dz));
        var pts = [p0, [p0[0] + Math.sign(dx) * mid, p0[1] + Math.sign(dz) * mid], p1];
        ctx.strokeStyle = "rgba(150,160,236," + alpha + ")";
        ctx.lineWidth = lw;
        ctx.lineJoin = "miter";
        ctx.beginPath();
        ctx.moveTo(X(p0[0]), Z(p0[1]));
        for (var i = 1; i < pts.length; i++) ctx.lineTo(X(pts[i][0]), Z(pts[i][1]));
        ctx.stroke();
        for (var vi = 1; vi < pts.length - 1; vi++) {
          var vx = X(pts[vi][0]), vz = Z(pts[vi][1]);
          ctx.fillStyle = RING;
          ctx.beginPath(); ctx.arc(vx, vz, 3.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = DRILL;
          ctx.beginPath(); ctx.arc(vx, vz, 1.4, 0, Math.PI * 2); ctx.fill();
        }
        if (!noPad) {
          [[p0, 1], [p1, 1]].forEach(function (pp) {
            ctx.fillStyle = PAD;
            ctx.beginPath(); ctx.arc(X(pp[0][0]), Z(pp[0][1]), 2.2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = DRILL;
            ctx.beginPath(); ctx.arc(X(pp[0][0]), Z(pp[0][1]), 0.9, 0, Math.PI * 2); ctx.fill();
          });
        }
      }

      /* 总线束:s/e 为 [x0,z0,x1,z1] 线段(板面米),两端线性取样
         (两端同向递增 → 狗腿段平行不交叉) */
      function bus(s, e, n, lw, alpha, noPad) {
        for (var i = 0; i < n; i++) {
          var k = n > 1 ? i / (n - 1) : 0.5;
          route(
            [s[0] + (s[2] - s[0]) * k, s[1] + (s[3] - s[1]) * k],
            [e[0] + (e[2] - e[0]) * k, e[1] + (e[3] - e[1]) * k],
            lw, alpha, noPad
          );
        }
      }
      function seg(x0, z0, x1, z1) { return [x0, z0, x1, z1]; }

      /* VIC-II ↔ DRAM 多路复用总线(宽,端点落在两排 4164 引脚上) */
      (function () {
        var ez = [-0.93, -0.79, -0.51, -0.37, -0.09, 0.05, 0.33, 0.47];
        for (var i = 0; i < ez.length; i++) {
          route([0.64, -0.93 + i * 0.0629], [-1.49, ez[i]], 2.5, 0.5);
        }
      })();
      bus(seg(-1.89, -0.95, -1.89, 0.49), seg(-1.61, -0.95, -1.61, 0.49), 8, 2, 0.45);
      /* CPU ↔ PLA ↔ ROM 地址总线 */
      bus(seg(0.13, -0.18, 0.13, 0.22), seg(0.64, -0.18, 0.64, 0.22), 8, 2.5, 0.5);
      bus(seg(0.80, -0.16, 0.80, -0.08), seg(1.435, -0.70, 1.435, -0.58), 3, 2, 0.45);
      bus(seg(0.80, -0.04, 0.80, 0.04), seg(1.435, -0.14, 1.435, -0.02), 3, 2, 0.45);
      bus(seg(0.80, 0.12, 0.80, 0.20), seg(1.435, 0.36, 1.435, 0.48), 3, 2, 0.45);
      /* 扩展口 → ROM 东侧 */
      bus(seg(2.13, -0.64, 2.13, -0.32), seg(1.605, -0.70, 1.605, -0.38), 4, 2, 0.42);
      bus(seg(2.13, -0.26, 2.13, -0.20), seg(1.605, -0.14, 1.605, -0.08), 2, 2, 0.42);
      /* CPU ↔ VIC-II */
      bus(seg(0.0, -0.24, 0.10, -0.24), seg(0.64, -0.92, 0.64, -0.66), 4, 2, 0.45);
      /* 色彩 SRAM U6 ↔ VIC-II */
      bus(seg(0.64, -0.60, 0.64, -0.48), seg(0.475, -0.56, 0.475, -0.44), 4, 2, 0.45);
      /* 时钟链:Y1 晶振 → 8701 → CPU(÷18) */
      bus(seg(-0.43, -0.48, -0.43, -0.44), seg(-0.33, -0.42, -0.33, -0.38), 2, 2, 0.5);
      bus(seg(-0.23, -0.40, -0.23, -0.28), seg(-0.03, -0.24, 0.09, -0.24), 2, 2, 0.5);
      /* CPU ↔ CIA1 / CIA1 ↔ CIA2 / SID ↔ CIA1 */
      bus(seg(-0.03, 0.28, 0.09, 0.28), seg(-0.20, 0.66, -0.08, 0.66), 4, 2, 0.45);
      bus(seg(-0.04, 0.76, -0.04, 1.08), seg(0.64, 0.76, 0.64, 1.08), 4, 2, 0.45);
      bus(seg(-1.07, 0.72, -1.07, 0.96), seg(-0.20, 0.72, -0.20, 0.96), 3, 2, 0.45);
      /* CIA2 → IEC 串行总线 */
      bus(seg(0.80, 0.80, 0.80, 1.04), seg(1.39, 1.25, 1.39, 1.31), 3, 2, 0.42);
      /* 键盘 / 磁带口 → CIA1,用户口 → CIA2,摇杆 DB9 → CIAs */
      bus(seg(-1.90, 1.395, -1.50, 1.395), seg(-0.20, 1.18, -0.12, 1.18), 3, 2, 0.42);
      bus(seg(-1.15, 1.395, -0.95, 1.395), seg(-0.16, 1.18, -0.08, 1.18), 3, 2, 0.42);
      bus(seg(-0.55, 1.395, -0.19, 1.395), seg(0.64, 1.18, 0.76, 1.18), 4, 2, 0.42);
      bus(seg(0.14, 1.275, 0.26, 1.275), seg(-0.10, 1.18, -0.02, 1.18), 3, 2, 0.42);
      bus(seg(0.79, 1.275, 0.91, 1.275), seg(0.68, 1.18, 0.80, 1.18), 3, 2, 0.42);
      /* VIC-II → 视频 DIN 与 RF 盒(视频/音频),RF → DIN */
      bus(seg(0.80, -0.69, 0.80, -0.57), seg(1.24, -1.26, 1.36, -1.26), 3, 2, 0.45);
      bus(seg(0.80, -0.86, 0.80, -0.74), seg(1.67, -1.12, 1.67, -1.00), 4, 2, 0.45);
      bus(seg(1.67, -1.12, 1.67, -1.04), seg(1.24, -1.26, 1.36, -1.26), 2, 2, 0.4);
      /* 电源干线:7-PIN DIN → 7805 → 电容 → 主干 → CPU 区 */
      route([-1.86, 1.09], [-1.62, 1.09], 5, 0.42, true);
      route([-1.86, 1.15], [-1.62, 1.15], 5, 0.42, true);
      route([-1.62, 1.02], [-1.84, 0.96], 4, 0.42, true);
      route([-1.72, 0.64], [-0.42, 0.58], 5, 0.42, true);
      route([-0.42, 0.58], [-0.05, 0.36], 4, 0.42, true);
      /* 板面随机斑驳点缀用的小号种子随机(与走线无关) */
      for (var dot = 0; dot < 24; dot++) {
        var dvx = cr(), dvy = cr();
        ctx.fillStyle = "rgba(190,198,246,0.14)";
        ctx.beginPath();
        ctx.arc(dvx * w, dvy * h, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      // 金手指条
      L.edges.forEach(function (e) {
        ctx.fillStyle = "rgba(206,176,92,0.9)";
        var ew = e.w * sx, el = e.l * sz;
        ctx.fillRect(X(e.x) - ew / 2, Z(e.z) - el / 2, ew, el);
        ctx.fillStyle = "rgba(64,72,168,0.55)";
        if (el > ew) {
          for (var f = 0; f < Math.floor(el / 9); f++) ctx.fillRect(X(e.x) - ew / 2, Z(e.z) - el / 2 + 2 + f * 9, ew, 3);
        } else {
          for (var f2 = 0; f2 < Math.floor(ew / 9); f2++) ctx.fillRect(X(e.x) - ew / 2 + 2 + f2 * 9, Z(e.z) - el / 2, 3, el);
        }
        ctx.fillStyle = "rgba(240,242,255,0.7)";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(e.label, X(e.x), Z(e.z) + (el > ew ? -el / 2 - 8 : el / 2 + 16));
      });
      // DIN 座圆丝印
      ctx.strokeStyle = "rgba(206,176,92,0.9)";
      ctx.lineWidth = 2.5;
      L.dins.forEach(function (d) {
        ctx.beginPath();
        ctx.arc(X(d.x), Z(d.z), d.r * sx, 0, Math.PI * 2);
        ctx.stroke();
      });
      // DB9 丝印框
      L.db9s.forEach(function (p) {
        ctx.strokeStyle = "rgba(240,242,255,0.7)";
        ctx.lineWidth = 2;
        ctx.strokeRect(X(p[0]) - 20, Z(p[1]) - 15, 40, 30);
      });
      // 芯片丝印
      L.chips.forEach(function (c) { dipSilk(ctx, X(c.x), Z(c.z), c.w * sx, c.l * sz, c.ref, c.name); });
      L.dram.forEach(function (d, i) { dipSilk(ctx, X(d[0]), Z(d[1]), 0.12 * sx, 0.26 * sz, "U" + (i < 4 ? 9 + i : 17 + i), "4164"); });
      // 接口文字丝印
      ctx.fillStyle = "rgba(240,242,255,0.8)";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "left";
      ctx.fillText("PWR 9V AC + 5V DC", X(-1.95) - 42, Z(1.12) + 30);
      ctx.fillText("JOY 1", X(0.2) - 18, Z(1.35) + 34);
      ctx.fillText("JOY 2", X(0.85) - 18, Z(1.35) + 34);
      ctx.fillText("IEC", X(1.45) - 12, Z(1.35) + 28);
      ctx.fillText("VIDEO·AUDIO", X(1.3) - 44, Z(-1.18) - 14);
      ctx.fillText("RF", X(1.85) - 10, Z(-1.02) - 28);
      // 弧形机名 + 小字
      arcText(ctx, "COMMODORE 64", X(0.35), Z(-1.45) + 610, 545, -2.18, -0.96, 46);
      ctx.fillStyle = "rgba(240,242,255,0.65)";
      ctx.font = "bold 15px monospace";
      ctx.fillText("PERSONAL COMPUTER", X(-1.85), Z(-1.22));
      ctx.font = "bold 16px monospace";
      ctx.fillText("ASSY 250425 · PAL", X(2.1) - 140, Z(1.32));
      ctx.font = "12px monospace";
      ctx.fillStyle = "rgba(240,242,255,0.5)";
      ctx.fillText("MOS 6510 · 6569 · 6581 · 6526", X(-2.1), Z(1.38));
    });
  }

  /* 芯片顶面丝印(文字沿板面前后向排布) */
  function chipTop(w, h, title, sub) {
    return makeTex(w, h, function (ctx) {
      ctx.fillStyle = "#15161b";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.beginPath();
      ctx.arc(w - 8, 10, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(Math.PI / 2);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#dcdad2";
      ctx.font = "bold 21px Menlo, Consolas, monospace";
      ctx.fillText(title, 0, sub ? -9 : 0, h - 12);
      if (sub) {
        ctx.fillStyle = "rgba(220,218,210,0.62)";
        ctx.font = "12px Menlo, Consolas, monospace";
        ctx.fillText(sub, 0, 12, h - 14);
      }
      ctx.restore();
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(255,255,255,0.09)");
      g.addColorStop(0.25, "rgba(255,255,255,0.01)");
      g.addColorStop(1, "rgba(0,0,0,0.12)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
  }

  C64B.Textures = {
    sky: sky,
    desk: desk,
    mat: mat,
    c64Pcb: c64Pcb,
    chipTop: chipTop,
    makeTex: makeTex
  };
})(window.C64B = window.C64B || {});
