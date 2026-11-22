/* 底部仪表盘:① 立轮侧视 ② 攀耳击发相位 ③ 摆角曲线 ④ 面粉产出 */
(function (MECH) {
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", red = "#D6543A", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "WHEEL · 立轮", meta: "12 斗叶 · 侧视", dot: "teal", canvasH: 100, draw: drawWheel },
    { title: "CAM · 攀耳击发", meta: "3×120°", dot: "blue", canvasH: 88, draw: drawCam },
    { title: "SWING · 摆角", meta: "阻尼单摆+冲量", dot: "pink", canvasH: 100, draw: drawSwing },
    { title: "FLOUR · 产出", meta: "筛落累计", dot: "yellow", canvasH: 66, draw: drawFlour }
  ] };

  /* ① 立轮侧视(轮面朝 ±z,绘制 x-y 平面侧转 90°:以 z 向下) */
  function drawWheel(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.48, R = Math.min(cy, cx) - 10;
    var s = R / D.Rwheel;
    ctx.strokeStyle = "rgba(233,238,242,0.30)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = faint;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.12, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < D.nBlade; i++) {
      var a = st.thetaWheel + i / D.nBlade * Math.PI * 2;
      ctx.strokeStyle = teal; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * R * 0.12, cy + Math.sin(a) * R * 0.12);
      ctx.lineTo(cx + Math.cos(a) * R * 0.94, cy + Math.sin(a) * R * 0.94);
      ctx.stroke();
    }
    /* 渠水位横线 */
    ctx.strokeStyle = "rgba(79,163,199,0.8)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(6, cy + D.Rwheel * s * 0.72); ctx.lineTo(w - 6, cy + D.Rwheel * s * 0.72); ctx.stroke();
    ctx.fillStyle = "rgba(79,163,199,0.25)";
    ctx.fillRect(6, cy + D.Rwheel * s * 0.72, w - 12, h - (cy + D.Rwheel * s * 0.72));
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("ω " + st.omegaShaft.toFixed(2) + " rad/s", 8, 12);
    ctx.fillText("半浸 · 下击受水", 8, h - 5);
  }

  /* ② 攀耳盘(端视):3 耳旋转 + 撞杆位置 + 接触区高亮 */
  function drawCam(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.35, cy = h * 0.5, R = Math.min(cy, cx) - 8;
    ctx.strokeStyle = "rgba(233,238,242,0.30)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < D.camN; i++) {
      var a = st.thetaShaft * D.camN + i / D.camN * Math.PI * 2;
      var dx = Math.cos(a), dy = Math.sin(a);
      ctx.strokeStyle = teal; ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(cx + dx * R * 0.2, cy + dy * R * 0.2);
      ctx.lineTo(cx + dx * R, cy + dy * R);
      ctx.stroke();
      var near = Math.abs(KS.wrapPi(a)) < 0.35;
      if (near) {
        ctx.fillStyle = yellow;
        ctx.beginPath(); ctx.arc(cx + dx * R, cy + dy * R, 4, 0, Math.PI * 2); ctx.fill();
      }
    }
    /* 撞杆(右侧竖线) */
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(w - 26, cy - 18); ctx.lineTo(w - 26, cy + 18); ctx.stroke();
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("击频 " + (st.omegaShaft * D.camN / (2 * Math.PI)).toFixed(2) + " Hz", 6, 12);
    ctx.fillText("冲量 Δθ̇=" + D.kick.toFixed(2), 6, h - 5);
    ctx.textAlign = "right";
    ctx.fillText("撞杆", w - 6, cy - 22);
  }

  /* ③ 摆角曲线(历史 + 击发竖标) */
  function drawSwing(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var mid = h / 2;
    ctx.strokeStyle = "rgba(233,238,242,0.16)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    ctx.setLineDash([3, 3]);
    [mid - h * 0.3, mid + h * 0.3].forEach(function (y) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    });
    ctx.setLineDash([]);
    var hist = st.hist || [];
    if (hist.length > 1) {
      ctx.strokeStyle = teal; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var i = 0; i < hist.length; i++) {
        var x = i / 239 * w;
        var y = mid - Math.max(-0.5, Math.min(0.5, hist[i])) / 0.5 * h * 0.30;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("θ " + st.swingT.toFixed(3) + " rad · T₀=" + D.T0.toFixed(2) + "s", 6, 12);
    ctx.fillText("击 " + st.strikes + " 次", 6, h - 5);
  }

  /* ④ 面粉产出:累计条 + 筛率 */
  function drawFlour(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var f = Math.min(1, st.flour / 0.30);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("面粉 " + (st.flour * 640).toFixed(1) + " L / 满 192 L", 8, 12);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 16, w - 16, 12);
    ctx.fillStyle = "#E7DFC8"; ctx.fillRect(8, 16, (w - 16) * f, 12);
    ctx.fillStyle = soft;
    ctx.fillText("筛率 ∝ |θ̇|" + (st.running ? " · 运转中" : " · 停"), 8, 42);
    ctx.fillStyle = st.running ? green : soft;
    ctx.font = "700 9px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText(st.running ? "筛面甚速 ✓" : "停机", w / 2, h - 4);
  }
})(window.MECH = window.MECH || {});
