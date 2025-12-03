"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {signup} from "@/utils/api"
import Image from "next/image";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";

export default function SignUpPage() {
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [shakeUsername, setShakeUsername] = useState(false);
  const [shakeEmail, setShakeEmail] = useState(false);
  const [darkMode] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSexDropdownOpen, setIsSexDropdownOpen] = useState(false);
  const [sex, setSex] = useState("male");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const router = useRouter();

  const debouncedUsername = useDebounce(username, 600);
  const debouncedEmail = useDebounce(email, 600);

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: "" };
    if (password.length < 6) return { strength: 1, label: "Weak" };
    if (password.length < 10) return { strength: 2, label: "Good" };
    return { strength: 3, label: "Strong" };
  };

  const passwordStrength = getPasswordStrength();

  const handleNext = () => {
    if (currentStep === 0 && (!username || !email || !password)) {
      toast.error("Please fill all required fields");
      return;
    }
    if (currentStep === 1 && !firstName) {
      toast.error("Please fill all required fields");
      return;
    }
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSkip = () => {
    handleSignup();
  };

  const handleSignup = async () => {
    if (!username || !firstName || !email || !password) {
      return toast.error("Fill all required fields");
    }

    const name = `${firstName} ${lastName}`.trim();

    const data = {
      username: username.toLowerCase().trim(),
      name,
      email,
      password,
      location,
      bio,
      sex,
    };

    try {
      toast.loading("Creating account...");

      await signup(data);

      toast.dismiss();
      toast.success("Account created! 🎉 Please verify your email.");

      router.push(`/verification-pending?email=${encodeURIComponent(email)}`);

    } catch (err: unknown) {
      toast.dismiss();

      const message = err instanceof Error ? err.message : "Signup failed";

      if (message.includes("User already exists")) {
        toast.error("⚠ User already exists! Try logging in.");
      }
      else if (message.includes("Missing required fields")) {
        toast.error("⚠ Please fill all required fields.");
      }
      else {
        toast.error(message);
      }
    }
  };

  const checkAvailability = async (value: string, type: "username" | "email") => {
    try {
      const res = await fetch("/api/auth/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [type]: value }),
      });

      const data = await res.json();

      if (data.exists) {
        if (type === "username") {
          setUsernameError("Username already taken");
          setShakeUsername(true);
          setTimeout(() => setShakeUsername(false), 400);
        } else {
          setEmailError("Email already exists");
          setShakeEmail(true);
          setTimeout(() => setShakeEmail(false), 400);
        }
      } else {
        if (type === "username") setUsernameError("");
        if (type === "email") setEmailError("");
      }
    } catch {
    }
  };

  useEffect(() => {
    if (!debouncedUsername) return;
    checkAvailability(debouncedUsername, "username");
  }, [debouncedUsername]);

  useEffect(() => {
    if (!debouncedEmail) return;
    checkAvailability(debouncedEmail, "email");
  }, [debouncedEmail]);

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
        link: "text-gray-600 hover:text-violet-600",
        progress: "bg-[#e1e1e1]",
        progressFill: "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600",
      };

  const steps = [
    {
      title: "Account Details",
      subtitle: "Create your credentials",
    },
    {
      title: "Personal Info",
      subtitle: "Tell us about yourself",
    },
    {
      title: "Additional Details",
      subtitle: "Optional information",
    },
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg} transition-all duration-500 p-2 xs:p-3 sm:p-4 relative overflow-y-auto`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 ${darkMode ? 'bg-violet-500/10' : 'bg-violet-300/30'} rounded-full blur-3xl`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${darkMode ? 'bg-purple-500/10' : 'bg-purple-300/30'} rounded-full blur-3xl`} />
      </div>

      {}

      <div className={`${theme.cardBg} ${theme.border} border rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg my-2 xs:my-4 sm:my-8 transition-all duration-500 relative z-10 flex flex-col max-h-[98vh] xs:max-h-[95vh] sm:max-h-[90vh] md:p-4`}>
        <div className="p-3 xs:p-4 sm:p-6 md:p-8 pb-2 xs:pb-3 sm:pb-4 md:pb-6 text-center flex-shrink-0">
          <div className={`inline-flex items-center justify-center rounded-2xl mb-2 xs:mb-3 sm:mb-4 relative`}>
              <Image
                  src={ darkMode ? "/logo.png":"/dark-logo.png"}
                  alt="Logo"
                  unoptimized
                  width={533}
                  height={191}
                  className="w-28 xs:w-32 sm:w-36 md:w-44 lg:w-52 h-auto"
              />
          </div>
          <h1 className={`text-lg xs:text-xl sm:text-2xl font-bold ${theme.text} mb-1 xs:mb-1.5 sm:mb-2`}>{steps[currentStep].title}</h1>
          <p className={`${theme.textSecondary} text-xs`}>{steps[currentStep].subtitle}</p>
        </div>

        <div className="px-3 xs:px-4 sm:px-6 md:px-8 mb-3 xs:mb-4 sm:mb-6 flex-shrink-0">
          {}
          <div className={`h-2 ${theme.progress} rounded-full overflow-hidden shadow-inner`}>
            <motion.div
              className={`h-full ${theme.progressFill} transition-all duration-500 ease-out shadow-lg`}
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / 3) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {}
          <div className="flex items-center justify-between mt-6 mb-2 relative">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={index} className="flex items-center flex-1 relative z-10">
                  {}
                  <div className="flex flex-col items-center flex-1">
                    <motion.div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${isCompleted
                          ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white shadow-lg'
                          : isCurrent
                          ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white shadow-lg ring-2 ring-violet-400/50'
                          : `${theme.progress} ${theme.textSecondary} border-2 ${darkMode ? 'border-gray-600' : 'border-gray-400'}`
                        }
                        transition-all duration-300
                        relative z-10
                      `}
                      animate={{
                        scale: isCurrent ? [1, 1.15, 1] : 1,
                      }}
                      transition={{
                        duration: 2,
                        repeat: isCurrent ? Infinity : 0,
                        ease: 'easeInOut',
                      }}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className={`text-xs font-semibold ${isCurrent ? 'text-white' : ''}`}>{index + 1}</span>
                      )}
                    </motion.div>
              <span
                      className={`text-xs mt-2 font-medium text-center transition-colors duration-300 ${
                        isCompleted || isCurrent
                          ? darkMode ? 'text-violet-400' : 'text-violet-600'
                          : theme.textSecondary
                      }`}
              >
                      {step.title}
              </span>
                  </div>

                  {}
                  {index < steps.length - 1 && (
                    <div className={`
                      absolute left-[calc(50%+20px)] right-[calc(50%+20px)] h-0.5 top-5
                      ${index < currentStep
                        ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600'
                        : theme.progress
                      }
                      transition-colors duration-500
                      z-0
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto relative min-h-0">
          <div
            className="px-3 xs:px-4 sm:px-6 md:px-8 pb-3 xs:pb-4 sm:pb-6 md:pb-8"
          >
            {currentStep === 0 && (
              <div className="w-full space-y-3 xs:space-y-4 sm:space-y-5 animate-fadeIn">
                <div>
                  <label className={`block text-xs font-semibold ${theme.text} mb-1 xs:mb-1.5 sm:mb-2`}>
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField("")}
                    placeholder="johndoe"
                    className={`w-full px-3 py-2.5 xs:py-3 text-sm rounded-lg xs:rounded-xl border ${theme.input}
                      ${focusedField === "username" ? `${theme.inputFocus} ring-2` : ""}
                      ${usernameError ? "border-red-500" : ""}
                      ${shakeUsername ? "shake" : ""}
                      transition-all duration-200
                    `}
                  />

                  {usernameError && (
                    <p className="text-red-500 text-xs mt-1">{usernameError}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${theme.text} mb-1 xs:mb-1.5 sm:mb-2`}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField("")}
                    placeholder="john@example.com"
                    className={`w-full px-3 py-2.5 xs:py-3 text-sm rounded-lg xs:rounded-xl border ${theme.input}
                      ${focusedField === "email" ? `${theme.inputFocus} ring-2` : ""}
                      ${emailError ? "border-red-500" : ""}
                      ${shakeEmail ? "shake" : ""}
                      transition-all duration-200
                    `}
                  />

                  {emailError && (
                    <p className="text-red-500 text-xs mt-1">{emailError}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${theme.text} mb-1 xs:mb-1.5 sm:mb-2`}>
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField("")}
                      placeholder="••••••••"
                      className={`w-full px-3 py-2.5 xs:py-3 text-sm rounded-lg xs:rounded-xl border ${theme.input} ${
                        focusedField === "password" ? `${theme.inputFocus} ring-2` : ""
                      } transition-all duration-200 focus:outline-none pr-9 xs:pr-10 sm:pr-12`}
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
                  {password && (
                    <div className="mt-3">
                      <div className="flex gap-1.5 mb-2">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength.strength
                                ? level === 1
                                  ? "bg-red-500"
                                  : level === 2
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                                : darkMode
                                ? "bg-slate-700"
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${theme.textSecondary}`}>
                        Strength: {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="w-full space-y-3 xs:space-y-4 sm:space-y-5 animate-fadeIn">
                <div>
                  <label className={`block text-xs font-semibold ${theme.text} mb-1 xs:mb-1.5 sm:mb-2`}>
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onFocus={() => setFocusedField("firstName")}
                    onBlur={() => setFocusedField("")}
                    placeholder="John"
                    className={`w-full px-3 py-2.5 xs:py-3 text-sm rounded-lg xs:rounded-xl border ${theme.input} ${
                      focusedField === "firstName" ? `${theme.inputFocus} ring-2` : ""
                    } transition-all duration-200 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${theme.text} mb-1 xs:mb-1.5 sm:mb-2`}>
                    Last Name <span className={`${theme.textSecondary} font-normal`}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onFocus={() => setFocusedField("lastName")}
                    onBlur={() => setFocusedField("")}
                    placeholder="Doe"
                    className={`w-full px-3 py-2.5 xs:py-3 text-sm rounded-lg xs:rounded-xl border ${theme.input} ${
                      focusedField === "lastName" ? `${theme.inputFocus} ring-2` : ""
                    } transition-all duration-200 focus:outline-none`}
                  />
                </div>

                <div className="relative">
                  <label className={`block text-xs font-semibold ${theme.text} mb-1 xs:mb-1.5 sm:mb-2`}>
                    Sex <span className="text-red-500">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsSexDropdownOpen(!isSexDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsSexDropdownOpen(false), 150)}
                    className={`w-full px-3 py-2.5 xs:py-3 text-sm flex items-center justify-between rounded-lg xs:rounded-xl border ${theme.input} ${
                      focusedField === "sex" ? `${theme.inputFocus} ring-2` : ""
                    } transition-all duration-300 focus:outline-none hover:scale-[1.01] active:scale-[0.99]`}
                  >
                    <span className={`${theme.text}`}>
                      {sex === "male" ? "Male" : sex === "female" ? "Female" : "Other"}
                    </span>
                    <motion.div
                      animate={{ rotate: isSexDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isSexDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className={`
                          absolute z-50 w-full bottom-[110%] rounded-xl overflow-hidden
                          backdrop-blur-lg
                          border shadow-2xl
                          ${darkMode
                            ? "bg-[#1f1f1f]/90 border-gray-700 shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
                            : "bg-white/90 border-gray-200 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
                          }
                        `}
                      >
                        {[
                          { label: "Male", value: "male" },
                          { label: "Female", value: "female" },
                          { label: "Other", value: "other" },
                        ].map((item) => (
                          <motion.button
                            key={item.value}
                            onClick={() => {
                              setSex(item.value);
                              setIsSexDropdownOpen(false);
                            }}
                            whileHover={{
                              backgroundColor: darkMode
                                ? "rgba(255,255,255,0.08)"
                                : "rgba(0,0,0,0.05)",
                              scale: 1.02,
                            }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full text-left px-4 py-3 text-sm ${
                              theme.text
                            } transition-all duration-200`}
                          >
                            {item.label}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            )}

            {currentStep === 2 && (
              <div className="w-full space-y-3 xs:space-y-4 sm:space-y-5 animate-fadeIn">
                <div>
                  <label className={`block text-xs font-semibold ${theme.text} mb-1 xs:mb-1.5 sm:mb-2`}>
                    Location <span className={`${theme.textSecondary} font-normal`}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onFocus={() => setFocusedField("location")}
                    onBlur={() => setFocusedField("")}
                    placeholder="New York, USA"
                    className={`w-full px-3 py-2.5 xs:py-3 text-sm rounded-lg xs:rounded-xl border ${theme.input} ${
                      focusedField === "location" ? `${theme.inputFocus} ring-2` : ""
                    } transition-all duration-200 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold ${theme.text} mb-1 xs:mb-1.5 sm:mb-2`}>
                    Bio <span className={`${theme.textSecondary} font-normal`}>(Optional)</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    onFocus={() => setFocusedField("bio")}
                    onBlur={() => setFocusedField("")}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                    className={`w-full px-3 py-2.5 xs:py-3 text-sm rounded-lg xs:rounded-xl border ${theme.input} ${
                      focusedField === "bio" ? `${theme.inputFocus} ring-2` : ""
                    } transition-all duration-200 focus:outline-none resize-none`}
                  />
                  <p className={`text-xs ${theme.textSecondary} mt-1.5 text-right`}>{bio.length}/500</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-3 xs:px-4 sm:px-6 md:px-8 pb-3 xs:pb-4 sm:pb-6 md:pb-8 flex-shrink-0 space-y-2 xs:space-y-3 z-10 relative border-t border-primary-light/10 dark:border-primary-dark/10 pt-3 xs:pt-4 sm:pt-6">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className={`flex-1 ${theme.buttonSecondary} py-2 xs:py-2.5 sm:py-3 px-2.5 xs:px-3 sm:px-4 rounded-lg xs:rounded-xl text-xs xs:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 xs:gap-2`}
              >
                <ArrowLeft className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                <span className="hidden xs:inline">Back</span>
              </button>
            )}

            {currentStep < 2 ? (
              <motion.button
                type="button"
                onClick={handleNext}
                disabled={!!(usernameError || emailError)}
                aria-disabled={!!(usernameError || emailError)}
                className={`flex-1 ${theme.button} ${theme.buttonText} py-2 xs:py-2.5 sm:py-3 px-2.5 xs:px-3 sm:px-4 rounded-lg xs:rounded-xl text-xs xs:text-sm font-semibold shadow-lg
                  hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200
                  flex items-center justify-center gap-1.5 xs:gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  relative overflow-hidden`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center gap-1.5 xs:gap-2">
                Next
                <ArrowRight className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={handleSkip}
                  className={`${theme.buttonSecondary} py-2 xs:py-2.5 sm:py-3 px-2.5 xs:px-3 sm:px-4 rounded-lg xs:rounded-xl text-xs xs:text-sm font-semibold transition-all duration-200`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Skip
                </motion.button>
                <motion.button
                  onClick={handleSignup}
                  className={`flex-1 ${theme.button} ${theme.buttonText} py-2 xs:py-2.5 sm:py-3 px-2.5 xs:px-3 sm:px-4 rounded-lg xs:rounded-xl text-xs xs:text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-1.5 xs:gap-2 relative overflow-hidden`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center gap-1.5 xs:gap-2">
                  <Check className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                  <span className="hidden xs:inline">Create Account</span>
                  <span className="xs:hidden">Create</span>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </>
            )}
          </div>

          <p className={`text-center text-xs ${theme.textSecondary}`}>
            {`Already have an account? `}
            <a href="/signin" className={`font-semibold ${theme.link} transition-colors`}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
