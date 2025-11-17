"use client";

import { signout } from "@/utils/api";
import { toast } from "react-hot-toast";

interface SignoutButtonProps {
  onSignedOut?: () => void;
}

export default function SignoutButton({ onSignedOut }: SignoutButtonProps) {
  const handleSignout = async () => {
    try {
      toast.loading("Signing out...");

      await signout();

      toast.dismiss();
      toast.success("Signed out successfully");

      if (onSignedOut) onSignedOut();
      window.location.href = "/";
    } catch (err: unknown) {
      toast.dismiss();
      const message = err instanceof Error ? err.message : "Signout failed";
      toast.error(message);
    }
  };

  return (
    <div
      onClick={handleSignout}
      className="text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
    >
      Sign Out
    </div>
  );
}
