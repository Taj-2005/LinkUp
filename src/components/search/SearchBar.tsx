"use client";

import { useRef, useEffect, useState } from "react";
import User from "@/components/search/User";
import Suggestions from "@/components/search/Suggestions";
import useDebounce from "@/hooks/useDebounce";
import { useUsers } from "@/hooks/useUsers";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useBatchLinkStatus } from "@/hooks/useBatchLinkStatus";

export default function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { currentUser } = useUsers();
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 500);

  const { users: searchUsers, isLoading: isLoadingSearch, isLoadingMore, loadMore, hasMore, isReachingEnd } = useUserSearch(debouncedQuery);

  const userIds = searchUsers.map((u) => u._id);
  const { statusMap, isLoading: isLoadingStatuses } = useBatchLinkStatus(userIds, {
    enabled: userIds.length > 0 && debouncedQuery.trim().length > 0,
  });

  useEffect(() => {
    if (debouncedQuery.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    if (!debouncedQuery.trim()) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      if (isReachingEnd) return;
      if (isLoadingMore) return;
      if (!hasMore) return;

      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const threshold = 200;

        if (scrollHeight - scrollTop - clientHeight < threshold) {
          loadMore();
        }
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [debouncedQuery, hasMore, isLoadingMore, isReachingEnd, loadMore]);

  return (
    <div className="w-full h-full mx-auto bg-left-nav-light dark:bg-right-nav-dark rounded-xl flex flex-col min-h-0">

      <div
        className="
          sticky top-0 z-10 bg-left-nav-light dark:bg-right-nav-dark
          border-b border-primary-light/30 dark:border-primary-dark/30
          p-3 md:p-5 flex items-center rounded-t-xl
        "
      >
        <input
          ref={inputRef}
          type="search"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="
            w-full rounded-md border border-gray-300 dark:border-gray-600
            bg-white dark:bg-right-nav-dark px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-gray-900 dark:text-gray-100
            placeholder-gray-400 focus:outline-none focus:ring-2
            focus:ring-gray-500 transition
          "
        />
      </div>

      {!isFocused && searchQuery.trim() === "" && (
        <Suggestions
          currentUser={currentUser}
          linkStatusMap={statusMap}
          isLoadingStatuses={isLoadingStatuses}
        />
      )}

      {(isFocused || searchQuery.trim() !== "") && (
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto hide-scrollbar p-2 md:p-4 pb-20 md:pb-4 space-y-3 md:space-y-4 min-h-0"
        >
          {isSearching || (isLoadingSearch && searchUsers.length === 0) ? (
            <div className="flex flex-col justify-center items-center py-12 gap-3 select-none">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary-light/20 dark:bg-primary-light/10 blur-xl animate-pulseSlow"></div>

                <div className="animate-float relative z-10 text-primary-dark dark:text-primary-light">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 opacity-80"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                    />
                  </svg>
                </div>
              </div>

              <p className="text-primary-dark dark:text-primary-light text-lg font-semibold tracking-wide">
                Searching…
              </p>

              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-primary-dark dark:bg-primary-light/80 animate-dot1"></span>
                <span className="h-2 w-2 rounded-full bg-primary-dark/80 dark:bg-primary-light/60 animate-dot2"></span>
                <span className="h-2 w-2 rounded-full bg-primary-dark/60 dark:bg-primary-light/40 animate-dot3"></span>
              </div>
            </div>
          ) : searchUsers.length > 0 ? (
            <>
              {searchUsers.map((u) => (
                <User
                  key={u._id}
                  user={u}
                  linkStatus={statusMap[u._id]?.status}
                  isLoadingStatus={isLoadingStatuses}
                />
              ))}
              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary-dark dark:bg-primary-light/80 animate-dot1"></span>
                    <span className="h-2 w-2 rounded-full bg-primary-dark/80 dark:bg-primary-light/60 animate-dot2"></span>
                    <span className="h-2 w-2 rounded-full bg-primary-dark/60 dark:bg-primary-light/40 animate-dot3"></span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 select-none text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full bg-primary-light/20 dark:bg-primary-light/10 blur-xl animate-pulseSlow"></div>

                <div className="animate-float relative z-10 text-primary-dark dark:text-primary-light">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 opacity-80"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                    />
                  </svg>
                </div>
              </div>

              <p className="text-xl font-semibold text-primary-dark dark:text-primary-light">
                No Users Found
              </p>

              <p className="text-sm text-primary-light/70 dark:text-primary-light/50 mt-1 mb-3">
                Try searching for something else
              </p>

              <div className="flex gap-1 mt-2">
                <span className="h-2 w-2 rounded-full bg-primary-dark dark:bg-primary-light/70 animate-dot1"></span>
                <span className="h-2 w-2 rounded-full bg-primary-dark/80 dark:bg-primary-light/60 animate-dot2"></span>
                <span className="h-2 w-2 rounded-full bg-primary-dark/60 dark:bg-primary-light/40 animate-dot3"></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
