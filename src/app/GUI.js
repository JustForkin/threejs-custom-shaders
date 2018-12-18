import * as dat from 'dat.gui';

/*********************************************** */
// DAT.GUI Related Stuff
/*********************************************** */
// Options to be added to the GUI

/**
   * 
   * 
var params = {
    color: 0xff00ff
};

var gui = new dat.GUI();

var folder = gui.addFolder( 'MATERIAL' );

folder.addColor( params, 'color' )
      .onChange( function() { 
        cube.material.color.set( params.color ); 
      } );

folder.open();
   */

function setupGUI(rotSpeed, uniforms, cube) {
  var options = {
    velx: 0,
    vely: 0,
    rotSpeed: rotSpeed,
    materialColor: uniforms.materialColor.value.toArray(),
    ambientLightColor: uniforms.ambientLightColor.value.toArray(),
    ambientLightStrength: uniforms.ambientLightStrength.value,
    customPointLightPos: {
      x: 2,
      y: 2,
      z: 2
    }
  };
  let gui = new dat.GUI();
  let rotation = gui.addFolder('Rotation');
  rotation
    .add(options.rotSpeed, 'x', -0.02, 0.02)
    .name('X')
    .listen();
  rotation
    .add(options.rotSpeed, 'y', -0.02, 0.02)
    .name('Y')
    .listen();
  rotation.open();
  let uniformsGUI = gui.addFolder('Uniforms');
  uniformsGUI
    .addColor(options, 'materialColor')
    .onChange(function(value) {
      cube.material.uniforms.materialColor.value.x = value[0] / 255;
      cube.material.uniforms.materialColor.value.y = value[1] / 255;
      cube.material.uniforms.materialColor.value.z = value[2] / 255;
    })
    .name('materialColor')
    .listen();
  uniformsGUI.addColor(options, 'ambientLightColor').onChange(function(value) {
    cube.material.uniforms.ambientLightColor.value.x = value[0] / 255;
    cube.material.uniforms.ambientLightColor.value.y = value[1] / 255;
    cube.material.uniforms.ambientLightColor.value.z = value[2] / 255;
  });
  uniformsGUI
    .add(options, 'ambientLightStrength', 0.0, 1.0)
    .onChange(function(value) {
      cube.material.uniforms.ambientLightStrength.value = value;
    });
  uniformsGUI.open();
  let customPointLightGUI = gui.addFolder('Custom Point Light');
  customPointLightGUI.add();
  let box = gui.addFolder('Cube');
  box
    .add(cube.scale, 'x', 0, 3)
    .name('Width')
    .listen();
  box
    .add(cube.scale, 'y', 0, 3)
    .name('Height')
    .listen();
  box
    .add(cube.scale, 'z', 0, 3)
    .name('Length')
    .listen();
  box.add(cube.material, 'wireframe').listen();
  box.open();
}
