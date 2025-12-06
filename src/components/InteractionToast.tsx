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
        avatar?: string;
    };
    type: "comment" | "reply" | "like" | "save";
    linkId: string;
    deepLink: string;
    onClose: () => void;
}

export default function InteractionToast({ actor, type, deepLink, onClose }: InteractionToastProps) {
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
                return `${actor.username} commented on your link`;
            case "reply":
                return `${actor.username} replied to your link`;
            case "like":
                return `${actor.username} liked your link`;
            case "save":
                return `${actor.username} saved your link`;
            default:
                return `${actor.username} interacted with your link`;
        }
    };

    const getIcon = (): string => {
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

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -50, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[90vw] max-w-sm md:max-w-md"
            onClick={handleClick}
        >
            <div className="bg-left-nav-dark dark:bg-left-nav-dark rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-5 cursor-pointer hover:shadow-3xl transition-shadow ring-2 ring-violet-500/20">
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
                            alt={`${actor.username} avatar`}
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            {getIcon() && <span className="text-xl">{getIcon()}</span>}
                            <p className="text-sm md:text-base font-semibold text-primary-light dark:text-primary-light truncate">
                                {actor.username}
                            </p>
                        </div>
                        <p className="text-xs md:text-sm text-primary-light/80 dark:text-primary-light/80 mt-1">
                            {getMessage()}
                        </p>
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
