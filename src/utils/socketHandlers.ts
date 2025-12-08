import { Socket } from "socket.io-client";
import { invalidateGlobalLinkUpCaches } from "./globalCacheInvalidation";
import { showToastWithAvatar } from "./toastHelpers";

export interface LinkUpUserInfo {
  name: string;
  username: string;
  user_avatar?: string;
}

export interface LinkUpEventData {
  type: "requested" | "accepted" | "rejected" | "canceled" | "unlinked";
  from: string;
  to: string;
  fromUser?: LinkUpUserInfo;
  toUser?: LinkUpUserInfo;
  timestamp: number;
}

export interface LinkUpLegacyEventData {
  from: string;
  to: string;
  fromUser?: LinkUpUserInfo;
  toUser?: LinkUpUserInfo;
}

export function setupLinkSocketHandlers(socket: Socket | null, currentUserId: string | null) {
  if (!socket || !currentUserId) {
    return () => {};
  }

  const processedEvents = new Set<string>();

  const handleLinkUp = async (data: LinkUpEventData) => {
    const { type, from, to, fromUser, toUser, timestamp } = data;
    
    if (from !== currentUserId && to !== currentUserId) {
      return;
    }

    const eventId = `${type}-${from}-${to}-${timestamp}`;
    if (processedEvents.has(eventId)) {
      return;
    }
    processedEvents.add(eventId);
    
    if (processedEvents.size > 100) {
      const oldest = Array.from(processedEvents).slice(0, 10);
      oldest.forEach(id => processedEvents.delete(id));
    }

    await invalidateGlobalLinkUpCaches(from, to);
    
    if (type === "requested" && to === currentUserId && from !== currentUserId && fromUser) {
      showToastWithAvatar(
        {
          username: fromUser.username || "Unknown",
          user_avatar: fromUser.user_avatar,
          name: fromUser.name,
        },
        "sent you a link request"
      );
    } else if (type === "accepted" && from === currentUserId && toUser) {
      showToastWithAvatar(
        {
          username: toUser.username || "Unknown",
          user_avatar: toUser.user_avatar,
          name: toUser.name,
        },
        "accepted your link request"
      );
    } else if (type === "rejected") {
    } else if (type === "canceled" && to === currentUserId && from !== currentUserId && fromUser) {
      showToastWithAvatar(
        {
          username: fromUser.username || "Unknown",
          user_avatar: fromUser.user_avatar,
          name: fromUser.name,
        },
        "canceled the link request",
        { type: "info" }
      );
    } else if (type === "unlinked") {
    }
  };

  const handleLinkupRequested = async (data: LinkUpLegacyEventData) => {
    const { from, to } = data;
    
    if (from !== currentUserId && to !== currentUserId) {
      return;
    }

    await invalidateGlobalLinkUpCaches(from, to);
  };

  const handleLinkupAccepted = async (data: LinkUpLegacyEventData) => {
    const { from, to } = data;
    
    if (from !== currentUserId && to !== currentUserId) {
      return;
    }

    await invalidateGlobalLinkUpCaches(from, to);
  };

  const handleLinkupRejected = async (data: LinkUpLegacyEventData) => {
    const { from, to } = data;
    
    if (from !== currentUserId && to !== currentUserId) {
      return;
    }

    await invalidateGlobalLinkUpCaches(from, to);
  };

  const handleLinkupUnlinked = async (data: LinkUpEventData | LinkUpLegacyEventData | { initiator?: string; target?: string }) => {

    const from = "from" in data ? data.from : ("initiator" in data ? data.initiator : null);
    const to = "to" in data ? data.to : ("target" in data ? data.target : null);
    
    if (!from || !to) return;
    
    if (from !== currentUserId && to !== currentUserId) {
      return;
    }

    await invalidateGlobalLinkUpCaches(from, to);
  };

  const handleGlobalLinkUp = async (data: { type: string; userA: string; userB: string }) => {
    const { userA, userB } = data;
    
    if (userA !== currentUserId && userB !== currentUserId) {
      return;
    }

    await invalidateGlobalLinkUpCaches(userA, userB);
  };

  socket.on("linkup", handleLinkUp);
  
  socket.on("linkup:requested", handleLinkupRequested);
  socket.on("linkup:accepted", handleLinkupAccepted);
  socket.on("linkup:rejected", handleLinkupRejected);
  socket.on("linkup:unlinked", handleLinkupUnlinked);
  
  socket.on("global:linkup", handleGlobalLinkUp);

  return () => {
    socket.off("linkup", handleLinkUp);
    socket.off("linkup:requested", handleLinkupRequested);
    socket.off("linkup:accepted", handleLinkupAccepted);
    socket.off("linkup:rejected", handleLinkupRejected);
    socket.off("linkup:unlinked", handleLinkupUnlinked);
    socket.off("global:linkup", handleGlobalLinkUp);
  };
}
