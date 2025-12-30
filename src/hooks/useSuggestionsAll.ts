import { useMemo, useCallback, useRef, useEffect } from "react";
import useSWRInfinite from "swr/infinite";
import { getSuggestionsAll } from "@/utils/api";
import { IUser } from "@/models/User";
import { usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/", "/signin", "/signup"];

export function useSuggestionsAll(enabled: boolean) {
  const pathname = usePathname();
  const shouldFetch = !PUBLIC_ROUTES.includes(pathname) && enabled;
  const loadingRef = useRef(false);

  const getKey = (pageIndex: number, previousPageData: { users: IUser[]; nextCursor: string | null } | null) => {
    if (!shouldFetch) return null;
    if (previousPageData && !previousPageData.nextCursor) return null;
    if (pageIndex === 0) return ["suggestions-all", null];
    return ["suggestions-all", previousPageData?.nextCursor || null];
  };

  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite<{
    users: IUser[];
    nextCursor: string | null;
  }>(
    getKey,
    async ([, cursor]: [string, string | null]) => {
      return getSuggestionsAll(cursor);
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

