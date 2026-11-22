/* 底部仪表盘:① 主轮系 ② 月行差 ③ 周期盘 ④ 验算 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var yellow = "#E9C93C", red = "#D6543A", soft = "rgba(233,238,242,0.5)";

  /* 验算数据(与 mech.js selfCheck 同源) */
  var moonRatio = (64 / 38) * (48 / 24) * (127 / 32);
  var metRatio = (64 / 38) * (53 / 96) * (15 / 53);
  var sarRatio = (64 / 38) * (53 / 96) * (27 / 223) * (188 / 53) * (30 / 54);
  var VERIFY = [
    ["恒星月 254/19 年→", (D.Y * 19 / 254).toFixed(4) + " d", "27.3217 d"],
    ["朔望月 235/19 年→", (D.Y * 19 / 235).toFixed(4) + " d", "29.5306 d"],
    ["梅顿 19 年→", (metRatio * 19).toFixed(3) + " 转", "5.000 转"],
    ["竞技会周期→", (1 / (metRatio * 57 / 60) * D.Y).toFixed(2) + " d", "1461 d ≈ 4 年"],
    ["沙罗 4 转→", (4 / sarRatio).toFixed(1) + " d", "6585.3 d"],
    ["Exeligmos→", (12 / sarRatio).toFixed(1) + " d", "19756.0 d"]
  ];

  MECH.DASH = { panels: [
    { title: "TRAIN · 月轮系", meta: "64/38 × 48/24 × 127/32 = 254/19", dot: "teal", canvasH: 92,
      draw: drawTrain },
    { title: "ANOMALY · 月行差", meta: "销槽 ε≈0.1146", dot: "pink", canvasH: 84,
      html: '<div class="big" id="d-ano">+0.00%</div><div class="k">瞬时销槽调制(dθk2/dθk1 − 1)</div><div class="chip" id="d-chip">—</div>',
      canvasH: 62, init: initAnomaly, draw: drawAnomaly },
    { title: "CYCLES · 周期盘", meta: "梅顿/沙罗/竞技会/卡利普斯/Exeligmos", dot: "blue", canvasH: 92,
      draw: drawCycles },
    { title: "VERIFY · 验算", meta: "轮系比 vs 现代天文值", dot: "green",
      html: '<div id="d-verify"></div><div class="chip on" id="d-lock">LOCKED · 载入断言通过</div>',
      init: initVerify }
  ] };

  function initAnomaly(sec) {
    el.ano = sec.querySelector("#d-ano");
    el.chip = sec.querySelector("#d-chip");
  }
  function initVerify(sec) {
    var t = sec.querySelector("#d-verify");
    var rows = VERIFY.map(function (r) {
      return '<div class="rowline"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>' +
             '<div class="rowline"><span>现代值</span><b>' + r[2] + '</b></div>';
    }).join("");
    t.innerHTML = rows;
  }

  /* ① 月轮系简图:b2→c1/c2→d1/d2→e2→销槽→e6/e1→b3,实时齿轮角 */
  function drawTrain(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var th = KS.angles(st.days);
    var cy = h / 2 + 2;
    function gear(cx, cyy, r, ang, color, teeth) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(cx, cyy, r, 0, Math.PI * 2); ctx.stroke();
      var n = Math.min(teeth, 14);
      for (var i = 0; i < n; i++) {
        var a = ang + i / n * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r * 0.72, cyy + Math.sin(a) * r * 0.72);
        ctx.lineTo(cx + Math.cos(a) * r, cyy + Math.sin(a) * r);
        ctx.stroke();
      }
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(cx, cyy, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    var xs = [26, 66, 112, 158, 200, 238, 274];
    gear(xs[0], cy - 14, 13, th.b2, "#E9EEF2", 64);
    gear(xs[1], cy - 14, 9, th.c1, "#B08D57", 38);
    gear(xs[1] + 20, cy + 12, 10, th.c2, "#B08D57", 48);
    gear(xs[2] + 12, cy + 12, 7, th.d1, "#7FD8D8", 24);
    gear(xs[3], cy - 12, 16, th.d2, "#7FD8D8", 127);
    gear(xs[4], cy + 4, 9, th.e2, "#E9EEF2", 32);
    gear(xs[5], cy - 10, 10, th.k1, yellow, 50);
    gear(xs[6], cy + 8, 9, th.k2, red, 50);
    ctx.strokeStyle = "rgba(233,238,242,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(xs[4] + 8, cy + 6); ctx.lineTo(xs[5] - 9, cy - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(xs[5] + 9, cy - 10); ctx.lineTo(xs[6] - 8, cy + 6); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("b2 64", xs[0], cy - 30);
    ctx.fillText("c1 38", xs[1], cy - 26);
    ctx.fillText("d2 127", xs[3], cy - 31);
    ctx.fillText("k销", xs[5], cy - 23);
    ctx.fillText("k槽", xs[6], cy + 26);
    ctx.fillText("→ e6/e1 → b3 月", xs[6], cy - 14);
  }

  /* ② 月行差:调制波形 + 当前值 */
  function drawAnomaly(st, ph, pt, ctx, w, h) {
    if (el.ano) {
      var v = MECH.anomalyPct(st.days);
      el.ano.textContent = (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
      el.ano.style.color = "#E9EEF2";
    }
    if (el.chip) {
      var th = KS.angles(st.days);
      var fast = Math.cos(th.k1 - D.PHI0) > 0;
      el.chip.textContent = fast ? "PERIGEE · 近地点(快)" : "APOGEE · 远地点(慢)";
      el.chip.className = "chip" + (fast ? " on" : " hot");
    }
    ctx.clearRect(0, 0, w, h);
    var mid = h / 2, amp = h * 0.32;
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    ctx.setLineDash([3, 3]);
    [mid - amp, mid + amp].forEach(function (y) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    });
    ctx.setLineDash([]);
    /* 波形:ε·cos(θk1)(解析近似,与几何解一致) */
    var th = KS.angles(st.days);
    var phase = th.k1 % (Math.PI * 2);
    ctx.strokeStyle = "#7FD8D8";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (var i = 0; i <= w; i++) {
      var u = i / w * Math.PI * 2;
      var yy = mid - Math.cos(u - phase) * amp;
      if (i === 0) ctx.moveTo(i, yy); else ctx.lineTo(i, yy);
    }
    ctx.stroke();
    /* 当前相位点 */
    var px = (phase / (Math.PI * 2)) * w;
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(px, mid - Math.cos(phase) * amp, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("±" + (D.eps * 100).toFixed(1) + "%", 4, mid - amp - 3);
  }

  /* ③ 五个周期小盘 */
  function drawCycles(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var years = st.days / D.Y;
    var defs = [
      ["梅顿×5", (5 / 19) * years / 5, 5],
      ["沙罗×4", sarRatio * years / 4, 4],
      ["竞技会", (metRatio * 57 / 60) * years / 1, 1],
      ["卡利普斯", (1 / 76) * years, 1],
      ["Exelig", (12 / sarRatio) * years / 12, 12]
    ];
    var cy = h / 2 + 2;
    defs.forEach(function (d, i) {
      var cx = 30 + i * ((w - 60) / 4);
      var r = 16;
      ctx.strokeStyle = "rgba(233,238,242,0.3)";
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      var frac = d[1] % 1;
      if (d[2] > 1) {   // 多圈螺旋:圈序由半径示意
        var rr = 4 + (r - 5) * frac;
        ctx.strokeStyle = "#7FD8D8";
        ctx.beginPath(); ctx.arc(cx, cy, Math.max(2.5, rr), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.98); ctx.stroke();
      }
      var a = -Math.PI / 2 + frac * Math.PI * 2;
      ctx.strokeStyle = yellow;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2));
      ctx.stroke();
      ctx.fillStyle = soft;
      ctx.font = "600 7.5px Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(d[0], cx, cy + r + 9);
      ctx.fillText((d[1]).toFixed(2), cx, cy - r - 3);
    });
  }
})(window.MECH = window.MECH || {});
