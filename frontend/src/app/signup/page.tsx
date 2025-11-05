"use client";

import { useState } from "react";
import { Eye, EyeOff, Moon, Sun, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {signup} from "@/utils/api"
import Image from "next/image";
import toast from "react-hot-toast";

export default function SignUpPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const router = useRouter();

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
    if (!username || !firstName || !lastName || !email || !password) {
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
    };

    try {
      toast.loading("Creating account...");
      await signup(data);
      toast.dismiss();
      toast.success("Account created 🎉");
      router.push("/signin");
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "Signup failed");
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
        inputFocus: "border-violet-500 ring-violet-500/20 bg-[#181818]",
        button: "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500",
        buttonSecondary: "bg-[#606468] hover:bg-[#3E434C] text-slate-300",
        buttonText: "text-white",
        link: "text-violet-400 hover:text-violet-300",
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
        inputFocus: "border-violet-500 ring-violet-500/20 bg-[#ffffff]",
        button: "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700",
        buttonSecondary: "bg-[#e1e1e1] hover:bg-[#606468] text-slate-700",
        buttonText: "text-white",
        link: "text-violet-600 hover:text-violet-700",
        progress: "bg-[#e1e1e1]",
        progressFill: "bg-gradient-to-r from-violet-500 to-purple-500",
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
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 ${darkMode ? 'bg-violet-500/10' : 'bg-violet-300/30'} rounded-full blur-3xl`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 ${darkMode ? 'bg-purple-500/10' : 'bg-purple-300/30'} rounded-full blur-3xl`} />
      </div>

      {/* Theme Toggle */}
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
        {/* Header Section */}
        <div className="p-8 pb-6 text-center flex-shrink-0">
          <div className={`inline-flex items-center justify-center w-50 h-16 rounded-2xl mb-4 relative`}>
              <Image
                  src={ darkMode ? "/logo.png":"/dark-logo.png"}
                  alt="Logo"
                  width={150}
                  height={150}
                  className="m-4"
              />
          </div>
          <h1 className={`text-2xl font-bold ${theme.text} mb-2`}>{steps[currentStep].title}</h1>
          <p className={`${theme.textSecondary} text-sm`}>{steps[currentStep].subtitle}</p>
        </div>

        {/* Progress Bar */}
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

        {/* Form Content with Slide Animation */}
        <div className="flex-1 overflow-hidden relative w-lg">
          <div 
            className="absolute inset-0 px-8 pb-8"
          >
            {/* Step 1: Account Details */}
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
                    className={`w-full px-4 py-3 rounded-xl border ${theme.input} ${
                      focusedField === "username" ? `${theme.inputFocus} ring-4` : ""
                    } transition-all duration-200 focus:outline-none`}
                  />
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
                    className={`w-full px-4 py-3 rounded-xl border ${theme.input} ${
                      focusedField === "email" ? `${theme.inputFocus} ring-4` : ""
                    } transition-all duration-200 focus:outline-none`}
                  />
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

            {/* Step 2: Personal Info */}
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
              </div>
            )}

            {/* Step 3: Additional Details */}
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

        {/* Navigation Buttons */}
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
                onClick={handleNext}
                className={`flex-1 ${theme.button} ${theme.buttonText} py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2`}
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
            Already have an account?{" "}
            <a href="/signin" className={`font-semibold ${theme.link} transition-colors`}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}