import { mutate } from "swr";
import { ILink } from "@/models/Link";
import { IUser } from "@/models/User";
import toast from "react-hot-toast";

type MutateCurrentUser = (
  data?: { user: IUser } | ((data: { user: IUser } | undefined) => { user: IUser } | undefined),
  shouldRevalidate?: boolean
) => Promise<{ user: IUser } | undefined>;

interface DeleteLinkOptions {
  linkId: string;
  userId: string;
  linkUserId?: string;
  mutateCurrentUser?: MutateCurrentUser;
  onLinkDeleted?: () => void;
}

export async function deleteLinkHandler({
  linkId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId: _userId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  linkUserId: _linkUserId,
  mutateCurrentUser,
  onLinkDeleted,
}: DeleteLinkOptions): Promise<void> {
  const previousStates: {
    feedLinks?: ILink[];
    userLinks?: { [key: string]: ILink[] };
    currentUser?: { user: IUser };
    savedLinks?: ILink[];
  } = {};

  mutate(
    "feed-links",
    (links: ILink[] | undefined) => {
      if (links) {
        previousStates.feedLinks = [...links];
        return links.filter((link) => link._id.toString() !== linkId);
      }
      return links;
    },
    { revalidate: false }
  );

  mutate(
    "saved-links",
    (links: ILink[] | undefined) => {
      if (links) {
        previousStates.savedLinks = [...links];
        return links.filter((link) => link._id.toString() !== linkId);
      }
      return links;
    },
    { revalidate: false }
  );

  mutate(
    (key: unknown) => typeof key === "string" && key.startsWith("user-links-"),
    (links: ILink[] | undefined) => {
      if (links) {
        return links.filter((link) => link._id.toString() !== linkId);
      }
      return links;
    },
    { revalidate: false }
  );

  if (mutateCurrentUser) {
    mutateCurrentUser(
      (data: { user: IUser } | undefined) => {
        if (data?.user) {
          previousStates.currentUser = { ...data };
          const updatedLinks = (data.user.links || []).filter(
            (id: string) => id.toString() !== linkId
          );
          return {
            ...data,
            user: {
              ...data.user,
              links: updatedLinks,
            } as IUser,
          };
        }
        return data;
      },
      false
    );
  }

  toast.success("Link deleted successfully", { id: "delete-link" });

  if (onLinkDeleted) {
    onLinkDeleted();
  }

  try {
    const res = await fetch(`/api/links/${linkId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to delete link");
    }

  } catch (error) {
    if (previousStates.feedLinks) {
      mutate("feed-links", previousStates.feedLinks, { revalidate: false });
    }
    if (previousStates.savedLinks) {
      mutate("saved-links", previousStates.savedLinks, { revalidate: false });
    }
    if (previousStates.currentUser && mutateCurrentUser) {
      mutateCurrentUser(previousStates.currentUser, false);
    }

    toast.error(
      error instanceof Error ? error.message : "Failed to delete link",
      { id: "delete-link" }
    );
  }
}

