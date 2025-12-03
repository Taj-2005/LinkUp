import { create } from "zustand";

interface UserStore {
  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  pendingEmail: null,
  setPendingEmail: (email) => set({ pendingEmail: email }),
}));
