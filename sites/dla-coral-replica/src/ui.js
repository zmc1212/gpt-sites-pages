/* UI 绑定:控制面板、预设、时间线回放、统计、截图、快捷键。 */
(function () {
  'use strict';

  const DC = (window.DC = window.DC || {});
  const $ = (id) => document.getElementById(id);

  class UI {
    constructor() {
      this.onChange = null;
      this._bindAll();
      this._bindTimeline();
      this._bindButtons();
      this._bindKeys();
    }

    bindSettings(cb) { this.onChange = cb; }

    _emit(key) { if (this.onChange) this.onChange({ key }); }

    _slider(id, key, fmt, resetNeeded) {
      const el = $(id), out = $(id + '-v');
      if (!el) return;
      el.value = DC.settings[key];
      if (out) out.textContent = fmt ? fmt(DC.settings[key]) : DC.settings[key];
      el.addEventListener('input', () => {
        DC.settings[key] = +el.value;
        if (out) out.textContent = fmt ? fmt(DC.settings[key]) : el.value;
        if (key === 'target') DC.renderer.invalidatePrefix && DC.renderer.invalidatePrefix();
        this._emit(key);
        if (resetNeeded) DC.resetSim();
      });
      this._controls.push({ el, key, fmt, out });
    }

    _bindAll() {
      this._controls = [];
      const s = DC.settings;
      // 预设
      document.querySelectorAll('[data-preset]').forEach((btn) => {
        btn.addEventListener('click', () => this.applyPreset(btn.dataset.preset));
      });
      // 模拟参数(改 seed/形状/目标/行走者需重置)
      this._slider('growthRate', 'growthRate', (v) => v + ' 粒/秒');
      this._slider('target', 'target', (v) => (+v).toLocaleString(), true);
      this._slider('walkers', 'walkers', (v) => (+v).toLocaleString(), true);
      this._slider('seedRadius', 'seedRadius', (v) => v + ' 格', true);
      this._slider('threshold', 'threshold');
      this._slider('stickChance', 'stickChance', (v) => Math.round(v * 100) + '%');
      this._slider('bootstrap', 'bootstrap');
      this._slider('launchPad', 'launchPad');
      // 种子形状 / 邻域
      const shape = $('shape');
      shape.value = s.shape;
      shape.addEventListener('change', () => { s.shape = shape.value; DC.resetSim(); });
      const nb = $('neighborhood');
      nb.value = s.neighborhood;
      nb.addEventListener('change', () => { s.neighborhood = nb.value; DC.resetSim(); });
      // 种子数值
      const seed = $('seed');
      seed.value = s.seed;
      seed.addEventListener('change', () => { s.seed = (+seed.value | 0) || 1; DC.resetSim(); });
      $('seed-rand').addEventListener('click', () => {
        s.seed = (Math.random() * 0xffffffff) >>> 0;
        seed.value = s.seed;
        DC.resetSim();
      });
      // 显示
      this._slider('gradContrast', 'gradientContrast', (v) => '×' + (+v).toFixed(2));
      this._slider('gradBias', 'gradientBias', (v) => (+v).toFixed(2));
      this._slider('gradBlur', 'gradientBlur', (v) => (+v).toFixed(2));
      this._slider('size', 'size', (v) => '×' + (+v).toFixed(2));
      this._slider('gap', 'gap', (v) => (+v).toFixed(2));
      this._slider('keyB', 'keyBrightness', (v) => '×' + (+v).toFixed(2));
      this._slider('ambient', 'ambientFill', (v) => '×' + (+v).toFixed(2));
      this._slider('rim', 'rimBrightness', (v) => '×' + (+v).toFixed(2));
      this._slider('bounce', 'bounceBrightness', (v) => '×' + (+v).toFixed(2));
      this._slider('shadow', 'shadowStrength', (v) => '×' + (+v).toFixed(2));
      this._slider('bloom', 'bloomStrength', (v) => (+v).toFixed(2));
      this._slider('bloomTh', 'bloomThreshold', (v) => (+v).toFixed(2));
      this._slider('exposure', 'exposure', (v) => (+v).toFixed(2));
      this._slider('dContrast', 'displayContrast', (v) => '×' + (+v).toFixed(2));
      this._slider('brightness', 'brightness', (v) => '×' + (+v).toFixed(2));
      const hide = $('hideEnclosed');
      hide.checked = s.hideEnclosed;
      hide.addEventListener('change', () => {
        s.hideEnclosed = hide.checked;
        DC.renderer.refreshMatrices();
      });
      const autor = $('autoRotate');
      autor.checked = s.autoRotate;
      autor.addEventListener('change', () => { s.autoRotate = autor.checked; });
      // 颜色
      const inner = $('innerColor'), outer = $('outerColor');
      inner.value = s.innerColor; outer.value = s.outerColor;
      inner.addEventListener('input', () => { s.innerColor = inner.value; this._emit('innerColor'); });
      outer.addEventListener('input', () => { s.outerColor = outer.value; this._emit('outerColor'); });

      // 分组折叠
      document.querySelectorAll('.group > .group-head').forEach((head) => {
        head.addEventListener('click', () => head.parentElement.classList.toggle('collapsed'));
      });
      // 面板整面板收起
      $('panel-toggle').addEventListener('click', () => {
        $('panel').classList.toggle('panel-hidden');
      });
    }

    applyPreset(name) {
      const p = DC.PRESETS && DC.PRESETS[name];
      if (!p) return;
      const s = DC.settings;
      for (const k of Object.keys(p)) {
        if (k === 'name') continue;
        s[k] = p[k];
      }
      // 同步控件
      this._controls.forEach(({ el, key, fmt, out }) => {
        el.value = s[key];
        if (out) out.textContent = fmt ? fmt(s[key]) : s[key];
      });
      $('shape').value = s.shape;
      $('neighborhood').value = s.neighborhood;
      $('innerColor').value = s.innerColor;
      $('outerColor').value = s.outerColor;
      this._emit('preset');
      this.regrow();
      document.querySelectorAll('[data-preset]').forEach((b) => b.classList.toggle('active', b.dataset.preset === name));
    }

    _bindTimeline() {
      const tl = $('timeline'), label = $('timeline-v'), follow = $('btn-follow'), replay = $('btn-replay');
      tl.addEventListener('input', () => {
        DC.timelineLock = true;
        DC.shownCount = +tl.value;
        label.textContent = DC.shownCount.toLocaleString() + ' / ' + DC.sim.count.toLocaleString();
        follow.classList.remove('hidden');
      });
      follow.addEventListener('click', () => {
        DC.timelineLock = false;
        follow.classList.add('hidden');
        label.textContent = '跟随生长';
      });
      replay.addEventListener('click', () => {
        const total = DC.sim.count;
        const t0 = performance.now(), dur = 2600;
        DC.timelineLock = true;
        follow.classList.remove('hidden');
        const step = () => {
          const k = Math.min(1, (performance.now() - t0) / dur);
          const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          DC.shownCount = Math.round(total * ease);
          tl.value = DC.shownCount;
          label.textContent = DC.shownCount.toLocaleString() + ' / ' + total.toLocaleString();
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      tl.max = 0;
    }

    _bindButtons() {
      const run = $('btn-run');
      run.addEventListener('click', () => {
        DC.paused = !DC.paused;
        run.textContent = DC.paused ? '▶ 继续' : '⏸ 暂停';
        run.classList.toggle('paused', DC.paused);
      });
      $('btn-reset').addEventListener('click', () => this.regrow());
      $('btn-shot').addEventListener('click', () => {
        const url = DC.renderer.screenshot();
        const a = document.createElement('a');
        a.href = url;
        a.download = 'coral-' + DC.settings.seed + '-' + DC.sim.count + '.png';
        a.click();
      });
    }

    _bindKeys() {
      window.addEventListener('keydown', (e) => {
        if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
        if (e.code === 'Space') {
          e.preventDefault();
          $('btn-run').click();
        } else if (e.code === 'KeyR') {
          this.regrow();
        } else if (e.code === 'KeyH') {
          $('panel').classList.toggle('panel-hidden');
        }
      });
    }

    /* 重置 + 分块预生长(不卡 UI;后台标签退化为 setTimeout) */
    regrow(preGrow) {
      preGrow = preGrow || Math.min(600, Math.max(300, Math.round(DC.settings.target * 0.04)));
      const loader = $('loader');
      const bar = $('loader-fill');
      loader.classList.remove('hidden');
      DC.resetSim();
      const sim = DC.sim;
      function chunk() {
        const t0 = performance.now();
        while (sim.count < preGrow && performance.now() - t0 < 16) sim.step(2);
        bar.style.width = Math.min(100, (sim.count / preGrow) * 100) + '%';
        if (sim.count < preGrow) {
          if (document.hidden) setTimeout(chunk, 40); else requestAnimationFrame(chunk);
        } else {
          loader.classList.add('hidden');
          DC.timelineLock = false;
          $('btn-follow').classList.add('hidden');
          $('timeline-v').textContent = '跟随生长';
        }
      }
      if (document.hidden) setTimeout(chunk, 40); else requestAnimationFrame(chunk);
    }

    updateStats(o) {
      $('st-count').textContent = o.count.toLocaleString() + ' / ' + o.target.toLocaleString();
      $('st-rate').textContent = o.sticks + ' 粒/秒';
      $('st-radius').textContent = o.radius.toFixed(1);
      $('st-fps').textContent = o.fps;
      // 时间线滑条跟随
      const tl = $('timeline');
      if (!DC.timelineLock) {
        tl.max = o.count;
        tl.value = o.count;
        $('timeline-v').textContent = '跟随生长';
      } else if (+tl.max < o.count) {
        tl.max = o.count;
      }
    }
  }

  DC.UI = UI;
})();
