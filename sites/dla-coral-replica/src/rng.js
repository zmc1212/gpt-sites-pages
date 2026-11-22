/* 确定论随机工具:xorshift32 + murmur 风格细胞哈希。
   同一 seed 下模拟完全可复现(?selftest=1 依赖此性质)。 */
(function () {
  'use strict';

  const DC = (window.DC = window.DC || {});

  function xorshift32(state) {
    let next = state >>> 0 || 0xa341316c;
    next ^= next << 13; next >>>= 0;
    next ^= next >>> 17;
    next ^= next << 5; next >>>= 0;
    return next;
  }

  /** 返回一个 [0,1) 确定论随机流(闭包持有状态)。 */
  function makeRng(seed) {
    let s = (seed >>> 0) || 0x9e3779b9;
    return function rng() {
      s = xorshift32(s);
      return s / 4294967296;
    };
  }

  /** murmur3 fmix 风格整数混合,用于细胞坐标 → 槽位。 */
  function hashInt(value) {
    let next = value >>> 0;
    next ^= next >>> 16; next = Math.imul(next, 0x7feb352d) >>> 0;
    next ^= next >>> 15; next = Math.imul(next, 0x846ca68b) >>> 0;
    next ^= next >>> 16;
    return next;
  }

  /** 细胞 (x,y,z) → 哈希值。 */
  function hashCell(x, y, z) {
    return hashInt(hashInt(x | 0) ^ Math.imul(hashInt((y | 0) + 0x9e3779b9), 0x85ebca6b) ^ Math.imul(hashInt((z | 0) + 0x85ebca6b) >>> 3, 0x27d4eb2f));
  }

  function nextPowerOfTwo(value) {
    if (!(value > 1)) return 1;
    return 1 << Math.ceil(Math.log2(value));
  }

  DC.rng = { xorshift32, makeRng, hashInt, hashCell, nextPowerOfTwo };
})();
