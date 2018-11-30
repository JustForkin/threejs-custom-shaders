export default `
#define PHYSICAL

uniform float mouseX;
uniform float mouseY;
uniform float time;

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif

// mat4 rotationMatrix(vec3 axis, float angle) {
//   axis = normalize(axis);
//   float s = sin(angle);
//   float c = cos(angle);
//   float oc = 1.0 - c;
  
//   return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
//               oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
//               oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
//               0.0,                                0.0,                                0.0,                                1.0);
// }

// vec3 rotate(vec3 v, vec3 axis, float angle) {
//   mat4 m = rotationMatrix(axis, angle);
//   return (m * vec4(v, 1.0)).xyz;
// }

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>

#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED

	vNormal = normalize( transformedNormal );

#endif



  vec3 transformed = vec3( position );

	#include <morphtarget_vertex>
	#include <skinning_vertex>
  #include <displacementmap_vertex>
  
  // project_vertex
  vec3 p = transformed;
  float d = distance(vec3(0.0, 0.0, 0.0), p);
  
  vec3 xTrans = (vNormal + d) * abs(sin(mouseX)) * -1.0;

  p += xTrans;


	vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );
  gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}
`;