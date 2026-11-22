/* 图纸面板(B 键):水击面罗总图 — 侧视 + 俯视 + 传动链
   分区:公式横幅(顶) / 侧视(左 0.03-0.50w) / 俯视(右 0.53-0.98w) / 传动链(底) */
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
    no: "Fig. 04 · 复原总图",
    title: "水击面罗 · 王祯《农书》水力筛面(攀耳—卧轴式复原)",
    src: "王祯《农书·农器图谱》水击面罗 · 复原方案存在学术争议(攀耳—卧轴式) · 尺寸为推算",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var D = MECH.DIM;
      var chainH = 46, chainY = h - chainH - 12, topY = 36;
      ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 1.4;

      ctx.fillStyle = red; ctx.font = "700 11px Menlo, monospace"; ctx.textAlign = "left";
      ctx.fillText("直驱: ω轴 = ω轮(1:1) · 击频 f = 3ω轴/2π · T₀ = 2π√(L/g) = 1.955s(L=0.95) · θ̈ = −ω₀²sinθ − 2ζω₀θ̇", w * 0.03, topY - 12);

      /* ============ 左:侧视(x-y,西左东右) ============ */
      var svL = w * 0.03, svR = w * 0.50;
      var S = Math.min((svR - svL - 10) / 5.4, (chainY - topY - 34) / 3.8);
      var ox = svL + 4, oy = chainY - 14;
      var X = function (m) { return ox + (m + 3.9) * S; };
      var Y = function (m) { return oy - (m + 0.8) * S; };
      ctx.font = "700 11px sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = ink;
      ctx.fillText("侧视 SIDE(西渠-东坊)", svL, topY + 12);
      /* 地面 */
      ctx.beginPath(); ctx.moveTo(X(-3.9), Y(0)); ctx.lineTo(X(1.5), Y(0)); ctx.stroke();
      /* 水渠 */
      ctx.strokeRect(X(-3.63), Y(D.chWall - 0.20), 0.12 * S, (D.chWall - 0.20 - D.chFloor) * S);
      ctx.strokeRect(X(-2.37), Y(D.chWall - 0.20), 0.12 * S, (D.chWall - 0.20 - D.chFloor) * S);
      ctx.strokeStyle = "rgba(79,120,150,0.8)";
      ctx.strokeRect(X(-3.45), Y(D.chWater), 0.9 * S, 0.12 * S);
      ctx.strokeStyle = ink;
      /* 立轮(竖直圆,轴沿 x → 端视为圆) */
      ctx.beginPath(); ctx.arc(X(-3.0), Y(D.shaftHi), D.Rwheel * S, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(X(-3.0), Y(D.shaftHi), 0.14 * S, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < 12; i++) {
        var a = i / 12 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(X(-3.0) + Math.cos(a) * D.Rwheel * S * 0.12, Y(D.shaftHi) + Math.sin(a) * D.Rwheel * S * 0.12);
        ctx.lineTo(X(-3.0) + Math.cos(a) * D.Rwheel * S * 0.94, Y(D.shaftHi) + Math.sin(a) * D.Rwheel * S * 0.94);
        ctx.stroke();
      }
      /* 卧轴(沿 x)+ 攀耳端 */
      ctx.strokeRect(X(-3.0), Y(D.shaftHi) - 2, 3.0 * S, 4);
      ctx.beginPath(); ctx.arc(X(-0.42), Y(D.shaftHi), 0.20 * S, 0, Math.PI * 2); ctx.stroke();
      /* 木架四柱 + 顶梁 */
      [-0.85, 0.85].forEach(function (px) {
        ctx.strokeRect(X(px) - 3, Y(D.ropeTop), 6, D.ropeTop * S);
      });
      ctx.strokeRect(X(-0.95), Y(D.ropeTop + 0.14), 1.9 * S, 6);
      /* 罗框(悬挂)+ 吊索 + 撞杆 */
      var fy = Y(D.frameY + 0.4), fy2 = Y(D.frameY - 0.4);
      ctx.beginPath(); ctx.moveTo(X(-0.5), Y(D.ropeTop)); ctx.lineTo(X(-0.55), fy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(0.5), Y(D.ropeTop)); ctx.lineTo(X(0.55), fy); ctx.stroke();
      ctx.strokeRect(X(-0.62), fy, 1.30 * S, 0.09 * S);
      ctx.beginPath(); ctx.arc(X(-0.62), fy + 4, 3, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeRect(X(-0.62) - 2, fy + 4, 4, (fy - fy2 + 8));
      /* 面柜 */
      ctx.strokeRect(X(-0.75), Y(0.69), 1.5 * S, 0.39 * S);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("立轮 r1.15 · 半浸", X(-3.0) + 10, Y(D.shaftHi + 0.9));
      ctx.fillText("攀耳 3×120°", X(-0.42) - 8, Y(D.shaftHi + 0.35));
      ctx.fillText("撞杆(框西缘)", X(-0.75), fy - 6);
      ctx.fillText("罗底筛网", X(0.1), fy + 14);
      ctx.fillText("面柜", X(-0.70), Y(0.75));
      /* 尺寸 */
      arrow(ctx, X(-3.0), Y(-0.45), X(-3.0) + D.Rwheel * 2 * S, Y(-0.45), "轮径 2.3m", true);
      arrow(ctx, X(-0.62), Y(D.ropeTop + 0.25), X(0.85), Y(D.ropeTop + 0.25), "吊点高 2.55", false);
      ctx.fillText("摆长 L 0.95m", X(0.9), Y(1.7));

      /* ============ 右:俯视(渠 + 轴 + 架 + 框) ============ */
      var tvL = w * 0.53, tvR = w * 0.98;
      var S2 = Math.min((tvR - tvL - 12) / 5.6, (chainY - topY - 44) / 4.4);
      var X2 = function (m) { return tvL + 8 + (m + 3.9) * S2; };
      var Z2 = function (m) { return topY + 34 + (m + 2.2) * S2; };
      ctx.font = "700 11px sans-serif"; ctx.fillStyle = ink; ctx.textAlign = "left";
      ctx.fillText("俯视 PLAN(渠沿竖向)", tvL, topY + 12);
      /* 渠 */
      ctx.beginPath(); ctx.moveTo(X2(-3.52), Z2(-6)); ctx.lineTo(X2(-3.52), Z2(6)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X2(-2.48), Z2(-6)); ctx.lineTo(X2(-2.48), Z2(6)); ctx.stroke();
      ctx.strokeStyle = "rgba(79,120,150,0.8)";
      ctx.beginPath(); ctx.moveTo(X2(-3.42), Z2(-6)); ctx.lineTo(X2(-3.42), Z2(6)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X2(-2.58), Z2(-6)); ctx.lineTo(X2(-2.58), Z2(6)); ctx.stroke();
      ctx.strokeStyle = ink;
      /* 立轮扫掠 + 卧轴 */
      ctx.beginPath(); ctx.arc(X2(-3.0), Z2(0), D.Rwheel * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X2(-3.0), Z2(0)); ctx.lineTo(X2(0.2), Z2(0)); ctx.stroke();
      /* 攀耳端盘 + 撞杆 */
      ctx.beginPath(); ctx.arc(X2(-0.42), Z2(0), 0.20 * S2, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeRect(X2(-0.66) - 2, Z2(0) - 5, 4, 10);
      /* 木架 + 罗框 + 面柜 */
      ctx.strokeRect(X2(-0.85) - 2, Z2(-0.62) - 2, 4, 4);
      ctx.strokeRect(X2(0.85) - 2, Z2(-0.62) - 2, 4, 4);
      ctx.strokeRect(X2(-0.85) - 2, Z2(0.62) - 2, 4, 4);
      ctx.strokeRect(X2(0.85) - 2, Z2(0.62) - 2, 4, 4);
      ctx.strokeRect(X2(-0.575), Z2(-0.36), 1.15 * S2, 0.72 * S2);
      ctx.strokeRect(X2(-0.75), Z2(-0.5), 1.5 * S2, 1.0 * S2);
      ctx.fillStyle = faint; ctx.font = "600 9px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("立轮扫掠 r1.15 · 卧轴至攀耳 x-0.42", tvL + 4, chainY - 22);
      ctx.fillText("罗框 1.15×0.72(摆体) · 面柜 1.5×1.0", tvL + 4, chainY - 10);

      /* ============ 底部:传动链 ============ */
      var boxes = [
        ["立轮受水", "12 斗叶 · 半浸"], ["卧轴直驱", "ω轴 = ω轮 1:1"],
        ["攀耳 3 耳", "120° 均布凸耳"], ["击撞杆", "f = 3ω轴/2π"],
        ["罗框摆荡", "阻尼摆 T₀=1.955s"], ["筛落面粉", "筛面甚速倍人力"]
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
      '<h4>部件尺寸(推算)</h4><table>' +
      '<tr><th>立轮</th><td>径 2.3m · 12 斗叶 · 竖直(横轴沿 x)</td><td>r = 1.15 m</td></tr>' +
      '<tr><th>卧轴</th><td>高 1.62m · 西接立轮东至攀耳</td><td>长 3.4 m</td></tr>' +
      '<tr><th>攀耳</th><td>3 耳 120° 均布 · 打击半径 0.20</td><td>x = −0.42</td></tr>' +
      '<tr><th>罗框</th><td>1.15×0.72 · 四索悬吊 · 摆长 0.95</td><td>T₀ = 1.955 s</td></tr>' +
      '<tr><th>面柜</th><td>1.5×1.0 · 粉面随筛落涨</td><td>—</td></tr>' +
      '</table><h4>验算</h4>' +
      '<p>直驱:ω轴 = ω轮(同轴 1:1,断言);击频 f = 3·ω轴/2π(3 攀耳)。</p>' +
      '<p>罗框:阻尼单摆 θ̈ = −ω₀²sinθ − 2ζω₀θ̇,ω₀ = √(g/L) = 3.213 rad/s,T₀ = 1.955s(断言);每击冲量 Δθ̇ = 0.85 rad/s。</p>' +
      '<p>筛落:面粉累计 ∫flourRate·|θ̇|dt(逐帧积分校验 maxErr&lt;1e-9),柜面粉高随累计涨(满 0.30m³)。</p>' +
      '<h4>文献</h4>' +
      '<p>王祯《农书·农器图谱》:「水击面罗,随水磨用之,其机与水排俱同。按图视谱,当自考索。罗因水力互击桩柱,筛面甚速,倍于人力。」</p>' +
      '<p>复原方案为「攀耳—卧轴」式(学界对原文结构有争议,王祯自言「当自考索」);尺寸皆为推算。旁证:上博藏《闸口盘车图》绘水磨作坊附面罗。</p>'
  };
})(window.MECH = window.MECH || {});
