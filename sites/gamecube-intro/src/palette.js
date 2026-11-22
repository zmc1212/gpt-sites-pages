// 配色系统:全部颜色由基准「靛紫」做一次 OKLCH 色相旋转 / 饱和度缩放派生,
// 3D 场景(GX 双色寄存器、残影、logo 贴图)与 UI 强调色共用同一套派生结果,
// 因此切换配色时画面与控件永远一致;默认「靛紫」即原作开机画面的颜色。
// OKLab/OKLCH 采用 Björn Ottosson 的公开公式。
window.GC = window.GC || {};
GC.palette = (function () {
  'use strict';

  // 基准靛紫(sRGB 0..255);gxLo/gxHi 是小方块 GX 着色的暗/亮两端
  const BASE = {
    gxLo: [30, 20, 60],
    gxHi: [95, 80, 190],
    trail: [0x63, 0x50, 0xbb],
    accent: [125, 108, 240],
    accentHover: [141, 126, 245],
    panel: [8, 5, 18],
  };

  const OPTIONS = [
    { id: 'indigo', label: '靛紫' },
    { id: 'blue', label: '蓝', hue: 258 },
    { id: 'teal', label: '青', hue: 195 },
    { id: 'green', label: '绿', hue: 145 },
    { id: 'orange', label: '橙', hue: 50 },
    { id: 'red', label: '红', hue: 25 },
    { id: 'pink', label: '粉', hue: 350 },
    { id: 'silver', label: '银', chroma: 0 },
  ];

  const option = (id) => {
    for (const o of OPTIONS) if (o.id === id) return o;
    return OPTIONS[0];
  };

  // --- sRGB <-> 线性 ---
  const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

  // --- RGB -> OKLCH ---
  const rgbToOklch = (rgb) => {
    const r = toLinear(rgb[0] / 255), g = toLinear(rgb[1] / 255), b = toLinear(rgb[2] / 255);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return [L, Math.hypot(a, bb), (Math.atan2(bb, a) * 180) / Math.PI];
  };

  // --- OKLCH -> 线性 RGB ---
  const oklchToLinear = ([L, C, H]) => {
    const a = C * Math.cos((H * Math.PI) / 180);
    const b = C * Math.sin((H * Math.PI) / 180);
    const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
    const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
    const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
    return [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
  };

  const inGamut = (lin) => lin.every((c) => c >= -1e-4 && c <= 1 + 1e-4);

  // 等亮度旋转色相并缩放饱和度;出 sRGB 色域时二分收缩饱和度而不是裁切通道,
  // 避免色相偏移(青/橙在此亮度下到不了靛紫的饱和度,会被收进来)。
  const shift = (rgb, hueShift, chromaScale) => {
    const [L, C, H] = rgbToOklch(rgb);
    let fitted = C * chromaScale;
    if (!inGamut(oklchToLinear([L, fitted, H + hueShift]))) {
      let low = 0, high = fitted;
      for (let i = 0; i < 20; i++) {
        const mid = (low + high) / 2;
        if (inGamut(oklchToLinear([L, mid, H + hueShift]))) low = mid;
        else high = mid;
      }
      fitted = low;
    }
    const lin = oklchToLinear([L, fitted, H + hueShift]);
    return lin.map((c) => Math.round(toGamma(Math.min(1, Math.max(0, c))) * 255));
  };

  const BASE_HUE = rgbToOklch(BASE.accent)[2];

  // 派生整套配色;recolor 用于逐像素重染 Canvas 贴图(logo 面/文字),
  // 默认靛紫时 recolor 为 null,贴图保持原样不重绘。
  const paletteFor = (id) => {
    const o = option(id);
    const hueShift = o.hue === undefined ? 0 : o.hue - BASE_HUE;
    const chromaScale = o.chroma === undefined ? 1 : o.chroma;
    if (hueShift === 0 && chromaScale === 1) {
      return Object.assign({}, BASE, { recolor: null, id: o.id });
    }
    const recolor = (rgb) => shift(rgb, hueShift, chromaScale);
    return {
      id: o.id,
      gxLo: recolor(BASE.gxLo),
      gxHi: recolor(BASE.gxHi),
      trail: recolor(BASE.trail),
      accent: recolor(BASE.accent),
      accentHover: recolor(BASE.accentHover),
      panel: recolor(BASE.panel),
      recolor,
    };
  };

  // rgb 数组 -> css 颜色字符串
  const css = (rgb, alpha) =>
    alpha === undefined
      ? 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'
      : 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';

  return { OPTIONS, option, paletteFor, css, BASE };
})();
