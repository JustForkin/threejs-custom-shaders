import 'normalize.css/normalize.css';
import './styles/index.scss';
import * as THREE from 'three';
import { TweenMax, TimelineLite } from 'gsap/TweenMax';
import OrbitControls from 'orbit-controls-es6';
import vertexShader1 from './shaders/vertexShader1.glsl';
import vertexShader2 from './shaders/vertexShader2.glsl';
import fragmentShader1 from './shaders/fragmentShader1.glsl';
import * as dat from 'dat.gui';
// import { setupGUI } from './app/GUI';

let mouse = new THREE.Vector2();

window.addEventListener('mousemove', onDocumentMouseMove, false);

document.addEventListener('DOMContentLoaded', () => {
  let renderer,
    camera,
    scene = null;
  const container = document.getElementById('container');
  let controls;
  let startTime, time;
  let cube;
  let rotSpeed = new THREE.Vector3(0.005, 0.003, 0.0);
  let axesHelper;
  let uniforms;
  let customPointLight;

  initialize();

  // console.log('rotSpeed:  ', rotSpeed);
  // setupGUI();

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

    addCustomPointLight();

    controls = new OrbitControls(camera);
    scene.add(camera);
    camera.position.z = 5;
    controls.update();

    // and then just look at it!
    camera.lookAt(scene.position);
    controls.update();

    animate();
  }

  function addCube() {
    /*
      var geometry = new THREE.SphereGeometry( 5, 32, 32 );
      var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
      var sphere = new THREE.Mesh( geometry, material );
      scene.add( sphere );
    */
    // let geometry = new THREE.SphereGeometry(1, 32, 32);
    let geometry = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16);
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
      },
      customPointLightPos: {
        type: 'v3f',
        value: new THREE.Vector3(2.0, 2.0, 2.0)
      }
    };
    const shaderMaterialParams = {
      uniforms: uniforms,
      vertexShader: vertexShader2,
      fragmentShader: fragmentShader1
    };
    const customMaterial = new THREE.ShaderMaterial(shaderMaterialParams);

    cube = new THREE.Mesh(geometry, customMaterial);
    scene.add(cube);
  }

  function addCustomPointLight() {
    let geo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    let mat = new THREE.MeshBasicMaterial();
    customPointLight = new THREE.Mesh(geo, mat);
    customPointLight.position.set(2, 2, 2);
    scene.add(customPointLight);
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

  setupGUI(rotSpeed, uniforms, cube, customPointLight);
});

function setupGUI(rotSpeed, uniforms, cube, customPointLight) {
  let options = {
    velx: 0,
    vely: 0,
    rotSpeed: rotSpeed,
    materialColor: uniforms.materialColor.value.toArray(),
    ambientLightColor: uniforms.ambientLightColor.value.toArray(),
    ambientLightStrength: uniforms.ambientLightStrength.value,
    customPointLightPos: {
      x: 2,
      y: 2,
      z: 2
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

  let customPointLightGUI = gui.addFolder('Custom Point Light');
  customPointLightGUI
    .add(customPointLight.position, 'x', -5, 5)
    .onChange(function(value) {
      cube.material.uniforms.customPointLightPos.value.x = value;
    });
  customPointLightGUI
    .add(customPointLight.position, 'y', -5, 5)
    .onChange(function(value) {
      cube.material.uniforms.customPointLightPos.value.y = value;
    });
  customPointLightGUI
    .add(customPointLight.position, 'z', -5, 5)
    .onChange(function(value) {
      cube.material.uniforms.customPointLightPos.value.z = value;
    });
  customPointLightGUI.open();

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
  box
    .add(cube.position, 'x', -2, 2)
    .name('X')
    .listen();
  box
    .add(cube.position, 'y', -2, 2)
    .name('Y')
    .listen();
  box
    .add(cube.position, 'z', -2, 2)
    .name('Z')
    .listen();
  box.add(cube.material, 'wireframe').listen();
  box.open();
}

function onDocumentMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
