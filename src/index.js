import 'normalize.css/normalize.css';
import './styles/index.scss';
import * as THREE from 'three';
import ScrollCam from './app/ScrollCam.js';
import PostEffects from './app/PostEffects.js';
import Hallways from './app/Hallways.js';
import { TweenMax, TimelineLite } from 'gsap/TweenMax';
import OrbitControls from 'orbit-controls-es6';
import PromisedLoad from './app/PromisedLoad';
import vertexShader1 from './shaders/vertexShader1.glsl';
import fragmentShader1 from './shaders/fragmentShader1.glsl';

let mouse = new THREE.Vector2();

window.addEventListener('mousemove', onDocumentMouseMove, false);

document.addEventListener('DOMContentLoaded', () => {
  let renderer,
    camera,
    scene = null;
  const container = document.getElementById('container');
  const clock = new THREE.Clock();
  let r = 10;
  let pointLight;
  let controls;
  let startTime, time;
  let cube;

  initialize();

  async function initialize() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({
      antialias: true // to get smoother output
    });
    renderer.setClearColor(0x3b3b3b);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // create a camera in the scene
    camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );

    addCube();

    controls = new OrbitControls(camera);
    scene.add(camera);
    camera.position.z = 5;
    controls.update();

    // and then just look at it!
    camera.lookAt(scene.position);
    controls.update();

    // add some lightz
    // var ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
    // scene.add( ambientLight );

    // pointLight = new THREE.PointLight( 0x42AFEF, THREE.Vector3(0, 0, 0) );
    // scene.add( pointLight );

    animate();
  }

  function addCube() {
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    const uniforms = {
      time: {
        type: 'f',
        value: 0
      },
      size: {
        type: 'f',
        value: 300
      }
    };
    const shaderMaterialParams = {
      uniforms: uniforms,
      vertexShader: vertexShader1,
      fragmentShader: fragmentShader1
    };
    const customMaterial = new THREE.ShaderMaterial(shaderMaterialParams);

    cube = new THREE.Mesh(geometry, customMaterial);
    scene.add(cube);
  }

  function normalize(x, fromMin, fromMax) {
    let totalRange;

    x = Math.abs(x);
    totalRange = Math.abs(fromMin) + Math.abs(fromMax);
    // now we can map out the range from 0 to the totalRange and get a normalized (0 - 1) value
    return x / totalRange;
  }

  function animate() {
    requestAnimationFrame(animate);
    // updateDougPoints();

    time = performance.now() / 1000;

    cube.material.uniforms.time.value = time;

    render();
  }

  function render() {
    var delta = clock.getDelta();
    let angle = (((delta * 1000) / 10) * Math.PI) / 2 - 1.5;

    renderer.render(scene, camera);

    controls.update();
  }
});
function onDocumentMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // console.log('mouse:  ', mouse);
}
