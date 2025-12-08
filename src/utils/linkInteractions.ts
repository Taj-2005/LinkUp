import { mutate } from "swr";
import { ILink, IComment, IReply } from "@/models/Link";
import { IUser } from "@/models/User";
import { safeMergeLinkUpdate } from "./linkCacheUtils";

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
          return safeMergeLinkUpdate(link, {
            comments: [...(link.comments || []), comment],
          } as Partial<LinkWithUser>);
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
          return safeMergeLinkUpdate(link, {
            comments: [...(link.comments || []), comment],
          } as Partial<ILink>);
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
          return safeMergeLinkUpdate(link, {
            comments: (link.comments || []).map((comment) => {
              if (comment._id === commentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), reply],
                };
              }
              return comment;
            }),
          } as Partial<LinkWithUser>);
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
          return safeMergeLinkUpdate(link, {
            comments: (link.comments || []).map((comment) => {
              if (comment._id === commentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), reply],
                };
              }
              return comment;
            }),
          } as Partial<ILink>);
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
          return safeMergeLinkUpdate(link, {
            likes: newLikes,
          } as Partial<LinkWithUser>);
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
          return safeMergeLinkUpdate(link, {
            likes: newLikes,
          } as Partial<ILink>);
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

export function optimisticAddLink(
  newLink: LinkWithUser,
  userId: string,
  mutateCurrentUser?: MutateCurrentUser
) {
  const safeLink = {
    ...newLink,
    imageUrl: newLink.imageUrl && typeof newLink.imageUrl === "string" && newLink.imageUrl.trim() !== ""
      ? newLink.imageUrl
      : null,
  } as LinkWithUser;

  mutate(
    `user-links-${userId}`,
    (links: ILink[] | undefined) => {
      if (!links) return [safeLink as ILink];
      const exists = links.some((l) => l._id.toString() === safeLink._id.toString());
      if (exists) return links;
      return [safeLink as ILink, ...links];
    },
    { revalidate: false }
  );

  mutate(
    "feed-links",
    (links: LinkWithUser[] | undefined) => {
      if (!links) return [safeLink];
      const exists = links.some((l) => l._id.toString() === safeLink._id.toString());
      if (exists) return links;
      return [safeLink, ...links];
    },
    { revalidate: false }
  );

  if (mutateCurrentUser) {
    mutateCurrentUser(
      (data: { user: IUser } | undefined) => {
        if (!data?.user) return data;
        const currentLinks = data.user.links || [];
        const linkIdStr = safeLink._id.toString();
        if (currentLinks.includes(linkIdStr)) return data;
        const updatedLinks = [linkIdStr, ...currentLinks];
        return { ...data, user: { ...data.user, links: updatedLinks } as IUser };
      },
      false
    );
  }
}

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
  const previousStates: {
    feedLinks?: LinkWithUser[];
    userLinks?: { [key: string]: ILink[] };
    currentUser?: { user: IUser };
    savedLinks?: LinkWithUser[];
  } = {};

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
