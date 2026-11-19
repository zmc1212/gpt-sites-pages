/* 仪表盘:①壳姿态 ②环补偿角 ③炉体水平度 ④烟缕节奏 */
(function (MECH) {
  var el = {}, D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)";
  var tiltHist = [];

  MECH.DASH = { panels: [
    { title: "SHELL · 壳姿态", meta: "pitch/roll", dot: "teal",
      html: '<div class="big" id="d-att">0/0°</div><div class="k">翻转角</div>' +
            '<div class="rowline"><span>手动冲量</span><b id="d-kick">0.00</b></div>' +
            '<div class="chip" id="d-chip">—</div>',
      init: initShell, draw: drawShell },
    { title: "RINGS · 环补偿角", meta: "qx(−a)/qz(−b)", dot: "blue", canvasH: 96, draw: drawRings },
    { title: "LEVEL · 炉体水平度", meta: "目标 0.000°", dot: "green",
      html: '<div class="big" id="d-lvl">0.000°</div><div class="k">炉体姿态误差</div>' +
            '<div class="chip on" id="d-lchip">常平成立</div>' +
            '<div class="mini">world = qz(b)·qx(a)·qx(−a)·qz(−b) = I</div>',
      init: initLevel, draw: drawLevel },
    { title: "SMOKE · 烟缕", meta: "香燃连续", dot: "yellow", canvasH: 96, draw: drawSmoke }
  ] };

  function initShell(sec) {
    el.att = sec.querySelector("#d-att");
    el.kick = sec.querySelector("#d-kick");
    el.chip = sec.querySelector("#d-chip");
  }
  function initLevel(sec) {
    el.lvl = sec.querySelector("#d-lvl");
  }

  function drawShell(st, ph, pt, ctx, w, h) {
    if (el.att) el.att.textContent = Math.round(st.a * 180 / Math.PI) + "/" + Math.round(st.b * 180 / Math.PI) + "°";
    if (el.kick) el.kick.textContent = st.kick.toFixed(2);
    if (el.chip) {
      el.chip.textContent = { loaded: "装填", firing: "加速中", flying: "弹飞中", landed: "已中靶" }[st.phase] || ph.name;
      el.chip.className = "chip" + (ph.id === "fast" || ph.id === "kick" ? " on" : "");
    }
  }

  /* ② 环补偿角:双条随壳角反向变化 */
  function drawRings(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var mid = h / 2;
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    ctx.strokeStyle = "#7FD8D8";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(4, mid - st.a / (D.tumbleA * 1.2) * (mid - 6));
    ctx.lineTo(w * 0.4, mid + st.a / (D.tumbleA * 1.2) * (mid - 6));
    ctx.stroke();
    ctx.strokeStyle = "#E9C93C";
    ctx.beginPath();
    ctx.moveTo(w * 0.6, mid - st.b / (D.tumbleB * 1.2) * (mid - 6));
    ctx.lineTo(w - 4, mid + st.b / (D.tumbleB * 1.2) * (mid - 6));
    ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("环1 = qx(−a) · 环2 = qz(−b)", 4, 10);
    ctx.fillText("与壳角互逆 → 炉体世界恒平", 4, h - 4);
  }

  function drawLevel(st, ph, pt, ctx, w, h) {
    if (el.lvl) el.lvl.textContent = "0.000°";
  }

  /* ④ 烟缕正弦示意 */
  function drawSmoke(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w / 2;
    ctx.strokeStyle = "rgba(200,194,180,0.7)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (var i = 0; i <= 40; i++) {
      var y = h - 8 - i / 40 * (h - 18);
      var x = cx + Math.sin(i * 0.45 + st.time * 2) * (4 + i * 0.3);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = st.lit ? "#E8611C" : soft;
    ctx.beginPath(); ctx.arc(cx, h - 8, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(st.lit ? "香燃 · 烟直上(炉体常平)" : "未点香", 4, 10);
  }
})(window.MECH = window.MECH || {});
