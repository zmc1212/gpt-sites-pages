/* 索尔兹伯里平原的风声与鸣禽 —— WebAudio 程序化合成,无音频文件 */
(function (global) {
  'use strict';

  function create() {
    var ctx = null, master = null, windGain = null, windFilter = null, lfo = null;
    var birdTimer = null, running = false;

    function build() {
      var AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.0;
      master.connect(ctx.destination);

      /* 风:布朗噪声 → 低通 → LFO 调制增益/音色 */
      var len = ctx.sampleRate * 4;
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var data = buf.getChannelData(0);
      var last = 0, i;
      for (i = 0; i < len; i++) {
        var white = Math.random() * 2 - 1;
        last = (last + 0.022 * white) / 1.022;
        data[i] = last * 3.2;
      }
      var src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.value = 420;
      windFilter.Q.value = 0.6;
      windGain = ctx.createGain();
      windGain.gain.value = 0.5;
      src.connect(windFilter).connect(windGain).connect(master);
      src.start();
      lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      var lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.22;
      lfo.connect(lfoGain).connect(windGain.gain);
      lfo.start();

      scheduleBird();
    }

    /* 云雀:短促上扬啭鸣 */
    function chirp() {
      if (!ctx) return;
      var t0 = ctx.currentTime + 0.05;
      var n = 2 + Math.floor(Math.random() * 4);
      var k;
      for (k = 0; k < n; k++) {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        var base = 2100 + Math.random() * 1400;
        var ts = t0 + k * (0.09 + Math.random() * 0.12);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(base, ts);
        osc.frequency.exponentialRampToValueAtTime(base * (1.25 + Math.random() * 0.5), ts + 0.05);
        osc.frequency.exponentialRampToValueAtTime(base * 0.9, ts + 0.09);
        g.gain.setValueAtTime(0.0001, ts);
        g.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.04, ts + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ts + 0.11);
        osc.connect(g).connect(master);
        osc.start(ts);
        osc.stop(ts + 0.14);
      }
      scheduleBird();
    }
    function scheduleBird() {
      if (birdTimer) clearTimeout(birdTimer);
      birdTimer = setTimeout(chirp, 4000 + Math.random() * 11000);
    }

    function enable() {
      if (!ctx) build();
      if (ctx.state === 'suspended') ctx.resume();
      running = true;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.55, ctx.currentTime, 0.8);
    }
    function disable() {
      if (!ctx) return;
      running = false;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.0, ctx.currentTime, 0.4);
    }
    function toggle() { return running ? (disable(), false) : (enable(), true); }
    function dispose() { if (birdTimer) clearTimeout(birdTimer); if (ctx) ctx.close(); }

    return { enable: enable, disable: disable, toggle: toggle, isOn: function () { return running; } };
  }

  global.STAudio = { create: create };
})(window);
