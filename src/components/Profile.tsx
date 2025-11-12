"use client";

import { useEffect, useState } from "react";
import ToggleSwitch from "@/components/ToggleSwitch";
import ProfileCardSelf from "@/components/ProfileCardSelf";
import ProfileNavbarSelf from "@/components/profile/ProfileNavbarSelf";
import Loading from "@/app/loading";
import { getCurrentUser } from "@/utils/api";
import { IUser } from "@/models/User";

export default function Profile() {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.user);
      } catch (err) {
        console.error("Not logged in",err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <Loading />
  if (!user) return <div className="p-10 text-lg">Not authenticated</div>;

  return (
    <div className="w-[85%] m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
      <div className="w-full">
        <div className="flex flex-col gap-8 items-center">
          <ToggleSwitch />
          <ProfileCardSelf user={user} />
          <ProfileNavbarSelf/>
        </div>
      </div>
    </div>
  );
}
