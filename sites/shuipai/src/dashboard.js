/* 仪表盘:①滑块位移曲线 ②连杆简图(曲柄圆实时) ③扇门开角 ④鼓风节奏 */
(function (MECH) {
  var el = {}, D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)";
  var sHist = [], thHist = [];

  MECH.DASH = { panels: [
    { title: "SLIDER · 滑块位移", meta: "x(φ) 实测/理论", dot: "teal", canvasH: 96, draw: drawSlide },
    { title: "LINKAGE · 连杆简图", meta: "曲柄圆 + 滑块", dot: "blue", canvasH: 96, draw: drawLink },
    { title: "DOOR · 扇门开角", meta: "0..32°", dot: "yellow",
      html: '<div class="big" id="d-door">0°</div><div class="k">开角</div>' +
            '<div class="bar"><i id="d-bar"></i></div>' +
            '<div class="rowline"><span>风量</span><b id="d-air">0%</b></div>',
      init: initDoor, draw: drawDoor },
    { title: "BEAT · 鼓风节奏", meta: "每周一次", dot: "green", canvasH: 96, draw: drawBeat }
  ] };

  function initDoor(sec) {
    el.door = sec.querySelector("#d-door");
    el.bar = sec.querySelector("#d-bar");
    el.air = sec.querySelector("#d-air");
  }

  function drawSlide(st, ph, pt, ctx, w, h) {
    sHist.push(st.slide);
    if (sHist.length > 200) sHist.shift();
    ctx.clearRect(0, 0, w, h);
    var mid = h / 2;
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    var lo = D.l - D.r, hi = D.l + D.r;
    ctx.strokeStyle = "#7FD8D8";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (var i = 0; i < sHist.length; i++) {
      var px = i / 199 * w;
      var py = mid - ((sHist[i] - lo) / (2 * D.r) - 0.5) * (mid - 6);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("行程 2r = 0.48 m", 4, 10);
    ctx.fillText("x = r·cosφ + √(l²−r²sin²φ)", 4, h - 4);
  }

  /* ② 连杆简图:曲柄圆 + 连杆 + 滑块(实时位置) */
  function drawLink(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.34, cy = h * 0.46, S = Math.min(w * 0.3, 70);
    /* 曲柄圆 */
    ctx.strokeStyle = "rgba(233,238,242,0.3)";
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, D.r * S, 0, Math.PI * 2); ctx.stroke();
    /* 曲柄销 */
    var px = cx + D.r * Math.cos(st.phi) * S, py = cy + D.r * Math.sin(st.phi) * S;
    ctx.strokeStyle = "#B08D57";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    /* 连杆 → 滑块 */
    var sx = cx + (st.slide * S) * -1 + D.l * S * -1 + D.l * S;   // 滑块 x = cx − slide·S·(−1)…简化:cx − slide·S·(-1)
    var sliderX = cx - (D.l - st.slide) * S * -1;
    sliderX = cx + (D.l - st.slide) * -S + D.l * S * -1;
    sliderX = cx - st.slide * -S - (D.l * S - st.slide * S) * 0;
    sliderX = cx + D.l * S - st.slide * S;
    ctx.strokeStyle = "#E9C93C";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sliderX, cy + 14); ctx.stroke();
    ctx.fillStyle = "#E9C93C";
    ctx.fillRect(sliderX - 5, cy + 10, 10, 9);
    /* 导轨 */
    ctx.strokeStyle = "rgba(233,238,242,0.3)";
    ctx.beginPath();
    ctx.moveTo(cx + (D.l + D.r) * S + 6, cy + 14.5);
    ctx.lineTo(cx - (D.l + D.r) * S - 6, cy + 14.5);
    ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("曲柄销", cx - 14, cy - D.r * S - 5);
    ctx.fillText("滑块", sliderX - 10, cy + 34);
  }

  function drawDoor(st, ph, pt, ctx, w, h) {
    if (el.door) el.door.textContent = Math.round(st.doorL * D.doorAngle * 180 / Math.PI) + "°";
    if (el.bar) el.bar.style.width = Math.round(st.doorL * 100) + "%";
    if (el.air) el.air.textContent = Math.round(st.airflow * 100) + "%";
  }

  /* ④ 鼓风节奏:每周一喷的时序点 */
  var marks = [];
  function drawBeat(st, ph, pt, ctx, w, h) {
    var cyc = Math.floor(st.phi / (2 * Math.PI));
    if (cyc > (drawBeat._last || 0)) { marks.push(st.time); if (marks.length > 60) marks.shift(); }
    drawBeat._last = cyc;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.beginPath(); ctx.moveTo(0, h - 14); ctx.lineTo(w, h - 14); ctx.stroke();
    var span = 12;
    for (var i = 0; i < marks.length; i++) {
      var dt = st.time - marks[i];
      if (dt > span) continue;
      ctx.fillStyle = "#7FD8D8";
      ctx.beginPath(); ctx.arc(w - dt / span * w, h - 20, 3, 0, Math.PI * 2); ctx.fill();
    }
    var rpm = st.omega / (2 * Math.PI) * 60;
    ctx.fillStyle = "#E9EEF2";
    ctx.font = "800 15px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(rpm.toFixed(1), 4, 20);
    ctx.fillStyle = soft;
    ctx.font = "600 8px Menlo, monospace";
    ctx.fillText("RPM · 每转一鼓风", 40, 20);
    ctx.fillText("累计 " + st.strokes + " 行程", 4, 34);
  }
})(window.MECH = window.MECH || {});
