"use client";

import React from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  message?: string;
  subMessage?: string;
  showButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  message = "No links or posts yet — let's wait until someone posts!",
  subMessage,
  showButton = false,
  buttonText,
  onButtonClick,
  icon,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-center py-12 md:py-16"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="flex justify-center mb-4"
      >
        {icon || (
          <motion.div
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-violet-100 via-purple-100 to-pink-100 dark:from-violet-900/30 dark:via-purple-900/30 dark:to-pink-900/30 flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              className="w-8 h-8 md:w-10 md:h-10 text-violet-600 dark:text-violet-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </motion.div>
        )}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2"
      >
        {message}
      </motion.p>

      {subMessage && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-6"
        >
          {subMessage}
        </motion.p>
      )}

      {showButton && buttonText && onButtonClick && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onButtonClick}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 transition-all"
        >
          {buttonText}
        </motion.button>
      )}
    </motion.div>
  );
}
