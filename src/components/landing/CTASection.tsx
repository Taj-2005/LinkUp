'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

interface CTASectionProps {
  isDark: boolean;
  onSignUp: () => void;
}

export default function CTASection({ isDark, onSignUp }: CTASectionProps) {
  return (
    <section className="py-32 md:py-40 px-4 sm:px-6 relative overflow-hidden">
      {}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full bg-gradient-to-b from-violet-500/10 via-purple-500/10 to-transparent blur-3xl opacity-20" />
      </div>

      {}
      <div className={`
        absolute inset-0
        ${isDark ? 'opacity-[0.02]' : 'opacity-[0.03]'}
        bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]
        bg-[size:24px_24px]
      `} />

      <div className="max-w-5xl mx-auto relative z-10">
        <div
          className={`
            ${isDark ? 'bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'}
            rounded-3xl md:rounded-[2rem] p-10 md:p-20 text-center
            shadow-2xl
            relative overflow-hidden
            backdrop-blur-sm
          `}
        >
          {}
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-600 mb-8 shadow-xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h2 className={`
              text-4xl md:text-5xl lg:text-6xl font-bold mb-6
              ${isDark ? 'text-white' : 'text-gray-900'}
              tracking-tight
            `}>
              Ready to Get Started?
            </h2>

            <p className={`
              text-lg md:text-xl lg:text-2xl
              ${isDark ? 'text-gray-300' : 'text-gray-700'}
              mb-12 max-w-2xl mx-auto leading-relaxed font-light
            `}>
              Join thousands of users experiencing real-time social networking.
              Connect, share, and build meaningful relationships today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <motion.button
                onClick={onSignUp}
                className={`
                  group relative px-10 py-5 rounded-2xl font-semibold text-lg
                  bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white
                  shadow-2xl shadow-violet-500/30
                  w-full sm:w-auto
                  backdrop-blur-sm
                `}
                whileHover={{
                  scale: 1.03,
                  y: -2,
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  Create Your Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </motion.button>

              <motion.button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`
                  px-10 py-5 rounded-2xl font-semibold text-lg
                  ${isDark
                    ? 'bg-white/5 border-2 border-white/10 text-white hover:bg-white/10 backdrop-blur-sm'
                    : 'bg-gray-50 border-2 border-gray-200 text-gray-900 hover:bg-gray-100'
                  }
                  transition-all duration-200
                  w-full sm:w-auto
                  shadow-lg
                `}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                Learn More
              </motion.button>
            </div>

            {}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm md:text-base">
              {[
                'Free to join',
                'No credit card required',
                'Real-time updates',
                'Enterprise security',
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <div className={`
                    w-5 h-5 rounded-full flex items-center justify-center
                    ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'}
                  `}>
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
