"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { IUser } from "@/models/User";

interface UserProps {
  user: IUser | null;
}

export default function User({ user }: UserProps) {
  const { resolvedTheme } = useTheme();

  // 🔹 Skeleton Loader
  if (!user) {
    return (
      <div className="flex gap-3 pl-4 items-center animate-pulse">

        {/* Avatar Skeleton */}
        <div className="skeleton-circle w-[50px] h-[50px]"></div>

        {/* Text Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="skeleton-line w-28 h-4"></div>
          <div className="skeleton-line w-20 h-3"></div>
        </div>

      </div>
    );
  }

  // 🔹 Normal User info
  return (
    <div className="flex gap-2 pl-4 items-center">
      <Image
        src={
          user.user_avatar
            ? user.user_avatar
            : resolvedTheme === "dark"
            ? "/dark-profile.png"
            : "/light-profile.png"
        }
        width={50}
        height={50}
        alt={`${user.username} avatar`}
        className="rounded-full object-cover"
      />

      <div className="flex flex-col">
        <div className="font-bold text-black dark:text-white">
          {user.username}
        </div>
        <div className="text-gray-500 dark:text-gray-400">
          {user.name}
        </div>
      </div>
    </div>
  );
}
