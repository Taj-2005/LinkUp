"use client";

import React, { useState } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { useLinkStatus, LinkStatus } from "@/hooks/useLinkStatus";
import { sendLinkRequest } from "@/utils/linkRequestApi";
import { authFetch } from "@/lib/authFetch";
import { invalidateGlobalLinkUpCaches } from "@/utils/globalCacheInvalidation";
import { optimisticUpdateUser } from "@/utils/swrCache";
import { useUsers } from "@/hooks/useUsers";
import UnlinkModal from "./UnlinkModal";
import toast from "react-hot-toast";

interface LinkUpButtonProps {
    receiverId: string;
    className?: string;
    variant?: "default" | "border";
    status?: LinkStatus;
    isLoading?: boolean;
}

export default function LinkUpButton({ receiverId, className = "", variant = "default", status: providedStatus, isLoading: providedIsLoading }: LinkUpButtonProps) {
    const [showUnlinkModal, setShowUnlinkModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const socket = useSocketStore((state) => state.socket);
    const { currentUser } = useUsers();

    const shouldUseHook = providedStatus === undefined;
    const { status: hookStatus, isLoading: hookIsLoading } = useLinkStatus(
        shouldUseHook ? receiverId : ""
    );

    const status = shouldUseHook ? hookStatus : (providedStatus || "none");
    const isLoading = shouldUseHook ? hookIsLoading : (providedIsLoading || false);

    const handleLinkUp = async (e?: React.MouseEvent) => {

        if (e) {
            e.stopPropagation();
        }

        if (!currentUser) {
            toast.error("Please sign in to continue");
            return;
        }

        if (status === "linked" || status === "linked-by") {
            setShowUnlinkModal(true);
            return;
        }

        if (status === "requested" || status === "pending") {
            return;
        }

        if (isProcessing) {
            return;
        }

        setIsProcessing(true);

        const previousStatus = status;
        const previousLinkedTo = currentUser.linked_to || [];

        try {

            await optimisticUpdateUser(currentUser._id, {
                linked_to: [...previousLinkedTo],
            });

            await sendLinkRequest(receiverId);

            if (socket) {
                socket.emit("sendLinkRequest", { receiverId });
            }

            await invalidateGlobalLinkUpCaches(currentUser._id, receiverId);

            toast.success("Link request sent!");
        } catch (error) {

            await optimisticUpdateUser(currentUser._id, {
                linked_to: previousLinkedTo,
            });

            await invalidateGlobalLinkUpCaches(currentUser._id, receiverId);

            toast.error(error instanceof Error ? error.message : "Failed to send request");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUnlink = async () => {
        if (!currentUser) return;

        setIsProcessing(true);

        const previousLinkedTo = currentUser.linked_to || [];
        const previousLinkedBy = currentUser.linked_by || [];

        const isInLinkedTo = previousLinkedTo.includes(receiverId);
        const isInLinkedBy = previousLinkedBy.includes(receiverId);

        try {

            await optimisticUpdateUser(currentUser._id, {
                linked_to: isInLinkedTo
                    ? previousLinkedTo.filter(id => id !== receiverId)
                    : previousLinkedTo,
                linked_by: isInLinkedBy
                    ? previousLinkedBy.filter(id => id !== receiverId)
                    : previousLinkedBy,
            });

            await authFetch("/api/link-requests/unlink-users", {
                method: "POST",
                body: JSON.stringify({ otherUserId: receiverId }),
            });

            await invalidateGlobalLinkUpCaches(currentUser._id, receiverId);

            setShowUnlinkModal(false);
            toast.success("Unlinked successfully");
        } catch (error) {

            await optimisticUpdateUser(currentUser._id, {
                linked_to: previousLinkedTo,
                linked_by: previousLinkedBy,
            });

            await invalidateGlobalLinkUpCaches(currentUser._id, receiverId);

            toast.error(error instanceof Error ? error.message : "Failed to unlink");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        const skeletonBaseClasses = variant === "border"
            ? "border-2 font-bold border-black dark:border-white px-3 md:px-4 rounded-lg w-fit h-fit py-1 text-xs md:text-sm flex items-center justify-center"
            : "bg-primary-light dark:bg-primary-dark px-3 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl font-semibold shadow-lg text-xs md:text-base w-fit flex items-center justify-center";

        return (
            <div className={`${skeletonBaseClasses} ${className} relative overflow-hidden skeleton-wiggle`}>
                <div className="absolute inset-0 animate-shimmer opacity-60 pointer-events-none" />
                <div className={`relative ${
                    variant === "border"
                        ? "h-3 md:h-4 w-12 md:w-16 bg-gray-300/70 dark:bg-gray-600/70 rounded"
                        : "h-3 md:h-4 w-14 md:w-24 bg-gray-300/50 dark:bg-gray-600/50 rounded"
                }`} />
            </div>
        );
    }

    if (currentUser?._id === receiverId) {
        return null;
    }

    let buttonText = "LinkUp";
    if (status === "linked") {
        buttonText = "Linked";
    } else if (status === "linked-by") {
        buttonText = "Linked";
    } else if (status === "requested") {
        buttonText = "Requested";
    } else if (status === "pending") {
        buttonText = "Pending";
    }

    const isDisabled = status === "requested" || status === "pending" || isProcessing;

    const baseClasses = variant === "border"
        ? "border-2 font-bold border-black dark:border-white px-3 md:px-4 rounded-lg hover:bg-white hover:text-black dark:hover:bg-gray-800 dark:hover:text-white transition-colors w-fit h-fit py-1 text-xs md:text-sm"
        : "bg-primary-light dark:bg-primary-dark text-right-nav-light dark:text-gray-100 px-3 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl font-semibold shadow-lg hover:brightness-110 transition text-xs md:text-base w-fit";

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleLinkUp(e);
                }}
                className={`${baseClasses} bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-pink-500 hover:via-purple-500 hover:to-violet-500 ${className} ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={isDisabled}
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
