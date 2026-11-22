/* 图纸面板(B 键):云梯总图 — 侧视(立起态) + 传动链 */
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
    no: "Fig. 10 · 复原总图",
    title: "云梯 · 《武经总要·前集·卷十》车载折叠梯",
    src: "《武经总要·前集·卷十》+《太白阴经》双辘轳(借鉴) · 抓钩为复原画法(推算)",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("立梯绞绳 Δs = 2.5(sin55°−sin15°) = 1.40m → 圈数 1.86(r0.12) · 飞梯 +2.2m → 2.92 圈 · H = 8.4·sin55°+1.10 = 7.98m", w * 0.03, topY - 12);

      /* ============ 左:侧视(立起态) ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 10) / 9.6, (chainY - topY - 30) / 8.6);
      var ox = svL + 4, oy = chainY - 14;
      var X = function (m) { return ox + (m + 1.8) * S; };
      var Y = function (m) { return oy - m * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("侧视 SIDE(立起 55°)", svL, topY + 12);
      /* 地面 + 城墙 */
      ctx.beginPath(); ctx.moveTo(X(D.wallX - D.wallT / 2 - 0.3), Y(0)); ctx.lineTo(X(2.2), Y(0)); ctx.stroke();
      ctx.strokeRect(X(D.wallX - D.wallT / 2), Y(7.2), D.wallT * S, 7.2 * S);
      /* 城堞 */
      for (var i = 0; i < 4; i++) {
        ctx.strokeRect(X(D.wallX - D.wallT / 2) + i * 0.5 * S, Y(7.75), 0.3 * S, 0.55 * S);
      }
      /* 床 + 轮 + 屏 */
      ctx.strokeRect(X(-1.3), Y(1.17), 2.6 * S, 0.14 * S);
      [-1.05, 0, 1.05].forEach(function (px) {
        ctx.beginPath(); ctx.arc(X(px), Y(0.30), D.wheelR * S, 0, Math.PI * 2); ctx.stroke();
      });
      ctx.strokeRect(X(-1.3), Y(1.95), 2.5 * S, 0.85 * S);
      /* 主梯(立起)+ 飞梯(双线)+ 抓钩 */
      var pxv = X(0.35), pyv = Y(1.10);
      var ex = pxv - D.Lmain * S * Math.cos(D.th1), ey = pyv - D.Lmain * S * Math.sin(D.th1);
      ctx.beginPath(); ctx.moveTo(pxv, pyv); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pxv - 0.08 * S, pyv); ctx.lineTo(ex - 0.08 * S, ey); ctx.stroke();
      var fx = ex - D.Lfly * S * Math.cos(D.th1), fy = ey - D.Lfly * S * Math.sin(D.th1);
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(fx, fy, 4, 0, Math.PI * 2); ctx.stroke();
      /* 转轴 + 绞车 + 绳 */
      ctx.beginPath(); ctx.arc(pxv, pyv, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeRect(X(1.15), Y(1.10), 0.30 * S, 0.30 * S);
      ctx.beginPath(); ctx.moveTo(X(1.30), Y(1.25)); ctx.lineTo(pxv, pyv); ctx.stroke();
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("牛皮屏", X(-1.28), Y(2.05));
      ctx.fillText("床·六轮", X(-1.2), Y(0.35));
      ctx.fillText("转轴(中施转轴)", pxv + 6, pyv - 4);
      ctx.fillText("绞车(太白阴经双辘轳,借鉴)", X(0.85), Y(0.90));
      ctx.fillText("飞梯 2.2m(虚线)", fx + 6, fy + 8);
      ctx.fillText("抓钩(推算)", fx - 6, fy - 8);
      /* 尺寸 */
      arrow(ctx, pxv, pyv - 10, ex, ey - 10, "主梯 6.2m", false);
      arrow(ctx, ex - 8, ey + 8, fx, fy, "", false);
      arrow(ctx, X(-7.7), Y(-0.15), X(2.2), Y(-0.15), "抵距 = Lcos55° + 0.35 ≈ 5.16m", true);
      arrow(ctx, X(2.0), Y(1.10), X(2.0), Y(7.98), "可达 H = 7.98m", false);

      /* ============ 右:折叠态 + 转轴细节 ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var S2 = Math.min((tvR - tvL - 12) / 9.6, (chainY - topY - 44) / 3.0);
      var ox2 = tvL + 10, oy2 = chainY - 26;
      var X2 = function (m) { return ox2 + (m + 1.8) * S2; };
      var Y2 = function (m) { return oy2 - (m - 0.2) * S2; };
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("折叠态(15°)与转轴", tvL, topY + 12);
      ctx.beginPath(); ctx.moveTo(X2(-1.8), Y2(0)); ctx.lineTo(X2(2.2), Y2(0)); ctx.stroke();
      ctx.strokeRect(X2(-1.3), Y2(1.17), 2.6 * S2, 0.14 * S2);
      var px2 = X2(0.35), py2 = Y2(1.10);
      ctx.beginPath(); ctx.moveTo(px2 - D.Lmain * S2 * Math.cos(D.th0), py2 - D.Lmain * S2 * Math.sin(D.th0));
      ctx.lineTo(px2, py2); ctx.stroke();
      ctx.beginPath(); ctx.arc(px2, py2, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("行进态:主梯平卧(15°)越过屏顶", tvL + 4, chainY - 22);
      ctx.fillText("六轮+牛皮屏(「内以人推进及城」)", tvL + 4, chainY - 10);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["床六轮", "推进及城(人推)"], ["牛皮屏", "四面屏蔽"], ["主梯立起", "15°→55° 绞1.86圈"],
        ["飞梯上展", "+2.2m 绞2.92圈"], ["抓钩搭堞", "推算画法"], ["窥城", "H=8.4sin55°+1.10"]
      ];
      var bwid = (w * 0.94) / boxes.length;
      for (var b = 0; b < boxes.length; b++) {
        var bx = w * 0.03 + b * bwid;
        ctx.strokeStyle = ink;
        ctx.strokeRect(bx, chainY, bwid - 10, chainH);
        ctx.fillStyle = ink; ctx.font = "700 10px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(boxes[b][0], bx + (bwid - 10) / 2, chainY + 17);
        ctx.font = "600 8.5px Menlo, monospace"; ctx.fillStyle = faint;
        ctx.fillText(boxes[b][1], bx + (bwid - 10) / 2, chainY + 32);
        if (b < boxes.length - 1) {
          ctx.beginPath(); ctx.moveTo(bx + bwid - 10, chainY + 20); ctx.lineTo(bx + bwid - 2, chainY + 20); ctx.stroke();
        }
      }
    },
    table:
      '<h4>部件尺寸(文献值+推算)</h4><table>' +
      '<tr><th>床(车架)</th><td>「以大木为床,下施六轮」</td><td>轮 r 0.30 m</td></tr>' +
      '<tr><th>主梯</th><td>「上立二梯,各长二丈馀」</td><td>6.2 m</td></tr>' +
      '<tr><th>飞梯</th><td>「起飞梯于云梯之上」</td><td>2.2 m</td></tr>' +
      '<tr><th>转轴</th><td>「中施转轴」折叠 15°→55°</td><td>y = 1.10 m</td></tr>' +
      '<tr><th>牛皮屏</th><td>「四面以生牛皮为屏蔽」</td><td>—</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>立梯绞绳:Δs = 2.5(sin55°−sin15°) = 1.40m;绞车 r0.12 → 圈数 = Δs/2πr = 1.86(载入断言)。</p>' +
      '<p>飞梯上展 2.2m → 圈数 2.92(第二筒,断言);合计绞绳 3.60m。</p>' +
      '<p>可达城高:H = L总·sinθ + 车顶 = 8.4×sin55° + 1.10 = 7.98m(断言,抵 7.2m 城堞)。</p>' +
      '<p>绞绳逐帧积分校验(maxErr&lt;1e-9);绞车为《太白阴经》「双辘轳」借鉴(云梯条未载,标注),抓钩为复原画法(推算)。</p>' +
      '<h4>文献</h4>' +
      '<p>《武经总要·前集·卷十·攻城法》:「云梯,以大木为床,下施六轮,上立二梯,各长二丈馀,中施转轴。车四面以生牛皮为屏蔽,内以人推进及城,则起飞梯于云梯之上,以窥城中,故曰云梯。」</p>' +
      '<p>承袭:唐《太白阴经·卷四》「飞云梯,以大木为床,下置六轮……其上城首冠双辘轳,枕城而上。」</p>'
  };
})(window.MECH = window.MECH || {});
