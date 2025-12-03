import Cookies from "js-cookie";
import { lockRefresh } from "@/lib/refreshLock";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL!
const API_BASE = `${SOCKET_SERVER_URL}/api/link-requests`;

async function fetchWithAuth(url: string, options: RequestInit = {}) {

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

                const refreshData = await refresh.json();
                newToken = refreshData.accessToken || null;
            });

            if (!newToken) {

                newToken = Cookies.get("accessTokenReadable") || Cookies.get("accessToken") || null;

                if (!newToken) {

                    await new Promise(resolve => setTimeout(resolve, 100));
                    newToken = Cookies.get("accessTokenReadable") || Cookies.get("accessToken") || null;
                }
            }

            if (!newToken) {
                throw new Error("Token refresh failed - please sign in again");
            }

            token = newToken;

            response = await fetch(url, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    ...options.headers,
                },
            });

            if (response.status === 401) {
                throw new Error("Authentication failed after token refresh");
            }

            if (typeof window !== "undefined" && token) {
                try {
                    const { useSocketStore } = await import("@/store/useSocketStore");
                    const socket = useSocketStore.getState().socket;
                    if (socket) {
                        socket.auth = { token };

                        if (socket.connected) {
                            socket.disconnect();
                            socket.connect();
                        } else {
                            socket.connect();
                        }
                    }
                } catch (error) {

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

export async function getBatchLinkStatus(userIds: string[]): Promise<Record<string, { status: string; requestId?: string }>> {
    if (!userIds || userIds.length === 0) {
        return {};
    }

    const validUserIds = userIds.slice(0, 1000).filter(id => id && id.trim().length > 0);

    if (validUserIds.length === 0) {
        return {};
    }

    const idsParam = validUserIds.join(",");

    return fetchWithAuth(`${API_BASE}/batch-status?ids=${encodeURIComponent(idsParam)}`, {
        method: "GET",
    });
}
