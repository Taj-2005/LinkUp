'use client';

import { motion, MotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

interface TechItemProps {
  tech: { name: string; logo: string };
  position: { x: number; y: number };
  baseRotate: number;
  isHovered: boolean;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  isDark: boolean;
  index: number;
}

export default function TechItem({
  tech,
  position,
  baseRotate,
  isHovered,
  mouseX,
  mouseY,
  isDark,
  index,
}: TechItemProps) {
  const [isHoveredItem, setIsHoveredItem] = useState(false);

  // Optimized transforms with better performance
  const baseX = useTransform(mouseX, (latestX) => position.x + latestX * 0.04);
  const baseY = useTransform(mouseY, (latestY) => position.y + latestY * 0.04);
  const hoverX = useTransform(mouseX, (latestX) => position.x + latestX * 0.15);
  const hoverY = useTransform(mouseY, (latestY) => position.y + latestY * 0.15);

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 cursor-pointer"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: isHoveredItem ? 1.3 : 1,
        rotate: isHovered ? baseRotate + 360 : baseRotate,
        zIndex: isHoveredItem ? 50 : 10,
      }}
      transition={{
        rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
        opacity: { duration: 0.5, delay: index * 0.06, ease: 'easeOut' },
        scale: { duration: 0.25, type: 'spring', stiffness: 400, damping: 30 },
      }}
      onHoverStart={() => setIsHoveredItem(true)}
      onHoverEnd={() => setIsHoveredItem(false)}
      style={{
        x: isHoveredItem ? hoverX : baseX,
        y: isHoveredItem ? hoverY : baseY,
        willChange: 'transform',
      }}
    >
      <motion.div
        className={`
          w-20 h-20 md:w-24 md:h-24
          ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200/50'}
          rounded-3xl p-4 md:p-5
          shadow-2xl
          backdrop-blur-md
          flex items-center justify-center
          group
          relative overflow-hidden
        `}
        whileHover={{
          boxShadow: '0 25px 50px rgba(139, 92, 246, 0.4)',
          borderColor: isDark ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.4)',
        }}
        animate={{
          rotateY: isHoveredItem ? [0, 360] : 0,
        }}
        transition={{
          rotateY: { duration: 3, repeat: Infinity, ease: 'linear' },
        }}
        style={{ willChange: 'transform' }}
      >
        {/* Always render shimmer but control visibility with opacity */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          animate={{
            x: isHoveredItem ? ['-200%', '200%'] : '-200%',
            opacity: isHoveredItem ? [0, 1, 0] : 0,
          }}
          transition={{
            x: {
              duration: 1.5,
              repeat: isHoveredItem ? Infinity : 0,
              repeatDelay: 2,
              ease: 'linear',
            },
            opacity: {
              duration: 0.3,
            },
          }}
          style={{ willChange: 'transform, opacity' }}
        />

        <Image
          src={tech.logo}
          alt={tech.name}
          width={100}
          height={100}
          className="w-full h-full object-contain filter group-hover:brightness-110 transition-all duration-200 relative z-10"
          unoptimized
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-violet-600 to-pink-600 rounded-xl flex items-center justify-center relative z-10"><span class="text-white font-bold text-xs">${tech.name}</span></div>`;
            }
          }}
        />

        {/* Hover glow - optimized */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/30 to-pink-500/30 opacity-0 group-hover:opacity-100 blur-2xl -z-10 transition-opacity duration-300"
        />

        {/* Always render particles but control visibility */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-violet-400 rounded-full"
              initial={{
                x: '50%',
                y: '50%',
                scale: 0,
                opacity: 0,
              }}
              animate={{
                x: isHoveredItem
                  ? `calc(50% + ${Math.cos((i / 8) * Math.PI * 2) * 50}px)`
                  : '50%',
                y: isHoveredItem
                  ? `calc(50% + ${Math.sin((i / 8) * Math.PI * 2) * 50}px)`
                  : '50%',
                scale: isHoveredItem ? [0, 1, 0] : 0,
                opacity: isHoveredItem ? [1, 1, 0] : 0,
              }}
              transition={{
                duration: 1.2,
                repeat: isHoveredItem ? Infinity : 0,
                delay: i * 0.15,
                ease: 'easeOut',
              }}
              style={{ willChange: 'transform, opacity' }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
