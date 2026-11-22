/* 图纸面板(B 键):巢车复原侧视总图 + 剪叉几何 + 尺寸表。 */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.38)", faint2 = "rgba(42,38,32,0.22)";
  var waterC = "#3E6E86", woodC = "#6E4E28", red = "#8C2F1E";
  var KS = MECH.KS;

  function arrowV(ctx, x, y1, y2, text, side) {
    ctx.strokeStyle = faint; ctx.fillStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
    var s = 4, dir = y2 >= y1 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x, y2); ctx.lineTo(x - 3, y2 - s * dir); ctx.lineTo(x + 3, y2 - s * dir); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x - 3, y1 + s * dir); ctx.lineTo(x + 3, y1 + s * dir); ctx.closePath(); ctx.fill();
    ctx.font = "600 9px Menlo, monospace";
    ctx.textAlign = side < 0 ? "right" : "left";
    ctx.fillText(text, x + side * 6, (y1 + y2) / 2 + 3);
  }
  function arrowH(ctx, x1, x2, y, text, below) {
    ctx.strokeStyle = faint; ctx.fillStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    var s = 4, dir = x2 >= x1 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x2, y); ctx.lineTo(x2 - s * dir, y - 3); ctx.lineTo(x2 - s * dir, y + 3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + s * dir, y - 3); ctx.lineTo(x1 + s * dir, y + 3); ctx.closePath(); ctx.fill();
    ctx.font = "600 9px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText(text, (x1 + x2) / 2, below ? y + 12 : y - 5);
  }

  MECH.BP = {
    no: "Fig. 19 · 复原总图",
    title: "巢车 · 双级剪叉升降望楼车(《武经总要》)",
    src: "《武经总要》巢车节 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("H = y0 + 2L·sinφ   ·   收绳 Δs = 2L(cos25° − cos62°) = 1.04 m   ·   圈数 = Δs/2πr = 2.07   ·   升高比 sin62/sin25 = 2.26", w * 0.03, topY - 8);

      /* —— 左:侧视图(双态) —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 3.0, (regionH - 12) / 4.0);
      var oy = topY + regionH - 1.0 * S;
      function X(m) { return ox + 0.5 * S + (m + 1.5) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(折 −25° 实 / 展 +62° 虚)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(1.6), Y(0)); ctx.lineTo(X(-1.6), Y(0)); ctx.stroke();
      /* 车体 */
      ctx.strokeRect(X(-1.05), Y(0.30), 2.10 * S, 0.42 * S);
      [[-0.62], [0.62]].forEach(function (p) {
        ctx.beginPath(); ctx.arc(X(p[0]), Y(D.wheelR), D.wheelR * S, 0, Math.PI * 2); ctx.stroke();
      });
      /* 双态剪叉 */
      function scissorSym(phiDeg, dash) {
        var p = phiDeg * Math.PI / 180;
        var s = 2 * D.L * Math.cos(p), H = D.L * Math.sin(p);
        var y0 = D.deckY + 0.10;
        var A = [0, y0], B = [s, y0], C = [s, y0 + H], Dp2 = [0, y0 + H], E = [0, y0 + 2 * H], F = [s, y0 + 2 * H];
        var segs = [A, C, B, Dp2, Dp2, F, C, E];
        ctx.setLineDash(dash ? [5, 4] : []);
        ctx.strokeStyle = dash ? faint : ink;
        ctx.lineWidth = dash ? 1.2 : 1.8;
        for (var i = 0; i < 4; i++) {
          var p1 = segs[i * 2], p2 = segs[i * 2 + 1];
          ctx.beginPath(); ctx.moveTo(X(p1[0]), Y(p1[1])); ctx.lineTo(X(p2[0]), Y(p2[1])); ctx.stroke();
        }
        ctx.strokeRect(X((E[0] + F[0]) / 2 - 0.4), Y(y0 + 2 * H + D.cabinH), 0.80 * S, D.cabinH * S);
        ctx.setLineDash([]);
        ctx.strokeStyle = ink; ctx.lineWidth = 1.3;
      }
      scissorSym(D.phi1, true);
      scissorSym(D.phi0, false);
      /* 绞盘 */
      ctx.beginPath(); ctx.arc(X(D.winchX), Y(D.winchY), 0.10 * S, 0, Math.PI * 2); ctx.stroke();
      /* 尺寸 */
      arrowV(ctx, X(-1.35), Y(D.deckY), Y(D.cabinFloor1 + D.cabinH), "展高 3.52", -1);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("实线 折叠 φ=25°(H 1.56)· 虚线 展开 φ=62°(H 2.67)", ox, chainY - 14);

      /* —— 右:升高几何 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("剪叉几何 s(φ) 与 H(φ)", rx, topY + 12);
      var gx0 = rx + 34, gw = rw - 44, gy0 = topY + 24, gh = 84;
      function xOf(s) { return gx0 + (s - 1.0) / 1.4 * gw; }
      function yOf(v) { return gy0 + (1 - v / 2.4) * gh; }
      ctx.strokeStyle = faint2; ctx.lineWidth = 1;
      ctx.strokeRect(gx0, gy0, gw, gh);
      /* H(φ) */
      ctx.strokeStyle = woodC; ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var i = 0; i <= 40; i++) {
        var phi = D.phi0 + (D.phi1 - D.phi0) * i / 40;
        var pr = phi * Math.PI / 180;
        var s = 2 * D.L * Math.cos(pr);
        var H = 2 * D.L * Math.sin(pr);
        var xx = xOf(s), yy = yOf(H);
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.font = "600 8px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("折 s 2.17", gx0 - 30, yOf(2 * D.L * Math.sin(D.phi0R)) + 3);
      ctx.fillText("展 s 1.13", gx0 + gw - 20, yOf(2 * D.L * Math.sin(D.phi1R)) - 6);
      ctx.textAlign = "center";
      ctx.fillText("滑块跨距 s →", gx0 + gw / 2, gy0 + gh + 13);

      /* —— 右下:绞盘 —— */
      var by = gy0 + gh + 36;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("绞盘收绳", rx, by - 6);
      var lines = [["Δs = 2L(cos25° − cos62°)", "= 1.04 m"], ["圈数 = Δs / 2πr", "= 2.07 圈"]];
      ctx.font = "600 8.5px sans-serif";
      lines.forEach(function (l, i) {
        ctx.fillStyle = i === 0 ? ink : red;
        ctx.fillText(l[0] + " " + l[1], rx, by + 8 + i * 14);
      });

      /* —— 底部:部件链 —— */
      var boxes = [
        ["车体轮轴", "台面 0.55"], ["立柱导轨", "双竖轨"], ["双级剪叉", "四臂 φ 25°↔62°"],
        ["望楼舱", "探窗小旗 · 升 2.26×"], ["绞盘摇柄", "收绳 1.04m"], ["绳系", "鼓 r 0.08 · 2.07 圈"]
      ];
      var bwid = (w * 0.94) / boxes.length;
      for (var b = 0; b < boxes.length; b++) {
        var bx2 = w * 0.03 + b * bwid;
        ctx.strokeStyle = ink; ctx.lineWidth = 1.2;
        ctx.strokeRect(bx2, chainY, bwid - 10, 50);
        ctx.fillStyle = ink;
        ctx.font = "700 9.5px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(boxes[b][0], bx2 + (bwid - 10) / 2, chainY + 19);
        ctx.font = "600 8px Menlo, monospace";
        ctx.fillStyle = faint;
        ctx.fillText(boxes[b][1], bx2 + (bwid - 10) / 2, chainY + 34);
        if (b < boxes.length - 1) {
          ctx.beginPath();
          ctx.moveTo(bx2 + bwid - 10, chainY + 24);
          ctx.lineTo(bx2 + bwid - 2, chainY + 24);
          ctx.stroke();
        }
      }
    },
    table:
      '<h4>车体</h4><table>' +
      '<tr><th>车体</th><td>底盘 2.10×1.30 · 四轮 r 0.30</td><td>台面 0.55 m</td></tr>' +
      '<tr><th>立柱导轨</th><td>双竖轨 h 1.60</td><td>剪叉端部限位</td></tr>' +
      '</table><h4>剪叉与绞盘</h4><table>' +
      '<tr><th>剪叉臂</th><td>L = 1.20 m · 双级四臂</td><td>φ 25°(折)↔ 62°(展)</td></tr>' +
      '<tr><th>望楼面高</th><td>H = y0 + 2L·sinφ</td><td>1.56 → 2.67 m(2.26 倍)</td></tr>' +
      '<tr><th>收绳</th><td>Δs = 2L(cos25° − cos62°)</td><td>1.04 m</td></tr>' +
      '<tr><th>绞盘</th><td>鼓 r 0.08 · 摇柄 r 0.22</td><td>2.07 圈(满升)</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>收绳 Δs = 1.04(常数式严格断言);圈数 2.07 ∈ (1.5,3);升高比 sin62/sin25 = 2.26 ∈ (2.0,2.6)。</p>' +
      '<p>运行期 errPos = 望楼舱底角世界位置 vs 解析(顶层滑块)≈ 0 —— 剪叉各铰点解析摆位端到端验证。</p>' +
      '<h4>文献</h4>' +
      '<p>《武经总要》巢车:车上立竿悬望楼如鸟巢,可升降以瞰城内虚实——本站以双级剪叉机构复原其升降原理。</p>'
  };
})(window.MECH = window.MECH || {});
