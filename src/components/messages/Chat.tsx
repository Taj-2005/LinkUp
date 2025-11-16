"use client";

import ToggleSwitch from "@/components/ToggleSwitch";
import User from "@/components/messages/User";
import SendText from "@/components/messages/SendText";
import {IUser} from "@/models/User"

interface ChatProps {
  user: IUser | null
}

export default function Chat({ user }: ChatProps) {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between border-b border-primary-light/50 dark:border-primary-dark/50 p-4 sticky top-0 bg-right-nav-light dark:bg-right-nav-dark z-10 shadow-sm">
        <User user={user}/>
        <ToggleSwitch />
      </header>

      <div className="flex-1 overflow-y-auto p-4 bg-left-nav-light dark:bg-left-nav-dark no-scrollbar scrollbar-thumb-rounded-lg scrollbar-thin scrollbar-thumb-primary-light/40 dark:scrollbar-thumb-primary-dark/60 shadow-inner">
        {/* Message bubbles will load here */}
        <p className="text-center text-primary-light dark:text-primary-light/80 mt-10 select-none opacity-70">
          Conversation content coming soon...
        </p>
      </div>

      <footer className="p-4 border-t border-primary-light/50 dark:border-primary-dark/50 bg-left-nav-light dark:bg-left-nav-dark rounded-b-xl shadow-inner">
        <SendText />
      </footer>
    </div>
  );
}
