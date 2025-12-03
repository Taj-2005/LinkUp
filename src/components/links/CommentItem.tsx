"use client";

import React, { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend } from "react-icons/fi";
import Image from "next/image";
import { IComment, IReply } from "@/models/Link";
import { useUsers } from "@/hooks/useUsers";

interface CommentItemProps {
  comment: IComment;
  replyingTo: string | null;
  submittingReply: string | null;
  replyText: string;
  onReplyClick: (commentId: string) => void;
  onReplyTextChange: (text: string) => void;
  onReplySubmit: (commentId: string) => void;
  getAvatarSrc: (userAvatar?: string) => string;
}

const CommentItem = memo<CommentItemProps>(({
  comment,
  replyingTo,
  submittingReply,
  replyText,
  onReplyClick,
  onReplyTextChange,
  onReplySubmit,
  getAvatarSrc,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
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
            onClick={() => onReplyClick(comment._id.toString())}
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
        <ReplyInput
          replyText={replyText}
          onReplyTextChange={onReplyTextChange}
          onSubmit={() => onReplySubmit(comment._id.toString())}
          isSubmitting={submittingReply === comment._id.toString()}
          getAvatarSrc={getAvatarSrc}
        />
      )}
    </motion.div>
  );
}, (prevProps, nextProps) => {

  return (
    prevProps.comment._id.toString() === nextProps.comment._id.toString() &&
    prevProps.comment.text === nextProps.comment.text &&
    prevProps.comment.replies?.length === nextProps.comment.replies?.length &&
    prevProps.replyingTo === nextProps.replyingTo &&
    prevProps.submittingReply === nextProps.submittingReply &&
    prevProps.replyText === nextProps.replyText
  );
});

CommentItem.displayName = "CommentItem";

interface ReplyInputProps {
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  getAvatarSrc: (userAvatar?: string) => string;
}

const ReplyInput = memo<ReplyInputProps>(({
  replyText,
  onReplyTextChange,
  onSubmit,
  isSubmitting,
  getAvatarSrc,
}) => {
  const { currentUser } = useUsers();

  return (
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
          onSubmit();
        }}
        className="flex-1 flex gap-2"
      >
        <input
          type="text"
          value={replyText}
          onChange={(e) => onReplyTextChange(e.target.value)}
          placeholder="Add a reply..."
          maxLength={500}
          className="flex-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-primary-dark dark:text-primary-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          autoFocus
        />
        <button
          type="submit"
          disabled={!replyText.trim() || isSubmitting}
          className="p-1.5 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 transition-all"
        >
          <FiSend size={14} />
        </button>
      </form>
    </motion.div>
  );
});

ReplyInput.displayName = "ReplyInput";

export default CommentItem;
