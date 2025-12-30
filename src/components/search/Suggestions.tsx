"use client";

import { useState, useEffect, useRef } from "react";
import User from "@/components/search/User";
import { LinkStatus } from "@/hooks/useLinkStatus";
import { useSuggestions } from "@/hooks/useSuggestions";
import { useSuggestionsAll } from "@/hooks/useSuggestionsAll";
import { useBatchLinkStatus } from "@/hooks/useBatchLinkStatus";
import { IUser } from "@/models/User";

interface SuggestionsProps {
  currentUser?: IUser | null;
  linkStatusMap?: Record<string, { status: LinkStatus; requestId?: string }>;
  isLoadingStatuses?: boolean;
}

export default function Suggestions({ 
  linkStatusMap, 
  isLoadingStatuses 
}: SuggestionsProps) {
  const [showAll, setShowAll] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { users: initialUsers, isLoading: isLoadingInitial } = useSuggestions();
  const { users: allUsers, isLoadingMore, loadMore, hasMore, isReachingEnd } = useSuggestionsAll(showAll);

  const displayedUsers = showAll ? allUsers : initialUsers;

  const userIds = displayedUsers.map((u) => u._id);
  const { statusMap, isLoading: isLoadingBatchStatuses } = useBatchLinkStatus(userIds, {
    enabled: userIds.length > 0,
  });

  const finalStatusMap = linkStatusMap || statusMap;
  const finalIsLoadingStatuses = isLoadingStatuses !== undefined ? isLoadingStatuses : isLoadingBatchStatuses;

  useEffect(() => {
    if (!showAll) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    let ticking = false;

    const checkAndLoad = () => {
      if (isReachingEnd) return;
      if (isLoadingMore) return;
      if (!hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = 300;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < threshold || scrollHeight <= clientHeight) {
        loadMore();
      }
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        checkAndLoad();
      });
    };

    checkAndLoad();

    const timeoutId = setTimeout(() => {
      checkAndLoad();
    }, 200);

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [showAll, hasMore, isLoadingMore, isReachingEnd, loadMore, allUsers.length]);

  useEffect(() => {
    if (!showAll || isLoadingMore || isReachingEnd || !hasMore) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const timeoutId = setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = 500;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < threshold || scrollHeight <= clientHeight) {
        loadMore();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [showAll, allUsers.length, isLoadingMore, isReachingEnd, hasMore, loadMore]);

  if (isLoadingInitial && !showAll) {
    return (
      <div className="flex flex-col items-center justify-center py-16 select-none">
        <div className="relative">
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

        <p className="mt-6 text-lg font-semibold text-primary-dark dark:text-primary-light">
          Loading Suggestions…
        </p>

        <div className="flex gap-1 mt-3">
          <span className="h-2 w-2 rounded-full bg-primary-dark dark:bg-primary-light/80 animate-dot1"></span>
          <span className="h-2 w-2 rounded-full bg-primary-dark/80 dark:bg-primary-light/60 animate-dot2"></span>
          <span className="h-2 w-2 rounded-full bg-primary-dark/60 dark:bg-primary-light/40 animate-dot3"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="w-full p-4 md:p-10 flex justify-between flex-shrink-0">
        <div className="text-gray-500 font-bold text-sm md:text-base">Suggested for you</div>

        <div
          className="text-black dark:text-white hover:opacity-75 font-bold cursor-pointer text-sm md:text-base"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show less" : "See all"}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto hide-scrollbar min-h-0 pb-20 md:pb-4"
      >
        {displayedUsers.length > 0 ? (
          <>
            {displayedUsers.map((u) => (
              <User
                key={u._id}
                user={u}
                linkStatus={finalStatusMap?.[u._id]?.status}
                isLoadingStatus={finalIsLoadingStatuses}
              />
            ))}
            {showAll && isLoadingMore && (
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
          <div className="flex flex-col items-center justify-center py-16 select-none">
            <div className="relative">
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

            <p className="mt-6 text-lg font-semibold text-primary-dark dark:text-primary-light">
              No Suggestions Available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
