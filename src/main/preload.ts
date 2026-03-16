import { contextBridge, ipcRenderer } from 'electron';

/**
 * 安全的 IPC 桥梁
 * 仅暴露白名单内的具名方法，不暴露原始 ipcRenderer
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Sessions
  saveSession: (session: any) => ipcRenderer.invoke('db:saveSession', session),
  getSession: (sessionId: string) => ipcRenderer.invoke('db:getSession', sessionId),
  getAllSessions: () => ipcRenderer.invoke('db:getAllSessions'),
  deleteSession: (sessionId: string) => ipcRenderer.invoke('db:deleteSession', sessionId),

  // Config
  saveConfig: (config: Record<string, any>) => ipcRenderer.invoke('db:saveConfig', config),
  getConfig: () => ipcRenderer.invoke('db:getConfig'),

  // Knowledge points
  saveKnowledgePoint: (kp: any) => ipcRenderer.invoke('db:saveKnowledgePoint', kp),
  getAllKnowledgePoints: () => ipcRenderer.invoke('db:getAllKnowledgePoints'),

  // Error questions
  saveErrorQuestion: (eq: any) => ipcRenderer.invoke('db:saveErrorQuestion', eq),
  getAllErrorQuestions: () => ipcRenderer.invoke('db:getAllErrorQuestions'),
});
