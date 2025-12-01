"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { FiHeart, FiMessageCircle, FiBookmark } from "react-icons/fi";
import { ILink } from "@/models/Link";
import { useUsers } from "@/hooks/useUsers";
import FullImageModal from "@/components/links/FullImageModal";
import toast from "react-hot-toast";

interface LinkWithUser extends ILink {
  userInfo?: {
    username?: string;
    user_avatar?: string;
    name?: string;
  } | null;
}

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
  const [isLiking, setIsLiking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingSaved, setIsCheckingSaved] = useState(false);
  const [fullImageModalOpen, setFullImageModalOpen] = useState(false);

  // Fetch saved status from API when component mounts or link changes
  useEffect(() => {
    const fetchSavedStatus = async () => {
      if (!link?._id) return;

      setIsCheckingSaved(true);
      try {
        const res = await fetch(`/api/links/${link._id}/saved-status`);
        if (res.ok) {
          const data = await res.json();
          setIsSaved(data.saved === true);
        } else {
          setIsSaved(false);
        }
      } catch (error) {
        console.error("Error fetching saved status:", error);
        setIsSaved(false);
      } finally {
        setIsCheckingSaved(false);
      }
    };

    fetchSavedStatus();
  }, [link?._id]);

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
    if (isLiking) return;

    setIsLiking(true);
    const previousLiked = isLiked;
    const previousCount = likesCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

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
      onLinkUpdated();
    } catch (error) {
      // Revert optimistic update
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle like"
      );
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving || isCheckingSaved) return;

    const wasSaved = isSaved;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/links/${link._id}/save`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to toggle save");
      }

      // Pessimistic update: only update UI after successful API response
      const savedState = data.saved !== undefined ? data.saved : (data.isSaved !== undefined ? data.isSaved : false);
      setIsSaved(savedState === true);
      
      // Refresh current user to update savedLinks in cache
      await mutateCurrentUser();
      
      // Show toast based on the action that was performed
      if (data.action) {
        toast.success(data.action === 'saved' ? "Link saved!" : "Link unsaved!");
      } else {
        if (wasSaved && !savedState) {
          toast.success("Link unsaved!");
        } else if (!wasSaved && savedState) {
          toast.success("Link saved!");
        }
      }
    } catch (error) {
      // On failure, re-fetch saved status from API to ensure UI matches DB
      try {
        const statusRes = await fetch(`/api/links/${link._id}/saved-status`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setIsSaved(statusData.saved === true);
        }
      } catch (statusError) {
        console.error("Error re-fetching saved status:", statusError);
      }
      
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle save"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getAvatarSrc = () => {
    if (link.userInfo?.user_avatar) return link.userInfo.user_avatar;
    return resolvedTheme === "dark" ? "/dark-profile.png" : "/light-profile.png";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto bg-right-nav-light dark:bg-right-nav-dark rounded-2xl overflow-hidden shadow-lg border border-primary-light/20 dark:border-primary-dark/30 mb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
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
      </div>

      {/* Image */}
      <div 
        className="relative w-full aspect-square bg-gray-200 dark:bg-gray-800 cursor-zoom-in"
        onClick={() => setFullImageModalOpen(true)}
      >
        <Image
          src={link.imageUrl}
          alt={link.description || `Link by ${link.userInfo?.username || "User"}`}
          fill
          unoptimized
          className="object-cover"
          priority={false}
        />
      </div>

      {/* Actions and Description */}
      <div className="p-4 pt-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`text-black dark:text-white hover:opacity-70 transition-opacity ${
                isLiked ? "text-red-500" : ""
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
              className="text-black dark:text-white hover:opacity-70 transition-opacity"
              aria-label="Comment"
            >
              <FiMessageCircle size={24} />
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || isCheckingSaved}
            className={`text-black dark:text-white hover:opacity-70 transition-opacity ${
              isSaved ? "text-violet-600" : ""
            } ${(isSaving || isCheckingSaved) ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="Save Link"
          >
            <FiBookmark size={24} className={isSaved ? "fill-current" : ""} />
          </button>
        </div>

        {/* Likes count */}
        {likesCount > 0 && (
          <div className="mb-2">
            <span className="font-bold text-black dark:text-white text-sm">
              {likesCount} {likesCount === 1 ? "like" : "likes"}
            </span>
          </div>
        )}

        {/* Description */}
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

        {/* Comments count */}
        {link.comments.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCommentClick();
            }}
            className="text-gray-500 dark:text-gray-400 text-sm hover:opacity-70 transition-opacity"
          >
            View all {link.comments.length} {link.comments.length === 1 ? "comment" : "comments"}
          </button>
        )}
      </div>

      {/* Full Image Modal */}
      <FullImageModal
        isOpen={fullImageModalOpen}
        imageUrl={link.imageUrl}
        onClose={() => setFullImageModalOpen(false)}
      />
    </motion.div>
  );
}

