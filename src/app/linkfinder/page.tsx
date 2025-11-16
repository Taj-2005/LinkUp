"use client";

import React, { useEffect, useState } from "react";
import RightNavbar from "@/components/RightNavbar";

export default function Home() {
  const [selectedItem, setSelectedItem] = useState("linkfinder");

  useEffect(() => console.log(selectedItem), [selectedItem]);
  return (
    <div className="w-full flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark min-h-screen">
      <RightNavbar selectedItem={selectedItem} />
    </div>
  );
}