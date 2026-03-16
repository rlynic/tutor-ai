import Anthropic from '@anthropic-ai/sdk';
import { IAIService, AIResponse, ChatOptions } from './IAIService';
import { buildSocraticSystemPrompt, parseAIResponse } from './promptUtils';

export interface ClaudeConfig {
  apiKey: string;
  model?: string;
}

// Claude Vision-capable models
export const CLAUDE_VISION_MODELS = [
  'claude-opus-4-6',
  'claude-sonnet-4-6',
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-5-20250929',
  'claude-opus-4-5-20251101',
  'claude-opus-4-20250514',
];

export const CLAUDE_MODELS = [
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6 (最强)', vision: true },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (推荐)', vision: true },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5 (快速)', vision: true },
  { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', vision: true },
  { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', vision: true },
  { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', vision: true },
];

/**
 * Anthropic Claude Provider
 */
export class ClaudeProvider implements IAIService {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model = 'claude-sonnet-4-6') {
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
    this.model = model;
  }

  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    questionText: string,
    opts?: ChatOptions
  ): Promise<AIResponse> {
    const systemPrompt = buildSocraticSystemPrompt(questionText, opts);

    // Convert to Anthropic message format
    const anthropicMessages = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Ensure first message is from user (Anthropic requirement)
    if (anthropicMessages.length === 0 || anthropicMessages[0].role !== 'user') {
      anthropicMessages.unshift({ role: 'user', content: `请帮我讲解这道题：${questionText}` });
    }

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    return parseAIResponse(content);
  }
}
