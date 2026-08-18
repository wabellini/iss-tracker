import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import type { TelemetryData, UserCoordinates } from '../../types';
import { calculateSolarTerminator, ISS_INCLINATION_DEG } from '../../services/orbitalMath';
import { WORLD_CONTINENTS } from './worldMapData';

interface MiniMap2DProps {
  telemetry: TelemetryData;
  userCoords: UserCoordinates | null;
  lang?: 'es' | 'en';
}

export const MiniMap2D: React.FC<MiniMap2DProps> = ({
  telemetry,
  userCoords,
  lang = 'es',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina DPR scaling
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Helpers to convert lat/lon to canvas coordinates
    const toX = (lon: number) => ((lon + 180) / 360) * width;
    const toY = (lat: number) => ((90 - lat) / 180) * height;

    // 1. Draw Ocean Background
    ctx.fillStyle = '#051124';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Subtle Coordinate Grid Lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;

    // Meridians
    for (let lon = -180; lon <= 180; lon += 60) {
      const x = toX(lon);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    // Parallels
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = toY(lat);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 3. Draw Continents
    ctx.fillStyle = 'rgba(18, 40, 70, 0.65)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.lineWidth = 1;

    for (const continent of WORLD_CONTINENTS) {
      ctx.beginPath();
      continent.points.forEach(([lon, lat], index) => {
        const x = toX(lon);
        const y = toY(lat);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 4. Draw Solar Terminator (Day/Night Shadow)
    const terminatorPoints = calculateSolarTerminator(new Date(), 120);
    ctx.beginPath();
    ctx.moveTo(0, height); // start bottom-left

    terminatorPoints.forEach(([lat, lon], idx) => {
      const x = toX(lon);
      const y = toY(lat);
      if (idx === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
    ctx.fill();

    // 5. Draw Orbit Ground Tracks
    const currentPhase = Math.asin(Math.max(-0.999, Math.min(0.999, telemetry.latitude / ISS_INCLINATION_DEG)));

    // Previous and Next Orbits (Orange dashed curves)
    const drawDashedOrbit = (orbitShiftDeg: number, strokeColor: string) => {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();

      let isDrawing = false;
      let lastX = 0;

      for (let i = -180; i <= 180; i += 2) {
        const angleRad = (i * Math.PI) / 180;
        const lat = ISS_INCLINATION_DEG * Math.sin(currentPhase + angleRad);
        const lon = ((telemetry.longitude + i + orbitShiftDeg + 180) % 360) - 180;

        const x = toX(lon);
        const y = toY(lat);

        // Handle canvas edge wrap-around
        if (!isDrawing || Math.abs(x - lastX) > width / 2) {
          ctx.moveTo(x, y);
          isDrawing = true;
        } else {
          ctx.lineTo(x, y);
        }
        lastX = x;
      }
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash
    };

    // Orange past & future ground tracks
    drawDashedOrbit(-23.17, 'rgba(249, 115, 22, 0.65)');
    drawDashedOrbit(23.17, 'rgba(249, 115, 22, 0.65)');

    // Current Orbit Ground Track (Solid Glowing Cyan Line)
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 6;
    ctx.beginPath();

    let isDrawingCurrent = false;
    let lastCurrentX = 0;

    for (let i = -180; i <= 180; i += 2) {
      const angleRad = (i * Math.PI) / 180;
      const lat = ISS_INCLINATION_DEG * Math.sin(currentPhase + angleRad);
      const lon = ((telemetry.longitude + i + 180) % 360) - 180;

      const x = toX(lon);
      const y = toY(lat);

      if (!isDrawingCurrent || Math.abs(x - lastCurrentX) > width / 2) {
        ctx.moveTo(x, y);
        isDrawingCurrent = true;
      } else {
        ctx.lineTo(x, y);
      }
      lastCurrentX = x;
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // 6. Draw User Location (Green Dot)
    if (userCoords) {
      const uX = toX(userCoords.longitude);
      const uY = toY(userCoords.latitude);

      ctx.fillStyle = '#4ade80';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(uX, uY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 7. Draw ISS Position (Pulsating Cyan Marker)
    const issX = toX(telemetry.longitude);
    const issY = toY(telemetry.latitude);

    // Outer Target Pulse Ring
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(issX, issY, 7.5, 0, Math.PI * 2);
    ctx.stroke();

    // Center ISS Point
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(issX, issY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [telemetry, userCoords, isVisible, isExpanded]);

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 20,
        padding: '10px 12px',
        width: isExpanded ? '420px' : '280px',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isVisible ? '8px' : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="live-dot" style={{ width: '6px', height: '6px' }} />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#38bdf8',
              textTransform: 'uppercase',
            }}
          >
            {lang === 'es' ? 'Minimapa 2D' : '2D Minimap'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setIsVisible(!isVisible)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
            }}
            title={isVisible ? 'Ocultar' : 'Mostrar'}
          >
            {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          {isVisible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
              }}
              title={isExpanded ? 'Reducir' : 'Expandir'}
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      {isVisible && (
        <>
          <div
            style={{
              width: '100%',
              height: isExpanded ? '210px' : '135px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              position: 'relative',
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
              }}
            />
          </div>

          {/* Footer User Location Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '6px',
              fontSize: '10px',
              color: '#94a3b8',
            }}
          >
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
            <span>{lang === 'es' ? 'Tu ubicación detectada' : 'Your detected location'}</span>
          </div>
        </>
      )}
    </div>
  );
};
