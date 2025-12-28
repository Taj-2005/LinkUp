import { useEffect, useRef, useCallback } from "react";
import { mutate } from "swr";
import { useSocketStore } from "@/store/useSocketStore";
import { useUsers } from "@/hooks/useUsers";
import { ILink, IComment } from "@/models/Link";
import { IUser } from "@/models/User";
import { INotification } from "@/models/Notification";
import { showToastWithAvatar } from "@/utils/toastHelpers";
import { useModalStore } from "@/store/useModalStore";
import { isValidImageUrl } from "@/utils/linkCacheMutations";
import { safeMergeLinkUpdate } from "@/utils/linkCacheUtils";

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
  const { setSelectedLink, setIsModalOpen } = useModalStore();
  const currentUserRef = useRef(currentUser);
  
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);
  
  const processedEvents = useRef<Set<string>>(new Set());
  const eventIdCache = useRef<Map<string, number>>(new Map());
  const notificationUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedNotificationUpdate = useCallback(() => {
    if (notificationUpdateTimeoutRef.current) {
      clearTimeout(notificationUpdateTimeoutRef.current);
    }
    
    notificationUpdateTimeoutRef.current = setTimeout(async () => {
      mutate(
        "notifications",
        async (current: INotification[] | undefined) => {
          try {
            const response = await fetch("/api/notifications", {
              credentials: "include",
            });
            if (response.ok) {
              const data = await response.json();
              return data.notifications || [];
            }
          } catch (error) {
            console.error("Failed to update notifications cache:", error);
          }
          return current || [];
        },
        { revalidate: false }
      );
      notificationUpdateTimeoutRef.current = null;
    }, 500);
  }, []);

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

      mutate("linkRequests", undefined, { revalidate: false });
    };

    const handleNewNotification = async (data: { type: string; linkId: string; actorId: string; timestamp?: string }) => {
      const eventId = getEventId("notification:new", data);
      
      if (processedEvents.current.has(eventId)) {
        return;
      }
      
      processedEvents.current.add(eventId);
      cleanupOldEvents();

      debouncedNotificationUpdate();
    };
        
    const handleNotificationUpdate = async (data: { userId: string; action: string; notificationId?: string; timestamp?: string }) => {
      const eventId = getEventId("notification:update", data);
      
      if (processedEvents.current.has(eventId)) {
        return;
      }
      
      processedEvents.current.add(eventId);
      cleanupOldEvents();

      debouncedNotificationUpdate();
    };


    const handleFeedUpdate = (data: { linkId: string; userId: string; timestamp?: string; type: string }) => {
      const eventId = getEventId("feed:update", data);
      
      if (processedEvents.current.has(eventId)) {
        return;
      }
      
      processedEvents.current.add(eventId);
      cleanupOldEvents();

      mutate("feed-links");
      mutate(`user-links-${data.userId}`);
      mutateAllUsers();
      mutateCurrentUser();
    };

    const handleLinkDeleted = (data: { linkId: string; ownerId: string; updatedOwner?: { _id: string; links: string[] }; timestamp?: string; eventId?: string }) => {
      const eventId = getEventId("link:deleted", data);
      
      if (processedEvents.current.has(eventId)) {
        return;
      }
      
      processedEvents.current.add(eventId);
      cleanupOldEvents();

      const deletedLinkId = data.linkId;
      const ownerId = data.ownerId;

      mutate(
        "feed-links",
        (links: LinkWithUserInfo[] | undefined) => {
          if (!links) return links;
          return links.filter((link) => link._id.toString() !== deletedLinkId.toString());
        },
        { revalidate: false }
      );

      mutate(
        "saved-links",
        (links: LinkWithUserInfo[] | undefined) => {
          if (!links) return links;
          return links.filter((link) => link._id.toString() !== deletedLinkId.toString());
        },
        { revalidate: false }
      );

      if (ownerId) {
        mutate(
          `user-links-${ownerId}`,
          (links: Omit<LinkWithUserInfo, 'userInfo'>[] | undefined) => {
            if (!links) return links;
            return links.filter((link) => link._id.toString() !== deletedLinkId.toString());
          },
          { revalidate: false }
        );
      }

      if (data.updatedOwner && currentUserRef.current?._id?.toString() === ownerId) {
        mutateCurrentUser(
          (data: { user: IUser } | undefined) => {
            if (!data?.user) return data;
            const updatedLinks = (data.user.links || []).filter(
              (id: string) => id.toString() !== deletedLinkId.toString()
            );
            return { ...data, user: { ...data.user, links: updatedLinks } as IUser };
          },
          { revalidate: false }
        );
      }

      if (data.updatedOwner) {
        mutate(
          "all-users",
          (users: UserPlain[] | undefined) => {
            if (!users) return users;
            return users.map((user) => {
              if (user._id === ownerId) {
                return {
                  ...user,
                  links: data.updatedOwner?.links || user.links,
                };
              }
              return user;
            });
          },
          { revalidate: false }
        );
      }

      if (currentUserRef.current?._id?.toString() === ownerId) {
        mutateCurrentUser(
          (data: { user: IUser } | undefined) => {
            if (!data?.user) return data;
            const updatedLinks = (data.user.links || []).filter(
              (id: string) => id.toString() !== deletedLinkId.toString()
            );
            return { ...data, user: { ...data.user, links: updatedLinks } as IUser };
          },
          { revalidate: false }
        );
      }
    };

    const handleLinkUpdate = (data: { link: ILink; timestamp?: string; eventId?: string }) => {
      const eventId = getEventId("link:update", data);
      
      if (processedEvents.current.has(eventId)) {
        return;
      }
      
      processedEvents.current.add(eventId);
      cleanupOldEvents();

      const updatedLink = data.link;

      mutate(
        "feed-links",
        (links: LinkWithUserInfo[] | undefined) => {
          if (!links) return links;
          return links.map((link) => {
            if (link._id === updatedLink._id.toString()) {
              const update: Partial<LinkWithUserInfo> = {
                _id: updatedLink._id.toString(),
                userId: updatedLink.userId.toString(),
                ...(updatedLink.imageUrl && { imageUrl: updatedLink.imageUrl }),
                ...(updatedLink.description !== undefined && { description: updatedLink.description }),
                ...(updatedLink.location !== undefined && { location: updatedLink.location }),
                likes: updatedLink.likes || link.likes,
                comments: updatedLink.comments || link.comments,
                ...(updatedLink.createdAt && { createdAt: updatedLink.createdAt }),
                ...(updatedLink.updatedAt && { updatedAt: updatedLink.updatedAt }),
              };
              return safeMergeLinkUpdate(link, update) as LinkWithUserInfo;
            }
            return link;
          });
        },
          { revalidate: false } 
      );

      mutate(
        (key: unknown) => typeof key === "string" && key.startsWith("user-links-"),
        (links: Omit<LinkWithUserInfo, 'userInfo'>[] | undefined) => {
          if (!links) return links;
          return links.map((link) => {
            if (link._id === updatedLink._id.toString()) {
              const update: Partial<Omit<LinkWithUserInfo, 'userInfo'>> = {
                _id: updatedLink._id.toString(),
                userId: updatedLink.userId.toString(),
                ...(updatedLink.imageUrl && { imageUrl: updatedLink.imageUrl }),
                ...(updatedLink.description !== undefined && { description: updatedLink.description }),
                ...(updatedLink.location !== undefined && { location: updatedLink.location }),
                likes: updatedLink.likes || link.likes,
                comments: updatedLink.comments || link.comments,
                ...(updatedLink.createdAt && { createdAt: updatedLink.createdAt }),
                ...(updatedLink.updatedAt && { updatedAt: updatedLink.updatedAt }),
              };
              return safeMergeLinkUpdate(link, update) as Omit<LinkWithUserInfo, 'userInfo'>;
            }
            return link;
          });
        },
        { revalidate: false }
      );

      mutate(
        "saved-links",
        (links: LinkWithUserInfo[] | undefined) => {
          if (!links) return links;
          return links.map((link) => {
            if (link._id === updatedLink._id.toString()) {
              const update: Partial<LinkWithUserInfo> = {
                _id: updatedLink._id.toString(),
                userId: updatedLink.userId.toString(),
                ...(updatedLink.imageUrl && { imageUrl: updatedLink.imageUrl }),
                ...(updatedLink.description !== undefined && { description: updatedLink.description }),
                ...(updatedLink.location !== undefined && { location: updatedLink.location }),
                likes: updatedLink.likes || link.likes,
                comments: updatedLink.comments || link.comments,
                ...(updatedLink.createdAt && { createdAt: updatedLink.createdAt }),
                ...(updatedLink.updatedAt && { updatedAt: updatedLink.updatedAt }),
              };
              return safeMergeLinkUpdate(link, update) as LinkWithUserInfo;
            }
            return link;
          });
        },
        { revalidate: false }
      );

      mutateAllUsers();
    };

    const handleUserUpdate = () => {
      mutateCurrentUser();
      mutateAllUsers();
    };

    const handleLinkRequestReceived = async (data?: { requesterId?: string; receiverId?: string }) => {
      mutateCurrentUser();
      mutateAllUsers();
      mutate("linkRequests", undefined, { revalidate: false });
      mutate("/api/link-requests/pending", undefined, { revalidate: false });
      mutate("/api/link-requests/sent", undefined, { revalidate: false });
      mutate("/api/link-requests", undefined, { revalidate: false });
      
      if (data?.requesterId && data?.receiverId) {
        const { invalidateLinkStatus } = await import("@/hooks/useLinkStatus");
        invalidateLinkStatus(data.requesterId, data.receiverId);
      }
    };

    const handleLinkRequestAccepted = async (data?: { requestId?: string; requesterId?: string; receiverId?: string }) => {
      if (data?.requesterId && data?.receiverId) {
        const { optimisticUpdateUser } = await import("@/utils/swrCache");
        const { invalidateGlobalLinkUpCaches } = await import("@/utils/globalCacheInvalidation");
        const { invalidateLinkStatus } = await import("@/hooks/useLinkStatus");
        
        const currentUser = currentUserRef.current;
        
        if (currentUser?._id) {
          const currentUserId = currentUser._id.toString();
          const requesterId = data.requesterId.toString();
          const receiverId = data.receiverId.toString();
          
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
          
          mutate(
            "all-users",
            (users: UserPlain[] | undefined) => {
              if (!users) return users;
              return users.map((user) => {
                const userId = user._id;
                if (userId === requesterId && currentUserId === receiverId) {
                  const requesterLinkedTo = user.linked_to || [];
                  const updatedRequesterLinkedTo = [...requesterLinkedTo];
                  if (!updatedRequesterLinkedTo.includes(receiverId)) {
                    updatedRequesterLinkedTo.push(receiverId);
                  }
                  return { ...user, linked_to: updatedRequesterLinkedTo };
                } else if (userId === receiverId && currentUserId === requesterId) {
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
        
        mutateCurrentUser();
        mutateAllUsers();
        mutate("linkRequests", undefined, { revalidate: false });
        mutate("/api/link-requests/pending", undefined, { revalidate: false });
        mutate("/api/link-requests/sent", undefined, { revalidate: false });
        mutate("/api/link-requests", undefined, { revalidate: false });
        
        invalidateLinkStatus(data.requesterId, data.receiverId);
        
        await invalidateGlobalLinkUpCaches(data.requesterId, data.receiverId);
      } else {
        mutateCurrentUser();
        mutateAllUsers();
        mutate("linkRequests", undefined, { revalidate: false });
        mutate("/api/link-requests/pending", undefined, { revalidate: false });
        mutate("/api/link-requests/sent", undefined, { revalidate: false });
        mutate("/api/link-requests", undefined, { revalidate: false });
      }
    };

    const handleLinkRequestRejected = async (data?: { requestId?: string; requesterId?: string; receiverId?: string }) => {
      mutateCurrentUser();
      mutateAllUsers();
      mutate("linkRequests", undefined, { revalidate: false });
      mutate("/api/link-requests/pending", undefined, { revalidate: false });
      mutate("/api/link-requests/sent", undefined, { revalidate: false });
      mutate("/api/link-requests", undefined, { revalidate: false });
      
      if (data?.requesterId && data?.receiverId) {
        const { invalidateGlobalLinkUpCaches } = await import("@/utils/globalCacheInvalidation");
        const { invalidateLinkStatus } = await import("@/hooks/useLinkStatus");
        
        invalidateLinkStatus(data.requesterId, data.receiverId);
        
        await invalidateGlobalLinkUpCaches(data.requesterId, data.receiverId);
      }
    };

    const handleUserUnlinked = async (data?: { from?: string; to?: string; userA?: string; userB?: string }) => {
      const { invalidateGlobalLinkUpCaches } = await import("@/utils/globalCacheInvalidation");
      const { optimisticUpdateUser } = await import("@/utils/swrCache");
      
      const userA = data?.from || data?.userA;
      const userB = data?.to || data?.userB;
      
      if (!userA || !userB) {
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
      
      if (currentUserId === userA || currentUserId === userB) {
        const otherUserId = currentUserId === userA ? userB : userA;
        const currentLinkedTo = currentUser?.linked_to || [];
        const currentLinkedBy = currentUser?.linked_by || [];
        
        await optimisticUpdateUser(currentUserId, {
          linked_to: currentLinkedTo.filter((id: string) => id !== otherUserId),
          linked_by: currentLinkedBy.filter((id: string) => id !== otherUserId),
        });
      }
      
      mutate(
        "all-users",
        (users: UserPlain[] | undefined) => {
          if (!users) return users;
          return users.map((user) => {
            const userId = user._id;
            if (userId === userA) {
              const linkedTo = user.linked_to || [];
              const linkedBy = user.linked_by || [];
              return {
                ...user,
                linked_to: linkedTo.filter((id: string) => id !== userB),
                linked_by: linkedBy.filter((id: string) => id !== userB),
              };
            } else if (userId === userB) {
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
      
      mutateCurrentUser();
      mutateAllUsers();
      mutate("linkRequests", undefined, { revalidate: false });
      mutate("/api/link-requests/pending", undefined, { revalidate: false });
      mutate("/api/link-requests/sent", undefined, { revalidate: false });
      mutate("/api/link-requests", undefined, { revalidate: false });
      
      await invalidateGlobalLinkUpCaches(userA, userB);
    };

    const handleLinkCreated = (data: { 
      link: LinkWithUserInfo; 
      actor: { _id: string; username: string; name?: string; user_avatar?: string };
      timestamp?: string; 
      eventId?: string;
    }) => {
      const eventId = getEventId("link:created", data);
      
      if (processedEvents.current.has(eventId)) {
        return;
      }
      
      processedEvents.current.add(eventId);
      cleanupOldEvents();

      const rawLink = data.link;
      const actorId = data.actor._id;
      const currentUserId = currentUserRef.current?._id?.toString();
      
      if (!isValidImageUrl(rawLink.imageUrl)) {
        console.warn("Received link with invalid imageUrl, skipping cache update:", rawLink._id);
        return;
      }

      const newLink: LinkWithUserInfo = {
        ...rawLink,
        imageUrl: rawLink.imageUrl,
        userInfo: rawLink.userInfo || {
          username: data.actor.username,
          user_avatar: data.actor.user_avatar,
          name: data.actor.name,
        },
      };

      if (actorId !== currentUserId) {
      const toastId = `link-created-${newLink._id}`;
      showToastWithAvatar(
        {
          username: data.actor.username,
          user_avatar: data.actor.user_avatar,
          name: data.actor.name,
        },
        "uploaded a new link",
        {
          id: toastId,
          duration: 5000,
          type: "success",
          onClick: () => {
            setSelectedLink(newLink as unknown as Parameters<typeof setSelectedLink>[0]);
            setIsModalOpen(true);
          },
        }
      );
      }

      mutate(
        "feed-links",
        (links: LinkWithUserInfo[] | undefined) => {
          if (!links) return [newLink];
          const exists = links.some((l) => l._id.toString() === newLink._id.toString());
          if (exists) return links;
          return [newLink, ...links];
        },
        { revalidate: false }
      );

      if (newLink.userId) {
        mutate(
          `user-links-${newLink.userId}`,
          (links: Omit<LinkWithUserInfo, 'userInfo'>[] | undefined) => {
            if (!links) return [newLink as Omit<LinkWithUserInfo, 'userInfo'>];
            const exists = links.some((l) => l._id.toString() === newLink._id.toString());
            if (exists) return links;
            return [newLink as Omit<LinkWithUserInfo, 'userInfo'>, ...links];
          },
          { revalidate: false }
        );
      }

      mutate(
        "all-users",
        (users: UserPlain[] | undefined) => {
          if (!users) return users;
          return users.map((user) => {
            if (user._id === actorId) {
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

      if (actorId === currentUserId) {
        mutateCurrentUser(
          (data: { user: IUser } | undefined) => {
            if (!data?.user) return data;
            const currentLinks = data.user.links || [];
            const linkIdStr = newLink._id.toString();
            if (!currentLinks.includes(linkIdStr)) {
              return {
                ...data,
                user: {
                  ...data.user,
                  links: [linkIdStr, ...currentLinks],
                } as IUser,
              };
            }
            return data;
          },
          { revalidate: false }
        );
      }
    };

    socket.on("unseenCount:update", handleUnseenCountUpdate);
    socket.on("notification:new", handleNewNotification);
    socket.on("notification:update", handleNotificationUpdate);
    socket.on("feed:update", handleFeedUpdate);
    socket.on("link:update", handleLinkUpdate);
    socket.on("link:deleted", handleLinkDeleted);
    socket.on("link:created", handleLinkCreated);
    socket.on("userUpdated", handleUserUpdate);
    socket.on("linkRequestReceived", handleLinkRequestReceived);
    socket.on("linkRequestAccepted", handleLinkRequestAccepted);
    socket.on("linkRequestRejected", handleLinkRequestRejected);
    socket.on("userUnlinked", handleUserUnlinked);    
    socket.on("linkup:unlinked", (data: { from: string; to: string }) => handleUserUnlinked(data));
    socket.on("global:linkup", (data: { type: string; userA: string; userB: string }) => {
      if (data.type === "unlinked") {
        handleUserUnlinked({ userA: data.userA, userB: data.userB });
      }
    });

    return () => {
      socket.off("unseenCount:update", handleUnseenCountUpdate);
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:update", handleNotificationUpdate);
      socket.off("feed:update", handleFeedUpdate);
      socket.off("link:update", handleLinkUpdate);
      socket.off("link:deleted", handleLinkDeleted);
      socket.off("link:created", handleLinkCreated);
      socket.off("userUpdated", handleUserUpdate);
      socket.off("linkRequestReceived", handleLinkRequestReceived);
      socket.off("linkRequestAccepted", handleLinkRequestAccepted);
      socket.off("linkRequestRejected", handleLinkRequestRejected);
      socket.off("userUnlinked", handleUserUnlinked);
      socket.off("linkup:unlinked");
      socket.off("global:linkup");
    };
  }, [socket, isConnected, setUnseenCount, mutateCurrentUser, mutateAllUsers, setSelectedLink, setIsModalOpen, debouncedNotificationUpdate]);
}

