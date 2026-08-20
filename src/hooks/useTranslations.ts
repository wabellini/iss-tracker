export type Language = 'es' | 'en';

export const translations = {
  es: {
    appTitle: 'ISS TRACKER 3D',
    liveBadge: 'EN VIVO',
    nextPasses: 'Próximos Pases',
    crewOnboard: 'Tripulación a bordo',
    fullscreen: 'Pantalla completa',
    exitFullscreen: 'Salir de pantalla completa',
    
    // Telemetry Card 1
    groundLocation: 'UBICACIÓN TERRESTRE',
    
    // Telemetry Card 2
    orbitalVelocity: 'VELOCIDAD ORBITAL',
    altitude: 'ALTITUD',
    leoOrbit: 'LEO Orbit',
    
    // Telemetry Card 3
    solarCycle: 'CICLO SOLAR ORBITAL',
    sunlitBadge: 'A la luz solar',
    eclipsedBadge: 'En sombra terrestre',
    nextEvent: 'Próximo evento',
    orbitalSunset: 'Puesta de sol orbital',
    orbitalSunrise: 'Amanecer orbital',
    
    // Telemetry Card 4
    distanceToYou: 'Distancia a ti',
    locatingUser: 'Sin GPS',
    
    // Minimap
    minimapTitle: 'MINIMAPA 2D',
    userLocationDetected: 'Tu ubicación detectada',
    hide: 'Ocultar',
    show: 'Mostrar',
    expand: 'Expandir',
    reduce: 'Reducir',
    
    // Camera Toolbar
    camFree: 'Órbita Libre',
    camFollow: 'Fijar a la ISS',
    camCupola: 'Vista Cúpula (Nadir)',
    camNorth: 'Polo Norte',
    camSun: 'Perspectiva Solar',
    visualLayers: 'Capas Visuales',
    
    // Layers
    layerAtmosphere: 'Atmósfera',
    layerClouds: 'Capa de Nubes',
    layerOrbit: 'Trayectoria Orbital',
    layerTerminator: 'Terminador Solar',
    layerCityLights: 'Luces Nocturnas',
    layerLaserNadir: 'Haz Láser Nadir',
    
    // Crew Modal
    crewTitle: 'Tripulación a Bordo de la ISS',
    crewSubtitle: 'Astronautas y cosmonautas actualmente en la Expedición Activa',
    roleCommander: 'Comandante',
    roleFlightEngineer: 'Ingeniero de Vuelo',
    roleMissionSpecialist: 'Especialista de Misión',
    daysInSpace: 'días en órbita',
    agency: 'Agencia',
    craft: 'Nave',
    close: 'Cerrar',
    
    // Pass Alerts Modal
    passesTitle: 'Próximos Avistamientos de la ISS',
    passesSubtitle: 'Pases visibles calculados sobre tu ubicación geográfica',
    passDate: 'Fecha y Hora',
    passDuration: 'Duración',
    passMaxElevation: 'Elevación Máx.',
    passBrightness: 'Brillo (Mag)',
    passTrajectory: 'Trayectoria',
    noPassesFound: 'No hay pases visibles en las próximas 48 horas para tu ubicación.',
    permissionDenied: 'Activa la geolocalización para calcular pases exactos sobre tu ciudad.',
    requestLocation: 'Activar Ubicación',
    
    // Mission Guide Modal
    missionGuide: 'Guía de Misión',
    guideTitle: 'Manual del Centro de Control',
    guideSubtitle: 'Conceptos orbitales, telemetría y navegación de la Estación Espacial Internacional',
    tabMinimap: 'Minimapa 2D',
    tabSolarCycle: 'Día, Noche y Sol',
    tabTelemetry: 'Telemetría',
    tabCameras: 'Cámaras y 3D',
  },
  en: {
    appTitle: 'ISS TRACKER 3D',
    liveBadge: 'LIVE',
    nextPasses: 'Upcoming Passes',
    crewOnboard: 'Crew Onboard',
    missionGuide: 'Mission Guide',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    
    // Telemetry Card 1
    groundLocation: 'GROUND LOCATION',
    
    // Telemetry Card 2
    orbitalVelocity: 'ORBITAL VELOCITY',
    altitude: 'ALTITUDE',
    leoOrbit: 'LEO Orbit',
    
    // Telemetry Card 3
    solarCycle: 'ORBITAL SOLAR CYCLE',
    sunlitBadge: 'In Sunlight',
    eclipsedBadge: 'In Earth Shadow',
    nextEvent: 'Next event',
    orbitalSunset: 'Orbital Sunset',
    orbitalSunrise: 'Orbital Sunrise',
    
    // Telemetry Card 4
    distanceToYou: 'Distance to you',
    locatingUser: 'No GPS',
    
    // Minimap
    minimapTitle: '2D MINIMAP',
    userLocationDetected: 'Your detected location',
    hide: 'Hide',
    show: 'Show',
    expand: 'Expand',
    reduce: 'Reduce',
    
    // Camera Toolbar
    camFree: 'Free Orbit',
    camFollow: 'Follow ISS',
    camCupola: 'Cupola View (Nadir)',
    camNorth: 'North Pole',
    camSun: 'Solar Perspective',
    visualLayers: 'Visual Layers',
    
    // Layers
    layerAtmosphere: 'Atmosphere',
    layerClouds: 'Clouds Layer',
    layerOrbit: 'Orbital Trajectory',
    layerTerminator: 'Solar Terminator',
    layerCityLights: 'Night City Lights',
    layerLaserNadir: 'Nadir Laser Beam',
    
    // Crew Modal
    crewTitle: 'ISS Onboard Crew',
    crewSubtitle: 'Astronauts & Cosmonauts currently serving on Active Expedition',
    roleCommander: 'Commander',
    roleFlightEngineer: 'Flight Engineer',
    roleMissionSpecialist: 'Mission Specialist',
    daysInSpace: 'days in orbit',
    agency: 'Agency',
    craft: 'Spacecraft',
    close: 'Close',
    
    // Pass Alerts Modal
    passesTitle: 'Upcoming ISS Sightings',
    passesSubtitle: 'Visible passes calculated for your geographic location',
    passDate: 'Date & Time',
    passDuration: 'Duration',
    passMaxElevation: 'Max Elevation',
    passBrightness: 'Brightness (Mag)',
    passTrajectory: 'Trajectory',
    noPassesFound: 'No visible passes in the next 48 hours for your location.',
    permissionDenied: 'Enable geolocation to calculate precise sightings over your city.',
    requestLocation: 'Enable Geolocation',

    // Mission Guide Modal
    guideTitle: 'Mission Control Manual',
    guideSubtitle: 'Orbital mechanics, telemetry, and 3D navigation for the International Space Station',
    tabMinimap: '2D Minimap',
    tabSolarCycle: 'Day, Night & Sun',
    tabTelemetry: 'Telemetry',
    tabCameras: 'Cameras & 3D',
  },
};

export function useTranslations(lang: Language = 'es') {
  return translations[lang];
}
