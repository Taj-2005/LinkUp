import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { getUnseenRequestCount } from "@/utils/linkRequestApi";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL!

interface SocketStore {
    socket: Socket | null;
    isConnected: boolean;
    unseenCount: number;
    setUnseenCount: (count: number) => void;
    initializeSocket: () => void;
    disconnectSocket: () => void;
}

let socketInstance: Socket | null = null;
let tokenCheckInterval: NodeJS.Timeout | null = null;

export const useSocketStore = create<SocketStore>((set, get) => {
    const fetchInitialCount = async () => {
        try {
            const data = await getUnseenRequestCount();
            const validCount = typeof data.count === "number" && data.count > 0 ? data.count : 0;
            get().setUnseenCount(validCount);
        } catch (error) {
            console.error("Failed to fetch initial unseen count:", error);
            get().setUnseenCount(0);
        }
    };

    return {
    socket: null,
    isConnected: false,
    unseenCount: 0,

    setUnseenCount: (count: number) => {
        const validCount = typeof count === "number" && count >= 0 ? count : 0;
        set({ unseenCount: validCount });
    },

    initializeSocket: () => {

        const token = Cookies.get("accessTokenReadable") || Cookies.get("accessToken");

        if (!token) {
            return;
        }

        if (socketInstance?.connected) {
            return;
        }

        if (socketInstance) {
            socketInstance.disconnect();
        }

        const socket = io(SOCKET_SERVER_URL, {
            auth: {
                token,
            },
            transports: ["websocket", "polling"],
        });

        socketInstance = socket;
        set({ socket });

        socket.on("connect", () => {
            set({ isConnected: true });
            console.log("Socket connected");

            socket.emit("getUnseenCount");

            fetchInitialCount();
        });

        socket.on("disconnect", () => {
            set({ isConnected: false });
            console.log("Socket disconnected");
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);

            set({ unseenCount: 0 });
        });

        socket.on("unseenCount:update", (data: { unseenCount: number; notificationCount?: number; linkRequestCount?: number }) => {
            const validCount = typeof data.unseenCount === "number" && data.unseenCount >= 0 ? data.unseenCount : 0;
            set({ unseenCount: validCount });
        });

        socket.on("unseenRequestCount", (count: number) => {

        });

        let storageHandler: ((e: StorageEvent) => void) | null = null;

        const handleTokenChange = () => {

            const newToken = Cookies.get("accessTokenReadable") || Cookies.get("accessToken");
            if (newToken && socket) {
                socket.auth = { token: newToken };

                if (socket.connected) {
                    socket.disconnect();
                    socket.connect();
                } else {
                    socket.connect();
                }
            }
        };

        if (tokenCheckInterval) {
            clearInterval(tokenCheckInterval);
        }

        tokenCheckInterval = setInterval(handleTokenChange, 10000);

        if (typeof window !== "undefined") {
            storageHandler = (e: StorageEvent) => {
                if (e.key === null || e.key?.includes("accessToken")) {
                    handleTokenChange();
                }
            };
            window.addEventListener("storage", storageHandler);
        }

        socket.on("disconnect", () => {
            if (storageHandler && typeof window !== "undefined") {
                window.removeEventListener("storage", storageHandler);
            }
        });
    },

    disconnectSocket: () => {
        if (tokenCheckInterval) {
            clearInterval(tokenCheckInterval);
            tokenCheckInterval = null;
        }
        if (socketInstance) {
            socketInstance.disconnect();
            socketInstance = null;
        }
        set({ socket: null, isConnected: false, unseenCount: 0 });
    },
    };
});
