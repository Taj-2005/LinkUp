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
    <div className="w-full flex flex-row bg-primary-light dark:bg-primary-dark min-h-screen">
      <div className="w-full m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">
        
        <div className="w-[70%] max-w-4xl bg-left-nav-light dark:bg-right-nav-dark">
          <Stories />
        </div>

        <div className="w-[30%] border border-primary-light/30 dark:border-primary-dark/30">

          <div className="flex justify-end items-end m-2">
            <ToggleSwitch />
          </div>

          <div className="flex flex-col gap-4">
            <Profile user={user} />
            <Ads />
          </div>

        </div>
      </div>
    </div>
  );
}
