import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { getUnseenRequestCount } from "@/utils/linkRequestApi";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";

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
        // Try readable cookie first, then fallback to regular cookie
        const token = Cookies.get("accessTokenReadable") || Cookies.get("accessToken");

        if (!token) {
            return;
        }

        // Don't initialize if already connected
        if (socketInstance?.connected) {
            return;
        }

        // Clean up existing connection if any
        if (socketInstance) {
            socketInstance.disconnect();
        }

        // Initialize socket connection
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
            // Request unseen count on connect via socket
            socket.emit("getUnseenCount");
            // Also fetch via API as backup
            fetchInitialCount();
        });

        socket.on("disconnect", () => {
            set({ isConnected: false });
            console.log("Socket disconnected");
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            // Reset count on connection error
            set({ unseenCount: 0 });
        });

        socket.on("unseenRequestCount", (count: number) => {
            const validCount = typeof count === "number" && count >= 0 ? count : 0;
            set({ unseenCount: validCount });
        });

        socket.on("linkRequestReceived", () => {
            // Request updated count
            socket.emit("getUnseenCount");
        });

        // Listen for token refresh and reconnect
        let storageHandler: ((e: StorageEvent) => void) | null = null;
        
        const handleTokenChange = () => {
            // Try readable cookie first, then fallback to regular cookie
            const newToken = Cookies.get("accessTokenReadable") || Cookies.get("accessToken");
            if (newToken && socket) {
                socket.auth = { token: newToken };
                // Reconnect to apply new token
                if (socket.connected) {
                    socket.disconnect();
                    socket.connect();
                } else {
                    socket.connect();
                }
            }
        };

        // Clear existing interval if any
        if (tokenCheckInterval) {
            clearInterval(tokenCheckInterval);
        }

        // Check for token changes periodically (every 10 seconds)
        tokenCheckInterval = setInterval(handleTokenChange, 10000);
        
        // Also listen for storage events (when token is updated in another tab)
        if (typeof window !== "undefined") {
            storageHandler = (e: StorageEvent) => {
                if (e.key === null || e.key?.includes("accessToken")) {
                    handleTokenChange();
                }
            };
            window.addEventListener("storage", storageHandler);
        }
        
        // Cleanup storage listener on disconnect
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

