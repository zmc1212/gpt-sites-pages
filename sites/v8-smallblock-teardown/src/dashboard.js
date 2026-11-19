/* 底部五仪表盘:转速表 · 点火顺序环 · 气门升程正时 · 油压/水温 · 活塞相位 */
(function (V8SB) {
  var el = {};
  var cv = {};      // canvas 2d 上下文与尺寸
  var fireFlash = {};
  var ORANGE = "#E8611C", RED = "#D6543A", INK = "#E6E6E4", SOFT = "rgba(230,230,228,0.55)", IN = "#9FB4C8";

  function mkCanvas(id, h) {
    var c = document.getElementById(id);
    var w = c.clientWidth || 200;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = h * dpr;
    c.style.height = h + "px";
    var ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    cv[id] = { ctx: ctx, w: w, h: h };
    return cv[id];
  }

  function buildDOM() {
    var dash = document.getElementById("dash");
    dash.innerHTML =
      '<section class="panel"><header><i class="dot orange"></i><b>TACHOMETER</b><span class="meta">0 – 6000 RPM</span></header>' +
      '<div class="body"><canvas id="c-tach"></canvas>' +
      '<div class="tach-foot"><span class="v" id="tach-v">0 <small>RPM</small></span><span class="redline">REDLINE 5500</span></div>' +
      '</div></section>' +

      '<section class="panel"><header><i class="dot red"></i><b>FIRING ORDER</b><span class="meta">1-8-4-3-6-5-7-2</span></header>' +
      '<div class="body"><canvas id="c-fire"></canvas>' +
      '<div class="axis"><span>8 CYL</span><span>CROSS-PLANE · 90° GAP</span><span>720° CYCLE</span></div>' +
      '</div></section>' +

      '<section class="panel"><header><i class="dot teal"></i><b>VALVE LIFT</b><span class="meta">IN / EX · 720°</span></header>' +
      '<div class="body"><canvas id="c-valve"></canvas>' +
      '<div class="axis"><span>0° TDC</span><span>180° BDC</span><span>360° TDC</span><span>540° BDC</span><span>720°</span></div>' +
      '</div></section>' +

      '<section class="panel"><header><i class="dot gold"></i><b>FLUIDS</b><span class="meta">OIL · COOLANT</span></header>' +
      '<div class="body">' +
      '<div class="fluid-row"><span class="k">OIL</span><span class="bar"><i id="oil-bar"></i></span><span class="val" id="oil-v">0.0 PSI</span></div>' +
      '<div class="fluid-row"><span class="k">TEMP</span><span class="bar"><i id="temp-bar"></i></span><span class="val" id="temp-v">22 °C</span></div>' +
      '<div class="fluid-foot"><span class="chip" id="oil-chip">IDLE 28 PSI</span><span id="run-time">RUN 00:00.0</span></div>' +
      '</div></section>' +

      '<section class="panel"><header><i class="dot silver"></i><b>PISTON PHASE</b><span class="meta">8 CYL · CRANK 720°</span></header>' +
      '<div class="body"><canvas id="c-pist"></canvas>' +
      '<div class="axis"><span>ROW = CYL</span><span>TOP = TDC</span><span>LINE = NOW</span></div>' +
      '</div></section>';

    mkCanvas("c-tach", 84);
    mkCanvas("c-fire", 84);
    mkCanvas("c-valve", 84);
    mkCanvas("c-pist", 84);

    el.tachV = document.getElementById("tach-v");
    el.oilBar = document.getElementById("oil-bar");
    el.tempBar = document.getElementById("temp-bar");
    el.oilV = document.getElementById("oil-v");
    el.tempV = document.getElementById("temp-v");
    el.oilChip = document.getElementById("oil-chip");
    el.runTime = document.getElementById("run-time");

    for (var i = 1; i <= 8; i++) fireFlash[i] = 0;
  }

  /* ---- ① 转速表 ---- */
  function drawTach(st) {
    var c = cv["c-tach"], ctx = c.ctx, W = c.w, H = c.h;
    var cx = W / 2, cy = H / 2 + 8, R = 31;
    var A0 = Math.PI * 0.75, A1 = Math.PI * 2.25;
    ctx.fillStyle = "#15171A";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(230,230,228,0.14)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, R, A0, A1); ctx.stroke();
    // 红区 5500+
    ctx.strokeStyle = RED;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R, A0 + (5500 / 6000) * (A1 - A0), A1);
    ctx.stroke();
    // 刻度
    for (var v = 0; v <= 6000; v += 250) {
      var a = A0 + (v / 6000) * (A1 - A0);
      var major = v % 1000 === 0;
      var r1 = R - (major ? 7 : 4);
      ctx.strokeStyle = major ? "rgba(230,230,228,0.8)" : "rgba(230,230,228,0.35)";
      ctx.lineWidth = major ? 1.6 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * (R - 1), cy + Math.sin(a) * (R - 1));
      ctx.stroke();
      if (major) {
        ctx.fillStyle = "rgba(230,230,228,0.75)";
        ctx.font = "8.5px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(v / 1000), cx + Math.cos(a) * (R - 12), cy + Math.sin(a) * (R - 12));
      }
    }
    // 指针
    var rpm = Math.max(0, Math.min(6000, st.rpm));
    var na = A0 + (rpm / 6000) * (A1 - A0);
    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = 2.4;
    ctx.shadowColor = "rgba(232,97,28,0.8)";
    ctx.shadowBlur = 7;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(na) * 6, cy - Math.sin(na) * 6);
    ctx.lineTo(cx + Math.cos(na) * (R - 6), cy + Math.sin(na) * (R - 6));
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(cx, cy, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = SOFT;
    ctx.font = "7.5px monospace";
    ctx.fillText("×1000 RPM", cx, cy + 16);
    el.tachV.innerHTML = Math.round(st.rpm) + " <small>RPM</small>";
  }

  /* ---- ② 点火顺序环形指示器 ---- */
  function drawFire(st) {
    var c = cv["c-fire"], ctx = c.ctx, W = c.w, H = c.h;
    var cx = W / 2, cy = H / 2, R = 26;
    var FO = V8SB.Engine.math.FIRE_ORDER;
    ctx.fillStyle = "#15171A";
    ctx.fillRect(0, 0, W, H);
    var cyc = st.theta % 720; if (cyc < 0) cyc += 720;
    var k = Math.floor(cyc / 90);           // 当前点火序位
    ctx.strokeStyle = "rgba(230,230,228,0.14)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    for (var j = 0; j < 8; j++) {
      var a = -Math.PI / 2 + j * Math.PI / 4;
      var x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      var cylNo = FO[j];
      var fired = j < k, cur = j === k;
      if (cur) {
        var fl = fireFlash[cylNo] || 0;
        ctx.fillStyle = fl > 0.08 ? "#FFB56A" : ORANGE;
        ctx.shadowColor = "rgba(232,97,28,0.9)";
        ctx.shadowBlur = 6 + fl * 10;
        ctx.beginPath(); ctx.arc(x, y, 5.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        // 火花标记
        if (fl > 0.05) {
          ctx.strokeStyle = "#FFD9A8";
          ctx.lineWidth = 1.2;
          for (var s = 0; s < 4; s++) {
            var sa = a + s * Math.PI / 2 + 0.4;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(sa) * 7, y + Math.sin(sa) * 7);
            ctx.lineTo(x + Math.cos(sa) * (10 + fl * 4), y + Math.sin(sa) * (10 + fl * 4));
            ctx.stroke();
          }
        }
      } else if (fired) {
        ctx.fillStyle = "rgba(232,97,28,0.4)";
        ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.strokeStyle = "rgba(230,230,228,0.3)";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = cur ? INK : SOFT;
      ctx.font = (cur ? "bold " : "") + "8px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(cylNo), cx + Math.cos(a) * (R + 11), cy + Math.sin(a) * (R + 11));
    }
    ctx.fillStyle = INK;
    ctx.font = "bold 12px monospace";
    ctx.fillText("CYL " + FO[k], cx, cy - 4);
    ctx.fillStyle = SOFT;
    ctx.font = "7.5px monospace";
    ctx.fillText("NO. " + (k + 1) + " OF 8", cx, cy + 9);
  }

  /* ---- ③ 气门升程正时图 ---- */
  function drawValve(st) {
    var c = cv["c-valve"], ctx = c.ctx, W = c.w, H = c.h;
    var x0 = 6, x1 = W - 6, y0 = 12, y1 = 66, span = x1 - x0, amp = (y1 - y0) / 2;
    var MAXL = V8SB.Engine.math.MAX_LIFT;
    ctx.fillStyle = "#15171A";
    ctx.fillRect(0, 0, W, H);
    // TDC / BDC 参考线
    [0, 180, 360, 540, 720].forEach(function (d) {
      var px = x0 + d / 720 * span;
      ctx.strokeStyle = d % 360 === 0 ? "rgba(230,230,228,0.22)" : "rgba(230,230,228,0.1)";
      ctx.setLineDash(d % 360 === 0 ? [] : [3, 3]);
      ctx.beginPath(); ctx.moveTo(px, y0); ctx.lineTo(px, y1); ctx.stroke();
    });
    ctx.setLineDash([]);
    var mid = (y0 + y1) / 2;
    // 进/排升程曲线
    function curve(fn, col) {
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      for (var px = 0; px <= span; px += 2) {
        var d = px / span * 720;
        var lift = fn(d) / MAXL;
        var y = mid - lift * amp * 0.86;
        if (px === 0) ctx.moveTo(x0 + px, y); else ctx.lineTo(x0 + px, y);
      }
      ctx.stroke();
    }
    curve(function (d) { return V8SB.Engine.math.liftIntake(d); }, IN);
    curve(function (d) { return V8SB.Engine.math.liftExhaust(d); }, ORANGE);
    // 图例
    ctx.font = "8px monospace";
    ctx.fillStyle = IN;
    ctx.fillText("IN", x0 + 450 / 720 * span - 6, y0 + 6);
    ctx.fillStyle = ORANGE;
    ctx.fillText("EX", x0 + 270 / 720 * span - 6, y0 + 6);
    // 运行光标(1 缸周期)
    var c1 = V8SB.Engine.math.cyclePos(1, st.theta);
    var cxp = x0 + c1 / 720 * span;
    ctx.strokeStyle = "rgba(230,230,228,0.75)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cxp, y0 - 4); ctx.lineTo(cxp, y1); ctx.stroke();
    var li = V8SB.Engine.math.liftIntake(c1) / MAXL, le = V8SB.Engine.math.liftExhaust(c1) / MAXL;
    ctx.fillStyle = IN;
    ctx.beginPath(); ctx.arc(cxp, mid - li * amp * 0.86, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ORANGE;
    ctx.beginPath(); ctx.arc(cxp, mid - le * amp * 0.86, 2.6, 0, Math.PI * 2); ctx.fill();
  }

  /* ---- ④ 油压 / 水温 ---- */
  function drawFluids(st, dt) {
    el.oilBar.style.width = Math.max(0, Math.min(100, st.oil / 60 * 100)) + "%";
    el.oilBar.style.background = st.oil > 8 ? ORANGE : "rgba(230,230,228,0.3)";
    el.tempBar.style.width = Math.max(0, Math.min(100, (st.temp - 20) / 100 * 100)) + "%";
    el.tempBar.style.background = st.temp > 70 ? "#7FD0C8" : "rgba(230,230,228,0.3)";
    el.oilV.textContent = st.oil.toFixed(1) + " PSI";
    el.tempV.textContent = st.temp.toFixed(0) + " °C";
    el.oilChip.className = "chip" + (st.blip ? " hot" : (st.mode === "IDLE" ? " on" : ""));
    el.oilChip.textContent = st.blip ? "BLIP 4500" : "IDLE 28 PSI";
    var rt = st.runTime || 0;
    var mm = String(Math.floor(rt / 60)).padStart(2, "0");
    var ss = String(Math.floor(rt % 60)).padStart(2, "0");
    var ds = Math.floor((rt % 1) * 10);
    el.runTime.textContent = "RUN " + mm + ":" + ss + "." + ds;
  }

  /* ---- ⑤ 活塞相位图 ---- */
  function drawPist(st) {
    var c = cv["c-pist"], ctx = c.ctx, W = c.w, H = c.h;
    var x0 = 14, x1 = W - 6, span = x1 - x0;
    var m = V8SB.Engine.math;
    ctx.fillStyle = "#15171A";
    ctx.fillRect(0, 0, W, H);
    var cyc = st.theta % 720; if (cyc < 0) cyc += 720;
    var k = Math.floor(cyc / 90);
    var curCyl = m.FIRE_ORDER[k];
    var rowH = (H - 10) / 8;
    for (var r = 0; r < 8; r++) {
      var cylNo = r + 1;
      var yBase = 6 + r * rowH + rowH * 0.86;
      ctx.strokeStyle = cylNo === curCyl ? ORANGE : "rgba(184,188,194,0.5)";
      ctx.lineWidth = cylNo === curCyl ? 1.5 : 1;
      ctx.beginPath();
      for (var px = 0; px <= span; px += 4) {
        var d = px / span * 720;
        var n = (m.pistonS(m.cylAlpha(cylNo, d)) - (m.ROD_L - m.CRANK_R)) / (2 * m.CRANK_R);
        var y = yBase - n * rowH * 0.74;
        if (px === 0) ctx.moveTo(x0 + px, y); else ctx.lineTo(x0 + px, y);
      }
      ctx.stroke();
      ctx.fillStyle = cylNo === curCyl ? ORANGE : SOFT;
      ctx.font = "7.5px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(String(cylNo), 4, yBase - rowH * 0.3);
    }
    // 当前相位竖线
    var sx = x0 + cyc / 720 * span;
    ctx.strokeStyle = "rgba(230,230,228,0.65)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx, 4); ctx.lineTo(sx, H - 4); ctx.stroke();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.moveTo(sx - 3, 2); ctx.lineTo(sx + 3, 2); ctx.lineTo(sx, 7);
    ctx.closePath(); ctx.fill();
  }

  function update(st, dt) {
    for (var i = 1; i <= 8; i++) {
      if (fireFlash[i] > 0.001) fireFlash[i] *= Math.exp(-dt * 3.2);
    }
    drawTach(st);
    drawFire(st);
    drawValve(st);
    drawFluids(st, dt);
    drawPist(st);
  }

  V8SB.Dashboard = {
    build: buildDOM,
    update: update,
    pulse: function (cyl) { fireFlash[cyl] = 1; }
  };
})(window.V8SB = window.V8SB || {});
