/* 图纸面板(B 键):猛火油柜复原侧视总图 + 增压链 + 尺寸表。 */
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
    no: "Fig. 21 · 复原总图",
    title: "猛火油柜 · 双筒活塞喷火器(《武经总要》)",
    src: "《武经总要》猛火油柜节 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("增压 k = (r活/r喷)² = (0.045/0.012)² = 14.06   ·   v_jet = k·v活 = 14.06 × 0.22 ≈ 3.09 m/s   ·   双筒反相连续供油", w * 0.03, topY - 8);

      /* —— 左:侧视图 —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 2.0, (regionH - 12) / 1.3);
      var oy = topY + regionH - 0.72 * S;
      function X(m) { return ox + 0.4 * S + (m + 1.0) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(喷向 +x →)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(1.2), Y(0)); ctx.lineTo(X(-1.0), Y(0)); ctx.stroke();
      /* 底架 */
      ctx.strokeRect(X(-0.9), Y(0), 1.6 * S, 0.10 * S);
      /* 油柜(圆) */
      ctx.beginPath(); ctx.arc(X(D.tankX), Y(D.tankY), D.tankR * S, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = waterC;
      ctx.beginPath(); ctx.moveTo(X(D.tankX - 0.20), Y(D.tankOil0)); ctx.lineTo(X(D.tankX + 0.20), Y(D.tankOil0)); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 双筒 + 杆(双态) */
      ctx.strokeRect(X(-0.17), Y(D.cylY - 0.06), 0.30 * S, 0.12 * S);
      ctx.beginPath(); ctx.arc(X(D.tankX + 0.26), Y(D.cylY - 0.02), 0.022 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(-0.16), Y(D.cylY)); ctx.lineTo(X(D.towerX + 0.06), Y(D.towerY + 0.02)); ctx.stroke();
      /* 火楼 + 火流(红) */
      ctx.strokeRect(X(D.towerX - 0.05), Y(D.towerY - 0.28), 0.10 * S, 0.22 * S);
      ctx.strokeStyle = red;
      ctx.beginPath(); ctx.moveTo(X(D.towerX + 0.06), Y(D.towerY + 0.02));
      ctx.lineTo(X(D.towerX + 0.06 + 0.75), Y(D.towerY + 0.02)); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 尺寸 */
      arrowV(ctx, X(-0.85), Y(D.tankY - D.tankR), Y(D.tankY + D.tankR), "柜径 0.46", -1);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("红:火流(喷口→前 0.75m)· 蓝线:柜油面 · 双筒反相推拉", ox, chainY - 14);

      /* —— 右:增压链 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("增压链", rx, topY + 12);
      var boxes = [
        ["唧杆推拉", "行程 0.22m · 反相"],
        ["活塞 r 0.045", "筒内吸/排交替"],
        ["面积比 14:1", "(0.045/0.012)²"],
        ["喷口 r 0.012", "v_jet = k·v活 ≈ 3.09"],
        ["火楼引燃", "油流过火药即燃"]
      ];
      var gy0 = topY + 26;
      boxes.forEach(function (b, i) {
        var y = gy0 + i * 21;
        ctx.strokeStyle = i === 4 ? red : ink; ctx.lineWidth = 1.1;
        ctx.strokeRect(rx, y, rw, 17);
        ctx.fillStyle = ink;
        ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
        ctx.fillText(b[0], rx + 6, y + 12);
        ctx.fillStyle = faint;
        ctx.font = "600 8px Menlo, monospace"; ctx.textAlign = "right";
        ctx.fillText(b[1], rx + rw - 6, y + 12);
        if (i < boxes.length - 1) {
          ctx.beginPath(); ctx.moveTo(rx + rw / 2, y + 17); ctx.lineTo(rx + rw / 2, y + 21); ctx.stroke();
        }
      });

      /* —— 右下:排量 —— */
      var by = gy0 + 112;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("单程排量", rx, by - 6);
      ctx.font = "600 8.5px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText("V = π·r活²·x = 1.40 L/半程", rx, by + 8);
      ctx.fillStyle = faint;
      ctx.fillText("双筒反相 → 连续供油不歇", rx, by + 22);

      /* —— 底部:部件链 —— */
      var boxes = [
        ["底架", "木架双支柱"], ["油柜", "铜柜贮油"], ["双活塞筒", "吸排交替"],
        ["唧杆把手", "反相 ±0.11m"], ["火楼", "火药引燃"], ["火流", "油流喷燃"]
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
      '<h4>柜与筒</h4><table>' +
      '<tr><th>油柜</th><td>铜柜 r 0.24 × 0.44 · 柜油面 0.72</td><td>贮油约 30 L</td></tr>' +
      '<tr><th>双活塞筒</th><td>r 0.045 + 0.015 壁 · 长 0.30</td><td>沿 x 双列</td></tr>' +
      '<tr><th>唧杆</th><td>行程 0.22 m · 双杆反相</td><td>周期 1.0 s</td></tr>' +
      '</table><h4>增压与喷燃</h4><table>' +
      '<tr><th>面积比</th><td>k = (0.045/0.012)²</td><td>14.06(严格断言)</td></tr>' +
      '<tr><th>活塞速</th><td>v活 = 0.22/1.0</td><td>0.22 m/s</td></tr>' +
      '<tr><th>喷速</th><td>v_jet = k·v活 = 3.09 m/s</td><td>∈ (2.5, 4) 断言</td></tr>' +
      '<tr><th>单程排量</th><td>V = π·0.045²×0.22</td><td>1.40 L/半程</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>增压比 k = 14.0625(载入期严格断言);喷速 v_jet = 3.09 ∈ (2.5,4)(断言);杆程 0.22(严格断言)。</p>' +
      '<p>运行期 errPos = 杆把手世界 x 与解析(0.36 ± rodOff)之差 ≈ 0;油面随 oilUsed 缓降。</p>' +
      '<h4>文献</h4>' +
      '<p>《武经总要》猛火油柜:「以猛火油柜喷火……放猛火油,中人皆烂」——铜质双筒唧泵 + 火楼引燃,为世界第一具实用火焰喷射器。</p>'
  };
})(window.MECH = window.MECH || {});
