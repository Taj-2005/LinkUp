"use client";

import ToggleSwitch from "@/components/ToggleSwitch";

export default function Home(){
    return(
      <div className="w-[85%] m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
        <div className="w-full">
          <div className="flex justify-end items-end m-2">
            <ToggleSwitch/>
          </div>
        </div>
      </div>
    )
}