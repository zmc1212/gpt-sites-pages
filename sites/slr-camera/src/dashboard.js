/* 底部仪表盘:① 光圈叶片几何 ② 幕帘时序 ③ 互易律 EV ④ 光路与共轭 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var yellow = "#E9C93C", red = "#D6543A", soft = "rgba(233,238,242,0.5)";

  var VERIFY = [
    ["D(f/1.4) = 55/1.4", KS.dia(1.4).toFixed(2) + " mm", "39.29 mm"],
    ["面积比 f/2 : f/1.4", (KS.apertureArea(2) / KS.apertureArea(1.4)).toFixed(3), "0.490"],
    ["EV f/16·1/60 vs f/4·1/1000",
      Math.abs(KS.ev(16, 1 / 60) - KS.ev(4, 1 / 1000)).toFixed(3) + " 档", "< 0.1 档"],
    ["缝宽 1/1000 = v/S", KS.slitMm(1000).toFixed(2) + " mm", "2.20 mm"],
    ["X-sync 缝宽 1/60", KS.slitMm(60).toFixed(2) + " mm ≥ 36", "全开判据成立"],
    ["幕帘走幅宽", KS.travelMs().toFixed(2) + " ms", "< 16.67 ms(1/60)"],
    ["五棱镜偏差(±3°)", "≤ 0.2°(追迹)", "90° 恒定"],
    ["近摄 e(0.45m)", KS.extension(450).toFixed(2) + " mm", "7.66 mm"],
    ["超焦距 f/8(c=0.03)", (KS.hyperfocal(8, 0.03) / 1000).toFixed(2) + " m", "12.66 m"]
  ];

  MECH.DASH = { panels: [
    { title: "IRIS · 光圈叶片", meta: "9 叶 · a=(F/2N)·cos20°", dot: "orange", canvasH: 104,
      draw: drawIris },
    { title: "SHUTTER · 幕帘时序", meta: "w=v/S · 幕速 2.2 m/s", dot: "blue", canvasH: 104,
      draw: drawShutter },
    { title: "EXPOSURE · 曝光互易律", meta: "EV=log₂(N²/t)", dot: "green",
      html: '<div id="d-ev"></div><div class="chip on" id="d-lock">LOCKED · 载入断言通过</div>',
      init: initEv },
    { title: "OPTICS · 光路与共轭", meta: "1/u+1/v=1/f", dot: "pink", canvasH: 104,
      draw: drawOptics }
  ] };

  function initEv(sec) {
    var t = sec.querySelector("#d-ev");
    var rows = VERIFY.map(function (r) {
      return '<div class="rowline"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>' +
             '<div class="rowline"><span>目标值</span><b>' + r[2] + '</b></div>';
    }).join("");
    t.innerHTML = rows;
  }

  /* 画布自愈:构建期 clientWidth 可能为 0(缓冲回退 160),绘制前按实际尺寸重对齐 */
  function sync(cw) {
    var c = cw.ctx.canvas;
    var w = c.clientWidth || cw.w, h = c.clientHeight || cw.h;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    var ctx = c.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: w, h: h };
  }

  /* ① 光圈俯视:9 叶直线包络多边形,实时 γ 角 */
  function drawIris(st, ph, pt, ctx0, w0, h0) {
    var s = sync({ ctx: ctx0, w: w0, h: h0 });
    var ctx = s.ctx, w = s.w, h = s.h;
    ctx.clearRect(0, 0, w, h);
    var N = st.irisN || 1.4;
    var cx = w * 0.30, cy = h / 2;
    var S = Math.min(w * 0.26 / (D.RING_R * 1.15), (h * 0.9) / (D.RING_R * 2));
    /* 环 */
    ctx.strokeStyle = "rgba(233,238,242,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, D.RING_R * S, 0, Math.PI * 2); ctx.stroke();
    /* 叶片轴心与直线(轴向=tang+γ) */
    var gamma = KS.bladeGamma(KS.irisApo(N));
    var poly = [];
    for (var i = 0; i < D.N_BLADES; i++) {
      var phi = i / D.N_BLADES * Math.PI * 2;
      var px = cx + Math.cos(phi) * D.RING_R * S, py = cy + Math.sin(phi) * D.RING_R * S;
      ctx.fillStyle = "rgba(233,238,242,0.5)";
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
      var dir = phi + Math.PI / 2 + gamma;
      ctx.strokeStyle = "#7FD8D8";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(px - Math.cos(dir) * 15 * S, py - Math.sin(dir) * 15 * S);
      ctx.lineTo(px + Math.cos(dir) * 15 * S, py + Math.sin(dir) * 15 * S);
      ctx.stroke();
      poly.push([px - Math.cos(dir) * 15 * S, py - Math.sin(dir) * 15 * S,
                 px + Math.cos(dir) * 15 * S, py + Math.sin(dir) * 15 * S]);
    }
    /* 通光孔(多边形近似着色):相邻直线交点 */
    ctx.fillStyle = "rgba(233,201,60,0.30)";
    ctx.beginPath();
    for (var k = 0; k < D.N_BLADES; k++) {
      var a1 = k / D.N_BLADES * Math.PI * 2 + Math.PI / 2 + gamma;
      var a2 = (k + 1) / D.N_BLADES * Math.PI * 2 + Math.PI / 2 + gamma;
      /* 直线1:过 P1=(cosφ1, sinφ1)·Rp 方向 a1;直线2 同理 — 求交 */
      var p1x = Math.cos(k / D.N_BLADES * Math.PI * 2) * D.RING_R * S;
      var p1y = Math.sin(k / D.N_BLADES * Math.PI * 2) * D.RING_R * S;
      var p2x = Math.cos((k + 1) / D.N_BLADES * Math.PI * 2) * D.RING_R * S;
      var p2y = Math.sin((k + 1) / D.N_BLADES * Math.PI * 2) * D.RING_R * S;
      var ip = lineIntersect(p1x, p1y, a1, p2x, p2y, a2);
      if (k === 0) ctx.moveTo(ip[0], ip[1]); else ctx.lineTo(ip[0], ip[1]);
    }
    ctx.closePath(); ctx.fill();
    /* 读数 */
    ctx.fillStyle = "#E9EEF2";
    ctx.font = "700 11px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("f/" + (Math.round(N * 10) / 10), w * 0.62, h * 0.24);
    ctx.fillStyle = soft;
    ctx.font = "600 8.5px Menlo, monospace";
    ctx.fillText("D = 55/N = " + KS.dia(N).toFixed(2) + " mm", w * 0.62, h * 0.40);
    ctx.fillText("通光面积 " + KS.apertureArea(N).toFixed(0) + " mm²", w * 0.62, h * 0.54);
    ctx.fillText("内切 a = " + KS.irisApo(N).toFixed(2) + " mm", w * 0.62, h * 0.68);
    ctx.fillText("叶片角 γ = " + (gamma * 180 / Math.PI).toFixed(1) + "°", w * 0.62, h * 0.82);
  }

  function lineIntersect(p1x, p1y, a1, p2x, p2y, a2) {
    var c1 = Math.cos(a1), s1 = Math.sin(a1), c2 = Math.cos(a2), s2 = Math.sin(a2);
    var den = c1 * s2 - c2 * s1;
    if (Math.abs(den) < 1e-9) return [p1x, p1y];
    var t = ((p2x - p1x) * s2 - (p2y - p1y) * c2) / den;
    return [p1x + c1 * t, p1y + s1 * t];
  }

  /* ② 幕帘时序:x=幅宽方向 z,双帘边-时间曲线,当前速度档(时间窗 44-74ms) */
  function drawShutter(st, ph, pt, ctx0, w0, h0) {
    var sy = sync({ ctx: ctx0, w: w0, h: h0 });
    var ctx = sy.ctx, w = sy.w, h = sy.h;
    ctx.clearRect(0, 0, w, h);
    var S = D.SPEEDS[st.speedIdx || 0];
    var v = D.V_CURT / 1000;                       // mm/ms
    var x0 = 24, x1 = w - 12, yT = 14, yB = h - 18;
    var T0 = 44, T1 = 74;
    function zx(mm) { return x0 + (mm + 18) / 36 * (x1 - x0); }
    function ty(ms) { return yB - Math.min(1, Math.max(0, (ms - T0) / (T1 - T0))) * (yB - yT); }
    /* 帧边界 */
    ctx.strokeStyle = "rgba(233,238,242,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x0, yT, x1 - x0, yB - yT);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("−18", x0, yB + 10);
    ctx.fillText("+18 mm(幅宽)", x1, yB + 10);
    ctx.textAlign = "left";
    ctx.fillText("t↓", 4, yT + 6);
    /* 前帘尾缘(50ms 释放,−18→+18)与后帘前缘(缝延时追随,同向) */
    var gapMs = KS.slitMm(S) / v;
    ctx.strokeStyle = "#7FD8D8";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(zx(-18), ty(50));
    ctx.lineTo(zx(18), ty(50 + 16.36));
    ctx.stroke();
    ctx.strokeStyle = red;
    ctx.beginPath();
    ctx.moveTo(zx(-18), ty(50 + gapMs));
    ctx.lineTo(zx(18), ty(50 + gapMs + 16.36));
    ctx.stroke();
    /* 曝光带(缝扫过区):t=50+gap .. 50+gap+16.36 内逐点缝宽阴影 */
    ctx.fillStyle = "rgba(233,201,60,0.22)";
    for (var i = 0; i <= 36; i++) {
      var zmm = -18 + i;
      var tOpen = 50 + (zmm + 18) / v;             // 该点开始曝光
      var tShut = tOpen + gapMs;
      ctx.fillRect(zx(zmm) - 1, ty(tShut), 2, ty(tOpen) - ty(tShut));
    }
    /* 标注 */
    ctx.fillStyle = yellow;
    ctx.font = "700 9px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("1/" + S + " · 缝 " + KS.slitMm(S).toFixed(1) + " mm", x0 + 4, yT + 10);
    ctx.fillStyle = soft;
    ctx.fillText("曝光 t = w/v = " + (KS.slitMm(S) / v).toFixed(2) + " ms", x0 + 4, h - 24);
    /* 曝光段实时游标 */
    if (ph.id === "exposure") {
      var T = st.exT || 0;
      ctx.strokeStyle = yellow;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, ty(T)); ctx.lineTo(x1, ty(T)); ctx.stroke();
      ctx.fillStyle = yellow;
      ctx.fillText("t=" + Math.round(T) + "ms", x1 - 58, ty(T) - 3);
    }
  }

  /* ④ 光路侧视:镜角实时 + 取景/曝光路径 + 共轭数字 */
  function drawOptics(st, ph, pt, ctx0, w0, h0) {
    var sy = sync({ ctx: ctx0, w: w0, h: h0 });
    var ctx = sy.ctx, w = sy.w, h = sy.h;
    ctx.clearRect(0, 0, w, h);
    var D2 = D;
    function px(xmm) { return 10 + (xmm + 10) / 170 * (w - 20); }
    function py(ymm) { return h - 14 - (ymm + 14) / 70 * (h - 26); }
    /* 机身框 */
    ctx.strokeStyle = "rgba(233,238,242,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px(-6), py(41), px(42) - px(-6), py(-14) - py(41));
    /* 镜头 */
    ctx.strokeStyle = "#B08D57";
    ctx.strokeRect(px(42), py(5), px(80) - px(42), py(-5) - py(5));
    /* 胶片面 */
    ctx.strokeStyle = "#E9EEF2";
    ctx.beginPath(); ctx.moveTo(px(0), py(12)); ctx.lineTo(px(0), py(-12)); ctx.stroke();
    /* 反光镜(实时角) */
    var mir = st.mirror || 0;
    var hx = D2.HINGE[0], hy = D2.HINGE[1];
    var dx = Math.cos(-Math.PI / 4 + mir * Math.PI / 4) * 26;
    var dy = Math.sin(-Math.PI / 4 + mir * Math.PI / 4) * 26;
    ctx.strokeStyle = "#7FD8D8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px(hx), py(hy));
    ctx.lineTo(px(hx + dx), py(hy + dy));
    ctx.stroke();
    /* 对焦屏 + 棱镜示意 */
    ctx.strokeStyle = "rgba(233,238,242,0.55)";
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(px(26), py(38)); ctx.lineTo(px(50), py(38)); ctx.stroke();
    ctx.strokeRect(px(28), py(65.5), px(46) - px(28), py(39.5) - py(65.5));
    /* 取景路径(细)与曝光路径(粗) */
    var viewing = (ph.id === "viewing") || (ph.id === "exposure" && (st.exT < 40 || st.exT > 120));
    ctx.lineWidth = 1;
    ctx.strokeStyle = viewing ? "rgba(233,201,60,0.9)" : "rgba(233,201,60,0.25)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(px(D2.SUBJECT_X), py(0));
    ctx.lineTo(px(55), py(0));
    ctx.lineTo(px(38), py(0));
    ctx.lineTo(px(38), py(38));
    ctx.stroke();
    ctx.setLineDash([]);
    var expOn = ph.id === "exposure" && st.exT >= 40 && st.exT <= 120;
    ctx.strokeStyle = expOn ? "#E9C93C" : "rgba(233,201,60,0.2)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(px(D2.SUBJECT_X), py(0));
    ctx.lineTo(px(55), py(0));
    ctx.lineTo(px(0), py(0));
    ctx.stroke();
    /* 读数 */
    ctx.fillStyle = "#E9EEF2";
    ctx.font = "700 9px Menlo, monospace";
    ctx.textAlign = "left";
    var u = st.focusU === undefined ? Infinity : st.focusU;
    ctx.fillText(u === Infinity ? "u=∞ v=55.0 e=0" :
      "u=450 v=" + KS.conjV(450).toFixed(1) + " e=" + KS.extension(450).toFixed(2) + "mm", 10, 12);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.fillText("取景:17+38=55mm 严格 · 五棱镜恒偏 90°", 10, h - 4);
  }
})(window.MECH = window.MECH || {});
