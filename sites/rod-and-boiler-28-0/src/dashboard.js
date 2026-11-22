/* 底部五仪表:锅炉压力表 / 速度 / 鞲鞴相位 / 轮杆联动简图 / 排汽节奏 */
(function (ST28) {
  var el = {};
  var ctxPres, ctxPist, ctxRod, ctxPuff;
  var W = {}, H = {};
  var presFace = null;   // 预渲染表盘

  function mkCanvas(id, h) {
    var c = document.getElementById(id);
    var w = c.clientWidth || 160;
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
      '<section class="panel"><header><i class="dot red"></i><b>BOILER</b><span class="meta">0-18 BAR · RED 14+</span></header>' +
      '<div class="body p-pres-body"><canvas id="c-pres"></canvas>' +
      '<div class="pres-side"><div class="big" id="pres-num">0.0</div><div class="k">BAR</div>' +
      '<div class="chip" id="pres-chip">COLD</div><div class="mini">SAFETY LIFTS 14.2</div></div></div></section>' +

      '<section class="panel"><header><i class="dot teal"></i><b>SPEED</b><span class="meta">DRIVER TACH</span></header>' +
      '<div class="body"><div class="big" id="spd-num">0.0</div><div class="k">MPH</div>' +
      '<div class="bar"><i id="spd-bar"></i></div>' +
      '<div class="rowline"><span>DRIVERS</span><b id="spd-rpm">0 RPM</b></div></div></section>' +

      '<section class="panel"><header><i class="dot blue"></i><b>PISTON</b><span class="meta">L/R · QUARTERED 90°</span></header>' +
      '<div class="body"><canvas id="c-pist"></canvas>' +
      '<div class="axis"><span class="lg L">L φ=0</span><span>θ 0 → 2π</span><span class="lg R">R φ=90°</span></div></div></section>' +

      '<section class="panel"><header><i class="dot yellow"></i><b>ROD PLAN</b><span class="meta">SIDE A · LIVE</span></header>' +
      '<div class="body"><canvas id="c-rod"></canvas></div></section>' +

      '<section class="panel"><header><i class="dot green"></i><b>EXHAUST</b><span class="meta">4 PUFFS / REV</span></header>' +
      '<div class="body"><div class="big" id="puff-num">0</div><div class="k">PUFFS / MIN</div>' +
      '<canvas id="c-puff"></canvas></div></section>';

    var pres = mkCanvas("c-pres", 88);
    ctxPres = pres.ctx; W.pres = pres.w; H.pres = pres.h;
    presFace = document.createElement("canvas");
    presFace.width = 128; presFace.height = 128;
    ST28.Textures.gaugeFaceDraw(presFace.getContext("2d"), 128);
    var pist = mkCanvas("c-pist", 84);
    ctxPist = pist.ctx; W.pist = pist.w; H.pist = pist.h;
    var rod = mkCanvas("c-rod", 84);
    ctxRod = rod.ctx; W.rod = rod.w; H.rod = rod.h;
    var puff = mkCanvas("c-puff", 40);
    ctxPuff = puff.ctx; W.puff = puff.w; H.puff = puff.h;

    el.presNum = document.getElementById("pres-num");
    el.presChip = document.getElementById("pres-chip");
    el.spdNum = document.getElementById("spd-num");
    el.spdBar = document.getElementById("spd-bar");
    el.spdRpm = document.getElementById("spd-rpm");
    el.puffNum = document.getElementById("puff-num");
  }

  /* ① 锅炉压力表(经典圆盘 + 实时指针) */
  function drawPres(p, pop) {
    var ctx = ctxPres, s = Math.min(W.pres, H.pres);
    ctx.clearRect(0, 0, W.pres, H.pres);
    ctx.drawImage(presFace, 0, 0, s, s);
    var cx = s / 2, cy = s / 2;
    var a = (135 + Math.max(0, Math.min(18, p)) / 18 * 270) * Math.PI / 180;
    ctx.strokeStyle = pop ? "#D6543A" : "#23252A";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * s * 0.34, cy + Math.sin(a) * s * 0.34);
    ctx.stroke();
    ctx.fillStyle = "#8C2F39";
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.045, 0, Math.PI * 2); ctx.fill();
  }

  /* ② 速度读数 + 条 */
  function drawSpeed(st) {
    el.spdNum.textContent = st.speed.toFixed(1);
    el.spdBar.style.width = Math.min(100, st.speed / 30 * 100) + "%";
    el.spdRpm.textContent = Math.round(st.rpm) + " RPM";
  }

  /* ③ 鞲鞴相位:左右汽缸双曲线 + 当前相位游标 */
  function drawPist(theta) {
    var ctx = ctxPist, Wc = W.pist, Hc = H.pist;
    var G = ST28.GEAR;
    ctx.fillStyle = "#0B1B2C";
    ctx.fillRect(0, 0, Wc, Hc);
    ctx.strokeStyle = "rgba(233,238,242,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, Hc / 2); ctx.lineTo(Wc, Hc / 2); ctx.stroke();
    for (var gx = 1; gx < 4; gx++) {
      ctx.beginPath(); ctx.moveTo(Wc * gx / 4, 2); ctx.lineTo(Wc * gx / 4, Hc - 2); ctx.stroke();
    }
    function curve(phi, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var i = 0; i <= 90; i++) {
        var psi = i / 90 * Math.PI * 2;
        var d = (G.pistonD(psi) - G.D.L) / (2 * G.D.r);      // 归一 −1..1
        var x = i / 90 * Wc;
        var y = Hc / 2 - d * Hc * 0.36;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    curve(0, "#B08D57");
    curve(Math.PI / 2, "#7FD8D8");
    var psiNow = ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    var xx = psiNow / (Math.PI * 2) * Wc;
    ctx.strokeStyle = "rgba(233,238,242,0.55)";
    ctx.beginPath(); ctx.moveTo(xx, 2); ctx.lineTo(xx, Hc - 2); ctx.stroke();
    [["#B08D57", 0], ["#7FD8D8", Math.PI / 2]].forEach(function (cfg) {
      var d = (G.pistonD(psiNow + cfg[1]) - G.D.L) / (2 * G.D.r);
      ctx.fillStyle = cfg[0];
      ctx.beginPath();
      ctx.arc(xx, Hc / 2 - d * Hc * 0.36, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ④ 轮杆联动侧视简图(与 3D 同相位):轮圈 + 曲拐 + 主连杆 + 十字头 */
  function drawRodPlan(theta) {
    var ctx = ctxRod, Wc = W.rod, Hc = H.rod;
    var G = ST28.GEAR, D = G.D;
    var psi = theta;                                  // A 侧 φ=0
    var rw = Hc * 0.32;
    var k = rw / D.R;
    var ax = Wc * 0.26, ay = Hc * 0.60;
    ctx.fillStyle = "#0B1B2C";
    ctx.fillRect(0, 0, Wc, Hc);
    ctx.strokeStyle = "rgba(233,238,242,0.35)";
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(ax, ay, rw, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(233,238,242,0.14)";
    for (var i = 0; i < 6; i++) {
      var a = theta + i / 6 * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + Math.cos(a) * rw, ay - Math.sin(a) * rw);
      ctx.stroke();
    }
    // 第二条动轮 + 结合杆示意
    var ax2 = ax + D.spacing * k;
    ctx.strokeStyle = "rgba(233,238,242,0.16)";
    ctx.beginPath(); ctx.arc(ax2, ay, rw, 0, Math.PI * 2); ctx.stroke();
    var pinX = ax + D.r * k * Math.cos(psi), pinY = ay - D.r * k * Math.sin(psi);
    var pin2X = ax2 + D.r * k * Math.cos(psi), pin2Y = ay - D.r * k * Math.sin(psi);
    ctx.strokeStyle = "rgba(176,141,87,0.55)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(pinX, pinY); ctx.lineTo(pin2X, pin2Y); ctx.stroke();
    // 十字头导路 + 汽缸余隙
    var chX = ax + G.pistonD(psi) * k;
    ctx.strokeStyle = "rgba(233,238,242,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ax + (D.L - D.r - 0.12) * k, ay);
    ctx.lineTo(ax + (D.L + D.r + 0.5) * k, ay);
    ctx.stroke();
    // 主连杆(黄铜) + 曲拐(红)
    ctx.strokeStyle = "#B08D57";
    ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(pinX, pinY); ctx.lineTo(chX, ay); ctx.stroke();
    ctx.strokeStyle = "#D6543A";
    ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(pinX, pinY); ctx.stroke();
    ctx.fillStyle = "#D6543A";
    ctx.beginPath(); ctx.arc(pinX, pinY, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#7FD8D8";
    ctx.fillRect(chX - 5, ay - 4.5, 10, 9);
    ctx.fillStyle = "rgba(233,238,242,0.4)";
    ctx.font = "8px monospace";
    ctx.fillText("ψ " + Math.round(((psi % (Math.PI * 2)) * 180 / Math.PI + 360) % 360) + "°", 6, 10);
  }

  /* ⑤ 排汽脉冲条 */
  function drawPuff(st) {
    var ctx = ctxPuff, Wc = W.puff, Hc = H.puff;
    ctx.fillStyle = "#0B1B2C";
    ctx.fillRect(0, 0, Wc, Hc);
    var since = st.time - st.lastPuff;
    var hgt = Math.exp(-Math.max(0, since) * 4.5);
    ctx.fillStyle = "rgba(111,191,115,0.28)";
    ctx.fillRect(0, 0, Wc, Hc);
    ctx.fillStyle = "#6FBF73";
    ctx.fillRect(0, Hc - hgt * (Hc - 2), Wc * 0.32, hgt * (Hc - 2));
    ctx.fillStyle = "rgba(233,238,242,0.35)";
    ctx.font = "8px monospace";
    ctx.fillText(st.puffs + " PUFFS", Wc * 0.40, Hc / 2 + 3);
  }

  function update(st) {
    drawPres(st.pressure, st.pop);
    el.presNum.textContent = st.pressure.toFixed(1);
    var chip = "COLD", cls = "chip";
    if (st.pop) { chip = "LIFTED"; cls = "chip hot"; }
    else if (st.phaseId === "steam" && st.pressure > 0.3) { chip = "CHARGING"; cls = "chip warn"; }
    else if (st.pressure >= 13.5) { chip = "RAISED"; cls = "chip on"; }
    el.presChip.textContent = chip;
    el.presChip.className = cls;
    drawSpeed(st);
    drawPist(st.theta);
    drawRodPlan(st.theta);
    drawPuff(st);
    el.puffNum.textContent = String(Math.round(st.puffRate));
  }

  ST28.Dashboard = { build: buildDOM, update: update };
})(window.ST28 = window.ST28 || {});
