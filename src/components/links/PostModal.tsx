"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiHeart, FiMessageCircle, FiMapPin, FiBookmark } from "react-icons/fi";
import Image from "next/image";
import { ILink } from "@/models/Link";
import { useUsers } from "@/hooks/useUsers";
import { useModalStore } from "@/store/useModalStore";
import CommentSection from "./CommentSection";
import FullImageModal from "./FullImageModal";
import { optimisticToggleLike, revalidateLinkCaches } from "@/utils/linkInteractions";
import { scrollToComment, scrollToReply } from "@/utils/deepLinks";
import { isLinkSaved, optimisticToggleSaved } from "@/utils/savedLinks";
import toast from "react-hot-toast";

interface LinkWithUser extends ILink {
  userInfo?: {
    username?: string;
    user_avatar?: string;
    name?: string;
  } | null;
}

interface PostModalProps {
  isOpen: boolean;
  link: ILink | LinkWithUser | null;
  onClose: () => void;
  onLinkUpdated: () => void;
  deepLinkCommentId?: string;
  deepLinkReplyId?: string;
}

export default function PostModal({
  isOpen,
  link,
  onClose,
  onLinkUpdated,
  deepLinkCommentId,
  deepLinkReplyId,
}: PostModalProps) {
  const { currentUser, mutateCurrentUser } = useUsers();
  const setIsModalOpen = useModalStore((state) => state.setIsModalOpen);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [linkData, setLinkData] = useState<LinkWithUser | null>(link as LinkWithUser | null);
  const [isLiking, setIsLiking] = useState(false);
  const [fullImageModalOpen, setFullImageModalOpen] = useState(false);
  const [showCommentsModalMobile, setShowCommentsModalMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isSaved = isLinkSaved(currentUser, linkData?._id || "");

  useEffect(() => {
    if (link) {
      setLinkData(link as LinkWithUser);
      const userId = currentUser?._id?.toString();
      setIsLiked(userId ? link.likes.includes(userId) : false);
      setLikesCount(link.likes.length);
    }
  }, [link, currentUser]);

  useEffect(() => {
    if (isOpen && linkData && (deepLinkCommentId || deepLinkReplyId)) {

      const timeoutId = setTimeout(() => {

        requestAnimationFrame(() => {
          let scrolled = false;

          if (deepLinkReplyId) {

            scrolled = scrollToReply(deepLinkReplyId);
            if (!scrolled && deepLinkCommentId) {

              scrolled = scrollToComment(deepLinkCommentId);
            }
          } else if (deepLinkCommentId) {
            scrolled = scrollToComment(deepLinkCommentId);
          }

          if (!scrolled) {
            const commentSection = document.querySelector('[data-comment-section]') as HTMLElement;
            if (commentSection) {
              commentSection.scrollTo({ top: 0, behavior: "smooth" });
            }
          }
        });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, linkData, deepLinkCommentId, deepLinkReplyId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsModalOpen(true);
    } else {
      document.body.style.overflow = "";
      setIsModalOpen(false);
      setShowCommentsModalMobile(false);
    }
    return () => {
      document.body.style.overflow = "";
      setIsModalOpen(false);
      setShowCommentsModalMobile(false);
    };
  }, [isOpen, setIsModalOpen]);

  const handleLike = async () => {
    if (!linkData || isLiking || !currentUser) return;

    setIsLiking(true);
    const previousLiked = isLiked;
    const previousCount = likesCount;
    const userId = currentUser._id.toString();

    const newLiked = !isLiked;

    requestAnimationFrame(() => {
      setIsLiked(newLiked);
      setLikesCount(newLiked ? likesCount + 1 : likesCount - 1);

      optimisticToggleLike(linkData._id, userId, newLiked);
      onLinkUpdated();
    });

    try {
      const res = await fetch(`/api/links/${linkData._id}/like`, {
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
      optimisticToggleLike(linkData._id, userId, previousLiked);

      await revalidateLinkCaches();

      toast.error(
        error instanceof Error ? error.message : "Failed to toggle like"
      );
    } finally {
      setIsLiking(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!linkData || isSaving || !currentUser) return;

    const previousSaved = isSaved;
    setIsSaving(true);

    const { rollback } = optimisticToggleSaved(
      mutateCurrentUser,
      linkData._id,
      previousSaved
    );

    try {
      const res = await fetch(`/api/links/${linkData._id}/save`, {
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
    } finally {
      setIsSaving(false);
    }
  };

  const refreshLinkData = async () => {
    if (!linkData?._id) return;

    try {

      const res = await fetch(`/api/links/user/${linkData.userId}`);
      const data = await res.json();

      if (res.ok && data.links) {
        const updatedLink = data.links.find(
          (l: LinkWithUser) => l._id.toString() === linkData._id.toString()
        );
        if (updatedLink) {
          setLinkData(updatedLink);
          const userId = currentUser?._id?.toString();
          setIsLiked(userId ? updatedLink.likes.includes(userId) : false);
          setLikesCount(updatedLink.likes.length);
        }
      }
    } catch {
    }
  };

  const handleCommentAdded = async () => {
    await refreshLinkData();
    onLinkUpdated();
  };

  const handleReplyAdded = async () => {
    await refreshLinkData();
    onLinkUpdated();
  };

  const handleImageClick = () => {
    setFullImageModalOpen(true);
  };

  if (!linkData) return null;

  const getAvatarSrc = (userAvatar?: string) => {
    if (userAvatar) return userAvatar;
    return "/dark-profile.png";
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-none md:rounded-2xl w-full h-full md:h-[90vh] md:max-w-7xl overflow-hidden flex flex-col md:flex-row"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: '100vh' }}
            >
              {}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 md:top-4 md:right-4 z-10 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-lg p-2 hover:bg-white dark:hover:bg-gray-800 transition-colors"
              >
                <FiX size={20} className="text-gray-800 dark:text-gray-100" />
              </button>

              {}
              <div className="relative w-full md:w-1/2 h-[50vh] md:h-auto bg-black flex items-center justify-center flex-shrink-0">
                <div
                  className="relative w-full h-full cursor-zoom-in"
                  onClick={handleImageClick}
                >
                  <Image
                    src={linkData.imageUrl}
                    alt={linkData.description || "Post image"}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                </div>
              </div>

              {}
              <div className="w-full md:w-1/2 flex flex-col bg-right-nav-light dark:bg-left-nav-dark h-full overflow-y-auto">
                {}
                <div className="p-4 md:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 z-10 bg-right-nav-light dark:bg-left-nav-dark">
                  <div className="flex items-center justify-between gap-2 md:gap-3 bg-right-nav-light dark:bg-left-nav-dark">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700">
                        <Image
                          src={getAvatarSrc(linkData.userInfo?.user_avatar)}
                          alt={linkData.userInfo?.username || "User"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base md:text-base text-primary-dark dark:text-white">
                          {linkData.userInfo?.username || "Unknown User"}
                        </p>
                        {linkData.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <FiMapPin size={12} />
                            <span className="truncate">{linkData.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {}
                    <div className="flex items-center gap-2 md:hidden flex-shrink-0 ">
                      <button
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors ${
                          isLiked
                            ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                            : "text-primary-dark dark:text-primary-light bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <FiHeart
                          size={18}
                          className={isLiked ? "fill-current" : ""}
                        />
                        <span className="text-xs font-semibold">{likesCount}</span>
                      </button>
                      <button
                        onClick={() => setShowCommentsModalMobile(true)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-primary-dark dark:text-primary-light bg-gray-100 dark:bg-gray-800 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <FiMessageCircle size={18} />
                        <span className="text-xs font-semibold">
                          {linkData.comments.length}
                        </span>
                      </button>
                    <button
                      onClick={handleSaveToggle}
                      disabled={isSaving}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors ${
                        isSaved
                          ? "text-violet-600 bg-gradient-to-r from-violet-50 via-purple-50 to-pink-50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-pink-900/20"
                          : "text-primary-dark dark:text-primary-light bg-gray-100 dark:bg-gray-800"
                      } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <FiBookmark
                        size={18}
                        className={isSaved ? "fill-current" : ""}
                      />
                    </button>
                    </div>
                  </div>
                </div>

                {}
                {linkData.description && (
                  <div className="px-4 py-3 md:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 z-10  bg-right-nav-light dark:bg-left-nav-dark">
                    <p className="text-sm md:text-base text-primary-dark dark:text-white break-words leading-relaxed">
                      {linkData.description}
                    </p>
                  </div>
                )}

                {}
                {!linkData.description && (
                  <div className="px-4 py-6 md:hidden  bg-right-nav-light dark:bg-left-nav-dark">
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Tap the comment icon to view comments
                      </p>
                    </div>
                  </div>
                )}

                {}
                <div className="hidden md:flex p-4 border-t border-gray-200 dark:border-gray-700 space-y-3 flex-shrink-0 z-10 bg-right-nav-light dark:bg-left-nav-dark">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleLike}
                      disabled={isLiking}
                      className={`flex items-center gap-2 transition-colors ${
                        isLiked
                          ? "text-red-500"
                          : "text-primary-dark dark:text-primary-light"
                      }`}
                    >
                      <FiHeart
                        size={24}
                        className={isLiked ? "fill-current" : ""}
                      />
                      <span className="text-sm font-semibold">{likesCount}</span>
                    </button>
                    <div className="flex items-center gap-2 text-primary-dark dark:text-primary-light">
                      <FiMessageCircle size={24} />
                      <span className="text-sm font-semibold">
                        {linkData.comments.length}
                      </span>
                    </div>
                    <button
                      onClick={handleSaveToggle}
                      disabled={isSaving}
                      className={`flex items-center gap-2 transition-colors ml-auto ${
                        isSaved
                          ? "text-violet-600 hover:text-purple-600"
                          : "text-primary-dark dark:text-primary-light hover:text-violet-500"
                      } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <FiBookmark
                        size={24}
                        className={isSaved ? "fill-current" : ""}
                      />
                    </button>
                  </div>
                </div>

                {}
                <div className="hidden md:flex flex-1 overflow-hidden relative bg-right-nav-light dark:bg-left-nav-dark" style={{ minHeight: 0 }}>
                  <CommentSection
                    linkId={linkData._id.toString()}
                    comments={linkData.comments || []}
                    onCommentAdded={handleCommentAdded}
                    onReplyAdded={handleReplyAdded}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      {linkData && (
        <FullImageModal
          isOpen={fullImageModalOpen}
          imageUrl={linkData.imageUrl}
          onClose={() => setFullImageModalOpen(false)}
        />
      )}

      {}
      <AnimatePresence>
        {showCommentsModalMobile && linkData && (
          <motion.div
            className="fixed inset-0 z-[60] bg-right-nav-light dark:bg-left-nav-dark md:hidden"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary-dark dark:text-primary-light">
                Comments ({linkData.comments.length})
              </h2>
              <button
                onClick={() => setShowCommentsModalMobile(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FiX size={24} className="text-primary-dark dark:text-primary-light" />
              </button>
            </div>

            {}
            <div className="h-[calc(100vh-73px)] overflow-hidden relative">
              <CommentSection
                linkId={linkData._id.toString()}
                comments={linkData.comments || []}
                onCommentAdded={handleCommentAdded}
                onReplyAdded={handleReplyAdded}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
