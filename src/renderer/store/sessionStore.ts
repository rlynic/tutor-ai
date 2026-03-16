import { create } from 'zustand';

export interface SessionSummary {
  id: string;
  questionText: string;
  questionType?: string;
  createdAt: number;
  updatedAt: number;
}

interface SessionState {
  currentSessionId: string | null;
  sessions: SessionSummary[];

  setCurrentSessionId(id: string | null): void;
  setSessions(sessions: SessionSummary[]): void;
  addSession(session: SessionSummary): void;
  removeSession(id: string): void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentSessionId: null,
  sessions: [],

  setCurrentSessionId: (id) => set({ currentSessionId: id }),
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),
  removeSession: (id) =>
    set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) })),
}));
