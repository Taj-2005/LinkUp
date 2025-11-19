"use client";

import { useUserStore } from "@/store/useUserStore";
import User from "@/components/messages/User";
import { IUser } from "@/models/User";

interface ChatsProps {
  setUser: (user: IUser) => void;
}

export default function Chats({ setUser }: ChatsProps) {
  const users = useUserStore((state) => state.users);

  if (!users || users.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-full mt-10 select-none">
        <div className="animate-wiggle text-primary-light dark:text-primary-light/70">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 opacity-60"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 9l3-3m0 0l3 3m-3-3v12"
            />
          </svg>
        </div>

        <p className="text-lg font-semibold text-primary-dark dark:text-primary-light/80 mt-4">
          No Chats
        </p>

        <p className="text-sm text-primary-light/70 dark:text-primary-light/40 mt-1">
          Start a conversation by selecting a user
        </p>
      </div>
    );


  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[720px] hide-scrollbar pr-2">
      {users.map((u) => (
        <User key={u._id} user={u} onClick={() => setUser(u)} />
      ))}
    </div>
  );
}
