/* 图纸面板(B 键):龙尾车总图 — 侧视(岸剖面) + 端视 A-A + 传动链
   分区:公式横幅(顶) / 侧视(左 0.03-0.50w) / 端视(右 0.53-0.98w) / 传动链(底) */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.35)", red = "#8C2F1E";

  function arrow(ctx, x1, y1, x2, y2, text, below) {
    ctx.strokeStyle = faint; ctx.fillStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    var s = 4, dir = x2 >= x1 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * dir, y2 - 3); ctx.lineTo(x2 - s * dir, y2 + 3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + s * dir, y1 - 3); ctx.lineTo(x1 + s * dir, y1 + 3); ctx.closePath(); ctx.fill();
    if (text) {
      ctx.font = "600 10px Menlo, monospace"; ctx.textAlign = "center";
      ctx.fillText(text, (x1 + x2) / 2, below ? (y1 + 13) : (y1 - 5));
    }
  }

  MECH.BP = {
    no: "Fig. 02 · 复原总图",
    title: "龙尾车 · 《泰西水法》斜置螺旋提水(徐光启《农政全书》卷十九)",
    src: "明·熊三拔《泰西水法·龙尾车记》(1612) · 围筒/填充系数为复原取值",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("ω螺旋 = 16/8 · ω拐 = 2ω拐 · q = λπ(R²−r²)S×2头 · H = 15尺×sinθ = 2.79m · Q = q·ω螺旋/2π", w * 0.03, topY - 12);

      /* ============ 左:侧视(z-y 剖面,池右岸左) ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 10) / 6.2, (chainY - topY - 34) / 4.2);
      var ox = svL + 4, oy = chainY - 14;
      var X = function (m) { return ox + (m + 1.6) * S; };
      var Y = function (m) { return oy - (m + 0.6) * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("侧视 SIDE(过螺旋轴剖面)", svL, topY + 12);
      /* 地面与岸台 */
      ctx.beginPath(); ctx.moveTo(X(-1.6), Y(0)); ctx.lineTo(X(4.6), Y(0)); ctx.stroke();
      ctx.strokeRect(X(-2.35), Y(3.42), 1.35 * S, 3.42 * S);
      /* 下池 */
      ctx.strokeStyle = "rgba(79,120,150,0.8)";
      ctx.strokeRect(X(-1.3), Y(D.pond.water), 2.6 * S, 0.12 * S);
      ctx.strokeStyle = ink;
      ctx.strokeRect(X(-1.36), Y(D.pond.wallH), 2.72 * S, D.pond.wallH * S);
      /* 螺旋轴(双线)+ 螺叶刻度 + 围筒轮廓 */
      var bx = X(D.B.z), by = Y(D.B.y), tx = X(D.T.z), ty = Y(D.T.y);
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
      for (var k = 1; k < 14; k++) {
        var f = k / 14;
        var kx = bx + (tx - bx) * f, ky = by + (ty - by) * f;
        ctx.beginPath(); ctx.moveTo(kx - 4, ky + 6); ctx.lineTo(kx + 4, ky - 6); ctx.stroke();
      }
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(X(D.B.z) - 7, Y(D.B.y) + 2); ctx.lineTo(X(D.T.z) - 7, Y(D.T.y) + 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(D.B.z) + 7, Y(D.B.y) - 2); ctx.lineTo(X(D.T.z) + 7, Y(D.T.y) - 2); ctx.stroke();
      ctx.setLineDash([]);
      /* 支座 */
      ctx.strokeRect(X(D.B.z) - 8, Y(D.B.y) - 14, 16, 14);
      ctx.strokeRect(X(D.T.z) - 8, Y(D.T.y) - 14, 16, 14);
      /* 拐轴(平行)+ 接轮/枢轮圆 + 拐臂 + 踏板 */
      var cx0 = X(D.B.z) - 0.9 * S * 0.8, cy0 = Y(D.B.y + 0.4);
      ctx.beginPath(); ctx.moveTo(cx0 - 14, cy0 - 10); ctx.lineTo(cx0 + 30, cy0 - 22); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx0 + 12, cy0 - 17, 0.30 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx0 + 12, cy0 - 17, 0.60 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx0 + 12, cy0 - 17, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx0 + 12 + 0.34 * S * 0.8, cy0 - 17 + 8); ctx.lineTo(cx0 + 12 + 0.34 * S * 0.8, cy0 - 17 + 8 + 0.62 * S * 0.8); ctx.stroke();
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("枢轮 8T(轴端)", cx0 + 16, cy0 - 22);
      ctx.fillText("接轮 16T(拐轴)", cx0 + 24, cy0 + 2);
      ctx.fillText("拐木·踏板(铅垂)", cx0 + 20, cy0 + 22);
      ctx.fillText("围筒(半透明,虚线)", bx - 44, ty - 8);
      /* 笧槽 + 蓄水柜 */
      ctx.beginPath(); ctx.moveTo(tx - 6, ty - 2); ctx.lineTo(tx - 34, ty - 2); ctx.stroke();
      ctx.strokeRect(tx - 52, ty + 4, 16, 12);
      ctx.fillStyle = faint;
      ctx.fillText("笧槽·蓄水柜", tx - 50, ty + 2);
      /* 尺寸 */
      arrow(ctx, bx + 26, by + 16, bx + 26, ty - 8, "扬程 H = 2.79m", false);
      arrow(ctx, bx - 10, Y(-0.30), tx + 10, Y(-0.30), "轴长 15尺(4.65m)", true);
      ctx.fillText("岸高 9尺 · sinθ=0.6", bx + 30, Y(1.55));

      /* ============ 右:端视 A-A(下端枢轮-接轮啮合 + 围筒) ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var S2 = Math.min((tvR - tvL - 16) / 2.6, (chainY - topY - 44) / 2.6);
      var cx2 = tvL + (tvR - tvL) / 2, cy2 = topY + 40 + (chainY - topY - 60) / 2;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("端视 A-A(下端轴系)", tvL, topY + 12);
      /* 围筒外圆 + 轴圆 */
      ctx.beginPath(); ctx.arc(cx2, cy2, D.Rout * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.arc(cx2, cy2, (D.Rout + 0.02) * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(cx2, cy2, D.rAxis * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx2, cy2, 2.5, 0, Math.PI * 2); ctx.fill();
      /* 双头螺叶端位 + 枢轮 8T */
      for (var i2 = 0; i2 < 2; i2++) {
        var th2 = i2 * Math.PI;
        ctx.strokeStyle = ink; ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx2 + Math.cos(th2) * D.rAxis * S2, cy2 + Math.sin(th2) * D.rAxis * S2);
        ctx.lineTo(cx2 + Math.cos(th2) * D.Rout * S2, cy2 + Math.sin(th2) * D.Rout * S2);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(cx2, cy2, D.rs * S2, 0, Math.PI * 2); ctx.stroke();
      /* 接轮 16T(圆心距 0.90,沿 -x) */
      var gx = cx2 - 0.90 * S2;
      ctx.beginPath(); ctx.arc(gx, cy2, D.rj * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(gx, cy2, 2.5, 0, Math.PI * 2); ctx.fill();
      for (var j2 = 0; j2 < 16; j2++) {
        var a2 = j2 / 16 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(gx + Math.cos(a2) * D.rj * 0.86 * S2, cy2 + Math.sin(a2) * D.rj * 0.86 * S2);
        ctx.lineTo(gx + Math.cos(a2) * D.rj * S2, cy2 + Math.sin(a2) * D.rj * S2);
        ctx.stroke();
      }
      /* 拐臂 + 踏板示意 */
      ctx.beginPath(); ctx.moveTo(gx + D.rj * S2 * 0.4, cy2); ctx.lineTo(gx + (D.rj + D.crankArm) * S2 * 0.75, cy2 + 8); ctx.stroke();
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif";
      ctx.fillText("枢轮 8T r0.30", cx2 + 8, cy2 - 6);
      ctx.fillText("接轮 16T r0.60", gx - 62, cy2 + 14);
      ctx.fillText("啮合距 0.90 = 0.30+0.60", cx2 - 40, cy2 + (D.Rout + 0.30) * S2);
      ctx.fillText("口袋 λ=0.7 · 螺距 S=0.42 双头", tvL + 4, chainY - 10);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["拐木踏动", "ω拐 0.25-0.9 rad/s"], ["接轮 16T", "r0.60 拐轴"],
        ["枢轮 8T", "r0.30 螺旋轴端"], ["螺旋轴", "ω螺旋=2ω拐 双头"],
        ["螺沟提水", "q=λπ(R²−r²)S×2"], ["笧槽·柜", "H=2.79m 累计量水"]
      ];
      var bwid = (w * 0.94) / boxes.length;
      for (var b = 0; b < boxes.length; b++) {
        var bx2 = w * 0.03 + b * bwid;
        ctx.strokeStyle = ink;
        ctx.strokeRect(bx2, chainY, bwid - 10, chainH);
        ctx.fillStyle = ink; ctx.font = "700 10px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(boxes[b][0], bx2 + (bwid - 10) / 2, chainY + 17);
        ctx.font = "600 8.5px Menlo, monospace"; ctx.fillStyle = faint;
        ctx.fillText(boxes[b][1], bx2 + (bwid - 10) / 2, chainY + 32);
        if (b < boxes.length - 1) {
          ctx.beginPath(); ctx.moveTo(bx2 + bwid - 10, chainY + 20); ctx.lineTo(bx2 + bwid - 2, chainY + 20); ctx.stroke();
        }
      }
    },
    table:
      '<h4>部件尺寸(文献值+复原取值)</h4><table>' +
      '<tr><th>螺旋轴</th><td>长 15尺(4.65m)· 径 = 长×2/25 = 1.2尺</td><td>r = 0.186 m</td></tr>' +
      '<tr><th>倾角</th><td>岸高 9尺:轴长 15尺(「三五之法」)</td><td>sinθ = 0.6</td></tr>' +
      '<tr><th>围筒</th><td>R 0.30 · 半透明可视螺沟 · 二节累接</td><td>墙高 0.114 m</td></tr>' +
      '<tr><th>螺叶</th><td>双头 · 螺距 S 0.42(取值)</td><td>—</td></tr>' +
      '<tr><th>枢轮</th><td>Z8 · 螺旋轴下端</td><td>r = 0.30 m</td></tr>' +
      '<tr><th>接轮</th><td>Z16 · 拐轴(平行偏置 0.90)</td><td>r = 0.60 m</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>齿比:ω螺旋 = (Z接/Z枢)·ω拐 = 16/8 = 2·ω拐(「拐木一转而得二转」,载入断言)。</p>' +
      '<p>每转提水 q = λ·π(R²−r²)·S·Z头 = 0.7×π×0.0554×0.42×2 = 0.102 m³/rev;Q = q·ω螺旋/2π。</p>' +
      '<p>扬程 H = 轴长×sinθ = 2.79 m(布局断言);运行期积分校验 ∫Qdt = q·φ螺旋/2π(maxErr&lt;1e-9)。</p>' +
      '<p>额定踏频 0.45 rad/s(≈4.3/min,压缩演示):Q ≈ 14.7 L/s,P = ρgQH/η ≈ 617W —— 需畜力/多人轮踏;调研结论:效率低于翻车、历史未推广(POWER 面板明示)。</p>' +
      '<h4>文献</h4>' +
      '<p>《泰西水法·龙尾车记》:「其制有六:轴、墙、围、枢、轮、架」「枢轮之齿八,人车之接轮齿十六,是拐木一转而得二转」「二十五分其轴之长,以其二为之径」「凡围板长一丈,水高必六尺」。</p>' +
      '<p>围筒半径、螺距、填充系数 λ 为使流量公式严格成立的复原取值(原文自承齿数「约略作之,非定率也」)。</p>'
  };
})(window.MECH = window.MECH || {});
