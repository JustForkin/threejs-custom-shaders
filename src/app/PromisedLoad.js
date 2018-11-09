import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';

// gonna let this class load in all our stuffz and promisify it all
export default class {

  static GenericLoader(loader, url, callback) {
    return new Promise((resolve, reject) => {
      loader.load(url, (object) => {
        if (callback) {
          callback(object, resolve);
        } else {
          resolve(object);
        }
      }, (progress) => {
        console.log(progress);
      }, (error) => {
        reject(error);
      });
    });
  }

  static GetTexture(url, callback) {
    let texLoader = new THREE.TextureLoader();
    return this.GenericLoader(texLoader, url, callback);
  }

  static GetObject(url, callback) {
    let jsonLoader = new THREE.ObjectLoader();
    return this.GenericLoader(jsonLoader, url, callback);
  }

  static GetGLTF(url, callback) {
    let gltfLoader = new GLTFLoader();
    return this.GenericLoader(gltfLoader, url, callback);
  }


}
