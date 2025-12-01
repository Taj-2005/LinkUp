"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend } from "react-icons/fi";
import Image from "next/image";
import { IComment, IReply } from "@/models/Link";
import { useUsers } from "@/hooks/useUsers";
import toast from "react-hot-toast";

interface CommentSectionProps {
  linkId: string;
  comments: IComment[];
  onCommentAdded: () => void;
  onReplyAdded: () => void;
}

export default function CommentSection({
  linkId,
  comments,
  onCommentAdded,
  onReplyAdded,
}: CommentSectionProps) {
  const { currentUser } = useUsers();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/links/${linkId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add comment");
      }

      setNewComment("");
      onCommentAdded();
      toast.success("Comment added!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add comment"
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyText.trim() || submittingReply) return;

    setSubmittingReply(commentId);
    try {
      const res = await fetch(
        `/api/links/${linkId}/comment/${commentId}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: replyText.trim() }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add reply");
      }

      setReplyText("");
      setReplyingTo(null);
      onReplyAdded();
      toast.success("Reply added!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add reply"
      );
    } finally {
      setSubmittingReply(null);
    }
  };

  const getAvatarSrc = (userAvatar?: string) => {
    if (userAvatar) return userAvatar;
    return "/dark-profile.png";
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 overscroll-contain hide-scrollbar min-h-0">
        {comments.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <motion.div
              key={comment._id.toString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              {/* Comment */}
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

              {/* Replies */}
              <AnimatePresence>
                {comment.replies && comment.replies.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-11 space-y-2"
                  >
                    {comment.replies.map((reply: IReply) => (
                      <div key={reply._id.toString()} className="flex gap-3">
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

              {/* Reply Input */}
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

      {/* Add Comment Input */}
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

