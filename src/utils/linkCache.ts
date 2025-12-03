import { mutate } from "swr";

export const CACHE_KEYS = {
  FEED_LINKS: "feed-links",
  USER_LINKS: (userId: string) => `user-links-${userId}`,
  SAVED_LINKS: "saved-links",
  LINK_BY_ID: (linkId: string) => `link-${linkId}`,
  LINK_COMMENTS: (linkId: string) => `link-${linkId}-comments`,
  CURRENT_USER: "current-user",
  ALL_USERS: "all-users",
  USER_BY_ID: (userId: string) => `user-${userId}`,
  NOTIFICATIONS: "notifications",
} as const;

export async function invalidateLinkCache(linkId: string) {

  await Promise.all([
    mutate(CACHE_KEYS.FEED_LINKS),
    mutate(CACHE_KEYS.LINK_BY_ID(linkId)),
    mutate(CACHE_KEYS.LINK_COMMENTS(linkId)),
  ]);
}

export async function invalidateUserCache(userId: string) {
  await Promise.all([
    mutate(CACHE_KEYS.USER_LINKS(userId)),
    mutate(CACHE_KEYS.USER_BY_ID(userId)),
    mutate(CACHE_KEYS.CURRENT_USER),
  ]);
}

export function invalidateNotificationsCache() {
  mutate(CACHE_KEYS.NOTIFICATIONS);
}
