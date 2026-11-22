// 地图视图:SVG 俯视示意图(中轴建筑群、导览路线、章节跳转、相机标记)
import { LAYOUT } from './config.js';
import { CHAPTERS } from './chapters.js';

const VW = 560, VH = 400;
const wx = (x) => VW / 2 + x * 1.02;
const wz = (z) => VH / 2 - (z + 150) * 1.02; // 北在上方,场景中心 (0, -150) 落图中央

export function buildMapSvg(root, { onJump }) {
  const ns = 'http://www.w3.org/2000/svg';
  root.innerHTML = '';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
  svg.classList.add('map-svg');

  const rect = (x, z, w, d, cls) => {
    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x', wx(x - w / 2)); r.setAttribute('y', wz(z + d / 2));
    r.setAttribute('width', w * 1.02); r.setAttribute('height', d * 1.02);
    r.setAttribute('class', cls);
    svg.appendChild(r);
    return r;
  };
  const circle = (x, z, r, cls) => {
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', wx(x)); c.setAttribute('cy', wz(z));
    c.setAttribute('r', r * 1.02);
    c.setAttribute('class', cls);
    svg.appendChild(c);
    return c;
  };
  const label = (x, z, text, cls = 'map-label') => {
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', wx(x)); t.setAttribute('y', wz(z) + 4);
    t.setAttribute('class', cls);
    t.textContent = text;
    svg.appendChild(t);
    return t;
  };

  // 院墙(祈年殿院 / 圜丘院)
  rect(0, 76, 172, 189, 'map-wall');
  rect(0, -450, 172, 182, 'map-wall');
  // 中轴
  rect(LAYOUT.danbi.x, (LAYOUT.danbi.z0 + LAYOUT.danbi.z1) / 2, LAYOUT.danbi.w + 2, LAYOUT.danbi.z1 - LAYOUT.danbi.z0, 'map-stair');
  rect(LAYOUT.qinianmen.center[0], LAYOUT.qinianmen.center[1], 38, 12, 'map-bldg');
  // 圜丘三层
  circle(0, -440, 27.5, 'map-stair');
  circle(0, -440, 20.5, 'map-stair');
  circle(0, -440, 14, 'map-bldg');
  // 回音壁院 + 皇穹宇
  circle(0, -230, 32.5, 'map-wall');
  circle(0, -230, 13.6, 'map-bldg');
  // 祈年殿
  circle(0, 95, 45.5, 'map-stair');
  circle(0, 95, 40.5, 'map-stair');
  circle(0, 95, 35.5, 'map-stair');
  circle(0, 95, 15.2, 'map-bldg');
  // 配殿 / 长廊
  rect(-56, 78, 14, 32, 'map-bldg');
  rect(56, 78, 14, 32, 'map-bldg');
  rect(96, 85, 11, 132, 'map-bldg');

  // 导览路线
  const route = document.createElementNS(ns, 'polyline');
  const pts = [];
  CHAPTERS.forEach((c) => c.kfs.forEach((kf) => pts.push(`${wx(kf.p[0])},${wz(kf.p[2])}`)));
  route.setAttribute('points', pts.join(' '));
  route.setAttribute('class', 'map-route');
  svg.appendChild(route);

  // 章节热点
  const HOT = [
    { i: 0, x: 340, z: -680 }, { i: 1, x: 0, z: -440 }, { i: 2, x: 40, z: -228 },
    { i: 3, x: -22, z: -210 }, { i: 4, x: -40, z: 95 }, { i: 5, x: 12, z: 105 },
    { i: 6, x: -105, z: 140 }, { i: 7, x: -420, z: -700 },
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
      mk.setAttribute('cx', wx(Math.max(-270, Math.min(270, camX))));
      mk.setAttribute('cy', wz(Math.max(-540, Math.min(190, camZ))));
      hotEls.forEach((el, i) => el.classList.toggle('active', i === chapterIndex));
    },
  };
}
