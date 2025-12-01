import { create } from "zustand";

interface ModalStore {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isModalOpen: false,
  setIsModalOpen: (open) => set({ isModalOpen: open }),
}));

