/* 图纸面板(B 键):水碾总图 — 侧视(过两轴剖面) + 俯视 + 传动链,尺寸按复原推算
   分区:公式横幅(顶) / 侧视(左 0.04-0.50w) / 俯视(右 0.53-0.98w) / 传动链(底) */
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
    no: "Fig. 01 · 复原总图",
    title: "水碾 · 王祯《农书》水力碾米(卧轮直驱碢干复原)",
    src: "王祯《农书·农器图谱》水碾(四库本卷十九) · 尺寸为复原推算值",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      /* 公式横幅(顶) */
      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("直驱: ω公 = ω轮(轮轴上端穿碢干) · ω自 = |ω公|·R槽/r辊 = 8.67|ω公| · v = |ω公|·1.30 = ω自·0.15(滚动无滑移)", w * 0.03, topY - 12);

      /* ============ 左:侧视(过立轴剖面,西左东右) ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 10) / 6.8, (chainY - topY - 34) / 4.0);
      var ox = svL + 4, oy = chainY - 14;
      var X = function (m) { return ox + (m + 5.5) * S; };
      var Y = function (m) { return oy - (m + 1.3) * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("侧视 SIDE(过立轴剖面)", svL, topY + 12);
      /* 地面 */
      ctx.beginPath(); ctx.moveTo(X(-5.5), Y(0)); ctx.lineTo(X(1.3), Y(0)); ctx.stroke();
      /* 井筒剖面(环形壁两侧) + 筒内水 + 筒底 */
      ctx.strokeRect(X(D.ax - D.cisROut), Y(D.cisH), 0.30 * S, (D.cisH + 1.3) * S);
      ctx.strokeRect(X(D.ax + D.cisRIn), Y(D.cisH), 0.30 * S, (D.cisH + 1.3) * S);
      ctx.strokeRect(X(D.ax - D.cisRIn), Y(D.cisFloor), 2 * D.cisRIn * S, 0.08 * S);
      ctx.strokeStyle = "rgba(79,120,150,0.8)";
      ctx.strokeRect(X(D.ax - D.cisRIn + 0.06), Y(D.cisWater), (2 * D.cisRIn - 0.12) * S, 0.10 * S);
      ctx.strokeStyle = ink;
      /* 碾盘(架于筒壁顶) + 碾槽 */
      ctx.strokeRect(X(D.ax - D.panR), Y(D.panY0 + D.panH), 2 * D.panR * S, D.panH * S);
      ctx.strokeRect(X(D.ax - D.grooveR + D.grooveW / 2), Y(D.panY0 + D.panH), (2 * D.grooveR - D.grooveW) * S, 0.07 * S);
      /* 立轴(自轮毂穿盘心) + 盘顶铜箍 */
      ctx.strokeRect(X(D.ax - 0.09), Y(D.shaftTop), 0.18 * S, (D.shaftTop - D.wheelY + 0.18) * S);
      ctx.strokeRect(X(D.ax - 0.145), Y(D.panY0 + D.panH + 0.13), 0.29 * S, 0.13 * S);
      /* 碢干 + 吊柱 + 双石辊 */
      ctx.strokeRect(X(D.ax - 0.30), Y(D.armY + 0.06), 1.92 * S, 0.12 * S);
      [-1.30, 1.30].forEach(function (r) {
        var rx = D.ax + r;
        ctx.strokeRect(X(rx - 0.045), Y(D.armY), 0.09 * S, (D.armY - D.rollerY - 0.11) * S);
        ctx.beginPath(); ctx.arc(X(rx), Y(D.rollerY), 0.15 * S, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(X(rx), Y(D.rollerY), 0.02 * S, 0, Math.PI * 2); ctx.fill();
      });
      /* 筒内卧轮(轮毂 + 叶带) */
      ctx.beginPath(); ctx.arc(X(D.ax), Y(D.wheelY), 0.17 * S, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeRect(X(D.ax - D.rWheel), Y(D.wheelY + 0.15), 2 * D.rWheel * S, 0.30 * S);
      for (var k = 0; k <= 16; k++) {
        var tx3 = X(D.ax - D.rWheel) + k / 16 * 2 * D.rWheel * S;
        ctx.beginPath(); ctx.moveTo(tx3, Y(D.wheelY + 0.15)); ctx.lineTo(tx3 + 3, Y(D.wheelY - 0.15)); ctx.stroke();
      }
      /* 引水木枧 + 闸门 + 跌水 */
      ctx.beginPath(); ctx.moveTo(X(-5.5), Y(1.10)); ctx.lineTo(X(-4.30), Y(0.66)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(-5.5), Y(1.22)); ctx.lineTo(X(-4.30), Y(0.78)); ctx.stroke();
      ctx.strokeStyle = red;
      ctx.strokeRect(X(D.gateX), Y(1.20), 0.03 * S, 0.30 * S);
      ctx.strokeStyle = "rgba(79,120,150,0.8)";
      ctx.beginPath(); ctx.moveTo(X(-4.15), Y(0.62)); ctx.lineTo(X(-4.15), Y(D.wheelY + 0.16)); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 尺寸与标注 */
      arrow(ctx, X(D.ax - D.panR), Y(-0.85), X(D.ax + D.panR), Y(-0.85), "碾盘径 3.5m", true);
      arrow(ctx, X(D.ax - D.cisROut), Y(1.62), X(D.ax + D.cisROut), Y(1.62), "井筒外径 3.7m", true);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("引水枧·闸门", X(-5.45), Y(1.42));
      ctx.fillText("碢干 y1.55", X(D.ax + 0.35), Y(D.armY - 0.02));
      ctx.fillText("石辊 径0.30", X(D.ax + 1.30) + 4, Y(D.rollerY - 0.22));
      ctx.fillText("筒内卧轮 径2.6", X(D.ax - 1.25), Y(D.wheelY + 0.32));
      ctx.fillText("水面 +0.30", X(D.ax + 0.55), Y(D.cisWater + 0.03));

      /* ============ 右:俯视(渠沿竖向,z 向下为北) ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var S2 = Math.min((tvR - tvL - 12) / 6.4, (chainY - topY - 44) / 6.2);
      var X2 = function (m) { return tvL + 8 + (m + 4.9) * S2; };
      var Z2 = function (m) { return topY + 34 + (m + 2.95) * S2; };
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("俯视 PLAN(渠沿竖向)", tvL, topY + 12);
      /* 水渠(裁剪到俯视窗口 z∈[-2.95,2.95]) */
      var z0 = Z2(-2.95), z1 = Z2(2.95);
      ctx.beginPath(); ctx.moveTo(X2(-3.51), z0); ctx.lineTo(X2(-3.51), z1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X2(-2.49), z0); ctx.lineTo(X2(-2.49), z1); ctx.stroke();
      ctx.strokeStyle = "rgba(79,120,150,0.8)";
      ctx.beginPath(); ctx.moveTo(X2(-3.42), z0); ctx.lineTo(X2(-3.42), z1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X2(-2.58), z0); ctx.lineTo(X2(-2.58), z1); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 井筒外/内圆 + 水轮扫掠 */
      ctx.beginPath(); ctx.arc(X2(D.ax), Z2(D.az), D.cisROut * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.arc(X2(D.ax), Z2(D.az), D.rWheel * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(X2(D.ax), Z2(D.az), D.rWheel * 0.12 * S2, 0, Math.PI * 2); ctx.stroke();
      /* 碾盘 + 碾槽 + 公转圆 */
      ctx.beginPath(); ctx.arc(X2(D.ax), Z2(D.az), D.panR * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X2(D.ax), Z2(D.az), (D.grooveR - D.grooveW / 2) * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X2(D.ax), Z2(D.az), (D.grooveR + D.grooveW / 2) * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.arc(X2(D.ax), Z2(D.az), D.grooveR * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(X2(D.ax), Z2(D.az), 2, 0, Math.PI * 2); ctx.fill();
      /* 双辊快照(0°/180°) + 碾臂 */
      [0, Math.PI].forEach(function (a) {
        var px = X2(D.ax + Math.cos(a) * D.grooveR), py = Z2(D.az - Math.sin(a) * D.grooveR);
        ctx.beginPath(); ctx.arc(px, py, D.rollerR * S2, 0, Math.PI * 2); ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(X2(D.ax + Math.cos(0) * D.grooveR), Z2(D.az - Math.sin(0) * D.grooveR));
      ctx.lineTo(X2(D.ax - Math.cos(0) * D.grooveR), Z2(D.az + Math.sin(0) * D.grooveR));
      ctx.stroke();
      /* 尺寸 */
      arrow(ctx, X2(D.ax - D.panR), Z2(2.5), X2(D.ax + D.panR), Z2(2.5), "碾盘径 3.5m", true);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("水轮扫掠 r1.30(虚线) · 井筒 r1.55/1.85", tvL + 4, z1 + 14);
      ctx.fillText("碾槽 R1.30 宽0.42 · 辊公转圆(点线)", tvL + 4, z1 + 26);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["卧式水轮", "16 斜叶 · 跌水驱动"], ["卧轮 12T", "与水轮同轴 r0.24"],
        ["立轮 48T", "外啮合反向 r0.96"], ["碾臂公转", "i=0.25 R槽1.30"],
        ["石辊自转", "ω自=8.67|ω公| 无滑移"], ["碾槽碾白", "谷粒过辊成米"]
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
      '<h4>部件尺寸(复原推算)</h4><table>' +
      '<tr><th>卧式水轮</th><td>径 2.6m · 16 斜叶 · 盘面高 0.50(筒内)</td><td>r = 1.30 m</td></tr>' +
      '<tr><th>碾盘</th><td>径 3.5m · 厚 0.24m · 架于筒壁顶(+0.95..1.19)</td><td>R = 1.75 m</td></tr>' +
      '<tr><th>碾槽</th><td>环心半径 1.30 · 宽 0.42 · 深 0.07</td><td>R = 1.30 m</td></tr>' +
      '<tr><th>石辊(×2)</th><td>径 0.30 · 长 0.34 · 轴沿半径 · 轴心 +1.27</td><td>r = 0.15 m</td></tr>' +
      '<tr><th>碢干(碾臂)</th><td>高 1.55m · 主臂 1.62 + 对侧短臂</td><td>—</td></tr>' +
      '</table><h4>井筒与引枧</h4><table>' +
      '<tr><th>井筒(石囷)</th><td>内径 3.1m · 外径 3.7m · 壁顶 +0.95</td><td>R内 = 1.55 m</td></tr>' +
      '<tr><th>筒内水面</th><td>+0.30 · 轮叶高于水面(跌水驱动)</td><td>—</td></tr>' +
      '<tr><th>引水木枧</th><td>西向跨筒壁 · 枧口 +0.72 · 闸门调幅</td><td>长 1.55 m</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>直驱:轮轴上端穿碢干(王祯原文),ω公 = ω轮(同轴 1:1,载入断言)。</p>' +
      '<p>滚动无滑移:辊心线速 v = |ω公|·R槽 = ω自·r辊 ⇒ ω自 = (1.30/0.15)·|ω公| = 8.67|ω公|。</p>' +
      '<p>载入断言:辊长 &lt; 槽宽(留隙 0.04)、辊心高 = 槽底+辊半径、水轮 r1.30 &lt; 筒内 r1.55−0.15、轮叶高于水面、碢干与盘顶净空 ≥ 0.25m。</p>' +
      '<p>功率估算:P轴 = η·ρ·Q·g·h,Q = 0.014·闸门(g),跌水差 h = 0.40m,η = 0.6 ⇒ 闸门 100% 时约 33W。</p>' +
      '<h4>文献</h4>' +
      '<p>王祯《农书·农器图谱》:「水碾,水轮转碾也……但下作卧轮或立轮,如水磨之法。轮轴上端穿其碢干,水激则碢随轮转,循槽轹谷,疾若风雨」(四库本卷十九)。</p>' +
      '<p>井筒/碾盘/辊槽尺寸为使直驱与滚动条件严格成立的复原推算值;轮叶高于筒内水面,以木枧跌水注叶(枧口至水面差 0.40m)。</p>'
  };
})(window.MECH = window.MECH || {});
