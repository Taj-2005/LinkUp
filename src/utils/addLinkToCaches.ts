import { mutate } from "swr";
import { ILink } from "@/models/Link";
import { LinkWithUser } from "@/utils/linkInteractions";
import { IUser } from "@/models/User";

type MutateCurrentUser = (
  data?: { user: IUser } | ((data: { user: IUser } | undefined) => { user: IUser } | undefined),
  shouldRevalidate?: boolean
) => Promise<{ user: IUser } | undefined>;

export function addLinkToAllCaches(
  newLink: LinkWithUser | ILink,
  userId: string,
  mutateCurrentUser?: MutateCurrentUser
): void {
  const linkWithUser = newLink as LinkWithUser;

  mutate(
    "feed-links",
    (links: LinkWithUser[] | undefined) => {
      if (!links) return [linkWithUser];
      const exists = links.some((l) => l._id.toString() === linkWithUser._id.toString());
      if (exists) return links;
      return [linkWithUser, ...links];
    },
    { revalidate: false }
  );

  mutate(
    `user-links-${userId}`,
    (links: ILink[] | undefined) => {
      if (!links) return [newLink as ILink];
      const exists = links.some((l) => l._id.toString() === newLink._id.toString());
      if (exists) return links;
      return [newLink as ILink, ...links];
    },
    { revalidate: false }
  );

  if (mutateCurrentUser) {
    mutateCurrentUser(
      (data: { user: IUser } | undefined) => {
        if (!data?.user) return data;
        const currentLinks = data.user.links || [];
        const linkIdStr = newLink._id.toString();
        if (currentLinks.includes(linkIdStr)) return data;
        const updatedLinks = [linkIdStr, ...currentLinks];
        return { ...data, user: { ...data.user, links: updatedLinks } as IUser };
      },
      false
    );
  }

  mutate(
    "all-users",
    (users: Array<{ _id: string; links?: string[]; [key: string]: unknown }> | undefined) => {
      if (!users) return users;
      return users.map((user) => {
        if (user._id === userId) {
          const currentLinks = user.links || [];
          const linkIdStr = newLink._id.toString();
          if (!currentLinks.includes(linkIdStr)) {
            return {
              ...user,
              links: [linkIdStr, ...currentLinks],
            };
          }
        }
        return user;
      });
    },
    { revalidate: false }
  );
}

