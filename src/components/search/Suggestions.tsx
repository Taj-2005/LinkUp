"use client";

import { useState, useMemo } from "react";
import User from "@/components/search/User";
import { IUser } from "@/models/User";

interface SuggestionsProps {
  users: IUser[];
  currentUser: IUser | null;
}

export default function Suggestions({ users, currentUser }: SuggestionsProps) {
  const [showAll, setShowAll] = useState(false);

  const sortedUsers = useMemo(() => {
    if (!users.length) return [];

    return [...users].sort((a, b) => {
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

  return (
    <div className="flex flex-col">
      <div className="w-full p-10 flex justify-between">
        <div className="text-gray-500 font-bold">Suggested for you</div>

        <div
          className="text-black dark:text-white hover:opacity-75 font-bold cursor-pointer"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show less" : "See all"}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[70vh] hide-scrollbar">
        {displayed.map((u) => (
          <User key={u._id} user={u} />
        ))}
      </div>
    </div>
  );
}
