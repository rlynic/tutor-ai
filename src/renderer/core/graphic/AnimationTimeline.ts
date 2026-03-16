import gsap from 'gsap';

/**
 * 动画时间轴控制器
 * 封装 GSAP Timeline，提供播放/暂停/回放/变速
 */
export class AnimationTimeline {
  private timeline: gsap.core.Timeline;
  private callbacks: Array<() => void> = [];

  constructor() {
    this.timeline = gsap.timeline({ paused: true });
  }

  /** 获取底层 GSAP timeline（供 CanvasEngine 使用） */
  getTimeline(): gsap.core.Timeline {
    return this.timeline;
  }

  play(): void {
    this.timeline.play();
  }

  pause(): void {
    this.timeline.pause();
  }

  resume(): void {
    this.timeline.resume();
  }

  replay(): void {
    this.timeline.restart(true);
  }

  setSpeed(rate: number): void {
    this.timeline.timeScale(rate);
  }

  isPlaying(): boolean {
    return this.timeline.isActive();
  }

  /** Reset and clear all animations */
  reset(): void {
    this.timeline.kill();
    this.timeline = gsap.timeline({ paused: true });
    this.callbacks = [];
  }

  /** Add a callback to fire when timeline completes */
  onComplete(cb: () => void): void {
    this.callbacks.push(cb);
    this.timeline.call(() => this.callbacks.forEach(fn => fn()));
  }
}
