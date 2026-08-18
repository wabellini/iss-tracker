import { useState, useEffect } from 'react';
import type { Astronaut } from '../types';

const INITIAL_CREW: Astronaut[] = [
  {
    name: 'Sunita Williams',
    craft: 'ISS / Crew Dragon',
    agency: 'NASA',
    role: 'Comandante de la ISS',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    daysInSpace: 322,
  },
  {
    name: 'Barry "Butch" Wilmore',
    craft: 'ISS / Crew Dragon',
    agency: 'NASA',
    role: 'Ingeniero de Vuelo',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    daysInSpace: 278,
  },
  {
    name: 'Don Pettit',
    craft: 'Soyuz MS-26',
    agency: 'NASA',
    role: 'Ingeniero de Vuelo',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    daysInSpace: 460,
  },
  {
    name: 'Aleksey Ovchinin',
    craft: 'Soyuz MS-26',
    agency: 'Roscosmos',
    role: 'Comandante Soyuz',
    country: 'Rusia',
    flag: '🇷🇺',
    daysInSpace: 375,
  },
  {
    name: 'Ivan Vagner',
    craft: 'Soyuz MS-26',
    agency: 'Roscosmos',
    role: 'Ingeniero de Vuelo',
    country: 'Rusia',
    flag: '🇷🇺',
    daysInSpace: 196,
  },
  {
    name: 'Nick Hague',
    craft: 'SpaceX Crew-9',
    agency: 'NASA',
    role: 'Comandante Crew-9',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    daysInSpace: 203,
  },
  {
    name: 'Aleksandr Gorbunov',
    craft: 'SpaceX Crew-9',
    agency: 'Roscosmos',
    role: 'Especialista de Misión',
    country: 'Rusia',
    flag: '🇷🇺',
    daysInSpace: 142,
  },
  {
    name: 'Oleg Kononenko',
    craft: 'Soyuz MS-25',
    agency: 'Roscosmos',
    role: 'Comandante de Expedición',
    country: 'Rusia',
    flag: '🇷🇺',
    daysInSpace: 1111,
  },
  {
    name: 'Nikolai Chub',
    craft: 'Soyuz MS-25',
    agency: 'Roscosmos',
    role: 'Ingeniero de Vuelo',
    country: 'Rusia',
    flag: '🇷🇺',
    daysInSpace: 374,
  },
  {
    name: 'Tracy C. Dyson',
    craft: 'Soyuz MS-25',
    agency: 'NASA',
    role: 'Ingeniero de Vuelo',
    country: 'Estados Unidos',
    flag: '🇺🇸',
    daysInSpace: 372,
  },
];

export function useCrew() {
  const [crew, setCrew] = useState<Astronaut[]>(INITIAL_CREW);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Attempt fetching live crew from OpenNotify API with fallback
    const fetchLiveCrew = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://api.open-notify.org/astros.json');
        if (res.ok) {
          const data = await res.json();
          const issPeople = data.people.filter((p: { craft: string; name: string }) => p.craft === 'ISS');
          if (issPeople.length > 0) {
            // Update names and retain rich metadata
            const enrichedCrew = issPeople.map((p: { name: string; craft: string }, idx: number) => {
              const matched = INITIAL_CREW.find((c) => c.name.toLowerCase().includes(p.name.toLowerCase()));
              return matched || {
                name: p.name,
                craft: p.craft,
                agency: 'ISS Partner Agency',
                role: idx === 0 ? 'Comandante' : 'Ingeniero de Vuelo',
                country: 'Internacional',
                flag: '🌐',
                daysInSpace: 150 + idx * 30,
              };
            });
            setCrew(enrichedCrew);
          }
        }
      } catch {
        // Fallback to rich predefined roster
      } finally {
        setLoading(false);
      }
    };

    fetchLiveCrew();
  }, []);

  return { crew, count: crew.length, loading };
}
