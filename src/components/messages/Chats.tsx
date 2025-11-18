"use client";

import { useEffect, useState } from "react";
import { IUser } from "@/models/User";
import { getAllUsers } from "@/utils/api";
import User from "@/components/messages/User";

interface ChatsProps {
  setUser: (user: IUser) => void;
}

export default function Chats({ setUser }: ChatsProps) {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch{
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return <p className="text-center text-gray-500 mt-10">Loading chats...</p>;

  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[720px] hide-scrollbar pr-2">
      {users.length === 0 && (
        <p className="text-center text-primary-light dark:text-primary-light/70 mt-10">
          No Chats to display
        </p>
      )}

      {users.map((u) => (
        <User
          key={u._id}
          user={u}
          onClick={() => setUser(u)}
        />
      ))}
    </div>
  );
}
