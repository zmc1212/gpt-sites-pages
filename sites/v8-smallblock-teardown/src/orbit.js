/* 轻量轨道相机:拖拽旋转 / 滚轮缩放 / 时间线镜头自动接管 */
(function (V8SB) {
  function Orbit(camera, dom) {
    this.camera = camera;
    this.target = new THREE.Vector3(0, 2.2, 0);
    this.targetGoal = new THREE.Vector3(0, 2.2, 0);
    this.sph = new THREE.Spherical(10.5, 1.02, -0.55);
    this.sphGoal = new THREE.Spherical(10.5, 1.02, -0.55);
    this.autoDrift = 0.03;            // rad/s
    this.userUntil = 0;               // 用户交互抑制自动镜头
    this.stiff = 3.2;

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
      self.sph.phi = THREE.MathUtils.clamp(self.sph.phi - dy * 0.0042, 0.28, 1.5);
      self.sphGoal.theta = self.sph.theta;
      self.sphGoal.phi = self.sph.phi;
    });
    window.addEventListener("pointerup", function () { dragging = false; });
    dom.addEventListener("wheel", function (e) {
      e.preventDefault(); poke();
      self.sph.radius = THREE.MathUtils.clamp(self.sph.radius * (1 + e.deltaY * 0.0011), 3.2, 14);
      self.sphGoal.radius = self.sph.radius;
    }, { passive: false });
  }

  /* 时间线推镜头:目标球坐标 + 注视点 */
  Orbit.prototype.flyTo = function (cam) {
    this.sphGoal.theta = cam.theta;
    this.sphGoal.phi = cam.phi;
    this.sphGoal.radius = cam.r;
    this.targetGoal.set(cam.target[0], cam.target[1], cam.target[2]);
  };

  Orbit.prototype.update = function (dt) {
    var auto = performance.now() > this.userUntil;
    var k = 1 - Math.exp(-this.stiff * dt);
    if (auto) {
      this.sphGoal.theta += this.autoDrift * dt;   // 缓慢环绕
      this.sph.theta += (this.sphGoal.theta - this.sph.theta) * k;
      this.sph.phi += (this.sphGoal.phi - this.sph.phi) * k;
      this.sph.radius += (this.sphGoal.radius - this.sph.radius) * k;
      this.target.lerp(this.targetGoal, k);
    }
    this.camera.position.setFromSpherical(this.sph).add(this.target);
    this.camera.lookAt(this.target);
  };

  V8SB.Orbit = Orbit;
})(window.V8SB = window.V8SB || {});
