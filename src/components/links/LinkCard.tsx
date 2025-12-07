"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ILink } from "@/models/Link";
import { FiTrash2, FiHeart, FiMessageCircle } from "react-icons/fi";
import { useUsers } from "@/hooks/useUsers";
import DeletePostModal from "@/components/DeletePostModal";
import { mutate } from "swr";
import toast from "react-hot-toast";
import { optimisticDeleteLink } from "@/utils/linkInteractions";

interface LinkCardProps {
  link: ILink;
  onClick: () => void;
  onLinkDeleted?: () => void;
}

export default function LinkCard({ link, onClick, onLinkDeleted }: LinkCardProps) {
  const { currentUser, mutateCurrentUser } = useUsers();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isOwner = currentUser?._id?.toString() === link.userId;

  const handleDelete = async () => {
    if (!currentUser || isDeleting) return;

    const linkId = link._id.toString();
    const userId = currentUser._id.toString();

    setShowDeleteModal(false);
    setIsDeleting(true);

    // Show success toast immediately (UI-first approach)
    toast.success("Link deleted successfully", { id: "delete-post" });

    // Optimistically remove from all caches
    const { rollback } = optimisticDeleteLink(linkId, userId, mutateCurrentUser);

    // Also update user-links cache for the owner
    if (link.userId) {
      mutate(
        `user-links-${link.userId}`,
        (links: ILink[] | undefined) => {
          if (!links) return links;
          return links.filter((l) => l._id.toString() !== linkId);
        },
        { revalidate: false }
      );
    }

    // Call onLinkDeleted immediately for UI updates
    if (onLinkDeleted) {
      onLinkDeleted();
    }

    // Send delete request to backend (fire and forget for UI, but handle errors)
    try {
      const res = await fetch(`/api/links/${linkId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete post");
      }

      // Backend succeeded - no need to revalidate, optimistic update is already done
      // Socket event will handle real-time updates for other users
    } catch (error) {
      // Rollback on error
      rollback();

      toast.error(
        error instanceof Error ? error.message : "Failed to delete post",
        { id: "delete-post" }
      );
    } finally {
      setIsDeleting(false);
    }
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
        src={link.imageUrl}
        alt={link.description || "Link image"}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 33vw"
      />

      {isOwner && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteModal(true);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={isDeleting}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute top-2 right-2 z-20 w-9 h-9 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-gradient-to-r hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed group pointer-events-auto"
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
      {showDeleteModal && (
        <DeletePostModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </motion.div>
  );
}
