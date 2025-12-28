import useSWR from "swr";
import { ILink } from "@/models/Link";

interface LinkWithUser extends ILink {
  userInfo?: {
    username?: string;
    user_avatar?: string;
    name?: string;
  } | null;
}

async function fetchFeedLinks(): Promise<LinkWithUser[]> {
  const res = await fetch("/api/links/feed", {
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch links" }));
    throw new Error(error.error || "Failed to fetch links");
  }

  const data = await res.json();

  const links = (data.links || []).sort((a: LinkWithUser, b: LinkWithUser) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
  return links;
}

async function fetchUserLinks(userId: string): Promise<ILink[]> {
  const res = await fetch(`/api/links/user/${userId}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch links" }));
    throw new Error(error.error || "Failed to fetch links");
  }

  const data = await res.json();

  if (data.isPrivate) {
    return [];
  }

  const links = (data.links || []).sort((a: ILink, b: ILink) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
  return links;
}

async function fetchSavedLinks(): Promise<LinkWithUser[]> {
  const res = await fetch("/api/links/saved", {
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch saved links" }));
    throw new Error(error.error || "Failed to fetch saved links");
  }

  const data = await res.json();

  const links = (data.links || []).sort((a: LinkWithUser, b: LinkWithUser) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
  return links;
}

export function useFeedLinks() {
  const { data, error, mutate, isLoading: swrIsLoading } = useSWR<LinkWithUser[]>(
    "feed-links",
    fetchFeedLinks,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: true,
      dedupingInterval: 2000,
    }
  );

  const isLoading = !data && swrIsLoading;

  return {
    links: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUserLinks(userId: string | null | undefined) {
  const { data, error, mutate, isLoading } = useSWR<ILink[]>(
    userId ? `user-links-${userId}` : null,
    () => userId ? fetchUserLinks(userId) : Promise.resolve([]),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
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

export function useSavedLinks() {
  const { data, error, mutate, isLoading } = useSWR<LinkWithUser[]>(
    "saved-links",
    fetchSavedLinks,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
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
