"use client";

import React from "react";
import RightNavbar from "@/components/RightNavbar";

export default function Home() {
  return (
    <div className="w-full flex flex-row bg-primary-light dark:bg-primary-dark min-h-screen">
      <RightNavbar selectedItem="livelinks" />
    </div>
  );
}
