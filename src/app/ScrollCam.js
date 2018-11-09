import * as THREE from 'three';
import Debounce from '../vendor/Debounce.js';
import Throttle from '../vendor/Throttle.js';
import ScrollSwipe from '@poeticode/scroll-swipe';

export default class {
  constructor(scene, startPosition, scrollDistanceUnits, dragDistanceUnits, speedCap) {
    // setup callback parameters
    this.scrollDistanceUnits = scrollDistanceUnits;
    this.dragDistanceUnits = dragDistanceUnits;
    this.speedCap = speedCap;

    // create a camera in the scene
    this.camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 10000 );
    this.cameraGoal;
    this.waitingForGoal = false;

    // move the camera a few units away from the object
    scene.add(this.camera);
    let cameraStartPosition = startPosition.add(scene.position);
    this.camera.position.copy( cameraStartPosition );

    // and then just look at it!
    this.camera.lookAt(new THREE.Vector3(0, startPosition.y, 0));
    this.cameraGoal = this.camera.position.z;

    // set up a debounced event for when user stops scrolling
    THREE.EventDispatcher.call( this.camera );
    this.scrollDebouncer = Debounce((direction) => {
      this.camera.dispatchEvent({
        type: "finished",
        message: {
          direction: direction
        }
      });
    }, 100);

    // set up the scroll listenin'
    this.scrollCb.bind(this);
    this.ss = new ScrollSwipe({
      target: document, // Element must be a single dom-node per ScrollSwipe Instance
      scrollSensitivity: 0, // The lower the number, the more sensitive
      touchSensitivity: 4, // The lower the number, the more senitive
      scrollPreventDefault: true, // prevent default option for scroll events
      touchPreventDefault: false, // prevent default option for touch events
      scrollCb: (data) => {
        if (!this.waitingForGoal) {
          this.scrollCb(data);
        }
        this.ss.listen();
      },  // The action you wish to perform when a scroll reacts (details below)
      touchCb: (data) => {
        if (!this.waitingForGoal) {
          this.scrollCb(data);
        }
        this.ss.listen();
      }, // The action you wish to perform when a touch reacts (details below)
      dragCb: (data) => {
        if (!this.waitingForGoal) {
          let units = data.y * this.dragDistanceUnits;
          this.cameraGoal += units;
        }
      }
    });
  }

  /**
   * @param  {Object} data - returns the following
   * startEvent - Event that triggered this action
   * lastEvent - Last Event at the end of action
   * scrollPending - state of instance's scrollPending property (will always come back true after a successful event)
   * direction - 'VERTICAL' || 'HORIZONTAL' for mapping vertical/horizontal actions from the event;
   * intent - 0 || 1  for mapping up/down && left/right actions from the event
   */

  scrollCb(data) {
    if (data.direction === "VERTICAL") {
      let direction = data.intent ? 1 : -1;
      let units = direction * this.scrollDistanceUnits;
      this.cameraGoal -= units;

      this.scrollDebouncer(data.intent);
    }
  }

  cap(val, max) {
    return val > 0 ? Math.min(val, max) : Math.max(val, -max);
  }

  min(val, min) {
    return val > 0 ? Math.max(val, min) : Math.min(val, -min);
  }

  update(delta) {
    let distance = this.cameraGoal - this.camera.position.z;
    let units = this.cap(distance * delta, this.speedCap);

    if (this.waitingForGoal && Math.abs(distance) < 0.75) {
      this.waitingForGoal = false;
    }
    this.camera.position.add(new THREE.Vector3(0, 0, units));
  }
}
