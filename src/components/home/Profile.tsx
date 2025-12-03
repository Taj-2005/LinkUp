"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { IUser } from "@/models/User";

interface UserProps {
  user: IUser | null;
}

export default function User({ user }: UserProps) {
  const { resolvedTheme } = useTheme();

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-2 pl-4 items-center"
      >
        <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700 flex-shrink-0">
          <div className="absolute inset-0 animate-shimmer opacity-60" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="relative skeleton-line w-32 h-4 overflow-hidden">
            <div className="absolute inset-0 animate-shimmer opacity-60" />
          </div>
          <div className="relative skeleton-line w-20 h-3 overflow-hidden">
            <div className="absolute inset-0 animate-shimmer opacity-60" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-2 pl-4 items-center"
    >
      <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden flex-shrink-0">
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
          alt={`${user.username} avatar`}
          className="object-cover"
        />
      </div>

      <div className="flex flex-col">
        <div className="font-bold text-black dark:text-white">
          {user.username}
        </div>
        <div className="text-gray-500 dark:text-gray-400">
          {user.name}
        </div>
      </div>
    </motion.div>
  );
}
