let refreshPromise: Promise<unknown> | null = null;

export function lockRefresh(refreshFn: () => Promise<unknown>) {
  if (!refreshPromise) {
    refreshPromise = refreshFn().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
