// 程序化 canvas 纹理(莫高窟材质:砂岩崖壁 / 沙丘 / 壁画石青石绿 / 木质栈道 / 泥塑金彩)
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

// 砂岩崖壁(砾岩:水平层理 + 蜂窝风化)
export function cliffTexture({ size = 256, seed = 71, base = '#c0a074' } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  // 水平层理
  for (let y = 0; y < size; y += 6 + rnd() * 10) {
    ctx.fillStyle = shade(base, 0.82 + rnd() * 0.3);
    ctx.globalAlpha = 0.24 + rnd() * 0.2;
    ctx.fillRect(0, y, size, 3 + rnd() * 6);
  }
  ctx.globalAlpha = 1;
  // 蜂窝风化坑
  for (let i = 0; i < 90; i++) {
    const r = 2 + rnd() * 9;
    ctx.fillStyle = shade(base, 0.7 + rnd() * 0.16);
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(rnd() * size, rnd() * size, r, r * (0.5 + rnd() * 0.4), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 1000, 0.1);
  const t = tex(c, { repeat: 5 });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// 沙丘(细波纹)
export function sandTexture({ size = 256, seed = 23 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#d4a874'; ctx.fillRect(0, 0, size, size);
  const tones = ['#dab07c', '#c89c66', '#e0b884', '#b88c5c', '#d8ac74'];
  for (let i = 0; i < 240; i++) {
    ctx.fillStyle = tones[(rnd() * tones.length) | 0];
    ctx.globalAlpha = 0.14 + rnd() * 0.14;
    ctx.beginPath();
    ctx.ellipse(rnd() * size, rnd() * size, 8 + rnd() * 30, 3 + rnd() * 10, rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 900, 0.07);
  const t = tex(c, { repeat: 30 });
  t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
  return t;
}

// 经变壁画(石青石绿 + 土红 + 金线:横带 + 菱格 + 飞带)
export function muralTexture({ size = 512, seed = 129, ornate = true } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  // 底色:土红底
  ctx.fillStyle = '#96482e'; ctx.fillRect(0, 0, size, size);
  const QING = '#2e5e7e', LV = '#3e7e5e', MI = '#c8a04c', BAI = '#e8dcb8', MO = '#3c3c38';
  // 上部:藻井/天宫栏楯横带
  ctx.fillStyle = QING; ctx.fillRect(0, 0, size, size * 0.14);
  ctx.fillStyle = MI; ctx.globalAlpha = 0.8;
  for (let x = 0; x < size; x += 26) ctx.fillRect(x, size * 0.13, 13, size * 0.02);
  ctx.globalAlpha = 1;
  // 中部:说法图意象(中央大块 + 两侧条幅)
  ctx.fillStyle = BAI; ctx.globalAlpha = 0.85;
  ctx.fillRect(size * 0.3, size * 0.16, size * 0.4, size * 0.52);
  ctx.globalAlpha = 1;
  ctx.fillStyle = LV; ctx.fillRect(size * 0.02, size * 0.16, size * 0.24, size * 0.52);
  ctx.fillRect(size * 0.74, size * 0.16, size * 0.24, size * 0.52);
  // 中央佛像剪影(抽象:背光 + 坐姿)
  ctx.fillStyle = MI;
  ctx.beginPath();
  ctx.ellipse(size * 0.5, size * 0.34, size * 0.13, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill(); // 背光
  ctx.fillStyle = '#b8582e';
  ctx.beginPath();
  ctx.ellipse(size * 0.5, size * 0.42, size * 0.075, size * 0.09, 0, 0, Math.PI * 2);
  ctx.fill(); // 头
  ctx.beginPath();
  ctx.moveTo(size * 0.42, size * 0.5);
  ctx.quadraticCurveTo(size * 0.5, size * 0.47, size * 0.58, size * 0.5);
  ctx.lineTo(size * 0.62, size * 0.68);
  ctx.quadraticCurveTo(size * 0.5, size * 0.72, size * 0.38, size * 0.68);
  ctx.closePath();
  ctx.fill(); // 身
  // 菱格纹(下带)
  const y0 = size * 0.7;
  for (let row = 0; row < 3; row++) {
    for (let x = -1; x < 9; x++) {
      const cx = x * size / 8 + (row % 2) * size / 16;
      const cy = y0 + row * size * 0.075;
      ctx.fillStyle = row % 2 ? LV : QING;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(cx, cy - size * 0.035);
      ctx.lineTo(cx + size / 16, cy);
      ctx.lineTo(cx, cy + size * 0.035);
      ctx.lineTo(cx - size / 16, cy);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  // 飞带(飘带弧线)
  if (ornate) {
    ctx.strokeStyle = BAI; ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      const y = size * (0.2 + rnd() * 0.5);
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.3, y + (rnd() - 0.5) * 60, size * 0.7, y + (rnd() - 0.5) * 60, size, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // 底部:供养人像列(小色块人影)
  for (let i = 0; i < 8; i++) {
    const x = size * 0.06 + i * size * 0.115;
    ctx.fillStyle = i % 2 ? MO : '#7c4a30';
    ctx.fillRect(x, size * 0.9, size * 0.05, size * 0.07);
    ctx.beginPath();
    ctx.arc(x + size * 0.025, size * 0.885, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }
  speckle(ctx, size, size, rnd, 700, 0.06);
  return tex(c);
}

// 木栈道(旧木板条)
export function woodPlankTexture({ size = 256, seed = 61 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#6e4a2c'; ctx.fillRect(0, 0, size, size);
  const rows = 8;
  for (let r = 0; r < rows; r++) {
    const l = 0.82 + rnd() * 0.35;
    ctx.fillStyle = shade('#6e4a2c', l);
    ctx.fillRect(0, r * size / rows + 1, size, size / rows - 2);
    // 木纹
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#4a3018';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const y = r * size / rows + rnd() * size / rows;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.3, y + (rnd() - 0.5) * 6, size * 0.7, y + (rnd() - 0.5) * 6, size, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  speckle(ctx, size, size, rnd, 500, 0.08);
  return tex(c, { repeat: 10 });
}

// 泥塑彩绘(佛衣:石青底 + 金纹)
export function robeTexture({ size = 128, seed = 141 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#2e5e7e'; ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#c8a04c'; ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    const x = rnd() * size;
    ctx.moveTo(x, 0);
    ctx.quadraticCurveTo(x + (rnd() - 0.5) * 30, size / 2, x + (rnd() - 0.5) * 20, size);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // 田相格
  ctx.strokeStyle = '#c8a04c'; ctx.globalAlpha = 0.6;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath(); ctx.moveTo(0, i * size / 4); ctx.lineTo(size, i * size / 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(i * size / 4, 0); ctx.lineTo(i * size / 4, size); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 300, 0.05);
  return tex(c);
}

// 灰瓦(九层楼檐)
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

// 共享材质集
export function makeMaterials() {
  const cliff = cliffTexture();
  const sand = sandTexture();
  const mural = muralTexture();
  const muralAlt = muralTexture({ seed: 233 });
  const wood = woodPlankTexture();
  const robe = robeTexture();
  const tileGrey = tileGreyTexture();
  const std = (map, opts = {}) => new THREE.MeshStandardMaterial({ map, roughness: 0.9, metalness: 0.0, ...opts });
  const mat = (key, opts = {}) => {
    const m = std(key, opts);
    m.side = THREE.DoubleSide;
    return m;
  };
  return {
    cliff: std(cliff, { roughness: 0.95 }),
    sand: std(sand, { vertexColors: true, roughness: 1 }),
    mural: mat(mural, { roughness: 0.85 }),
    muralAlt: mat(muralAlt, { roughness: 0.85 }),
    wood: std(wood, { roughness: 0.85 }),
    robe: std(robe, { roughness: 0.7 }),
    tileGrey: mat(tileGrey, { roughness: 0.62 }),
    caveDark: new THREE.MeshStandardMaterial({ color: 0x3a2e22, roughness: 1, side: THREE.DoubleSide }),
    gold: new THREE.MeshStandardMaterial({ color: 0xc8a04c, roughness: 0.4, metalness: 0.45 }),
    goldTrim: new THREE.MeshStandardMaterial({ color: 0xc8a04c, roughness: 0.35, metalness: 0.5 }),
    skin: new THREE.MeshStandardMaterial({ color: 0xd8b284, roughness: 0.65 }),
    redPaint: new THREE.MeshStandardMaterial({ color: 0x9c3a28, roughness: 0.55 }),
    marble: new THREE.MeshStandardMaterial({ color: 0xb8b2a2, roughness: 0.7 }),
    marbleFine: new THREE.MeshStandardMaterial({ color: 0xc6c0b0, roughness: 0.6 }),
    brick: new THREE.MeshStandardMaterial({ color: 0x8a8276, roughness: 0.95 }),
    rock: new THREE.MeshStandardMaterial({ color: 0x9a8468, roughness: 1 }),
    shrub: new THREE.MeshStandardMaterial({ color: 0x6c6a42, roughness: 1 }),
    bark: new THREE.MeshStandardMaterial({ color: 0x5a4c3a, roughness: 1 }),
  };
}
