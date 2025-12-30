import { useMemo, useCallback, useRef, useEffect } from "react";
import useSWRInfinite from "swr/infinite";
import { searchUsers } from "@/utils/api";
import { IUser } from "@/models/User";
import { usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/", "/signin", "/signup"];

export function useUserSearch(query: string) {
  const pathname = usePathname();
  const shouldFetch = !PUBLIC_ROUTES.includes(pathname) && query.trim().length > 0;
  const loadingRef = useRef(false);

  const getKey = (
    pageIndex: number,
    previousPageData: { users: IUser[]; nextCursor: string | null } | null
  ) => {
    if (!shouldFetch) return null;
    if (previousPageData && !previousPageData.nextCursor) return null;
    if (pageIndex === 0) return ["user-search", query, null];
    return ["user-search", query, previousPageData?.nextCursor || null];
  };

  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite<{
    users: IUser[];
    nextCursor: string | null;
  }>(
    getKey,
    async ([, searchQuery, cursor]: [string, string, string | null]) => {
      return searchUsers(searchQuery, cursor);
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

  const allUsers = useMemo(() => {
    if (!data) return [];
    const users = data.flatMap((page) => page.users || []);
    return Array.from(
      new Map(users.map((user) => [user._id, user])).values()
    );
  }, [data]);

  const lastPage = data?.[data.length - 1];
  const hasMore = lastPage?.nextCursor !== null && lastPage?.nextCursor !== undefined;
  const isLoadingMore = size > (data?.length || 0);
  const isReachingEnd = data && data.length > 0 ? (data[data.length - 1]?.nextCursor === null || data[data.length - 1]?.nextCursor === undefined) : false;

  const loadMore = useCallback(() => {
    if (loadingRef.current) return;
    if (isReachingEnd) return;
    if (isLoadingMore) return;
    if (!hasMore) return;

    loadingRef.current = true;
    setSize(size + 1);
  }, [isReachingEnd, isLoadingMore, hasMore, size, setSize]);

  return {
    users: allUsers,
    isLoading: isLoading && !data,
    isLoadingMore,
    error,
    loadMore,
    hasMore,
    isReachingEnd,
    mutate,
  };
}

