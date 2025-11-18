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
    return () => window.removeEventListener('scroll', handleScroll);
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
    { value: "10K+", label: "Active Users" },
    { value: "50K+", label: "Photos Shared" },
    { value: "100K+", label: "Daily Interactions" },
    { value: "99.9%", label: "Uptime" }
  ];

  return (
    <div className={`min-h-screen ${bgColor} ${textPrimary} transition-colors duration-300`}>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? `${navBg} shadow-lg` : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Image
                    src={isDark ? "/logo.png" : "/dark-logo.png"}
                    alt="Logo"
                    width={150}
                    height={150}
                    className="m-4"
                />
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-lg ${cardBg} hover:scale-110 transition-transform`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
              onClick={handleSignin}
              className={`px-6 py-2 rounded-lg border-2 ${buttonSecondary} text-gray-400 hover:text-white transition-all font-medium`}>
                Sign In
              </button>
              <button 
              onClick={handleSignUp}
              className={`px-6 py-2 rounded-lg ${buttonPrimary} text-white transition-all font-medium shadow-lg hover:shadow-xl`}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Share Your World,
              <br />
              <span className={accentColor}>Connect With Others</span>
            </h1>
            <p className={`text-xl md:text-2xl ${textSecondary} mb-8 max-w-3xl mx-auto`}>
              The modern social platform for photo sharing. Express yourself, discover amazing content, and build meaningful connections in real-time.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
              onClick={handleSignUp}
              className={`px-8 py-4 rounded-xl ${buttonPrimary} text-white text-lg font-medium shadow-lg hover:shadow-2xl transition-all hover:scale-105`}>
                Get Started Free
              </button>
              <button className={`px-8 py-4 rounded-xl border-2 ${buttonSecondary} hover:text-white text-lg font-medium transition-all hover:scale-105`}>
                Learn More
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, i) => (
              <div key={i} className={`${cardBg} rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all hover:scale-105`}>
                <div className={`text-4xl font-bold mb-2 ${accentColor}`}>{stat.value}</div>
                <div className={textSecondary}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className={`${cardBg} rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group`}>
              <div className={`w-16 h-16 ${buttonPrimary} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Explore Feed</h3>
              <p className={textSecondary}>
                Discover trending posts and connect with creators worldwide. Personalized content just for you.
              </p>
            </div>

            <div className={`${cardBg} rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group`}>
              <div className={`w-16 h-16 ${buttonPrimary} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Your Network</h3>
              <p className={textSecondary}>
                Follow friends, build your community, and stay updated with posts from people you care about.
              </p>
            </div>

            <div className={`${cardBg} rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group`}>
              <div className={`w-16 h-16 ${buttonPrimary} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Real-Time</h3>
              <p className={textSecondary}>
                Instant notifications for likes, comments, and follows. Never miss a moment with live updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Everything You Need</h2>
            <p className={`text-xl ${textSecondary} max-w-2xl mx-auto`}>
              Built with modern technology and designed for seamless social experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`${cardBg} rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 group`}
              >
                <div className={`${accentColor} mb-4 group-hover:scale-110 transition-transform inline-block`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className={textSecondary}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`${cardBg} rounded-3xl p-12 md:p-16 text-center shadow-2xl`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className={`text-xl ${textSecondary} mb-8 max-w-2xl mx-auto`}>
              Join thousands of users sharing their stories and building connections on LinkUp today.
            </p>
            <button 
            onClick={handleSignUp}
            className={`px-10 py-4 rounded-xl ${buttonPrimary} text-white text-lg font-medium shadow-lg hover:shadow-2xl transition-all hover:scale-105`}>
              Create Your Account
            </button>
          </div>
        </div>
      </section>

      <footer className={`${navBg} py-12 px-6 mt-20`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
                <Image
                    src={isDark ? "/logo.png" : "/dark-logo.png"}
                    alt="Logo"
                    width={150}
                    height={150}
                    className="m-4"
                />
          </div>
          <p className={textSecondary}>
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