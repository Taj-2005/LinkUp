import { mutate } from "swr";
import { ILink, IComment, IReply } from "@/models/Link";
import { IUser } from "@/models/User";

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

/**
 * Optimistically removes a link from all caches
 * Returns a rollback function to restore previous state
 */
type MutateCurrentUser = (
  data?: { user: IUser } | ((data: { user: IUser } | undefined) => { user: IUser } | undefined),
  shouldRevalidate?: boolean
) => Promise<{ user: IUser } | undefined>;

export function optimisticDeleteLink(
  linkId: string,
  userId?: string,
  mutateCurrentUser?: MutateCurrentUser
): {
  rollback: () => void;
} {
  // Capture previous states for rollback
  const previousStates: {
    feedLinks?: LinkWithUser[];
    userLinks?: { [key: string]: ILink[] };
    currentUser?: { user: IUser };
    savedLinks?: LinkWithUser[];
  } = {};

  // Update feed-links - capture state in the updater
  mutate(
    "feed-links",
    (links: LinkWithUser[] | undefined) => {
      if (links) {
        previousStates.feedLinks = [...links];
        return links.filter((link) => link._id.toString() !== linkId.toString());
      }
      return links;
    },
    { revalidate: false }
  );

  // Update saved-links - capture state in the updater
  mutate(
    "saved-links",
    (links: LinkWithUser[] | undefined) => {
      if (links) {
        previousStates.savedLinks = [...links];
        return links.filter((link) => link._id.toString() !== linkId.toString());
      }
      return links;
    },
    { revalidate: false }
  );

  // Update all user-links caches
  mutate(
    (key: unknown) => typeof key === "string" && key.startsWith("user-links-"),
    (links: ILink[] | undefined) => {
      if (links) {
        return links.filter((link) => link._id.toString() !== linkId.toString());
      }
      return links;
    },
    { revalidate: false }
  );

  // Update current user's links array if mutateCurrentUser is provided
  if (mutateCurrentUser && userId) {
    mutateCurrentUser(
      (data: { user: IUser } | undefined) => {
        if (data?.user) {
          previousStates.currentUser = { ...data };
          const updatedLinks = (data.user.links || []).filter(
            (id: string) => id.toString() !== linkId.toString()
          );
          return { 
            ...data, 
            user: { 
              ...data.user, 
              links: updatedLinks 
            } as IUser 
          };
        }
        return data;
      },
      false
    );
  }

  // Rollback function
  const rollback = () => {
    if (previousStates.feedLinks) {
      mutate("feed-links", previousStates.feedLinks, { revalidate: false });
    }
    if (previousStates.savedLinks) {
      mutate("saved-links", previousStates.savedLinks, { revalidate: false });
    }
    if (previousStates.currentUser && mutateCurrentUser) {
      mutateCurrentUser(previousStates.currentUser, false);
    }
  };

  return { rollback };
}
