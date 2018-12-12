
import 'normalize.css/normalize.css';
import './styles/index.scss';
import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6';
// import PromisedLoad from './app/PromisedLoad';
import {TweenMax, TimelineLite} from "gsap/TweenMax";
import qh from "quickhull3d";
import vertexShader1 from './shaders/vertexShader1.glsl';
import fragmentShader1 from './shaders/fragmentShader1.glsl';
import { getImageData, getPixel, radians, distance, map, onDocumentMouseMove } from './vendor/Utils.js';

let renderer, scene,controls, camera, pointLight, light = null;
let time = 0;
let mouse = {
  x: 0,
  y: 0,
};
const container = document.getElementById('container');
const clock = new THREE.Clock();
let polyhedron;
let undulate = false;
let pixelCubes = [];
let floor;
let raycaster;



window.addEventListener('mousemove', onDocumentMouseMove.bind(null, mouse));

document.addEventListener("DOMContentLoaded", () => {

  initialize().then( () => {
    // now we can kick off the animate/render loop
    animate();
  });

  async function initialize() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
      renderer = new THREE.WebGLRenderer({
        antialias: true,	// to get smoother output
      });
      renderer.setClearColor( 0xffffff );
      renderer.setSize( window.innerWidth, window.innerHeight );
      container.appendChild(renderer.domElement);
      camera.position.z += 20;
      controls = new OrbitControls( camera, renderer.domElement );
      controls.update();
      controls.enabled = true;
      let axesHelper = new THREE.AxesHelper( 50 );
      scene.add( axesHelper );
      raycaster = new THREE.Raycaster();

      addLights();

      // polyhedron = createPolyhedron();
      // scene.add(polyhedron);

      createMeshFromTexture(scene);

      addFloor();
      

  }

  function animate() {
    requestAnimationFrame( animate );

    update();

    controls.update();
    renderer.render(scene, camera);
  }

  function update() {
    // let all of our scriptz run their respective update loop
    var delta = clock.getDelta();
    time = performance.now() / 1000;

    if(undulate) {
      for(let i = 0; i < pixelCubes.length; i++) {
        pixelCubes[i].position.y += Math.sin(time + (i * 0.005)) * (0.2);
      }

    }

    updateCubes();
  }


  function addLights() {

    light = new THREE.AmbientLight( 0x404040 ); 
    scene.add( light );

    pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.z = 0;
    pointLight.position.y = 10;
    scene.add(pointLight);
  }

  function createPolyhedron() {
    let N_POINTS = 100;
    let LIMIT = 100;
    let points = [];
    let faces;
    let geometry;
    let material;
    let normal;
  
    // generate xyz coords
    for (let i = 0; i < N_POINTS; i++) {
      points.push(pointGenerator(LIMIT));
    }
  
    // quickhull: returns an array of 3 element arrays, each subarray has
    // the indices of 3 points which form a face those normal points
    // outside the polyhedron
    faces = qh(points);
  
    geometry = new THREE.Geometry();
  
    // add verts to geo
    for (let i = 0; i < points.length; i++) {
      geometry.vertices.push(new THREE.Vector3().fromArray(points[i]));
    }
  
    // create faces
    for (let i = 0; i < faces.length; i++) {
      // create position vectors for the three verts of the face
      let a = new THREE.Vector3().fromArray(points[faces[i][0]]);
      let b = new THREE.Vector3().fromArray(points[faces[i][1]]);
      let c = new THREE.Vector3().fromArray(points[faces[i][2]]);
  
      // set normal to cross product of two vectors that represent the face
      normal = new THREE.Vector3()
        .crossVectors(
          new THREE.Vector3().subVectors(b, a),
          new THREE.Vector3().subVectors(c, a)
        )
        .normalize();
  
      // add faces to geo
      geometry.faces.push(
        new THREE.Face3(faces[i][0], faces[i][1], faces[i][2], normal)
      );
    }
  
    // create material
    material = new THREE.MeshNormalMaterial({
      wireframe: false
    });
  
    // make bufferGeometry from the geometry so we can load it up into memory
    let bufferGeo = new THREE.BufferGeometry().fromGeometry(geometry);
    console.log("bufferGeo:  ", bufferGeo);
    console.log("geometry:  ", geometry);
  
    // create Object3d
    polyhedron = new THREE.Mesh(bufferGeo, material);
    console.log("polyhedron:  ", polyhedron);
    DRAW_RANGE_MAX = bufferGeo.attributes.position.count;

    return polyhedron;
  }

  function pointGenerator(LIMIT) {
    let x = -LIMIT + 2 * Math.random() * LIMIT * 0.5;
    let y = -LIMIT + 2 * Math.random() * LIMIT * 0.5;
    let z = -LIMIT + 2 * Math.random() * LIMIT * 0.5;
    return [x, y, z];
  }

  function texturePointGenerator(x, y, z, scalar) {

    return [x * scalar, y * (scalar * 0.05), z * scalar];
  }

  function createMeshFromTexture(scene) {
    let image = document.getElementById("texture");
    let imageData = getImageData(image);

    let granularity = 4;
    let scalar = 4;

    console.log('imageData.width:  ', imageData.width);
    console.log('imageData.height:  ', imageData.height);

    for (let i = 0; i < imageData.width; i += granularity) {
      for (let j = 0; j < imageData.height; j += granularity) {
        let colorAtPixel = getPixel(imageData, i, j);

        // if the color is not white, place a point there
        if (
          colorAtPixel.r !== 255 &&
          colorAtPixel.g !== 255 &&
          colorAtPixel.b !== 255
        ) {
          // points.push(texturePointGenerator(i, colorAtPixel.r * 0.5, j, scalar));
          let pointsArr = texturePointGenerator(i, colorAtPixel.r * 0.5, j, scalar);

          var geometry = new THREE.BoxGeometry( 10, 10, 10 );
          var material = new THREE.MeshBasicMaterial( { color: new THREE.Color(colorAtPixel.r / 255, colorAtPixel.g / 255, colorAtPixel.b / 255) } );
          var cube = new THREE.Mesh( geometry, material );
          cube.position.set().fromArray(pointsArr);
          cube.initialRotation = {
            x: cube.rotation.x,
            y: cube.rotation.y,
            z: cube.rotation.z
          };
          cube.isLink = i % 2 === 0 && j % 2 === 0 ? true : false;
          pixelCubes.push(cube);
          scene.add( cube );
        }
      }
    }


  }

  function addFloor() {
    let geo = new THREE.PlaneGeometry(128, 128, 32);
    let mat = new THREE.MeshBasicMaterial({
      color: 0xfff000,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });

    floor = new THREE.Mesh(geo, mat);
    floor.scale.set(4, 4, 4);
    floor.rotation.x += radians(-90);
    // floor.position.x += 128;
    floor.position.x += 128 * 2;
    // floor.position.y -= 10;
    floor.position.z += 128 * 2;

    scene.add(floor);

    
  }

  function updateCubes() {
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);

    const intersects = raycaster.intersectObjects([floor]);

    if(intersects.length) {
      const { x, z } = intersects[0].point;

      for(let i = 0; i < pixelCubes.length; i++) {
        let cube = pixelCubes[i];
        // note:  this distance calculation might not be correct!
        const mouseDistance = distance(x, z, cube.position.x, cube.position.z);
        const y = map(mouseDistance, 60, 0, 0, 100);

        TweenMax.to(cube.position, .5, {
          y: y < 1 ? 1 : y
        });

        const scaleFactor = cube.position.y / 100;
        const scale = scaleFactor < 1 ? 1 : scaleFactor;

        TweenMax.to(cube.scale, .8, {
          ease: Expo.easeOut,
          x: scale,
          y: scale,
          z: scale,
        });

    

        // TweenMax.to(cube.rotation, 1.0, {
        //   ease: Expo.easeOut,
        //   x: map(cube.position.y, -1, 1, radians(45), cube.initialRotation.x),
        //   z: map(cube.position.y, -1, 1, radians(-90), cube.initialRotation.z),
        //   y: map(cube.position.y, -1, 1, radians(90), cube.initialRotation.y),
        // });
      }
    }
  }

});
