
import 'normalize.css/normalize.css';
import './styles/index.scss';
import * as THREE from 'three';
import ScrollCam from './app/ScrollCam.js';
import PostEffects from './app/PostEffects.js';
import Hallways from './app/Hallways.js';
import {TweenMax, TimelineLite} from "gsap/TweenMax";
import OrbitControls from 'orbit-controls-es6';

let renderer, scene, controls, camera, material, pointLight, geometry, sphere, light = null;
const container = document.getElementById('container');
const clock = new THREE.Clock();

document.addEventListener("DOMContentLoaded", () => {

  initialize().then( () => {
    // now we can kick off the animate/render loop
    animate();
  });

  async function initialize() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
      renderer = new THREE.WebGLRenderer({
        antialias: true,	// to get smoother output
      });
      renderer.setClearColor( 0x1e1e1e );
      renderer.setSize( window.innerWidth, window.innerHeight );
      container.appendChild(renderer.domElement);
      controls = new OrbitControls( camera, renderer.domElement );
      camera.position.z = 50;
      controls.enabled = true;
      controls.update();

      addGeometry();

      addLights();
      
  }

  function animate() {
    requestAnimationFrame( animate );

    update();

    controls.update();
    renderer.render(scene, camera);
  }

  var start = Date.now();

  function update() {
    // let all of our scriptz run their respective update loop
    var delta = clock.getDelta();
    var elapsedTime = Date.now() - start;

    material.alphaMap.offset.y = elapsedTime * 0.0002;

  }

  function addGeometry() {
    let alphaMap = new THREE.TextureLoader().load('../static/texture.png');

    geometry = new THREE.SphereGeometry( 50, 50, 50 );
    material = new THREE.MeshStandardMaterial( { 
      color: "#000",
      transparent: true,
      side: THREE.DoubleSide, 
      alphaTest: 0.5, 
    } );
    material.alphaMap = alphaMap;
    material.alphaMap.magFilter = THREE.NearestFilter;
    material.alphaMap.wrapT = THREE.RepeatWrapping;
    material.alphaMap.repeat.y = 1;
    sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );

  }

  function addLights() {
    light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.z = 0;
    scene.add(pointLight);
  }
});
