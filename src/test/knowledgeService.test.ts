/**
 * Phase 9 测试：KnowledgeService 掌握度更新逻辑
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KnowledgeService } from '../renderer/core/knowledge/KnowledgeService';

describe('KnowledgeService.updateMastery()', () => {
  let service: KnowledgeService;

  beforeEach(() => {
    service = new KnowledgeService();
    vi.clearAllMocks();
  });

  it('答对后掌握度 +10（初始为 50）', async () => {
    vi.mocked(window.electronAPI.getAllKnowledgePoints).mockResolvedValueOnce([]);
    await service.updateMastery('几何', '长方形面积', true);

    const call = vi.mocked(window.electronAPI.saveKnowledgePoint).mock.calls[0][0];
    expect(call.mastery_level).toBe(60); // 50 + 10
    expect(call.topic).toBe('几何');
    expect(call.concept).toBe('长方形面积');
  });

  it('答错后掌握度 -5（初始为 50）', async () => {
    vi.mocked(window.electronAPI.getAllKnowledgePoints).mockResolvedValueOnce([]);
    await service.updateMastery('几何', '圆的面积', false);

    const call = vi.mocked(window.electronAPI.saveKnowledgePoint).mock.calls[0][0];
    expect(call.mastery_level).toBe(45); // 50 - 5
  });

  it('已有知识点：从现有 mastery_level 开始计算', async () => {
    vi.mocked(window.electronAPI.getAllKnowledgePoints).mockResolvedValueOnce([
      { id: 'kp1', topic: '分数', concept: '分数认知', mastery_level: 70, updated_at: 1000 },
    ]);
    await service.updateMastery('分数', '分数认知', true);

    const call = vi.mocked(window.electronAPI.saveKnowledgePoint).mock.calls[0][0];
    expect(call.mastery_level).toBe(80); // 70 + 10
    expect(call.id).toBe('kp1'); // 复用已有 id
  });

  it('掌握度不超过 100', async () => {
    vi.mocked(window.electronAPI.getAllKnowledgePoints).mockResolvedValueOnce([
      { id: 'kp2', topic: '加法', concept: '进位加法', mastery_level: 96, updated_at: 1000 },
    ]);
    await service.updateMastery('加法', '进位加法', true);

    const call = vi.mocked(window.electronAPI.saveKnowledgePoint).mock.calls[0][0];
    expect(call.mastery_level).toBe(100); // clamp to 100
  });

  it('掌握度不低于 0', async () => {
    vi.mocked(window.electronAPI.getAllKnowledgePoints).mockResolvedValueOnce([
      { id: 'kp3', topic: '减法', concept: '退位减法', mastery_level: 3, updated_at: 1000 },
    ]);
    await service.updateMastery('减法', '退位减法', false);

    const call = vi.mocked(window.electronAPI.saveKnowledgePoint).mock.calls[0][0];
    expect(call.mastery_level).toBe(0); // clamp to 0
  });
});

describe('KnowledgeService.getWeakPoints()', () => {
  it('返回 mastery_level < 60 的知识点，按掌握度升序', async () => {
    const service = new KnowledgeService();
    vi.mocked(window.electronAPI.getAllKnowledgePoints).mockResolvedValueOnce([
      { id: 'a', topic: 'T', concept: '强', mastery_level: 85, updated_at: 1 },
      { id: 'b', topic: 'T', concept: '中', mastery_level: 55, updated_at: 1 },
      { id: 'c', topic: 'T', concept: '弱', mastery_level: 20, updated_at: 1 },
    ]);
    const weak = await service.getWeakPoints();
    expect(weak).toHaveLength(2);
    expect(weak[0].mastery_level).toBe(20);
    expect(weak[1].mastery_level).toBe(55);
  });
});
