import Cookies from "js-cookie";
import { lockRefresh } from "@/lib/refreshLock";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";
const API_BASE = `${SOCKET_SERVER_URL}/api/link-requests`;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    // Try readable cookie first, then fallback to regular cookie
    let token = Cookies.get("accessTokenReadable") || Cookies.get("accessToken");

    if (!token) {
        throw new Error("Not authenticated");
    }

    let response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    // Handle 401 - token expired, try to refresh
    if (response.status === 401) {
        try {
            let newToken: string | null = null;
            
            await lockRefresh(async () => {
                const refresh = await fetch("/api/auth/refresh", {
                    method: "POST",
                    credentials: "include",
                });

                if (!refresh.ok) {
                    const errorData = await refresh.json().catch(() => ({}));
                    throw new Error(errorData.error || "Refresh failed");
                }

                // Get the new accessToken from response body
                const refreshData = await refresh.json();
                newToken = refreshData.accessToken || null;
            });

            // Use the token from response, or try to get from readable cookie as fallback
            if (!newToken) {
                // Fallback: try to read from readable cookie
                newToken = Cookies.get("accessTokenReadable") || Cookies.get("accessToken") || null;
                
                if (!newToken) {
                    // Wait a bit for cookie to be set and try again
                    await new Promise(resolve => setTimeout(resolve, 100));
                    newToken = Cookies.get("accessTokenReadable") || Cookies.get("accessToken") || null;
                }
            }

            if (!newToken) {
                throw new Error("Token refresh failed - please sign in again");
            }

            token = newToken;

            // Retry request with new token
            response = await fetch(url, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    ...options.headers,
                },
            });

            // If still 401 after refresh, authentication failed
            if (response.status === 401) {
                throw new Error("Authentication failed after token refresh");
            }

            // Update socket token if socket exists (dynamic import to avoid circular dependency)
            if (typeof window !== "undefined" && token) {
                try {
                    const { useSocketStore } = await import("@/store/useSocketStore");
                    const socket = useSocketStore.getState().socket;
                    if (socket) {
                        socket.auth = { token };
                        // Reconnect to apply new token
                        if (socket.connected) {
                            socket.disconnect();
                            socket.connect();
                        } else {
                            socket.connect();
                        }
                    }
                } catch (error) {
                    // Ignore if store not available
                    console.error("Failed to update socket token:", error);
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Authentication failed";
            throw new Error(errorMessage);
        }
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Request failed" }));
        throw new Error(error.error || "Request failed");
    }

    return response.json();
}

export async function sendLinkRequest(receiverId: string) {
    return fetchWithAuth(`${API_BASE}/send`, {
        method: "POST",
        body: JSON.stringify({ receiverId }),
    });
}

export async function acceptLinkRequest(requestId: string) {
    return fetchWithAuth(`${API_BASE}/accept`, {
        method: "POST",
        body: JSON.stringify({ requestId }),
    });
}

export async function rejectLinkRequest(requestId: string) {
    return fetchWithAuth(`${API_BASE}/reject`, {
        method: "POST",
        body: JSON.stringify({ requestId }),
    });
}

export async function getLinkRequests() {
    return fetchWithAuth(`${API_BASE}/get`);
}

export async function getLinkStatus(receiverId: string) {
    return fetchWithAuth(`${API_BASE}/status`, {
        method: "POST",
        body: JSON.stringify({ receiverId }),
    });
}

export async function getUnseenRequestCount() {
    return fetchWithAuth(`${API_BASE}/unseen-count`);
}

export async function markRequestAsSeen(requestId: string) {
    return fetchWithAuth(`${API_BASE}/mark-seen`, {
        method: "POST",
        body: JSON.stringify({ requestId }),
    });
}

