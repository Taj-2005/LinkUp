"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

interface LinkAcceptedToastProps {
    receiver: {
        _id: string;
        username: string;
        name: string;
        user_avatar?: string;
    };
    onClose: () => void;
    requestId: string;
}

export default function LinkAcceptedToast({ receiver, onClose }: LinkAcceptedToastProps) {
    const { resolvedTheme } = useTheme();
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClick = () => {
        router.push(`/linkhub/${receiver.username}`);
        onClose();
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-5 cursor-pointer hover:shadow-3xl transition-shadow">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                            src={
                                receiver.user_avatar
                                    ? receiver.user_avatar
                                    : resolvedTheme === "dark"
                                    ? "/dark-profile.png"
                                    : "/light-profile.png"
                            }
                            fill
                            alt={`${receiver.username} avatar`}
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-semibold text-gray-900 dark:text-white truncate">
                            {receiver.name}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                            @{receiver.username}
                        </p>
                        <p className="text-xs md:text-sm text-green-600 dark:text-green-400 mt-1 font-medium">
                            accepted your link request
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
