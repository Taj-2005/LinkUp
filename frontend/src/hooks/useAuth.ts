"use client";

import { useEffect, useState } from "react";
import { refreshAccessToken } from "@/utils/api";

export function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
  );

  async function refresh() {
    try {
      const { accessToken } = await refreshAccessToken();

      setAccessToken(accessToken);
      localStorage.setItem("accessToken", accessToken);

      document.cookie = `accessToken=${accessToken}; path=/; SameSite=Lax`;
    } catch {
      setAccessToken(null);
      localStorage.removeItem("accessToken");
      document.cookie = "accessToken=; path=/; Max-Age=0";
    }
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { accessToken };
}
