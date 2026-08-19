import { useState, useEffect } from 'react';
import type { UserCoordinates } from '../types';

export function useGeoLocation() {
  // Default fallback: Córdoba, Argentina
  const [coords, setCoords] = useState<UserCoordinates>({
    latitude: -31.4201,
    longitude: -64.1888,
  });
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchIpLocation = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setCoords({
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
          });
        }
      }
    } catch {
      // Keep default Córdoba coordinates
    } finally {
      setLoading(false);
    }
  };

  const requestPosition = () => {
    if (!navigator.geolocation) {
      fetchIpLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setHasPermission(true);
        setLoading(false);
      },
      (err) => {
        console.warn('Browser GPS permission not granted, resolving via IP:', err.message);
        fetchIpLocation();
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => {
    requestPosition();
  }, []);

  return { coords, hasPermission, loading, requestPosition };
}
