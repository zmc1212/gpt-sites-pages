/* 底部五仪表盘:内存地图 · SID 三声道+波形 · VIC-II 读数 · CIA 定时器 · CPU 读数 */
(function (C64B) {
  var memCtx, memW, memH;
  var scopeCtx, scopeW, scopeH;

  function mkCanvas(id, h) {
    var c = document.getElementById(id);
    var w = c.clientWidth || 200;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.height = h + "px";
    var ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: w, h: h };
  }

  function voiceRow(i) {
    var waves = ["PULSE", "SAW", "TRI"];
    return '<div class="vrow"><span class="vtag">V' + (i + 1) + '</span>' +
      '<span class="vwave">' + waves[i] + '</span>' +
      '<b class="vfreq" id="vf-' + i + '">—</b>' +
      '<span class="vbar"><i id="ve-' + i + '"></i></span></div>';
  }

  function buildDOM() {
    var dash = document.getElementById("dash");
    dash.innerHTML =
      '<section class="panel" style="flex:1.15"><header><i class="dot blue"></i><b>内存地图</b><span class="meta">MEMORY MAP · $0000 – $FFFF · 64K</span></header>' +
      '<div class="body"><canvas id="c-mem"></canvas>' +
      '<div class="mem-foot"><span>BASIC 可用 <b id="mem-free">—</b></span><span id="mem-dram">DRAM 0/8</span></div></div></section>' +

      '<section class="panel" style="flex:1.3"><header><i class="dot pink"></i><b>SID 三声道</b><span class="meta">MOS 6581 · 弹奏键 A S D F G H J K</span></header>' +
      '<div class="body"><div class="vrows">' + voiceRow(0) + voiceRow(1) + voiceRow(2) + '</div>' +
      '<canvas id="c-sid"></canvas></div></section>' +

      '<section class="panel" style="flex:0.92"><header><i class="dot teal"></i><b>VIC-II 视频</b><span class="meta">MOS 6569 · PAL · 320×200</span></header>' +
      '<div class="body"><div class="vic-big">320<span class="x">×</span>200</div>' +
      '<div class="vic-row"><span class="k">边框 BORDER</span><i class="sw" id="vic-b"></i><b id="vic-bh">#3C414C</b></div>' +
      '<div class="vic-row"><span class="k">背景 BG</span><i class="sw" id="vic-g"></i><b id="vic-gh">#23272E</b></div>' +
      '<div class="vic-row"><span class="k">信号 SIGNAL</span><b id="vic-sig">无信号</b></div></div></section>' +

      '<section class="panel" style="flex:1"><header><i class="dot green"></i><b>CIA 定时器</b><span class="meta">MOS 6526 · TIMERS A / B</span></header>' +
      '<div class="body"><div class="cia-row"><span class="k">CIA1·A</span><span class="bar"><i id="cia-ta"></i></span><span class="val" id="cia-tav">$FFFF</span></div>' +
      '<div class="cia-row"><span class="k">CIA1·B</span><span class="bar"><i id="cia-tb"></i></span><span class="val" id="cia-tbv">$FFFF</span></div>' +
      '<div class="cia-foot"><span class="chip" id="cia-chip">TOD 50 HZ</span><span id="cia-note">空闲</span></div></div></section>' +

      '<section class="panel" style="flex:0.95"><header><i class="dot orange"></i><b>CPU 读数</b><span class="meta">6510 · 0.985 MHZ · ÷18 (8701)</span></header>' +
      '<div class="body"><div class="cpu-pc" id="cpu-pc">$FCE2</div>' +
      '<div class="cpu-row"><span>程序计数器 PC</span><b>复位 $FCE2</b></div>' +
      '<div class="cpu-row"><span>IRQ 中断</span><b id="cpu-irq">0 /S</b></div>' +
      '<div class="cpu-bus"><span class="k">总线 BUS</span><span class="bar"><i id="cpu-bus"></i></span></div>' +
      '<div class="cpu-foot" id="cpu-note">复位向量 $FCE2</div></div></section>';

    var mem = mkCanvas("c-mem", 64);
    memCtx = mem.ctx; memW = mem.w; memH = mem.h;
    var sc = mkCanvas("c-sid", 56);
    scopeCtx = sc.ctx; scopeW = sc.w; scopeH = sc.h;
  }

  function hex4(v) {
    return ("000" + (v & 0xffff).toString(16).toUpperCase()).slice(-4);
  }

  /* 内存地图:RAM / BASIC / CHAR+IO / KERNAL 四段 + PC 指针 */
  function drawMem(st) {
    var ctx = memCtx, W = memW, H = memH;
    ctx.fillStyle = "#151219";
    ctx.fillRect(0, 0, W, H);
    var y = 8, bh = 22;
    var segs = [
      { a: 0x0000, b: 0xa000, c: "91,116,216", al: 0.22 + Math.min(1, st.dramSeated / 8) * 0.6 },
      { a: 0xa000, b: 0xd000, c: "224,154,60", al: st.power ? 0.78 : 0.4 },
      { a: 0xd000, b: 0xe000, c: "87,176,107", al: st.power ? 0.78 : 0.4 },
      { a: 0xe000, b: 0x10000, c: "216,184,74", al: st.power ? 0.78 : 0.4 }
    ];
    segs.forEach(function (s) {
      var x0 = s.a / 0x10000 * W, x1 = s.b / 0x10000 * W;
      ctx.globalAlpha = s.al;
      ctx.fillStyle = "rgb(" + s.c + ")";
      ctx.fillRect(x0, y, Math.max(1, x1 - x0 - 1), bh);
    });
    ctx.globalAlpha = 1;
    ctx.font = "8px monospace";
    ctx.fillStyle = "rgba(232,223,200,0.6)";
    ctx.textAlign = "left";
    [["$0000", 0], ["$A000", 0xa000], ["$D000", 0xd000], ["$E000", 0xe000]].forEach(function (m) {
      ctx.fillText(m[0], m[1] / 0x10000 * W + 2, 42);
    });
    ctx.textAlign = "right";
    ctx.fillText("$FFFF", W - 1, 42);
    // PC 指针(上电后跳动)
    if (st.power && st.pcNum) {
      var px = st.pcNum / 0x10000 * W;
      ctx.strokeStyle = "rgba(232,200,106,0.85)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(px, 3);
      ctx.lineTo(px, 30);
      ctx.stroke();
      ctx.fillStyle = "#e8c86a";
      ctx.beginPath();
      ctx.moveTo(px - 4, 2);
      ctx.lineTo(px + 4, 2);
      ctx.lineTo(px, 7);
      ctx.closePath();
      ctx.fill();
    }
  }

  /* SID 示波器:三声道合成波形(按键/琶音时响应) */
  function drawScope(st) {
    var ctx = scopeCtx, W = scopeW, H = scopeH;
    ctx.fillStyle = "#131019";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(232,223,200,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    var act = st.voices.filter(function (v) { return v.f > 0 && v.env > 0.03; });
    if (!act.length) return;
    ctx.strokeStyle = "#e8dfc8";
    ctx.lineWidth = 1.6;
    ctx.shadowColor = "rgba(169,138,61,0.8)";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    for (var x = 0; x <= W; x += 2) {
      var t = x / W, v = 0;
      act.forEach(function (vo) {
        var ph = t * (vo.f / 90) * Math.PI * 2;
        var wv;
        if (vo.wave === "PULSE") wv = Math.sin(ph) > 0 ? 0.9 : -0.9;
        else if (vo.wave === "SAW") wv = ((ph / (Math.PI * 2)) % 1) * 1.8 - 0.9;
        else wv = Math.asin(Math.sin(ph)) / (Math.PI / 2) * 0.9;
        v += wv * Math.min(1, vo.env);
      });
      var y = H / 2 - Math.max(-1, Math.min(1, v)) * H * 0.38;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function update(st) {
    /* MEMORY MAP */
    drawMem(st);
    document.getElementById("mem-free").textContent = st.freeB ? st.freeB + " B" : "—";
    document.getElementById("mem-dram").textContent = "DRAM " + st.dramSeated + "/8";

    /* SID 声道 */
    for (var i = 0; i < 3; i++) {
      var vo = st.voices[i];
      document.getElementById("vf-" + i).textContent = vo.f > 0 ? Math.round(vo.f) + " HZ" : "—";
      document.getElementById("ve-" + i).style.width = Math.round(Math.min(1, vo.env) * 100) + "%";
    }
    drawScope(st);

    /* VIC-II */
    document.getElementById("vic-b").style.background = st.vicBorder;
    document.getElementById("vic-g").style.background = st.vicBg;
    document.getElementById("vic-bh").textContent = st.vicBorder.toUpperCase();
    document.getElementById("vic-gh").textContent = st.vicBg.toUpperCase();
    document.getElementById("vic-sig").textContent = st.vicSig;

    /* CIA 定时器 */
    document.getElementById("cia-ta").style.width = Math.round(st.ta * 100) + "%";
    document.getElementById("cia-tb").style.width = Math.round(st.tb * 100) + "%";
    document.getElementById("cia-tav").textContent = "$" + hex4(Math.floor(0xffff * st.ta));
    document.getElementById("cia-tbv").textContent = "$" + hex4(Math.floor(0xffff * st.tb));
    document.getElementById("cia-note").textContent = st.power ? "计数中" : "空闲";
    document.getElementById("cia-chip").className = "chip" + (st.power ? " on" : "");

    /* CPU */
    document.getElementById("cpu-pc").textContent = st.pc;
    document.getElementById("cpu-irq").textContent = Math.floor(st.irq) + " /S";
    document.getElementById("cpu-bus").style.width = Math.round(st.bus * 100) + "%";
    document.getElementById("cpu-note").textContent = st.power
      ? (st.freeB ? "BASIC 就绪 · 38911 空闲" : "内存自检 · ROM 映射")
      : "复位向量 $FCE2";
  }

  C64B.Dashboard = { build: buildDOM, update: update };
})(window.C64B = window.C64B || {});
