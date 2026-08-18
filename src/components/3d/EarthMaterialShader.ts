import * as THREE from 'three';
import type { LoadedTextures } from '../../utils/textureGenerator';

export function createPhotometricEarthMaterial(
  textures: LoadedTextures,
  sunDirection: THREE.Vector3 = new THREE.Vector3(1, 0.3, 0.6).normalize()
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uDayTexture: { value: textures.day },
      uNightTexture: { value: textures.night },
      uSpecularTexture: { value: textures.specular },
      uNormalTexture: { value: textures.normal },
      uSunDirection: { value: sunDirection },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uDayTexture;
      uniform sampler2D uNightTexture;
      uniform sampler2D uSpecularTexture;
      uniform sampler2D uNormalTexture;
      uniform vec3 uSunDirection;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewPosition;

      void main() {
        // Texture samplings
        vec3 dayColor = texture2D(uDayTexture, vUv).rgb;
        vec3 nightColor = texture2D(uNightTexture, vUv).rgb;
        float specularMask = texture2D(uSpecularTexture, vUv).r;

        // World normal & Sun angle
        vec3 normal = normalize(vNormal);
        vec3 sunDir = normalize(uSunDirection);
        float sunDot = dot(normal, sunDir);

        // Day/Night smooth twilight terminator transition
        float dayFactor = smoothstep(-0.12, 0.18, sunDot);

        // Specular Sun Reflection on Oceans (Glint / Hotspot)
        vec3 viewDir = normalize(vViewPosition);
        vec3 halfDir = normalize(sunDir + viewDir);
        float specAngle = max(dot(normal, halfDir), 0.0);
        float specular = pow(specAngle, 45.0) * specularMask * 1.8 * dayFactor;
        vec3 sunSpecularColor = vec3(1.0, 0.96, 0.88) * specular;

        // Daytime ambient & direct sunlight illumination
        vec3 litDayColor = dayColor * (max(sunDot, 0.0) * 1.1 + 0.08) + sunSpecularColor;

        // Nighttime city lights on the dark hemisphere
        vec3 litNightColor = nightColor * (1.0 - dayFactor) * 2.2;

        // Blend Day and Night
        vec3 finalColor = litDayColor * dayFactor + litNightColor;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });
}
