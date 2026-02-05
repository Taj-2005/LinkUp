'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
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

  useEffect(() => {
    document.body.style.background = "transparent";
    return () => {
      document.body.style.background = "";
    };
  }, []);


  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <StructuredData />
      <ScrollProgress />

      { }
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-2xl border-b border-white/5 shadow-lg' : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            { }
            <motion.a
              href={process.env.NEXT_PUBLIC_APP_URL || '/'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center cursor-pointer"
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Image
                src="/logo.png"
                unoptimized
                alt="LinkUp Logo"
                width={533}
                height={191}
                className="h-7 xs:h-8 sm:h-10 md:h-12 w-auto"
              />
            </motion.a>

            { }
            <div className="hidden md:flex items-center space-x-6">
              <motion.button
                onClick={handleSignin}
                className="px-6 py-2 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
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
                  transition-all cursor-pointer
                `}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.button>
            </div>

            { }
            <div className="md:hidden flex items-center">
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-white/5 active:bg-white/10 cursor-pointer"
                whileTap={{ scale: 0.9 }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        { }
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden bg-[#0a0a0a] border-t border-gray-900"
            >
              <div className="px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">
                <motion.button
                  onClick={() => {
                    handleSignin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 sm:py-2 rounded-lg font-medium text-sm sm:text-base text-left text-gray-300 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer"
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In
                </motion.button>
                <motion.button
                  onClick={() => {
                    handleSignUp();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 sm:py-2 rounded-lg font-medium text-sm sm:text-base bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white transition-all active:opacity-90 cursor-pointer"
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Up
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      { }
      <main>
        <HeroSection onSignUp={handleSignUp} onSignIn={handleSignin} />
        <FeaturesSection />
        <TechStack />
        <CTASection onSignUp={handleSignUp} />
      </main>

      { }
      <Footer />
    </div>
  );
}
