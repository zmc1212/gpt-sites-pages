/* chrome-sigils — DOM UI 装配
 *
 * 面板/工具条/帮助/提示全部原生 DOM,零框架。
 * 设置(材质/环境/粗细/对称)持久化到 localStorage;笔画数据由 model 负责。
 */
(function (global) {
  'use strict';

  var UI_STORE = 'chrome-sigils-ui-v1';
  var ENV_LABELS = { studio: '影棚', neon: '霓虹', sunset: '落日' };

  function $(id) { return document.getElementById(id); }

  function loadUiSettings() {
    try { return JSON.parse(localStorage.getItem(UI_STORE)) || {}; }
    catch (e) { return {}; }
  }
  function saveUiSettings(s) {
    try { localStorage.setItem(UI_STORE, JSON.stringify(s)); } catch (e) { /* 降级 */ }
  }

  function init(opts) {
    var model = opts.model;
    var router = opts.router;
    var actions = opts.actions;   // {applyMaterial, applyEnv, savePng, randomSigil, clearAll}
    var settings = loadUiSettings();

    // ---------- 开始卡 ----------
    var card = $('card-title');
    $('btn-start').addEventListener('click', function () {
      card.classList.add('hidden');
      if (opts.onStart) opts.onStart();
    });

    // ---------- 材质 chips ----------
    var matBox = $('mat-chips');
    var matIds = SigilMaterials.presets.map(function (p) { return p.id; });
    SigilMaterials.presets.forEach(function (p, i) {
      var b = document.createElement('button');
      b.className = 'chip';
      b.textContent = p.label;
      b.title = '快捷键 ' + (i + 1);
      b.dataset.id = p.id;
      b.addEventListener('click', function () { pickMaterial(p.id); });
      matBox.appendChild(b);
    });

    // ---------- 环境 chips ----------
    var envBox = $('env-chips');
    SigilEnv.names.forEach(function (n, i) {
      var b = document.createElement('button');
      b.className = 'chip';
      b.textContent = ENV_LABELS[n] || n;
      b.title = '快捷键 ' + 'QWE'[i];
      b.dataset.id = n;
      b.addEventListener('click', function () { pickEnv(n); });
      envBox.appendChild(b);
    });

    function markChips() {
      Array.prototype.forEach.call(matBox.children, function (b) {
        b.classList.toggle('on', b.dataset.id === settings.material);
      });
      Array.prototype.forEach.call(envBox.children, function (b) {
        b.classList.toggle('on', b.dataset.id === settings.env);
      });
    }

    function pickMaterial(id) {
      settings.material = id;
      saveUiSettings(settings);
      markChips();
      actions.applyMaterial(id);
    }
    function pickEnv(id) {
      settings.env = id;
      saveUiSettings(settings);
      markChips();
      actions.applyEnv(id);
    }

    // ---------- 粗细 / 对称 ----------
    var widthSlider = $('width-slider');
    var widthVal = $('width-val');
    var symToggle = $('sym-toggle');

    widthSlider.value = settings.width || 0.16;
    widthVal.textContent = fmtWidth(+widthSlider.value);
    widthSlider.addEventListener('input', function () {
      var w = +widthSlider.value;
      widthVal.textContent = fmtWidth(w);
      router.strokeWidth = w;
      if (model.selectedId) model.setStrokeWidthQuiet(model.selectedId, w);
    });
    widthSlider.addEventListener('change', function () {
      var w = +widthSlider.value;
      settings.width = w;
      saveUiSettings(settings);
      if (model.selectedId) model.commitWidthHistory(model.selectedId, w);
    });

    symToggle.checked = !!settings.symmetry;
    router.setSymmetry(!!settings.symmetry);
    symToggle.addEventListener('change', function () {
      settings.symmetry = symToggle.checked;
      saveUiSettings(settings);
      router.setSymmetry(symToggle.checked);
    });

    function fmtWidth(w) { return (w * 100).toFixed(0) + '‰'; }

    // ---------- 选中笔画区 ----------
    var selPanel = $('sel-panel');
    var selWidth = $('sel-width');
    var selMirror = $('sel-mirror');

    selWidth.addEventListener('input', function () {
      if (model.selectedId) {
        model.setStrokeWidthQuiet(model.selectedId, +selWidth.value);
        widthSlider.value = selWidth.value;
        widthVal.textContent = fmtWidth(+selWidth.value);
        router.strokeWidth = +selWidth.value;
      }
    });
    selWidth.addEventListener('change', function () {
      if (model.selectedId) {
        model.commitWidthHistory(model.selectedId, +selWidth.value);
        settings.width = +selWidth.value;
        saveUiSettings(settings);
      }
    });
    selMirror.addEventListener('change', function () {
      if (model.selectedId) {
        model.setSymmetry(model.selectedId, selMirror.checked);
      }
    });
    $('sel-delete').addEventListener('click', function () {
      if (model.selectedId) { model.deleteStroke(model.selectedId); refreshSelection(); }
    });

    function refreshSelection() {
      var s = model.strokes.find(function (x) { return x.id === model.selectedId; });
      if (!s) {
        selPanel.classList.add('hidden');
        return;
      }
      selPanel.classList.remove('hidden');
      selWidth.value = s.width;
      selMirror.checked = !!s.mirrorOf;
    }

    // ---------- 工具条 ----------
    $('btn-undo').addEventListener('click', function () { model.undo(); });
    $('btn-redo').addEventListener('click', function () { model.redo(); });
    $('btn-clear').addEventListener('click', function () {
      if (model.strokes.length && window.confirm('清空全部笔画?')) model.clear();
    });
    $('btn-random').addEventListener('click', function () { actions.randomSigil(); });
    $('btn-save').addEventListener('click', function () { actions.savePng(); });
    $('btn-help').addEventListener('click', function () { toggleHelp(true); });

    // ---------- 帮助浮层 ----------
    var help = $('help');
    help.addEventListener('click', function (e) { if (e.target === help) toggleHelp(false); });
    $('help-close').addEventListener('click', function () { toggleHelp(false); });
    function toggleHelp(show) {
      if (show === undefined) help.classList.toggle('hidden');
      else help.classList.toggle('hidden', !show);
    }

    function toggleSymmetry() {
      symToggle.checked = !symToggle.checked;
      symToggle.dispatchEvent(new Event('change'));
    }

    // ---------- Toast ----------
    var toastEl = $('toast');
    var toastTimer = 0;
    function toast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
    }

    // ---------- 模型回调 ----------
    model.onChange = function () {
      $('stroke-count').textContent = model.strokes.length;
      $('btn-undo').disabled = !model.canUndo();
      $('btn-redo').disabled = !model.canRedo();
      refreshSelection();
    };

    // 初始标记
    if (!settings.material) settings.material = matIds[0];
    if (!settings.env) settings.env = SigilEnv.names[0];
    markChips();
    model._emit();

    return {
      toast: toast,
      pickMaterial: pickMaterial,
      pickEnv: pickEnv,
      toggleHelp: toggleHelp,
      toggleSymmetry: toggleSymmetry,
      settings: settings
    };
  }

  global.SigilUI = { init: init };
})(window);
