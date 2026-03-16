import { IAIService, AIResponse, ChatOptions } from './IAIService';
import { buildSocraticSystemPrompt, parseAIResponse } from './promptUtils';

export interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

/**
 * OpenAI Provider 实现
 * 支持 GPT-4o / GPT-4o-mini / GPT-4-turbo 等模型
 */
export class OpenAIService implements IAIService {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(apiKey: string, baseURL = 'https://api.openai.com/v1', model = 'gpt-4o') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.model = model;
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
      if (response.status === 401) throw new Error('API Key 无效，请在设置中更新');
      if (response.status === 429) throw new Error('请求频率超限，请稍后再试');
      throw new Error(`API 错误: ${response.status} ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    return parseAIResponse(content);
  }
}
