"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";

import ToggleSwitch from "@/components/ToggleSwitch";
import ProfileCard from "@/components/ProfileCard";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import Navbar from "@/components/Navbar";
import { IUser } from "@/models/User";
import { getAllUsers, signout } from "@/utils/api";
import Loading from "@/app/loading";

export default function UserProfile() {
  const params = useParams();
  const username = params.username as string;
  const [selectedItem, setSelectedItem] = useState(`/linkhub/${username}`);
  const [users, setUsers] = useState<IUser[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedItem(`/linkhub/${username}`);
  }, [username]);

  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        if (!mounted) return;
        setUsers(data);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load users. Signing out.");
        try {
          await signout();
        } catch {
          /* ignore signout errors */
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchUsers();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <Loading />

  const user = users?.find((u) => u.username === username) ?? null;

  if (!user) return <div className="text-center mt-10">User not found</div>;

  return (
    <div className="flex flex-row justify-between items-start bg-primary-light dark:bg-primary-dark min-h-screen">
      <Navbar selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      <div className="w-full m-2 min-h-[98vh] rounded-2xl flex flex-row overflow-hidden bg-left-nav-light dark:bg-left-nav-dark">
        <div className="w-full">
          <div className="flex flex-col gap-8 items-center">
            <ToggleSwitch />
            <ProfileCard user={user as IUser} />
            <ProfileNavbar user={user.username} />
          </div>
        </div>
      </div>
    </div>
  );
}
