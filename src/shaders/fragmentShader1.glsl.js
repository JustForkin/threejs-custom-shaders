export default `

uniform float time;
uniform vec3 materialColor;
uniform vec3 ambientLightColor;
uniform float ambientLightStrength;
uniform vec3 customPointLightPos;

varying vec3 vNormal;
varying vec3 lightVec;

void main() {
  float dProd = max(0.0, dot(vNormal, lightVec));
  vec3 c = mix(materialColor * dProd, ambientLightColor, ambientLightStrength);
  gl_FragColor = vec4(c, 1.0);
}
`;
