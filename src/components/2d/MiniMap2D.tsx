import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import type { TelemetryData, UserCoordinates } from '../../types';
import { calculateSolarTerminator, calculateGroundTrack } from '../../services/orbitalMath';
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

    // Coordinate conversion
    const toX = (lon: number) => ((lon + 180) / 360) * width;
    const toY = (lat: number) => ((90 - lat) / 180) * height;

    // 1. Deep Oceanic Background
    ctx.fillStyle = '#040d1e';
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Coordinate Grid Lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;

    for (let lon = -180; lon <= 180; lon += 60) {
      const x = toX(lon);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = toY(lat);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 3. Draw Continents
    ctx.fillStyle = 'rgba(16, 36, 64, 0.7)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.32)';
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
    ctx.moveTo(0, height);

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
    ctx.fillStyle = 'rgba(2, 6, 20, 0.48)';
    ctx.fill();

    // Helper to draw segmented tracks with map wrapping
    const drawTrack = (
      points: Array<{ lat: number; lon: number }>,
      strokeColor: string,
      lineWidth: number,
      dashed: boolean = false,
      glow: boolean = false
    ) => {
      if (points.length === 0) return;

      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      if (dashed) {
        ctx.setLineDash([4, 4]);
      } else {
        ctx.setLineDash([]);
      }
      if (glow) {
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 6;
      }

      ctx.beginPath();
      let isDrawing = false;
      let lastX = 0;

      for (let i = 0; i < points.length; i++) {
        const x = toX(points[i].lon);
        const y = toY(points[i].lat);

        if (!isDrawing || Math.abs(x - lastX) > width / 2) {
          ctx.moveTo(x, y);
          isDrawing = true;
        } else {
          ctx.lineTo(x, y);
        }
        lastX = x;
      }
      ctx.stroke();
      ctx.restore();
    };

    // 5. ORBITAL TRACKS:
    // A) Previous Orbit (-90 min): Orange dashed line
    const prevOrbitTrack = calculateGroundTrack(telemetry.latitude, telemetry.longitude, telemetry.headingDeg, -135, -45);
    drawTrack(prevOrbitTrack, 'rgba(249, 115, 22, 0.65)', 1.2, true);

    // B) Next Future Orbit (+90 min): Orange dashed line
    const nextOrbitTrack = calculateGroundTrack(telemetry.latitude, telemetry.longitude, telemetry.headingDeg, 90, 180);
    drawTrack(nextOrbitTrack, 'rgba(249, 115, 22, 0.65)', 1.2, true);

    // C) Current Pass Track (-45m past and +90m upcoming): Glowing Solid Cyan Line
    const currentTrack = calculateGroundTrack(telemetry.latitude, telemetry.longitude, telemetry.headingDeg, -45, 90);
    drawTrack(currentTrack, '#00e5ff', 2.2, false, true);

    // D) Directional Arrows along the cyan flight path
    const drawDirectionArrows = (
      points: Array<{ lat: number; lon: number; minutesOffset: number }>,
      targetMinutes: number[]
    ) => {
      targetMinutes.forEach((minOffset) => {
        const idx = points.findIndex((p) => p.minutesOffset >= minOffset);
        if (idx > 0 && idx < points.length - 1) {
          const p1 = points[idx];
          const p2 = points[idx + 1];
          const x1 = toX(p1.lon);
          const y1 = toY(p1.lat);
          const x2 = toX(p2.lon);
          const y2 = toY(p2.lat);

          if (Math.abs(x2 - x1) < width / 3) {
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const arrowSize = 5;

            ctx.save();
            ctx.translate(x1, y1);
            ctx.rotate(angle);

            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 6;

            ctx.beginPath();
            ctx.moveTo(arrowSize, 0);
            ctx.lineTo(-arrowSize * 0.7, -arrowSize * 0.6);
            ctx.lineTo(-arrowSize * 0.3, 0);
            ctx.lineTo(-arrowSize * 0.7, arrowSize * 0.6);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
          }
        }
      });
    };

    drawDirectionArrows(currentTrack, [-20, 25, 65]);

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

    // 7. Draw ISS Position (Pulsating Cyan Marker & Crosshair Ring)
    const issX = toX(telemetry.longitude);
    const issY = toY(telemetry.latitude);

    // Outer Target Ring
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(issX, issY, 7.5, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Solid Point
    ctx.fillStyle = '#00e5ff';
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
