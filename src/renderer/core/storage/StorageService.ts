import { IStorageService, Session, UserConfig } from './IStorageService';

/**
 * 存储服务实现
 * 通过 Electron IPC 调用 better-sqlite3 数据库
 * 接口与 IStorageService 完全兼容，外部无感知
 */
export class StorageService implements IStorageService {
  private get api() {
    return window.electronAPI;
  }

  async saveSession(session: Session): Promise<void> {
    await this.api.saveSession(session);
  }

  async getSession(sessionId: string): Promise<Session | null> {
    return this.api.getSession(sessionId);
  }

  async getAllSessions(): Promise<Session[]> {
    const sessions = await this.api.getAllSessions();
    return sessions as Session[];
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.api.deleteSession(sessionId);
  }

  async saveConfig(config: UserConfig): Promise<void> {
    await this.api.saveConfig(config as Record<string, any>);
  }

  async getConfig(): Promise<UserConfig> {
    const config = await this.api.getConfig();
    return config as UserConfig;
  }
}
