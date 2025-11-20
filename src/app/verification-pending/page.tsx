"use client";

import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import useSWR from "swr";
import  {getUser} from "@/utils/api";
import { useEffect, useState } from "react";
import { FiCheckCircle, FiRefreshCcw } from "react-icons/fi";
import Image from "next/image";

export default function VerificationPending() {
  const userEmail = useUserStore((s) => s.pendingEmail);
  const router = useRouter();
  const zustandUser = useUserStore((s) => s.user);

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [darkMode] = useState(true);

  const { data: fetchedUser } = useSWR(
    userEmail ? ["user-by-email", userEmail] : null,
    () => getUser(userEmail!)
  );

  useEffect(() => {
    const user = zustandUser || fetchedUser;

    if (user && user.isVerified) {
      router.push("/livelinks");
    }
  }, [zustandUser, fetchedUser, router]);

  const handleResend = async () => {
    if (!userEmail) return;

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
      } else {
        console.error(await res.json());
      }
    } catch (err) {
      console.error(err);
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
    <div className={`min-h-screen flex items-center justify-center ${theme.bg} transition-all duration-500 p-4 relative overflow-hidden`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 ${darkMode ? 'bg-violet-500/10' : 'bg-violet-300/30'} rounded-full blur-3xl`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${darkMode ? 'bg-purple-500/10' : 'bg-purple-300/30'} rounded-full blur-3xl`} />
      </div>

      <div className={`${theme.cardBg} ${theme.border} border rounded-3xl shadow-2xl w-full max-w-md transition-all duration-500 relative z-10 p-8`}>
        <div className="text-center mb-6 flex flex-col justify-center items-center">
          <div className="inline-flex items-center justify-center w-50 h-16 rounded-2xl mb-4">
            <Image
              src={darkMode ? "/logo.png" : "/dark-logo.png"}
              alt="Logo"
              width={150}
              height={150}
              className="m-4"
            />
          </div>


          <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>
            Check Your Email
          </h1>
          <p className={`${theme.textSecondary} text-sm mb-6`}>
            We&apos;ve sent a verification link to your email address
          </p>
        </div>

        <div className={`${darkMode ? 'bg-[#181818]' : 'bg-gray-50'} rounded-xl p-6 mb-6`}>
          <div className="flex items-start gap-3 mb-4">
            <FiCheckCircle className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} flex-shrink-0 mt-0.5`} />
            <div>
              <h3 className={`font-semibold ${theme.text} mb-1`}>
                Step 1: Check your inbox
              </h3>
              <p className={`text-sm ${theme.textSecondary}`}>
                Look for an email from us with the subject &quot;Verify Your Email Address&quot;
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <FiCheckCircle className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} flex-shrink-0 mt-0.5`} />
            <div>
              <h3 className={`font-semibold ${theme.text} mb-1`}>
                Step 2: Click the verification link
              </h3>
              <p className={`text-sm ${theme.textSecondary}`}>
                The link will expire in 24 hours for security reasons
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FiCheckCircle className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} flex-shrink-0 mt-0.5`} />
            <div>
              <h3 className={`font-semibold ${theme.text} mb-1`}>
                Step 3: Start using LiveLinks
              </h3>
              <p className={`text-sm ${theme.textSecondary}`}>
                Once verified, you&apos;ll have full access to all features
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleResend}
            disabled={resending || resent}
            className={`w-full ${theme.button} ${theme.buttonText} py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
          >
            {resending ? (
              <>
                <FiRefreshCcw className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : resent ? (
              <>
                <FiCheckCircle className="w-5 h-5" />
                Email Resent!
              </>
            ) : (
              <>
                <FiRefreshCcw className="w-5 h-5" />
                Resend Verification Email
              </>
            )}
          </button>

          <p className={`text-center text-sm ${theme.textSecondary}`}>
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <a href="/signin" className={`font-semibold ${theme.link} transition-colors`}>
              try signing in
            </a>
          </p>
        </div>

        <div className={`mt-6 p-4 ${darkMode ? 'bg-amber-500/10' : 'bg-amber-50'} rounded-lg border ${darkMode ? 'border-amber-500/20' : 'border-amber-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-amber-200' : 'text-amber-800'}`}>
            <strong>Note:</strong> You won&apos;t be able to access protected features until your email is verified.
          </p>
        </div>
      </div>
    </div>
  );
}
