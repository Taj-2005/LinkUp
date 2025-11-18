import { create } from "zustand";
import { IUser } from "@/models/User";

interface UserStore {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  loading: boolean;
  setLoading: (val: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (val) => set({ loading: val }),
}));
