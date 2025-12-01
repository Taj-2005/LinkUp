"use client";

import React, { useState, useEffect } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { useUsers } from "@/hooks/useUsers";
import { sendLinkRequest, getLinkStatus } from "@/utils/linkRequestApi";
import { authFetch } from "@/lib/authFetch";
import UnlinkModal from "./UnlinkModal";
import toast from "react-hot-toast";

interface LinkUpButtonProps {
    receiverId: string;
    className?: string;
    variant?: "default" | "border";
}

export default function LinkUpButton({ receiverId, className = "", variant = "default" }: LinkUpButtonProps) {
    const [status, setStatus] = useState<"none" | "requested" | "linked" | "loading">("loading");
    const [showUnlinkModal, setShowUnlinkModal] = useState(false);
    const socket = useSocketStore((state) => state.socket);
    const { currentUser, mutateCurrentUser, mutateAllUsers } = useUsers();

    useEffect(() => {
        if (!currentUser || !receiverId) return;

        // Don't show button if trying to link to self
        if (currentUser._id === receiverId) {
            setStatus("none");
            return;
        }

        // Always check request status via API to get accurate state
        // This ensures we catch pending requests even after page reload
        getLinkStatus(receiverId)
            .then((data) => {
                // Ensure we have the status in the response
                const statusValue = data?.status || data;
                if (statusValue === "linked") {
                    setStatus("linked");
                } else if (statusValue === "requested") {
                    setStatus("requested");
                } else {
                    setStatus("none");
                }
            })
            .catch((error) => {
                // Log error for debugging
                console.error("Failed to get link status:", error);
                // Fallback: check local state if API fails
                // Check if already linked
                if (currentUser.linked_to.includes(receiverId)) {
                    setStatus("linked");
                } else if (currentUser.linked_by.includes(receiverId)) {
                    // If user is in linked_by, they are already linked (receiver sent request)
                    setStatus("none");
                } else {
                setStatus("none");
                }
            });
    }, [currentUser, receiverId]);

    useEffect(() => {
        if (!socket) return;

        const handleLinkRequestAccepted = async (data: { requestId: string; receiverId: string; requesterId?: string }) => {
            // Check if this acceptance affects the current button
            // Current user could be either the requester or the receiver
            const currentUserId = currentUser?._id;
            const isCurrentUserRequester = currentUserId === data.requesterId;
            const isCurrentUserReceiver = currentUserId === data.receiverId;
            const isReceiverInvolved = receiverId === data.receiverId || receiverId === data.requesterId;
            
            if ((isCurrentUserRequester || isCurrentUserReceiver) && isReceiverInvolved) {
                // Refresh user data via SWR mutate (industry standard)
                await Promise.all([
                    mutateCurrentUser(),
                    mutateAllUsers()
                ]);
                
                // Re-check link status after data refresh
                // The useEffect will handle status update when currentUser changes
            }
        };

        const handleLinkRequestRejected = async (data: { requestId: string; requesterId: string; receiverId: string }) => {
            // Check if this rejection affects the current button
            // Current user could be either the requester or the receiver
            const currentUserId = currentUser?._id;
            const isCurrentUserRequester = currentUserId === data.requesterId;
            const isCurrentUserReceiver = currentUserId === data.receiverId;
            const isReceiverInvolved = receiverId === data.receiverId || receiverId === data.requesterId;
            
            if ((isCurrentUserRequester || isCurrentUserReceiver) && isReceiverInvolved) {
                // Change status from "requested" back to "none" (which shows "LinkUp")
                setStatus("none");
                
                // Refresh user data via SWR mutate (industry standard)
                await Promise.all([
                    mutateCurrentUser(),
                    mutateAllUsers()
                ]);
            }
        };

        const handleUserUnlinked = async (data: { userId: string }) => {
            // If this unlink affects the current user or the receiver, update status
            if (data.userId === receiverId || currentUser?._id === data.userId) {
                setStatus("none");
                // Refresh user data via SWR mutate (industry standard)
                await Promise.all([
                    mutateCurrentUser(),
                    mutateAllUsers()
                ]);
            }
        };

        const handleUnlinked = async () => {
            setStatus("none");
            // Refresh user data via SWR mutate (industry standard)
            await Promise.all([
                mutateCurrentUser(),
                mutateAllUsers()
                ]);
        };

        const handleLinkRequestReceived = async (data: { requestId?: string; requesterId?: string; receiverId?: string }) => {
            // If a link request was received that affects this button, refresh the status
            const isReceiverInvolved = receiverId === data.receiverId || receiverId === data.requesterId;
            
            if (isReceiverInvolved) {
                // Re-check status from API to get accurate state
                try {
                    const statusData = await getLinkStatus(receiverId);
                    const statusValue = statusData?.status || statusData;
                    if (statusValue === "linked") {
                        setStatus("linked");
                    } else if (statusValue === "requested") {
                        setStatus("requested");
                    } else {
                        setStatus("none");
                    }
                } catch {
                    // If API fails, refresh user data
                    await Promise.all([
                        mutateCurrentUser(),
                        mutateAllUsers()
                    ]);
                }
            }
        };

        socket.on("linkRequestAccepted", handleLinkRequestAccepted);
        socket.on("linkRequestRejected", handleLinkRequestRejected);
        socket.on("linkRequestReceived", handleLinkRequestReceived);
        socket.on("userUnlinked", handleUserUnlinked);
        socket.on("unlinked", handleUnlinked);

        return () => {
            socket.off("linkRequestAccepted", handleLinkRequestAccepted);
            socket.off("linkRequestRejected", handleLinkRequestRejected);
            socket.off("linkRequestReceived", handleLinkRequestReceived);
            socket.off("userUnlinked", handleUserUnlinked);
            socket.off("unlinked", handleUnlinked);
        };
    }, [socket, receiverId, currentUser, mutateCurrentUser, mutateAllUsers]);

    const handleLinkUp = async (e?: React.MouseEvent) => {
        // Prevent event bubbling to parent elements (e.g., when inside a clickable container)
        if (e) {
            e.stopPropagation();
        }

        if (status === "linked") {
            setShowUnlinkModal(true);
            return;
        }

        if (status === "requested") {
            return; // Already requested
        }

        try {
            setStatus("loading");
            await sendLinkRequest(receiverId);

            // Emit socket event
            if (socket) {
                socket.emit("sendLinkRequest", { receiverId });
            }

            setStatus("requested");
            toast.success("Link request sent!");
        } catch (error) {
            setStatus("none");
            toast.error(error instanceof Error ? error.message : "Failed to send request");
        }
    };

    const handleUnlink = async () => {
        try {
            await authFetch("/api/link-requests/unlink-users", {
                method: "POST",
                body: JSON.stringify({ otherUserId: receiverId }),
            });

            // Refresh user data via SWR mutate (industry standard)
            await Promise.all([
                mutateCurrentUser(),
                mutateAllUsers()
                ]);

            // Socket events are now handled by the API route via socket server
            // Real-time updates will be received via socket listeners in useEffect

            setStatus("none");
            setShowUnlinkModal(false);
            toast.success("Unlinked successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to unlink");
        }
    };

    if (status === "loading") {
        // Skeleton button that matches the real button styling exactly
        const skeletonBaseClasses = variant === "border"
            ? "border-2 font-bold border-black dark:border-white px-4 rounded-lg w-fit h-fit py-1 text-sm md:text-base flex items-center justify-center"
            : "bg-primary-light dark:bg-primary-dark px-4 md:px-6 py-2 rounded-2xl font-semibold shadow-lg text-sm md:text-base w-full md:w-auto flex items-center justify-center";

        return (
            <div className={`${skeletonBaseClasses} ${className} relative overflow-hidden skeleton-wiggle`}>
                {/* Shimmer effect overlay */}
                <div className="absolute inset-0 animate-shimmer opacity-60 pointer-events-none" />
                
                {/* Text placeholder - matches approximate button text width */}
                <div className={`relative ${
                    variant === "border"
                        ? "h-4 w-14 md:w-16 bg-gray-300/70 dark:bg-gray-600/70 rounded"
                        : "h-4 w-20 md:w-24 bg-gray-300/50 dark:bg-gray-600/50 rounded"
                }`} />
            </div>
        );
    }

    const buttonText = status === "linked" ? "Linked" : status === "requested" ? "Requested" : "LinkUp";

    const baseClasses = variant === "border"
        ? "border-2 font-bold border-black dark:border-white px-4 rounded-lg hover:bg-white hover:text-black dark:hover:bg-gray-800 dark:hover:text-white transition-colors w-fit h-fit py-1 text-sm md:text-base"
        : "bg-primary-light dark:bg-primary-dark text-right-nav-light dark:text-gray-100 px-4 md:px-6 py-2 rounded-2xl font-semibold shadow-lg hover:brightness-110 transition text-sm md:text-base w-full md:w-auto";

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleLinkUp(e);
                }}
                className={`${baseClasses} bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-pink-500 hover:via-purple-500 hover:to-violet-500 ${className} ${status === "requested" ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={status === "requested"}
            >
                {buttonText}
            </button>
            {showUnlinkModal && (
                <UnlinkModal
                    onConfirm={handleUnlink}
                    onCancel={() => setShowUnlinkModal(false)}
                />
            )}
        </>
    );
}

