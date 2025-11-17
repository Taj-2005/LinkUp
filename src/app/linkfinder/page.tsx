"use client";

import React from "react";

import ToggleSwitch from "@/components/ToggleSwitch";
import Profile from "@/components/search/Profile";
import SearchBar from "@/components/search/SearchBar";
import Ads from "@/components/Ads";
import { useState, useEffect } from "react";
import { getCurrentUser } from "@/utils/api";
import { IUser } from "@/models/User";

export default function Home() {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.user);
      } catch (err) {
        console.error("Not logged in", err);
        setUser(null);
      }
    };

    fetchUser();
  }, []);
  return (
    <div className="w-full flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark min-h-screen">
      <div className="w-full m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">
        <div className="w-[70%] bg-left-nav-light dark:bg-right-nav-dark">
          <SearchBar />
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