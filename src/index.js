
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
      renderer.setClearColor( 0xfefefe );
      renderer.setSize( window.innerWidth, window.innerHeight );
      container.appendChild(renderer.domElement);
      controls = new OrbitControls( camera, renderer.domElement );
      controls.update();
      controls.enabled = true;

      PromisedLoad.GetGLTF('../static/josh.glb', JoshModelLoaded);

      // addSphere();

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
    time = performance.now() / 1000;
  

    if(Josh) {
      
      for(let i = 0; i < joshArr.length; i++) {
        joshArr[i].children[0].material.uniforms.mouseX.value = Math.abs(mouse.x);
        joshArr[i].children[0].material.uniforms.mouseY.value = Math.abs(mouse.y);
        joshArr[i].children[0].material.uniforms.time.value = time;
  
        joshArr[i].children[0].material.uniforms.time.needsUpdate = true;
        joshArr[i].children[0].material.uniforms.mouseX.needsUpdate = true;
        joshArr[i].children[0].material.uniforms.mouseY.needsUpdate = true;
        
        // this makes the whole piece twerk
        joshArr[i].rotation.x += i * (0.0005);
      }
      
    }
    

  }


  function addLights() {
    light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.z = 0;
    scene.add(pointLight);
  }

  function JoshModelLoaded(importedObject) {
    Josh = importedObject.scene.children[0];
    // joshMeshArr = Josh.children[0];
    
    
    for(let i = 0; i < 20; i++) {
      let newJosh = Josh.clone();
      let standardMaterialShader = THREE.ShaderLib.standard;
      let uniforms = {
        mouseX: {
          type: 'f',
          value: 0,
          needsUpdate: true,
        },
        mouseY: {
          type: 'f',
          value: 0,
          needsUpdate: true,
        },
        time: {
          type: 'f',
          value: 0,
          needsUpdate: true,
        }, 
        opacity: {
          type: 'f',
          value: 1.0,
          needsUpdate: true,
        },
        diffuse: {
          type: 'v3f',
          value: joshColors[i % joshColors.length]
        }
      };
      let customUniforms = THREE.UniformsUtils.merge([standardMaterialShader, uniforms]);
      let shaderMaterialParams = {
        uniforms: customUniforms,
        vertexShader: vertexShader1,
        fragmentShader: fragmentShader1,
        blending: THREE.SubtractiveBlending,
        transparent: true,
      };
      let scaleVal = 200 + (i * 10);

      shaderMaterialParamsArr.push(shaderMaterialParams);
      newJosh.children[0].material = new THREE.ShaderMaterial(shaderMaterialParams);

      newJosh.position.set(100, -80, -200);
      newJosh.position.x -= 100;
      newJosh.rotation.y += 185;
      newJosh.scale.set(scaleVal, scaleVal, scaleVal);
      scene.add(newJosh);

      joshArr.push(newJosh);
    }


    console.log('joshArr:  ', joshArr);
    console.log('THREE.ShaderLib:  ', THREE.ShaderLib);
    
    
    // Josh.position.set(100, -20, -200);
    // Josh.position.x -= 100;
    // Josh.rotation.y += 185;
    // Josh.scale.set(200, 200, 200);
    // joshArr.push(Josh);
    // scene.add(Josh);

    // for(let i = 0; i < TOTAL_JOSH; i++) {
    //   let newJosh = Josh.clone();
    //   // newJosh.children[0].material.transparent = true;
    //   // newJosh.children[0].material.opacity = 0.8;
    //   let newScale = 200 + (i * 2);
    //   newJosh.scale.set(newScale, newScale, newScale);
    //   joshArr.push(newJosh);
    //   scene.add(newJosh);

    // }

    
  }

});
