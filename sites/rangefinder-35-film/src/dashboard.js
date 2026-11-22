/* 底部五仪表盘：曝光三角 · 测光表 · 光圈叶片 · 帘幕时序 · 胶卷计数 + 黄斑双影演示卡 */
(function (RF35) {
  var el = {};
  var ctxMeter, ctxIris, ctxCurtain, ctxRf;
  var mw, mh, iw, ih, cw, ch, rw, rh;
  var cellsBuilt = false;

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
      '<section class="panel"><header><i class="dot orange"></i><b>EXPOSURE</b><span class="meta">SPEED · APERTURE · EV</span></header>' +
      '<div class="body"><div class="xrow"><span class="k">SPEED</span><b class="v" id="ex-speed">—</b><span class="strip"><i id="nd-speed"></i></span></div>' +
      '<div class="xrow"><span class="k">APERTURE</span><b class="v" id="ex-iris">—</b><span class="strip"><i id="nd-iris"></i></span></div>' +
      '<div class="xrow"><span class="k">EV <sm>ISO 400</sm></span><b class="v" id="ex-ev">—</b><span class="strip"><i id="nd-ev"></i></span></div>' +
      '<div class="xfine">SET ON DIAL · MATCH NEEDLE TO ZERO</div></div></section>' +

      '<section class="panel"><header><i class="dot silver"></i><b>METER</b><span class="meta">CDSS · INCIDENT</span></header>' +
      '<div class="body"><div class="mwrap"><canvas id="c-meter"></canvas>' +
      '<div class="mrows"><div class="r"><span>AMBIENT</span><b id="m-amb">—</b></div>' +
      '<div class="r"><span>DEV</span><b id="m-dev">—</b></div>' +
      '<span class="chip" id="m-match">MATCH</span></div></div></div></section>' +

      '<section class="panel"><header><i class="dot green"></i><b>IRIS</b><span class="meta">8 BLADES · TOP VIEW</span></header>' +
      '<div class="body"><div class="iwrap"><canvas id="c-iris"></canvas>' +
      '<div class="iright"><div class="irv" id="ir-val">f/2.0</div><div class="k">f/2 → f/16</div>' +
      '<div class="k dim" id="ir-mode">RELAXED</div></div></div></div></section>' +

      '<section class="panel"><header><i class="dot blue"></i><b>CURTAIN</b><span class="meta">1ST / 2ND TIMELINE</span></header>' +
      '<div class="body"><canvas id="c-curtain"></canvas>' +
      '<div class="ctrow"><span id="ct-slit">SLIT — MM</span><span id="ct-sweep">TRANSIT — MS</span></div></div></section>' +

      '<section class="panel"><header><i class="dot orange"></i><b>FILM</b><span class="meta">135 · 36 EXP</span></header>' +
      '<div class="body"><div class="fwrap"><div class="fc-num" id="fc-num">0</div>' +
      '<div class="fright"><div class="fc-cells" id="fc-cells"></div>' +
      '<div class="ffoot"><span class="chip" id="fc-chip">LOADING</span><b id="fc-parts">0 / 30 PARTS</b></div>' +
      '</div></div></div></section>';

    // 黄斑双影演示卡（阶段 4 显示）
    var demo = document.createElement("div");
    demo.id = "rf-demo";
    demo.hidden = true;
    demo.innerHTML =
      '<div class="k">RANGEFINDER · PATCH</div>' +
      '<canvas id="c-rf"></canvas>' +
      '<div class="rfrow"><b id="rf-range">8.00 M</b><span id="rf-status">DOUBLE IMAGE</span></div>';
    document.getElementById("sheet").appendChild(demo);

    // 36 格胶卷进度
    var cells = document.getElementById("fc-cells");
    for (var i = 0; i < 36; i++) cells.appendChild(document.createElement("i"));
    cellsBuilt = true;

    var m = mkCanvas("c-meter", 56); mw = m.w; mh = m.h; ctxMeter = m.ctx;
    var ir = mkCanvas("c-iris", 72); iw = ir.w; ih = ir.h; ctxIris = ir.ctx;
    var ct = mkCanvas("c-curtain", 58); cw = ct.w; ch = ct.h; ctxCurtain = ct.ctx;
    var rf = mkCanvas("c-rf", 130); rw = rf.w; rh = rf.h; ctxRf = rf.ctx;
    cacheDom();
  }

  /* ---- 曝光三角读数 ---- */
  function updateExposure(st) {
    var f = 2 / Math.sqrt(Math.max(0.0156, st.apT));
    var fTxt = f >= 9.7 ? "f/16" : "f/" + f.toFixed(1);
    el.speed.textContent = st.speed;
    el.iris.textContent = fTxt;
    var evTxt = "—", ev = null;
    if (st.speedSec) {
      ev = Math.log2((f * f) / st.speedSec) - Math.log2(st.iso / 100);
      evTxt = ev.toFixed(1);
    }
    el.ev.textContent = evTxt;
    // 小指针（0-100% 行程）
    var uS = st.speedSec ? Math.max(0, Math.min(1, -Math.log2(st.speedSec) / 10)) : 0;
    var uI = Math.max(0, Math.min(1, Math.log2(f / 2) / 4));
    var uE = ev === null ? 0 : Math.max(0, Math.min(1, (ev - 6) / 8));
    el.ndSpeed.style.left = (uS * 100) + "%";
    el.ndIris.style.left = (uI * 100) + "%";
    el.ndEv.style.left = (uE * 100) + "%";
    return ev;
  }

  /* ---- 测光表指针 ---- */
  function drawMeter(st, ev) {
    var ctx = ctxMeter, W = mw, H = mh;
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2, cy = H - 8, R = Math.min(W / 2 - 6, H - 14);
    ctx.fillStyle = "rgba(230,223,208,0.10)";
    ctx.beginPath(); ctx.arc(cx, cy, R + 6, Math.PI, Math.PI * 2); ctx.fill();
    // 刻度：−2.4 .. +2.4 stops
    ctx.strokeStyle = "rgba(230,223,208,0.55)";
    ctx.fillStyle = "rgba(230,223,208,0.55)";
    ctx.lineWidth = 1.4;
    ctx.font = "8px monospace"; ctx.textAlign = "center";
    for (var v = -2; v <= 2; v++) {
      var a = Math.PI + ((v + 2.4) / 4.8) * Math.PI;
      var c = Math.cos(a), s = Math.sin(a);
      ctx.beginPath();
      ctx.moveTo(cx + c * (R - 4), cy + s * (R - 4));
      ctx.lineTo(cx + c * R, cy + s * R);
      ctx.stroke();
      if (v === 0 || v === -2 || v === 2) ctx.fillText(v > 0 ? "+" + v : String(v), cx + c * (R + 8), cy + s * (R + 8) + 3);
    }
    var dev = ev === null ? Math.sin(st.time * 1.7) * 0.8
      : Math.max(-2.4, Math.min(2.4, st.ambient - ev));
    var an = Math.PI + ((dev + 2.4) / 4.8) * Math.PI;
    ctx.strokeStyle = "#C75B39";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(an) * (R - 8), cy + Math.sin(an) * (R - 8));
    ctx.stroke();
    ctx.fillStyle = "#E6DFD0";
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    el.amb.textContent = st.ambient.toFixed(1);
    el.dev.textContent = (dev >= 0 ? "+" : "") + dev.toFixed(1) + " ST";
    var ok = ev !== null && Math.abs(dev) < 0.35;
    el.match.className = "chip" + (ok ? " on" : "");
  }

  /* ---- 光圈叶片俯视（与 3D iris 同参数） ---- */
  function drawIris(st) {
    var ctx = ctxIris, W = iw, H = ih;
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2, cy = H / 2, scale = (W / 2 - 5) / 0.135;
    var phi = (1 - Math.max(0, Math.min(1, st.apT))) * 1.36;
    var apothem = 0.125 * Math.cos(phi);
    ctx.fillStyle = "#3a3b3f";
    ctx.beginPath(); ctx.arc(cx, cy, 0.135 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#101012";
    ctx.beginPath(); ctx.arc(cx, cy, Math.max(1.5, apothem * scale), 0, Math.PI * 2); ctx.fill();
    // 8 条叶片接缝（与 3D 叶片角一致）
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, 0.135 * scale, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = "rgba(220,224,230,0.65)";
    ctx.lineWidth = 1.4;
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4;
      var dx = Math.cos(a), dy = Math.sin(a);
      var px = -dy, py = dx;
      var d = apothem * scale;
      ctx.beginPath();
      ctx.moveTo(cx + dx * d + px * 40, cy + dy * d + py * 40);
      ctx.lineTo(cx + dx * d - px * 40, cy + dy * d - py * 40);
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(230,223,208,0.5)";
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, cy, 0.135 * scale, 0, Math.PI * 2); ctx.stroke();
    var f = 2 / Math.sqrt(Math.max(0.0156, st.apT));
    el.irVal.textContent = f >= 9.7 ? "f/16" : "f/" + f.toFixed(1);
    el.irMode.textContent = st.apT > 0.9 ? "WIDE OPEN" : (st.apT < 0.1 ? "STOPPED DOWN" : "SET");
  }

  /* ---- 帘幕时序图 ---- */
  function drawCurtain(st) {
    var ctx = ctxCurtain, W = cw, H = ch;
    ctx.clearRect(0, 0, W, H);
    var pad = 34;
    function fx(u) { return pad + u * (W - pad - 8); }
    function u1(x) { return (x + 0.30) / 0.60; }
    var lanes = [
      { y: 8, label: "1ST", fill: st.curtain.x1, from: "right" },
      { y: 26, label: "2ND", fill: st.curtain.y2, from: "left" }
    ];
    ctx.font = "8px monospace"; ctx.textAlign = "left";
    lanes.forEach(function (ln) {
      ctx.fillStyle = "rgba(230,223,208,0.55)";
      ctx.fillText(ln.label, 4, ln.y + 9);
      ctx.fillStyle = "rgba(230,223,208,0.12)";
      ctx.fillRect(pad, ln.y, W - pad - 8, 11);
      ctx.fillStyle = "#C9CCD1";
      if (ln.from === "right") {
        // 一帘：织物 [x1, +0.30]
        ctx.fillRect(fx(u1(ln.fill)), ln.y, fx(1) - fx(u1(ln.fill)), 11);
      } else {
        // 二帘：织物 [−0.30, y2]
        ctx.fillRect(fx(0), ln.y, fx(u1(ln.fill)) - fx(0), 11);
      }
    });
    // 缝隙标注
    var a = fx(u1(st.curtain.x1)), b = fx(u1(st.curtain.y2));
    ctx.strokeStyle = "#C75B39";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(a, 40); ctx.lineTo(a, 46); ctx.moveTo(b, 40); ctx.lineTo(b, 46);
    ctx.moveTo(Math.min(a, b), 43); ctx.lineTo(Math.max(a, b), 43);
    ctx.stroke();
    ctx.strokeStyle = "rgba(230,223,208,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(fx(0), 6); ctx.lineTo(fx(0), 48); ctx.moveTo(fx(1), 6); ctx.lineTo(fx(1), 48); ctx.stroke();
    var slitMm = Math.max(0, (st.curtain.x1 - st.curtain.y2) * 100);
    el.slit.textContent = st.curtain.sweeping ? "SLIT " + slitMm.toFixed(1) + " MM" : "SLIT CLOSED";
    el.sweep.textContent = st.curtain.sweeping ? "TRANSIT 12 MS · 1/1000" : "CURTAINS SET";
  }

  /* ---- 胶卷计数 ---- */
  function drawFilm(st) {
    el.fcNum.textContent = String(st.counter);
    var kids = el.cells.children;
    for (var i = 0; i < kids.length; i++) kids[i].className = i < st.counter ? "on" : "";
    el.fcChip.textContent = st.mode === "EXPOSED" ? "EXPOSED" : (st.mode === "COCKED" ? "READY" : "LOADING");
    el.fcChip.className = "chip" + (st.mode === "EXPOSED" ? " hot" : (st.mode === "COCKED" ? " on" : ""));
    el.fcParts.textContent = st.seated + " / " + st.partsTotal + " PARTS";
  }

  /* ---- 黄斑双影演示 ---- */
  function drawRf(st) {
    var ctx = ctxRf, W = rw, H = rh;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#EFE9DB";
    ctx.fillRect(0, 0, W, H);
    var mx = 12, my = 10;
    ctx.strokeStyle = "#26241F";
    ctx.lineWidth = 2;
    ctx.strokeRect(mx, my, W - mx * 2, H - my * 2 - 4);
    // 亮线框
    ctx.strokeStyle = "rgba(199,91,57,0.75)";
    ctx.lineWidth = 1;
    ctx.strokeRect(mx + 22, my + 14, W - mx * 2 - 44, H - my * 2 - 34);
    var cx = W / 2, gy = H - 26;
    var off = Math.max(-26, Math.min(26, (1 / 1.6 - 1 / Math.max(0.6, st.focus)) * 52));
    function lamp(x, alpha) {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#26241F";
      ctx.fillStyle = "#26241F";
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy - 52); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, gy - 58, 8, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    lamp(cx + off, 0.45);      // 测距重像
    lamp(cx, 1);               // 直取像
    // 黄斑圆
    ctx.fillStyle = "rgba(199,91,57,0.14)";
    ctx.beginPath(); ctx.arc(cx, gy - 40, 26, 0, Math.PI * 2); ctx.fill();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(199,91,57,0.8)";
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, gy - 40, 26, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    el.rfRange.textContent = st.focus.toFixed(2) + " M";
    var merged = Math.abs(off) < 1.5;
    el.rfStatus.textContent = merged ? "PATCH MERGED · 1.6 M" : "DOUBLE IMAGE";
    el.rfStatus.className = merged ? "on" : "";
  }

  function update(st, dt) {
    var ev = updateExposure(st);
    drawMeter(st, ev);
    drawIris(st);
    drawCurtain(st);
    drawFilm(st);
    if (st.rfDemo) drawRf(st);
  }

  function cacheDom() {
    el.speed = document.getElementById("ex-speed");
    el.iris = document.getElementById("ex-iris");
    el.ev = document.getElementById("ex-ev");
    el.ndSpeed = document.getElementById("nd-speed");
    el.ndIris = document.getElementById("nd-iris");
    el.ndEv = document.getElementById("nd-ev");
    el.amb = document.getElementById("m-amb");
    el.dev = document.getElementById("m-dev");
    el.match = document.getElementById("m-match");
    el.irVal = document.getElementById("ir-val");
    el.irMode = document.getElementById("ir-mode");
    el.slit = document.getElementById("ct-slit");
    el.sweep = document.getElementById("ct-sweep");
    el.fcNum = document.getElementById("fc-num");
    el.cells = document.getElementById("fc-cells");
    el.fcChip = document.getElementById("fc-chip");
    el.fcParts = document.getElementById("fc-parts");
    el.rfRange = document.getElementById("rf-range");
    el.rfStatus = document.getElementById("rf-status");
  }

  function setRfDemo(visible) {
    var d = document.getElementById("rf-demo");
    if (d) d.hidden = !visible;
  }

  RF35.Dashboard = { build: buildDOM, update: update, setRfDemo: setRfDemo, cacheDom: cacheDom };
})(window.RF35 = window.RF35 || {});
