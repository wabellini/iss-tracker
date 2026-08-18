import * as THREE from 'three';
import type { OrbitPoint } from '../types';

export const EARTH_RADIUS_KM = 6371;
export const ISS_INCLINATION_DEG = 51.64;
export const ISS_PERIOD_MINUTES = 92.68;

/**
 * Converts Geodetic Latitude and Longitude to 3D Cartesian coordinates (Three.js space)
 * Earth radius in 3D scene is typically 10 units.
 */
export function latLonToVector3(
  latDeg: number,
  lonDeg: number,
  radius: number = 10
): THREE.Vector3 {
  const latRad = (latDeg * Math.PI) / 180;
  const lonRad = (lonDeg * Math.PI) / 180;

  // Standard Three.js equirectangular UV sphere orientation
  const x = -radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);

  return new THREE.Vector3(x, y, z);
}

/**
 * Converts a 3D Cartesian vector back to Latitude and Longitude
 */
export function vector3ToLatLon(vec: THREE.Vector3): { lat: number; lon: number } {
  const radius = vec.length();
  if (radius === 0) return { lat: 0, lon: 0 };

  const latRad = Math.asin(vec.y / radius);
  const lonRad = Math.atan2(vec.z, -vec.x);

  return {
    lat: (latRad * 180) / Math.PI,
    lon: (lonRad * 180) / Math.PI,
  };
}

/**
 * Computes great-circle distance (Haversine) plus altitude difference in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  altKm: number = 420
): number {
  const R = EARTH_RADIUS_KM;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const groundDistance = R * c;

  // 3D Euclidean distance considering altitude
  return Math.round(Math.sqrt(groundDistance * groundDistance + altKm * altKm));
}

/**
 * Extrapolates ISS position smoothly at 60 FPS (dead-reckoning) between API polling intervals
 */
export function extrapolateISSPosition(
  lastLat: number,
  lastLon: number,
  elapsedSeconds: number,
  velocityKmH: number = 27575
): { lat: number; lon: number } {
  // Speed in km/s (approx 7.66 km/s)
  const speedKmS = velocityKmH / 3600;
  const orbitCircumferenceKm = 2 * Math.PI * (EARTH_RADIUS_KM + 420);
  const degTravelled = (speedKmS * elapsedSeconds / orbitCircumferenceKm) * 360;

  // Longitudinal progression (orbital motion + Earth's rotation)
  const lonShift = degTravelled;
  const newLon = ((lastLon + lonShift + 180) % 360) - 180;

  // Latitudinal sinusoidal oscillation based on inclination
  const inclinationRad = (ISS_INCLINATION_DEG * Math.PI) / 180;
  // Calculate current orbital phase angle
  const currentPhase = Math.asin(Math.min(1, Math.max(-1, lastLat / (ISS_INCLINATION_DEG))));
  const deltaPhase = (degTravelled * Math.PI) / 180;
  const newLat = (inclinationRad * 180 / Math.PI) * Math.sin(currentPhase + deltaPhase);

  return {
    lat: Math.max(-ISS_INCLINATION_DEG, Math.min(ISS_INCLINATION_DEG, newLat)),
    lon: newLon,
  };
}

/**
 * Generates an array of 3D points forming the ISS orbital trajectory loop
 */
export function generateOrbitTrail(
  currentLat: number,
  currentLon: number,
  orbitRadius3D: number = 10.65,
  pointCount: number = 180
): OrbitPoint[] {
  const points: OrbitPoint[] = [];

  // Find approximate current orbit phase
  const currentPhase = Math.asin(Math.max(-0.999, Math.min(0.999, currentLat / ISS_INCLINATION_DEG)));

  for (let i = 0; i <= pointCount; i++) {
    const progress = i / pointCount;
    // Cover 1.5 full orbits (past and future)
    const angleOffset = (progress - 0.3) * 2 * Math.PI * 1.5;
    const phase = currentPhase + angleOffset;

    const lat = ISS_INCLINATION_DEG * Math.sin(phase);
    // Earth rotation adjustment (-23.17 deg per orbit)
    const earthRotationOffset = (angleOffset / (2 * Math.PI)) * 23.17;
    const lon = ((currentLon + (angleOffset * 180 / Math.PI) - earthRotationOffset + 180) % 360) - 180;

    const vec = latLonToVector3(lat, lon, orbitRadius3D);
    points.push({
      lat,
      lon,
      alt: 420,
      x: vec.x,
      y: vec.y,
      z: vec.z,
    });
  }

  return points;
}

/**
 * Calculates the subsolar point (lat, lon) for a given Date
 */
export function calculateSunPosition(date: Date = new Date()): { lat: number; lon: number } {
  const startOfYear = new Date(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

  // Solar declination
  const declinationDeg = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));

  // Solar longitude from UTC time
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const lonDeg = -((utcHours - 12) * 15);

  return {
    lat: declinationDeg,
    lon: ((lonDeg + 180) % 360) - 180,
  };
}

/**
 * Calculates day/night solar terminator coordinates for 2D equirectangular maps
 */
export function calculateSolarTerminator(
  date: Date = new Date(),
  numPoints: number = 180
): Array<[number, number]> {
  const sun = calculateSunPosition(date);
  const sunLatRad = (sun.lat * Math.PI) / 180;
  const sunLonRad = (sun.lon * Math.PI) / 180;

  const points: Array<[number, number]> = [];

  for (let i = 0; i <= numPoints; i++) {
    const lonDeg = -180 + (360 * i) / numPoints;
    const lonRad = (lonDeg * Math.PI) / 180;
    const deltaLon = lonRad - sunLonRad;

    let latRad = 0;
    if (Math.abs(Math.tan(sunLatRad)) > 0.0001) {
      latRad = Math.atan(-Math.cos(deltaLon) / Math.tan(sunLatRad));
    }

    const latDeg = (latRad * 180) / Math.PI;
    points.push([latDeg, lonDeg]);
  }

  return points;
}

/**
 * Checks whether the ISS is currently in daylight or Earth's shadow
 */
export function isPositionSunlit(lat: number, lon: number, date: Date = new Date()): boolean {
  const sun = calculateSunPosition(date);
  const p1 = latLonToVector3(lat, lon, 1);
  const pSun = latLonToVector3(sun.lat, sun.lon, 1);

  // Dot product between ISS normal and Sun direction (> -0.1 allows for orbital altitude horizon)
  const dot = p1.dot(pSun);
  return dot > -0.12;
}
