/* 图纸面板(B 键):仰仪总图 — 子午剖面 + 内壁展开 + 传动链 */
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
    no: "Fig. 12 · 复原总图",
    title: "仰仪 · 郭守敬针孔球面投影(《元史·天文志》)",
    src: "《元史·天文志·卷四十八》+《仰仪铭》 · 口径一丈二尺(推算取 R1.5m)",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("针孔(球心)投影:像距天顶 = 90°−h(夏至10.5° 冬至58.5°) · 像径 d = R×0.533° = 14mm · 时辰线 15°=1时", w * 0.03, topY - 12);

      /* ============ 左:子午剖面 ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 14) / 3.4, (chainY - topY - 30) / 1.9);
      var cx = svL + (svR - svL) / 2, cy = topY + 20;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("子午剖面(南右)", svL, topY + 12);
      /* 砖台 */
      ctx.strokeRect(cx - 1.7 * S, cy + 0.02 * S, 3.4 * S, 0.62 * S);
      /* 釜半球(下半圆) */
      ctx.beginPath(); ctx.arc(cx, cy, D.R * S, 0, Math.PI); ctx.stroke();
      /* 口缘 */
      ctx.beginPath(); ctx.moveTo(cx - D.R * S, cy); ctx.lineTo(cx + D.R * S, cy); ctx.stroke();
      /* 针孔 + 两至光线 + 像点 */
      ctx.fillStyle = ink;
      ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
      var zS = D.zSummer, zW = D.zWinter;
      /* 夏至光线(红):自右上方射入,像在南上壁 */
      ctx.strokeStyle = red; ctx.lineWidth = 1.2;
      var ix = cx + Math.sin(zS) * D.R * S, iy = cy + Math.cos(zS) * D.R * S;
      ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(cx, cy); ctx.stroke();
      /* 冬至光线(虚):像近唇 */
      var jx = cx - Math.sin(zW) * D.R * S, jy = cy + Math.cos(zW) * D.R * S;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(jx, jy); ctx.lineTo(cx, cy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = red;
      ctx.beginPath(); ctx.arc(ix, iy, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = ink;
      ctx.beginPath(); ctx.arc(jx, jy, 3.5, 0, Math.PI * 2); ctx.stroke();
      /* 标注 */
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("针孔(球心,容芥)", cx + 8, cy + 14);
      ctx.fillText("夏至像(距天顶10.5°)", ix + 8, iy + 4);
      ctx.fillText("冬至像(58.5°)", jx - 66, jy + 4);
      ctx.fillText("璇玑板十字", cx - 60, cy - 6);
      ctx.fillText("砖台", cx - 30, cy + 0.78 * S);
      /* 尺寸 */
      arrow(ctx, cx - D.R * S - 8, cy, cx - D.R * S - 8, cy + D.R * S, "R 1.5m", false);
      arrow(ctx, cx - 20, cy + D.R * S + 8, cx, cy + D.R * S + 8, "天顶点", true);

      /* ============ 右:内壁展开(节气×时辰) ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var x0 = tvL + 24, y0 = topY + 30, gw = tvR - x0 - 10, gh = chainY - y0 - 24;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("内壁展开(节气圈 × 时辰经线)", tvL, topY + 12);
      for (var r = 0; r <= 8; r++) {
        ctx.strokeStyle = faint;
        ctx.beginPath(); ctx.moveTo(x0, y0 + gh * r / 8); ctx.lineTo(x0 + gw, y0 + gh * r / 8); ctx.stroke();
      }
      for (var c = 0; c <= 12; c++) {
        ctx.beginPath(); ctx.moveTo(x0 + gw * c / 12, y0); ctx.lineTo(x0 + gw * c / 12, y0 + gh); ctx.stroke();
      }
      /* 两至像位(夏至近天顶,冬至近唇) */
      ctx.fillStyle = red;
      ctx.beginPath(); ctx.arc(x0 + gw * 0.5, y0 + gh * (zS / (Math.PI / 2)) * 0.96, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x0 + gw * 0.5, y0 + gh * (zW / (Math.PI / 2)) * 0.96, 5, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("天顶(釜底)", x0, y0 - 4);
      ctx.fillText("节气平行圈(8)", tvL + 4, chainY - 22);
      ctx.fillText("时辰经线 12(15°=1时) · 红点=夏至像 空圈=冬至像", tvL + 4, chainY - 10);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["日光过孔", "球心针孔 容芥"], ["倒像投壁", "方位与日相反"],
        ["像距天顶", "z = 90°−h"], ["节气圈", "平行圈读节气"],
        ["时辰经线", "15°=1时 真太阳时"], ["日食观测", "食分可读(文献)"]
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
      '<tr><th>铜釜</th><td>「以铜为之,形若釜」口径一丈二尺(推算 R1.5m)</td><td>R = 1.5 m</td></tr>' +
      '<tr><th>璇玑板</th><td>球心十字架 + 针孔(「窾纳芥」)</td><td>孔 ≈ 芥子</td></tr>' +
      '<tr><th>内壁网格</th><td>「内画周天度」节气平行圈 + 时辰经线</td><td>15°/时</td></tr>' +
      '<tr><th>唇</th><td>「唇列十二辰位」</td><td>12 辰</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>针孔投影:像距天顶 z = 90°−h;夏至正午(登封 φ34.5°)z = 10.5°(研究值≈11.3°,差在 ε 取值),冬至 z = 58.5°(≈59.3°)(载入断言 ±1.5°)。</p>' +
      '<p>太阳像径 d = R×0.533° = 1.5×0.0093 = 14mm(断言)。</p>' +
      '<p>像位逐帧积分校验(maxErr&lt;1e-9);日食各相可由像的亏缺比例直接读出(研究结论)。</p>' +
      '<h4>文献</h4>' +
      '<p>《元史·天文志·卷四十八》:「仰仪之制,以铜为之,形若釜,置于砖台。内画周天度,唇列十二辰位……」</p>' +
      '<p>《仰仪铭》:「首璇玑板,窾纳芥也;上下悬直,与镦会也;视日透光,何度在也。」</p>'
  };
})(window.MECH = window.MECH || {});
