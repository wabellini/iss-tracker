import * as THREE from 'three';

export interface LoadedTextures {
  day: THREE.Texture;
  night: THREE.Texture;
  specular: THREE.Texture;
  normal: THREE.Texture;
  clouds: THREE.Texture;
}

export function loadEarthTextures(): LoadedTextures {
  const loader = new THREE.TextureLoader();
  
  const day = loader.load('/textures/earth_day_4096.jpg');
  day.colorSpace = THREE.SRGBColorSpace;

  const night = loader.load('/textures/earth_night_4096.jpg');
  night.colorSpace = THREE.SRGBColorSpace;

  const specular = loader.load('/textures/earth_specular_2048.jpg');
  
  const normal = loader.load('/textures/earth_normal_2048.jpg');

  const clouds = loader.load('/textures/earth_clouds_1024.png');
  clouds.colorSpace = THREE.SRGBColorSpace;
  clouds.wrapS = THREE.RepeatWrapping;
  clouds.wrapT = THREE.ClampToEdgeWrapping;

  return { day, night, specular, normal, clouds };
}
