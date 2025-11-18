let refreshPromise: Promise<unknown> | null = null;

export async function safeRefresh(): Promise<unknown> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  })
    .then(async (res): Promise<unknown> => {
      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof json === "object" && json && "error" in json
            ? (json.error as string)
            : "Failed to refresh"
        );
      }

      return json;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}