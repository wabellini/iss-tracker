import React, { useState, useEffect } from 'react';
import { Radio, Bell, Users, Globe, Maximize, Minimize, HelpCircle } from 'lucide-react';
import { useTranslations, type Language } from '../../hooks/useTranslations';

interface HeaderBarProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenCrew: () => void;
  onOpenPasses: () => void;
  onOpenGuide: () => void;
  crewCount: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  lang,
  onToggleLang,
  onOpenCrew,
  onOpenPasses,
  onOpenGuide,
  crewCount,
}) => {
  const t = useTranslations(lang);
  const [utcTime, setUtcTime] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <header
      style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 30,
        pointerEvents: 'none',
      }}
    >
      {/* Left: Brand, Live status & UTC Time */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          pointerEvents: 'auto',
        }}
      >
        {/* Main Logo Badge */}
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '9999px',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 229, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 229, 255, 0.4)',
            }}
          >
            <Radio size={14} color="#00e5ff" />
          </div>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#f8fafc',
            }}
          >
            {t.appTitle}
          </span>
        </div>

        {/* Live Badge */}
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            color: '#4ade80',
          }}
        >
          <span className="live-dot" />
          <span>{t.liveBadge}</span>
        </div>

        {/* Live UTC Clock */}
        <div
          className="glass-panel font-mono"
          style={{
            padding: '7px 14px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#94a3b8',
            letterSpacing: '0.05em',
          }}
        >
          {utcTime}
        </div>
      </div>

      {/* Right: Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'auto',
        }}
      >
        {/* Mission Guide Button (Destacado) */}
        <button
          onClick={onOpenGuide}
          className="glass-panel glass-panel-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '7px 16px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.22) 0%, rgba(14, 165, 233, 0.12) 100%)',
            border: '1px solid rgba(0, 229, 255, 0.55)',
            boxShadow: '0 0 16px rgba(0, 229, 255, 0.28)',
            color: '#f8fafc',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.02em',
            transition: 'all 0.2s ease',
          }}
        >
          <HelpCircle size={14} color="#00e5ff" />
          <span style={{ color: '#e0f2fe' }}>{t.missionGuide}</span>
        </button>

        {/* Next Passes Button */}
        <button
          onClick={onOpenPasses}
          className="glass-panel glass-panel-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '9999px',
            color: '#f8fafc',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            border: '1px solid rgba(56, 189, 248, 0.25)',
          }}
        >
          <Bell size={13} color="#38bdf8" />
          <span>{t.nextPasses}</span>
        </button>

        {/* Crew Modal Button */}
        <button
          onClick={onOpenCrew}
          className="glass-panel glass-panel-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '9999px',
            color: '#f8fafc',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            border: '1px solid rgba(56, 189, 248, 0.25)',
          }}
        >
          <Users size={13} color="#38bdf8" />
          <span>{t.crewOnboard} ({crewCount})</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={onToggleLang}
          className="glass-panel glass-panel-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '7px 12px',
            borderRadius: '9999px',
            color: '#f8fafc',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            border: '1px solid rgba(56, 189, 248, 0.25)',
          }}
        >
          <Globe size={13} color="#00e5ff" />
          <span style={{ textTransform: 'uppercase' }}>{lang}</span>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="glass-panel glass-panel-interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            color: '#f8fafc',
            cursor: 'pointer',
            border: '1px solid rgba(56, 189, 248, 0.25)',
          }}
          title={isFullscreen ? t.exitFullscreen : t.fullscreen}
        >
          {isFullscreen ? <Minimize size={14} color="#94a3b8" /> : <Maximize size={14} color="#94a3b8" />}
        </button>
      </div>
    </header>
  );
};
