/* 图纸面板(B 键):算盘结构图 + 位值原理 + 口诀/进位验算 */
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
    no: "Fig. 01 · 结构与算法总图",
    title: "算盘 · 2:5 珠十三档(明·程大位《算法统宗》1592 制式)",
    src: "程大位《算法统宗》卷一 · 珠算加法口诀 · 位值原理 10^(12−i) · 全步骤数值断言",
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
      ctx.fillText("数值 = Σ (上珠靠梁×5 + 下珠靠梁) × 10^(12−i) · 1234 + 5678 = 6912 · 999 + 1 = 1000(连环进位)", w * 0.04, 26);

      /* ============ 左:盘面结构图 ============ */
      var cxL = w * 0.22, cyL = h * 0.36, S = Math.min(w * 0.36 / 16.2, h * 0.30 / 6.4);
      ctx.font = "700 10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = ink;
      ctx.fillText("盘面 FRONT", cxL - 6.8 * S, cyL - 2.6 * S);
      /* 外框 */
      ctx.strokeRect(cxL - 7.6 * S, cyL - 2.3 * S, 15.2 * S, 5.8 * S);
      /* 梁 */
      ctx.strokeRect(cxL - 7.4 * S, cyL - 0.15 * S, 14.8 * S, 0.3 * S);
      /* 四档示意(档 9-12) */
      for (var i = 9; i <= 12; i++) {
        var x = cxL + (i - 10.5) * 1.15 * S;
        ctx.beginPath(); ctx.moveTo(x, cyL - 2.2 * S); ctx.lineTo(x, cyL + 3.4 * S); ctx.stroke();
        /* 上珠 2 */
        ctx.strokeRect(x - 0.28 * S, cyL - 1.9 * S, 0.56 * S, 0.4 * S);
        ctx.strokeRect(x - 0.28 * S, cyL - 1.45 * S, 0.56 * S, 0.4 * S);
        /* 下珠 5 */
        for (var l = 0; l < 5; l++) {
          ctx.strokeRect(x - 0.28 * S, cyL + (0.25 + l * 0.62) * S, 0.56 * S, 0.4 * S);
        }
        ctx.fillStyle = red;
        ctx.font = "600 8px sans-serif";
        ctx.fillText(["千", "百", "十", "个"][i - 9], x, cyL + 3.8 * S);
        ctx.fillStyle = ink;
      }
      ctx.fillStyle = faint;
      ctx.font = "600 8.5px sans-serif";
      ctx.fillText("上珠 2(每珠当 5)· 下珠 5(每珠当 1)· 档距 1.15", cxL - 6.8 * S, cyL - 2.0 * S);

      /* ============ 右:口诀/进位流程 ============ */
      var rows = [
        ["置 1234", "一置一 · 二置二 · 三置三 · 四置四", "= 1234"],
        ["个位 4+8", "八去二进一(4→2,进 1)", "= …2"],
        ["十位 3+1", "一上1(3→4)", "= …4"],
        ["十位 4+7", "七去三进一(4→1,进 1)", "= …1"],
        ["百位 2+1", "一上1(2→3)", "= …3"],
        ["百位 3+6", "六上六(3→9)", "= …9"],
        ["千位 1+5", "五上五(1→6)", "= 6912 ✓"],
        ["999+1", "一去九进一 ×3 → 一上1(连环)", "= 1000 ✓"]
      ];
      var rx = w * 0.46, ry = h * 0.10, rw = w * 0.50, rh = (h * 0.46) / rows.length;
      ctx.font = "700 10px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText("加法步骤与口诀(每步读数断言)", rx, ry - 8);
      rows.forEach(function (r, i) {
        box(ctx, rx, ry + i * rh, rw, rh - 5, r[0] + "  " + r[1], r[2]);
      });

      /* ============ 底部:位值链 ============ */
      var chainY = h * 0.66;
      var boxes = [
        ["rod 9", "千位 10³"], ["rod 10", "百位 10²"], ["rod 11", "十位 10¹"], ["rod 12", "个位 10⁰"],
        ["上珠 ×2", "每珠 = 5"], ["下珠 ×5", "每珠 = 1"], ["单档最大", "5×2 + 5 = 9"], ["十三档满盘", "9999999999999"]
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
      '<h4>盘制尺寸(程大位制式示意)</h4><table>' +
      '<tr><th>档数</th><td>十三档 · 位值 10^0(个位)… 10^12</td><td>档距 1.15</td></tr>' +
      '<tr><th>上珠</th><td>每档 2 珠 · 每珠当 5 · 靠梁计数</td><td>2 × 5 = 10</td></tr>' +
      '<tr><th>下珠</th><td>每档 5 珠 · 每珠当 1 · 靠梁计数</td><td>5 × 1 = 5</td></tr>' +
      '<tr><th>单档容量</th><td>5×2 + 5 = 9(十进制一位)</td><td>9</td></tr>' +
      '<tr><th>满盘读数</th><td>十三位全 9</td><td>9999999999999</td></tr>' +
      '</table><h4>加法步骤(1234 + 5678 = 6912,逐步断言)</h4>' +
      '<p>置 1234:一置一、二置二、三置三、四置四 → 读数 1234。</p>' +
      '<p>个位 4+8:八去二进一(4→2,进 1)→ 十位 一上1(3→4)。</p>' +
      '<p>十位 4+7:七去三进一(4→1,进 1)→ 百位 一上1(2→3)。</p>' +
      '<p>百位 3+6:六上六(3→9);千位 1+5:五上五(1→6)。</p>' +
      '<p>终态读数 6912(载入期断言,每步 valueAfter 与珠态重放一致)。</p>' +
      '<h4>连环进位(999 + 1 = 1000)</h4>' +
      '<p>个位 一去九进一 → 十位 一去九进一 → 百位 一去九进一 → 千位 一上1 → 读数 1000。</p>' +
      '<h4>文献</h4>' +
      '<p>程大位《算法统宗》(1592):盘式「上二下五」十三档;加法口诀为珠算通行口诀,' +
      '「去 X 进一」用于和超过 9 的档,进位落左档。</p>'
  };
})(window.MECH = window.MECH || {});
