import React, { useState } from 'react';
import {
  Video,
  Target,
  Eye,
  Compass,
  Sun,
  Layers,
  Check,
} from 'lucide-react';
import type { CameraMode, LayerSettings } from '../../types';
import { useTranslations, type Language } from '../../hooks/useTranslations';

interface CameraToolbarProps {
  activeMode: CameraMode;
  onSelectMode: (mode: CameraMode) => void;
  layers: LayerSettings;
  onToggleLayer: (layerKey: keyof LayerSettings) => void;
  lang: Language;
}

export const CameraToolbar: React.FC<CameraToolbarProps> = ({
  activeMode,
  onSelectMode,
  layers,
  onToggleLayer,
  lang,
}) => {
  const t = useTranslations(lang);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const cameraButtons = [
    { id: 'free' as CameraMode, label: t.camFree, icon: Video },
    { id: 'iss' as CameraMode, label: t.camFollow, icon: Target },
    { id: 'cupola' as CameraMode, label: t.camCupola, icon: Eye },
    { id: 'north' as CameraMode, label: t.camNorth, icon: Compass },
    { id: 'sun' as CameraMode, label: t.camSun, icon: Sun },
  ];

  const layerItems: Array<{ key: keyof LayerSettings; label: string }> = [
    { key: 'atmosphere', label: t.layerAtmosphere },
    { key: 'clouds', label: t.layerClouds },
    { key: 'orbit', label: t.layerOrbit },
    { key: 'terminator', label: t.layerTerminator },
    { key: 'cityLights', label: t.layerCityLights },
    { key: 'laserNadir', label: t.layerLaserNadir },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 25,
        pointerEvents: 'auto',
      }}
    >
      {/* Main Pill Toolbar */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '5px 8px',
          borderRadius: '9999px',
          position: 'relative',
        }}
      >
        {cameraButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = activeMode === btn.id;

          return (
            <button
              key={btn.id}
              onClick={() => onSelectMode(btn.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: isActive ? '#0284c7' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 14px rgba(2, 132, 199, 0.6)' : 'none',
              }}
            >
              <Icon size={13} color={isActive ? '#ffffff' : '#38bdf8'} />
              <span>{btn.label}</span>
            </button>
          );
        })}

        <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(56, 189, 248, 0.2)', margin: '0 4px' }} />

        {/* Visual Layers Button & Popover */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: showLayerMenu ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: showLayerMenu ? '#00e5ff' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Layers size={13} color={showLayerMenu ? '#00e5ff' : '#38bdf8'} />
            <span>{t.visualLayers}</span>
          </button>

          {/* Layer Popover Menu */}
          {showLayerMenu && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                bottom: '46px',
                right: '0',
                width: '200px',
                padding: '8px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
              }}
            >
              {layerItems.map((item) => {
                const isEnabled = layers[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => onToggleLayer(item.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isEnabled ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                      color: isEnabled ? '#00e5ff' : '#94a3b8',
                      fontSize: '11px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span>{item.label}</span>
                    {isEnabled && <Check size={12} color="#00e5ff" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
