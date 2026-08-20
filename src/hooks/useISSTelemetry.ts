import { useState, useEffect, useRef } from 'react';
import type { TelemetryData, ISSRawData, UserCoordinates } from '../types';
import { fetchISSPosition } from '../services/issApi';
import { calculateDistanceKm, isPositionSunlit, calculateNextSunEvent } from '../services/orbitalMath';
import { getOfflineLocationName } from '../services/reverseGeo';

export function useISSTelemetry(userCoords: UserCoordinates | null, lang: 'es' | 'en' = 'es') {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    latitude: 6.724,
    longitude: -140.032,
    altitudeKm: 420.4,
    altitudeMi: 261.2,
    velocityKmH: 27575,
    velocityMph: 17134,
    mach: 22.3,
    headingDeg: 51.6,
    isSunlit: true,
    sunEventName: 'sunset',
    sunEventCountdownMinutes: 1,
    locationName: lang === 'es' ? 'Sobre Océano Pacífico Norte' : 'Over North Pacific Ocean',
    distanceToUserKm: null,
    timestamp: Date.now(),
  });

  const [rawISS, setRawISS] = useState<ISSRawData | null>(null);
  const prevPositionRef = useRef<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const updateTelemetry = async () => {
      try {
        const raw = await fetchISSPosition();
        if (!isMounted) return;

        setRawISS(raw);

        // Calculate heading
        let heading = 51.6;
        if (prevPositionRef.current) {
          const dLon = raw.longitude - prevPositionRef.current.lon;
          const dLat = raw.latitude - prevPositionRef.current.lat;
          heading = ((Math.atan2(dLon, dLat) * 180) / Math.PI + 360) % 360;
        }
        prevPositionRef.current = { lat: raw.latitude, lon: raw.longitude };

        // Speed and Mach conversions
        const velocityKmH = Math.round(raw.velocity);
        const velocityMph = Math.round(raw.velocity * 0.621371);
        const mach = Number((raw.velocity / 1234.8).toFixed(1));

        // Altitude conversions
        const altitudeKm = Number(raw.altitude.toFixed(1));
        const altitudeMi = Number((raw.altitude * 0.621371).toFixed(1));

        // Sunlit status and dynamic countdown to next sunrise / sunset
        const isSunlit = isPositionSunlit(raw.latitude, raw.longitude);
        const sunEvent = calculateNextSunEvent(raw.latitude, raw.longitude, heading, isSunlit);
        const sunEventName = sunEvent.eventName;
        const sunEventCountdownMinutes = sunEvent.countdownMinutes;

        // Geocoding location name
        const locationName = getOfflineLocationName(raw.latitude, raw.longitude, lang);

        // User distance
        let distanceToUserKm: number | null = null;
        if (userCoords) {
          distanceToUserKm = calculateDistanceKm(
            userCoords.latitude,
            userCoords.longitude,
            raw.latitude,
            raw.longitude,
            altitudeKm
          );
        }

        setTelemetry({
          latitude: raw.latitude,
          longitude: raw.longitude,
          altitudeKm,
          altitudeMi,
          velocityKmH,
          velocityMph,
          mach,
          headingDeg: heading,
          isSunlit,
          sunEventName,
          sunEventCountdownMinutes,
          locationName,
          distanceToUserKm,
          timestamp: raw.timestamp * 1000,
        });
      } catch (err) {
        console.error('Telemetry update error:', err);
      }
    };

    updateTelemetry();
    const intervalId = setInterval(updateTelemetry, 1500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [userCoords, lang]);

  return { telemetry, rawISS };
}
