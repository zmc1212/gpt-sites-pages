/* 图纸面板(B 键):地动仪剖视总图 + 都柱受力详图 + 机构公式 + 尺寸表 */
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
    no: "Fig. 04 · 复原剖视图",
    title: "候风地动仪 · 都柱倒立摆 · 八道施关发机",
    src: "《后汉书·张衡传》 · 外形按王振铎复原 · 机构取冯锐 2005 倒立摆复原思路",
    draw: function (ctx, w, h) {
      var D = MECH.DIM;
      ctx.clearRect(0, 0, w, h);
      var chainH = 44, chainY = h - chainH - 12, topY = 34;
      var ink = "#2A2620";
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("触发角 6° · 都柱偏移 = 1.05×sin6° = 0.11 m → 推开八道关 → 龙钩释放铜丸", w * 0.045, topY - 10);

      /* ============ 左:剖视图 ============ */
      var S = Math.min(w * 0.40 / 2.6, (chainY - topY - 26) / 2.8);
      var ox = w * 0.05, oy = chainY - 16;
      var X = function (mx) { return ox + (mx + 1.15) * S; }, Y = function (my) { return oy - my * S; };
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.4;
      ctx.font = "700 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("剖视 SECTION(露都柱八道)", ox, Y(2.7));
      /* 樽体轮廓(半剖):左壁 + 顶盖 + 底 */
      ctx.beginPath();
      ctx.moveTo(X(-D.vatR), Y(D.baseH));
      ctx.lineTo(X(-D.vatR), Y(D.baseH + D.vatH));
      ctx.arc(X(0), Y(D.baseH + D.vatH), D.vatR * S, Math.PI, 0, false);
      ctx.lineTo(X(D.vatR * 0.25), Y(D.baseH + D.vatH));      // 右壁剖开(虚)
      ctx.setLineDash([4, 3]);
      ctx.lineTo(X(D.vatR * 0.25), Y(D.baseH));
      ctx.setLineDash([]);
      ctx.lineTo(X(-D.vatR), Y(D.baseH));
      ctx.closePath();
      ctx.stroke();
      ctx.strokeRect(X(-D.baseR), Y(D.baseH), 2 * D.baseR * S, D.baseH * S);
      /* 都柱(倒立摆,倾斜触发位)+ 枢轴 */
      ctx.save();
      ctx.translate(X(0), Y(D.pivotY));
      ctx.rotate(D.trigRad);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, D.pendL * S); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, D.pendL * S, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.beginPath(); ctx.arc(X(0), Y(D.pivotY), 3, 0, Math.PI * 2); ctx.fill();
      ctx.font = "600 9px sans-serif";
      ctx.fillStyle = "rgba(42,38,32,0.6)";
      ctx.fillText("都柱 · 倒立摆", X(0) + 8, Y(D.pivotY + 0.45));
      /* 八道(示意斜线)+ 龙首 + 铜丸落线 */
      ctx.strokeStyle = ink;
      for (var k = 0; k < 4; k++) {
        var yk = D.dragonY - k * 0.12;
        ctx.beginPath();
        ctx.moveTo(X(0.2), Y(D.pivotY + 0.1));
        ctx.lineTo(X(D.vatR - 0.06), Y(yk));
        ctx.stroke();
      }
      /* 龙首(右侧剖面)+ 铜丸抛物线 + 蟾蜍 */
      ctx.beginPath(); ctx.arc(X(D.vatR - 0.02), Y(D.dragonY), 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillText("龙口含丸", X(D.vatR - 0.02) - 20, Y(D.dragonY) - 8);
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(X(D.vatR - 0.02), Y(D.dragonY));
      ctx.quadraticCurveTo(X(D.vatR + 0.22), Y((D.dragonY + D.toadY) / 2), X(D.toadR), Y(D.toadY + 0.2));
      ctx.stroke();
      ctx.setLineDash([]);
      /* 蟾蜍 */
      ctx.beginPath(); ctx.arc(X(D.toadR), Y(D.toadY + 0.1), 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillText("蟾蜍张口承丸", X(D.toadR) - 18, Y(D.toadY) + 0.24 * S);
      /* 尺寸 */
      arrow(ctx, X(-D.vatR) - 10, Y(D.baseH), X(-D.vatR) - 10, Y(D.baseH + D.vatH), "", false);
      ctx.fillStyle = "rgba(42,38,32,0.55)";
      ctx.font = "600 9px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("樽高 1.95", X(-D.vatR) - 14, Y(D.baseH + D.vatH / 2));
      ctx.textAlign = "left";

      /* ============ 右:都柱原理详图 ============ */
      var ox2 = w * 0.54;
      ctx.font = "700 11px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText("都柱倒立摆原理", ox2, topY + 18);
      var gx = ox2, gy = topY + 32, gw = w - ox2 - 24, gh = chainY - gy - 40;
      ctx.strokeStyle = "rgba(42,38,32,0.5)";
      ctx.strokeRect(gx, gy, gw, gh);
      /* 地面 + 摆(直立虚/倾斜实) */
      ctx.beginPath(); ctx.moveTo(gx + 8, gy + gh - 8); ctx.lineTo(gx + gw - 8, gy + gh - 8); ctx.stroke();
      var pxx = gx + gw / 2, pyy = gy + gh - 8;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(pxx, pyy); ctx.lineTo(pxx, pyy - gh * 0.66); ctx.stroke();
      ctx.setLineDash([]);
      ctx.save();
      ctx.translate(pxx, pyy);
      ctx.rotate(-D.trigRad);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -gh * 0.66); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -gh * 0.66, 4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.beginPath(); ctx.arc(pxx, pyy, 3.5, 0, Math.PI * 2); ctx.fill();
      /* 地震波箭头 */
      ctx.beginPath();
      ctx.moveTo(gx + 10, gy + gh - 16);
      ctx.lineTo(gx + 44, gy + gh - 16);
      ctx.stroke();
      ctx.fillText("地震波 →", gx + 10, gy + gh - 20);
      ctx.fillStyle = "rgba(42,38,32,0.55)";
      ctx.font = "600 9px sans-serif";
      ctx.fillText("柱顶偏移 0.11 m → 推八道关 → 龙钩释丸", gx + 8, gy + 14);
      ctx.fillText("触发后摆体阻尼回正(τ≈1.2s)", gx + 8, gy + 28);
      ctx.fillStyle = red;
      ctx.font = "700 10px Menlo, monospace";
      ctx.fillText("《后汉书》:「验之以事,合契若神」", gx + 8, gy + gh - 22);

      /* ============ 底部:参数链 ============ */
      var boxes = [
        ["地震波至", "都柱失稳"], ["倒向震源", "触发角 6°"], ["八道施关", "推开发机"],
        ["龙口释丸", "铜丸落下"], ["蟾蜍承之", "振声报警"], ["验之以事", "知震源方位"]
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
      '<h4>樽体</h4><table>' +
      '<tr><th>铜樽</th><td>径 1.44 · 高 1.95 · 半剖展示</td><td>合盖隆起</td></tr>' +
      '<tr><th>基座</th><td>径 1.72 × 高 0.18</td><td>山纹基</td></tr>' +
      '<tr><th>龙首(×8)</th><td>八方环列 · 口含铜丸</td><td>45° 等分</td></tr>' +
      '<tr><th>蟾蜍(×8)</th><td>距 1.96 · 口高 0.59</td><td>张口承丸</td></tr>' +
      '</table><h4>都柱机构</h4><table>' +
      '<tr><th>都柱</th><td>倒立摆 · 摆长 1.05</td><td>枢轴 y=1.15</td></tr>' +
      '<tr><th>触发角</th><td>柱顶偏移 1.05×sin6°</td><td>0.11 m</td></tr>' +
      '<tr><th>倾斜用时</th><td>rise 0.8s → 触发</td><td>—</td></tr>' +
      '<tr><th>回正</th><td>阻尼 τ≈1.2s · 振荡 1.6s</td><td>&lt; 3.2s</td></tr>' +
      '<tr><th>铜丸飞行</th><td>龙口→蟾蜍口 0.55s 抛物线</td><td>—</td></tr>' +
      '</table><h4>运行期自检</h4>' +
      '<p>载入即模拟「东震」事件:触发方位=落丸方位严格一致、其它七方零误触发、摆 3.2s 内回正,否则拒绝启动。</p>' +
      '<h4>文献</h4>' +
      '<p>《后汉书·张衡传》:「阳嘉元年,复造候风地动仪……中有都柱,傍行八道,施关发机;外有八龙,首衔铜丸,下有蟾蜍,张口承之……验之以事,合契若神。」</p>' +
      '<p>外观取王振铎 1951 复原;都柱倒立摆机制取冯锐 2005 复原方案(本项目为原理演示)。</p>'
  };
})(window.MECH = window.MECH || {});
