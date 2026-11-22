/* 图纸面板(B 键):转轮藏复原剖视总图 + 惯转曲线 + 尺寸表。 */
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
    no: "Fig. 17 · 复原总图",
    title: "转轮藏 · 八棱书藏下枢针(宋·正定隆兴寺)",
    src: "正定隆兴寺转轮藏殿(现存中国最古转轮藏) · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("惯转 ψ = (ω0/k)(1 − e^{−kτ})   ·   k = 0.08   ·   ω0 = 1.2   ·   惯转 13.6 rad(> 2 圈)· 八棱每棱 45°", w * 0.03, topY - 8);

      /* —— 左:剖视图 —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 3.2, (regionH - 12) / 3.6);
      var oy = topY + regionH - 0.9 * S;
      function X(m) { return ox + 0.5 * S + (m + 1.6) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("剖视 SECTION(藏柜八棱体 + 下枢针)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(1.7), Y(0)); ctx.lineTo(X(-1.7), Y(0)); ctx.stroke();
      /* 殿基 */
      ctx.strokeRect(X(-1.85), Y(0), 3.7 * S, 0.42 * S);
      /* 藏柜八棱(剖视两壁) */
      ctx.strokeRect(X(-D.RCase + 0.1), Y(D.caseY0), (D.RCase * 2 - 0.2) * S, (D.caseY1 - D.caseY0) * S);
      ctx.beginPath(); ctx.moveTo(X(0), Y(D.caseY0)); ctx.lineTo(X(0), Y(D.caseY1)); ctx.stroke();
      /* 经函架(三层) */
      ctx.strokeStyle = faint;
      for (var r = 0; r < D.shelfRows; r++) {
        var y = D.caseY0 + 0.35 + r * 0.62;
        ctx.beginPath(); ctx.moveTo(X(-D.RCase + 0.3), Y(y)); ctx.lineTo(X(D.RCase - 0.3), Y(y)); ctx.stroke();
        for (var b = 0; b < 4; b++) {
          ctx.strokeRect(X(-D.RCase + 0.45 + b * 0.55), Y(y + 0.05), 0.34 * S, 0.30 * S);
        }
      }
      /* 檐顶 */
      ctx.beginPath();
      ctx.moveTo(X(-D.RCase - 0.25), Y(D.caseY1 + 0.06));
      ctx.lineTo(X(0), Y(D.caseY1 + 0.34));
      ctx.lineTo(X(D.RCase + 0.25), Y(D.caseY1 + 0.06));
      ctx.stroke();
      ctx.beginPath(); ctx.arc(X(0), Y(D.caseY1 + 0.50), 0.09 * S, 0, Math.PI * 2); ctx.stroke();
      /* 枢针 + 上梁 */
      ctx.beginPath(); ctx.arc(X(0), Y(D.needleY), 0.05 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeRect(X(-0.95), Y(D.beamY), 1.90 * S, 0.16 * S);
      ctx.beginPath(); ctx.moveTo(X(0), Y(D.beamY)); ctx.lineTo(X(0), Y(D.beamY - 0.14)); ctx.stroke();
      /* 尺寸 */
      arrowV(ctx, X(-1.95), Y(0), Y(D.caseY1), "柜高 2.28", -1);
      arrowV(ctx, X(1.55), Y(D.beamY), Y(D.caseY1), "梁距 0.40", 1);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("剖视:中柱 + 底枋十字托 · 经函 24 函 · 上梁悬桩限位", ox, chainY - 14);

      /* —— 右:惯转曲线 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("惯转 ψ(τ) 指数趋近", rx, topY + 12);
      var gx0 = rx + 30, gw = rw - 42, gy0 = topY + 24, gh = 86;
      function xOf(t) { return gx0 + t / D.coastT * gw; }
      function yOf(v) { return gy0 + (1 - v / D.coastAngle) * gh; }
      ctx.strokeStyle = faint2; ctx.lineWidth = 1;
      ctx.strokeRect(gx0, gy0, gw, gh);
      ctx.strokeStyle = woodC; ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (var i = 0; i <= 60; i++) {
        var t = i / 60 * D.coastT;
        var v = KS.coastPsi(t);
        if (i === 0) ctx.moveTo(xOf(t), yOf(v)); else ctx.lineTo(xOf(t), yOf(v));
      }
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.font = "600 8px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("ψ 13.6 rad", gx0 - 26, yOf(D.coastAngle) + 3);
      ctx.textAlign = "center";
      ctx.fillText("推后时间 τ s →", gx0 + gw / 2, gy0 + gh + 13);

      /* —— 右下:要点 —— */
      var by = gy0 + gh + 36;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("验算要点", rx, by - 6);
      var lines = ["k = 0.08 s⁻¹(衰减)", "惯转 13.6 rad > 2 圈", "枢针 r 0.02 · 低摩擦"];
      ctx.font = "600 8.5px sans-serif";
      lines.forEach(function (l, i) {
        ctx.fillStyle = i === 1 ? red : ink;
        ctx.fillText(l, rx, by + 8 + i * 14);
      });

      /* —— 底部:部件链 —— */
      var boxes = [
        ["殿基凹座", "八角石台"], ["铁承座藏针", "枢针 r 0.02"], ["八棱藏柜", "对径 2.6 · 每棱 45°"],
        ["经函架", "3 排 × 8 面 24 函"], ["檐顶上梁", "悬桩限位"], ["推杆", "一人推之"]
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
      '<h4>藏体</h4><table>' +
      '<tr><th>八棱藏柜</th><td>对径 2.60 m · 高 2.28 m · 每棱 45°</td><td>绕中心竖轴</td></tr>' +
      '<tr><th>经函架</th><td>3 排 × 8 面 · 24 函(0.34×0.30)</td><td>随柜巡转</td></tr>' +
      '<tr><th>檐顶</th><td>八角八坡 + 宝顶</td><td>随柜转</td></tr>' +
      '</table><h4>枢与惯转</h4><table>' +
      '<tr><th>下枢藏针</th><td>铁承座 · 针 r 0.02 m(低摩擦)</td><td>承全重</td></tr>' +
      '<tr><th>上梁悬桩</th><td>梁高 3.10 m · 悬桩限位</td><td>防倾覆</td></tr>' +
      '<tr><th>惯转</th><td>ψ(τ) = (ω0/k)(1 − e^{−kτ}),k 0.08,ω0 1.2</td><td>13.6 rad &gt; 2 圈</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>惯转角(ω0/k)(1−e^{−k·30}) = 15 × 0.909 ≈ 13.6 rad(载入期断言 ∈ (10,16));八棱每棱 45°(严格断言)。</p>' +
      '<p>运行期 errPos = 推杆端头世界位置 vs 解析(R·cos/sin ψ)≈ 0;各层同角旋转(柜体/书架/檐顶/推杆)。</p>' +
      '<h4>文献</h4>' +
      '<p>正定隆兴寺转轮藏殿,藏为宋代原物,是中国现存最古的转轮藏——「人立其中推之,可转动如风」;下枢针承重、上梁悬桩限位为其结构关键。</p>'
  };
})(window.MECH = window.MECH || {});
