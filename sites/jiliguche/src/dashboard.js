/* 仪表盘:①车速+转数 ②齿轮比塔 ③击鼓记录 ④里程换算 */
(function (MECH) {
  var el = {}, D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)";

  MECH.DASH = { panels: [
    { title: "SPEED · 车速转数", meta: "轮转累计", dot: "teal",
      html: '<div class="big" id="d-rev">0.0</div><div class="k">足轮转数</div>' +
            '<div class="bar"><i id="d-bar"></i></div>' +
            '<div class="rowline"><span>车速</span><b id="d-v">0.00 m/s</b></div>' +
            '<div class="chip" id="d-chip">停驶</div>',
      init: initSpd, draw: drawSpd },
    { title: "GEARS · 齿轮比塔", meta: "100:10:10:100", dot: "blue", canvasH: 96, draw: drawGears },
    { title: "DRUM · 击鼓记录", meta: "左右交替", dot: "yellow", canvasH: 96, draw: drawDrum },
    { title: "DIST · 里程换算", meta: "演示里→真实", dot: "green", canvasH: 96, draw: drawDist }
  ] };

  function initSpd(sec) {
    el.rev = sec.querySelector("#d-rev");
    el.bar = sec.querySelector("#d-bar");
    el.v = sec.querySelector("#d-v");
    el.chip = sec.querySelector("#d-chip");
  }

  function drawSpd(st, ph, pt, ctx, w, h) {
    var revs = st.psi / (2 * Math.PI);
    if (el.rev) el.rev.textContent = revs.toFixed(1);
    if (el.bar) el.bar.style.width = Math.min(100, revs % 5 / 5 * 100) + "%";
    if (el.v) el.v.textContent = st.v.toFixed(2) + " m/s";
    if (el.chip) {
      var toChi = D.revPerChi - (revs % D.revPerChi);
      el.chip.textContent = st.v > 0.1 ? "距下里 " + toChi.toFixed(1) + " 转" : "停驶";
      el.chip.className = "chip" + (st.v > 0.1 && toChi < 1 ? " warn" : "");
    }
  }

  /* ② 齿轮比塔:四级圆盘 + 各自转角刻度 */
  function drawGears(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var gy = h / 2;
    var specs = [
      { label: "立 100", r: 20, ang: st.psi, x: 0.16, color: "#B08D57" },
      { label: "下 10", r: 11, ang: -st.psi * 10, x: 0.40, color: "#7FD8D8" },
      { label: "旋 10", r: 11, ang: -st.psi * 10, x: 0.62, color: "#7FD8D8" },
      { label: "中 100", r: 20, ang: st.psi / 100, x: 0.85, color: "#E9C93C" }
    ];
    specs.forEach(function (s) {
      var cx = w * s.x, cy = gy;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(cx, cy, s.r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(s.ang) * s.r, cy + Math.sin(s.ang) * s.r);
      ctx.stroke();
      ctx.fillStyle = soft;
      ctx.font = "600 7px Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(s.label, cx, gy + s.r + 10);
    });
    ctx.fillStyle = soft;
    ctx.fillText("×10", w * 0.28, gy - 26);
    ctx.fillText("×10", w * 0.51, gy - 26);
    ctx.fillText("÷100 总比", w * 0.85, gy - 26);
  }

  /* ③ 击鼓记录:时序点(L/R 交替)+ 交替校验 */
  function drawDrum(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.beginPath(); ctx.moveTo(0, h - 14); ctx.lineTo(w, h - 14); ctx.stroke();
    var span = 14;
    for (var i = 0; i < st.events.length; i++) {
      var ev = st.events[i];
      var dt = st.time - ev.t;
      if (dt > span) continue;
      var x = w - dt / span * w;
      ctx.fillStyle = ev.side === 0 ? "#E9C93C" : "#E86A9E";
      ctx.beginPath(); ctx.arc(x, h - 20, 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = soft;
      ctx.font = "600 7px Menlo, monospace";
      ctx.fillText(ev.side === 0 ? "L" : "R", x - 3, h - 30);
    }
    ctx.fillStyle = "#E9EEF2";
    ctx.font = "800 15px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(String(st.chiCount), 4, 20);
    ctx.fillStyle = soft;
    ctx.font = "600 8px Menlo, monospace";
    ctx.fillText("演示里 · 黄L/粉R 交替", 36, 20);
  }

  /* ④ 里程换算:演示里 → 真实(×20)+ 文献值 */
  function drawDist(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var revs = st.psi / (2 * Math.PI);
    var demoChi = revs / D.revPerChi;
    var realChi = revs / D.realChiPerRev;
    ctx.fillStyle = "#E9EEF2";
    ctx.font = "800 15px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(revs.toFixed(1) + " 转", 4, 20);
    ctx.fillStyle = soft;
    ctx.font = "600 8px Menlo, monospace";
    ctx.fillText("演示里 " + demoChi.toFixed(2) + "(每 2 转)", 4, 34);
    ctx.fillText("真实里 " + realChi.toFixed(3) + "(每 100 转 = 565 m)", 4, 48);
    ctx.fillText("文献:卢道隆制 · 总比 100:1", 4, h - 6);
  }
})(window.MECH = window.MECH || {});
