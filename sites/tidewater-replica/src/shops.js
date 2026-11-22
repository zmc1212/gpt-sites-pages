/* shops.js — 经济与成长:渔获图鉴数据、鱼护、Joe 收鱼、Marta 升级、localStorage 存档 */
(function () {
  'use strict';
  const TW = window.TW;

  const SAVE_KEY = 'tw_replica_save_v1';
  const SEEN_KEY = 'tw_replica_seen_v1';

  // ---- 渔获图鉴 ----
  // zones:出没区域;time: any|day|twilight|night;price:金币/kg;power:搏鱼力度(0-1);lenK:体长系数
  const SPECIES = [
    { id: 'perch', name: '银鲈', icon: '🐟', zones: ['浅滩', '海湾'], time: 'any', rarity: 1, price: 6, wMin: 0.3, wMax: 1.2, power: 0.15, lenK: 26, flavor: '浅滩成群的小家伙,适合练手感。' },
    { id: 'yellowtail', name: '黄尾鲷', icon: '🐠', zones: ['码头', '浅滩'], time: 'day', rarity: 1, price: 8, wMin: 0.4, wMax: 1.6, power: 0.16, lenK: 28, flavor: '码头桩子边讨生活的亮黄色小鲷。' },
    { id: 'jack', name: '蓝鲹', icon: '🐟', zones: ['近海', '海湾'], time: 'day', rarity: 1, price: 7, wMin: 0.5, wMax: 2.2, power: 0.2, lenK: 30, flavor: '追着船影跑的银蓝色集群鱼。' },
    { id: 'parrot', name: '鹦嘴鱼', icon: '🐡', zones: ['礁石', '浅滩'], time: 'day', rarity: 2, price: 10, wMin: 0.8, wMax: 3, power: 0.25, lenK: 30, flavor: '啃珊瑚的彩色大嘴,咬钩又狠又急。' },
    { id: 'redsnapper', name: '红鲷', icon: '🐟', zones: ['礁石', '近海'], time: 'any', rarity: 2, price: 14, wMin: 1, wMax: 5, power: 0.35, lenK: 32, flavor: '礁盘边缘的老住户,Joe 最爱收这种。' },
    { id: 'tarpon', name: '大海鲢', icon: '🐠', zones: ['海湾', '浅滩'], time: 'twilight', rarity: 2, price: 12, wMin: 3, wMax: 11, power: 0.4, lenK: 40, flavor: '晨昏跳出水面打挺的银色大鱼。' },
    { id: 'grouper', name: '石斑鱼', icon: '🐟', zones: ['礁石', '深海'], time: 'any', rarity: 2, price: 16, wMin: 2, wMax: 9, power: 0.42, lenK: 36, flavor: '一咬钩就往礁石洞里钻的闷劲儿。' },
    { id: 'barracuda', name: '梭子鱼', icon: '🦈', zones: ['近海', '深海'], time: 'any', rarity: 2, price: 11, wMin: 2, wMax: 9, power: 0.45, lenK: 44, flavor: '一脸凶相的银色猎手,牙齿比钩子还利。' },
    { id: 'cobia', name: '军曹鱼', icon: '🐟', zones: ['近海', '深海'], time: 'day', rarity: 3, price: 20, wMin: 5, wMax: 22, power: 0.5, lenK: 46, flavor: '跟着鲸鲨混饭吃的壮汉,劲道十足。' },
    { id: 'mahi', name: '鲯鳅', icon: '🐠', zones: ['深海', '近海'], time: 'day', rarity: 3, price: 22, wMin: 4, wMax: 16, power: 0.5, lenK: 44, flavor: '金黄配湖蓝,出水瞬间会变色的美人。' },
    { id: 'kingmackerel', name: '王鲭', icon: '🐟', zones: ['深海'], time: 'twilight', rarity: 3, price: 24, wMin: 5, wMax: 26, power: 0.55, lenK: 48, flavor: '晨昏贴着深水流速游的高速拦截机。' },
    { id: 'marlin', name: '月光旗鱼', icon: '🦈', zones: ['深海'], time: 'night', rarity: 4, price: 40, wMin: 20, wMax: 85, power: 0.72, lenK: 62, flavor: '只在月夜浮上深海的传说,断线王的元凶。' }
  ];
  const JUNK = [
    { id: 'boot', name: '旧靴子', icon: '🥾', flavor: 'Joe:这个……真收不了,自己留着吧。' },
    { id: 'seaweed', name: '一大团海草', icon: '🌿', flavor: '滑溜溜的,鱼钩上还缠着点腥味。' },
    { id: 'bottle', name: '漂流瓶', icon: '🧴', flavor: '里面塞着一张看不清字迹的纸条。' }
  ];
  const SP_BY_ID = {};
  SPECIES.forEach((s) => { SP_BY_ID[s.id] = s; });

  // Marta 货架:line 鱼线 / reel 渔轮 / rod 鱼竿 / lamp 夜钓灯 / cooler 鱼护
  const UPGRADES = [
    {
      id: 'rod', name: '鱼竿', icon: '🎣', max: 3,
      prices: [100, 220, 500],
      effect: (l) => '抛距 ' + (6 + 10 + l * 3) + 'm · 咬钩率 +' + l * 15 + '%',
      desc: '更长更韧,能抛到更远的渔场'
    },
    {
      id: 'line', name: '鱼线', icon: '🧵', max: 3,
      prices: [60, 150, 400],
      effect: (l) => '线强极限 ' + (88 + l * 2.5).toFixed(0) + ' · 断线率 -' + l * 18 + '%',
      desc: '搏大鱼不容易断'
    },
    {
      id: 'reel', name: '渔轮', icon: '⚙️', max: 3,
      prices: [80, 180, 420],
      effect: (l) => '收线速度 ' + (2.0 + l * 0.55).toFixed(2) + ' m/s',
      desc: '摇起来更顺,收线更快'
    },
    {
      id: 'cooler', name: '鱼护', icon: '🧊', max: 2,
      prices: [90, 240],
      effect: (l) => '容量 ' + [8, 12, 16][l] + ' 条',
      desc: '装更多渔获再回码头'
    },
    {
      id: 'lamp', name: '夜钓灯', icon: '💡', max: 1,
      prices: [260],
      effect: (l) => (l ? '已安装 · 深夜咬钩率正常' : '未安装 · 深夜咬钩率 -78%'),
      desc: '月夜出大鱼,没灯只能干瞪眼'
    }
  ];

  const shops = {
    coins: 0,
    cooler: [],               // {speciesId, weight, length}
    up: { rod: 0, line: 0, reel: 0, cooler: 0, lamp: 0 },
    log: {},                  // {speciesId: {count, best}}
    coolerCap() { return [8, 12, 16][this.up.cooler]; },

    load() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        const d = JSON.parse(raw);
        this.coins = d.coins || 0;
        this.cooler = d.cooler || [];
        Object.assign(this.up, d.up || {});
        this.log = d.log || {};
      } catch (e) { /* 损坏的存档按新档处理 */ }
    },
    save() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({
          coins: this.coins, cooler: this.cooler, up: this.up, log: this.log
        }));
      } catch (e) { /* 隐私模式等场景忽略 */ }
    },
    resetSave() {
      try { localStorage.removeItem(SAVE_KEY); } catch (e) { }
      this.coins = 0;
      this.cooler = [];
      this.up = { rod: 0, line: 0, reel: 0, cooler: 0, lamp: 0 };
      this.log = {};
    },
    firstPlay() {
      try { return !localStorage.getItem(SEEN_KEY); } catch (e) { return false; }
    },
    markSeen() {
      try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { }
    },

    // 渔获入护:成功返回 true(并记图鉴)
    addCatch(fish) {
      const sp = fish.species;
      if (fish.junk) {
        TW.ui.toast(sp.icon + ' 钓上来' + sp.name + '…', 'bad');
        return false;
      }
      if (this.cooler.length >= this.coolerCap()) {
        TW.ui.toast('鱼护满了!回码头找 Joe 卖掉一些再钓', 'bad');
        return false;
      }
      this.cooler.push({ speciesId: sp.id, weight: fish.weight, length: fish.length });
      const rec = this.log[sp.id] || { count: 0, best: 0 };
      rec.count++;
      fish.isRecord = fish.weight > rec.best;
      if (fish.isRecord) rec.best = fish.weight;
      this.log[sp.id] = rec;
      this.save();
      return true;
    },

    // Joe 收鱼:全部卖出,返回总额
    sellAll() {
      if (!this.cooler.length) return 0;
      let total = 0;
      for (const item of this.cooler) {
        const sp = SP_BY_ID[item.speciesId];
        if (!sp) continue;
        total += Math.max(1, Math.round(item.weight * sp.price));
      }
      this.coins += total;
      this.cooler = [];
      this.save();
      return total;
    },
    coolerValue() {
      let total = 0;
      for (const item of this.cooler) {
        const sp = SP_BY_ID[item.speciesId];
        if (sp) total += Math.max(1, Math.round(item.weight * sp.price));
      }
      return total;
    },

    buyUpgrade(id) {
      const def = UPGRADES.find((u) => u.id === id);
      if (!def) return false;
      const lvl = this.up[id];
      if (lvl >= def.max) return false;
      const price = def.prices[lvl];
      if (this.coins < price) return false;
      this.coins -= price;
      this.up[id] = lvl + 1;
      this.save();
      return true;
    },

    // 图鉴完成度
    logStats() {
      const discovered = Object.keys(this.log).length;
      return { discovered, total: SPECIES.length };
    }
  };

  shops.UPGRADES = UPGRADES;
  shops.SPECIES = SPECIES;
  shops.JUNK = JUNK;
  shops.SP_BY_ID = SP_BY_ID;

  TW.shops = shops;
})();
