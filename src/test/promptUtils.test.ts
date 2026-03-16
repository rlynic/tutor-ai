/**
 * AI Prompt 工具函数测试
 * 覆盖：buildSocraticSystemPrompt / parseAIResponse
 */
import { describe, it, expect } from 'vitest';
import { buildSocraticSystemPrompt, parseAIResponse } from '../renderer/core/ai/promptUtils';

// ── buildSocraticSystemPrompt ────────────────────────────────────

describe('buildSocraticSystemPrompt()', () => {
  it('包含题目文本', () => {
    const prompt = buildSocraticSystemPrompt('求长方形面积，长8宽5');
    expect(prompt).toContain('求长方形面积，长8宽5');
  });

  it('包含 Socratic 教学关键词', () => {
    const prompt = buildSocraticSystemPrompt('测试题目');
    expect(prompt).toContain('Socratic');
    expect(prompt).toContain('不直接给答案');
  });

  it('包含图形指令格式说明', () => {
    const prompt = buildSocraticSystemPrompt('测试');
    expect(prompt).toContain('drawRect');
    expect(prompt).toContain('drawCircle');
    expect(prompt).toContain('drawLine');
    expect(prompt).toContain('drawGrid');
    expect(prompt).toContain('drawText');
  });

  it('包含动画类型说明', () => {
    const prompt = buildSocraticSystemPrompt('测试');
    expect(prompt).toContain('fadeIn');
    expect(prompt).toContain('"type": "draw"');
  });

  it('包含 graphicSteps 逐步讲解格式', () => {
    const prompt = buildSocraticSystemPrompt('测试');
    expect(prompt).toContain('graphicSteps');
    expect(prompt).toContain('hint');
    expect(prompt).toContain('instructions');
  });

  it('包含韦恩图（集合/容斥原理）示例', () => {
    const prompt = buildSocraticSystemPrompt('测试');
    expect(prompt).toContain('drawCircle');
    // Venn diagram example includes two circles
    const circleMatches = prompt.match(/"type": "drawCircle"/g) || [];
    expect(circleMatches.length).toBeGreaterThanOrEqual(2);
  });

  it('包含题型→图形策略速查', () => {
    const prompt = buildSocraticSystemPrompt('测试');
    expect(prompt).toContain('韦恩图');
    expect(prompt).toContain('数轴');
  });

  it('opts.grade 影响 prompt 中的年级', () => {
    const prompt = buildSocraticSystemPrompt('题目', { grade: 6 });
    expect(prompt).toContain('6年级');
  });

  it('opts.maxTurns 影响 prompt 中的轮数', () => {
    const prompt = buildSocraticSystemPrompt('题目', { maxTurns: 3 });
    expect(prompt).toContain('3 轮');
  });

  it('默认 grade=4, maxTurns=5', () => {
    const prompt = buildSocraticSystemPrompt('题目');
    expect(prompt).toContain('4年级');
    expect(prompt).toContain('5 轮');
  });
});

// ── 多语言指令注入 ───────────────────────────────────────────────

describe('buildSocraticSystemPrompt() — 语言指令', () => {
  it('zh-CN 不追加额外语言指令', () => {
    const prompt = buildSocraticSystemPrompt('题目', { language: 'zh-CN' });
    expect(prompt).not.toContain('IMPORTANT');
    expect(prompt).not.toContain('Please respond in English');
  });

  it('en-US 追加英文指令', () => {
    const prompt = buildSocraticSystemPrompt('题目', { language: 'en-US' });
    expect(prompt).toContain('Please respond in English');
  });

  it('ja-JP 追加日文指令', () => {
    const prompt = buildSocraticSystemPrompt('題目', { language: 'ja-JP' });
    expect(prompt).toContain('日本語で回答');
  });

  it('ko-KR 追加韩文指令', () => {
    const prompt = buildSocraticSystemPrompt('문제', { language: 'ko-KR' });
    expect(prompt).toContain('한국어로 응답');
  });

  it('es-ES 追加西班牙文指令', () => {
    const prompt = buildSocraticSystemPrompt('problema', { language: 'es-ES' });
    expect(prompt).toContain('español');
  });

  it('fr-FR 追加法文指令', () => {
    const prompt = buildSocraticSystemPrompt('problème', { language: 'fr-FR' });
    expect(prompt).toContain('français');
  });

  it('language 未传时无额外指令', () => {
    const prompt = buildSocraticSystemPrompt('题目');
    expect(prompt).not.toContain('Please respond in English');
    expect(prompt).not.toContain('日本語で回答');
  });
});

// ── parseAIResponse ──────────────────────────────────────────────

