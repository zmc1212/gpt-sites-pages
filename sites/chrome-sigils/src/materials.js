/* chrome-sigils — 材质预设
 *
 * 五套 PBR 材质:铬 / 18K 金 / 玫瑰金 / 黑釉 / 幻彩。
 * 反射全部来自 scene.environment(PMREM),材质本身零贴图。
 * 幻彩依赖 MeshPhysicalMaterial.iridescence(r139+),缺失时自动降级为铬。
 */
(function (global) {
  'use strict';

  var PRESETS = [
    {
      id: 'chrome', label: '镀铬',
      make: function () {
        return new THREE.MeshPhysicalMaterial({
          color: 0xffffff, metalness: 1.0, roughness: 0.05,
          envMapIntensity: 1.25
        });
      }
    },
    {
      id: 'gold', label: '18K 金',
      make: function () {
        return new THREE.MeshPhysicalMaterial({
          color: 0xffd27d, metalness: 1.0, roughness: 0.13,
          envMapIntensity: 1.15
        });
      }
    },
    {
      id: 'rose', label: '玫瑰金',
      make: function () {
        return new THREE.MeshPhysicalMaterial({
          color: 0xf3b2a6, metalness: 1.0, roughness: 0.12,
          envMapIntensity: 1.15
        });
      }
    },
    {
      id: 'obsidian', label: '黑釉',
      make: function () {
        return new THREE.MeshPhysicalMaterial({
          color: 0x101014, metalness: 0.9, roughness: 0.16,
          clearcoat: 1.0, clearcoatRoughness: 0.08,
          envMapIntensity: 1.3
        });
      }
    },
    {
      id: 'iri', label: '幻彩',
      make: function () {
        var m = new THREE.MeshPhysicalMaterial({
          color: 0xf2f4ff, metalness: 1.0, roughness: 0.16,
          envMapIntensity: 1.25
        });
        if (m.iridescence !== undefined) {
          m.iridescence = 1.0;
          m.iridescenceIOR = 1.3;
          if (m.iridescenceThicknessRange) m.iridescenceThicknessRange = [140, 780];
        } else {
          m.color.set(0xdfe6ff); // 老版本降级:淡蓝铬
        }
        return m;
      }
    }
  ];

  function findById(id) {
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) return PRESETS[i];
    return PRESETS[0];
  }

  global.SigilMaterials = {
    presets: PRESETS,
    findById: findById
  };
})(window);
