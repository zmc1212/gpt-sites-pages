/* 图纸面板(B 键):单反相机 — 取景光路 / 曝光光路与幕帘时序 / 光圈-快门链路 + 数表 */
(function (MECH) {
  var ink = "#2A2620", faint = "rgba(42,38,32,0.35)", red = "#8C2F1E", brass = "#8A6E3F";
  var D = MECH.DIM, KS = MECH.KS;

  function box(ctx, x, y, w, h, l1, l2) {
    ctx.strokeStyle = ink;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = ink;
    ctx.font = "700 9.5px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(l1, x + w / 2, y + 13);
    if (l2) {
      ctx.font = "600 7.5px Menlo, monospace";
      ctx.fillStyle = faint;
      ctx.fillText(l2, x + w / 2, y + 26);
    }
  }

  /* 侧视小图:机身框 + 反光镜 + 屏 + 棱镜;mode="view"|"exp" */
  function sideView(ctx, x0, y0, ww, hh, mode) {
    var mmx = 90, mmy = 84;
    var S = Math.min(ww / mmx, hh / mmy);
    function px(x) { return x0 + (x + 10) * S; }
    function py(y) { return y0 + hh - (y + 16) * S; }
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(px(-6), py(41), (48) * S, (55) * S);                 // 机身
    ctx.strokeRect(px(42), py(5), (38) * S, (10) * S);                  // 镜头
    ctx.beginPath(); ctx.moveTo(px(0), py(12)); ctx.lineTo(px(0), py(-12)); ctx.stroke(); // 片门
    /* 反光镜 */
    var up = mode === "exp";
    var ang = up ? 0 : -Math.PI / 4;
    ctx.strokeStyle = red;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(px(D.HINGE[0]), py(D.HINGE[1]));
    ctx.lineTo(px(D.HINGE[0] + Math.cos(ang) * 26), py(D.HINGE[1] + Math.sin(ang) * 26));
    ctx.stroke();
    /* 对焦屏与棱镜 */
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(px(26), py(38)); ctx.lineTo(px(50), py(38)); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px(28), py(39.5)); ctx.lineTo(px(46), py(39.5));
    ctx.lineTo(px(37.6), py(59.8)); ctx.lineTo(px(36), py(63.5));
    ctx.lineTo(px(28), py(65.5)); ctx.closePath(); ctx.stroke();
    /* 光路 */
    ctx.strokeStyle = brass;
    ctx.setLineDash([3, 2]);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(px(85), py(0));
    ctx.lineTo(px(D.NODE_X), py(0));
    if (mode === "view") {
      ctx.lineTo(px(D.MIRROR_X), py(0));
      ctx.lineTo(px(D.MIRROR_X), py(38));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = faint;
      ctx.beginPath();
      ctx.moveTo(px(38), py(D.PENTA.ENTRY_Y));
      ctx.lineTo(px(D.PENTA.H1[0]), py(D.PENTA.H1[1]));
      ctx.lineTo(px(D.PENTA.H2[0]), py(D.PENTA.H2[1]));
      ctx.lineTo(px(12), py(D.PENTA.H2[1]));
      ctx.stroke();
    } else {
      ctx.lineTo(px(0), py(0));
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.setLineDash([]);
  }

  /* 幕帘位置-时间图:S 为快门分母 */
  function curtainChart(ctx, x0, y0, ww, hh, S) {
    var v = D.V_CURT / 1000;                        // mm/ms
    var gapMs = KS.slitMm(S) / v;
    var tMax = 50 + gapMs + 17;
    function zx(mm) { return x0 + (mm + 18) / 36 * ww; }
    function ty(ms) { return y0 + hh - ms / tMax * hh; }
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1;
    ctx.strokeRect(x0, y0, ww, hh);
    /* 曝光带 */
    ctx.fillStyle = "rgba(140,47,30,0.18)";
    for (var i = 0; i <= 36; i++) {
      var zmm = -18 + i;
      var tO = 50 + (zmm + 18) / v;
      ctx.fillRect(zx(zmm) - 1, ty(tO + gapMs), 2, ty(tO) - ty(tO + gapMs));
    }
    /* 双帘边(同向行进:前帘尾缘开,后帘前缘闭) */
    ctx.strokeStyle = red;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(zx(-18), ty(50)); ctx.lineTo(zx(18), ty(66.36));
    ctx.stroke();
    ctx.strokeStyle = ink;
    ctx.beginPath();
    ctx.moveTo(zx(-18), ty(50 + gapMs)); ctx.lineTo(zx(18), ty(66.36 + gapMs));
    ctx.stroke();
    ctx.fillStyle = faint;
    ctx.font = "600 7px Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("−18", x0, y0 + hh + 9);
    ctx.fillText("+18", x0 + ww, y0 + hh + 9);
    ctx.textAlign = "left";
    ctx.fillText("t=" + Math.round(50 + gapMs) + "ms 缝延时", x0 + 2, y0 + 10);
  }

  MECH.BP = {
    no: "Fig. 01 · 单反相机光路与时序总图",
    title: "SLR · 反光镜箱·五棱镜·焦平面幕帘快门(135 规格 · 55mm f/1.4 口径)",
    src: "Contax S(1949, Zeiss Ikon,首产五棱镜单反)/ Pentax Asahiflex(1952,即时回弹反光镜)+ 现代口径:Jacobson《Manual of Photography》",
    draw: function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = 1.3;

      /* 公式横幅 */
      ctx.fillStyle = red;
      ctx.font = "700 11px Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("取景 17+38=55mm 严格 · 幕帘 t=w/v=2.2mm/2.2m·s⁻¹ · X-sync 1/60(缝36.7≥36) · f 序列 ×√2 · EV=log₂(N²/t) · 五棱镜恒偏 90°(追迹±3°≤0.2°)", w * 0.03, 24);

      /* ===== 左:取景光路 ===== */
      ctx.fillStyle = ink;
      ctx.font = "700 10px sans-serif";
      ctx.fillText("① 取景光路 VIEWING", w * 0.03, 44);
      sideView(ctx, w * 0.03, 52, w * 0.26, h * 0.34, "view");
      ctx.fillStyle = red;
      ctx.font = "600 8px sans-serif";
      ctx.fillText("镜 45°(\\)· 法线(1,1)/√2", w * 0.05, h * 0.40);
      ctx.fillStyle = faint;
      ctx.fillText("屏 y=38 · 反射→上 · 屋脊转正无镜像", w * 0.05, h * 0.42);

      /* ===== 中:曝光光路 ===== */
      ctx.fillStyle = ink;
      ctx.font = "700 10px sans-serif";
      ctx.fillText("② 曝光光路 EXPOSURE", w * 0.33, 44);
      sideView(ctx, w * 0.33, 52, w * 0.26, h * 0.34, "exp");
      ctx.fillStyle = red;
      ctx.fillText("镜翻起(+45°·30ms)让路", w * 0.35, h * 0.40);
      ctx.fillStyle = faint;
      ctx.fillText("主点 x=55 → 胶片 x=0 · v=55mm(∞)", w * 0.35, h * 0.42);

      /* ===== 右:幕帘时序(1/1000 与 1/60) ===== */
      ctx.fillStyle = ink;
      ctx.font = "700 10px sans-serif";
      ctx.fillText("③ 幕帘位置-时间(1/1000 与 1/60)", w * 0.63, 44);
      curtainChart(ctx, w * 0.63, 52, w * 0.17, h * 0.15, 1000);
      ctx.fillStyle = faint;
      ctx.font = "600 7.5px sans-serif";
      ctx.fillText("缝 2.2mm · t=0.91ms(曝光带)", w * 0.63, 52 + h * 0.15 + 14);
      curtainChart(ctx, w * 0.82, 52, w * 0.17, h * 0.15, 60);
      ctx.fillText("缝 36.7mm ≥ 36 · 全开(X-sync)", w * 0.82, 52 + h * 0.15 + 14);

      /* ===== 中下:光圈序列与 EV ===== */
      var gx = w * 0.03, gy = h * 0.56;
      ctx.fillStyle = ink;
      ctx.font = "700 10px sans-serif";
      ctx.fillText("④ 光圈 f 序列(×√2)与通光直径 D=55/N", gx, gy);
      D.FSTOPS.forEach(function (N, i) {
        var bx = gx + i * (w * 0.115), by = gy + 10;
        var r = Math.max(3, KS.dia(N) / 2 * 0.22);
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(bx + 16, by + 22, r, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "rgba(140,47,30,0.25)";
        ctx.beginPath(); ctx.arc(bx + 16, by + 22, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = ink;
        ctx.font = "700 8.5px Menlo, monospace";
        ctx.textAlign = "center";
        ctx.fillText("f/" + N, bx + 16, by + 40);
        ctx.fillStyle = faint;
        ctx.font = "600 7px Menlo, monospace";
        ctx.fillText(KS.dia(N).toFixed(1), bx + 16, by + 50);
        if (i < D.FSTOPS.length - 1) {
          ctx.strokeStyle = faint;
          ctx.beginPath();
          ctx.moveTo(bx + 20, by + 22); ctx.lineTo(bx + w * 0.115 - 4, by + 22);
          ctx.stroke();
          ctx.fillStyle = faint;
          ctx.font = "600 6.5px Menlo, monospace";
          ctx.fillText("×" + (D.FSTOPS[i + 1] / N).toFixed(2), bx + w * 0.058, by + 18);
        }
      });

      /* ===== 底部:链路框 ===== */
      var chainY = h * 0.72;
      var rows = [
        [["被摄体 150mm", "远景压缩示意"], ["前组 55mm f/1.4", "D=39.3mm 全开"], ["光圈 ×9叶", "a=(F/2N)·cos20°"], ["后主点 x=55", "卡口前 13mm"], ["反光镜 45°\\", "翻起 30ms"], ["对焦屏 y=38", "17+38=55 严格"], ["五棱镜 90°", "112.5°/157.5° · 45°夹角"], ["目镜 −x", "屋脊转正·正立"]],
        [["幕速 2.2 m/s", "横向走幅 36mm"], ["前帘 50ms 释放", "走幅 16.36ms"], ["缝 w=v/S", "1/1000→2.2mm"], ["X-sync 1/60", "缝36.7≥36 全开"], ["互易律 EV", "f/16·1/60 = f/4·1/1000"], ["近摄共轭", "u=450→e=7.66mm"], ["超焦距 f/8", "H=12.66m(c=0.03)"], ["胶片 3:2", "36×24 · 倒立实像"]]
      ];
      rows.forEach(function (row, ri) {
        var bwid = (w * 0.94) / row.length;
        var yy = chainY + ri * 44;
        row.forEach(function (b, bi) {
          box(ctx, w * 0.03 + bi * bwid, yy, bwid - 8, 36, b[0], b[1]);
          if (bi < row.length - 1) {
            ctx.beginPath();
            ctx.moveTo(w * 0.03 + bi * bwid + bwid - 8, yy + 18);
            ctx.lineTo(w * 0.03 + bi * bwid + bwid - 2, yy + 18);
            ctx.stroke();
          }
        });
      });
    },
    table:
      '<h4>光圈序列(f/ · D=55/N)</h4><table>' +
      '<tr><th>f/N</th><td>1.4</td><td>2</td><td>2.8</td><td>4</td><td>5.6</td><td>8</td><td>11</td><td>16</td></tr>' +
      '<tr><th>D mm</th><td>39.29</td><td>27.50</td><td>19.64</td><td>13.75</td><td>9.82</td><td>6.88</td><td>5.00</td><td>3.44</td></tr>' +
      '<tr><th>档比</th><td>—</td><td>1.429</td><td>1.400</td><td>1.429</td><td>1.400</td><td>1.429</td><td>1.375</td><td>1.455</td></tr>' +
      '</table><p>档比对 √2=1.414 偏差 ≤3.5%(标称序列舍入);每 +1 档通光面积 ÷2。</p>' +
      '<h4>快门档(幕速 2.2 m/s)</h4><table>' +
      '<tr><th>1/S</th><td>1000</td><td>500</td><td>250</td><td>125</td><td>60(X)</td><td>30</td><td>8</td><td>1</td></tr>' +
      '<tr><th>缝宽 mm</th><td>2.20</td><td>4.40</td><td>8.80</td><td>17.60</td><td>36.67</td><td colspan="3">全开(≥36)</td></tr>' +
      '<tr><th>曝光 ms</th><td>1.00</td><td>2.00</td><td>4.00</td><td>8.00</td><td>16.67</td><td colspan="3">≥33.3</td></tr>' +
      '</table><p>X-sync 判据:缝宽 ≥ 幅宽 36mm;幕帘走完幅宽 16.36ms &lt; 1/60=16.67ms。</p>' +
      '<h4>共轭成像 1/u+1/v=1/f(55mm)</h4><table>' +
      '<tr><th>u mm</th><td>∞</td><td>1000</td><td>450</td><td>200</td></tr>' +
      '<tr><th>v mm</th><td>55.00</td><td>58.18</td><td>62.66</td><td>74.24</td></tr>' +
      '<tr><th>伸长 e mm</th><td>0</td><td>3.18</td><td>7.66</td><td>19.24</td></tr>' +
      '</table><p>超焦距 H = F²/(N·c)+F:f/8、c=0.03mm → 12.66m。</p>' +
      '<h4>五棱镜追迹口径</h4>' +
      '<p>两反射面方向 112.5°/157.5°(夹角恰 45°);轴上光线 (38,39.5)→上→(38,58.81)→135°→(35.86,60.95)→出射 (28,60.95) 方向恰 −x。' +
      '入射摆动 ±3° 出射偏差 ≤0.2°(两次反射恒偏 90°);TIR 临界角 asin(1/1.52)=41.14°&lt;45° 成立。</p>' +
      '<h4>文献与口径</h4>' +
      '<p>原典/实物:Contax S(1949,Zeiss Ikon,Dresden,首台量产五棱镜单反);Pentax Asahiflex(1952,即时回弹反光镜)。</p>' +
      '<p>现代口径:Jacobson et al.《The Manual of Photography》光圈标称序列/焦平面快门几何;两次平面镜反射偏差定理(本站以数值追迹验证)。' +
      '被摄体距离与部分外观为演示压缩,不进断言。</p>'
  };
})(window.MECH = window.MECH || {});
