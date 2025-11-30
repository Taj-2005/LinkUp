"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { IUser } from "@/models/User";
import { SkeletonCircle, SkeletonLine } from "@/components/SkeletonLoader";

interface UserProps {
  user: IUser | null;
  onClick?: () => void;
}

export default function User({ user, onClick }: UserProps) {
  const { resolvedTheme } = useTheme();

  if (!user) {
    return (
      <div
        className="flex gap-2 items-center p-2 rounded-xl min-w-0 flex-1"
        role="status"
        aria-label="Loading user"
      >
        <SkeletonCircle size={40} className="w-10 h-10 md:w-[50px] md:h-[50px] flex-shrink-0" />
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <SkeletonLine width="80%" height={16} className="max-w-[128px]" />
          <SkeletonLine width="60%" height={12} className="max-w-[96px]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex gap-2 items-center p-2 rounded-xl hover:bg-primary-light/20 dark:hover:bg-primary-dark/30 cursor-pointer transition min-w-0 flex-1"
      onClick={onClick}
    >
      <div className="relative w-10 h-10 md:w-[50px] md:h-[50px] rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-pink-500 hover:via-purple-500 hover:to-violet-500 transition-all duration-300">
        <Image
          src={
            user.user_avatar
              ? user.user_avatar
              : resolvedTheme === "dark"
              ? "/dark-profile.png"
              : "/light-profile.png"
          }
          fill
          unoptimized
          alt="avatar"
          className="object-cover p-0.5 rounded-full"
        />
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <div className="font-bold text-black dark:text-white text-sm md:text-base truncate">
          {user.username}
        </div>

        <div className="text-gray-500 dark:text-gray-400 text-xs md:text-sm truncate">
          {user.name}
        </div>
      </div>
    </div>
  );
}
