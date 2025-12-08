"use client";

import React from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { type Toast } from "react-hot-toast";

interface ToastWithAvatarProps {
  actor: {
    username: string;
    user_avatar?: string;
    avatar?: string;
    name?: string;
  };
  message: string;
  t?: Toast;  
  onClick?: () => void;
}

export default function ToastWithAvatar({ actor, message, t, onClick }: ToastWithAvatarProps) {
  const { resolvedTheme } = useTheme();
  const avatarUrl = actor.user_avatar || actor.avatar;
  const displayName = actor.name || actor.username;

  return (
    <div
      className={`flex items-center gap-3 ${
        t?.visible ? "animate-enter" : "animate-leave"
      } ${onClick ? "cursor-pointer hover:opacity-90" : ""}`}
      onClick={onClick}
    >
      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-violet-500/50">
        <Image
          src={
            avatarUrl
              ? avatarUrl
              : resolvedTheme === "dark"
              ? "/dark-profile.png"
              : "/light-profile.png"
          }
          fill
          alt={`${displayName} avatar`}
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          @{actor.username} {message}
        </p>
      </div>
    </div>
  );
}

