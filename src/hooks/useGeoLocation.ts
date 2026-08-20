import { useState, useEffect } from 'react';
import type { UserCoordinates } from '../types';

export function useGeoLocation() {
  const [coords, setCoords] = useState<UserCoordinates | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const requestPosition = () => {
    if (!navigator.geolocation) {
      setCoords(null);
      setHasPermission(false);
      setLoading(false);
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
        console.warn('Geolocation permission not granted or unavailable:', err.message);
        setCoords(null);
        setHasPermission(false);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  useEffect(() => {
    requestPosition();
  }, []);

  return { coords, hasPermission, loading, requestPosition };
}
