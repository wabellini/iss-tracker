import * as THREE from 'three';

export function createAtmosphereMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        // View direction from camera
        vec3 viewDir = normalize(-vPosition);
        
        // Rayleigh Fresnel rim glow
        float intensity = pow(0.7 - dot(vNormal, viewDir), 2.2);
        
        // Deep cyan/electric blue atmospheric Rayleigh scattering
        vec3 atmosphereColor = vec3(0.0, 0.85, 1.0) * 1.4;
        
        gl_FragColor = vec4(atmosphereColor, intensity * 0.95);
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
}
