import {
  IDialogEngine,
  DialogMessage,
  DialogResponse,
  DialogContext,
} from './IDialogEngine';

/**
 * 对话管理引擎实现
 */
export class DialogEngine implements IDialogEngine {
  private history: DialogMessage[] = [];
  private storedContext: DialogContext | null = null;

  async sendMessage(message: string): Promise<DialogResponse> {
    // 创建用户消息
    const userMessage: DialogMessage = {
      id: this.generateId(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    this.history.push(userMessage);

    // TODO: 调用 AI 服务获取响应
    // 这里先返回模拟响应
    const assistantMessage: DialogMessage = {
      id: this.generateId(),
      role: 'assistant',
      content: '我理解了你的问题，让我来帮你分析...',
      timestamp: Date.now(),
    };

    this.history.push(assistantMessage);

    return {
      message: assistantMessage,
    };
  }

  getHistory(): DialogMessage[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  setContext(context: DialogContext): void {
    this.storedContext = context;
  }

  getContext(): DialogContext | null {
    return this.storedContext;
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
