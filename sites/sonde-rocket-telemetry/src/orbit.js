/* 轻量轨道相机：拖拽旋转 / 滚轮缩放 / 时间线镜头接管 / 锚点机位 / 目标跟随 */
(function (SRTL) {
  function Orbit(camera, dom) {
    this.camera = camera;
    this.target = new THREE.Vector3(0, 1.8, 0);
    this.targetGoal = new THREE.Vector3(0, 1.8, 0);
    this.anchor = new THREE.Vector3(5.5, 1.2, 9.5);
    this.anchorGoal = new THREE.Vector3(5.5, 1.2, 9.5);
    this.sph = new THREE.Spherical(14.5, 1.02, -0.72);
    this.sphGoal = new THREE.Spherical(14.5, 1.02, -0.72);
    this.mode = "orbit";
    this.followObj = null;
    this.followOff = new THREE.Vector3(0, 2.2, 0);   // 注视点抬高到箭体视觉中心
    this.autoDrift = 0.05;
    this.userUntil = 0;
    this.stiff = 2.6;

    var self = this;
    var dragging = false, lx = 0, ly = 0;

    function poke() { self.userUntil = performance.now() + 3500; }

    dom.addEventListener("pointerdown", function (e) {
      dragging = true; lx = e.clientX; ly = e.clientY; poke();
      dom.setPointerCapture && dom.setPointerCapture(e.pointerId);
    });
    dom.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      poke();
      var dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      self.sph.theta -= dx * 0.0052;
      self.sph.phi = THREE.MathUtils.clamp(self.sph.phi - dy * 0.0042, 0.25, 2.7);
      self.sphGoal.theta = self.sph.theta;
      self.sphGoal.phi = self.sph.phi;
    });
    window.addEventListener("pointerup", function () { dragging = false; });
    dom.addEventListener("wheel", function (e) {
      e.preventDefault(); poke();
      self.sph.radius = THREE.MathUtils.clamp(self.sph.radius * (1 + e.deltaY * 0.0011), 2.2, 60);
      self.sphGoal.radius = self.sph.radius;
    }, { passive: false });
  }

  /* 时间线推镜头：球坐标 + 注视点；可选 anchor 机位 / follow 跟随目标 */
  Orbit.prototype.flyTo = function (cam) {
    this.sphGoal.theta = cam.theta;
    this.sphGoal.phi = cam.phi;
    this.sphGoal.radius = cam.r;
    if (cam.target) this.targetGoal.set(cam.target[0], cam.target[1], cam.target[2]);
    if (cam.anchor) this.anchorGoal.set(cam.anchor[0], cam.anchor[1], cam.anchor[2]);
    this.mode = cam.mode || "orbit";
    this.followObj = cam.follow && SRTL.Flight ? SRTL.Flight.root() : null;
  };

  Orbit.prototype.update = function (dt) {
    var auto = performance.now() > this.userUntil;
    var k = 1 - Math.exp(-this.stiff * dt);

    if (this.followObj) this.targetGoal.copy(this.followObj.position).add(this.followOff);

    if (auto) {
      this.sphGoal.theta += this.autoDrift * dt;
      this.sph.theta += (this.sphGoal.theta - this.sph.theta) * k;
      this.sph.phi += (this.sphGoal.phi - this.sph.phi) * k;
      this.sph.radius += (this.sphGoal.radius - this.sph.radius) * k;
      this.anchor.lerp(this.anchorGoal, k);
    }

    /* 跟随目标：注视点硬跟踪，防止指数追逐对快速运动目标产生滞后 */
    if (this.followObj || !auto) {
      this.target.copy(this.targetGoal);
    } else {
      this.target.lerp(this.targetGoal, k);
    }

    var desired = new THREE.Vector3().setFromSpherical(this.sph)
      .add(this.mode === "anchor" ? this.anchor : this.target);
    if (this.followObj) {
      this.camera.position.copy(desired);      // 跟随镜头无位置滞后
    } else {
      this.camera.position.lerp(desired, Math.min(1, k * 1.9));
    }
    if (this.camera.position.y < 0.4) this.camera.position.y = 0.4;
    this.camera.lookAt(this.target);
  };

  SRTL.Orbit = Orbit;
})(window.SRTL = window.SRTL || {});
