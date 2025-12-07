"use client";

import { SWRConfig } from "swr";

const swrGlobalConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  refreshInterval: 0,
  
  shouldRetryOnError: false,
  errorRetryCount: 0,
  
  dedupingInterval: 2000,
  
  keepPreviousData: true,
  
  provider: () => new Map(),
};

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={swrGlobalConfig}>
      {children}
    </SWRConfig>
  );
}

