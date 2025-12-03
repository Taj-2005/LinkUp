"use client";

import { useEffect } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { useUsers } from "@/hooks/useUsers";
import { getCombinedUnreadCount } from "@/utils/notificationBadge";
import { setupLinkSocketHandlers } from "@/utils/socketHandlers";
import { mutate } from "swr";
import Cookies from "js-cookie";

export default function SocketInitializer({ children }: { children: React.ReactNode }) {
    const { initializeSocket, disconnectSocket, setUnseenCount, socket } = useSocketStore();
    const { currentUser } = useUsers();
    const user = currentUser;

    useEffect(() => {

        if (user) {
            initializeSocket();

            const fetchInitialCount = async () => {
                try {

                    const token = Cookies.get("accessTokenReadable") || Cookies.get("accessToken");
                    if (token) {
                        const count = await getCombinedUnreadCount();
                        const validCount = typeof count === "number" && count > 0 ? count : 0;
                        setUnseenCount(validCount);
                    }
                } catch{
                    setUnseenCount(0);
                }
            };

            fetchInitialCount();
        } else {
            disconnectSocket();
            setUnseenCount(0);
        }

        return () => {
            if (!user) {
                disconnectSocket();
            }
        };
    }, [user, initializeSocket, disconnectSocket, setUnseenCount]);

    useEffect(() => {
        if (!socket || !currentUser?._id) return;

        const cleanup = setupLinkSocketHandlers(socket, currentUser._id);

        return cleanup;
    }, [socket, currentUser?._id]);

    useEffect(() => {
        if (!socket || !currentUser?._id) return;

        const handleNewNotification = () => {

            mutate("notifications");

        };

        const handleNotificationUpdate = (data: {
            unseenCount: number;
            action: string;
            notificationId?: string;
        }) => {

            mutate("notifications");

        };

        const handleUnseenCountUpdate = (data: {
            unseenCount: number;
            notificationCount?: number;
            linkRequestCount?: number;
        }) => {

            const validCount = typeof data.unseenCount === "number" && data.unseenCount >= 0
                ? data.unseenCount
                : 0;
            setUnseenCount(validCount);

            if (typeof data.notificationCount === "number") {
                mutate("notifications");
            }
        };

        socket.on("notification:new", handleNewNotification);
        socket.on("notification:update", handleNotificationUpdate);
        socket.on("unseenCount:update", handleUnseenCountUpdate);

        return () => {
            socket.off("notification:new", handleNewNotification);
            socket.off("notification:update", handleNotificationUpdate);
            socket.off("unseenCount:update", handleUnseenCountUpdate);
        };
    }, [socket, currentUser?._id, setUnseenCount]);

    return <>{children}</>;
}
