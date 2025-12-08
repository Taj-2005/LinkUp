"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { ILink } from "@/models/Link";
import { FiTrash2, FiHeart, FiMessageCircle } from "react-icons/fi";
import { useUsers } from "@/hooks/useUsers";
import DeleteModal from "@/components/DeleteModal";
import { deleteLinkHandler } from "@/utils/deleteLinkHandler";
import { isValidImageUrl, getPlaceholderImageUrl } from "@/utils/linkCacheMutations";

interface LinkCardProps {
  link: ILink;
  onClick: () => void;
  onLinkDeleted?: () => void;
}

export default function LinkCard({ link, onClick, onLinkDeleted }: LinkCardProps) {
  const { currentUser, mutateCurrentUser } = useUsers();
  const { resolvedTheme } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isOwner = currentUser?._id?.toString() === link.userId;
  
  const imageUrl = isValidImageUrl(link.imageUrl) 
    ? link.imageUrl! 
    : getPlaceholderImageUrl(resolvedTheme === "dark");

  const handleDelete = async () => {
    if (!currentUser) return;

    const linkId = link._id.toString();
    const userId = currentUser._id.toString();
    
    setShowDeleteModal(false);

    await deleteLinkHandler({
      linkId,
      userId,
      linkUserId: link.userId,
      mutateCurrentUser,
      onLinkDeleted,
    });
  };

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Image
        src={imageUrl}
        alt={link.description || "Link image"}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 33vw"
        unoptimized={imageUrl.startsWith("data:")}
      />

      {isOwner && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteModal(true);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute top-2 right-2 z-20 w-9 h-9 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-gradient-to-r hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 group pointer-events-auto"
          aria-label="Delete post"
        >
          <FiTrash2 
            size={16} 
            className="text-gray-800 dark:text-gray-100 group-hover:text-white transition-transform rotate-180 group-hover:rotate-0" 
          />
        </motion.button>
      )}  
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center pointer-events-none">
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
      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </motion.div>
  );
}
