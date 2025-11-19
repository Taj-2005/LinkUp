"use client";

import Image from "next/image";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export default function Stories() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const {users} = useUserStore();

  if (!users || users.length === 0) {
    return (
      <div className="w-full h-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-row overflow-x-auto hide-scrollbar w-full h-full p-6 gap-8"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex flex-col items-center flex-shrink-0 text-center"
            >
              <div className="relative w-[100px] h-[100px] rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
                <div className="absolute inset-0 animate-shimmer opacity-60" />
              </div>

              <div className="relative skeleton-line w-[80px] h-4 mt-3 overflow-hidden">
                <div className="absolute inset-0 animate-shimmer opacity-60" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden flex">
      <div className="w-full h-full overflow-hidden">
        <div className="flex flex-row overflow-x-auto hide-scrollbar w-full h-full px-4 py-2 gap-6">
          {users.slice(0, 20).map((user) => (
            <div
              key={user.username}
              onClick={() => router.push(`/linkhub/${user.username}`)}
              className="flex flex-col items-center flex-shrink-0 text-center cursor-pointer py-4 px-1"
            >
              <Image
                src={
                  user.user_avatar
                    ? user.user_avatar
                    : resolvedTheme === "dark"
                    ? "/dark-profile.png"
                    : "/light-profile.png"
                }
                alt={user.username}
                width={100}
                height={100}
                className="rounded-full flex-shrink-0 object-cover border-4 border-primary-dark dark:border-primary-light p-[0.5px]"
              />

              <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 truncate w-[100px]">
                {user.username}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
