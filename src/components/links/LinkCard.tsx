"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ILink } from "@/models/Link";
import { FiHeart, FiMessageCircle } from "react-icons/fi";

interface LinkCardProps {
  link: ILink;
  onClick: () => void;
}

export default function LinkCard({ link, onClick }: LinkCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Image
        src={link.imageUrl}
        alt={link.description || "Link image"}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 33vw"
      />
      
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-4 text-white">
          <div className="flex items-center gap-1">
            <FiHeart size={20} />
            <span className="text-sm font-semibold">{link.likes.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <FiMessageCircle size={20} />
            <span className="text-sm font-semibold">{link.comments.length}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

