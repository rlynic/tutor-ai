import React, { useState } from 'react';
import { AIServiceSection } from './AIServiceSection';
import { LearningSection } from './LearningSection';
import { InterfaceSection } from './InterfaceSection';
import { AboutSection } from './AboutSection';
import { useTranslation } from '../../i18n';

type NavItem = 'ai' | 'learning' | 'interface' | 'about';

interface SettingsProps {
  onClose: () => void;
  showToast?: (msg: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose, showToast }) => {
  const [activeNav, setActiveNav] = useState<NavItem>('ai');
  const { t } = useTranslation();

  const NAV_ITEMS: Array<{ id: NavItem; label: string }> = [
    { id: 'ai', label: t('settings.nav.ai') },
    { id: 'learning', label: t('settings.nav.learning') },
    { id: 'interface', label: t('settings.nav.interface') },
    { id: 'about', label: t('settings.nav.about') },
  ];

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        {/* Left nav */}
        <div className="settings-nav">
          <div className="settings-nav-title">{t('settings.title')}</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`settings-nav-btn${activeNav === item.id ? ' active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div className="settings-content">
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 24, marginBottom: 16 }}>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              ✕
            </button>
          </div>
          {activeNav === 'ai' && <AIServiceSection showToast={showToast} />}
          {activeNav === 'learning' && <LearningSection showToast={showToast} />}
          {activeNav === 'interface' && <InterfaceSection showToast={showToast} />}
          {activeNav === 'about' && <AboutSection />}
        </div>
      </div>
    </div>
  );
};
