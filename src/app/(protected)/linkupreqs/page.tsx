"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { getLinkRequests, acceptLinkRequest, rejectLinkRequest } from "@/utils/linkRequestApi";
import { authFetch } from "@/lib/authFetch";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getUser } from "@/utils/api";

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

export default function LinkUpRequestsPage() {
    const [requests, setRequests] = useState<LinkRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const socket = useSocketStore((state) => state.socket);
    const setUnseenCount = useSocketStore((state) => state.setUnseenCount);
    const { resolvedTheme } = useTheme();

    const loadRequests = useCallback(async () => {
        try {
            setLoading(true);
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
                            } else {
                                console.warn("Requester not found:", req.requesterId);
                                return req;
                            }
                        } catch (error) {
                            console.error("Failed to fetch requester:", error);
                            return req;
                        }
                    }
                    return req;
                })
            );
            setRequests(requestsWithDetails);
            
            // Update unseen count - only count unseen requests
            const unseen = requestsWithDetails.filter((r: LinkRequest) => !r.seen && r.status === "requested").length;
            setUnseenCount(unseen);
        } catch (error) {
            console.error("Failed to load requests:", error);
            // Only show toast if it's not a connection/auth error
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            if (!errorMessage.includes("Not authenticated") && !errorMessage.includes("fetch")) {
                toast.error("Failed to load requests");
            }
            // Set empty array and reset count on error
            setRequests([]);
            setUnseenCount(0);
        } finally {
            setLoading(false);
        }
    }, [setUnseenCount]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    useEffect(() => {
        if (!socket) return;

        const handleLinkRequestReceived = () => {
            loadRequests();
        };

        const handleLinkRequestAccepted = () => {
            loadRequests();
        };

        socket.on("linkRequestReceived", handleLinkRequestReceived);
        socket.on("linkRequestAccepted", handleLinkRequestAccepted);

        return () => {
            socket.off("linkRequestReceived", handleLinkRequestReceived);
            socket.off("linkRequestAccepted", handleLinkRequestAccepted);
        };
    }, [socket, loadRequests]);

    const handleAccept = async (requestId: string, requesterId: string) => {
        try {
            await acceptLinkRequest(requestId);
            
            // Update user arrays in Next.js API
            await authFetch("/api/link-requests/accept-and-update", {
                method: "POST",
                body: JSON.stringify({ requestId, requesterId }),
            });

            if (socket) {
                socket.emit("acceptLinkRequest", { requestId });
                socket.emit("markRequestAsSeen", { requestId });
            }

            setRequests((prev) => prev.filter((r) => r._id !== requestId));
            toast.success("Link request accepted!");
            loadRequests();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to accept request");
        }
    };

    const handleReject = async (requestId: string) => {
        try {
            await rejectLinkRequest(requestId);

            if (socket) {
                socket.emit("rejectLinkRequest", { requestId });
                socket.emit("markRequestAsSeen", { requestId });
            }

            setRequests((prev) => prev.filter((r) => r._id !== requestId));
            toast.success("Link request rejected");
            loadRequests();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to reject request");
        }
    };

    if (loading) {
  return (
    <div className="w-full flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">
                <div className="w-full m-2 md:m-2 h-[98vh] md:h-[98vh] rounded-2xl flex flex-col overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
                    <div className="w-full overflow-y-auto hide-scrollbar p-4 md:p-6">
                        <div className="flex items-center justify-center min-h-[50vh]">
                            <div className="text-primary-dark dark:text-primary-light">Loading...</div>
                        </div>
                    </div>
        </div>
    </div>
  );
}

    return (
        <div className="w-full flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">
            <div className="w-full m-2 md:m-2 h-[98vh] md:h-[98vh] rounded-2xl flex flex-col overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
                <div className="w-full overflow-y-auto hide-scrollbar p-4 md:p-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary-dark dark:text-primary-light mb-6">
                        Link Requests
                    </h1>

                    {requests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                            <p className="text-lg md:text-xl text-primary-dark dark:text-primary-light mb-2">
                                No link requests
                            </p>
                            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                                You don&apos;t have any pending link requests
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                request.requester && (
                                    <motion.div
                                        key={request._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
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
                                                    @{request.requester.username}
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
