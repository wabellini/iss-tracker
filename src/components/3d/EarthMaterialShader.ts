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
        float dayFactor = smoothstep(-0.14, 0.18, sunDot);

        // 1. DAYTIME VIBRANT LIGHTING
        // Specular Sun reflection hotspot on water
        vec3 viewDir = normalize(vViewPosition);
        vec3 halfDir = normalize(sunDir + viewDir);
        float specAngle = max(dot(normalize(vNormal), halfDir), 0.0);
        float specular = pow(specAngle, 36.0) * specularMask * 2.2 * dayFactor;
        vec3 sunSpecularColor = vec3(1.0, 0.98, 0.92) * specular;

        // Bright, clear daytime radiance
        float sunIntensity = max(sunDot, 0.0) * 1.35 + 0.32;
        vec3 litDay = dayColor * sunIntensity + sunSpecularColor;

        // 2. SUBTLE TWILIGHT SUNSET/SUNRISE TRANSITION LINE (TERMINATOR)
        float twilightBand = smoothstep(-0.16, 0.02, sunDot) * smoothstep(0.20, 0.02, sunDot);
        vec3 twilightGlow = vec3(1.0, 0.54, 0.18) * twilightBand * 0.48;

        // 3. NIGHTTIME WITH DISTINCT CONTINENTS & CITY LIGHTS
        // Continents on dark side receive soft blue-grey ambient starlight
        vec3 nightLandAmbient = dayColor * vec3(0.18, 0.22, 0.32) * 1.6;
        vec3 nightOceanAmbient = vec3(0.02, 0.038, 0.07);
        vec3 nightTerrain = mix(nightLandAmbient, nightOceanAmbient, specularMask);

        // Vibrant golden city lights on landmasses
        vec3 nightCities = nightLights * vec3(1.3, 1.15, 0.9) * 3.0;

        vec3 litNight = nightTerrain + nightCities;

        // 4. FINAL COLOR COMPOSITION
        vec3 finalSurface = mix(litNight, litDay, dayFactor) + twilightGlow;

        gl_FragColor = vec4(finalSurface, 1.0);
      }
    `,
  });
}
