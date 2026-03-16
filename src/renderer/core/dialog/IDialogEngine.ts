/**
 * 对话管理引擎接口
 * 负责对话流程、上下文管理、AI 交互
 */

export interface IDialogEngine {
  /**
   * 发送用户消息
   * @param message 用户消息内容
   */
  sendMessage(message: string): Promise<DialogResponse>;

  /**
   * 获取对话历史
   */
  getHistory(): DialogMessage[];

  /**
   * 清空对话历史
   */
  clearHistory(): void;

  /**
   * 设置对话上下文（题目信息）
   */
  setContext(context: DialogContext): void;
}

/**
 * 对话消息
 */
export interface DialogMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  graphicInstructions?: any[]; // 关联的图形指令
}

/**
 * 对话响应
 */
export interface DialogResponse {
  message: DialogMessage;
  graphicInstructions?: any[]; // AI 返回的图形指令
}

/**
 * 对话上下文
 */
export interface DialogContext {
  questionText: string; // 题目文本
  questionType?: string; // 题目类型（几何、代数等）
  difficulty?: number; // 难度等级
  metadata?: Record<string, any>; // 其他元数据
}
