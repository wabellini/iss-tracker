import React from 'react';
import { X, Bell, Eye, Compass, Sparkles, MapPin } from 'lucide-react';
import type { UserCoordinates, PassAlert } from '../../types';
import { useTranslations, type Language } from '../../hooks/useTranslations';

interface PassAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords: UserCoordinates | null;
  hasPermission: boolean;
  onRequestLocation: () => void;
  lang: Language;
}

export const PassAlertsModal: React.FC<PassAlertsModalProps> = ({
  isOpen,
  onClose,
  hasPermission,
  onRequestLocation,
  lang,
}) => {
  const t = useTranslations(lang);

  if (!isOpen) return null;

  // Generate realistic upcoming passes based on current time
  const now = new Date();
  const simulatedPasses: PassAlert[] = [
    {
      id: 'pass-1',
      startTime: new Date(now.getTime() + 5.5 * 3600 * 1000),
      maxElevationTime: new Date(now.getTime() + (5.5 * 3600 + 180) * 1000),
      endTime: new Date(now.getTime() + (5.5 * 3600 + 360) * 1000),
      durationSeconds: 360,
      maxElevationDeg: 78,
      apparentMagnitude: -3.4,
      startDirection: 'SW',
      endDirection: 'NE',
    },
    {
      id: 'pass-2',
      startTime: new Date(now.getTime() + 21.2 * 3600 * 1000),
      maxElevationTime: new Date(now.getTime() + (21.2 * 3600 + 150) * 1000),
      endTime: new Date(now.getTime() + (21.2 * 3600 + 300) * 1000),
      durationSeconds: 300,
      maxElevationDeg: 54,
      apparentMagnitude: -2.8,
      startDirection: 'WNW',
      endDirection: 'SE',
    },
    {
      id: 'pass-3',
      startTime: new Date(now.getTime() + 29.8 * 3600 * 1000),
      maxElevationTime: new Date(now.getTime() + (29.8 * 3600 + 210) * 1000),
      endTime: new Date(now.getTime() + (29.8 * 3600 + 420) * 1000),
      durationSeconds: 420,
      maxElevationDeg: 86,
      apparentMagnitude: -3.8,
      startDirection: 'WSW',
      endDirection: 'ENE',
    },
  ];

  const formatPassTime = (date: Date) => {
    return date.toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatPassDate = (date: Date) => {
    return date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(8, 20, 42, 0.9) 0%, rgba(12, 30, 60, 0.9) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 229, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0, 229, 255, 0.3)',
              }}
            >
              <Bell size={16} color="#00e5ff" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                {t.passesTitle}
              </h2>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                {t.passesSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Location status bar */}
        {!hasPermission && (
          <div
            style={{
              padding: '10px 24px',
              backgroundColor: 'rgba(250, 204, 21, 0.1)',
              borderBottom: '1px solid rgba(250, 204, 21, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#fef08a' }}>
              <MapPin size={13} color="#facc15" />
              <span>{t.permissionDenied}</span>
            </div>
            <button
              onClick={onRequestLocation}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#facc15',
                color: '#0f172a',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t.requestLocation}
            </button>
          </div>
        )}

        {/* Passes Table */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {simulatedPasses.map((pass) => (
            <div
              key={pass.id}
              className="glass-panel"
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(56, 189, 248, 0.15)',
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'rgba(10, 24, 48, 0.5)',
              }}
            >
              {/* Date & Start */}
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'capitalize' }}>
                  {formatPassDate(pass.startTime)}
                </div>
                <div className="font-mono" style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                  {formatPassTime(pass.startTime)}
                </div>
              </div>

              {/* Max Elevation */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#94a3b8' }}>
                  <Eye size={11} color="#38bdf8" />
                  <span>{t.passMaxElevation}</span>
                </div>
                <div className="font-mono" style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                  {pass.maxElevationDeg}° (Cénit)
                </div>
              </div>

              {/* Brightness */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#94a3b8' }}>
                  <Sparkles size={11} color="#facc15" />
                  <span>{t.passBrightness}</span>
                </div>
                <div className="font-mono" style={{ fontSize: '14px', fontWeight: 700, color: '#facc15', marginTop: '2px' }}>
                  {pass.apparentMagnitude} mag
                </div>
              </div>

              {/* Trajectory */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#94a3b8' }}>
                  <Compass size={11} color="#4ade80" />
                  <span>{t.passTrajectory}</span>
                </div>
                <div className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: '#4ade80', marginTop: '2px' }}>
                  {pass.startDirection} → {pass.endDirection}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
