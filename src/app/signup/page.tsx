"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Moon, Sun, Check, ArrowRight, ArrowLeft } from "lucide-react";
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
  const [darkMode, setDarkMode] = useState(true);
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
        button: "bg-gradient-to-r from-gray-600 to-gray-600 hover:from-gray-500 hover:to-gray-500",
        buttonSecondary: "bg-[#606468] hover:bg-[#3E434C] text-slate-300",
        buttonText: "text-white",
        link: "text-gray-400 hover:text-white",
        progress: "bg-[#181818]",
        progressFill: "bg-gradient-to-r from-gray-400 to-gray-400",
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
        link: "text-gray-600 hover:text-black",
        progress: "bg-[#e1e1e1]",
        progressFill: "bg-gradient-to-r from-gray-500 to-gray-500",
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
    <div className={`min-h-screen flex items-center justify-center ${theme.bg} transition-all duration-500 p-4 relative overflow-hidden `}>
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

      <div className={`${theme.cardBg} ${theme.border} border rounded-3xl shadow-2xl w-lg h-[80vh] transition-all duration-500 relative z-10 flex flex-col`}>
        <div className="p-8 pb-6 text-center flex-shrink-0">
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
          <h1 className={`text-2xl font-bold ${theme.text} mb-2`}>{steps[currentStep].title}</h1>
          <p className={`${theme.textSecondary} text-sm`}>{steps[currentStep].subtitle}</p>
        </div>

        <div className="px-8 mb-6 flex-shrink-0">
          <div className={`h-2 ${theme.progress} rounded-full overflow-hidden`}>
            <div 
              className={`h-full ${theme.progressFill} transition-all duration-500 ease-out`}
              style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <span 
                key={index}
                className={`text-xs ${index <= currentStep ? theme.text : theme.textSecondary} transition-colors duration-300`}
              >
                Step {index + 1}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative w-lg">
          <div 
            className="absolute inset-0 px-8 pb-8"
          >
            {currentStep === 0 && (
              <div className="w-md h-full space-y-5 animate-fadeIn">
                <div>
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField("")}
                    placeholder="johndoe"
                    className={`w-full px-4 py-3 rounded-xl border ${theme.input}
                      ${focusedField === "username" ? `${theme.inputFocus} ring-4` : ""}
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
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField("")}
                    placeholder="john@example.com"
                    className={`w-full px-4 py-3 rounded-xl border ${theme.input}
                      ${focusedField === "email" ? `${theme.inputFocus} ring-4` : ""}
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
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
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
                      className={`w-full px-4 py-3 rounded-xl border ${theme.input} ${
                        focusedField === "password" ? `${theme.inputFocus} ring-4` : ""
                      } transition-all duration-200 focus:outline-none pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme.textSecondary} hover:${theme.text} transition-colors`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
              <div className="w-full h-full space-y-5 animate-fadeIn">
                <div>
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onFocus={() => setFocusedField("firstName")}
                    onBlur={() => setFocusedField("")}
                    placeholder="John"
                    className={`w-full px-4 py-3 rounded-xl border ${theme.input} ${
                      focusedField === "firstName" ? `${theme.inputFocus} ring-4` : ""
                    } transition-all duration-200 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    Last Name <span className={`${theme.textSecondary} font-normal`}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onFocus={() => setFocusedField("lastName")}
                    onBlur={() => setFocusedField("")}
                    placeholder="Doe"
                    className={`w-full px-4 py-3 rounded-xl border ${theme.input} ${
                      focusedField === "lastName" ? `${theme.inputFocus} ring-4` : ""
                    } transition-all duration-200 focus:outline-none`}
                  />
                </div>

                <div className="relative">
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    Sex <span className="text-red-500">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsSexDropdownOpen(!isSexDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsSexDropdownOpen(false), 150)}
                    className={`w-full px-4 py-3 flex items-center justify-between rounded-xl border ${theme.input} ${
                      focusedField === "sex" ? `${theme.inputFocus} ring-4` : ""
                    } transition-all duration-300 focus:outline-none hover:scale-[1.01] active:scale-[0.99]`}
                  >
                    <span className={`${theme.text}`}>
                      {sex === "male" ? "Male" : sex === "female" ? "Female" : "Other"}
                    </span>
                    <motion.div
                      animate={{ rotate: isSexDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400" />
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
              <div className="w-full h-full space-y-5 animate-fadeIn">
                <div>
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
                    Location <span className={`${theme.textSecondary} font-normal`}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onFocus={() => setFocusedField("location")}
                    onBlur={() => setFocusedField("")}
                    placeholder="New York, USA"
                    className={`w-full px-4 py-3 rounded-xl border ${theme.input} ${
                      focusedField === "location" ? `${theme.inputFocus} ring-4` : ""
                    } transition-all duration-200 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold ${theme.text} mb-2`}>
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
                    className={`w-full px-4 py-3 rounded-xl border ${theme.input} ${
                      focusedField === "bio" ? `${theme.inputFocus} ring-4` : ""
                    } transition-all duration-200 focus:outline-none resize-none`}
                  />
                  <p className={`text-xs ${theme.textSecondary} mt-1.5 text-right`}>{bio.length}/500</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 pb-8 flex-shrink-0 space-y-3 z-10 relative">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className={`flex-1 ${theme.buttonSecondary} py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2`}
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}
            
            {currentStep < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!!(usernameError || emailError)}
                aria-disabled={!!(usernameError || emailError)}
                className={`flex-1 ${theme.button} ${theme.buttonText} py-3 px-4 rounded-xl font-semibold shadow-lg
                  hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200
                  flex items-center justify-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleSkip}
                  className={`${theme.buttonSecondary} py-3 px-4 rounded-xl font-semibold transition-all duration-200`}
                >
                  Skip
                </button>
                <button
                  onClick={handleSignup}
                  className={`flex-1 ${theme.button} ${theme.buttonText} py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2`}
                >
                  <Check className="w-5 h-5" />
                  Create Account
                </button> 
              </>
            )}
          </div>

          <p className={`text-center text-sm ${theme.textSecondary}`}>
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