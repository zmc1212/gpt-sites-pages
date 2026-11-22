/* 仪表盘:①轮速风速 ②糠谷落点分布 ③分级出口率 ④风道剖面示意 */
(function (MECH) {
  var el = {}, D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)";

  MECH.DASH = { panels: [
    { title: "FAN · 轮速风速", meta: "6 叶 · 手摇", dot: "teal",
      html: '<div class="big" id="d-rpm">0</div><div class="k">RPM · 相对风速</div>' +
            '<div class="bar"><i id="d-bar"></i></div>' +
            '<div class="rowline"><span>相对风速</span><b id="d-wind">0%</b></div>',
      init: initFan, draw: drawFan },
    { title: "SORT · 糠谷分级", meta: "远糠 / 近谷", dot: "yellow",
      html: '<div class="big" id="d-far">0</div><div class="k">糠(远口)</div>' +
            '<div class="rowline"><span>谷(近口)</span><b id="d-near">0</b></div>' +
            '<div class="chip" id="d-chip">—</div>',
      init: initSort, draw: drawSort },
    { title: "PATH · 落点分布", meta: "俯视", dot: "blue", canvasH: 96, draw: drawPath },
    { title: "SECTION · 风道剖面", meta: "漏斗→风道→出口", dot: "green", canvasH: 96, draw: drawSection }
  ] };

  function initFan(sec) {
    el.rpm = sec.querySelector("#d-rpm");
    el.bar = sec.querySelector("#d-bar");
    el.wind = sec.querySelector("#d-wind");
  }
  function initSort(sec) {
    el.far = sec.querySelector("#d-far");
    el.near = sec.querySelector("#d-near");
    el.chip = sec.querySelector("#d-chip");
  }

  function drawFan(st, ph, pt, ctx, w, h) {
    var rpm = st.omega / (2 * Math.PI) * 60;
    if (el.rpm) el.rpm.textContent = String(Math.round(rpm));
    var wind = Math.min(1, st.omega / D.k.fast);
    if (el.bar) el.bar.style.width = Math.round(wind * 100) + "%";
    if (el.wind) el.wind.textContent = Math.round(wind * 100) + "%";
  }

  function drawSort(st, ph, pt, ctx, w, h) {
    if (el.far) el.far.textContent = String(st.landedFar);
    if (el.near) el.near.textContent = String(st.landedNear);
    if (el.chip) {
      var total = st.landedFar + st.landedNear;
      if (total > 8) {
        var ratio = st.landedFar / total;
        el.chip.textContent = "糠占 " + Math.round(ratio * 100) + "%(理论 34%)";
        el.chip.className = "chip" + (Math.abs(ratio - 0.34) < 0.12 ? " on" : " warn");
      } else {
        el.chip.textContent = "风选中…";
        el.chip.className = "chip";
      }
    }
  }

  /* ③ 落点分布:糠(远)黄 / 谷(近)青 */
  function drawPath(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var ox = 14, S = (w - 28) / 1.1;
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.beginPath(); ctx.moveTo(ox, h / 2); ctx.lineTo(w - 10, h / 2); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("近口", ox, h / 2 - 4);
    ctx.fillText("远口", ox + D.outFar * S + 8, h / 2 - 4);
    /* 落点标记(采样自粒子) */
    var span = 8;
    st.grains.slice(-40).forEach(function (g) {
      if (!g.done) return;
      var age = st.time - g.t - D.tFall;
      if (age > span) return;
      var x = ox + Math.max(0, g.x) * S;
      var fade = 1 - age / span;
      ctx.fillStyle = g.type === "chaff" ? "rgba(233,201,60," + (0.7 * fade).toFixed(2) + ")"
                                        : "rgba(127,216,216," + (0.7 * fade).toFixed(2) + ")";
      ctx.beginPath(); ctx.arc(x, h / 2 + 8, 2.2, 0, Math.PI * 2); ctx.fill();
    });
  }

  /* ④ 风道剖面:箱体 + 扇轮 + 谷流 + 风向 */
  function drawSection(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var bx = w * 0.10, bw = w * 0.62, by = h * 0.22, bh = h * 0.52;
    ctx.strokeStyle = "rgba(233,238,242,0.45)";
    ctx.strokeRect(bx, by, bw, bh);
    /* 扇轮(左) */
    var fx = bx + bw * 0.16, fy = by + bh / 2;
    ctx.strokeStyle = "#B08D57";
    ctx.beginPath(); ctx.arc(fx, fy, bh * 0.24, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + Math.cos(st.phi) * bh * 0.24, fy + Math.sin(st.phi) * bh * 0.24);
    ctx.stroke();
    /* 谷流(漏斗→下落) */
    var gx = fx + bh * 0.16;
    ctx.strokeStyle = "#D8C08E";
    ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(gx, by); ctx.lineTo(gx, by + bh * 0.85); ctx.stroke();
    ctx.setLineDash([]);
    /* 风向箭头(右) */
    ctx.strokeStyle = "#7FD8D8";
    ctx.lineWidth = 1.6;
    var wind = Math.min(1, st.omega / D.k.fast);
    for (var i = 0; i < 3; i++) {
      var yy = by + bh * 0.28 + i * bh * 0.22;
      ctx.beginPath();
      ctx.moveTo(fx + bh * 0.20, yy);
      ctx.lineTo(fx + bh * 0.20 + wind * (bx + bw - fx - 26), yy);
      ctx.stroke();
    }
    /* 出口标签 */
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("漏斗", gx - 12, by - 4);
    ctx.fillText("出糠(远)", bx + bw + 4, by + bh * 0.30);
    ctx.fillText("落谷(近)", bx + bw + 4, by + bh * 0.78);
  }
})(window.MECH = window.MECH || {});
