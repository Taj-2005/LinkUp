'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, ExternalLink, Mail } from 'lucide-react';
import Image from 'next/image';

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

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 lg:gap-16 mb-10 sm:mb-12">
          {}
          <div className="flex flex-col">
            <motion.a
              href={process.env.NEXT_PUBLIC_APP_URL || '/'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block cursor-pointer mb-4 sm:mb-6"
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Image
                src="/logo.png"
                unoptimized
                alt="LinkUp Logo"
                width={533}
                height={191}
                className="w-20 sm:w-24 md:w-28 lg:w-32 xl:w-36 h-auto max-w-full"
              />
            </motion.a>
            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-gray-400 max-w-sm">
              Modern social networking platform built with Next.js, Socket.IO, and MongoDB.
              Connect, share, and build meaningful relationships in real-time.
            </p>
          </div>

          {}
          <div className="flex flex-col">
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-white">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2 sm:gap-3">
              {[
                { name: 'Features', href: '#features' },
                { name: 'Technology', href: '#tech' },
                { name: 'Sign In', href: '/signin' },
                { name: 'Sign Up', href: '/signup' },
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-xs sm:text-sm md:text-base transition-colors duration-200 text-gray-400 hover:text-white active:text-gray-300"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {}
          <div className="flex flex-col sm:col-span-2 md:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-white">
              Developer
            </h3>
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
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
                  <p className="font-semibold text-sm sm:text-base text-white">
                    Taj
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Full-Stack Developer
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                Building modern web experiences with cutting-edge technologies.
              </p>
              <div className="flex items-center gap-2 sm:gap-3">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 transition-all duration-200 ${link.color} hover:scale-110 active:scale-95`}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
            © 2025 LinkUp. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <a
              href="#"
              className="transition-colors duration-200 text-gray-400 hover:text-white active:text-gray-300"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="transition-colors duration-200 text-gray-400 hover:text-white active:text-gray-300"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
