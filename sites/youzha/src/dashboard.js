/* 底部仪表盘:① RAM 悬锤摆 ② WEDGE 楔进 ③ OIL 出油 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A", oilC = "#C9A24E";
  var wood = "#B08D57";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "RAM · 悬锤摆", meta: "摆幅 33° · 锤速 2.64", dot: "yellow", canvasH: 112,
      draw: drawRam },
    { title: "WEDGE · 楔进", meta: "每击 0.03 ×3", dot: "green",
      html: '<div class="big" id="d-a">0.0</div><div class="k">楔进量 cm / 压缩 18%</div><div class="chip" id="d-chip">—</div>',
      canvasH: 78, init: initWedge, draw: drawWedge },
    { title: "OIL · 出油", meta: "油面渐涨", dot: "blue", canvasH: 108,
      draw: drawOil },
    { title: "CYCLE · 阶段时序", meta: "51s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initWedge(sec) {
    el.a = sec.querySelector("#d-a");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 悬锤摆(枢点 + 臂 + 锤头,实时 φ) */
  function drawRam(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var px = w * 0.30, py = h * 0.16, r = Math.min(h * 0.62, w * 0.34);
    var scale = r / D.armL;
    var phi = KS.swingPhi(st.swingT);
    /* 弧线(摆幅范围) */
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(px, py, r, Math.PI / 2 - D.swingA, Math.PI / 2 + D.swingA);
    ctx.stroke();
    /* 臂 + 锤 */
    var hx = px + Math.sin(phi) * r, hy = py + Math.cos(phi) * r;
    ctx.strokeStyle = wood; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = st.hitFlash > 0.3 ? red : "#9FA3AA";
    ctx.beginPath(); ctx.arc(hx, hy, 8, 0, Math.PI * 2); ctx.fill();
    /* 楔尾位置标 */
    var wx = px + Math.sin(0) * r * 1.0 - (D.pivotX - D.wedgeX0 - D.wedgeLen - 0.05) * scale;
    ctx.strokeStyle = soft;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(wx, py); ctx.lineTo(wx, hy + 6); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("φ " + KS.deg(phi).toFixed(1) + "°", px + 10, py + 12);
    ctx.fillText("v锤 " + D.vHammer.toFixed(2) + " m/s", px + 10, py + 24);
  }

  /* ② 楔进读数 */
  function drawWedge(st, ph, pt, ctx, w, h) {
    var a = st.wedgeAdv || 0;
    if (el.a) el.a.textContent = (a * 100).toFixed(1);
    if (el.chip) {
      var ramming = a > 0.005 && a < D.wedgeMax;
      el.chip.textContent = ramming ? "撞楔中 · 板前压" : (a >= D.wedgeMax ? "满压 · 保压出油" : "待击");
      el.chip.className = "chip " + (ramming ? "hot" : "on");
    }
    ctx.clearRect(0, 0, w, h);
    var bx = 8, bw = w - 16, cy = h * 0.5;
    ctx.fillStyle = "rgba(233,238,242,0.10)";
    ctx.fillRect(bx, cy - 6, bw, 12);
    ctx.fillStyle = wood;
    ctx.fillRect(bx, cy - 6, bw * KS.clamp(a / D.wedgeMax, 0, 1), 12);
    /* 三击刻度 */
    ctx.strokeStyle = soft;
    for (var i = 1; i <= 3; i++) {
      var x = bx + bw * (i * D.dHit / D.wedgeMax);
      ctx.beginPath(); ctx.moveTo(x, cy - 9); ctx.lineTo(x, cy + 9); ctx.stroke();
    }
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("压缩 " + ((a / D.wedgeMax) * 18).toFixed(1) + "%", bx, cy + 20);
  }

  /* ③ 出油:油盘油面 + 滴流示意 */
  function drawOil(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var comp = (st.wedgeAdv || 0) / D.wedgeMax;
    var bx = 8, bw = w - 16, y0 = 10, hh = h - 34;
    /* 盘剖面 */
    ctx.strokeStyle = soft; ctx.lineWidth = 1.2;
    ctx.strokeRect(bx, y0 + hh - 18, bw, 18);
    /* 油 */
    ctx.fillStyle = oilC;
    ctx.fillRect(bx + 2, y0 + hh - 18 + (18 - 4 - 12 * comp), bw - 4, 4 + 12 * comp);
    /* 饼束剖面(压缩) */
    var cakeW = bw * 0.6 * (1 - 0.18 * comp);
    ctx.strokeStyle = wood;
    ctx.strokeRect(bx + bw / 2 - cakeW / 2, y0 + 6, cakeW, hh - 30);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("油深 " + (4 + 12 * comp).toFixed(0) + "mm", bx + 2, y0 + hh + 12);
    ctx.textAlign = "right";
    ctx.fillText("饼束压缩 " + (18 * comp).toFixed(1) + "%", bx + bw, y0 + hh + 12);
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
    ctx.fillText("击 " + Math.min(Math.floor(st.swingT / D.period + 0.25), 9) + " · 楔 " + (st.wedgeAdv * 100).toFixed(0) + "cm", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
