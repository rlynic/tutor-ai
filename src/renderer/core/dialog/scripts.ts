/**
 * 模拟对话脚本
 * 在没有 API Key 时使用预设脚本演示完整流程
 */

import { GraphicInstruction } from '../graphic/IGraphicEngine';

export interface ScriptStep {
  reply: string;
  expectedKeywords?: string[];
  correctReply?: string;
  hintReply?: string;
  graphicInstructions?: GraphicInstruction[];
  isFinal?: boolean;
}

export interface DialogScript {
  name: string;
  triggerKeywords: string[];
  steps: ScriptStep[];
}

// ── P0: 长方形面积 ─────────────────────────────────────────────

export const rectangleAreaScript: DialogScript = {
  name: '长方形面积计算',
  triggerKeywords: ['长方形', '面积', '周长'],
  steps: [
    {
      reply: '好的，我们来看这道题！让我先把这个长方形画出来 📐',
      graphicInstructions: [
        {
          type: 'drawRect',
          params: { x: 150, y: 120, width: 320, height: 200, stroke: '#4A90E2', strokeWidth: 3, fill: 'transparent' },
          animation: { type: 'draw', duration: 1500 },
        },
      ],
    },
    {
      reply: '看看这个长方形，你能告诉我它的长是多少吗？ 🤔',
      expectedKeywords: ['8', '8cm', '八'],
      correctReply: '没错！长是 8cm，真棒！👏',
      hintReply: '再仔细看看题目，长方形的长是多少呢？提示：看看题目中的数字 😊',
      graphicInstructions: [
        {
          type: 'drawLine',
          params: { x1: 150, y1: 340, x2: 470, y2: 340, color: '#F5A623', width: 2, label: '长 = 8cm' },
          animation: { type: 'draw', duration: 800 },
        },
      ],
    },
    {
      reply: '很好！那宽是多少呢？ 🤔',
      expectedKeywords: ['5', '5cm', '五'],
      correctReply: '对啦！宽是 5cm！👏',
      hintReply: '再看看题目，宽的数值是什么？ 😊',
      graphicInstructions: [
        {
          type: 'drawLine',
          params: { x1: 490, y1: 120, x2: 490, y2: 320, color: '#F5A623', width: 2, label: '宽 = 5cm' },
          animation: { type: 'draw', duration: 800 },
        },
      ],
    },
    {
      reply: '现在我们知道长是 8cm，宽是 5cm。想一想，面积应该怎么算呢？💡\n\n提示：看看这些小格子，每个格子是 1cm × 1cm...',
      expectedKeywords: ['40', '8×5', '8*5', '长乘宽', '长×宽'],
      correctReply: '太厉害了！面积 = 长 × 宽 = 8 × 5 = 40cm²！🎉',
      hintReply: '想一想：如果每行有 8 个格子，一共有 5 行，总共有多少个格子呢？ 😊',
      graphicInstructions: [
        {
          type: 'drawGrid',
          params: { x: 150, y: 120, width: 320, height: 200, cols: 8, rows: 5, color: 'rgba(74, 144, 226, 0.3)' },
          animation: { type: 'fadeIn', duration: 1200 },
        },
      ],
    },
    {
      reply: '🎉 太棒了！你完全理解了！\n\n📝 总结：\n• 长方形面积 = 长 × 宽\n• 面积 = 8cm × 5cm = 40cm²\n\n记住这个公式，以后遇到类似的题目就不怕啦！💪',
      isFinal: true,
      graphicInstructions: [
        {
          type: 'drawRect',
          params: { x: 150, y: 120, width: 320, height: 200, stroke: '#4A90E2', strokeWidth: 3, fill: 'rgba(74, 144, 226, 0.15)' },
          animation: { type: 'fadeIn', duration: 800 },
        },
        {
          type: 'drawText',
          params: { x: 220, y: 200, text: '面积 = 40cm²', fontSize: 28, color: '#F5A623' },
          animation: { type: 'fadeIn', duration: 600 },
        },
      ],
    },
  ],
};

// ── P0: 圆的面积 ──────────────────────────────────────────────

