import { create } from "zustand";
import { IUser } from "@/models/User";

interface UserStore {
  user: IUser | null;
  setUser: (user: IUser | null) => void;

  users: IUser[];
  setUsers: (users: IUser[]) => void;

  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  users: [],                               

  setUser: (user) => set({ user }),
  setUsers: (users) => set({ users }),

  pendingEmail: null,
  setPendingEmail: (email) => set({ pendingEmail: email }),
}));
