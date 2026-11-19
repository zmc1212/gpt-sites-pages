/* 底部仪表盘:① 罗盘 ② 补偿校验 ③ 传动链 ④ 行迹 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM;
  var ink = "#23252A", brass = "#B08D57", yellow = "#E9C93C", red = "#D6543A", soft = "rgba(233,238,242,0.5)";

  MECH.DASH = { panels: [
    { title: "COMPASS · 罗盘", meta: "子午 · 木人恒南", dot: "yellow", canvasH: 100,
      draw: drawCompass },
    { title: "VERIFY · 补偿校验", meta: "目标 0.000°", dot: "green",
      html: '<div class="big" id="d-err">+0.000°</div><div class="k">木人世界指向误差</div><div class="chip" id="d-chip">—</div>',
      canvasH: 66, init: initVerify, draw: drawErr },
    { title: "TRAIN · 传动链", meta: "16T → 40T → 差动", dot: "teal", canvasH: 88, draw: drawTrain },
    { title: "TRACE · 行迹", meta: "顶视 · 南下北↑", dot: "blue", canvasH: 66, draw: drawTrace }
  ] };

  function initVerify(sec) {
    el.err = sec.querySelector("#d-err");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 罗盘:画布 x→+x, y→+z(南下);ψ=0 针指南(下) */
  function drawCompass(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.5, R = Math.min(cx, cy) - 6;
    ctx.strokeStyle = "rgba(233,238,242,0.28)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.72, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "700 10px serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("子·北", cx, cy - R * 0.56);
    ctx.fillStyle = "#E9C93C";
    ctx.fillText("午·南", cx, cy + R * 0.56);
    ctx.fillStyle = soft;
    ctx.fillText("卯", cx - R * 0.62, cy);
    ctx.fillText("酉", cx + R * 0.62, cy);
    /* 航向针(白) */
    needle(ctx, cx, cy, st.psi, R * 0.62, "#E9EEF2", 3);
    /* 木人针(黄) — 应恒压在"南" */
    needle(ctx, cx, cy, st.psi + st.ptrRel, R * 0.44, yellow, 3.4);
    /* 南位标 */
    ctx.fillStyle = "#B08D57";
    ctx.beginPath();
    ctx.moveTo(cx, cy + R * 0.98); ctx.lineTo(cx - 4, cy + R * 0.86); ctx.lineTo(cx + 4, cy + R * 0.86);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = soft;
    ctx.font = "600 8px Menlo, monospace";
    ctx.fillText("ψ " + st.headingDeg.toFixed(1) + "°", cx, cy - R * 0.30);
  }
  function needle(ctx, cx, cy, ang, len, color, lw) {
    var dx = Math.sin(ang), dy = Math.cos(ang);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(cx - dx * len * 0.28, cy - dy * len * 0.28);
    ctx.lineTo(cx + dx * len, cy + dy * len);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx + dx * len, cy + dy * len, lw * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ② 误差数值 + 历史曲线(应贴零线) */
  function drawErr(st, ph, pt, ctx, w, h) {
    if (el.err) {
      var v = st.ptrErrDeg;
      el.err.textContent = (v >= 0 ? "+" : "") + v.toFixed(3) + "°";
      el.err.style.color = Math.abs(v) < 0.01 ? "#6FBF73" : red;
    }
    if (el.chip) {
      var ok = Math.abs(st.ptrErrDeg) < 0.01;
      el.chip.textContent = ok ? "LOCKED · 补偿成立" : "DRIFT";
      el.chip.className = "chip" + (ok ? " on" : " hot");
    }
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.lineWidth = 1;
    var mid = h / 2;
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    ctx.setLineDash([3, 3]);
    [mid - h * 0.3, mid + h * 0.3].forEach(function (y) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    });
    ctx.setLineDash([]);
    var hist = st.errHist || [];
    if (hist.length > 1) {
      ctx.strokeStyle = "#7FD8D8";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var i = 0; i < hist.length; i++) {
        var x = i / 259 * w;
        var y = mid - Math.max(-1.5, Math.min(1.5, hist[i])) / 1.5 * h * 0.3;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  /* ③ 传动链简图:上排左链(立轮L→冠轮L/太阳L),下排右链,中差动壳 */
  function drawTrain(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var S = 42, cy = h / 2;
    var x = [30, 96, 150, 208, 258];
    function gear(cx, cy, r, ang, color, teeth) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < teeth; i++) {
        var a = ang + i / teeth * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78);
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.stroke();
      }
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(cx, cy, 2.4, 0, Math.PI * 2); ctx.fill();
    }
    /* 左链(上) */
    var yL = cy - 20, yR = cy + 20;
    gear(x[0], yL, D.r立 * S, st.psiL, "#E9EEF2", 8);
    gear(x[1], yL, D.r冠 * S, st.crownL, "#B08D57", 12);
    gear(x[2], yL, D.rSB * S, st.sunL, "#7FD8D8", 7);
    /* 右链(下) */
    gear(x[0], yR, D.r立 * S, st.psiR, "#E9EEF2", 8);
    gear(x[1], yR, D.r冠 * S, st.crownR, "#B08D57", 12);
    gear(x[2], yR, D.rSB * S, st.sunR, "#7FD8D8", 7);
    /* 差动壳(中) */
    gear(196, cy, 11.5, st.gearPtr, "#E9C93C", 10);
    ctx.strokeStyle = "rgba(233,238,242,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x[2] + D.rSB * S, yL); ctx.lineTo(190, cy - 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x[2] + D.rSB * S, yR); ctx.lineTo(190, cy + 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(207, cy); ctx.lineTo(228, cy); ctx.stroke();
    /* 木人轴指针 */
    ctx.strokeStyle = yellow;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(238, cy);
    ctx.lineTo(238 + Math.sin(st.ptrRel) * 20, cy - Math.cos(st.ptrRel) * 20);
    ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("ψL", x[0], yL - D.r立 * S - 4);
    ctx.fillText("ψR", x[0], yR + D.r立 * S + 10);
    ctx.fillText("壳=(sunL+sunR)/2", 196, cy + 24);
    ctx.textAlign = "left";
    ctx.fillText("木人", 240, cy - 16);
  }

  /* ④ 行迹:顶视迷你图(北上),轨迹 + 当前车位 */
  function drawTrace(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var s = 15, cx = w * 0.42, cy = h * 0.52;
    ctx.strokeStyle = "rgba(233,238,242,0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 40, cy - 32, 80, 64);
    /* 南箭头(画布下方 = +z) */
    ctx.fillStyle = "#E9C93C";
    ctx.beginPath();
    ctx.moveTo(cx, cy + 34); ctx.lineTo(cx - 3.5, cy + 28); ctx.lineTo(cx + 3.5, cy + 28);
    ctx.closePath(); ctx.fill();
    var hist = st.trail || [];
    if (hist.length > 1) {
      ctx.strokeStyle = "rgba(127,216,216,0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var i = 0; i < hist.length; i++) {
        var px = cx + hist[i][0] * s, py = cy + hist[i][1] * s;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    /* 车位三角(沿 ψ) */
    var px = cx + st.x * s, py = cy + st.z * s;
    ctx.fillStyle = "#E9EEF2";
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.atan2(Math.sin(st.psi), Math.cos(st.psi)));
    ctx.beginPath();
    ctx.moveTo(0, 6); ctx.lineTo(-4, -4); ctx.lineTo(4, -4);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("(" + st.x.toFixed(1) + ", " + st.z.toFixed(1) + ")", px + 7, py + 3);
  }
})(window.MECH = window.MECH || {});
