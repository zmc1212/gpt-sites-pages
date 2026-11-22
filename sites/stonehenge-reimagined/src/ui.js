/* UI 逻辑 —— 信息卡 / 日期时刻控制 / 罗盘 / 预设机位 / 热点拾取 / 帮助 */
(function (global) {
  'use strict';
  var U = global.STUtil;
  var S = global.STSolar;

  var CARDS = [
    {
      t: '巨石阵 Stonehenge',
      b: '约 4600–5000 年前分阶段建成于索尔兹伯里平原。外圈 30 根砂岩石柱顶着环形楣石,内圈是马蹄形三石塔与青石。砂岩采自 25 公里外的马尔伯勒,青石来自 250 公里外的威尔士普雷斯利山——最重的一块楣石近 10 吨。'
    },
    {
      t: '夏至密码 · 中轴对齐',
      b: '整座石阵的中轴线方位角约 49.3°,正对着夏至日出的方位。夏至清晨,站在圆心沿中轴望去,太阳恰好贴着脚跟石从地平线跃出,与巨石连成一线,阳光沿中轴洒进石圈——每年夏至,仍有数万人前来守候这一刻。\n\n拖动"时刻"滑块:看太阳贴着脚跟石升起,又从它的右侧攀高——对齐的窗口只有几分钟。'
    },
    {
      t: '脚跟石与大道',
      b: '脚跟石孤零零立在石圈外 77 米的中轴延长线上,不属于任何石环,却是整座建筑指向太阳的"准星"。它脚下有一圈小沟;大道两侧的平行土埂从东北豁口穿过土坡与沟槽,笔直通向它。入口内侧倒伏的是宰牲石。'
    },
    {
      t: '三石塔 · 马蹄形',
      b: '五组"两竖一横"的三石塔排成马蹄形,开口正对夏至日出方向。立在轴线尽头的大三石塔通高约 9 米,是如今唯一仍顶着楣石的一组;其余或立或缺,倒伏与残桩是四千年风霜的真实痕迹。'
    },
    {
      t: '榫卯石作',
      b: '凑近看立石的顶端:凿出的凸榫正好插入楣石底部的碗窝;楣石侧面以燕尾榫互相咬合,顶面还有凸舌。新石器时代的木作智慧被搬到了石头上,让整圈石作在风里咬合成一体——不用一分工灰。'
    },
    {
      t: '未解之谜',
      b: '谁建造了它?青石为何要从威尔士运来?冰川搬运说与人力船运说争论至今。中央倒伏的暖色祭坛石,最新研究更把它的产地指向了苏格兰东北。每一次测绘,巨石阵都会交出新谜题。'
    }
  ];

  function byId(id) { return document.getElementById(id); }

  function create(ctx) {
    var state = ctx.state;            // { date, time }
    var camCtl = ctx.camCtl, env = ctx.env, anchors = ctx.anchors;
    var el = {
      start: byId('start'), enter: byId('btn-enter'), help2: byId('btn-help-start'),
      hud: byId('hud'),
      cardTitle: byId('card-title'), cardText: byId('card-text'),
      cardPrev: byId('card-prev'), cardNext: byId('card-next'), cardDots: byId('card-dots'),
      cardPanel: byId('card-panel'), cardToggle: byId('card-toggle'),
      dateSlider: byId('date-slider'), timeSlider: byId('time-slider'),
      dateLabel: byId('date-label'), timeLabel: byId('time-label'),
      sunInfo: byId('sun-info'),
      compass: byId('compass-canvas'), viewInfo: byId('view-info'),
      chipsDate: byId('chips-date'), chipsTime: byId('chips-time'),
      presets: byId('presets'),
      btnOverlay: byId('btn-overlay'), btnSound: byId('btn-sound'), btnHelp: byId('btn-help'),
      help: byId('help'), helpClose: byId('help-close'),
      hint: byId('hint'), foot: byId('foot')
    };
    var cardIdx = 0;
    var auto = /#?auto/.test(location.hash);

    /* ---------- 信息卡 ---------- */
    function renderDots() {
      el.cardDots.innerHTML = '';
      CARDS.forEach(function (_, i) {
        var d = document.createElement('span');
        d.className = 'dot' + (i === cardIdx ? ' on' : '');
        d.onclick = function () { setCard(i); };
        el.cardDots.appendChild(d);
      });
    }
    function setCard(i, scroll) {
      cardIdx = (i + CARDS.length) % CARDS.length;
      el.cardTitle.textContent = CARDS[cardIdx].t;
      el.cardText.innerHTML = CARDS[cardIdx].b.replace(/\n\n/g, '<br><br>');
      renderDots();
      if (scroll && !el.cardPanel.classList.contains('open')) {
        el.cardPanel.classList.add('open');
      }
    }
    el.cardPrev.onclick = function () { setCard(cardIdx - 1); };
    el.cardNext.onclick = function () { setCard(cardIdx + 1); };
    el.cardToggle.onclick = function () { el.cardPanel.classList.toggle('open'); };
    setCard(0);

    /* ---------- 滑块与快捷 ---------- */
    function fmtAll() {
      var term = S.nearestTerm(state.date);
      el.dateLabel.textContent = S.fmtDate(state.date) + (term.dist <= 2 ? ' · ' + term.name : '');
      el.timeLabel.textContent = S.fmtHours(state.time);
      var sr = S.sunrise(state.date), ss = S.sunset(state.date);
      el.sunInfo.textContent = '日出 ' + S.fmtHours(sr) + ' · 日落 ' + S.fmtHours(ss);
    }
    el.dateSlider.addEventListener('input', function () {
      state.date = +el.dateSlider.value;
      if (state.time !== null) {
        // 贴合:时刻不超过当日昼长范围太多也无妨,直接保留
      }
      fmtAll();
    });
    el.timeSlider.addEventListener('input', function () {
      state.time = +el.timeSlider.value;
      fmtAll();
    });
    function setDate(doy) {
      state.date = doy;
      el.dateSlider.value = doy;
      fmtAll();
    }
    function setTime(h) {
      state.time = h;
      el.timeSlider.value = h;
      fmtAll();
    }
    Array.prototype.forEach.call(el.chipsDate.children, function (btn) {
      btn.onclick = function () { setDate(+btn.dataset.doy); };
    });
    Array.prototype.forEach.call(el.chipsTime.children, function (btn) {
      btn.onclick = function () {
        var k = btn.dataset.k;
        if (k === 'rise') setTime(S.sunrise(state.date));
        else if (k === 'noon') setTime(12);
        else setTime(S.sunset(state.date));
      };
    });

    /* ---------- 预设机位 ---------- */
    var P = {
      avenue: function () { return { target: new THREE.Vector3(0, 3, 0), radius: 98, theta: S.AXIS_AZ, phi: 0.14 }; },
      solstice: function () {
        return { target: new THREE.Vector3(anchors.heel.x, 1.35, anchors.heel.z), radius: 77, theta: S.AXIS_AZ + 180, phi: 0.005 };
      },
      inside: function () { return { target: new THREE.Vector3(0, 2.4, 0), radius: 8, theta: S.AXIS_AZ + 180, phi: 0.02 }; },
      trilithon: function () { return { target: new THREE.Vector3(anchors.trilithon0.x, 5.6, anchors.trilithon0.z), radius: 25, theta: S.AXIS_AZ, phi: 0.10 }; },
      aerial: function () { return { target: new THREE.Vector3(0, 0, 0), radius: 165, theta: 130, phi: 1.05 }; }
    };
    function goPreset(name, dur) {
      camCtl.flyTo(P[name](), dur);
      Array.prototype.forEach.call(el.presets.children, function (b) {
        b.classList.toggle('on', b.dataset.p === name);
      });
    }
    Array.prototype.forEach.call(el.presets.children, function (btn) {
      btn.onclick = function () {
        var p = btn.dataset.p;
        if (p === 'solstice') {
          // 夏至日出:日轮半出地平线、贴着脚跟石跃出的瞬间(高度角 +0.02°)
          setDate(172);
          setTime(S.timeAtAlt(172, 0.02));
          goPreset('solstice');
          setCard(1, true);
        } else if (p === 'winter') {
          setDate(355);
          setTime(S.timeAtAlt(355, -0.35, false));
          goPreset('avenue');
          setCard(1, true);
        } else {
          goPreset(p);
        }
      };
    });
    // 冬至日落按钮复用 data-p="winter" 走上面的分支

    /* ---------- 开关 ---------- */
    el.btnOverlay.onclick = function () {
      env.compass.group.visible = !env.compass.group.visible;
      el.btnOverlay.classList.toggle('on', env.compass.group.visible);
    };
    el.btnSound.onclick = function () {
      var on = ctx.audio.toggle();
      el.btnSound.classList.toggle('on', on);
      el.btnSound.textContent = on ? '声音开' : '声音关';
    };
    function openHelp() { el.help.classList.add('show'); }
    el.btnHelp.onclick = openHelp;
    el.help2.onclick = openHelp;
    el.helpClose.onclick = function () { el.help.classList.remove('show'); };

    /* ---------- 开始卡 ---------- */
    function enter() {
      window.__entered = (window.__entered || 0) + 1;
      el.start.classList.add('hide');
      setTimeout(function () { el.start.style.display = 'none'; }, 700);
      el.hud.classList.add('show');
      goPreset('solstice', 3.2);
      setCard(1, true);
      ctx.audio.enable();
      el.btnSound.classList.add('on');
      el.btnSound.textContent = '声音开';
    }
    el.enter.onclick = enter;

    /* ---------- 热点拾取 ---------- */
    var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    var anchorMap = [
      { k: 'heel', card: 2 }, { k: 'slaughter', card: 2 },
      { k: 'altar', card: 5 }, { k: 'trilithon0', card: 3 },
      { k: 'trilithon1', card: 3 }, { k: 'trilithon2', card: 3 },
      { k: 'trilithon3', card: 3 }, { k: 'trilithon4', card: 3 }
    ];
    function pick(e) {
      window.__pickDbg = { n: ((window.__pickDbg && window.__pickDbg.n) || 0) + 1, x: e.clientX, y: e.clientY, hits: -1, d: -1 };
      var rect = ctx.renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, ctx.camera);
      var hits = ray.intersectObject(ctx.stoneGroup, true);
      window.__pickDbg.hits = hits.length;
      if (!hits.length) return;
      var p = hits[0].point, best = null, bd = 1e9, i, d;
      anchorMap.forEach(function (am) {
        var ap = anchors[am.k];
        if (!ap) return;
        d = ap.distanceTo(p);
        if (d < bd) { bd = d; best = am; }
      });
      if (best && bd < 22) setCard(best.card, true);
      else setCard(4, true); // 石作细部
    }
    var downXY = null;
    ctx.renderer.domElement.addEventListener('pointerdown', function (e) { downXY = [e.clientX, e.clientY]; });
    ctx.renderer.domElement.addEventListener('pointerup', function (e) {
      if (!downXY) return;
      var moved = Math.abs(e.clientX - downXY[0]) + Math.abs(e.clientY - downXY[1]);
      downXY = null;
      if (moved < 7) pick(e);
    });

    /* ---------- 罗盘绘制(canvas 物理分辨率 192,按 96 逻辑坐标绘制) ---------- */
    var cctx = el.compass.getContext('2d');
    cctx.setTransform(2, 0, 0, 2, 0, 0);
    function drawCompass(camAzDeg, sunAzDeg, sunAltDeg) {
      var w = 96, h = 96, cx = 48, cy = 48, r = 40;
      cctx.clearRect(0, 0, w, h);
      cctx.strokeStyle = 'rgba(255,255,255,0.28)';
      cctx.lineWidth = 1.5;
      cctx.beginPath(); cctx.arc(cx, cy, r, 0, 7); cctx.stroke();
      cctx.strokeStyle = 'rgba(255,255,255,0.14)';
      cctx.beginPath(); cctx.arc(cx, cy, r * 0.62, 0, 7); cctx.stroke();
      function angle(az) { return (az - camAzDeg - 90) * Math.PI / 180; }
      function mark(az, col, rad, size) {
        var a = angle(az);
        cctx.fillStyle = col;
        cctx.beginPath();
        cctx.arc(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, size, 0, 7);
        cctx.fill();
      }
      // 北
      var aN = angle(0);
      cctx.fillStyle = 'rgba(255,255,255,0.9)';
      cctx.font = '600 11px serif';
      cctx.textAlign = 'center'; cctx.textBaseline = 'middle';
      cctx.fillText('N', cx + Math.cos(aN) * (r + 8), cy + Math.sin(aN) * (r + 8));
      // 中轴线
      var aA = angle(S.AXIS_AZ);
      cctx.strokeStyle = 'rgba(255,215,122,0.9)';
      cctx.lineWidth = 2;
      cctx.beginPath();
      cctx.moveTo(cx, cy);
      cctx.lineTo(cx + Math.cos(aA) * r * 0.92, cy + Math.sin(aA) * r * 0.92);
      cctx.stroke();
      // 太阳
      if (sunAltDeg > -8) mark(sunAzDeg, sunAltDeg > 0 ? '#ffc86b' : '#ff9d5c', r * 0.62, 4.5);
      // 视向(顶部小三角)
      cctx.fillStyle = '#e8ecf2';
      cctx.beginPath();
      cctx.moveTo(cx, cy - r - 2);
      cctx.lineTo(cx - 4, cy - r + 6);
      cctx.lineTo(cx + 4, cy - r + 6);
      cctx.closePath(); cctx.fill();
    }

    /* ---------- 每帧 ---------- */
    var acc = 0;
    function tick(dt, camAzDeg, sun) {
      acc += dt;
      if (acc > 0.12) {
        acc = 0;
        el.viewInfo.textContent = '太阳方位 ' + sun.az.toFixed(1) + '° · 高度 ' + (sun.alt >= 0 ? '+' : '') + sun.alt.toFixed(1) + '°';
        el.foot.textContent = '题材复刻自 MeltTheManual/stonehenge-solstice · three.js 零构建 · 拖动旋转 / 滚轮缩放 / 点击石头看讲解';
      }
      drawCompass(camAzDeg, sun.az, sun.alt);
    }

    fmtAll();
    if (auto) {
      el.start.style.display = 'none';
      el.hud.classList.add('show');
      ctx.audio.disable();
    }

    return {
      tick: tick, setCard: setCard,
      goPreset: goPreset, setDate: setDate, setTime: setTime,
      entered: function () { return el.start.style.display === 'none'; }
    };
  }

  global.STUI = { create: create, CARDS: CARDS };
})(window);