export const circleAreaScript: DialogScript = {
  name: '圆的面积',
  triggerKeywords: ['圆', '半径', '直径', 'π', 'pi'],
  steps: [
    {
      reply: '好的！我们来学习圆的面积。让我先画一个圆 ⭕',
      graphicInstructions: [
        {
          type: 'drawCircle',
          params: { x: 310, y: 230, radius: 150, stroke: '#E84393', strokeWidth: 3, fill: 'transparent' },
          animation: { type: 'draw', duration: 1500 },
        },
      ],
    },
    {
      reply: '这个圆的半径是 5cm。你知道什么是半径吗？',
      expectedKeywords: ['圆心', '中心', '一半', '半径'],
      correctReply: '非常好！半径就是从圆心到圆上任意一点的距离 👏',
      hintReply: '半径是从圆的中心点出发，到圆边上的距离 😊',
      graphicInstructions: [
        {
          type: 'drawLine',
          params: { x1: 310, y1: 230, x2: 460, y2: 230, color: '#E84393', width: 2, label: 'r = 5cm' },
          animation: { type: 'draw', duration: 800 },
        },
      ],
    },
    {
      reply: '圆的面积公式是 S = π × r²。π ≈ 3.14，r 是半径。\n\n你能算出面积吗？（提示：r = 5，所以 r² = 5×5 = 25）',
      expectedKeywords: ['78.5', '78', '3.14×25', '25π'],
      correctReply: '完全正确！S = π × 5² = 3.14 × 25 = 78.5cm² 🎉',
      hintReply: 'S = π × r²，其中 r=5，先算 r² = 5×5 = 25，然后乘以 π ≈ 3.14，得到多少？ 💡',
      graphicInstructions: [
        {
          type: 'drawCircle',
          params: { x: 310, y: 230, radius: 150, stroke: '#E84393', strokeWidth: 3, fill: 'rgba(232, 67, 147, 0.1)' },
          animation: { type: 'fadeIn', duration: 800 },
        },
      ],
    },
    {
      reply: '🎉 太棒了！\n\n📝 总结：\n• 圆的面积公式：S = π × r²\n• 其中 π ≈ 3.14，r 是半径\n• 本题：S = 3.14 × 5² = 78.5cm²\n\n记住这个公式！💪',
      isFinal: true,
      graphicInstructions: [
        {
          type: 'drawText',
          params: { x: 210, y: 215, text: 'S = 78.5cm²', fontSize: 24, color: '#E84393' },
          animation: { type: 'fadeIn', duration: 600 },
        },
      ],
    },
  ],
};

// ── P0: 分数认知 ──────────────────────────────────────────────

export const fractionBasicScript: DialogScript = {
  name: '分数认知',
  triggerKeywords: ['分数', '分之', '分母', '分子', '二分之', '三分之', '四分之'],
  steps: [
    {
      reply: '今天我们来认识分数！先看这个长方形，我把它平均分成 4 份 📊',
      graphicInstructions: [
        {
          type: 'drawRect',
          params: { x: 100, y: 150, width: 400, height: 120, stroke: '#333', strokeWidth: 2, fill: 'transparent' },
          animation: { type: 'draw', duration: 1000 },
        },
        {
          type: 'drawGrid',
          params: { x: 100, y: 150, width: 400, height: 120, cols: 4, rows: 1, color: '#333' },
          animation: { type: 'fadeIn', duration: 600 },
        },
      ],
    },
    {
      reply: '我把其中 1 份涂上颜色。涂色部分占整体的几分之几？',
      expectedKeywords: ['四分之一', '1/4', '¼', '0.25'],
      correctReply: '非常好！涂色部分是 1/4，也读作"四分之一" 👏',
      hintReply: '整体被分成 4 份，我们涂了 1 份，所以是 ? / 4 😊',
      graphicInstructions: [
        {
          type: 'drawRect',
          params: { x: 100, y: 150, width: 100, height: 120, stroke: '#F5A623', strokeWidth: 0, fill: 'rgba(245, 166, 35, 0.5)' },
          animation: { type: 'fadeIn', duration: 800 },
        },
      ],
    },
    {
      reply: '很好！分数 1/4 中，上面的"1"叫什么？下面的"4"叫什么？',
      expectedKeywords: ['分子', '分母'],
      correctReply: '完全正确！上面是分子（被分的份数），下面是分母（总份数） 🎉',
      hintReply: '分数线上方的数字叫分子，下方的数字叫分母 💡',
      graphicInstructions: [
        {
          type: 'drawText',
          params: { x: 180, y: 310, text: '分子 = 1（涂色份数）', fontSize: 16, color: '#F5A623' },
          animation: { type: 'fadeIn', duration: 500 },
        },
        {
          type: 'drawText',
          params: { x: 180, y: 340, text: '分母 = 4（总份数）', fontSize: 16, color: '#4A90E2' },
          animation: { type: 'fadeIn', duration: 500 },
        },
      ],
    },
    {
      reply: '🎉 很棒！\n\n📝 总结：\n• 分数 = 分子 / 分母\n• 分母 = 整体被分成的总份数\n• 分子 = 取了多少份\n• 例如：1/4 表示把整体分成 4 份，取其中 1 份\n\n分数其实很简单！💪',
      isFinal: true,
    },
  ],
};

