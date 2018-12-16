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
import * as dat from 'dat.gui';

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
  let rotSpeed = new THREE.Vector3(0.005, 0.003, 0.0);
  let axesHelper;
  let uniforms;

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

    axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

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
    uniforms = {
      time: {
        type: 'f',
        value: 0
      },
      materialColor: {
        type: 'v3f',
        value: new THREE.Vector3(1.0, 0.0, 0.0)
      },
      ambientLightColor: {
        type: 'v3f',
        value: new THREE.Vector3(0.0, 0.0, 1.0)
      },
      ambientLightStrength: {
        type: 'f',
        value: 0.3
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

    time = performance.now() / 1000;

    cube.material.uniforms.time.value = time;
    // cube.material.uniforms.materialColor = uniforms.materialColor;
    // cube.material.uniforms.ambientLightColor = uniforms.ambientLightColor;
    // cube.material.uniforms.ambientLightStrength = uniforms.ambientLightStrength;

    cube.rotation.x += rotSpeed.x;
    cube.rotation.y += rotSpeed.y;

    render();
  }

  function render() {
    renderer.render(scene, camera);

    controls.update();
  }

  /*********************************************** */
  // DAT.GUI Related Stuff
  /*********************************************** */
  // Options to be added to the GUI

  /**
   * 
   * 
var params = {
    color: 0xff00ff
};

var gui = new dat.GUI();

var folder = gui.addFolder( 'MATERIAL' );

folder.addColor( params, 'color' )
      .onChange( function() { 
        cube.material.color.set( params.color ); 
      } );

folder.open();
   */

  var options = {
    velx: 0,
    vely: 0,
    rotSpeed: rotSpeed,
    materialColor: uniforms.materialColor.value.toArray(),
    ambientLightColor: uniforms.ambientLightColor.value.toArray(),
    ambientLightStrength: uniforms.ambientLightStrength.value,
    stop: function() {
      this.rotSpeed.x = 0;
      this.rotSpeed.y = 0;
    },
    reset: function() {
      this.rotSpeed.x = 0.1;
      this.rotSpeed.y = 0.1;
      camera.position.z = 75;
      camera.position.x = 0;
      camera.position.y = 0;
      cube.scale.x = 1;
      cube.scale.y = 1;
      cube.scale.z = 1;
      cube.material.wireframe = true;
    }
  };

  let gui = new dat.GUI();

  let rotation = gui.addFolder('Rotation');
  rotation
    .add(options.rotSpeed, 'x', -0.02, 0.02)
    .name('X')
    .listen();
  rotation
    .add(options.rotSpeed, 'y', -0.02, 0.02)
    .name('Y')
    .listen();
  rotation.open();

  let uniformsGUI = gui.addFolder('Uniforms');
  uniformsGUI
    .addColor(options, 'materialColor')
    .onChange(function(value) {
      // console.log('value:  ', value);
      // cube.material.uniformsNeedUpdate = true;
      cube.material.uniforms.materialColor.value.x = value[0] / 255;
      cube.material.uniforms.materialColor.value.y = value[1] / 255;
      cube.material.uniforms.materialColor.value.z = value[2] / 255;
    })
    .name('materialColor')
    .listen();
  uniformsGUI.addColor(options, 'ambientLightColor').onChange(function(value) {
    cube.material.uniforms.ambientLightColor.value.x = value[0] / 255;
    cube.material.uniforms.ambientLightColor.value.y = value[1] / 255;
    cube.material.uniforms.ambientLightColor.value.z = value[2] / 255;
  });
  uniformsGUI
    .add(options, 'ambientLightStrength', 0.0, 1.0)
    .onChange(function(value) {
      cube.material.uniforms.ambientLightStrength.value = value;
    });
  uniformsGUI.open();

  let box = gui.addFolder('Cube');
  box
    .add(cube.scale, 'x', 0, 3)
    .name('Width')
    .listen();
  box
    .add(cube.scale, 'y', 0, 3)
    .name('Height')
    .listen();
  box
    .add(cube.scale, 'z', 0, 3)
    .name('Length')
    .listen();
  box.add(cube.material, 'wireframe').listen();
  box.open();

  gui.add(options, 'stop');
  gui.add(options, 'reset');

  /*********************************************** */
});

function onDocumentMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
