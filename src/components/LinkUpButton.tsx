"use client";

import React, { useState, useEffect } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { useUserStore } from "@/store/useUserStore";
import { sendLinkRequest, getLinkStatus } from "@/utils/linkRequestApi";
import { authFetch } from "@/lib/authFetch";
import { getCurrentUser, getAllUsers } from "@/utils/api";
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
    const { user, setUser, setUsers } = useUserStore();

    useEffect(() => {
        if (!user || !receiverId) return;

        // Don't show button if trying to link to self
        if (user._id === receiverId) {
            setStatus("none");
            return;
        }

        // Check if already linked
        // Only show "Linked" if current user is the requester (has receiverId in linked_to)
        // If current user is the receiver (has receiverId in linked_by), show "LinkUp" instead
        if (user.linked_to.includes(receiverId)) {
            setStatus("linked");
            return;
        }
        
        // If user is in linked_by, they are the receiver, so don't show "Linked"
        if (user.linked_by.includes(receiverId)) {
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
    }, [user, receiverId]);

    useEffect(() => {
        if (!socket) return;

        const handleLinkRequestAccepted = (data: { requestId: string; receiverId: string }) => {
            if (data.receiverId === receiverId || user?._id === data.receiverId) {
                setStatus("linked");
            }
        };

        const handleUnlinked = async () => {
            setStatus("none");
            // Update current user data and users list to reflect the unlink
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
                console.error("Failed to update user data after unlink:", error);
            }
        };

        socket.on("linkRequestAccepted", handleLinkRequestAccepted);
        socket.on("unlinked", handleUnlinked);

        return () => {
            socket.off("linkRequestAccepted", handleLinkRequestAccepted);
            socket.off("unlinked", handleUnlinked);
        };
    }, [socket, receiverId, user, setUser, setUsers]);

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

            // Emit socket event
            if (socket) {
                socket.emit("unlink", { otherUserId: receiverId });
            }

            // Update current user data and users list to reflect the unlink
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

