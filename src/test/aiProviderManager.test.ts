/**
 * Phase 4 测试：AIProviderManager 工厂与 Vision 检测
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { AIProviderManager, PROVIDER_MODELS } from '../renderer/core/ai/AIProviderManager';
import { OpenAIService } from '../renderer/core/ai/OpenAIService';
import { ClaudeProvider } from '../renderer/core/ai/ClaudeProvider';
import { QwenProvider } from '../renderer/core/ai/QwenProvider';
import { CustomProvider } from '../renderer/core/ai/CustomProvider';

describe('AIProviderManager.createProvider()', () => {
  beforeEach(() => {
    AIProviderManager.clearCache();
  });

  it('创建 OpenAI provider', () => {
    const p = AIProviderManager.createProvider('openai', { apiKey: 'sk-test', model: 'gpt-4o' });
    expect(p).toBeInstanceOf(OpenAIService);
  });

  it('创建 Claude provider', () => {
    const p = AIProviderManager.createProvider('claude', { apiKey: 'sk-ant-test', model: 'claude-sonnet-4-6' });
    expect(p).toBeInstanceOf(ClaudeProvider);
  });

  it('创建 Qwen provider', () => {
    const p = AIProviderManager.createProvider('qwen', { apiKey: 'qwen-test', model: 'qwen-plus' });
    expect(p).toBeInstanceOf(QwenProvider);
  });

  it('创建 Custom provider（需要 baseURL）', () => {
    const p = AIProviderManager.createProvider('custom', { apiKey: 'test', baseURL: 'https://my.api/v1' });
    expect(p).toBeInstanceOf(CustomProvider);
  });

  it('Custom provider 缺少 baseURL 时抛出错误', () => {
    expect(() =>
      AIProviderManager.createProvider('custom', { apiKey: 'test' })
    ).toThrow('baseURL');
  });

  it('相同参数返回同一缓存实例', () => {
    const p1 = AIProviderManager.createProvider('openai', { apiKey: 'sk-same', model: 'gpt-4o' });
    const p2 = AIProviderManager.createProvider('openai', { apiKey: 'sk-same', model: 'gpt-4o' });
    expect(p1).toBe(p2);
  });

  it('clearCache() 后创建新实例', () => {
    const p1 = AIProviderManager.createProvider('openai', { apiKey: 'sk-key', model: 'gpt-4o' });
    AIProviderManager.clearCache();
    const p2 = AIProviderManager.createProvider('openai', { apiKey: 'sk-key', model: 'gpt-4o' });
    expect(p1).not.toBe(p2);
  });
});

describe('AIProviderManager.supportsVision()', () => {
  it('OpenAI gpt-4o 支持 Vision', () => {
    expect(AIProviderManager.supportsVision('openai', 'gpt-4o')).toBe(true);
  });

  it('OpenAI gpt-4o-mini 支持 Vision', () => {
    expect(AIProviderManager.supportsVision('openai', 'gpt-4o-mini')).toBe(true);
  });

  it('OpenAI gpt-3.5-turbo 不支持 Vision', () => {
    expect(AIProviderManager.supportsVision('openai', 'gpt-3.5-turbo')).toBe(false);
  });

  it('Claude 主流模型均支持 Vision', () => {
    expect(AIProviderManager.supportsVision('claude', 'claude-opus-4-6')).toBe(true);
    expect(AIProviderManager.supportsVision('claude', 'claude-sonnet-4-6')).toBe(true);
    expect(AIProviderManager.supportsVision('claude', 'claude-haiku-4-5-20251001')).toBe(true);
  });

  it('Qwen VL 模型支持 Vision', () => {
    expect(AIProviderManager.supportsVision('qwen', 'qwen-vl-plus')).toBe(true);
  });

  it('Qwen 文本模型不支持 Vision', () => {
    expect(AIProviderManager.supportsVision('qwen', 'qwen-plus')).toBe(false);
    expect(AIProviderManager.supportsVision('qwen', 'qwen-turbo')).toBe(false);
  });

  it('Custom provider 不支持 Vision', () => {
    expect(AIProviderManager.supportsVision('custom', 'any-model')).toBe(false);
  });
});

describe('PROVIDER_MODELS 配置', () => {
  it('每个 provider 至少有 1 个模型', () => {
    for (const provider of ['openai', 'claude', 'qwen', 'custom'] as const) {
      expect(PROVIDER_MODELS[provider].length).toBeGreaterThan(0);
    }
  });

  it('每个模型有 id 和 name', () => {
    for (const models of Object.values(PROVIDER_MODELS)) {
      for (const m of models) {
        expect(m.id).toBeTruthy();
        expect(m.name).toBeTruthy();
        expect(typeof m.vision).toBe('boolean');
      }
    }
  });

  it('OpenAI 第一个模型是 gpt-5.4（推荐）', () => {
    expect(PROVIDER_MODELS.openai[0].id).toBe('gpt-5.4');
  });

  it('Claude 第一个模型是 claude-opus-4-6（推荐）', () => {
    expect(PROVIDER_MODELS.claude[0].id).toBe('claude-opus-4-6');
  });

  it('OpenAI gpt-5.4 支持 Vision', () => {
    expect(AIProviderManager.supportsVision('openai', 'gpt-5.4')).toBe(true);
  });

  it('OpenAI gpt-4.1 支持 Vision', () => {
    expect(AIProviderManager.supportsVision('openai', 'gpt-4.1')).toBe(true);
  });

  it('Qwen3 VL Flash 支持 Vision', () => {
    expect(AIProviderManager.supportsVision('qwen', 'qwen3-vl-flash-2026-01-22')).toBe(true);
  });
});
