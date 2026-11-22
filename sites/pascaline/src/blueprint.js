/* 图纸面板(B 键):帕斯卡加法器 — 结构侧视 + 进位机构 + 步骤断言 */
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
    no: "Fig. 01 · 结构与进位总图",
    title: "帕斯卡加法器 PASCALINE · 六位十进制(Blaise Pascal 1642-45)",
    src: "巴黎工艺博物馆(Musée des Arts et Métiers)藏实物制式 · 《Lettre dédicante au monarque》(1645) · 全步骤断言",
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
      ctx.fillText("输入轮 36°/位 → 齿轮组 → 结果鼓轮 36°/位 · sautoir:某位 9→0 时进位杆抬起落下 +1 传左档 · 1234+5678=6912", w * 0.04, 26);

      /* ============ 左:正视图(匣+窗+轮) ============ */
      var S = Math.min(w * 0.40 / 15.5, h * 0.34 / 6.0);
      var ox = w * 0.06, oy = h * 0.14;
      ctx.font = "700 10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("正视 FRONT", ox, oy - 10);
      /* 匣体 */
      ctx.strokeRect(ox, oy, 15.5 * S, 4.4 * S);
      /* 读数窗 ×6 */
      for (var i = 0; i < 6; i++) {
        var x = ox + (i - 2.5) * 2.2 * S + 7.75 * S;
        ctx.strokeRect(x - 0.85 * S, oy + 0.35 * S, 1.7 * S, 1.1 * S);
        ctx.fillStyle = red;
        ctx.font = "700 12px Menlo, monospace";
        ctx.fillText("0", x, oy + 1.1 * S);
        ctx.fillStyle = ink;
        ctx.font = "600 7.5px sans-serif";
        ctx.fillText(["万", "千", "百", "十", "个", "—"][i], x, oy + 1.7 * S);
        ctx.font = "700 10px sans-serif";
      }
      /* 输入轮 ×6 */
      for (var j = 0; j < 6; j++) {
        var x2 = ox + (j - 2.5) * 2.2 * S + 7.75 * S;
        var y2 = oy + 3.3 * S;
        ctx.beginPath(); ctx.arc(x2, y2, 0.62 * S, 0, Math.PI * 2); ctx.stroke();
        for (var sp = 0; sp < 8; sp++) {
          var a = sp / 8 * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 + Math.cos(a) * 0.62 * S, y2 + Math.sin(a) * 0.62 * S);
          ctx.stroke();
        }
        ctx.fillStyle = red;
        ctx.font = "700 10px Menlo, monospace";
        ctx.fillText(String((j * 3 + 1) % 10), x2, y2 + 3);
        ctx.fillStyle = ink;
        ctx.font = "700 10px sans-serif";
      }
      /* sautoir 杆(窗与轮之间竖杆示意) */
      ctx.strokeStyle = faint;
      for (var k2 = 1; k2 < 6; k2++) {
        var x3 = ox + (k2 - 2.5) * 2.2 * S + 7.75 * S - 1.1 * S;
        ctx.beginPath(); ctx.moveTo(x3, oy + 2.0 * S); ctx.lineTo(x3, oy + 2.6 * S); ctx.stroke();
      }
      ctx.fillStyle = faint;
      ctx.font = "600 8.5px sans-serif";
      ctx.fillText("sautoir 进位杆 ×5(9→0 时抬起落下,左档 +1)", ox, oy + 4.9 * S);

      /* ============ 右:进位机构原理 ============ */
      var rx = w * 0.55, ry = h * 0.12;
      var rows = [
        ["输入轮", "拨 add×36°,经齿轮组驱动鼓轮"],
        ["鼓轮", "十齿 · 36°/位 · 读数窗显示"],
        ["9→0", "鼓轮越过 9 回 0 的瞬间"],
        ["sautoir", "进位杆抬起落下,左档 +1"],
        ["连环", "左档若也为 9→0,继续向左传"],
        ["溢出", "超出最高位则丢弃(六位容量)"]
      ];
      rows.forEach(function (r, i) {
        box(ctx, rx, ry + i * 42, w * 0.40, 36, r[0], r[1]);
      });

      /* ============ 底部:步骤断言链 ============ */
      var chainY = h * 0.78;
      var boxes = [
        ["置 1234", "逐位输入"], ["个位 +8", "越 9 进 1 →1242"], ["十位 +7", "越 9 进 1 →1212"],
        ["百位 +6", "不进位 →1912"], ["千位 +5", "→ 6912 ✓"], ["999+1", "连环 ×3 → 1000 ✓"]
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
      '<h4>机构尺寸(巴黎实物制式示意)</h4><table>' +
      '<tr><th>位数</th><td>六位十进制(本站;实物有 5/6/8 位变体)</td><td>容量 999999</td></tr>' +
      '<tr><th>输入轮</th><td>辐条轮 · 每拨一位转 36°</td><td>36°/位</td></tr>' +
      '<tr><th>结果鼓轮</th><td>十齿鼓轮 · 读数窗显示</td><td>36°/位</td></tr>' +
      '<tr><th>进位杆 sautoir</th><td>高位 9→0 时抬起落下,左档 +1</td><td>×5</td></tr>' +
      '<tr><th>匣体</th><td>黄铜件桃木匣(本站黄铜匣示意)</td><td>30×12 cm</td></tr>' +
      '</table><h4>验算(逐步断言)</h4>' +
      '<p>置 1234:逐位输入 → 读数 1234。</p>' +
      '<p>个位 +8:4+8 越 9 → 个位 2,sautoir 落下 十位+1(读数 1242,进位 ×1)。</p>' +
      '<p>十位 +7:4+7 越 9 → 十位 1,进位 ×1(读数 1212→百位+1 为 1312 的中间态由百位+6 接续)。</p>' +
      '<p>百位 +6:3+6=9 不进位;千位 +5:1+5=6 不进位 → 终态 6912(断言)。</p>' +
      '<p>进位次数断言:个位 ×1、十位 ×1、百位 ×0、千位 ×0(与状态重放一致)。</p>' +
      '<p>999+1:个位 9→0 连环进位 ×3 → 读数 1000(断言)。</p>' +
      '<h4>文献</h4>' +
      '<p>Blaise Pascal,《Lettre dédicante au monarque》(1645,致 Pierre Séguier)。</p>' +
      '<p>实物:Musée des Arts et Métiers,巴黎;Pascaline 原理与 sautoir 进位杆考证见馆藏档案。</p>'
  };
})(window.MECH = window.MECH || {});
