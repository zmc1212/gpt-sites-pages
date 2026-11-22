/* 底部仪表盘:① 碢轮端视 ② 踏板-轴摆曲线 ③ 缘速比 ④ 划痕深度 */
(function (MECH) {
  var D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "DISC · 碢轮", meta: "铁碢 r0.14 · 端视", dot: "teal", canvasH: 100, draw: drawDisc },
    { title: "ROCKER · 往复", meta: "踏板-轴摆曲线", dot: "blue", canvasH: 88, draw: drawRocker },
    { title: "SPEED · 缘速比", meta: "R碢/r鼓 = 3.11", dot: "yellow", canvasH: 66, draw: drawSpeed },
    { title: "NOTCH · 划痕", meta: "逐忽划断", dot: "green", canvasH: 66, draw: drawNotch }
  ] };

  function drawDisc(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.5, R = Math.min(cy, cx) - 8;
    var s = R / D.Rdisc;
    ctx.strokeStyle = "rgba(233,238,242,0.35)"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = faint;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.12, 0, Math.PI * 2); ctx.stroke();
    /* 辐条(铁碢磨痕) */
    for (var i = 0; i < 8; i++) {
      var a = st.phiAxle + i / 8 * Math.PI * 2;
      ctx.strokeStyle = "rgba(233,238,242,0.25)"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * R * 0.15, cy + Math.sin(a) * R * 0.15);
      ctx.lineTo(cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92);
      ctx.stroke();
    }
    /* 玉料接触点(西缘) */
    ctx.fillStyle = "#7CA98B";
    ctx.beginPath(); ctx.arc(cx - R, cy, 5, 0, Math.PI * 2); ctx.fill();
    /* 划痕角(随 notch 增大) */
    var fl = st.notch / D.notchMax;
    ctx.strokeStyle = yellow; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(cx - R, cy, 9, -fl * Math.PI * 0.6, 0); ctx.stroke();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("φ轴 " + st.phiAxle.toFixed(2) + " rad · 往复 " + st.strokes, 8, 12);
    ctx.fillText("ω " + st.omegaAxle.toFixed(2) + " rad/s", 8, h - 5);
  }

  function drawRocker(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var mid = h / 2;
    ctx.strokeStyle = "rgba(233,238,242,0.16)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    var hist = st.hist || [];
    if (hist.length > 1) {
      ctx.strokeStyle = teal; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var i = 0; i < hist.length; i++) {
        var x = i / 239 * w;
        var y = mid - Math.max(-D.phiAxleAmp, Math.min(D.phiAxleAmp, hist[i])) / D.phiAxleAmp * h * 0.32;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    /* 踏板位置指示 */
    var fp = st.phiPedal / D.pedalAmp;
    ctx.fillStyle = yellow;
    ctx.fillRect(w - 14, mid - 8 - (h * 0.32 - 8) * fp, 6, 8);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("踏板 φ " + (st.phiPedal * 57.3).toFixed(0) + "° · 摆角 ±" + (D.pedalAmp * 57.3).toFixed(0) + "°", 6, 12);
    ctx.fillText("换向 " + st.strokes + " 次(绳传动天然往复)", 6, h - 5);
  }

  function drawSpeed(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var vRope = Math.abs(st.omegaAxle) * D.rdrum;
    var vRim = Math.abs(st.omegaAxle) * D.Rdisc;
    var vmax = D.phiAxleAmp * D.freq * 2 * Math.PI * D.Rdisc;
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("绳速 " + vRope.toFixed(2) + " m/s", 8, 14);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 18, w - 16, 9);
    ctx.fillStyle = "rgba(233,238,242,0.6)"; ctx.fillRect(8, 18, (w - 16) * Math.min(1, vRope / vmax), 9);
    ctx.fillText("碢缘 " + vRim.toFixed(2) + " m/s (= 3.11×绳速)", 8, 40);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 44, w - 16, 9);
    ctx.fillStyle = yellow; ctx.fillRect(8, 44, (w - 16) * Math.min(1, vRim / vmax), 9);
  }

  function drawNotch(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var f = st.notch / D.notchMax;
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("划痕深 " + (st.notch * 1000).toFixed(1) + " / " + (D.notchMax * 1000).toFixed(0) + " mm", 8, 12);
    /* 玉料剖面示意 */
    ctx.strokeStyle = "rgba(124,169,139,0.9)"; ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.30, 20, w * 0.40, h - 30);
    ctx.fillStyle = "#2E3A32";
    ctx.fillRect(w * 0.30 + w * 0.40 / 2 - 3, 20, 6, (h - 30) * f);
    ctx.strokeStyle = yellow; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(w * 0.30 + w * 0.40 / 2 - 10, 20 + (h - 30) * f);
    ctx.lineTo(w * 0.30 + w * 0.40 / 2 + 10, 20 + (h - 30) * f);
    ctx.stroke();
    ctx.fillStyle = soft; ctx.textAlign = "center";
    ctx.fillText("碢缘", w * 0.30 + w * 0.40 / 2, h - 3);
  }
})(window.MECH = window.MECH || {});
