import { authFetch } from "@/lib/authFetch";
import { getUnseenRequestCount } from "./linkRequestApi";

export async function getCombinedUnreadCount(): Promise<number> {
  try {
    const [requestCount, notificationCount] = await Promise.all([
      getUnseenRequestCount().then(data => data.count || 0).catch(() => 0),
      authFetch("/api/notifications/unread-count")
        .then((response: unknown) => {
          const data = response as { count?: number };
          return data.count || 0;
        })
        .catch(() => 0),
    ]);

    return requestCount + notificationCount;
  } catch (error) {
    console.error("Failed to fetch combined unread count:", error);
    return 0;
  }
}
