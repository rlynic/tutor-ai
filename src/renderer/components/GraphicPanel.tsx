import React from 'react';
import { CanvasEngine } from '../core/graphic/CanvasEngine';
import { GraphicInstruction } from '../core/graphic/IGraphicEngine';
import { useTranslation } from '../i18n';

export interface GraphicPanelProps {
  canvasBoxRef: React.RefObject<HTMLDivElement>;
  engineRef: React.RefObject<CanvasEngine>;
  lastInstructionsRef: React.MutableRefObject<GraphicInstruction[]>;
  animationState: 'idle' | 'playing' | 'paused';
  canvasHint: string | null;
  isLearning: boolean;
  useAI: boolean;
  graphicStepsPlayed: number;
  isAIThinking: boolean;
  onAnimationStateChange: (state: 'idle' | 'playing' | 'paused') => void;
  onRequestGraphic: () => void;
  onNextGraphicStep: () => void;
  onClear: () => void;
}

/**
 * Self-contained graphic demonstration panel.
 * Renders the Konva canvas area, step hint overlay, and animation controls.
 * Can be embedded in any parent layout.
 */
export const GraphicPanel: React.FC<GraphicPanelProps> = ({
  canvasBoxRef,
  engineRef,
  lastInstructionsRef,
  animationState,
  canvasHint,
  isLearning,
  useAI,
  graphicStepsPlayed,
  isAIThinking,
  onAnimationStateChange,
  onRequestGraphic,
  onNextGraphicStep,
  onClear,
}) => {
  const { t } = useTranslation();

  const handlePauseResume = () => {
    if (animationState === 'playing') {
      engineRef.current?.pause();
      onAnimationStateChange('paused');
    } else if (animationState === 'paused') {
      engineRef.current?.resume();
      onAnimationStateChange('playing');
    }
  };

  const handleReplay = async () => {
    if (!engineRef.current || lastInstructionsRef.current.length === 0) return;
    engineRef.current.clear();
    onAnimationStateChange('playing');
    for (const instr of lastInstructionsRef.current) {
      try { await engineRef.current.execute(instr); } catch (_) {}
    }
    onAnimationStateChange('idle');
  };

  const handleClear = () => {
    engineRef.current?.clear();
    lastInstructionsRef.current = [];
    onClear();
    onAnimationStateChange('idle');
  };

  return (
    <div className="graphic-panel">
      <div className="canvas-container">
        <div className="canvas-area" style={{ position: 'relative' }}>
          <div ref={canvasBoxRef} style={{ width: '100%', height: '100%' }} />

          {!isLearning ? (
            <div className="canvas-overlay" style={{ position: 'absolute', inset: 0 }}>
              <div className="placeholder-icon">📐</div>
              <p>{t('graphic.placeholder')}</p>
            </div>
          ) : lastInstructionsRef.current.length === 0 && !canvasHint ? (
            <div className="canvas-overlay" style={{ position: 'absolute', inset: 0 }}>
              <div className="placeholder-icon" style={{ fontSize: 40, opacity: 0.4 }}>🎨</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', whiteSpace: 'pre-line' }}>
                {t('graphic.hint_click_button')}
              </p>
            </div>
          ) : null}

          {canvasHint && (
            <div className="canvas-hint">
              💡 {canvasHint}
            </div>
          )}
        </div>

        <div className="control-toolbar">
          <button
            className="btn-control"
            onClick={handlePauseResume}
            disabled={animationState === 'idle'}
          >
            {animationState === 'paused' ? t('btn.resume') : t('btn.pause')}
          </button>

          <button
            className="btn-control"
            onClick={handleReplay}
            disabled={animationState === 'playing' || lastInstructionsRef.current.length === 0}
          >
            {t('btn.replay')}
          </button>

          <button
            className="btn-control"
            onClick={handleClear}
            disabled={lastInstructionsRef.current.length === 0 && animationState === 'idle'}
          >
            {t('btn.clear')}
          </button>

          {isLearning && useAI && (
            <button
              className="btn-control btn-control-primary"
              onClick={onRequestGraphic}
              disabled={animationState === 'playing' || isAIThinking}
            >
              {t('btn.graphic')}
            </button>
          )}

          {isLearning && useAI && graphicStepsPlayed > 0 && (
            <button
              className="btn-control"
              onClick={onNextGraphicStep}
              disabled={animationState === 'playing' || isAIThinking}
            >
              {t('btn.next_step')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
