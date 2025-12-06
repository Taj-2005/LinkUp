'use client';

import { motion } from "framer-motion";

export const GridBackground = () => {
  return (
<div className="absolute inset-0 pointer-events-none z-[0]">
  {/* OPAQUE BACKGROUND BASE */}
  <div className="absolute inset-0 bg-[#070707] z-[0]" />

  {/* GRID ABOVE THE BASE */}
  <div
    className="absolute inset-0 z-[1]"
    style={{
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.07) 0.2px, transparent 0.2px),
        linear-gradient(90deg, rgba(255,255,255,0.07) 0.2px, transparent 0.2px)
      `,
      backgroundSize: "60px 60px",
    }}
  />

  {/* RADIAL GRADIENT ABOVE GRID */}
  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-black/40 z-[2]" />

  {/* SCAN LINE */}
  <motion.div
    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent z-[3]"
    initial={{ top: "0%" }}
    animate={{ top: "100%" }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
  />
</div>

  );
};
