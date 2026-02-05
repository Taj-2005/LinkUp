'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Zap, Users, Globe } from 'lucide-react';
import { useRef } from 'react';
import { FloatingOrbs } from './FloatingOrbs';
import { GridBackground } from './GridBackground';

interface HeroSectionProps {
  onSignUp: () => void;
  onSignIn: () => void;
}

const stats = [
  { icon: Users, value: "10K+", label: "Active Users" },
  { icon: Zap, value: "99.9%", label: "Uptime" },
  { icon: Globe, value: "50+", label: "Countries" },
];

export default function HeroSection({ onSignUp, onSignIn }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <section
      ref={containerRef}
      className="relative z-[10] min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* GRID (bottom layer) */}
      <div className="absolute inset-0 z-[-2]">
        <GridBackground />
      </div>

      {/* ORBS (middle layer) */}
      <div className="absolute inset-0 z-[-1]">
        <FloatingOrbs />
      </div>

      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 py-12 sm:py-16 md:py-20"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 sm:mb-8"
          >
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass text-xs sm:text-sm font-medium">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-violet-500"></span>
              </span>
              <span className="whitespace-nowrap">Real-time Social Platform</span>
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-4 sm:mb-6 text-white leading-tight"
          >
            Connect, Share,
            <br className="hidden xs:block" />
            <span className="text-gradient">Build Together</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 sm:mb-10 px-2 sm:px-0 leading-relaxed"
          >
            Experience the next generation of social networking with real-time
            notifications, instant messaging, and enterprise-grade security.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-2 sm:px-0"
          >
            <motion.button
              onClick={onSignUp}
              className="group relative px-6 sm:px-8 h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl sm:rounded-2xl font-semibold hover:opacity-90 glow-primary transition-all w-full sm:w-auto cursor-pointer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1 inline-block" />
            </motion.button>
            <motion.button
              onClick={onSignIn}
              className="px-6 sm:px-8 h-12 sm:h-14 text-base sm:text-lg glass border border-white/10 text-white hover:bg-white/10 rounded-xl sm:rounded-2xl font-semibold transition-all w-full sm:w-auto active:bg-white/15 cursor-pointer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto px-2 sm:px-0"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  transition: { duration: 0.2 }
                }}
                className="perspective-1000"
              >
                <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-6 preserve-3d shadow-card">
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400 mb-2 sm:mb-3 mx-auto" />
                  <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1 sm:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2"
        style={{ zIndex: 20 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-gray-500/30 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-violet-500"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
