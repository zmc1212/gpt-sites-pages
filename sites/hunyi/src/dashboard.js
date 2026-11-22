/* 底部仪表盘:① POLAR 极轴 ② ALPHA 三辰转角 ③ AIM 窥管指向 ④ CYCLE 阶段时序 */
(function (MECH) {
  var el = {};
  var D = MECH.DIM, KS = MECH.KS;
  var soft = "rgba(233,238,242,0.45)", faint = "rgba(233,238,242,0.16)";
  var yellow = "#E9C93C", teal = "#7FD8D8", red = "#D6543A";
  var bronze = "#B08D57";

  var STARTS = (function () {
    var acc = 0, arr = [];
    MECH.PHASES.forEach(function (ph) { arr.push(acc); acc += ph.dur; });
    arr.total = acc;
    return arr;
  })();

  MECH.DASH = { panels: [
    { title: "POLAR · 极轴", meta: "T = 90°−39.9° = 50.1°", dot: "yellow", canvasH: 104,
      draw: drawPolar },
    { title: "ALPHA · 三辰转角", meta: "绕极轴周天", dot: "green",
      html: '<div class="big" id="d-a">0°</div><div class="k">转角 α(360° 一周天)</div><div class="chip" id="d-chip">—</div>',
      canvasH: 84, init: initAlpha, draw: drawAlpha },
    { title: "AIM · 窥管指向", meta: "δ +38.8° 织女", dot: "blue", canvasH: 108,
      draw: drawAim },
    { title: "CYCLE · 阶段时序", meta: "48.5s 自动循环", dot: "orange", canvasH: 66,
      draw: drawCycle }
  ] };

  function initAlpha(sec) {
    el.a = sec.querySelector("#d-a");
    el.chip = sec.querySelector("#d-chip");
  }

  /* ① 极轴侧视:地平线 + 极轴倾角 50.1° + 天极方向 */
  function drawPolar(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, gy = h * 0.72, L = h * 0.58;
    /* 地平线 */
    ctx.strokeStyle = soft; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(10, gy); ctx.lineTo(w - 10, gy); ctx.stroke();
    /* 极轴(倾 50.1° 朝北) */
    var T = D.Trad;
    var dx = Math.sin(0) * 0, dy = 0;
    var nx = cx, ny = gy - Math.sin(T) * L;
    ctx.strokeStyle = yellow; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(nx, ny); ctx.stroke();
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(nx, ny, 5, 0, Math.PI * 2); ctx.fill();
    /* 角度弧 */
    ctx.strokeStyle = faint;
    ctx.beginPath(); ctx.arc(cx, gy, L * 0.42, -T, 0); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("北 · 天极", nx + 6, ny - 2);
    ctx.fillText("T = 50.1°", cx + 12, gy - 8);
    ctx.fillText("地平", w - 40, gy - 6);
    /* 黄道极(23.5° 偏离) */
    var ex = cx, ey = gy - Math.sin(D.Trad + D.obliq * Math.PI / 180) * L;
    ctx.strokeStyle = teal;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = teal;
    ctx.fillText("黄极 23.5°", ex + 6, ey + 4);
  }

  /* ② 转角读数 + 圆周刻度 */
  function drawAlpha(st, ph, pt, ctx, w, h) {
    var a = st.alpha || 0;
    if (el.a) {
      var degv = KS.deg(a) % 360;
      el.a.textContent = degv.toFixed(0) + "°";
    }
    if (el.chip) {
      var turning = ph.id === "turn";
      el.chip.textContent = st.aiming ? "对准织女星" : (turning ? "周天运转中" : "静止");
      el.chip.className = "chip " + (st.aiming ? "on" : (turning ? "hot" : ""));
    }
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.55, R = Math.min(w, h) * 0.34;
    ctx.strokeStyle = soft; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < 12; i++) {
      var ang = i / 12 * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * R * 0.92, cy + Math.sin(ang) * R * 0.92);
      ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
      ctx.stroke();
    }
    var aa = a - Math.PI / 2;
    ctx.strokeStyle = yellow; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(aa) * R * 0.86, cy + Math.sin(aa) * R * 0.86);
    ctx.stroke();
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(cx + Math.cos(aa) * R * 0.86, cy + Math.sin(aa) * R * 0.86, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("二至圈法向 m(α)", cx, cy + R + 14);
  }

  /* ③ 窥管指向:天球赤道坐标网 + 指向点 */
  function drawAim(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var cx = w * 0.5, cy = h * 0.5, R = Math.min(w, h) * 0.40;
    /* 赤纬圈(δ −60..+80) */
    ctx.strokeStyle = faint; ctx.lineWidth = 1;
    for (var dd = -60; dd <= 80; dd += 20) {
      var y = cy - Math.sin(D.Trad + dd * Math.PI / 180) * R * 0.9;
      ctx.beginPath(); ctx.moveTo(cx - R * 0.9, y); ctx.lineTo(cx + R * 0.9, y); ctx.stroke();
    }
    /* 织女星位置(α 280°, δ 38.8°) */
    var vx = cx + Math.sin(D.alphaVega) * R * 0.72;
    var vy = cy - Math.sin(D.Trad + D.deltaVega) * R * 0.9;
    /* 当前窥管指向点(α, δ) */
    var px = cx + Math.sin(st.alpha || 0) * R * 0.72;
    var py = cy - Math.sin(D.Trad + (st.delta || 0)) * R * 0.9;
    ctx.strokeStyle = soft;
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = yellow;
    ctx.beginPath(); ctx.arc(px, py, 3.4, 0, Math.PI * 2); ctx.fill();
    /* 织女星 */
    ctx.fillStyle = st.aiming ? yellow : soft;
    ctx.beginPath(); ctx.arc(vx, vy, st.aiming ? 5 : 3, 0, Math.PI * 2); ctx.fill();
    ctx.font = "600 8px sans-serif"; ctx.textAlign = "left";
    ctx.fillText("织女星", vx + 8, vy + 3);
    ctx.fillStyle = soft;
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.fillText("δ +38.8°", vx + 8, vy + 14);
    ctx.textAlign = "center";
    ctx.fillText("赤纬圈(天球展开)", cx, cy + R + 16);
  }

  /* ④ 阶段时序 */
  function drawCycle(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var total = STARTS.total, x0 = 4, ww = w - 8;
    var idx = MECH.PHASES.indexOf(ph);
    var gt = STARTS[idx] + pt;
    var y1 = 6, hh1 = 18;
    MECH.PHASES.forEach(function (p, i) {
      var x = x0 + STARTS[i] / total * ww, seg = p.dur / total * ww;
      ctx.fillStyle = i === idx ? "rgba(233,201,60,0.30)" : "rgba(233,238,242,0.10)";
      ctx.fillRect(x, y1, seg - 1.5, hh1);
      ctx.strokeStyle = i === idx ? yellow : faint;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y1, seg - 1.5, hh1);
      ctx.fillStyle = i === idx ? yellow : soft;
      ctx.font = "600 7.5px Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(i + 1), x + seg / 2 - 0.75, y1 + hh1 / 2 + 3);
    });
    var gx = x0 + gt / total * ww;
    ctx.strokeStyle = "#E9EEF2"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(gx, y1 - 3); ctx.lineTo(gx, y1 + hh1 + 3); ctx.stroke();
    ctx.fillStyle = soft;
    ctx.font = "600 7px Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("t=" + gt.toFixed(1) + "s / " + total.toFixed(1) + "s", x0, y1 + hh1 + 14);
    ctx.textAlign = "right";
    ctx.fillText("α " + KS.deg(st.alpha || 0).toFixed(0) + "°", x0 + ww, y1 + hh1 + 14);
  }
})(window.MECH = window.MECH || {});
