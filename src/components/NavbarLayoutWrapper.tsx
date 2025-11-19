"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useEffect, useState, useRef } from "react";
import { getCurrentUser } from "@/utils/api";
import { useUserStore } from "@/store/useUserStore";

export default function NavbarLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideOn = ["/", "/signin", "/signup"];

  const { setUser, setLoading } = useUserStore();
  const [selectedItem, setSelectedItem] = useState("");

  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    const publicRoutes = ["/", "/signin", "/signup"];
    if (publicRoutes.includes(pathname)) {
      setUser(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res?.user ?? null);
      } catch{
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => controller.abort();
  }, [pathname, setUser, setLoading]);

  useEffect(() => {
    if (pathname.startsWith("/livelinks")) setSelectedItem("livelinks");
    else if (pathname.startsWith("/linkfinder")) setSelectedItem("linkfinder");
    else if (pathname.startsWith("/linkups")) setSelectedItem("linkups");
    else if (pathname.startsWith("/linkupreqs")) setSelectedItem("linkupreqs");
    else if (pathname.startsWith("/newlink")) setSelectedItem("newlink");
    else if (pathname.startsWith("/linkhub")) setSelectedItem("linkhub");
  }, [pathname]);

  if (hideOn.includes(pathname)) return <>{children}</>;

  return (
    <div className="flex flex-row bg-primary-light dark:bg-primary-dark min-h-screen">
      <Navbar selectedItem={selectedItem} setSelectedItem={setSelectedItem} />

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
