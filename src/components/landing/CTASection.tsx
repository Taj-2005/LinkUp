'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

interface CTASectionProps {
  onSignUp: () => void;
}

export default function CTASection({ onSignUp }: CTASectionProps) {
  return (
    <section className="py-20 sm:py-24 md:py-32 lg:py-40 px-3 sm:px-4 md:px-6 relative overflow-hidden">
      { }
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full bg-gradient-to-b from-violet-500/10 via-purple-500/10 to-transparent blur-3xl opacity-20" />
      </div>

      { }
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl sm:rounded-3xl md:rounded-[2rem] p-6 sm:p-8 md:p-10 lg:p-20 text-center shadow-2xl relative overflow-hidden backdrop-blur-sm">
          { }
          <div className="absolute top-0 right-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-violet-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-600 to-pink-600 mb-6 sm:mb-8 shadow-xl">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>

            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white tracking-tight leading-tight px-2 sm:px-0">
              Ready to Get Started?
            </h2>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-300 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed font-light px-2 sm:px-0">
              Join thousands of users experiencing real-time social networking.
              Connect, share, and build meaningful relationships today.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
              <motion.button
                onClick={onSignUp}
                className="group relative px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base md:text-lg bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white shadow-2xl shadow-violet-500/30 w-full sm:w-auto backdrop-blur-sm cursor-pointer"
                whileHover={{
                  scale: 1.03,
                  y: -2,
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-2.5">
                  Create Your Account
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </motion.button>

              <motion.button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base md:text-lg bg-white/5 border-2 border-white/10 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-200 w-full sm:w-auto shadow-lg active:bg-white/15 cursor-pointer"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                Learn More
              </motion.button>
            </div>

            { }
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm md:text-base">
              {[
                'Free to join',
                'No credit card required',
                'Real-time updates',
                'Enterprise security',
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-gray-400"
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-green-500/20 text-green-400">
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
