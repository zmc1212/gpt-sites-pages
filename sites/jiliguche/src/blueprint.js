/* 图纸面板(B 键):记里鼓车侧视总图 + 齿轮链图 + 比值公式 + 尺寸表 */
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
    no: "Fig. 05 · 复原总图",
    title: "记里鼓车 · 卢道隆制 · 齿轮系 100:1",
    src: "《宋史·舆服志》卷一百四十九 · 王振铎复原 · 演示压缩 20:1 明示",
    draw: function (ctx, w, h) {
      var D = MECH.DIM;
      ctx.clearRect(0, 0, w, h);
      var chainH = 44, chainY = h - chainH - 12, topY = 34;
      var ink = "#2A2620";
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("足轮径六尺(周18尺)→ 一里(1800尺)100 转;立100/下10/旋10/中100 ⇒ 中平轮每里一转 → 击鼓", w * 0.045, topY - 10);

      /* ============ 左:侧视图 ============ */
      var S = Math.min(w * 0.44 / 4.6, (chainY - topY - 26) / 3.4);
      var ox = w * 0.05, oy = chainY - 16;
      var X = function (m) { return ox + (m + 2.0) * S; }, Y = function (m) { return oy - m * S; };
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.4;
      ctx.font = "700 11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(车首向右)", ox, Y(3.1));
      /* 双轮 */
      [[1.1], [-1.1]].forEach(function (wx) {
        var wr = D.rWheel;
        ctx.beginPath(); ctx.arc(X(wx[0]), Y(wr), wr * S, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(X(wx[0]), Y(wr), 0.09 * S, 0, Math.PI * 2); ctx.stroke();
        for (var i = 0; i < 8; i++) {
          var a = i / 8 * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(X(wx[0]), Y(wr));
          ctx.lineTo(X(wx[0]) + Math.cos(a) * wr * S * 0.9, Y(wr) - Math.sin(a) * wr * S * 0.9);
          ctx.stroke();
        }
      });
      /* 车厢两层(侧壁) */
      ctx.strokeRect(X(-0.8), Y(D.axleY + 0.88), 1.6 * S, D.boxH1 * S);
      ctx.strokeRect(X(-0.55), Y(D.axleY + 0.88 + D.boxH1), 1.1 * S, D.boxH2 * S);
      /* 木人两小(下层)+ 一小(上层)+ 鼓 */
      ctx.beginPath(); ctx.arc(X(0.35), Y(D.axleY + 0.88 + 0.42), 4, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(-0.30), Y(D.axleY + 0.88 + 0.42), 4, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(0.02), Y(D.axleY + 0.88 + D.boxH1 + 0.30), 3.4, 0, Math.PI * 2); ctx.stroke();
      ctx.fillText("鼓", X(0.35) + 6, Y(D.axleY + 0.88 + 0.42) - 6);
      ctx.fillText("镯(上层)", X(0.02) + 6, Y(D.axleY + 0.88 + D.boxH1 + 0.30) - 6);
      /* 独辕 */
      ctx.beginPath(); ctx.moveTo(X(1.3), Y(0.72)); ctx.lineTo(X(2.3), Y(0.80)); ctx.stroke();
      /* 尺寸 */
      arrow(ctx, X(1.1) - D.rWheel * S, Y(-0.02), X(1.1) + D.rWheel * S, Y(-0.02), "径六尺", true);
      arrow(ctx, X(-0.8), Y(D.axleY + 0.88 + D.boxH1 + D.boxH2 + 0.2), X(0.8), Y(D.axleY + 0.88 + D.boxH1 + D.boxH2 + 0.2), "厢长八尺六寸(演示)", false);

      /* ============ 右:齿轮链图 ============ */
      var gx = w * 0.52, gy = topY + 30;
      ctx.font = "700 11px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText("齿轮链 GEAR CHAIN(总比 100:1)", gx, gy - 8);
      var chain = [
        ["足轮", "每里 100 转", 26],
        ["立轮 100 齿", "随足轮", 30],
        ["下平轮 10 齿", "×10", 12],
        ["旋风轮 10 齿", "同竖轴", 12],
        ["中平轮 100 齿", "÷100 → 每里一转", 30]
      ];
      var cy2 = gy + 12;
      for (var k = 0; k < chain.length; k++) {
        var cyy = cy2 + k * 34;
        ctx.strokeStyle = ink;
        ctx.beginPath(); ctx.arc(gx + 34, cyy, chain[k][2] * 0.55, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(gx + 34, cyy);
        ctx.lineTo(gx + 34 + Math.cos(k * 1.3) * chain[k][2] * 0.55, cyy + Math.sin(k * 1.3) * chain[k][2] * 0.55);
        ctx.stroke();
        ctx.font = "700 10px sans-serif";
        ctx.fillText(chain[k][0], gx + 78, cyy - 2);
        ctx.font = "600 8.5px Menlo, monospace";
        ctx.fillStyle = "rgba(42,38,32,0.55)";
        ctx.fillText(chain[k][1], gx + 78, cyy + 10);
        ctx.fillStyle = ink;
        if (k < chain.length - 1) {
          ctx.beginPath();
          ctx.moveTo(gx + 34, cyy + chain[k][2] * 0.55 + 2);
          ctx.lineTo(gx + 34, cyy + 34 - chain[k + 1][2] * 0.55 - 2);
          ctx.stroke();
        }
      }

      /* ============ 底部:参数链 ============ */
      var boxes = [
        ["足轮滚动", "径六尺 · 周 18 尺"], ["立轮 100", "随足轮同转"],
        ["两级减速", "10:1 × 10:1"], ["中平轮", "每里一转"],
        ["凸轮拨木人", "左右交替击鼓"], ["十里击镯", "上层木人"]
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
      '<h4>车体尺寸</h4><table>' +
      '<tr><th>足轮(×2)</th><td>径六尺 · 周 18 尺 · 12 辐铁箍</td><td>r = 0.90 m</td></tr>' +
      '<tr><th>车厢</th><td>双层:下层击鼓 · 上层击镯</td><td>演示缩尺</td></tr>' +
      '<tr><th>独辕</th><td>独辕双轮(宋制)</td><td>—</td></tr>' +
      '</table><h4>齿轮系(文献值)</h4><table>' +
      '<tr><th>立轮(×2)</th><td>100 齿 · 随足轮</td><td>1:1</td></tr>' +
      '<tr><th>下平轮</th><td>10 齿 · 冠轮</td><td>10:1</td></tr>' +
      '<tr><th>旋风轮</th><td>10 齿 · 同竖轴</td><td>1:1</td></tr>' +
      '<tr><th>中平轮</th><td>100 齿</td><td>1:10 → 总比 100:1</td></tr>' +
      '<tr><th>一里</th><td>1800 尺 ÷ 18 尺/转</td><td>100 转</td></tr>' +
      '</table><h4>演示压缩(明示)</h4>' +
      '<p>演示节奏取「每 2 足轮转记一里」(压缩 50:1);齿轮各级转角仍按文献比 100:1 严格联动。</p>' +
      '<p>击鼓左右交替(卢道隆制:左木人右木人隔里击鼓);每 4 演示里上层木人击镯(对应真实十里)。</p>' +
      '<h4>运行期自检</h4>' +
      '<p>载入即模拟 40s:击鼓间隔(转数)与演示值误差 > 0.02 转、或左右未交替,拒绝启动。</p>' +
      '<h4>文献</h4>' +
      '<p>《宋史·舆服志》:卢道隆记里鼓车「足轮各径六尺……行一里,下层木人击鼓;行十里,上层木人击镯」。</p>'
  };
})(window.MECH = window.MECH || {});
