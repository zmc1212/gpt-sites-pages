/* 底部仪表盘:① 状态位 ② 步数进度 ③ 格雷码对照 ④ 规则 */
(function (MECH) {
  var D = MECH.DIM;
  var soft = "rgba(233,238,242,0.5)", faint = "rgba(233,238,242,0.16)";
  var teal = "#7FD8D8", yellow = "#E9C93C", green = "#6FBF73";

  MECH.DASH = { panels: [
    { title: "STATE · 状态位", meta: "9 环 1=在框", dot: "teal", canvasH: 100, draw: drawState },
    { title: "MOVES · 步数", meta: "341 步", dot: "blue", canvasH: 88, draw: drawMoves },
    { title: "GRAY · 格雷码", meta: "状态=G(k)", dot: "pink", canvasH: 100, draw: drawGray },
    { title: "RULE · 规则", meta: "第k环可动条件", dot: "yellow", canvasH: 66, draw: drawRule }
  ] };

  function drawState(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var n = D.N, cw = (w - 20) / n;
    for (var i = 0; i < n; i++) {
      var bit = (st.state >> (n - 1 - i)) & 1;      // 显示从环9到环1
      var on = bit === 1;
      ctx.fillStyle = on ? "#E7DCC2" : "rgba(233,238,242,0.12)";
      ctx.fillRect(10 + i * cw + 2, 12, cw - 4, 26);
      ctx.fillStyle = on ? "#3A2E1C" : soft;
      ctx.font = "700 13px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(String(n - i), 10 + i * cw + cw / 2, 31);
      ctx.fillStyle = on ? green : soft;
      ctx.font = "600 8px Menlo, monospace";
      ctx.fillText(on ? "在框" : "下", 10 + i * cw + cw / 2, 48);
    }
    ctx.fillStyle = soft; ctx.textAlign = "left";
    ctx.fillText("环号 9←1", 8, 62);
    ctx.fillText("在框 " + (st.state.toString(2).split("1").length - 1), 8, h - 5);
  }

  function drawMoves(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var f = Math.min(1, st.moveIdx / 341);
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("已走 " + st.moveIdx + " / 341 步(f(9)=⌊2¹⁰/3⌋)", 8, 14);
    ctx.strokeStyle = faint; ctx.strokeRect(8, 18, w - 16, 12);
    ctx.fillStyle = teal; ctx.fillRect(8, 18, (w - 16) * f, 12);
    /* f(n) 曲线小图 */
    var fy = 44;
    ctx.strokeStyle = "rgba(233,238,242,0.4)"; ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (var k = 1; k <= 9; k++) {
      var fx = 8 + (k - 1) / 8 * (w - 16);
      var fv = Math.floor(Math.pow(2, k + 1) / 3);
      var yy = fy + 18 - Math.min(1, fv / 341) * 16;
      if (k === 1) ctx.moveTo(fx, yy); else ctx.lineTo(fx, yy);
    }
    ctx.stroke();
    ctx.fillStyle = soft; ctx.textAlign = "left";
    ctx.fillText("f(n): 1,2,5,10,21,42,85,170,341", 8, h - 4);
  }

  function drawGray(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    /* 最近 8 步的状态序列(环 9..1 位串) */
    var x0 = 10, y0 = 12, rh = 10;
    ctx.fillStyle = soft; ctx.font = "600 7.5px Menlo, monospace"; ctx.textAlign = "left";
    ctx.fillText("步", x0 - 2, y0 + 2);
    ctx.fillText("状态(环9←1)", x0 + 30, y0 + 2);
    var cur = st.state;
    for (var i = 0; i < 8; i++) {
      var y = y0 + 10 + i * rh;
      ctx.fillStyle = i === 0 ? yellow : soft;
      var bits = "";
      for (var b = D.N - 1; b >= 0; b--) bits += ((cur >> b) & 1) ? "1" : "0";
      ctx.fillText((st.moveIdx - i > 0 ? st.moveIdx - i : 0) + "  " + bits, x0, y + 4);
      cur = grayPrev(cur);
    }
    function grayPrev(g) {
      /* 格雷码前一状态:状态 G(k)=k^(k>>1) → 前一状态 = k−1 的格雷码 */
      /* 由 g 反解 k:g=k^(k>>1) → k = g ^ (g>>1) ^ (g>>2)…(迭代) */
      var kk = g;
      var s = 1;
      while ((kk >> s) > 0) { kk = g ^ (g >> s); s++; if (s > 10) break; }
      var k = g;
      var m = k >> 1;
      while (m) { k ^= m; m >>= 1; }
      k = k - 1;
      return (k ^ (k >> 1));
    }
    ctx.fillStyle = soft; ctx.textAlign = "left";
    ctx.fillText("状态序列 = 二进制反射格雷码", 8, h - 5);
  }

  function drawRule(st, ph, pt, ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = soft; ctx.font = "600 8px sans-serif"; ctx.textAlign = "left";
    ctx.fillText("第 1 环:随时上/下框", 8, 14);
    ctx.fillText("第 k(k≥2)环:可动 ⇔ 第 k−1 环在框", 8, 28);
    ctx.fillText("　　　　　　且第 1…k−2 环全下", 8, 42);
    ctx.fillStyle = yellow; ctx.textAlign = "right";
    ctx.fillText("f(9) = 341 步", w - 8, 14);
    ctx.fillStyle = faint; ctx.textAlign = "center";
    ctx.font = "600 7.5px Menlo, monospace";
    ctx.fillText("状态序列 = 二进制反射格雷码(Gros 1872)", w / 2, h - 4);
  }
})(window.MECH = window.MECH || {});
