import { create } from "zustand";
import { IUser } from "@/models/User";

interface UserStore {
  user: IUser | null;
  setUser: (user: IUser | null) => void;

  users: IUser[];
  setUsers: (users: IUser[]) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  users: [],                               

  setUser: (user) => set({ user }),
  setUsers: (users) => set({ users }),

}));
