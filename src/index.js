
import 'normalize.css/normalize.css';
import './styles/index.scss';
import * as THREE from 'three';
import ScrollCam from './app/ScrollCam.js';
import PostEffects from './app/PostEffects.js';
import Hallways from './app/Hallways.js';
import {TweenMax, TimelineLite} from "gsap/TweenMax";
import OrbitControls from 'orbit-controls-es6';
import PromisedLoad from './app/PromisedLoad';

document.addEventListener("DOMContentLoaded", () => {
  let renderer, camera, scene = null;
  const container = document.getElementById('container');
  const clock = new THREE.Clock();
  const modelUrl = '/static/PreviousTests/Test2.gltf';
  let mixer = null;
  let actions = [];
  let r = 10;
  let pointLight;
  let doug, dougMesh, dougPoint, dougPointMat;
  let controls;

  initialize();

  async function initialize() {
    renderer = new THREE.WebGLRenderer({
      antialias: true,	// to get smoother output
    });
    renderer.setClearColor( 0x3b3b3b );
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
    let pointMat = new THREE.PointsMaterial({ color: 0x888888 });
    dougPoint = new THREE.Points(dougMesh.geometry, pointMat);
    dougPoint.scale.set(0.14, 0.14, 0.14);
    dougPoint.position.set(0, 2, 278);
    scene.add(dougPoint);

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
    actions[0].play();

    // we can detect when an animation has looped. There's also a 'finished' event.
    mixer.addEventListener( 'loop', function( e ) {
      console.log("Animation has looped");
    });

    // add some lightz
    // var ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
    // scene.add( ambientLight );

    pointLight = new THREE.PointLight( 0xf04040, THREE.Vector3(0, 0, 0) );
    scene.add( pointLight );

    // now we can kick off the animate/render loop
    animate();
  }

  function animate() {
    requestAnimationFrame( animate );
    render()
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
