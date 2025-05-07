import { create } from "zustand";

interface SessionStore {
  user: UserSession | null;
  isAuthenticated: boolean;
  setSession: (user: UserSession) => void;
  clearSession: () => void;
}

const useSessionStore = create<SessionStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setSession: (user) => set({ user }),
  clearSession: () => set({ user: null }),
}));

export default useSessionStore;
