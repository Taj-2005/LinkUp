"use client";

import React from "react";
import ToggleSwitch from "@/components/ToggleSwitch";
import ProfileCardSelf from "@/components/ProfileCardSelf";

export default function Home() {
  return (
    <div className="flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark min-h-screen">
      <div className="w-full m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
        <div className="w-full">
          <div className="flex flex-col gap-8 items-center p-2" >
            <ToggleSwitch />

            <ProfileCardSelf/>
          </div>
        </div>
      </div>
    </div>
  );
}