"use client";

import React from "react";
import ToggleSwitch from "@/components/ToggleSwitch";
import Profile from "@/components/home/Profile";
import Ads from "@/components/Ads";
import Stories from "@/components/home/Stories";
import { useUserStore } from "@/store/useUserStore";

export default function Home() {
  const user = useUserStore((state) => state.user);

  return (
    <div className="w-full flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark min-h-screen">
      {/* Match LinkFinder layout: black card container on gray background with consistent spacing */}
      <div className="w-full m-2 md:m-2 min-h-[98vh] rounded-2xl flex flex-col md:flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">
        
        <div className="w-full md:w-[70%] md:max-w-4xl bg-left-nav-light dark:bg-right-nav-dark">
          <Stories />
        </div>

        <div className="hidden md:flex w-full md:w-[30%] border-t md:border-t-0 md:border-l border-primary-light/30 dark:border-primary-dark/30 mt-4 md:mt-0 flex-col">

          <div className="flex justify-end items-end m-2 md:m-2">
            <ToggleSwitch />
          </div>

          <div className="flex flex-col gap-4 px-2 md:px-0">
            <Profile user={user} />
            <Ads />
          </div>

        </div>
      </div>
    </div>
  );
}
