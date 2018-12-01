export default `
#define PHYSICAL
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;

uniform float mouseX;
uniform float mouseY;
uniform float time;

#ifndef STANDARD
	uniform float clearCoat;
	uniform float clearCoatRoughness;
#endif

varying vec3 vViewPosition;
varying vec3 vNormal;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <cube_uv_reflection_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <lights_physical_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>


void main() {

  #include <clipping_planes_fragment>

  vec4 diffuseColor = vec4( diffuse, opacity );
  
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  
  vec3 totalEmissiveRadiance = emissive;
  
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
  #include <emissivemap_fragment>
  
	// accumulation
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
  #include <lights_fragment_end>
  
	// modulation
  #include <aomap_fragment>
  
  vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

  // bring the funk
  // vec3 distortionOffsets;
  // float distortionTime;
  // float distortionFrequency;

  // float random (vec2 st) {
  //   return fract(sin(dot(st.xy,
  //         vec2(12.9898,78.233)))*
  //       43758.5453123);
  // }

  // float u = f * f * (3.0 - 2.0 * f ); // custom cubic curve
  // y = mix(rand(i), rand(i + 1.0), u); // using it in the interpolation

  vec3 colorA = vec3(0.149,0.141,0.82);
  vec3 colorB = vec3(0.800,0.833,1.0);
  float d = dot(vNormal, normalize(vec3(0.8)));
  // vec3 color = mix(colorA, colorB, d * diffuse.xyz);
  vec3 color = mix(vec3(0.0), diffuse.xyz, d * diffuse.xyz);

  gl_FragColor = vec4( color, opacity );

  // original
  // gl_FragColor = vec4( outgoingLight, diffuseColor.a );
  

	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}  
`;