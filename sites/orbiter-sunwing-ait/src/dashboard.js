/* 底部五仪表盘:母线电源 · 太阳翼功率曲线 · 姿态ADCS · 热控 · 展开角度计 */
(function (ORBW) {
  var ctxArr, arrW, arrH;
  var $id = function (id) { return document.getElementById(id); };

  function mkCanvas(id, h) {
    var c = $id(id);
    var w = c.clientWidth || 200;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = h * dpr;
    c.style.height = h + "px";
    var ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: w, h: h };
  }

  function buildDOM() {
    var dash = $id("dash");
    dash.innerHTML =
      '<section class="panel"><header><i class="dot teal"></i><b>BUS POWER</b><span class="meta">28 V · EI-B</span></header>' +
      '<div class="body"><div class="bigv"><span class="v" id="bus-v">—<small> V</small></span></div>' +
      '<div class="bus-row"><span>LOAD</span><span class="bar"><i id="bus-bar"></i></span><span class="amp" id="bus-a">0.00 A</span></div>' +
      '<div class="chips"><span class="chip" id="ch-gnd">GND PWR</span><span class="chip" id="ch-bus">BUS ON</span><span class="chip" id="ch-self">SELF-TEST</span></div>' +
      '</div></section>' +

      '<section class="panel"><header><i class="dot gold"></i><b>SOLAR ARRAYS</b><span class="meta">2 WING · 8 PANELS</span></header>' +
      '<div class="body"><canvas id="c-arr"></canvas>' +
      '<div class="arr-foot"><span class="cap" id="arr-cap">ARRAY OUTPUT · W</span><span class="chip" id="ch-arr">PANELS 8/8</span></div>' +
      '</div></section>' +

      '<section class="panel"><header><i class="dot blue"></i><b>ADCS</b><span class="meta">QUAT · RATE · RW ×4</span></header>' +
      '<div class="body"><div id="p-adcs-wrap" style="display:flex;gap:10px;">' +
      '<div class="qcol">' +
      '<div class="qrow"><span>q0</span><b id="q0">+0.0000</b></div>' +
      '<div class="qrow"><span>q1</span><b id="q1">+0.0000</b></div>' +
      '<div class="qrow"><span>q2</span><b id="q2">+0.0000</b></div>' +
      '<div class="qrow"><span>q3</span><b id="q3">+0.0000</b></div>' +
      '<div class="omega">ω <b id="ad-w">0.00</b> °/s</div>' +
      '</div>' +
      '<div class="wheels"><div class="k">WHEEL SPEED</div>' +
      '<div class="wbar"><span class="name">RW1</span><span class="bar"><i id="wb-0"></i></span><span class="rpm" id="wr-0">0</span></div>' +
      '<div class="wbar"><span class="name">RW2</span><span class="bar"><i id="wb-1"></i></span><span class="rpm" id="wr-1">0</span></div>' +
      '<div class="wbar"><span class="name">RW3</span><span class="bar"><i id="wb-2"></i></span><span class="rpm" id="wr-2">0</span></div>' +
      '<div class="wbar"><span class="name">RW4</span><span class="bar"><i id="wb-3"></i></span><span class="rpm" id="wr-3">0</span></div>' +
      '</div></div></div></section>' +

      '<section class="panel"><header><i class="dot green"></i><b>THERMAL</b><span class="meta">-10 … +45 °C</span></header>' +
      '<div class="body"><div class="therm">' +
      '<div class="trow"><span class="name">PLATFORM</span><span class="bar"><i id="tb-0"></i></span><span class="val" id="tv-0">— °C</span></div>' +
      '<div class="trow"><span class="name">BATTERY</span><span class="bar"><i id="tb-1"></i></span><span class="val" id="tv-1">— °C</span></div>' +
      '<div class="trow"><span class="name">PROPULSION</span><span class="bar"><i id="tb-2"></i></span><span class="val" id="tv-2">— °C</span></div>' +
      '</div><div class="therm-cap"><span>-10</span><span>+18</span><span>+45</span></div>' +
      '</div></section>' +

      '<section class="panel"><header><i class="dot pink"></i><b>DEPLOY</b><span class="meta">HINGE UNFOLD · ×90° ×8</span></header>' +
      '<div class="body">' +
      '<div class="dep-row"><span class="name">PORT</span><span class="bar"><i id="dep-l"></i></span><span class="deg" id="dep-lv">0°</span></div>' +
      '<div class="dep-row"><span class="name">STBD</span><span class="bar"><i id="dep-r"></i></span><span class="deg" id="dep-rv">0°</span></div>' +
      '<div class="dep-foot"><span class="chip" id="ch-pyro">PYRO SAFE</span><span class="chip" id="ch-hinge">HINGE 0/8</span>' +
      '<span class="seq" id="dep-seq">STOWED</span></div>' +
      '</div></section>';

    var arr = mkCanvas("c-arr", 62);
    ctxArr = arr.ctx; arrW = arr.w; arrH = arr.h;
  }

  /* 功率实时曲线 */
  function drawCurve(hist, maxW) {
    var ctx = ctxArr, W = arrW, H = arrH;
    ctx.fillStyle = "#0c1424";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(201,162,39,0.18)";
    ctx.lineWidth = 1;
    for (var gx = 1; gx < 4; gx++) {
      ctx.beginPath(); ctx.moveTo(W * gx / 4, 0); ctx.lineTo(W * gx / 4, H); ctx.stroke();
    }
    for (var gy = 1; gy < 3; gy++) {
      ctx.beginPath(); ctx.moveTo(0, H * gy / 3); ctx.lineTo(W, H * gy / 3); ctx.stroke();
    }
    if (!hist || hist.length < 2) return;
    var n = hist.length;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (var i = 0; i < n; i++) {
      var x = i / (n - 1) * W;
      var y = H - Math.min(1, hist[i] / maxW) * (H - 6) - 2;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = "rgba(201,162,39,0.16)";
    ctx.fill();
    ctx.beginPath();
    for (var j = 0; j < n; j++) {
      var x2 = j / (n - 1) * W;
      var y2 = H - Math.min(1, hist[j] / maxW) * (H - 6) - 2;
      if (j === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
    }
    ctx.strokeStyle = "#d9b23a";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function fmtQ(v) {
    return (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(4);
  }

  function update(st, dt) {
    /* BUS POWER */
    $id("bus-v").innerHTML = (st.busV > 0 ? st.busV.toFixed(1) : "—") + "<small> V</small>";
    var bar = $id("bus-bar");
    bar.style.width = Math.min(100, st.busA / 6 * 100) + "%";
    $id("bus-a").textContent = st.busA.toFixed(2) + " A";
    $id("ch-gnd").className = "chip" + (st.phaseIdx <= 1 ? " on" : "");
    $id("ch-bus").className = "chip" + (st.busV > 27.5 ? " on" : "");
    $id("ch-self").className = "chip" + (st.selfTest ? " on" : "");

    /* SOLAR ARRAYS */
    drawCurve(st.arrHist, 1300);
    $id("ch-arr").className = "chip" + (st.wingAng[0] > 5 ? " gold" : "");
    $id("arr-cap").textContent = st.phaseIdx >= 7 ? "ARRAY OUTPUT · SUN-POINTING" : "ARRAY OUTPUT · W";

    /* ADCS */
    for (var q = 0; q < 4; q++) $id("q" + q).textContent = fmtQ(st.quat[q]);
    $id("ad-w").textContent = st.omega.toFixed(2);
    for (var w = 0; w < 4; w++) {
      var rpm = st.rpm[w] || 0;
      $id("wb-" + w).style.width = Math.min(100, rpm / 2600 * 100) + "%";
      $id("wr-" + w).textContent = rpm;
    }

    /* THERMAL */
    for (var t = 0; t < 3; t++) {
      var v = st.temps[t];
      $id("tb-" + t).style.width = Math.max(0, Math.min(100, (v + 10) / 55 * 100)) + "%";
      $id("tv-" + t).textContent = v.toFixed(1) + " °C";
    }

    /* DEPLOY */
    $id("dep-l").style.width = (st.wingAng[0] / 180 * 100) + "%";
    $id("dep-r").style.width = (st.wingAng[1] / 180 * 100) + "%";
    $id("dep-lv").textContent = Math.round(st.wingAng[0]) + "°";
    $id("dep-rv").textContent = Math.round(st.wingAng[1]) + "°";
    var py = $id("ch-pyro");
    py.textContent = "PYRO " + st.pyroState;
    py.className = "chip" + (st.pyroState === "FIRED" ? " fire" : (st.pyroState === "ARMED" ? " arm" : ""));
    $id("ch-hinge").textContent = "HINGE " + st.hingeDone + "/8";
    var seq = $id("dep-seq");
    if (st.wingAng[0] >= 179 && st.wingAng[1] >= 179) seq.textContent = st.phaseIdx >= 7 ? "FULLY DEPLOYED · SUN-POINTING" : "FULLY DEPLOYED";
    else if (st.hingeDone > 0) seq.textContent = "UNFOLDING " + (st.hingeDone + 1) + "/8";
    else seq.textContent = st.phaseIdx >= 5 ? "STOWED · HOLD-DOWN" : "NOT INSTALLED";
  }

  ORBW.Dashboard = { build: buildDOM, update: update };
})(window.ORBW = window.ORBW || {});
