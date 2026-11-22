/* 底部五仪表盘：D13 方波 · 串口监视器 · 电源轨 · 时钟/UART · Flash 占用 */
(function (UNO3) {
  var ctxWave, ctxSerial, waveW, waveH, serW, serH;
  var d13Hist = [];        // D13 电平历史（0/1）
  var els = {};

  function $(id) { return document.getElementById(id); }

  function mkCanvas(id, h) {
    var c = $(id);
    var w = c.clientWidth || 200;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = h * dpr;
    c.style.height = h + "px";
    var ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: w, h: h };
  }

  function buildDOM() {
    var dash = $("dash");
    dash.innerHTML =
      '<section class="panel"><header><i class="dot orange"></i><b>数字输出 D13</b><span class="meta">DIGITAL OUT · BLINK 1 HZ</span></header>' +
      '<div class="body"><canvas id="c-wave"></canvas>' +
      '<div class="wave-foot"><span class="wave-level"><i id="w-dot"></i><b id="w-lv">低电平 LOW</b></span>' +
      '<span class="chip" id="w-chip">PIN 13</span></div></div></section>' +

      '<section class="panel"><header><i class="dot teal"></i><b>串口监视器</b><span class="meta">SERIAL MONITOR · UART0</span></header>' +
      '<div class="body"><canvas id="c-serial"></canvas>' +
      '<div class="serial-foot"><span>9600 <b>8N1</b></span><span>TX <b id="ser-n">0</b> 字节</span>' +
      '<span class="chip" id="ser-chip">空闲 IDLE</span></div></div></section>' +

      '<section class="panel"><header><i class="dot green"></i><b>电源轨</b><span class="meta">POWER RAILS · VIN 7-12 V</span></header>' +
      '<div class="body"><div id="rail-rows"></div>' +
      '<div class="rails-foot"><div class="v" id="rail-v">0.00 <small>V</small></div>' +
      '<span class="chip" id="rail-chip">断电 OFF</span></div></div></section>' +

      '<section class="panel"><header><i class="dot blue"></i><b>时钟 · UART</b><span class="meta">ATmega328P</span></header>' +
      '<div class="body"><div class="clk-main" id="clk-main">—— <small>MHz</small></div>' +
      '<div class="clk-rows">' +
      '<div class="clk-row"><span>程序 SKETCH</span><b id="clk-sk">—</b></div>' +
      '<div class="clk-row"><span>串口 UART</span><b id="clk-uart">—</b></div></div>' +
      '<div class="clk-leds"><span class="clk-led"><i id="cl-tx"></i>TX</span>' +
      '<span class="clk-led"><i id="cl-rx"></i>RX</span></div>' +
      '<div class="clk-foot"><span id="clk-up">运行 00:00.0</span><b id="clk-seat">0 / 43</b></div>' +
      '</div></section>' +

      '<section class="panel"><header><i class="dot pink"></i><b>Flash 存储 · 32 KB</b><span class="meta">32,768 B</span></header>' +
      '<div class="body"><div class="flash-top"><span class="flash-sketch" id="fl-sk">无程序</span>' +
      '<span class="flash-size" id="fl-size">0 <small>B</small></span></div>' +
      '<div class="flash-bar"><i id="fl-bar"></i></div>' +
      '<div class="flash-rows">' +
      '<div class="r"><span>SRAM 2 KB</span><b id="fl-sram">—</b></div>' +
      '<div class="r"><span>EEPROM 1 KB</span><b>0 B</b></div></div>' +
      '<div class="flash-foot"><span id="fl-pct">0%</span><b id="fl-st">等待 WAIT</b></div>' +
      '</div></section>';

    /* 电源轨 3 行 */
    var rows = $("rail-rows");
    [["VIN", "9V IN"], ["VCC", "5.0V"], ["3V3", "3.3V"]].forEach(function (r, i) {
      var row = document.createElement("div");
      row.className = "rail-row";
      row.innerHTML = '<span class="name">' + r[0] + '</span>' +
        '<span class="bar"><i id="rb-' + i + '"></i></span>' +
        '<span class="val" id="rv-' + i + '">0.00 V</span>';
      rows.appendChild(row);
    });

    var wave = mkCanvas("c-wave", 72);
    ctxWave = wave.ctx; waveW = wave.w; waveH = wave.h;
    var ser = mkCanvas("c-serial", 88);
    ctxSerial = ser.ctx; serW = ser.w; serH = ser.h;

    els = {
      wDot: $("w-dot"), wLv: $("w-lv"), wChip: $("w-chip"),
      serN: $("ser-n"), serChip: $("ser-chip"),
      railBars: [$("rb-0"), $("rb-1"), $("rb-2")],
      railVals: [$("rv-0"), $("rv-1"), $("rv-2")],
      railV: $("rail-v"), railChip: $("rail-chip"),
      clkMain: $("clk-main"), clkSk: $("clk-sk"), clkUart: $("clk-uart"),
      clTx: $("cl-tx"), clRx: $("cl-rx"), clkUp: $("clk-up"), clkSeat: $("clk-seat"),
      flSk: $("fl-sk"), flSize: $("fl-size"), flBar: $("fl-bar"),
      flSram: $("fl-sram"), flPct: $("fl-pct"), flSt: $("fl-st")
    };
  }

  var railCfg = [
    { max: 12.0, col: "#d67f33" },
    { max: 6.0, col: "#4caf6d" },
    { max: 4.5, col: "#3fb2c4" }
  ];

  /* D13 方波：右端为当前电平，向左滚动 */
  function drawWave(st) {
    var ctx = ctxWave, W = waveW, H = waveH;
    d13Hist.push(st.d13);
    if (d13Hist.length > W) d13Hist.splice(0, d13Hist.length - W);
    ctx.fillStyle = "#181b21";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(232,228,216,0.12)";
    ctx.lineWidth = 1;
    for (var gx = 1; gx < 6; gx++) {
      ctx.beginPath(); ctx.moveTo(W * gx / 6, 0); ctx.lineTo(W * gx / 6, H); ctx.stroke();
    }
    var hi = 10, lo = H - 12;
    ctx.strokeStyle = "rgba(232,228,216,0.2)";
    ctx.beginPath(); ctx.moveTo(0, hi); ctx.lineTo(W, hi); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, lo); ctx.lineTo(W, lo); ctx.stroke();
    var has = st.power && st.clkOn;
    ctx.strokeStyle = has ? "#ff8a2a" : "rgba(232,228,216,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    var started = false;
    for (var i = 0; i < d13Hist.length; i++) {
      var x = W - d13Hist.length + i;
      var y = d13Hist[i] ? hi : lo;
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    /* 当前电平圆点 */
    var lv = d13Hist.length ? d13Hist[d13Hist.length - 1] : 0;
    ctx.fillStyle = has && lv ? "#ff8a2a" : "#3a3e46";
    ctx.beginPath(); ctx.arc(W - 8, lv ? hi : lo, 4, 0, Math.PI * 2); ctx.fill();
  }

  /* 串口监视器滚动文本 */
  function drawSerial(st) {
    var ctx = ctxSerial, W = serW, H = serH;
    ctx.fillStyle = "#14171c";
    ctx.fillRect(0, 0, W, H);
    ctx.font = "10px monospace";
    ctx.textBaseline = "top";
    var lh = 14, n = Math.floor((H - 8) / lh);
    if (st.serialOn && st.lines.length) {
      var start = Math.max(0, st.lines.length - n);
      for (var i = start; i < st.lines.length; i++) {
        ctx.fillStyle = i === st.lines.length - 1 ? "#8fe0d0" : "rgba(143,224,208,0.6)";
        ctx.fillText("> " + st.lines[i], 8, 6 + (i - start) * lh);
      }
      /* 闪烁光标 */
      if (Math.floor(st.time * 2.2) % 2 === 0) {
        ctx.fillStyle = "#8fe0d0";
        ctx.fillRect(8, 6 + Math.min(n - 1, st.lines.length - 1 - start) * lh + 1, 6, 10);
      }
    } else {
      ctx.fillStyle = "rgba(232,228,216,0.35)";
      ctx.fillText(st.power ? "等待串口 TX…" : "— 端口未连接 —", 8, 8);
    }
  }

  function update(st) {
    drawWave(st);
    drawSerial(st);

    /* D13 读数 */
    var lv = st.d13 ? "高电平 HIGH" : "低电平 LOW";
    els.wLv.textContent = lv;
    els.wDot.className = st.power && st.clkOn && st.d13 ? "on" : "";
    els.wChip.className = "chip" + (st.power && st.clkOn ? " on" : "");

    /* 串口 */
    els.serN.textContent = st.serialBytes;
    els.serChip.textContent = st.serialOn ? "通信中 LINK" : (st.power ? "就绪 READY" : "空闲 IDLE");
    els.serChip.className = "chip" + (st.serialOn ? " live" : (st.power ? " on" : ""));

    /* 电源轨 */
    var vals = [st.vVin, st.v5, st.v33];
    vals.forEach(function (v, i) {
      els.railBars[i].style.width = (v / railCfg[i].max * 100) + "%";
      els.railBars[i].style.background = railCfg[i].col;
      els.railVals[i].textContent = v.toFixed(2) + " V";
    });
    els.railV.innerHTML = st.v5.toFixed(2) + " <small>V</small>";
    els.railChip.textContent = st.power ? "通电 ON" : "断电 OFF";
    els.railChip.className = "chip" + (st.power ? " on" : "");

    /* 时钟 / UART */
    if (st.clkOn) {
      els.clkMain.innerHTML = "16.000 <small>MHz</small>";
    } else {
      els.clkMain.innerHTML = "—— <small>MHz</small>";
    }
    els.clkSk.textContent = st.flashB > 900 ? "BLINK" : "—";
    els.clkUart.textContent = st.serialOn ? "9600 8N1" : "—";
    els.clTx.className = st.tx ? "on" : "";
    els.clRx.className = st.rx ? "on" : "";
    var up = st.up || 0;
    var mm = String(Math.floor(up / 60)).padStart(2, "0");
    var ss = String(Math.floor(up % 60)).padStart(2, "0");
    var ds = Math.floor((up % 1) * 10);
    els.clkUp.textContent = "运行 " + mm + ":" + ss + "." + ds;
    els.clkSeat.textContent = st.seated + " / 43";

    /* Flash */
    els.flSk.textContent = st.flashTarget > 0 ? "BLINK.INO" : "无程序";
    els.flSize.innerHTML = Math.floor(st.flashB) + " <small>B</small>";
    els.flBar.style.width = (st.flashB / 32768 * 100) + "%";
    els.flSram.textContent = st.flashB > 900 ? "已用 544 B" : "—";
    var pct = st.flashB / 32768 * 100;
    els.flPct.textContent = pct.toFixed(1) + "%";
    els.flSt.textContent = st.flashB > 900 ? "已上传 UPLOADED" : (st.flashTarget > 0 ? "上传中 UPLOAD…" : "等待 WAIT");
    els.flSt.style.color = st.flashB > 900 ? "#e9c93c" : "rgba(232,228,216,.55)";
  }

  UNO3.Dashboard = { build: buildDOM, update: update };
})(window.UNO3 = window.UNO3 || {});
