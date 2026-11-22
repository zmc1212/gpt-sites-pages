// 程序化 canvas 纹理(长城材质:城砖 / 秋山植被 / 山岩 / 灰瓦村舍)
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

// 城砖(青灰大砖,错缝;墙用克隆调 repeat)
export function brickTexture({ size = 256, seed = 41, base = '#8a8276', mortar = '#5f5a50', rows = 12 } = {}) {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = mortar; ctx.fillRect(0, 0, size, size);
  const rnd = mulberry32(seed);
  const bh = size / rows, cols = 5;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (size / cols / 2);
    for (let i = -1; i < cols; i++) {
      const bw = size / cols;
      const l = 0.9 + rnd() * 0.2;
      ctx.fillStyle = shade(base, l);
      ctx.fillRect(i * bw + off + 1.4, r * bh + 1.4, bw - 2.8, bh - 2.8);
      // 砖面磨损
      if (rnd() < 0.3) {
        ctx.globalAlpha = 0.14;
        ctx.fillStyle = rnd() > 0.5 ? '#6a6458' : '#9a9488';
        ctx.fillRect(i * bw + off + 4, r * bh + 4, bw - 10, bh - 10);
        ctx.globalAlpha = 1;
      }
    }
  }
  speckle(ctx, size, size, rnd, 1100, 0.1);
  return tex(c);
}

// 山岩(风化岩面)
export function rockTexture({ size = 256, seed = 71, base = '#8c8478' } = {}) {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const rnd = mulberry32(seed);
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = shade(base, 0.8 + rnd() * 0.4);
    ctx.globalAlpha = 0.2 + rnd() * 0.25;
    ctx.beginPath();
    ctx.ellipse(rnd() * size, rnd() * size, 6 + rnd() * 24, 4 + rnd() * 16, rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // 竖向风化裂隙
  ctx.strokeStyle = '#5a544a'; ctx.lineWidth = 1.2;
  for (let i = 0; i < 22; i++) {
    ctx.globalAlpha = 0.12 + rnd() * 0.12;
    ctx.beginPath();
    let x = rnd() * size, y = rnd() * size * 0.4;
    ctx.moveTo(x, y);
    while (y < size) { y += 10 + rnd() * 16; x += (rnd() - 0.5) * 10; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 900, 0.09);
  return tex(c, { repeat: 6 });
}

// 灰瓦(村舍)
export function tileGreyTexture({ size = 256, seed = 3, base = '#5e5c56' } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const ridges = 16, rw = size / ridges;
  for (let i = 0; i < ridges; i++) {
    ctx.fillStyle = shade(base, 1.28);
    ctx.fillRect(i * rw + rw * 0.18, 0, rw * 0.28, size);
    ctx.fillStyle = shade(base, 0.7);
    ctx.fillRect(i * rw + rw * 0.74, 0, rw * 0.26, size);
  }
  ctx.globalAlpha = 0.16;
  for (let y = 0; y < size; y += 22) {
    ctx.fillStyle = '#26241e';
    ctx.fillRect(0, y, size, 2.4);
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 900, 0.08);
  return tex(c);
}

// 山地草皮(秋色斑驳)
export function mountainTexture({ size = 256, seed = 23 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#7e7858'; ctx.fillRect(0, 0, size, size);
  const tones = ['#8a8260', '#6e7450', '#94845c', '#5e6a4c', '#a0905e', '#746a4e'];
  for (let i = 0; i < 380; i++) {
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

// 文字砖戳印(浅浮雕字块示意)
export function stampTexture({ size = 64, seed = 97 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#8a8276'; ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = '#6e6a5e';
  ctx.fillRect(8, 8, size - 16, size - 16);
  ctx.globalAlpha = 1;
  // 伪汉字笔画刻痕
  ctx.strokeStyle = '#5c584c'; ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    const x = 10 + rnd() * (size - 24), y = 10 + rnd() * (size - 24);
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rnd() - 0.5) * 26, y + (rnd() - 0.5) * 26);
    ctx.stroke();
  }
  return tex(c);
}

// 共享材质集
export function makeMaterials() {
  const brick = brickTexture();
  const brickWallTex = brickTexture({ size: 256, seed: 42, rows: 12 });
  brickWallTex.repeat.set(2.2, 1.1);
  const brickCylTex = brickTexture({ size: 256, seed: 43, rows: 14 });
  brickCylTex.repeat.set(12, 2.2);
  const rock = rockTexture();
  const tileGrey = tileGreyTexture();
  const mountain = mountainTexture();
  const stamp = stampTexture();
  const std = (map, opts = {}) => new THREE.MeshStandardMaterial({ map, roughness: 0.9, metalness: 0.0, ...opts });
  const mat = (key, opts = {}) => {
    const m = std(key, opts);
    m.side = THREE.DoubleSide;
    return m;
  };
  return {
    brick: std(brick, { roughness: 0.94 }),
    brickWall: std(brickWallTex, { roughness: 0.94 }),
    brickCyl: std(brickCylTex, { roughness: 0.94 }),
    rock: std(rock, { roughness: 1 }),
    tileGrey: mat(tileGrey, { roughness: 0.62 }),
    mountain: std(mountain, { vertexColors: true }),
    stamp: std(stamp, { roughness: 0.94 }),
    marble: new THREE.MeshStandardMaterial({ color: 0xb8b2a2, roughness: 0.7 }),
    marbleFine: new THREE.MeshStandardMaterial({ color: 0xc6c0b0, roughness: 0.6 }),
    redPaint: new THREE.MeshStandardMaterial({ color: 0x8a3a28, roughness: 0.6 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x5e4c38, roughness: 1 }),
    soil: new THREE.MeshStandardMaterial({ color: 0x6e6250, roughness: 1 }),
    gold: std(brick.clone(), { roughness: 0.9 }),
    goldTrim: new THREE.MeshStandardMaterial({ color: 0xc8a25e, roughness: 0.35, metalness: 0.55 }),
    bark: new THREE.MeshStandardMaterial({ color: 0x4a4034, roughness: 1 }),
    autumnA: new THREE.MeshStandardMaterial({ color: 0xc09a3e, roughness: 1 }),
    autumnB: new THREE.MeshStandardMaterial({ color: 0xa8682e, roughness: 1 }),
    autumnC: new THREE.MeshStandardMaterial({ color: 0x9c4830, roughness: 1 }),
    pine: new THREE.MeshStandardMaterial({ color: 0x2e4632, roughness: 1 }),
    shrub: new THREE.MeshStandardMaterial({ color: 0x6a6a44, roughness: 1 }),
  };
}
