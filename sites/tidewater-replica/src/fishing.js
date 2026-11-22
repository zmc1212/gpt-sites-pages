/* fishing.js — 钓鱼玩法(本作核心)
 * 状态机:idle → charge(蓄力) → fly(抛物线飞行) → wait(等咬钩) → strike(刺鱼窗口)
 *       → fight(收线控张力) → caught / snapped / escaped → idle。
 * 渔获数据见 shops.js(12 种加勒比渔获按区域/时段出没 + 3 种杂物);张力留在绿区才能顺利收线。 */
(function () {
  'use strict';
  const TW = window.TW;
  const U = TW.util;

  // 各区域基础咬钩率(每秒)
  const ZONE_BITE = { '码头': 0.055, '浅滩': 0.05, '海湾': 0.045, '礁石': 0.04, '近海': 0.036, '深海': 0.032 };
  // 稀有度权重(越稀有越难遇到)
  const RARITY_W = { 1: 6, 2: 3, 3: 1.2, 4: 0.35 };

  const fishing = {
    state: 'idle',
    chargeT: 0,
    bobber: null, bobberLight: null, line: null, strikeMark: null,
    flyT: 0, flyFrom: null, flyTo: null, flyH: 0,
    biteTimer: 0, strikeT: 0, curFish: null,
    fight: null,               // {tension, stamina, dist, running, runT, nextRun, overT}
    splashes: [],
    fx: {},                    // TW.fx: splashAt 供鲸跃复用

    init(scene) {
      this.scene = scene;
      // 浮漂:红顶白肚小球
      const bg = new THREE.Group();
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshLambertMaterial({ color: 0xd6453a }));
      const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshLambertMaterial({ color: 0xf6f1e4 }));
      bottom.position.y = -0.02;
      bg.add(top, bottom);
      bg.visible = false;
      scene.add(bg);
      this.bobber = bg;

      // 刺鱼提示(!锥)
      const mark = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 4), new THREE.MeshBasicMaterial({ color: 0xf2a53a }));
      mark.rotation.x = Math.PI;
      mark.visible = false;
      scene.add(mark);
      this.strikeMark = mark;

      // 钓线:8 点折线
      const lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(8 * 3), 3));
      this.lineMat = new THREE.LineBasicMaterial({ color: 0xf0e8d8, transparent: true, opacity: 0.85 });
      this.line = new THREE.Line(lg, this.lineMat);
      this.line.visible = false;
      this.line.frustumCulled = false;
      scene.add(this.line);

      // 特效表
      TW.fx = {
        splashAt: (x, z, scale) => this.splashAt(x, z, scale)
      };
    },

    // ---- 是否满足抛竿条件 ----
    canCast() {
      if (this.state !== 'idle') return false;
      if (TW.ui && TW.ui.panelOpen()) return false;
      if (TW.player.mode === 'boat') return TW.boat.canFish();
      const p = TW.player.pos;
      return TW.player.onPier(p.x, p.z) || TW.world.islandHeight(p.x, p.z) > 0.15;
    },

    castMaxDist() { return 10 + TW.shops.up.rod * 3; },

    startCharge() {
      this.state = 'charge';
      this.chargeT = 0;
      TW.player.rodPivot.userData.casting = true;
    },

    releaseCast() {
      const player = TW.player;
      player.rodPivot.userData.casting = false;
      player.rodPivot.rotation.x = -0.85;
      const dist = 6 + this.chargeT * this.castMaxDist();
      // 方向:行走用面朝向,乘船用船头
      let dirX, dirZ;
      if (player.mode === 'boat') {
        dirX = Math.cos(TW.boat.heading); dirZ = -Math.sin(TW.boat.heading);
      } else {
        dirX = Math.cos(player.yaw); dirZ = -Math.sin(player.yaw);
      }
      const from = player.rodTip();
      const to = new THREE.Vector3(player.pos.x + dirX * dist, 0, player.pos.z + dirZ * dist);
      // 抛到岸上:落空
      if (TW.world.islandHeight(to.x, to.z) > 0.05 && !this.inWater(to.x, to.z)) {
        TW.ui.toast('抛到了岸上,再试一次');
        this.state = 'idle';
        return;
      }
      this.state = 'fly';
      this.flyT = 0;
      this.flyFrom = from.clone();
      this.flyTo = to;
      this.flyH = 2.5 + dist * 0.09;
      this.bobber.visible = true;
      this.line.visible = true;
      this.curFish = null;
      TW.audio.cast();
    },

    inWater(x, z) {
      const p = TW.world.pier;
      if (x > p.x0 && x < p.x1 && Math.abs(z) < p.halfW + 0.5) return false;
      return TW.world.islandHeight(x, z) <= 0.05;
    },

    // ---- 挑选咬钩的鱼 ----
    pickFish(bx, bz) {
      const SPECIES = TW.shops.SPECIES;
      const JUNK = TW.shops.JUNK;
      if (U.rand.chance(0.06)) {
        const j = U.rand.pick(JUNK);
        return { species: j, junk: true, weight: U.rand.range(0.3, 1) };
      }
      const dn = TW.daynight;
      const zone = TW.world.zoneAt(bx, bz);
      const nightNoLamp = dn.isNight() && !TW.shops.up.lamp;
      const pool = SPECIES.filter((s) => {
        if (!s.zones.includes(zone)) return false;
        if (s.time === 'day' && !dn.isDay()) return false;
        if (s.time === 'twilight' && !dn.isTwilight()) return false;
        if (s.time === 'night' && !dn.isNight()) return false;
        return true;
      });
      if (!pool.length) {
        // 时段没有匹配鱼种 → 退回全时段
        const any = SPECIES.filter((s) => s.zones.includes(zone) && s.time === 'any');
        if (!any.length) return null;
        return this.rollFrom(any, nightNoLamp);
      }
      return this.rollFrom(pool, nightNoLamp);
    },
    rollFrom(pool, nightNoLamp) {
      const weights = pool.map((s) => RARITY_W[s.rarity] * (nightNoLamp && s.rarity >= 3 ? 0.25 : 1));
      let sum = 0; for (const w of weights) sum += w;
      let r = Math.random() * sum;
      for (let i = 0; i < pool.length; i++) {
        r -= weights[i];
        if (r <= 0) return this.makeFish(pool[i]);
      }
      return this.makeFish(pool[pool.length - 1]);
    },
    makeFish(sp) {
      const t = U.rand.skewed(); // 偏小个体更常见
      const weight = U.lerp(sp.wMin, sp.wMax, t);
      const length = sp.lenK * Math.cbrt(weight);
      return { species: sp, weight, length, junk: false };
    },

    onBite() {
      const b = this.bobber.position;
      this.curFish = this.pickFish(b.x, b.z);
      if (!this.curFish) { this.state = 'wait'; this.biteTimer = 0; return; }
      this.state = 'strike';
      this.strikeT = 1.45 - this.curFish.species.rarity * 0.12;
      this.strikeMark.visible = true;
      TW.audio.plop(); TW.audio.bite();
      TW.ui.hint('咬钩了!快按 空格 刺鱼!', true);
    },

    startFight() {
      const f = this.curFish;
      const b = this.bobber.position;
      const p = TW.player.pos;
      this.strikeMark.visible = false;
      this.state = 'fight';
      this.fight = {
        tension: 45,
        stamina: 1,
        dist: Math.hypot(b.x - p.x, b.z - p.z),
        running: false,
        runT: 0,
        nextRun: U.rand.range(0.8, 1.8),
        overT: 0
      };
      TW.audio.hook();
      TW.ui.tensionShow(true);
      TW.ui.hint('按住 空格 收线 · 鱼冲刺时松开!', false);
    },

    // ---- 搏鱼 ----
    updateFight(dt) {
      const f = this.fight, fish = this.curFish;
      const sp = fish.species;
      const power = fish.junk ? 0.05 : sp.power * (0.75 + fish.weight / sp.wMax * 0.5);
      const input = TW.input;
      const reeling = !!(input && input.keys.has('Space'));
      const up = TW.shops.up;

      // 冲刺节奏:体力越高越爱冲
      f.nextRun -= dt;
      if (!f.running && f.nextRun <= 0 && f.stamina > 0.12) {
        f.running = true;
        f.runT = U.rand.range(0.6, 0.7 + f.stamina * 1.4);
      }
      if (f.running) {
        f.runT -= dt;
        if (f.runT <= 0) {
          f.running = false;
          f.nextRun = U.rand.range(0.9, 2.4) * (0.4 + f.stamina);
        }
      }

      // 张力
      if (reeling) f.tension += (16 + power * 30 * (f.running ? 1 : 0.35)) * dt;
      else f.tension -= 38 * dt;
      f.tension = U.clamp(f.tension, 0, 100);

      // 断线:超过线强极限持续一段时间
      const snapLimit = 88 + up.line * 2.5;
      if (f.tension > snapLimit) f.overT += dt;
      else f.overT = Math.max(0, f.overT - dt * 2);
      if (f.overT > 0.45 && Math.random() < dt * 0.9 * (1 - up.line * 0.18)) {
        return this.snap();
      }

      // 距离:冲刺拉远,收线拉近
      if (f.running) f.dist += (2.2 + power * 4.2) * dt;
      else if (reeling) f.dist -= (2.0 + up.reel * 0.55) * dt;
      f.dist = Math.max(f.dist, 0.8);

      // 体力消耗:绿区内消耗更快(控线得当)
      const green = f.tension >= 35 && f.tension <= 70;
      f.stamina -= (green ? 0.085 : 0.04) * dt + (f.running ? 0.05 : 0) * dt;
      f.stamina = U.clamp(f.stamina, 0, 1);

      // 收线时把浮漂拉向玩家
      const p = TW.player.pos;
      const b = this.bobber.position;
      const cur = Math.hypot(b.x - p.x, b.z - p.z);
      if (Math.abs(cur - f.dist) > 0.01) {
        const k = cur > 0 ? f.dist / cur : 1;
        b.x = p.x + (b.x - p.x) * k;
        b.z = p.z + (b.z - p.z) * k;
      }

      // 竿姿:压低指向鱼,张力大弯折大
      const player = TW.player;
      player.rodPivot.userData.casting = true;
      player.rodPivot.rotation.x = -1.5 - (f.tension / 100) * 0.35;
      if (player.mode === 'walk') {
        player.yaw = Math.atan2(-(b.z - p.z), b.x - p.x);
        player.mesh.rotation.y = player.yaw;
      }

      TW.ui.tensionUpdate({
        tension: f.tension,
        green: green,
        dist: f.dist,
        name: fish.junk ? '水下的不明物体…' : sp.name,
        running: f.running
      });
      TW.audio.reelTick(dt, reeling && !f.running);

      // 上岸 / 跑鱼
      if (f.dist < 1.6) return this.landFish();
      if (f.dist > 60) return this.escape();
      return false;
    },

    snap() {
      TW.audio.snap();
      TW.ui.tensionShow(false);
      TW.ui.toast('啪!线断了,鱼连钩带线一起带走了…', 'bad');
      this.reset();
      return true;
    },
    escape() {
      TW.audio.escape();
      TW.ui.tensionShow(false);
      TW.ui.toast('线被拉到了极限,鱼拖着钩跑掉了…', 'bad');
      this.reset();
      return true;
    },
    landFish() {
      const fish = this.curFish;
      TW.ui.tensionShow(false);
      TW.audio.caught();
      if (!fish.junk) this.splashAt(this.bobber.position.x, this.bobber.position.z, 1.2);
      const ok = TW.shops.addCatch(fish);
      if (ok) TW.ui.showCatch(fish);
      this.reset();
      return true;
    },
    missStrike() {
      // 刺鱼窗口错过:鱼吐钩,浮漂留在水里继续等
      this.strikeMark.visible = false;
      this.state = 'wait';
      this.biteTimer = 0;
      this.curFish = null;
      if (U.rand.chance(0.7)) TW.ui.toast('晚了,鱼吐钩了…', 'bad');
    },

    reset() {
      this.state = 'idle';
      this.fight = null;
      this.curFish = null;
      this.bobber.visible = false;
      this.line.visible = false;
      this.strikeMark.visible = false;
      TW.player.rodPivot.userData.casting = false;
      TW.player.rodPivot.rotation.x = -0.85;
      TW.ui.minimapBobber(null);
    },

    // ---- 水花环特效 ----
    splashAt(x, z, scale) {
      const geo = new THREE.RingGeometry(0.42, 0.62, 20);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, depthWrite: false });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.06, z);
      m.scale.setScalar(scale || 1);
      m.userData = { t: 0, scale: scale || 1 };
      this.scene.add(m);
      this.splashes.push(m);
      TW.audio.splash(0.25 * (scale || 1), 0.4, 700);
    },
    updateSplashes(dt) {
      for (let i = this.splashes.length - 1; i >= 0; i--) {
        const s = this.splashes[i];
        s.userData.t += dt;
        const k = s.userData.t / 0.8;
        if (k >= 1) {
          this.scene.remove(s);
          s.geometry.dispose(); s.material.dispose();
          this.splashes.splice(i, 1);
          continue;
        }
        s.scale.setScalar(s.userData.scale * (1 + k * 3.2));
        s.material.opacity = 0.75 * (1 - k);
      }
    },

    // ---- 主更新 ----
    update(dt, paused) {
      const player = TW.player;
      if (paused && this.state !== 'idle') return;

      switch (this.state) {
        case 'idle':
          // 竿自然持握
          player.rodPivot.rotation.x = -0.85;
          break;

        case 'charge':
          this.chargeT = Math.min(this.chargeT + dt / 1.2, 1);
          player.rodPivot.rotation.x = -0.85 - this.chargeT * 0.8;
          TW.ui.hint('蓄力中… 松开空格抛竿(距离 ' + Math.round(6 + this.chargeT * this.castMaxDist()) + 'm)', true);
          break;

        case 'fly': {
          this.flyT += dt / 0.85;
          const t = Math.min(this.flyT, 1);
          const a = this.flyFrom, b = this.flyTo;
          this.bobber.position.set(
            U.lerp(a.x, b.x, t),
            U.lerp(a.y, b.y, t) + Math.sin(t * Math.PI) * this.flyH,
            U.lerp(a.z, b.z, t)
          );
          if (t >= 1) {
            this.state = 'wait';
            this.biteTimer = 0;
            this.splashAt(b.x, b.z, 0.7);
            const zone = TW.world.zoneAt(b.x, b.z);
            TW.ui.hint('等鱼上钩…(渔场:' + zone + ')', false);
            TW.ui.minimapBobber(b);
            this.waitZone = zone;
          }
          break;
        }

        case 'wait': {
          const b = this.bobber.position;
          b.y = TW.water.waveH(b.x, b.z) + 0.06;
          this.biteTimer += dt;
          // 咬钩率:区域基础 × 时段 × 装备
          const dn = TW.daynight;
          let p = (ZONE_BITE[this.waitZone] || 0.04);
          p *= 1 + TW.shops.up.rod * 0.15;
          if (dn.isTwilight()) p *= 1.15;
          if (dn.isNight() && !TW.shops.up.lamp) p *= 0.22;
          if (Math.random() < p * dt) this.onBite();
          break;
        }

        case 'strike':
          this.strikeT -= dt;
          this.strikeMark.position.set(
            this.bobber.position.x,
            this.bobber.position.y + 0.9 + Math.sin(TW.water.time * 10) * 0.08,
            this.bobber.position.z
          );
          this.bobber.position.y = TW.water.waveH(this.bobber.position.x, this.bobber.position.z) - 0.15;
          if (this.strikeT <= 0) this.missStrike();
          break;

        case 'fight': {
          const done = this.updateFight(dt);
          if (!done) {
            const b = this.bobber.position;
            b.y = TW.water.waveH(b.x, b.z) + 0.02;
          }
          break;
        }
      }

      // 钓线绘制
      if (this.line.visible) this.updateLine();
      this.updateSplashes(dt);
    },

    updateLine() {
      const player = TW.player;
      const tip = player.rodTip(this._tip || (this._tip = new THREE.Vector3()));
      const b = this.bobber.position;
      const pos = this.line.geometry.attributes.position;
      const N = 8;
      const dx = b.x - tip.x, dy = b.y - tip.y, dz = b.z - tip.z;
      // 松弛度:搏鱼绷紧,等待时下垂
      let sag;
      if (this.state === 'fight') sag = 0.15 + (1 - this.fight.tension / 100) * 0.8;
      else if (this.state === 'fly') sag = 0.5;
      else sag = 1.4;
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const drop = Math.sin(t * Math.PI) * sag * Math.min(1, Math.hypot(dx, dz) / 8);
        pos.setXYZ(i, tip.x + dx * t, tip.y + dy * t - drop, tip.z + dz * t);
      }
      pos.needsUpdate = true;
      // 张力色:常态米白 → 高张力红
      const tn = this.state === 'fight' ? this.fight.tension / 100 : 0;
      const c = this.lineMat.color;
      c.setRGB(0.94, 0.91 - tn * 0.45, 0.85 - tn * 0.55);
    },

    // 供 minimap / HUD
    bobberPos() { return this.bobber.visible ? this.bobber.position : null; }
  };

  TW.fishing = fishing;
})();
