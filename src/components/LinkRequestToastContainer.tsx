"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useSocketStore } from "@/store/useSocketStore";
import { useUserStore } from "@/store/useUserStore";
import LinkRequestToast from "./LinkRequestToast";
import LinkAcceptedToast from "./LinkAcceptedToast";
import { getUser, getCurrentUser, getAllUsers } from "@/utils/api";

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
    const { user, setUser, setUsers } = useUserStore();
    const [toasts, setToasts] = useState<LinkRequest[]>([]);
    const [acceptedToasts, setAcceptedToasts] = useState<LinkAccepted[]>([]);

    useEffect(() => {
        if (!socket) return;

        const handleLinkRequestReceived = async (data: LinkRequest) => {
            // Fetch requester details if not provided
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

        const handleLinkRequestAccepted = async (data: { requestId: string; receiverId: string | unknown }) => {
            // Only show toast if current user is the requester (not the receiver)
            // If receiverId is not the current user, then current user is the requester
            if (user && user._id) {
                const receiverIdStr = typeof data.receiverId === 'string' 
                    ? data.receiverId 
                    : String(data.receiverId);
                const currentUserIdStr = typeof user._id === 'string' 
                    ? user._id 
                    : String(user._id);

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

                            // Update current user data and users list to reflect the new link
                            try {
                                const [currentUserData, allUsersData] = await Promise.all([
                                    getCurrentUser(),
                                    getAllUsers()
                                ]);
                                if (currentUserData?.user) {
                                    setUser(currentUserData.user);
                                }
                                if (allUsersData) {
                                    setUsers(allUsersData);
                                }
                            } catch (error) {
                                console.error("Failed to update user data:", error);
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
    }, [socket, user, setUser, setUsers]);

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

