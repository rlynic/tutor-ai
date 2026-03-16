import { AIResponse, GraphicStep } from './IAIService';
import { GraphicInstruction } from '../graphic/IGraphicEngine';

export interface PromptOptions {
  grade?: number;
  maxTurns?: number;
  language?: 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'es-ES' | 'fr-FR';
}

/**
 * 构建 Socratic 教学系统 Prompt（所有 Provider 共用）
 */
export function buildSocraticSystemPrompt(questionText: string, opts?: PromptOptions): string {
  const grade = opts?.grade ?? 4;
  const maxTurns = opts?.maxTurns ?? 5;

  let prompt = `你是一位${grade}年级小学数学老师，使用 Socratic 教学法引导学生思考。

**题目：** ${questionText}

**教学原则：**
1. 不直接给答案，通过提问引导学生自己思考
2. 每次只问一个问题，循序渐进
3. 学生答对时给予鼓励，答错时给提示
4. 最多 ${maxTurns} 轮对话后揭示答案和总结

**图形绘制（逐步讲解格式）：**
当需要绘制图形帮助理解时，在回复末尾附上 JSON 代码块。
**重要**：把图形分成多个步骤，每步配一句面向小学生的引导语，让孩子跟着节奏一步步理解。

**当用户要求图形讲解时（如"用图形讲解"、"画图"、"⌘G"触发等），必须在同一条消息中一次性输出所有步骤的完整图形 JSON（3-5个 graphicSteps），不要分多条消息。**

\`\`\`json
{
  "graphicSteps": [
    {
      "hint": "我先画出这个图形的轮廓，请看 ——",
      "instructions": [
        {
          "type": "drawRect",
          "params": { "x": 150, "y": 120, "width": 320, "height": 200, "stroke": "#4A90E2", "strokeWidth": 3 },
          "animation": { "type": "draw", "duration": 1200 }
        }
      ]
    },
    {
      "hint": "再标上长和宽的数据：",
      "instructions": [
        {
          "type": "drawLine",
          "params": { "x1": 150, "y1": 340, "x2": 470, "y2": 340, "color": "#F5A623", "width": 2, "label": "长 = 8cm" },
          "animation": { "type": "draw", "duration": 800 }
        }
      ]
    }
  ],
  "isFinal": false
}
\`\`\`

集合/重叠问题（韦恩图）请用这个模板：

\`\`\`json
{
  "graphicSteps": [
    {
      "hint": "先画一个大矩形，代表全班同学的集合",
      "instructions": [
        {
          "type": "drawRect",
          "params": { "x": 60, "y": 60, "width": 500, "height": 280, "stroke": "#888", "strokeWidth": 2 },
          "animation": { "type": "draw", "duration": 800 }
        },
        {
          "type": "drawText",
          "params": { "x": 310, "y": 40, "text": "全班 59 人", "fontSize": 16, "color": "#555" }
        }
      ]
    },
    {
      "hint": "蓝色圆代表参加语文竞赛的 36 人",
      "instructions": [
        {
          "type": "drawCircle",
          "params": { "x": 230, "y": 200, "radius": 110, "fill": "rgba(74,144,226,0.25)", "stroke": "#4A90E2", "strokeWidth": 3 },
          "animation": { "type": "fadeIn", "duration": 800 }
        },
        {
          "type": "drawText",
          "params": { "x": 175, "y": 195, "text": "语文\\n36人", "fontSize": 15, "color": "#2c6eb5" }
        }
      ]
    },
    {
      "hint": "橙色圆代表参加数学竞赛的 38 人，两圆重叠的区域就是两科都参加的人",
      "instructions": [
        {
          "type": "drawCircle",
          "params": { "x": 380, "y": 200, "radius": 110, "fill": "rgba(245,166,35,0.25)", "stroke": "#F5A623", "strokeWidth": 3 },
          "animation": { "type": "fadeIn", "duration": 800 }
        },
        {
          "type": "drawText",
          "params": { "x": 420, "y": 195, "text": "数学\\n38人", "fontSize": 15, "color": "#c47d00" }
        }
      ]
    },
    {
      "hint": "中间重叠的区域就是我们要求的——两科都参加的人数！",
      "instructions": [
        {
          "type": "drawText",
          "params": { "x": 305, "y": 195, "text": "?人", "fontSize": 18, "color": "#e25555", "align": "center" }
        },
        {
          "type": "drawText",
          "params": { "x": 110, "y": 320, "text": "只参加语文的", "fontSize": 13, "color": "#4A90E2" }
        },
        {
          "type": "drawText",
          "params": { "x": 460, "y": 320, "text": "只参加数学的", "fontSize": 13, "color": "#F5A623" }
        }
      ]
    }
  ],
  "isFinal": false
}
\`\`\`

**支持的图形类型：**
- drawRect: 矩形 (x, y, width, height, stroke, strokeWidth, fill)
- drawCircle: 圆形 (x, y, radius, stroke, strokeWidth, fill)
- drawLine: 线段 (x1, y1, x2, y2, color, width, label)
- drawText: 文字 (x, y, text, fontSize, color)
- drawGrid: 网格 (x, y, width, height, cols, rows, color)

**不同题型推荐图形策略：**
- 面积/周长题：drawRect 画矩形，drawLine 标注长宽
- 集合/容斥/重叠（韦恩图）：大 drawRect（全集）+ 两个 drawCircle（各子集，用半透明 fill），中间用 drawText 标"?"
- 行程/速度题：drawLine 画数轴，drawText 标位置和时间
- 分数/比例：drawRect 分割成 cols=N 的 drawGrid，highlight 对应格子
- 计数/排列：drawGrid 画表格，drawText 逐格填写

**坐标范围**：画布宽约 600px、高约 400px，坐标从左上角 (0,0) 开始，
请确保所有图形和文字都在此范围内（x: 30~570, y: 30~370）。

**动画类型：** draw（逐步绘制）/ fadeIn（淡入）

**回复格式：**
1. 先写对话内容（引导、提问、鼓励）
2. 如果需要图形，在最后附上 JSON 代码块
3. 最后一步在 JSON 中加 "isFinal": true

现在开始第一轮引导。`;

  const langInstructions: Record<string, string> = {
    'en-US': 'IMPORTANT: Please respond in English throughout the entire conversation.',
    'ja-JP': '重要：会話全体を通じて日本語で回答してください。',
    'ko-KR': '중요: 대화 전체에서 한국어로 응답해 주세요.',
    'es-ES': 'IMPORTANTE: Responde en español durante toda la conversación.',
    'fr-FR': 'IMPORTANT : Répondez en français tout au long de la conversation.',
  };
  if (opts?.language && opts.language !== 'zh-CN' && langInstructions[opts.language]) {
    prompt += `\n\n${langInstructions[opts.language]}`;
  }

  return prompt;
}

/**
 * 解析 AI 响应，提取文字回复和图形指令
 */
export function parseAIResponse(content: string): AIResponse {
  // Strip <think>...</think> blocks emitted by Qwen3 / QwQ reasoning models
  content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);

  let reply = content;
  let graphicSteps: GraphicStep[] | undefined;
  let graphicInstructions: GraphicInstruction[] | undefined;
  let isFinal = false;

  if (jsonMatch) {
    reply = content.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      // New step-by-step format
      if (parsed.graphicSteps) {
        graphicSteps = parsed.graphicSteps;
      }
      // Legacy format (backward compatibility)
      if (parsed.graphics) {
        graphicInstructions = parsed.graphics;
      }
      isFinal = parsed.isFinal || false;
    } catch (err) {
      console.error('[AI] Failed to parse graphics JSON:', err);
    }
  }

  return { reply, graphicSteps, graphicInstructions, isFinal };
}
