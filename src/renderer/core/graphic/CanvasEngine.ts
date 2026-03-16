import Konva from 'konva';
import gsap from 'gsap';
import {
  IGraphicEngine,
  GraphicInstruction,
  AnimationConfig,
  DrawLineParams,
  DrawRectParams,
  DrawCircleParams,
  DrawTextParams,
  DrawGridParams,
} from './IGraphicEngine';

/**
 * Canvas 图形渲染引擎
 * 基于 Konva.js，动画由 GSAP 驱动
 */
export class CanvasEngine implements IGraphicEngine {
  private stage: Konva.Stage | null = null;
  private layer: Konva.Layer | null = null;
  private _speed = 1;

  init(container: HTMLDivElement, width: number, height: number): void {
    this.stage = new Konva.Stage({ container, width, height });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  async execute(instruction: GraphicInstruction): Promise<void> {
    if (!this.layer) throw new Error('Engine not initialized');

    const anim = instruction.animation || { type: 'none', duration: 0 };

    switch (instruction.type) {
      case 'drawLine':
        await this.drawLine(instruction.params as DrawLineParams, anim);
        break;
      case 'drawRect':
        await this.drawRect(instruction.params as DrawRectParams, anim);
        break;
      case 'drawCircle':
        await this.drawCircle(instruction.params as DrawCircleParams, anim);
        break;
      case 'drawText':
        await this.drawText(instruction.params as DrawTextParams, anim);
        break;
      case 'drawGrid':
        await this.drawGrid(instruction.params as DrawGridParams, anim);
        break;
      case 'highlight':
        await this.highlight(instruction.params as DrawRectParams, anim);
        break;
      default:
        console.warn('Unknown instruction type:', instruction.type);
    }

    this.layer.batchDraw();
  }

  // ── Line ────────────────────────────────────
  private async drawLine(params: DrawLineParams, anim: AnimationConfig): Promise<void> {
    if (!this.layer) return;

    if (anim.type === 'draw') {
      const line = new Konva.Line({
        points: [params.x1, params.y1, params.x1, params.y1],
        stroke: params.color || '#333333',
        strokeWidth: params.width || 2,
      });
      this.layer.add(line);
      await this.gsapTweenPoints(line, params, anim.duration);
    } else {
      const line = new Konva.Line({
        points: [params.x1, params.y1, params.x2, params.y2],
        stroke: params.color || '#333333',
        strokeWidth: params.width || 2,
        opacity: anim.type === 'fadeIn' ? 0 : 1,
      });
      this.layer.add(line);
      if (anim.type === 'fadeIn') await this.gsapFadeIn(line, anim.duration);
    }

    if (params.label) {
      const stageW = this.stage!.width();
      const midX = (params.x1 + params.x2) / 2;
      const midY = (params.y1 + params.y2) / 2;
      const isVertical = Math.abs(params.x2 - params.x1) < Math.abs(params.y2 - params.y1);
      const rawX = isVertical ? midX + 10 : midX - 30;
      // Clamp text to stay within canvas right boundary (estimate ~9px per char)
      const safeX = Math.min(rawX, stageW - params.label.length * 9 - 20);
      const text = new Konva.Text({
        x: Math.max(4, safeX),
        y: isVertical ? midY - 10 : midY + 8,
        text: params.label,
        fontSize: 16,
        fontStyle: 'bold',
        fill: params.color || '#F5A623',
        opacity: 0,
      });
      this.layer.add(text);
      await this.gsapFadeIn(text, 400);
    }
  }

  // ── Rect ────────────────────────────────────
  private async drawRect(params: DrawRectParams, anim: AnimationConfig): Promise<void> {
    if (!this.layer) return;

    const rect = new Konva.Rect({
      x: params.x,
      y: params.y,
      width: anim.type === 'draw' ? 0 : params.width,
      height: anim.type === 'draw' ? 0 : params.height,
      fill: params.fill || 'transparent',
      stroke: params.stroke || '#333333',
      strokeWidth: params.strokeWidth || 2,
      opacity: anim.type === 'fadeIn' ? 0 : 1,
    });
    this.layer.add(rect);

    if (anim.type === 'draw') {
      await this.gsapAnimate(rect, { width: params.width, height: params.height }, anim.duration);
    } else if (anim.type === 'fadeIn') {
      await this.gsapFadeIn(rect, anim.duration);
    }

    if (params.label) {
      const text = new Konva.Text({
        x: params.x,
        y: params.y + params.height + 10,
        text: params.label,
        fontSize: 14,
        fill: '#666666',
        opacity: 0,
      });
      this.layer.add(text);
      await this.gsapFadeIn(text, 400);
    }
  }

  // ── Circle ──────────────────────────────────
  private async drawCircle(params: DrawCircleParams, anim: AnimationConfig): Promise<void> {
    if (!this.layer) return;

    const circle = new Konva.Circle({
      x: params.x,
      y: params.y,
      radius: anim.type === 'draw' ? 0 : params.radius,
      fill: params.fill || 'transparent',
      stroke: params.stroke || '#333333',
      strokeWidth: params.strokeWidth || 2,
      opacity: anim.type === 'fadeIn' ? 0 : 1,
    });
    this.layer.add(circle);

    if (anim.type === 'draw') {
      await this.gsapAnimate(circle, { radius: params.radius }, anim.duration);
    } else if (anim.type === 'fadeIn') {
      await this.gsapFadeIn(circle, anim.duration);
    }

    if (params.label) {
      const text = new Konva.Text({
        x: params.x - 20,
        y: params.y + params.radius + 10,
        text: params.label,
        fontSize: 14,
        fill: '#666666',
        opacity: 0,
      });
      this.layer.add(text);
      await this.gsapFadeIn(text, 400);
    }
  }

  // ── Text ────────────────────────────────────
  private async drawText(params: DrawTextParams, anim: AnimationConfig): Promise<void> {
    if (!this.layer) return;

    const text = new Konva.Text({
      x: params.x,
      y: params.y,
      text: params.text,
      fontSize: params.fontSize || 16,
      fill: params.color || '#333333',
      align: params.align || 'left',
      fontStyle: 'bold',
      opacity: anim.type === 'fadeIn' ? 0 : 1,
    });
    this.layer.add(text);

    if (anim.type === 'fadeIn') await this.gsapFadeIn(text, anim.duration);
  }

  // ── Grid ────────────────────────────────────
  private async drawGrid(params: DrawGridParams, anim: AnimationConfig): Promise<void> {
    if (!this.layer) return;

    const cellW = params.width / params.cols;
    const cellH = params.height / params.rows;
    const group = new Konva.Group({ opacity: anim.type === 'fadeIn' ? 0 : 1 });

    for (let i = 1; i < params.cols; i++) {
      group.add(new Konva.Line({
        points: [params.x + i * cellW, params.y, params.x + i * cellW, params.y + params.height],
        stroke: params.color || 'rgba(74, 144, 226, 0.3)',
        strokeWidth: 1,
      }));
    }

    for (let j = 1; j < params.rows; j++) {
      group.add(new Konva.Line({
        points: [params.x, params.y + j * cellH, params.x + params.width, params.y + j * cellH],
        stroke: params.color || 'rgba(74, 144, 226, 0.3)',
        strokeWidth: 1,
      }));
    }

    this.layer.add(group);
    if (anim.type === 'fadeIn') await this.gsapFadeIn(group, anim.duration);
  }

  // ── Highlight (GSAP stroke blink) ──────────
  private async highlight(params: DrawRectParams, anim: AnimationConfig): Promise<void> {
    if (!this.layer) return;

    const rect = new Konva.Rect({
      x: params.x,
      y: params.y,
      width: params.width,
      height: params.height,
      stroke: params.stroke || '#FFD700',
      strokeWidth: params.strokeWidth || 4,
      fill: 'transparent',
      opacity: 1,
    });
    this.layer.add(rect);

    // GSAP blink animation
    await new Promise<void>((resolve) => {
      gsap.to({}, {
        duration: (anim.duration || 1200) / 1000 / this._speed,
        repeat: 2,
        yoyo: true,
        onUpdate: () => {
          rect.opacity(rect.opacity() > 0.5 ? 0.2 : 1);
          this.layer?.batchDraw();
        },
        onComplete: () => {
          rect.opacity(1);
          this.layer?.batchDraw();
          resolve();
        },
      });
    });
  }

  // ── GSAP animation helpers ──────────────────

  private gsapFadeIn(node: Konva.Node, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const proxy = { opacity: 0 };
      gsap.to(proxy, {
        opacity: 1,
        duration: duration / 1000 / this._speed,
        ease: 'power2.inOut',
        onUpdate: () => {
          node.opacity(proxy.opacity);
          this.layer?.batchDraw();
        },
        onComplete: () => {
          node.opacity(1);
          this.layer?.batchDraw();
          resolve();
        },
      });
    });
  }

  private gsapAnimate(node: Konva.Shape, props: Record<string, number>, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const propKeys = Object.keys(props);
      const proxy = Object.fromEntries(propKeys.map(k => [k, 0]));
      gsap.to(proxy, {
        ...props,
        duration: duration / 1000 / this._speed,
        ease: 'power2.inOut',
        onUpdate: () => {
          for (const k of propKeys) {
            (node as any)[k](proxy[k]);
          }
          this.layer?.batchDraw();
        },
        onComplete: resolve,
      });
    });
  }

  private gsapTweenPoints(line: Konva.Line, params: DrawLineParams, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const proxy = { t: 0 };
      gsap.to(proxy, {
        t: 1,
        duration: duration / 1000 / this._speed,
        ease: 'power2.inOut',
        onUpdate: () => {
          const t = proxy.t;
          const curX = params.x1 + (params.x2 - params.x1) * t;
          const curY = params.y1 + (params.y2 - params.y1) * t;
          line.points([params.x1, params.y1, curX, curY]);
          this.layer?.batchDraw();
        },
        onComplete: () => {
          line.points([params.x1, params.y1, params.x2, params.y2]);
          this.layer?.batchDraw();
          resolve();
        },
      });
    });
  }

  setSpeed(speed: number): void {
    this._speed = speed > 0 ? speed : 1;
  }

  pause(): void {
    gsap.globalTimeline.pause();
  }

  resume(): void {
    gsap.globalTimeline.resume();
  }

  clear(): void {
    if (this.layer) {
      gsap.killTweensOf('*');
      this.layer.destroyChildren();
      this.layer.batchDraw();
    }
  }

  destroy(): void {
    if (this.stage) {
      try {
        gsap.killTweensOf('*');
        const container = this.stage.container();
        if (container && container.parentNode) {
          this.stage.destroy();
        } else {
          this.stage = null;
          this.layer = null;
        }
      } catch (err) {
        console.warn('[CanvasEngine] Destroy failed, cleaning up references', err);
      }
      this.stage = null;
      this.layer = null;
    }
  }
}
