"use client";

import { useEffect, useState } from "react";
import ToggleSwitch from "@/components/ToggleSwitch";
import ProfileCardSelf from "@/components/ProfileCardSelf";
import ProfileNavbarSelf from "@/components/profile/ProfileNavbarSelf";
import { getCurrentUser } from "@/utils/api";
import { IUser } from "@/models/User";
import Link from "next/link";

export default function Profile() {
  const [user, setUser] = useState<IUser | null>(null);
  const [fetchDone, setFetchDone] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.user ?? null);
      } catch (err) {
        console.error("Not logged in", err);
        setUser(null);
      } finally {
        setFetchDone(true);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="w-full m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
      <div className="w-full">
        <div className="flex flex-col gap-8 items-center p-2" >

          {/* Theme Toggle */}
          <ToggleSwitch />

          {/* Self Profile Card */}
          <ProfileCardSelf user={user} />

          {/* Sections (Links, LinkedTo, Settings...) */}
          {fetchDone && <ProfileNavbarSelf />}

          {/* Not logged in message */}
          {fetchDone && !user && (
            <div className="text-center mt-2">
              <p className="text-md text-primary-light dark:text-gray-300 mb-3">
                Not authenticated
              </p>

              <Link
                href="/signin"
                className="inline-block bg-primary-light dark:bg-primary-dark 
                  text-right-nav-light dark:text-gray-100 px-5 py-2 
                  rounded-2xl font-semibold shadow-lg 
                  hover:brightness-110 transition"
              >
                Sign in
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
