/* 底部仪表盘:① PANEL 屏板开合 ② LIGHT 光锥 ③ SMOKE 烟路 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A", waterC = "#8FCBE8";
  var bronze = "#B08D57";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "PANEL · 屏板开合", meta: "α 0→90°", dot: "yellow", canvasH: 108,
      draw: drawPanel },
    { title: "LIGHT · 光锥", meta: "β = 0.8α · I∝sinα", dot: "green",
      html: '<div class="big" id="d-b">0°</div><div class="k">光锥角 β(开度映射)</div><div class="chip" id="d-chip">—</div>',
      canvasH: 78, init: initLight, draw: drawLight },
    { title: "SMOKE · 烟路", meta: "焰→袖→腔水", dot: "blue", canvasH: 108,
      draw: drawSmoke },
    { title: "CYCLE · 阶段时序", meta: "46.5s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initLight(sec) {
    el.b = sec.querySelector("#d-b");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 屏板开合俯视:双弧板绕轴旋转(实时) */
  function drawPanel(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.55, R = Math.min(w, h) * 0.36;
    var a = KS.rad(st.alpha || 0);
    /* 灯盘 */
    ctx.strokeStyle = bronze; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.5, 0, Math.PI * 2); ctx.stroke();
    /* 双弧板(开合) */
    [1, -1].forEach(function (s) {
      var ang = s > 0 ? a : -a;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang * s);
      ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.9, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5, s < 0);
      ctx.stroke();
      ctx.restore();
    });
    /* 立轴铰点 */
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(cx, cy - R * 0.5, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy + R * 0.5, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("α " + (st.alpha || 0).toFixed(0) + "°", cx, cy - R - 6);
    ctx.fillText("俯视 TOP", cx, cy + R + 14);
  }

  /* ② 光锥角读数 + 光强条 */
  function drawLight(st, ph, pt, ctx, w, h) {
    var a = st.alpha || 0;
    var beta = D.coneAngle(a);
    if (el.b) el.b.textContent = beta.toFixed(0) + "°";
    if (el.chip) {
      var I = D.brightness(a);
      el.chip.textContent = st.lit ? (I > 0.7 ? "亮 · 全开" : (I > 0.3 ? "半明" : "微光")) : "未点灯";
      el.chip.className = "chip " + (st.lit ? (I > 0.5 ? "on" : "warn") : "");
    }
    ctx.clearRect(0, 0, w, h);
    var bx = 8, bw = w - 16, cy = h * 0.5;
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy - 5, bw, 10);
    ctx.fillStyle = yellow;
    ctx.fillRect(bx, cy - 5, bw * D.brightness(a), 10);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("光强 I ∝ sin(α) = " + D.brightness(a).toFixed(2), bx, cy + 18);
  }

  /* ③ 烟路:三段样条示意(焰→袖→腔水) */
  function drawSmoke(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var pts = [];
    for (var u = 0; u <= 1; u += 0.02) pts.push(KS.smokePoint(u));
    /* 侧视投影:x-y */
    var xs = pts.map(function (p) { return p[0]; });
    var ys = pts.map(function (p) { return p[1]; });
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    var bx = 14, bw = w - 28, by = 10, bh = h - 36;
    function px(x) { return bx + (x - minX) / (maxX - minX || 1) * bw; }
    function py(y) { return by + (1 - (y - minY) / (maxY - minY || 1)) * bh; }
    /* 水面线 */
    ctx.strokeStyle = waterC; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(bx, py(D.smoke.W[1])); ctx.lineTo(bx + bw, py(D.smoke.W[1])); ctx.stroke();
    /* 烟路 */
    ctx.strokeStyle = soft; ctx.lineWidth = 1.6;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    pts.forEach(function (p, i) {
      if (i === 0) ctx.moveTo(px(p[0]), py(p[1])); else ctx.lineTo(px(p[0]), py(p[1]));
    });
    ctx.stroke();
    ctx.setLineDash([]);
    /* 节点 */
    [["焰", D.smoke.F], ["袖", D.smoke.S], ["弯", D.smoke.M], ["水", D.smoke.W]].forEach(function (nd) {
      ctx.fillStyle = nd[0] === "焰" ? yellow : soft;
      ctx.beginPath(); ctx.arc(px(nd[1][0]), py(nd[1][1]), 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.font = "600 7px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(nd[0], px(nd[1][0]), py(nd[1][1]) - 6);
    });
    ctx.fillStyle = soft;
    ctx.font = "600 7px Menlo, monospace";
    ctx.fillText("烟入腔水溶解 · 环保设计", bx + bw / 2, h - 6);
  }

  /* ④ 阶段时序 */
  function drawCycle(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var total = STARTS.total, x0 = 4, ww = w - 8;
    var idx = MECH.PHASES.indexOf(ph);
    var gt = STARTS[idx] + pt;
    var y1 = 6, hh1 = 18;
    MECH.PHASES.forEach(function (p, i) {
      var x = x0 + STARTS[i] / total * ww, seg = p.dur / total * ww;
      ctx.fillStyle = i === idx ? "rgba(233,201,60,0.30)" : "rgba(233,238,242,0.10)";
      ctx.fillRect(x, y1, seg - 1.5, hh1);
      ctx.strokeStyle = i === idx ? yellow : faint;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y1, seg - 1.5, hh1);
      ctx.fillStyle = i === idx ? yellow : soft;
      ctx.font = "600 7.5px Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(i + 1), x + seg / 2 - 0.75, y1 + hh1 / 2 + 3);
    });
    var gx = x0 + gt / total * ww;
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(gx, y1 - 3); ctx.lineTo(gx, y1 + hh1 + 3); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("t=" + gt.toFixed(1) + "s / " + total.toFixed(1) + "s", x0, y1 + hh1 + 14);
    ctx.textAlign = "right";
    ctx.fillText("α " + (st.alpha || 0).toFixed(0) + "°", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
