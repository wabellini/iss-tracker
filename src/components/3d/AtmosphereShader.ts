import * as THREE from 'three';

export function createAtmosphereMaterial(
  sunDirection: THREE.Vector3 = new THREE.Vector3(1, 0.3, 0.6).normalize()
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uSunDirection: { value: sunDirection },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldNormal;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vPosition = mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uSunDirection;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vWorldNormal;

      void main() {
        // View angle (Fresnel rim falloff)
        vec3 viewDir = normalize(-vPosition);
        float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.2);

        // Sun illumination factor on the atmosphere
        vec3 sunDir = normalize(uSunDirection);
        float sunDot = dot(vWorldNormal, sunDir);
        
        // Day-side bright azure/cyan scattering, fading smoothly to dark side
        float dayAtmosphere = smoothstep(-0.25, 0.35, sunDot);
        
        // Subtle golden sunset glow on the limb near the terminator
        float twilightLimb = smoothstep(-0.2, 0.05, sunDot) * smoothstep(0.3, 0.05, sunDot);
        vec3 sunsetGlow = vec3(1.0, 0.55, 0.2) * twilightLimb * 0.6;
        
        // Soft diffused cyan / azure Rayleigh atmosphere
        vec3 dayGlow = vec3(0.08, 0.65, 1.0) * (dayAtmosphere * 0.95 + 0.12);
        
        vec3 finalColor = (dayGlow + sunsetGlow) * fresnel * 1.6;
        float alpha = fresnel * (dayAtmosphere * 0.85 + 0.2);

        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
}
