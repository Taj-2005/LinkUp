"use client";

import User from "@/components/messages/User";
import SendText from "@/components/messages/SendText";
import {IUser} from "@/models/User"
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface ChatProps {
  user: IUser | null;
  onBack?: () => void;
}

export default function Chat({ user, onBack }: ChatProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col h-full relative">
      <header className="flex items-center justify-between border-b border-primary-light/50 dark:border-primary-dark/50 p-2 md:p-4 sticky top-0 bg-right-nav-light dark:bg-right-nav-dark z-10 shadow-sm gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 rounded-lg transition-colors flex-shrink-0"
              aria-label="Back to chat list"
            >
              <ArrowLeft className="w-5 h-5 text-primary-dark dark:text-primary-light" />
            </button>
          )}
          <User
            onClick={() => router.push(`/linkhub/${user?.username}`)}
            user={user}
          />
        </div>
        <div className="hidden md:flex flex-shrink-0">
        </div>
      </header>

      <div className="flex-1 overflow-y-auto hide-scrollbar p-2 md:p-4 bg-left-nav-light dark:bg-left-nav-dark shadow-inner pb-24 md:pb-4">
        <p className="text-center text-primary-light dark:text-primary-light/80 mt-6 md:mt-10 select-none opacity-70 text-sm md:text-base">
          Conversation content coming soon...
        </p>
      </div>

      <footer
        className="
          sticky bottom-0 
          md:relative 
          left-0 right-0 
          px-2 pt-2 pb-16 md:px-4 md:py-2 
          border-t border-primary-light/50 dark:border-primary-dark/50
          bg-left-nav-light dark:bg-left-nav-dark 
          shadow-inner 
          z-20 
          rounded-t-xl md:rounded-none
          w-full 
          flex items-center
          h-auto
        "
      >
        <SendText />
      </footer>

    </div>
  );
}
