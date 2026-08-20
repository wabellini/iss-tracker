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
      uShowCityLights: { value: 1.0 },
      uShowTerminator: { value: 1.0 },
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
      uniform float uShowCityLights;
      uniform float uShowTerminator;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldNormal;
      varying vec3 vViewPosition;

      void main() {
        // Sample textures
        vec3 rawDay = texture2D(uDayTexture, vUv).rgb;
        vec3 nightLights = texture2D(uNightTexture, vUv).rgb;
        float specularMask = texture2D(uSpecularTexture, vUv).r;

        // Normal and Sun illumination vector
        vec3 normal = normalize(vWorldNormal);
        vec3 sunDir = normalize(uSunDirection);
        float sunDot = dot(normal, sunDir);

        // Day factor with smooth physical twilight gradient
        float dayFactor = smoothstep(-0.12, 0.18, sunDot);

        // 1. RADIANT & VIBRANT DAYTIME LIGHTING
        // Specular Sun reflection glint on water
        vec3 viewDir = normalize(vViewPosition);
        vec3 halfDir = normalize(sunDir + viewDir);
        float specAngle = max(dot(normalize(vNormal), halfDir), 0.0);
        float specular = pow(specAngle, 32.0) * specularMask * 2.5 * dayFactor;
        vec3 sunSpecularColor = vec3(1.0, 0.98, 0.94) * specular;

        // Enhance daytime vibrancy, rich blue oceans, and lush continents
        vec3 vibrantDay = pow(rawDay, vec3(0.92)) * 1.65;
        float sunDirect = max(sunDot, 0.0);
        float sunIntensity = pow(sunDirect, 0.72) * 1.45 + 0.42;
        vec3 litDay = vibrantDay * sunIntensity + sunSpecularColor;

        // 2. GOLDEN-AMBER TWILIGHT SUNSET/SUNRISE TRANSITION LINE (TERMINATOR)
        float twilightBand = smoothstep(-0.16, 0.02, sunDot) * smoothstep(0.20, 0.02, sunDot);
        vec3 twilightGlow = vec3(1.0, 0.52, 0.16) * twilightBand * 0.55 * uShowTerminator;

        // 3. DEEP NIGHTTIME WITH SPARKLING CITY LIGHTS
        // Subtle ambient starlight on dark landmasses for silhouette recognition
        vec3 nightLandAmbient = rawDay * vec3(0.06, 0.09, 0.14) * 1.2;
        vec3 nightOceanAmbient = vec3(0.015, 0.025, 0.05);
        vec3 nightTerrain = mix(nightLandAmbient, nightOceanAmbient, specularMask);

        // Vibrant golden city lights
        vec3 nightCities = nightLights * vec3(1.4, 1.2, 0.85) * 3.4 * uShowCityLights;

        vec3 litNight = nightTerrain + nightCities;

        // 4. FINAL COMPOSITION
        vec3 finalSurface = mix(litNight, litDay, dayFactor) + twilightGlow;

        gl_FragColor = vec4(finalSurface, 1.0);
      }
    `,
  });
}
