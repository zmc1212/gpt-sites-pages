/* 闭合式解析地形：地面是一个函数而不是网格查询。
 *
 * 任意点都能以 O(1) 采到精确高度；法线由高度场的解析偏导（有限差分）得到。
 * 这正是脚点搜索与机身贴地稳健的根基：脚落在"函数表面"上，永不穿模。
 * 出口：terrainH(x,z) 高度、terrainN(x,z) 法线、FIELD 场地边长、WORLD_SCALE 全局缩放。
 */
'use strict';

window.SpiderLib = window.SpiderLib || {};
(function (L) {

  // 全局 2 倍缩放：地形形状在半坐标上采样、高度乘 2 —— 坡度不变、尺度更大，
  // 与蜘蛛的腿长读数匹配。
  L.WORLD_SCALE = 2;
  L.FIELD = 130 * L.WORLD_SCALE;

  // 5 倍频三角噪声（各倍频相位错开，避免规则纹样）
  function fbm(x, z) {
    let h = 0, a = 1, f = 0.06, s = 0;
    for (let o = 0; o < 5; o++) { h += a * Math.sin(x * f + o * 1.7) * Math.cos(z * f * 1.11 + o * 2.9); s += a; a *= 0.5; f *= 2; }
    return h / s;
  }
  // 山脊场：|sin·cos| 取反平方，形成连续的脊线网络
  function ridge(x, z) { const r = 1 - Math.abs(Math.sin(x * 0.065) * Math.cos(z * 0.059)); return r * r; }

  // 高斯丘陵特征（位置/幅值/半径）—— 攀爬路线与远山层次
  const FEATURES = [
    { x: -32, z: -28, amp: 11, r: 11 },   // 西北巨丘
    { x: 36, z: 24, amp: 9, r: 9 },       // 东南山包
    { x: -18, z: 42, amp: 6, r: 7 },      // 北侧缓丘
    { x: 44, z: -34, amp: 7, r: 8 },      // 东北远峰
    { x: 26, z: -44, amp: -6, r: 9 },     // 南部洼地
    { x: -44, z: 14, amp: -5, r: 6 },     // 西侧凹坑
  ];

  // 测试钩：自检时可以覆盖成平面/斜坡场地
  let _override = null;
  L.setTerrainOverride = (fn) => { _override = fn; };
  L.clearTerrainOverride = () => { _override = null; };

  function baseH(x, z) {
    // 域扭曲：让噪声流动起来，避免可预见的网格感
    const wx = x + 5 * Math.sin(z * 0.052 + 1.3), wz = z + 5 * Math.cos(x * 0.047 + 2.6);
    let h = 5.6 * fbm(wx * 0.5, wz * 0.5) + 2.1 * fbm(wx * 1.3 + 17, wz * 1.3 + 23) + 3.6 * ridge(wx * 0.5, wz * 0.5);
    for (const f of FEATURES) { const d2 = (x - f.x) * (x - f.x) + (z - f.z) * (z - f.z); h += f.amp * Math.exp(-d2 / (2 * f.r * f.r)); }
    // 出生广场：半径 8 内全平，22 外完全展开（径向平滑过渡）
    const dc = Math.hypot(x, z), flat = L.clamp01((dc - 8) / 14);
    return h * (0.2 + 0.8 * flat);
  }

  L.terrainH = function (x, z) {
    if (_override) return _override(x, z);
    return L.WORLD_SCALE * baseH(x / L.WORLD_SCALE, z / L.WORLD_SCALE);
  };

  // 精确法线：中心差分（步长与倍频尺度匹配）
  L.terrainN = function (x, z) {
    const e = 0.4, hx = L.terrainH(x + e, z) - L.terrainH(x - e, z), hz = L.terrainH(x, z + e) - L.terrainH(x, z - e);
    return L.V3(-hx / (2 * e), 1, -hz / (2 * e)).normalize();
  };

})(window.SpiderLib);
