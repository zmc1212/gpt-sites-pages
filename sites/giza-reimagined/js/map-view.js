// 地图视图:吉萨高原俯视示意(金字塔、狮身人面像、导览路线、章节跳转、相机标记)
import { LAYOUT } from './config.js';
import { CHAPTERS } from './chapters.js';

const VW = 560, VH = 420;
const wx = (x) => VW / 2 - x * 0.5;   // 西在左,翻转 X(北在上方)
const wz = (z) => VH / 2 - z * 0.5;

export function buildMapSvg(root, { onJump }) {
  const ns = 'http://www.w3.org/2000/svg';
  root.innerHTML = '';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
  svg.classList.add('map-svg');

  const rect = (x, z, w, d, cls) => {
    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x', wx(x - w / 2)); r.setAttribute('y', wz(z + d / 2));
    r.setAttribute('width', w * 0.5); r.setAttribute('height', d * 0.5);
    r.setAttribute('class', cls);
    svg.appendChild(r);
    return r;
  };
  const poly = (pts, cls) => {
    const p = document.createElementNS(ns, 'polygon');
    p.setAttribute('points', pts.map(([x, z]) => `${wx(x)},${wz(z)}`).join(' '));
    p.setAttribute('class', cls);
    svg.appendChild(p);
    return p;
  };
  const label = (x, z, text) => {
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', wx(x)); t.setAttribute('y', wz(z));
    t.setAttribute('class', 'map-label');
    t.setAttribute('text-anchor', 'middle');
    t.textContent = text;
    svg.appendChild(t);
    return t;
  };

  // 台地边缘线
  poly([[60, -560], [60, 660], [-560, 660], [-560, -560]], 'map-terrace');

  for (const P of LAYOUT) {
    if (!P.base) continue;
    rect(P.x, P.z, P.base, P.base, 'map-bldg');
    label(P.x, P.z - P.base / 2 - 8, P.name.replace('金字塔', ''));
  }
  rect(150, -180, 80, 26, 'map-bldg');
  label(150, -205, '狮身人面像');

  // 导览路线
  const route = document.createElementNS(ns, 'polyline');
  const pts = [];
  CHAPTERS.forEach((c) => c.kfs.forEach((kf) => pts.push(`${wx(kf.p[0])},${wz(kf.p[2])}`)));
  route.setAttribute('points', pts.join(' '));
  route.setAttribute('class', 'map-route');
  svg.appendChild(route);

  // 章节热点
  const HOT = [
    { i: 0, x: 900, z: -500 }, { i: 1, x: 215, z: -176 }, { i: 2, x: -80, z: -80 },
    { i: 3, x: 0, z: 200 }, { i: 4, x: -60, z: 45 }, { i: 5, x: -186, z: -286 },
    { i: 6, x: -430, z: -650 },
  ];
  const hotEls = [];
  for (const h of HOT) {
    const gEl = document.createElementNS(ns, 'g');
    gEl.setAttribute('class', 'map-hot');
    gEl.addEventListener('click', () => onJump(h.i));
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', wx(h.x)); c.setAttribute('cy', wz(h.z)); c.setAttribute('r', 11);
    gEl.appendChild(c);
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', wx(h.x)); t.setAttribute('y', wz(h.z) - 15);
    t.setAttribute('text-anchor', 'middle');
    t.textContent = CHAPTERS[h.i].title.split(' · ')[0];
    gEl.appendChild(t);
    svg.appendChild(gEl);
    hotEls.push(gEl);
  }

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
      mk.setAttribute('cx', wx(Math.max(-520, Math.min(920, camX))));
      mk.setAttribute('cy', wz(Math.max(-660, Math.min(660, camZ))));
      hotEls.forEach((el, i) => el.classList.toggle('active', i === chapterIndex));
    },
  };
}
