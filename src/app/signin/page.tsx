"use client";

import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import {signin} from "@/utils/api"
import { useRouter } from "next/navigation";
import Link from "next/link";
import {getUser} from "@/utils/api"
import { motion } from "framer-motion";

export default function SignInPage() {
  const router = useRouter();
  const [darkMode] = useState(true);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");


  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      toast.loading("Signing in...");

      const user = await signin(emailOrUsername, password);

      toast.dismiss();
      toast.success(`Welcome back, ${user.username}! 🚀`);

      router.push("/livelinks");

    } catch (err: unknown) {
      toast.dismiss();

      const errorMsg = err instanceof Error ? err.message : "Login failed";

      if (errorMsg.includes("User does not exist")) {
        return toast.error("❌ User not found.");
      }

      if (errorMsg.includes("Incorrect password")) {
        return toast.error("🔐 Incorrect password.");
      }

      if (errorMsg.includes("verify your email")) {
        toast.error("📩 Please verify your email.");

        const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
        let finalEmail = emailOrUsername;

        if (!isEmail(emailOrUsername)) {
          const userData = await getUser(emailOrUsername);
          finalEmail = userData.email;
        }

        await fetch("/api/auth/resend-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: finalEmail }),
        });

        router.push(`/verification-pending?email=${encodeURIComponent(finalEmail)}`);
        return;
      }

      return toast.error("⚠ Something went wrong.");
    }
  };




  const theme = darkMode
    ? {
        bg: "bg-[#3E434C]",
        cardBg: "bg-[#212121] backdrop-blur-xl",
        border: "border-[#181818]",
        text: "text-slate-100",
        textSecondary: "text-slate-400",
        input: "bg-[#181818] border-[#606468] text-white placeholder:text-slate-500",
        inputFocus: "border-gray-400 ring-gray-400/20 bg-[#181818]",
        button: "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:via-purple-500 hover:to-pink-500",
        buttonSecondary: "bg-[#606468] hover:bg-[#3E434C] text-slate-300",
        buttonText: "text-white",
        link: "text-gray-400 hover:text-violet-400",
        progress: "bg-[#181818]",
        progressFill: "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600",
      }
    : {
        bg: "bg-[#606468]",
        cardBg: "bg-[#ffffff] backdrop-blur-xl",
        border: "border-[#e1e1e1]",
        text: "text-slate-900",
        textSecondary: "text-slate-600",
        input: "bg-gray-100 border-[#606468] text-slate-900 placeholder:text-slate-400",
        inputFocus: "border-gray-500 ring-gray-500/20 bg-[#ffffff]",
        button: "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:via-purple-500 hover:to-pink-500",
        buttonSecondary: "bg-[#e1e1e1] hover:bg-[#606468] text-slate-700",
        buttonText: "text-white",
        link: "text-gray-500 hover:text-violet-600",
        progress: "bg-[#e1e1e1]",
        progressFill: "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600",
      };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg} transition-all duration-500 p-2 xs:p-3 sm:p-4 relative overflow-y-auto`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 ${darkMode ? 'bg-violet-500/10' : 'bg-violet-300/30'} rounded-full blur-3xl`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${darkMode ? 'bg-purple-500/10' : 'bg-purple-300/30'} rounded-full blur-3xl`} />
      </div>

      {/* <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-2 right-2 xs:top-4 xs:right-4 sm:top-6 sm:right-6 p-2 xs:p-2.5 sm:p-3 rounded-lg xs:rounded-xl ${theme.cardBg} ${theme.border} border shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50`}
        aria-label="Toggle theme"
      >
        {darkMode ? (
          <Sun className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-amber-400" />
        ) : (
          <Moon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-slate-700" />
        )}
      </button> */}

      <div className={`${theme.cardBg} ${theme.border} border rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md my-2 xs:my-4 sm:my-8 transition-all duration-500 relative z-10 md:p-4`}>
        <div className="p-4 xs:p-5 sm:p-6 md:p-8 pb-3 xs:pb-4 sm:pb-6 text-center">
          <div className={`inline-flex items-center justify-center rounded-2xl mb-2 xs:mb-3 sm:mb-4 relative`}>
              <Image
                  src={ darkMode ? "/logo.png":"/dark-logo.png"}
                  alt="Logo"
                  unoptimized
                  width={533}
                  height={191}
                  className="w-32 xs:w-36 sm:w-40 md:w-48 lg:w-56 h-auto"
              />
          </div>
          <h1 className={`text-xl xs:text-2xl sm:text-3xl font-bold ${theme.text} mb-1 xs:mb-2`}>Welcome Back</h1>
          <p className={`${theme.textSecondary} text-xs xs:text-sm`}>Sign in to continue your journey</p>
        </div>

        <form
        onSubmit={handleSignin}
        className="px-3 xs:px-4 sm:px-6 md:px-8 pb-4 xs:pb-6 sm:pb-8 space-y-3 xs:space-y-4 sm:space-y-5">
          <div>
            <label className={`block text-xs font-semibold ${theme.text} mb-1 xs:mb-1.5 sm:mb-2`}>
              Email or Username
            </label>
            <input
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              onFocus={() => setFocusedField("emailOrUsername")}
              onBlur={() => setFocusedField("")}
              placeholder="john@example.com or johndoe"
              className={`w-full px-3 py-2.5 xs:py-3 sm:py-3.5 text-sm rounded-lg xs:rounded-xl border ${theme.input} ${
                focusedField === "emailOrUsername" ? `${theme.inputFocus} ring-2` : ""
              } transition-all duration-200 focus:outline-none`}
              required
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold ${theme.text} mb-1 xs:mb-1.5 sm:mb-2`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
                placeholder="••••••••"
                className={`w-full px-3 py-2.5 xs:py-3 sm:py-3.5 text-sm rounded-lg xs:rounded-xl border ${theme.input} ${
                  focusedField === "password" ? `${theme.inputFocus} ring-2` : ""
                } transition-all duration-200 focus:outline-none pr-9 xs:pr-10 sm:pr-12`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-2.5 xs:right-3 sm:right-4 top-1/2 -translate-y-1/2 ${theme.textSecondary} hover:${theme.text} transition-colors p-1`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className={`text-xs font-medium ${theme.link} transition-colors cursor-pointer`}>
              Forgot password?
            </Link>
          </div>

          <motion.button
            type="submit"
            className={`w-full ${theme.button} ${theme.buttonText} py-2.5 xs:py-3 sm:py-3.5 px-3 xs:px-4 rounded-lg xs:rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-3 xs:mt-4 sm:mt-6 relative overflow-hidden`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Sign In
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          <p className={`text-center text-xs ${theme.textSecondary} pt-2 xs:pt-3 sm:pt-4`}>
            {`Don't have an account? `}
            <a href="/signup" className={`font-semibold ${theme.link} transition-colors`}>
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
