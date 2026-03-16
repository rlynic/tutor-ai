import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { CanvasEngine } from './core/graphic/CanvasEngine';
import { matchScript, DialogScript, ScriptStep } from './core/dialog/scripts';
import { useDialogStore, WELCOME_MESSAGE_KEY } from './store/dialogStore';
import { useConfigStore } from './store/configStore';
import { useGraphicStore } from './store/graphicStore';
import { AIProviderManager } from './core/ai/AIProviderManager';
import { IAIService, GraphicStep } from './core/ai/IAIService';
import { SetupWizard } from './components/SetupWizard';
import { Settings } from './components/Settings';
import { HistorySidebar } from './components/HistorySidebar';
import { OcrCropModal } from './components/OcrCropModal';
import { GraphicPanel } from './components/GraphicPanel';
import { createOCRService, fileToBase64 } from './core/ocr/OCRFactory';
import { useTranslation } from './i18n';
import { StorageService } from './core/storage/StorageService';
import { KnowledgeService } from './core/knowledge/KnowledgeService';

function App() {
  const { t } = useTranslation();
  const [questionText, setQuestionText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLearning, setIsLearning] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [isOCRLoading, setIsOCRLoading] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [ocrPreview, setOcrPreview] = useState<{ dataURL: string; text: string } | null>(null);
  const [ocrImagePending, setOcrImagePending] = useState<{ dataURL: string; base64: string } | null>(null);
  const [canvasHint, setCanvasHint] = useState<string | null>(null);
  const [graphicStepsPlayed, setGraphicStepsPlayed] = useState(0);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [questionPeek, setQuestionPeek] = useState(false);

  // Fix 2: completion modal state
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionStats, setCompletionStats] = useState<{
    questionText: string; turnCount: number; durationSec: number;
  } | null>(null);
  const sessionStartTimeRef = useRef<number>(0);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Stores
  const { messages, inputMessage, setInputMessage, addMessage, resetMessages, getHistoryForAI } = useDialogStore();
  const config = useConfigStore();
  const { animationState, setAnimationState } = useGraphicStore();

  // Fix 4: storage + knowledge services
  const storageService = useMemo(() => new StorageService(), []);
  const knowledgeService = useMemo(() => new KnowledgeService(), []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAIThinking]);

  // Script-based dialog refs
  const scriptRef = useRef<DialogScript | null>(null);
  const stepRef = useRef(0);
  const questionRef = useRef('');

  // Canvas
  const canvasBoxRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const engineReady = useRef(false);

  // AI service
  const aiServiceRef = useRef<IAIService | null>(null);

  // Replay cache — stores last played graphic instructions
  const lastInstructionsRef = useRef<any[]>([]);

  // Load config from storage on mount
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getConfig().then((storedConfig) => {
        if (storedConfig && Object.keys(storedConfig).length > 0) {
          config.loadFromStorage(storedConfig);
          if (storedConfig.apiKey) {
            aiServiceRef.current = AIProviderManager.createProvider(
              storedConfig.provider || 'openai',
              {
                apiKey: storedConfig.apiKey,
                model: storedConfig.model,
                baseURL: storedConfig.baseURL,
              }
            );
          }
        }
      }).catch(() => {
        const savedKey = localStorage.getItem('tutor_ai_api_key');
        if (savedKey) {
          config.setApiKey(savedKey);
          aiServiceRef.current = AIProviderManager.createProvider('openai', { apiKey: savedKey });
        }
      });
    } else {
      const savedKey = localStorage.getItem('tutor_ai_api_key');
      if (savedKey) {
        config.setApiKey(savedKey);
        aiServiceRef.current = AIProviderManager.createProvider('openai', { apiKey: savedKey });
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', config.theme);
  }, [config.theme]);

  // Apply font size CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', config.fontSize + 'px');
  }, [config.fontSize]);

  // Apply animation speed to canvas engine
  useEffect(() => {
    engineRef.current?.setSpeed(config.animationSpeed);
  }, [config.animationSpeed]);

  // Rebuild AI service when config changes
  useEffect(() => {
    if (config.apiKey) {
      aiServiceRef.current = AIProviderManager.createProvider(config.provider, {
        apiKey: config.apiKey,
        model: config.model,
        baseURL: config.baseURL,
      });
    } else {
      aiServiceRef.current = null;
    }
  }, [config.apiKey, config.provider, config.model, config.baseURL]);

  // Canvas lifecycle — ResizeObserver ensures we initialize with correct dimensions
  const initEngine = useCallback(() => {
    if (engineReady.current || !canvasBoxRef.current) return;
    try {
      const box = canvasBoxRef.current;
      const w = box.clientWidth || 600;
      const h = box.clientHeight || 400;
      if (w < 10 || h < 10) return;
      const engine = new CanvasEngine();
      engine.init(box, w, h);
      engine.setSpeed(config.animationSpeed);
      engineRef.current = engine;
      engineReady.current = true;
      console.log('[TutorAI] Canvas engine initialized', w, h);
    } catch (err) {
      console.error('[TutorAI] Canvas init failed', err);
    }
  }, []);

  useEffect(() => {
    if (!canvasBoxRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (engineReady.current) return;
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width < 10 || height < 10) return;
      initEngine();
    });
    observer.observe(canvasBoxRef.current);
    initEngine();

    return () => {
      observer.disconnect();
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
        engineReady.current = false;
      }
    };
  }, [initEngine]);

  // Fix 4: save current session to storage
  const saveCurrentSession = useCallback(() => {
    if (!questionRef.current || messages.length === 0) return;
    storageService.saveSession({
      id: `session_${Date.now()}`,
      questionText: questionRef.current,
      messages: [...messages],
      graphicStates: [...lastInstructionsRef.current],
      createdAt: sessionStartTimeRef.current,
      updatedAt: Date.now(),
    }).catch(err => console.error('[TutorAI] saveSession failed', err));
    const topic = questionRef.current.slice(0, 20);
    knowledgeService.updateMastery(topic, topic, true)
      .catch(err => console.error('[TutorAI] updateMastery failed', err));
  }, [messages, storageService, knowledgeService]);

  // Execute a script step
  const executeStep = useCallback(async (step: ScriptStep) => {
    addMessage({ role: 'assistant', content: step.reply });

    if (step.graphicInstructions && engineRef.current) {
      setAnimationState('playing');
      for (const instruction of step.graphicInstructions) {
        try {
          await engineRef.current.execute(instruction);
        } catch (err) {
          console.error('[TutorAI] Graphic instruction failed', err);
        }
      }
      setAnimationState('idle');
    }
  }, [addMessage, setAnimationState]);

  // Execute AI response (supports step-by-step graphicSteps and legacy graphicInstructions)
  const executeAIResponse = useCallback(async (
    reply: string,
    graphicSteps?: GraphicStep[],
    graphicInstructions?: any[],
    isFinal?: boolean
  ) => {
    addMessage({ role: 'assistant', content: reply });

    if (graphicSteps && graphicSteps.length > 0 && engineRef.current) {
      // Only clear when this is a fresh full explanation (3+ steps), not a follow-up addition
      if (graphicSteps.length >= 3) {
        engineRef.current.clear();
        lastInstructionsRef.current = [];
      }
      const allInstructions: any[] = [...lastInstructionsRef.current];
      setAnimationState('playing');
      try {
        for (const step of graphicSteps) {
          if (step.hint) {
            setCanvasHint(step.hint);
            await new Promise(r => setTimeout(r, 500));
          }
          for (const instr of step.instructions) {
            try {
              await engineRef.current!.execute(instr);
              allInstructions.push(instr);
            } catch (err) {
              console.error('[TutorAI] Graphic instruction failed', err);
            }
          }
          await new Promise(r => setTimeout(r, 600));
        }
        lastInstructionsRef.current = allInstructions;
        setGraphicStepsPlayed(prev => prev + graphicSteps.length);
      } finally {
        setCanvasHint(null);
        setAnimationState('idle');
      }
    } else if (graphicInstructions && graphicInstructions.length > 0 && engineRef.current) {
      engineRef.current.clear();
      lastInstructionsRef.current = graphicInstructions;
      setAnimationState('playing');
      try {
        for (const instruction of graphicInstructions) {
          try {
            await engineRef.current!.execute(instruction);
          } catch (err) {
            console.error('[TutorAI] Graphic instruction failed', err);
          }
        }
      } finally {
        setAnimationState('idle');
      }
    }

    // Show completion modal when isFinal, regardless of whether there were graphic steps
    if (isFinal) {
      const durationSec = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
      setCompletionStats({
        questionText: questionRef.current,
        turnCount: messages.length,
        durationSec,
      });
      setIsLearning(false);
      setShowCompletion(true);
      saveCurrentSession();
      questionRef.current = '';
    }
  }, [addMessage, setAnimationState, setCanvasHint, messages.length, saveCurrentSession]);

  // Start tutoring session
  const handleStartTutoring = useCallback(async () => {
    if (!questionText.trim()) return;

    if (!engineReady.current) initEngine();
    if (engineRef.current) engineRef.current.clear();

    questionRef.current = questionText;
    sessionStartTimeRef.current = Date.now(); // Fix 2: record start time
    resetMessages();
    setQuestionPeek(false);

    if (config.apiKey && aiServiceRef.current) {
      setUseAI(true);
      setIsLearning(true);

      try {
        setIsAIThinking(true);
        const response = await aiServiceRef.current.chat([], questionText, { grade: config.grade, maxTurns: config.maxTurns, language: config.language });
        setIsAIThinking(false);
        await executeAIResponse(response.reply, response.graphicSteps, response.graphicInstructions, response.isFinal);
      } catch (err) {
        setIsAIThinking(false);
        console.error('[TutorAI] AI service failed, fallback to script mode', err);
        setUseAI(false);
        const script = matchScript(questionText);

        if (script) {
          addMessage({ role: 'assistant', content: '⚠️ AI 服务暂时不可用，已切换到演示模式。' });
          scriptRef.current = script;
          stepRef.current = 0;
          try {
            await executeStep(script.steps[0]);
          } catch (stepErr) {
            console.error('[TutorAI] Script execution failed', stepErr);
            addMessage({ role: 'assistant', content: '抱歉，演示模式也出错了 😅 请刷新页面重试。' });
            setIsLearning(false);
          }
        } else {
          addMessage({ role: 'assistant', content: '抱歉，AI 服务暂时不可用，且当前题目不支持演示模式 😅\n\n💡 提示：试试输入含有"长方形"、"面积"的题目。' });
          setIsLearning(false);
        }
      }
    } else {
      const script = matchScript(questionText);
      if (!script) {
        addMessage({ role: 'assistant', content: '抱歉，我暂时还不能讲解这类题目 😅\n\n💡 提示：\n1. 试试输入含有"长方形"、"面积"的题目\n2. 或者在设置中填入 API Key，我就能理解任意数学题了！' });
        return;
      }

      setUseAI(false);
      scriptRef.current = script;
      stepRef.current = 0;
      setIsLearning(true);
      await executeStep(script.steps[0]);
    }
  }, [questionText, config.apiKey, initEngine, executeStep, executeAIResponse, addMessage, resetMessages]);

  // Stop learning session
  const handleStopLearning = useCallback(() => {
    // Fix 4: save partial session if there was meaningful dialogue
    if (messages.length > 1) {
      saveCurrentSession();
    }
    setIsLearning(false);
    setGraphicStepsPlayed(0);
    setIsAIThinking(false);
    setQuestionPeek(false);
    scriptRef.current = null;
    stepRef.current = 0;
    questionRef.current = '';
    lastInstructionsRef.current = [];
    if (engineRef.current) engineRef.current.clear();
  }, [messages.length, saveCurrentSession]);

  // Send message in dialog
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !isLearning) return;

    const userMsg = inputMessage.trim();
    addMessage({ role: 'user', content: userMsg });
    setInputMessage('');

    if (useAI && aiServiceRef.current) {
      try {
        const history = getHistoryForAI();
        history.push({ role: 'user', content: userMsg });

        setIsAIThinking(true);
        const response = await aiServiceRef.current.chat(history, questionRef.current, { grade: config.grade, maxTurns: config.maxTurns, language: config.language });
        setIsAIThinking(false);
        await executeAIResponse(response.reply, response.graphicSteps, response.graphicInstructions, response.isFinal);
      } catch (err) {
        setIsAIThinking(false);
        console.error('[TutorAI] AI service failed', err);
        addMessage({ role: 'assistant', content: `抱歉，AI 服务出错了 😅 ${err instanceof Error ? err.message : String(err)}` });
        setIsLearning(false);
      }
    } else {
      const script = scriptRef.current;
      const step = stepRef.current;
      if (!script) return;

      const currentStepData = script.steps[step];

      if (currentStepData.isFinal) {
        setIsLearning(false);
        scriptRef.current = null;
        return;
      }

      const isCorrect = currentStepData.expectedKeywords?.some((kw: string) => userMsg.includes(kw));

      if (isCorrect && currentStepData.correctReply) {
        addMessage({ role: 'assistant', content: currentStepData.correctReply! });
        const nextIdx = step + 1;
        if (nextIdx < script.steps.length) {
          stepRef.current = nextIdx;
          setTimeout(() => executeStep(script.steps[nextIdx]), 800);
        } else {
          setIsLearning(false);
          scriptRef.current = null;
        }
      } else if (currentStepData.hintReply) {
        addMessage({ role: 'assistant', content: currentStepData.hintReply! });
      }
    }
  }, [inputMessage, isLearning, useAI, getHistoryForAI, executeStep, executeAIResponse, addMessage, setInputMessage]);

  // OCR: handle image file selection — show crop modal first
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageInputRef.current) imageInputRef.current.value = '';

    const visionSupported = AIProviderManager.supportsVision(config.provider, config.model);
    if (!visionSupported) {
      alert('当前模型不支持图片识别，请在设置中切换到支持 Vision 的模型（如 GPT-4o、Claude 3.5 Sonnet、qwen-vl-plus）');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      const dataURL = URL.createObjectURL(file);
      setOcrImagePending({ dataURL, base64 });
    } catch (err) {
      alert(`图片读取失败：${err instanceof Error ? err.message : String(err)}`);
    }
  }, [config.provider, config.model]);

  // OCR: called after user confirms region in crop modal
  const handleOcrRun = useCallback(async (croppedBase64: string | null) => {
    if (!ocrImagePending) return;
    const base64 = croppedBase64 ?? ocrImagePending.base64;
    const dataURL = ocrImagePending.dataURL;
    setOcrImagePending(null);
    setIsOCRLoading(true);
    try {
      const ocrService = createOCRService(config.provider, config.apiKey, config.model, config.baseURL);
      if (!ocrService) throw new Error('无法创建 OCR 服务');
      const result = await ocrService.recognize(base64);
      setOcrPreview({ dataURL, text: result.text });
    } catch (err) {
      alert(`图片识别失败：${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsOCRLoading(false);
    }
  }, [ocrImagePending, config.provider, config.apiKey, config.model, config.baseURL]);

  const handleOcrConfirm = () => {
    if (ocrPreview) {
      setQuestionText(ocrPreview.text);
      setOcrPreview(null);
    }
  };

  // ⌘G / Ctrl+G — request graphic explanation
  const handleRequestGraphic = useCallback(async () => {
    if (!isLearning || !useAI || !aiServiceRef.current || isAIThinking) return;
    const msg = '请用图形来帮我理解这道题';
    addMessage({ role: 'user', content: msg });
    const history = getHistoryForAI();
    history.push({ role: 'user', content: msg });
    try {
      setIsAIThinking(true);
      const response = await aiServiceRef.current.chat(history, questionRef.current, { grade: config.grade, maxTurns: config.maxTurns, language: config.language });
      setIsAIThinking(false);
      await executeAIResponse(response.reply, response.graphicSteps, response.graphicInstructions, response.isFinal);
    } catch (err) {
      setIsAIThinking(false);
      console.error('[TutorAI] Graphic request failed', err);
    }
  }, [isLearning, useAI, isAIThinking, addMessage, getHistoryForAI, executeAIResponse]);

  const handleNextGraphicStep = useCallback(async () => {
    if (!isLearning || !useAI || !aiServiceRef.current || isAIThinking) return;
    const msg = '请继续下一步图形讲解';
    addMessage({ role: 'user', content: msg });
    const history = getHistoryForAI();
    history.push({ role: 'user', content: msg });
    try {
      setIsAIThinking(true);
      const response = await aiServiceRef.current.chat(history, questionRef.current, { grade: config.grade, maxTurns: config.maxTurns, language: config.language });
      setIsAIThinking(false);
      await executeAIResponse(response.reply, response.graphicSteps, response.graphicInstructions, response.isFinal);
    } catch (err) {
      setIsAIThinking(false);
      console.error('[TutorAI] Next step failed', err);
    }
  }, [isLearning, useAI, isAIThinking, addMessage, getHistoryForAI, executeAIResponse]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        handleRequestGraphic();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRequestGraphic]);

  // Show setup wizard on first launch
  if (config.isFirstLaunch) {
    return (
      <SetupWizard
        onComplete={() => config.setFirstLaunchDone()}
      />
    );
  }

  return (
    <div className="app">
      {/* Fix 3: redesigned title bar */}
      <div className="title-bar">
        <div className="title-bar-traffic-spacer" />
        <div className="title-bar-logo">
          <img src="/icon.png" className="logo-icon" style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: 4 }} />
          <span className="logo-name">TutorAI</span>
          <span className="logo-badge">Beta</span>
        </div>
        <div className="title-bar-spacer" />
        <div className="title-bar-actions">
          <button className="title-bar-btn" onClick={() => setShowSidebar(!showSidebar)} title={t('sidebar.history')}>📚</button>
          <button className="title-bar-btn" onClick={() => setShowSettings(true)} title={t('settings.title')}>⚙️</button>
        </div>
      </div>

      <div className="main-content">
        {showSidebar && (
          <HistorySidebar onClose={() => setShowSidebar(false)} />
        )}

        {/* Fix 7: sidebar with collapsible question panel */}
        <div className="sidebar" style={{ width: chatExpanded ? 560 : 360 }}>
          {/* Fix 7: question panel collapses when learning */}
          <div className={`question-panel ${isLearning && !questionPeek ? 'question-panel--collapsed' : ''}`}>
            {isLearning ? (
              <>
                {/* Collapsed bar always shown when learning */}
                <div className="question-collapsed-bar" onClick={() => setQuestionPeek(!questionPeek)}>
                  <span className="question-collapsed-icon">📝</span>
                  <span className="question-collapsed-text" title={questionText}>
                    {questionText.length > 40 ? questionText.slice(0, 40) + '…' : questionText}
                  </span>
                  <span style={{ marginLeft: 4, opacity: 0.5, transition: 'transform 0.2s', transform: questionPeek ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 12 }}>▼</span>
                  <button
                    className="btn-stop-sm"
                    onClick={(e) => { e.stopPropagation(); handleStopLearning(); }}
                  >
                    {t('btn.stop')}
                  </button>
                </div>
                {/* Peek state: show textarea (read-only while learning) */}
                {questionPeek && (
                  <div style={{ padding: '12px 16px' }}>
                    <textarea
                      className="question-input"
                      value={questionText}
                      readOnly
                      style={{ minHeight: 80, opacity: 0.7 }}
                    />
                  </div>
                )}
              </>
            ) : (
              /* Idle state: full input panel */
              <div style={{ padding: '16px' }}>
                <h2 className="question-panel-title">{t('question.label')}</h2>
                <textarea
                  className="question-input"
                  placeholder={t('question.placeholder')}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
                <div className="question-actions">
                  <button
                    className="btn-start"
                    onClick={handleStartTutoring}
                    disabled={!questionText.trim()}
                  >
                    {t('btn.start')}
                  </button>
                  <button
                    className="btn-ocr"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isOCRLoading || !config.apiKey}
                    title={
                      !config.apiKey ? '请先在设置中配置 API Key' :
                      !AIProviderManager.supportsVision(config.provider, config.model) ?
                        '当前模型不支持图片识别，请切换到 GPT-4o / Claude 3.5 / qwen-vl-plus' :
                      '上传题目图片（支持拍照识题）'
                    }
                  >
                    {isOCRLoading ? t('ocr.uploading') : t('ocr.upload_btn')}
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="dialog-panel">
            <div className="dialog-header">
              <h2>{t('dialog.label')}</h2>
              <button
                className="btn-expand"
                onClick={() => setChatExpanded(!chatExpanded)}
                title={chatExpanded ? '收起' : '展开'}
              >
                {chatExpanded ? '⇤' : '⇥'}
              </button>
            </div>
            <div className="message-list">
              {messages.length === 0 && !isAIThinking && (
                <div className="empty-hint">
                  {isLearning ? t('dialog.empty_learning') : t('dialog.empty_idle')}
                </div>
              )}
              {messages.map((msg, index) => (
                <div key={index} className={`message message-${msg.role}`}>
                  <div className="message-content">
                    {msg.content === WELCOME_MESSAGE_KEY ? t('dialog.welcome') : msg.content}
                  </div>
                </div>
              ))}
              {isAIThinking && (
                <div className="message message-assistant">
                  <div className="message-content thinking-indicator">
                    <span className="dot-1">●</span>
                    <span className="dot-2">●</span>
                    <span className="dot-3">●</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="input-area">
              <input
                type="text"
                className="message-input"
                placeholder={isLearning ? t('dialog.placeholder_active') : t('dialog.placeholder_inactive')}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isAIThinking && handleSendMessage()}
                disabled={!isLearning || isAIThinking}
              />
              <button className="btn-send" onClick={handleSendMessage} disabled={!isLearning || isAIThinking}>
                {t('btn.send')}
              </button>
            </div>
          </div>
        </div>

        <GraphicPanel
          canvasBoxRef={canvasBoxRef}
          engineRef={engineRef}
          lastInstructionsRef={lastInstructionsRef}
          animationState={animationState}
          canvasHint={canvasHint}
          isLearning={isLearning}
          useAI={useAI}
          graphicStepsPlayed={graphicStepsPlayed}
          isAIThinking={isAIThinking}
          onAnimationStateChange={setAnimationState}
          onRequestGraphic={handleRequestGraphic}
          onNextGraphicStep={handleNextGraphicStep}
          onClear={() => setGraphicStepsPlayed(0)}
        />
      </div>

      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          showToast={showToast}
        />
      )}

      {toast && <div className="toast">{toast}</div>}

      {ocrImagePending && (
        <OcrCropModal
          dataURL={ocrImagePending.dataURL}
          onConfirm={handleOcrRun}
          onCancel={() => setOcrImagePending(null)}
        />
      )}

      {/* Fix 2: completion modal */}
      {showCompletion && completionStats && (
        <div className="completion-overlay">
          <div className="completion-modal">
            <div className="completion-icon">🎉</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>{t('completion.title')}</h2>
            <div className="completion-stats">
              <div className="stat-item">
                <span className="stat-label">{t('completion.question')}</span>
                <span className="stat-value" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {completionStats.questionText.slice(0, 30)}{completionStats.questionText.length > 30 ? '…' : ''}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{t('completion.turns')}</span>
                <span className="stat-value">{completionStats.turnCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{t('completion.duration')}</span>
                <span className="stat-value">{completionStats.durationSec}s</span>
              </div>
            </div>
            <div className="completion-actions">
              <button
                className="btn-primary-lg"
                onClick={() => {
                  setShowCompletion(false);
                  setCompletionStats(null);
                  setQuestionText('');
                  resetMessages();
                  setGraphicStepsPlayed(0);
                  lastInstructionsRef.current = [];
                  if (engineRef.current) engineRef.current.clear();
                }}
              >
                {t('completion.new_question')}
              </button>
              <button
                className="btn-secondary-lg"
                onClick={() => {
                  setShowCompletion(false);
                  setCompletionStats(null);
                  setShowSidebar(true);
                }}
              >
                {t('completion.view_history')}
              </button>
            </div>
          </div>
        </div>
      )}

      {ocrPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginBottom: 16 }}>{t('ocr.title')}</h3>
            <img src={ocrPreview.dataURL} alt="OCR" style={{ width: '100%', borderRadius: 8, marginBottom: 16, maxHeight: 200, objectFit: 'contain', background: '#f5f5f5' }} />
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>{t('ocr.recognized')}</label>
              <textarea
                value={ocrPreview.text}
                onChange={e => setOcrPreview(prev => prev ? { ...prev, text: e.target.value } : null)}
                style={{ width: '100%', minHeight: 80, padding: '8px 12px', borderRadius: 8, border: '1px solid #e0e0e0', resize: 'vertical', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setOcrPreview(null)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #e0e0e0', background: 'var(--bg-sidebar)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                {t('ocr.cancel')}
              </button>
              <button onClick={handleOcrConfirm} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#4A90E2', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                {t('ocr.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
