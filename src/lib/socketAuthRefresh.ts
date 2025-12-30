import { lockRefresh } from "@/lib/refreshLock";
import { signout } from "@/utils/api";

let isSigningOut = false;

export async function refreshTokenForSocket(): Promise<boolean> {
  if (isSigningOut) {
    return false;
  }

  try {
    await lockRefresh(async () => {
      const refresh = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!refresh.ok) {
        throw new Error("Refresh failed");
      }
    });

    return true;
  } catch {
    if (!isSigningOut) {
      isSigningOut = true;
      try {
        await signout();
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      } catch {
      }
    }
    return false;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";");
  let accessTokenReadable: string | null = null;
  let accessToken: string | null = null;

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "accessTokenReadable") {
      accessTokenReadable = decodeURIComponent(value);
    } else if (name === "accessToken") {
      accessToken = decodeURIComponent(value);
    }
  }

  return accessTokenReadable || accessToken;
}

