'use client';

import { motion } from 'framer-motion';
import { Zap, Users, Shield, Globe, MessageCircle, Heart, Bell, Link2 } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Real-Time Notifications',
    description: 'Get instant updates for link requests, profile changes, and network activity. No page refresh needed.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: <Link2 className="w-6 h-6" />,
    title: 'Instant Linkup Requests',
    description: 'Accept, reject, or unlink connections instantly. All changes sync in real-time across all devices.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Smart Networking',
    description: 'Discover and connect with people based on location, interests, and mutual connections.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Enterprise Security',
    description: 'JWT-based authentication with multi-device support. Your data is protected with industry-standard security.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: 'Live Interactions',
    description: 'Experience real-time communication powered by Socket.IO. Stay connected with your network instantly.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: 'Smart Notifications',
    description: 'Never miss important updates with our intelligent notification system. Customize what matters to you.',
    gradient: 'from-violet-500 to-pink-500',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Global Scale',
    description: 'Connect with users worldwide. Built for scale with horizontal scaling capabilities and CDN optimization.',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Engage Instantly',
    description: 'Like, comment, and interact with posts in real-time. Build meaningful connections that matter.',
    gradient: 'from-red-500 to-pink-500',
  },
];

export default function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <section id="features" className="py-32 md:py-40 px-4 sm:px-6 relative">
      {}
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
          style={{ willChange: 'transform, opacity' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <span className="text-sm font-semibold tracking-wider uppercase text-violet-400">
              Features
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white tracking-tight">
            Everything You Need
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            Powerful features designed for modern social networking
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="group relative bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-8 transition-all duration-300 overflow-hidden"
              style={{ willChange: 'transform' }}
            >
              {}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              />

              {}
              <div className="relative z-10 mb-6">
                <motion.div
                  className={`
                    w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient}
                    flex items-center justify-center text-white
                    shadow-lg
                  `}
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  {feature.icon}
                </motion.div>
              </div>

              {}
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-violet-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-gray-400">
                  {feature.description}
                </p>
              </div>

              {}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                initial={false}
              >
              </motion.div>

              {}
              <div className={`
                absolute top-0 right-0 w-32 h-32
                bg-gradient-to-br ${feature.gradient}
                opacity-0 group-hover:opacity-5
                blur-2xl
                transition-opacity duration-500
              `} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
