export type Language = 'es' | 'en';

export interface ISSRawData {
  name: string;
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: 'daylight' | 'eclipsed';
  footprint: number;
  timestamp: number;
  daynum: number;
  solar_lat: number;
  solar_lon: number;
  units: string;
}

export interface TelemetryData {
  latitude: number;
  longitude: number;
  altitudeKm: number;
  altitudeMi: number;
  velocityKmH: number;
  velocityMph: number;
  mach: number;
  headingDeg: number;
  isSunlit: boolean;
  sunEventName: 'sunrise' | 'sunset';
  sunEventCountdownMinutes: number;
  locationName: string;
  distanceToUserKm: number | null;
  timestamp: number;
}

export interface OrbitPoint {
  lat: number;
  lon: number;
  alt: number;
  x: number;
  y: number;
  z: number;
}

export type CameraMode = 'free' | 'iss' | 'cupola' | 'north' | 'sun';

export interface LayerSettings {
  atmosphere: boolean;
  clouds: boolean;
  orbit: boolean;
  terminator: boolean;
  cityLights: boolean;
  laserNadir: boolean;
}

export interface Astronaut {
  name: string;
  craft: string;
  agency: string;
  role: string;
  country: string;
  flag: string;
  daysInSpace: number;
  imageUrl?: string;
}

export interface PassAlert {
  id: string;
  startTime: Date;
  maxElevationTime: Date;
  endTime: Date;
  durationSeconds: number;
  maxElevationDeg: number;
  apparentMagnitude: number;
  startDirection: string;
  endDirection: string;
}

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}
