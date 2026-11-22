/* 通用工具:种子随机 / 值噪声 / 几何合并 / Canvas 贴图助手 */
(function (global) {
  'use strict';

  /* mulberry32 种子随机 */
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* 三维 hash 值噪声(确定性,供石面风化位移使用) */
  function hash3(x, y, z) {
    var h = Math.imul(Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 2246822519), 3266489917);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function noise3(x, y, z) {
    var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    var xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
    var v = 0, c, dx, dy, dz, w;
    for (var i = 0; i < 8; i++) {
      dx = (i & 1), dy = (i >> 1) & 1, dz = (i >> 2) & 1;
      c = hash3(xi + dx, yi + dy, zi + dz);
      w = (dx ? xf : 1 - xf) * (dy ? yf : 1 - yf) * (dz ? zf : 1 - zf);
      v += c * w;
    }
    return v; // 0..1
  }
  function fbm3(x, y, z, oct) {
    var v = 0, a = 0.5, f = 1, i;
    for (i = 0; i < (oct || 3); i++) { v += a * noise3(x * f, y * f, z * f); a *= 0.5; f *= 2.07; }
    return v / (1 - Math.pow(0.5, oct || 3)); // 归一到 0..1
  }
  function noise2(x, y) { return noise3(x, y, 7.31); }

  /* 合并多个 BufferGeometry(非索引化,要求 position/normal/color 三属性齐备) */
  function mergeGeoms(geoms) {
    var total = 0, i, g;
    for (i = 0; i < geoms.length; i++) { g = geoms[i].toNonIndexed ? geoms[i].toNonIndexed() : geoms[i]; total += g.attributes.position.count; }
    var pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3);
    var off = 0, hasColor = true;
    for (i = 0; i < geoms.length; i++) {
      g = geoms[i].toNonIndexed ? geoms[i].toNonIndexed() : geoms[i];
      if (!g.attributes.color) hasColor = false;
    }
    if (!hasColor) throw new Error('mergeGeoms: 所有子几何体必须带 color 顶点色');
    for (i = 0; i < geoms.length; i++) {
      g = geoms[i].toNonIndexed ? geoms[i].toNonIndexed() : geoms[i];
      pos.set(g.attributes.position.array, off * 3);
      nor.set(g.attributes.normal.array, off * 3);
      col.set(g.attributes.color.array, off * 3);
      off += g.attributes.position.count;
    }
    var out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    out.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return out;
  }

  /* 平滑步进 */
  function smoothstep(a, b, x) {
    var t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* 颜色混合法线化辅助 */
  function mixColor(c1, c2, t) {
    return new THREE.Color(
      clamp(c1.r + (c2.r - c1.r) * t, 0, 1),
      clamp(c1.g + (c2.g - c1.g) * t, 0, 1),
      clamp(c1.b + (c2.b - c1.b) * t, 0, 1)
    );
  }

  global.STUtil = {
    rng: rng, noise3: noise3, fbm3: fbm3, noise2: noise2,
    mergeGeoms: mergeGeoms, smoothstep: smoothstep, clamp: clamp, lerp: lerp, mixColor: mixColor
  };
})(window);
