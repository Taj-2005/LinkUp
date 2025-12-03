'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, ExternalLink, Mail } from 'lucide-react';
import Image from 'next/image';

interface FooterProps {
  isDark: boolean;
}

const socialLinks = [
  {
    name: 'GitHub',
    icon: <Github className="w-5 h-5" />,
    href: 'https://github.com/Taj-2005',
    color: 'hover:text-gray-400',
  },
  {
    name: 'LinkedIn',
    icon: <Linkedin className="w-5 h-5" />,
    href: 'https://www.linkedin.com/in/tajuddinshaik786',
    color: 'hover:text-blue-400',
  },
  {
    name: 'Portfolio',
    icon: <ExternalLink className="w-5 h-5" />,
    href: 'https://shaik-tajuddin-portfolio.vercel.app',
    color: 'hover:text-violet-400',
  },
  {
    name: 'Email',
    icon: <Mail className="w-5 h-5" />,
    href: 'mailto:tajuddinshaik786r@example.com',
    color: 'hover:text-purple-400',
  },
];

export default function Footer({ isDark }: FooterProps) {
  return (
    <footer className={`
      ${isDark ? 'bg-[#0a0a0a] border-t border-white/5' : 'bg-white border-t border-gray-200'}
      py-16 md:py-20 px-4 sm:px-6
    `}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-12">
          {}
          <div className="flex flex-col">
            <motion.a
              href={process.env.NEXT_PUBLIC_APP_URL || '/'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block cursor-pointer mb-6"
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Image
                src={isDark ? '/logo.png' : '/dark-logo.png'}
                unoptimized
                alt="LinkUp Logo"
                width={533}
                height={191}
                className="w-24 sm:w-28 md:w-32 lg:w-36 h-auto max-w-full"
              />
            </motion.a>
            <p className={`
              text-sm md:text-base leading-relaxed
              ${isDark ? 'text-gray-400' : 'text-gray-600'}
              max-w-sm
            `}>
              Modern social networking platform built with Next.js, Socket.IO, and MongoDB.
              Connect, share, and build meaningful relationships in real-time.
            </p>
          </div>

          {}
          <div className="flex flex-col">
            <h3 className={`
              text-lg font-semibold mb-6
              ${isDark ? 'text-white' : 'text-gray-900'}
            `}>
              Quick Links
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { name: 'Features', href: '#features' },
                { name: 'Technology', href: '#tech' },
                { name: 'Sign In', href: '/signin' },
                { name: 'Sign Up', href: '/signup' },
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className={`
                    text-sm md:text-base transition-colors duration-200
                    ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                  `}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {}
          <div className="flex flex-col">
            <h3 className={`
              text-lg font-semibold mb-6
              ${isDark ? 'text-white' : 'text-gray-900'}
            `}>
              Developer
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className={`
                  w-12 h-12 rounded-full overflow-hidden
                  ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}
                `}>
                  <Image
                    src="/profile.jpg"
                    alt="Taj"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <p className={`
                    font-semibold text-base
                    ${isDark ? 'text-white' : 'text-gray-900'}
                  `}>
                    Taj
                  </p>
                  <p className={`
                    text-sm
                    ${isDark ? 'text-gray-400' : 'text-gray-600'}
                  `}>
                    Full-Stack Developer
                  </p>
                </div>
              </div>
              <p className={`
                text-sm
                ${isDark ? 'text-gray-400' : 'text-gray-600'}
              `}>
                Building modern web experiences with cutting-edge technologies.
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${isDark ? 'bg-white/5 border border-white/10 text-gray-400' : 'bg-gray-100 border border-gray-200 text-gray-600'}
                      transition-all duration-200
                      ${link.color}
                      hover:scale-110
                    `}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {}
        <div className={`
          pt-8 border-t
          ${isDark ? 'border-white/5' : 'border-gray-200'}
          flex flex-col md:flex-row items-center justify-between gap-4
        `}>
          <p className={`
            text-sm
            ${isDark ? 'text-gray-400' : 'text-gray-600'}
          `}>
            © 2025 LinkUp. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a
              href="#"
              className={`
                transition-colors duration-200
                ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
              `}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className={`
                transition-colors duration-200
                ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
              `}
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
