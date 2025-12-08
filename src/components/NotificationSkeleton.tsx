"use client";

import React from "react";

interface NotificationSkeletonProps {
  variant?: "interaction" | "request";
}

export default function NotificationSkeleton({ variant = "interaction" }: NotificationSkeletonProps) {
  if (variant === "request") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 shadow-md border border-gray-200 dark:border-gray-700 skeleton-wiggle relative overflow-hidden">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 animate-shimmer opacity-60 pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-4 relative">
          {/* Avatar skeleton */}
          <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-300 dark:bg-gray-700" />
          
          {/* Content skeleton */}
          <div className="flex-1 min-w-0">
            {/* Name line */}
            <div className="h-5 md:h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-2" />
            {/* Username line */}
            <div className="h-4 md:h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
        
        {/* Buttons skeleton */}
        <div className="flex gap-3 md:gap-4">
          <div className="flex-1 h-10 md:h-12 bg-gray-300 dark:bg-gray-700 rounded-xl" />
          <div className="flex-1 h-10 md:h-12 bg-gray-300 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 shadow-md border border-gray-200 dark:border-gray-700 skeleton-wiggle relative overflow-hidden">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 animate-shimmer opacity-60 pointer-events-none" />
      
      <div className="flex items-center gap-4 relative">
        {/* Icon placeholder (for interactions) */}
        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded flex-shrink-0" />
        
        {/* Avatar skeleton */}
        <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-300 dark:bg-gray-700" />
        
        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          {/* Username + description line */}
          <div className="h-4 md:h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2" />
          {/* Timestamp skeleton */}
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24" />
        </div>
        
        {/* Unread indicator skeleton */}
        <div className="w-2 h-2 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0" />
      </div>
    </div>
  );
}

