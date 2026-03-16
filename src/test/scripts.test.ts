/**
 * Phase 7 测试：脚本匹配与内容验证
 */
import { describe, it, expect } from 'vitest';
import {
  matchScript,
  allScripts,
  rectangleAreaScript,
  circleAreaScript,
  fractionBasicScript,
  wordProblemScript,
  numberLineScript,
  fractionCompareScript,
} from '../renderer/core/dialog/scripts';

describe('matchScript()', () => {
  it('匹配长方形面积关键词', () => {
    expect(matchScript('一个长方形的长是8cm，求面积')?.name).toBe('长方形面积计算');
    expect(matchScript('求长方形的周长')?.name).toBe('长方形面积计算');
  });

  it('匹配圆的面积关键词', () => {
    expect(matchScript('已知圆的半径是5cm，求面积')?.name).toBe('圆的面积');
    expect(matchScript('圆的π怎么算')?.name).toBe('圆的面积');
  });

  it('匹配分数关键词', () => {
    expect(matchScript('什么是分数？')?.name).toBe('分数认知');
    expect(matchScript('三分之一是多少')?.name).toBe('分数认知');
  });

  it('匹配应用题关键词', () => {
    expect(matchScript('加法应用题怎么做')?.name).toBe('加减法应用题');
    expect(matchScript('小明有15颗糖一共多少')?.name).toBe('加减法应用题');
  });

  it('匹配数轴关键词', () => {
    expect(matchScript('数轴上的整数')?.name).toBe('数轴认知');
    expect(matchScript('什么是负数')?.name).toBe('数轴认知');
  });

  it('匹配分数大小比较', () => {
    expect(matchScript('分数比较大小')?.name).toBe('分数大小比较');
    expect(matchScript('哪个分数更大')?.name).toBe('分数大小比较');
  });

  it('无关题目返回 null', () => {
    expect(matchScript('中文语文作文')).toBeNull();
    expect(matchScript('英语单词拼写')).toBeNull();
    expect(matchScript('')).toBeNull();
  });
});

describe('脚本内容验证', () => {
  it('allScripts 包含 6 个脚本', () => {
    expect(allScripts).toHaveLength(6);
  });

  it('每个脚本至少有 3 步', () => {
    for (const script of allScripts) {
      expect(script.steps.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('每个脚本最后一步有 isFinal=true', () => {
    for (const script of allScripts) {
      const lastStep = script.steps[script.steps.length - 1];
      expect(lastStep.isFinal).toBe(true);
    }
  });

  it('rectangleAreaScript 第 1 步包含 drawRect 指令', () => {
    const step0 = rectangleAreaScript.steps[0];
    expect(step0.graphicInstructions).toBeDefined();
    expect(step0.graphicInstructions![0].type).toBe('drawRect');
  });

  it('rectangleAreaScript 步骤 2-4 包含预期关键词', () => {
    expect(rectangleAreaScript.steps[1].expectedKeywords).toContain('8');
    expect(rectangleAreaScript.steps[2].expectedKeywords).toContain('5');
    expect(rectangleAreaScript.steps[3].expectedKeywords).toContain('40');
  });

  it('circleAreaScript 包含 drawCircle 指令', () => {
    const hasCircle = circleAreaScript.steps.some(
      step => step.graphicInstructions?.some(i => i.type === 'drawCircle')
    );
    expect(hasCircle).toBe(true);
  });

  it('fractionBasicScript 包含 drawGrid 指令', () => {
    const hasGrid = fractionBasicScript.steps.some(
      step => step.graphicInstructions?.some(i => i.type === 'drawGrid')
    );
    expect(hasGrid).toBe(true);
  });

  it('numberLineScript 包含多个 drawLine 指令', () => {
    const lines = numberLineScript.steps.flatMap(
      s => (s.graphicInstructions || []).filter(i => i.type === 'drawLine')
    );
    expect(lines.length).toBeGreaterThan(0);
  });

  it('fractionCompareScript 包含两组对比 drawRect', () => {
    const rects = fractionCompareScript.steps.flatMap(
      s => (s.graphicInstructions || []).filter(i => i.type === 'drawRect')
    );
    expect(rects.length).toBeGreaterThanOrEqual(2);
  });

  it('wordProblemScript 关键词包含正确答案', () => {
    const answerStep = wordProblemScript.steps.find(
      s => s.expectedKeywords?.includes('9')
    );
    expect(answerStep).toBeDefined();
  });
});
