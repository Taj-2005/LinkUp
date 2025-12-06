'use client';

import { motion } from "framer-motion";

const orbs = [
  { size: 300, x: "10%", y: "20%", delay: 0, duration: 8, color: "primary" },
  { size: 200, x: "80%", y: "30%", delay: 2, duration: 10, color: "accent" },
  { size: 150, x: "70%", y: "70%", delay: 1, duration: 7, color: "primary" },
  { size: 100, x: "20%", y: "80%", delay: 3, duration: 9, color: "accent" },
  { size: 250, x: "50%", y: "10%", delay: 1.5, duration: 11, color: "primary" },
];

export const FloatingOrbs = () => {
  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full blur-3xl ${
            orb.color === "primary" ? "bg-violet-500/20" : "bg-purple-500/20"
          }`}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            transform: "translate(-50%, -50%)"
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};
