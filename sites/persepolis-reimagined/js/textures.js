// 程序化 canvas 纹理(全部分辨率小、可重复;file:// 下无跨域污染)
import * as THREE from 'three';

// 确定性随机
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function tex(c, { repeat = 1, srgb = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// 填充噪点
function speckle(ctx, w, h, rnd, n, amp) {
  for (let i = 0; i < n; i++) {
    const x = rnd() * w, y = rnd() * h, s = 1 + rnd() * 2;
    const v = (rnd() - 0.5) * amp;
    ctx.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v)})`;
    ctx.fillRect(x, y, s, s);
  }
}

// 条石砌墙(错缝砌筑)
export function stoneTexture({ base = '#cdb891', mortar = '#8f7f60', blocks = [6, 5], size = 256, seed = 7, weather = 0.18 } = {}) {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const rnd = mulberry32(seed);
  const rows = blocks[0], cols = blocks[1];
  const bh = size / rows;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (size / cols / 2);
    for (let i = -1; i < cols; i++) {
      const bw = size / cols;
      const x = i * bw + off, y = r * bh;
      const l = 1 - weather * rnd() * 0.9 + weather * 0.2;
      ctx.fillStyle = shade(base, l);
      ctx.fillRect(x + 1.2, y + 1.2, bw - 2.4, bh - 2.4);
    }
  }
  ctx.strokeStyle = mortar; ctx.lineWidth = 1.6;
  for (let r = 0; r <= rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * bh); ctx.lineTo(size, r * bh); ctx.stroke(); }
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (size / cols / 2);
    for (let i = 0; i <= cols; i++) {
      const x = (i * size / cols + off) % size;
      ctx.beginPath(); ctx.moveTo(x, r * bh); ctx.lineTo(x, (r + 1) * bh); ctx.stroke();
    }
  }
  speckle(ctx, size, size, rnd, 2200, 0.16);
  return tex(c);
}

// 台面石板
export function pavingTexture({ size = 256, seed = 11, base = '#c9b68e', line = '#93825f' } = {}) {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const rnd = mulberry32(seed);
  const n = 4, cell = size / n;
  ctx.strokeStyle = line; ctx.lineWidth = 2;
  for (let i = 0; i <= n; i++) {
    ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(size, i * cell); ctx.stroke();
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const l = 1 - rnd() * 0.1;
    ctx.fillStyle = shade(base, l);
    ctx.fillRect(i * cell + 2, j * cell + 2, cell - 4, cell - 4);
  }
  speckle(ctx, size, size, rnd, 1600, 0.13);
  return tex(c);
}

// 平原地面(干草原 + 赭土)
export function groundTexture({ size = 256, seed = 23 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#a8925c'; ctx.fillRect(0, 0, size, size);
  const tones = ['#b8a26a', '#98834e', '#c2b077', '#8e7c4e', '#b09a62'];
  for (let i = 0; i < 380; i++) {
    ctx.fillStyle = tones[(rnd() * tones.length) | 0];
    ctx.globalAlpha = 0.16 + rnd() * 0.2;
    const w = 6 + rnd() * 40, h = 4 + rnd() * 22;
    ctx.beginPath();
    ctx.ellipse(rnd() * size, rnd() * size, w, h, rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 1400, 0.1);
  const t = tex(c, { repeat: 36 });
  t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
  return t;
}

// 打磨灰岩(Tachara 用)
export function marbleTexture({ size = 256, seed = 31, base = '#b9b3a4', vein = '#8e887a' } = {}) {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const rnd = mulberry32(seed);
  ctx.strokeStyle = vein; ctx.lineWidth = 1;
  for (let i = 0; i < 26; i++) {
    ctx.globalAlpha = 0.12 + rnd() * 0.2;
    ctx.beginPath();
    let x = rnd() * size, y = 0;
    ctx.moveTo(x, y);
    while (y < size) { y += 6 + rnd() * 12; x += (rnd() - 0.5) * 16; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 900, 0.08);
  return tex(c, { repeat: 3 });
}

// 深色石(百柱厅)
export function darkStoneTexture({ size = 256, seed = 43, base = '#a49a88' } = {}) {
  return stoneTexture({ base, mortar: '#6e6350', blocks: [5, 4], size, seed, weather: 0.14 });
}

// 玫瑰花饰(柱廊楣带)
export function rosetteTexture({ size = 64, seed = 5 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#c2ac82'; ctx.fillRect(0, 0, size, size);
  const cx = size / 2, cy = size / 2, R = size * 0.38;
  for (let p = 0; p < 8; p++) {
    const a = (p / 8) * Math.PI * 2;
    ctx.fillStyle = p % 2 ? '#9d8256' : '#b3996b';
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * R * 0.55, cy + Math.sin(a) * R * 0.55, R * 0.4, R * 0.24, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#8a6f47';
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.34, 0, Math.PI * 2); ctx.fill();
  speckle(ctx, size, size, rnd, 120, 0.1);
  return tex(c, { repeat: 1 });
}

function shade(hex, l) {
  const c = new THREE.Color(hex);
  c.multiplyScalar(l);
  return '#' + c.getHexString();
}

// 共享材质集(单例)
export function makeMaterials() {
  const stoneMap = stoneTexture();
  const stoneDarkMap = darkStoneTexture();
  const pavingMap = pavingTexture();
  const marbleMap = marbleTexture();
  const groundMap = groundTexture();
  const std = (map, opts = {}) => new THREE.MeshStandardMaterial({
    map, roughness: 0.92, metalness: 0.0, ...opts,
  });
  return {
    stone: std(stoneMap.clone()),
    stoneDark: std(stoneDarkMap.clone()),
    paving: std(pavingMap.clone(), { roughness: 0.85 }),
    marble: std(marbleMap.clone(), { roughness: 0.55 }),
    relief: std(stoneMap.clone(), { color: 0xd6c7a4, roughness: 0.9 }),
    rose: std(rosetteTexture(), { roughness: 0.9 }),
    ground: std(groundMap.clone(), { vertexColors: true }),
    bark: new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 1 }),
    cypress: new THREE.MeshStandardMaterial({ color: 0x2e4a2a, roughness: 1 }),
    shrub: new THREE.MeshStandardMaterial({ color: 0x57603a, roughness: 1 }),
    rock: new THREE.MeshStandardMaterial({ color: 0x8d7f6c, roughness: 1 }),
    goldTrim: new THREE.MeshStandardMaterial({ color: 0xc8a25e, roughness: 0.45, metalness: 0.55 }),
  };
}
