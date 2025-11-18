"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { IUser } from "@/models/User";

interface UserProps {
  user: IUser | null;
  onClick?: () => void;
}

export default function User({ user, onClick }: UserProps) {
  const { resolvedTheme } = useTheme();

  if (!user) {
    return (
      <div className="flex gap-3 pl-4 items-center">
        <div className="w-[50px] h-[50px] skeleton-circle skeleton-wiggle"></div>
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 skeleton-text"></div>
          <div className="h-3 w-20 skeleton-text"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full flex gap-2 pl-4 items-center p-2 rounded-xl hover:bg-primary-light/20 dark:hover:bg-primary-dark/30 cursor-pointer transition"
      onClick={onClick}
    >
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
        alt="avatar"
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
