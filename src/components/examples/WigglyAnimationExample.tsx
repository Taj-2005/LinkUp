"use client";

import React from "react";
import { SkeletonCircle, SkeletonLine, SkeletonText } from "@/components/SkeletonLoader";

export default function WigglyAnimationExample() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold">Wiggly Icon Animation</h2>
        <div className="flex items-center gap-4">
          <div
            className="animate-wiggle text-primary-light dark:text-primary-light/70"
            style={{ transformOrigin: "center center" }}
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 opacity-60"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 9l3-3m0 0l3 3m-3-3v12"
              />
            </svg>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            This icon wiggles responsively:
            <br />
            <span className="text-xs">Mobile: ±2deg | Tablet: ±2.5deg | Desktop: ±3deg</span>
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold">Skeleton Loaders</h2>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <SkeletonCircle size={40} className="sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px]" />
            <div className="flex-1">
              <SkeletonLine width="60%" height={16} />
              <SkeletonLine width="40%" height={12} className="mt-2" />
            </div>
          </div>

          <div>
            <SkeletonText lines={3} />
          </div>

          <div className="flex gap-4">
            <SkeletonCircle size={64} />
            <div className="flex-1 space-y-2">
              <SkeletonLine width="100%" height={20} />
              <SkeletonLine width="80%" height={16} />
              <SkeletonLine width="90%" height={16} />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold">Responsive Behavior</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <strong>Mobile (≤480px):</strong> Reduced animation intensity for better performance
            <br />
            <strong>Tablet (481-1024px):</strong> Medium animation intensity
            <br />
            <strong>Desktop (≥1025px):</strong> Full animation intensity
            <br />
            <br />
            <strong>Accessibility:</strong> Animations respect <code>prefers-reduced-motion</code>
          </p>
        </div>
      </section>
    </div>
  );
}

