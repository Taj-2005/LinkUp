"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ToggleSwitch from "@/components/ToggleSwitch";
import ProfileCard from "@/components/ProfileCard";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import Navbar from "@/components/Navbar";

import users from "@/constants/User";

export default function UserProfile() {
  const params = useParams();
  const username = params.username as string;
  const [selectedItem, setSelectedItem] = useState(`/linkhub/${username}`);

  const user = users.find((u) => u.username === username);

  if (!user) return <div className="text-center mt-10">User not found</div>;

  return (
    <div className="flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark min-h-screen">
      <Navbar selectedItem={selectedItem} setSelectedItem={setSelectedItem}/>
      <div className="w-full m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
        <div className="w-full">
          <div className="flex flex-col gap-8 items-center">
            <ToggleSwitch />
            <ProfileCard user={user} />
            <ProfileNavbar user={user.username}/>
          </div>
        </div>
      </div>
    </div>
  );
}
