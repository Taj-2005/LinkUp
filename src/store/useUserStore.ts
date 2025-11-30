import { create } from "zustand";

/**
 * User Store - Only for UI/client state (Industry Standard)
 * 
 * Server state (user data) is managed by SWR via useUsers hook.
 * This store only contains client-side UI state.
 */
interface UserStore {
  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  pendingEmail: null,
  setPendingEmail: (email) => set({ pendingEmail: email }),
}));
