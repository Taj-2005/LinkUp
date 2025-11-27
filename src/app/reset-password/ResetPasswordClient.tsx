"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Check, Moon, Sun } from "lucide-react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const token = useSearchParams().get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [focusedField, setFocusedField] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

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
        link: "text-gray-400 hover:text-white",
      }
    : {
        bg: "bg-[#606468]",
        cardBg: "bg-white backdrop-blur-xl",
        border: "border-[#e1e1e1]",
        text: "text-slate-900",
        textSecondary: "text-slate-600",
        input: "bg-gray-100 border-[#606468] text-slate-900 placeholder:text-slate-400",
        inputFocus: "border-gray-500 ring-gray-500/20 bg-white",
        button: "bg-gradient-to-r from-gray-300 to-gray-300 hover:from-gray-400 hover:to-gray-400",
        link: "text-gray-600 hover:text-black",
      };

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    if (password !== confirm) {
      return toast.error("Passwords do not match.");
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return toast.error(data.message);

    toast.success("Password updated successfully!");
    router.push("/signin");
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${theme.bg} transition-all duration-500 p-2 xs:p-3 sm:p-4 relative overflow-y-auto`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-72 h-72 ${
            darkMode ? "bg-violet-500/10" : "bg-violet-300/30"
          } rounded-full blur-3xl`}
        />
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 ${
            darkMode ? "bg-purple-500/10" : "bg-purple-300/30"
          } rounded-full blur-3xl`}
        />
      </div>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-2 right-2 xs:top-4 xs:right-4 sm:top-6 sm:right-6 p-2 xs:p-2.5 sm:p-3 rounded-lg xs:rounded-xl ${theme.cardBg} ${theme.border} border shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50`}
        aria-label="Toggle theme"
      >
        {darkMode ? (
          <Sun className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-amber-400" />
        ) : (
          <Moon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-slate-700" />
        )}
      </button>

      <div
        className={`${theme.cardBg} ${theme.border} border rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md my-2 xs:my-4 sm:my-8 transition-all duration-500 relative z-10`}
      >
        <div className="p-4 xs:p-5 sm:p-6 md:p-8 pb-3 xs:pb-4 sm:pb-6 text-center">
          <Image
            src={darkMode ? "/logo.png" : "/dark-logo.png"}
            width={533}
            height={191}
            alt="Logo"
            unoptimized
            className="w-32 xs:w-36 sm:w-40 md:w-48 lg:w-56 h-auto mx-auto mb-2 xs:mb-3 sm:mb-4"
          />

          <h1 className={`text-xl xs:text-2xl sm:text-3xl font-bold ${theme.text} mb-1 xs:mb-2`}>Reset Password</h1>
          <p className={`${theme.textSecondary} text-xs`}>
            Enter and confirm your new password
          </p>
        </div>

        <form onSubmit={handleReset} className="px-3 xs:px-4 sm:px-6 md:px-8 pb-4 xs:pb-6 sm:pb-8 space-y-3 xs:space-y-4 sm:space-y-5">
          <div className="relative">
            <label className={`block text-xs font-semibold ${theme.text} mb-1 xs:mb-1.5 sm:mb-2`}>
              New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onFocus={() => setFocusedField("pass")}
              onBlur={() => setFocusedField("")}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-3 py-2.5 xs:py-3 text-sm rounded-lg xs:rounded-xl border ${theme.input} ${
                focusedField === "pass" ? `${theme.inputFocus} ring-2` : ""
              } transition-all duration-200 focus:outline-none pl-9 xs:pl-10 sm:pl-12 pr-9 xs:pr-10 sm:pr-12`}
              required
            />
            <Lock className="absolute left-2.5 xs:left-3 sm:left-4 bottom-2.5 xs:bottom-3 sm:bottom-3.5 text-gray-500 w-4 h-4" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 xs:right-3 sm:right-4 bottom-2.5 xs:bottom-3 sm:bottom-3.5 text-gray-400 p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <label className={`block text-xs font-semibold ${theme.text} mb-1 xs:mb-1.5 sm:mb-2`}>
              Confirm Password
            </label>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onFocus={() => setFocusedField("confirm")}
              onBlur={() => setFocusedField("")}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-3 py-2.5 xs:py-3 text-sm rounded-lg xs:rounded-xl border ${theme.input} ${
                focusedField === "confirm" ? `${theme.inputFocus} ring-2` : ""
              } transition-all duration-200 focus:outline-none pl-9 xs:pl-10 sm:pl-12 pr-9 xs:pr-10 sm:pr-12`}
              required
            />
            <Lock className="absolute left-2.5 xs:left-3 sm:left-4 bottom-2.5 xs:bottom-3 sm:bottom-3.5 text-gray-500 w-4 h-4" />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-2.5 xs:right-3 sm:right-4 bottom-2.5 xs:bottom-3 sm:bottom-3.5 text-gray-400 p-1"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            className={`w-full ${theme.button} text-white py-2.5 xs:py-3 sm:py-3.5 rounded-lg xs:rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 mt-3 xs:mt-4`}
          >
            <Check className="w-4 h-4" />
            {loading ? "Updating..." : "Update Password"}
          </button>

        </form>
      </div>
    </div>
  );
}
