// 地图视图:SVG 俯视示意图(台地、建筑、导览路线、章节跳转、相机标记)
import { CFG, LAYOUT } from './config.js';
import { CHAPTERS } from './chapters.js';

const VW = 560, VH = 360; // viewBox
const SX = 1.05, SY = 1.05;
const wx = (x) => VW / 2 + x * SX;
const wz = (z) => VH / 2 - z * SY; // 北在上方

export function buildMapSvg(root, { onJump }) {
  const t = CFG.terrace;
  const ns = 'http://www.w3.org/2000/svg';
  root.innerHTML = '';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
  svg.classList.add('map-svg');

  // 台地
  const rect = (x, z, w, d, cls, label) => {
    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x', wx(x - w / 2)); r.setAttribute('y', wz(z + d / 2));
    r.setAttribute('width', w * SX); r.setAttribute('height', d * SY);
    r.setAttribute('class', cls);
    svg.appendChild(r);
    if (label) {
      const tt = document.createElementNS(ns, 'text');
      tt.setAttribute('x', wx(x)); tt.setAttribute('y', wz(z) + 4);
      tt.setAttribute('class', 'map-label');
      tt.textContent = label;
      svg.appendChild(tt);
    }
    return r;
  };

  rect(t.cx, t.cz, t.w, t.d, 'map-terrace');
  // 主阶梯(西缘)
  rect(-255, 0, 60, 30, 'map-stair');

  // 建筑 + 章节跳转点
  const spots = [];
  for (const b of LAYOUT) {
    rect(b.rect[0], b.rect[1], b.rect[2], b.rect[3], 'map-bldg');
  }
  // 导览路线
  const route = document.createElementNS(ns, 'polyline');
  const pts = [];
  CHAPTERS.forEach((c) => c.kfs.forEach((kf) => pts.push(`${wx(kf.p[0])},${wz(kf.p[2])}`)));
  route.setAttribute('points', pts.join(' '));
  route.setAttribute('class', 'map-route');
  svg.appendChild(route);

  // 章节热点(圆点 + 中文短名)
  const HOT = [
    { i: 0, x: -330, z: -250 }, { i: 1, x: -160, z: -30 }, { i: 2, x: -30, z: -25 },
    { i: 3, x: -30, z: 45 }, { i: 4, x: 140, z: 55 }, { i: 5, x: 148, z: 122 },
    { i: 6, x: -120, z: -80 }, { i: 7, x: -420, z: -330 },
  ];
  const hotEls = [];
  for (const h of HOT) {
    const gEl = document.createElementNS(ns, 'g');
    gEl.setAttribute('class', 'map-hot');
    gEl.addEventListener('click', () => onJump(h.i));
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', wx(h.x)); c.setAttribute('cy', wz(h.z)); c.setAttribute('r', 11);
    gEl.appendChild(c);
    const tt = document.createElementNS(ns, 'text');
    tt.setAttribute('x', wx(h.x)); tt.setAttribute('y', wz(h.z) - 16);
    tt.setAttribute('text-anchor', 'middle');
    tt.textContent = CHAPTERS[h.i].title;
    gEl.appendChild(tt);
    svg.appendChild(gEl);
    hotEls.push(gEl);
  }

  // 相机标记
  const marker = document.createElementNS(ns, 'g');
  const mk = document.createElementNS(ns, 'circle');
  mk.setAttribute('r', 5);
  mk.setAttribute('class', 'map-marker');
  marker.appendChild(mk);
  svg.appendChild(marker);

  root.appendChild(svg);
  return {
    svg, marker,
    update(camX, camZ, chapterIndex) {
      mk.setAttribute('cx', wx(camX));
      mk.setAttribute('cy', wz(camZ));
      hotEls.forEach((el, i) => el.classList.toggle('active', i === chapterIndex));
    },
  };
}
