import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { TelemetryCards } from './TelemetryCards';
import type { TelemetryData } from '../../types';
import type { Language } from '../../hooks/useTranslations';

interface MobileSheetProps {
  telemetry: TelemetryData;
  lang: Language;
}

export const MobileSheet: React.FC<MobileSheetProps> = ({ telemetry, lang }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="mobile-sheet-container"
      style={{
        display: 'none', // Shown only in media queries via CSS
      }}
    >
      <div
        className="glass-panel"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderBottom: 'none',
          padding: '12px 16px 24px 16px',
          zIndex: 40,
          transform: isOpen ? 'translateY(0)' : 'translateY(calc(100% - 48px))',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Handle bar */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            paddingBottom: '8px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '4px',
              backgroundColor: 'rgba(56, 189, 248, 0.4)',
              borderRadius: '2px',
              marginBottom: '6px',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
            <span>{isOpen ? 'Ocultar Telemetría' : 'Ver Telemetría Completa'}</span>
            {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </div>
        </div>

        {/* Content */}
        <div style={{ marginTop: '12px' }}>
          <TelemetryCards telemetry={telemetry} lang={lang} />
        </div>
      </div>
    </div>
  );
};
