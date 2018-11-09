import PromisedLoad from './PromisedLoad';
import * as THREE from 'three';
import { KernelSize, BloomEffect, EffectComposer, EffectPass, RenderPass, BokehPass, BlendFunction, GodRaysEffect, DepthEffect, VignetteEffect, DotScreenEffect, ScanlineEffect, GlitchEffect, PixelationEffect, ColorAverageEffect, BokehEffect } from "postprocessing";

export default class {
  constructor(scene, renderer, camera) {
    this.ready = false;
    this.sun = null;
    this.composer = null;
    this.scene = scene;
    this.camera = camera;

    this.setupEffects(renderer);
  }

  async setupEffects(renderer) {
    let sunTex = await PromisedLoad.GetTexture('./static/Hallway/sun.png');
    this.composer = new EffectComposer(renderer);

    // various effectz
    const bloomEffect = new BloomEffect({
      resolutionScale: 0.5,
      distinction: 4,
      opacity: 3,
      blendFunction: BlendFunction.SCREEN,
    });

    const sunMaterial = new THREE.PointsMaterial({
			map: sunTex,
			size: 100,
			sizeAttenuation: true,
			color: 0xffddaa,
			alphaTest: 0,
			transparent: true,
			fog: false
		});

		const sunGeometry = new THREE.BufferGeometry();
		sunGeometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));
		this.sun = new THREE.Points(sunGeometry, sunMaterial);
		this.sun.frustumCulled = false;
		this.sun.position.set(0, 0, 0);

    this.scene.add(this.sun);

    const godRaysEffect = new GodRaysEffect(this.scene, this.camera, this.sun, {
			resolutionScale: 0.1,
			kernelSize: KernelSize.LARGE,
			density: 0.96,
			decay: 0.9,
			weight: 0.4,
			exposure: 0.6,
			samples: 60,
			clampMax: 1.0
		});

    godRaysEffect.dithering = true;

		const bokehEffect = new BokehEffect({
			focus: 0.9,
			dof: 0,
			aperture: 0.0005,
			maxBlur: 0.0125
		});

		const bokehPass = new EffectPass(this.camera, godRaysEffect, bokehEffect, bloomEffect, new VignetteEffect());
		bokehPass.renderToScreen = true;

    // add em to the composer
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(bokehPass);
    this.ready = true;
  }

  update(delta) {
    if (!this.ready) return;
    this.composer.render(delta);

    var sunPos = this.sun.geometry.attributes.position.array;
    for (var posIdx = 0; posIdx < sunPos.length; posIdx = posIdx + 3) {
      sunPos[posIdx] = this.camera.position.x;
      sunPos[posIdx+1] = this.camera.position.y + 500;
      sunPos[posIdx+2] = this.camera.position.z + 9;
    }
    this.sun.geometry.attributes.position.needsUpdate = true;
  }
}
