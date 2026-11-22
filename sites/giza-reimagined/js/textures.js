// 程序化 canvas 纹理(吉萨:砂岩金字塔/石灰岩壳/沙地/岩壁)
import * as THREE from 'three';

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

function tex(c, { repeat = 1 } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function speckle(ctx, w, h, rnd, n, amp) {
  for (let i = 0; i < n; i++) {
    const x = rnd() * w, y = rnd() * h, s = 1 + rnd() * 2;
    const v = (rnd() - 0.5) * amp;
    ctx.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v)})`;
    ctx.fillRect(x, y, s, s);
  }
}

function shade(hex, l) {
  const c = new THREE.Color(hex);
  c.multiplyScalar(l);
  return '#' + c.getHexString();
}

// 砂岩大砌块(金字塔,风化)
export function sandstoneTexture({ size = 256, seed = 3, base = '#d4b078' } = {}) {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const rnd = mulberry32(seed);
  const rows = 7, cols = 4;
  const bh = size / rows;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (size / cols / 2);
    for (let i = -1; i < cols; i++) {
      const bw = size / cols;
      const x = i * bw + off, y = r * bh;
      const l = 0.9 + rnd() * 0.22;
      ctx.fillStyle = shade(base, l);
      ctx.fillRect(x + 1.2, y + 1.2, bw - 2.4, bh - 2.4);
    }
  }
  // 风化色斑
  for (let i = 0; i < 60; i++) {
    ctx.globalAlpha = 0.05 + rnd() * 0.08;
    ctx.fillStyle = rnd() > 0.5 ? '#a8825a' : '#e8d0a0';
    ctx.beginPath();
    ctx.ellipse(rnd() * size, rnd() * size, 6 + rnd() * 22, 3 + rnd() * 10, rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#9a744a'; ctx.lineWidth = 1.6;
  for (let r = 0; r <= rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * bh); ctx.lineTo(size, r * bh); ctx.stroke(); }
  speckle(ctx, size, size, rnd, 1600, 0.12);
  return tex(c);
}

// 石灰岩壳(卡夫拉塔顶,光滑)
export function limestoneTexture({ size = 128, seed = 9, base = '#dcd6c4' } = {}) {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const rnd = mulberry32(seed);
  for (let i = 0; i < 30; i++) {
    ctx.globalAlpha = 0.05 + rnd() * 0.07;
    ctx.fillStyle = shade(base, 0.94 + rnd() * 0.1);
    ctx.beginPath();
    ctx.ellipse(rnd() * size, rnd() * size, 8 + rnd() * 24, 5 + rnd() * 12, rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 500, 0.06);
  return tex(c);
}

// 沙地(金色沙漠)
export function sandTexture({ size = 256, seed = 23 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#d8b878'; ctx.fillRect(0, 0, size, size);
  const tones = ['#e0c084', '#ccab6c', '#d4b474', '#c4a15e', '#e8cc8e'];
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = tones[(rnd() * tones.length) | 0];
    ctx.globalAlpha = 0.14 + rnd() * 0.18;
    ctx.beginPath();
    ctx.ellipse(rnd() * size, rnd() * size, 6 + rnd() * 26, 3 + rnd() * 10, rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  // 沙波纹
  ctx.globalAlpha = 0.08;
  for (let y = 0; y < size; y += 8) {
    ctx.strokeStyle = '#b09458';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = 0; x <= size; x += 8) ctx.lineTo(x, y + Math.sin(x * 0.05 + y) * 3);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 1000, 0.08);
  const t = tex(c, { repeat: 40 });
  t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
  return t;
}

// 岩壁(高原边缘石灰岩断崖)
export function cliffTexture({ size = 256, seed = 43, base = '#c8b088' } = {}) {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const rnd = mulberry32(seed);
  // 竖向侵蚀条纹
  for (let i = 0; i < 40; i++) {
    const x = rnd() * size;
    ctx.globalAlpha = 0.06 + rnd() * 0.1;
    ctx.fillStyle = rnd() > 0.5 ? '#a08458' : '#e0cc9e';
    ctx.fillRect(x, 0, 2 + rnd() * 8, size);
  }
  ctx.globalAlpha = 1;
  // 水平层理
  ctx.globalAlpha = 0.14;
  for (let y = 0; y < size; y += 14 + rnd() * 10) {
    ctx.strokeStyle = '#9a7a50'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 1200, 0.1);
  return tex(c);
}

// 共享材质集
export function makeMaterials() {
  return {
    sandstone: new THREE.MeshStandardMaterial({ map: sandstoneTexture(), roughness: 0.92 }),
    limestone: new THREE.MeshStandardMaterial({ map: limestoneTexture(), roughness: 0.55 }),
    sand: new THREE.MeshStandardMaterial({ map: sandTexture(), vertexColors: true }),
    cliff: new THREE.MeshStandardMaterial({ map: cliffTexture(), roughness: 0.95 }),
    granite: new THREE.MeshStandardMaterial({ color: 0x8a6850, roughness: 0.85 }),
    bark: new THREE.MeshStandardMaterial({ color: 0x6a5438, roughness: 1 }),
    palm: new THREE.MeshStandardMaterial({ color: 0x5a7038, roughness: 1 }),
    rock: new THREE.MeshStandardMaterial({ color: 0x9a8868, roughness: 1 }),
  };
}
