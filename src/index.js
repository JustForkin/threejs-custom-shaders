
import 'normalize.css/normalize.css';
import './styles/index.scss';
import * as THREE from 'three';
import ScrollCam from './app/ScrollCam.js';
import PostEffects from './app/PostEffects.js';
import Hallways from './app/Hallways.js';
import {TweenMax, TimelineLite} from "gsap/TweenMax";
import OrbitControls from 'orbit-controls-es6';
import PromisedLoad from './app/PromisedLoad';
import customVertexShader from './shaders/vertexShader1.glsl';
import customFragmentShader from './shaders/fragmentShader1.glsl';

let mouse = new THREE.Vector2();

window.addEventListener('mousemove', onDocumentMouseMove, false);

document.addEventListener("DOMContentLoaded", () => {
  let renderer, camera, scene = null;
  const container = document.getElementById('container');
  const clock = new THREE.Clock();
  const modelUrl = '/static/PreviousTests/Test2.gltf';
  let mixer = null;
  let actions = [];
  let r = 10;
  let pointLight;
  let doug, dougMesh, dougPoints, dougPointsMat;
  let controls;
  let startTime, timeDelta;

  initialize();

  async function initialize() {
    renderer = new THREE.WebGLRenderer({
      antialias: true,	// to get smoother output
    });
    renderer.setClearColor( 0x000000 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild(renderer.domElement);

    // create a camera in the scene
    camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );

    // load in that main object
    let object = await PromisedLoad.GetGLTF(modelUrl);
    
    // now to set up our scene
    scene = object.scene;
    doug = scene.children[2];
    dougMesh = doug.children[0];
    dougMesh.material.transparent = true;
    dougPoints = [];

    for(let i = 0; i < 5; i++) {
      console.log(THREE.ShaderLib);
      const pointsMaterialShader = THREE.ShaderLib.points;
      const uniforms = {
        timeDelta: {
          type: 'f',
          value: 0
        },
        size: {
          type: 'f',
          value: 2
        },
        scale: {
          type: 'f',
          value: 1
        },
        dougPos: {
          type: 'f',
          value: 0
        }
      };
      const customUniforms = THREE.UniformsUtils.merge([pointsMaterialShader, uniforms]);
      const shaderMaterialParams = {
        uniforms: customUniforms,
        vertexShader: customVertexShader,
        fragmentShader: customFragmentShader//pointsMaterialShader.fragmentShader,
      };
      const pointMat = new THREE.ShaderMaterial(shaderMaterialParams);
      const dp = new THREE.Points(dougMesh.geometry, pointMat);
      dp.position.set(0, 2, 278);
      dp.scale.set(0.14 + (i * 0.002), 0.14 + (i * 0.002), 0.14 + (i * 0.002));
      dp.positionScalar = Math.random() * 2 - 1;
      console.log('pointMat:  ', pointMat);

      dougPoints.push(dp);
      scene.add(dp);

      startTime = Date.now();
      timeDelta = 0;
      
    }

    controls = new OrbitControls(camera);
    scene.add(camera);
    camera.position.set(scene.position.x + 10, scene.position.y + 10, scene.position.z + 30);
    controls.update();

    // and then just look at it!
    camera.lookAt(scene.position);
    controls.update();

    // The mixer controls your ActionClips, and lets you do animation timeline stuff
    mixer = new THREE.AnimationMixer(object.scene);

    // ActionClips are what let you define settings for animations, and play/stop them
    actions.push(mixer.clipAction(object.animations[0]));
    actions[0].play();  // not sure why but this was causing the shader to glitch!

    // we can detect when an animation has looped. There's also a 'finished' event.
    mixer.addEventListener( 'loop', function( e ) {
      console.log("Animation has looped");
    });

    // add some lightz
    // var ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
    // scene.add( ambientLight );

    pointLight = new THREE.PointLight( 0xFFFFFF, 0.5 );
    scene.add( pointLight );

    animate();
  }

  function updateDougPoints() {
    for(let i = 0; i < dougPoints.length; i++) {
      let dp = dougPoints[i];

      dp.position.x += mouse.x * dp.positionScalar;

      // update shader uniform -
      dp.material.uniforms.dougPos.value = dp.position.x;
    }


  }

  function normalize(x, fromMin, fromMax) {
    let totalRange;

    x = Math.abs(x);
    totalRange = Math.abs(fromMin) + Math.abs(fromMax);
    // now we can map out the range from 0 to the totalRange and get a normalized (0 - 1) value
    return x / totalRange;
  }

  function updateDougAlpha() {
    let dougPosNormalized = normalize(dougPoints[0].position.x, -30, 30);
    dougMesh.material.opacity = 1 - Math.min(dougPosNormalized, 1); 
  }

  
  function animate() {
    requestAnimationFrame( animate );
    updateDougPoints();

    timeDelta = Date.now() - startTime;

    dougPoints[0].material.uniforms.timeDelta.value = timeDelta;
    // console.log('dougPoints[0]:  ', dougPoints[0]);

    updateDougAlpha();
    render();
  }

  function render() {
    var delta = clock.getDelta();
    let angle = ((delta * 1000) / 10) * Math.PI / 2 - 1.5;

    if (mixer != null) {
      // the mixer needs to know the delta time to update the animations
      mixer.update(delta);
    };

    renderer.render( scene, camera );

    // flickery light effect
    pointLight.position.set(r * Math.cos(angle), r * Math.sin(angle), 0);

    // slow doug rotation
    // doug.rotation.x += 0.0025;
    // doug.rotation.y += 0.0034;

    

    controls.update();
  }


});
function onDocumentMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // console.log('mouse:  ', mouse);

}