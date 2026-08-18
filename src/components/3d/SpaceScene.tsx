import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadEarthTextures } from '../../utils/textureGenerator';
import { createISS3DScene, type ISSSceneObjects } from './ISSModel3D';
import { createAtmosphereMaterial } from './AtmosphereShader';
import { createPhotometricEarthMaterial } from './EarthMaterialShader';
import {
  latLonToVector3,
  extrapolateISSPosition,
  generateOrbitTrail,
  calculateSunPosition,
} from '../../services/orbitalMath';
import type { TelemetryData, CameraMode, LayerSettings } from '../../types';

interface SpaceSceneProps {
  telemetry?: TelemetryData;
  cameraMode?: CameraMode;
  layers?: LayerSettings;
}

export const SpaceScene: React.FC<SpaceSceneProps> = ({
  telemetry,
  cameraMode = 'free',
  layers = {
    atmosphere: true,
    clouds: true,
    orbit: true,
    terminator: true,
    cityLights: true,
    laserNadir: true,
  },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const issObjectsRef = useRef<ISSSceneObjects | null>(null);
  const telemetryRef = useRef<TelemetryData | undefined>(telemetry);
  telemetryRef.current = telemetry;

  const cameraModeRef = useRef<CameraMode>(cameraMode);
  cameraModeRef.current = cameraMode;

  const layersRef = useRef<LayerSettings>(layers);
  layersRef.current = layers;

  // Scene references
  const atmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);

    // 2. Camera setup
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 2000);
    camera.position.set(0, 15, 32);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 11.2;
    controls.maxDistance = 120;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.0;

    // 5. Sun position calculation
    const sunCoords = calculateSunPosition(new Date());
    const sunPosVec = latLonToVector3(sunCoords.lat, sunCoords.lon, 60);

    const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
    sunLight.position.copy(sunPosVec);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x0c1b33, 0.35);
    scene.add(ambientLight);

    const spaceRimLight = new THREE.DirectionalLight(0x1e3a8a, 0.4);
    spaceRimLight.position.set(-sunPosVec.x, -sunPosVec.y, -sunPosVec.z);
    scene.add(spaceRimLight);

    // 6. Textures
    const textures = loadEarthTextures();

    // 7. Earth Globe Mesh with Photometric Shader
    const earthRadius = 10;
    const issOrbitRadius = 10.66;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMaterial = createPhotometricEarthMaterial(textures, sunPosVec.clone().normalize());
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    // 8. Atmosphere Rayleigh Shader Mesh (Backside halo)
    const atmosphereGeom = new THREE.SphereGeometry(earthRadius * 1.15, 64, 64);
    const atmosphereMat = createAtmosphereMaterial();
    const atmosphereMesh = new THREE.Mesh(atmosphereGeom, atmosphereMat);
    scene.add(atmosphereMesh);
    atmosphereMeshRef.current = atmosphereMesh;

    // 9. Clouds Layer Mesh
    const cloudsGeometry = new THREE.SphereGeometry(earthRadius + 0.08, 64, 64);
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: textures.clouds,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    scene.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // 10. Starfield
    const starCount = 3500;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 250 + Math.random() * 250;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const colorType = Math.random();
      if (colorType > 0.8) {
        starColors[i * 3] = 0.75;
        starColors[i * 3 + 1] = 0.88;
        starColors[i * 3 + 2] = 1.0;
      } else if (colorType > 0.65) {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.95;
        starColors[i * 3 + 2] = 0.8;
      } else {
        const brightness = 0.6 + Math.random() * 0.4;
        starColors[i * 3] = brightness;
        starColors[i * 3 + 1] = brightness;
        starColors[i * 3 + 2] = brightness;
      }
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 11. ISS 3D Objects
    const issObjects = createISS3DScene();
    issObjectsRef.current = issObjects;
    scene.add(issObjects.issGroup);
    scene.add(issObjects.nadirBeam);
    scene.add(issObjects.footprintRing);
    scene.add(issObjects.pulseRing);
    scene.add(issObjects.orbitLine);

    // Initial position
    const initialLat = telemetryRef.current?.latitude ?? 6.724;
    const initialLon = telemetryRef.current?.longitude ?? -140.032;
    const issVec = latLonToVector3(initialLat, initialLon, issOrbitRadius);
    const surfaceVec = latLonToVector3(initialLat, initialLon, earthRadius);
    issObjects.updatePosition(issVec, surfaceVec);

    const orbitPoints = generateOrbitTrail(initialLat, initialLon, issOrbitRadius, 240);
    issObjects.updateOrbitTrail(orbitPoints.map((p) => new THREE.Vector3(p.x, p.y, p.z)));

    // 12. Resize handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // 13. Animation Loop with Camera Modes & Layer Visibility
    let animationFrameId: number;
    let lastTime = performance.now();
    let currentExtrapolatedIssPos = issVec.clone();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Update Layer Visibilities
      const currentLayers = layersRef.current;
      if (atmosphereMeshRef.current) {
        atmosphereMeshRef.current.visible = currentLayers.atmosphere;
      }
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.visible = currentLayers.clouds;
        cloudsMeshRef.current.rotation.y += delta * 0.008;
      }
      if (issObjects.orbitLine) {
        issObjects.orbitLine.visible = currentLayers.orbit;
      }
      if (issObjects.nadirBeam) {
        issObjects.nadirBeam.visible = currentLayers.laserNadir;
      }

      // Pulse beacon ring animation
      if (issObjects.pulseRing) {
        const pulseScale = 1.0 + 0.35 * Math.sin(time * 0.004);
        issObjects.pulseRing.scale.set(pulseScale, pulseScale, pulseScale);
        (issObjects.pulseRing.material as THREE.MeshBasicMaterial).opacity =
          0.45 * (1.35 - (pulseScale - 1.0));
      }

      // Smooth dead-reckoning extrapolation
      const currentTelemetry = telemetryRef.current;
      if (currentTelemetry) {
        const elapsedSinceUpdate = (Date.now() - currentTelemetry.timestamp) / 1000;
        const extrapolated = extrapolateISSPosition(
          currentTelemetry.latitude,
          currentTelemetry.longitude,
          elapsedSinceUpdate,
          currentTelemetry.velocityKmH
        );

        const issPos = latLonToVector3(extrapolated.lat, extrapolated.lon, issOrbitRadius);
        const surfacePos = latLonToVector3(extrapolated.lat, extrapolated.lon, earthRadius);
        issObjects.updatePosition(issPos, surfacePos);
        currentExtrapolatedIssPos = issPos;
      }

      // Handle Camera Modes
      const mode = cameraModeRef.current;
      const targetPos = new THREE.Vector3();
      const lookAtTarget = new THREE.Vector3();

      if (mode === 'iss') {
        // Follow ISS from behind and slightly above
        const offset = currentExtrapolatedIssPos.clone().normalize().multiplyScalar(4.5);
        targetPos.copy(currentExtrapolatedIssPos).add(offset);
        lookAtTarget.copy(currentExtrapolatedIssPos);
        controls.enabled = false;
        camera.position.lerp(targetPos, 0.05);
        controls.target.lerp(lookAtTarget, 0.05);
        camera.lookAt(controls.target);
      } else if (mode === 'cupola') {
        // Looking straight down to Earth through Cupola
        targetPos.copy(currentExtrapolatedIssPos);
        lookAtTarget.set(0, 0, 0);
        controls.enabled = false;
        camera.position.lerp(targetPos, 0.05);
        controls.target.lerp(lookAtTarget, 0.05);
        camera.lookAt(controls.target);
      } else if (mode === 'north') {
        // North Pole top-down perspective
        targetPos.set(0, 34, 0.1);
        lookAtTarget.set(0, 0, 0);
        controls.enabled = false;
        camera.position.lerp(targetPos, 0.04);
        controls.target.lerp(lookAtTarget, 0.04);
        camera.lookAt(controls.target);
      } else if (mode === 'sun') {
        // View aligned with incoming sunlight
        targetPos.copy(sunPosVec).normalize().multiplyScalar(32);
        lookAtTarget.set(0, 0, 0);
        controls.enabled = false;
        camera.position.lerp(targetPos, 0.04);
        controls.target.lerp(lookAtTarget, 0.04);
        camera.lookAt(controls.target);
      } else {
        // Free OrbitControls
        controls.enabled = true;
        controls.update();
      }

      renderer.render(scene, camera);
    };

    animate(performance.now());

    // 14. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update orbit line when telemetry changes
  useEffect(() => {
    if (telemetry && issObjectsRef.current) {
      const orbitPoints = generateOrbitTrail(telemetry.latitude, telemetry.longitude, 10.66, 240);
      issObjectsRef.current.updateOrbitTrail(orbitPoints.map((p) => new THREE.Vector3(p.x, p.y, p.z)));
    }
  }, [telemetry?.latitude, telemetry?.longitude]);

  return <div className="space-container" ref={containerRef} />;
};
