import { mutate } from "swr";
import { IUser } from "@/models/User";

export const SWR_KEYS = {
  CURRENT_USER: "current-user",
  ALL_USERS: "all-users",
  USER_BY_ID: (userId: string) => `/api/users/${userId}`,
  PENDING_REQUESTS: "/api/link-requests/pending",
  SENT_REQUESTS: "/api/link-requests/sent",
  LINK_STATUS: (currentUserId: string, targetId: string) => `link-status-${currentUserId}-${targetId}`,
} as const;

export async function invalidateLinkCaches(
  currentUserId: string,
  targetId: string,
  optimisticData?: {
    currentUser?: Partial<IUser>;
    targetUser?: Partial<IUser>;
  }
) {
  const mutations = [

    mutate(
      SWR_KEYS.CURRENT_USER,
      optimisticData?.currentUser
        ? async (current: { user: IUser } | undefined) => {
            if (current) {
              return {
                user: { ...current.user, ...optimisticData.currentUser } as unknown as IUser,
              };
            }
            return current;
          }
        : undefined,
      { revalidate: true }
    ),

    mutate(SWR_KEYS.ALL_USERS, undefined, { revalidate: true }),

    mutate(
      SWR_KEYS.USER_BY_ID(targetId),
      optimisticData?.targetUser
        ? (target: IUser | undefined) => {
            if (target) {
              return { ...target, ...optimisticData.targetUser } as unknown as IUser;
            }
            return target;
          }
        : undefined,
      { revalidate: true }
    ),

    mutate(SWR_KEYS.LINK_STATUS(currentUserId, targetId), undefined, { revalidate: true }),
    mutate(SWR_KEYS.LINK_STATUS(targetId, currentUserId), undefined, { revalidate: true }),

    mutate(SWR_KEYS.PENDING_REQUESTS, undefined, { revalidate: true }),

    mutate(SWR_KEYS.SENT_REQUESTS, undefined, { revalidate: true }),
  ];

  await Promise.all(mutations);
}

export async function optimisticUpdateUser(userId: string, updates: Partial<IUser>) {

  mutate(
    SWR_KEYS.CURRENT_USER,
    (current: { user: IUser } | undefined) => {
      if (current?.user._id === userId) {
        return {
          user: { ...current.user, ...updates } as unknown as IUser,
        };
      }
      return current;
    },
    { revalidate: false }
  );

  mutate(
    SWR_KEYS.ALL_USERS,
    (users: IUser[] | undefined) => {
      if (!users) return users;
      return users.map((user) =>
        user._id === userId ? { ...user, ...updates } as unknown as IUser : user
      );
    },
    { revalidate: false }
  );
}