// ── P0: 加减法应用题（数轴） ───────────────────────────────────

export const wordProblemScript: DialogScript = {
  name: '加减法应用题',
  triggerKeywords: ['加法', '减法', '应用题', '一共', '还剩', '多了', '少了', '求和', '相差'],
  steps: [
    {
      reply: '来做一道应用题！小明有 15 颗糖，送给小红 6 颗，还剩几颗？\n\n我们用数轴来帮助理解 📏',
      graphicInstructions: [
        {
          type: 'drawLine',
          params: { x1: 60, y1: 230, x2: 560, y2: 230, color: '#333', width: 2 },
          animation: { type: 'draw', duration: 800 },
        },
        {
          type: 'drawText',
          params: { x: 55, y: 240, text: '0', fontSize: 14, color: '#666' },
          animation: { type: 'fadeIn', duration: 300 },
        },
        {
          type: 'drawText',
          params: { x: 375, y: 240, text: '15', fontSize: 14, color: '#4A90E2' },
          animation: { type: 'fadeIn', duration: 300 },
        },
      ],
    },
    {
      reply: '我们先在数轴上标出 15（小明原有的糖数）。\n\n这道题是加法还是减法？',
      expectedKeywords: ['减法', '减', '减去', '少'],
      correctReply: '对！送出去就是减法 👏 15 - 6 = ?',
      hintReply: '"送出去"代表数量减少，所以应该用减法 💡',
      graphicInstructions: [
        {
          type: 'drawLine',
          params: { x1: 375, y1: 200, x2: 255, y2: 200, color: '#E84393', width: 3, label: '- 6' },
          animation: { type: 'draw', duration: 800 },
        },
      ],
    },
    {
      reply: '箭头向左移动 6 格，从 15 出发向左 6 格，到达哪个数？',
      expectedKeywords: ['9', '九'],
      correctReply: '非常棒！15 - 6 = 9，小明还剩 9 颗糖！🎉',
      hintReply: '从 15 出发，向左数 6 格：15、14、13、12、11、10、? 😊',
      graphicInstructions: [
        {
          type: 'drawText',
          params: { x: 248, y: 240, text: '9', fontSize: 14, color: '#E84393' },
          animation: { type: 'fadeIn', duration: 300 },
        },
      ],
    },
    {
      reply: '🎉 完全正确！\n\n📝 总结：\n• 题目中的"送出"、"用了"、"少了"→ 减法\n• 题目中的"得到"、"买了"、"多了"→ 加法\n• 数轴可以帮助我们直观理解加减法\n\n15 - 6 = 9 ✅',
      isFinal: true,
    },
  ],
};

// ── P1: 数轴上的整数和小数 ────────────────────────────────────

export const numberLineScript: DialogScript = {
  name: '数轴认知',
  triggerKeywords: ['数轴', '整数', '小数', '负数', '正数'],
  steps: [
    {
      reply: '今天学习数轴！数轴是一条有方向的直线，可以表示所有数 📏',
      graphicInstructions: [
        {
          type: 'drawLine',
          params: { x1: 60, y1: 230, x2: 560, y2: 230, color: '#333', width: 2 },
          animation: { type: 'draw', duration: 1000 },
        },
        {
          type: 'drawText',
          params: { x: 300, y: 240, text: '0', fontSize: 16, color: '#333' },
          animation: { type: 'fadeIn', duration: 400 },
        },
        {
          type: 'drawText',
          params: { x: 540, y: 240, text: '→', fontSize: 20, color: '#333' },
          animation: { type: 'fadeIn', duration: 400 },
        },
      ],
    },
    {
      reply: '数轴上 0 右边是正数，左边是负数。\n\n数轴上哪个方向表示数越来越大？',
      expectedKeywords: ['右', '右边', '向右'],
      correctReply: '对！向右方向数越来越大 👏 所以 3 在 2 的右边',
      hintReply: '箭头指向哪边，那个方向的数就越来越大 💡',
      graphicInstructions: [
        {
          type: 'drawText',
          params: { x: 180, y: 240, text: '-2', fontSize: 14, color: '#E84393' },
          animation: { type: 'fadeIn', duration: 400 },
        },
        {
          type: 'drawText',
          params: { x: 420, y: 240, text: '2', fontSize: 14, color: '#4A90E2' },
          animation: { type: 'fadeIn', duration: 400 },
        },
      ],
    },
    {
      reply: '在数轴上，-2 和 2 哪个更大？',
      expectedKeywords: ['2', '正2', '+2'],
      correctReply: '非常好！2 在 -2 的右边，所以 2 > -2 🎉',
      hintReply: '在数轴上，右边的数总是比左边的数大 😊',
    },
    {
      reply: '🎉 太棒了！\n\n📝 总结：\n• 数轴向右数越来越大\n• 0 右边是正数（+1, +2, ...）\n• 0 左边是负数（-1, -2, ...）\n• 正数 > 0 > 负数\n\n你掌握了数轴的基本知识！💪',
      isFinal: true,
    },
  ],
};

