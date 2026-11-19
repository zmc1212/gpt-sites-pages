/* 底部五仪表盘：高度-时间曲线 · 速度/Mach/G · 姿态地平仪 · 任务事件灯 · 遥测链路 */
(function (SRTL) {
  var ctxAlt, altW, altH, ctxAtt, attW, attH;
  var dom = {};
  var EVENTS = ["LIFT-OFF", "BURNOUT", "APOGEE", "DROP", "LANDED"];
  var EV_CLASS = ["orange", "orange", "white", "teal", "green"];

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
      '<section class="panel"><header><i class="dot orange"></i><b>ALTITUDE</b><span class="meta">RADAR · 0-48 S</span></header>' +
      '<div class="body"><canvas id="c-alt"></canvas>' +
      '<div class="axis"><span>0 S</span><span>24 S</span><span>48 S</span></div></div></section>' +

      '<section class="panel"><header><i class="dot teal"></i><b>VELOCITY</b><span class="meta">MACH · ACC</span></header>' +
      '<div class="body vel-body"><div class="v-big"><b id="vel-main">0</b><small> m/s</small></div>' +
      '<div class="v-rows">' +
      '<div class="v-row"><span class="k">MACH</span><b id="vel-mach">0.00</b></div>' +
      '<div class="v-row"><span class="k">ACC</span><span class="bar"><i id="vel-gbar"></i></span><b id="vel-g">1.0 G</b></div>' +
      '<div class="v-row"><span class="k">PEAK</span><b id="vel-gmax">1.0 G</b></div>' +
      '<div class="v-row"><span class="k">PHASE</span><b id="vel-phase">PAD</b></div>' +
      '</div></div></section>' +

      '<section class="panel"><header><i class="dot blue"></i><b>ATTITUDE</b><span class="meta">PITCH · RATE</span></header>' +
      '<div class="body att-body"><canvas id="c-att"></canvas>' +
      '<div class="att-rows">' +
      '<div class="v-row"><span class="k">PITCH</span><b id="att-p">+6.0°</b></div>' +
      '<div class="v-row"><span class="k">RATE</span><b id="att-r">0.2°/s</b></div>' +
      '<div class="v-row"><span class="k">REF</span><b id="att-ref">PAD A</b></div>' +
      '</div></div></section>' +

      '<section class="panel"><header><i class="dot green"></i><b>EVENTS</b><span class="meta">MISSION SEQ</span></header>' +
      '<div class="body"><div class="ev-list" id="ev-list"></div></div></section>' +

      '<section class="panel"><header><i class="dot pink"></i><b>TELEMETRY</b><span class="meta">DOWNLINK · 40 HZ</span></header>' +
      '<div class="body tl-body"><div class="tl-hz"><b id="tl-hz">40.0</b><small> Hz · TM FRAME</small></div>' +
      '<div class="v-row"><span class="k">RSSI</span><b id="tl-rssi">−87.0 dBm</b></div>' +
      '<div class="tl-link" id="tl-link"></div>' +
      '<div class="tl-foot"><span id="tl-pkt">PKT 0000</span><span class="chip" id="tl-chip">RTS</span></div>' +
      '</div></section>';

    /* 事件灯排 */
    var evList = document.getElementById("ev-list");
    EVENTS.forEach(function (name, i) {
      var row = document.createElement("div");
      row.className = "ev";
      row.innerHTML = '<i class="ev-lamp ' + EV_CLASS[i] + '" id="ev-' + i + '"></i>' +
        '<span>' + name + '</span><b id="ev-t' + i + '">—</b>';
      evList.appendChild(row);
    });
    /* 链路条 12 格 */
    var link = document.getElementById("tl-link");
    for (var i = 0; i < 12; i++) link.appendChild(document.createElement("i"));

    var alt = mkCanvas("c-alt", 92);
    ctxAlt = alt.ctx; altW = alt.w; altH = alt.h;
    var att = mkCanvas("c-att", 92);
    ctxAtt = att.ctx; attW = att.w; attH = att.h;
    cacheDom();
  }

  function cacheDom() {
    dom = {
      vel: document.getElementById("vel-main"),
      mach: document.getElementById("vel-mach"),
      g: document.getElementById("vel-g"),
      gbar: document.getElementById("vel-gbar"),
      gmax: document.getElementById("vel-gmax"),
      vphase: document.getElementById("vel-phase"),
      attP: document.getElementById("att-p"),
      attR: document.getElementById("att-r"),
      attRef: document.getElementById("att-ref"),
      hz: document.getElementById("tl-hz"),
      rssi: document.getElementById("tl-rssi"),
      link: document.getElementById("tl-link"),
      pkt: document.getElementById("tl-pkt"),
      chip: document.getElementById("tl-chip")
    };
  }

  /* ---- 高度-时间曲线：全程淡线 + 实时亮线 + apogee 标注 ---- */
  function drawAlt(st) {
    var ctx = ctxAlt, W = altW, H = altH;
    var L = 30, R = 8, T = 10, B = 16;
    var kmH = 30;
    function X(t) { return L + (t / 48) * (W - L - R); }
    function Y(a) { return T + (1 - a / kmH) * (H - T - B); }
    ctx.fillStyle = "#0a0f16";
    ctx.fillRect(0, 0, W, H);
    /* 网格 */
    ctx.strokeStyle = "rgba(232,236,240,0.09)";
    ctx.lineWidth = 1;
    [0, 10, 20, 30].forEach(function (km) {
      ctx.beginPath(); ctx.moveTo(L, Y(km)); ctx.lineTo(W - R, Y(km)); ctx.stroke();
      ctx.fillStyle = "rgba(232,236,240,0.42)";
      ctx.font = "8px monospace";
      ctx.textAlign = "right";
      ctx.fillText(km + "", L - 4, Y(km) + 3);
    });
    for (var t = 12; t < 48; t += 12) {
      ctx.beginPath(); ctx.moveTo(X(t), T); ctx.lineTo(X(t), H - B); ctx.stroke();
    }
    /* 全程淡线 */
    ctx.strokeStyle = "rgba(232,236,240,0.2)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (var i = 0; i <= 96; i++) {
      var tt = i / 96 * 48;
      var yy = Y(SRTL.Timeline.altAt(tt));
      if (i === 0) ctx.moveTo(X(tt), yy); else ctx.lineTo(X(tt), yy);
    }
    ctx.stroke();
    /* apogee 标注 */
    ctx.strokeStyle = "rgba(242,106,27,0.45)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(L, Y(28)); ctx.lineTo(W - R, Y(28)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(242,106,27,0.85)";
    ctx.font = "8.5px monospace";
    ctx.textAlign = "right";
    ctx.fillText("APOGEE 28 KM", W - R - 2, Y(28) - 3);
    /* 实时亮线 + 游标 */
    var tc = Math.min(st.t, 48);
    if (tc > 0.1) {
      ctx.strokeStyle = "#F26A1B";
      ctx.lineWidth = 1.8;
      ctx.shadowColor = "rgba(242,106,27,0.6)";
      ctx.shadowBlur = 5;
      ctx.beginPath();
      for (var j = 0; j <= 96; j++) {
        var t2 = j / 96 * tc;
        var y2 = Y(SRTL.Timeline.altAt(t2));
        if (j === 0) ctx.moveTo(X(t2), y2); else ctx.lineTo(X(t2), y2);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#F26A1B";
      ctx.beginPath();
      ctx.arc(X(tc), Y(SRTL.Timeline.altAt(tc)), 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(232,236,240,0.55)";
    ctx.font = "8.5px monospace";
    ctx.textAlign = "left";
    ctx.fillText("T+" + (st.met >= 0 ? st.met.toFixed(1) : "—"), L + 2, T + 8);
  }

  /* ---- 姿态小地平仪：俯仰驱动地平线 + 固定机体符号 ---- */
  function drawAtt(st) {
    var ctx = ctxAtt, W = attW, H = attH;
    var cx = W / 2, cy = H / 2, r = Math.min(cx, cy) - 4;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    var off = Math.max(-r, Math.min(r, st.pitch * 1.7));
    ctx.fillStyle = "#1d2c44";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#12190f";
    ctx.fillRect(0, cy + off, W, H);
    ctx.strokeStyle = "rgba(232,236,240,0.75)";
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, cy + off); ctx.lineTo(W, cy + off); ctx.stroke();
    /* 俯仰刻度 */
    ctx.strokeStyle = "rgba(232,236,240,0.4)";
    ctx.lineWidth = 1;
    [-10, 10].forEach(function (d) {
      var y = cy + off - d * 1.7;
      ctx.beginPath(); ctx.moveTo(cx - 9, y); ctx.lineTo(cx + 9, y); ctx.stroke();
    });
    ctx.restore();
    /* 外圈 */
    ctx.strokeStyle = "rgba(232,236,240,0.3)";
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    /* 固定机体符号 */
    ctx.strokeStyle = "#F26A1B";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 12, cy); ctx.lineTo(cx - 4, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 4, cy); ctx.lineTo(cx + 12, cy); ctx.stroke();
    ctx.fillStyle = "#F26A1B";
    ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();
  }

  function update(st) {
    drawAlt(st);
    drawAtt(st);
    dom.vel.textContent = Math.abs(Math.round(st.vel));
    dom.mach.textContent = st.mach.toFixed(2);
    dom.g.textContent = st.g.toFixed(1) + " G";
    dom.gbar.style.width = Math.min(100, Math.abs(st.g) / 8 * 100) + "%";
    dom.gbar.style.background = st.g > 4 ? "#F26A1B" : "#5FB8C4";
    dom.gmax.textContent = st.gMax.toFixed(1) + " G";
    dom.vphase.textContent = st.mode;
    dom.attP.textContent = (st.pitch >= 0 ? "+" : "−") + Math.abs(st.pitch).toFixed(1) + "°";
    dom.attR.textContent = (st.rate >= 0 ? "+" : "−") + Math.abs(st.rate).toFixed(1) + "°/s";
    dom.attRef.textContent = st.phaseId === "flight" || st.phaseId === "recover" ? "TRACK" : "PAD A";
    /* 事件灯 */
    var keys = ["liftoff", "burnout", "apogee", "drop", "landed"];
    keys.forEach(function (k, i) {
      var lamp = document.getElementById("ev-" + i);
      var stamp = document.getElementById("ev-t" + i);
      var ev = st.events[k];
      var latest = st.latestEvent === k;
      lamp.classList.toggle("lit", !!ev.lit);
      lamp.classList.toggle("blink", !!ev.lit && latest && st.t - ev.at < 1.2);
      stamp.textContent = ev.lit ? ev.stamp : "—";
    });
    /* 遥测 */
    dom.hz.textContent = st.hz.toFixed(1);
    dom.hz.style.color = st.hz < 38 ? "#F26A1B" : "#E8ECF0";
    dom.rssi.textContent = "−" + Math.abs(st.rssi).toFixed(1) + " dBm";
    var cells = dom.link.children;
    for (var i = 0; i < 12; i++) {
      var on = st.link * 12 > i;
      cells[i].className = on ? (st.link > 0.55 ? "on g" : (st.link > 0.28 ? "on o" : "on r")) : "";
    }
    dom.pkt.textContent = "PKT " + String(Math.floor(st.pkt) % 10000).padStart(4, "0");
    var chip = dom.chip;
    if (st.landed) { chip.textContent = "RTN"; chip.className = "chip ok"; }
    else if (st.phaseId === "flight" || st.phaseId === "recover") { chip.textContent = "LOS · TRACK"; chip.className = "chip warn"; }
    else { chip.textContent = st.powerOn ? "RTS" : "PAD"; chip.className = "chip" + (st.powerOn ? " ok" : ""); }
  }

  SRTL.Dashboard = { build: buildDOM, update: update };
})(window.SRTL = window.SRTL || {});
