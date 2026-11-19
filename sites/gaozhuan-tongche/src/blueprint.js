/* 图纸面板(B 键):高转筒车复原侧视总图 + 链行程图 + 传动图 + 部件链 + 尺寸表。
   分区:顶部公式横幅 / 左侧视(大)/ 右列(链行程 + 传动)/ 底部部件链,互不重叠。 */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.38)", faint2 = "rgba(42,38,32,0.22)";
  var waterC = "#3E6E86", woodC = "#6E4E28", red = "#8C2F1E";

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
    no: "Fig. 04 · 复原总图",
    title: "高转筒车 · 双链轮高扬程刮板链(王祯《农书》)",
    src: "王祯《农书·灌溉图说》「上轮下轮俱系轮辋,周而复始」 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("链速 v = ω·R = 0.9 × 0.50 = 0.45 m/s   ·   链全长 9.80m · 板距 0.70m ×14   ·   提水高 3.33m", w * 0.03, topY - 8);

      /* —— 左:侧视图 —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 5.6, (regionH - 10) / 4.9);
      var oy = topY + regionH - 0.6 * S;
      function X(m) { return ox + 0.3 * S + (1.3 - m) * S; }   // m 为 x(西小大),东 → 右
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(西 · 溪渠 → 右东)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(1.3), Y(0)); ctx.lineTo(X(-3.75), Y(0)); ctx.stroke();
      /* 渠(西)+ 田(东) */
      ctx.strokeRect(X(-3.6), Y(0.30), 0.35 * S, 0.30 * S);
      ctx.strokeRect(X(-1.4), Y(0.30), 0.35 * S, 0.30 * S);
      ctx.strokeStyle = faint2;
      ctx.strokeRect(X(-3.25), Y(0.18), 1.5 * S, 0.12 * S);
      ctx.fillStyle = "rgba(62,110,134,0.28)";
      ctx.fillRect(X(-3.25), Y(D.waterY), 1.5 * S, (D.waterY - 0.06) * S);
      ctx.strokeStyle = ink; ctx.lineWidth = 1.3;
      /* 渡槽 */
      ctx.beginPath(); ctx.moveTo(X(D.trX0), Y(D.trY0)); ctx.lineTo(X(D.trX1), Y(D.trY1)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(D.trX0), Y(D.trY0) - 5); ctx.lineTo(X(D.trX1), Y(D.trY1) - 5); ctx.stroke();
      /* 高架双柱 */
      ctx.strokeRect(X(D.xC - 0.075), Y(D.yU), 0.15 * S, D.yU * S);
      /* 双轮 + 链路径 */
      ctx.beginPath(); ctx.arc(X(D.xC), Y(D.yU), D.R * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(D.xC), Y(D.yL), D.R * S, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = faint;
      ctx.beginPath();
      for (var s = 0; s <= D.Ltot; s += D.Ltot / 48) {
        var pt2 = chainPt(s);
        if (s === 0) ctx.moveTo(X(pt2[0]), Y(pt2[1])); else ctx.lineTo(X(pt2[0]), Y(pt2[1]));
      }
      ctx.stroke();
      function chainPt(sv) {
        sv = ((sv % D.Ltot) + D.Ltot) % D.Ltot;
        if (sv < D.Lrun) return [D.xC - D.R, D.yL + sv];
        sv -= D.Lrun;
        if (sv < D.Larc) { var th = Math.PI - sv / D.Larc * Math.PI; return [D.xC + D.R * Math.cos(th), D.yU + D.R * Math.sin(th)]; }
        sv -= D.Larc;
        if (sv < D.Lrun) return [D.xC + D.R, D.yU - sv];
        sv -= D.Lrun;
        var th2 = sv / D.Larc * Math.PI;
        return [D.xC + D.R * Math.cos(th2), D.yL - D.R * Math.sin(th2)];
      }
      /* 板(载水区实心) */
      for (var i = 0; i < D.NB; i++) {
        var sv2 = i * D.pitch;
        var pt3 = chainPt(sv2);
        var wet = sv2 >= D.fillS && sv2 <= D.dumpS;
        ctx.fillStyle = wet ? waterC : faint2;
        ctx.fillRect(X(pt3[0]) - 3, Y(pt3[1]) - 3, 6, 6);
      }
      ctx.strokeStyle = ink; ctx.lineWidth = 1.3;
      /* 尺寸 */
      arrowV(ctx, X(-3.85), Y(D.yL), Y(D.yU), "提水高 3.33 m", -1);
      arrowH(ctx, X(D.xC - D.R), X(D.xC + D.R), Y(0) - 8, "链轮径 1.00 m", true);
      arrowV(ctx, X(D.xC + 0.6), Y(0), Y(D.bankTop), "渠岸 0.30 m", 1);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("下轮浸水 0.06m · 板过顶即倾注入渡槽", ox, chainY - 14);

      /* —— 右上:链行程图 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("链行程 L=9.80m 分段", rx, topY + 12);
      var gx0 = rx + 6, gw = rw - 12, gy0 = topY + 26, gh = 30;
      var segs = [["西竖段 3.33", D.Lrun / D.Ltot], ["上弧 1.57", D.Larc / D.Ltot], ["东竖段 3.33", D.Lrun / D.Ltot], ["下弧 1.57", D.Larc / D.Ltot]];
      var colors = [faint2, "rgba(62,110,134,0.4)", faint2, "rgba(62,110,134,0.4)"];
      var acc = 0;
      segs.forEach(function (sg, i) {
        var x = gx0 + acc * gw;
        ctx.fillStyle = colors[i];
        ctx.fillRect(x, gy0, sg[1] * gw - 2, gh);
        ctx.strokeStyle = ink; ctx.lineWidth = 0.8;
        ctx.strokeRect(x, gy0, sg[1] * gw - 2, gh);
        ctx.fillStyle = ink;
        ctx.font = "600 8px Menlo, monospace"; ctx.textAlign = "center";
        ctx.fillText(sg[0], x + sg[1] * gw / 2, gy0 + gh + 11);
        acc += sg[1];
      });
      /* 载水区标注 */
      ctx.fillStyle = waterC;
      ctx.fillRect(gx0 + D.fillS / D.Ltot * gw, gy0 - 8, (D.dumpS - D.fillS) / D.Ltot * gw, 6);
      ctx.fillStyle = ink;
      ctx.font = "600 8.5px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("载水区 0.22 → 4.11(过顶倾注)", gx0, gy0 - 12);

      /* —— 右下:传动图 —— */
      var by = gy0 + gh + 34;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("传动 ω → v", rx, by - 8);
      var bars = [["下轮 ω 0.90 rad/s", 0.9 / 0.9, woodC], ["链速 v 0.45 m/s", 0.45 / 0.9, red]];
      bars.forEach(function (b, i) {
        var y = by + i * 17;
        ctx.fillStyle = b[2];
        ctx.fillRect(gx0, y, b[1] * (rw - 20), 9);
        ctx.strokeStyle = ink; ctx.lineWidth = 0.8;
        ctx.strokeRect(gx0, y, b[1] * (rw - 20), 9);
        ctx.fillStyle = ink;
        ctx.font = "600 8.5px Menlo, monospace"; ctx.textAlign = "right";
        ctx.fillText(b[0], gx0 + b[1] * (rw - 20) - 4, y + 8);
      });
      ctx.fillStyle = red; ctx.textAlign = "left";
      ctx.font = "700 9px Menlo, monospace";
      ctx.fillText("v = ω·R · 板行一周 21.8s", gx0, by + 44);

      /* —— 底部:部件链 —— */
      var boxes = [
        ["摇柄", "ω 0.9 rad/s"], ["下链轮", "径 1.0m · 浸水"], ["刮板小筒×14", "板距 0.70m · 载水上行"],
        ["上链轮", "同径 · 过顶倾注"], ["渡槽", "斜置 2.8m → 田"], ["田", "四埂围水"]
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
      '<h4>链系</h4><table>' +
      '<tr><th>链轮(上/下)</th><td>径 1.00 m · 同径同面</td><td>轮距 3.33 m</td></tr>' +
      '<tr><th>链全长</th><td>2×3.33 + 2π×0.50</td><td>9.80 m</td></tr>' +
      '<tr><th>刮板小筒</th><td>14 筒 · 板距 0.70 m(轮上弧距 80°)</td><td>竹筒 r 0.09</td></tr>' +
      '<tr><th>下轮</th><td>轴高 0.62 m · 浸水 0.06 m</td><td>石柱墩承轴</td></tr>' +
      '<tr><th>上轮</th><td>轴高 3.95 m · 高架双柱</td><td>过顶倾注</td></tr>' +
      '</table><h4>传动与水</h4><table>' +
      '<tr><th>链速</th><td>v = ω·R = 0.9 × 0.50</td><td>0.45 m/s</td></tr>' +
      '<tr><th>板行一周</th><td>9.80 / 0.45</td><td>21.8 s</td></tr>' +
      '<tr><th>渡槽</th><td>斜置 2.8 m · 落差 0.17 m</td><td>注田</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>链闭合:板距×N = 0.700×14 = 9.802 = Ltot(载入期断言)。链速 v = ω·R = 0.45 m/s ∈ (0.40, 0.60)。</p>' +
      '<p>下轮浸水:轮缘底 0.12 m 低于水面 0.18 m(浸深 0.06),高于渠底 0.06(净空 0.06)—— 断言不触底。</p>' +
      '<p>板位 s_i = (i·0.70 + s) mod 9.80,恒竖直悬挂;载水区 s ∈ [0.22, 4.11],过顶(s = 4.11)倾注入渡槽。</p>' +
      '<h4>文献</h4>' +
      '<p>王祯《农书》:「高转筒车,其高以丈计……上轮下轮俱系轮辋,人力或水力转动下轮,则筒周而复始,递相倾侧,水自上槽注田。」</p>'
  };
})(window.MECH = window.MECH || {});
