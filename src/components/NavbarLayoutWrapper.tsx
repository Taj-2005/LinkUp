"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useNavbarStore } from "@/store/useNavbarStore";
import { useSocketStore } from "@/store/useSocketStore";
import { useUsers } from "@/hooks/useUsers";
import { useEffect } from "react";

const PUBLIC_ROUTES = ["/", "/signin", "/signup"];

export default function NavbarLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedItem, setSelectedItem } = useNavbarStore();
  const { mutateCurrentUser, mutateAllUsers } = useUsers();

  const shouldFetchAuth = !PUBLIC_ROUTES.includes(pathname);

  // Handle authentication errors via SWR onError (handled in useUsers hook)
  // Router redirects are handled in individual components as needed

  // Listen for socket events to update users list (replaces polling)
  const { socket, isConnected } = useSocketStore();
  
  useEffect(() => {
    if (!shouldFetchAuth || !socket || !isConnected) return;

    // Listen for user updates from socket server
    const handleUserUpdate = () => {
      // Revalidate users list when socket event is received
      mutateAllUsers();
    };

    // Handle link acceptance - refresh both current user and all users
    const handleLinkRequestAccepted = () => {
      // Refresh current user data (in case their linked_to or linked_by changed)
      mutateCurrentUser();
      // Refresh all users list
      mutateAllUsers();
    };

    // Handle unlink events - refresh both current user and all users
    const handleUserUnlinked = () => {
      // Refresh current user data (in case their linked_to or linked_by changed)
      mutateCurrentUser();
      // Refresh all users list
      mutateAllUsers();
    };

    // Listen for profile updates, link changes, etc.
    socket.on("userUpdated", handleUserUpdate);
    socket.on("linkRequestReceived", handleUserUpdate);
    socket.on("linkRequestAccepted", handleLinkRequestAccepted);
    socket.on("linkRequestRejected", handleUserUpdate);
    socket.on("userUnlinked", handleUserUnlinked);

    return () => {
      socket.off("userUpdated", handleUserUpdate);
      socket.off("linkRequestReceived", handleUserUpdate);
      socket.off("linkRequestAccepted", handleLinkRequestAccepted);
      socket.off("linkRequestRejected", handleUserUpdate);
      socket.off("userUnlinked", handleUserUnlinked);
    };
  }, [shouldFetchAuth, socket, isConnected, mutateAllUsers, mutateCurrentUser]);

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