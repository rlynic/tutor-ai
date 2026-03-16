import React from 'react';
import { useConfigStore, Language } from '../../store/configStore';
import { useTranslation } from '../../i18n';

interface InterfaceSectionProps {
  showToast?: (msg: string) => void;
}

export const InterfaceSection: React.FC<InterfaceSectionProps> = ({ showToast }) => {
  const config = useConfigStore();
  const { t } = useTranslation();

  const handleSave = async () => {
    const data = { theme: config.theme, fontSize: config.fontSize, animationSpeed: config.animationSpeed, language: config.language };
    if (window.electronAPI) {
      await window.electronAPI.saveConfig(data);
    }
    if (showToast) showToast(t('settings.saved'));
    else alert(t('settings.saved'));
  };

  return (
    <div style={{ padding: '0 24px' }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>{t('settings.interface.title')}</h3>

      {/* Theme */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>{t('settings.theme')}</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['light', 'dark'] as const).map(th => (
            <button
              key={th}
              onClick={() => config.setTheme(th)}
              style={{
                padding: '10px 24px', borderRadius: 8,
                border: `2px solid ${config.theme === th ? '#4A90E2' : '#e0e0e0'}`,
                background: config.theme === th ? '#4A90E2' : '#fff',
                color: config.theme === th ? '#fff' : '#666',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              {th === 'light' ? t('settings.theme_light') : t('settings.theme_dark')}
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
          {t('settings.font_size_label').replace('{n}', String(config.fontSize))}
        </label>
        <input
          type="range"
          min={12}
          max={24}
          value={config.fontSize}
          onChange={e => config.setFontSize(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999' }}>
          <span>12px（{t('settings.font_size_small')}）</span>
          <span>24px（{t('settings.font_size_large')}）</span>
        </div>
      </div>

      {/* Animation speed */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
          {t('settings.anim_speed')}：{config.animationSpeed === 0.5 ? t('settings.anim_slow') : config.animationSpeed === 1 ? t('settings.anim_normal') : t('settings.anim_fast')}
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0.5, 1, 2].map(s => (
            <button
              key={s}
              onClick={() => config.setAnimationSpeed(s)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8,
                border: `2px solid ${config.animationSpeed === s ? '#4A90E2' : '#e0e0e0'}`,
                background: config.animationSpeed === s ? '#4A90E2' : '#fff',
                color: config.animationSpeed === s ? '#fff' : '#666',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              {s === 0.5 ? t('settings.anim_slow') : s === 1 ? t('settings.anim_normal') : t('settings.anim_fast')}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>{t('settings.language')}</label>
        <select
          value={config.language}
          onChange={e => config.setLanguage(e.target.value as Language)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '2px solid var(--border-color, #e0e0e0)',
            background: 'var(--bg-canvas, #fff)',
            color: 'var(--text-primary, #333)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <option value="zh-CN">🇨🇳 中文</option>
          <option value="en-US">🇺🇸 English</option>
          <option value="ja-JP">🇯🇵 日本語</option>
          <option value="ko-KR">🇰🇷 한국어</option>
          <option value="es-ES">🇪🇸 Español</option>
          <option value="fr-FR">🇫🇷 Français</option>
        </select>
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
