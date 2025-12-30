import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { refreshTokenForSocket, getAccessToken } from "@/lib/socketAuthRefresh";

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
let isRefreshing = false;

export const useSocketStore = create<SocketStore>((set) => {
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
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
            });

            socketInstance = socket;
            set({ socket });

            socket.on("connect", () => {
                set({ isConnected: true });
                console.log("Socket connected - waiting for initial unseen count from server");
                
                socket.emit("getUnseenCount");
            });

            let storageHandler: ((e: StorageEvent) => void) | null = null;

            socket.on("disconnect", async (reason) => {
                set({ isConnected: false });
                console.log("Socket disconnected:", reason);

                if (storageHandler && typeof window !== "undefined") {
                    window.removeEventListener("storage", storageHandler);
                }

                const isServerDisconnect = reason === "io server disconnect";
                
                if (isServerDisconnect && !isRefreshing && socketInstance) {
                    const token = getAccessToken();
                    if (!token) {
                        isRefreshing = true;
                        const refreshSuccess = await refreshTokenForSocket();
                        
                        if (refreshSuccess) {
                            const newToken = getAccessToken();
                            if (newToken && socketInstance) {
                                socketInstance.auth = { token: newToken };
                                socketInstance.connect();
                            }
                        }
                        isRefreshing = false;
                    }
                }
            });

            socket.on("connect_error", async (error) => {
                const errorMessage = error.message || String(error);
                const isAuthError = errorMessage.includes("Authentication error") || 
                                   errorMessage.includes("Invalid token") ||
                                   errorMessage.includes("No token provided");

                if (isAuthError && !isRefreshing) {
                    isRefreshing = true;
                    const refreshSuccess = await refreshTokenForSocket();
                    
                    if (refreshSuccess) {
                        const newToken = getAccessToken();
                        if (newToken && socket) {
                            socket.auth = { token: newToken };
                            socket.disconnect();
                            socket.connect();
                        }
                    }
                    isRefreshing = false;
                } else {
                    console.error("Socket connection error:", error);
                    set({ unseenCount: 0 });
                }
            });

            socket.on("unseenCount:update", (data: { unseenCount: number; notificationCount?: number; linkRequestCount?: number }) => {
                const validCount = typeof data.unseenCount === "number" && data.unseenCount >= 0 ? data.unseenCount : 0;
                set((state) => {
                    if (state.unseenCount === 0 || validCount === 0) {
                        return { unseenCount: validCount };
                    }
                    return state;
                });
            });

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

            if (typeof window !== "undefined") {
                storageHandler = (e: StorageEvent) => {
                    if (e.key === null || e.key?.includes("accessToken")) {
                        handleTokenChange();
                    }
                };
                window.addEventListener("storage", storageHandler);
            }

        },

        disconnectSocket: () => {
            if (socketInstance) {
                socketInstance.disconnect();
                socketInstance = null;
            }
            set({ socket: null, isConnected: false, unseenCount: 0 });
        },
    };
});
