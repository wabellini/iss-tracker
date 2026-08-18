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
      varying vec3 vWorldNormal;
      varying vec3 vViewPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        
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
      varying vec3 vWorldNormal;
      varying vec3 vViewPosition;

      void main() {
        // Sample textures
        vec3 dayColor = texture2D(uDayTexture, vUv).rgb;
        vec3 nightLights = texture2D(uNightTexture, vUv).rgb;
        float specularMask = texture2D(uSpecularTexture, vUv).r;

        // Normal and Sun illumination angle
        vec3 normal = normalize(vWorldNormal);
        vec3 sunDir = normalize(uSunDirection);
        float sunDot = dot(normal, sunDir);

        // Day factor with smooth physical twilight gradient
        float dayFactor = smoothstep(-0.12, 0.15, sunDot);

        // 1. DAYTIME LIGHTING
        // Specular Sun reflection hotspot on water
        vec3 viewDir = normalize(vViewPosition);
        vec3 halfDir = normalize(sunDir + viewDir);
        float specAngle = max(dot(normalize(vNormal), halfDir), 0.0);
        float specular = pow(specAngle, 50.0) * specularMask * 1.7 * dayFactor;
        vec3 sunSpecularColor = vec3(1.0, 0.96, 0.88) * specular;

        // Enhanced continent contrast and daytime radiance
        float sunIntensity = max(sunDot, 0.0) * 1.15 + 0.06;
        vec3 litDay = dayColor * sunIntensity + sunSpecularColor;

        // 2. SUBTLE TWILIGHT SUNSET/SUNRISE TRANSITION LINE (TERMINATOR)
        // Golden-amber glow along the terminator line
        float twilightBand = smoothstep(-0.15, 0.02, sunDot) * smoothstep(0.18, 0.02, sunDot);
        vec3 twilightGlow = vec3(0.98, 0.52, 0.16) * twilightBand * 0.48;

        // 3. NIGHTTIME WITH VISIBLE CONTINENTS & CITY LIGHTS
        // Distinct ambient illumination for dark side:
        // Continents (1.0 - specularMask) reflect faint starlight/earthshine (deep blue-grey)
        // Oceans (specularMask) stay deep dark navy for clear coastline contrast
        vec3 nightLandAmbient = dayColor * vec3(0.08, 0.11, 0.17) * 1.4;
        vec3 nightOceanAmbient = vec3(0.012, 0.022, 0.045);
        vec3 nightTerrainAmbient = mix(nightLandAmbient, nightOceanAmbient, specularMask);

        // Golden glowing city lights on the dark hemisphere
        vec3 nightCities = nightLights * vec3(1.2, 1.05, 0.85) * 2.8;

        vec3 litNight = nightTerrainAmbient + nightCities;

        // 4. FINAL COLOR COMPOSITION
        vec3 finalSurface = mix(litNight, litDay, dayFactor) + twilightGlow;

        gl_FragColor = vec4(finalSurface, 1.0);
      }
    `,
  });
}
