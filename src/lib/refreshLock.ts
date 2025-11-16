let refreshPromise: Promise<any> | null = null;

export function lockRefresh(refreshFn: () => Promise<any>) {
  if (!refreshPromise) {
    refreshPromise = refreshFn().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
