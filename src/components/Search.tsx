"use client";

import { useState } from "react";

import ToggleSwitch from "@/components/ToggleSwitch";
import Profile from "@/components/search/Profile";
import SearchBar from "@/components/search/SearchBar";
import Suggestions from "@/components/search/Suggestions";
import Ads from "@/components/search/Ads";
import { HiUserCircle } from "react-icons/hi";

export default function Search(){
    const [username, setUsername] = useState("tajuddinshaik_6");
    const [name, setName] = useState("Taj");
    return(
      <div className="w-[85%] m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">
        <div className="w-[70%] bg-right-nav-light dark:bg-right-nav-dark">
            <div>
                <SearchBar />
            </div>
        </div>
        <div className="w-[30%] border border-primary-light/30 dark:border-primary-dark/30">
          <div className="flex justify-end items-end m-2">
            <ToggleSwitch/>
          </div>
          <div className="flex flex-col gap-4">
            <Profile username={username} name={name}/>
            <Ads />
          </div>
        </div>
      </div>
    )
}