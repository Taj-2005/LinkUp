"use client";

import { useState } from "react";
import { Eye, EyeOff, Moon, Sun, LogIn } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import {signin} from "@/utils/api"

export default function SignInPage() {
  const [darkMode, setDarkMode] = useState(true);
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
      window.location.href = "/livelinks"
    } catch (err: unknown) {
      toast.dismiss();

      const errorMessage = err instanceof Error ? err.message : "Login failed";

      if (errorMessage.includes("User does not exist")) {
        toast.error("❌ User not found. Check your email/username.");
      } else if (errorMessage.includes("Incorrect password")) {
        toast.error("🔐 Incorrect password.");
      } else if (errorMessage.includes("Missing credentials")) {
        toast.error("⚠ Please fill in both fields.");
      } else {
        toast.error("⚠ Something went wrong. Please try again.");
      }
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
        button: "bg-gradient-to-r from-gray-600 to-gray-600 hover:from-gray-500 hover:to-gray-500",
        buttonSecondary: "bg-[#606468] hover:bg-[#3E434C] text-slate-300",
        buttonText: "text-white",
        link: "text-gray-400 hover:text-white",
        progress: "bg-[#181818]",
        progressFill: "bg-gradient-to-r from-violet-500 to-purple-500",
      }
    : {
        bg: "bg-[#606468]",
        cardBg: "bg-[#ffffff] backdrop-blur-xl",
        border: "border-[#e1e1e1]",
        text: "text-slate-900",
        textSecondary: "text-slate-600",
        input: "bg-gray-100 border-[#606468] text-slate-900 placeholder:text-slate-400",
        inputFocus: "border-gray-500 ring-gray-500/20 bg-[#ffffff]",
        button: "bg-gradient-to-r from-gray-400 to-gray-400 hover:from-gray-500 hover:to-gray-500",
        buttonSecondary: "bg-[#e1e1e1] hover:bg-[#606468] text-slate-700",
        buttonText: "text-white",
        link: "text-gray-500 hover:text-black",
        progress: "bg-[#e1e1e1]",
        progressFill: "bg-gradient-to-r from-violet-500 to-purple-500",
      };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg} transition-all duration-500 p-4 relative overflow-hidden`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 ${darkMode ? 'bg-violet-500/10' : 'bg-violet-300/30'} rounded-full blur-3xl`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${darkMode ? 'bg-purple-500/10' : 'bg-purple-300/30'} rounded-full blur-3xl`} />
      </div>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-6 right-6 p-3 rounded-xl ${theme.cardBg} ${theme.border} border shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50`}
        aria-label="Toggle theme"
      >
        {darkMode ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-slate-700" />
        )}
      </button>

      <div className={`${theme.cardBg} ${theme.border} border rounded-3xl shadow-2xl w-full max-w-md transition-all duration-500 relative z-10`}>
        <div className="p-8 pb-6 text-center">
          <div className={`inline-flex items-center justify-center w-50 h-16 rounded-2xl mb-4 relative`}>
              <Image
                  src={ darkMode ? "/logo.png":"/dark-logo.png"}
                  alt="Logo"
                  unoptimized
                  width={150}
                  height={150}
                  className="m-4"
              />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>Welcome Back</h1>
          <p className={`${theme.textSecondary} text-sm`}>Sign in to continue your journey</p>
        </div>

        <form
        onSubmit={handleSignin}
        className="px-8 pb-8 space-y-5">
          <div>
            <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
              Email or Username
            </label>
            <input
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              onFocus={() => setFocusedField("emailOrUsername")}
              onBlur={() => setFocusedField("")}
              placeholder="john@example.com or johndoe"
              className={`w-full px-4 py-3.5 rounded-xl border ${theme.input} ${
                focusedField === "emailOrUsername" ? `${theme.inputFocus} ring-4` : ""
              } transition-all duration-200 focus:outline-none`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
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
                className={`w-full px-4 py-3.5 rounded-xl border ${theme.input} ${
                  focusedField === "password" ? `${theme.inputFocus} ring-4` : ""
                } transition-all duration-200 focus:outline-none pr-12`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme.textSecondary} hover:${theme.text} transition-colors`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-sm font-medium ${theme.link} transition-colors`}>
              Forgot password?
            </div>
          </div>

          <button
            type="submit"
            className={`w-full ${theme.button} ${theme.buttonText} py-3.5 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-6`}
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>

          <p className={`text-center text-sm ${theme.textSecondary} pt-4`}>
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
