// 程序化 canvas 纹理(土楼材质:夯土 / 灰瓦 / 杉木 / 茶山梯田 / 红灯笼)
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

// 夯土墙(暖赭:水平夯层 + 雨蚀竖沟 + 卵石墙脚)
export function rammedEarthTexture({ size = 256, seed = 91, base = '#b8895c' } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  // 夯层(每层交接处深线)
  for (let y = 0; y < size; y += 26 + rnd() * 10) {
    ctx.fillStyle = shade(base, 0.78);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, y, size, 2.6);
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = shade(base, 1.12);
    ctx.fillRect(0, y + 2.6, size, 10);
    ctx.globalAlpha = 1;
  }
  // 雨蚀竖沟
  ctx.strokeStyle = shade(base, 0.72); ctx.lineWidth = 1.4;
  for (let i = 0; i < 20; i++) {
    ctx.globalAlpha = 0.14 + rnd() * 0.14;
    ctx.beginPath();
    let x = rnd() * size, y = rnd() * size * 0.4;
    ctx.moveTo(x, y);
    while (y < size) { y += 12 + rnd() * 18; x += (rnd() - 0.5) * 8; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 900, 0.09);
  const t = tex(c, { repeat: 4 });
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

// 黄琉璃(祖堂屋脊,少量)
export function glazeGoldTexture({ size = 128, seed = 5, base = '#c89038' } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const ridges = 10, rw = size / ridges;
  for (let i = 0; i < ridges; i++) {
    ctx.fillStyle = shade(base, 1.24);
    ctx.fillRect(i * rw + rw * 0.15, 0, rw * 0.3, size);
    ctx.fillStyle = shade(base, 0.72);
    ctx.fillRect(i * rw + rw * 0.72, 0, rw * 0.28, size);
  }
  speckle(ctx, size, size, rnd, 300, 0.08);
  return tex(c);
}

// 杉木板(环廊柱/栏/门)
export function woodPlankTexture({ size = 256, seed = 61 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#6a4628'; ctx.fillRect(0, 0, size, size);
  const rows = 8;
  for (let r = 0; r < rows; r++) {
    const l = 0.82 + rnd() * 0.35;
    ctx.fillStyle = shade('#6a4628', l);
    ctx.fillRect(0, r * size / rows + 1, size, size / rows - 2);
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#462c14';
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
  return tex(c, { repeat: 8 });
}

// 茶山地面(青绿梯田 + 茶垄条播)
export function teaTexture({ size = 256, seed = 23 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  ctx.fillStyle = '#7c8c56'; ctx.fillRect(0, 0, size, size);
  const tones = ['#84945e', '#70804c', '#8e9e64', '#647444', '#96a46e'];
  for (let i = 0; i < 340; i++) {
    ctx.fillStyle = tones[(rnd() * tones.length) | 0];
    ctx.globalAlpha = 0.12 + rnd() * 0.16;
    ctx.beginPath();
    ctx.ellipse(rnd() * size, rnd() * size, 6 + rnd() * 26, 3 + rnd() * 12, rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 1100, 0.09);
  const t = tex(c, { repeat: 40 });
  t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
  return t;
}

// 红灯笼纸面(发光)
export function lanternTexture({ size = 64, seed = 151 } = {}) {
  const [c, ctx] = canvas(size, size);
  const rnd = mulberry32(seed);
  const g = ctx.createRadialGradient(size / 2, size / 2, 3, size / 2, size / 2, size / 2);
  g.addColorStop(0, '#ffb84c');
  g.addColorStop(0.7, '#e8562c');
  g.addColorStop(1, '#b03418');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#8a2a10';
  for (let y = 8; y < size; y += 10) {
    ctx.beginPath();
    ctx.ellipse(size / 2, y, size / 2 - 2, 3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, size, rnd, 100, 0.05);
  return tex(c);
}

// 共享材质集
export function makeMaterials() {
  const earth = rammedEarthTexture();
  const tileGrey = tileGreyTexture();
  const glazeGold = glazeGoldTexture();
  const wood = woodPlankTexture();
  const tea = teaTexture();
  const lantern = lanternTexture();
  const std = (map, opts = {}) => new THREE.MeshStandardMaterial({ map, roughness: 0.9, metalness: 0.0, ...opts });
  const mat = (key, opts = {}) => {
    const m = std(key, opts);
    m.side = THREE.DoubleSide;
    return m;
  };
  const earthBigTex = earth.clone();
  earthBigTex.repeat.set(16, 1.8);
  return {
    earth: mat(earth, { roughness: 0.96 }),
    earthBig: mat(earthBigTex, { roughness: 0.96 }),
    tileGrey: mat(tileGrey, { roughness: 0.62 }),
    glazeGold: mat(glazeGold, { roughness: 0.4, metalness: 0.06 }),
    wood: std(wood, { roughness: 0.85 }),
    tea: std(tea, { vertexColors: true }),
    lantern: new THREE.MeshStandardMaterial({
      map: lantern, emissive: 0xff8030, emissiveIntensity: 1.6, emissiveMap: lantern,
      roughness: 0.6, side: THREE.DoubleSide,
    }),
    stone: new THREE.MeshStandardMaterial({ color: 0x9a968a, roughness: 0.9 }),
    stoneDark: new THREE.MeshStandardMaterial({ color: 0x6e6a60, roughness: 0.95 }),
    redPaint: new THREE.MeshStandardMaterial({ color: 0x9c3a28, roughness: 0.55 }),
    marble: new THREE.MeshStandardMaterial({ color: 0xb0a894, roughness: 0.72 }),
    marbleFine: new THREE.MeshStandardMaterial({ color: 0xc2bca8, roughness: 0.62 }),
    brickWall: new THREE.MeshStandardMaterial({ color: 0x8a8276, roughness: 0.95 }),
    brick: new THREE.MeshStandardMaterial({ color: 0x8a8276, roughness: 0.95 }),
    goldTrim: new THREE.MeshStandardMaterial({ color: 0xc8a25e, roughness: 0.35, metalness: 0.5 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xc8a25e, roughness: 0.4, metalness: 0.45 }),
    teaBush: new THREE.MeshStandardMaterial({ color: 0x44583a, roughness: 1 }),
    shrub: new THREE.MeshStandardMaterial({ color: 0x5c6c40, roughness: 1 }),
    pine: new THREE.MeshStandardMaterial({ color: 0x2e4632, roughness: 1 }),
    bark: new THREE.MeshStandardMaterial({ color: 0x5a4c3a, roughness: 1 }),
    smoke: new THREE.MeshStandardMaterial({ color: 0xcac4b8, roughness: 1 }),
  };
}
