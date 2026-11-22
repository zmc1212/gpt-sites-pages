/* 图纸面板(B 键):阿基米德螺旋提水器 — 侧视几何 + 截面 + 公式 + 尺寸表 */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.35)", red = "#8C2F1E";

  function box(ctx, x, y, w, h, l1, l2) {
    ctx.strokeStyle = ink;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = ink;
    ctx.font = "700 9.5px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(l1, x + w / 2, y + 13);
    if (l2) {
      ctx.font = "600 7.5px Menlo, monospace";
      ctx.fillStyle = faint;
      ctx.fillText(l2, x + w / 2, y + 26);
    }
  }

  MECH.BP = {
    no: "Fig. 01 · 几何与算法总图",
    title: "阿基米德螺旋提水器 · R 0.62 / r 0.26 / P 0.55 / L 3.0 m · θ 30°",
    src: "Diodorus I.34 / Athenaeus V 记载 · Rorres 几何分析 · Bruder 复原试验 · f 填充率 0.5 为示意",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.3;

      /* 公式横幅 */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("圈数 N = L/P = 5.4545 · 扬程 H = L·sinθ = 1.50 m · 水室 V ≈ π(R²−r²)·P·f = 0.189 m³ · 流量 Q = V·n", w * 0.04, 26);

      /* ============ 左:侧视(倾角 30°) ============ */
      var S = Math.min(w * 0.42 / 3.4, h * 0.36 / 2.4);
      var ox = w * 0.10, oy = h * 0.13 + D.H * S;
      var Xa = ox, Ya = oy;                       // 高端(左上)
      var Xb = ox + D.xSpan * S, Yb = oy + D.H * S;  // 低端(右下)
      ctx.font = "700 10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(θ 30°)", ox - 0.2 * S, Ya - 0.4 * S);
      /* 外筒 */
      ctx.strokeStyle = ink;
      ctx.beginPath(); ctx.moveTo(Xa, Ya - D.R * S); ctx.lineTo(Xb, Yb - D.R * S); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(Xa, Ya + D.R * S); ctx.lineTo(Xb, Yb + D.R * S); ctx.stroke();
      /* 螺旋示意(斜线) */
      ctx.strokeStyle = faint;
      ctx.lineWidth = 0.8;
      for (var i = 0; i < 11; i++) {
        var s0 = i / 11 * D.L;
        var p0 = [Xb - s0 * Math.cos(D.tilt) * S, Yb + s0 * Math.sin(D.tilt) * S];
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1] - D.R * S * 0.85);
        ctx.lineTo(p0[0] + 0.27 * S * Math.cos(D.tilt), p0[1] - 0.27 * S * Math.sin(D.tilt) + D.R * S * 0.85);
        ctx.stroke();
      }
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.3;
      /* 内芯 */
      ctx.beginPath(); ctx.moveTo(Xa, Ya); ctx.lineTo(Xb, Yb); ctx.stroke();
      /* 尺寸标注 */
      ctx.strokeStyle = faint;
      ctx.beginPath(); ctx.moveTo(Xb + 0.35 * S, Yb + D.R * S + 6); ctx.lineTo(Xb + 0.35 * S, Yb - D.R * S - 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(Xb + 0.35 * S, Yb + D.R * S + 6); ctx.lineTo(Xb + 0.55 * S, Yb + D.R * S + 6); ctx.stroke();
      /* 水池/水槽 */
      ctx.fillStyle = "#5F86A8";
      ctx.fillRect(Xb + 0.05 * S, Yb + D.R * S, 0.5 * S, 0.35 * S);
      ctx.fillRect(Xa - 0.4 * S, Ya - D.R * S - 12, 0.55 * S, 9);
      ctx.fillStyle = faint;
      ctx.font = "600 8.5px sans-serif";
      ctx.fillText("水池(低端)", Xb + 0.4 * S, Yb + D.R * S + 22);
      ctx.fillText("水槽(高端)", Xa - 0.4 * S, Ya - D.R * S - 18);
      ctx.fillStyle = red;
      ctx.font = "700 9.5px sans-serif";
      ctx.fillText("H = L·sinθ = 1.50 m", Xb - 1.6 * S, Ya - 0.25 * S);
      ctx.fillText("L = 3.0 m", Xb - 0.8 * S, Yb + D.R * S + 38);
      ctx.fillText("R 0.62", Xb + 0.42 * S, Yb);

      /* ============ 右上:截面 ============ */
      var cxR = w * 0.60, cyR = h * 0.26, SR = Math.min(w * 0.13 / 0.9, h * 0.16 / 0.9);
      ctx.strokeStyle = ink;
      ctx.beginPath(); ctx.arc(cxR, cyR, D.R * SR, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cxR, cyR, D.r * SR, 0, Math.PI * 2); ctx.stroke();
      /* 螺旋叶(径向线)+ 水室填充示意 */
      ctx.beginPath(); ctx.moveTo(cxR, cyR); ctx.lineTo(cxR + D.R * SR, cyR); ctx.stroke();
      ctx.strokeStyle = "#5F86A8";
      ctx.beginPath();
      ctx.arc(cxR, cyR, D.R * SR * 0.75, 0.35, Math.PI - 0.35);
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.font = "600 8.5px sans-serif";
      ctx.fillText("截面 R/r", cxR - 0.5 * SR, cyR - D.R * SR - 8);
      ctx.fillStyle = faint;
      ctx.fillText("R 0.62 · r 0.26", cxR + 0.7 * SR, cyR + 4);
      ctx.fillText("水室填充 f 0.5(示意)", cxR - 0.5 * SR, cyR + D.R * SR + 16);

      /* ============ 右下:公式与追踪 ============ */
      var fx = w * 0.56, fy = h * 0.50;
      var formulas = [
        ["圈数", "N = L / P = 3.0 / 0.55 = 5.4545(严格)"],
        ["扬程", "H = L·sinθ = 3.0 × sin30° = 1.500 m(严格)"],
        ["水室", "V ≈ π(R²−r²)·P·f = 0.189 m³(f 示意)"],
        ["流量", "Q = V·n:n 0.5 → 94 L/s;n 2.0 → 378 L/s"],
        ["追踪", "s = ((φ0 + θ)/2π mod N)·P,到顶溢出回底"]
      ];
      formulas.forEach(function (f, i) {
        box(ctx, fx, fy + i * 44, w * 0.40, 36, f[0], f[1]);
      });

      /* ============ 底部:链路 ============ */
      var chainY = h * 0.80;
      var boxes = [
        ["摇柄", "n 转/s"], ["螺旋筒", "转一圈进 P"], ["水室 ×N", "V 0.189 m³"], ["高端水槽", "H 1.50 m"],
        ["流量", "Q = V·n"], ["追踪", "s = mod N"], ["溢出", "每 N 圈 ×1"], ["断言", "8 项全过 ✓"]
      ];
      var bwid = (w * 0.92) / boxes.length;
      for (var b = 0; b < boxes.length; b++) {
        var bx = w * 0.04 + b * bwid;
        box(ctx, bx, chainY, bwid - 8, 34, boxes[b][0], boxes[b][1]);
        if (b < boxes.length - 1) {
          ctx.beginPath();
          ctx.moveTo(bx + bwid - 8, chainY + 17);
          ctx.lineTo(bx + bwid - 2, chainY + 17);
          ctx.stroke();
        }
      }
    },
    table:
      '<h4>几何尺寸</h4><table>' +
      '<tr><th>外筒半径 R</th><td>0.62 m</td><td>半透明壳示意</td></tr>' +
      '<tr><th>内芯管半径 r</th><td>0.26 m</td><td>实心木芯</td></tr>' +
      '<tr><th>螺距 P</th><td>0.55 m</td><td>单螺旋</td></tr>' +
      '<tr><th>筒长 L</th><td>3.0 m</td><td>圈数 N = L/P = 5.4545</td></tr>' +
      '<tr><th>倾角 θ</th><td>30°</td><td>扬程 H = L·sinθ = 1.50 m</td></tr>' +
      '<tr><th>叶片厚</th><td>0.055 m</td><td>螺旋叶宽</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>圈数:N = L/P = 5.4545(载入期严格断言;水从低端爬到高端恰好转 N 圈)。</p>' +
      '<p>扬程:H = L·sinθ = 3.0 × sin30° = 1.500 m(几何严格)。</p>' +
      '<p>水室容积:V ≈ π(R²−r²)·P·f = π(0.3844−0.0676)×0.55×0.5 ≈ 0.189 m³(f 填充率 0.5 为示意)。</p>' +
      '<p>流量:Q = V·n(体积守恒):n 0.5 转/s → 94.5 L/s;n 2.0 转/s → 378 L/s。</p>' +
      '<p>水团追踪:s = ((φ0 + θ)/2π mod N)·P,确定性回卷;转一圈前进恰一个螺距 P(断言),转 N 圈溢出恰好一次(断言)。</p>' +
      '<h4>文献</h4>' +
      '<p>Diodorus Siculus I.34、Athenaeus《Deipnosophistae》V:阿基米德在埃及设计螺旋提水器。</p>' +
      '<p>几何分析:Chris Rorres《Archimedes in the 21st Century》;现代复原试验:Bruder 螺旋(填率与流量实测)。</p>'
  };
})(window.MECH = window.MECH || {});
