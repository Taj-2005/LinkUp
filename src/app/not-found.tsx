"use client";

import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark min-h-screen">
      <div className="w-full m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
        <div className="w-full flex items-center justify-center p-4">

          <motion.div
            className="flex flex-col items-center gap-8 text-center"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >

            <motion.div
              className="relative w-40 h-40 flex items-center justify-center"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
            >
              <motion.div
                className="absolute inset-0 blur-2xl opacity-50"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(255,200,0,0.55), rgba(255,170,0,0.22), transparent)"
                }}
                animate={{ scale: [1, 1.13, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.div
                className="text-[105px] select-none pointer-events-none drop-shadow-xl dark:drop-shadow-none"
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                😕
              </motion.div>
            </motion.div>

            <motion.h1
              className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              Page Not Found
            </motion.h1>

            <motion.p
              className="text-lg text-gray-600 dark:text-gray-400 max-w-sm leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              Sorry, we can’t find the page you’re looking for.
            </motion.p>

            <motion.div
              className="h-1 w-24 rounded-full bg-gray-300 dark:bg-gray-600"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "6rem", opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
            />
          </motion.div>

        </div>
      </div>
    </div>
  );
}
