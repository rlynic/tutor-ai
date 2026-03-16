import React from 'react';
import { useConfigStore } from '../../store/configStore';
import { useTranslation } from '../../i18n';

interface LearningSectionProps {
  showToast?: (msg: string) => void;
}

export const LearningSection: React.FC<LearningSectionProps> = ({ showToast }) => {
  const config = useConfigStore();
  const { t } = useTranslation();

  const handleSave = async () => {
    const data = { grade: config.grade, maxTurns: config.maxTurns };
    if (window.electronAPI) {
      await window.electronAPI.saveConfig(data);
    }
    if (showToast) showToast(t('settings.learning.saved'));
    else alert(t('settings.learning.saved'));
  };

  return (
    <div style={{ padding: '0 24px' }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>{t('settings.learning.title')}</h3>

      {/* Grade selection */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>{t('settings.learning.grade')}</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[3, 4, 5, 6].map(g => (
            <button
              key={g}
              onClick={() => config.setGrade(g)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8,
                border: `2px solid ${config.grade === g ? '#4A90E2' : '#e0e0e0'}`,
                background: config.grade === g ? '#4A90E2' : '#fff',
                color: config.grade === g ? '#fff' : '#666',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              {g}{t('settings.learning.grade_unit')}
            </button>
          ))}
        </div>
      </div>

      {/* Max turns */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
          {t('settings.learning.max_turns').replace('{n}', String(config.maxTurns))}
        </label>
        <input
          type="range"
          min={3}
          max={10}
          value={config.maxTurns}
          onChange={e => useConfigStore.setState({ maxTurns: Number(e.target.value) })}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999' }}>
          <span>3（{t('settings.learning.concise')}）</span>
          <span>10（{t('settings.learning.detailed')}）</span>
        </div>
      </div>

      <button
        onClick={handleSave}
        style={{ padding: '10px 28px', borderRadius: 8, border: 'none', background: '#4A90E2', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
      >
        {t('settings.save')}
      </button>
    </div>
  );
};
