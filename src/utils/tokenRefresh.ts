import { refreshAccessToken } from "@/utils/api";

export default function startAutoTokenRefresh() {
  const interval = 14 * 60 * 1000;

  const refresh = async () => {
    try {
      console.log("♻️ Refreshing tokens...");
      await refreshAccessToken();
    } catch (err) {
      console.warn("⚠️ Token refresh failed:", err);
    }
  };

  refresh();

  const intervalId = setInterval(refresh, interval);
  return intervalId;
}
