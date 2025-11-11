"use client";

import { useEffect } from "react";
import startAutoTokenRefresh from "@/utils/tokenRefresh";
import { Toaster } from "react-hot-toast";

export default function AppClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const intervalId = startAutoTokenRefresh();

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}
