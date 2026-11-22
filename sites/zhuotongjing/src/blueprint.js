/* 图纸面板(B 键):卓筒井总图 — 侧视(井剖面) + 俯视 + 传动链 */
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
    no: "Fig. 07 · 复原总图",
    title: "卓筒井 · 冲击凿井(苏轼《东坡志林》+《天工开物·井盐》)",
    src: "宋·苏轼《东坡志林·卷四》+ 明·《天工开物·井盐》 · 竹弓回弹不用(无明文,标注)",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("杠杆 i = L踏/L锥 = 2.88/1.31 = 2.2 · 提升h 0.30m → v = √(2gh) = 2.42m/s · E = ½mv² = 176J(m60kg) · 进尺 = 击×8mm", w * 0.03, topY - 12);

      /* ============ 左:侧视(杠杆-井剖面) ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 10) / 6.4, (chainY - topY - 34) / 3.6);
      var ox = svL + 4, oy = chainY - 14;
      var X = function (m) { return ox + (m + 4.4) * S; };
      var Y = function (m) { return oy - m * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("侧视 SIDE(踏端西-井东)", svL, topY + 12);
      /* 地面 */
      ctx.beginPath(); ctx.moveTo(X(-4.4), Y(0)); ctx.lineTo(X(2.0), Y(0)); ctx.stroke();
      /* 井筒剖面(深 1.2m 示意 + 虚线数十丈) */
      ctx.strokeRect(X(-0.30), Y(0), 0.60 * S, 1.2 * S);
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(X(-0.30) + 2, Y(-1.2)); ctx.lineTo(X(-0.30) + 2, Y(-3.0)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("井筒 如碗大 · 深数十丈(虚线)", X(0.35), Y(-1.6));
      /* 井架 */
      ctx.strokeRect(X(-0.62), Y(2.30), 5, 2.30 * S);
      ctx.strokeRect(X(0.62) - 5, Y(2.30), 5, 2.30 * S);
      ctx.strokeRect(X(-0.62), Y(2.30), 1.24 * S, 5);
      /* 支点 A 架 + 碓杆(摆线)+ 踏板 + 锥绳 */
      ctx.beginPath(); ctx.moveTo(X(-1.5), Y(0)); ctx.lineTo(X(-1.20), Y(1.55)); ctx.lineTo(X(-0.90), Y(0)); ctx.stroke();
      var th = D.thetaMax * 0.5;
      var px = X(-1.20), py = Y(1.55);
      ctx.beginPath();
      ctx.moveTo(px - D.armFoot * S * Math.cos(th * 0.5), py + D.armFoot * S * Math.sin(th * 0.5));
      ctx.lineTo(px + D.armBit * S * Math.cos(th * 0.5), py - D.armBit * S * Math.sin(th * 0.5));
      ctx.stroke();
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
      /* 锥(绳吊在井口) */
      ctx.beginPath(); ctx.moveTo(X(0), Y(2.0)); ctx.lineTo(X(0), Y(1.1)); ctx.stroke();
      ctx.strokeRect(X(0) - 4, Y(1.1), 8, 0.42 * S);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif";
      ctx.fillText("踏板(踩端)", X(-3.9), Y(0.95));
      ctx.fillText("竹篾绳·圜刃锥 60kg", X(0.10), Y(1.35));
      ctx.fillText("支点 A 架", X(-1.75), Y(1.75));
      /* 尺寸 */
      arrow(ctx, X(-3.84), Y(-0.15), X(0), Y(-0.15), "碓杆全长 4.2m", true);
      arrow(ctx, X(-1.20), Y(2.55), X(0), Y(2.55), "锥臂 1.31m", false);
      ctx.fillText("踏臂 2.88m → i=2.2", X(-3.0), Y(2.75));
      ctx.fillText("提升 h 0.30 → v=2.42m/s", X(0.6), Y(2.10));

      /* ============ 右:俯视(井口+碓架) ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var S2 = Math.min((tvR - tvL - 12) / 5.6, (chainY - topY - 44) / 4.0);
      var X2 = function (m) { return tvL + 8 + (m + 4.4) * S2; };
      var Z2 = function (m) { return topY + 34 + (m + 2.0) * S2; };
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("俯视 PLAN", tvL, topY + 12);
      /* 井口 + 井架 */
      ctx.beginPath(); ctx.arc(X2(0), Z2(1.80), D.wellR * S2 + 3, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X2(0), Z2(1.80), D.wellR * S2 * 0.55, 0, Math.PI * 2); ctx.stroke();
      [[-0.55, -0.5], [0.55, -0.5], [-0.55, 0.5], [0.55, 0.5]].forEach(function (p) {
        ctx.fillRect(X2(D.wellX + p[0]) - 2, Z2(D.wellZ + p[1]) - 2, 4, 4);
      });
      ctx.strokeRect(X2(-0.55), Z2(D.wellZ - 0.5), 1.1 * S2, 1.0 * S2);
      /* 碓杆(俯视直线)+ 支点 */
      ctx.beginPath(); ctx.moveTo(X2(-3.84), Z2(1.00)); ctx.lineTo(X2(0), Z2(1.80)); ctx.stroke();
      ctx.beginPath(); ctx.arc(X2(-1.20), Z2(1.55), 3, 0, Math.PI * 2); ctx.fill();
      /* 卤桶 */
      ctx.strokeRect(X2(1.35) - 5, Z2(0.55) - 5, 10, 10);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("井口石圈 · 井架四柱", tvL + 4, chainY - 22);
      ctx.fillText("碓杆俯视(踏端-支点-锥端) · 卤桶", tvL + 4, chainY - 10);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["足踏碓尾", "杠杆 i=2.2 省力"], ["锥端抬起", "h 0.30m 支臂1.31"],
        ["松足落锥", "v=√(2gh)=2.42"], ["冲击井底", "E=½mv²=176J"],
        ["石屑崩落", "每击进尺 8mm"], ["筒井卤升", "深数十丈 竹牝牡衔"]
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
      '<tr><th>碓杆</th><td>全长 4.2m · 支点偏置</td><td>踏臂 2.88 : 锥臂 1.31</td></tr>' +
      '<tr><th>杠杆增力</th><td>i = 2.88/1.31(载入断言)</td><td>2.2</td></tr>' +
      '<tr><th>铁圜刃锥</th><td>碓嘴形 · 竹篾缠绳夹悬</td><td>m = 60 kg</td></tr>' +
      '<tr><th>提升</th><td>h = 0.30m(踏端不离地口径)</td><td>v冲 = 2.42 m/s</td></tr>' +
      '<tr><th>井筒</th><td>「用圜刃凿如碗大」(碗口 10-15cm 推算)</td><td>深数十丈</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>落体:飞落时间 t = √(2h/g) = 0.247s(断言);冲击速度 v = √(2gh) = 2.42 m/s(断言)。</p>' +
      '<p>单冲能量 E = ½mv² = 176 J(m=60kg,断言);进尺 = 击数 × 8mm(逐帧积分校验 maxErr&lt;1e-9)。</p>' +
      '<p>相位机:踩 0.55 + 提 0.20 + 落 0.25 + 缓 0.30 = 1.30s/冲(节奏可 ←/→ 调)。</p>' +
      '<h4>文献</h4>' +
      '<p>苏轼《东坡志林·卷四》:「自庆历、皇祐以来,蜀始开筒井,用圜刃凿如碗大,深者数十丈,以巨竹去节,牝牡相衔为井,以隔横入淡水,则咸泉自上。」</p>' +
      '<p>《天工开物·井盐》:「其器冶铁锥,如碓嘴形,其尖使极刚利,向石山舂凿成孔。其身破竹缠绳,夹悬此锥。每舂深入数尺,则又以竹接其身,使引而长。」</p>' +
      '<p>竹弓回弹无古代明文,本站不采用;每击进尺 8mm 与节奏均为压缩演示值。</p>'
  };
})(window.MECH = window.MECH || {});
