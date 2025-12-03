"use client";

import { useState, useMemo } from "react";
import User from "@/components/search/User";
import { IUser } from "@/models/User";
import { LinkStatus } from "@/hooks/useLinkStatus";

interface SuggestionsProps {
  users: IUser[];
  currentUser: IUser | null;
  linkStatusMap?: Record<string, { status: LinkStatus; requestId?: string }>;
  isLoadingStatuses?: boolean;
}

export default function Suggestions({ users, currentUser, linkStatusMap, isLoadingStatuses }: SuggestionsProps) {
  const [showAll, setShowAll] = useState(false);

  const sortedUsers = useMemo(() => {
    const filteredUsers = users.filter((u) => u._id !== currentUser?._id);

    if (!filteredUsers.length) return [];

    return [...filteredUsers].sort((a, b) => {
      const userCity = (currentUser?.location || "").toLowerCase().trim();
      const prefGender =
        currentUser?.sex === "male"
          ? "female"
          : currentUser?.sex === "female"
          ? "male"
          : null;

      const aCity = (a.location || "").toLowerCase().trim();
      const bCity = (b.location || "").toLowerCase().trim();

      const hasCityA = aCity.length > 0;
      const hasCityB = bCity.length > 0;

      const sameA =
        hasCityA &&
        userCity &&
        (aCity.includes(userCity) || userCity.includes(aCity));

      const sameB =
        hasCityB &&
        userCity &&
        (bCity.includes(userCity) || userCity.includes(bCity));

      const oppA = prefGender && a.sex === prefGender;
      const oppB = prefGender && b.sex === prefGender;

      if (!hasCityA && hasCityB) return 1;
      if (!hasCityB && hasCityA) return -1;

      if (sameA && oppA && !(sameB && oppB)) return -1;
      if (sameB && oppB && !(sameA && oppA)) return 1;

      if (sameA && !sameB) return -1;
      if (sameB && !sameA) return 1;

      if (oppA && !oppB) return -1;
      if (oppB && !oppA) return 1;

      return 0;
    });
  }, [users, currentUser]);

  const displayed = useMemo(
    () => (showAll ? sortedUsers : sortedUsers.slice(0, 5)),
    [showAll, sortedUsers]
  );

  if (users.length === 0)
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

      <div className="flex-1 overflow-y-auto hide-scrollbar min-h-0 pb-20 md:pb-4">
        {displayed.map((u) => (
          <User
            key={u._id}
            user={u}
            linkStatus={linkStatusMap?.[u._id]?.status}
            isLoadingStatus={isLoadingStatuses}
          />
        ))}
      </div>
    </div>
  );
}
