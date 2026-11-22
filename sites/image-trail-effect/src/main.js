import { ImageTrailEffect } from './image-trail.js';

// 本地生成的三张 SVG 素材(仓库自包含,无外链)
const IMAGES = ['assets/art-1.svg', 'assets/art-2.svg', 'assets/art-3.svg'];

// 三个变体对应 Codrops Sketches 005 / 006 / 007 的初始化参数
const VARIANTS = {
	opaque: {
		totalTrailElements: 5,
		valuesFromTo: { x: [-90, 90], y: [-90, 90], rz: [0, 0] },
	},
	semitransparent: {
		totalTrailElements: 9,
		valuesFromTo: { x: [-100, 100], y: [-100, 100], rz: [0, 0] },
		opacityChange: true,
	},
	rotation: {
		totalTrailElements: 9,
		valuesFromTo: { x: [-200, 200], y: [-70, 70], rz: [-10, 10] },
		opacityChange: true,
	},
};

const state = { variant: 'opaque', imageIndex: 0 };
let trail = null;

function mount() {
	if (trail) trail.destroy();
	trail = new ImageTrailEffect(document.querySelector('.trail'), {
		...VARIANTS[state.variant],
		images: [IMAGES[state.imageIndex]],
	});
	// 调试句柄:控制台可直接访问当前实例(如 __trail.imgTransforms 查看插值状态)
	window.__trail = trail;
}

for (const button of document.querySelectorAll('[data-variant]')) {
	button.addEventListener('click', () => {
		state.variant = button.dataset.variant;
		for (const b of document.querySelectorAll('[data-variant]')) {
			const active = b === button;
			b.classList.toggle('is-active', active);
			b.setAttribute('aria-pressed', String(active));
		}
		mount();
	});
}

document.getElementById('next-image').addEventListener('click', () => {
	state.imageIndex = (state.imageIndex + 1) % IMAGES.length;
	mount();
});

mount();
