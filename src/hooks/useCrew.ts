import { useState, useEffect } from 'react';
import type { Astronaut } from '../types';

function parseDaysInSpace(timeStr?: string | null): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/P(?:(\d+)D)?/);
  return match && match[1] ? parseInt(match[1], 10) : 0;
}

function getNationalityFlag(nationality?: string | null, countryCode?: string | null): string {
  const n = (nationality || '').toLowerCase();
  const c = (countryCode || '').toUpperCase();
  if (c === 'USA' || n.includes('american') || n.includes('united states')) return '🇺🇸';
  if (c === 'RUS' || n.includes('russian') || n.includes('russia')) return '🇷🇺';
  if (c === 'FRA' || n.includes('french') || n.includes('france')) return '🇫🇷';
  if (c === 'DEU' || n.includes('german') || n.includes('germany')) return '🇩🇪';
  if (c === 'ITA' || n.includes('italian') || n.includes('italy')) return '🇮🇹';
  if (c === 'JPN' || n.includes('japanese') || n.includes('japan')) return '🇯🇵';
  if (c === 'CAN' || n.includes('canadian') || n.includes('canada')) return '🇨🇦';
  if (c === 'CHN' || n.includes('chinese') || n.includes('china')) return '🇨🇳';
  if (c === 'GBR' || n.includes('british') || n.includes('uk')) return '🇬🇧';
  return '🌐';
}

export function useCrew() {
  const [crew, setCrew] = useState<Astronaut[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLiveAstronauts = async () => {
      try {
        setLoading(true);
        // Check session cache for ISS crew
        const cached = sessionStorage.getItem('iss_live_crew_only_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
            setCrew(parsed);
            setLoading(false);
          }
        }

        // Live API query for humans currently in space
        const res = await fetch(
          'https://ll.thespacedevs.com/2.2.0/astronaut/?in_space=true&limit=30',
          { signal: AbortSignal.timeout(6000) }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (data && Array.isArray(data.results) && isMounted) {
          // Filter ONLY humans aboard the International Space Station (ISS)
          const issCrewMembers = data.results.filter((a: any) => {
            const agencyAbbrev = (a.agency?.abbrev || '').toUpperCase();
            const agencyName = (a.agency?.name || '').toLowerCase();
            const name = (a.name || '').toLowerCase();

            // Exclude inanimate objects / test dummies
            if (a.type?.name === 'Non-Human' || name.includes('starman') || name.includes('dummy')) {
              return false;
            }

            // Exclude Chinese Space Station (Tiangong / CNSA)
            if (agencyAbbrev === 'CNSA' || agencyName.includes('china')) {
              return false;
            }

            return true;
          });

          const liveAstronauts: Astronaut[] = issCrewMembers.map((a: any, idx: number) => {
            const agencyAbbrev = a.agency?.abbrev || a.agency?.name || 'NASA';
            const flag = getNationalityFlag(a.nationality, a.agency?.country_code);
            const days = parseDaysInSpace(a.time_in_space);
            const imageUrl = a.profile_image_thumbnail || a.profile_image || undefined;

            return {
              name: a.name,
              craft: 'ISS',
              agency: agencyAbbrev,
              role: idx === 0 ? 'Comandante de Misión' : 'Especialista / Ingeniero de Vuelo',
              country: a.nationality || a.agency?.country_code || 'Internacional',
              flag,
              daysInSpace: days,
              imageUrl,
            };
          });

          if (liveAstronauts.length > 0) {
            setCrew(liveAstronauts);
            sessionStorage.setItem('iss_live_crew_only_cache', JSON.stringify(liveAstronauts));
          }
        }
      } catch (err) {
        console.warn('Live ISS astronaut API fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLiveAstronauts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { crew, count: crew.length, loading };
}
