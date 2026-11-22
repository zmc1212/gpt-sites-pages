// 场景装配与主循环：灯光/地面/雾、瓦片网格与词的进出、look 切换、统计。
import * as THREE from 'three';
import { setOrigin, project, unproject } from './geo.js';
import { buildTile, makeMaterials, buildAreasMesh } from './city-build.js';
import { WordLayer } from './words.js';
import { OrbitCam } from './camera.js';
import { Picker } from './pick.js';
import { updateWanted, setCallbacks, boot as tilesBoot, getMeta, getBase } from './tiles.js';

export const ROAD_NAMES = {
  0: '干线道路', 1: '大路', 2: '大道', 3: '街道', 4: '街巷',
  5: '步行街', 6: '小径', 7: '台阶路', 8: '通道', 9: '铁道', 10: '轨道', 11: '小路', 12: '轮渡线',
};

export class World {
  constructor() {
    this.tileMeshes = new Map(); // key → buildTile 结果
    this.stats = { b: 0, r: 0, w: 0 };
    this.look = 'words';        // words | material
    this.layerMode = false;     // 分层看
    this.readMode = false;      // 上から読む
    this.onStats = null;
    this.onFirstTiles = null;
    this._first = false;
  }

  async init(container, colors12) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setClearColor(0x04060a);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x04060a, 0.00026);

    this.camera3 = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.5, 9000);
    const { matCity, matRoof, matSil, matDim, roadCity, roadSil } = makeMaterials();
    this.mats = { matCity, matRoof, matSil, matDim, roadCity, roadSil };

    // 灯光
    this.scene.add(new THREE.HemisphereLight(0x8a94a8, 0x14110d, 1.05));
    const sun = new THREE.DirectionalLight(0xcdd6e4, 1.15);
    sun.position.set(-300, 500, 260);
    this.scene.add(sun);

    // 地面
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20000, 20000),
      new THREE.MeshBasicMaterial({ color: 0x0a0d12 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    this.scene.add(ground);
    this.groundMesh = ground;

    // 词层（屏幕空间覆盖渲染）
    this.words = new WordLayer(this.scene);
    this.overlayScene = new THREE.Scene();
    this.overlayScene.add(this.words.overlayGroup);
    this.overlayCam = new THREE.OrthographicCamera(0, innerWidth, innerHeight, 0, -10, 10);

    await tilesBoot();
    const meta = getMeta();
    this.meta = meta;
    setOrigin(meta.origin[0], meta.origin[1]);
    this.colors = meta.cats.map((c) => c.c);
    this._bounds = [0, 0, meta.tile * 40, meta.tile * 40];
    // 实际范围按瓦片覆盖
    let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
    for (const [, tx, ty] of meta.tiles) {
      minx = Math.min(minx, tx * meta.tile); miny = Math.min(miny, ty * meta.tile);
      maxx = Math.max(maxx, (tx + 1) * meta.tile); maxy = Math.max(maxy, (ty + 1) * meta.tile);
    }
    this._bounds = [minx, miny, maxx, maxy];
    this.dataCenter = { x: (minx + maxx) / 2, y: (miny + maxy) / 2 };

    // 常驻基础层：大江/大公园（长江从第一帧就在）
    const base = getBase();
    if (base && base.a && base.a.length) {
      const m = buildAreasMesh(base.a);
      if (m) { m.renderOrder = 0; this.scene.add(m); }
    }
    // 地面盘对准城市中心（原点在城市西南角）
    if (this.groundMesh) this.groundMesh.position.set(this.dataCenter.x, -0.02, -this.dataCenter.y);

    // 分层看的层板：12 片按类别色的发光薄层，让「层」一眼可读
    this.sheets = [];
    this.sheetGroup = new THREE.Group();
    this.sheetGroup.visible = false;
    this.scene.add(this.sheetGroup);
    const sheetGeo = new THREE.PlaneGeometry(820, 820);
    meta.cats.forEach((c, i) => {
      const m = new THREE.Mesh(sheetGeo, new THREE.MeshBasicMaterial({
        color: new THREE.Color(c.c), transparent: true, opacity: 0.05,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      }));
      m.rotation.x = -Math.PI / 2;
      m.position.y = 26 + i * 34;
      m.renderOrder = 2;
      this.sheetGroup.add(m);
      this.sheets.push(m);
    });

    this.orbit = new OrbitCam(this.camera3, this.renderer.domElement, this._bounds);
    this.orbit.onChange = () => { this._wantDirty = true; };
    this.orbit.onSettle = () => { this._wantDirty = true; };
    this.tagVec = new THREE.Vector3();

    this.picker = new Picker(this);

    setCallbacks({
      onMeta: () => {},
      onTile: (key, data) => this._onTile(key, data),
      onStats: () => { if (this.onStats) this.onStats(this.stats); },
    });

    addEventListener('resize', () => {
      this.camera3.aspect = innerWidth / innerHeight;
      this.camera3.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
      this.overlayCam.right = innerWidth;
      this.overlayCam.top = innerHeight;
      this.overlayCam.updateProjectionMatrix();
    });

    this._last = performance.now();
    this.renderer.setAnimationLoop(() => this._frame());
  }

  _onTile(key, data) {
    if (!data) {
      const t = this.tileMeshes.get(key);
      if (t) {
        this.scene.remove(t.group);
        t.dispose();
        this.tileMeshes.delete(key);
        this.words.removeTile(key);
        this._recount();
      }
      return;
    }
    const t = buildTile(data, this.colors, key);
    this._applyLook(t);
    this.scene.add(t.group);
    this.tileMeshes.set(key, t);
    this.words.addTile(key, data, this.colors);
    this._recount();
    if (!this._first) {
      this._first = true;
      if (this.onFirstTiles) this.onFirstTiles();
    }
  }

  _recount() {
    let b = 0, r = 0, w = 0;
    for (const t of this.tileMeshes.values()) { b += t.buildings.length; r += t.roads.length; }
    w = this.words.labels.length;
    this.stats = { b, r, w };
    if (this.onStats) this.onStats(this.stats);
  }

  _applyLook(t) {
    const material = this.look === 'material';
    const read = this.readMode;
    const wordsLook = !material && !read && !this.layerMode;
    if (t.bMesh) {
      t.bMesh.material = read ? this.mats.matDim : material ? this.mats.matCity : this.mats.matSil;
      t.bMesh.visible = !this.layerMode;
    }
    if (t.roofMesh) {
      t.roofMesh.material = read ? this.mats.matDim : material ? this.mats.matRoof : this.mats.matSil;
      t.roofMesh.visible = !this.layerMode;
    }
    if (t.rMesh) {
      t.rMesh.material = material ? this.mats.roadCity : this.mats.roadSil;
      t.rMesh.visible = !this.layerMode;
    }
    if (t.dashMesh) t.dashMesh.visible = !this.layerMode; // 光点路网是夜景底色，两种外观都留着
    if (t.outline) t.outline.visible = wordsLook || read; // 俯瞰读：只留轮廓 = 地图模式
    for (const s of t.signs) s.visible = material && !this.layerMode && !read;
  }

  setLook(look) {
    this.look = look;
    for (const t of this.tileMeshes.values()) this._applyLook(t);
  }

  setLayerMode(on) {
    this.layerMode = on;
    this.readMode = on ? false : this.readMode;
    this.sheetGroup.visible = on;
    for (const t of this.tileMeshes.values()) this._applyLook(t);
  }

  setReadMode(on) {
    this.readMode = on;
    if (on) this.layerMode = false;
    if (this.sheetGroup) this.sheetGroup.visible = this.layerMode;
    for (const t of this.tileMeshes.values()) this._applyLook(t);
  }

  // 拾取辅助
  nearestTown(ring) {
    let cx = 0, cy = 0;
    for (const p of ring) { cx += p[0]; cy += p[1]; }
    cx /= ring.length; cy /= ring.length;
    let best = null, bd = 1e18;
    for (const t of this.meta.towns) {
      const d = Math.hypot(t.x - cx, t.y - cy);
      if (d < bd) { bd = d; best = t; }
    }
    return best || { n: '东京' };
  }

  footprintArea(ring) {
    let a = 0;
    for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
    return Math.abs(a / 2);
  }

  roadKindName(k) { return ROAD_NAMES[k] || '道路'; }

  flyToGeo(lat, lon, dist, el, az) { this.orbit.flyTo(...project(lat, lon), dist, el, az); }

  // ---- 主循环 ----
  _frame() {
    const now = performance.now();
    const dt = Math.min(0.1, (now - this._last) / 1000);
    this._last = now;

    // 视口宽高守卫：0 视口加载的标签页 aspect 会是 NaN，每帧校正一次代价可忽略
    if (this.camera3.aspect !== innerWidth / innerHeight || this.overlayCam.right !== innerWidth) {
      this.camera3.aspect = innerWidth / innerHeight;
      this.camera3.updateProjectionMatrix();
      this.overlayCam.right = innerWidth;
      this.overlayCam.top = innerHeight;
      this.overlayCam.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
    }

    this.orbit.update(dt);

    if (this._wantDirty) {
      this._wantDirty = false;
      updateWanted(this.orbit.target.x, this.orbit.target.y);
    }

    const modes = {
      read: this.readMode,
      layerMode: this.layerMode,
    };
    this.words.update(this.camera3, this.orbit, innerWidth, innerHeight, modes);

    if (this.onFrameTags) this.onFrameTags(); // 分层看的名牌
    if (this.layerMode && this.sheetGroup.visible) {
      for (const s of this.sheets) { s.position.x = this.orbit.target.x; s.position.z = -this.orbit.target.y; }
    }
    this.renderer.render(this.scene, this.camera3);
    // 屏幕空间词层：清深度后叠加，永远画在城市之上
    this.renderer.autoClear = false;
    this.renderer.clearDepth();
    this.renderer.render(this.overlayScene, this.overlayCam);
    this.renderer.autoClear = true;
  }

  // 调试/测试：后台标签页 rAF 被暂停时手动推进帧
  pumpFrames(n = 3) {
    for (let i = 0; i < n; i++) this._frame();
    return this._last;
  }

  cameraAtEvent(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera3);
    const meshes = [];
    for (const t of this.tileMeshes.values()) {
      if (t.bMesh) meshes.push(t.bMesh);
      if (t.rMesh) meshes.push(t.rMesh);
    }
    const hit = ray.intersectObjects(meshes, false)[0];
    if (hit) return hit.point;
    const g = ray.intersectObject(this.groundMesh, false)[0];
    return g ? g.point : null;
  }

  targetLatLon() {
    return unproject(this.orbit.target.x, this.orbit.target.y);
  }
}
