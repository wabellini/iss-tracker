import React from 'react';
import { X, Users, Rocket, Clock, Shield } from 'lucide-react';
import type { Astronaut } from '../../types';
import { useTranslations, type Language } from '../../hooks/useTranslations';

interface CrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  crew: Astronaut[];
  lang: Language;
}

export const CrewModal: React.FC<CrewModalProps> = ({
  isOpen,
  onClose,
  crew,
  lang,
}) => {
  const t = useTranslations(lang);

  if (!isOpen) return null;

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
          maxWidth: '720px',
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
              <Users size={16} color="#00e5ff" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                {t.crewTitle} ({crew.length})
              </h2>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                {t.crewSubtitle}
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

        {/* Crew Grid List */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '12px',
          }}
        >
          {crew.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '13px' }}>
              <div style={{ color: '#00e5ff', marginBottom: '6px', fontWeight: 600 }}>
                {lang === 'es' ? 'Sincronizando tripulación en órbita...' : 'Syncing astronauts in orbit...'}
              </div>
            </div>
          )}

          {crew.map((astro, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'rgba(10, 24, 48, 0.5)',
              }}
            >
              {/* Astronaut Portrait with Flag Badge */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(15, 34, 68, 0.8)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                {astro.imageUrl ? (
                  <img
                    src={astro.imageUrl}
                    alt={astro.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '22px' }}>{astro.flag}</span>
                )}
                {/* Flag Badge */}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '2px',
                    fontSize: '12px',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9))',
                  }}
                >
                  {astro.flag}
                </span>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#f8fafc',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {astro.name}
                  </h3>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0, 229, 255, 0.12)',
                      color: '#38bdf8',
                      fontWeight: 600,
                    }}
                  >
                    {astro.agency}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: '#94a3b8',
                    marginTop: '3px',
                  }}
                >
                  <Shield size={11} color="#38bdf8" />
                  <span>{astro.role}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '6px',
                    fontSize: '10px',
                    color: '#64748b',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Rocket size={10} color="#64748b" /> {astro.craft}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={10} color="#64748b" /> {astro.daysInSpace} {t.daysInSpace}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
