// 界面装配：面板、街区、搜索、意义层、街之形、抽屉、悬停提示、分层名牌。
import { descFor, BCLASS } from './words.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

export function setupUI(world) {
  const meta = world.meta;
  const ui = { mode: {} };

  // ---- 街区选择 ----
  const townSel = $('town');
  for (const t of meta.towns) {
    const o = el('option', null, `${t.n} · ${t.addr}`);
    o.value = t.n;
    townSel.append(o);
  }
  townSel.addEventListener('change', () => {
    const t = meta.towns.find((x) => x.n === townSel.value);
    if (!t) return;
    const url = new URL(location.href);
    url.searchParams.set('town', t.n);
    history.replaceState(null, '', url);
    world.flyToGeo(t.lat, t.lon, 420, 0.58, 0.85);
    updateHere();
  });

  function updateHere() {
    let best = null, bd = 1e18;
    for (const t of meta.towns) {
      const d = Math.hypot(t.x - world.orbit.target.x, t.y - world.orbit.target.y);
      if (d < bd) { bd = d; best = t; }
    }
    $('here').textContent = best ? `脚下 · ${best.n}` : '宜昌城区';
  }

  // ---- 统计 ----
  world.onStats = (s) => {
    $('stats').innerHTML = `<div><b>${s.b.toLocaleString()}</b><span>建筑</span></div><div><b>${s.r.toLocaleString()}</b><span>道路</span></div><div><b>${s.w.toLocaleString()}</b><span>词语</span></div>`;
    $('tstat').textContent = `已载 ${world.tileMeshes.size}/${meta.tiles.length} 区块`;
    updateHere();
  };
  ui.updateHere = updateHere;

  // ---- 搜索 ----
  const results = $('results');
  const doSearch = (qRaw) => {
    const q = (qRaw || $('q').value).trim();
    results.innerHTML = '';
    if (!q) return;
    const list = world.words.search(q);
    if (!list.length) {
      results.append(el('p', 'muted', '已加载的范围里没有找到。挪一挪再看。'));
      return;
    }
    results.append(el('p', 'r-n', `找到 ${list.length} 处`));
    const ol = el('ol');
    list.slice(0, 18).forEach((l, i) => {
      const b = el('button');
      b.dataset.i = i;
      const town = nearestTownTo(l.geoX, l.geoY);
      b.innerHTML = `<b>${l.text}</b><span style="color:${l.color}">${meta.cats[l.cat].n}</span><p>${descFor(l.cat, l.text)}</p><span>${town}</span>`;
      b.addEventListener('click', () => {
        world.orbit.flyTo(l.geoX, l.geoY, Math.min(world.orbit.dist, 70), 0.34, world.orbit.az);
        ui.openDrawer(detailOfLabel(l));
      });
      ol.append(b);
    });
    results.append(ol);
  };
  $('qForm').addEventListener('submit', (e) => { e.preventDefault(); doSearch(); });
  for (const b of $('qEx').querySelectorAll('button')) {
    b.addEventListener('click', () => { $('q').value = b.textContent; doSearch(b.textContent); });
  }
  ui.runSearch = doSearch;

  function nearestTownTo(x, y) {
    let best = '', bd = 1e18;
    for (const t of meta.towns) {
      const d = Math.hypot(t.x - x, t.y - y);
      if (d < bd) { bd = d; best = t.n; }
    }
    return best;
  }

  function detailOfLabel(l) {
    const kind = l.kind === 0 ? 'b' : 'r';
    return world.picker.detailOf({ kind, owner: l.geo, idx: l.ownerIdx, tileKey: l.tileKey });
  }

  // ---- 意义层 ----
  const catsBox = $('cats');
  meta.cats.forEach((c, i) => {
    const b = el('button', 'cat');
    b.style.setProperty('--c', c.c);
    b.setAttribute('aria-pressed', 'true');
    b.innerHTML = `<i></i>${c.n}<span>${i}</span>`;
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      world.words.setCat(i, on);
    });
    catsBox.append(b);
  });

  // ---- 街之形 ----
  const lookBox = $('look');
  lookBox.querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      lookBox.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      world.setLook(b.dataset.look);
    });
  });
  $('layerBtn').addEventListener('click', () => {
    const on = !world.layerMode;
    world.setLayerMode(on);
    $('layerBtn').setAttribute('aria-pressed', String(on));
    if (on) {
      world.setReadMode(false);
      $('readBtn').setAttribute('aria-pressed', 'false');
      // 词浮到高空成层 —— 相机拉远抬起来才看得见
      const t = world.orbit.target;
      world.orbit.flyTo(t.x, t.y, Math.max(world.orbit.dist, 860), Math.max(world.orbit.el, 1.0));
    }
    $('modeNote').textContent = on ? '词按意义浮成了层。再按一次回到街上。' : '';
  });
  $('readBtn').addEventListener('click', () => {
    const on = !world.readMode;
    world.setReadMode(on);
    $('readBtn').setAttribute('aria-pressed', String(on));
    if (on) {
      world.setLayerMode(false);
      $('layerBtn').setAttribute('aria-pressed', 'false');
      world.orbit.el = Math.max(world.orbit.el, 1.3);
    }
    $('modeNote').textContent = on ? '词落回地面，从上往下读。（试验）' : '';
  });

  // ---- 抽屉 ----
  const drawer = $('drawer');
  ui.openDrawer = (d) => {
    if (!d) return;
    $('dKind').textContent = d.kind;
    $('dTitle').textContent = d.title;
    $('dSub').textContent = d.sub || '';
    const body = $('dBody');
    body.innerHTML = '';
    if (d.kv && d.kv.length) {
      const sec = el('div', 'd-sec');
      sec.innerHTML = '<h3>读数</h3>';
      const kv = el('ul', 'kv');
      for (const [k, v] of d.kv) kv.append(el('li', null, `<span>${k}</span><b>${v}</b>`));
      sec.append(kv);
      body.append(sec);
    }
    if (d.signs && d.signs.length) {
      const sec = el('div', 'd-sec');
      sec.innerHTML = '<h3>看板<small>这栋楼喊出的名字</small></h3>';
      const chips = el('div', 'chips');
      for (const s of d.signs) chips.append(el('span', null, s));
      sec.append(chips);
      body.append(sec);
    }
    if (d.words && d.words.length) {
      const sec = el('div', 'd-sec');
      sec.innerHTML = `<h3>词<small>${d.words.length} 条</small></h3>`;
      const tx = el('ul', 'tx');
      for (const w of d.words) {
        const c = meta.cats[w.c];
        const li = el('li');
        li.style.setProperty('--c', c ? c.c : '#f2c27f');
        li.innerHTML = `<div class="tx-h"><b class="yr">${c ? c.n : ''}</b><span class="rl" style="color:${c ? c.c : '#f2c27f'}">${w.t}</span></div><p>${w.d}</p>`;
        tx.append(li);
      }
      sec.append(tx);
      body.append(sec);
    }
    body.append(el('p', 'muted', '词由街景照片言语化而来 —— 本站为原创试作，词与描写句均为自写。'));
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  };
  ui.closeDrawer = () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    world.picker._clear();
  };
  $('dClose').addEventListener('click', ui.closeDrawer);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') ui.closeDrawer(); });

  // ---- 悬停提示 ----
  const tip = $('tip');
  world.picker.onHover = (h) => {
    if (!h) { tip.hidden = true; return; }
    tip.innerHTML = `<span>${h.kind}</span><b>${h.title}</b><em>${h.sub || ''}</em>`;
    tip.hidden = false;
  };
  world.renderer.domElement.addEventListener('pointermove', (e) => {
    if (tip.hidden) return;
    const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8);
    const y = Math.min(e.clientY + 16, innerHeight - tip.offsetHeight - 8);
    tip.style.transform = `translate(${x}px,${y}px)`;
  });

  // ---- 折叠 ----
  $('foldBtn').addEventListener('click', () => {
    const p = $('panel');
    const folded = p.classList.toggle('folded');
    $('foldBtn').setAttribute('aria-expanded', String(!folded));
    $('foldBtn').textContent = folded ? '▼' : '▲';
  });

  // ---- 出处 ----
  for (const id of ['creditLink', 'creditLink2']) {
    const a = $(id);
    if (a) a.addEventListener('click', (e) => { e.preventDefault(); $('credit').open = true; });
  }

  // ---- 分层名牌 ----
  const layersBox = $('layers');
  const tags = meta.cats.map((c, i) => {
    const d = el('div', 'layer');
    d.style.setProperty('--c', c.c);
    d.innerHTML = `<i></i><span class="lb"><b>${c.n}</b></span>`;
    layersBox.append(d);
    return d;
  });
  world.onFrameTags = () => {
    if (!world.layerMode || !world.tagVec) {
      for (const t of tags) t.style.opacity = '0';
      return;
    }
    const cam = world.camera3;
    meta.cats.forEach((c, i) => {
      const d = tags[i];
      const p = world.tagVec.set(world.orbit.target.x + 55, 26 + i * 34, -(world.orbit.target.y));
      p.project(cam);
      const x = (p.x * 0.5 + 0.5) * innerWidth;
      const y = (-p.y * 0.5 + 0.5) * innerHeight;
      if (p.z > 1 || x < 0 || x > innerWidth) { d.style.opacity = '0'; return; }
      d.style.opacity = world.words.catOn[i] ? '1' : '.25';
      d.style.transform = `translate(${x.toFixed(0)}px,${y.toFixed(0)}px)`;
    });
  };

  return ui;
}

// 点击画布 → 抽屉（由 main 接线）
export function wireCanvas(world, ui) {
  const dom = world.renderer.domElement;
  world.orbit.onUp = (e, moved) => {
    if (moved > 6 || e.button !== 0) return;
    const d = world.picker.click(e);
    if (d) ui.openDrawer(d);
    else ui.closeDrawer();
  };
  dom.addEventListener('dblclick', (e) => {
    const p = world.cameraAtEvent(e);
    if (!p) return;
    world.orbit.flyTo(p.x, -p.z, Math.max(26, world.orbit.dist * 0.3), Math.min(world.orbit.el, 0.42));
  });
  dom.addEventListener('pointerleave', () => { $('tip').hidden = true; });
}
