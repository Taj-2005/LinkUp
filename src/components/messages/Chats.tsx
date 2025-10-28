"use client";

import { useEffect, useState } from "react";

import users from "@/constants/User";
import User from "@/components/messages/User";

interface ChatsProps {
  setUser: (user: { 
    username: string; 
    name: string; 
    user_avatar: string; 
    isLinked: boolean }) => void;
}

export default function Chats({ setUser }: ChatsProps) {
  const [filteredUsers, setFilteredUsers] = useState<{ 
      username: string; 
      name: string; 
      user_avatar: string; 
      isLinked: boolean;
    }[]
  >([]);

  useEffect(() => {
    const filtered = users.filter((user) => !user.isLinked);
    setFilteredUsers(filtered);
  }, []);

  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[720px] hide-scrollbar pr-2">
      {filteredUsers.length === 0 && (
        <p className="text-center text-primary-light dark:text-primary-light/70 mt-10">
          No Chats to display
        </p>
      )}
      {filteredUsers.map((user) => (
        <User
          key={user.username}
          username={user.username}
          name={user.name}
          user_avatar={user.user_avatar}
          onClick={() => setUser(user)}
        />
      ))}
    </div>
  );
}
