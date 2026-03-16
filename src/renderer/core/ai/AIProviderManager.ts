import { IAIService } from './IAIService';
import { OpenAIService } from './OpenAIService';
import { ClaudeProvider, CLAUDE_VISION_MODELS } from './ClaudeProvider';
import { QwenProvider, QWEN_VISION_MODELS } from './QwenProvider';
import { CustomProvider } from './CustomProvider';
import { ProviderType } from '../../store/configStore';

export interface ProviderConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
}

// OpenAI Vision-capable models (all current models support vision)
const OPENAI_VISION_MODELS = ['gpt-5.4', 'gpt-5-mini', 'gpt-4.1', 'gpt-4.1-mini', 'o4-mini', 'o3', 'gpt-4o', 'gpt-4o-mini'];

export const PROVIDER_MODELS: Record<ProviderType, Array<{ id: string; name: string; vision: boolean }>> = {
  openai: [
    { id: 'gpt-5.4', name: 'GPT-5.4 (最新旗舰)', vision: true },
    { id: 'gpt-5-mini', name: 'GPT-5 Mini (快速)', vision: true },
    { id: 'gpt-4.1', name: 'GPT-4.1 (高性价比)', vision: true },
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', vision: true },
    { id: 'o4-mini', name: 'o4-mini (推理)', vision: true },
    { id: 'o3', name: 'o3 (推理旗舰)', vision: true },
    { id: 'gpt-4o', name: 'GPT-4o', vision: true },
  ],
  claude: [
    { id: 'claude-opus-4-6', name: 'Claude Opus 4.6 (最强)', vision: true },
    { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (推荐)', vision: true },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5 (快速)', vision: true },
    { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', vision: true },
    { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', vision: true },
    { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', vision: true },
  ],
  qwen: [
    { id: 'qwen3-max', name: 'Qwen3 Max (旗舰)', vision: false },
    { id: 'qwen3.5-plus', name: 'Qwen3.5 Plus (推荐)', vision: false },
    { id: 'qwen3.5-flash', name: 'Qwen3.5 Flash (快速)', vision: false },
    { id: 'qwq-plus', name: 'QwQ Plus (深度推理)', vision: false },
    { id: 'qwen-max', name: '通义千问 Max', vision: false },
    { id: 'qwen-plus', name: '通义千问 Plus', vision: false },
    { id: 'qwen3-vl-flash-2026-01-22', name: 'Qwen3 VL Flash (Vision新)', vision: true },
    { id: 'qwen-vl-plus', name: '通义千问 VL Plus (Vision)', vision: true },
  ],
  custom: [
    { id: 'custom', name: '自定义模型', vision: false },
  ],
};

/**
 * AI Provider 工厂管理器
 */
export class AIProviderManager {
  private static cache = new Map<string, IAIService>();

  static createProvider(type: ProviderType, config: ProviderConfig): IAIService {
    const cacheKey = `${type}:${config.apiKey}:${config.model}:${config.baseURL}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let provider: IAIService;

    switch (type) {
      case 'openai':
        provider = new OpenAIService(
          config.apiKey,
          config.baseURL || 'https://api.openai.com/v1',
          config.model || 'gpt-5.4'
        );
        break;

      case 'claude':
        provider = new ClaudeProvider(config.apiKey, config.model || 'claude-sonnet-4-6');
        break;

      case 'qwen':
        provider = new QwenProvider(config.apiKey, config.model || 'qwen3.5-plus');
        break;

      case 'custom':
        if (!config.baseURL) throw new Error('自定义 Provider 需要提供 baseURL');
        provider = new CustomProvider({
          apiKey: config.apiKey,
          baseURL: config.baseURL,
          model: config.model,
        });
        break;

      default:
        throw new Error(`未知的 Provider 类型: ${type}`);
    }

    this.cache.set(cacheKey, provider);
    return provider;
  }

  /**
   * 检测给定 Provider + 模型是否支持 Vision
   */
  static supportsVision(type: ProviderType, model: string): boolean {
    switch (type) {
      case 'openai':
        return OPENAI_VISION_MODELS.includes(model);
      case 'claude':
        return CLAUDE_VISION_MODELS.includes(model);
      case 'qwen':
        return QWEN_VISION_MODELS.includes(model);
      case 'custom':
        return false;
      default:
        return false;
    }
  }

  /**
   * 清除 Provider 实例缓存（配置变更时调用）
   */
  static clearCache(): void {
    this.cache.clear();
  }
}

/**
 * API Key 连接测试
 */
export async function testProviderConnection(
  type: ProviderType,
  apiKey: string,
  model: string,
  baseURL?: string
): Promise<{ success: boolean; latency?: number; error?: string }> {
  const start = Date.now();
  try {
    AIProviderManager.clearCache();
    const provider = AIProviderManager.createProvider(type, { apiKey, model, baseURL });
    await provider.chat([{ role: 'user', content: '你好，请回复"连接成功"' }], '测试连接');
    return { success: true, latency: Date.now() - start };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
