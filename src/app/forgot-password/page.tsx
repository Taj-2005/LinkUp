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
        button: "bg-gradient-to-r from-gray-600 to-gray-600 hover:from-gray-500 hover:to-gray-500",
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
        button: "bg-gradient-to-r from-gray-300 to-gray-300 hover:from-gray-400 hover:to-gray-400",
        link: "text-gray-600 hover:text-black",
      };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg} transition-all duration-500 p-4 relative`}>
      
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-6 right-6 p-3 rounded-xl ${theme.cardBg} ${theme.border} border shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50`}
      >
        {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
      </button>

      <div className={`${theme.cardBg} ${theme.border} border rounded-3xl shadow-2xl w-full max-w-md p-8 transition-all`}>
        <div className="text-center">
          <Image
            src={darkMode ? "/logo.png" : "/dark-logo.png"}
            alt="Logo"
            unoptimized
            width={150}
            height={150}
            className="mx-auto mb-4"
          />

          <h1 className={`text-3xl font-bold ${theme.text}`}>Forgot Password</h1>
          <p className={`${theme.textSecondary} text-sm mt-2`}>
            Enter your email to receive a reset link
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
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
                className={`w-full px-4 py-3.5 rounded-xl border ${theme.input} ${
                  focusedField === "email" ? `${theme.inputFocus} ring-4` : ""
                } transition-all`}
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full ${theme.button} text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2`}
          >
            <Send className="w-5 h-5" />
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <a href="/signin" className={`flex items-center gap-2 mx-auto w-fit mt-2 ${theme.link}`}>
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </a>
        </form>
      </div>
    </div>
  );
}
