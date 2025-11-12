"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { getAllUsers, signout } from "@/utils/api";
import Loading from "@/app/loading";

export default function Stories() {
  const { resolvedTheme } = useTheme();
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
        console.log(data)
      } catch (error: any) {
        toast.error(error?.message || "Session expired. You’ve been signed out.");
        try {
          await signout();
        } catch {
          // ignore signout errors
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <Loading />

  return (
    <div className="flex flex-row overflow-x-auto hide-scrollbar w-full p-12 gap-8">
      {users.slice(0, 20).map((user) => (
        <div
          key={user.username}
          onClick={() => router.push(`/linkhub/${user.username}`)}
          className="flex flex-col items-center flex-shrink-0 text-center"
        >
            <Image
              src={user.user_avatar ? user.user_avatar : `${resolvedTheme === "dark" ? "/dark-profile.png" : "/light-profile.png" }`}
              alt={user.username}
              width={100}
              height={100}
              className="rounded-full flex-shrink-0 object-cover border-4 border-primary-dark dark:border-primary-light p-[0.5px]"
              loading="lazy"
            />
          <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 truncate w-[100px]">
            {user.username}
          </span>
        </div>
      ))}
    </div>
  );
}
