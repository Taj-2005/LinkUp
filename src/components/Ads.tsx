"use client";

import { motion } from "framer-motion";

export default function AdsPlaceholderMobile() {
  return (
    <div className="h-full bg-right-nav-light dark:bg-right-nav-dark flex flex-col items-center py-8 px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-xl md:text-2xl font-bold text-primary-dark dark:text-primary-light mb-4 md:mb-8 text-center"
      >
        Sponsored Ads
      </motion.h2>

      <div className="w-full max-w-sm space-y-4 md:space-y-6">
{[1].map((item) => (
  <motion.div
    key={item}
    whileTap={{ scale: 0.97 }}
    className="relative bg-left-nav-light/90 dark:bg-left-nav-dark/90 border border-primary-light/60 dark:border-primary-dark/60 rounded-2xl p-5 shadow-lg backdrop-blur-md overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-light/25 to-transparent animate-[shimmer_2s_infinite] pointer-events-none" />

    <div className="flex flex-col space-y-5">
      <div className="w-14 h-14 rounded-full bg-primary-light/60 dark:bg-primary-dark/70 animate-pulse" />

      <div className="w-3/4 h-6 bg-primary-light/40 dark:bg-primary-dark/60 rounded-md animate-pulse" />

      <div className="w-full h-4 bg-primary-light/30 dark:bg-primary-dark/40 rounded-md animate-pulse" />
      <div className="w-5/6 h-4 bg-primary-light/30 dark:bg-primary-dark/40 rounded-md animate-pulse" />

      <div className="w-28 h-9 bg-primary-light/70 dark:bg-primary-dark/80 rounded-lg mt-4 animate-pulse" />
    </div>
  </motion.div>
))}

      </div>

      <p className="text-xs text-primary-dark/70 dark:text-primary-light/60 mt-10">
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
