"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useStoriesPaginated } from "@/hooks/useStoriesPaginated";
import { useRef, useEffect } from "react";

export default function Stories() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const { users, isLoading, isLoadingMore, loadMore, hasMore, isReachingEnd } = useStoriesPaginated();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let ticking = false;

    const checkAndLoad = () => {
      if (isReachingEnd) return;
      if (isLoadingMore) return;
      if (!hasMore) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      const threshold = 300;
      const distanceFromRight = scrollWidth - scrollLeft - clientWidth;

      if (distanceFromRight < threshold || scrollWidth <= clientWidth) {
        loadMore();
      }
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        checkAndLoad();
      });
    };

    checkAndLoad();

    const timeoutId = setTimeout(() => {
      checkAndLoad();
    }, 200);

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, isLoadingMore, isReachingEnd, loadMore, users.length]);

  useEffect(() => {
    if (isLoadingMore || isReachingEnd || !hasMore) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const timeoutId = setTimeout(() => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const threshold = 500;
      const distanceFromRight = scrollWidth - scrollLeft - clientWidth;

      if (distanceFromRight < threshold || scrollWidth <= clientWidth) {
        loadMore();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [users.length, isLoadingMore, isReachingEnd, hasMore, loadMore]);

  if (isLoading) {
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

  if (users.length === 0) {
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
      ref={scrollContainerRef}
      className="w-full h-full overflow-x-auto overflow-y-hidden whitespace-nowrap hide-scrollbar md:p-4"
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <div className="flex flex-row flex-nowrap h-full py-4 md:py-2 gap-2 md:gap-6 snap-x snap-mandatory scroll-smooth px-4 md:p-4" style={{ width: 'max-content' }}>
        {users.map((user) => (
          <div
            key={user._id}
            data-story-item
            onClick={() => router.push(`/linkhub/${user.username}`)}
            className="flex-none flex flex-col items-center text-center cursor-pointer snap-center"
          >
            <div className="relative w-16 h-16 md:w-[100px] md:h-[100px] rounded-full p-1 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-pink-500 hover:via-purple-500 hover:to-violet-500 flex-shrink-0 transition-all duration-300">
              <div className="relative w-full h-full rounded-full overflow-hidden">
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
            </div>

            <span className="mt-2 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 truncate w-[80px] md:w-[100px]">
              {user.username}
            </span>
          </div>
        ))}
        {isLoadingMore && (
          <div className="flex-none flex flex-col items-center justify-center px-4">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-primary-dark dark:bg-primary-light/80 animate-dot1"></span>
              <span className="h-2 w-2 rounded-full bg-primary-dark/80 dark:bg-primary-light/60 animate-dot2"></span>
              <span className="h-2 w-2 rounded-full bg-primary-dark/60 dark:bg-primary-light/40 animate-dot3"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
