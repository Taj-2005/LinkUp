import { create } from "zustand";
import { ILink } from "@/models/Link";

interface LinkWithUser extends ILink {
  userInfo?: {
    username?: string;
    user_avatar?: string;
    name?: string;
  } | null;
}

interface ModalStore {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  selectedLink: LinkWithUser | null;
  setSelectedLink: (link: LinkWithUser | null) => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isModalOpen: false,
  setIsModalOpen: (open) => set({ isModalOpen: open }),
  selectedLink: null,
  setSelectedLink: (link) => set({ selectedLink: link }),
}));
