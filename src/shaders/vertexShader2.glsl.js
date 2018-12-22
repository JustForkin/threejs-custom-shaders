export default `

uniform float time;
uniform vec3 materialColor;
uniform vec3 ambientLightColor;
uniform float ambientLightStrength;
uniform vec3 customPointLightPos;

varying vec3 vNormal;
varying vec3 lightVec;

void main() {
//   vNormal  = normalMatrix * normal;
// lightVec = mat3(viewMatrix) * normalize(customPointLightPos - position); 
  vNormal  = normalMatrix * normal;
  // vNormal  = normal * normalMatrix;
  lightVec = mat3(viewMatrix) * normalize(customPointLightPos - position);
 

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`;
