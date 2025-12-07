"use client";

import { useEffect } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { useUsers } from "@/hooks/useUsers";
import { setupLinkSocketHandlers } from "@/utils/socketHandlers";
import { useSocket } from "@/hooks/useSocket";

export default function SocketInitializer({ children }: { children: React.ReactNode }) {
    const { initializeSocket, disconnectSocket, socket } = useSocketStore();
    const { currentUser } = useUsers();
    const user = currentUser;

    useSocket();

    useEffect(() => {
        if (user) {
            initializeSocket();
        } else {
            disconnectSocket();
        }

        return () => {
            if (!user) {
                disconnectSocket();
            }
        };
    }, [user, initializeSocket, disconnectSocket]);

    useEffect(() => {
        if (!socket || !currentUser?._id) return;

        const cleanup = setupLinkSocketHandlers(socket, currentUser._id);

        return cleanup;
    }, [socket, currentUser?._id]);

    return <>{children}</>;
}
