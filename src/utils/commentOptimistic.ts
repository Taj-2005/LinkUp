import { IComment, IReply } from "@/models/Link";

export function createOptimisticComment(
  userId: string,
  username: string,
  userAvatar: string,
  text: string
): IComment {
  return {
    _id: `temp-comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    username,
    user_avatar: userAvatar,
    text: text.trim(),
    replies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as IComment;
}

export function createOptimisticReply(
  userId: string,
  username: string,
  userAvatar: string,
  text: string
): IReply {
  return {
    _id: `temp-reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    username,
    user_avatar: userAvatar,
    text: text.trim(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as IReply;
}

export function addCommentOptimistically(
  comments: IComment[],
  newComment: IComment
): { newComments: IComment[]; rollback: () => IComment[] } {
  const previousComments = [...comments];
  const newComments = [...comments, newComment];

  return {
    newComments,
    rollback: () => previousComments,
  };
}

export function addReplyOptimistically(
  comments: IComment[],
  commentId: string,
  newReply: IReply
): { newComments: IComment[]; rollback: () => IComment[] } {
  const previousComments = comments.map(c => ({ ...c })) as IComment[];
  const newComments = comments.map((comment) => {
    if (comment._id.toString() === commentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply],
      } as unknown as IComment;
    }
    return comment;
  });

  return {
    newComments,
    rollback: () => previousComments,
  };
}

export function replaceTempComment(
  comments: IComment[],
  tempId: string,
  serverComment: IComment
): IComment[] {
  return comments.map((comment) => {
    if (comment._id.toString() === tempId) {
      return serverComment;
    }

    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: comment.replies.map((reply) => {
          if (reply._id.toString() === tempId) {
            return serverComment as unknown as IReply;
          }
          return reply;
        }),
      } as unknown as IComment;
    }
    return comment;
  });
}

export function replaceTempReply(
  comments: IComment[],
  commentId: string,
  tempReplyId: string,
  serverReply: IReply
): IComment[] {
  return comments.map((comment) => {
    if (comment._id.toString() === commentId) {
      return {
        ...comment,
        replies: (comment.replies || []).map((reply) => {
          if (reply._id.toString() === tempReplyId) {
            return serverReply;
          }
          return reply;
        }),
      } as unknown as IComment;
    }
    return comment;
  });
}
