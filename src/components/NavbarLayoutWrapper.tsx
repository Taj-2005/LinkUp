"use client";

import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import useSWR from "swr";
import {IUser} from "@/models/User";
import { useUserStore } from "@/store/useUserStore";
import { getCurrentUser, getAllUsers } from "@/utils/api";
import { useEffect, useState } from "react";

const PUBLIC_ROUTES = ["/", "/signin", "/signup"];

export default function NavbarLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser, setUsers } = useUserStore();
  const [selectedItem, setSelectedItem] = useState("");

  const shouldFetchAuth = !PUBLIC_ROUTES.includes(pathname);

  const { data: currentUser } = useSWR<{ user: IUser }>(
    shouldFetchAuth ? "current-user" : null,
    getCurrentUser,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      onError: (err) => {
        if (err.message.includes("Authentication failed") || err.message.includes("Redirecting")) {
          router.push("/signin");
        }
      }
    }
  );

  const { data: allUsers } = useSWR<IUser[]>(
    shouldFetchAuth ? "all-users" : null,
    getAllUsers,
    {
      refreshInterval: 15000,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onError: (err) => {
        if (err.message.includes("Authentication failed") || err.message.includes("Redirecting")) {
          router.push("/signin");
        }
      }
    }
  );

  useEffect(() => {
    if (currentUser?.user) {
      setUser(currentUser.user);
    }
  }, [currentUser, setUser]);

  useEffect(() => {
    if (allUsers) {
      setUsers(allUsers);
    }
  }, [allUsers, setUsers]);

  useEffect(() => {
    const current = pathname.replace("/", "").toLowerCase();

    if (current === "livelinks") setSelectedItem("livelinks");
    else if (current === "linkfinder") setSelectedItem("linkfinder");
    else if (current === "linkups") setSelectedItem("linkups");
    else if (current === "linkupreqs") setSelectedItem("linkupreqs");
    else if (current === "newlink") setSelectedItem("newlink");
    else if (current === "linkhub") setSelectedItem("linkhub");
    else if (current === "settings") setSelectedItem("settings");
  }, [pathname]);

  if (PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-screen h-full bg-primary-light dark:bg-primary-dark">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-row h-screen md:h-auto md:min-h-screen bg-primary-light dark:bg-primary-dark overflow-hidden">
      <Navbar selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      <div 
        className="flex-1 overflow-y-auto pb-16 md:pb-0" 
        style={{ 
          height: '100%',
          minHeight: '100%',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {children}
      </div>
    </div>
  );
}