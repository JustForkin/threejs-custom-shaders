export default `

uniform float time;
uniform vec3 materialColor;
uniform vec3 ambientLightColor;
uniform float ambientLightStrength;
uniform vec3 customPointLightPos;

varying vec3 vNormal;
varying vec3 lightVec;

void main() {
  // the line below makes the normal rotate along with the cube rotation
  // vNormal = normalMatrix * normal;
  vNormal = -normal;
  lightVec = normalize(position - customPointLightPos);
 

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`;
