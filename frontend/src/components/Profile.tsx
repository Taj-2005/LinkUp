"use client";

import { useEffect, useState } from "react";
import ToggleSwitch from "@/components/ToggleSwitch";
import ProfileCard from "@/components/ProfileCard";
import Navbar from "@/components/profile/ProfileNavbar";
import { getCurrentUser } from "@/utils/api";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.user);
      } catch (err) {
        console.error("Not logged in");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div className="p-10 text-lg">Loading profile...</div>;
  if (!user) return <div className="p-10 text-lg">Not authenticated</div>;

  return (
    <div className="w-[85%] m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
      <div className="w-full">
        <div className="flex flex-col gap-8 items-center">
          <ToggleSwitch />
          <ProfileCard user={user} />
          <Navbar user={user.username} />
        </div>
      </div>
    </div>
  );
}
