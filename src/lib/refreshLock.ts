let refreshPromise: Promise<unknown> | null = null;

export function lockRefresh(fn: () => Promise<unknown>) {
  if (!refreshPromise) {
    refreshPromise = fn().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
