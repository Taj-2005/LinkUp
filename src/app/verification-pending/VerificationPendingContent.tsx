"use client";

import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { getUser } from "@/utils/api";
import { useEffect, useState } from "react";
import { FiCheckCircle, FiRefreshCcw } from "react-icons/fi";
import Image from "next/image";
import { useUserStore } from "@/store/useUserStore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function VerificationPendingContent() {
  const router = useRouter();
  const params = useSearchParams();

  const userEmail = params.get("email");

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [darkMode] = useState(true);

  const { data: verifiedUser } = useSWR(
    userEmail ? ["check-user-status", userEmail] : null,
    () => getUser(userEmail as string),
    { refreshInterval: 5000 }
  );

  useEffect(() => {
    if (!verifiedUser) return;

    if (verifiedUser.isVerified) {
      fetch("/api/auth/login-without-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifiedUser.email })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            useUserStore.getState().setUser(data.user);
            router.push("/livelinks");
          }
        })
        .catch(console.error);
        toast.success("✅ Email verified! Logging you in...");
    }
  }, [verifiedUser, router]);

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      if (res.ok) {
        setResent(true);
        setTimeout(() => setResent(false), 5000);
      }
    } finally {
      setResending(false);
    }
  };

  const theme = darkMode
    ? {
        bg: "bg-[#3E434C]",
        cardBg: "bg-[#212121] backdrop-blur-xl",
        border: "border-[#181818]",
        text: "text-slate-100",
        textSecondary: "text-slate-400",
        button: "bg-gradient-to-r from-gray-600 to-gray-600 hover:from-gray-500 hover:to-gray-500",
        buttonText: "text-white",
        link: "text-gray-400 hover:text-white",
      }
    : {
        bg: "bg-[#606468]",
        cardBg: "bg-[#ffffff] backdrop-blur-xl",
        border: "border-[#e1e1e1]",
        text: "text-slate-900",
        textSecondary: "text-slate-600",
        button: "bg-gradient-to-r from-gray-400 to-gray-400 hover:from-gray-500 hover:to-gray-500",
        buttonText: "text-white",
        link: "text-gray-600 hover:text-black",
      };

  return (
    <div className={`max-h-screen flex flex-col items-center justify-center ${theme.bg} p-4 relative`}>

      {!userEmail && (
        <div className="min-h-screen flex flex-colitems-center justify-center p-6">
              <motion.div
                className="relative w-full max-w-md rounded-3xl p-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] border border-[rgba(255,255,255,0.04)] backdrop-blur-md shadow-2xl"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                aria-live="polite"
              >
                <motion.div
                  aria-hidden
                  className="absolute -inset-6 -z-10 rounded-3xl"
                  style={{
                    background:
                      "radial-gradient(60% 40% at 10% 10%, rgba(124,58,237,0.08), transparent 12%), radial-gradient(60% 40% at 90% 90%, rgba(99,102,241,0.06), transparent 14%)",
                    mixBlendMode: "screen",
                    pointerEvents: "none",
                  }}
                  animate={{ opacity: [0.75, 0.9, 0.75] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="flex flex-col items-center gap-6 text-center">
                  <motion.div
                    className="relative flex items-center justify-center w-[96px] h-[96px] rounded-2xl bg-gradient-to-tr from-[#2b254a]/40 to-[#1b1b1f]/40 border border-[rgba(255,255,255,0.03)]"
                    initial={{ scale: 0.86, rotate: -6, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 160, damping: 18 }}
                  >
                    <div className="w-20 h-20 relative">
                      <Image src="/logo.png" alt="LinkUp logo" fill className="object-contain" />
                    </div>

                    <motion.div
                      className="absolute -right-3 -top-3 text-3xl select-none"
                      initial={{ y: -6, scale: 0.9, opacity: 0 }}
                      animate={{ y: 0, scale: 1, opacity: 1 }}
                      transition={{ delay: 0.12, duration: 0.6, type: "spring", stiffness: 120 }}
                    >
                      ❗
                    </motion.div>
                  </motion.div>

                  <motion.h2
                    className="text-2xl sm:text-3xl font-extrabold text-white"
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.08, duration: 0.36 }}
                  >
                    Verification link opened incorrectly
                  </motion.h2>

                  <motion.p
                    className="max-w-xs text-sm sm:text-base text-slate-300 leading-relaxed"
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.14, duration: 0.38 }}
                  >
                    We couldn&apos;t find an email address in the link. Open the verification link from the email you received or use the button below to request a fresh verification email.
                  </motion.p>

                  <motion.div
                    className="flex gap-3 w-full max-w-xs"
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.36 }}
                  >
                    <button
                      onClick={() => router.push("/signin")}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg active:translate-y-0.5 transform transition"
                    >
                      Go to Sign In
                    </button>

                    <button
                      onClick={() => router.push("/signup")}
                      className="flex-1 py-3 px-4 rounded-xl border border-[rgba(255,255,255,0.06)] text-slate-100 font-semibold bg-transparent hover:bg-white/2 transition"
                    >
                      Resend verification
                    </button>
                  </motion.div>

                  <motion.div
                    className="mt-2 text-xs text-slate-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.28 }}
                  >
                    Tip: open the email on the same device or copy the link into a browser with your LinkUp session.
                  </motion.div>
                </div>
              </motion.div>
            </div>
      )}

      {userEmail && (
        <div className="w-full flex items-center justify-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute top-20 left-10 w-72 h-72 ${darkMode ? "bg-violet-500/10" : "bg-violet-300/30"} rounded-full blur-3xl`} />
            <div className={`absolute bottom-20 right-10 w-96 h-96 ${darkMode ? "bg-purple-500/10" : "bg-purple-300/30"} rounded-full blur-3xl`} />
          </div>

          <div className={`${theme.cardBg} ${theme.border} border rounded-3xl shadow-2xl w-full max-w-md relative z-10 p-8`}>
            
            <div className="text-center mb-6 flex flex-col items-center">
              <Image
                src={darkMode ? "/logo.png" : "/dark-logo.png"}
                alt="Logo"
                width={150}
                height={150}
                className="m-4"
              />
              <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>
                Check Your Email
              </h1>
              <p className={`${theme.textSecondary} text-sm mb-6`}>
                We&apos;ve sent a verification link to <span className="font-semibold text-violet-400">{userEmail}</span>
              </p>
            </div>

            <div className={`${darkMode ? "bg-[#181818]" : "bg-gray-50"} rounded-xl p-6 mb-6`}>
              <Step title="Step 1: Check your inbox" text="Find an email titled 'Verify Your Email Address'" />
              <Step title="Step 2: Click the verification link" text="Works across all devices" />
              <Step title="Step 3: Auto-login" text="You will be redirected automatically" />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResend}
                disabled={resending || resent}
                className={`w-full ${theme.button} ${theme.buttonText} py-3 px-4 rounded-xl flex items-center justify-center gap-2`}
              >
                {resending ? (
                  <>
                    <FiRefreshCcw className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : resent ? (
                  <>
                    <FiCheckCircle className="w-5 h-5" />
                    Sent!
                  </>
                ) : (
                  <>
                    <FiRefreshCcw className="w-5 h-5" />
                    Resend Verification Email
                  </>
                )}
              </button>

              <p className={`text-center text-sm ${theme.textSecondary}`}>
                Didn&apos;t receive it? Check spam or{" "}
                <a href="/signin" className={`font-semibold ${theme.link}`}>
                  try signing in
                </a>
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

interface StepProps {
  title: string;
  text: string;
}

function Step({ title, text }: StepProps) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <FiCheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
      <div>
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-400">{text}</p>
      </div>
    </div>
  );
}
