export default `

uniform float time;
uniform vec3 materialColor;
uniform vec3 ambientLightColor;
uniform float ambientLightStrength;
uniform vec3 customPointLightPos;

varying vec3 vNormal;
varying vec3 lightVec;

void main() {
  // convert normal to 'view' space
  vNormal           = normalMatrix * normal;
  // convert vertice position to 'view' space
  vec4 viewPos      = modelViewMatrix * vec4(position, 1.0);
  // convert customPointLightPos from 'world' space to 'view' space
  vec4 viewLightPos = viewMatrix * vec4(customPointLightPos, 1.0);
  // get the normalized vector from the vertice to the light
  lightVec          = normalize(viewLightPos.xyz - viewPos.xyz);

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position,1.0);
}
`;
