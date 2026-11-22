/* 图纸面板(B 键):连弩侧视总图 + 循环状态机详图 + 尺寸表 */
(function (MECH) {
  var red = "#8C2F1E";

  function arrow(ctx, x1, y1, x2, y2, text, below) {
    ctx.strokeStyle = "rgba(42,38,32,0.4)";
    ctx.fillStyle = "rgba(42,38,32,0.4)";
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
    no: "Fig. 15 · 复原总图",
    title: "诸葛连弩(元戎弩) · 杠杆往复装填击发",
    src: "《三国志》注引《魏氏春秋》 · 《武备志》卷一百零三连弩图",
    draw: function (ctx, w, h) {
      var D = MECH.DIM;
      ctx.clearRect(0, 0, w, h);
      var chainH = 44, chainY = h - chainH - 12, topY = 34;
      var ink = "#2A2620";
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("一循环 = 落矢 → 后拉钩弦 → 前推脱牙击发(2.0s)· 一弩十矢 · 铁矢八寸", w * 0.045, topY - 10);

      /* ============ 左:侧视图 ============ */
      var S = Math.min(w * 0.44 / 3.0, (chainY - topY - 26) / 1.6);
      var ox = w * 0.05, oy = chainY - 30;
      var X = function (m) { return ox + (m + 1.35) * S; }, Y = function (m) { return oy - m * S; };
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.4;
      ctx.font = "700 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE", ox, Y(0.95));
      /* 弩床 */
      ctx.strokeRect(X(-D.bedL / 2), Y(D.bedH / 2), D.bedL * S, D.bedH * S);
      /* 弓(弧)+弦 */
      ctx.beginPath();
      ctx.moveTo(X(D.bedL / 2 + 0.06), Y(-D.bowH / 2));
      ctx.quadraticCurveTo(X(D.bedL / 2 + 0.28), Y(0), X(D.bedL / 2 + 0.06), Y(D.bowH / 2));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(X(D.bedL / 2 + 0.06), Y(-D.bowH / 2));
      ctx.lineTo(X(D.bedL / 2 - 0.10 + 0.3), Y(0));
      ctx.lineTo(X(D.bedL / 2 + 0.06), Y(D.bowH / 2));
      ctx.stroke();
      /* 箭匣(半剖)+ 矢 */
      ctx.strokeRect(X(-0.35), Y(D.bedH / 2 + 0.06), 0.34 * S, 0.16 * S);
      for (var k = 0; k < 5; k++) {
        ctx.beginPath();
        ctx.moveTo(X(-0.33 + k * 0.05), Y(D.bedH / 2 + 0.08));
        ctx.lineTo(X(-0.30 + k * 0.05), Y(D.bedH / 2 + 0.20));
        ctx.stroke();
      }
      /* 杠杆 + 牙 + 支架 */
      ctx.strokeRect(X(-0.85), Y(-D.bedH / 2 - 0.10), 0.9 * S, 0.05 * S);
      ctx.strokeRect(X(-0.18) - 3, Y(-D.bedH / 2 - 0.10) - 8, 6, 8);
      ctx.beginPath(); ctx.moveTo(X(-0.15), Y(-D.bedH / 2)); ctx.lineTo(X(-0.30), Y(-0.55)); ctx.stroke();
      /* 槽内矢 + 待发 */
      ctx.beginPath();
      ctx.moveTo(X(-0.12), Y(0.015));
      ctx.lineTo(X(-0.12 + D.arrowL), Y(0.015));
      ctx.stroke();
      /* 标注 */
      ctx.font = "600 8px sans-serif";
      ctx.fillStyle = "rgba(42,38,32,0.6)";
      ctx.fillText("弓", X(D.bedL / 2 + 0.20), Y(0.35));
      ctx.fillText("矢匣 10 矢", X(-0.35), Y(D.bedH / 2 + 0.30));
      ctx.fillText("杠杆", X(-0.85), Y(-D.bedH / 2 - 0.14));
      ctx.fillText("牙", X(-0.18) + 5, Y(-D.bedH / 2 - 0.16));

      /* ============ 右:循环状态机 ============ */
      var ox2 = w * 0.54;
      ctx.font = "700 11px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText("循环状态机 CYCLE", ox2, topY + 18);
      var steps = ["落矢", "后拉钩弦", "前推脱牙", "击发→飞行"];
      var sy = topY + 34;
      for (var k2 = 0; k2 < 4; k2++) {
        var y2 = sy + k2 * 24;
        ctx.strokeStyle = ink;
        ctx.strokeRect(ox2, y2, 26, 16);
        ctx.font = "700 9px sans-serif";
        ctx.fillText(String(k2 + 1), ox2 + 10, y2 + 12);
        ctx.font = "700 10px sans-serif";
        ctx.fillText(steps[k2], ox2 + 36, y2 + 12);
        ctx.font = "600 8.5px Menlo, monospace";
        ctx.fillStyle = "rgba(42,38,32,0.55)";
        var notes = ["匣底矢落入箭槽", "杠杆后拉 0.30 弦钩于牙", "牙推弦前移 0.06 脱钩", "弦弹回 0.32s 矢飞靶"];
        ctx.fillText(notes[k2], ox2 + 118, y2 + 12);
        ctx.fillStyle = ink;
        if (k2 < 3) {
          ctx.beginPath();
          ctx.moveTo(ox2 + 13, y2 + 16);
          ctx.lineTo(ox2 + 13, y2 + 24);
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.moveTo(ox2 + 13, sy + 3 * 24 + 16);
      ctx.lineTo(ox2 + 13, sy + 3 * 24 + 30);
      ctx.stroke();
      ctx.font = "600 8.5px Menlo, monospace";
      ctx.fillStyle = "rgba(42,38,32,0.55)";
      ctx.fillText("回①循环往复 · 一弩十矢", ox2 + 24, sy + 3 * 24 + 40);

      /* ============ 底部:参数链 ============ */
      var boxes = [
        ["杠杆往复", "±0.20 · 2.4 rad/s"], ["落矢", "匣底入槽"], ["后拉钩弦", "0.30 m"],
        ["前推脱牙", "弦回弹击发"], ["铁矢八寸", "0.27 m · 10 支"], ["连射", "一弩十矢俱发"]
      ];
      var bwid = (w * 0.91) / boxes.length;
      for (var b = 0; b < boxes.length; b++) {
        var bx2 = w * 0.045 + b * bwid;
        ctx.strokeStyle = ink;
        ctx.fillStyle = ink;
        ctx.strokeRect(bx2, chainY, bwid - 10, chainH);
        ctx.font = "700 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(boxes[b][0], bx2 + (bwid - 10) / 2, chainY + 17);
        ctx.font = "600 8.5px Menlo, monospace";
        ctx.fillStyle = "rgba(42,38,32,0.55)";
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
      '<h4>弩体</h4><table>' +
      '<tr><th>弩床</th><td>长 1.10(演示)· 厚 0.12</td><td>木</td></tr>' +
      '<tr><th>弓臂</th><td>半高 0.62 · 铜箍木臂</td><td>—</td></tr>' +
      '<tr><th>矢匣</th><td>10 矢叠放 · 半剖可视</td><td>—</td></tr>' +
      '<tr><th>铁矢</th><td>长八寸 = 0.27 m</td><td>钢</td></tr>' +
      '</table><h4>机构循环</h4><table>' +
      '<tr><th>杠杆行程</th><td>±0.20 m</td><td>2.0 s/循环</td></tr>' +
      '<tr><th>后拉钩弦</th><td>弦位移 0.30 m 钩于牙</td><td>0.65 s</td></tr>' +
      '<tr><th>前推脱牙</th><td>弦前移 0.06 脱钩弹回</td><td>0.55 s</td></tr>' +
      '<tr><th>矢飞行</th><td>8 m 靶 · 0.32 s</td><td>演示</td></tr>' +
      '<tr><th>射速</th><td>每循环 1 矢</td><td>30 发/分</td></tr>' +
      '</table><h4>运行期自检</h4>' +
      '<p>载入模拟 3.5 循环:恰发 3 矢;连跑 12 循环:恰发 10 矢(空匣停射),否则拒绝启动。</p>' +
      '<h4>文献</h4>' +
      '<p>《魏氏春秋》:「损益连弩,谓之元戎,以铁为矢,长八寸,一弩十矢俱发」;《武备志》载连弩图并「一夫执弩,一人推杠」之法。</p>'
  };
})(window.MECH = window.MECH || {});
