import { IAIService, AIResponse, ChatOptions } from './IAIService';
import { buildSocraticSystemPrompt, parseAIResponse } from './promptUtils';

export interface CustomProviderConfig {
  apiKey: string;
  baseURL: string;
  model?: string;
}

/**
 * 自定义 OpenAI 兼容接口 Provider
 * 支持任意兼容 OpenAI API 的服务
 */
export class CustomProvider implements IAIService {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(config: CustomProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL.replace(/\/$/, ''); // remove trailing slash
    this.model = config.model || 'gpt-4';
  }

  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    questionText: string,
    opts?: ChatOptions
  ): Promise<AIResponse> {
    const systemPrompt = buildSocraticSystemPrompt(questionText, opts);

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`自定义 API 错误: ${response.status} ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    return parseAIResponse(content);
  }
}
