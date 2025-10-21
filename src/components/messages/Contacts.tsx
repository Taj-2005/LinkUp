"use client";

import { useEffect, useState } from "react";

import users from "@/constants/User";
import User from "@/components/messages/User";

interface ContactsProps {
  setUser: (user: { username: string; name: string; isFollowing: boolean }) => void;
}

export default function Contacts({ setUser }: ContactsProps) {
  const [filteredUsers, setFilteredUsers] = useState<
    { username: string; name: string; isFollowing: boolean }[]
  >([]);

  useEffect(() => {
    const followingUsers = users.filter((user) => !user.isFollowing);
    setFilteredUsers(followingUsers);
  }, []);

  return (
    <div className="flex flex-col justify-center items-start h-full w-full">
      <div className="overflow-y-auto max-h-[720px] w-full hide-scrollbar">
        {filteredUsers.map((user) => (
          <User
            key={user.username}
            username={user.username}
            name={user.name}
            onClick={() => setUser(user)}
          />
        ))}
      </div>
    </div>
  );
}
