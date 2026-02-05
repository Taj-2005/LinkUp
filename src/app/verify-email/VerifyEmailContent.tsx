"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function VerifyEmailContent() {
  const [darkMode] = useState(true);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing");
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          setTimeout(() => router.push("/signin"), 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      } catch {
        setStatus("error");
        setMessage("An error occurred during verification");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const theme = darkMode
    ? {
      bg: "bg-[#3E434C]",
      cardBg: "bg-[#212121] backdrop-blur-xl",
      border: "border-[#181818]",
      text: "text-slate-100",
      textSecondary: "text-slate-400",
      button: "bg-gradient-to-r from-gray-600 to-gray-600 hover:from-gray-500 hover:to-gray-500",
      buttonText: "text-white",
    }
    : {
      bg: "bg-[#606468]",
      cardBg: "bg-[#ffffff] backdrop-blur-xl",
      border: "border-[#e1e1e1]",
      text: "text-slate-900",
      textSecondary: "text-slate-600",
      button: "bg-gradient-to-r from-gray-400 to-gray-400 hover:from-gray-500 hover:to-gray-500",
      buttonText: "text-white",
    };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg} transition-all duration-500 p-4 relative overflow-hidden`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 ${darkMode ? 'bg-violet-500/10' : 'bg-violet-300/30'} rounded-full blur-3xl`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${darkMode ? 'bg-purple-500/10' : 'bg-purple-300/30'} rounded-full blur-3xl`} />
      </div>

      <div className={`${theme.cardBg} ${theme.border} border rounded-3xl shadow-2xl w-full max-w-md transition-all duration-500 relative z-10 p-8`}>
        <div className="text-center flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center rounded-2xl mb-6">
            <Image
              src={darkMode ? "/logo.png" : "/dark-logo.png"}
              alt="Logo"
              width={533}
              height={191}
              className="m-4 w-40 sm:w-48 md:w-56 h-auto"
            />
          </div>

          {status === "loading" && (
            <>
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${darkMode ? 'bg-violet-500/20' : 'bg-violet-200'} mb-6`}>
                <Loader2 className={`w-10 h-10 ${darkMode ? 'text-violet-400' : 'text-violet-600'} animate-spin`} />
              </div>
              <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>
                Verifying Your Email
              </h1>
              <p className={`${theme.textSecondary} text-sm`}>
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-200'} mb-6`}>
                <CheckCircle className={`w-10 h-10 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>
                Email Verified! 🎉
              </h1>
              <p className={`${theme.textSecondary} text-sm mb-6`}>
                {message}
              </p>
              <div className={`${darkMode ? 'bg-[#181818]' : 'bg-gray-50'} rounded-xl p-4 mb-6`}>
                <p className={`text-sm ${theme.textSecondary}`}>
                  Redirecting you to sign in page in 3 seconds...
                </p>
              </div>
              <button
                onClick={() => router.push("/signin")}
                className={`w-full ${theme.button} ${theme.buttonText} py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
              >
                Go to Sign In
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${darkMode ? 'bg-red-500/20' : 'bg-red-200'} mb-6`}>
                <XCircle className={`w-10 h-10 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>
                Verification Failed
              </h1>
              <p className={`${theme.textSecondary} text-sm mb-6`}>
                {message}
              </p>
              <div className={`${darkMode ? 'bg-[#181818]' : 'bg-gray-50'} rounded-xl p-4 mb-6`}>
                <p className={`text-sm ${theme.textSecondary}`}>
                  The verification link may have expired or is invalid. Please try requesting a new verification email.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/signup")}
                  className={`w-full ${theme.button} ${theme.buttonText} py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
                >
                  Back to Sign Up
                </button>
                <button
                  onClick={() => router.push("/signin")}
                  className={`w-full ${darkMode ? 'bg-[#606468] hover:bg-[#3E434C]' : 'bg-[#e1e1e1] hover:bg-[#606468]'} text-slate-300 py-3 px-4 rounded-xl font-semibold transition-all duration-200 cursor-pointer`}
                >
                  Go to Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
