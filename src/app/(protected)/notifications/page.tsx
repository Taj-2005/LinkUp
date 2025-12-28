"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { getLinkRequests, acceptLinkRequest, rejectLinkRequest } from "@/utils/linkRequestApi";
import { authFetch } from "@/lib/authFetch";
import { invalidateGlobalLinkUpCaches } from "@/utils/globalCacheInvalidation";
import { useUsers } from "@/hooks/useUsers";
import { useNotifications } from "@/hooks/useNotifications";
import { mutate } from "swr";
import { invalidateLinkStatus } from "@/hooks/useLinkStatus";
import { optimisticUpdateUser } from "@/utils/swrCache";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { showToastWithAvatar } from "@/utils/toastHelpers";
import { getUser } from "@/utils/api";
import { INotification } from "@/models/Notification";
import NotificationSkeleton from "@/components/NotificationSkeleton";

interface LinkRequest {
    _id: string;
    requesterId: string;
    receiverId: string;
    status: string;
    seen: boolean;
    createdAt: string;
    requester?: {
        _id: string;
        username: string;
        name: string;
        user_avatar?: string;
    };
}

type NotificationTab = "all" | "requests" | "interactions";

export default function NotificationsPage() {
    const [requests, setRequests] = useState<LinkRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<NotificationTab>("all");
    const socket = useSocketStore((state) => state.socket);
    const setUnseenCount = useSocketStore((state) => state.setUnseenCount);
    const { resolvedTheme } = useTheme();
    const { currentUser, mutateCurrentUser, mutateAllUsers } = useUsers();
    const { notifications, isLoading: notificationsLoading, mutate: mutateNotifications } = useNotifications();
    const hasMarkedAsReadRef = useRef(false);

    const loadRequests = useCallback(async () => {
        try {
            const data = await getLinkRequests();
            const requestsWithDetails = await Promise.all(
                (data.requests || []).map(async (req: LinkRequest) => {
                    if (!req.requester && req.requesterId) {
                        try {
                            const requester = await getUser(req.requesterId);
                            if (requester) {
                                return {
                                    ...req,
                                    requester: {
                                        _id: requester._id,
                                        username: requester.username,
                                        name: requester.name,
                                        user_avatar: requester.user_avatar,
                                    },
                                };
                            }
                            return req;
                        } catch {
                            return req;
                        }
                    }
                    return req;
                })
            );
            setRequests(requestsWithDetails);
            
            const actualUnseenRequests = requestsWithDetails.filter((r: LinkRequest) => !r.seen && r.status === "requested").length;
            const actualUnreadNotifications = notifications.filter((n) => !n.read).length;
            const correctCount = actualUnseenRequests + actualUnreadNotifications;
            setUnseenCount(correctCount);
        } catch {
            setRequests([]);
            const actualUnreadNotifications = notifications.filter((n) => !n.read).length;
            setUnseenCount(actualUnreadNotifications);
        }
    }, [setUnseenCount, notifications]);

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await loadRequests();
            setLoading(false);
        };
        loadAll();
    }, [loadRequests]);

    useEffect(() => {
        if (loading || notificationsLoading) return;
        
        const actualUnreadNotifications = notifications.filter((n) => !n.read).length;
        const actualUnseenRequests = requests.filter((r) => !r.seen && r.status === "requested").length;
        const correctCount = actualUnreadNotifications + actualUnseenRequests;
        setUnseenCount(correctCount);
    }, [notifications, requests, loading, notificationsLoading, setUnseenCount]); 

    useEffect(() => {
        const markInteractionsAsRead = async () => {
            if (hasMarkedAsReadRef.current) return;
            if (notifications.length === 0 || loading || notificationsLoading) return;
            
            const unreadInteractionIds = notifications
                .filter((n) => !n.read)
                .map((n) => n._id);
            
            if (unreadInteractionIds.length === 0) {
                const actualUnreadCount = notifications.filter((n) => !n.read).length;
                const actualUnseenRequests = requests.filter((r) => !r.seen && r.status === "requested").length;
                const correctCount = actualUnreadCount + actualUnseenRequests;
                setUnseenCount(correctCount);
                return;
            }
            
            hasMarkedAsReadRef.current = true;
            
            try {
                await Promise.all(
                    unreadInteractionIds.map((id) =>
                        authFetch(`/api/notifications/${id}/read`, {
                            method: "PATCH",
                        }).catch(() => {
                        })
                    )
                );
                
                mutateNotifications(
                    (current: INotification[] | undefined): INotification[] => {
                        if (!current) return [];
                        return current.map((n) => 
                            unreadInteractionIds.includes(n._id) 
                                ? { ...n, read: true } as INotification
                                : n
                        );
                    },
                    { revalidate: false }
                );
                
                const actualUnreadCount = notifications.filter((n) => !unreadInteractionIds.includes(n._id) && !n.read).length;
                const actualUnseenRequests = requests.filter((r) => !r.seen && r.status === "requested").length;
                const correctCount = actualUnreadCount + actualUnseenRequests;
                setUnseenCount(correctCount);
            } catch (error) {
                console.error("Failed to mark notifications as read:", error);
            }
        };
        
        markInteractionsAsRead();
    }, [notifications, loading, notificationsLoading, mutateNotifications, requests, setUnseenCount]);

    useEffect(() => {
        if (!socket) return;

        const handleLinkupRequested = () => {
            loadRequests();
        };

        const handleLinkupAccepted = () => {
            loadRequests();
        };

        const handleLinkupRejected = () => {
            loadRequests();
        };

        const handleNewNotification = () => {
        };

        socket.on("linkup:requested", handleLinkupRequested);
        socket.on("linkup:accepted", handleLinkupAccepted);
        socket.on("linkup:rejected", handleLinkupRejected);
        socket.on("notification:new", handleNewNotification);

        return () => {
            socket.off("linkup:requested", handleLinkupRequested);
            socket.off("linkup:accepted", handleLinkupAccepted);
            socket.off("linkup:rejected", handleLinkupRejected);
            socket.off("notification:new", handleNewNotification);
        };
    }, [socket, loadRequests, mutateNotifications]);

    const handleAccept = async (requestId: string, requesterId: string) => {
        const previousRequests = [...requests];
        const previousLinkedBy = currentUser?.linked_by || [];

        setRequests((prev) => prev.filter((r) => r._id !== requestId));
        
        try {
            if (currentUser?._id) {
                const updatedLinkedBy = [...previousLinkedBy];
                if (!updatedLinkedBy.includes(requesterId)) {
                    updatedLinkedBy.push(requesterId);
                }

                await optimisticUpdateUser(currentUser._id, {
                    linked_by: updatedLinkedBy,
                });

                mutate(
                    "all-users",
                    (users: { _id: string; linked_to?: string[]; [key: string]: unknown }[] | undefined) => {
                        if (!users) return users;
                        return users.map((user) => {
                            if (user._id === requesterId) {
                                const requesterLinkedTo = user.linked_to || [];
                                const updatedRequesterLinkedTo = [...requesterLinkedTo];
                                if (!updatedRequesterLinkedTo.includes(currentUser._id)) {
                                    updatedRequesterLinkedTo.push(currentUser._id);
                                }
                                return { ...user, linked_to: updatedRequesterLinkedTo };
                            }
                            return user;
                        });
                    },
                    { revalidate: false }
                );

                await Promise.all([
                    mutateCurrentUser(),
                    mutateAllUsers(),
                    invalidateLinkStatus(currentUser._id, requesterId),
                    mutate("/api/link-requests/pending", undefined, { revalidate: false }),
                    mutate("/api/link-requests/sent", undefined, { revalidate: false }),
                    mutate("/api/link-requests", undefined, { revalidate: false }),
                    mutate("linkRequests", undefined, { revalidate: false }),
                ]);
            }

            await acceptLinkRequest(requestId);
            await authFetch("/api/link-requests/accept-and-update", {
                method: "POST",
                body: JSON.stringify({ requestId, requesterId }),
            });

            if (socket) {
                socket.emit("acceptLinkRequest", { requestId });
                socket.emit("markRequestAsSeen", { requestId });
            }

            if (currentUser?._id) {
                await invalidateGlobalLinkUpCaches(currentUser._id, requesterId);
            }

            loadRequests();
            const requester = requests.find((r) => r._id === requestId);
            if (requester?.requester) {
              showToastWithAvatar(
                {
                  username: requester.requester.username || "Unknown",
                  user_avatar: requester.requester.user_avatar,
                  name: requester.requester.name,
                },
                "accepted your link request"
              );
            } else {
              toast.success("Link request accepted!");
            }
        } catch (error) {
            setRequests(previousRequests);
            
            if (currentUser?._id) {
                await optimisticUpdateUser(currentUser._id, {
                    linked_by: previousLinkedBy,
                });
            }

            if (currentUser?._id) {
                await Promise.all([
                    mutateCurrentUser(),
                    mutateAllUsers(),
                    invalidateLinkStatus(currentUser._id, requesterId),
                    invalidateGlobalLinkUpCaches(currentUser._id, requesterId),
                ]);
            }
            toast.error(error instanceof Error ? error.message : "Failed to accept request");
        }
    };

    const handleReject = async (requestId: string) => {
        const previousRequests = [...requests];

        const request = requests.find((r) => r._id === requestId);
        const requesterId = request?.requesterId;
        
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
        
        try {
            if (currentUser?._id && requesterId) {
                await Promise.all([
                    mutateCurrentUser(),
                    mutateAllUsers(),
                    invalidateLinkStatus(currentUser._id, requesterId),
                    mutate("/api/link-requests/pending"),
                    mutate("/api/link-requests/sent"),
                    mutate("/api/link-requests"),
                    mutate("linkRequests", undefined, { revalidate: false }),
                ]);
            }

            await rejectLinkRequest(requestId);
            
            if (socket) {
                socket.emit("rejectLinkRequest", { requestId });
                socket.emit("markRequestAsSeen", { requestId });
            }   

            if (currentUser?._id && requesterId) {
                await invalidateGlobalLinkUpCaches(currentUser._id, requesterId);
            }

            loadRequests();
            const rejectedRequest = previousRequests.find((r) => r._id === requestId);
            if (rejectedRequest?.requester) {
              showToastWithAvatar(
                {
                  username: rejectedRequest.requester.username || "Unknown",
                  user_avatar: rejectedRequest.requester.user_avatar,
                  name: rejectedRequest.requester.name,
                },
                "rejected your link request",
                { type: "info" }
              );
            } else {
              toast.success("Link request rejected");
            }
        } catch (error) {
            setRequests(previousRequests);

            if (currentUser?._id && requesterId) {
                await Promise.all([
                    mutateCurrentUser(),
                    mutateAllUsers(),
                    invalidateLinkStatus(currentUser._id, requesterId),
                    invalidateGlobalLinkUpCaches(currentUser._id, requesterId),
                ]);
            }
            toast.error(error instanceof Error ? error.message : "Failed to reject request");
        }
    };

    const handleClearAll = async () => {
        try {
            await authFetch("/api/notifications/clear", {
                method: "DELETE",
            });
            
            mutateNotifications(
                (): INotification[] => {
                    return [];
                },
                { revalidate: false }
            );
            
            toast.success("All interaction notifications cleared");
        } catch {
            toast.error("Failed to clear notifications");
        }
    };

    const getNotificationMessage = (notification: INotification): string => {
        switch (notification.type) {
            case "comment":
                return "commented on your link";
            case "reply":
                return "replied to your comment";
            case "like":
                return "liked your link";
            case "save":
                return "saved your link";
            default:
                return "interacted with your link";
        }
    };

    const getNotificationIcon = (type: INotification["type"]): string => {
        switch (type) {
            case "like":
                return "❤️";
            case "comment":
            case "reply":
            case "save":
                return "";
            default:
                return "🔔";
        }
    };

    const [notificationActors, setNotificationActors] = useState<Record<string, { _id: string; username?: string; user_avatar?: string; name?: string } | null>>({});
    
    useEffect(() => {
        const loadActors = async () => {
            const uniqueActorIds = [...new Set(notifications.map(n => n.actorId))];
            const actors: Record<string, { _id: string; username?: string; user_avatar?: string; name?: string } | null> = {};
            
            await Promise.all(
                uniqueActorIds.map(async (actorId) => {
                    try {
                        const actor = await getUser(actorId);
                        if (actor) {
                            actors[actorId] = actor;
                        }
                    } catch {
                    }
                })
            );
            
            setNotificationActors(actors);
        };
        
        if (notifications.length > 0) {
            loadActors();
        }
    }, [notifications]);

    const filteredNotifications = notifications.filter(() => {
        if (activeTab === "requests") return false;
        if (activeTab === "interactions") return true;
        return true;
    });

    const showRequests = activeTab === "all" || activeTab === "requests";
    const showInteractions = activeTab === "all" || activeTab === "interactions";

    const isLoading = (loading || notificationsLoading) && notifications.length === 0 && requests.length === 0;

    const hasContent = requests.length > 0 || notifications.length > 0;

    return (
        <div className="w-full flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">
            <div className="w-full m-2 md:m-2 h-[98vh] md:h-[98vh] rounded-2xl flex flex-col overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
                <div className="flex-shrink-0 p-4 md:p-6 pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-primary-dark dark:text-primary-light">
                            Notifications
                        </h1>
                        {notifications.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={handleClearAll}
                                    className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-1 bg-gray-200 dark:bg-gray-700 rounded-lg hover:opacity-80 transition whitespace-nowrap"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-0">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`pb-2 px-4 text-sm font-semibold transition ${
                                activeTab === "all"
                                    ? "text-violet-600 border-b-2 border-violet-600"
                                    : "text-gray-500 dark:text-gray-400"
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveTab("requests")}
                            className={`pb-2 px-4 text-sm font-semibold transition ${
                                activeTab === "requests"
                                    ? "text-violet-600 border-b-2 border-violet-600"
                                    : "text-gray-500 dark:text-gray-400"
                            }`}
                        >
                            Link Requests{" "}
                            {isLoading ? (
                                <span className="inline-block w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded skeleton-wiggle" />
                            ) : (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20,
                                    }}
                                    className="inline-block"
                                >
                                    ({requests.length})
                                </motion.span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("interactions")}
                            className={`pb-2 px-4 text-sm font-semibold transition ${
                                activeTab === "interactions"
                                    ? "text-violet-600 border-b-2 border-violet-600"
                                    : "text-gray-500 dark:text-gray-400"
                            }`}
                        >
                            Interactions{" "}
                            {isLoading ? (
                                <span className="inline-block w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded skeleton-wiggle" />
                            ) : (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20,
                                    }}
                                    className="inline-block"
                                >
                                    ({notifications.length})
                                </motion.span>
                            )}
                        </button>
                    </div>
                    </div>
                            
                <div className="flex-1 overflow-y-auto hide-scrollbar px-4 md:px-6 pb-4 md:pb-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            {showRequests && [...Array(2)].map((_, i) => (
                                <NotificationSkeleton key={`skeleton-request-${i}`} variant="request" />
                            ))}
                            {showInteractions && [...Array(3)].map((_, i) => (
                                <NotificationSkeleton key={`skeleton-interaction-${i}`} variant="interaction" />
                            ))}
                        </div>
                    ) : !hasContent ? (
                        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                            <p className="text-lg md:text-xl text-primary-dark dark:text-primary-light mb-2">
                                No notifications
                            </p>
                            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                                You don&apos;t have any notifications yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {showRequests && requests.map((request) => (
                                request.requester && (
                                    <motion.div
                                        key={request._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 shadow-md border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={
                                                        request.requester.user_avatar
                                                            ? request.requester.user_avatar
                                                            : resolvedTheme === "dark"
                                                            ? "/dark-profile.png"
                                                            : "/light-profile.png"
                                                    }
                                                    fill
                                                    alt={`${request.requester.username} avatar`}
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg md:text-xl font-bold text-primary-dark dark:text-primary-light truncate">
                                                    {request.requester.name}
                                                </h3>
                                                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 truncate">
                                                    @{request.requester.username} wants to link up
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 md:gap-4">
                                            <button
                                                onClick={() => handleAccept(request._id, request.requesterId)}
                                                className="flex-1 bg-primary-light dark:bg-primary-dark text-right-nav-light dark:text-gray-100 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold shadow-lg hover:brightness-110 transition text-sm md:text-base"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleReject(request._id)}
                                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold hover:brightness-110 transition text-sm md:text-base"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </motion.div>
                                )
                            ))}

                            {showInteractions && filteredNotifications.map((notification) => {
                                const actor = notificationActors[notification.actorId];
                                if (!actor) return null;

                                return (
                                    <motion.div
                                        key={notification._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className={`bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 shadow-md border border-gray-200 dark:border-gray-700 ${
                                            !notification.read ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800" : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {getNotificationIcon(notification.type) && (
                                                <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                                            )}
                                            <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={
                                                        actor.user_avatar
                                                            ? actor.user_avatar
                                                            : resolvedTheme === "dark"
                                                            ? "/dark-profile.png"
                                                            : "/light-profile.png"
                                                    }
                                                    fill
                                                    alt={`${actor.username} avatar`}
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm md:text-base text-primary-dark dark:text-primary-light">
                                                    <span className="font-bold">{actor.username}</span>{" "}
                                                    {getNotificationMessage(notification)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {new Date(notification.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-violet-600 rounded-full flex-shrink-0" />
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
