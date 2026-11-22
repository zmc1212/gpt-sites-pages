/* main.js — 启动与主循环:渲染器、输入、交互判定、每日循环粘合 */
(function () {
  'use strict';
  const TW = window.TW;
  const U = TW.util;

  const main = {
    renderer: null, camera: null, scene: null,
    input: { keys: new Set() },
    saveTimer: 0, dragging: false, lastPX: 0, lastPY: 0,

    init() {
      // 色彩管线:hex 颜色按 sRGB 输入、线性渲染、ACES 输出,避免整体泛白
      THREE.ColorManagement.legacyMode = false;
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(innerWidth, innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      document.getElementById('stage').appendChild(renderer.domElement);
      this.renderer = renderer;
      TW.input = this.input; // 供 fishing/boat 等读取按键状态

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x0a2a30);
      this.camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 2200);

      // 系统初始化(顺序依赖:water/world 先于 boat/player)
      TW.shops.load();
      TW.ui.init();
      TW.daynight.init(this.scene);
      TW.water.init(this.scene);
      TW.world.init(this.scene);
      TW.boat.init(this.scene);
      TW.player.init(this.scene);
      TW.fishing.init(this.scene);
      TW.daynight.update(0, TW.player.pos);

      this.bindInput();
      window.addEventListener('resize', () => {
        this.camera.aspect = innerWidth / innerHeight;
        this.camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
      });

      this.clock = new THREE.Clock();
      this.guided = TW.ui.maybeGuide();
      if (this.guided) TW.ui.hint('按 回车 或点击「开始」进入游戏', true);

      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    },

    // ---------- 输入 ----------
    bindInput() {
      const keys = this.input.keys;
      const gesture = () => { TW.audio.init(); TW.audio.resume(); };
      window.addEventListener('pointerdown', gesture, { once: false });
      window.addEventListener('keydown', gesture, { once: false });

      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Tab') e.preventDefault();
        keys.add(e.code);
        this.onKey(e);
      });
      window.addEventListener('keyup', (e) => {
        keys.delete(e.code);
        // 松开空格 → 抛竿
        if (e.code === 'Space' && TW.fishing.state === 'charge') TW.fishing.releaseCast();
      });

      // 视角拖拽
      const dom = this.renderer.domElement;
      dom.addEventListener('pointerdown', (e) => {
        this.dragging = true;
        this.lastPX = e.clientX; this.lastPY = e.clientY;
        dom.setPointerCapture(e.pointerId);
      });
      dom.addEventListener('pointermove', (e) => {
        if (!this.dragging) return;
        const dx = e.clientX - this.lastPX, dy = e.clientY - this.lastPY;
        this.lastPX = e.clientX; this.lastPY = e.clientY;
        TW.player.camYaw -= dx * 0.0055;
        TW.player.camPitch = U.clamp(TW.player.camPitch + dy * 0.004, 0.06, 1.25);
      });
      dom.addEventListener('pointerup', (e) => {
        this.dragging = false;
        try { dom.releasePointerCapture(e.pointerId); } catch (err) { }
      });
      dom.addEventListener('wheel', (e) => {
        e.preventDefault();
        TW.player.camDist = U.clamp(TW.player.camDist * (1 + Math.sign(e.deltaY) * 0.12), 4, 22);
      }, { passive: false });
    },

    onKey(e) {
      const F = TW.fishing;
      const ui = TW.ui;
      if (e.repeat) return;

      if (e.code === 'Enter' && this.guided) {
        this.guided = false;
        ui.closeGuide();
        return;
      }
      if (e.code === 'Escape') { ui.closePanels(); return; }
      if (ui.guideOpen()) return;

      // 渔获卡上空格/Esc 都能收下
      if (ui.currentPanel === 'panel-catch' && (e.code === 'Space' || e.code === 'KeyE')) {
        ui.closeCatch();
        return;
      }
      if (ui.panelOpen()) return;

      // 钓鱼进行中只响应空格(按下事件)
      if (F.state !== 'idle') {
        if (e.code === 'Space' && F.state === 'strike') F.startFight();
        return;
      }

      switch (e.code) {
        case 'Space':
          if (F.canCast()) F.startCharge();
          else if (TW.player.mode === 'boat') TW.ui.toast('船还没停稳,等船速降下来再抛竿');
          else TW.ui.toast('要先走到码头、沙滩上,或停稳船');
          break;
        case 'KeyE':
          this.interact();
          break;
        case 'KeyC': ui.openLog(); break;
        case 'KeyH': ui.openHelp(); break;
        case 'KeyM': {
          TW.audio.init();
          const muted = TW.audio.toggleMute();
          ui.toast(muted ? '🔇 已静音' : '🔊 声音开启');
          break;
        }
      }
    },

    // ---------- E 交互 ----------
    dist2(x1, z1, x2, z2) { return Math.hypot(x1 - x2, z1 - z2); },
    nearJoe() {
      const p = TW.player.pos;
      return this.dist2(p.x, p.z, TW.world.joeStand.x, TW.world.joeStand.z) < 7;
    },
    nearMarta() {
      const p = TW.player.pos;
      return this.dist2(p.x, p.z, TW.world.martaShop.x, TW.world.martaShop.z) < 7;
    },
    nearBoat() {
      const p = TW.player.pos, b = TW.boat.pos();
      return this.dist2(p.x, p.z, b.x, b.z) < 4.5;
    },

    interact() {
      const ui = TW.ui;
      if (TW.player.mode === 'boat') return this.disembark();
      if (this.nearJoe()) {
        if (TW.daynight.isDay()) ui.openSell();
        else ui.toast('Joe 收摊了 —— 「天黑鱼不新鲜,明早 06:00 见!」', 'bad');
        return;
      }
      if (this.nearMarta()) return ui.openShop();
      if (this.nearBoat()) {
        TW.player.mode = 'boat';
        TW.ui.toast('🚤 上船了 —— W/S 油门,A/D 转向');
        return;
      }
      ui.toast('附近没有可以互动的东西');
    },

    disembark() {
      const b = TW.boat.pos();
      const p = TW.world.pier;
      // 靠近码头 → 直接落甲板
      const pierNear = b.x > p.x0 - 3 && b.x < p.x1 + 3 && Math.abs(b.z) < p.halfW + 4;
      if (pierNear) {
        TW.player.mode = 'walk';
        TW.player.pos.set(U.clamp(b.x, p.x0 + 0.5, p.x1 - 0.5), p.deckY, U.clamp(b.z, -p.halfW + 0.2, p.halfW - 0.2));
        TW.ui.toast('回到了码头');
        return;
      }
      // 找附近可站立滩点
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        for (const d of [3.5, 5.5]) {
          const x = b.x + Math.cos(a) * d, z = b.z + Math.sin(a) * d;
          if (TW.world.islandHeight(x, z) > 0.2) {
            TW.player.mode = 'walk';
            TW.player.pos.set(x, TW.world.islandHeight(x, z), z);
            TW.ui.toast('回到了岸上');
            return;
          }
        }
      }
      TW.ui.toast('离岸太远,把船开近一点再下', 'bad');
    },

    // ---------- 每帧 ----------
    loop() {
      requestAnimationFrame(this.loop);
      const dt = Math.min(this.clock.getDelta(), 0.05);
      const ui = TW.ui;
      const paused = ui.panelOpen() || ui.guideOpen();
      const fishingActive = TW.fishing.state !== 'idle';

      TW.daynight.tick(dt);
      TW.water.update(dt);
      TW.world.update(dt, TW.water.time);
      TW.boat.update(dt, this.input, paused || fishingActive);
      TW.player.update(dt, this.input, paused || fishingActive);
      TW.fishing.update(dt, paused);
      TW.daynight.update(dt, TW.player.pos);
      TW.player.updateCamera(dt);
      ui.updateHUD();

      // 交互提示
      if (!paused && TW.fishing.state === 'idle') this.contextHint();
      if (!paused) this.flyTags();

      // 海浪声随离岸距离
      const pr = Math.hypot(TW.player.pos.x, TW.player.pos.z);
      TW.audio.setSurf(U.clamp(0.85 - Math.max(0, pr - 42) / 70, 0.22, 0.85));

      // 自动存档
      this.saveTimer += dt;
      if (this.saveTimer > 8) { this.saveTimer = 0; TW.shops.save(); }

      if (!this.noRender) this.renderer.render(this.scene, this.camera);
    },

    contextHint() {
      const ui = TW.ui;
      const F = TW.fishing;
      if (TW.player.mode === 'boat') {
        if (TW.boat.canFish()) ui.hint('船停稳了 · 按住 空格 蓄力抛竿 · E 下船', true);
        else ui.hint('W/S 油门 · A/D 转向 · 拖动鼠标看四周', false);
        return;
      }
      if (this.nearJoe()) {
        if (TW.daynight.isDay()) {
          const v = TW.shops.coolerValue();
          ui.hint('E · 卖鱼给 Joe' + (TW.shops.cooler.length ? '(鱼护 ' + TW.shops.cooler.length + ' 条 · 约值 ' + v + ' 金币)' : '(去钓鱼吧!)'), true);
        } else ui.hint('Joe 收摊了(06:00-19:00 营业)', false);
        return;
      }
      if (this.nearMarta()) {
        ui.hint('E · 逛 Marta 船具店(升级线/轮/竿/灯)', true);
        return;
      }
      if (this.nearBoat()) {
        ui.hint('E · 上船出海', true);
        return;
      }
      if (TW.player.onPier(TW.player.pos.x, TW.player.pos.z)) {
        ui.hint('按住 空格 蓄力抛竿 · C 图鉴 · H 帮助', true);
        return;
      }
      ui.hint('WASD 走到码头或沙滩 · 按住 空格 抛竿', false);
    },

    flyTags() {
      const ui = TW.ui;
      if (TW.player.mode === 'walk' && this.nearJoe() && TW.daynight.isDay() && TW.shops.cooler.length) {
        ui.flyTag(new THREE.Vector3(TW.world.joeStand.x, TW.world.joeStand.z + 3, TW.world.joeStand.z),
          '🧊 鱼护 ' + TW.shops.cooler.length + ' 条 · 约 ' + TW.shops.coolerValue() + ' 金币');
      } else {
        ui.flyTag(null);
      }
    }
  };

  TW.main = main;
  main.init();
  TW.booted = true;
})();
