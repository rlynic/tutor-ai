import { create } from 'zustand';
import { GraphicInstruction } from '../core/graphic/IGraphicEngine';

export type AnimationState = 'idle' | 'playing' | 'paused';

interface GraphicState {
  pendingInstructions: GraphicInstruction[];
  animationState: AnimationState;

  queueInstructions(instructions: GraphicInstruction[]): void;
  clearQueue(): void;
  setAnimationState(state: AnimationState): void;
}

export const useGraphicStore = create<GraphicState>((set) => ({
  pendingInstructions: [],
  animationState: 'idle',

  queueInstructions: (instructions) =>
    set((state) => ({
      pendingInstructions: [...state.pendingInstructions, ...instructions],
    })),
  clearQueue: () => set({ pendingInstructions: [] }),
  setAnimationState: (animationState) => set({ animationState }),
}));
