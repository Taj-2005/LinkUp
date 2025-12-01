"use client";

import React from "react";
import { motion } from "framer-motion";

export default function FeedLinkSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto bg-right-nav-light dark:bg-right-nav-dark rounded-2xl overflow-hidden shadow-lg border border-primary-light/20 dark:border-primary-dark/30 mb-6"
    >
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <motion.div
          className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="flex flex-col flex-1 gap-2">
          <motion.div
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
        </div>
      </div>

      {/* Image Skeleton */}
      <motion.div
        className="relative w-full aspect-square bg-gray-200 dark:bg-gray-700"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* Actions Skeleton */}
      <div className="p-4 pt-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
          </div>
          <motion.div
            className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          />
        </div>
        <motion.div
          className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />
        <motion.div
          className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>
    </motion.div>
  );
}

