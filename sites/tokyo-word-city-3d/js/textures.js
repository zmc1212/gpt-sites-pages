// Canvas 纹理：词的字面纹理（按 文本+颜色 缓存，裁剪到文字实际宽度）、招牌、纸面颗粒。
import * as THREE from 'three';

const SERIF = '"Noto Serif SC","Source Han Serif SC","SimSun","Yu Mincho",serif';

const wordCache = new Map();

// 墙面/层间词：金墨字带微光，透明底；路面词：浅墨字带深描边
// 返回 {tex, aspect}，aspect = 宽/高（已裁剪到文字实际宽度）
export function wordTexture(text, color, road = false) {
  const key = `${text}|${color}|${road ? 1 : 0}`;
  if (wordCache.has(key)) return wordCache.get(key);
  const H = 128, FONT = 84;
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = `500 ${FONT}px ${SERIF}`;
  const w = Math.ceil(probe.measureText(text).width);
  const c = document.createElement('canvas');
  c.width = w + 24;
  c.height = H;
  const ctx = c.getContext('2d');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `500 ${FONT}px ${SERIF}`;
  const cx = c.width / 2, cy = H / 2 + 4;
  if (road) {
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(8,10,14,.85)';
    ctx.strokeText(text, cx, cy);
  } else {
    // 深描边 + 光晕：全息线框城市上也要站得住
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.lineWidth = 7;
    ctx.strokeStyle = 'rgba(6,8,12,.9)';
    ctx.strokeText(text, cx, cy);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, cx, cy);
  ctx.shadowBlur = 0;
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  const out = { tex, aspect: c.width / H };
  wordCache.set(key, out);
  return out;
}

// 招牌：色底 + 字
const signCache = new Map();
const SIGN_BG = ['#1d3a5f', '#5f1d2c', '#1f4a3a', '#4a351d', '#2c2c5f', '#3d5f1d'];
export function signTexture(text, seed) {
  const key = `${text}|${seed}`;
  if (signCache.has(key)) return signCache.get(key);
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 160;
  const ctx = c.getContext('2d');
  const bg = SIGN_BG[seed % SIGN_BG.length];
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = 'rgba(255,240,210,.75)';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, c.width - 20, c.height - 20);
  ctx.fillStyle = '#ffe9c4';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 92px ${SERIF}`;
  ctx.fillText(text, c.width / 2, c.height / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  signCache.set(key, tex);
  return tex;
}

// 纸面颗粒（素材之城的屋面微纹理）
let grain = null;
export function grainTexture() {
  if (grain) return grain;
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(s, s);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 238 + (Math.random() * 34 - 17);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  grain = new THREE.CanvasTexture(c);
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.colorSpace = THREE.SRGBColorSpace;
  return grain;
}

// 夜间外墙图集：4×4 格，每格 = 3m×3m 立面单元（亮窗/暗窗/空调外机/窗帘…）。
// 底色接近白，由顶点色乘出每栋楼的色调；亮窗自发光。
let winAtlas = null;
export function windowAtlasTexture() {
  if (winAtlas) return winAtlas;
  const S = 512, CELL = 128; // 4×4 格
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e8e4dc'; // 近白底 → 顶点色染色
  ctx.fillRect(0, 0, S, S);
  const rand = (() => { let a = 987654321; return () => { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; return ((a >>> 0) % 1000) / 1000; }; })();
  const LIT = ['#ffdba8', '#ffe9c8', '#cfe2ff', '#ffd2d2', '#e8ffe0'];
  for (let gy = 0; gy < 4; gy++) {
    for (let gx = 0; gx < 4; gx++) {
      const ox = gx * CELL, oy = gy * CELL;
      // 底：每格轻微明度差（墙面分块感）
      const baseV = 222 + Math.floor(rand() * 22);
      ctx.fillStyle = `rgb(${baseV},${baseV - 4},${baseV - 10})`;
      ctx.fillRect(ox, oy, CELL, CELL);
      // 楼层板阴影（格子底部 8px）
      ctx.fillStyle = 'rgba(40,44,52,.35)';
      ctx.fillRect(ox, oy + CELL - 8, CELL, 8);
      // 窗：占格子中部 70%
      const wx = ox + 18, wy = oy + 16, ww = CELL - 36, wh = CELL - 46;
      const kind = rand();
      if (kind < 0.4) { // 亮窗（暖/冷随机）
        ctx.fillStyle = LIT[Math.floor(rand() * LIT.length)];
        ctx.fillRect(wx, wy, ww, wh);
        // 窗内的百叶/剪影
        ctx.fillStyle = 'rgba(60,50,40,.25)';
        ctx.fillRect(wx, wy + wh * (0.4 + rand() * 0.3), ww, wh * 0.25);
      } else if (kind < 0.62) { // 暗窗
        ctx.fillStyle = `rgb(${34 + Math.floor(rand() * 14)},${38 + Math.floor(rand() * 14)},${46 + Math.floor(rand() * 14)})`;
        ctx.fillRect(wx, wy, ww, wh);
        // 微反光
        ctx.fillStyle = 'rgba(160,190,220,.12)';
        ctx.fillRect(wx, wy, ww, wh * 0.35);
      } else if (kind < 0.78) { // 半开帘
        ctx.fillStyle = '#f4e9d8';
        ctx.fillRect(wx, wy, ww, wh);
        ctx.fillStyle = '#b8c8dc';
        ctx.fillRect(wx + ww * 0.55, wy, ww * 0.45, wh);
      } else if (kind < 0.9) { // 空调外机
        ctx.fillStyle = '#3a3f47';
        ctx.fillRect(wx, wy + wh * 0.2, ww * 0.62, wh * 0.55);
        ctx.strokeStyle = '#20242a';
        ctx.strokeRect(wx, wy + wh * 0.2, ww * 0.62, wh * 0.55);
      } else { // 窄横窗（店铺条窗）
        ctx.fillStyle = '#ffdca6';
        ctx.fillRect(wx, wy + wh * 0.3, ww, wh * 0.4);
      }
      // 窗框
      ctx.strokeStyle = 'rgba(30,34,40,.8)';
      ctx.lineWidth = 3;
      ctx.strokeRect(wx, wy, ww, wh);
      // 中挺
      ctx.beginPath();
      ctx.moveTo(wx + ww / 2, wy);
      ctx.lineTo(wx + ww / 2, wy + wh);
      ctx.stroke();
    }
  }
  winAtlas = new THREE.CanvasTexture(c);
  winAtlas.wrapS = winAtlas.wrapT = THREE.RepeatWrapping;
  winAtlas.colorSpace = THREE.SRGBColorSpace;
  winAtlas.anisotropy = 8;
  return winAtlas;
}
