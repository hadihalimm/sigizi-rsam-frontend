import { create } from "zustand";

interface SessionStore {
  user: UserSession | null;
  setSession: (user: UserSession) => void;
  clearSession: () => void;
}

const useSessionStore = create<SessionStore>((set) => ({
  user: null,
  setSession: (user) => set({ user }),
  clearSession: () => set({ user: null }),
}));

export default useSessionStore;
