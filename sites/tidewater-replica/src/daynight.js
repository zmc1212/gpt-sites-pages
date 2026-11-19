/* daynight.js — 昼夜循环:时钟、天空穹顶、日月星辰、光照与雾
 * 一昼夜 = 8 分钟。sunElev∈[-1,1] 为太阳高度因子,派生 daylight/night 强度。 */
(function () {
  'use strict';
  const TW = window.TW;
  const U = TW.util;

  const DAY_SECONDS = 480;          // 现实秒 / 游戏日
  const HOUR_PER_SEC = 24 / DAY_SECONDS;
  const START_HOUR = 7.0;

  const daynight = {
    hour: START_HOUR,
    sunElev: 0, daylight: 1, night: 0, duskGlow: 0,
    sunDir: null, sun: null, sunDisc: null, moonDisc: null, stars: null,
    hemiLight: null, sunLight: null, ambLight: null, sky: null,

    init(scene) {
      this.scene = scene;
      this.sunDir = new THREE.Vector3(0, 1, 0);

      // 天空穹顶:CPU 每帧算顶/地两层颜色,着色器按视线高度混合
      const uni = { top: { value: new THREE.Color(0x3fa7d6) }, bottom: { value: new THREE.Color(0xcfe8f0) } };
      const mat = new THREE.ShaderMaterial({
        uniforms: uni,
        side: THREE.BackSide, depthWrite: false, fog: false,
        vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'uniform vec3 top; uniform vec3 bottom; varying vec3 vDir;' +
          'void main(){ float h = clamp(vDir.y, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, pow(h, 0.62)), 1.0); }'
      });
      this.sky = new THREE.Mesh(new THREE.SphereGeometry(900, 24, 12), mat);
      scene.add(this.sky);

      // 太阳/月亮圆盘(始终面向相机)
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xffe9b3, fog: false, transparent: true });
      this.sunDisc = new THREE.Mesh(new THREE.CircleGeometry(34, 24), sunMat);
      const moonMat = new THREE.MeshBasicMaterial({ color: 0xdfe8f2, fog: false, transparent: true });
      this.moonDisc = new THREE.Mesh(new THREE.CircleGeometry(22, 24), moonMat);
      scene.add(this.sunDisc, this.moonDisc);

      // 星空:球壳上撒点,夜间淡入
      const N = 420, pos = new Float32Array(N * 3);
      const rng = U.seeded(20260114);
      for (let i = 0; i < N; i++) {
        const a = rng.range(0, Math.PI * 2), e = Math.acos(rng.range(0.05, 1)); // 只在上半球
        const r = 830;
        pos[i * 3] = r * Math.sin(e) * Math.cos(a);
        pos[i * 3 + 1] = r * Math.cos(e);
        pos[i * 3 + 2] = r * Math.sin(e) * Math.sin(a);
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      this.stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
        color: 0xcfe0ff, size: 2.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false
      }));
      scene.add(this.stars);

      // 光照
      this.sunLight = new THREE.DirectionalLight(0xffffff, 1.1);
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.set(2048, 2048);
      const sc = this.sunLight.shadow.camera;
      sc.left = -70; sc.right = 70; sc.top = 70; sc.bottom = -70; sc.near = 10; sc.far = 400;
      scene.add(this.sunLight, this.sunLight.target);
      this.hemiLight = new THREE.HemisphereLight(0xbfe3f2, 0x3d5a3a, 0.75);
      this.ambLight = new THREE.AmbientLight(0x405460, 0.35);
      scene.add(this.hemiLight, this.ambLight);

      this.scene.fog = new THREE.Fog(0xcfe8f0, 180, 760);
      this.update(0, null);
    },

    // 太阳高度:sunElev = sin(π·(h-6)/12),白天 ∈[0,1],夜为负
    tick(dt) {
      this.hour = (this.hour + dt * HOUR_PER_SEC) % 24;
    },

    update(dt, cameraPos) {
      const h = this.hour;
      const elev = Math.sin(Math.PI * (h - 6) / 12);
      this.sunElev = elev;
      this.daylight = U.smoothstep(-0.12, 0.25, elev);
      this.night = 1 - this.daylight;
      this.duskGlow = Math.max(0, 1 - Math.abs(elev) / 0.28) * (elev > -0.3 ? 1 : 0);

      // 太阳方向:东(+x)升起 → 西(-x)落下
      const az = Math.PI * (h - 6) / 12; // 0..π 白天
      const sd = this.sunDir;
      sd.set(Math.cos(az), Math.max(elev, -0.4), Math.sin(az) * 0.35).normalize();

      // 光照参数
      const sunLight = this.sunLight;
      const warm = new THREE.Color(0xffd9a0), noon = new THREE.Color(0xfff4e0), moonCol = new THREE.Color(0x8fa8cc);
      const sunUp = this.daylight > 0.02;
      sunLight.intensity = 1.15 * this.daylight + 0.22 * this.night;
      if (sunUp) sunLight.color.copy(warm).lerp(noon, U.smoothstep(0.15, 0.6, elev));
      else sunLight.color.copy(moonCol);
      // 夜里太阳光换到月亮方向(继续提供影子和低强度照明)
      const lightDir = sunUp ? sd : new THREE.Vector3(-sd.x, Math.max(0.35, -elev * 0.8), -sd.z);
      const anchor = cameraPos || new THREE.Vector3(0, 0, 0);
      sunLight.position.set(anchor.x + lightDir.x * 180, Math.max(lightDir.y * 180, 40), anchor.z + lightDir.z * 180);
      sunLight.target.position.copy(anchor);

      this.hemiLight.intensity = 0.25 + 0.55 * this.daylight;
      this.ambLight.intensity = 0.22 + 0.16 * this.night;

      // 天空/雾调色板:夜 → 晨昏 → 昼
      const c = this._c || (this._c = { dayTop: new THREE.Color(0x2f8fc4), dayBot: new THREE.Color(0xc8e9ee), nightTop: new THREE.Color(0x0a1026), nightBot: new THREE.Color(0x1b2b47), duskBot: new THREE.Color(0xf2a05a) });
      const top = this.sky.material.uniforms.top.value, bot = this.sky.material.uniforms.bottom.value;
      top.copy(c.nightTop).lerp(c.dayTop, this.daylight);
      bot.copy(c.nightBot).lerp(c.dayBot, this.daylight);
      bot.lerp(c.duskBot, this.duskGlow * 0.8);
      top.lerp(new THREE.Color(0x35518a), this.duskGlow * 0.25);

      const fog = this.scene.fog;
      fog.color.copy(bot);
      fog.near = 200; fog.far = 780;
      this.sky.position.set(anchor.x, 0, anchor.z);
      this.stars.position.set(anchor.x, 0, anchor.z);
      this.stars.material.opacity = this.night * 0.9;

      // 日月圆盘位置
      const R = 780;
      const sunPos = new THREE.Vector3(anchor.x + sd.x * R, sd.y * R, anchor.z + sd.z * R);
      this.sunDisc.position.copy(sunPos);
      this.sunDisc.lookAt(anchor);
      this.sunDisc.material.opacity = U.clamp(elev + 0.15, 0, 1) * 0.95;
      const md = new THREE.Vector3(-sd.x, Math.max(0.15, -elev), -sd.z);
      this.moonDisc.position.set(anchor.x + md.x * R, md.y * R, anchor.z + md.z * R);
      this.moonDisc.lookAt(anchor);
      this.moonDisc.material.opacity = this.night * 0.95;

      if (this.sunDisc.material.map === null) { /* 纯色盘即可 */ }
    },

    // 供玩法用:是否白天(据 Joe 营业 / 咬钩时段)
    isDay() { return this.hour >= 6 && this.hour < 19; },
    isNight() { return this.hour >= 20 || this.hour < 5; },
    // 晨昏(5-7 点 / 17-19 点)
    isTwilight() { return (this.hour >= 5 && this.hour < 7) || (this.hour >= 17 && this.hour < 19); }
  };

  TW.daynight = daynight;
})();
