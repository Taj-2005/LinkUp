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
          className="relative z-10 container mx-auto px-4 py-20"
        >
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              Real-time Social Platform
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-white"
          >
            Connect, Share,
            <br />
            <span className="text-gradient">Build Together</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10"
          >
            Experience the next generation of social networking with real-time
            notifications, instant messaging, and enterprise-grade security.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.button
              onClick={onSignUp}
              className="group relative px-8 h-14 text-lg bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:opacity-90 glow-primary transition-all"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 inline-block" />
            </motion.button>
            <motion.button
              onClick={onSignIn}
              className="px-8 h-14 text-lg glass border border-white/10 text-white hover:bg-white/10 rounded-2xl font-semibold transition-all"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
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
                <div className="glass rounded-xl p-6 preserve-3d shadow-card">
                  <stat.icon className="h-6 w-6 text-violet-400 mb-3 mx-auto" />
                  <div className="text-3xl font-bold text-gradient mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
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
