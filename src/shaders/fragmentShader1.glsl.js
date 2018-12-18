export default `

uniform float time;
uniform vec3 materialColor;
uniform vec3 ambientLightColor;
uniform float ambientLightStrength;
uniform vec3 customPointLightPos;

void main() {
  vec3 c = mix(materialColor, ambientLightColor, ambientLightStrength);
  gl_FragColor = vec4(c, 1.0);
}
`;
