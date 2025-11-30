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

        // Check if already linked
        // Only show "Linked" if current user is the requester (has receiverId in linked_to)
        // If current user is the receiver (has receiverId in linked_by), show "LinkUp" instead
        if (currentUser.linked_to.includes(receiverId)) {
            setStatus("linked");
            return;
        }
        
        // If user is in linked_by, they are the receiver, so don't show "Linked"
        if (currentUser.linked_by.includes(receiverId)) {
            setStatus("none");
            return;
        }

        // Check request status
        getLinkStatus(receiverId)
            .then((data) => {
                if (data.status === "linked") {
                    setStatus("linked");
                } else if (data.status === "requested") {
                    setStatus("requested");
                } else {
                    setStatus("none");
                }
            })
            .catch(() => {
                setStatus("none");
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

        socket.on("linkRequestAccepted", handleLinkRequestAccepted);
        socket.on("userUnlinked", handleUserUnlinked);
        socket.on("unlinked", handleUnlinked);

        return () => {
            socket.off("linkRequestAccepted", handleLinkRequestAccepted);
            socket.off("userUnlinked", handleUserUnlinked);
            socket.off("unlinked", handleUnlinked);
        };
    }, [socket, receiverId, currentUser, mutateCurrentUser, mutateAllUsers]);

    const handleLinkUp = async () => {
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
        return (
            <button
                className={`${className} opacity-50 cursor-not-allowed`}
                disabled
            >
                Loading...
            </button>
        );
    }

    const buttonText = status === "linked" ? "Linked" : status === "requested" ? "Requested" : "LinkUp";

    const baseClasses = variant === "border"
        ? "border-2 font-bold border-black dark:border-white px-4 rounded-lg hover:bg-white hover:text-black dark:hover:bg-gray-800 dark:hover:text-white transition-colors w-fit h-fit py-1 text-sm md:text-base"
        : "bg-primary-light dark:bg-primary-dark text-right-nav-light dark:text-gray-100 px-4 md:px-6 py-2 rounded-2xl font-semibold shadow-lg hover:brightness-110 transition text-sm md:text-base w-full md:w-auto";

    return (
        <>
            <button
                onClick={handleLinkUp}
                className={`${baseClasses} ${className} ${status === "requested" ? "opacity-60 cursor-not-allowed" : ""}`}
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

