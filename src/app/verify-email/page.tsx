"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import VerifyEmailContent from "./VerifyEmailContent";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AnimatedVerifyFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function AnimatedVerifyFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0f] relative overflow-hidden">
      
      <motion.div
        className="absolute top-16 left-10 w-64 h-64 rounded-full blur-[110px]"
        style={{ background: "rgba(168, 85, 247, 0.12)" }}
        animate={{ opacity: [0.4, 0.75, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-72 h-72 rounded-full blur-[120px]"
        style={{ background: "rgba(99, 102, 241, 0.12)" }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative bg-[#141414] border border-white/5 shadow-xl backdrop-blur-xl rounded-3xl max-w-sm w-full p-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <motion.div
          className="relative h-28 w-28 flex items-center justify-center mb-8"
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border-[5px] border-transparent border-t-violet-500 border-r-indigo-400"></div>

          <motion.div
            className="w-7 h-7 rounded-full bg-violet-400 shadow-lg shadow-violet-500/50"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.h2
          className="text-2xl font-bold text-white tracking-wide"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
        >
          Verifying Your Email...
        </motion.h2>

        <motion.p
          className="text-sm text-slate-400 mt-2 text-center max-w-xs"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4 }}
        >
          Please wait while we activate your LinkUp account.
        </motion.p>
      </motion.div>
    </div>
  );
}
