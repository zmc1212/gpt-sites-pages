// 程序化 canvas 纹理(悬空寺材质:花岗岩崖壁 / 峡谷河滩 / 朱红木构 / 岩石)
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

// 花岗岩崖壁(斜节理 + 岩斑)
export function cliffTexture({ size = 256, seed = 71, base = '#7e7868' } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = shade(base, 0.72 + rnd() * 0.5);
    ctx.globalAlpha = 0.16 + rnd() * 0.2;
    ctx.beginPath();
    ctx.ellipse(rnd() * size, rnd() * size, 4 + rnd() * 22, 3 + rnd() * 14, rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // 斜节理
  ctx.strokeStyle = shade(base, 0.62); ctx.lineWidth = 1.6;
  for (let i = 0; i < 16; i++) {
    ctx.globalAlpha = 0.22 + rnd() * 0.2;
    ctx.beginPath();
    const y = rnd() * size;
    ctx.moveTo(0, y);
    ctx.lineTo(size, y + (rnd() - 0.5) * 60);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 1000, 0.09);
  return tex(c, { repeat: 4 });
}

// 河滩谷底(卵石 + 砂)
export function riverbedTexture({ size = 256, seed = 23 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#948674'; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 260; i++) {
    const r = 3 + rnd() * 9;
    ctx.fillStyle = shade('#948674', 0.7 + rnd() * 0.55);
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.ellipse(rnd() * size, rnd() * size, r, r * (0.6 + rnd() * 0.4), rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 900, 0.09);
  const t = tex(c, { repeat: 30 });
  t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
  return t;
}

// 灰瓦
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

// 朱红木构(柱/栏/门)
export function redPaintTexture({ size = 128, seed = 17, base = '#a03a28' } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 46; i++) {
    const x = rnd() * size;
    ctx.globalAlpha = 0.05 + rnd() * 0.1;
    ctx.fillStyle = rnd() > 0.5 ? '#b8482e' : '#661a10';
    ctx.fillRect(x, 0, 1 + rnd() * 3, size);
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 300, 0.06);
  return tex(c);
}

// 原木梁(铁杉木:粗直纹)
export function logTexture({ size = 128, seed = 41 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#6e5436'; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 26; i++) {
    ctx.globalAlpha = 0.2 + rnd() * 0.2;
    ctx.fillStyle = rnd() > 0.5 ? '#7e6440' : '#54402a';
    const y = rnd() * size;
    ctx.fillRect(0, y, size, 1.5 + rnd() * 3);
  }
  ctx.globalAlpha = 1;
  // 端部年轮感
  ctx.strokeStyle = '#54402a';
  for (let i = 0; i < 5; i++) {
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.5, 6 + i * 9, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 300, 0.07);
  return tex(c);
}

// 共享材质集
export function makeMaterials() {
  const cliff = cliffTexture();
  const riverbed = riverbedTexture();
  const tileGrey = tileGreyTexture();
  const redPaint = redPaintTexture();
  const log = logTexture();
  const std = (map, opts = {}) => new THREE.MeshStandardMaterial({ map, roughness: 0.9, metalness: 0.0, ...opts });
  const mat = (key, opts = {}) => {
    const m = std(key, opts);
    m.side = THREE.DoubleSide;
    return m;
  };
  return {
    cliff: std(cliff, { roughness: 0.98 }),
    riverbed: std(riverbed, { vertexColors: true, roughness: 1 }),
    tileGrey: mat(tileGrey, { roughness: 0.62 }),
    redPaint: mat(redPaint, { roughness: 0.5 }),
    log: std(log, { roughness: 0.9 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x6a4c2e, roughness: 0.88 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x8e8a7e, roughness: 0.92 }),
    stoneDark: new THREE.MeshStandardMaterial({ color: 0x62605a, roughness: 0.95 }),
    rock: new THREE.MeshStandardMaterial({ color: 0x827c6e, roughness: 1 }),
    marble: new THREE.MeshStandardMaterial({ color: 0xb0a894, roughness: 0.72 }),
    marbleFine: new THREE.MeshStandardMaterial({ color: 0xc2bca8, roughness: 0.62 }),
    brickWall: new THREE.MeshStandardMaterial({ color: 0x8a8276, roughness: 0.95 }),
    brick: new THREE.MeshStandardMaterial({ color: 0x8a8276, roughness: 0.95 }),
    goldTrim: new THREE.MeshStandardMaterial({ color: 0xc8a25e, roughness: 0.35, metalness: 0.5 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xc8a25e, roughness: 0.4, metalness: 0.45 }),
    ribbon: new THREE.MeshStandardMaterial({ color: 0xc04030, roughness: 0.6, side: THREE.DoubleSide }),
    pine: new THREE.MeshStandardMaterial({ color: 0x2e4632, roughness: 1 }),
    shrub: new THREE.MeshStandardMaterial({ color: 0x5c6840, roughness: 1 }),
    bark: new THREE.MeshStandardMaterial({ color: 0x4a4034, roughness: 1 }),
    water: new THREE.MeshStandardMaterial({ color: 0x5e7c74, roughness: 0.25, metalness: 0.15, transparent: true, opacity: 0.85 }),
  };
}
