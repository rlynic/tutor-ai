/**
 * window.electronAPI 类型声明
 * 由 src/main/preload.ts 通过 contextBridge 注入
 */
export interface ElectronAPI {
  // Sessions
  saveSession(session: any): Promise<{ success: boolean }>;
  getSession(sessionId: string): Promise<any | null>;
  getAllSessions(): Promise<any[]>;
  deleteSession(sessionId: string): Promise<{ success: boolean }>;

  // Config
  saveConfig(config: Record<string, any>): Promise<{ success: boolean }>;
  getConfig(): Promise<Record<string, any>>;

  // Knowledge points
  saveKnowledgePoint(kp: any): Promise<{ success: boolean }>;
  getAllKnowledgePoints(): Promise<any[]>;

  // Error questions
  saveErrorQuestion(eq: any): Promise<{ success: boolean }>;
  getAllErrorQuestions(): Promise<any[]>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
