"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { FiHeart, FiMessageCircle, FiBookmark, FiTrash2 } from "react-icons/fi";
import { ILink } from "@/models/Link";
import { useUsers } from "@/hooks/useUsers";
import { optimisticToggleLike, revalidateLinkCaches } from "@/utils/linkInteractions";
import { isLinkSaved, optimisticToggleSaved } from "@/utils/savedLinks";
import FullImageModal from "@/components/links/FullImageModal";
import DeleteModal from "@/components/DeleteModal";
import { deleteLinkHandler } from "@/utils/deleteLinkHandler";
import { isValidImageUrl, getPlaceholderImageUrl } from "@/utils/linkCacheMutations";
import toast from "react-hot-toast";

interface LinkWithUser extends ILink {
  userInfo?: {
    username?: string;
    user_avatar?: string;
    name?: string;
  } | null;
}

interface LinkCardProps {
  link: LinkWithUser;
  onCommentClick: () => void;
  onLinkUpdated: () => void;
}

export default function LinkCard({ link, onCommentClick, onLinkUpdated }: LinkCardProps) {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const { currentUser, mutateCurrentUser } = useUsers();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(link.likes.length);
  const [fullImageModalOpen, setFullImageModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isSaved = isLinkSaved(currentUser, link._id);

  useEffect(() => {
    const userId = currentUser?._id?.toString();
    setIsLiked(userId ? link.likes.includes(userId) : false);
    setLikesCount(link.likes.length);
  }, [link, currentUser]);

  const handleUserClick = () => {
    if (link.userInfo?.username) {
      router.push(`/linkhub/${link.userInfo.username}`);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    const previousLiked = isLiked;
    const previousCount = likesCount;
    const userId = currentUser._id.toString();
    const newLiked = !isLiked;

    requestAnimationFrame(() => {
      setIsLiked(newLiked);
      setLikesCount(newLiked ? likesCount + 1 : likesCount - 1);

      optimisticToggleLike(link._id, userId, newLiked);
      onLinkUpdated();
    });

    try {
      const res = await fetch(`/api/links/${link._id}/like`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to toggle like");
      }

      setIsLiked(data.isLiked);
      setLikesCount(data.likesCount);

      await revalidateLinkCaches();
    } catch (error) {
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      optimisticToggleLike(link._id, userId, previousLiked);

      await revalidateLinkCaches();

      toast.error(
        error instanceof Error ? error.message : "Failed to toggle like"
      );
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;

    const previousSaved = isSaved;
    const { rollback } = optimisticToggleSaved(
      mutateCurrentUser,
      link._id,
      previousSaved
    );

    try {
      const res = await fetch(`/api/links/${link._id}/save`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to toggle save");
      }

      await mutateCurrentUser();
    } catch (error) {
      rollback();

      toast.error(
        error instanceof Error ? error.message : "Failed to toggle save"
      );
    }
  };

  const getAvatarSrc = () => {
    if (link.userInfo?.user_avatar) return link.userInfo.user_avatar;
    return resolvedTheme === "dark" ? "/dark-profile.png" : "/light-profile.png";
  };

  const imageUrl = isValidImageUrl(link.imageUrl)
    ? link.imageUrl!
    : getPlaceholderImageUrl(resolvedTheme === "dark");

  const isOwner = currentUser?._id?.toString() === link.userId;

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
      onLinkDeleted: onLinkUpdated,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto bg-right-nav-light dark:bg-right-nav-dark rounded-2xl overflow-hidden shadow-lg border border-primary-light/20 dark:border-primary-dark/30 mb-6"
    >
      <div className="flex items-center gap-3 p-4 pb-3 relative">
        <div
          onClick={handleUserClick}
          className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Image
            src={getAvatarSrc()}
            fill
            unoptimized
            alt={`${link.userInfo?.username || "User"} avatar`}
            className="object-cover"
          />
        </div>
        <div
          onClick={handleUserClick}
          className="flex flex-col flex-1 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
        >
          <div className="font-bold text-black dark:text-white text-sm md:text-base truncate">
            {link.userInfo?.username || "Unknown User"}
          </div>
          {link.location && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              📍 {link.location}
            </div>
          )}
        </div>
        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            aria-label="Delete post"
          >
            <FiTrash2
              size={16}
              className="text-gray-600 dark:text-gray-400 group-hover:text-white transition-transform group-hover:rotate-90"
            />
          </button>
        )}
      </div>

      <div
        className="relative w-full aspect-square bg-gray-200 dark:bg-gray-800 cursor-zoom-in"
        onClick={() => setFullImageModalOpen(true)}
      >
        <Image
          src={imageUrl}
          alt={link.description || `Link by ${link.userInfo?.username || "User"}`}
          fill
          unoptimized={imageUrl.startsWith("data:")}
          className="object-cover"
          priority={false}
        />
      </div>

      <div className="p-4 pt-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`text-black dark:text-white hover:opacity-70 transition-opacity cursor-pointer ${isLiked ? "text-red-500" : ""
                }`}
              aria-label="Like"
            >
              <FiHeart size={24} className={isLiked ? "fill-current" : ""} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCommentClick();
              }}
              className="text-black dark:text-white hover:opacity-70 transition-opacity cursor-pointer"
              aria-label="Comment"
            >
              <FiMessageCircle size={24} />
            </button>
          </div>
          <button
            onClick={handleSave}
            className={`text-black dark:text-white hover:opacity-70 transition-opacity cursor-pointer ${isSaved ? "text-violet-600" : ""
              }`}
            aria-label="Save Link"
          >
            <FiBookmark size={24} className={isSaved ? "fill-current" : ""} />
          </button>
        </div>

        {likesCount > 0 && (
          <div className="mb-2">
            <span className="font-bold text-black dark:text-white text-sm">
              {likesCount} {likesCount === 1 ? "like" : "likes"}
            </span>
          </div>
        )}

        {link.description && (
          <div className="space-y-1 mb-2">
            <div className="flex flex-col items-start gap-2 text-sm">
              <span className="font-bold text-black dark:text-white">
                {link.userInfo?.username || "Unknown User"}
              </span>
              <span className="text-black dark:text-white break-words">
                {link.description}
              </span>
            </div>
          </div>
        )}

        {link.comments.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCommentClick();
            }}
            className="text-gray-500 dark:text-gray-400 text-sm hover:opacity-70 transition-opacity cursor-pointer"
          >
            View all {link.comments.length} {link.comments.length === 1 ? "comment" : "comments"}
          </button>
        )}
      </div>

      <FullImageModal
        isOpen={fullImageModalOpen}
        imageUrl={link.imageUrl}
        onClose={() => setFullImageModalOpen(false)}
      />
      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </motion.div>
  );
}
