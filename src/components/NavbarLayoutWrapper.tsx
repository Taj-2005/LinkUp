"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import useSWR from "swr";
import {IUser} from "@/models/User";
import { useUserStore } from "@/store/useUserStore";
import { getCurrentUser, getAllUsers } from "@/utils/api";
import { useEffect, useState } from "react";

const PUBLIC_ROUTES = ["/", "/signin", "/signup"];

export default function NavbarLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setUser, setUsers } = useUserStore();
  const [selectedItem, setSelectedItem] = useState("");

  const { data: currentUser } = useSWR<{ user: IUser }>(
    "current-user",
    getCurrentUser,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
    }
  );

  const { data: allUsers } = useSWR<IUser[]>(
    "all-users",
    getAllUsers,
    {
      refreshInterval: 15000,
      revalidateOnFocus: false,
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

  if (PUBLIC_ROUTES.includes(pathname)) return children;

  return (
    <div className="flex flex-row min-h-screen bg-primary-light dark:bg-primary-dark">
      <Navbar selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
