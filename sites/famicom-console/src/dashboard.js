/* 仪表盘：PPU 图形表 · APU 四声道 · 卡带状态 · 帧计数 */
(function (LS8) {
  var ctxPpu, ctxApu;
  var pw, ph, aw, ah;
  var dom = {};
  var tiles = [];

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
      '<section class="panel"><header><i class="dot" style="background:#5b8cff"></i><b>图形表</b><span class="meta">PPU · CHR TABLE · 8x8</span></header>' +
      '<div class="body"><canvas id="c-ppu"></canvas>' +
      '<div class="axis"><span id="ppu-note">显存空载</span><span id="ppu-tiles">0/512</span></div></div></section>' +

      '<section class="panel"><header><i class="dot" style="background:#e84f8e"></i><b>音源声道</b><span class="meta">APU 2A03 · PULSE×2/TRI/NOISE/DMC</span></header>' +
      '<div class="body"><canvas id="c-apu"></canvas>' +
      '<div class="axis"><span id="apu-note">静默</span><span id="apu-frames">0 序列</span></div></div></section>' +

      '<section class="panel"><header><i class="dot" style="background:#e8c53c"></i><b>游戏卡带</b><span class="meta">GAME PAK · 60 PIN · NROM</span></header>' +
      '<div class="body"><div class="iq-stats" style="height:80px">' +
      '<div class="r"><span>卡带</span><b id="cart-state">空置</b></div>' +
      '<div class="r"><span>程序 PRG</span><b id="cart-prg">—</b></div>' +
      '<div class="r"><span>图形 CHR</span><b id="cart-chr">—</b></div>' +
      '<div class="r"><span>镜像</span><b id="cart-mir">—</b></div>' +
      '<div class="iq-chips" style="margin-top:auto"><span class="chip" id="ch-seated">已就位</span><span class="chip" id="ch-pw">POWER</span></div>' +
      '</div></div></section>' +

      '<section class="panel"><header><i class="dot" style="background:#57c46b"></i><b>帧计数</b><span class="meta">NTSC · 60.098 HZ</span></header>' +
      '<div class="body"><div class="iq-stats" style="height:80px">' +
      '<div class="r"><span>帧</span><b id="fr-count">000000</b></div>' +
      '<div class="r"><span>扫描行</span><b id="fr-scan">0 / 262</b></div>' +
      '<div class="r"><span>垂直消隐</span><b id="fr-vbl">否</b></div>' +
      '<div class="r"><span>精灵</span><b id="fr-spr">0 / 64</b></div>' +
      '<div class="iq-chips" style="margin-top:auto"><span class="chip" id="ch-ppuon">PPU 开启</span><span class="chip" id="ch-play">运行</span></div>' +
      '</div></div></section>';

    var p = mkCanvas("c-ppu", 80); ctxPpu = p.ctx; pw = p.w; ph = p.h;
    var a = mkCanvas("c-apu", 80); ctxApu = a.ctx; aw = a.w; ah = a.h;

    dom = {
      ppuNote: document.getElementById("ppu-note"), ppuTiles: document.getElementById("ppu-tiles"),
      apuNote: document.getElementById("apu-note"), apuFrames: document.getElementById("apu-frames"),
      cartState: document.getElementById("cart-state"), cartPrg: document.getElementById("cart-prg"),
      cartChr: document.getElementById("cart-chr"), cartMir: document.getElementById("cart-mir"),
      seated: document.getElementById("ch-seated"), pw: document.getElementById("ch-pw"),
      frCount: document.getElementById("fr-count"), frScan: document.getElementById("fr-scan"),
      frVbl: document.getElementById("fr-vbl"), frSpr: document.getElementById("fr-spr"),
      ppuOn: document.getElementById("ch-ppuon"), play: document.getElementById("ch-play")
    };

    // 图形表瓦片元数据：512 个 8x8 瓦片，按游戏加载顺序点亮
    tiles = [];
    var NES = ["#0f0f23", "#1c1c5c", "#5c54c8", "#8c7ee8", "#c8c8f0", "#fce0a8",
               "#f8b800", "#f87858", "#e84f8e", "#b8318c", "#6b31b8", "#31b8b8",
               "#57c46b", "#a8d878", "#f2a53a", "#e8e4da"];
    for (var t = 0; t < 512; t++) {
      tiles.push({
        on: Math.random() < 0.88,
        c1: NES[Math.floor(Math.random() * NES.length)],
        c2: NES[Math.floor(Math.random() * NES.length)],
        c3: NES[Math.floor(Math.random() * NES.length)],
        kind: Math.floor(Math.random() * 3)
      });
    }
  }

  function drawPpu(st) {
    var ctx = ctxPpu, W = pw, H = ph;
    ctx.fillStyle = "#0c1626";
    ctx.fillRect(0, 0, W, H);
    var cols = 24, rows = 8, cell = Math.min((W - 4) / cols, (H - 4) / rows);
    var ox = (W - cols * cell) / 2, oy = (H - rows * cell) / 2;
    var shown = Math.floor(st.chrProgress * 512);
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var idx = r * cols + c;
        var x = ox + c * cell, y = oy + r * cell;
        var tile = tiles[idx];
        ctx.strokeStyle = "rgba(127,216,216,0.12)";
        ctx.strokeRect(x, y, cell, cell);
        if (idx < shown && tile.on) {
          // 伪 8x8 瓦片：2x2 色块
          ctx.fillStyle = tile.c1;
          ctx.fillRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
          ctx.fillStyle = tile.c2;
          ctx.fillRect(x + 0.5, y + 0.5, cell / 2 - 0.5, cell / 2 - 0.5);
          ctx.fillStyle = tile.c3;
          if (tile.kind === 1) ctx.fillRect(x + cell / 2, y + cell / 2, cell / 2 - 1, cell / 2 - 1);
        }
      }
    }
  }

  function drawApu(st) {
    var ctx = ctxApu, W = aw, H = ah;
    ctx.fillStyle = "#0c1626";
    ctx.fillRect(0, 0, W, H);
    var chs = [
      { name: "P1", amp: st.playing ? 0.7 + Math.sin(st.time * 9) * 0.2 : 0, col: "#e84f8e" },
      { name: "P2", amp: st.playing ? 0.55 + Math.sin(st.time * 7 + 2) * 0.25 : 0, col: "#f2a53a" },
      { name: "TRI", amp: st.playing ? 0.6 + Math.sin(st.time * 5 + 1) * 0.2 : 0, col: "#7fd8d8" },
      { name: "NSE", amp: st.playing ? 0.35 + Math.random() * 0.3 : 0, col: "#57c46b" }
    ];
    var bw = (W - 30) / 4;
    chs.forEach(function (c, i) {
      var x = 10 + i * bw + bw / 2 - 6;
      ctx.fillStyle = "rgba(232,228,216,0.14)";
      ctx.fillRect(x, 8, 12, H - 26);
      var hgt = (H - 26) * c.amp;
      ctx.fillStyle = c.col;
      ctx.fillRect(x, 8 + (H - 26) - hgt, 12, hgt);
      ctx.fillStyle = "rgba(232,228,216,0.6)";
      ctx.font = "8px monospace";
      ctx.fillText(c.name, x + 1, H - 6);
    });
  }

  function update(st, dt) {
    drawPpu(st);
    drawApu(st);
    dom.ppuNote.textContent = st.chrProgress > 0 ? "图形库加载中" : "显存空载";
    dom.ppuTiles.textContent = Math.floor(st.chrProgress * 512) + "/512";
    dom.apuNote.textContent = st.playing ? "演奏序列中" : "静默";
    dom.apuFrames.textContent = Math.floor(st.seqs) + " 序列";

    dom.cartState.textContent = st.cartSeated ? "已就位" : "空置";
    dom.cartState.style.color = st.cartSeated ? "#57c46b" : "rgba(232,228,216,0.6)";
    dom.cartPrg.textContent = st.cartSeated ? "32 KB" : "—";
    dom.cartChr.textContent = st.cartSeated ? "8 KB" : "—";
    dom.cartMir.textContent = st.cartSeated ? "水平" : "—";
    dom.seated.className = "chip" + (st.cartSeated ? " on" : "");
    dom.pw.className = "chip" + (st.power ? " on" : "");

    dom.frCount.textContent = String(Math.floor(st.frames)).padStart(6, "0");
    var scan = Math.floor((st.time * 60.098) % 262);
    dom.frScan.textContent = scan + " / 262";
    dom.frVbl.textContent = (scan >= 241) ? "是" : "否";
    dom.frSpr.textContent = st.playing ? (8 + Math.floor(Math.random() * 5)) + " / 64" : "0 / 64";
    dom.ppuOn.className = "chip" + (st.chrProgress > 0 ? " on" : "");
    dom.play.className = "chip" + (st.playing ? " lock" : "");
  }

  LS8.Dashboard = { build: buildDOM, update: update };
})(window.LS8 = window.LS8 || {});
