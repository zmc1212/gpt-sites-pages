// 入口:渲染器 / 相机 / 轨道视差 / 主循环 / 开始卡。
// URL 参数:
//   #auto  跳过开始卡并静音(无头验收 / 嵌入预览)
//   #t=秒  从指定时刻暂停启动(配合 #auto 可截任意节拍的图)
window.GC = window.GC || {};
(function () {
  'use strict';

  const hash = location.hash || '';
  const AUTO = /(^|&)auto(&|$)/.test(hash.slice(1)) || /(^|,)auto(,|$)/.test(hash.slice(1).split('&').join(','));
  const tMatch = hash.match(/t=([0-9.]+)/);
  const START_T = tMatch ? parseFloat(tMatch[1]) : 0;

  const $fatal = document.getElementById('fatal');
  function fatal(msg, err) {
    $fatal.hidden = false;
    $fatal.innerHTML = '<b>出错了</b><span>' + msg + (err ? ' — ' + String(err && err.message || err) : '') + '</span>';
  }
  window.__gcErrors = [];
  window.addEventListener('error', (ev) => {
    window.__gcErrors.push(String(ev.message || ev.error));
    if (ev.message && /three|WebGL/i.test(ev.message)) fatal('初始化失败', ev.message);
  });

  if (typeof THREE === 'undefined') {
    fatal('three.js 加载失败:请通过本地 HTTP 服务或直接双击 index.html 打开(见 README)');
    return;
  }

  // ---------- 渲染器 ----------
  const canvas = document.getElementById('webgl');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  } catch (err) {
    fatal('无法创建 WebGL 上下文', err);
    return;
  }
  renderer.setClearColor(0x000000, 1);

  // 正方形画布(与原作一致:取宽高中较小值),黑边补满视口
  function resize() {
    const side = Math.min(window.innerWidth, window.innerHeight);
    renderer.setSize(side, side, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvas.style.width = side + 'px';
    canvas.style.height = side + 'px';
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- 场景与相机 ----------
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2000);
  const CAM_POS = GC.scene.CAM_POS;
  const CAM_TARGET = GC.scene.CAM_TARGET;
  const FRUSTUM_HALF = 310.114 / 1.8; // 172.3(原作 xmag / zoom)
  function applyProjection() {
    const half = FRUSTUM_HALF;
    camera.left = -half; camera.right = half;
    camera.top = half; camera.bottom = -half;
    camera.zoom = 1;
    camera.updateProjectionMatrix();
  }
  applyProjection();
  camera.position.copy(CAM_POS);
  camera.quaternion.copy(GC.scene.CAM_QUAT);
  camera.updateMatrixWorld(true);
  const defaultQuat = camera.quaternion.clone();
  const defaultPos = camera.position.clone();

  const rig = GC.scene.build(scene);

  // 公告板组:位置/姿态烘自默认相机(正交相机下距离不影响大小)
  {
    const f = new THREE.Vector3(0, 0, -1).applyQuaternion(defaultQuat);
    const r = new THREE.Vector3(1, 0, 0).applyQuaternion(defaultQuat);
    const u = new THREE.Vector3(0, 1, 0).applyQuaternion(defaultQuat);
    rig.billboards.position.copy(CAM_POS)
      .add(f.clone().multiplyScalar(420))
      .add(r.multiplyScalar(0))
      .add(u.multiplyScalar(0));
    rig.billboards.quaternion.copy(defaultQuat);
  }

  // ---------- 轨道视差(思路与原作一致:相对默认视角的 yaw/pitch 偏移) ----------
  const orbit = {
    enabled: true,
    intensity: 1,
    targetYaw: 0, targetPitch: 0, yaw: 0, pitch: 0,
    _right: new THREE.Vector3(1, 0, 0).applyQuaternion(defaultQuat).normalize(),
    _offset: new THREE.Vector3().subVectors(CAM_POS, CAM_TARGET),
    _rot: new THREE.Quaternion(),
    _qy: new THREE.Quaternion(),
    _qp: new THREE.Quaternion(),
    setEnabled(v) {
      this.enabled = v;
      this.targetYaw = this.targetPitch = this.yaw = this.pitch = 0;
      camera.position.copy(defaultPos);
      camera.quaternion.copy(defaultQuat);
    },
    update(dt) {
      if (!this.enabled) return;
      const ease = 1 - Math.exp(-dt * 8);
      this.yaw += (this.targetYaw - this.yaw) * ease;
      this.pitch += (this.targetPitch - this.pitch) * ease;
      this._qy.setFromAxisAngle(_UP, this.yaw);
      this._qp.setFromAxisAngle(this._right, this.pitch);
      this._rot.copy(this._qy).multiply(this._qp);
      camera.position.copy(CAM_TARGET).add(this._offset.clone().applyQuaternion(this._rot));
      camera.quaternion.copy(this._rot).multiply(defaultQuat);
    },
  };
  const _UP = new THREE.Vector3(0, 1, 0);
  const uiRoot = document.getElementById('ui');
  window.addEventListener('mousemove', (ev) => {
    if (!orbit.enabled) return;
    // 面板区域是死区:光标停在上面时回到默认视角
    const rect = uiRoot.getBoundingClientRect();
    if (ev.clientX <= rect.right && ev.clientY >= rect.top && !uiRoot.classList.contains('idle')) {
      orbit.targetYaw = orbit.targetPitch = 0;
      return;
    }
    const ax = (ev.clientX / window.innerWidth - 0.5) * 2;
    const ay = (ev.clientY / window.innerHeight - 0.5) * 2;
    orbit.targetYaw = -ax * Math.PI * 0.05 * orbit.intensity;
    orbit.targetPitch = -ay * Math.PI * 0.035 * orbit.intensity;
  });
  document.addEventListener('mouseleave', () => { orbit.targetYaw = orbit.targetPitch = 0; });
  window.addEventListener('blur', () => { orbit.targetYaw = orbit.targetPitch = 0; });
  // 触屏:按住拖动 = 视差(以按下点为基准),松开回正
  let touchOrigin = null;
  canvas.addEventListener('touchstart', (ev) => {
    if (!orbit.enabled || ev.touches.length !== 1) return;
    touchOrigin = [ev.touches[0].clientX, ev.touches[0].clientY];
  }, { passive: true });
  canvas.addEventListener('touchmove', (ev) => {
    if (!orbit.enabled || !touchOrigin || ev.touches.length !== 1) return;
    ev.preventDefault();
    const dx = Math.min(Math.max(((ev.touches[0].clientX - touchOrigin[0]) / window.innerWidth) * 2, -1), 1);
    const dy = Math.min(Math.max(((ev.touches[0].clientY - touchOrigin[1]) / window.innerHeight) * 2, -1), 1);
    orbit.targetYaw = -dx * Math.PI * 0.05 * orbit.intensity;
    orbit.targetPitch = -dy * Math.PI * 0.035 * orbit.intensity;
  }, { passive: false });
  canvas.addEventListener('touchend', () => { touchOrigin = null; orbit.targetYaw = orbit.targetPitch = 0; });

  // ---------- 音频 ----------
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const audio = new GC.audio.Engine(audioCtx, {}, GC.audio.TRACKS[0].id, true, 0.9);

  // ---------- 播放器 ----------
  const applyColor = (id) => {
    const pal = GC.palette.paletteFor(id);
    rig.setPalette(pal);
    GC.ui.applyUiPalette(pal);
  };
  const player = GC.player.createPlayer({
    audio,
    orbit,
    applyWireframe: (v) => rig.setWireframe(v),
    applyColor,
  });
  // #auto:本次会话静音(无头验收),不写入持久化设置
  if (AUTO) audio.enabled = false;

  const ui = GC.ui.setupUi(player);

  // ---------- 开始卡 ----------
  // 视觉立即启动;音轨离线合成异步就位(合成期间 audio.sync 自动静默)
  const boot = document.getElementById('boot');
  let started = false;
  function start() {
    if (started) return;
    started = true;
    boot.classList.add('gone');
    setTimeout(() => { boot.remove(); }, 650);
    if (START_T > 0) {
      // #t=秒:定位后保持暂停(截取固定节拍用)
      player.seekTo(Math.min(START_T, player.duration));
      player.paused = true;
    } else {
      player.play();
    }
    audioCtx.resume()
      .catch(() => {})
      .then(() => GC.audio.buildBuffers(audioCtx))
      .then((buffers) => {
        audio.buffers = buffers;
        audio.enabled = player.state.soundEnabled;
      })
      .catch(() => { /* 合成失败不阻塞画面,只是没有声音 */ });
  }
  document.getElementById('bootStart').addEventListener('click', start);
  if (AUTO) start();

  // ---------- 主循环 ----------
  const clock = new THREE.Clock();
  let prev = 0;
  let raf = 0;
  function tick() {
    const now = clock.getElapsedTime();
    const dt = Math.min(now - prev, 0.1);
    prev = now;
    player.update(dt);
    GC.timeline.applyTime(player.time, rig);
    orbit.update(dt);
    ui.syncSeekDisplay();
    ui.updatePlayIcon();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  // 标签页隐藏时暂停(rAF 已停,但墙钟会继续走,恢复时会跳帧)。
  // #auto 是无头/嵌入模式,不暂停,方便自动化验收。
  if (!AUTO) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        clock.stop();
        audioCtx.suspend();
      } else {
        clock.start();
        prev = 0;
        audioCtx.resume();
        tick();
      }
    });
  }

  tick();

  // 调试/验收句柄(无头截图与控制台检查用)
  window.__gc = { rig, scene, camera, renderer, player, orbit, audio };
})();
