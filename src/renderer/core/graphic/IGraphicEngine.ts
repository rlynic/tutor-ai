/**
 * 图形渲染引擎接口
 * 负责所有图形的绘制、动画、交互
 */

export interface IGraphicEngine {
  init(container: HTMLDivElement, width: number, height: number): void;
  execute(instruction: GraphicInstruction): Promise<void>;
  setSpeed(speed: number): void;
  pause(): void;
  resume(): void;
  clear(): void;
  destroy(): void;
}

/**
 * 图形指令类型
 */
export type GraphicInstructionType =
  | 'drawLine'
  | 'drawRect'
  | 'drawCircle'
  | 'drawText'
  | 'drawGrid'
  | 'highlight';

/**
 * 动画配置
 */
export interface AnimationConfig {
  type: 'draw' | 'fadeIn' | 'none';
  duration: number;
}

/**
 * 图形指令
 */
export interface GraphicInstruction {
  type: GraphicInstructionType;
  params: any;
  animation?: AnimationConfig;
}

export interface DrawLineParams {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  width?: number;
  label?: string;
}

export interface DrawRectParams {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  label?: string;
}

export interface DrawCircleParams {
  x: number;
  y: number;
  radius: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  label?: string;
}

export interface DrawTextParams {
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DrawGridParams {
  x: number;
  y: number;
  width: number;
  height: number;
  cols: number;
  rows: number;
  color?: string;
}
