import React from 'react';
import { Globe2, Rocket, ArrowUpRight, Sun, Moon, MapPin, Compass } from 'lucide-react';
import type { TelemetryData } from '../../types';
import { useTranslations, type Language } from '../../hooks/useTranslations';

interface TelemetryCardsProps {
  telemetry: TelemetryData;
  lang: Language;
}

export const TelemetryCards: React.FC<TelemetryCardsProps> = ({ telemetry, lang }) => {
  const t = useTranslations(lang);

  // Format coordinates with N/S, E/W
  const formatLat = (lat: number) => {
    const dir = lat >= 0 ? 'N' : 'S';
    return `${Math.abs(lat).toFixed(4)}° ${dir}`;
  };

  const formatLon = (lon: number) => {
    const dir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lon).toFixed(4)}° ${dir}`;
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '72px',
        left: '16px',
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 20,
        pointerEvents: 'auto',
      }}
    >
      {/* CARD 1: Ground Location */}
      <div className="glass-panel" style={{ padding: '12px 14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#38bdf8',
                textTransform: 'uppercase',
              }}
            >
              {t.groundLocation}
            </span>
          </div>

          <div
            className="font-mono"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10px',
              color: '#94a3b8',
            }}
          >
            <Compass size={11} color="#38bdf8" />
            <span>
              {formatLat(telemetry.latitude)} · {formatLon(telemetry.longitude)}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '4px',
          }}
        >
          <Globe2 size={16} color="#00e5ff" style={{ flexShrink: 0 }} />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#00e5ff',
              letterSpacing: '0.02em',
            }}
          >
            {telemetry.locationName}
          </span>
        </div>
      </div>

      {/* CARD 2: Orbital Velocity & Altitude (Dual Column) */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Velocity Column */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '4px',
              }}
            >
              <Rocket size={12} color="#38bdf8" />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                }}
              >
                {t.orbitalVelocity}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span
                className="font-mono"
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#f8fafc',
                  letterSpacing: '-0.02em',
                }}
              >
                {telemetry.velocityKmH.toLocaleString()}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>km/h</span>
            </div>

            <div
              className="font-mono"
              style={{
                fontSize: '10px',
                color: '#38bdf8',
                marginTop: '4px',
              }}
            >
              Mach {telemetry.mach} · {telemetry.velocityMph.toLocaleString()} mph
            </div>
          </div>

          {/* Altitude Column */}
          <div style={{ borderLeft: '1px solid rgba(56, 189, 248, 0.15)', paddingLeft: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '4px',
              }}
            >
              <ArrowUpRight size={12} color="#38bdf8" />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                }}
              >
                {t.altitude}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span
                className="font-mono"
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#f8fafc',
                  letterSpacing: '-0.02em',
                }}
              >
                {telemetry.altitudeKm.toFixed(1)}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>km</span>
            </div>

            <div
              className="font-mono"
              style={{
                fontSize: '10px',
                color: '#38bdf8',
                marginTop: '4px',
              }}
            >
              {telemetry.altitudeMi.toFixed(1)} mi · {t.leoOrbit}
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: Orbital Solar Cycle */}
      <div className="glass-panel" style={{ padding: '12px 14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#94a3b8',
              textTransform: 'uppercase',
            }}
          >
            {t.solarCycle}
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '9999px',
              backgroundColor: telemetry.isSunlit ? 'rgba(250, 204, 21, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              border: `1px solid ${telemetry.isSunlit ? 'rgba(250, 204, 21, 0.4)' : 'rgba(99, 102, 241, 0.4)'}`,
              color: telemetry.isSunlit ? '#facc15' : '#a5b4fc',
              fontSize: '10px',
              fontWeight: 600,
            }}
          >
            {telemetry.isSunlit ? <Sun size={11} /> : <Moon size={11} />}
            <span>{telemetry.isSunlit ? t.sunlitBadge : t.eclipsedBadge}</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#cbd5e1',
          }}
        >
          <span>
            {t.nextEvent}:{' '}
            <strong style={{ color: '#f8fafc' }}>
              {telemetry.sunEventName === 'sunset' ? t.orbitalSunset : t.orbitalSunrise}
            </strong>
          </span>
          <span className="font-mono" style={{ color: '#00e5ff', fontWeight: 600 }}>
            ~{telemetry.sunEventCountdownMinutes} min
          </span>
        </div>
      </div>

      {/* CARD 4: Distance to You */}
      <div
        className="glass-panel"
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={13} color="#4ade80" />
          <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 500 }}>
            {t.distanceToYou}
          </span>
        </div>

        <div
          className="font-mono"
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#4ade80',
            letterSpacing: '0.02em',
          }}
        >
          {telemetry.distanceToUserKm !== null
            ? `${telemetry.distanceToUserKm.toLocaleString()} km`
            : t.locatingUser}
        </div>
      </div>
    </div>
  );
};
