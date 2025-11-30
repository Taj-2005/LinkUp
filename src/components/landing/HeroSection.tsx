'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, TrendingUp, Users, Activity } from 'lucide-react';
import { useRef } from 'react';

interface HeroSectionProps {
  isDark: boolean;
  onSignUp: () => void;
  onSignIn: () => void;
}

export default function HeroSection({ isDark, onSignUp, onSignIn }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Fix: Only start fading after significant scroll (0.7 instead of 0.5)
  // This keeps hero visible longer
  const opacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.98]);
  const y = useTransform(scrollYProgress, [0, 0.8], [0, 30]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  const metrics = [
    { value: '96%', label: 'Performance Score (RES)', icon: <Activity className="w-4 h-4" />, color: 'from-green-500 to-emerald-500'},
    { value: '<100ms', label: 'Response', icon: <Zap className="w-4 h-4" />, color: 'from-yellow-500 to-orange-500' },
    { value: 'Real-Time', label: 'Updates', icon: <TrendingUp className="w-4 h-4" />, color: 'from-blue-500 to-cyan-500' },
    { value: '10+', label: 'Users', icon: <Users className="w-4 h-4" />, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-32 px-4 sm:px-6"
      style={{ willChange: 'scroll-position' }}
    >
      {/* Optimized animated background with GPU acceleration */}
      <div className="absolute inset-0 overflow-hidden" style={{ willChange: 'transform' }}>
        <motion.div
          className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-violet-500/8 rounded-full blur-3xl"
          style={{ willChange: 'transform' }}
          animate={{
            scale: [1, 1.4, 1],
            x: [0, 120, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/8 rounded-full blur-3xl"
          style={{ willChange: 'transform' }}
          animate={{
            scale: [1, 1.5, 1],
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/4 rounded-full blur-3xl"
          style={{ willChange: 'transform' }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div className={`
        absolute inset-0 pointer-events-none
        ${isDark ? 'opacity-[0.015]' : 'opacity-[0.02]'}
        bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]
        bg-[size:32px_32px]
      `} />

      <motion.div
        style={{ 
          opacity, 
          scale, 
          y,
          willChange: 'transform, opacity',
        }}
        className="max-w-7xl mx-auto relative z-10"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Premium badge */}
          <motion.div variants={itemVariants} className="mb-10">
            <motion.div
              className={`
                inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium
                ${isDark 
                  ? 'bg-violet-500/10 border border-violet-500/20 text-violet-300 backdrop-blur-md' 
                  : 'bg-violet-50 border border-violet-200 text-violet-700'
                }
                shadow-lg
              `}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{ willChange: 'transform' }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{ willChange: 'transform' }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              <span className="tracking-wide">Real-Time Social Networking Platform</span>
            </motion.div>
          </motion.div>

          {/* Main heading with refined typography */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-8 leading-[1.05] tracking-tight"
          >
            <span className={isDark ? 'text-white' : 'text-gray-900'}>
              Connect,
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Share,
            </span>
            <br />
            <span className={isDark ? 'text-white' : 'text-gray-900'}>
              Build Together
            </span>
          </motion.h1>

          {/* Subheading with better spacing */}
          <motion.p
            variants={itemVariants}
            className={`
              text-xl md:text-2xl lg:text-3xl
              ${isDark ? 'text-gray-300' : 'text-gray-700'}
              mb-8 max-w-3xl mx-auto leading-relaxed font-light
            `}
          >
            Experience the future of social networking with real-time updates, instant connections, and seamless interactions.
          </motion.p>

          <motion.p
            variants={itemVariants}
            className={`
              text-base md:text-lg
              ${isDark ? 'text-gray-500' : 'text-gray-500'}
              mb-16 max-w-2xl mx-auto
            `}
          >
            Powered by Socket.IO, Next.js, and MongoDB for enterprise-grade performance
          </motion.p>

          {/* Premium CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
          >
            <motion.button
              onClick={onSignUp}
              className={`
                group relative px-10 py-5 rounded-2xl font-semibold text-lg
                bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white
                shadow-2xl shadow-violet-500/30
                overflow-hidden
                backdrop-blur-sm
              `}
              whileHover={{ 
                scale: 1.03,
                y: -2,
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <span className="relative z-10 flex items-center gap-2.5">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </motion.button>

            <motion.button
              onClick={onSignIn}
              className={`
                px-10 py-5 rounded-2xl font-semibold text-lg
                ${isDark 
                  ? 'bg-white/5 border-2 border-white/10 text-white hover:bg-white/10 backdrop-blur-sm' 
                  : 'bg-gray-50 border-2 border-gray-200 text-gray-900 hover:bg-gray-100'
                }
                transition-all duration-300
                shadow-lg
              `}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{ willChange: 'transform' }}
            >
              Sign In
            </motion.button>
          </motion.div>

          {/* Premium Metrics Grid with Animated Charts */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto"
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                className={`
                  ${isDark ? 'bg-white/5 border border-white/10 backdrop-blur-md' : 'bg-white border border-gray-200 shadow-lg'}
                  rounded-3xl p-6 md:p-8
                  group relative overflow-hidden
                `}
                whileHover={{ scale: 1.03, y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.3 + index * 0.08, 
                  ease: 'easeOut' 
                }}
                style={{ willChange: 'transform' }}
              >
                {/* Gradient background on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                {/* Icon */}
                <div className={`
                  mb-4 inline-flex p-2.5 rounded-xl bg-gradient-to-br ${metric.color}
                  text-white shadow-lg
                `}>
                  {metric.icon}
                </div>

                {/* Value */}
                <div className={`
                  text-3xl md:text-4xl font-bold mb-2
                  ${isDark ? 'text-white' : 'text-gray-900'}
                `}>
                  {metric.value}
                </div>

                {/* Label */}
                <div className={`
                  text-sm md:text-base
                  ${isDark ? 'text-gray-400' : 'text-gray-600'}
                `}>
                  {metric.label}
                </div>

                {/* Animated progress bar */}
                <motion.div
                  className={`
                    absolute bottom-0 left-0 right-0 h-1
                    bg-gradient-to-r ${metric.color}
                  `}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
                  style={{ originX: 0, willChange: 'transform' }}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
