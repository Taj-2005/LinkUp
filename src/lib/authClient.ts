let refreshPromise: Promise<any> | null = null;

export async function safeRefresh() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  })
    .then(async (res) => {
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to refresh");
      return json;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}
