import { IAIService, AIResponse, ChatOptions } from './IAIService';
import { buildSocraticSystemPrompt, parseAIResponse } from './promptUtils';

export const QWEN_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

export const QWEN_MODELS = [
  { id: 'qwen3-max', name: 'Qwen3 Max (旗舰)', vision: false },
  { id: 'qwen3.5-plus', name: 'Qwen3.5 Plus (推荐)', vision: false },
  { id: 'qwen3.5-flash', name: 'Qwen3.5 Flash (快速)', vision: false },
  { id: 'qwq-plus', name: 'QwQ Plus (深度推理)', vision: false },
  { id: 'qwen-max', name: '通义千问 Max', vision: false },
  { id: 'qwen-plus', name: '通义千问 Plus', vision: false },
  { id: 'qwen3-vl-flash-2026-01-22', name: 'Qwen3 VL Flash (Vision新)', vision: true },
  { id: 'qwen-vl-plus', name: '通义千问 VL Plus (Vision)', vision: true },
];

export const QWEN_VISION_MODELS = ['qwen-vl-plus', 'qwen-vl-max', 'qwen3-vl-flash-2026-01-22'];

/**
 * 通义千问 Provider
 * 兼容 OpenAI 接口协议，baseURL 固定为 DashScope
 */
export class QwenProvider implements IAIService {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'qwen-plus') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    questionText: string,
    opts?: ChatOptions
  ): Promise<AIResponse> {
    const systemPrompt = buildSocraticSystemPrompt(questionText, opts);

    const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
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
      if (response.status === 401) throw new Error('通义千问 API Key 无效');
      if (response.status === 429) throw new Error('请求频率超限，请稍后再试');
      throw new Error(`通义千问 API 错误: ${response.status} ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    return parseAIResponse(content);
  }
}
