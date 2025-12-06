'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const techStack = [
  {
    name: 'Next.js',
    logo: '/tech/nextjs.svg',
  },
  {
    name: 'TypeScript',
    logo: '/tech/typescript.svg',
  },
  {
    name: 'Express.js',
    logo: '/tech/express.png',
  },
  {
    name: 'JavaScript',
    logo: '/tech/js.svg',
  },
  {
    name: 'MongoDB',
    logo: '/tech/mongodb.png',
  },
  {
    name: 'Socket.IO',
    logo: '/tech/sockets.png',
  },
  {
    name: 'SWR',
    logo: '/tech/swr.png',
  },
  {
    name: 'Vercel',
    logo: '/tech/vercel.png',
  },
  {
    name: 'Tailwind CSS',
    logo: '/tech/tailwindcss.svg',
  },
  {
    name: 'Zustand',
    logo: '/tech/zustand.svg',
  },
  {
    name: 'Nodemailer',
    logo: '/tech/nodemailer.png',
  },
];

export default function TechStack() {
  return (
    <section id="tech" className="py-32 md:py-40 px-4 sm:px-6 relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/2 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block mb-6"
          >
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-400/80">
              My Skills
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white tracking-tight leading-[1.1]">
            <span className="text-white">The Secret</span>{' '}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sauce
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            Powered by industry-leading technologies for performance, reliability, and seamless user experience
          </p>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3 md:gap-4 max-w-6xl mx-auto"
        >
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: 'easeOut'
              }}
              whileHover={{
                scale: 1.08,
                transition: { duration: 0.15, ease: 'easeOut' }
              }}
              className="group relative w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-3 md:p-4 flex items-center justify-center overflow-visible cursor-pointer"
            >
              {}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none z-50 shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out transform translate-y-2 scale-90 group-hover:translate-y-0 group-hover:scale-100">
                {tech.name}
                {}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-800 border-r border-b border-white/10" />
              </div>

              {}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <Image
                  src={tech.logo}
                  alt={tech.name}
                  width={60}
                  height={60}
                  className="w-full h-full object-contain transition-opacity duration-200"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-violet-600 to-pink-600 rounded-lg flex items-center justify-center">
                          <span class="text-white font-bold text-[10px] text-center px-1">${tech.name}</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div>

              {}
              <div className={`
                absolute inset-0 rounded-xl md:rounded-2xl
                border-2 border-transparent
                group-hover:border-violet-500/50
                transition-all duration-200
                pointer-events-none
              `} />
            </motion.div>
          ))}
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-violet-500/10 border border-violet-500/20 backdrop-blur-sm"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-2xl"
            >
              ⚡
            </motion.span>
            <span className="text-sm md:text-base font-medium text-violet-300">
              Horizontally Scalable Architecture
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
