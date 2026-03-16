import React, { useState } from 'react';
import { useConfigStore, ProviderType } from '../../store/configStore';
import { PROVIDER_MODELS, testProviderConnection, AIProviderManager } from '../../core/ai/AIProviderManager';
import { useTranslation } from '../../i18n';

interface AIServiceSectionProps {
  showToast?: (msg: string) => void;
}

export const AIServiceSection: React.FC<AIServiceSectionProps> = ({ showToast }) => {
  const config = useConfigStore();
  const { t } = useTranslation();
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [testMsg, setTestMsg] = useState('');

  const handleProviderChange = (provider: ProviderType) => {
    config.setProvider(provider);
    const models = PROVIDER_MODELS[provider];
    config.setModel(models[0]?.id || '');
    AIProviderManager.clearCache();
  };

  const handleTest = async () => {
    setTestStatus('testing');
    const result = await testProviderConnection(config.provider, config.apiKey, config.model, config.baseURL);
    setTestStatus(result.success ? 'ok' : 'fail');
    setTestMsg(
      result.success
        ? t('settings.ai.test_ok').replace('{latency}', String(result.latency))
        : result.error || t('settings.ai.test_fail')
    );
  };

  const handleSave = async () => {
    const configData = {
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
      baseURL: config.baseURL,
    };
    if (window.electronAPI) {
      await window.electronAPI.saveConfig(configData);
    } else {
      localStorage.setItem('tutor_ai_api_key', config.apiKey);
    }
    AIProviderManager.clearCache();
    if (showToast) showToast(t('settings.ai.saved'));
    else alert(t('settings.ai.saved'));
  };

  const providers: Array<{ id: ProviderType; name: string }> = [
    { id: 'openai', name: 'OpenAI' },
    { id: 'claude', name: 'Claude (Anthropic)' },
    { id: 'qwen', name: '通义千问' },
    { id: 'custom', name: t('settings.ai.custom_name') },
  ];

  return (
    <div style={{ padding: '0 24px' }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>{t('settings.ai.title')}</h3>

      {/* Provider selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>{t('settings.ai.provider')}</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {providers.map(p => (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              style={{
                padding: '8px 16px', borderRadius: 8,
                border: `2px solid ${config.provider === p.id ? '#4A90E2' : '#e0e0e0'}`,
                background: config.provider === p.id ? '#4A90E2' : '#fff',
                color: config.provider === p.id ? '#fff' : '#333',
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom base URL */}
      {config.provider === 'custom' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{t('settings.ai.base_url')}</label>
          <input
            type="text"
            value={config.baseURL || ''}
            onChange={e => config.setBaseURL(e.target.value)}
            placeholder="https://your-api.example.com/v1"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, boxSizing: 'border-box' }}
          />
        </div>
      )}

      {/* API Key */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>API Key</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="password"
            value={config.apiKey}
            onChange={e => config.setApiKey(e.target.value)}
            placeholder={t('settings.ai.api_key_placeholder')}
            style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14 }}
          />
          <button
            onClick={handleTest}
            disabled={!config.apiKey || testStatus === 'testing'}
            style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #4A90E2', background: 'transparent', color: '#4A90E2', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {testStatus === 'testing' ? t('settings.ai.testing') : t('settings.ai.test')}
          </button>
        </div>
        {testMsg && (
          <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6, background: testStatus === 'ok' ? '#e8f5e9' : '#ffebee', color: testStatus === 'ok' ? '#2e7d32' : '#c62828', fontSize: 13 }}>
            {testStatus === 'ok' ? '✅ ' : '❌ '}{testMsg}
          </div>
        )}
      </div>

      {/* Model selection */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>{t('settings.ai.model')}</label>
        <select
          value={config.model}
          onChange={e => config.setModel(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14 }}
        >
          {PROVIDER_MODELS[config.provider].map(m => (
            <option key={m.id} value={m.id}>{m.name}{m.vision ? ' 👁' : ''}</option>
          ))}
        </select>
        {PROVIDER_MODELS[config.provider].find(m => m.id === config.model)?.vision && (
          <div style={{ marginTop: 6, fontSize: 13, color: '#4A90E2' }}>{t('settings.ai.vision_support')}</div>
        )}
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
