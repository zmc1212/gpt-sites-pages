// 程序化 canvas 纹理(天坛材质:琉璃瓦 / 朱红 / 汉白玉 / 青砖 / 园林地)
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

// 蓝琉璃瓦(筒瓦垄的明暗条纹)
export function glazeBlueTexture({ size = 256, seed = 3, base = '#2a56a0' } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  // 瓦垄:垂直明暗条纹
  const ridges = 16, rw = size / ridges;
  for (let i = 0; i < ridges; i++) {
    ctx.fillStyle = shade(base, 1.28);       // 垄顶高光
    ctx.fillRect(i * rw + rw * 0.18, 0, rw * 0.28, size);
    ctx.fillStyle = shade(base, 0.72);       // 垄间阴影
    ctx.fillRect(i * rw + rw * 0.74, 0, rw * 0.26, size);
  }
  // 横向瓦节
  ctx.globalAlpha = 0.16;
  for (let y = 0; y < size; y += 22) {
    ctx.fillStyle = '#0c1e44';
    ctx.fillRect(0, y, size, 2.4);
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 900, 0.08);
  return tex(c);
}

// 绿琉璃瓦(墙帽)
export function glazeGreenTexture({ size = 128, seed = 9 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  const base = '#3a6e3c';
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const ridges = 8, rw = size / ridges;
  for (let i = 0; i < ridges; i++) {
    ctx.fillStyle = shade(base, 1.22);
    ctx.fillRect(i * rw + rw * 0.15, 0, rw * 0.3, size);
    ctx.fillStyle = shade(base, 0.7);
    ctx.fillRect(i * rw + rw * 0.72, 0, rw * 0.28, size);
  }
  speckle(ctx, size, size, rnd, 400, 0.08);
  return tex(c);
}

// 朱红大漆(柱身:竖向微光纹理)
export function redPaintTexture({ size = 128, seed = 17, base = '#b23a28' } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 46; i++) {
    const x = rnd() * size;
    ctx.globalAlpha = 0.05 + rnd() * 0.1;
    ctx.fillStyle = rnd() > 0.5 ? '#c14a30' : '#6e1a12';
    ctx.fillRect(x, 0, 1 + rnd() * 3, size);
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 300, 0.06);
  return tex(c);
}

// 汉白玉(台基 / 圜丘:米白 + 灰纹)
export function marbleTexture({ size = 256, seed = 31, base = '#ece6d4', vein = '#b0a894' } = {}) {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const rnd = mulberry32(seed);
  ctx.strokeStyle = vein; ctx.lineWidth = 1;
  for (let i = 0; i < 30; i++) {
    ctx.globalAlpha = 0.05 + rnd() * 0.1;
    ctx.beginPath();
    let x = rnd() * size, y = 0;
    ctx.moveTo(x, y);
    while (y < size) { y += 8 + rnd() * 14; x += (rnd() - 0.5) * 20; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // 石板缝
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#9a927e'; ctx.lineWidth = 1.6;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath(); ctx.moveTo(0, i * size / 4); ctx.lineTo(size, i * size / 4); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 700, 0.06);
  return tex(c);
}

// 青砖(院墙 / 回音壁磨砖)
export function brickTexture({ size = 256, seed = 41, base = '#8f8574', mortar = '#6b6354', rows = 10 } = {}) {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = mortar; ctx.fillRect(0, 0, size, size);
  const rnd = mulberry32(seed);
  const bh = size / rows, cols = 6;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (size / cols / 2);
    for (let i = -1; i < cols; i++) {
      const bw = size / cols;
      const l = 0.94 + rnd() * 0.16;
      ctx.fillStyle = shade(base, l);
      ctx.fillRect(i * bw + off + 1, r * bh + 1, bw - 2, bh - 2);
    }
  }
  speckle(ctx, size, size, rnd, 1100, 0.1);
  return tex(c);
}

// 园林地(灰褐土 + 苔绿斑,镜像平铺)
export function groundTexture({ size = 256, seed = 23 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#9d9278'; ctx.fillRect(0, 0, size, size);
  const tones = ['#a89c80', '#8f8468', '#b0a486', '#7e7458', '#98a07c'];
  for (let i = 0; i < 340; i++) {
    ctx.fillStyle = tones[(rnd() * tones.length) | 0];
    ctx.globalAlpha = 0.12 + rnd() * 0.16;
    ctx.beginPath();
    ctx.ellipse(rnd() * size, rnd() * size, 5 + rnd() * 26, 3 + rnd() * 14, rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 1200, 0.09);
  const t = tex(c, { repeat: 40 });
  t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
  return t;
}

// 青绿斗拱带(檐下彩画示意:青绿相间方格)
export function dougongTexture({ size = 128, seed = 51 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#14352c'; ctx.fillRect(0, 0, size, size);
  const n = 8, w = size / n;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i % 2 ? '#1e4e3e' : '#102e28';
    ctx.fillRect(i * w + 2, 6, w - 4, size - 20);
    ctx.fillStyle = '#c8a25e';
    ctx.globalAlpha = 0.45;
    ctx.fillRect(i * w + w * 0.36, 10, 3, size - 28);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = '#8a6a2f';
  ctx.fillRect(0, size - 14, size, 14);
  speckle(ctx, size, size, rnd, 200, 0.08);
  return tex(c);
}

// 烫金龙纹柱顶(简作金箍纹)
export function goldBandTexture({ size = 64, seed = 61 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#c8a25e'; ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#9a7434';
  for (let y = 0; y < size; y += 12) ctx.fillRect(0, y, size, 4);
  speckle(ctx, size, size, rnd, 160, 0.1);
  return tex(c);
}

// 共享材质集
export function makeMaterials() {
  const glazeBlue = glazeBlueTexture();
  const glazeGreen = glazeGreenTexture();
  const redPaint = redPaintTexture();
  const marble = marbleTexture();
  const brick = brickTexture();
  const ground = groundTexture();
  const dougong = dougongTexture();
  const goldBand = goldBandTexture();
  const std = (map, opts = {}) => new THREE.MeshStandardMaterial({ map, roughness: 0.9, metalness: 0.0, ...opts });
  const mat = (key, opts = {}) => {
    const m = std(key, opts);
    m.side = THREE.DoubleSide;
    return m;
  };
  return {
    glazeBlue: mat(glazeBlue, { roughness: 0.4, metalness: 0.06 }),
    glazeGreen: mat(glazeGreen, { roughness: 0.42, metalness: 0.06 }),
    redPaint: mat(redPaint, { roughness: 0.5 }),
    marble: std(marble, { roughness: 0.62 }),
    marbleFine: std(marble.clone(), { roughness: 0.5 }),
    brick: std(brick, { roughness: 0.95 }),
    ground: std(ground, { vertexColors: true }),
    dougong: mat(dougong, { roughness: 0.75 }),
    gold: mat(goldBand, { roughness: 0.35, metalness: 0.5 }),
    goldTrim: new THREE.MeshStandardMaterial({ color: 0xc8a25e, roughness: 0.35, metalness: 0.55 }),
    bark: new THREE.MeshStandardMaterial({ color: 0x4e4034, roughness: 1 }),
    cypress: new THREE.MeshStandardMaterial({ color: 0x2c4630, roughness: 1 }),
    shrub: new THREE.MeshStandardMaterial({ color: 0x5a643e, roughness: 1 }),
    rock: new THREE.MeshStandardMaterial({ color: 0x8d8578, roughness: 1 }),
  };
}
