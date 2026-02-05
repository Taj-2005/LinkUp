"use client";

import { useState } from "react";
import { Mail, ArrowLeft, Send, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    toast.loading("Sending reset link...");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    toast.dismiss();
    const data = await res.json();

    if (!res.ok) return toast.error(data.message || "Something went wrong!");

    toast.success("📩 Reset email sent!");
    setEmail("");
    router.push("/signin");
  };

  const theme = darkMode
    ? {
      bg: "bg-[#3E434C]",
      cardBg: "bg-[#212121] backdrop-blur-xl",
      border: "border-[#181818]",
      text: "text-slate-100",
      textSecondary: "text-slate-400",
      input: "bg-[#181818] border-[#606468] text-white placeholder:text-slate-500",
      inputFocus: "border-gray-300 ring-gray-400/20 bg-[#181818]",
      button: "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600  hover:from-pink-600 hover:to-violet-600",
      link: "text-gray-400 hover:text-white",
    }
    : {
      bg: "bg-[#606468]",
      cardBg: "bg-white",
      border: "border-[#e1e1e1]",
      text: "text-slate-900",
      textSecondary: "text-slate-600",
      input: "bg-gray-100 border-[#606468] text-slate-900 placeholder:text-slate-400",
      inputFocus: "border-gray-500 ring-gray-500/20 bg-white",
      button: "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600  hover:from-pink-600 hover:to-violet-600",
      link: "text-gray-600 hover:text-black",
    };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg} transition-all duration-500 p-2 xs:p-3 sm:p-4 relative overflow-y-auto`}>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-2 right-2 xs:top-4 xs:right-4 sm:top-6 sm:right-6 p-2 xs:p-2.5 sm:p-3 rounded-lg xs:rounded-xl ${theme.cardBg} ${theme.border} border shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50 cursor-pointer`}
        aria-label="Toggle theme"
      >
        {darkMode ? <Sun className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-slate-700" />}
      </button>

      <div className={`${theme.cardBg} ${theme.border} border rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md my-2 xs:my-4 sm:my-8 p-4 xs:p-5 sm:p-6 md:p-8 transition-all`}>
        <div className="text-center">
          <Image
            src={darkMode ? "/logo.png" : "/dark-logo.png"}
            alt="Logo"
            unoptimized
            width={533}
            height={191}
            className="w-32 xs:w-36 sm:w-40 md:w-48 lg:w-56 h-auto mx-auto mb-2 xs:mb-3 sm:mb-4"
          />

          <h1 className={`text-xl xs:text-2xl sm:text-3xl font-bold ${theme.text}`}>Forgot Password</h1>
          <p className={`${theme.textSecondary} text-xs mt-1 xs:mt-2`}>
            Enter your email to receive a reset link
          </p>
        </div>

        <form className="mt-3 xs:mt-4 sm:mt-6 space-y-3 xs:space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className={`block text-xs font-semibold ${theme.text} mb-1 xs:mb-1.5 sm:mb-2`}>
              Email Address
            </label>

            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField("")}
                placeholder="you@example.com"
                className={`w-full px-3 py-2.5 xs:py-3 text-sm rounded-lg xs:rounded-xl border ${theme.input} ${focusedField === "email" ? `${theme.inputFocus} ring-2` : ""
                  } transition-all pr-9 xs:pr-10 sm:pr-12`}
              />
              <Mail className="absolute right-2.5 xs:right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full ${theme.button} text-white py-2.5 xs:py-3 sm:py-3.5 rounded-lg xs:rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 cursor-pointer`}
          >
            <Send className="w-4 h-4" />
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <a href="/signin" className={`flex items-center gap-2 mx-auto w-fit mt-2 text-xs ${theme.link} cursor-pointer`}>
            <ArrowLeft className="w-3 h-3" /> Back to Sign In
          </a>
        </form>
      </div>
    </div>
  );
}
