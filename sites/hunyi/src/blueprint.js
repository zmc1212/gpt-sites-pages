/* 图纸面板(B 键):浑仪复原侧视总图 + 指向解算链 + 尺寸表。 */
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
    no: "Fig. 12 · 复原总图",
    title: "浑仪 · 三重环圈窥管测星(明正统制)",
    src: "明正统浑仪(紫金山现存)· 《宋史·天文志》浑仪法要 · 尺寸按本站复原推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainY = h - 70, topY = 30;

      /* —— 公式横幅 —— */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("极轴倾角 T = 90° − φ(纬度) = 90° − 39.9° = 50.1°   ·   d(α,δ) = m·cosδ + n·sinδ   ·   织女 α280° δ+38.8°", w * 0.03, topY - 8);

      /* —— 左:侧视图(视向东,x-y 竖直) —— */
      var ox = w * 0.03, oRight = w * 0.55, regionH = chainY - topY - 26;
      var S = Math.min((oRight - ox - 16) / 2.6, (regionH - 12) / 3.0);
      var oy = topY + regionH - 0.5 * S;
      function X(m) { return ox + 0.6 * S + (m + 1.3) * S; }
      function Y(m) { return oy - m * S; }
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.3;
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("侧视 SIDE(北 → 右上倾斜)", ox, topY + 10);
      ctx.beginPath(); ctx.moveTo(X(1.4), Y(0)); ctx.lineTo(X(-1.4), Y(0)); ctx.stroke();
      /* 基座 + 水槽 */
      ctx.strokeRect(X(-1.05), Y(0), 2.10 * S, 0.14 * S);
      ctx.strokeRect(X(-0.27), Y(0.14), 0.55 * S, 0.08 * S);
      /* 龙柱 */
      ctx.beginPath(); ctx.moveTo(X(-0.72), Y(0)); ctx.lineTo(X(-0.35), Y(D.hubY - 0.6)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0.72), Y(0)); ctx.lineTo(X(0.35), Y(D.hubY - 0.6)); ctx.stroke();
      /* 环系:子午双环(倾斜椭圆示意)+ 地平 + 赤道 + 四游 + 窥管 */
      var cx = X(0), cy2 = Y(D.hubY);
      ctx.beginPath(); ctx.ellipse(cx, cy2, D.RHorizon * S * 0.42, D.RHorizon * S, -D.Trad, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy2, D.REquator * S * 0.42, D.REquator * S, -D.Trad, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy2, D.REcliptic * S * 0.42, D.REcliptic * S, -(D.Trad + D.obliq * Math.PI / 180), 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.ellipse(cx, cy2, D.RFour * S * 0.42, D.RFour * S, -D.Trad, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      /* 极轴 */
      var nx = cx + Math.sin(0) * 0 + Math.cos(0) * 0 + Math.sin(0), ny = 0;
      var axX = cx + Math.sin(0) * 0;   // 极轴沿(0, sinT, cosT)→ 侧视投影
      var axY = cy2 - Math.sin(D.Trad) * D.RSolstice * S;
      ctx.beginPath(); ctx.moveTo(cx, cy2); ctx.lineTo(cx + Math.cos(D.Trad) * D.RSolstice * S * 0.9, axY); ctx.stroke();
      /* 窥管(指向 δ 38.8°) */
      var d = KS.aimDir(0, D.deltaVega);
      ctx.strokeStyle = red;
      ctx.beginPath();
      ctx.moveTo(cx, cy2);
      ctx.lineTo(cx + d[0] * D.tubeL * 0.5 * S + Math.cos(D.Trad) * d[2] * D.tubeL * 0.5 * S, cy2 - d[1] * D.tubeL * 0.5 * S);
      ctx.stroke();
      ctx.strokeStyle = ink;
      /* 尺寸 */
      arrowV(ctx, X(1.15), Y(0), Y(D.hubY), "球心高 1.45 m", 1);
      ctx.fillStyle = faint;
      ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("外→内:六合(子午+地平)/ 三辰(赤道+黄道)/ 四游+窥管", ox, chainY - 14);

      /* —— 右:指向解算链 —— */
      var rx = w * 0.585, rw = w - rx - 14;
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("指向解算链", rx, topY + 12);
      var boxes = [
        ["极轴 n", "T = 50.1° 朝北"],
        ["三辰 α", "m(α) = x̂cosα + (n×x̂)sinα"],
        ["四游 δ", "d = m·cosδ + n·sinδ"],
        ["窥管", "管口 = C + d·L/2"]
      ];
      var gy0 = topY + 26;
      boxes.forEach(function (b, i) {
        var y = gy0 + i * 24;
        ctx.strokeStyle = ink; ctx.lineWidth = 1.1;
        ctx.strokeRect(rx, y, rw, 18);
        ctx.fillStyle = ink;
        ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
        ctx.fillText(b[0], rx + 6, y + 12);
        ctx.fillStyle = faint;
        ctx.font = "600 8px Menlo, monospace"; ctx.textAlign = "right";
        ctx.fillText(b[1], rx + rw - 6, y + 12);
        if (i < boxes.length - 1) {
          ctx.beginPath(); ctx.moveTo(rx + rw / 2, y + 18); ctx.lineTo(rx + rw / 2, y + 24); ctx.stroke();
        }
      });

      /* —— 右下:星表 —— */
      var by = gy0 + 104;
      ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.font = "700 11px sans-serif";
      ctx.fillText("瞄准目标", rx, by - 6);
      ctx.font = "600 9px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText("织女星 Vega · α 280° · δ +38.8°", rx, by + 8);
      ctx.fillStyle = faint;
      ctx.font = "600 8px sans-serif";
      ctx.fillText("星标现于窥管延长线 2.3m 处", rx, by + 22);

      /* —— 底部:部件链 —— */
      var boxes2 = [
        ["十字水槽", "调平基准"], ["龙柱", "四斜柱承环"], ["六合仪", "子午+地平 固定"],
        ["三辰仪", "赤道+黄道 绕极轴"], ["四游仪", "双环+窥管 指 δ"], ["星标", "管口延长线"]
      ];
      var bwid = (w * 0.94) / boxes2.length;
      for (var b = 0; b < boxes2.length; b++) {
        var bx2 = w * 0.03 + b * bwid;
        ctx.strokeStyle = ink; ctx.lineWidth = 1.2;
        ctx.strokeRect(bx2, chainY, bwid - 10, 50);
        ctx.fillStyle = ink;
        ctx.font = "700 9.5px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(boxes2[b][0], bx2 + (bwid - 10) / 2, chainY + 19);
        ctx.font = "600 8px Menlo, monospace";
        ctx.fillStyle = faint;
        ctx.fillText(boxes2[b][1], bx2 + (bwid - 10) / 2, chainY + 34);
        if (b < boxes2.length - 1) {
          ctx.beginPath();
          ctx.moveTo(bx2 + bwid - 10, chainY + 24);
          ctx.lineTo(bx2 + bwid - 2, chainY + 24);
          ctx.stroke();
        }
      }
    },
    table:
      '<h4>环系</h4><table>' +
      '<tr><th>六合仪(固定)</th><td>子午双环 R 1.05 + 地平环 R 1.05(24 刻度)</td><td>法向东/上</td></tr>' +
      '<tr><th>三辰仪</th><td>赤道环 R 0.88(⊥极轴)+ 黄道环 R 0.80(偏 23.5°)</td><td>绕极轴周天</td></tr>' +
      '<tr><th>二至圈</th><td>R 0.86 · 法向 m(α) 随 α</td><td>极轴杆长 1.90</td></tr>' +
      '<tr><th>四游仪</th><td>双环 R 0.68 + 窥管 L 0.90</td><td>指 d(α,δ)</td></tr>' +
      '</table><h4>指向运动学</h4><table>' +
      '<tr><th>极轴倾角</th><td>T = 90° − φ(39.9° 北京)</td><td>50.1°(严格)</td></tr>' +
      '<tr><th>三辰转角</th><td>m(α) = x̂cosα + (n×x̂)sinα</td><td>ω 0.59 rad/s</td></tr>' +
      '<tr><th>窥管指向</th><td>d(α,δ) = m·cosδ + n·sinδ</td><td>织女 δ +38.8°</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>向量模长断言:|n| = |m| = |d| = 1(载入期);运行期 errPos = 窥管口世界位置 − 解析(C + d·L/2)≈ 0。</p>' +
      '<p>黄道环法向 = (0, sin(T+23.5°), cos(T+23.5°)),黄赤交角 23.5°。</p>' +
      '<h4>文献</h4>' +
      '<p>明正统浑仪现存南京紫金山天文台;《宋史·天文志》载浑仪三重之制:六合定仪、三辰转周天、四游窥管指星。</p>'
  };
})(window.MECH = window.MECH || {});
