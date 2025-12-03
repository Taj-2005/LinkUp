import { create } from "zustand";

interface NavbarStore {
    selectedItem: string;
    setSelectedItem: (item: string) => void;
}

export const useNavbarStore = create<NavbarStore>((set) => ({
    selectedItem: "",
    setSelectedItem: (item: string) => set({ selectedItem: item }),
}));
