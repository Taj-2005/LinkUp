"use client";

import React from "react";
import { motion } from "framer-motion";

export default function LinkSkeleton() {
  return (
    <motion.div
      className="relative aspect-square overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
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
  );
}

