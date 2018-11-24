export default `
uniform float timeDelta;

// varying vec3 vNormal;
// varying vec3 vViewPosition;

void main() {
  vec3 p = position;
  float dist = distance(vec3(0.0, 0.0, 0.0), p);

  // p.x += cos(timeDelta * .001 + dist * .5);
  vec4 modelViewPosition = modelViewMatrix * vec4(p, 1.0);
  // vViewPosition = -modelViewPosition.xyz;
  gl_Position = projectionMatrix * modelViewPosition;
  // vNormal = normalMatrix * normal;
}
`;