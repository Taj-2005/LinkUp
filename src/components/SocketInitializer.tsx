"use client";

import { useEffect } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { useUsers } from "@/hooks/useUsers";
import { getUnseenRequestCount } from "@/utils/linkRequestApi";
import Cookies from "js-cookie";

export default function SocketInitializer({ children }: { children: React.ReactNode }) {
    const { initializeSocket, disconnectSocket, setUnseenCount } = useSocketStore();
    const { currentUser } = useUsers();
    const user = currentUser;

    useEffect(() => {
        // Initialize socket when user is logged in
        if (user) {
            initializeSocket();
            
            // Fetch initial count via API
            const fetchCount = async () => {
                try {
                    // Try readable cookie first, then fallback to regular cookie
                    const token = Cookies.get("accessTokenReadable") || Cookies.get("accessToken");
                    if (token) {
                        const data = await getUnseenRequestCount();
                        const validCount = typeof data.count === "number" && data.count > 0 ? data.count : 0;
                        setUnseenCount(validCount);
                    }
                } catch (error) {
                    console.error("Failed to fetch initial count:", error);
                    setUnseenCount(0);
                }
            };
            
            fetchCount();
        } else {
            disconnectSocket();
            setUnseenCount(0);
        }

        // Cleanup on unmount
        return () => {
            if (!user) {
                disconnectSocket();
            }
        };
    }, [user, initializeSocket, disconnectSocket, setUnseenCount]);

    return <>{children}</>;
}

