"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend } from "react-icons/fi";
import Image from "next/image";
import { IComment, IReply } from "@/models/Link";
import { useUsers } from "@/hooks/useUsers";
import { optimisticAddComment, optimisticAddReply, revalidateLinkCaches } from "@/utils/linkInteractions";
import {
  createOptimisticComment,
  createOptimisticReply,
  addCommentOptimistically,
  addReplyOptimistically,
  replaceTempComment,
  replaceTempReply,
} from "@/utils/commentOptimistic";
import CommentItem from "./CommentItem";
import toast from "react-hot-toast";

interface CommentSectionProps {
  linkId: string;
  comments: IComment[];
  onCommentAdded: () => void;
  onReplyAdded: () => void;
}

export default function CommentSection({
  linkId,
  comments: propsComments,
  onCommentAdded,
  onReplyAdded,
}: CommentSectionProps) {
  const { currentUser } = useUsers();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const scrollToCommentRef = useRef<string | null>(null);
  const lastScrollHeightRef = useRef<number>(0);

  const [localComments, setLocalComments] = useState<IComment[]>(propsComments);
  const rollbackRef = useRef<(() => IComment[]) | null>(null);

  const prevPropsLengthRef = useRef(propsComments.length);
  useEffect(() => {
    if (rollbackRef.current === null && prevPropsLengthRef.current !== propsComments.length) {

      setLocalComments(propsComments);
      prevPropsLengthRef.current = propsComments.length;
    }
  }, [propsComments.length, propsComments]);

  const comments = useMemo(() => localComments, [localComments]);

  const scrollToLatest = React.useCallback(() => {
    if (!commentsContainerRef.current) return;

    const container = commentsContainerRef.current;
    const targetId = scrollToCommentRef.current;

    if (!targetId) {

      requestAnimationFrame(() => {
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
      });
      return;
    }

    const attemptScroll = (retries = 3) => {
      if (retries === 0) {

        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
        scrollToCommentRef.current = null;
        return;
      }

      const element = container.querySelector(
        `[data-comment-id="${targetId}"], [data-reply-id="${targetId}"]`
      ) as HTMLElement;

      if (element) {

        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const scrollTop = container.scrollTop +
          (elementRect.top - containerRect.top) -
          (containerRect.height / 2) +
          (elementRect.height / 2);

        container.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: "smooth",
        });

        element.classList.add("comment-highlight");
        setTimeout(() => {
          element.classList.remove("comment-highlight");
        }, 2000);

        scrollToCommentRef.current = null;
      } else {

        setTimeout(() => attemptScroll(retries - 1), 50);
      }
    };

    requestAnimationFrame(() => {
      attemptScroll();
    });
  }, []);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment || !currentUser) return;

    const text = newComment.trim();
    setNewComment("");

    const optimisticComment = createOptimisticComment(
      currentUser._id,
      currentUser.username || "Unknown",
      currentUser.user_avatar || "",
      text
    );

    setLocalComments((prevComments) => {
      const { newComments, rollback } = addCommentOptimistically(prevComments, optimisticComment);
      rollbackRef.current = rollback;
      return newComments;
    });

    scrollToCommentRef.current = optimisticComment._id;

    optimisticAddComment(linkId, optimisticComment);
    onCommentAdded();

    requestAnimationFrame(() => {
      scrollToLatest();
    });

    setSubmittingComment(true);

    try {
      const res = await fetch(`/api/links/${linkId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add comment");
      }

      if (data.comment) {
        const serverComment: IComment = {
          _id: data.comment._id,
          userId: data.comment.userId,
          username: data.comment.username,
          user_avatar: data.comment.user_avatar,
          text: data.comment.text,
          replies: data.comment.replies || [],
          createdAt: new Date(data.comment.createdAt),
          updatedAt: new Date(data.comment.updatedAt),
        } as IComment;

        setLocalComments((prev) => replaceTempComment(prev, optimisticComment._id, serverComment));
        scrollToCommentRef.current = serverComment._id.toString();

        requestAnimationFrame(() => {
          scrollToLatest();
        });
      }

      await revalidateLinkCaches();
      rollbackRef.current = null;
    } catch (error) {

      if (rollbackRef.current) {
        setLocalComments(rollbackRef.current());
        rollbackRef.current = null;
      }

      await revalidateLinkCaches();

      toast.error(
        error instanceof Error ? error.message : "Failed to add comment"
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyText.trim() || submittingReply || !currentUser) return;

    const text = replyText.trim();
    
    const optimisticReply = createOptimisticReply(
      currentUser._id,
      currentUser.username || "Unknown",
      currentUser.user_avatar || "",
      text
    );

    setReplyText("");
    setReplyingTo(null);

    setLocalComments((prevComments) => {
      const { newComments, rollback } = addReplyOptimistically(prevComments, commentId, optimisticReply);
      rollbackRef.current = rollback;
      return newComments;
    });

    scrollToCommentRef.current = optimisticReply._id;

    optimisticAddReply(linkId, commentId, optimisticReply);
    onReplyAdded();

    requestAnimationFrame(() => {
      scrollToLatest();
    });

    setSubmittingReply(commentId);

    try {
      const res = await fetch(
        `/api/links/${linkId}/comment/${commentId}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add reply");
      }

      if (data.reply) {
        const serverReply: IReply = {
          _id: data.reply._id,
          userId: data.reply.userId,
          username: data.reply.username,
          user_avatar: data.reply.user_avatar,
          text: data.reply.text,
          createdAt: new Date(data.reply.createdAt),
          updatedAt: new Date(data.reply.updatedAt),
        } as IReply;

        setLocalComments((prev) => replaceTempReply(prev, commentId, optimisticReply._id, serverReply));
        scrollToCommentRef.current = serverReply._id.toString();

        requestAnimationFrame(() => {
          scrollToLatest();
        });
      }

      await revalidateLinkCaches();
      rollbackRef.current = null;
    } catch (error) {

      if (rollbackRef.current) {
        setLocalComments(rollbackRef.current());
        rollbackRef.current = null;
      }

      await revalidateLinkCaches();

      toast.error(
        error instanceof Error ? error.message : "Failed to add reply"
      );
    } finally {
      setSubmittingReply(null);
    }
  };

  const getAvatarSrc = useCallback((userAvatar?: string) => {
    if (userAvatar) return userAvatar;
    return "/dark-profile.png";
  }, []);

  const handleReplyClick = useCallback((commentId: string) => {
    setReplyingTo((prev) => prev === commentId ? null : commentId);
  }, []);

  const handleReplyTextChange = useCallback((text: string) => {
    setReplyText(text);
  }, []);

  const handleReplySubmit = useCallback((commentId: string) => {
    handleAddReply(commentId);
  }, []);

  useEffect(() => {
    if (scrollToCommentRef.current && commentsContainerRef.current) {

      requestAnimationFrame(() => {
        scrollToLatest();
      });
    }
  }, [comments.length, scrollToLatest]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {}
      <div
        ref={commentsContainerRef}
        data-comment-section
        className="flex-1 overflow-y-auto space-y-4 p-4 overscroll-contain hide-scrollbar min-h-0"
      >
        {comments.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment, index) => (
            <motion.div
              key={comment._id.toString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
              className="space-y-2"
              data-comment-id={comment._id.toString()}
            >
              {}
              <div className="flex gap-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={getAvatarSrc(comment.user_avatar)}
                    alt={comment.username}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className=" bg-right-nav-light dark:bg-right-nav-dark rounded-2xl px-4 py-2">
                    <p className="font-semibold text-sm text-primary-dark dark:text-primary-light">
                      {comment.username}
                    </p>
                    <p className="text-sm text-primary-dark dark:text-white mt-1 break-words">
                      {comment.text}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment._id.toString() ? null : comment._id.toString()
                      )
                    }
                    className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-4 hover:text-violet-500 transition-colors"
                  >
                    {replyingTo === comment._id.toString() ? "Cancel" : "Reply"}
                  </button>
                </div>
              </div>

              {}
              <AnimatePresence>
                {comment.replies && comment.replies.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-11 space-y-2"
                  >
                    {comment.replies.map((reply: IReply) => (
                      <div key={reply._id.toString()} className="flex gap-3" data-reply-id={reply._id.toString()}>
                        <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={getAvatarSrc(reply.user_avatar)}
                            alt={reply.username}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="rounded-2xl px-3 py-2 bg-right-nav-light dark:bg-right-nav-dark">
                            <p className="font-semibold text-xs text-primary-dark dark:text-primary-light">
                              {reply.username}
                            </p>
                            <p className="text-xs text-primary-dark dark:text-white mt-1 break-words">
                              {reply.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {}
              {replyingTo === comment._id.toString() && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-11 flex gap-2 mt-2"
                >
                  <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={getAvatarSrc(currentUser?.user_avatar)}
                      alt={currentUser?.username || "You"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddReply(comment._id.toString());
                    }}
                    className="flex-1 flex gap-2"
                  >
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Add a reply..."
                      maxLength={500}
                      className="flex-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-primary-dark dark:text-primary-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim() || submittingReply === comment._id.toString()}
                      className="p-1.5 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 transition-all"
                    >
                      <FiSend size={14} />
                    </button>
                  </form>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 md:p-4 flex-shrink-0  bg-right-nav-light dark:bg-left-nav-dark z-10">
        <form onSubmit={handleAddComment} className="flex gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={getAvatarSrc(currentUser?.user_avatar)}
              alt={currentUser?.username || "You"}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            maxLength={500}
            className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-right-nav-dark text-sm text-primary-dark dark:text-primary-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submittingComment}
            className="p-2 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 transition-all"
          >
            <FiSend size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
