/* water.js — 海面与海床
 * 海面:着色器顶点位移(4 组正弦波,CPU 侧用同一公式驱动船体/浮漂起伏),
 *       近岛浅水用顶点色做出深浅渐变;岸线一圈噪声泡沫环随浪呼吸。
 * 海床:静态径向高度场,近岸沙色透过半透明水面可见。 */
(function () {
  'use strict';
  const TW = window.TW;
  const U = TW.util;

  // 波形公式(CPU 与 GLSL 各一份,常量必须一致)
  function waveH(x, z, t) {
    return 0.14 * Math.sin(x * 0.28 + z * 0.10 + t * 0.9)
         + 0.11 * Math.sin(x * 0.10 - z * 0.24 + t * 0.7)
         + 0.05 * Math.sin(x * 0.55 + z * 0.45 + t * 1.7)
         + 0.03 * Math.sin(x * 0.90 - z * 0.70 + t * 2.4);
  }
  // 数值梯度(船体倾斜用)
  function waveGrad(x, z, t) {
    const e = 0.6;
    return {
      gx: (waveH(x + e, z, t) - waveH(x - e, z, t)) / (2 * e),
      gz: (waveH(x, z + e, t) - waveH(x, z - e, t)) / (2 * e)
    };
  }

  const GLSL_WAVE = [
    'float tw_wave(vec2 p, float t){',
    '  return 0.14*sin(p.x*0.28 + p.y*0.10 + t*0.9)',
    '       + 0.11*sin(p.x*0.10 - p.y*0.24 + t*0.7)',
    '       + 0.05*sin(p.x*0.55 + p.y*0.45 + t*1.7)',
    '       + 0.03*sin(p.x*0.90 - p.y*0.70 + t*2.4);',
    '}'
  ].join('\n');

  const water = {
    time: 0, uniTime: { value: 0 },
    surface: null, far: null, seabed: null, foam: null,

    init(scene) {
      this.scene = scene;
      this.buildSurface();
      this.buildFar();
      this.buildSeabed();
      this.buildFoam();
    },

    // 主海面:320×320,128 段,GPU 位移
    buildSurface() {
      const geo = new THREE.PlaneGeometry(320, 320, 128, 128);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      const shallow = new THREE.Color(0x2ba0b4), deep = new THREE.Color(0x0b4f66);
      const tmp = new THREE.Color();
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i);
        const r = Math.sqrt(x * x + z * z);
        // 近岸(45→70)由浅青过渡到深蓝
        const f = U.smoothstep(42, 75, r);
        tmp.copy(shallow).lerp(deep, f);
        colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.MeshPhongMaterial({
        vertexColors: true, transparent: true, opacity: 0.84,
        shininess: 90, specular: 0x9adcf0, depthWrite: false, side: THREE.DoubleSide
      });
      mat.onBeforeCompile = (sh) => {
        sh.uniforms.uTime = this.uniTime;
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', '#include <common>\nuniform float uTime;\n' + GLSL_WAVE)
          .replace('#include <beginnormal_vertex>', [
            '#include <beginnormal_vertex>',
            'vec3 twP = (modelMatrix * vec4(position,1.0)).xyz;',
            'float twH = tw_wave(twP.xz, uTime);',
            'float twE = 0.6;',
            'float twX = tw_wave(twP.xz + vec2(twE,0.0), uTime);',
            'float twZ = tw_wave(twP.xz + vec2(0.0,twE), uTime);',
            'objectNormal = normalize(vec3(-(twX-twH)/twE, 1.0, -(twZ-twH)/twE));'
          ].join('\n'))
          .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.y += twH;');
      };
      this.surface = new THREE.Mesh(geo, mat);
      this.surface.renderOrder = 2; // 半透明水面最后画
      this.scene.add(this.surface);
    },

    // 远景平面:无位移,被雾吞掉海天线
    buildFar() {
      const mat = new THREE.MeshPhongMaterial({ color: 0x0b4f66, shininess: 60, specular: 0x6fb9cc, transparent: true, opacity: 0.9, depthWrite: false });
      this.far = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), mat);
      this.far.rotation.x = -Math.PI / 2;
      this.far.position.y = -0.06;
      this.far.renderOrder = 1;
      this.scene.add(this.far);
    },

    // 海床:静态径向高度(与 world.islandHeight 同心),近岸沙色
    buildSeabed() {
      const W = TW.world;
      const size = 340, seg = 72;
      const geo = new THREE.PlaneGeometry(size, size, seg, seg);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      const sand = new THREE.Color(0xd9c48f), mid = new THREE.Color(0x9fae7e), deepC = new THREE.Color(0x2c5450);
      const tmp = new THREE.Color();
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i);
        const r = Math.sqrt(x * x + z * z);
        pos.setY(i, W.seabedHeight(x, z));
        const f = U.smoothstep(44, 95, r);
        tmp.copy(sand).lerp(mid, U.smoothstep(46, 62, r)).lerp(deepC, f);
        colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.computeVertexNormals();
      const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
      this.seabed = new THREE.Mesh(geo, mat);
      this.seabed.receiveShadow = true;
      this.scene.add(this.seabed);
    },

    // 岸线泡沫:噪声闭合环(双圈),透明度随浪相位呼吸
    buildFoam() {
      const W = TW.world;
      const shape = new THREE.Shape();
      const inner = new THREE.Path();
      const N = 120;
      const pts = [], ptsIn = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const wob = (U.noise2D(Math.cos(a) * 2.4 + 10, Math.sin(a) * 2.4 + 10, 99) - 0.5) * 6;
        const rOut = W.shoreRadius() + 2.2 + wob;
        const rIn = W.shoreRadius() - 1.2 + wob;
        pts.push([Math.cos(a) * rOut, Math.sin(a) * rOut]);
        ptsIn.push([Math.cos(a) * rIn, Math.sin(a) * rIn]);
      }
      shape.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < N; i++) shape.lineTo(pts[i][0], pts[i][1]);
      shape.closePath();
      inner.moveTo(ptsIn[0][0], ptsIn[0][1]);
      for (let i = 1; i < N; i++) inner.lineTo(ptsIn[i][0], ptsIn[i][1]);
      inner.closePath();
      shape.holes.push(inner);
      const geo = new THREE.ShapeGeometry(shape, 4);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false });
      this.foam = new THREE.Mesh(geo, mat);
      this.foam.position.y = 0.05;
      this.foam.renderOrder = 3;
      this.scene.add(this.foam);
    },

    update(dt) {
      this.time += dt;
      this.uniTime.value = this.time;
      // 泡沫随波呼吸
      if (this.foam) {
        const s = 1 + Math.sin(this.time * 0.9) * 0.012;
        this.foam.scale.set(s, 1, s);
        this.foam.material.opacity = 0.17 + 0.09 * (0.5 + 0.5 * Math.sin(this.time * 1.3));
      }
    },

    // 世界坐标浪高(供船/浮漂/泡沫粒子)
    waveH(x, z) { return waveH(x, z, this.time); },
    waveGrad(x, z) { return waveGrad(x, z, this.time); }
  };

  TW.water = water;
})();
