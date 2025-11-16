"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";

export default function NavbarLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideOn = ["/", "/signin", "/signup"];

  if (hideOn.includes(pathname)) return <>{children}</>;

  const [selectedItem, setSelectedItem] = useState("livelinks");
  useEffect(() => {
    if (pathname.startsWith("/livelinks")) setSelectedItem("livelinks");
    else if (pathname.startsWith("/linkfinder")) setSelectedItem("linkfinder");
    else if (pathname.startsWith("/linkups")) setSelectedItem("linkups");
    else if (pathname.startsWith("/linkupreqs")) setSelectedItem("linkupreqs");
    else if (pathname.startsWith("/newlink")) setSelectedItem("newlink");
    else if (pathname.startsWith("/linkhub")) setSelectedItem("linkhub");
  }, [pathname]);

  return (
    <div className="flex flex-row bg-primary-light dark:bg-primary-dark min-h-screen">

      <Navbar selectedItem={selectedItem} setSelectedItem={setSelectedItem} />

      <div className="flex-1">
        {children}
      </div>

    </div>
  );
}
