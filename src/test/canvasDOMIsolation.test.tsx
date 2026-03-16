/**
 * Canvas DOM 隔离测试 — 验证 Phase 1 修复
 *
 * 回归 Bug：canvasBoxRef div 内有 React 子节点（canvas-overlay），
 * Konva init 后 setIsLearning(true) 触发 reconcile 时抛出
 * "removeChild: The node to be removed is not a child of this node."
 *
 * 修复方案：canvasBoxRef 指向空 div（无 React 子节点），
 * canvas-overlay 改为兄弟节点绝对定位。
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 简化版 Canvas 容器，复现修复前后的结构
const CanvasAreaBefore: React.FC<{ isLearning: boolean }> = ({ isLearning }) => (
  // 修复前：ref div 内有 React 子节点 → 与 Konva 冲突
  <div data-testid="canvas-box" className="canvas-area">
    {!isLearning && (
      <div data-testid="overlay">占位提示</div>
    )}
  </div>
);

const CanvasAreaAfter: React.FC<{ isLearning: boolean }> = ({ isLearning }) => (
  // 修复后：ref div 为纯空容器，overlay 是兄弟节点
  <div className="canvas-area" style={{ position: 'relative' }}>
    <div data-testid="canvas-box" style={{ width: '100%', height: '100%' }} />
    {!isLearning && (
      <div data-testid="overlay" style={{ position: 'absolute', inset: 0 }}>
        占位提示
      </div>
    )}
  </div>
);

describe('Canvas DOM 隔离 — 修复前（验证问题确实存在）', () => {
  it('修复前：canvas-box 是 overlay 的直接父节点 → Konva 插入子节点后 React 移除会冲突', () => {
    const { rerender, getByTestId } = render(<CanvasAreaBefore isLearning={false} />);
    const canvasBox = getByTestId('canvas-box');
    const overlay = getByTestId('overlay');

    // 修复前：overlay 是 canvasBox 的直接子节点
    expect(canvasBox.contains(overlay)).toBe(true);

    // 模拟 Konva 插入自己的 div（isLearning=true 之前）
    const konvaDiv = document.createElement('div');
    konvaDiv.setAttribute('data-konva', 'stage');
    canvasBox.appendChild(konvaDiv);

    // 现在 canvasBox 有两个子节点：overlay 和 konvaDiv
    expect(canvasBox.children).toHaveLength(2);

    // setIsLearning(true) → React 重渲染，试图移除 overlay
    // 但 DOM 结构已被 Konva 改变，这就是冲突根源
    // 这里我们不实际调用 rerender（会触发真实 removeChild），
    // 仅断言问题条件成立
    expect(canvasBox.firstChild).toBe(overlay);
    expect(canvasBox.lastChild).toBe(konvaDiv);
  });
});

describe('Canvas DOM 隔离 — 修复后（验证修复有效）', () => {
  it('修复后：canvas-box 永远是空 div，overlay 是兄弟节点，互不干扰', () => {
    const { rerender, getByTestId, queryByTestId } = render(<CanvasAreaAfter isLearning={false} />);
    const canvasBox = getByTestId('canvas-box');
    const overlay = getByTestId('overlay');

    // canvas-box 不包含 overlay
    expect(canvasBox.contains(overlay)).toBe(false);
    // canvas-box 初始无子节点（Konva 还未初始化）
    expect(canvasBox.children).toHaveLength(0);

    // 模拟 Konva 往 canvas-box 里插入 stage div
    const konvaDiv = document.createElement('div');
    konvaDiv.setAttribute('data-konva', 'stage');
    canvasBox.appendChild(konvaDiv);
    expect(canvasBox.children).toHaveLength(1);

    // setIsLearning(true) → React 重渲染，移除 overlay（兄弟节点，不影响 canvasBox）
    rerender(<CanvasAreaAfter isLearning={true} />);

    // overlay 被正确移除
    expect(queryByTestId('overlay')).toBeNull();

    // canvas-box 内的 Konva stage div 完全不受影响
    expect(canvasBox.children).toHaveLength(1);
    expect(canvasBox.firstElementChild?.getAttribute('data-konva')).toBe('stage');
  });

  it('isLearning 来回切换，canvasBox 内容始终独立于 React reconcile', () => {
    const { rerender, getByTestId, queryByTestId } = render(<CanvasAreaAfter isLearning={false} />);
    const canvasBox = getByTestId('canvas-box');

    // 注入 Konva DOM
    const konvaDiv = document.createElement('div');
    canvasBox.appendChild(konvaDiv);

    // false → true → false 切换
    rerender(<CanvasAreaAfter isLearning={true} />);
    expect(queryByTestId('overlay')).toBeNull();
    expect(canvasBox.children).toHaveLength(1); // konvaDiv 仍在

    rerender(<CanvasAreaAfter isLearning={false} />);
    expect(queryByTestId('overlay')).not.toBeNull();
    expect(canvasBox.children).toHaveLength(1); // konvaDiv 仍在，未被 React 干扰
  });
});
