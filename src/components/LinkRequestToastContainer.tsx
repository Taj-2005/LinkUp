"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useSocketStore } from "@/store/useSocketStore";
import { useUsers } from "@/hooks/useUsers";
import LinkRequestToast from "./LinkRequestToast";
import LinkAcceptedToast from "./LinkAcceptedToast";
import { getUser } from "@/utils/api";
import { optimisticUpdateUser } from "@/utils/swrCache";

interface LinkRequest {
    requestId: string;
    requesterId: string;
    requester?: {
        _id: string;
        username: string;
        name: string;
        user_avatar?: string;
    };
}

interface LinkAccepted {
    requestId: string;
    receiverId: string;
    receiver?: {
        _id: string;
        username: string;
        name: string;
        user_avatar?: string;
    };
}

export default function LinkRequestToastContainer() {
    const socket = useSocketStore((state) => state.socket);
    const { currentUser, mutateCurrentUser, mutateAllUsers } = useUsers();
    const [toasts, setToasts] = useState<LinkRequest[]>([]);
    const [acceptedToasts, setAcceptedToasts] = useState<LinkAccepted[]>([]);

    useEffect(() => {
        if (!socket) return;

        const handleLinkRequestReceived = async (data: LinkRequest) => {

            if (!data.requester && data.requesterId) {
                try {
                    const requester = await getUser(data.requesterId);
                    if (requester) {
                        setToasts((prev) => [
                            ...prev,
                            {
                                ...data,
                                requester: {
                                    _id: requester._id,
                                    username: requester.username,
                                    name: requester.name,
                                    user_avatar: requester.user_avatar,
                                },
                            },
                        ]);
                    } else {
                        console.warn("Requester not found:", data.requesterId);
                    }
                } catch (error) {
                    console.error("Failed to fetch requester:", error);
                }
            } else {
                setToasts((prev) => [...prev, data]);
            }
        };

        const handleLinkRequestAccepted = async (data: { requestId: string; receiverId: string | number | { toString(): string } }) => {

            if (currentUser && currentUser._id) {
                const receiverIdStr = typeof data.receiverId === 'string'
                    ? data.receiverId
                    : String(data.receiverId);
                const currentUserIdStr = typeof currentUser._id === 'string'
                    ? currentUser._id
                    : String(currentUser._id);

                if (receiverIdStr !== currentUserIdStr) {
                    try {
                        const receiver = await getUser(receiverIdStr);
                        if (receiver) {
                            setAcceptedToasts((prev) => [
                                ...prev,
                                {
                                    requestId: data.requestId,
                                    receiverId: receiverIdStr,
                                    receiver: {
                                        _id: receiver._id,
                                        username: receiver.username,
                                        name: receiver.name,
                                        user_avatar: receiver.user_avatar,
                                    },
                                },
                            ]);

                            if (currentUser?._id) {
                                const { invalidateGlobalLinkUpCaches } = await import("@/utils/globalCacheInvalidation");
                                const { invalidateLinkStatus } = await import("@/hooks/useLinkStatus");
                                const { mutate } = await import("swr");
                                
                                const currentUserId = currentUser._id.toString();
                                
                                const currentLinkedTo = currentUser.linked_to || [];
                                const updatedLinkedTo = [...currentLinkedTo];
                                if (!updatedLinkedTo.includes(receiverIdStr)) {
                                    updatedLinkedTo.push(receiverIdStr);
                                }
                                await optimisticUpdateUser(currentUserId, {
                                    linked_to: updatedLinkedTo,
                                });
                                
                                mutate(
                                    "all-users",
                                    (users: { _id?: { toString(): string } | string; linked_by?: string[]; [key: string]: unknown }[] | undefined) => {
                                        if (!users) return users;
                                        return users.map((user) => {
                                            if (user._id?.toString() === receiverIdStr) {
                                                const receiverLinkedBy = user.linked_by || [];
                                                const updatedReceiverLinkedBy = [...receiverLinkedBy];
                                                if (!updatedReceiverLinkedBy.includes(currentUserId)) {
                                                    updatedReceiverLinkedBy.push(currentUserId);
                                                }
                                                return { ...user, linked_by: updatedReceiverLinkedBy };
                                            }
                                            return user;
                                        });
                                    },
                                    { revalidate: false }
                                );
                                
                                await Promise.all([
                                    mutateCurrentUser(),
                                    mutateAllUsers(),
                                    invalidateLinkStatus(currentUserId, receiverIdStr),
                                    mutate("/api/link-requests/pending", undefined, { revalidate: false }),
                                    mutate("/api/link-requests/sent", undefined, { revalidate: false }),
                                    mutate("/api/link-requests", undefined, { revalidate: false }),
                                    mutate("linkRequests", undefined, { revalidate: false }),
                                ]);
                                
                                await invalidateGlobalLinkUpCaches(currentUserId, receiverIdStr);
                            }
                        } else {
                            console.warn("Receiver not found:", receiverIdStr);
                        }
                    } catch (error) {
                        console.error("Failed to fetch receiver:", error);
                    }
                }
            }
        };

        socket.on("linkRequestReceived", handleLinkRequestReceived);
        socket.on("linkRequestAccepted", handleLinkRequestAccepted);

        return () => {
            socket.off("linkRequestReceived", handleLinkRequestReceived);
            socket.off("linkRequestAccepted", handleLinkRequestAccepted);
        };
    }, [socket, currentUser, mutateCurrentUser, mutateAllUsers]);

    const removeToast = (requestId: string) => {
        setToasts((prev) => prev.filter((toast) => toast.requestId !== requestId));
    };

    const removeAcceptedToast = (requestId: string) => {
        setAcceptedToasts((prev) => prev.filter((toast) => toast.requestId !== requestId));
    };

    return (
        <div className="fixed top-0 right-0 z-50 pointer-events-none">
            <div className="flex flex-col gap-2 p-4 pointer-events-auto">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        toast.requester && (
                            <LinkRequestToast
                                key={`request-${toast.requestId}`}
                                requester={toast.requester!}
                                requestId={toast.requestId}
                                onClose={() => removeToast(toast.requestId)}
                            />
                        )
                    ))}
                    {acceptedToasts.map((toast) => (
                        toast.receiver && (
                            <LinkAcceptedToast
                                key={`accepted-${toast.requestId}`}
                                receiver={toast.receiver!}
                                requestId={toast.requestId}
                                onClose={() => removeAcceptedToast(toast.requestId)}
                            />
                        )
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
