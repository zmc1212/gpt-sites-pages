/* chrome-sigils — 程序化等距柱状环境贴图(影棚 / 霓虹 / 落日)
 *
 * 镀铬材质的本质是「映出环境」:没有一张有明暗结构的 HDR,镜面金属就只是一团灰。
 * 这里不加载任何外部 HDR —— 全部用 2D Canvas 画出 2048×1024 的 equirect 贴图:
 *   - 天空 / 地面垂直渐变提供基础明暗
 *   - 大块柔光箱(圆角矩形 + shadowBlur)给宽大的慢反射高光
 *   - 细长亮条(略高于地平线)给镀铬管壁上那条「标志性」的锐利环形亮线
 *   - 落日 / 霓虹各自加太阳盘、光晕横条、霓虹灯柱与地灯
 * 左右接缝:所有越过 x 边界的形状都以 x±W 各补画一份,保证水平无缝。
 * 场景背景直接复用同一张 canvas(低开销、反射与背景天然一致),PMREM 仅供 IBL。
 */
(function (global) {
  'use strict';

  var EW = 2048, EH = 1024;       // equirect 画布尺寸
  var HORIZON = 512;              // 地平线像素行

  // ---------- 确定性随机 ----------
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 圆角矩形(带 wrap:跨左右边界时在 x±W 各画一次)
  function softBox(ctx, x, y, w, h, blur, alpha, wrapW) {
    for (var k = -1; k <= 1; k++) {
      var ox = x + k * wrapW;
      if (ox + w < -blur * 2 || ox > wrapW + blur * 2) continue;
      ctx.save();
      ctx.shadowColor = 'rgba(255,255,255,' + alpha + ')';
      ctx.shadowBlur = blur;
      ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
      var r = Math.min(w, h) * 0.18;
      ctx.beginPath();
      ctx.moveTo(ox + r, y);
      ctx.arcTo(ox + w, y, ox + w, y + h, r);
      ctx.arcTo(ox + w, y + h, ox, y + h, r);
      ctx.arcTo(ox, y + h, ox, y, r);
      ctx.arcTo(ox, y, ox + w, y, r);
      ctx.closePath();
      ctx.fill();
      ctx.fill(); // 双重填充加浓中心,柔边交给 shadowBlur
      ctx.restore();
    }
  }

  // 垂直亮条(霓虹灯柱):核心亮条 + 大范围光晕
  // glow 为光晕颜色;晕宽取灯宽的 7 倍
  function neonBar(ctx, x, y0, y1, w, core, glow, wrapW) {
    var ext = Math.max(30, w * 7);
    for (var k = -1; k <= 1; k++) {
      var ox = x + k * wrapW;
      if (ox < -200 || ox > wrapW + 200) continue;
      var g = ctx.createLinearGradient(ox - ext, 0, ox + ext, 0);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.5, glow);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(ox - ext, y0 - ext * 0.6, ext * 2, (y1 - y0) + ext * 1.2);
      ctx.fillStyle = core;
      ctx.fillRect(ox - w / 2, y0, w, y1 - y0);
    }
  }

  // 太阳盘 + 大光晕(haloExt: 光晕半径,haloColor: 光晕颜色)
  function sunDisk(ctx, x, y, r, haloExt, core, haloColor, wrapW) {
    for (var k = -1; k <= 1; k++) {
      var ox = x + k * wrapW;
      if (ox < -haloExt * 2 || ox > wrapW + haloExt * 2) continue;
      var g = ctx.createRadialGradient(ox, y, 0, ox, y, haloExt);
      g.addColorStop(0, core);
      g.addColorStop(0.22, core);
      g.addColorStop(0.5, haloColor);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(ox - haloExt, y - haloExt, haloExt * 2, haloExt * 2);
    }
  }

  // ---------- 三套环境 ----------
  var PAINTERS = {

    studio: function (ctx) {
      // 铬镜面需要「暗环境 + 亮光源」的对比:深灰影棚,大块柔光箱,细长反光条
      var sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
      sky.addColorStop(0, '#2e2d33');
      sky.addColorStop(0.55, '#4a473f');
      sky.addColorStop(1, '#6e6a5e');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, EW, HORIZON);

      var floor = ctx.createLinearGradient(0, HORIZON, 0, EH);
      floor.addColorStop(0, '#3a3833');
      floor.addColorStop(0.4, '#262522');
      floor.addColorStop(1, '#121110');
      ctx.fillStyle = floor; ctx.fillRect(0, HORIZON, EW, EH - HORIZON);

      // 地平线:柔和的明暗交界,略提亮
      var hz = ctx.createLinearGradient(0, HORIZON - 26, 0, HORIZON + 30);
      hz.addColorStop(0, 'rgba(255,255,255,0)');
      hz.addColorStop(0.5, 'rgba(214,208,196,0.55)');
      hz.addColorStop(1, 'rgba(20,19,17,0.5)');
      ctx.fillStyle = hz; ctx.fillRect(0, HORIZON - 26, EW, 56);

      // 两块主柔光箱(左高右低)——慢反射的宽高光来源
      softBox(ctx, 200, 120, 380, 250, 55, 1.0, EW);
      softBox(ctx, 1430, 200, 430, 210, 55, 0.9, EW);
      // 顶部反光板(给仰角反射面补光)
      softBox(ctx, 760, 30, 520, 90, 45, 0.5, EW);

      // 细长亮条:略高于地平线的长条反光板,管壁锐利亮线全靠它
      softBox(ctx, 320, 448, 620, 26, 18, 1.0, EW);
      softBox(ctx, 1180, 462, 540, 20, 16, 0.9, EW);

      // 地面上的光池:给下半球一点暖反射
      var pool = ctx.createRadialGradient(EW * 0.5, HORIZON + 130, 0, EW * 0.5, HORIZON + 130, 620);
      pool.addColorStop(0, 'rgba(196,186,166,0.5)');
      pool.addColorStop(1, 'rgba(196,186,166,0)');
      ctx.fillStyle = pool;
      ctx.fillRect(EW * 0.5 - 640, HORIZON, 1280, 420);
    },

    neon: function (ctx) {
      var rnd = mulberry32(20261120);

      var sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
      sky.addColorStop(0, '#1a1040');
      sky.addColorStop(0.6, '#31205e');
      sky.addColorStop(1, '#5b2f7e');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, EW, HORIZON);

      var floor = ctx.createLinearGradient(0, HORIZON, 0, EH);
      floor.addColorStop(0, '#241a38');
      floor.addColorStop(1, '#0b0812');
      ctx.fillStyle = floor; ctx.fillRect(0, HORIZON, EW, EH - HORIZON);

      // 远处的城市天际光晕
      var city = ctx.createLinearGradient(0, HORIZON - 150, 0, HORIZON);
      city.addColorStop(0, 'rgba(120,60,200,0)');
      city.addColorStop(1, 'rgba(210,110,255,0.65)');
      ctx.fillStyle = city; ctx.fillRect(0, HORIZON - 150, EW, 150);

      // 大块冷白柔光:铬面的主反射源(没有它金属只会映到黑暗)
      softBox(ctx, 260, 110, 520, 260, 60, 0.95, EW);
      softBox(ctx, 1330, 170, 560, 230, 60, 0.85, EW);

      // 地平线:贯穿的青色亮线
      neonBar(ctx, EW / 2, HORIZON - 2, HORIZON + 2, 4, 'rgba(170,245,255,0.95)', 'rgba(60,190,240,0.6)', EW);
      // 左右霓虹灯柱:品红 / 青 / 紫
      neonBar(ctx, 380, 140, 520, 30, 'rgba(255,120,205,1)', 'rgba(210,60,150,0.5)', EW);
      neonBar(ctx, 760, 200, 480, 24, 'rgba(120,235,255,1)', 'rgba(50,160,210,0.5)', EW);
      neonBar(ctx, 1150, 170, 500, 28, 'rgba(190,120,255,1)', 'rgba(110,60,200,0.5)', EW);
      neonBar(ctx, 1690, 220, 460, 22, 'rgba(120,235,255,0.9)', 'rgba(50,160,210,0.4)', EW);

      // 高位白色小键灯:给铬面一个「看得出形状」的锐利小高光
      softBox(ctx, 1560, 120, 180, 90, 30, 1.0, EW);

      // 地灯:随机彩色小点,点亮反射下缘
      for (var i = 0; i < 130; i++) {
        var x = rnd() * EW, y = HORIZON + 20 + rnd() * 380;
        var hues = [[110, 240, 255], [255, 90, 200], [150, 110, 255], [255, 190, 90]];
        var c = hues[(rnd() * hues.length) | 0];
        var a = 0.3 + rnd() * 0.55;
        var s = 2 + rnd() * 7;
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
        ctx.beginPath(); ctx.ellipse(x, y, s, s * 0.45, 0, 0, Math.PI * 2); ctx.fill();
      }
    },

    sunset: function (ctx) {
      var sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
      sky.addColorStop(0, '#2c1a52');
      sky.addColorStop(0.42, '#a34a6e');
      sky.addColorStop(0.75, '#f2825e');
      sky.addColorStop(1, '#ffd9a3');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, EW, HORIZON);

      var floor = ctx.createLinearGradient(0, HORIZON, 0, EH);
      floor.addColorStop(0, '#4a3040');
      floor.addColorStop(0.35, '#2a1d24');
      floor.addColorStop(1, '#120d10');
      ctx.fillStyle = floor; ctx.fillRect(0, HORIZON, EW, EH - HORIZON);

      // 太阳:接近地平线的暖盘 + 大光晕(反射的「主光」)
      sunDisk(ctx, 880, 470, 60, 300, 'rgba(255,244,214,0.98)', 'rgba(255,170,90,0.5)', EW);

      // 云带:几条半透明暗紫横条
      ctx.fillStyle = 'rgba(70,36,84,0.4)';
      ctx.fillRect(0, 380, EW, 16);
      ctx.fillStyle = 'rgba(90,44,88,0.32)';
      ctx.fillRect(0, 420, EW, 22);
      ctx.fillStyle = 'rgba(120,60,90,0.28)';
      ctx.fillRect(0, 300, EW, 12);

      // 逆光位补一小块冷色天光,避免暗部死黑
      softBox(ctx, 1620, 160, 260, 140, 50, 0.5, EW);
      // 地面:太阳正下方拉一条暖色反光
      var streak = ctx.createLinearGradient(0, HORIZON, 0, HORIZON + 300);
      streak.addColorStop(0, 'rgba(255,190,120,0.5)');
      streak.addColorStop(1, 'rgba(255,190,120,0)');
      ctx.fillStyle = streak;
      ctx.fillRect(880 - 130, HORIZON, 260, 300);
    }
  };

  function paintCanvas(name) {
    var cv = document.createElement('canvas');
    cv.width = EW; cv.height = EH;
    var ctx = cv.getContext('2d');
    (PAINTERS[name] || PAINTERS.studio)(ctx);
    return cv;
  }

  /* 为场景装配环境:同时设置 scene.environment(PMREM IBL)与
   * scene.background(equirect 直铺)。返回清理函数。 */
  function applyEnvironment(renderer, scene, name) {
    var canvas = paintCanvas(name);
    var tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 4;

    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    var envRT = pmrem.fromEquirectangular(tex);
    pmrem.dispose();

    if (scene.environment && scene.environment.dispose) {
      // 上一套 PMREM 渲染目标随场景切换释放
      if (scene.environment.isRenderTargetTexture || scene.environment.isTexture) {
        try { scene.environment.dispose(); } catch (e) { /* 忽略 */ }
      }
    }
    scene.environment = envRT.texture;
    scene.background = tex;
    // 背景与反射解耦:背景稍压暗(大块光源在画面里太晃眼),反射保持全亮度
    if (scene.backgroundIntensity !== undefined) {
      scene.backgroundIntensity = (name === 'studio') ? 0.72 : (name === 'sunset' ? 0.85 : 1.0);
    }

    return function disposeEnvironment() {
      envRT.dispose();
      tex.dispose();
    };
  }

  global.SigilEnv = {
    apply: applyEnvironment,
    names: ['studio', 'neon', 'sunset']
  };
})(window);
