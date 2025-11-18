import { lockRefresh } from "@/lib/refreshLock";

export async function authFetch(url: string, options: RequestInit = {}) {
  const opts: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(url, opts);
  let json = null;
  try { json = await res.json(); } catch {}

  const expired = res.status === 401 || res.status === 403 || res.status === 409;

  if (expired) {
    try {
      await lockRefresh(async () => {
        const r = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Failed to refresh");
      });

      res = await fetch(url, opts);
      json = await res.json();
    } catch (err) {
      window.location.href = "/";
      throw err;
    }
  }

  if (!res.ok) throw new Error(json?.error || "Request failed");

  return json;
}