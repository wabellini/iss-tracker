import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import type { TelemetryData, UserCoordinates, LayerSettings } from '../../types';
import {
  calculateSolarTerminator,
  calculateGroundTrack,
  calculateSunPosition,
} from '../../services/orbitalMath';
import { WORLD_CONTINENTS } from './worldMapData';

interface MiniMap2DProps {
  telemetry: TelemetryData;
  userCoords: UserCoordinates | null;
  layers?: LayerSettings;
  lang?: 'es' | 'en';
}

export const MiniMap2D: React.FC<MiniMap2DProps> = ({
  telemetry,
  userCoords,
  layers,
  lang = 'es',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);

  // Preloaded Day and Night satellite textures
  const dayImgRef = useRef<HTMLImageElement | null>(null);
  const nightImgRef = useRef<HTMLImageElement | null>(null);
  const [, setImagesLoaded] = useState(false);

  useEffect(() => {
    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded >= 2) setImagesLoaded(true);
    };

    const day = new Image();
    day.src = '/textures/earth_day_4096.jpg';
    day.onload = () => {
      dayImgRef.current = day;
      onLoad();
    };

    const night = new Image();
    night.src = '/textures/earth_night_4096.jpg';
    night.onload = () => {
      nightImgRef.current = night;
      onLoad();
    };
  }, []);

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

    const toX = (lon: number) => ((lon + 180) / 360) * width;
    const toY = (lat: number) => ((90 - lat) / 180) * height;

    // 1. BASE MAP: Day satellite texture or vector continents fallback
    if (dayImgRef.current && dayImgRef.current.complete) {
      ctx.drawImage(dayImgRef.current, 0, 0, width, height);
      ctx.fillStyle = 'rgba(6, 24, 54, 0.1)';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = '#0a1e3f';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#1e3a5f';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      for (const continent of WORLD_CONTINENTS) {
        ctx.beginPath();
        continent.points.forEach(([lon, lat], index) => {
          const x = toX(lon);
          const y = toY(lat);
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // 2. Subtle Coordinate Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 0.8;
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

    // 3. SUBTLE NIGHT REGION & SOLAR TERMINATOR
    const showTerminator = layers ? layers.terminator : true;
    const sun = calculateSunPosition(new Date());

    if (showTerminator) {
      const terminatorPoints = calculateSolarTerminator(new Date(), 160);
      const isSunNorth = sun.lat >= 0;
      const nightPoleY = isSunNorth ? height : 0;

      // Clip Night Region
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, nightPoleY);
      terminatorPoints.forEach(([lat, lon], idx) => {
        const x = toX(lon);
        const y = toY(lat);
        if (idx === 0) ctx.lineTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.lineTo(width, nightPoleY);
      ctx.closePath();
      ctx.clip();

      if (nightImgRef.current && nightImgRef.current.complete) {
        // Draw night lights
        ctx.drawImage(nightImgRef.current, 0, 0, width, height);
        // Soft subtle shadow (continents clearly visible, not pitch black)
        ctx.fillStyle = 'rgba(4, 12, 34, 0.38)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = 'rgba(4, 12, 34, 0.45)';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();

      // Distinct Glowing Terminator Line (Dividing boundary)
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = isMaximized ? 2.0 : 1.6;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      terminatorPoints.forEach(([lat, lon], idx) => {
        const x = toX(lon);
        const y = toY(lat);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();

      // Subsolar Point (Sun Icon)
      const sunX = toX(sun.lon);
      const sunY = toY(sun.lat);
      ctx.save();
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sunX, sunY, isMaximized ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();

      // Sun rays
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.arc(sunX, sunY, isMaximized ? 12 : 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

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

    // 4. ORBITAL TRACKS
    const showOrbit = layers ? layers.orbit : true;
    if (showOrbit) {
      // Previous Orbit (-90 min): Orange dashed line
      const prevOrbitTrack = calculateGroundTrack(
        telemetry.latitude,
        telemetry.longitude,
        telemetry.headingDeg,
        -135,
        -45
      );
      drawTrack(prevOrbitTrack, 'rgba(249, 115, 22, 0.75)', isMaximized ? 1.6 : 1.3, true);

      // Next Future Orbit (+90 min): Yellow/Orange dashed line
      const nextOrbitTrack = calculateGroundTrack(
        telemetry.latitude,
        telemetry.longitude,
        telemetry.headingDeg,
        90,
        180
      );
      drawTrack(nextOrbitTrack, 'rgba(250, 204, 21, 0.75)', isMaximized ? 1.6 : 1.3, true);

      // Current Pass Track (-45m past and +90m upcoming): Glowing Solid Cyan Line
      const currentTrack = calculateGroundTrack(
        telemetry.latitude,
        telemetry.longitude,
        telemetry.headingDeg,
        -45,
        90
      );
      drawTrack(currentTrack, '#00e5ff', isMaximized ? 3.0 : 2.4, false, true);

      // Directional Arrows along the cyan flight path
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
              const arrowSize = isMaximized ? 7.5 : 5.5;

              ctx.save();
              ctx.translate(x1, y1);
              ctx.rotate(angle);

              ctx.fillStyle = '#00e5ff';
              ctx.shadowColor = '#00e5ff';
              ctx.shadowBlur = 8;

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

      drawDirectionArrows(currentTrack, [-30, -10, 20, 50, 75]);
    }

    // 5. Draw User Location (Green Dot)
    if (userCoords) {
      const uX = toX(userCoords.longitude);
      const uY = toY(userCoords.latitude);

      ctx.fillStyle = '#4ade80';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(uX, uY, isMaximized ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 6. Draw ISS Position & Footprint Circle
    const issX = toX(telemetry.longitude);
    const issY = toY(telemetry.latitude);

    // Horizon Footprint Visibility Circle (~2200km radius)
    ctx.save();
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.75)';
    ctx.lineWidth = isMaximized ? 2.0 : 1.4;
    ctx.beginPath();
    ctx.arc(issX, issY, isMaximized ? 42 : 18, 0, Math.PI * 2);
    ctx.stroke();

    // Pulsating Outer Target Ring
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = isMaximized ? 2.2 : 1.8;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(issX, issY, isMaximized ? 10 : 7.5, 0, Math.PI * 2);
    ctx.stroke();

    // Center ISS Dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(issX, issY, isMaximized ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, [telemetry, userCoords, layers, isVisible, isMaximized]);

  return (
    <>
      {/* Backdrop when maximized */}
      {isMaximized && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(3, 7, 18, 0.75)',
            backdropFilter: 'blur(10px)',
            zIndex: 45,
          }}
          onClick={() => setIsMaximized(false)}
        />
      )}

      <div
        className="glass-panel"
        style={
          isMaximized
            ? {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(980px, 92vw)',
                maxHeight: '88vh',
                zIndex: 50,
                padding: '16px 20px',
                borderRadius: '16px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                flexDirection: 'column',
              }
            : {
                position: 'absolute',
                top: '72px',
                right: '16px',
                zIndex: 20,
                padding: '10px 12px',
                width: '320px',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }
        }
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
                fontSize: isMaximized ? '14px' : '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#38bdf8',
                textTransform: 'uppercase',
              }}
            >
              {isMaximized
                ? (lang === 'es' ? 'Minimapa 2D — Vista Mission Control' : '2D Map — Mission Control View')
                : (lang === 'es' ? 'Minimapa 2D' : '2D Minimap')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {!isMaximized && (
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
            )}

            <button
              onClick={() => setIsMaximized(!isMaximized)}
              style={{
                background: isMaximized ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                border: `1px solid ${isMaximized ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.3)'}`,
                borderRadius: '6px',
                color: isMaximized ? '#fca5a5' : '#00e5ff',
                cursor: 'pointer',
                padding: '4px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '10px',
                fontWeight: 600,
              }}
              title={isMaximized ? 'Cerrar vista' : 'Maximizar minimapa'}
            >
              {isMaximized ? (
                <>
                  <Minimize2 size={13} />
                  <span>{lang === 'es' ? 'Cerrar' : 'Close'}</span>
                </>
              ) : (
                <Maximize2 size={13} />
              )}
            </button>
          </div>
        </div>

        {/* Canvas */}
        {isVisible && (
          <>
            <div
              style={{
                width: '100%',
                height: isMaximized ? '480px' : '150px',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                position: 'relative',
                backgroundColor: '#040d1e',
                transition: 'height 0.25s ease',
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

            {/* Maximized Telemetry Summary Bar */}
            {isMaximized ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  marginTop: '12px',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(8, 20, 42, 0.6)',
                  borderRadius: '10px',
                  border: '1px solid rgba(56, 189, 248, 0.15)',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Ubicación</div>
                  <div className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: '#00e5ff' }}>
                    {telemetry.locationName}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Coordenadas</div>
                  <div className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                    {telemetry.latitude.toFixed(2)}°, {telemetry.longitude.toFixed(2)}°
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Velocidad</div>
                  <div className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                    {telemetry.velocityKmH.toLocaleString()} km/h (Mach {telemetry.mach})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Altitud</div>
                  <div className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                    {telemetry.altitudeKm} km
                  </div>
                </div>
              </div>
            ) : (
              /* Footer Indicators (Compact) */
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '6px',
                  fontSize: '10px',
                  color: '#94a3b8',
                }}
              >
                {userCoords ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
                    <span>{lang === 'es' ? 'Tu ubicación' : 'Your location'}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#64748b' }} />
                    <span>{lang === 'es' ? 'GPS desactivado' : 'GPS disabled'}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#facc15' }} />
                  <span>{lang === 'es' ? 'Sol' : 'Sun'}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
