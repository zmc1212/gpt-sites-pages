/* 底部仪表盘:① 相似三角几何 ② 屏像与亮度/模糊 ③ 孔径对照 ④ 验算 */
(function (MECH) {
  var D = MECH.DIM, KS = MECH.KS;
  var yellow = "#E9C93C", red = "#D6543A", soft = "rgba(233,238,242,0.5)";

  var VERIFY = [
    ["足之景 y′=−(−30)·b/a", (30 * 90 / 110).toFixed(2) + " mm(向上)", "24.55 mm 于上"],
    ["半影 Δ=d(a+b)/a", KS.penumbra(5, 110, 90).toFixed(2) + " mm", "9.32 mm"],
    ["照度比 (5/10)²", KS.lumRatio(5, 10).toFixed(2), "0.25"],
    ["日像 ≈ b·tan0.53°+d", KS.sunImage(5, 90).toFixed(2) + " mm", "5.83 mm"],
    ["景长(人 60mm)", KS.imgLen(60, 110, 90).toFixed(2) + " mm", "49.09 mm"],
    ["行走反向 Δy′=−Δx·b/a", (-12 * 90 / 110).toFixed(2) + " mm @Δx=12", "-9.82 mm"]
  ];

  MECH.DASH = { panels: [
    { title: "GEOM · 相似三角", meta: "y′=−y·b/a · 足上首下", dot: "teal", canvasH: 104,
      draw: drawGeom },
    { title: "IMAGE · 屏像", meta: "实算纹理 · 亮度∝d²", dot: "blue", canvasH: 104,
      draw: drawImage },
    { title: "APERTURE · 孔径对照", meta: "明与糊 / 暗与锐", dot: "orange", canvasH: 104,
      draw: drawAperture },
    { title: "VERIFY · 验算", meta: "载入断言逐条", dot: "green",
      html: '<div id="d-verify"></div><div class="chip on" id="d-lock">LOCKED · 载入断言通过</div>',
      init: initVerify }
  ] };

  function initVerify(sec) {
    var t = sec.querySelector("#d-verify");
    t.innerHTML = VERIFY.map(function (r) {
      return '<div class="rowline"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>' +
             '<div class="rowline"><span>目标值</span><b>' + r[2] + '</b></div>';
    }).join("");
  }

  /* 画布自愈(构建期 clientWidth 可能为 0) */
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

  /* ① 相似三角:物箭头(正立)→ 孔 → 倒像箭头 */
  function drawGeom(st, ph, pt, ctx0, w0, h0) {
    var s = sync({ ctx: ctx0, w: w0, h: h0 });
    var ctx = s.ctx, w = s.w, h = s.h;
    ctx.clearRect(0, 0, w, h);
    var a = st.a, b = st.b;
    var x0 = 8, x1 = w - 8;
    function px(xmm) { return x0 + (xmm + 260) / (260 + 170) * (x1 - x0); }
    var cy = h * 0.52;
    var sc = (h * 0.62) / 120;             // mm → px(物高窗 ±60)
    /* 孔与墙 */
    ctx.strokeStyle = "rgba(233,238,242,0.4)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(px(0), cy - 52 * sc); ctx.lineTo(px(0), cy - 2.5 * sc);
    ctx.moveTo(px(0), cy + 2.5 * sc); ctx.lineTo(px(0), cy + 52 * sc);
    ctx.stroke();
    /* 光线:足/首 过孔缘 */
    [["foot", -30, "#7FD8D8"], ["head", 30, "#E9C93C"]].forEach(function (it) {
      [-1, 1].forEach(function (rim) {
        var r = KS.rayTo(it[1], rim * st.d / 2, a, b);
        ctx.strokeStyle = it[2];
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.moveTo(px(-a), cy - r.pts[0][1] * sc);
        ctx.lineTo(px(0), cy - r.pts[1][1] * sc);
        ctx.lineTo(px(b), cy - r.pts[2][1] * sc);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
    });
    /* 物箭头(正立)与景箭头(倒立) */
    function arrow(xAt, y0, y1, color, label) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xAt, cy - y0 * sc); ctx.lineTo(xAt, cy - y1 * sc);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      var tip = cy - y1 * sc, dirn = y1 > y0 ? 1 : -1;
      ctx.moveTo(xAt, tip);
      ctx.lineTo(xAt - 4, tip - dirn * 6);
      ctx.lineTo(xAt + 4, tip - dirn * 6);
      ctx.closePath(); ctx.fill();
      ctx.font = "600 8px Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(label, xAt, tip - dirn * 10);
    }
    arrow(px(-a), -30, 30, "#E9EEF2", "物(正立)");
    arrow(px(b), KS.imgY(-30, a, b), KS.imgY(30, a, b), yellow, "景(倒立)");
    /* 标注 */
    ctx.fillStyle = soft;
    ctx.font = "600 8px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("a=" + a + "mm", px(-a / 2) - 14, cy + 40 * sc + 12);
    ctx.fillText("b=" + Math.round(b), px(b / 2) - 8, cy + 40 * sc + 12);
    ctx.fillText("孔 d=" + st.d.toFixed(1), px(0) + 4, cy - 46 * sc);
    ctx.fillStyle = "#E9EEF2";
    ctx.fillText("放大 " + (b / a).toFixed(2) + " 倍 · 景倒立", x0 + 2, 12);
  }

  /* ② 屏像:拷贝实算纹理 + 亮度/模糊读数 */
  function drawImage(st, ph, pt, ctx0, w0, h0) {
    var s = sync({ ctx: ctx0, w: w0, h: h0 });
    var ctx = s.ctx, w = s.w, h = s.h;
    ctx.clearRect(0, 0, w, h);
    var sc = MECH.Parts.entry("screen");
    if (sc && sc.shown && sc.group.userData.canvas) {
      var img = sc.group.userData.canvas;
      var iw = h * 0.86, ih = h * 0.86;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 8, 8, ih * 0.9, ih);
    }
    var lum = (st.d / 10) * (st.d / 10);
    var blur = KS.penumbra(st.d, st.a, st.b);
    ctx.fillStyle = "#E9EEF2";
    ctx.font = "700 10px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("d = " + st.d.toFixed(1) + " mm", iw + 24, 18);
    ctx.fillStyle = soft;
    ctx.font = "600 8.5px Menlo, monospace";
    ctx.fillText("亮度 ∝ d²:", iw + 24, 38);
    ctx.fillStyle = "rgba(233,238,242,0.18)";
    ctx.fillRect(iw + 24, 44, w - iw - 34, 8);
    ctx.fillStyle = yellow;
    ctx.fillRect(iw + 24, 44, Math.min(1, lum / 1.7) * (w - iw - 34), 8);
    ctx.fillStyle = soft;
    ctx.fillText("半影 Δ = d(a+b)/a:", iw + 24, 68);
    ctx.fillStyle = "rgba(233,238,242,0.18)";
    ctx.fillRect(iw + 24, 74, w - iw - 34, 8);
    ctx.fillStyle = red;
    ctx.fillRect(iw + 24, 74, Math.min(1, blur / 26) * (w - iw - 34), 8);
    ctx.fillStyle = "#E9EEF2";
    ctx.fillText(lum.toFixed(3) + " ×(d=10 基准)", iw + 24, 92);
    ctx.fillText("Δ = " + blur.toFixed(2) + " mm", iw + 24, 104);
  }

  /* ③ 孔径对照:三孔径行的半影/亮度 */
  function drawAperture(st, ph, pt, ctx0, w0, h0) {
    var s = sync({ ctx: ctx0, w: w0, h: h0 });
    var ctx = s.ctx, w = s.w, h = s.h;
    ctx.clearRect(0, 0, w, h);
    var rows = [[10, "亮而糊"], [5, "均衡(默认)"], [2, "暗而锐"]];
    var y0 = 18;
    rows.forEach(function (r, i) {
      var yy = y0 + i * 30;
      var d = r[0];
      var cur = Math.abs(st.d - d) < 0.6;
      ctx.fillStyle = cur ? yellow : soft;
      ctx.font = "700 " + (cur ? 10 : 9) + "px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("d=" + d + "mm · " + r[1], 8, yy);
      ctx.fillStyle = cur ? "#E9EEF2" : "rgba(233,238,242,0.55)";
      ctx.font = "600 8.5px Menlo, monospace";
      ctx.fillText("半影 " + KS.penumbra(d, st.a, st.b).toFixed(1) + "mm", 130, yy);
      ctx.fillText("亮度 " + KS.lumRatio(d, 10).toFixed(2) + "×", 240, yy);
      /* 小示意圆孔 */
      var cx = w - 30, cyy = yy - 3;
      ctx.strokeStyle = cur ? yellow : "rgba(233,238,242,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cyy, d * 0.9, 0, Math.PI * 2); ctx.stroke();
      if (cur) { ctx.fillStyle = "rgba(233,201,60,0.25)"; ctx.fill(); }
      /* 分隔线 */
      if (i < 2) {
        ctx.strokeStyle = "rgba(233,238,242,0.12)";
        ctx.beginPath(); ctx.moveTo(8, yy + 12); ctx.lineTo(w - 8, yy + 12); ctx.stroke();
      }
    });
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.fillText("孔大 → 集光多但每点糊圆大;孔小 → 锐但照度按 d² 跌", 8, h - 6);
  }
})(window.MECH = window.MECH || {});
