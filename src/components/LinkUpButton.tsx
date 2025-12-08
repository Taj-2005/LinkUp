"use client";

import React, { useState } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { useLinkStatus, LinkStatus } from "@/hooks/useLinkStatus";
import { sendLinkRequest } from "@/utils/linkRequestApi";
import { authFetch } from "@/lib/authFetch";
import { invalidateGlobalLinkUpCaches } from "@/utils/globalCacheInvalidation";
import { optimisticUpdateUser } from "@/utils/swrCache";
import { useUsers } from "@/hooks/useUsers";
import { mutate } from "swr";
import { invalidateLinkStatus } from "@/hooks/useLinkStatus";
import UnlinkModal from "./UnlinkModal";
import toast from "react-hot-toast";
import { showToastWithAvatar } from "@/utils/toastHelpers";

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
    const { currentUser, mutateCurrentUser, mutateAllUsers } = useUsers();

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

        const previousLinkedTo = currentUser.linked_to || [];

        try {
            await optimisticUpdateUser(currentUser._id, {
                linked_to: [...previousLinkedTo],
            });

            await Promise.all([
                mutateCurrentUser(),
                mutateAllUsers(),
                invalidateLinkStatus(currentUser._id, receiverId),
                mutate("/api/link-requests/pending"),
                mutate("/api/link-requests/sent"),
                mutate("/api/link-requests"),
                mutate("linkRequests", undefined, { revalidate: false }),
            ]);

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

            await Promise.all([
                mutateCurrentUser(),
                mutateAllUsers(),
                invalidateLinkStatus(currentUser._id, receiverId),
                invalidateGlobalLinkUpCaches(currentUser._id, receiverId),
            ]);

            toast.error(error instanceof Error ? error.message : "Failed to send request");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUnlink = async () => {
        if (!currentUser || isProcessing) return;

        setIsProcessing(true);

        const previousLinkedTo = currentUser.linked_to || [];
        const previousLinkedBy = currentUser.linked_by || [];

        const isInLinkedTo = previousLinkedTo.includes(receiverId);
        const isInLinkedBy = previousLinkedBy.includes(receiverId);

        setShowUnlinkModal(false);
        if (currentUser) {
          showToastWithAvatar(
            {
              username: currentUser.username || "You",
              user_avatar: currentUser.user_avatar,
              name: currentUser.name,
            },
            "unlinked successfully",
            { duration: 3000 }
          );
        }

        try {
            const updatedLinkedTo = isInLinkedTo
                ? previousLinkedTo.filter(id => id !== receiverId)
                : previousLinkedTo;
            const updatedLinkedBy = isInLinkedBy
                ? previousLinkedBy.filter(id => id !== receiverId)
                : previousLinkedBy;

            await optimisticUpdateUser(currentUser._id, {
                linked_to: updatedLinkedTo,
                linked_by: updatedLinkedBy,
            });

            mutate(
                "all-users",
                (users: { _id?: { toString(): string } | string; linked_to?: string[]; linked_by?: string[]; [key: string]: unknown }[] | undefined) => {
                    if (!users) return users;
                    return users.map((user) => {
                        const userId = user._id?.toString();
                        if (userId === receiverId) {
                            const otherLinkedTo = user.linked_to || [];
                            const otherLinkedBy = user.linked_by || [];
                            return {
                                ...user,
                                linked_to: otherLinkedTo.filter((id: string) => id !== currentUser._id),
                                linked_by: otherLinkedBy.filter((id: string) => id !== currentUser._id),
                            };
                        }
                        return user;
                    });
                },
                { revalidate: false }
            );

            mutate(
                ["link-status", currentUser._id, receiverId],
                { status: "none" },
                { revalidate: false }
            );
            mutate(
                ["link-status", receiverId, currentUser._id],
                { status: "none" },
                { revalidate: false }
            );

            await Promise.all([
                mutateCurrentUser(),
                mutateAllUsers(),
                mutate("/api/link-requests/pending", undefined, { revalidate: false }),
                mutate("/api/link-requests/sent", undefined, { revalidate: false }),
                mutate("/api/link-requests", undefined, { revalidate: false }),
                mutate("linkRequests", undefined, { revalidate: false }),
            ]);

            authFetch("/api/link-requests/unlink-users", {
                method: "POST",
                body: JSON.stringify({ otherUserId: receiverId }),
            }).catch((error) => {
                optimisticUpdateUser(currentUser._id, {
                    linked_to: previousLinkedTo,
                    linked_by: previousLinkedBy,
                });

                Promise.all([
                    mutateCurrentUser(),
                    mutateAllUsers(),
                    invalidateLinkStatus(currentUser._id, receiverId),
                    invalidateGlobalLinkUpCaches(currentUser._id, receiverId),
                ]);

                toast.error(error instanceof Error ? error.message : "Failed to unlink");
            });

        } catch (error) {
            await optimisticUpdateUser(currentUser._id, {
                linked_to: previousLinkedTo,
                linked_by: previousLinkedBy,
            }); 

            await Promise.all([
                mutateCurrentUser(),
                mutateAllUsers(),
                invalidateLinkStatus(currentUser._id, receiverId),
                invalidateGlobalLinkUpCaches(currentUser._id, receiverId),
            ]);

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
