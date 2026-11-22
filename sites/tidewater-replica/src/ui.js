/* ui.js — HUD / 小地图 / 面板 / 提示
 * 所有面板共享 overlay,同一时间只开一个;渔获卡 / 卖鱼 / 商店 / 图鉴 / 帮助。 */
(function () {
  'use strict';
  const TW = window.TW;
  const U = TW.util;
  const $ = (id) => document.getElementById(id);

  const ui = {
    els: {}, toastN: 0,
    minimapBobberPos: null,

    init() {
      const ids = ['st-coins', 'st-time', 'st-zone', 'st-cooler', 'minimap',
        'tension-wrap', 'tn-fish', 'tn-dist', 'tn-fill', 'tn-cursor',
        'hint-pill', 'hint-dot', 'hint-text',
        'toasts', 'fly-tag', 'overlay',
        'panel-catch', 'catch-art', 'catch-name', 'catch-stars', 'catch-len', 'catch-wt', 'catch-price', 'catch-record', 'catch-flavor', 'catch-ok',
        'panel-sell', 'sell-list', 'sell-total', 'sell-all', 'sell-close',
        'panel-shop', 'shop-list', 'shop-close',
        'panel-log', 'log-count', 'log-list', 'log-close',
        'panel-help', 'help-close', 'help-reset',
        'guide', 'guide-start', 'boot-fail'];
      ids.forEach((id) => { this.els[id] = $(id); });
      this.mctx = this.els.minimap.getContext('2d');

      // 按钮
      this.els['catch-ok'].addEventListener('click', () => this.closeCatch());
      this.els['sell-close'].addEventListener('click', () => this.closePanels());
      this.els['shop-close'].addEventListener('click', () => this.closePanels());
      this.els['log-close'].addEventListener('click', () => this.closePanels());
      this.els['help-close'].addEventListener('click', () => this.closePanels());
      this.els['sell-all'].addEventListener('click', () => {
        const total = TW.shops.sellAll();
        if (total > 0) {
          TW.audio.coin();
          this.toast('+' + U.fmt.money(total) + ' 金币', 'money');
          this.openSell(); // 清空后刷新列表
        }
      });
      this.els['help-reset'].addEventListener('click', () => {
        if (confirm('确定清空存档重开吗?(金币 / 装备 / 图鉴全部归零)')) {
          TW.shops.resetSave();
          this.toast('已重置,新的一天开始了');
          this.closePanels();
        }
      });
      this.els['guide-start'].addEventListener('click', () => this.closeGuide());
    },

    panelOpen() { return !this.els.overlay.classList.contains('hidden'); },
    currentPanel: null,

    openPanel(id) {
      this.els.overlay.classList.remove('hidden');
      ['panel-catch', 'panel-sell', 'panel-shop', 'panel-log', 'panel-help'].forEach((p) => {
        this.els[p].classList.toggle('hidden', p !== id);
      });
      this.currentPanel = id;
    },
    closePanels() {
      this.els.overlay.classList.add('hidden');
      this.currentPanel = null;
    },
    closeCatch() {
      if (this.currentPanel === 'panel-catch') this.closePanels();
    },

    // ---- toast ----
    toast(msg, cls) {
      const box = this.els.toasts;
      while (box.children.length >= 4) box.removeChild(box.firstChild);
      const el = document.createElement('div');
      el.className = 'toast' + (cls ? ' ' + cls : '');
      el.textContent = msg;
      box.appendChild(el);
      setTimeout(() => { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; }, 2800);
      setTimeout(() => { el.remove(); }, 3300);
    },

    // ---- 底部提示 ----
    hint(text, action) {
      if (this._hintText === text) return;
      this._hintText = text;
      this.els['hint-text'].textContent = text;
      this.els['hint-dot'].classList.toggle('action', !!action);
    },

    // ---- 张力条 ----
    tensionShow(show) {
      this.els['tension-wrap'].classList.toggle('hidden', !show);
    },
    tensionUpdate(d) {
      const e = this.els;
      e['tn-fill'].style.width = d.tension + '%';
      e['tn-cursor'].style.left = 'calc(' + d.tension + '% - 1px)';
      e['tn-cursor'].style.background = d.green ? '#7CFC9A' : (d.tension > 85 ? '#ff6b4a' : '#fff');
      e['tn-fish'].textContent = d.name + (d.running ? ' ⚡冲刺中!' : '');
      e['tn-dist'].textContent = '距离 ' + d.dist.toFixed(1) + 'm';
    },

    // ---- 渔获卡 ----
    showCatch(fish) {
      const sp = fish.species;
      const e = this.els;
      e['catch-art'].textContent = sp.icon;
      e['catch-name'].textContent = sp.name;
      e['catch-stars'].textContent = U.stars(sp.rarity);
      e['catch-len'].textContent = U.fmt.len(fish.length);
      e['catch-wt'].textContent = U.fmt.weight(fish.weight);
      const price = Math.max(1, Math.round(fish.weight * sp.price));
      e['catch-price'].textContent = price + ' 金币';
      e['catch-flavor'].textContent = sp.flavor;
      e['catch-record'].classList.toggle('hidden', !fish.isRecord);
      this.openPanel('panel-catch');
    },

    // ---- Joe 卖鱼 ----
    openSell() {
      const list = this.els['sell-list'];
      const cooler = TW.shops.cooler;
      list.innerHTML = '';
      if (!cooler.length) {
        list.innerHTML = '<div class="empty-note">鱼护空空如也 —— 去码头、浅滩或深海碰碰运气。</div>';
      } else {
        // 按鱼种聚合显示
        const groups = {};
        for (const item of cooler) {
          const sp = TW.shops.SP_BY_ID[item.speciesId];
          if (!groups[sp.id]) groups[sp.id] = { sp, n: 0, w: 0, price: 0 };
          const g = groups[sp.id];
          g.n++;
          g.w += item.weight;
          g.price += Math.max(1, Math.round(item.weight * sp.price));
        }
        for (const id in groups) {
          const g = groups[id];
          const row = document.createElement('div');
          row.className = 'item-row';
          row.innerHTML = '<div class="ico">' + g.sp.icon + '</div>' +
            '<div class="grow"><div>' + g.sp.name + ' × ' + g.n + '</div>' +
            '<div class="sub">合计 ' + U.fmt.weight(g.w) + ' · ' + g.sp.price + ' 金币/kg</div></div>' +
            '<div class="price">' + g.price + ' 金币</div>';
          list.appendChild(row);
        }
      }
      this.els['sell-total'].textContent = U.fmt.money(TW.shops.coolerValue());
      this.openPanel('panel-sell');
    },

    // ---- Marta 商店 ----
    openShop() {
      const list = this.els['shop-list'];
      list.innerHTML = '';
      for (const def of TW.shops.UPGRADES) {
        const lvl = TW.shops.up[def.id];
        const maxed = lvl >= def.max;
        const price = maxed ? null : def.prices[lvl];
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = '<div class="ico">' + def.icon + '</div>' +
          '<div class="grow"><div>' + def.name + ' <span class="pips">' +
          '●'.repeat(lvl) + '○'.repeat(def.max - lvl) + '</span></div>' +
          '<div class="sub">' + def.desc + '<br>' + def.effect(lvl) + (maxed ? '' : '<br>下一级:' + def.effect(lvl + 1)) + '</div></div>';
        const btn = document.createElement('button');
        btn.className = 'btn primary';
        if (maxed) {
          btn.textContent = '已满级';
          btn.disabled = true;
        } else {
          btn.textContent = price + ' 金币';
          btn.disabled = TW.shops.coins < price;
          btn.addEventListener('click', () => {
            if (TW.shops.buyUpgrade(def.id)) {
              TW.audio.buy();
              this.toast(def.name + ' 升到 ' + TW.shops.up[def.id] + ' 级!');
              this.openShop();
            } else {
              TW.audio.fail();
              this.toast('金币不够…', 'bad');
            }
          });
        }
        row.appendChild(btn);
        list.appendChild(row);
      }
      this.openPanel('panel-shop');
    },

    // ---- 图鉴 ----
    openLog() {
      const list = this.els['log-list'];
      list.innerHTML = '';
      const log = TW.shops.log;
      for (const sp of TW.shops.SPECIES) {
        const rec = log[sp.id];
        const row = document.createElement('div');
        row.className = 'log-row' + (rec ? '' : ' locked');
        row.innerHTML = '<div class="ico">' + (rec ? sp.icon : '❓') + '</div>' +
          '<div class="grow"><div>' + (rec ? sp.name : '???') + '</div>' +
          '<div class="zones">' + sp.zones.join('/') + ' · ' + this.timeLabel(sp.time) + '</div></div>' +
          '<div class="stars">' + U.stars(sp.rarity) + '</div>' +
          '<div class="sub">' + (rec ? rec.count + ' 尾 · 最佳 ' + U.fmt.weight(rec.best) : '未发现') + '</div>';
        list.appendChild(row);
      }
      const st = TW.shops.logStats();
      this.els['log-count'].textContent = '已解锁 ' + st.discovered + ' / ' + st.total;
      this.openPanel('panel-log');
    },
    timeLabel(t) {
      return { any: '全天', day: '白天', twilight: '晨昏', night: '月夜' }[t] || '全天';
    },

    openHelp() { this.openPanel('panel-help'); },

    // ---- 首次引导 ----
    maybeGuide() {
      if (TW.shops.firstPlay()) {
        this.els.guide.classList.remove('hidden');
        return true;
      }
      return false;
    },
    closeGuide() {
      this.els.guide.classList.add('hidden');
      TW.shops.markSeen();
    },
    guideOpen() { return !this.els.guide.classList.contains('hidden'); },

    // ---- 浮动价签(靠近 Joe 且鱼护有货) ----
    flyTag(worldPos, text) {
      const el = this.els['fly-tag'];
      if (!text) { el.classList.add('hidden'); return; }
      const cam = TW.main.camera;
      const v = this._v || (this._v = new THREE.Vector3());
      v.copy(worldPos); v.y += 3.4;
      v.project(cam);
      if (v.z > 1) { el.classList.add('hidden'); return; }
      el.style.left = ((v.x * 0.5 + 0.5) * innerWidth) + 'px';
      el.style.top = ((-v.y * 0.5 + 0.5) * innerHeight) + 'px';
      el.textContent = text;
      el.classList.remove('hidden');
    },

    // ---- 每帧 HUD ----
    _last: {},
    set(id, text) {
      if (this._last[id] !== text) {
        this._last[id] = text;
        this.els[id].textContent = text;
      }
    },
    updateHUD() {
      const s = TW.shops;
      const dn = TW.daynight;
      this.set('st-coins', U.fmt.money(s.coins));
      this.set('st-time', U.fmt.time(dn.hour) + (dn.isNight() ? ' 🌙' : dn.isTwilight() ? ' 🌅' : ''));
      // 区域:钓鱼中按浮漂,行船按船位,步行按所在
      let zone;
      const bb = TW.fishing.bobberPos();
      if (bb && (TW.fishing.state === 'wait' || TW.fishing.state === 'strike' || TW.fishing.state === 'fight')) {
        zone = TW.world.zoneAt(bb.x, bb.z);
      } else if (TW.player.mode === 'boat') {
        const bp = TW.boat.pos();
        zone = TW.world.zoneAt(bp.x, bp.z);
      } else if (TW.player.onPier(TW.player.pos.x, TW.player.pos.z)) {
        zone = '码头';
      } else {
        zone = '海岛';
      }
      this.set('st-zone', zone);
      this.set('st-cooler', s.cooler.length + '/' + s.coolerCap());
      this.drawMinimap();
    },

    // ---- 小地图 ----
    drawMinimap() {
      const ctx = this.mctx;
      const S = 150, R = S / 2;
      const scale = R / 135; // 世界半径 135 → 75px
      const w2m = (x, z) => [R + x * scale, R + z * scale];
      ctx.clearRect(0, 0, S, S);
      // 海
      ctx.fillStyle = '#12414d';
      ctx.beginPath(); ctx.arc(R, R, R - 1, 0, Math.PI * 2); ctx.fill();
      // 岛
      const [ix, iz] = w2m(0, 0);
      const ir = TW.world.shoreRadius() * scale;
      ctx.fillStyle = '#c9b377';
      ctx.beginPath(); ctx.arc(ix, iz, ir + 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5e9a54';
      ctx.beginPath(); ctx.arc(ix, iz, ir - 4, 0, Math.PI * 2); ctx.fill();
      // 礁石弧(东向)
      ctx.fillStyle = '#8d9089';
      for (let a = -0.9; a <= 0.9; a += 0.12) {
        const r = 70 * scale;
        ctx.beginPath();
        ctx.arc(ix + Math.cos(a) * r, iz + Math.sin(a) * r, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      // 码头
      const p = TW.world.pier;
      ctx.strokeStyle = '#a87848'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(...w2m(p.x1, p.z));
      ctx.lineTo(...w2m(p.x0, p.z));
      ctx.stroke();
      // 摊位
      const dot = (x, z, c, r2) => {
        const [mx, mz] = w2m(x, z);
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(mx, mz, r2, 0, Math.PI * 2); ctx.fill();
      };
      dot(TW.world.joeStand.x, TW.world.joeStand.z, '#d6453a', 3);
      dot(TW.world.martaShop.x, TW.world.martaShop.z, '#3f7fa6', 3);
      // 浮漂
      const bb = this.minimapBobberPos;
      if (bb) {
        const pulse = 2.5 + Math.sin(TW.water.time * 6) * 1.2;
        dot(bb.x, bb.z, '#f2a53a', pulse);
      }
      // 船(三角朝向)
      const b = TW.boat.pos();
      const [bx, bz] = w2m(b.x, b.z);
      const h = TW.boat.heading;
      ctx.fillStyle = '#f6f1e4';
      ctx.beginPath();
      ctx.moveTo(bx + Math.cos(h) * 6, bz - Math.sin(h) * 6);
      ctx.lineTo(bx + Math.cos(h + 2.4) * 4, bz - Math.sin(h + 2.4) * 4);
      ctx.lineTo(bx + Math.cos(h - 2.4) * 4, bz - Math.sin(h - 2.4) * 4);
      ctx.closePath(); ctx.fill();
      // 玩家(黄点)
      const pp = TW.player.pos;
      dot(pp.x, pp.z, '#ffd75e', 3.2);
    },
    minimapBobber(pos) {
      this.minimapBobberPos = pos ? pos.clone() : null;
    }
  };

  TW.ui = ui;
})();
