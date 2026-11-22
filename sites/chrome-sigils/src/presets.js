/* chrome-sigils — 符记形状库(程序化生成,手绘感抖动)
 *
 * 首屏默认符记、随机符记、帮助示例都从这里取。
 * 每个 shape 是模型坐标(≈ [-1.6, 1.6])下的点序列,
 * 组合时再随机做旋转/缩放/偏移,保证每次「随机」都摆出不同构图。
 */
(function (global) {
  'use strict';

  function jitter(pts, amp) {
    return pts.map(function (p) {
      return {
        x: +(p.x + (Math.random() * 2 - 1) * amp).toFixed(4),
        y: +(p.y + (Math.random() * 2 - 1) * amp).toFixed(4)
      };
    });
  }

  function transform(pts, rot, scale, dx, dy) {
    var c = Math.cos(rot), s = Math.sin(rot);
    return pts.map(function (p) {
      return { x: (p.x * c - p.y * s) * scale + dx, y: (p.x * s + p.y * c) * scale + dy };
    });
  }

  var SHAPES = {
    // 五角星:一笔连成(经典符记)
    star: function () {
      var pts = [];
      for (var i = 0; i <= 5; i++) {
        var a = -Math.PI / 2 + i * (Math.PI * 4 / 5);
        pts.push({ x: Math.cos(a) * 1.15, y: Math.sin(a) * 1.15 });
      }
      return [{ pts: jitter(pts, 0.02), closed: false }];
    },

    // 闪电
    bolt: function () {
      var pts = [
        { x: 0.10, y: 1.30 }, { x: -0.42, y: 0.18 }, { x: 0.05, y: 0.10 },
        { x: -0.24, y: -1.30 }, { x: 0.55, y: -0.12 }, { x: 0.02, y: -0.02 },
        { x: 0.48, y: 1.28 }
      ];
      return [{ pts: jitter(pts, 0.015), closed: false }];
    },

    // 心形(参数曲线,闭合)
    heart: function () {
      var pts = [];
      for (var i = 0; i < 48; i++) {
        var t = (i / 48) * Math.PI * 2;
        pts.push({
          x: 1.15 * Math.sin(t) * Math.sin(t) * Math.sin(t) * 0.9,
          y: (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16 * 1.15
        });
      }
      return [{ pts: jitter(pts, 0.012), closed: true }];
    },

    // 双环相扣
    rings: function () {
      function circle(cx, cy, r) {
        var pts = [];
        for (var i = 0; i < 40; i++) {
          var a = (i / 40) * Math.PI * 2;
          pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
        }
        return pts;
      }
      return [
        { pts: jitter(circle(-0.62, 0.1, 0.62), 0.012), closed: true },
        { pts: jitter(circle(0.62, -0.1, 0.62), 0.012), closed: true }
      ];
    },

    // 波浪
    wave: function () {
      var pts = [];
      for (var i = 0; i <= 60; i++) {
        var t = i / 60;
        pts.push({ x: (t - 0.5) * 2.7, y: Math.sin(t * Math.PI * 5) * 0.42 });
      }
      return [{ pts: jitter(pts, 0.012), closed: false }];
    },

    // 回旋
    spiral: function () {
      var pts = [];
      for (var i = 0; i < 90; i++) {
        var t = i / 90;
        var a = t * Math.PI * 5.2;
        var r = 0.16 + t * 1.05;
        pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }
      return [{ pts: jitter(pts, 0.01), closed: false }];
    },

    // 箭:杆 + 尾羽 + 箭头
    arrow: function () {
      return [
        { pts: jitter([{ x: -1.15, y: -1.1 }, { x: 1.05, y: 1.15 }], 0.012), closed: false },
        { pts: jitter([{ x: 0.25, y: 1.18 }, { x: 1.05, y: 1.15 }, { x: 1.02, y: 0.32 }], 0.012), closed: false },
        { pts: jitter([{ x: -1.2, y: -1.15 }, { x: -0.42, y: -1.08 }, { x: -1.12, y: -0.4 }], 0.012), closed: false }
      ];
    },

    // 月牙:外弧 + 内弧(两笔)
    moon: function () {
      var outer = [], inner = [];
      for (var i = 0; i <= 30; i++) {
        var a = -Math.PI * 0.62 + (i / 30) * Math.PI * 1.24;
        outer.push({ x: Math.cos(a) * 1.0, y: Math.sin(a) * 1.0 });
      }
      for (i = 0; i <= 30; i++) {
        var b = -Math.PI * 0.52 + (i / 30) * Math.PI * 1.04;
        inner.push({ x: Math.cos(b) * 0.62 + 0.12, y: Math.sin(b) * 0.62 });
      }
      return [
        { pts: jitter(outer, 0.012), closed: false },
        { pts: jitter(inner, 0.012), closed: false }
      ];
    }
  };

  var KEYS = Object.keys(SHAPES);

  /* 随机符记:挑 1–2 个形状,随机旋转/缩放/摆位,组成一个像「符号」的构图 */
  function randomSigil() {
    var count = Math.random() < 0.45 ? 1 : 2;
    var picks = [];
    while (picks.length < count) {
      var k = KEYS[(Math.random() * KEYS.length) | 0];
      if (picks.indexOf(k) < 0) picks.push(k);
    }
    var out = [];
    picks.forEach(function (k, idx) {
      var strokes = SHAPES[k]();
      var rot = (Math.random() * 2 - 1) * (Math.PI * 0.28);
      var scale = 0.72 + Math.random() * 0.4;
      var dx = (idx - (count - 1) / 2) * 1.35 + (Math.random() * 2 - 1) * 0.22;
      var dy = (Math.random() * 2 - 1) * 0.35;
      strokes.forEach(function (st) {
        out.push({ pts: transform(st.pts, rot, scale, dx, dy), closed: st.closed });
      });
    });
    return out;
  }

  /* 首屏默认:星 + 双环,一眼看出「这是符号创作器」 */
  function defaultSigil() {
    var out = [];
    SHAPES.star().forEach(function (st) {
      out.push({ pts: transform(st.pts, 0, 0.8, -0.62, 0.05), closed: st.closed });
    });
    SHAPES.rings().forEach(function (st) {
      out.push({ pts: transform(st.pts, 0, 0.62, 1.05, -0.08), closed: st.closed });
    });
    return out;
  }

  global.SigilPresets = {
    random: randomSigil,
    default: defaultSigil,
    shapes: SHAPES
  };
})(window);
