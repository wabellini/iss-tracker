interface GeoRegion {
  nameEs: string;
  nameEn: string;
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

// Comprehensive geographic bounding box database for offline and instant reverse geocoding
const REGIONS: GeoRegion[] = [
  // Oceans & Seas
  { nameEs: 'Sobre Océano Pacífico Norte', nameEn: 'Over North Pacific Ocean', minLat: 0, maxLat: 66, minLon: -180, maxLon: -100 },
  { nameEs: 'Sobre Océano Pacífico Norte', nameEn: 'Over North Pacific Ocean', minLat: 0, maxLat: 66, minLon: 120, maxLon: 180 },
  { nameEs: 'Sobre Océano Pacífico Sur', nameEn: 'Over South Pacific Ocean', minLat: -66, maxLat: 0, minLon: -180, maxLon: -70 },
  { nameEs: 'Sobre Océano Pacífico Sur', nameEn: 'Over South Pacific Ocean', minLat: -66, maxLat: 0, minLon: 145, maxLon: 180 },
  { nameEs: 'Sobre Océano Atlántico Norte', nameEn: 'Over North Atlantic Ocean', minLat: 0, maxLat: 66, minLon: -80, maxLon: -10 },
  { nameEs: 'Sobre Océano Atlántico Sur', nameEn: 'Over South Atlantic Ocean', minLat: -66, maxLat: 0, minLon: -70, maxLon: 20 },
  { nameEs: 'Sobre Océano Índico', nameEn: 'Over Indian Ocean', minLat: -66, maxLat: 30, minLon: 20, maxLon: 110 },
  { nameEs: 'Sobre Mar de Coral', nameEn: 'Over Coral Sea', minLat: -30, maxLat: -10, minLon: 142, maxLon: 165 },
  { nameEs: 'Sobre Mar de Tasmania', nameEn: 'Over Tasman Sea', minLat: -50, maxLat: -30, minLon: 145, maxLon: 175 },
  { nameEs: 'Sobre Mar de Filipinas', nameEn: 'Over Philippine Sea', minLat: 5, maxLat: 25, minLon: 125, maxLon: 145 },
  { nameEs: 'Sobre Mar Arábigo', nameEn: 'Over Arabian Sea', minLat: 10, maxLat: 25, minLon: 55, maxLon: 75 },
  { nameEs: 'Sobre Mar Caribe', nameEn: 'Over Caribbean Sea', minLat: 9, maxLat: 22, minLon: -88, maxLon: -60 },
  { nameEs: 'Sobre Mar Mediterráneo', nameEn: 'Over Mediterranean Sea', minLat: 30, maxLat: 45, minLon: -5, maxLon: 36 },

  // Landmasses & Countries
  { nameEs: 'Sobre América del Norte (EE.UU.)', nameEn: 'Over North America (USA)', minLat: 25, maxLat: 49, minLon: -125, maxLon: -70 },
  { nameEs: 'Sobre América del Norte (Canadá)', nameEn: 'Over North America (Canada)', minLat: 49, maxLat: 60, minLon: -140, maxLon: -55 },
  { nameEs: 'Sobre América del Norte (México)', nameEn: 'Over North America (Mexico)', minLat: 14, maxLat: 32, minLon: -118, maxLon: -86 },
  { nameEs: 'Sobre América del Sur (Brasil)', nameEn: 'Over South America (Brazil)', minLat: -33, maxLat: 5, minLon: -73, maxLon: -34 },
  { nameEs: 'Sobre América del Sur (Argentina / Chile)', nameEn: 'Over South America (Argentina / Chile)', minLat: -55, maxLat: -22, minLon: -75, maxLon: -53 },
  { nameEs: 'Sobre América del Sur (Colombia / Perú)', nameEn: 'Over South America (Andean Region)', minLat: -18, maxLat: 12, minLon: -81, maxLon: -68 },
  { nameEs: 'Sobre Europa Occidental (España / Francia)', nameEn: 'Over Western Europe', minLat: 36, maxLat: 51, minLon: -9, maxLon: 10 },
  { nameEs: 'Sobre Europa Central', nameEn: 'Over Central Europe', minLat: 45, maxLat: 55, minLon: 6, maxLon: 25 },
  { nameEs: 'Sobre Europa Oriental / Rusia', nameEn: 'Over Eastern Europe / Russia', minLat: 45, maxLat: 56, minLon: 25, maxLon: 60 },
  { nameEs: 'Sobre África del Norte (Sáhara)', nameEn: 'Over North Africa (Sahara)', minLat: 18, maxLat: 37, minLon: -17, maxLon: 35 },
  { nameEs: 'Sobre África Central', nameEn: 'Over Central Africa', minLat: -10, maxLat: 18, minLon: 8, maxLon: 45 },
  { nameEs: 'Sobre África del Sur', nameEn: 'Over Southern Africa', minLat: -35, maxLat: -10, minLon: 12, maxLon: 40 },
  { nameEs: 'Sobre Oriente Medio', nameEn: 'Over Middle East', minLat: 15, maxLat: 38, minLon: 35, maxLon: 60 },
  { nameEs: 'Sobre Asia del Sur (India)', nameEn: 'Over South Asia (India)', minLat: 8, maxLat: 35, minLon: 68, maxLon: 90 },
  { nameEs: 'Sobre Asia Oriental (China / Japón)', nameEn: 'Over East Asia (China / Japan)', minLat: 20, maxLat: 50, minLon: 95, maxLon: 145 },
  { nameEs: 'Sobre Sudeste Asiático (Indonesia)', nameEn: 'Over Southeast Asia (Indonesia)', minLat: -11, maxLat: 6, minLon: 95, maxLon: 141 },
  { nameEs: 'Sobre Oceanía (Australia)', nameEn: 'Over Oceania (Australia)', minLat: -44, maxLat: -10, minLon: 112, maxLon: 154 },
  { nameEs: 'Sobre Oceanía (Nueva Zelanda)', nameEn: 'Over Oceania (New Zealand)', minLat: -47, maxLat: -34, minLon: 166, maxLon: 178 },
];

export function getOfflineLocationName(lat: number, lon: number, lang: 'es' | 'en' = 'es'): string {
  // Normalize lon to [-180, 180]
  const normalizedLon = ((lon + 180) % 360) - 180;

  for (const reg of REGIONS) {
    if (
      lat >= reg.minLat &&
      lat <= reg.maxLat &&
      normalizedLon >= reg.minLon &&
      normalizedLon <= reg.maxLon
    ) {
      return lang === 'es' ? reg.nameEs : reg.nameEn;
    }
  }

  // Fallback oceanic determination based on longitude and hemisphere
  if (lat > 0) {
    if (normalizedLon < -30 && normalizedLon > -140) {
      return lang === 'es' ? 'Sobre Océano Pacífico Norte' : 'Over North Pacific Ocean';
    }
    return lang === 'es' ? 'Sobre Océano Atlántico Norte' : 'Over North Atlantic Ocean';
  } else {
    if (normalizedLon > 20 && normalizedLon < 110) {
      return lang === 'es' ? 'Sobre Océano Índico' : 'Over Indian Ocean';
    }
    if (normalizedLon < -70 || normalizedLon > 140) {
      return lang === 'es' ? 'Sobre Océano Pacífico Sur' : 'Over South Pacific Ocean';
    }
    return lang === 'es' ? 'Sobre Océano Atlántico Sur' : 'Over South Atlantic Ocean';
  }
}
