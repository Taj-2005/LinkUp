/**
 * Custom hooks for fetching links data via SWR
 * 
 * These hooks provide centralized access to links data with SWR caching,
 * following the same pattern as useUsers hook.
 */

import useSWR from "swr";
import { ILink } from "@/models/Link";

interface LinkWithUser extends ILink {
  userInfo?: {
    username?: string;
    user_avatar?: string;
    name?: string;
  } | null;
}

// Fetcher function for feed links
async function fetchFeedLinks(): Promise<LinkWithUser[]> {
  const res = await fetch("/api/links/feed", {
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch links" }));
    throw new Error(error.error || "Failed to fetch links");
  }

  const data = await res.json();
  // Ensure links are sorted by createdAt descending (latest first)
  const links = (data.links || []).sort((a: LinkWithUser, b: LinkWithUser) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Descending order
  });
  return links;
}

// Fetcher function for user links
async function fetchUserLinks(userId: string): Promise<ILink[]> {
  const res = await fetch(`/api/links/user/${userId}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch links" }));
    throw new Error(error.error || "Failed to fetch links");
  }

  const data = await res.json();
  // Ensure links are sorted by createdAt descending (latest first)
  const links = (data.links || []).sort((a: ILink, b: ILink) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Descending order
  });
  return links;
}

// Fetcher function for saved links
async function fetchSavedLinks(): Promise<LinkWithUser[]> {
  const res = await fetch("/api/links/saved", {
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch saved links" }));
    throw new Error(error.error || "Failed to fetch saved links");
  }

  const data = await res.json();
  // Ensure links are sorted by createdAt descending (latest first)
  const links = (data.links || []).sort((a: LinkWithUser, b: LinkWithUser) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Descending order
  });
  return links;
}

/**
 * Hook for fetching all feed links
 */
export function useFeedLinks() {
  const { data, error, mutate, isLoading } = useSWR<LinkWithUser[]>(
    "feed-links",
    fetchFeedLinks,
    {
      revalidateOnFocus: true, // Revalidate when window regains focus
      revalidateIfStale: false, // Don't revalidate if data is stale
      revalidateOnReconnect: true, // Revalidate when network reconnects
      shouldRetryOnError: true,
      dedupingInterval: 2000, // Dedupe requests within 2 seconds
    }
  );

  return {
    links: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook for fetching a specific user's links
 */
export function useUserLinks(userId: string | null | undefined) {
  const { data, error, mutate, isLoading } = useSWR<ILink[]>(
    userId ? `user-links-${userId}` : null,
    () => userId ? fetchUserLinks(userId) : Promise.resolve([]),
    {
      revalidateOnFocus: true,
      revalidateIfStale: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: true,
      dedupingInterval: 2000,
    }
  );

  return {
    links: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook for fetching saved links
 */
export function useSavedLinks() {
  const { data, error, mutate, isLoading } = useSWR<LinkWithUser[]>(
    "saved-links",
    fetchSavedLinks,
    {
      revalidateOnFocus: true,
      revalidateIfStale: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: true,
      dedupingInterval: 2000,
    }
  );

  return {
    links: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

