/**
 * Phase 3 测试：Zustand Stores
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useDialogStore, WELCOME_MESSAGE, WELCOME_MESSAGE_KEY } from '../renderer/store/dialogStore';
import { useConfigStore } from '../renderer/store/configStore';
import { useGraphicStore } from '../renderer/store/graphicStore';
import { useSessionStore } from '../renderer/store/sessionStore';

// Reset stores before each test by using the set API directly
function resetDialogStore() {
  useDialogStore.setState({ messages: [WELCOME_MESSAGE], inputMessage: '', isLoading: false });
}
function resetConfigStore() {
  useConfigStore.setState({ apiKey: '', provider: 'openai', model: 'gpt-4o', grade: 4, isFirstLaunch: true });
}
function resetGraphicStore() {
  useGraphicStore.setState({ pendingInstructions: [], animationState: 'idle' });
}
function resetSessionStore() {
  useSessionStore.setState({ currentSessionId: null, sessions: [] });
}

// ── dialogStore ────────────────────────────────────────────────

describe('dialogStore', () => {
  beforeEach(resetDialogStore);

  it('初始状态包含欢迎消息（内容为 i18n marker）', () => {
    const { messages } = useDialogStore.getState();
    expect(messages).toHaveLength(1);
    expect(messages[0]).toEqual(WELCOME_MESSAGE);
    expect(messages[0].content).toBe(WELCOME_MESSAGE_KEY);
  });

  it('addMessage 追加消息', () => {
    const { addMessage } = useDialogStore.getState();
    addMessage({ role: 'user', content: '你好' });
    expect(useDialogStore.getState().messages).toHaveLength(2);
    expect(useDialogStore.getState().messages[1].content).toBe('你好');
  });

  it('resetMessages 恢复到只含欢迎消息', () => {
    const { addMessage, resetMessages } = useDialogStore.getState();
    addMessage({ role: 'user', content: '测试' });
    addMessage({ role: 'assistant', content: '回复' });
    resetMessages();
    expect(useDialogStore.getState().messages).toHaveLength(1);
    expect(useDialogStore.getState().messages[0]).toEqual(WELCOME_MESSAGE);
  });

  it('getHistoryForAI 过滤掉欢迎消息（marker）', () => {
    const { addMessage, getHistoryForAI } = useDialogStore.getState();
    addMessage({ role: 'user', content: '用户问题' });
    addMessage({ role: 'assistant', content: 'AI 回复' });
    const history = getHistoryForAI();
    expect(history.some(m => m.content === WELCOME_MESSAGE_KEY)).toBe(false);
    expect(history.some(m => m.content === '用户问题')).toBe(true);
    expect(history.some(m => m.content === 'AI 回复')).toBe(true);
  });

  it('setInputMessage 更新输入', () => {
    useDialogStore.getState().setInputMessage('新输入');
    expect(useDialogStore.getState().inputMessage).toBe('新输入');
  });

  it('setIsLoading 更新加载状态', () => {
    useDialogStore.getState().setIsLoading(true);
    expect(useDialogStore.getState().isLoading).toBe(true);
  });
});

// ── configStore ────────────────────────────────────────────────

describe('configStore', () => {
  beforeEach(resetConfigStore);

  it('默认 provider 是 openai', () => {
    expect(useConfigStore.getState().provider).toBe('openai');
  });

  it('setApiKey 更新 apiKey', () => {
    useConfigStore.getState().setApiKey('sk-12345');
    expect(useConfigStore.getState().apiKey).toBe('sk-12345');
  });

  it('setProvider 切换服务商', () => {
    useConfigStore.getState().setProvider('claude');
    expect(useConfigStore.getState().provider).toBe('claude');
  });

  it('setModel 更新模型', () => {
    useConfigStore.getState().setModel('gpt-4o-mini');
    expect(useConfigStore.getState().model).toBe('gpt-4o-mini');
  });

  it('setGrade 设定年级', () => {
    useConfigStore.getState().setGrade(5);
    expect(useConfigStore.getState().grade).toBe(5);
  });

  it('setFirstLaunchDone 关闭首次引导', () => {
    expect(useConfigStore.getState().isFirstLaunch).toBe(true);
    useConfigStore.getState().setFirstLaunchDone();
    expect(useConfigStore.getState().isFirstLaunch).toBe(false);
  });

  it('loadFromStorage 批量更新配置', () => {
    useConfigStore.getState().loadFromStorage({ apiKey: 'from-db', provider: 'qwen', grade: 6 });
    const state = useConfigStore.getState();
    expect(state.apiKey).toBe('from-db');
    expect(state.provider).toBe('qwen');
    expect(state.grade).toBe(6);
  });
});

// ── graphicStore ────────────────────────────────────────────────

describe('graphicStore', () => {
  beforeEach(resetGraphicStore);

  it('初始动画状态为 idle', () => {
    expect(useGraphicStore.getState().animationState).toBe('idle');
  });

  it('queueInstructions 追加指令', () => {
    const instruction = { type: 'drawRect' as const, params: { x: 0, y: 0, width: 100, height: 100 } };
    useGraphicStore.getState().queueInstructions([instruction]);
    expect(useGraphicStore.getState().pendingInstructions).toHaveLength(1);
  });

  it('clearQueue 清空指令队列', () => {
    const instruction = { type: 'drawRect' as const, params: { x: 0, y: 0, width: 100, height: 100 } };
    useGraphicStore.getState().queueInstructions([instruction, instruction]);
    useGraphicStore.getState().clearQueue();
    expect(useGraphicStore.getState().pendingInstructions).toHaveLength(0);
  });

  it('setAnimationState 切换状态', () => {
    useGraphicStore.getState().setAnimationState('playing');
    expect(useGraphicStore.getState().animationState).toBe('playing');
    useGraphicStore.getState().setAnimationState('paused');
    expect(useGraphicStore.getState().animationState).toBe('paused');
  });
});

// ── sessionStore ────────────────────────────────────────────────

describe('sessionStore', () => {
  beforeEach(resetSessionStore);

  it('初始 sessions 为空数组', () => {
    expect(useSessionStore.getState().sessions).toHaveLength(0);
  });

  it('addSession 追加会话', () => {
    useSessionStore.getState().addSession({
      id: 's1', questionText: '测试题', createdAt: 1000, updatedAt: 1000,
    });
    expect(useSessionStore.getState().sessions).toHaveLength(1);
    expect(useSessionStore.getState().sessions[0].id).toBe('s1');
  });

  it('removeSession 删除指定会话', () => {
    const store = useSessionStore.getState();
    store.addSession({ id: 's1', questionText: '题1', createdAt: 1000, updatedAt: 1000 });
    store.addSession({ id: 's2', questionText: '题2', createdAt: 2000, updatedAt: 2000 });
    useSessionStore.getState().removeSession('s1');
    const sessions = useSessionStore.getState().sessions;
    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe('s2');
  });

  it('setCurrentSessionId 更新当前会话', () => {
    useSessionStore.getState().setCurrentSessionId('s-active');
    expect(useSessionStore.getState().currentSessionId).toBe('s-active');
  });
});
