"use client";

import { useState } from "react";

import ToggleSwitch from "@/components/ToggleSwitch";
import Profile from "@/components/home/Profile";
import Ads from "@/components/Ads";
import user from "@/constants/Self"

export default function Home(){
    return(
      <div className="w-[85%] m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">
        <div className="w-[70%] bg-left-nav-light dark:bg-right-nav-dark">
        </div>
        <div className="w-[30%] border border-primary-light/30 dark:border-primary-dark/30">
          <div className="flex justify-end items-end m-2">
            <ToggleSwitch/>
          </div>
          <div className="flex flex-col gap-4">
            <Profile username={user.username} name={user.name} user_avatar={user.user_avatar}/>
            <Ads />
          </div>
        </div>
      </div>
    )
}