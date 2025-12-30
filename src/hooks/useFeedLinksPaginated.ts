import { useMemo, useCallback, useRef, useEffect } from "react";
import useSWRInfinite from "swr/infinite";
import { getFeedLinks } from "@/utils/api";
import { ILink } from "@/models/Link";
import { usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/", "/signin", "/signup"];

interface LinkWithUser extends ILink {
  userInfo?: {
    username?: string;
    user_avatar?: string;
    name?: string;
  } | null;
}

export function useFeedLinksPaginated() {
  const pathname = usePathname();
  const shouldFetch = !PUBLIC_ROUTES.includes(pathname);
  const loadingRef = useRef(false);

  const getKey = (pageIndex: number, previousPageData: { links: LinkWithUser[]; nextCursor: string | null } | null) => {
    if (!shouldFetch) return null;
    if (previousPageData && !previousPageData.nextCursor) return null;
    if (pageIndex === 0) return ["feed-links-paginated", null];
    return ["feed-links-paginated", previousPageData?.nextCursor || null];
  };

  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite<{
    links: LinkWithUser[];
    nextCursor: string | null;
  }>(
    getKey,
    async ([, cursor]: [string, string | null]) => {
      return getFeedLinks(cursor);
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    if (data && data.length === size) {
      loadingRef.current = false;
    }
  }, [data, size]);

  const allLinks = useMemo(() => {
    if (!data) return [];
    const links = data.flatMap((page) => page.links || []);
    return Array.from(
      new Map(links.map((link) => [link._id, link])).values()
    );
  }, [data]);

  const lastPage = data?.[data.length - 1];
  const hasMore = lastPage?.nextCursor !== null && lastPage?.nextCursor !== undefined && lastPage.nextCursor !== "";
  const isLoadingMore = size > (data?.length || 0);
  const isReachingEnd = data && data.length > 0 && lastPage ? (lastPage.nextCursor === null || lastPage.nextCursor === undefined || lastPage.nextCursor === "") : false;

  const loadMore = useCallback(() => {
    if (loadingRef.current) return;
    if (isReachingEnd) return;
    if (isLoadingMore) return;
    if (!hasMore) return;

    loadingRef.current = true;
    setSize(size + 1);
  }, [isReachingEnd, isLoadingMore, hasMore, size, setSize]);

  return {
    links: allLinks,
    isLoading: isLoading && !data,
    isLoadingMore,
    error,
    loadMore,
    hasMore,
    isReachingEnd,
    mutate,
  };
}

