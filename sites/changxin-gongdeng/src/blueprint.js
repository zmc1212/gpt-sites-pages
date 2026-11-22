/* 图纸面板(B 键):长信宫灯复原侧视总图 + 调光映射 + 烟路 + 尺寸表。 */
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

  MECH.BP = {
    no: "Fig. 16 · 复原总图",
    title: "长信宫灯 · 双屏调光导烟(西汉·满城汉墓)",
    src: "满城汉墓窦绾墓出土(河北博物院藏) · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("光锥角 β = 0.8α   ·   光强 I ∝ sinα   ·   烟路:焰 → 袖道 → 体腔水盘(溶烟)   ·   α ∈ [0°, 90°]", w * 0.03, topY - 8);

      /* —— 左:侧视图 —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 1.6, (regionH - 12) / 2.1);
      var oy = topY + regionH - 0.6 * S;
      function X(m) { return ox + 0.4 * S + (m + 0.8) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(灯 → 右)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(0.8), Y(0)); ctx.lineTo(X(-0.8), Y(0)); ctx.stroke();
      /* 跪裙 + 上身 + 头 */
      ctx.beginPath();
      ctx.moveTo(X(-0.40), Y(0)); ctx.lineTo(X(-0.24), Y(0.62)); ctx.lineTo(X(0.10), Y(0.62)); ctx.lineTo(X(0.40), Y(0)); ctx.closePath(); ctx.stroke();
      ctx.strokeRect(X(-0.10), Y(0.62), 0.30 * S, 0.36 * S);
      ctx.beginPath(); ctx.arc(X(0.05), Y(1.08), 0.105 * S, 0, Math.PI * 2); ctx.stroke();
      /* 左臂托灯 */
      ctx.beginPath(); ctx.moveTo(X(0.02), Y(0.95)); ctx.lineTo(X(D.panX - 0.05), Y(D.panY - 0.12)); ctx.stroke();
      /* 灯盘 + 双屏板(开/合双态) */
      ctx.beginPath(); ctx.ellipse(X(D.panX), Y(D.panY), D.panR * S, D.panR * S * 0.35, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(D.panX), Y(D.panY), 0.06 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(D.panX), Y(D.panY)); ctx.lineTo(X(D.panX + 0.15), Y(D.panY + 0.35)); ctx.stroke();
      ctx.strokeStyle = red;
      ctx.beginPath(); ctx.moveTo(X(D.panX + 0.12), Y(D.panY + 0.02));
      ctx.lineTo(X(D.panX + 0.30), Y(D.panY + 0.30)); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 右袖烟道 */
      ctx.beginPath(); ctx.moveTo(X(0.20), Y(1.20)); ctx.lineTo(X(0.32), Y(1.62)); ctx.lineTo(X(0.10), Y(1.75)); ctx.stroke();
      /* 体腔剖视 + 水盘 */
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = faint;
      ctx.strokeRect(X(-0.18), Y(0.48), 0.42 * S, 0.44 * S);
      ctx.setLineDash([]);
      ctx.strokeStyle = waterC;
      ctx.beginPath(); ctx.moveTo(X(-0.15), Y(0.95)); ctx.lineTo(X(0.20), Y(0.95)); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 尺寸 */
      arrowV(ctx, X(-0.62), Y(0), Y(1.20), "通高 1.20", -1);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("红:光锥 β=0.8α · 虚线方:体腔剖视(水盘溶烟)", ox, chainY - 14);

      /* —— 右:调光映射 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("调光映射 β(α) 与 I(α)", rx, topY + 12);
      var gx0 = rx + 30, gw = rw - 44, gy0 = topY + 24, gh = 84;
      function xOf(a) { return gx0 + a / 90 * gw; }
      function yOf(v) { return gy0 + (1 - v) * gh; }
      ctx.strokeStyle = faint2; ctx.lineWidth = 1;
      ctx.strokeRect(gx0, gy0, gw, gh);
      ctx.strokeStyle = woodC; ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var i = 0; i <= 45; i++) {
        var a = i / 45 * 90;
        if (i === 0) ctx.moveTo(xOf(a), yOf(D.coneAngle(a) / 72)); else ctx.lineTo(xOf(a), yOf(D.coneAngle(a) / 72));
      }
      ctx.stroke();
      ctx.strokeStyle = waterC;
      ctx.beginPath();
      for (var j = 0; j <= 45; j++) {
        var a2 = j / 45 * 90;
        if (j === 0) ctx.moveTo(xOf(a2), yOf(Math.sin(a2 * Math.PI / 180))); else ctx.lineTo(xOf(a2), yOf(Math.sin(a2 * Math.PI / 180)));
      }
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.font = "600 8px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("β/72(木)", gx0 - 26, yOf(D.coneAngle(90) / 72) + 3);
      ctx.fillText("I(水)", gx0 - 20, yOf(1) + 3);
      ctx.textAlign = "center";
      ctx.fillText("屏板开度 α →", gx0 + gw / 2, gy0 + gh + 13);

      /* —— 右下:烟路要点 —— */
      var by = gy0 + gh + 34;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("烟路三段", rx, by - 6);
      var lines = [["焰 → 袖口", "烟自焰起入袖"], ["袖 → 袖弯", "右臂虹吸"], ["弯 → 腔水", "溶烟净水"]];
      ctx.font = "600 8.5px sans-serif";
      lines.forEach(function (l, i) {
        ctx.fillStyle = ink;
        ctx.fillText(l[0] + " · " + l[1], rx, by + 8 + i * 14);
      });

      /* —— 底部:部件链 —— */
      var boxes = [
        ["跪裙台座", "宫女下身"], ["灯座灯盘", "左手托举"], ["双屏板", "绕立轴 ±α 调光"],
        ["焰苗光锥", "β=0.8α 随开度"], ["右袖烟道", "虹吸导烟"], ["体腔水盘", "溶烟净水"]
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
      '<h4>灯体</h4><table>' +
      '<tr><th>通高</th><td>跪坐宫女 + 托灯</td><td>1.20 m(示意)</td></tr>' +
      '<tr><th>灯盘</th><td>R 0.20 m · 火釜居中 · 双立轴铰点</td><td>盘高 1.28</td></tr>' +
      '<tr><th>双屏板</th><td>弧形板 · 绕立轴对开 ±90°</td><td>开合调光</td></tr>' +
      '</table><h4>调光与导烟</h4><table>' +
      '<tr><th>光锥角</th><td>β = 0.8α</td><td>0° → 72°</td></tr>' +
      '<tr><th>光强</th><td>I ∝ sinα</td><td>0(全遮)→ 1(全开)</td></tr>' +
      '<tr><th>烟路</th><td>焰 → 右袖道 → 体腔水盘(溶烟)</td><td>三段样条</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>β(90°) = 72(严格断言);I(0) = 0、I(90) = 1(断言);烟路终点 y = 水面高(断言)。</p>' +
      '<p>运行期 errPos = 屏板外缘点 vs 解析(立轴 + ±α 旋转)≈ 0;焰苗闪烁与光晕随开度。</p>' +
      '<h4>文献</h4>' +
      '<p>长信宫灯,1968 年满城汉墓窦绾墓出土,铭「长信尚浴」——双屏可调光、烟道导烟入体腔水盘的环保设计,被誉为「中华第一灯」。</p>'
  };
})(window.MECH = window.MECH || {});
