// 地图视图:SVG 俯视示意图(崖面/窟龛/九层楼/栈道、导览路线、章节跳转、相机标记)
import { LAYOUT } from './config.js';
import { CHAPTERS } from './chapters.js';

const VW = 560, VH = 400, SC = 0.42, CX = 60, CZ = 0;
const wx = (x) => VW / 2 + (x - CX) * SC;
const wz = (z) => VH / 2 - (z - CZ) * SC;

export function buildMapSvg(root, { onJump }) {
  const ns = 'http://www.w3.org/2000/svg';
  root.innerHTML = '';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
  svg.classList.add('map-svg');

  const rect = (x, z, w, d, cls) => {
    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x', wx(x - w / 2)); r.setAttribute('y', wz(z + d / 2));
    r.setAttribute('width', w * SC); r.setAttribute('height', d * SC);
    r.setAttribute('class', cls);
    svg.appendChild(r);
    return r;
  };
  const label = (x, z, text, cls = 'map-label') => {
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', wx(x)); t.setAttribute('y', wz(z) + 4);
    t.setAttribute('class', cls);
    t.textContent = text;
    svg.appendChild(t);
    return t;
  };

  // 大漠意象(波纹椭圆)
  for (const [dx, dz, rr] of [[160, -220, 60], [240, -60, 66], [300, 140, 60], [220, 300, 56], [360, 40, 54], [140, 60, 44]]) {
    const e = document.createElementNS(ns, 'ellipse');
    e.setAttribute('cx', wx(dx)); e.setAttribute('cy', wz(dz));
    e.setAttribute('rx', rr * SC); e.setAttribute('ry', rr * 0.7 * SC);
    e.setAttribute('class', 'map-hill');
    svg.appendChild(e);
  }

  // 崖体
  rect(-32, -50, 64, 740, 'map-cliff');
  // 一层/二层栈道
  rect(0.4, -50, 6, 700, 'map-bridge');
  rect(0.2, -70, 4.8, 380, 'map-bridge');
  // 窟龛(特色窟)
  rect(LAYOUT.caves.buddha.x, LAYOUT.caves.buddha.z, 26, 34, 'map-bldg');
  rect(LAYOUT.caves.mural.x, LAYOUT.caves.mural.z, 18, 22, 'map-bldg');
  rect(LAYOUT.caves.sutra.x, LAYOUT.caves.sutra.z, 9, 11, 'map-bldg');
  // 九层楼
  rect(LAYOUT.jiuceng.x, LAYOUT.jiuceng.z, 30, 12, 'map-gold');
  label(-20, 150, '九层楼');
  label(-40, -60, '壁画窟');
  label(-40, -310, '藏经洞');
  label(30, -350, '磴道');
  label(200, 0, '鸣沙山');

  // 导览路线
  const route = document.createElementNS(ns, 'polyline');
  const pts = [];
  CHAPTERS.forEach((c) => c.kfs.forEach((kf) => pts.push(`${wx(kf.p[0])},${wz(kf.p[2])}`)));
  route.setAttribute('points', pts.join(' '));
  route.setAttribute('class', 'map-route');
  svg.appendChild(route);

  // 章节热点
  const HOT = [
    { i: 0, x: 420, z: -260 }, { i: 1, x: 30, z: -60 }, { i: 2, x: 10, z: 120 },
    { i: 3, x: -26, z: 148 }, { i: 4, x: -22, z: -60 }, { i: 5, x: -10, z: -306 },
    { i: 6, x: 230, z: 200 }, { i: 7, x: 90, z: 240 },
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
      mk.setAttribute('cx', wx(Math.max(-400, Math.min(520, camX))));
      mk.setAttribute('cy', wz(Math.max(-900, Math.min(900, camZ))));
      hotEls.forEach((el, i) => el.classList.toggle('active', i === chapterIndex));
    },
  };
}
