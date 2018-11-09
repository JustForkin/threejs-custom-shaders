import PromisedLoad from './PromisedLoad.js';
import DoublyCircularLinkedList from './DoublyCircularLinkedList.js';
import BoxCollision from './BoxCollision.js';
import Reflector from '../vendor/Reflector.js';
import * as THREE from 'three';

export default class {
  constructor() {
    this.scene = null;
    this.sceneLoaded = false;
    this.mixer = null;
    this.actions = [];
    this.boxColliders = [];
    this.scrollCam = null;
    this.collidersSet = false;
    this.hallList = new DoublyCircularLinkedList();
    this.currentHall = null;
  }

  setupColliders(scrollCam) {
    this.scrollCam = scrollCam;
    this.scrollCam.camera.addEventListener("finished", (event) => {
      if (event.message.direction) {
        // means we were last scrolling in reverse direction
        this.scrollCam.cameraGoal = this.currentHall.prev.value.position.z;
      } else {
        this.scrollCam.cameraGoal = this.currentHall.next.value.position.z;
      }
      this.scrollCam.waitingForGoal = true;
    });
    this.collidersSet = true;
  }

  async setupScene(modelUrl) {
    // load in that main object
    let object = await PromisedLoad.GetObject(modelUrl);

    // figure out if model already has a scene that we can use
    if (object.hasOwnProperty("scene")) {
      this.scene = object;
      return;
    }
    if (object.hasOwnProperty("type")) {
      if (object.type === "Scene") {
        this.scene = object;
      } else {
        this.scene = new THREE.Scene();
        this.scene.add(object);
      }
    }
    // only set up animations if it's got it
    if (object.hasOwnProperty('animations')) {
      this.setupAnimMixer(object);
    }
    this.createHallways();
    this.sceneLoaded = true;
    return this.scene;
  }

  setupAnimMixer(object) {
    // The mixer controls your ActionClips, and lets you do animation timeline stuff
    this.mixer = new THREE.AnimationMixer(this.scene);

    // ActionClips are what let you define settings for animations, and play/stop them
    object.animations.forEach((anim, index) => {
      this.actions.push(this.mixer.clipAction(anim));
      this.actions[index].play();
    });

    // we can detect when an animation has looped. There's also a 'finished' event.
    this.mixer.addEventListener( 'loop', function( e ) {
      console.log("Animation has looped");
    });
    return this.mixer;
  }

  createHallways() {
    // look for the original hallway we added
    let hallway = this.scene.getObjectByName("Blockout_Geo");

    // add it to our circular linkedlist
    this.currentHall = this.hallList.append( hallway );

    this.currentHall.value.traverse((node) => {
      if (node.isMesh) {
        node.material.blending = THREE.NormalBlending;
        node.material = new THREE.MeshPhongMaterial( { color: 0x333333, specular: 0x111111, shininess: 50, flatShading: true } );
        node.castShadow = true;
      }
    });

    // I tried to make a reflector, but failed
    var geometry = new THREE.CircleBufferGeometry( 40, 64 );
    var groundMirror = new Reflector( geometry, {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0x777777,
      recursion: 1
    } );
    groundMirror.geometry.scale(10, 10, 10);
    groundMirror.position.set(0, 0, 3);
    groundMirror.rotateX( - Math.PI / 2 );

    this.scene.add( groundMirror );

    // add some lightz
    var ambientLight = new THREE.AmbientLight( 0x111111, 2 ); // soft white light
    this.scene.add( ambientLight );

    // create the other hallways
    for (var hallIdx = 0; hallIdx < 3; hallIdx++ ) {
      var hallNode = this.createHallNode(hallway);

      // spawn a box in the hallway
      // we'll use it to spawn its neighboring hallways upon collision
      this.boxColliders.push(this.createBoxCollider( hallNode, false ));
    }

    // set up our current hallway, now that we're done cloning it
    this.boxColliders.push(this.createBoxCollider(this.currentHall, false));

  }

  createHallNode(original) {
    let hallNode = this.hallList.append( original.clone() );

    // hide it below the starting scene
    hallNode.value.position.set(0, -50, 0);
    this.scene.add(hallNode.value);
    return hallNode;
  }

  createBoxCollider(hallwayNode, visible) {
    let collider = new BoxCollision(1, 1, 1, visible);

    // this hallway downscaled a ton, so compensate for that
    collider.object.geometry.scale(100, 100, 100);
    collider.object.position.set(0, 0, -300);
    // parent the box to this hallway
    hallwayNode.value.add( collider.object );

    // set up the collision listener, and let it keep a reference to this hallway
    collider.hallway = hallwayNode;
    this.spawnNeighborHallways = this.spawnNeighborHallways.bind(this);
    collider.object.addEventListener("enter", this.spawnNeighborHallways);
    return collider;
  }

  spawnNeighborHallways(event) {
    // get the hallway that this collider is in
    this.currentHall = event.message.collider.hallway;

    // spawn its neighbor in front
    this.moveHallway(
      this.currentHall.next.value,
      this.currentHall.value.position.clone(),
      new THREE.Vector3(0, 0, 25)
    );

    // then spawn its neighbor behind it
    this.moveHallway(
      this.currentHall.prev.value,
      this.currentHall.value.position.clone(),
      new THREE.Vector3(0, 0, -25)
    );
  }

  moveHallway(hallway, relativePosition, offset) {
    hallway.position.addVectors(
      relativePosition,
      offset
    );
  }

  update() {
    if (!this.sceneLoaded && !this.collidersSet) return;
    if (this.boxColliders.length > 0) {
      // TODO: Maybe only have it check the currentHall's previous, current, next colliders?
      for (var colliderIndex = 0; colliderIndex < this.boxColliders.length; colliderIndex++) {
        this.boxColliders[colliderIndex].checkCollision(this.scrollCam.camera);
      }
    }
  }
}
