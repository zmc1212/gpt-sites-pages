/* 底部五仪表盘：① 摆轮振幅/频率 ② 动力储备 ③ 日误差 ④ 擒纵 2.5D 小窗 ⑤ 轮系传动比 */
(function (MOVT) {
  var ctxWave, ctxEsc, waveW, waveH, escW, escH;
  var waveBuf = [];
  var WAVE_N = 260;

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
    var dash = document.getElementById("dash");
    dash.innerHTML =
      '<section class="panel"><header><i class="dot wine"></i><b>BALANCE</b><span class="meta">28,800 VPH · 4 HZ</span></header>' +
      '<div class="body"><div class="big" id="amp-big">±0° · 4 HZ</div>' +
      '<canvas id="c-wave"></canvas>' +
      '<div class="wave-foot"><span>ψ TRACE</span><span>AMP <b id="amp-max">—</b></span><span>f <b>4.00 HZ</b></span></div>' +
      '</div></section>' +

      '<section class="panel"><header><i class="dot brass"></i><b>RESERVE</b><span class="meta">MAINSPRING</span></header>' +
      '<div class="body"><div class="big" id="res-num">0.0 <small>H</small></div>' +
      '<div class="sub">42 H MAX · FULL WIND</div>' +
      '<div class="res-bar"><i id="res-bar"></i></div>' +
      '<div class="res-foot"><span class="sub" id="res-pct">0% WOUND</span>' +
      '<span class="chip" id="res-chip">AUTO-WIND</span></div>' +
      '</div></section>' +

      '<section class="panel"><header><i class="dot silver"></i><b>RATE</b><span class="meta">DAILY ERROR</span></header>' +
      '<div class="body"><div class="big">−4 <small>/</small> +6 <small>S/D · COSC</small></div>' +
      '<div class="sub">COSC CHRONOMETER WINDOW</div>' +
      '<div class="rate-live"><span>MEASURED</span><b id="rate-live">—</b></div>' +
      '<div class="rate-live"><span>TEMP</span><b id="rate-temp">23.0 °C</b></div>' +
      '</div></section>' +

      '<section class="panel"><header><i class="dot wine"></i><b>ESCAPEMENT</b><span class="meta">SWISS LEVER · 2.5D</span></header>' +
      '<div class="body"><canvas id="c-esc"></canvas>' +
      '<div class="esc-cap"><span>LOCK ▸ IMPULSE ▸ DROP</span><b>SYNC 3D</b></div>' +
      '</div></section>' +

      '<section class="panel"><header><i class="dot brass"></i><b>TRAIN</b><span class="meta">GOING TRAIN</span></header>' +
      '<div class="body">' +
      '<div class="train-row"><span class="nm">BARREL</span><span class="tt">84 T ▸ 14 T</span><span class="x">×6</span></div>' +
      '<div class="train-row"><span class="nm">CENTER</span><span class="tt">70 T ▸ 14 T</span><span class="x">×5</span></div>' +
      '<div class="train-row"><span class="nm">THIRD</span><span class="tt">56 T ▸ 14 T</span><span class="x">×4</span></div>' +
      '<div class="train-row"><span class="nm">FOURTH</span><span class="tt">96 T ▸ 6 T</span><span class="x">×16</span></div>' +
      '<div class="train-foot"><span>1 BARREL REV</span><b>= 1920 ESCAPE REVS</b></div>' +
      '</div></section>';

    var wave = mkCanvas("c-wave", 58);
    ctxWave = wave.ctx; waveW = wave.w; waveH = wave.h;
    var esc = mkCanvas("c-esc", 84);
    ctxEsc = esc.ctx; escW = esc.w; escH = esc.h;
  }

  /* ① 摆轮 ψ 实时曲线 */
  function drawWave(st) {
    var ctx = ctxWave, W = waveW, H = waveH;
    ctx.fillStyle = "#1b1814";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(239,231,216,0.10)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    for (var gx = 1; gx < 6; gx++) {
      ctx.beginPath(); ctx.moveTo(W * gx / 6, 0); ctx.lineTo(W * gx / 6, H); ctx.stroke();
    }
    if (st.active) {
      waveBuf.push(st.psi / (270 * Math.PI / 180));
      if (waveBuf.length > WAVE_N) waveBuf.shift();
    } else {
      waveBuf.push(0);
      if (waveBuf.length > WAVE_N) waveBuf.shift();
    }
    ctx.strokeStyle = "#b08d57";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (var i = 0; i < waveBuf.length; i++) {
      var x = i / (WAVE_N - 1) * W;
      var y = H / 2 - Math.max(-1.05, Math.min(1.05, waveBuf[i])) * (H * 0.42);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    if (st.active) {
      var ly = H / 2 - Math.max(-1.05, Math.min(1.05, waveBuf[waveBuf.length - 1])) * (H * 0.42);
      ctx.fillStyle = "#8c2f39";
      ctx.beginPath(); ctx.arc(W - 2, ly, 2.4, 0, Math.PI * 2); ctx.fill();
    }
  }

  /* ④ 擒纵 2.5D 小窗：与 3D 同相位（fork 摆动 + 擒纵轮齿步进 + 摆轮红点） */
  function drawEsc(st) {
    var ctx = ctxEsc, W = escW, H = escH;
    ctx.fillStyle = "#1b1814";
    ctx.fillRect(0, 0, W, H);
    var R = H * 0.30;
    var wx = W * 0.64, wy = H * 0.58;
    var p15 = (Math.PI * 2) / 15;

    /* 擒纵轮（club 齿） */
    ctx.save();
    ctx.translate(wx, wy);
    ctx.beginPath();
    for (var k = 0; k < 15; k++) {
      var a = st.escapeAngle + k * p15;
      var pts = [
        [R * 0.76, a - 0.36 * p15], [R, a - 0.12 * p15], [R, a + 0.12 * p15],
        [R * 0.76, a + 0.36 * p15], [R * 0.76, a + 0.5 * p15]
      ];
      for (var i = 0; i < pts.length; i++) {
        var x = Math.cos(pts[i][1]) * pts[i][0];
        var y = Math.sin(pts[i][1]) * pts[i][0];
        if (k === 0 && i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fillStyle = "#14110c";
    ctx.fill();
    ctx.strokeStyle = "#c6cbd2";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.strokeStyle = "rgba(198,203,210,0.55)";
    for (var s2 = 0; s2 < 4; s2++) {
      var sa = st.escapeAngle + s2 * Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sa) * R * 0.72, Math.sin(sa) * R * 0.72);
      ctx.stroke();
    }
    ctx.fillStyle = "#2a2723";
    ctx.beginPath(); ctx.arc(0, 0, R * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#8c2f39";
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    /* 擒纵叉（pivot 左上，臂伸向轮缘） */
    var fx = W * 0.27, fy = H * 0.26;
    var wDir = Math.atan2(wy - fy, wx - fx);
    var pDist = Math.hypot(wx - fx, wy - fy);
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(wDir + st.forkRel);
    ctx.strokeStyle = "#c6cbd2";
    ctx.lineWidth = 2.6;
    for (var arm = 0; arm < 2; arm++) {
      var aa = (arm === 0 ? 0.40 : -0.40);
      var sx = Math.cos(aa) * pDist * 0.60;
      var sy = Math.sin(aa) * pDist * 0.60;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(sx, sy); ctx.stroke();
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(aa + Math.PI / 4);
      ctx.fillStyle = "#9c1f34";
      ctx.fillRect(-4, -2.6, 8, 5.2);
      ctx.restore();
    }
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-pDist * 0.42, 0); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-pDist * 0.42, 0); ctx.lineTo(-pDist * 0.50, -3.5);
    ctx.moveTo(-pDist * 0.42, 0); ctx.lineTo(-pDist * 0.50, 3.5);
    ctx.stroke();
    ctx.restore();

    /* 摆轮小圆（红点随 ψ 转） */
    var bx = W * 0.11, by = H * 0.78, rb = H * 0.15;
    ctx.strokeStyle = "rgba(198,203,210,0.8)";
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(bx, by, rb, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(176,141,87,0.5)";
    ctx.beginPath();
    ctx.arc(bx, by, rb * 0.62, st.psi, st.psi + Math.PI * 2.4);
    ctx.stroke();
    ctx.fillStyle = "#8c2f39";
    ctx.beginPath();
    ctx.arc(bx + Math.cos(st.psi) * rb * 0.55, by + Math.sin(st.psi) * rb * 0.55, 2.4, 0, Math.PI * 2);
    ctx.fill();

    /* 节拍闪光：瓦石传递冲击的瞬间 */
    if (st.active && Math.abs(Math.sin(2 * Math.PI * 4 * st.beatT)) > 0.985) {
      ctx.strokeStyle = "rgba(239,231,216,0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(wx - Math.cos(wDir) * R, wy - Math.sin(wDir) * R);
      ctx.stroke();
    }
  }

  function update(st) {
    /* ① 摆轮 */
    drawWave(st);
    document.getElementById("amp-big").textContent = "±" + Math.round(st.ampDeg) + "° · 4 HZ";
    document.getElementById("amp-max").textContent = Math.round(st.ampDeg) + "°";

    /* ② 动力储备 */
    document.getElementById("res-num").innerHTML = st.reserveH.toFixed(1) + " <small>H</small>";
    document.getElementById("res-bar").style.width = Math.min(100, st.reserveH / 41 * 100) + "%";
    document.getElementById("res-pct").textContent = Math.round(st.reserveH / 41 * 100) + "% WOUND";
    document.getElementById("res-chip").className = "chip" + (st.winding ? " on" : "");

    /* ③ 日误差 */
    var rl = document.getElementById("rate-live");
    if (st.rateLive === null) {
      rl.textContent = "—";
      rl.className = "";
    } else {
      rl.textContent = (st.rateLive >= 0 ? "+" : "") + st.rateLive.toFixed(1) + " S/D";
      rl.className = "hot";
    }
    document.getElementById("rate-temp").textContent = st.temp.toFixed(1) + " °C";

    /* ④ 擒纵 2.5D */
    drawEsc(st);
  }

  MOVT.Dashboard = { build: buildDOM, update: update };
})(window.MOVT = window.MOVT || {});
