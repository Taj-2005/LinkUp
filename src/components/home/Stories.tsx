"use client";

import Image from "next/image";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export default function Stories() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const {users, user: currentUser} = useUserStore();

  const filteredUsers = users?.filter((u) => u._id !== currentUser?._id) || [];

  if (!filteredUsers || filteredUsers.length === 0) {
    return (
      <div 
        className="w-full h-full overflow-x-auto overflow-y-hidden whitespace-nowrap hide-scrollbar" 
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-row flex-nowrap h-full py-4 md:py-6 gap-4 md:gap-8 snap-x snap-mandatory scroll-smooth px-4 md:px-0"
          style={{ width: 'max-content' }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              data-story-item
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex-none flex flex-col items-center text-center snap-center"
            >
              <div className="relative w-16 h-16 md:w-[100px] md:h-[100px] rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
                <div className="absolute inset-0 animate-shimmer opacity-60" />
              </div>

              <div className="relative skeleton-line w-[80px] md:w-[100px] h-4 mt-2 overflow-hidden">
                <div className="absolute inset-0 animate-shimmer opacity-60" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full overflow-x-auto overflow-y-hidden whitespace-nowrap hide-scrollbar" 
      style={{ 
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <div className="flex flex-row flex-nowrap h-full py-4 md:py-2 gap-2 md:gap-6 snap-x snap-mandatory scroll-smooth px-4 md:p-4" style={{ width: 'max-content' }}>
        {filteredUsers.slice(0, 20).map((user) => (
          <div
            key={user.username}
            data-story-item
            onClick={() => router.push(`/linkhub/${user.username}`)}
            className="flex-none flex flex-col items-center text-center cursor-pointer snap-center"
          >
            <div className="relative w-16 h-16 md:w-[100px] md:h-[100px] rounded-full overflow-hidden border-4 border-primary-dark dark:border-primary-light flex-shrink-0">
              <Image
                src={
                  user.user_avatar
                    ? user.user_avatar
                    : resolvedTheme === "dark"
                    ? "/dark-profile.png"
                    : "/light-profile.png"
                }
                alt={user.username}
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            <span className="mt-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 truncate w-[80px] md:w-[100px]">
              {user.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