describe('parseAIResponse()', () => {
  it('纯文本响应 — 无 JSON 块', () => {
    const result = parseAIResponse('你好，我们来看这道题！');
    expect(result.reply).toBe('你好，我们来看这道题！');
    expect(result.graphicInstructions).toBeUndefined();
    expect(result.graphicSteps).toBeUndefined();
    expect(result.isFinal).toBe(false);
  });

  it('含 legacy graphics JSON 图形指令', () => {
    const content = `先来画个长方形吧！
\`\`\`json
{
  "graphics": [
    { "type": "drawRect", "params": { "x": 100, "y": 100, "width": 200, "height": 150 }, "animation": { "type": "draw", "duration": 1000 } }
  ]
}
\`\`\``;
    const result = parseAIResponse(content);
    expect(result.reply).toBe('先来画个长方形吧！');
    expect(result.graphicInstructions).toHaveLength(1);
    expect(result.graphicInstructions![0].type).toBe('drawRect');
    expect(result.isFinal).toBe(false);
  });

  it('含 graphicSteps 新格式', () => {
    const content = `让我们一步步来看！
\`\`\`json
{
  "graphicSteps": [
    {
      "hint": "先画全集矩形",
      "instructions": [
        { "type": "drawRect", "params": { "x": 60, "y": 60, "width": 500, "height": 280, "stroke": "#888", "strokeWidth": 2 }, "animation": { "type": "draw", "duration": 800 } }
      ]
    },
    {
      "hint": "再画蓝色圆",
      "instructions": [
        { "type": "drawCircle", "params": { "x": 230, "y": 200, "radius": 110, "fill": "rgba(74,144,226,0.25)", "stroke": "#4A90E2", "strokeWidth": 3 }, "animation": { "type": "fadeIn", "duration": 800 } }
      ]
    }
  ],
  "isFinal": false
}
\`\`\``;
    const result = parseAIResponse(content);
    expect(result.reply).toBe('让我们一步步来看！');
    expect(result.graphicSteps).toHaveLength(2);
    expect(result.graphicSteps![0].hint).toBe('先画全集矩形');
    expect(result.graphicSteps![0].instructions[0].type).toBe('drawRect');
    expect(result.graphicSteps![1].instructions[0].type).toBe('drawCircle');
    expect(result.isFinal).toBe(false);
  });

  it('JSON 中含 isFinal=true', () => {
    const content = `很好，总结一下！
\`\`\`json
{
  "isFinal": true,
  "graphics": []
}
\`\`\``;
    const result = parseAIResponse(content);
    expect(result.isFinal).toBe(true);
  });

  it('graphicSteps 中含 isFinal=true', () => {
    const content = `完成了！
\`\`\`json
{
  "graphicSteps": [
    { "hint": "最终答案", "instructions": [] }
  ],
  "isFinal": true
}
\`\`\``;
    const result = parseAIResponse(content);
    expect(result.isFinal).toBe(true);
    expect(result.graphicSteps).toHaveLength(1);
  });

  it('JSON 解析失败时 reply 保留原文', () => {
    const content = '这是回复\n```json\n{ 非法JSON }\n```';
    const result = parseAIResponse(content);
    expect(result.reply).toBe('这是回复');
    expect(result.graphicInstructions).toBeUndefined();
    expect(result.graphicSteps).toBeUndefined();
  });

  it('多个 legacy graphic 指令均被解析', () => {
    const content = `开始教学
\`\`\`json
{
  "graphics": [
    { "type": "drawRect", "params": {}, "animation": { "type": "none", "duration": 0 } },
    { "type": "drawText", "params": {}, "animation": { "type": "fadeIn", "duration": 500 } },
    { "type": "drawLine", "params": {}, "animation": { "type": "draw", "duration": 800 } }
  ]
}
\`\`\``;
    const result = parseAIResponse(content);
    expect(result.graphicInstructions).toHaveLength(3);
    expect(result.graphicInstructions![1].type).toBe('drawText');
  });

  it('剥离 <think>...</think> 标签（Qwen3 推理模型）', () => {
    const content = '<think>\n一些内部推理过程\n</think>\n\n好的，让我们来看这道题！';
    const result = parseAIResponse(content);
    expect(result.reply).toBe('好的，让我们来看这道题！');
    expect(result.reply).not.toContain('<think>');
    expect(result.reply).not.toContain('内部推理');
  });

  it('剥离 <think> 后保留正常文本和 JSON', () => {
    const content = `<think>分析一下</think>
来画个矩形
\`\`\`json
{ "graphics": [{ "type": "drawRect", "params": {}, "animation": { "type": "draw", "duration": 800 } }] }
\`\`\``;
    const result = parseAIResponse(content);
    expect(result.reply).toBe('来画个矩形');
    expect(result.graphicInstructions).toHaveLength(1);
  });
});
