
import 'normalize.css/normalize.css';
import './styles/index.scss';
import * as THREE from 'three';
import ScrollCam from './app/ScrollCam.js';
import PostEffects from './app/PostEffects.js';
import Hallways from './app/Hallways.js';
import OrbitControls from 'orbit-controls-es6';
import PromisedLoad from './app/PromisedLoad';
import vertexShader1 from './shaders/vertexShader1.glsl';
import fragmentShader1 from './shaders/fragmentShader1.glsl';

let renderer, scene, Josh, joshMesh, controls, camera, material, pointLight, geometry, sphere, light = null;
let time = 0;
let mouse = {
  x: 0,
  y: 0,
};
let ball;
const container = document.getElementById('container');
const clock = new THREE.Clock();
const TOTAL_JOSH = 10;
let joshArr = [];
let materialsArr = [];
let joshColors = [
  new THREE.Vector3(0.86, 0.29, 0.8),
  new THREE.Vector3(0.45,0.96,0.25),
  new THREE.Vector3(0.99,0.97,0.32),
  new THREE.Vector3(0.43,0.98,0.99),
  new THREE.Vector3(0.59,0.52,0.54),
  // glColor3f(0.91,0.92,0.91)
  new THREE.Vector3(0.91,0.92,0.91),
];
let shaderMaterialParamsArr = [];
let joshMeshArr = [];

window.addEventListener('mousemove', onDocumentMouseMove);

function onDocumentMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // console.log('mouse:  ', mouse);

}

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
      renderer.setClearColor( 0xf00f00 );
      renderer.setSize( window.innerWidth, window.innerHeight );
      container.appendChild(renderer.domElement);
      camera.position.z += 20;
      controls = new OrbitControls( camera, renderer.domElement );
      controls.update();
      controls.enabled = true;

      PromisedLoad.GetGLTF('../static/ball.glb', modelLoaded);

      
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
    time = performance.now() / 1000;
    let scaleVal = (Math.abs(Math.sin(time)) * 0.5) * 2;
  

    // if(ball) {
    //   ball.scale.set(scaleVal)
    // }

    // if(Josh) {
      
    //   for(let i = 0; i < joshArr.length; i++) {
    //     joshArr[i].children[0].material.uniforms.mouseX.value = Math.abs(mouse.x);
    //     joshArr[i].children[0].material.uniforms.mouseY.value = Math.abs(mouse.y);
    //     joshArr[i].children[0].material.uniforms.time.value = time;
  
    //     joshArr[i].children[0].material.uniforms.time.needsUpdate = true;
    //     joshArr[i].children[0].material.uniforms.mouseX.needsUpdate = true;
    //     joshArr[i].children[0].material.uniforms.mouseY.needsUpdate = true;
        
    //     // this makes the whole piece twerk
    //     joshArr[i].rotation.x += i * (0.0005);
    //   }
      
    // }
    

  }


  function addLights() {
    light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.z = 0;
    scene.add(pointLight);
  }

  function modelLoaded(importedObject) {
    let importedScene = importedObject.scene;
    let ballMesh = importedScene.children[0];
    let material = new THREE.MeshBasicMaterial({ 
      color: 0x2194ce,
      wireframe: true
    });
    
    ball = new THREE.Mesh(ballMesh.geometry, material);

    // ball.scale.set(100, 100, 100);
    
    scene.add(ball);
    camera.lookAt(ball.position);
    
    
    addLights();
    
    
    console.log('importedScene:  ', importedScene);
    console.log('ball:  ', ball);
    console.log('ballMesh:  ', ballMesh);
    console.log('scene:  ', scene);

    
  }

});
