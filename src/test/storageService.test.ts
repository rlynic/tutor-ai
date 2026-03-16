/**
 * Phase 2 测试：StorageService IPC 调用
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from '../renderer/core/storage/StorageService';
import type { Session, UserConfig } from '../renderer/core/storage/IStorageService';

const mockSession: Session = {
  id: 'session-001',
  questionText: '求长方形面积',
  messages: [{ role: 'user', content: '你好' }],
  graphicStates: [],
  createdAt: 1000000,
  updatedAt: 1000000,
};

describe('StorageService (IPC mock)', () => {
  let service: StorageService;

  beforeEach(() => {
    service = new StorageService();
    vi.clearAllMocks();
  });

  it('saveSession 调用 electronAPI.saveSession', async () => {
    await service.saveSession(mockSession);
    expect(window.electronAPI.saveSession).toHaveBeenCalledWith(mockSession);
  });

  it('getSession 调用 electronAPI.getSession 并返回结果', async () => {
    vi.mocked(window.electronAPI.getSession).mockResolvedValueOnce(mockSession);
    const result = await service.getSession('session-001');
    expect(window.electronAPI.getSession).toHaveBeenCalledWith('session-001');
    expect(result).toEqual(mockSession);
  });

  it('getSession 不存在时返回 null', async () => {
    vi.mocked(window.electronAPI.getSession).mockResolvedValueOnce(null);
    const result = await service.getSession('nonexistent');
    expect(result).toBeNull();
  });

  it('getAllSessions 返回空数组', async () => {
    const result = await service.getAllSessions();
    expect(window.electronAPI.getAllSessions).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('deleteSession 调用 electronAPI.deleteSession', async () => {
    await service.deleteSession('session-001');
    expect(window.electronAPI.deleteSession).toHaveBeenCalledWith('session-001');
  });

  it('saveConfig 调用 electronAPI.saveConfig', async () => {
    const config: UserConfig = { apiKey: 'sk-test', theme: 'light' };
    await service.saveConfig(config);
    expect(window.electronAPI.saveConfig).toHaveBeenCalledWith(config);
  });

  it('getConfig 返回配置对象', async () => {
    vi.mocked(window.electronAPI.getConfig).mockResolvedValueOnce({ apiKey: 'sk-test', theme: 'dark' });
    const config = await service.getConfig();
    expect(config.apiKey).toBe('sk-test');
    expect(config.theme).toBe('dark');
  });
});
