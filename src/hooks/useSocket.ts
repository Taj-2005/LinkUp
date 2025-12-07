import { useEffect, useRef } from "react";
import { mutate } from "swr";
import { useSocketStore } from "@/store/useSocketStore";
import { useUsers } from "@/hooks/useUsers";
import { ILink, IComment } from "@/models/Link";

interface LinkWithUserInfo {
  _id: string;
  userId: string;
  imageUrl: string;
  description?: string;
  location?: string;
  likes: string[];
  comments: IComment[];
  createdAt: Date | string;
  updatedAt: Date | string;
  userInfo?: {
    username?: string;
    user_avatar?: string;
    name?: string;
  } | null;
}

interface UserPlain {
  _id: string;
  user_avatar?: string;
  username: string;
  name: string;
  location?: string;
  bio?: string;
  email: string;
  password: string;
  linked_to: string[];
  linked_by: string[];
  links: string[];
  savedLinks: string[];
  sex?: "male" | "female" | "other";
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  createdAt: Date | string;
  updatedAt: Date | string;
  refreshToken?: string;
  refreshTokens?: Array<{
    token: string;
    deviceId: string;
    createdAt: Date | string;
  }>;
  resetToken?: string;
  resetTokenExpiry?: number;
}

interface UnseenCountUpdatePayload {
  userId: string;
  unseenCount: number;
  notificationCount?: number;
  linkRequestCount?: number;
  timestamp: string;
  eventId?: string;
}

