/* audio.js — WebAudio 板频音调:与驱动频率同频的正弦 + 少量三角波泛音
 * 音量很低(≈ -26 dB),开关与改频都做平滑斜坡,避免爆音。 */
(function () {
  'use strict';
  const CH = window.CH;

  const audio = { ctx: null, osc1: null, osc2: null, gain1: null, gain2: null, master: null, on: false };

  audio.ensure = function () {
    if (audio.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    const gain1 = ctx.createGain(); gain1.gain.value = 0.85;
    osc1.connect(gain1); gain1.connect(master);
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.detune.value = 4;
    const gain2 = ctx.createGain(); gain2.gain.value = 0.10;
    osc2.connect(gain2); gain2.connect(master);
    osc1.start(); osc2.start();
    audio.ctx = ctx; audio.osc1 = osc1; audio.osc2 = osc2;
    audio.gain1 = gain1; audio.gain2 = gain2; audio.master = master;
  };

  audio.setOn = function (on) {
    audio.on = on;
    if (!audio.ctx) { if (on) audio.ensure(); if (!audio.ctx) return; }
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    const t = audio.ctx.currentTime;
    audio.master.gain.cancelScheduledValues(t);
    audio.master.gain.setTargetAtTime(on ? 0.05 : 0, t, 0.06);
  };

  audio.setFreq = function (f) {
    if (!audio.ctx) return;
    const t = audio.ctx.currentTime;
    audio.osc1.frequency.setTargetAtTime(f, t, 0.03);
    audio.osc2.frequency.setTargetAtTime(f, t, 0.03);
  };

  CH.audio = audio;
})();
