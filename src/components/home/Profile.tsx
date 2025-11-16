"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { motion } from "framer-motion"; // 👈 Import motion for animation
import { IUser } from "@/models/User";

interface UserProps {
  user: IUser | null;
}

export default function User({ user }: UserProps) {
  const { resolvedTheme } = useTheme();

  // 🔹 Skeleton Loader (BEST VERSION with Shimmer)
  if (!user) {
    return (
      // Use motion for a smooth fade-in effect for the loader itself
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-3 pl-4 items-center"
      >
        {/* Avatar Skeleton: w-[50px] h-[50px] (Must be relative, rounded-full, and overflow-hidden for shimmer) */}
        <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700 flex-shrink-0">
          {/* Shimmer Effect */}
          <div className="absolute inset-0 animate-shimmer opacity-60" />
        </div>

        {/* Text Skeleton Container */}
        <div className="flex flex-col gap-2">
          {/* Username line (relative and overflow-hidden for shimmer) */}
          <div className="relative skeleton-line w-32 h-4 overflow-hidden">
            <div className="absolute inset-0 animate-shimmer opacity-60" />
          </div>
          {/* Name line (relative and overflow-hidden for shimmer) */}
          <div className="relative skeleton-line w-20 h-3 overflow-hidden">
            <div className="absolute inset-0 animate-shimmer opacity-60" />
          </div>
        </div>
      </motion.div>
    );
  }

  // 🔹 Actual UI (Updated to use motion for smooth transition from loader)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} // Start slightly offset to transition smoothly from loader
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-2 pl-4 items-center"
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
    </motion.div>
  );
}