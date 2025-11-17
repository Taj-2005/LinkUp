"use client";

import { motion } from "framer-motion";

export default function AdsPlaceholderMobile() {
  return (
    <div className="h-full bg-right-nav-light dark:bg-right-nav-dark flex flex-col items-center py-8 px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold text-indigo-700 dark:text-indigo-200 mb-8 text-center"
      >
        Sponsored Ads
      </motion.h2>

      <div className="w-full max-w-sm space-y-6">
        {[1].map((item) => (
          <motion.div
            key={item}
            whileTap={{ scale: 0.97 }}
            className="relative bg-white/90 dark:bg-zinc-800/90 border border-indigo-200 dark:border-zinc-700 rounded-2xl p-5 shadow-lg backdrop-blur-md overflow-hidden"
          >
            {/* Shimmer animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/20 dark:via-indigo-400/10 to-transparent animate-[shimmer_2s_infinite] pointer-events-none" />

            <div className="flex flex-col space-y-5">
              <div className="w-14 h-14 rounded-full bg-indigo-300 dark:bg-indigo-500 animate-pulse" />
              <div className="w-3/4 h-6 bg-indigo-200 dark:bg-indigo-400 rounded-md animate-pulse" />
              <div className="w-full h-4 bg-indigo-100 dark:bg-indigo-300 rounded-md animate-pulse" />
              <div className="w-5/6 h-4 bg-indigo-100 dark:bg-indigo-300 rounded-md animate-pulse" />
              <div className="w-28 h-9 bg-indigo-400 dark:bg-indigo-600 rounded-lg mt-4 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mt-10">
        Ad placeholders — live content will appear shortly
      </p>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
