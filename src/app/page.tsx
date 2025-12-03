'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollProgress from '@/components/landing/ScrollProgress';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TechStack from '@/components/landing/TechStack';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import StructuredData from '@/components/landing/StructuredData';

export default function LandingPage() {
  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignin = () => {
    router.push('/signin');
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  useEffect(() => {

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

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

  const bgColor = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const navBg = isDark
    ? 'bg-[#0a0a0a]/90 backdrop-blur-2xl border-b border-white/5'
    : 'bg-white/90 backdrop-blur-2xl border-b border-gray-200/50';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';

  return (
    <div className={`min-h-screen ${bgColor} ${textPrimary} transition-colors duration-300`}>
      <StructuredData />
      <ScrollProgress />

      {}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? `${navBg} shadow-lg` : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {}
            <motion.a
              href={process.env.NEXT_PUBLIC_APP_URL || '/'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center cursor-pointer"
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                <Image
                src={isDark ? '/logo.png' : '/dark-logo.png'}
                    unoptimized
                alt="LinkUp Logo"
                    width={533}
                    height={191}
                className="h-8 sm:h-10 md:h-12 w-auto"
                />
            </motion.a>

            {}
            <div className="hidden md:flex items-center space-x-6">
              <motion.button
                onClick={() => setIsDark(!isDark)}
                className={`
                  p-2 rounded-lg
                  ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}
                  transition-colors
                `}
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </motion.button>

              <motion.button
              onClick={handleSignin}
                className={`
                  px-6 py-2 rounded-lg font-medium
                  ${isDark
                    ? 'text-gray-300 hover:text-white hover:bg-white/5'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }
                  transition-all
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>

              <motion.button
              onClick={handleSignUp}
                className={`
                  px-6 py-2 rounded-lg font-medium
                  bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white
                  shadow-lg shadow-violet-500/50
                  hover:shadow-xl hover:shadow-violet-500/50
                  transition-all
                `}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.button>
            </div>

            {}
            <div className="md:hidden flex items-center space-x-2">
              <motion.button
                onClick={() => setIsDark(!isDark)}
                className={`
                  p-2 rounded-lg
                  ${isDark ? 'bg-white/5' : 'bg-gray-100'}
                `}
                whileTap={{ scale: 0.9 }}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </motion.button>

              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`
                  p-2 rounded-lg
                  ${isDark ? 'bg-white/5' : 'bg-gray-100'}
                `}
                whileTap={{ scale: 0.9 }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`
                md:hidden overflow-hidden
                ${isDark ? 'bg-[#0a0a0a] border-t border-gray-900' : 'bg-white border-t border-gray-200'}
              `}
            >
              <div className="px-4 py-4 space-y-3">
                <motion.button
                  onClick={() => {
                    handleSignin();
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full px-4 py-2 rounded-lg font-medium text-left
                    ${isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-100'}
                    transition-colors
                  `}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In
                </motion.button>
                <motion.button
                  onClick={() => {
                    handleSignUp();
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full px-4 py-2 rounded-lg font-medium
                    bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white
                    transition-all
                  `}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Up
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {}
      <main>
        <HeroSection isDark={isDark} onSignUp={handleSignUp} onSignIn={handleSignin} />
        <FeaturesSection isDark={isDark} />
        <TechStack isDark={isDark} />
        <CTASection isDark={isDark} onSignUp={handleSignUp} />
      </main>

      {}
      <Footer isDark={isDark} />
    </div>
  );
}
