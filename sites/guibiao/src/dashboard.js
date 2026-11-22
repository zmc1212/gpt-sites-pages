/* 底部仪表盘:① 影长实时 ② 太阳几何 ③ 廿四气影长表(周髀对照) ④ 影长曲线 */
(function (MECH) {
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "SHADOW · 影长", meta: "L=H/tan(h)", dot: "teal", canvasH: 100, draw: drawShadow },
    { title: "SUN · 太阳几何", meta: "h=90°−φ+δ", dot: "blue", canvasH: 88, draw: drawSun },
    { title: "CAL · 廿四气表", meta: "周髀对照", dot: "pink", canvasH: 100, draw: drawCal },
    { title: "CURVE · 曲线", meta: "影长-节气", dot: "yellow", canvasH: 66, draw: drawCurve }
  ] };

  function drawShadow(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    /* 表+影示意(侧视) */
    var gy = h - 16, S = (h - 40) / D.H;
    var bx = w * 0.72;
    ctx.strokeStyle = "rgba(233,238,242,0.5)"; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(bx, gy); ctx.lineTo(bx, gy - D.H * S); ctx.stroke();
    ctx.strokeStyle = "rgba(233,238,242,0.25)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(gx0(bx), gy); ctx.lineTo(w - 8, gy); ctx.stroke();
    function gx0(bx) { return 8; }
    /* 影 */
    ctx.fillStyle = "rgba(20,24,30,0.85)";
    ctx.fillRect(bx - Math.min(st.shadow, D.guL) * S, gy - 4, Math.min(st.shadow, D.guL) * S, 4);
    /* 光线 */
    ctx.strokeStyle = "rgba(242,193,78,0.7)"; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx - st.shadow * S, gy - D.H * S - (st.shadow * S) * 0.0);
    ctx.lineTo(bx, gy);
    ctx.stroke();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("影端 " + (st.shadow / D.ZHOU).toFixed(2) + " 尺", 8, 12);
    ctx.fillText("表高 8尺 · 圭长 3.5m", 8, h - 5);
  }

  function drawSun(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    /* 高度角仪表 */
    var cx = w * 0.30, cy = h * 0.5, R = Math.min(cy, cx) - 8;
    ctx.strokeStyle = "rgba(233,238,242,0.25)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
    ctx.setLineDash([]);
    var a = st.alt;
    ctx.strokeStyle = yellow; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx - Math.cos(a) * R, cy - Math.sin(a) * R);
    ctx.stroke();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("h " + (a * 57.3).toFixed(1) + "°", 8, 12);
    ctx.fillText("δ " + (st.decl * 57.3).toFixed(1) + "°(±24°)", 8, h - 5);
    /* 圭长余量 */
    ctx.textAlign = "right";
    var margin = D.guL - st.shadow;
    ctx.fillStyle = margin > 0 ? green : red;
    ctx.fillText("圭余 " + margin.toFixed(2) + "m", w - 8, 12);
  }

  function drawCal(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    /* 24 气影长柱(冬→夏→冬)+ 当前位 */
    var n = 24;
    var bw = (w - 20) / n;
    for (var i = 0; i < n; i++) {
      var f = i / 24;
      var L = KS.shadowLen(f);
      var hh = Math.min(1, L / D.Lwinter) * (h - 26);
      ctx.fillStyle = "rgba(127,216,216,0.55)";
      ctx.fillRect(10 + i * bw + 1, h - 14 - hh, bw - 2, hh);
    }
    /* 周髀参考线:夏至 1.6尺 冬至 13.5尺 */
    var yS = h - 14 - Math.min(1, D.refSummer / D.Lwinter) * (h - 26);
    ctx.strokeStyle = yellow; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(8, yS); ctx.lineTo(w - 8, yS); ctx.stroke();
    ctx.setLineDash([]);
    /* 当前气 */
    var cur = Math.floor(st.frac * 24) % 24;
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(10 + cur * bw, 8); ctx.lineTo(10 + cur * bw, h - 10); ctx.stroke();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("冬至", 8, h - 3);
    ctx.textAlign = "center";
    ctx.fillText("夏至 1.6尺", w * 0.5, yS - 4);
    ctx.textAlign = "right";
    ctx.fillText("冬至 13.5尺", w - 8, h - 3);
  }

  function drawCurve(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var hist = st.hist || [];
    var mid = h / 2;
    if (hist.length > 1) {
      ctx.strokeStyle = teal; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var i = 0; i < hist.length; i++) {
        var x = i / 219 * w;
        var y = h - 10 - Math.min(1, hist[i] / D.Lwinter) * (h - 22);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("影长时序(随节气)", 8, 12);
    ctx.textAlign = "right";
    ctx.fillText("气损益九寸九分/气(周髀)", w - 8, 12);
  }
})(window.MECH = window.MECH || {});
