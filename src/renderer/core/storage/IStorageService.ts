/**
 * 本地存储服务接口
 * 负责数据持久化
 */

export interface IStorageService {
  /**
   * 保存会话记录
   */
  saveSession(session: Session): Promise<void>;

  /**
   * 获取会话记录
   */
  getSession(sessionId: string): Promise<Session | null>;

  /**
   * 获取所有会话列表
   */
  getAllSessions(): Promise<Session[]>;

  /**
   * 删除会话
   */
  deleteSession(sessionId: string): Promise<void>;

  /**
   * 保存用户配置
   */
  saveConfig(config: UserConfig): Promise<void>;

  /**
   * 获取用户配置
   */
  getConfig(): Promise<UserConfig>;
}

/**
 * 会话记录
 */
export interface Session {
  id: string;
  questionText: string;
  questionType?: string;
  messages: any[]; // 对话消息
  graphicStates: any[]; // 图形状态快照
  createdAt: number;
  updatedAt: number;
}

/**
 * 用户配置
 */
export interface UserConfig {
  apiKey?: string; // AI API Key
  theme?: 'light' | 'dark'; // 主题
  fontSize?: number; // 字体大小
  animationSpeed?: number; // 动画速度
}
