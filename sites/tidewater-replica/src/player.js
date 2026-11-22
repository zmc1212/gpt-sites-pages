/* player.js — 玩家角色与第三人称相机
 * 两种模式:WALK(岛面/码头行走)与 BOAT(乘船,角色挂在船上)。
 * 相机:拖动环绕 + 滚轮缩放,平滑跟随;角色含行走摆臂与手持鱼竿。 */
(function () {
  'use strict';
  const TW = window.TW;
  const U = TW.util;

  const player = {
    mode: 'walk',               // walk | boat
    pos: new THREE.Vector3(-26, 0, 3),   // 脚底位置(两摊位之间的步道)
    yaw: Math.PI * 0.75,        // 角色朝向(面向码头)
    walkPhase: 0, moving: false,
    camYaw: Math.PI * 0.52, camPitch: 0.35, camDist: 9,
    mesh: null, rodPivot: null, rod: null,
    helmOffset: new THREE.Vector3(-0.9, 0.82, 0),
    tmpV: new THREE.Vector3(),

    init(scene) {
      this.mesh = this.buildCharacter();
      scene.add(this.mesh);
      this.mesh.position.copy(this.pos);

      // 相机初始
      this.updateCamera(1, true);
    },

    buildCharacter() {
      const g = new THREE.Group();
      const skin = new THREE.MeshLambertMaterial({ color: 0xd8a077 });
      const shirt = new THREE.MeshLambertMaterial({ color: 0xe86a4a });
      const shorts = new THREE.MeshLambertMaterial({ color: 0x3d5a6b });
      const straw = new THREE.MeshLambertMaterial({ color: 0xd9b45c });

      const mkLimb = (mat, w, h, x, y, z, pivotY) => {
        const pivot = new THREE.Group();
        pivot.position.set(x, pivotY, z);
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat);
        m.position.y = -h / 2;
        m.castShadow = true;
        pivot.add(m);
        g.add(pivot);
        return pivot;
      };
      // 腿(枢轴在髋部)
      this.legL = mkLimb(shorts, 0.18, 0.5, -0.11, 0.5, 0, 0.5);
      this.legR = mkLimb(shorts, 0.18, 0.5, 0.11, 0.5, 0, 0.5);
      // 躯干
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.3), shirt);
      torso.position.y = 0.76; torso.castShadow = true;
      g.add(torso);
      // 头 + 草帽
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 7), skin);
      head.position.y = 1.2; head.castShadow = true;
      g.add(head);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.04, 10), straw);
      brim.position.y = 1.31;
      g.add(brim);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), straw);
      dome.position.y = 1.32;
      g.add(dome);
      // 手臂(枢轴在肩部)
      this.armL = mkLimb(skin, 0.13, 0.44, -0.33, 0.96, 0, 0.96);
      this.armR = mkLimb(skin, 0.13, 0.44, 0.33, 0.96, 0, 0.96);
      // 鱼竿:挂在右手上
      this.rodPivot = new THREE.Group();
      this.rodPivot.position.set(0, -0.4, 0.1);
      const rodGeo = new THREE.CylinderGeometry(0.012, 0.03, 1.45, 5);
      rodGeo.translate(0, 0.725, 0);
      this.rod = new THREE.Mesh(rodGeo, new THREE.MeshLambertMaterial({ color: 0x5d4432 }));
      this.rodPivot.add(this.rod);
      this.armR.add(this.rodPivot);
      this.rodTipMark = new THREE.Object3D();
      this.rodTipMark.position.y = 1.45; // 杆长 1.45,顶点即竿尖
      this.rodPivot.add(this.rodTipMark);
      this.rodPivot.rotation.x = -0.85; // 竿朝前上
      return g;
    },

    // 竿尖世界坐标(钓线起点)
    rodTip(out) {
      out = out || new THREE.Vector3();
      this.rodTipMark.getWorldPosition(out);
      return out;
    },

    // 是否站在码头上
    onPier(x, z) {
      const p = TW.world.pier;
      return x > p.x0 && x < p.x1 && Math.abs(z) < p.halfW;
    },

    groundY(x, z) {
      if (this.onPier(x, z)) return TW.world.pier.deckY;
      return Math.max(TW.world.islandHeight(x, z), -0.15);
    },

    // 行走能否落到该点(不入深水)
    walkable(x, z) {
      if (this.onPier(x, z)) return true;
      if (TW.world.islandHeight(x, z) < -0.18) return false;
      for (const o of TW.world.obstacles) {
        if (Math.hypot(x - o.x, z - o.z) < o.r + 0.45) return false;
      }
      return true;
    },

    update(dt, input, paused) {
      if (this.mode === 'walk') {
        if (!paused) {
          // 相机相对移动
          let mx = 0, mz = 0;
          if (input.keys.has('KeyW')) mz += 1;
          if (input.keys.has('KeyS')) mz -= 1;
          if (input.keys.has('KeyA')) mx -= 1;
          if (input.keys.has('KeyD')) mx += 1;
          const len = Math.hypot(mx, mz);
          this.moving = len > 0;
          if (len > 0) {
            mx /= len; mz /= len;
            const cy = this.camYaw;
            // 前方 = 相机朝向(水平面)
            const dx = mx * Math.cos(cy) - mz * Math.sin(cy);
            const dz = -mx * Math.sin(cy) - mz * Math.cos(cy);
            const sp = 4.2;
            const nx = this.pos.x + dx * sp * dt;
            const nz = this.pos.z + dz * sp * dt;
            if (this.walkable(nx, nz)) {
              this.pos.x = nx; this.pos.z = nz;
            } else if (this.walkable(nx, this.pos.z)) {
              this.pos.x = nx;
            } else if (this.walkable(this.pos.x, nz)) {
              this.pos.z = nz;
            }
            this.yaw = Math.atan2(-dz, dx); // 面朝移动方向
            this.walkPhase += dt * 9;
          }
        }
        // 贴地(平滑上下)
        const gy = this.groundY(this.pos.x, this.pos.z);
        this.pos.y = U.damp(this.pos.y, gy, 14, dt);
        this.mesh.position.copy(this.pos);
        this.mesh.rotation.y = U.damp(this.mesh.rotation.y, this.yaw, 12, dt);
        // 行走摆动
        const sw = this.moving ? Math.sin(this.walkPhase) * 0.55 : 0;
        this.legL.rotation.x = sw; this.legR.rotation.x = -sw;
        this.armL.rotation.x = -sw * 0.7;
        if (!this.rodPivot.userData.casting) this.armR.rotation.x = sw * 0.7;
      } else {
        // BOAT:角色挂在船上操舵位
        const b = TW.boat.group;
        const off = this.helmOffset;
        this.tmpV.copy(off).applyAxisAngle(new THREE.Vector3(0, 1, 0), b.rotation.y);
        this.pos.set(b.position.x + this.tmpV.x, b.position.y + off.y + 0.52, b.position.z + this.tmpV.z);
        this.mesh.position.copy(this.pos);
        this.mesh.rotation.y = b.rotation.y + Math.PI / 2; // 面朝船头
        this.legL.rotation.x = this.legR.rotation.x = 0;
        this.armL.rotation.x = -0.9; // 前伸手握舵
        if (!this.rodPivot.userData.casting) this.armR.rotation.x = -0.6;
      }
    },

    // 相机更新:target 随模式(船时抬高看船)
    camTarget(out) {
      if (this.mode === 'boat') out.set(TW.boat.group.position.x, TW.boat.group.position.y + 1.8, TW.boat.group.position.z);
      else out.set(this.pos.x, this.pos.y + 1.5, this.pos.z);
      return out;
    },
    updateCamera(dt, instant) {
      const t = this.camTarget(this._ct || (this._ct = new THREE.Vector3()));
      const cam = TW.main.camera;
      if (!instant) {
        this._camT = this._camT || t.clone();
        this._camT.lerp(t, 1 - Math.exp(-6 * dt));
        t.copy(this._camT);
      }
      const cp = this.camPitch, cy = this.camYaw, d = this.camDist;
      const x = t.x + Math.sin(cy) * Math.cos(cp) * d;
      const y = t.y + Math.sin(cp) * d;
      const z = t.z + Math.cos(cy) * Math.cos(cp) * d;
      // 相机不入地、不入水
      const minY = Math.max(TW.water.waveH(x, z) + 0.8, TW.world.islandHeight(x, z) + 0.7);
      cam.position.set(x, Math.max(y, minY), z);
      cam.lookAt(t);
    }
  };

  TW.player = player;
})();
