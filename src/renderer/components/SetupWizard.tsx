import React, { useState } from 'react';
import { useConfigStore, ProviderType, Language } from '../store/configStore';
import { PROVIDER_MODELS, testProviderConnection } from '../core/ai/AIProviderManager';

interface SetupWizardProps {
  onComplete: () => void;
}

// Compact translations for wizard-specific copy only
const W: Record<Language, {
  steps: string[];
  welcome: string; subtitle: string; langLabel: string;
  providerTitle: string; providerSub: string;
  apiKeyTitle: string; apiKeySub: Record<ProviderType, string>; baseUrlLabel: string; apiKeyLabel: string; testBtn: string; testing: string;
  modelTitle: string; modelSub: string; gradeLabel: string;
  doneTitle: string; doneSub: string;
  prev: string; next: string; start: string;
}> = {
  'zh-CN': {
    steps: ['欢迎', '选择服务商', '填写 API Key', '选择模型', '完成'],
    welcome: '欢迎使用 TutorAI', subtitle: 'AI 驱动的小学数学辅导助手\n通过 Socratic 教学法，引导孩子自主思考\n配合动态图形演示，让抽象数学变得直观有趣',
    langLabel: '🌐 选择界面语言',
    providerTitle: '选择 AI 服务商', providerSub: '请选择你已有 API Key 的服务商',
    apiKeyTitle: '输入 API Key',
    apiKeySub: { openai: '请输入 OpenAI API Key（以 sk- 开头）', claude: '请输入 Anthropic API Key（以 sk-ant- 开头）', qwen: '请输入阿里云灵积 DashScope API Key', custom: '请输入自定义接口地址和 API Key' },
    baseUrlLabel: '接口地址（Base URL）', apiKeyLabel: 'API Key', testBtn: '测试连接', testing: '测试中...',
    modelTitle: '选择模型', modelSub: '选择用于辅导的 AI 模型', gradeLabel: '学生年级',
    doneTitle: '设置完成！', doneSub: 'TutorAI 已准备好为你的孩子提供个性化数学辅导\n让我们开始学习之旅吧！',
    prev: '上一步', next: '下一步', start: '开始使用 🚀',
  },
  'en-US': {
    steps: ['Welcome', 'Provider', 'API Key', 'Model', 'Done'],
    welcome: 'Welcome to TutorAI', subtitle: 'AI-powered elementary math tutor\nGuides children through Socratic questioning\nDynamic visuals make abstract math intuitive',
    langLabel: '🌐 Select Language',
    providerTitle: 'Choose AI Provider', providerSub: 'Select the provider whose API Key you have',
    apiKeyTitle: 'Enter API Key',
    apiKeySub: { openai: 'Enter your OpenAI API Key (starts with sk-)', claude: 'Enter your Anthropic API Key (starts with sk-ant-)', qwen: 'Enter your Alibaba DashScope API Key', custom: 'Enter the base URL and API Key for your custom endpoint' },
    baseUrlLabel: 'Base URL', apiKeyLabel: 'API Key', testBtn: 'Test Connection', testing: 'Testing...',
    modelTitle: 'Select Model', modelSub: 'Choose the AI model for tutoring', gradeLabel: 'Student Grade',
    doneTitle: 'Setup Complete!', doneSub: 'TutorAI is ready to provide personalized math tutoring\nLet\'s start the learning journey!',
    prev: 'Back', next: 'Next', start: 'Get Started 🚀',
  },
  'ja-JP': {
    steps: ['ようこそ', 'サービス', 'APIキー', 'モデル', '完了'],
    welcome: 'TutorAI へようこそ', subtitle: 'AI 搭載の算数家庭教師\nソクラテス式問答で子供の思考力を育む\n動的な図形演示で抽象的な算数を直感的に',
    langLabel: '🌐 言語を選択',
    providerTitle: 'AI サービスを選択', providerSub: 'API Key をお持ちのサービスを選択してください',
    apiKeyTitle: 'API Key を入力',
    apiKeySub: { openai: 'OpenAI API Key（sk- で始まる）を入力', claude: 'Anthropic API Key（sk-ant- で始まる）を入力', qwen: '阿里云 DashScope API Key を入力', custom: 'カスタムエンドポイントの URL と API Key を入力' },
    baseUrlLabel: 'Base URL', apiKeyLabel: 'API Key', testBtn: '接続テスト', testing: 'テスト中...',
    modelTitle: 'モデルを選択', modelSub: 'チュータリングに使用するモデルを選択', gradeLabel: '学年',
    doneTitle: '設定完了！', doneSub: 'TutorAI はお子様に個別指導を提供する準備ができました\n学習の旅を始めましょう！',
    prev: '前へ', next: '次へ', start: '始める 🚀',
  },
  'ko-KR': {
    steps: ['환영', '서비스', 'API 키', '모델', '완료'],
    welcome: 'TutorAI에 오신 것을 환영합니다', subtitle: 'AI 기반 초등 수학 튜터\n소크라테스식 질문으로 사고력 향상\n동적 시각화로 추상적 수학을 직관적으로',
    langLabel: '🌐 언어 선택',
    providerTitle: 'AI 서비스 선택', providerSub: 'API 키가 있는 서비스를 선택하세요',
    apiKeyTitle: 'API 키 입력',
    apiKeySub: { openai: 'OpenAI API 키 입력 (sk- 로 시작)', claude: 'Anthropic API 키 입력 (sk-ant- 로 시작)', qwen: '알리바바 DashScope API 키 입력', custom: '커스텀 엔드포인트 URL과 API 키 입력' },
    baseUrlLabel: 'Base URL', apiKeyLabel: 'API 키', testBtn: '연결 테스트', testing: '테스트 중...',
    modelTitle: '모델 선택', modelSub: '튜터링에 사용할 AI 모델 선택', gradeLabel: '학년',
    doneTitle: '설정 완료!', doneSub: 'TutorAI가 맞춤형 수학 지도를 제공할 준비가 되었습니다\n학습 여정을 시작합시다!',
    prev: '이전', next: '다음', start: '시작하기 🚀',
  },
  'es-ES': {
    steps: ['Bienvenido', 'Proveedor', 'API Key', 'Modelo', 'Listo'],
    welcome: 'Bienvenido a TutorAI', subtitle: 'Tutor de matemáticas con IA\nGuía a los niños con el método socrático\nVisualizaciones dinámicas hacen las mates intuitivas',
    langLabel: '🌐 Seleccionar idioma',
    providerTitle: 'Elige el proveedor de IA', providerSub: 'Selecciona el proveedor cuya API Key tienes',
    apiKeyTitle: 'Introduce la API Key',
    apiKeySub: { openai: 'Introduce tu API Key de OpenAI (empieza con sk-)', claude: 'Introduce tu API Key de Anthropic (empieza con sk-ant-)', qwen: 'Introduce tu API Key de Alibaba DashScope', custom: 'Introduce la URL base y API Key del endpoint personalizado' },
    baseUrlLabel: 'URL Base', apiKeyLabel: 'API Key', testBtn: 'Probar conexión', testing: 'Probando...',
    modelTitle: 'Seleccionar modelo', modelSub: 'Elige el modelo de IA para la tutoría', gradeLabel: 'Curso del alumno',
    doneTitle: '¡Configuración completada!', doneSub: 'TutorAI está listo para ofrecer tutoría personalizada\n¡Comencemos el viaje de aprendizaje!',
    prev: 'Anterior', next: 'Siguiente', start: 'Empezar 🚀',
  },
  'fr-FR': {
    steps: ['Bienvenue', 'Service', 'Clé API', 'Modèle', 'Terminé'],
    welcome: 'Bienvenue sur TutorAI', subtitle: 'Assistant math IA pour l\'école primaire\nMéthode socratique pour guider la réflexion\nVisualisations dynamiques pour rendre les maths intuitives',
    langLabel: '🌐 Choisir la langue',
    providerTitle: 'Choisir le fournisseur IA', providerSub: 'Sélectionnez le fournisseur dont vous avez la clé API',
    apiKeyTitle: 'Entrer la clé API',
    apiKeySub: { openai: 'Entrez votre clé API OpenAI (commence par sk-)', claude: 'Entrez votre clé API Anthropic (commence par sk-ant-)', qwen: 'Entrez votre clé API Alibaba DashScope', custom: 'Entrez l\'URL de base et la clé API de votre endpoint' },
    baseUrlLabel: 'URL de base', apiKeyLabel: 'Clé API', testBtn: 'Tester la connexion', testing: 'Test en cours...',
    modelTitle: 'Sélectionner le modèle', modelSub: 'Choisissez le modèle IA pour le tutorat', gradeLabel: 'Niveau de l\'élève',
    doneTitle: 'Configuration terminée !', doneSub: 'TutorAI est prêt à offrir un tutorat personnalisé\nCommençons le voyage d\'apprentissage !',
    prev: 'Précédent', next: 'Suivant', start: 'Commencer 🚀',
  },
};

