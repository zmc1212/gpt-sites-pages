/* 仪表盘:①轮/锭转速+传动比 ②曲柄连杆简图 ③三锭同步 ④绳传动示意 */
(function (MECH) {
  var el = {}, D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)";

  MECH.DASH = { panels: [
    { title: "SPEED · 轮锭转速", meta: "×16.7 绳传动", dot: "teal",
      html: '<div class="big" id="d-sp">0</div><div class="k">锭 RPM</div>' +
            '<div class="bar"><i id="d-bar"></i></div>' +
            '<div class="rowline"><span>轮 RPM</span><b id="d-wh">0</b></div>' +
            '<div class="chip" id="d-chip">停踏</div>',
      init: initSpd, draw: drawSpd },
    { title: "CRANK · 曲柄踏板", meta: "双相位 90°", dot: "blue", canvasH: 96, draw: drawCrank },
    { title: "SPINDLES · 三锭同步", meta: "同速同向", dot: "yellow", canvasH: 96, draw: drawSync },
    { title: "ROPE · 绳传动", meta: "R/r = 16.7", dot: "green", canvasH: 96, draw: drawRope }
  ] };

  function initSpd(sec) {
    el.sp = sec.querySelector("#d-sp");
    el.bar = sec.querySelector("#d-bar");
    el.wh = sec.querySelector("#d-wh");
    el.chip = sec.querySelector("#d-chip");
  }

  function drawSpd(st, ph, pt, ctx, w, h) {
    var spRpm = D.spOmegaOf(st.omega) / (2 * Math.PI) * 60;
    var whRpm = st.omega / (2 * Math.PI) * 60;
    if (el.sp) el.sp.textContent = String(Math.round(spRpm));
    if (el.bar) el.bar.style.width = Math.min(100, spRpm / 500 * 100) + "%";
    if (el.wh) el.wh.textContent = String(Math.round(whRpm));
    if (el.chip) {
      el.chip.textContent = st.omega > 0.2 ? "纺纱中 · 三锭同速" : "停踏";
      el.chip.className = "chip" + (st.omega > 0.2 ? " on" : "");
    }
  }

  /* ② 双曲柄圆 + 踏板位置 */
  function drawCrank(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.30, cy = h * 0.48, S = Math.min(w * 0.16, 42);
    ctx.strokeStyle = "rgba(233,238,242,0.3)";
    ctx.beginPath(); ctx.arc(cx, cy, D.crankR * S * 3, 0, Math.PI * 2); ctx.stroke();
    [[st.pedal[0], "#E9C93C", "L"], [st.pedal[1], "#7FD8D8", "R"]].forEach(function (pd) {
      var a = pd[0];
      var px = cx + Math.cos(a) * D.crankR * S * 3, py = cy + Math.sin(a) * D.crankR * S * 3;
      ctx.strokeStyle = pd[1];
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
      ctx.fillStyle = pd[1];
      ctx.beginPath(); ctx.arc(px, py, 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.font = "700 8px Menlo, monospace";
      ctx.fillText(pd[2], px + 5, py - 4);
    });
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("曲柄 r 0.09 · 相位差 90°", cx - 40, h - 8);
  }

  /* ③ 三锭转速条(应同步) */
  function drawSync(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var spRpm = D.spOmegaOf(st.omega) / (2 * Math.PI) * 60;
    for (var k = 0; k < 3; k++) {
      var y = 14 + k * 22;
      ctx.fillStyle = soft;
      ctx.font = "600 8px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("锭" + (k + 1), 4, y + 5);
      ctx.fillStyle = "rgba(233,238,242,0.12)";
      ctx.fillRect(30, y, w - 60, 10);
      ctx.fillStyle = ["#7FD8D8", "#E9C93C", "#6FBF73"][k];
      ctx.fillRect(30, y, Math.min(1, spRpm / 500) * (w - 60), 10);
      ctx.fillStyle = "#E9EEF2";
      ctx.font = "700 8px Menlo, monospace";
      ctx.fillText(Math.round(spRpm), w - 28, y + 8);
    }
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.fillText("三锭同轴同绳 → 同速", 4, h - 6);
  }

  /* ④ 绳传动示意:大轮圆 + 锭轮小圆 + 绳线 */
  function drawRope(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.32, cy = h * 0.5, S = Math.min(w * 0.22, 60);
    ctx.strokeStyle = "#B08D57";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, D.R * S, 0, Math.PI * 2); ctx.stroke();
    var a = st.phi;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * D.R * S, cy + Math.sin(a) * D.R * S);
    ctx.stroke();
    var cx2 = w * 0.72, cy2 = h * 0.5;
    ctx.strokeStyle = "#7FD8D8";
    ctx.beginPath(); ctx.arc(cx2, cy2, Math.max(3, D.rSp * S), 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx2, cy2);
    ctx.lineTo(cx2 + Math.cos(a * D.ratio) * Math.max(3, D.rSp * S), cy2 + Math.sin(a * D.ratio) * Math.max(3, D.rSp * S));
    ctx.stroke();
    /* 绳连线 */
    ctx.strokeStyle = "rgba(200,184,150,0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * D.R * S, cy + Math.sin(a) * D.R * S);
    ctx.lineTo(cx2 + Math.cos(a * D.ratio) * Math.max(3, D.rSp * S), cy2 + Math.sin(a * D.ratio) * Math.max(3, D.rSp * S));
    ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("R 0.35 / r 0.021 = 16.7", 4, h - 6);
  }
})(window.MECH = window.MECH || {});
