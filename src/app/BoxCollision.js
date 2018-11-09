import { BoxGeometry, MeshBasicMaterial, Mesh, EventDispatcher, Vector3} from 'three';

export default class {
  constructor(width, height, depth, visible) {
    // create a cube that we'll use for collision detection
    let colliderGeo = new BoxGeometry(width, height, depth);
    let colliderMat = new MeshBasicMaterial( {color: 0x00ff00} );
    this.object = new Mesh( colliderGeo, colliderMat );
    this._colliding = false;
    this.object.visible = visible;
    EventDispatcher.call( this.object );
  }

  checkCollision(objToCheck) {
    let _colliderPos = new Vector3(0, 0, 0);
    this.object.getWorldPosition(_colliderPos);
    let colliderDistance = objToCheck.position.distanceTo(_colliderPos);

    if (colliderDistance <= 5) {
      if (!this._colliding) {
        this.object.dispatchEvent({
          type: "enter",
          message: {
            distance: colliderDistance,
            collider: this
          }
        });
      }
      this._colliding = true;
    } else {
      if (this._colliding) {
        this.object.dispatchEvent({
          type: "exit",
          message: {
            distance: colliderDistance,
            collider: this
          }
        });
      }
      this._colliding = false;
    }
  }
}
