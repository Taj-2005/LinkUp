"use client";

import React, { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import RightNavbar from "@/components/RightNavbar";

export default function Home() {
  const [selectedItem, setSelectedItem] = useState("linkupreqs");

  useEffect(() => console.log(selectedItem), [selectedItem]);
  return (
    <div className="flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark min-h-screen">
      <Navbar selectedItem={selectedItem} setSelectedItem={setSelectedItem}/>
      <RightNavbar selectedItem={selectedItem} />
    </div>
  );
}