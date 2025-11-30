"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FiSettings } from "react-icons/fi";
import ProfileCardSelf from "@/components/ProfileCardSelf";

export default function Home() {
  const router = useRouter();
  // User data is automatically fetched and cached by SWR via useUsers hook in ProfileCardSelf

  return (
    <div className="flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">
      <div className="w-full m-2 md:m-2 h-[98vh] md:h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
        <div className="w-full overflow-y-auto hide-scrollbar">
          <div className="flex flex-col gap-4 md:gap-8 items-center w-full p-2 md:p-2" >
            <div className="flex justify-end items-end w-full p-4">
              <button
                onClick={() => router.push("/settings")}
                className="text-black dark:text-white hover:opacity-75 transition-all flex justify-end items-end hover:rotate-90"
                aria-label="Settings"
              >
                <FiSettings size={30} />
              </button>
            </div>

            <ProfileCardSelf/>
          </div>
        </div>
      </div>
    </div>
  );
}