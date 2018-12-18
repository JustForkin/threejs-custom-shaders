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



    load in that main object
    let object = await PromisedLoad.GetGLTF(modelUrl);
    
    now to set up our scene
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
          value: 3
        },
        scale: {
          type: 'f',
          value: 1
        }
      };
      const customUniforms = THREE.UniformsUtils.merge([pointsMaterialShader, uniforms]);
      const shaderMaterialParams = {
        uniforms: customUniforms,
        vertexShader: vertexShader1,
        fragmentShader: fragmentShader1//pointsMaterialShader.fragmentShader,
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
