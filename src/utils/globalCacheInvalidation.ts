import { mutate } from "swr";

export async function invalidateGlobalLinkUpCaches(
  currentUserId: string,
  otherUserId: string
) {
  if (!currentUserId || !otherUserId) {
    console.error("Invalid cache invalidation: both user IDs required", { currentUserId, otherUserId });
    return;
  }

  await Promise.all([

    mutate("current-user"),
    mutate("/api/users/me"),

    mutate(`/api/users/${otherUserId}`),

    mutate("all-users"),
    mutate("/api/users"),

    mutate(
      (key) => typeof key === 'string' && key.startsWith("/api/users/"),
      undefined,
      { revalidate: true }
    ),

    mutate("/api/link-requests/pending"),
    mutate("/api/link-requests/sent"),
    mutate("/api/link-requests"),

    mutate(["link-status", currentUserId, otherUserId]),
    mutate(["link-status", otherUserId, currentUserId]),

    mutate(
      (key) => {
        if (!Array.isArray(key)) return false;
        return key[0] === "batch-link-status" &&
               (key[1] === currentUserId || key[1] === otherUserId);
      },
      undefined,
      { revalidate: true }
    ),
  ]);
}

export async function invalidateUserPairCaches(userId1: string, userId2: string) {
  await Promise.all([
    mutate(["link-status", userId1, userId2]),
    mutate(["link-status", userId2, userId1]),
    mutate(`/api/users/${userId1}`),
    mutate(`/api/users/${userId2}`),
    mutate("current-user"),
    mutate("all-users"),
  ]);
}
