import { useState, useEffect } from 'react';
import type { UserCoordinates } from '../types';

export function useGeoLocation() {
  const [coords, setCoords] = useState<UserCoordinates | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const requestPosition = () => {
    if (!navigator.geolocation) {
      // Fallback coordinates (e.g. Madrid / New York default)
      setCoords({ latitude: 40.4168, longitude: -3.7038 });
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
        console.warn('Geolocation access denied or unavailable, using default coordinates:', err);
        // Fallback default coordinates
        setCoords({ latitude: 40.7128, longitude: -74.006 });
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