// ── P1: 分数大小比较 ──────────────────────────────────────────

export const fractionCompareScript: DialogScript = {
  name: '分数大小比较',
  triggerKeywords: ['分数比较', '哪个大', '比较分数', '分数大小', '哪个分数', '分数更大', '比大小'],
  steps: [
    {
      reply: '我们来比较 1/2 和 1/3 的大小！先用图形来理解 📊',
      graphicInstructions: [
        // Top bar: 1/2
        {
          type: 'drawRect',
          params: { x: 100, y: 120, width: 400, height: 60, stroke: '#333', strokeWidth: 2, fill: 'transparent' },
          animation: { type: 'draw', duration: 800 },
        },
        {
          type: 'drawRect',
          params: { x: 100, y: 120, width: 200, height: 60, stroke: '#4A90E2', strokeWidth: 0, fill: 'rgba(74,144,226,0.4)' },
          animation: { type: 'fadeIn', duration: 600 },
        },
        {
          type: 'drawText',
          params: { x: 520, y: 145, text: '1/2', fontSize: 18, color: '#4A90E2' },
          animation: { type: 'fadeIn', duration: 400 },
        },
        // Bottom bar: 1/3
        {
          type: 'drawRect',
          params: { x: 100, y: 220, width: 400, height: 60, stroke: '#333', strokeWidth: 2, fill: 'transparent' },
          animation: { type: 'draw', duration: 800 },
        },
        {
          type: 'drawRect',
          params: { x: 100, y: 220, width: 133, height: 60, stroke: '#E84393', strokeWidth: 0, fill: 'rgba(232,67,147,0.4)' },
          animation: { type: 'fadeIn', duration: 600 },
        },
        {
          type: 'drawText',
          params: { x: 520, y: 245, text: '1/3', fontSize: 18, color: '#E84393' },
          animation: { type: 'fadeIn', duration: 400 },
        },
      ],
    },
    {
      reply: '两个长方形一样大，蓝色涂了 1/2，粉色涂了 1/3。\n\n从图中看，哪部分涂的面积更大？',
      expectedKeywords: ['1/2', '二分之一', '蓝', '上面'],
      correctReply: '完全正确！1/2 > 1/3，蓝色部分更大 👏',
      hintReply: '看图中蓝色和粉色哪个占更多面积？ 😊',
    },
    {
      reply: '很好！你能发现规律吗？分母相同时，分子越大，分数越大。分子相同时，分母越大，分数越... 大还是小？',
      expectedKeywords: ['小', '越小'],
      correctReply: '非常棒！分子相同时，分母越大，分数越小（被分成更多份，每份就更少）🎉',
      hintReply: '被分成 3 份，每份比被分成 2 份的要小还是大？ 💡',
    },
    {
      reply: '🎉 出色！\n\n📝 比较分数大小规律：\n• 分母相同：分子大的分数大（如 3/5 > 2/5）\n• 分子相同：分母小的分数大（如 1/2 > 1/3）\n• 通分后比较：化为同分母分数再比大小\n\n你掌握了分数比较！💪',
      isFinal: true,
    },
  ],
};

// ── 所有脚本 ───────────────────────────────────────────────────

export const allScripts: DialogScript[] = [
  // 更具体的脚本优先，避免被通用关键词（"面积"、"分数"）提前截获
  circleAreaScript,        // 圆, 半径, π
  fractionCompareScript,   // 分数比较, 分数大小
  fractionBasicScript,     // 分数 (通用)
  rectangleAreaScript,     // 长方形, 面积, 周长
  wordProblemScript,       // 加法, 减法, 应用题
  numberLineScript,        // 数轴, 整数, 负数
];

/**
 * 根据题目文本匹配合适的脚本
 */
export function matchScript(questionText: string): DialogScript | null {
  for (const script of allScripts) {
    const matched = script.triggerKeywords.some(kw => questionText.includes(kw));
    if (matched) return script;
  }
  return null;
}
