/* 仪表盘：前面板 LED · S-100 插卡 · 纸带 · 8080 CPU */
(function (LS8) {
  var ctxPanel, ctxTape;
  var pW, pH, tW, tH;
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
      '<section class="panel"><header><i class="dot" style="background:#ff3b30"></i><b>前面板</b><span class="meta">FRONT PANEL · 16 ADDR · 8 DATA · 8 STATUS · 4 INDI</span></header>' +
      '<div class="body"><canvas id="c-panel"></canvas></div></section>' +

      '<section class="panel"><header><i class="dot" style="background:#5b8cff"></i><b>总线插槽</b><span class="meta">S-100 BUS · 100 PIN · 18 SLOTS</span></header>' +
      '<div class="body"><div id="slot-rows"></div>' +
      '<div class="rail-row" style="margin-top:6px"><span class="name">BUS</span><span class="bar"><i id="bus-act"></i></span><span class="val" id="bus-t">--</span></div>' +
      '</div></section>' +

      '<section class="panel"><header><i class="dot" style="background:#e8c53c"></i><b>纸带</b><span class="meta">PAPER TAPE · BASIC 4K · 300 BAUD</span></header>' +
      '<div class="body"><canvas id="c-tape"></canvas>' +
      '<div class="axis"><span id="tape-label">待机</span><span id="tape-pct">0%</span></div></div></section>' +

      '<section class="panel"><header><i class="dot" style="background:#57c46b"></i><b>8080 处理器</b><span class="meta">CPU · 2 MHZ · 8224 CLK</span></header>' +
      '<div class="body"><div class="iq-stats" style="height:80px">' +
      '<div class="r"><span>PC</span><b id="cpu-pc">0000</b></div>' +
      '<div class="r"><span>SP</span><b id="cpu-sp">0000</b></div>' +
      '<div class="r"><span>A</span><b id="cpu-a">00</b></div>' +
      '<div class="r"><span>FLAGS</span><b id="cpu-fl">00</b></div>' +
      '<div class="iq-chips" style="margin-top:auto"><span class="chip" id="ch-run">RUN</span><span class="chip" id="ch-wait">WAIT</span><span class="chip" id="ch-halt">HLTA</span></div>' +
      '</div></div></section>';

    var rows = document.getElementById("slot-rows");
    ["1K RAM", "2SIO", "PROM MON", "VIDEO"].forEach(function (n, i) {
      var row = document.createElement("div");
      row.className = "rail-row";
      row.innerHTML = '<span class="name">SLOT ' + (i + 1) + '</span><span class="bar"><i id="slot-' + i + '"></i></span><span class="val" id="slotn-' + i + '">' + n + '</span>';
      rows.appendChild(row);
    });

    var p = mkCanvas("c-panel", 100); ctxPanel = p.ctx; pW = p.w; pH = p.h;
    var t = mkCanvas("c-tape", 62); ctxTape = t.ctx; tW = t.w; tH = t.h;

    dom = {
      slots: [0, 1, 2, 3, 4].map(function (i) { return document.getElementById("slot-" + i); }),
      slotNames: [0, 1, 2, 3, 4].map(function (i) { return document.getElementById("slotn-" + i); }),
      busAct: document.getElementById("bus-act"), busT: document.getElementById("bus-t"),
      tapeLabel: document.getElementById("tape-label"), tapePct: document.getElementById("tape-pct"),
      pc: document.getElementById("cpu-pc"), sp: document.getElementById("cpu-sp"),
      a: document.getElementById("cpu-a"), fl: document.getElementById("cpu-fl"),
      run: document.getElementById("ch-run"), wait: document.getElementById("ch-wait"), halt: document.getElementById("ch-halt")
    };
  }

  var LED_NAMES = ["MEMR", "INP", "M1", "OUT", "HLTA", "STACK", "WO", "INT"];
  var INDI_NAMES = ["INTE", "PROT", "WAIT", "HLDA"];

  function drawPanel(st) {
    var ctx = ctxPanel, W = pW, H = pH;
    ctx.fillStyle = "#101216";
    ctx.fillRect(0, 0, W, H);
    var rows = [
      { y: 20, bits: (st.addr >> 8) & 0xff, label: "A15-8" },
      { y: 38, bits: st.addr & 0xff, label: "A7-0" },
      { y: 56, bits: st.data & 0xff, label: "D7-0" }
    ];
    rows.forEach(function (r) {
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = "7px monospace";
      ctx.fillText(r.label, 6, r.y - 1);
      for (var b = 0; b < 8; b++) {
        var on = st.power && ((r.bits >> (7 - b)) & 1);
        ctx.fillStyle = on ? "#ff3b30" : "#381210";
        if (on) { ctx.shadowColor = "rgba(255,59,48,0.9)"; ctx.shadowBlur = 6; }
        ctx.fillRect(40 + b * 15, r.y - 8, 11, 9);
        ctx.shadowBlur = 0;
      }
    });
    // 状态 LED 行（8 颗，全红——真实 Altair 面板标牌）
    for (var s = 0; s < 8; s++) {
      ctx.fillStyle = st.power && (st.status >> s) & 1 ? "#ff3b30" : "#381210";
      ctx.fillRect(40 + s * 15, 60, 11, 6);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = "6px monospace";
      ctx.fillText(LED_NAMES[s], 40 + s * 15, 73);
    }
    // 指示灯行（INTE / PROT / WAIT / HLDA）
    for (var d = 0; d < 4; d++) {
      ctx.fillStyle = st.power && (st.status >> (8 + d)) & 1 ? "#ff3b30" : "#381210";
      ctx.fillRect(40 + d * 15, 78, 11, 6);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = "6px monospace";
      ctx.fillText(INDI_NAMES[d], 40 + d * 15, 91);
    }
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "8px monospace";
    ctx.fillText(st.addr.toString(16).toUpperCase().padStart(4, "0"), W - 40, 56);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "7px monospace";
    ctx.fillText("ADDR", W - 40, 66);
  }

  function drawTape(st) {
    var ctx = ctxTape, W = tW, H = tH;
    ctx.fillStyle = "#17130e";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#e8ddc8";
    ctx.fillRect(4, 6, W - 8, H - 12);
    // 纸带孔（按进度露出）
    var cols = Math.floor((W - 8) / 14);
    for (var c = 0; c < cols; c++) {
      var x = 8 + c * 14;
      var loaded = c / cols < st.tapeProgress;
      ctx.fillStyle = loaded ? "#17130e" : "#b8a88a";
      ctx.beginPath(); ctx.arc(x, 16, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, 40, 3.2, 0, Math.PI * 2); ctx.fill();
      // 中导孔
      ctx.fillStyle = "#8f8474";
      ctx.beginPath(); ctx.arc(x, 28, 1.6, 0, Math.PI * 2); ctx.fill();
      if (loaded) {
        ctx.fillStyle = "#17130e";
        var bits = (st.tapeBits >> (c % 8)) & 1;
        if (bits) ctx.fillRect(x - 3, 24, 6, 8);
      }
    }
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.strokeRect(4.5, 6.5, W - 9, H - 13);
  }

  function update(st, dt) {
    drawPanel(st);
    drawTape(st);

    var cardNames = ["1K RAM", "2SIO", "PROM MON", "VIDEO"];
    st.slotFill.forEach(function (filled, i) {
      dom.slots[i].style.width = filled ? "100%" : "0%";
      dom.slots[i].style.background = filled ? ["#57c46b", "#e84f8e", "#8b5fd0", "#5b8cff"][i] : "transparent";
      dom.slotNames[i].textContent = filled ? cardNames[i] : "空置";
      dom.slotNames[i].style.color = filled ? "#f2eee2" : "rgba(232,228,216,0.4)";
    });
    dom.busAct.style.width = (st.busActivity * 100) + "%";
    dom.busT.textContent = st.busActivity > 0.05 ? "活动中" : "空闲";

    dom.tapeLabel.textContent = st.tapeProgress > 0 ? (st.tapeProgress >= 1 ? "BASIC 4K 装载完成" : "加载中 · 300 BAUD") : "待机";
    dom.tapePct.textContent = Math.round(st.tapeProgress * 100) + "%";

    dom.pc.textContent = st.regs.pc.toString(16).toUpperCase().padStart(4, "0");
    dom.sp.textContent = st.regs.sp.toString(16).toUpperCase().padStart(4, "0");
    dom.a.textContent = st.regs.a.toString(16).toUpperCase().padStart(2, "0");
    dom.fl.textContent = st.regs.fl.toString(16).toUpperCase().padStart(2, "0");
    dom.run.className = "chip" + (st.run ? " on" : "");
    dom.wait.className = "chip" + (st.power && !st.run ? " on" : "");
    dom.halt.className = "chip" + (st.halt ? " lock" : "");
  }

  LS8.Dashboard = { build: buildDOM, update: update };
})(window.LS8 = window.LS8 || {});
