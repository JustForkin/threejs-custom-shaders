
import 'normalize.css/normalize.css';
import './styles/index.scss';
import * as THREE from 'three';
import ScrollCam from './app/ScrollCam.js';
import PostEffects from './app/PostEffects.js';
import Hallways from './app/Hallways.js';
import {TweenMax, TimelineLite} from "gsap/TweenMax";
import OrbitControls from 'orbit-controls-es6';
import PromisedLoad from './app/PromisedLoad';
import vertexShader1 from './shaders/vertexShader1.glsl';

let renderer, scene, Josh, joshMesh, controls, camera, material, pointLight, geometry, sphere, light = null;
let nMax;
let mouse = {
  x: 0,
  y: 0,
};
const container = document.getElementById('container');
const clock = new THREE.Clock();

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
      renderer.setClearColor( 0x800 );
      renderer.setSize( window.innerWidth, window.innerHeight );
      container.appendChild(renderer.domElement);
      controls = new OrbitControls( camera, renderer.domElement );
      // camera.position.set(2.74, 78.66, 18.86);
      // controls.update();
      // camera.rotation.set(-0.39, 0.11, 0.04);
      // controls.update();
      // setInterval(() => {
      //   console.log(camera.position);
      //   console.log(camera.rotation);
      // }, 1000)
      camera.position.y += 100
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

  

    if(nMax != undefined && Josh) {
      joshMesh.geometry.setDrawRange(
        0, 
        nMax * Math.abs(mouse.x));
      
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
        value: 0
      }
    };
    const customUniforms = THREE.UniformsUtils.merge([standardMaterialShader, uniforms]);
    const shaderMaterialParams = {
      uniforms: customUniforms,
      vertexShader: vertexShader1,
      fragmentShader: standardMaterialShader.fragmentShader
    };
    joshMesh.material = new THREE.ShaderMaterial(shaderMaterialParams);



    console.log('Josh:  ', Josh);
    console.log('THREE.ShaderLib:  ', THREE.ShaderLib);
    

    

    joshMesh.material = new THREE.MeshStandardMaterial( { 
      color: "#44f",
      transparent: true,
      side: THREE.DoubleSide, 
      alphaTest: 0.5, 
      // opacity: 0.5,
    } );

    nMax = joshMesh.geometry.attributes.position.count;
    
    Josh.position.set(0, 0, 0);
    Josh.position.x -= 2;
    Josh.rotation.y += 220;
    Josh.scale.set(200, 200, 200);
    scene.add(Josh);

    // clone josh
    let foo = Josh.clone();
    foo.children[0].material = new THREE.MeshStandardMaterial( { 
      color: "#44f",
      transparent: true,
      side: THREE.DoubleSide, 
      alphaTest: 0.5, 
    } );

    foo.position.set(0, 0, 0);
    foo.position.x -= 2;
    foo.rotation.y += 220;
    foo.scale.set(250, 250, 250);
    foo.children[0].geometry.setDrawRange(190, 200);
    scene.add(foo);

    
  }

});
