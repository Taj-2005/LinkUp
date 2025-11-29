"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FiBell } from "react-icons/fi";
import Profile from "@/components/search/Profile";
import SearchBar from "@/components/search/SearchBar";
import Ads from "@/components/Ads";
import { useUserStore } from "@/store/useUserStore";
import { useNavbarStore } from "@/store/useNavbarStore";
import { useSocketStore } from "@/store/useSocketStore";

export default function Home() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const setSelectedItem = useNavbarStore((state) => state.setSelectedItem);
  const unseenCount = useSocketStore((state) => state.unseenCount);
  
  return (
    <div className="w-full flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark h-screen md:h-screen overflow-hidden">
      <div className="w-full m-2 md:m-2 h-[98vh] md:h-[98vh] rounded-2xl flex flex-col md:flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">
        <div className="w-full md:w-[70%] bg-left-nav-light dark:bg-right-nav-dark overflow-hidden relative flex flex-col min-h-0">
          <button
            onClick={() => {
              setSelectedItem("linkhub");
              router.push("/linkupreqs");
            }}
            className="md:hidden absolute top-2 right-2 z-10 text-black dark:text-white hover:opacity-75 transition-opacity"
            aria-label="Notifications"
          >
            <div className="relative">
              <FiBell size={24} />
              {unseenCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-primary-dark"></span>
              )}
            </div>
          </button>
          <div className="flex-1 min-h-0 overflow-hidden">
            <SearchBar />
          </div>
        </div>

        <div className="hidden md:flex w-full md:w-[30%] border-t md:border-t-0 md:border-l border-primary-light/30 dark:border-primary-dark/30 mt-4 md:mt-0 flex-col">
          <div className="flex justify-end items-end m-2 md:m-2 px-4 py-2">
            <button
              onClick={() => {
                setSelectedItem("settings");
                router.push("/linkupreqs");
              }}
              className="text-black dark:text-white hover:opacity-75 transition-opacity flex justify-end items-end relative"
              aria-label="Notifications"
            >
              <FiBell size={30} />
              {unseenCount > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-primary-dark"></span>
              )}
            </button>
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