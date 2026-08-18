import type { ISSRawData } from '../types';

const ISS_API_URL = 'https://api.wheretheiss.at/v1/satellites/25544';

// Backup simulated position if API is offline
let lastValidData: ISSRawData | null = null;
let lastFetchTime = Date.now();

export async function fetchISSPosition(): Promise<ISSRawData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(ISS_API_URL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`ISS API returned status ${response.status}`);
    }

    const data: ISSRawData = await response.json();
    lastValidData = data;
    lastFetchTime = Date.now();
    return data;
  } catch (error) {
    console.warn('Could not fetch live ISS data from API, using dead-reckoning extrapolation:', error);
    
    if (lastValidData) {
      // Extrapolate from last valid position based on 7.66 km/s orbital velocity
      const elapsedSeconds = (Date.now() - lastFetchTime) / 1000;
      const degPerSec = 360 / (92.68 * 60); // ~0.0647 degrees per second
      
      const newLon = ((lastValidData.longitude + degPerSec * elapsedSeconds + 180) % 360) - 180;
      const inclinationRad = (51.64 * Math.PI) / 180;
      const phase = (newLon * Math.PI) / 180;
      const newLat = (inclinationRad * 180 / Math.PI) * Math.sin(phase);

      return {
        ...lastValidData,
        latitude: newLat,
        longitude: newLon,
        timestamp: Math.floor(Date.now() / 1000),
      };
    }

    // Default initial mock if no data fetched yet
    const now = Math.floor(Date.now() / 1000);
    return {
      name: 'iss',
      id: 25544,
      latitude: 6.724,
      longitude: -140.032,
      altitude: 420.4,
      velocity: 27575,
      visibility: 'daylight',
      footprint: 4512.8,
      timestamp: now,
      daynum: 2460000,
      solar_lat: 12.5,
      solar_lon: -15.2,
      units: 'kilometers',
    };
  }
}
