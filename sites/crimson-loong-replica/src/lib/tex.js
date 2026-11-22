// Procedural canvas textures (architecture surfaces + soft sprites). No assets.
import * as THREE from 'three';
import { mulberry32 } from './util.js';

function canvasTex(w, h, draw, { srgb = true, repeat = [1, 1] } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 4;
  return t;
}

function noiseFill(g, w, h, rng, base, amp, scale = 3) {
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let n = 0, a = 1, fx = x / w * scale, fy = y / h * scale, s = 0;
    for (let o = 0; o < 4; o++) {
      const ix = Math.floor(fx), iy = Math.floor(fy);
      const hsh = Math.sin(ix * 127.1 + iy * 311.7 + o * 97.3) * 43758.5453;
      s += a * (hsh - Math.floor(hsh));
      a *= 0.5; fx *= 2.1; fy *= 2.1;
    }
    n = s / 1.9;
    const i = (y * w + x) * 4;
    const v = (rng() * 2 - 1) * amp + (n - 0.5) * amp * 2.4;
    d[i] = Math.max(0, Math.min(255, d[i] + v));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + v));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + v));
  }
  g.putImageData(img, 0, 0);
}

export const Tex = {};
export function buildTextures() {
  const rng = mulberry32(7);

  Tex.plaster = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#9d2f24'; g.fillRect(0, 0, w, h);
    noiseFill(g, w, h, rng, 0, 26, 4);
    g.fillStyle = 'rgba(60,10,8,0.25)';
    for (let i = 0; i < 40; i++) g.fillRect(rng() * w, rng() * h, 2 + rng() * 5, 1 + rng() * 2);
  }, { repeat: [2, 2] });

  Tex.wood = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#5e2a1c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      g.strokeStyle = `rgba(${20 + rng() * 40 | 0},${8 + rng() * 14 | 0},6,${0.25 + rng() * 0.3})`;
      g.lineWidth = 1 + rng() * 2.4;
      g.beginPath();
      const y = rng() * h; g.moveTo(0, y);
      g.bezierCurveTo(w * 0.3, y + (rng() - 0.5) * 8, w * 0.7, y + (rng() - 0.5) * 8, w, y + (rng() - 0.5) * 5);
      g.stroke();
    }
    noiseFill(g, w, h, rng, 0, 14, 5);
  }, { repeat: [1, 3] });

  Tex.tile = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#2e3440'; g.fillRect(0, 0, w, h);
    const rows = 8, tw = 28;
    for (let r = 0; r < rows; r++) {
      const y = (r + 0.5) * h / rows;
      for (let x = -1; x < w / tw + 1; x++) {
        const off = (r % 2) * tw * 0.5;
        const px = x * tw + off;
        const l = 62 + rng() * 30 + (r % 2) * 6;
        g.fillStyle = `rgb(${l * 0.72 | 0},${l * 0.78 | 0},${l * 0.92 | 0})`;
        g.beginPath();
        g.moveTo(px, y + 9); g.quadraticCurveTo(px + tw / 2, y - 11, px + tw, y + 9);
        g.quadraticCurveTo(px + tw / 2, y + 1, px, y + 9); g.fill();
        g.fillStyle = 'rgba(8,10,16,0.85)';
        g.fillRect(px + tw - 1.5, y - 10, 3, 22);
      }
      g.fillStyle = 'rgba(6,8,12,0.5)'; g.fillRect(0, r * h / rows + 10, w, 3);
    }
  }, { repeat: [3, 2] });

  Tex.lattice = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#120a08'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffb35e';
    for (let i = 6; i < w - 4; i += 16) g.fillRect(i, 4, 3, h - 8);
    for (let j = 6; j < h - 4; j += 16) g.fillRect(4, j, w - 8, 3);
    g.fillStyle = 'rgba(255,190,110,0.9)';
    g.fillRect(w / 2 - 1, 4, 2, h - 8); g.fillRect(4, h / 2 - 1, w - 8, 2);
  });

  Tex.lantern = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#b3261e'; g.fillRect(0, 0, w, h);
    const grd = g.createRadialGradient(w / 2, h / 2, 6, w / 2, h / 2, w / 2);
    grd.addColorStop(0, 'rgba(255,200,120,0.95)'); grd.addColorStop(0.55, 'rgba(220,60,40,0.25)');
    grd.addColorStop(1, 'rgba(120,10,10,0.8)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,190,90,0.75)';
    for (let i = 0; i < 7; i++) g.fillRect((i + 0.5) * w / 7 - 1, 0, 2, h);
    g.fillStyle = '#2a6b2f'; g.fillRect(0, 0, w, 9); g.fillRect(0, h - 9, w, 9);
  });

  Tex.stone = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#565a60'; g.fillRect(0, 0, w, h);
    const rows = 6, bh = h / rows;
    for (let r = 0; r < rows; r++) {
      let x = 0; const off = (r % 2) * 24;
      while (x < w) {
        const bw = 42 + rng() * 46;
        const l = 74 + rng() * 26;
        g.fillStyle = `rgb(${l},${l + 3},${l + 6})`;
        g.fillRect(x + off * 0.4, r * bh + 1, bw - 2, bh - 2);
        x += bw;
      }
    }
    noiseFill(g, w, h, rng, 0, 16, 6);
  }, { repeat: [4, 1] });

  // Soft puff sprite for clouds / mist / splash puffs.
  Tex.puff = canvasTex(128, 128, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    grd.addColorStop(0, 'rgba(255,255,255,0.85)');
    grd.addColorStop(0.4, 'rgba(255,255,255,0.42)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    const img = g.getImageData(0, 0, w, h), d = img.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const s = Math.sin(x * 0.31) * Math.sin(y * 0.23) * 0.12 + Math.sin(x * 0.11 + y * 0.17) * 0.1;
      d[i + 3] = Math.max(0, Math.min(255, d[i + 3] * (1 + s)));
    }
    g.putImageData(img, 0, 0);
  }, { srgb: false });

  // Maple leaf card (drawn silhouette, alpha-tested in shaders).
  Tex.leaf = canvasTex(64, 64, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.translate(w / 2, h / 2);
    g.fillStyle = '#fff';
    for (let i = 0; i < 5; i++) {
      g.rotate(Math.PI * 2 / 5);
      g.beginPath();
      g.moveTo(0, 2); g.quadraticCurveTo(5, -2, 4, -14); g.quadraticCurveTo(0, -8, 0, -2);
      g.closePath(); g.fill();
    }
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 14); g.lineWidth = 2; g.strokeStyle = '#fff'; g.stroke();
  }, { srgb: false });

  return Tex;
}
