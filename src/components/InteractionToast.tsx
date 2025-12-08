"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

interface InteractionToastProps {
    actor: {
        _id: string;
        username: string;
        name?: string;
        avatar?: string;
    };
    type: "comment" | "reply" | "like" | "save";
    linkId: string;
    deepLink: string;
    commentText?: string;
    onClose: () => void;
}

export default function InteractionToast({ actor, type, deepLink, commentText, onClose }: InteractionToastProps) {
    const { resolvedTheme } = useTheme();
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClick = () => {

        router.push(deepLink);
        onClose();
    };

    const getMessage = (): string => {
        switch (type) {
            case "comment":
                return "commented on your link";
            case "reply":
                return "replied to your link";
            case "like":
                return "liked your post";
            case "save":
                return "saved your link";
            default:
                return "interacted with your link";
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: -50, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -50, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[90vw] max-w-sm md:max-w-md"
            onClick={handleClick}
        >
            <div className={`bg-left-nav-dark dark:bg-left-nav-dark rounded-2xl shadow-2xl border p-4 md:p-5 cursor-pointer hover:shadow-3xl transition-shadow ${
                type === "like"
                    ? "border-red-500/30 dark:border-red-500/30 ring-2 ring-red-500/20"
                    : "border-gray-200 dark:border-gray-700 ring-2 ring-violet-500/20"
            }`}>
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-violet-500/50">
                        <Image
                            src={
                                actor.avatar
                                    ? actor.avatar
                                    : resolvedTheme === "dark"
                                    ? "/dark-profile.png"
                                    : "/light-profile.png"
                            }
                            fill
                            alt={`${actor.name || actor.username} avatar`}
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm md:text-base font-medium text-primary-light dark:text-primary-light ${
                            type === "like" 
                                ? "text-red-400 dark:text-red-400" 
                                : ""
                        }`}>
                            @{actor.username} {getMessage()}
                        </p>
                        {commentText && (type === "comment" || type === "reply") && (
                            <p className="text-xs md:text-sm mt-1.5 text-primary-light/70 dark:text-primary-light/70 line-clamp-2 italic">
                                &quot;{commentText}&quot;
                            </p>
                        )}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 md:h-6 md:w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
    