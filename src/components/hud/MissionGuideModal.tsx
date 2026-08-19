import React, { useState } from 'react';
import { X, HelpCircle, Map, Sun, Gauge, Video, Sparkles } from 'lucide-react';
import { useTranslations, type Language } from '../../hooks/useTranslations';

interface MissionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

type GuideTab = 'minimap' | 'solar' | 'telemetry' | 'cameras';

export const MissionGuideModal: React.FC<MissionGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const t = useTranslations(lang);
  const [activeTab, setActiveTab] = useState<GuideTab>('minimap');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.78)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: 'min(780px, 94vw)',
          maxHeight: '88vh',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
            paddingBottom: '16px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                {t.guideTitle}
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                {t.guideSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '10px',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('minimap')}
            style={{
              background: activeTab === 'minimap' ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
              border: `1px solid ${activeTab === 'minimap' ? 'rgba(0, 229, 255, 0.4)' : 'transparent'}`,
              borderRadius: '8px',
              color: activeTab === 'minimap' ? '#00e5ff' : '#94a3b8',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <Map size={14} />
            <span>{t.tabMinimap}</span>
          </button>

          <button
            onClick={() => setActiveTab('solar')}
            style={{
              background: activeTab === 'solar' ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
              border: `1px solid ${activeTab === 'solar' ? 'rgba(250, 204, 21, 0.4)' : 'transparent'}`,
              borderRadius: '8px',
              color: activeTab === 'solar' ? '#facc15' : '#94a3b8',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <Sun size={14} />
            <span>{t.tabSolarCycle}</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            style={{
              background: activeTab === 'telemetry' ? 'rgba(74, 222, 128, 0.15)' : 'transparent',
              border: `1px solid ${activeTab === 'telemetry' ? 'rgba(74, 222, 128, 0.4)' : 'transparent'}`,
              borderRadius: '8px',
              color: activeTab === 'telemetry' ? '#4ade80' : '#94a3b8',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <Gauge size={14} />
            <span>{t.tabTelemetry}</span>
          </button>

          <button
            onClick={() => setActiveTab('cameras')}
            style={{
              background: activeTab === 'cameras' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
              border: `1px solid ${activeTab === 'cameras' ? 'rgba(168, 85, 247, 0.4)' : 'transparent'}`,
              borderRadius: '8px',
              color: activeTab === 'cameras' ? '#c084fc' : '#94a3b8',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <Video size={14} />
            <span>{t.tabCameras}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {/* TAB 1: MINIMAP */}
          {activeTab === 'minimap' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(8, 20, 42, 0.6)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: '10px', height: '3px', backgroundColor: '#00e5ff', borderRadius: '2px' }} />
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#00e5ff', margin: 0 }}>
                    {lang === 'es' ? 'Línea Cian Sólida y Flechas (Trayectoria Activa)' : 'Solid Cyan Line & Arrows (Active Path)'}
                  </h3>
                </div>
                <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                  {lang === 'es'
                    ? 'Representa los 45 minutos pasados (trayecto que la ISS acaba de recorrer) y los próximos 90 minutos futuros (una vuelta casi completa por delante). Las flechas cian señalan el sentido de avance en tiempo real.'
                    : 'Represents the past 45 minutes of flight and the upcoming 90 minutes (nearly one full orbit ahead). The cyan arrows indicate flight direction in real time.'}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(8, 20, 42, 0.6)',
                  border: '1px solid rgba(249, 115, 22, 0.25)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: '10px', height: '2px', borderTop: '2px dashed #f97316' }} />
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#f97316', margin: 0 }}>
                    {lang === 'es' ? 'Líneas Naranjas Discontinuas (Órbitas Adyacentes)' : 'Orange Dashed Lines (Adjacent Orbits)'}
                  </h3>
                </div>
                <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                  {lang === 'es'
                    ? 'Muestran por dónde pasó la ISS en su vuelta anterior (-90 min) y por dónde pasará en su siguiente vuelta (+90 min). Debido a que la Tierra rota hacia el este, cada nueva órbita sobre el suelo se desplaza unos 23° de longitud hacia el oeste.'
                    : 'Show where the ISS passed during its previous orbit (-90 min) and where it will pass on its next revolution (+90 min). Because the Earth rotates eastward, each new ground track shifts ~23° west.'}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(8, 20, 42, 0.6)',
                  border: '1px solid rgba(74, 222, 128, 0.2)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1.5px solid #4ade80' }} />
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80', margin: 0 }}>
                    {lang === 'es' ? 'Círculo Verde de Cobertura (Horizonte Visual)' : 'Green Coverage Ring (Visual Horizon)'}
                  </h3>
                </div>
                <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                  {lang === 'es'
                    ? 'Delimita el área geográfica de ~2.200 km de radio sobre la superficie terrestre donde los observadores pueden ver la ISS en el cielo (siempre que coincida con noche o crepúsculo).'
                    : 'Defines the ~2,200 km radius geographical footprint on Earth where observers can see the ISS in the sky during night or twilight.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SOLAR CYCLE */}
          {activeTab === 'solar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(8, 20, 42, 0.6)',
                  border: '1px solid rgba(250, 204, 21, 0.2)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sun size={15} color="#facc15" />
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#facc15', margin: 0 }}>
                    {lang === 'es' ? 'Punto Subsolar (Sol en el Mapa)' : 'Subsolar Point (Sun on the Map)'}
                  </h3>
                </div>
                <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                  {lang === 'es'
                    ? 'El icono del Sol indica las coordenadas exactas de la Tierra donde los rayos solares caen 100% verticales (cenit a 90°), es decir, donde es exactamente el mediodía solar en ese instante.'
                    : 'The Sun icon marks the exact coordinates on Earth receiving perpendicular sunlight (90° zenith), indicating solar noon at that instant.'}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(8, 20, 42, 0.6)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles size={15} color="#38bdf8" />
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', margin: 0 }}>
                    {lang === 'es' ? 'Terminador Solar y 16 Amaneceres Diarios' : 'Solar Terminator & 16 Daily Sunrises'}
                  </h3>
                </div>
                <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                  {lang === 'es'
                    ? 'La línea divisoria curvada separa el día de la noche. La ISS completa una vuelta cada 92.7 minutos, por lo que la tripulación experimenta 16 puestas de sol y 16 amaneceres cada 24 horas (unos 45 minutos de luz seguidos de 45 minutos de oscuridad orbital).'
                    : 'The curved line marks the boundary between day and night. With a 92.7-minute orbital period, astronauts witness 16 sunsets and 16 sunrises every 24 hours (~45 minutes of sunlight followed by ~45 minutes of Earth shadow).' }
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(8, 20, 42, 0.6)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
                  {lang === 'es' ? 'Órbita LEO (Low Earth Orbit)' : 'LEO Orbit (Low Earth Orbit)'}
                </h3>
                <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                  {lang === 'es'
                    ? 'La estación orbita a unos 420 km de altitud media. Para mantenerse en órbita sin caer ni escapar al espacio profundo, debe volar a 27.600 km/h (aproximadamente Mach 22.5 o 7.66 km por segundo).'
                    : 'The station orbits at ~420 km altitude. To remain in orbit, it maintains a speed of 27,600 km/h (~Mach 22.5 or 7.66 km per second).' }
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(8, 20, 42, 0.6)',
                  border: '1px solid rgba(74, 222, 128, 0.2)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80', marginBottom: '6px' }}>
                  {lang === 'es' ? 'Distancia a tu Ubicación' : 'Distance to Your Location'}
                </h3>
                <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                  {lang === 'es'
                    ? 'Calcula en tiempo real la distancia euclidiana tridimensional en línea recta entre tus coordenadas GPS y la posición orbital de la estación en el espacio.'
                    : 'Calculates the real-time 3D straight-line distance between your device GPS coordinates and the space station in orbit.' }
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: CAMERAS & 3D */}
          {activeTab === 'cameras' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(8, 20, 42, 0.6)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#c084fc', marginBottom: '6px' }}>
                  {lang === 'es' ? 'Modos de Cámara Cinemática' : 'Cinematic Camera Modes'}
                </h3>
                <ul style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.7', margin: 0, paddingLeft: '18px' }}>
                  <li><strong>{t.camFree}:</strong> {lang === 'es' ? 'Gira con el botón izquierdo y haz zoom con la rueda del ratón.' : 'Rotate with left-click and zoom with mouse wheel.'}</li>
                  <li><strong>{t.camFollow}:</strong> {lang === 'es' ? 'Fija la cámara detrás de la ISS para acompañar su vuelo en órbita.' : 'Locks camera behind the ISS to follow its orbital flight.'}</li>
                  <li><strong>{t.camCupola}:</strong> {lang === 'es' ? 'Perspectiva Nadir mirando directamente hacia abajo hacia la superficie de la Tierra.' : 'Nadir view looking straight down at the Earth.'}</li>
                  <li><strong>{t.camNorth} / {t.camSun}:</strong> {lang === 'es' ? 'Perspectiva polar o alineada con la dirección de los rayos solares.' : 'Polar view or aligned with incoming sunlight.'}</li>
                </ul>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(8, 20, 42, 0.6)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
                  {lang === 'es' ? 'Capas Visuales' : 'Visual Layers'}
                </h3>
                <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                  {lang === 'es'
                    ? 'En el menú "Capas Visuales" de la barra inferior puedes encender o apagar la atmósfera, las nubes dinámicas, las luces de ciudades nocturnas, el terminador y el haz láser Nadir.'
                    : 'The "Visual Layers" menu on the bottom toolbar allows you to toggle atmosphere, dynamic clouds, night city lights, solar terminator, and the Nadir laser beam.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
