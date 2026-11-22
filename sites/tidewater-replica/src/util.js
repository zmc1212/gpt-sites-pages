/* util.js — 通用工具:随机数、插值、值噪声、格式化 */
(function () {
  'use strict';
  const TW = (window.TW = window.TW || {});

  const util = {
    clamp(v, a, b) { return v < a ? a : v > b ? b : v; },
    lerp(a, b, t) { return a + (b - a) * t; },
    // 平滑插值(边缘平滑)
    smooth(t) { t = util.clamp(t, 0, 1); return t * t * (3 - 2 * t); },
    smoothstep(a, b, v) { return util.smooth((v - a) / (b - a)); },
    // 与 dt 无关的阻尼逼近
    damp(cur, target, lambda, dt) { return util.lerp(cur, target, 1 - Math.exp(-lambda * dt)); },

    // 确定性随机(mulberry32)——岛屿地形用,保证跨刷新一致
    seeded(seed) {
      let s = seed >>> 0;
      const f = function () {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      f.range = (a, b) => a + f() * (b - a);
      f.int = (a, b) => Math.floor(a + f() * (b - a + 1));
      f.pick = (arr) => arr[Math.floor(f() * arr.length)];
      f.chance = (p) => f() < p;
      return f;
    },

    // 运行期随机
    rand: {
      range(a, b) { return a + Math.random() * (b - a); },
      int(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); },
      pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
      chance(p) { return Math.random() < p; },
      // 抛物线分布:偏小值更常见(用于鱼重)
      skewed() { return Math.pow(Math.random(), 1.7); }
    },

    // 2D 值噪声(平滑插值格点哈希),freq 越大细节越多
    noise2D(x, y, seed) {
      const h = (ix, iy) => {
        let n = (ix * 374761393 + iy * 668265263 + (seed || 0) * 1442695041) | 0;
        n = Math.imul(n ^ (n >>> 13), 1274126177);
        return (((n ^ (n >>> 16)) >>> 0) / 4294967296);
      };
      const ix = Math.floor(x), iy = Math.floor(y);
      const fx = util.smooth(x - ix), fy = util.smooth(y - iy);
      return util.lerp(
        util.lerp(h(ix, iy), h(ix + 1, iy), fx),
        util.lerp(h(ix, iy + 1), h(ix + 1, iy + 1), fx), fy);
    },
    // 分形叠加噪声(2 层足够低多边形地形用)
    fbm2D(x, y, seed) {
      return util.noise2D(x, y, seed) * 0.7 + util.noise2D(x * 2.3, y * 2.3, (seed || 0) + 7) * 0.3;
    },

    // 格式化
    fmt: {
      time(h) {
        const hh = Math.floor(h) % 24, mm = Math.floor((h % 1) * 60);
        return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
      },
      weight(kg) { return kg < 1 ? Math.round(kg * 1000) + ' g' : kg.toFixed(2) + ' kg'; },
      len(cm) { return cm < 100 ? Math.round(cm) + ' cm' : (cm / 100).toFixed(2) + ' m'; },
      money(n) { return Math.round(n).toLocaleString('zh-CN'); }
    },

    // 鱼图(emoji 按 species.icon)
    stars(n) { return '★'.repeat(n) + '☆'.repeat(Math.max(0, 4 - n)); }
  };

  TW.util = util;
})();
