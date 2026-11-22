/* 仪表盘：CRT 文字屏 · 6502 寄存器 · RAM 插座图 · 磁带机 */
(function (LS8) {
  var ctxCrt, ctxTape;
  var cw, ch, tw, th;
  var dom = {};

  function mkCanvas(id, h) {
    var c = document.getElementById(id);
    var w = c.clientWidth || 200;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = h * dpr;
    c.style.height = h + "px";
    var ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: w, h: h };
  }

  function buildDOM() {
    document.getElementById("dash").innerHTML =
      '<section class="panel"><header><i class="dot" style="background:#3ddc6f"></i><b>CRT 文字屏</b><span class="meta">40 x 24 · MONITOR · NTSC</span></header>' +
      '<div class="body"><canvas id="c-crt"></canvas></div></section>' +

      '<section class="panel"><header><i class="dot pink" style="background:#e84f8e"></i><b>6502 寄存器</b><span class="meta">MOS 6502 · 1.023 MHZ</span></header>' +
      '<div class="body"><div class="iq-stats" style="height:80px">' +
      '<div class="r"><span>PC</span><b id="cpu-pc">E000</b></div>' +
      '<div class="r"><span>A</span><b id="cpu-a">00</b></div>' +
      '<div class="r"><span>X</span><b id="cpu-x">00</b></div>' +
      '<div class="r"><span>Y</span><b id="cpu-y">00</b></div>' +
      '<div class="iq-chips" style="margin-top:auto"><span class="chip" id="ch-wm">WOZMON</span><span class="chip" id="ch-basic">BASIC</span><span class="chip" id="ch-run">运行 RUN</span></div>' +
      '</div></div></section>' +

      '<section class="panel"><header><i class="dot" style="background:#5b8cff"></i><b>内存 RAM</b><span class="meta">4K · 8 × MK4096 · 2 ROWS</span></header>' +
      '<div class="body"><div id="ram-grid"></div>' +
      '<div class="axis"><span id="ram-note">插座空置</span><span id="ram-test">—</span></div></div></section>' +

      '<section class="panel"><header><i class="dot" style="background:#e8c53c"></i><b>磁带机</b><span class="meta">CASSETTE · BASIC 4K · 1500 BAUD</span></header>' +
      '<div class="body"><canvas id="c-tape"></canvas>' +
      '<div class="axis"><span id="tape-note">待机</span><span id="tape-pct">0%</span></div></div></section>';

    // RAM 插座网格：2 排 × 8 座（第 1 排插 8 颗 MK4096，第 2 排留作扩展）
    var grid = document.getElementById("ram-grid");
    ["第 1 排", "扩展排"].forEach(function (name, r) {
      var row = document.createElement("div");
      row.className = "rail-row";
      row.innerHTML = '<span class="name">' + name + '</span><span class="bar"><i id="ram-' + r + '"></i></span><span class="val" id="ramv-' + r + '">0/8</span>';
      grid.appendChild(row);
    });

    var c = mkCanvas("c-crt", 92); ctxCrt = c.ctx; cw = c.w; ch = c.h;
    var t = mkCanvas("c-tape", 62); ctxTape = t.ctx; tw = t.w; th = t.h;

    dom = {
      pc: document.getElementById("cpu-pc"), a: document.getElementById("cpu-a"),
      x: document.getElementById("cpu-x"), y: document.getElementById("cpu-y"),
      wm: document.getElementById("ch-wm"), basic: document.getElementById("ch-basic"), run: document.getElementById("ch-run"),
      ramRows: [0, 1].map(function (i) { return document.getElementById("ram-" + i); }),
      ramVals: [0, 1].map(function (i) { return document.getElementById("ramv-" + i); }),
      ramNote: document.getElementById("ram-note"), ramTest: document.getElementById("ram-test"),
      tapeNote: document.getElementById("tape-note"), tapePct: document.getElementById("tape-pct")
    };
  }

  /* CRT：文本行缓冲 + 打字机光标 */
  var crtLines = [];
  var crtCursor = "";

  function crtType(line, prompt) {
    crtLines.push(line);
    if (LS8.Audio) LS8.Audio.play("type");
    if (crtLines.length > 6) crtLines.shift();
    crtCursor = prompt || "";
  }

  function drawCrt(st) {
    var ctx = ctxCrt, W = cw, H = ch;
    ctx.fillStyle = "#041207";
    ctx.fillRect(0, 0, W, H);
    if (!st.crtOn) {
      ctx.fillStyle = "rgba(51,255,102,0.12)";
      ctx.font = "10px monospace";
      ctx.fillText("— NO SIGNAL —", W / 2 - 42, H / 2);
      return;
    }
    ctx.fillStyle = "#38ff70";
    ctx.font = "10px monospace";
    ctx.shadowColor = "rgba(56,255,112,0.8)";
    ctx.shadowBlur = 4;
    crtLines.forEach(function (ln, i) {
      ctx.fillText(ln, 8, 16 + i * 13);
    });
    // 光标闪烁（Woz Monitor 为 @ 光标）
    if (Math.sin(st.time * 6) > 0 && crtCursor) {
      var y = 16 + Math.min(crtLines.length, 6) * 13 - 3;
      ctx.fillText(crtCursor, 8, y);
    }
    ctx.shadowBlur = 0;
    // 扫描线
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    for (var sy = 0; sy < H; sy += 3) ctx.fillRect(0, sy, W, 1);
  }

  function drawTape(st) {
    var ctx = ctxTape, W = tw, H = th;
    ctx.fillStyle = "#101820";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(127,216,216,0.25)";
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    // 波形（300 波特盒式音频）
    ctx.strokeStyle = st.tapePlaying ? "#7fd8d8" : "rgba(127,216,216,0.25)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (var x = 0; x < W; x += 2) {
      var ph = (x / 14 + st.time * 8);
      var amp = st.tapePlaying ? (Math.floor(ph) % 2 ? 4.5 : 9) : 1.5;
      var y = H / 2 - Math.sin(ph * Math.PI) * amp;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // 进度条
    ctx.fillStyle = "rgba(127,216,216,0.2)";
    ctx.fillRect(0, H - 8, W, 3);
    ctx.fillStyle = "#7fd8d8";
    ctx.fillRect(0, H - 8, W * st.tapeProgress, 3);
  }

  function update(st, dt) {
    drawCrt(st);
    drawTape(st);

    dom.pc.textContent = st.regs.pc.toString(16).toUpperCase().padStart(4, "0");
    dom.a.textContent = st.regs.a.toString(16).toUpperCase().padStart(2, "0");
    dom.x.textContent = st.regs.x.toString(16).toUpperCase().padStart(2, "0");
    dom.y.textContent = st.regs.y.toString(16).toUpperCase().padStart(2, "0");
    dom.wm.className = "chip" + (st.crtOn && !st.basicOn ? " on" : "");
    dom.basic.className = "chip" + (st.basicOn ? " on" : "");
    dom.run.className = "chip" + (st.runChip ? " lock" : "");

    var filled = Math.min(8, st.ramSeated);   // 第 1 排已插芯片数（0-8）
    var counts = [filled, 0];                  // 第 2 排为空扩展座
    for (var r = 0; r < 2; r++) {
      dom.ramRows[r].style.width = (counts[r] / 8 * 100) + "%";
      dom.ramRows[r].style.background = counts[r] ? "#5b8cff" : "transparent";
      dom.ramVals[r].textContent = counts[r] + "/8";
    }
    dom.ramNote.textContent = st.crtOn ? "内存自检 · " + (filled * 512) + " B OK" : "插座空置";
    var sweep = st.crtOn ? String((Math.floor(st.time * 40) % 0x4000)).padStart(4, "0") : "—";
    dom.ramTest.textContent = "$" + sweep;

    dom.tapeNote.textContent = st.tapeProgress >= 1 ? "BASIC 已载入 · CRUN" : (st.tapePlaying ? "读取中 · 1500 BAUD" : "待机");
    dom.tapePct.textContent = Math.round(st.tapeProgress * 100) + "%";
  }

  LS8.Dashboard = {
    build: buildDOM,
    update: update,
    crtType: crtType,
    crtClear: function () { crtLines = []; crtCursor = ""; }
  };
})(window.LS8 = window.LS8 || {});
