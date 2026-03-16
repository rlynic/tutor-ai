/**
 * 知识点管理服务
 * 追踪学生对各数学概念的掌握程度（0-100）
 */

export interface KnowledgePoint {
  id: string;
  topic: string;
  concept: string;
  mastery_level: number; // 0-100
  updated_at: number;
}

export class KnowledgeService {
  async saveKnowledgePoint(kp: Omit<KnowledgePoint, 'updated_at'>): Promise<void> {
    if (window.electronAPI) {
      await window.electronAPI.saveKnowledgePoint({ ...kp, updated_at: Date.now() });
    }
  }

  async getAllKnowledgePoints(): Promise<KnowledgePoint[]> {
    if (window.electronAPI) {
      return window.electronAPI.getAllKnowledgePoints();
    }
    return [];
  }

  async getWeakPoints(): Promise<KnowledgePoint[]> {
    const all = await this.getAllKnowledgePoints();
    return all.filter(kp => kp.mastery_level < 60).sort((a, b) => a.mastery_level - b.mastery_level);
  }

  /**
   * 根据对话结果更新掌握程度
   * @param topic 知识点主题
   * @param concept 具体概念
   * @param correct 本次回答是否正确
   */
  async updateMastery(topic: string, concept: string, correct: boolean): Promise<void> {
    const all = await this.getAllKnowledgePoints();
    const existing = all.find(kp => kp.topic === topic && kp.concept === concept);

    const id = existing?.id || `kp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const currentLevel = existing?.mastery_level ?? 50;

    // Simple mastery update: +10 for correct, -5 for wrong (clamped to 0-100)
    const delta = correct ? 10 : -5;
    const newLevel = Math.max(0, Math.min(100, currentLevel + delta));

    await this.saveKnowledgePoint({ id, topic, concept, mastery_level: newLevel });
  }
}