export function useSocket() {
  const { socket, isConnected, setUnseenCount } = useSocketStore();
  const { currentUser, mutateCurrentUser, mutateAllUsers } = useUsers();
  const currentUserRef = useRef(currentUser);
  
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);
  
  const processedEvents = useRef<Set<string>>(new Set());
  const eventIdCache = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!socket || !isConnected) return;

    const cleanupOldEvents = () => {
      if (processedEvents.current.size > 1000) {
        const eventsArray = Array.from(processedEvents.current);
        eventsArray.slice(0, 500).forEach(id => processedEvents.current.delete(id));
      }
    };

    const getEventId = (event: string, data: unknown): string => {
      const timestamp = Date.now();
      const dataStr = JSON.stringify(data);
      const hash = `${event}-${dataStr}-${timestamp}`;
      
      const recentTime = eventIdCache.current.get(hash);
      if (recentTime && Date.now() - recentTime < 1000) {
        return hash;
      }
      
      eventIdCache.current.set(hash, timestamp);
      
      if (eventIdCache.current.size > 500) {
        const entries = Array.from(eventIdCache.current.entries());
        entries.slice(0, 250).forEach(([key]) => eventIdCache.current.delete(key));
      }
      
      return hash;
    };

    const handleUnseenCountUpdate = (data: UnseenCountUpdatePayload) => {
      const eventId = data.eventId || getEventId("unseenCount:update", data);
      
      if (processedEvents.current.has(eventId)) {
        return;
      }
      
      processedEvents.current.add(eventId);
      cleanupOldEvents();

      const validCount = typeof data.unseenCount === "number" && data.unseenCount >= 0 
        ? data.unseenCount 
        : 0;
      setUnseenCount(validCount);
      
      mutate("notifications", undefined, { revalidate: false });
      mutate("linkRequests", undefined, { revalidate: false });
      
      setTimeout(() => {
        mutate("notifications"); // Background revalidation
      }, 100);
    };

    /**
     * Handle new notification
     * Optimistically invalidates notifications cache
     */
    const handleNewNotification = (data: { type: string; linkId: string; actorId: string; timestamp?: string }) => {
      const eventId = getEventId("notification:new", data);
      
      if (processedEvents.current.has(eventId)) {
        return;
      }
      
      processedEvents.current.add(eventId);
      cleanupOldEvents();

      // Optimistic cache update only - no refetch
      mutate("notifications", undefined, { revalidate: false });
    };

    /**
     * Handle notification update (read, clear, etc.)
     */
    const handleNotificationUpdate = (data: { userId: string; action: string; notificationId?: string; timestamp?: string }) => {
      const eventId = getEventId("notification:update", data);
      
      if (processedEvents.current.has(eventId)) {
        return;
      }
      
      processedEvents.current.add(eventId);
      cleanupOldEvents();

      // Optimistic cache update only - no refetch
      mutate("notifications", undefined, { revalidate: false });
    };

    /**
     * Handle feed updates (new link created)
     * Updates feed, users, and user caches for ALL connected users (including creator)
     */
    const handleFeedUpdate = (data: { linkId: string; userId: string; timestamp?: string; type: string }) => {
      const eventId = getEventId("feed:update", data);
      
      if (processedEvents.current.has(eventId)) {
        return;
      }
      
      processedEvents.current.add(eventId);
      cleanupOldEvents();

      // Silently update ALL SWR caches for all connected users (including creator)
      // Keep current data visible - no revalidation to prevent skeleton flicker
      // 1. Update feed cache (keep current data, mark for background sync)
      mutate(
        "feed-links",
        (current: LinkWithUserInfo[] | undefined) => current, // Keep current data visible
        { revalidate: false } // No immediate revalidation
      );
      
      // 2. Update the creator's user links cache (keep current data)
      mutate(
        `user-links-${data.userId}`,
        (current: Omit<LinkWithUserInfo, 'userInfo'>[] | undefined) => current,
        { revalidate: false }
      );
      
      // 3. Update users list cache (if user info changed) - silent background update
      mutateAllUsers();
      
      // 4. Update current user cache (if it's the current user) - silent background update
      mutateCurrentUser();
      
      // NO setTimeout revalidation - prevents skeleton flicker
      // Feed will update via optimistic mutations from interaction handlers
    };

    /**
     * Handle link updates (like, comment, reply, save)
     * Updates the specific link in the feed cache with new data
     */
    const handleLinkUpdate = (data: { link: ILink; timestamp?: string; eventId?: string }) => {
      const eventId = getEventId("link:update", data);
      
      if (processedEvents.current.has(eventId)) {
        return;
      }
      
      processedEvents.current.add(eventId);
      cleanupOldEvents();

      const updatedLink = data.link;

      // Update feed-links cache by merging the updated link into the array
      mutate(
        "feed-links",
        (links: LinkWithUserInfo[] | undefined) => {
          if (!links) return links;
          return links.map((link) => {
            if (link._id === updatedLink._id.toString()) {
              // Merge updated link data while preserving other properties
              // Convert ILink to plain object format
              const updatedLinkPlain: LinkWithUserInfo = {
                _id: updatedLink._id.toString(),
                userId: updatedLink.userId.toString(),
                imageUrl: updatedLink.imageUrl,
                description: updatedLink.description,
                location: updatedLink.location,
                likes: updatedLink.likes,
                comments: updatedLink.comments,
                createdAt: updatedLink.createdAt,
                updatedAt: updatedLink.updatedAt,
                userInfo: (updatedLink as LinkWithUserInfo).userInfo,
              };
              return {
                ...link,
                ...updatedLinkPlain,
                // Preserve userInfo if it exists
                userInfo: link.userInfo || updatedLinkPlain.userInfo,
              };
            }
            return link;
          });
        },
        { revalidate: false } // No revalidation - instant update only
      );

      // Update user-links cache for the link owner
      if (updatedLink.userId) {
        mutate(
          `user-links-${updatedLink.userId}`,
          (links: Omit<LinkWithUserInfo, 'userInfo'>[] | undefined) => {
            if (!links) return links;
            return links.map((link) => {
              if (link._id === updatedLink._id.toString()) {
                // Convert ILink to plain object format
                const updatedLinkPlain: Omit<LinkWithUserInfo, 'userInfo'> = {
                  _id: updatedLink._id.toString(),
                  userId: updatedLink.userId.toString(),
                  imageUrl: updatedLink.imageUrl,
                  description: updatedLink.description,
                  location: updatedLink.location,
                  likes: updatedLink.likes,
                  comments: updatedLink.comments,
                  createdAt: updatedLink.createdAt,
                  updatedAt: updatedLink.updatedAt,
                };
                return {
                  ...link,
                  ...updatedLinkPlain,
                };
              }
              return link;
            });
          },
          { revalidate: false }
        );
      }
    };

    /**
     * Handle user updates
     * Updates user-related caches
     */
    const handleUserUpdate = () => {
      mutateCurrentUser();
      mutateAllUsers();
    };

    /**
     * Handle link request events
     * Updates user and link request caches
     */
    const handleLinkRequestReceived = async (data?: { requesterId?: string; receiverId?: string }) => {
      // Instant cache updates - no revalidation to prevent flicker
      mutateCurrentUser();
      mutateAllUsers();
      mutate("linkRequests", undefined, { revalidate: false });
      mutate("/api/link-requests/pending", undefined, { revalidate: false });
      mutate("/api/link-requests/sent", undefined, { revalidate: false });
      mutate("/api/link-requests", undefined, { revalidate: false });
      
      // Also invalidate link-status caches if we have user IDs
      if (data?.requesterId && data?.receiverId) {
        const { invalidateLinkStatus } = await import("@/hooks/useLinkStatus");
        // Instant link-status updates
        invalidateLinkStatus(data.requesterId, data.receiverId);
      }
    };

    const handleLinkRequestAccepted = async (data?: { requestId?: string; requesterId?: string; receiverId?: string }) => {
      // Also invalidate link-status caches if we have user IDs
      if (data?.requesterId && data?.receiverId) {
        const { optimisticUpdateUser } = await import("@/utils/swrCache");
        const { invalidateGlobalLinkUpCaches } = await import("@/utils/globalCacheInvalidation");
        const { invalidateLinkStatus } = await import("@/hooks/useLinkStatus");
        
        const currentUser = currentUserRef.current;
        
        // Optimistically update user caches
        if (currentUser?._id) {
          const currentUserId = currentUser._id.toString();
          const requesterId = data.requesterId.toString();
          const receiverId = data.receiverId.toString();
          
          // If current user is the receiver, add requester to linked_by
          if (currentUserId === receiverId) {
            const currentLinkedBy = currentUser.linked_by || [];
            const updatedLinkedBy = [...currentLinkedBy];
            if (!updatedLinkedBy.includes(requesterId)) {
              updatedLinkedBy.push(requesterId);
            }
            await optimisticUpdateUser(currentUserId, {
              linked_by: updatedLinkedBy,
            });
          }
          
          // If current user is the requester, add receiver to linked_to
          if (currentUserId === requesterId) {
            const currentLinkedTo = currentUser.linked_to || [];
            const updatedLinkedTo = [...currentLinkedTo];
            if (!updatedLinkedTo.includes(receiverId)) {
              updatedLinkedTo.push(receiverId);
            }
            await optimisticUpdateUser(currentUserId, {
              linked_to: updatedLinkedTo,
            });
          }
          
          // Also optimistically update the other user in allUsers cache
          mutate(
            "all-users",
            (users: UserPlain[] | undefined) => {
              if (!users) return users;
              return users.map((user) => {
                const userId = user._id;
                if (userId === requesterId && currentUserId === receiverId) {
                  // Current user is receiver, update requester's linked_to
                  const requesterLinkedTo = user.linked_to || [];
                  const updatedRequesterLinkedTo = [...requesterLinkedTo];
                  if (!updatedRequesterLinkedTo.includes(receiverId)) {
                    updatedRequesterLinkedTo.push(receiverId);
                  }
                  return { ...user, linked_to: updatedRequesterLinkedTo };
                } else if (userId === receiverId && currentUserId === requesterId) {
                  // Current user is requester, update receiver's linked_by
                  const receiverLinkedBy = user.linked_by || [];
                  const updatedReceiverLinkedBy = [...receiverLinkedBy];
                  if (!updatedReceiverLinkedBy.includes(requesterId)) {
                    updatedReceiverLinkedBy.push(requesterId);
                  }
                  return { ...user, linked_by: updatedReceiverLinkedBy };
                }
                return user;
              });
            },
            { revalidate: false }
          );
        }
        
        // Instant cache updates
        mutateCurrentUser();
        mutateAllUsers();
        mutate("linkRequests", undefined, { revalidate: false });
        mutate("/api/link-requests/pending", undefined, { revalidate: false });
        mutate("/api/link-requests/sent", undefined, { revalidate: false });
        mutate("/api/link-requests", undefined, { revalidate: false });
        
        // Instant link-status updates
        invalidateLinkStatus(data.requesterId, data.receiverId);
        
        // Background revalidation for consistency
        await invalidateGlobalLinkUpCaches(data.requesterId, data.receiverId);
      } else {
        // Fallback if we don't have user IDs
        mutateCurrentUser();
        mutateAllUsers();
        mutate("linkRequests", undefined, { revalidate: false });
        mutate("/api/link-requests/pending", undefined, { revalidate: false });
        mutate("/api/link-requests/sent", undefined, { revalidate: false });
        mutate("/api/link-requests", undefined, { revalidate: false });
      }
    };

    const handleLinkRequestRejected = async (data?: { requestId?: string; requesterId?: string; receiverId?: string }) => {
      // Instant cache updates
      mutateCurrentUser();
      mutateAllUsers();
      mutate("linkRequests", undefined, { revalidate: false });
      mutate("/api/link-requests/pending", undefined, { revalidate: false });
      mutate("/api/link-requests/sent", undefined, { revalidate: false });
      mutate("/api/link-requests", undefined, { revalidate: false });
      
      // Also invalidate link-status caches if we have user IDs
      if (data?.requesterId && data?.receiverId) {
        const { invalidateGlobalLinkUpCaches } = await import("@/utils/globalCacheInvalidation");
        const { invalidateLinkStatus } = await import("@/hooks/useLinkStatus");
        
        // Instant link-status updates
        invalidateLinkStatus(data.requesterId, data.receiverId);
        
        // Background revalidation for consistency
        await invalidateGlobalLinkUpCaches(data.requesterId, data.receiverId);
      }
    };

    const handleUserUnlinked = async (data?: { from?: string; to?: string; userA?: string; userB?: string }) => {
      const { invalidateGlobalLinkUpCaches } = await import("@/utils/globalCacheInvalidation");
      const { optimisticUpdateUser } = await import("@/utils/swrCache");
      
      // Extract user IDs from different event formats
      const userA = data?.from || data?.userA;
      const userB = data?.to || data?.userB;
      
      if (!userA || !userB) {
        // Fallback: just update caches without user-specific updates
        mutateCurrentUser();
        mutateAllUsers();
        mutate("linkRequests", undefined, { revalidate: false });
        mutate("/api/link-requests/pending", undefined, { revalidate: false });
        mutate("/api/link-requests/sent", undefined, { revalidate: false });
        mutate("/api/link-requests", undefined, { revalidate: false });
        return;
      }
      
      const currentUser = currentUserRef.current;
      const currentUserId = currentUser?._id?.toString();
      
      // INSTANT UI UPDATE - Set link-status to "none" immediately for both directions
      // This ensures the button changes from "Linked" to "LinkUp" instantly for ALL users
      mutate(
        ["link-status", userA, userB],
        { status: "none" },
        { revalidate: false }
      );
      mutate(
        ["link-status", userB, userA],
        { status: "none" },
        { revalidate: false }
      );
      
      // INSTANT UI UPDATE - Optimistically update user caches if current user is involved
      if (currentUserId === userA || currentUserId === userB) {
        const otherUserId = currentUserId === userA ? userB : userA;
        const currentLinkedTo = currentUser?.linked_to || [];
        const currentLinkedBy = currentUser?.linked_by || [];
        
        // Remove other user from current user's linked arrays
        await optimisticUpdateUser(currentUserId, {
          linked_to: currentLinkedTo.filter((id: string) => id !== otherUserId),
          linked_by: currentLinkedBy.filter((id: string) => id !== otherUserId),
        });
      }
      
      // INSTANT UI UPDATE - Optimistically update other user in allUsers cache
      mutate(
        "all-users",
        (users: UserPlain[] | undefined) => {
          if (!users) return users;
          return users.map((user) => {
            const userId = user._id;
            if (userId === userA) {
              // Remove userB from userA's linked arrays
              const linkedTo = user.linked_to || [];
              const linkedBy = user.linked_by || [];
              return {
                ...user,
                linked_to: linkedTo.filter((id: string) => id !== userB),
                linked_by: linkedBy.filter((id: string) => id !== userB),
              };
            } else if (userId === userB) {
              // Remove userA from userB's linked arrays
              const linkedTo = user.linked_to || [];
              const linkedBy = user.linked_by || [];
              return {
                ...user,
                linked_to: linkedTo.filter((id: string) => id !== userA),
                linked_by: linkedBy.filter((id: string) => id !== userA),
              };
            }
            return user;
          });
        },
        { revalidate: false }
      );
      
      // Instant cache updates for all users
      mutateCurrentUser();
      mutateAllUsers();
      mutate("linkRequests", undefined, { revalidate: false });
      mutate("/api/link-requests/pending", undefined, { revalidate: false });
      mutate("/api/link-requests/sent", undefined, { revalidate: false });
      mutate("/api/link-requests", undefined, { revalidate: false });
      
      // Background revalidation for consistency (updates all related caches globally)
      await invalidateGlobalLinkUpCaches(userA, userB);
    };

    // Register all event listeners
    socket.on("unseenCount:update", handleUnseenCountUpdate);
    socket.on("notification:new", handleNewNotification);
    socket.on("notification:update", handleNotificationUpdate);
    socket.on("feed:update", handleFeedUpdate);
    socket.on("link:update", handleLinkUpdate);
    socket.on("userUpdated", handleUserUpdate);
    socket.on("linkRequestReceived", handleLinkRequestReceived);
    socket.on("linkRequestAccepted", handleLinkRequestAccepted);
    socket.on("linkRequestRejected", handleLinkRequestRejected);
    socket.on("userUnlinked", handleUserUnlinked);
    // Listen for global linkup events (unlinked, etc.) - broadcasts to ALL users
    socket.on("linkup:unlinked", (data: { from: string; to: string }) => handleUserUnlinked(data));
    socket.on("global:linkup", (data: { type: string; userA: string; userB: string }) => {
      if (data.type === "unlinked") {
        handleUserUnlinked({ userA: data.userA, userB: data.userB });
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off("unseenCount:update", handleUnseenCountUpdate);
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:update", handleNotificationUpdate);
      socket.off("feed:update", handleFeedUpdate);
      socket.off("link:update", handleLinkUpdate);
      socket.off("userUpdated", handleUserUpdate);
      socket.off("linkRequestReceived", handleLinkRequestReceived);
      socket.off("linkRequestAccepted", handleLinkRequestAccepted);
      socket.off("linkRequestRejected", handleLinkRequestRejected);
      socket.off("userUnlinked", handleUserUnlinked);
      socket.off("linkup:unlinked");
      socket.off("global:linkup");
    };
  }, [socket, isConnected, setUnseenCount, mutateCurrentUser, mutateAllUsers]);
}

