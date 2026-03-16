import { GraphicInstruction } from '../graphic/IGraphicEngine';

/**
 * 图形步骤：一段引导语 + 对应的图形指令
 */
export interface GraphicStep {
  hint: string;
  instructions: GraphicInstruction[];
}

/**
 * AI 对话响应
 */
export interface AIResponse {
  reply: string;
  graphicSteps?: GraphicStep[];          // 逐步讲解格式（新）
  graphicInstructions?: GraphicInstruction[];  // 向后兼容旧格式
  isFinal?: boolean;
}

export interface ChatOptions {
  grade?: number;
  maxTurns?: number;
  language?: 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'es-ES' | 'fr-FR';
}

/**
 * AI 服务接口 — 所有 Provider 必须实现
 */
export interface IAIService {
  chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    questionText: string,
    opts?: ChatOptions
  ): Promise<AIResponse>;
}
