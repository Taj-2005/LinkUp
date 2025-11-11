"use client";

import { useEffect } from "react";
import { startAutoTokenRefresh } from "@/utils/tokenRefresh";
import { Toaster } from "react-hot-toast";

export default function AppClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    startAutoTokenRefresh();
  }, []);

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}
