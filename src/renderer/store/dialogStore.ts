import { create } from 'zustand';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const WELCOME_MESSAGE_KEY = '__WELCOME__';

export const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: WELCOME_MESSAGE_KEY,
};

interface DialogState {
  messages: ChatMessage[];
  inputMessage: string;
  isLoading: boolean;

  addMessage(msg: ChatMessage): void;
  setInputMessage(text: string): void;
  setIsLoading(loading: boolean): void;
  resetMessages(): void;
  getHistoryForAI(): ChatMessage[];
}

export const useDialogStore = create<DialogState>((set, get) => ({
  messages: [WELCOME_MESSAGE],
  inputMessage: '',
  isLoading: false,

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setInputMessage: (text) => set({ inputMessage: text }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  resetMessages: () => set({ messages: [WELCOME_MESSAGE] }),
  getHistoryForAI: () =>
    get().messages.filter(
      (m) => !(m.role === 'assistant' && m.content === WELCOME_MESSAGE.content)
    ),
}));
