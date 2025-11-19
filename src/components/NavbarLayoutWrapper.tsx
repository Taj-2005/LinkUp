"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useEffect, useState, useRef } from "react";
import { getCurrentUser, getAllUsers } from "@/utils/api";
import { useUserStore } from "@/store/useUserStore";

const PUBLIC_ROUTES = ["/", "/signin", "/signup"];

export default function NavbarLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setUser, setUsers } = useUserStore();
  const [selectedItem, setSelectedItem] = useState("");

  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    if (PUBLIC_ROUTES.includes(pathname)) {
      setUser(null);
      return;
    }

    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res?.user ?? null);
      } catch {
        setUser(null);
      }
    };

    fetchUser();

    return () => controller.abort();
  }, [pathname, setUser]);

  useEffect(() => {
    if (PUBLIC_ROUTES.includes(pathname)) return;

    const loadUsers = async () => {
      try {
        const all = await getAllUsers();
        setUsers(all ?? []);
      } catch {}
    };

    loadUsers();
  }, [pathname, setUsers]);

  useEffect(() => {
    if (pathname.startsWith("/livelinks")) setSelectedItem("livelinks");
    else if (pathname.startsWith("/linkfinder")) setSelectedItem("linkfinder");
    else if (pathname.startsWith("/linkups")) setSelectedItem("linkups");
    else if (pathname.startsWith("/linkupreqs")) setSelectedItem("linkupreqs");
    else if (pathname.startsWith("/newlink")) setSelectedItem("newlink");
    else if (pathname.startsWith("/linkhub")) setSelectedItem("linkhub");
  }, [pathname]);

  if (PUBLIC_ROUTES.includes(pathname)) return <>{children}</>;

  return (
    <div className="flex flex-row bg-primary-light dark:bg-primary-dark min-h-screen">
      <Navbar selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
