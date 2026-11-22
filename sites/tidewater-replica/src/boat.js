/* boat.js — 小渔船:低多边形船体 + 简化水面物理
 * 油门推进 / 转向 / 海浪起伏倾斜 / 搁浅与礁石碰撞。
 * 船头朝本地 +X。钓竿要求航速接近 0。 */
(function () {
  'use strict';
  const TW = window.TW;
  const U = TW.util;

  const boat = {
    group: null, speed: 0, heading: Math.PI, // 初始朝码头外侧(西)
    maxSpeed: 7.2, aground: false,

    init(scene) {
      const g = new THREE.Group();
      this.group = g;
      this.buildHull(g);
      g.position.set(TW.world.boatMooring.x, 0, TW.world.boatMooring.z);
      g.rotation.y = this.heading;
      scene.add(g);
    },

    buildHull(g) {
      // 船体外板:俯视轮廓向下拉伸 + 倒角
      const s = new THREE.Shape();
      s.moveTo(2.15, 0);           // 船头尖
      s.lineTo(1.35, 0.62);
      s.lineTo(0.3, 0.82);
      s.lineTo(-1.35, 0.8);
      s.lineTo(-2.05, 0.66);       // 船尾(平)
      s.lineTo(-2.05, -0.66);
      s.lineTo(-1.35, -0.8);
      s.lineTo(0.3, -0.82);
      s.lineTo(1.35, -0.62);
      s.closePath();
      const hullGeo = new THREE.ExtrudeGeometry(s, { depth: 0.85, bevelEnabled: true, bevelThickness: 0.22, bevelSize: 0.18, bevelSegments: 1 });
      hullGeo.rotateX(Math.PI / 2); // 挤出方向变 -Y? extrude 沿 +Z,rotateX(π/2) 后朝 -Y,再翻转
      hullGeo.translate(0, 0.62, 0);
      const hullMat = new THREE.MeshLambertMaterial({ color: 0x3f7fa6 });
      const hull = new THREE.Mesh(hullGeo, hullMat);
      hull.castShadow = true; hull.receiveShadow = true;
      g.add(hull);

      // 舷缘压条
      const rimMat = new THREE.MeshLambertMaterial({ color: 0xf6f1e4 });
      const rim = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.06, 6, 14), rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.scale.set(1.42, 1, 0.55);
      rim.position.y = 0.68;
      g.add(rim);

      // 甲板 + 座板
      const deckMat = new THREE.MeshLambertMaterial({ color: 0x9a7148 });
      const deck = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 1.1), deckMat);
      deck.position.set(-0.15, 0.5, 0);
      g.add(deck);
      const bench = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 1.15), deckMat);
      bench.position.set(-0.8, 0.78, 0);
      g.add(bench);

      // 船外机(船尾)
      const motorMat = new THREE.MeshLambertMaterial({ color: 0x2c3436 });
      const motor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.4, 0.3), motorMat);
      motor.position.set(-2.25, 0.95, 0);
      g.add(motor);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 5), motorMat);
      shaft.position.set(-2.25, 0.45, 0);
      g.add(shaft);
      const prop = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.26, 0.5), motorMat);
      prop.position.set(-2.25, 0.08, 0);
      this.prop = prop;
      g.add(prop);
    },

    // 可通行水深:礁石/浅滩边界;码头区放行(便于停靠上下船)
    passable(x, z) {
      const p = TW.world.pier;
      if (x > p.x0 - 5 && x < p.x1 + 6 && Math.abs(z) < p.halfW + 4) return true;
      return TW.world.seabedHeight(x, z) < -0.65;
    },

    update(dt, input, paused) {
      const g = this.group;
      const aboard = TW.player.mode === 'boat'; // 只有乘船时才接受输入
      if (!paused && aboard) {
        // 油门
        const throttle = (input.keys.has('KeyW') ? 1 : 0) - (input.keys.has('KeyS') ? 1 : 0);
        this.speed += throttle * 2.6 * dt;
        this.speed -= this.speed * 0.55 * dt; // 水阻
        this.speed = U.clamp(this.speed, -2.2, this.maxSpeed);
        // 转向(低速也可小角度转)
        const turn = (input.keys.has('KeyA') ? 1 : 0) - (input.keys.has('KeyD') ? 1 : 0);
        const turnRate = U.lerp(0.7, 1.5, Math.abs(this.speed) / this.maxSpeed) * (this.speed < -0.1 ? -1 : 1);
        this.heading += turn * turnRate * dt;
        // 前进
        const nx = g.position.x + Math.cos(this.heading) * this.speed * dt;
        const nz = g.position.z - Math.sin(this.heading) * this.speed * dt;
        // 搁浅 / 碰撞
        let blocked = !this.passable(nx, nz);
        if (!blocked) {
          for (const o of TW.world.obstacles) {
            if (Math.hypot(nx - o.x, nz - o.z) < o.r + 1.4) { blocked = true; break; }
          }
        }
        if (blocked) {
          if (Math.abs(this.speed) > 2.4 && !this.aground) {
            TW.audio.plop();
            TW.ui.toast('⚠ 船底擦到了浅滩/礁石,换向试试');
          }
          this.aground = true;
          this.speed *= 0.4;
        } else {
          this.aground = false;
          g.position.x = nx; g.position.z = nz;
        }
        // 螺旋桨
        this.prop.rotation.y += this.speed * dt * 9;
      } else {
        this.speed -= this.speed * 2 * dt;
      }

      // 海浪起伏 + 倾斜(叠加转向侧倾)
      const { x, z } = g.position;
      const gh = TW.water.waveGrad(x, z);
      const targetY = TW.water.waveH(x, z) + 0.32;
      g.position.y = U.damp(g.position.y, targetY, 8, dt);
      const pitchT = gh.gx * 6 + this.speed * 0.014;   // 航速抬头
      const rollT = gh.gz * 6 - (aboard && input && input.keys.has('KeyA') ? 0.04 : 0) + (aboard && input && input.keys.has('KeyD') ? 0.04 : 0);
      g.rotation.x = U.damp(g.rotation.x, pitchT, 6, dt);
      g.rotation.z = U.damp(g.rotation.z, rollT, 6, dt);
      g.rotation.y = this.heading;
    },

    // 航速是否低到可以抛竿
    canFish() { return Math.abs(this.speed) < 0.5; },
    pos() { return this.group.position; }
  };

  TW.boat = boat;
})();
