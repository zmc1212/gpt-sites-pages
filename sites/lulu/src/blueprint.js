/* 图纸面板(B 键):辘轳复原侧视简图 + 绳长行程图 + 省力比图 + 部件链 + 尺寸表。
   分区:顶部公式横幅 / 左侧视(大)/ 右列(绳长行程 + 省力比)/ 底部部件链,互不重叠。 */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.38)", faint2 = "rgba(42,38,32,0.22)";
  var waterC = "#3E6E86", woodC = "#6E4E28", red = "#8C2F1E";

  function arrowH(ctx, x1, x2, y, text, below) {
    ctx.strokeStyle = faint; ctx.fillStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    var s = 4, dir = x2 >= x1 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x2, y); ctx.lineTo(x2 - s * dir, y - 3); ctx.lineTo(x2 - s * dir, y + 3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x1 + s * dir, y - 3); ctx.lineTo(x1 + s * dir, y + 3); ctx.closePath(); ctx.fill();
    ctx.font = "600 9px Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText(text, (x1 + x2) / 2, below ? y + 12 : y - 5);
  }
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
    no: "Fig. 03 · 复原总图",
    title: "辘轳 · 卷筒绞车汲水(汉画像石制式)",
    src: "汉画像石辘轳图像 · 《农政全书》《天工开物》井绳卷筒 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("省力比 i = 柄臂/筒径 = 0.55/0.22 = 2.5   ·   满载柄力 = 14/2.5 = 5.6 kg·f   ·   单程放绳 0.85m = 卷筒 221°", w * 0.03, topY - 8);

      /* —— 左:侧视图(视向 +x,南 → 右) —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 4.7, (regionH - 10) / 3.7);
      var oy = topY + regionH - 0.45 * S;
      function X(m) { return ox + 0.25 * S + (4.4 - m) * S; }   // m 为 z,南(小 z)在右
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(南 · 瓦盆 → 右)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(4.4), Y(0)); ctx.lineTo(X(0.0), Y(0)); ctx.stroke();
      /* 井台 + 井栏截面 + 水 */
      ctx.strokeRect(X(4.42), Y(0.18), (4.42 - 1.18) * S, 0.18 * S);
      [[1.56, 1.72], [3.88, 4.04]].forEach(function (zb) {
        ctx.strokeRect(X(zb[1]), Y(D.kerbTop), (zb[1] - zb[0]) * S, (D.kerbTop - 0.18) * S);
        ctx.strokeRect(X(zb[1]), Y(D.kerbTop), (zb[1] - zb[0]) * S, (D.kerbTop - 0.18) * S);
      });
      ctx.strokeStyle = faint2;
      ctx.strokeRect(X(3.88), Y(D.poolFloor), (3.88 - 1.72) * S, (D.waterY - D.poolFloor) * S);
      ctx.fillStyle = "rgba(62,110,134,0.28)";
      ctx.fillRect(X(3.88), Y(D.waterY), (3.88 - 1.72) * S, (D.waterY - D.poolFloor) * S);
      ctx.strokeStyle = waterC; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(X(3.88), Y(D.waterY)); ctx.lineTo(X(1.72), Y(D.waterY)); ctx.stroke();
      ctx.strokeStyle = ink; ctx.lineWidth = 1.3;
      /* 立架截面(A 形双柱投影重合,画单柱示意)+ 轴 */
      ctx.beginPath(); ctx.moveTo(X(2.8 + 0.42), Y(0)); ctx.lineTo(X(2.8), Y(D.axleY)); ctx.lineTo(X(2.8 - 0.42), Y(0)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(2.8), Y(D.axleY), 0.09 * S, 0, Math.PI * 2); ctx.stroke();
      /* 卷筒双态:实线高位(绳短)虚线低位(绳长) */
      function ropeSym(L, phiDeg, dash) {
        var f = phiDeg * Math.PI / 180;
        var tx = 2.8, ty = D.axleY - D.rDrum;
        var ex = tx - L * Math.sin(f), ey = ty - L * Math.cos(f);
        ctx.setLineDash(dash ? [5, 4] : []);
        ctx.strokeStyle = dash ? faint : ink;
        ctx.lineWidth = dash ? 1.3 : 2.0;
        ctx.beginPath(); ctx.moveTo(X(tx), Y(ty)); ctx.lineTo(X(ex), Y(ey)); ctx.stroke();
        var cy2 = ey - (D.bailR + D.bucketH / 2) * Math.cos(f);
        var cx2 = ex - (D.bailR + D.bucketH / 2) * Math.sin(f);
        ctx.strokeRect(X(cx2 + 0.20), Y(cy2 + 0.225), 0.40 * S, 0.45 * S);
        ctx.setLineDash([]);
        ctx.strokeStyle = ink; ctx.lineWidth = 1.3;
      }
      ropeSym(D.Llow, 0, true);
      ropeSym(D.Lhigh, 0, false);
      /* 卷筒圆 + 摇柄双态(ψ=0 实线向上 / ψ=180° 虚线向下) */
      ctx.beginPath(); ctx.arc(X(2.8), Y(D.axleY), D.rDrum * S, 0, Math.PI * 2); ctx.stroke();
      [0, 180].forEach(function (deg2, i) {
        var a = deg2 * Math.PI / 180;
        ctx.setLineDash(i === 1 ? [4, 3] : []);
        ctx.strokeStyle = i === 1 ? faint : ink;
        ctx.lineWidth = i === 1 ? 1.2 : 2.0;
        ctx.beginPath();
        ctx.moveTo(X(2.8), Y(D.axleY));
        ctx.lineTo(X(2.8) + Math.sin(a) * D.rCrank * S, Y(D.axleY) - Math.cos(a) * D.rCrank * S);
        ctx.stroke();
        ctx.setLineDash([]);
      });
      /* 瓦盆 */
      ctx.strokeRect(X(D.basinZ + D.basinR), Y(D.basinRim), 2 * D.basinR * S, (D.basinRim - D.stoolH) * S);
      ctx.strokeStyle = waterC;
      ctx.beginPath(); ctx.moveTo(X(D.basinZ + D.basinR - 0.05), Y(D.basinWater)); ctx.lineTo(X(D.basinZ - D.basinR + 0.05), Y(D.basinWater)); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 尺寸标注 */
      arrowH(ctx, X(2.8 + 0.42), X(2.8 - 0.42), Y(0) - 10, "立架开档 0.84", true);
      arrowV(ctx, X(0.9), Y(0), Y(D.axleY), "轴高 2.55 m", 1);
      arrowV(ctx, X(4.30), Y(0.18), Y(D.kerbTop), "井栏高 1.12 m", -1);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("实线 高位 L=0.51 · 虚线 下放 L=1.36(桶没入水面 0.17m)", ox, chainY - 14);

      /* —— 右上:绳长行程图 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("绳长行程 L", rx, topY + 12);
      var gx0 = rx + 44, gw = rw * 0.62, gy0 = topY + 24, gh = 96;
      function yL(L) { return gy0 + (L - D.Lhigh) / (D.Llow - D.Lhigh) * gh; }
      ctx.strokeStyle = faint2; ctx.lineWidth = 1;
      ctx.strokeRect(gx0, gy0, gw, gh);
      ctx.strokeStyle = waterC;
      ctx.beginPath(); ctx.moveTo(gx0 - 6, yL(1.19)); ctx.lineTo(gx0 + gw + 6, yL(1.19)); ctx.stroke();
      ctx.fillStyle = "rgba(62,110,134,0.14)";
      ctx.fillRect(gx0, yL(1.19), gw, gy0 + gh - yL(1.19));
      ctx.fillStyle = ink;
      ctx.font = "600 8.5px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("0.51 高位", gx0 + gw + 8, yL(D.Lhigh) + 3);
      ctx.fillText("1.36 下放", gx0 + gw + 8, yL(D.Llow) + 3);
      ctx.fillStyle = waterC;
      ctx.fillText("1.19 触水", gx0 + gw + 8, yL(1.19) + 3);
      ctx.fillStyle = ink;
      ctx.fillText("放绳 0.85 m ↔ ψ 221°", gx0, gy0 + gh + 14);

      /* —— 右下:省力比图 —— */
      var by = gy0 + gh + 34, bw = rw * 0.52, bx = rx + 44;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("省力比 kg·f", rx, by - 12);
      var bars = [["空载柄力 0.8", 0.8, woodC], ["满载柄力 5.6", 5.6, red], ["满载载荷 14.0", 14.0, ink]];
      bars.forEach(function (b, i) {
        var y = by + i * 16;
        ctx.fillStyle = b[2] === ink ? faint2 : b[2];
        ctx.globalAlpha = b[2] === ink ? 1 : 1;
        ctx.fillRect(bx, y, b[1] / 14 * bw, 9);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = ink; ctx.lineWidth = 0.8;
        ctx.strokeRect(bx, y, b[1] / 14 * bw, 9);
        ctx.fillStyle = ink;
        ctx.font = "600 8.5px Menlo, monospace"; ctx.textAlign = "right";
        ctx.fillText(b[0], bx - 6, y + 8);
      });
      ctx.fillStyle = red; ctx.textAlign = "left";
      ctx.font = "700 9px Menlo, monospace";
      ctx.fillText("F = 载荷 / i —— i = 2.5 单手可摇", bx - 6, by + 54);

      /* —— 底部:部件链 —— */
      var boxes = [
        ["摇柄", "柄臂 0.55m"], ["横轴", "高 2.55m · 铜套"], ["卷筒", "径 0.22m · 缠绳"],
        ["井绳", "0.51 ↔ 1.36m"], ["木桶", "提梁 · 空2/满14kg"], ["瓦盆", "摆出倾倒 · 波纹"]
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
      '<h4>卷筒绞车</h4><table>' +
      '<tr><th>卷筒</th><td>径 0.22 m · 宽 0.44 m · 绳槽沿</td><td>钢轴 + 铜套</td></tr>' +
      '<tr><th>摇柄</th><td>柄臂 0.55 m · 木柄 0.30 m</td><td>省力比 i = 2.5</td></tr>' +
      '<tr><th>横轴</th><td>高 2.55 m · 跨距 3.24 m</td><td>A 形双立架</td></tr>' +
      '<tr><th>井绳</th><td>高位 0.51 ↔ 下放 1.36 m</td><td>单程放绳 0.85 m(ψ 221°)</td></tr>' +
      '<tr><th>木桶</th><td>径 0.40 m · 高 0.45 m · 提梁 0.24 m</td><td>空 2 kg / 满 14 kg</td></tr>' +
      '</table><h4>井体</h4><table>' +
      '<tr><th>井栏</th><td>汉代陶井式高井栏 · 口内 2.16 m</td><td>栏高 1.12 m</td></tr>' +
      '<tr><th>水面</th><td>+0.45 m(池深 0.32 m)</td><td>下放位桶没入 0.17 m</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>省力比 i = 柄臂/筒径 = 0.55/0.22 = 2.5(载入期断言严格成立)。满载柄力 F = (2+12)/2.5 = 5.6 kg·f ∈ (3,10),单手可摇;空载 0.8 kg·f。</p>' +
      '<p>绳长 L 与卷筒角 ψ 线性耦合:L = 0.51 + 0.22·(−ψ)。桶全程竖垂悬挂于筒底切点(0, 2.33, 2.8)下方,端到端误差 errPos 运行期自检。</p>' +
      '<p>下放位桶底 0.28 m:没入水面 0.17 m、距池底 0.15 m;摆出位(φ=46°)桶南缘距井栏内壁 0.18 m、桶底高出盆沿 0.55 m —— 均为载入期断言。</p>' +
      '<h4>文献</h4>' +
      '<p>辘轳见于汉画像石(成都、嘉祥等);《农政全书》卷辘轳图、《天工开物》井汲皆为此制:立架横轴、卷筒摇柄、井绳吊桶。</p>'
  };
})(window.MECH = window.MECH || {});
