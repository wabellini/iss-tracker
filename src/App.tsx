import React, { useState } from 'react';
import { SpaceScene } from './components/3d/SpaceScene';
import { MiniMap2D } from './components/2d/MiniMap2D';
import { HeaderBar } from './components/hud/HeaderBar';
import { TelemetryCards } from './components/hud/TelemetryCards';
import { CameraToolbar } from './components/hud/CameraToolbar';
import { CrewModal } from './components/hud/CrewModal';
import { PassAlertsModal } from './components/hud/PassAlertsModal';
import { MobileSheet } from './components/hud/MobileSheet';
import { useISSTelemetry } from './hooks/useISSTelemetry';
import { useGeoLocation } from './hooks/useGeoLocation';
import { useCrew } from './hooks/useCrew';
import type { CameraMode, LayerSettings, Language } from './types';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('es');
  const [cameraMode, setCameraMode] = useState<CameraMode>('free');
  const [isCrewOpen, setIsCrewOpen] = useState(false);
  const [isPassesOpen, setIsPassesOpen] = useState(false);

  const [layers, setLayers] = useState<LayerSettings>({
    atmosphere: true,
    clouds: true,
    orbit: true,
    terminator: true,
    cityLights: true,
    laserNadir: true,
  });

  const { coords: userCoords, hasPermission, requestPosition } = useGeoLocation();
  const { telemetry } = useISSTelemetry(userCoords, lang);
  const { crew, count: crewCount } = useCrew();

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const toggleLayer = (layerKey: keyof LayerSettings) => {
    setLayers((prev: LayerSettings) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#030712',
      }}
    >
      {/* 3D WebGL Space Scene */}
      <SpaceScene
        telemetry={telemetry}
        cameraMode={cameraMode}
        layers={layers}
      />

      {/* Top Header Bar */}
      <HeaderBar
        lang={lang}
        onToggleLang={toggleLanguage}
        onOpenCrew={() => setIsCrewOpen(true)}
        onOpenPasses={() => setIsPassesOpen(true)}
        crewCount={crewCount}
      />

      {/* Left HUD Telemetry Cards (Desktop) */}
      <div className="desktop-telemetry">
        <TelemetryCards telemetry={telemetry} lang={lang} />
      </div>

      {/* Top Right 2D Mission Control Minimap */}
      <MiniMap2D telemetry={telemetry} userCoords={userCoords} layers={layers} lang={lang} />

      {/* Bottom Center Camera & Layers Toolbar */}
      <CameraToolbar
        activeMode={cameraMode}
        onSelectMode={setCameraMode}
        layers={layers}
        onToggleLayer={toggleLayer}
        lang={lang}
      />

      {/* Mobile Touch Drawer Sheet */}
      <MobileSheet telemetry={telemetry} lang={lang} />

      {/* Astronauts Crew Modal */}
      <CrewModal
        isOpen={isCrewOpen}
        onClose={() => setIsCrewOpen(false)}
        crew={crew}
        lang={lang}
      />

      {/* Upcoming Passes Modal */}
      <PassAlertsModal
        isOpen={isPassesOpen}
        onClose={() => setIsPassesOpen(false)}
        userCoords={userCoords}
        hasPermission={hasPermission}
        onRequestLocation={requestPosition}
        lang={lang}
      />
    </main>
  );
};

export default App;
