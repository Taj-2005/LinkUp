const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";

interface NotificationPayload {
  userId: string;
  actorId: string;
  linkId: string;
  type: "comment" | "reply" | "like" | "save";
  commentId?: string;
  replyId?: string;
  deepLink?: string;
  actor?: {
    _id: string;
    username: string;
    name?: string;
    avatar?: string | null;
  };
  commentText?: string;
}

interface NotificationUpdatePayload {
  userId: string;
  action: "create" | "seen" | "clear";
  notificationId?: string;
}

export async function emitNotificationEvent(payload: NotificationPayload): Promise<void> {
  try {
    await fetch(`${SOCKET_SERVER_URL}/api/notifications/interaction-notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Socket notification error (non-critical):", error);
  }
}

export async function emitNotificationUpdateEvent(payload: NotificationUpdatePayload): Promise<void> {
  try {
    await fetch(`${SOCKET_SERVER_URL}/api/notifications/update-notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Socket notification update error (non-critical):", error);
  }
}

export async function emitLinkRequestAcceptedEvent(requesterId: string, receiverId: string): Promise<void> {
  try {
    await fetch(`${SOCKET_SERVER_URL}/api/link-requests/link-accepted-notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId, receiverId }),
    });
  } catch (error) {
    console.error("Socket link request error (non-critical):", error);
  }
}

export async function emitUnlinkEvent(currentUserId: string, otherUserId: string): Promise<void> {
  try {
    await fetch(`${SOCKET_SERVER_URL}/api/link-requests/unlink-notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentUserId, otherUserId }),
    });
  } catch (error) {
    console.error("Socket unlink error (non-critical):", error);
  }
}

export async function emitUserUpdatedEvent(userId: string): Promise<void> {
  try {
    await fetch(`${SOCKET_SERVER_URL}/api/users/profile-updated-notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  } catch (error) {
    console.error("Socket user update error (non-critical):", error);
  }
}

export async function emitFeedUpdateEvent(linkId: string, userId: string): Promise<void> {
  try {
    await fetch(`${SOCKET_SERVER_URL}/api/links/feed-update-notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkId, userId }),
    });
  } catch (error) {
    console.error("Socket feed update error (non-critical):", error);
  }
}

interface LinkUpdatePayload {
  _id: string;
  userId: string;
  likes?: string[];
  comments?: Array<{
    _id: string;
    userId: string;
    username: string;
    user_avatar?: string;
    text: string;
    replies?: Array<{
      _id: string;
      userId: string;
      username: string;
      user_avatar?: string;
      text: string;
      createdAt: Date | string;
      updatedAt: Date | string;
    }>;
    createdAt: Date | string;
    updatedAt: Date | string;
  }>;
  [key: string]: unknown;
}

export async function emitLinkUpdateEvent(updatedLink: LinkUpdatePayload): Promise<void> {
  try {
    await fetch(`${SOCKET_SERVER_URL}/api/links/link-update-notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link: updatedLink }),
    });
  } catch (error) {
    console.error("Socket link update error (non-critical):", error);
  }
}

