// UI 接线:底部传输条 + 设置面板 + 快捷键面板 + 怠速隐藏。
// 全部中文文案;快捷键与原作一致。
window.GC = window.GC || {};
GC.ui = (function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const ICON_PLAY = 'M8 5v14l11-7z';
  const ICON_PAUSE = 'M6 5h4v14H6zM14 5h4v14h-4z';
  const ICON_SOUND_ON = 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z';
  const ICON_SOUND_OFF = 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z';

  function fmtTime(t) {
    const s = Math.floor(t);
    return '0:0' + Math.min(s, 9);
  }

  function setupUi(player) {
    const ui = $('ui');
    const seek = $('seek');
    seek.max = String(player.duration);

    // ---------- 传输条 ----------
    const playPath = $('playPath');
    const updatePlayIcon = () => {
      playPath.setAttribute('d', player.paused ? ICON_PLAY : ICON_PAUSE);
    };
    $('playPause').addEventListener('click', () => (player.paused ? player.play() : player.pause()));
    $('rewind').addEventListener('click', () => player.rewind());
    $('frameBack').addEventListener('click', () => player.frameBack());
    $('frameForward').addEventListener('click', () => player.frameForward());

    let scrubbing = false;
    seek.addEventListener('input', () => {
      scrubbing = true;
      player.seekTo(parseFloat(seek.value));
      $('timeCurrent').textContent = fmtTime(player.time);
    });
    seek.addEventListener('change', () => { scrubbing = false; });

    const mutePath = $('mutePath');
    const updateMuteIcon = () => {
      mutePath.setAttribute('d', player.state.soundEnabled ? ICON_SOUND_ON : ICON_SOUND_OFF);
      $('muteToggle').classList.toggle('active-off', !player.state.soundEnabled);
    };
    $('muteToggle').addEventListener('click', () => { player.toggleMute(); updateMuteIcon(); });

    const volume = $('volume');
    volume.value = String(player.state.volume);
    volume.addEventListener('input', () => player.setVolume(parseFloat(volume.value)));

    // ---------- 设置面板 ----------
    const settings = $('settings');
    const info = $('info');
    const settingsToggle = $('settingsToggle');
    const infoToggle = $('infoToggle');

    const syncPanels = () => {
      settingsToggle.setAttribute('aria-expanded', String(!settings.hidden));
      infoToggle.setAttribute('aria-expanded', String(!info.hidden));
    };
    settingsToggle.addEventListener('click', () => {
      settings.hidden = !settings.hidden;
      if (!settings.hidden) info.hidden = true;
      syncPanels();
    });
    infoToggle.addEventListener('click', () => {
      info.hidden = !info.hidden;
      if (!info.hidden) settings.hidden = true;
      syncPanels();
    });

    const speed = $('speed');
    const speedVal = $('speedVal');
    speed.value = String(player.state.speed);
    speedVal.textContent = player.state.speed.toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + '×';
    speed.addEventListener('input', () => {
      player.setSpeed(parseFloat(speed.value));
      speedVal.textContent = (Math.round(player.state.speed * 100) / 100) + '×';
    });
    $('speedReset').addEventListener('click', () => {
      player.setSpeed(1);
      speed.value = '1';
      speedVal.textContent = '1×';
    });

    const bindSwitch = (id, get, set) => {
      const el = $(id);
      el.checked = get();
      el.addEventListener('change', () => set(el.checked));
      return () => { el.checked = get(); };
    };
    const syncReverse = bindSwitch('reverse', () => player.state.reverse, (v) => player.setReverse(v));
    const syncLoop = bindSwitch('loop', () => player.state.loop, (v) => player.setLoop(v));
    const syncOrbit = bindSwitch('orbit', () => player.state.orbit, (v) => player.setOrbitEnabled(v));
    const syncWireframe = bindSwitch('wireframe', () => player.state.wireframe, (v) => player.setWireframe(v));

    const orbitIntensity = $('orbitIntensity');
    const orbitVal = $('orbitIntensityVal');
    orbitIntensity.value = String(player.state.orbitIntensity);
    orbitVal.textContent = String(player.state.orbitIntensity);
    orbitIntensity.addEventListener('input', () => {
      player.setOrbitIntensity(parseFloat(orbitIntensity.value));
      orbitVal.textContent = (Math.round(player.state.orbitIntensity * 10) / 10) + '';
    });
    $('orbitIntensityReset').addEventListener('click', () => {
      player.setOrbitIntensity(1);
      orbitIntensity.value = '1';
      orbitVal.textContent = '1';
    });

    // 配色圆点
    const swatchGroup = $('color');
    const dots = [];
    for (const o of GC.palette.OPTIONS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch';
      btn.title = o.label;
      btn.setAttribute('role', 'radio');
      const accent = GC.palette.paletteFor(o.id).accent;
      btn.style.background = GC.palette.css(accent);
      btn.addEventListener('click', () => player.setColor(o.id));
      swatchGroup.appendChild(btn);
      dots.push({ btn, id: o.id });
    }
    const syncSwatches = () => {
      for (const d of dots) d.btn.classList.toggle('active', d.id === player.state.color);
    };

    // 音轨下拉
    const trackSel = $('track');
    for (const t of GC.audio.TRACKS) {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.label;
      trackSel.appendChild(opt);
    }
    trackSel.value = player.state.track;
    trackSel.addEventListener('change', () => player.setTrack(trackSel.value));

    // ---------- 快捷键 ----------
    const shortcuts = {
      ' ': () => (player.paused ? player.play() : player.pause()),
      r: () => player.rewind(),
      Home: () => player.rewind(),
      End: () => player.seekTo(player.duration),
      ArrowLeft: () => player.seekBy(-0.5),
      ArrowRight: () => player.seekBy(0.5),
      ',': () => player.frameBack(),
      '.': () => player.frameForward(),
      a: () => player.setSpeed(player.state.speed / 1.25),
      d: () => player.setSpeed(player.state.speed * 1.25),
      b: () => { player.setReverse(!player.state.reverse); syncReverse(); },
      l: () => { player.setLoop(!player.state.loop); syncLoop(); },
      q: () => stepTrack(-1),
      e: () => stepTrack(1),
      ArrowUp: () => player.setVolume(player.state.volume + 0.1),
      ArrowDown: () => player.setVolume(player.state.volume - 0.1),
      m: () => { player.toggleMute(); updateMuteIcon(); },
      o: () => { player.setOrbitEnabled(!player.state.orbit); syncOrbit(); },
      w: () => { player.setWireframe(!player.state.wireframe); syncWireframe(); },
      s: () => settingsToggle.click(),
      i: () => infoToggle.click(),
    };
    function stepTrack(delta) {
      const ids = GC.audio.TRACKS.map((t) => t.id);
      const idx = Math.max(0, ids.indexOf(player.state.track));
      const next = ids[(idx + delta + ids.length) % ids.length];
      player.setTrack(next);
      trackSel.value = next;
    }
    window.addEventListener('keydown', (ev) => {
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const key = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
      // 数字键 0-9:跳到 0-90%
      if (/^[0-9]$/.test(key)) {
        player.seekTo(player.duration * parseInt(key, 10) / 10);
        ev.preventDefault();
        return;
      }
      const fn = shortcuts[key];
      if (fn) {
        ev.preventDefault();
        fn();
      }
    });

    // ---------- 怠速隐藏 ----------
    let idleTimer = 0;
    const wake = () => {
      ui.classList.remove('idle');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (settings.hidden && info.hidden) ui.classList.add('idle');
      }, 2600);
    };
    window.addEventListener('mousemove', wake);
    window.addEventListener('touchstart', wake, { passive: true });
    wake();

    const syncSeekDisplay = () => {
      if (!scrubbing) seek.value = String((player.time / player.duration) * parseFloat(seek.max));
      $('timeCurrent').textContent = fmtTime(player.time);
    };

    updatePlayIcon();
    updateMuteIcon();
    syncSwatches();

    return {
      updatePlayIcon,
      syncSeekDisplay,
      syncSwatches,
      updateMuteIcon,
    };
  }

  // 把当前配色落到 CSS 变量(强调色/面板底色)
  function applyUiPalette(pal) {
    const root = document.documentElement.style;
    root.setProperty('--accent', GC.palette.css(pal.accent));
    root.setProperty('--accent-hover', GC.palette.css(pal.accentHover));
    root.setProperty('--panel', GC.palette.css(pal.panel, 0.86));
    root.setProperty('--accent-dim', GC.palette.css(pal.accent, 0.35));
  }

  return { setupUi, applyUiPalette };
})();
