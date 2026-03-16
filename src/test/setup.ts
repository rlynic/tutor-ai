import '@testing-library/jest-dom';

// Mock window.electronAPI for renderer tests (not available in jsdom)
Object.defineProperty(window, 'electronAPI', {
  value: {
    saveSession: vi.fn().mockResolvedValue({ success: true }),
    getSession: vi.fn().mockResolvedValue(null),
    getAllSessions: vi.fn().mockResolvedValue([]),
    deleteSession: vi.fn().mockResolvedValue({ success: true }),
    saveConfig: vi.fn().mockResolvedValue({ success: true }),
    getConfig: vi.fn().mockResolvedValue({}),
    saveKnowledgePoint: vi.fn().mockResolvedValue({ success: true }),
    getAllKnowledgePoints: vi.fn().mockResolvedValue([]),
    saveErrorQuestion: vi.fn().mockResolvedValue({ success: true }),
    getAllErrorQuestions: vi.fn().mockResolvedValue([]),
  },
  writable: true,
});
