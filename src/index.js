
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
      renderer.setClearColor( 0xfee );
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
      joshMesh.material.uniforms.mouseX.value = Math.abs(mouse.x);
      joshMesh.material.uniforms.mouseY.value = Math.abs(mouse.y);
      joshMesh.material.uniforms.time.value = time;

      joshMesh.material.uniforms.time.needsUpdate = true;
      joshMesh.material.uniforms.mouseX.needsUpdate = true;
      joshMesh.material.uniforms.mouseY.needsUpdate = true;

      // for(let i = 0; i < joshArr.length; i++) {
      //   joshArr[i].rotation.y += 0.01;
      // }
      
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
    joshMesh = Josh.children[0];

    const standardMaterialShader = THREE.ShaderLib.standard;
    const uniforms = {
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
        value: 1,
        needsUpdate: true,
      },
      diffuse: {
        type: 'v3f',
        value: new THREE.Vector3(0.9, 0.1, 0.5)
      }
    };
    const customUniforms = THREE.UniformsUtils.merge([standardMaterialShader, uniforms]);
    const shaderMaterialParams = {
      uniforms: customUniforms,
      vertexShader: vertexShader1,
      fragmentShader: fragmentShader1
    };
    joshMesh.material = new THREE.ShaderMaterial(shaderMaterialParams);

    



    console.log('Josh:  ', Josh);
    console.log('THREE.ShaderLib:  ', THREE.ShaderLib);
    


    
    Josh.position.set(100, -20, -200);
    Josh.position.x -= 100;
    Josh.rotation.y += 185;
    Josh.scale.set(200, 200, 200);
    joshArr.push(Josh);
    scene.add(Josh);

    for(let i = 0; i < TOTAL_JOSH; i++) {
      let newJosh = Josh.clone();
      // newJosh.children[0].material.transparent = true;
      // newJosh.children[0].material.opacity = 0.8;
      let newScale = 200 + (i * 2);
      newJosh.scale.set(newScale, newScale, newScale);
      joshArr.push(newJosh);
      scene.add(newJosh);

    }

    
  }

});
