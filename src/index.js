
import 'normalize.css/normalize.css';
import './styles/index.scss';
import * as THREE from 'three';
import ScrollCam from './app/ScrollCam.js';
import PostEffects from './app/PostEffects.js';
import Hallways from './app/Hallways.js';
import {TweenMax, TimelineLite} from "gsap/TweenMax";

document.addEventListener("DOMContentLoaded", () => {
  let renderer, scene, mixer, scrollCam, postEffects, hallways = null;
  const container = document.getElementById('container');
  const clock = new THREE.Clock();
  const modelUrl = './static/Hallway/hallwaylit.json';

  initialize().then( () => {
    // now we can kick off the animate/render loop
    animate();
  });

  async function initialize() {
      renderer = new THREE.WebGLRenderer({
        antialias: true,	// to get smoother output
      });
      renderer.setClearColor( 0x3b3b3b );
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize( window.innerWidth, window.innerHeight );
      container.appendChild(renderer.domElement);

      // import hallway object, and clone it a few times
      hallways = new Hallways();
      scene = await hallways.setupScene(modelUrl);

      // create our camera that listens to scrollz
      scrollCam = new ScrollCam(scene,
        new THREE.Vector3(0, -3, -5),
      5, 0.05, 20, 0.5);

      // have each hallway spawn neighboring hallways when user enters them
      hallways.setupColliders(scrollCam);

      // create some post effects to apply to our camera
      postEffects = new PostEffects(scene, renderer, scrollCam.camera);
  }

  function animate() {
    update();
    requestAnimationFrame( animate );
  }

  function update() {
    // let all of our scriptz run their respective update loop
    var delta = clock.getDelta();

    if (mixer != null)
      mixer.update(delta);

    if (scrollCam != null)
      scrollCam.update(delta);

    if (postEffects != null)
      postEffects.update(delta);

    if (hallways != null)
      hallways.update();
  }
});
