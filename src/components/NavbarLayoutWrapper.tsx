"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useNavbarStore } from "@/store/useNavbarStore";
import { useSocketStore } from "@/store/useSocketStore";
import { useUsers } from "@/hooks/useUsers";
import { useModalStore } from "@/store/useModalStore";
import { useEffect } from "react";

const PUBLIC_ROUTES = ["/", "/signin", "/signup"];

export default function NavbarLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedItem, setSelectedItem } = useNavbarStore();
  const { currentUser, mutateCurrentUser, mutateAllUsers } = useUsers();
  const isModalOpen = useModalStore((state) => state.isModalOpen);

  const shouldFetchAuth = !PUBLIC_ROUTES.includes(pathname);

  const { socket, isConnected } = useSocketStore();

  useEffect(() => {
    if (!shouldFetchAuth || !socket || !isConnected) return;

    const handleUserUpdate = (data?: { userId?: string }) => {
      const updatedUserId = data?.userId;
      const currentUserId = currentUser?._id;

      mutateAllUsers();

      if (updatedUserId && currentUserId && updatedUserId === currentUserId) {
        mutateCurrentUser();
      }
    };

    const handleLinkRequestAccepted = () => {

      mutateCurrentUser();

      mutateAllUsers();
    };

    const handleUserUnlinked = () => {

      mutateCurrentUser();

      mutateAllUsers();
    };

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
  }, [shouldFetchAuth, socket, isConnected, currentUser, mutateAllUsers, mutateCurrentUser]);

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
    else if (current === "notifications") {
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

  const hideNavbarOnMobile = isModalOpen && (pathname === "/linkhub" || pathname === "/livelinks");

  return (
      <div className="flex flex-row h-screen md:h-screen bg-primary-light dark:bg-primary-dark overflow-hidden">
        <Navbar selectedItem={selectedItem} setSelectedItem={setSelectedItem} hideOnMobile={hideNavbarOnMobile} />
        <div className="flex-1 overflow-hidden" style={{
          paddingBottom: hideNavbarOnMobile ? '0' : 'calc(4rem + env(safe-area-inset-bottom, 0px))',
        }}>
          {children}
        </div>
      </div>
  );
}
