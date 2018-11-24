export default `

uniform float timeDelta;

void main() {
  gl_FragColor = vec4(1.0, sin(timeDelta * 0.002), 0.6, 1.0);
}
`;

