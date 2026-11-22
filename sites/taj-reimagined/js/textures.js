// 程序化 canvas 纹理(泰姬陵:白大理石/红砂岩门楼/水池/花园)
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

// 白大理石(暖白 + 灰脉)
export function marbleWhiteTexture({ size = 256, seed = 7 } = {}) {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = '#f2ecdd'; ctx.fillRect(0, 0, size, size);
  const rnd = mulberry32(seed);
  ctx.strokeStyle = '#c4bca8'; ctx.lineWidth = 1;
  for (let i = 0; i < 24; i++) {
    ctx.globalAlpha = 0.07 + rnd() * 0.1;
    ctx.beginPath();
    let x = rnd() * size, y = 0;
    ctx.moveTo(x, y);
    while (y < size) { y += 8 + rnd() * 14; x += (rnd() - 0.5) * 18; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 700, 0.05);
  return tex(c);
}

// 红砂岩(门楼/围墙)
export function redSandstoneTexture({ size = 256, seed = 13, base = '#b45a3c' } = {}) {
  const [c, ctx] = canvas(size, size);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const rnd = mulberry32(seed);
  const rows = 8, cols = 5;
  const bh = size / rows;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (size / cols / 2);
    for (let i = -1; i < cols; i++) {
      const bw = size / cols;
      const l = 0.9 + rnd() * 0.2;
      ctx.fillStyle = shade(base, l);
      ctx.fillRect(i * bw + off + 1, r * bh + 1, bw - 2, bh - 2);
    }
  }
  speckle(ctx, size, size, rnd, 1200, 0.1);
  return tex(c);
}

// 水池水面(淡蓝金反光)
export function waterTexture({ size = 256, seed = 31 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#9ab4c8'; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 220; i++) {
    ctx.globalAlpha = 0.06 + rnd() * 0.1;
    ctx.fillStyle = rnd() > 0.45 ? '#d8e4f0' : '#7e9ab8';
    ctx.beginPath();
    ctx.ellipse(rnd() * size, rnd() * size, 10 + rnd() * 30, 2 + rnd() * 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return tex(c, { repeat: 2 });
}

// 花园地面(草坪 + 步道色)
export function gardenTexture({ size = 256, seed = 23 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#8e9c58'; ctx.fillRect(0, 0, size, size);
  const tones = ['#9aa860', '#84924e', '#a4b068'];
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = tones[(rnd() * tones.length) | 0];
    ctx.globalAlpha = 0.16 + rnd() * 0.16;
    ctx.beginPath();
    ctx.ellipse(rnd() * size, rnd() * size, 6 + rnd() * 24, 4 + rnd() * 12, rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 900, 0.08);
  const t = tex(c, { repeat: 30 });
  t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
  return t;
}

// 共享材质集
export function makeMaterials() {
  return {
    marble: new THREE.MeshStandardMaterial({ map: marbleWhiteTexture(), roughness: 0.5 }),
    marblePolish: new THREE.MeshStandardMaterial({ map: marbleWhiteTexture({ seed: 12 }), roughness: 0.38 }),
    sandstone: new THREE.MeshStandardMaterial({ map: redSandstoneTexture(), roughness: 0.9 }),
    water: new THREE.MeshStandardMaterial({ map: waterTexture(), roughness: 0.12, metalness: 0.35 }),
    garden: new THREE.MeshStandardMaterial({ map: gardenTexture(), vertexColors: true }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd4b36c, roughness: 0.35, metalness: 0.5 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x3a3230, roughness: 0.8 }),
    palm: new THREE.MeshStandardMaterial({ color: 0x2c4426, roughness: 1 }),
    bark: new THREE.MeshStandardMaterial({ color: 0x4a3c28, roughness: 1 }),
    rock: new THREE.MeshStandardMaterial({ color: 0x9a9280, roughness: 1 }),
  };
}
