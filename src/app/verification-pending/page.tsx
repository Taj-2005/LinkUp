"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import VerificationPendingContent from "./VerificationPendingContent";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function VerificationPendingPage() {
  return (
    <Suspense fallback={<AnimatedFallback />}>
      <VerificationPendingContent />
    </Suspense>
  );
}

function AnimatedFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0f] relative overflow-hidden">

      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full blur-[120px]"
        style={{ background: "rgba(139, 92, 246, 0.15)" }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-72 h-72 rounded-full blur-[120px]"
        style={{ background: "rgba(99, 102, 241, 0.12)" }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      <motion.div
        className="relative bg-[#141414] border border-white/5 shadow-2xl backdrop-blur-xl rounded-3xl max-w-sm w-full p-10 flex flex-col items-center"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <motion.div
          className="relative w-28 h-28 mb-8 flex items-center justify-center"
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-violet-500 border-l-indigo-400"></div>

          <motion.div
            className="w-6 h-6 rounded-full bg-violet-400 shadow-lg shadow-violet-500/50"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.h2
          className="text-xl font-semibold text-white tracking-wide"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          Just a moment...
        </motion.h2>

        <motion.p
          className="text-sm text-slate-400 mt-2 text-center max-w-xs"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          Preparing verification details.
        </motion.p>
      </motion.div>
    </div>
  );
}
