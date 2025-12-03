import { lockRefresh } from "@/lib/refreshLock";
import { signout } from "@/utils/api";

function isErrorObj(val: unknown): val is { error: string } {
  return typeof val === "object" && val !== null && "error" in val;
}

let isRedirecting = false;

export async function authFetch(url: string, options: RequestInit = {}) {
  if (isRedirecting) {
    return Promise.reject(new Error("Redirecting to signin"));
  }

  const opts: RequestInit = {
    ...options,
    credentials: "include" as RequestCredentials,
    headers: new Headers({
      "Content-Type": "application/json",
      ...(options.headers || {}),
    }),
  };

  let res = await fetch(url, opts);
  let data: unknown = null;

  try {
    data = await res.clone().json();
  } catch {}

  if (res.status === 401) {
    try {
      await lockRefresh(async () => {
        const refresh = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include" as RequestCredentials,
        });

        if (!refresh.ok) throw new Error("Refresh failed");
      });

      res = await fetch(url, opts);
      data = await res.clone().json().catch(() => null);

      if (!res.ok) {
        throw new Error(isErrorObj(data) ? data.error : "Request failed");
      }

      return data;
    } catch {
      if (!isRedirecting) {
        isRedirecting = true;
        await signout()
        window.location.href = "/";
      }
      return Promise.reject(new Error("Authentication failed"));
    }
  }

  if (!res.ok) {
    throw new Error(isErrorObj(data) ? data.error : "Request failed");
  }

  return data;
}
