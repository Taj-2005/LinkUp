"use client";

import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import useSWR from "swr";
import {IUser} from "@/models/User";
import { useUserStore } from "@/store/useUserStore";
import { useNavbarStore } from "@/store/useNavbarStore";
import { getCurrentUser, getAllUsers } from "@/utils/api";
import { useEffect } from "react";

const PUBLIC_ROUTES = ["/", "/signin", "/signup"];

export default function NavbarLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser, setUsers } = useUserStore();
  const { selectedItem, setSelectedItem } = useNavbarStore();

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
    if (pathname === "/") {
      document.body.classList.add("landing-page");
      document.documentElement.classList.add("landing-page");
    } else {
      document.body.classList.remove("landing-page");
      document.documentElement.classList.remove("landing-page");
    }
    return () => {
      document.body.classList.remove("landing-page");
      document.documentElement.classList.remove("landing-page");
    };
  }, [pathname]);

  useEffect(() => {
    const current = pathname.replace("/", "").toLowerCase();
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    if (current === "livelinks") setSelectedItem("livelinks");
    else if (current === "linkfinder") setSelectedItem("linkfinder");
    else if (current === "linkups") setSelectedItem("linkups");
    else if (current === "linkupreqs") {
      setSelectedItem(isMobile ? "linkhub" : "settings");
    }
    else if (current === "newlink") setSelectedItem("newlink");
    else if (current === "linkhub") setSelectedItem("linkhub");
    else if (current === "settings") {
      setSelectedItem(isMobile ? "linkhub" : "settings");
    }
  }, [pathname, setSelectedItem]);

  if (PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-screen h-full bg-primary-light dark:bg-primary-dark">
        {children}
      </div>
    );
  }

  return (
      <div className="flex flex-row h-screen md:h-screen bg-primary-light dark:bg-primary-dark overflow-hidden">
        <Navbar selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
        <div className="flex-1 overflow-hidden" style={{ 
          paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
        }}>
          {children}
        </div>
      </div>
  );
}