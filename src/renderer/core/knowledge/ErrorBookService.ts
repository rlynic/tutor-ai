/**
 * 错题本服务
 * 记录学生的错误题目和错误类型，辅助复习
 */

export interface ErrorQuestion {
  id: string;
  session_id?: string;
  question: string;
  error_type?: string;
  note?: string;
  created_at: number;
}

export class ErrorBookService {
  async saveErrorQuestion(eq: Omit<ErrorQuestion, 'id' | 'created_at'>): Promise<void> {
    if (!window.electronAPI) return;
    await window.electronAPI.saveErrorQuestion({
      ...eq,
      id: `eq_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      created_at: Date.now(),
    });
  }

  async getAllErrorQuestions(): Promise<ErrorQuestion[]> {
    if (!window.electronAPI) return [];
    return window.electronAPI.getAllErrorQuestions();
  }
}
