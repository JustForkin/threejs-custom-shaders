
import 'normalize.css/normalize.css';
import './styles/index.scss';
import * as THREE from 'three';
import ScrollCam from './app/ScrollCam.js';
import OrbitControls from 'orbit-controls-es6';
import PromisedLoad from './app/PromisedLoad';
import qh from "quickhull3d";
import vertexShader1 from './shaders/vertexShader1.glsl';
import fragmentShader1 from './shaders/fragmentShader1.glsl';
import { getImageData, getPixel } from './vendor/Utils.js';

let renderer, scene, Josh, joshMesh, controls, camera, material, pointLight, geometry, sphere, light = null;
let time = 0;
let mouse = {
  x: 0,
  y: 0,
};
let ball;
const container = document.getElementById('container');
const clock = new THREE.Clock();
let DRAW_RANGE_MAX;
let polyhedron;
let points = [];
let faces;
let normal;
let undulate = true;
let pixelCubes = [];



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

      addLights();

      // polyhedron = createPolyhedron();
      // scene.add(polyhedron);

      createMeshFromTexture(scene);
      

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

  // from the man himself: https://github.com/mrdoob/three.js/issues/758
  function getImageData(image) {
    var canvas = document.getElementById("image-data-canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);

    image.crossOrigin = "Anonymous";
    image.setAttribute("crossOrigin", "");
    return context.getImageData(0, 0, image.width, image.height);
  }

  function getPixel(imagedata, x, y) {
    var position = (x + imagedata.width * y) * 4,
      data = imagedata.data;

    return {
      r: data[position],
      g: data[position + 1],
      b: data[position + 2],
      a: data[position + 3]
    };
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
          pixelCubes.push(cube);
          scene.add( cube );
        }
      }
    }

    console.log('points:   ', points);
    // faces = qh(points);

    // geometry = new THREE.Geometry();

    // add verts to geo
    // for(let i = 0; i < points.length; i++) {
    //   geometry.vertices.push(new THREE.Vector3().fromArray(points[i]));
    // }

    // // create faces
    // for(let i = 0; i < faces.length; i++) {
    //   // create position vectors for the three verts of the face
    //   let a = new THREE.Vector3().fromArray(points[faces[i][0]]);
    //   let b = new THREE.Vector3().fromArray(points[faces[i][1]]);
    //   let c = new THREE.Vector3().fromArray(points[faces[i][2]]);

    //   // set normal to cross product of two vectors that represent the face
    //   normal = new THREE.Vector3()
    //     .crossVectors(
    //       new THREE.Vector3().subVectors(b, a),
    //       new THREE.Vector3().subVectors(c, a)
    //     )
    //     .normalize();
  
    //   // add faces to geo
    //   geometry.faces.push(
    //     new THREE.Face3(faces[i][0], faces[i][1], faces[i][2], normal)
    //   );

    // }


    // // create material
    // material = new THREE.MeshNormalMaterial({
    //   wireframe: false
    // });
  
    // // make bufferGeometry from the geometry so we can load it up into memory
    // let bufferGeo = new THREE.BufferGeometry().fromGeometry(geometry);
    // console.log("bufferGeo:  ", bufferGeo);
    // console.log("geometry:  ", geometry);
  
    // // create Object3d
    // polyhedron = new THREE.Mesh(bufferGeo, material);
    // console.log("polyhedron:  ", polyhedron);
    // DRAW_RANGE_MAX = bufferGeo.attributes.position.count;

    // return polyhedron;
  }

});
