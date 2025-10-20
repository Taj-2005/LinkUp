"use client";

import Image from "next/image";

import ToggleSwitch from "@/components/ToggleSwitch";
import Navbar from "@/components/Navbar";

export default function Home() {

  return (
    <div className="flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark min-h-screen">
      <Navbar />

      <div className="w-[85%] m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
        <div className="w-[20%]"></div>
        <div className="w-[80%] bg-right-nav-light dark:bg-right-nav-dark">
          <div className="flex justify-end items-end m-2">
            <ToggleSwitch />
          </div>
        </div>
      </div>
    </div>
  );
}