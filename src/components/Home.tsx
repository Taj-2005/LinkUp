"use client";

import {useState, useEffect} from "react";

import ToggleSwitch from "@/components/ToggleSwitch";
import Profile from "@/components/home/Profile";
import Ads from "@/components/Ads";
import Stories from "@/components/home/Stories";
import { getCurrentUser } from "@/utils/api";
import Loading from "@/app/loading";

interface ProfileCardProps {
    user_avatar: string;
    username: string;
    email: string;
    name: string;
    location: string;
    bio: string;
    links?: [];
    linked_by: [];
    linked_to: [];
    isLinked?: boolean;
}

export default function Home(){
    const [user, setUser] = useState< ProfileCardProps| null>(null);
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
  return (
    !loading && user ? (
      <div className="w-[85%] m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-right-nav-light dark:bg-right-nav-dark">
        <div className="w-[70%] bg-left-nav-light dark:bg-right-nav-dark">
          <Stories />
        </div>

        <div className="w-[30%] border border-primary-light/30 dark:border-primary-dark/30">
          <div className="flex justify-end items-end m-2">
            <ToggleSwitch />
          </div>

          <div className="flex flex-col gap-4">
            <Profile
              username={user.username}
              name={user.name}
              user_avatar={user.user_avatar}
            />
            <Ads />
          </div>
        </div>
      </div>
    ) : (
      <Loading />
    )
  );
}