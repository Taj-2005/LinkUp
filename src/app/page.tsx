'use client';

import { useState, useEffect } from 'react';
import { Camera, Users, Heart, MessageCircle, Zap, Shield, Globe, Moon, Sun } from 'lucide-react';
import Image from "next/image"
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter()

  const handleSignin = () => {
    router.push('/signin')
    return
  }

  const handleSignUp = () => {
    router.push('/signup')
    return
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const html = document.documentElement;
    const body = document.body;
    
    html.classList.add('landing-page');
    body.classList.add('landing-page');
    body.classList.remove('h-full');
    
    html.style.setProperty('height', 'auto', 'important');
    html.style.setProperty('overflow-y', 'auto', 'important');
    body.style.setProperty('height', 'auto', 'important');
    body.style.setProperty('overflow-y', 'auto', 'important');
    body.style.setProperty('overflow-x', 'hidden', 'important');
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      html.classList.remove('landing-page');
      body.classList.remove('landing-page');
      body.classList.add('h-full');
      
      html.style.removeProperty('height');
      html.style.removeProperty('overflow-y');
      body.style.removeProperty('height');
      body.style.removeProperty('overflow-y');
      body.style.removeProperty('overflow-x');
    };
  }, []);

  const bgColor = isDark ? 'bg-[#181818]' : 'bg-[#e1e1e1]';
  const navBg = isDark ? 'bg-[#212121]' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-[#212121]' : 'bg-white';
  const accentColor = isDark ? 'text-gray-400' : 'text-[#606468]';
  const buttonPrimary = isDark ? 'bg-[#3E434C] hover:bg-[#606468]' : 'bg-[#606468] hover:bg-[#3E434C]';
  const buttonSecondary = isDark ? 'border-gray-400 text-[#3E434C] hover:bg-[#3E434C]' : 'border-[#606468] text-[#606468] hover:bg-[#606468]';

  const features = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Share Your Story",
      description: "Upload stunning photos with captions and share your moments with the world in real-time."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Connect & Follow",
      description: "Build your social network by following friends and discovering creators who inspire you."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Engage Instantly",
      description: "Like, comment, and interact with posts. Real-time notifications keep you in the loop."
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Live Interactions",
      description: "Experience real-time comments and notifications powered by WebSocket technology."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Optimized image loading with Cloudinary CDN ensures smooth, responsive performance."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Your data is protected with JWT authentication and secure, encrypted connections."
    }
  ];

  const stats = [
    { value: "10+", label: "Active Users" },
    { value: "5+", label: "Photos Shared" },
    { value: "200+", label: "Daily Interactions" },
    { value: "96%", label: "Uptime" }
  ];

  return (
    <div className={`min-h-screen ${bgColor} ${textPrimary} transition-colors duration-300`}>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? `${navBg} shadow-lg` : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
                <Image
                    src={isDark ? "/logo.png" : "/dark-logo.png"}
                    unoptimized
                    alt="Logo"
                    width={533}
                    height={191}
                    className="w-20 h-auto sm:w-24 sm:h-auto md:w-32 md:h-auto lg:w-36 lg:h-auto"
                />
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-1.5 sm:p-2 rounded-lg ${cardBg} hover:scale-110 transition-transform`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
              <button
              onClick={handleSignin}
              className={`px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-base rounded-lg border-2 ${buttonSecondary} text-gray-400 hover:text-white transition-all font-medium`}>
                Sign In
              </button>
              <button 
              onClick={handleSignUp}
              className={`px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-base rounded-lg ${buttonPrimary} text-white transition-all font-medium shadow-lg hover:shadow-xl`}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2">
              Share Your World,
              <br />
              <span className={accentColor}>Connect With Others</span>
            </h1>
            <p className={`text-base sm:text-lg md:text-xl lg:text-2xl ${textSecondary} mb-6 sm:mb-8 max-w-3xl mx-auto px-4`}>
              The modern social platform for photo sharing. Express yourself, discover amazing content, and build meaningful connections in real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <button
              onClick={handleSignUp}
              className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl ${buttonPrimary} text-white text-base sm:text-lg font-medium shadow-lg hover:shadow-2xl transition-all hover:scale-105`}>
                Get Started Free
              </button>
              <button className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 ${buttonSecondary} hover:text-white text-base sm:text-lg font-medium transition-all hover:scale-105`}>
                Learn More
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-12 sm:mb-16 md:mb-20">
            {stats.map((stat, i) => (
              <div key={i} className={`${cardBg} rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-all hover:scale-105`}>
                <div className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 ${accentColor}`}>{stat.value}</div>
                <div className={`text-xs sm:text-sm md:text-base ${textSecondary}`}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-20">
            <div className={`${cardBg} rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group`}>
              <div className={`w-12 h-12 sm:w-16 sm:h-16 ${buttonPrimary} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Explore Feed</h3>
              <p className={`text-sm sm:text-base ${textSecondary}`}>
                Discover trending posts and connect with creators worldwide. Personalized content just for you.
              </p>
            </div>

            <div className={`${cardBg} rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group`}>
              <div className={`w-12 h-12 sm:w-16 sm:h-16 ${buttonPrimary} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Your Network</h3>
              <p className={`text-sm sm:text-base ${textSecondary}`}>
                Follow friends, build your community, and stay updated with posts from people you care about.
              </p>
            </div>

            <div className={`${cardBg} rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group`}>
              <div className={`w-12 h-12 sm:w-16 sm:h-16 ${buttonPrimary} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Real-Time</h3>
              <p className={`text-sm sm:text-base ${textSecondary}`}>
                Instant notifications for likes, comments, and follows. Never miss a moment with live updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-2">Everything You Need</h2>
            <p className={`text-base sm:text-lg md:text-xl ${textSecondary} max-w-2xl mx-auto px-4`}>
              Built with modern technology and designed for seamless social experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`${cardBg} rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 group`}
              >
                <div className={`${accentColor} mb-3 sm:mb-4 group-hover:scale-110 transition-transform inline-block`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                <p className={`text-sm sm:text-base ${textSecondary}`}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`${cardBg} rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 text-center shadow-2xl`}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              Ready to Get Started?
            </h2>
            <p className={`text-base sm:text-lg md:text-xl ${textSecondary} mb-6 sm:mb-8 max-w-2xl mx-auto px-4`}>
              Join thousands of users sharing their stories and building connections on LinkUp today.
            </p>
            <button 
            onClick={handleSignUp}
            className={`px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-xl ${buttonPrimary} text-white text-base sm:text-lg font-medium shadow-lg hover:shadow-2xl transition-all hover:scale-105`}>
              Create Your Account
            </button>
          </div>
        </div>
      </section>

      <footer className={`${navBg} py-8 sm:py-10 md:py-12 px-4 sm:px-6 mt-12 sm:mt-16 md:mt-20`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
                <Image
                    src={isDark ? "/logo.png" : "/dark-logo.png"}
                    unoptimized
                    alt="Logo"
                    width={533}
                    height={191}
                    className="w-16 h-auto sm:w-20 sm:h-auto md:w-24 md:h-auto lg:w-32 lg:h-auto"
                />
          </div>
          <p className={`text-xs sm:text-sm md:text-base ${textSecondary} px-4`}>
            © 2025 LinkUp. Built with Next.js, Express, MongoDB & Cloudinary.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}