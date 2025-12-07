import { mutate } from "swr";
import { ILink, IComment, IReply } from "@/models/Link";

export interface LinkWithUser extends ILink {
  userInfo?: {
    username?: string;
    user_avatar?: string;
    name?: string;
  } | null;
}

export function optimisticAddComment(
  linkId: string,
  comment: IComment
) {
  mutate(
    "feed-links",
    (links: LinkWithUser[] | undefined) => {
      if (!links) return links;
      return links.map((link) => {
        if (link._id === linkId) {
          return {
            ...link,
            comments: [...(link.comments || []), comment],
          } as LinkWithUser;
        }
        return link;
      });
    },
    { revalidate: false }
  );

  mutate(
    (key: unknown) => typeof key === "string" && key.startsWith("user-links-"),
    (links: ILink[] | undefined) => {
      if (!links) return links;
      return links.map((link) => {
        if (link._id === linkId) {
          return {
            ...link,
            comments: [...(link.comments || []), comment],
          } as ILink;
        }
        return link;
      });
    },
    { revalidate: false }
  );
}

export function optimisticAddReply(
  linkId: string,
  commentId: string,
  reply: IReply
) {
  mutate(
    "feed-links",
    (links: LinkWithUser[] | undefined) => {
      if (!links) return links;
      return links.map((link) => {
        if (link._id === linkId) {
          return {
            ...link,
            comments: (link.comments || []).map((comment) => {
              if (comment._id === commentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), reply],
                };
              }
              return comment;
            }),
          } as LinkWithUser;
        }
        return link;
      });
    },
    { revalidate: false }
  );

  mutate(
    (key: unknown) => typeof key === "string" && key.startsWith("user-links-"),
    (links: ILink[] | undefined) => {
      if (!links) return links;
      return links.map((link) => {
        if (link._id === linkId) {
          return {
            ...link,
            comments: (link.comments || []).map((comment) => {
              if (comment._id === commentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), reply],
                };
              }
              return comment;
            }),
          } as ILink;
        }
        return link;
      });
    },
    { revalidate: false }
  );
}

export function optimisticToggleLike(
  linkId: string,
  userId: string,
  isLiked: boolean
) {
  mutate(
    "feed-links",
    (links: LinkWithUser[] | undefined) => {
      if (!links) return links;
      return links.map((link) => {
        if (link._id === linkId) {
          const likes = link.likes || [];
          const newLikes = isLiked
            ? [...likes, userId]
            : likes.filter((id) => id !== userId);
          return {
            ...link,
            likes: newLikes,
          } as LinkWithUser;
        }
        return link;
      });
    },
    { revalidate: false }
  );

  mutate(
    (key: unknown) => typeof key === "string" && key.startsWith("user-links-"),
    (links: ILink[] | undefined) => {
      if (!links) return links;
      return links.map((link) => {
        if (link._id === linkId) {
          const likes = link.likes || [];
          const newLikes = isLiked
            ? [...likes, userId]
            : likes.filter((id) => id !== userId);
          return {
            ...link,
            likes: newLikes,
          } as ILink;
        }
        return link;
      });
    },
    { revalidate: false }
  );
}

export async function revalidateLinkCaches() {
  mutate(
    "feed-links",
    (current: LinkWithUser[] | undefined) => current,
    { revalidate: false }
  );
}
