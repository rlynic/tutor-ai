import { create } from 'zustand';

export type ProviderType = 'openai' | 'claude' | 'qwen' | 'custom';

export type Language = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'es-ES' | 'fr-FR';

export interface UserConfig {
  apiKey: string;
  provider: ProviderType;
  model: string;
  baseURL?: string;
  grade: number; // 年级 3-6
  maxTurns: number;
  theme: 'light' | 'dark';
  fontSize: number;
  animationSpeed: number;
  language: Language;
  isFirstLaunch: boolean;
}

interface ConfigState extends UserConfig {
  setApiKey(key: string): void;
  setProvider(provider: ProviderType): void;
  setModel(model: string): void;
  setBaseURL(url: string): void;
  setGrade(grade: number): void;
  setTheme(theme: 'light' | 'dark'): void;
  setFontSize(size: number): void;
  setAnimationSpeed(speed: number): void;
  setLanguage(lang: Language): void;
  setFirstLaunchDone(): void;
  loadFromStorage(config: Partial<UserConfig>): void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  apiKey: '',
  provider: 'openai',
  model: 'gpt-5.4',
  baseURL: undefined,
  grade: 4,
  maxTurns: 5,
  theme: 'light',
  fontSize: 16,
  animationSpeed: 1,
  language: 'zh-CN',
  isFirstLaunch: true,

  setApiKey: (key) => set({ apiKey: key }),
  setProvider: (provider) => set({ provider }),
  setModel: (model) => set({ model }),
  setBaseURL: (baseURL) => set({ baseURL }),
  setGrade: (grade) => set({ grade }),
  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
  setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
  setLanguage: (language) => set({ language }),
  setFirstLaunchDone: () => set({ isFirstLaunch: false }),
  loadFromStorage: (config) => set(config),
}));
