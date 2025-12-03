import { IUser } from "@/models/User";
import { KeyedMutator } from "swr";

export function isLinkSaved(user: IUser | null | undefined, linkId: string): boolean {
  if (!user || !linkId) return false;

  const savedLinks = user.savedLinks || [];
  const linkIdStr = linkId.toString();

  const savedLinksStr = savedLinks.map((id: unknown) => String(id));

  return savedLinksStr.includes(linkIdStr);
}

export function optimisticToggleSaved(
  mutateCurrentUser: KeyedMutator<{ user: IUser }>,
  linkId: string,
  isCurrentlySaved: boolean
): { rollback: () => void } {
  let previousData: { user: IUser } | undefined;

  mutateCurrentUser(
    (current: { user: IUser } | undefined) => {
      if (!current) return current;

      previousData = { ...current, user: { ...current.user } as unknown as IUser };

      const savedLinks = current.user.savedLinks || [];
      const linkIdStr = linkId.toString();

      const newSavedLinks = isCurrentlySaved
        ? savedLinks.filter((id: string) => String(id) !== linkIdStr)
        : [...savedLinks, linkIdStr];

      return {
        user: {
          ...current.user,
          savedLinks: newSavedLinks,
        } as unknown as IUser,
      };
    },
    false
  );

  const rollback = () => {
    if (previousData) {
      mutateCurrentUser(previousData, false);
    }
  };

  return { rollback };
}