const LANGUAGES: Array<{ id: Language; label: string; flag: string }> = [
  { id: 'zh-CN', label: '中文', flag: '🇨🇳' },
  { id: 'en-US', label: 'English', flag: '🇺🇸' },
  { id: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  { id: 'ko-KR', label: '한국어', flag: '🇰🇷' },
  { id: 'es-ES', label: 'Español', flag: '🇪🇸' },
  { id: 'fr-FR', label: 'Français', flag: '🇫🇷' },
];

const PROVIDER_DESCS: Record<Language, Record<ProviderType, string>> = {
  'zh-CN': { openai: 'GPT-5.4 / GPT-4.1 等', claude: 'Claude Opus 4.6 / Sonnet 4.6', qwen: 'Qwen3 Max / Qwen3.5 Plus 等', custom: '任意 OpenAI 兼容接口' },
  'en-US': { openai: 'GPT-5.4 / GPT-4.1 etc.', claude: 'Claude Opus 4.6 / Sonnet 4.6', qwen: 'Qwen3 Max / Qwen3.5 Plus etc.', custom: 'Any OpenAI-compatible API' },
  'ja-JP': { openai: 'GPT-5.4 / GPT-4.1 など', claude: 'Claude Opus 4.6 / Sonnet 4.6', qwen: 'Qwen3 Max / Qwen3.5 Plus など', custom: 'OpenAI 互換 API' },
  'ko-KR': { openai: 'GPT-5.4 / GPT-4.1 등', claude: 'Claude Opus 4.6 / Sonnet 4.6', qwen: 'Qwen3 Max / Qwen3.5 Plus 등', custom: 'OpenAI 호환 API' },
  'es-ES': { openai: 'GPT-5.4 / GPT-4.1 etc.', claude: 'Claude Opus 4.6 / Sonnet 4.6', qwen: 'Qwen3 Max / Qwen3.5 Plus etc.', custom: 'API compatible con OpenAI' },
  'fr-FR': { openai: 'GPT-5.4 / GPT-4.1 etc.', claude: 'Claude Opus 4.6 / Sonnet 4.6', qwen: 'Qwen3 Max / Qwen3.5 Plus etc.', custom: 'API compatible OpenAI' },
};

const PROVIDER_ICONS: Record<ProviderType, string> = { openai: '🤖', claude: '🧠', qwen: '🌊', custom: '⚙️' };
const PROVIDER_NAMES: Record<ProviderType, string> = { openai: 'OpenAI', claude: 'Claude (Anthropic)', qwen: '通义千问 (Qwen)', custom: 'Custom API' };
const GRADE_LABELS: Record<Language, (g: number) => string> = {
  'zh-CN': (g) => `${g}年级`,
  'en-US': (g) => `Grade ${g}`,
  'ja-JP': (g) => `${g}年生`,
  'ko-KR': (g) => `${g}학년`,
  'es-ES': (g) => `${g}° grado`,
  'fr-FR': (g) => `CE${g - 1}`,
};

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>('openai');
  const [apiKey, setApiKeyLocal] = useState('');
  const [baseURL, setBaseURL] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-5.4');
  const [grade, setGrade] = useState(4);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [testMsg, setTestMsg] = useState('');

  const config = useConfigStore();
  const lang = config.language;
  const copy = W[lang];

  const handleSelectLanguage = (l: Language) => {
    // Immediately apply to global store so all translations update in real-time
    config.setLanguage(l);
  };

  const handleSelectProvider = (p: ProviderType) => {
    setSelectedProvider(p);
    setSelectedModel(PROVIDER_MODELS[p][0]?.id || '');
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMsg('');
    const result = await testProviderConnection(selectedProvider, apiKey, selectedModel, baseURL || undefined);
    if (result.success) {
      setTestStatus('ok');
      setTestMsg(`${result.latency}ms`);
    } else {
      setTestStatus('fail');
      setTestMsg(result.error || 'Failed');
    }
  };

  const handleFinish = () => {
    config.setProvider(selectedProvider);
    config.setApiKey(apiKey);
    config.setModel(selectedModel);
    if (baseURL) config.setBaseURL(baseURL);
    config.setGrade(grade);
    config.setFirstLaunchDone();

    if (window.electronAPI) {
      window.electronAPI.saveConfig({
        provider: selectedProvider,
        apiKey,
        model: selectedModel,
        baseURL: baseURL || undefined,
        grade,
        isFirstLaunch: false,
      });
    } else {
      localStorage.setItem('tutor_ai_api_key', apiKey);
    }
    onComplete();
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) {
      if (!apiKey.trim()) return false;
      if (selectedProvider === 'custom' && !baseURL.trim()) return false;
      return true;
    }
    if (step === 3) return !!selectedModel;
    return true;
  };

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, boxSizing: 'border-box' as const };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f7fa' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 48, width: 560, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32, gap: 8 }}>
          {copy.steps.map((_s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i <= step ? '#4A90E2' : '#e0e0e0',
                color: i <= step ? '#fff' : '#999',
                fontSize: 13, fontWeight: 600,
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < copy.steps.length - 1 && <div style={{ width: 32, height: 2, background: i < step ? '#4A90E2' : '#e0e0e0' }} />}
            </div>
          ))}
        </div>

        {/* Step 0: Welcome + Language */}
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <img src="/icon.png" style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: 20, borderRadius: 24 }} />
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>{copy.welcome}</h1>
            <p style={{ color: '#666', fontSize: 15, lineHeight: 1.7, marginBottom: 28, whiteSpace: 'pre-line' }}>
              {copy.subtitle}
            </p>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 10 }}>{copy.langLabel}</div>
              <select
                value={lang}
                onChange={e => handleSelectLanguage(e.target.value as Language)}
                style={{ ...inputStyle, cursor: 'pointer', fontWeight: 500 }}
              >
                {LANGUAGES.map(l => (
                  <option key={l.id} value={l.id}>{l.flag} {l.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 1: Choose Provider */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{copy.providerTitle}</h2>
            <p style={{ color: '#666', marginBottom: 24 }}>{copy.providerSub}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {(['openai', 'claude', 'qwen', 'custom'] as ProviderType[]).map(p => (
                <div
                  key={p}
                  onClick={() => handleSelectProvider(p)}
                  style={{
                    padding: 16, borderRadius: 12, border: `2px solid ${selectedProvider === p ? '#4A90E2' : '#e0e0e0'}`,
                    cursor: 'pointer', background: selectedProvider === p ? '#f0f7ff' : '#fff',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{PROVIDER_ICONS[p]}</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{PROVIDER_NAMES[p]}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{PROVIDER_DESCS[lang][p]}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: API Key */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{copy.apiKeyTitle}</h2>
            <p style={{ color: '#666', marginBottom: 24 }}>{copy.apiKeySub[selectedProvider]}</p>

            {selectedProvider === 'custom' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{copy.baseUrlLabel}</label>
                <input type="text" placeholder="https://your-api.example.com/v1" value={baseURL} onChange={e => setBaseURL(e.target.value)} style={inputStyle} />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{copy.apiKeyLabel}</label>
              <input type="password" placeholder="..." value={apiKey} onChange={e => setApiKeyLocal(e.target.value)} style={inputStyle} />
            </div>

            <button
              onClick={handleTestConnection}
              disabled={!apiKey.trim() || testStatus === 'testing'}
              style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #4A90E2', background: 'transparent', color: '#4A90E2', cursor: 'pointer', fontSize: 14 }}
            >
              {testStatus === 'testing' ? copy.testing : copy.testBtn}
            </button>

            {testMsg && (
              <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: testStatus === 'ok' ? '#e8f5e9' : '#ffebee', color: testStatus === 'ok' ? '#2e7d32' : '#c62828', fontSize: 14 }}>
                {testStatus === 'ok' ? '✅ ' : '❌ '}{testMsg}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Select Model */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{copy.modelTitle}</h2>
            <p style={{ color: '#666', marginBottom: 16 }}>{copy.modelSub}</p>

            <div style={{ marginBottom: 24, maxHeight: 200, overflowY: 'auto' }}>
              {PROVIDER_MODELS[selectedProvider].map(m => (
                <label key={m.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderRadius: 8, border: `1px solid ${selectedModel === m.id ? '#4A90E2' : '#e0e0e0'}`, marginBottom: 8, cursor: 'pointer', background: selectedModel === m.id ? '#f0f7ff' : '#fff' }}>
                  <input type="radio" name="model" value={m.id} checked={selectedModel === m.id} onChange={() => setSelectedModel(m.id)} style={{ marginRight: 12 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                    {m.vision && <div style={{ fontSize: 11, color: '#4A90E2', marginTop: 2 }}>👁 Vision</div>}
                  </div>
                </label>
              ))}
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>{copy.gradeLabel}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[3, 4, 5, 6].map(g => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8,
                      border: `2px solid ${grade === g ? '#4A90E2' : '#e0e0e0'}`,
                      background: grade === g ? '#4A90E2' : '#fff',
                      color: grade === g ? '#fff' : '#666',
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {GRADE_LABELS[lang](g)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{copy.doneTitle}</h2>
            <p style={{ color: '#666', fontSize: 16, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{copy.doneSub}</p>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
          <button
            onClick={() => setStep(prev => prev - 1)}
            style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #e0e0e0', background: '#fff', cursor: step === 0 ? 'not-allowed' : 'pointer', color: '#666', visibility: step === 0 ? 'hidden' : 'visible' }}
          >
            {copy.prev}
          </button>

          {step < copy.steps.length - 1 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              disabled={!canProceed()}
              style={{ padding: '10px 32px', borderRadius: 8, border: 'none', background: canProceed() ? '#4A90E2' : '#ccc', color: '#fff', fontWeight: 600, cursor: canProceed() ? 'pointer' : 'not-allowed', fontSize: 16 }}
            >
              {copy.next}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              style={{ padding: '10px 32px', borderRadius: 8, border: 'none', background: '#4A90E2', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}
            >
              {copy.start}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
