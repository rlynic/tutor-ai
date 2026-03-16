import React, { useState } from 'react';
import { useTranslation } from '../../i18n';

export const AboutSection: React.FC = () => {
  const { t } = useTranslation();
  const [clearing, setClearing] = useState(false);

  const handleClearData = async () => {
    if (!confirm(t('settings.about.confirm_clear'))) return;
    setClearing(true);
    try {
      if (window.electronAPI) {
        const sessions = await window.electronAPI.getAllSessions();
        for (const s of sessions) {
          await window.electronAPI.deleteSession(s.id);
        }
      } else {
        localStorage.clear();
      }
      alert(t('settings.about.cleared'));
    } finally {
      setClearing(false);
    }
  };

  return (
    <div style={{ padding: '0 24px' }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>{t('settings.about.title')}</h3>

      <div style={{ background: '#f5f7fa', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 48 }}>📐</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>TutorAI</div>
            <div style={{ color: '#666', fontSize: 14 }}>{t('settings.about.subtitle')}</div>
            <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{t('settings.about.version')}</div>
          </div>
        </div>
        <div style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>
          {t('settings.about.description')}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontWeight: 600, marginBottom: 12 }}>{t('settings.about.tech_stack')}</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['Electron', 'React', 'TypeScript', 'Konva.js', 'SQLite', 'Zustand'].map(tech => (
            <span key={tech} style={{ padding: '4px 12px', borderRadius: 20, background: '#e3f2fd', color: '#1565c0', fontSize: 13 }}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
        <h4 style={{ fontWeight: 600, marginBottom: 12, color: '#c62828' }}>{t('settings.about.danger')}</h4>
        <button
          onClick={handleClearData}
          disabled={clearing}
          style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #c62828', background: '#fff', color: '#c62828', cursor: 'pointer', fontWeight: 600 }}
        >
          {clearing ? t('settings.about.clearing') : t('settings.about.clear')}
        </button>
        <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>{t('settings.about.clear_hint')}</div>
      </div>
    </div>
  );
};
