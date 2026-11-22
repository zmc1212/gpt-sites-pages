/* 图纸面板(B 键):指南车总图 — 侧视 + 顶视 + 传动链简图,尺寸按文献数据 */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.35)", brass = "#8A6E3F", red = "#8C2F1E";

  function arrow(ctx, x1, y1, x2, y2, text, below) {
    ctx.strokeStyle = faint;
    ctx.fillStyle = faint;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    var s = 4, dir = x2 >= x1 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * dir, y2 - 3); ctx.lineTo(x2 - s * dir, y2 + 3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + s * dir, y1 - 3); ctx.lineTo(x1 + s * dir, y1 + 3); ctx.closePath(); ctx.fill();
    ctx.font = "600 10px Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(text, (x1 + x2) / 2, below ? (y1 + 13) : (y1 - 5));
  }

  MECH.BP = {
    no: "Fig. 01 · 复原总图",
    title: "指南车 · 燕肃制式(宋天圣五年,1027)",
    src: "《宋史·舆服志》卷一百四十九 · 王振铎复原思路 · 尺寸按文献与推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      /* 分区:公式横幅(顶) / 侧视(左)+顶视(右) / 传动链(底) */
      var chainH = 46, chainY = h - chainH - 12;
      var topY = 34;
      var S = Math.min(w * 0.47 / 8.6, (chainY - topY - 26) / 5.9);   // px per meter
      var ink = "#2A2620";
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.4;

      /* 公式横幅(顶部) */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("补偿比 = (16/40)/2 = 0.200 = r轮/W辙 = 0.9/4.5  →  木人指向世界系恒定", w * 0.045, topY - 10);

      /* ============ 左:侧视图(视向 +x,南向右) ============ */
      var ox = w * 0.045, oy = chainY - 14, X = function (m) { return ox + (m + 1.6) * S; }, Y = function (m) { return oy - m * S; };
      ctx.font = "700 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = ink;
      ctx.fillText("侧视 SIDE(南 → 右)", ox, Y(5.3));
      ctx.beginPath(); ctx.moveTo(X(-1.6), Y(0)); ctx.lineTo(X(6.4), Y(0)); ctx.stroke();
      var wr = D.rWheel;
      ctx.beginPath(); ctx.arc(X(0), Y(wr), wr * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(0), Y(wr), wr * S * 0.11, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < 14; i++) {
        var a = i / 14 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(X(0), Y(wr));
        ctx.lineTo(X(0) + Math.cos(a) * wr * S * 0.92, Y(wr) - Math.sin(a) * wr * S * 0.92);
        ctx.stroke();
      }
      var bx = X(-0.15 - 1.35), bw = 2.7 * S, by = Y(2.55), bh = (2.55 - 0.66) * S;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.strokeRect(bx + 6, by + 6, bw - 12, bh - 12);
      ctx.strokeRect(bx - 4, Y(2.66), bw + 8, 0.11 * S);
      ctx.strokeRect(X(-1.0), Y(0.78), 3.4 * S, 0.16 * S);
      ctx.beginPath(); ctx.moveTo(X(-wr - 0.1), Y(0.9)); ctx.lineTo(X(1.0), Y(0.9)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(1.2), Y(0.8)); ctx.lineTo(X(1.2 + 2.6), Y(0.98)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(1.2 + 2.6), Y(1.18), 0.2 * S, Math.PI * 0.5, Math.PI * 1.5, true); ctx.stroke();
      var mx = X(-0.15), my = Y(2.62);
      ctx.beginPath(); ctx.arc(mx, my - 0.42 * S, 0.10 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx - 0.13 * S, my); ctx.lineTo(mx - 0.09 * S, my - 0.30 * S); ctx.lineTo(mx + 0.09 * S, my - 0.30 * S); ctx.lineTo(mx + 0.13 * S, my); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx + 0.10 * S, my - 0.26 * S); ctx.lineTo(mx + 0.30 * S, my - 0.13 * S); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx + 0.30 * S, my - 0.13 * S); ctx.lineTo(mx + 0.30 * S, my + 0.45 * S); ctx.stroke();
      arrow(ctx, X(0) - wr * S, Y(0), X(0) - wr * S, Y(2 * wr), "径六尺", false);
      arrow(ctx, X(-0.15 - 1.35), Y(3.0), X(-0.15 + 1.35), Y(3.0), "厢长九尺", false);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("木仙人 · 执杖指南", mx + 0.36 * S, my - 0.60 * S);

      /* ============ 右:顶视图(上南下北) ============ */
      var planX = w * 0.55;
      var S2 = Math.min((w - planX - 26) / 7.2, (chainY - topY - 70) / 5.8);
      var ox2 = planX + 2.7 * S2, oy2 = chainY - 52 - 2.0 * S2;
      var X2 = function (m) { return ox2 + m * S2; }, Y2 = function (m) { return oy2 + m * S2; };
      ctx.font = "700 11px sans-serif";
      ctx.fillStyle = ink;
      ctx.textAlign = "left";
      ctx.fillText("顶视 PLAN(南 ↓)", ox2 - 2.5 * S2, oy2 - 2.6 * S2);
      ctx.strokeRect(X2(-0.84), Y2(-1.5), 1.68 * S2, 2.7 * S2);
      ctx.beginPath(); ctx.moveTo(X2(0), Y2(1.2)); ctx.lineTo(X2(0), Y2(3.8)); ctx.stroke();
      [-2.25, 2.25].forEach(function (wx) {
        ctx.strokeRect(X2(wx - 0.09), Y2(-1.25), 0.18 * S2, 2.2 * S2);
        ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.arc(X2(wx - 0.19), Y2(-0.15), 0.60 * S2, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(X2(wx - 0.19), Y2(-0.15), 0.24 * S2, 0, Math.PI * 2); ctx.stroke();
      });
      ctx.beginPath(); ctx.arc(X2(0), Y2(-0.15), 0.26 * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X2(0), Y2(-0.15), 0.05 * S2, 0, Math.PI * 2); ctx.fill();
      arrow(ctx, X2(-2.25), Y2(2.35), X2(2.25), Y2(2.35), "辙广一丈五尺(复原推算)", true);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif";
      ctx.fillText("冠轮 r0.60(虚线) · 立轮 r0.24", ox2 - 2.5 * S2, oy2 + 2.9 * S2);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["足轮 ψ", "r=0.9"], ["立轮 16T", "同轴"], ["冠轮 40T", "i=0.4 · 左朝上/右朝下"],
        ["太阳锥 ×2", "冠轮轴顶"], ["差动壳", "(sunL+sunR)/2"], ["木仙人", "ptr = −ψ ✓"]
      ];
      var bwid = (w * 0.91) / boxes.length;
      for (var b = 0; b < boxes.length; b++) {
        var bx2 = w * 0.045 + b * bwid;
        ctx.strokeStyle = ink;
        ctx.strokeRect(bx2, chainY, bwid - 10, chainH);
        ctx.fillStyle = ink;
        ctx.font = "700 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(boxes[b][0], bx2 + (bwid - 10) / 2, chainY + 17);
        ctx.font = "600 8.5px Menlo, monospace";
        ctx.fillStyle = faint;
        ctx.fillText(boxes[b][1], bx2 + (bwid - 10) / 2, chainY + 32);
        if (b < boxes.length - 1) {
          ctx.beginPath();
          ctx.moveTo(bx2 + bwid - 10, chainY + 20);
          ctx.lineTo(bx2 + bwid - 2, chainY + 20);
          ctx.stroke();
        }
      }
    },
    table:
      '<h4>部件尺寸</h4><table>' +
      '<tr><th>足轮(×2)</th><td>径六尺 · 14 辐铁箍</td><td>r = 0.90 m</td></tr>' +
      '<tr><th>辙广(复原推算)</th><td>一丈五尺</td><td>W = 4.50 m</td></tr>' +
      '<tr><th>车厢</th><td>长九尺 · 广五尺六寸 · 高六尺三寸</td><td>2.7 × 1.68 × 1.89 m</td></tr>' +
      '<tr><th>独辕</th><td>独辕双轮(宋制)</td><td>探出 2.61 m</td></tr>' +
      '</table><h4>传动齿轮</h4><table>' +
      '<tr><th>立轮(×2)</th><td>Z16 · 与足轮同轴</td><td>r = 0.24 m</td></tr>' +
      '<tr><th>冠轮(×2)</th><td>Z40 · 立轴 · 左齿面朝上/右朝下</td><td>r = 0.60 m</td></tr>' +
      '<tr><th>传动比</th><td>a = 16/40</td><td>0.40</td></tr>' +
      '<tr><th>太阳锥轮(×2)</th><td>冠轮轴顶 · 示意</td><td>r = 0.30 m</td></tr>' +
      '<tr><th>行星锥轮(×2)</th><td>销轴 X 向 · 示意</td><td>r = 0.30 m</td></tr>' +
      '<tr><th>差动壳输出</th><td>(sunL + sunR)/2 = a(ψL−ψR)/2</td><td>= −ψ(航向)</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>滚动运动学:ψ = (r/W)(ψR − ψL) = 0.200(ψR − ψL)。</p>' +
      '<p>机构输出:ptr = 0.200(ψL − ψR) = −ψ,故木人指向在世界系恒为南。</p>' +
      '<p>直行时 sunL = −sunR,差动壳静止;转向时差值经差动器精确补偿。</p>' +
      '<h4>文献</h4>' +
      '<p>《宋史·舆服志》:燕肃指南车「独辕双轮……木人执杖,车虽回转而手常指南」。</p>' +
      '<p>齿轮系为差动轮系方案(同 Lanchester 1902 专利思路),齿数与辙广为使补偿比严格成立的复原推算值。</p>'
  };
})(window.MECH = window.MECH || {});
