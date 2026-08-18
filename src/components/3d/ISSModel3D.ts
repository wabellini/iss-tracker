import * as THREE from 'three';

export interface ISSSceneObjects {
  issGroup: THREE.Group;
  nadirBeam: THREE.Line;
  footprintRing: THREE.Mesh;
  pulseRing: THREE.Mesh;
  orbitLine: THREE.Line;
  updateOrbitTrail: (points: THREE.Vector3[]) => void;
  updatePosition: (issPosition: THREE.Vector3, surfacePosition: THREE.Vector3) => void;
}

export function createISS3DScene(): ISSSceneObjects {
  const issGroup = new THREE.Group();

  // Materials
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 0.85,
    roughness: 0.25,
  });

  const moduleMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.6,
    roughness: 0.35,
  });

  const solarPanelMaterial = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x082f49,
    emissiveIntensity: 0.4,
    metalness: 0.9,
    roughness: 0.15,
    side: THREE.DoubleSide,
  });

  const radiatorMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.4,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });

  // 1. Central Truss Structure (Integrated Truss Structure - ITS)
  const trussGeometry = new THREE.BoxGeometry(1.6, 0.04, 0.04);
  const trussMesh = new THREE.Mesh(trussGeometry, metalMaterial);
  issGroup.add(trussMesh);

  // 2. Pressurized Habitation & Lab Modules (Zvezda, Zarya, Destiny, Unity, Harmony)
  const mainModuleGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 16);
  const mainModule = new THREE.Mesh(mainModuleGeom, moduleMaterial);
  mainModule.rotation.x = Math.PI / 2;
  issGroup.add(mainModule);

  const forwardLabGeom = new THREE.CylinderGeometry(0.055, 0.055, 0.35, 16);
  const forwardLab = new THREE.Mesh(forwardLabGeom, moduleMaterial);
  forwardLab.rotation.x = Math.PI / 2;
  forwardLab.position.set(0, 0, 0.35);
  issGroup.add(forwardLab);

  const aftModuleGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16);
  const aftModule = new THREE.Mesh(aftModuleGeom, moduleMaterial);
  aftModule.rotation.x = Math.PI / 2;
  aftModule.position.set(0, 0, -0.35);
  issGroup.add(aftModule);

  // Cross module (Kibo & Columbus)
  const crossModuleGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16);
  const crossModule = new THREE.Mesh(crossModuleGeom, moduleMaterial);
  crossModule.rotation.z = Math.PI / 2;
  crossModule.position.set(0, 0, 0.2);
  issGroup.add(crossModule);

  // Cupola observatory dome facing Nadir (-Y or towards Earth)
  const cupolaGeom = new THREE.SphereGeometry(0.035, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const cupolaMat = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    emissive: 0x00e5ff,
    emissiveIntensity: 0.6,
    metalness: 0.9,
    roughness: 0.1,
  });
  const cupola = new THREE.Mesh(cupolaGeom, cupolaMat);
  cupola.rotation.x = Math.PI;
  cupola.position.set(0, -0.06, 0.2);
  issGroup.add(cupola);

  // 3. Solar Array Wings (8 Large Photovoltaic Panels: 4 starboard, 4 port)
  const panelGeom = new THREE.BoxGeometry(0.35, 0.005, 0.16);
  
  const panelPositions: Array<[number, number, number]> = [
    // Starboard (+X)
    [0.55, 0, 0.12],
    [0.55, 0, -0.12],
    [0.75, 0, 0.12],
    [0.75, 0, -0.12],
    // Port (-X)
    [-0.55, 0, 0.12],
    [-0.55, 0, -0.12],
    [-0.75, 0, 0.12],
    [-0.75, 0, -0.12],
  ];

  panelPositions.forEach(([px, py, pz]) => {
    const panel = new THREE.Mesh(panelGeom, solarPanelMaterial);
    panel.position.set(px, py, pz);
    issGroup.add(panel);
  });

  // 4. Thermal Radiators (Perpendicular)
  const radGeom = new THREE.BoxGeometry(0.2, 0.18, 0.005);
  const rad1 = new THREE.Mesh(radGeom, radiatorMaterial);
  rad1.position.set(0.25, 0.1, 0);
  issGroup.add(rad1);

  const rad2 = new THREE.Mesh(radGeom, radiatorMaterial);
  rad2.position.set(-0.25, 0.1, 0);
  issGroup.add(rad2);

  // Scale ISS model slightly so it's clearly visible against the globe
  issGroup.scale.set(0.65, 0.65, 0.65);

  // 5. Nadir Laser Beam (Line connecting ISS to Earth surface)
  const laserGeom = new THREE.BufferGeometry();
  laserGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  const laserMat = new THREE.LineBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.6,
    linewidth: 2,
    blending: THREE.AdditiveBlending,
  });
  const nadirBeam = new THREE.Line(laserGeom, laserMat);

  // 6. Ground Target / Footprint Ring on Earth surface
  const ringGeom = new THREE.RingGeometry(0.55, 0.65, 48);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const footprintRing = new THREE.Mesh(ringGeom, ringMat);

  // Pulse outer beacon ring
  const pulseGeom = new THREE.RingGeometry(0.65, 0.8, 48);
  const pulseMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const pulseRing = new THREE.Mesh(pulseGeom, pulseMat);

  // 7. 3D Orbit Trajectory Line
  const maxOrbitPoints = 300;
  const orbitGeom = new THREE.BufferGeometry();
  const orbitPositions = new Float32Array(maxOrbitPoints * 3);
  orbitGeom.setAttribute('position', new THREE.BufferAttribute(orbitPositions, 3));

  const orbitMat = new THREE.LineBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
  });
  const orbitLine = new THREE.Line(orbitGeom, orbitMat);

  // Helper to update orbit points dynamically
  const updateOrbitTrail = (points: THREE.Vector3[]) => {
    const posAttr = orbitGeom.attributes.position as THREE.BufferAttribute;
    const count = Math.min(points.length, maxOrbitPoints);
    for (let i = 0; i < count; i++) {
      posAttr.setXYZ(i, points[i].x, points[i].y, points[i].z);
    }
    orbitGeom.setDrawRange(0, count);
    posAttr.needsUpdate = true;
  };

  // Helper to update positions and orientations
  const updatePosition = (issPos: THREE.Vector3, surfacePos: THREE.Vector3) => {
    // 1. Position ISS
    issGroup.position.copy(issPos);

    // Orient ISS towards flight path & nadir to Earth center
    const upVector = issPos.clone().normalize();
    issGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), upVector);

    // 2. Update Nadir Laser vertices
    const laserPos = laserGeom.attributes.position as THREE.BufferAttribute;
    laserPos.setXYZ(0, issPos.x, issPos.y, issPos.z);
    laserPos.setXYZ(1, surfacePos.x, surfacePos.y, surfacePos.z);
    laserPos.needsUpdate = true;

    // 3. Update Footprint Ring (positioned slightly above radius to avoid z-fighting)
    const ringPos = surfacePos.clone().multiplyScalar(1.002);
    footprintRing.position.copy(ringPos);
    footprintRing.lookAt(surfacePos.clone().multiplyScalar(2));

    pulseRing.position.copy(ringPos);
    pulseRing.lookAt(surfacePos.clone().multiplyScalar(2));
  };

  return {
    issGroup,
    nadirBeam,
    footprintRing,
    pulseRing,
    orbitLine,
    updateOrbitTrail,
    updatePosition,
  };
}
